import { MoodEntry, Appointment, UserProfile, UserType } from '../types';
import { MOCK_THERAPISTS } from './mockData';
import { auth } from './firebase';

const STORAGE_KEY_MOOD = 'iara_mood_history';
const STORAGE_KEY_THERAPISTS = 'iara_therapists';
const STORAGE_KEY_APPOINTMENTS = 'iara_appointments';
const STORAGE_KEY_USER_PROFILE = 'iara_user_profile';

// Initialize mock data if not present
if (!localStorage.getItem(STORAGE_KEY_THERAPISTS)) {
  localStorage.setItem(STORAGE_KEY_THERAPISTS, JSON.stringify(MOCK_THERAPISTS));
}

export const userService = {
  saveMood: (value: number, note?: string) => {
    const history = userService.getMoodHistory();
    const newEntry: MoodEntry = {
      id: crypto.randomUUID(),
      value,
      note,
      timestamp: new Date(),
    };
    localStorage.setItem(STORAGE_KEY_MOOD, JSON.stringify([...history, newEntry]));
    return newEntry;
  },

  getMoodHistory: (): MoodEntry[] => {
    const data = localStorage.getItem(STORAGE_KEY_MOOD);
    if (!data) return [];
    return JSON.parse(data).map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  },

  getUser: () => {
    const data = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
    if (data) return JSON.parse(data);
    return { name: 'Usuário' };
  },

  getTherapists: async (): Promise<UserProfile[]> => {
    const data = localStorage.getItem(STORAGE_KEY_THERAPISTS);
    return data ? JSON.parse(data) : MOCK_THERAPISTS;
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const appointments = await userService.getAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'pending' as const
    };
    const updated = [...appointments, newAppointment];
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    return newAppointment;
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const data = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    return data ? JSON.parse(data) : [];
  },

  getMyAppointments: (callback: (appointments: Appointment[]) => void) => {
    const user = auth.currentUser;
    if (!user) return () => {};
    
    const uid = user.uid;
    const update = async () => {
      const appointments = await userService.getAppointments();
      const filtered = appointments.filter(a => a.patientId === uid || a.therapistId === uid)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(filtered);
    };

    update();
    window.addEventListener('storage', update);
    const intervalId = setInterval(update, 2000); // Polling as fallback

    return () => {
      window.removeEventListener('storage', update);
      clearInterval(intervalId);
    };
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
    const appointments = await userService.getAppointments();
    const updated = appointments.map(a => a.id === id ? { ...a, status } : a);
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  toggleFavorite: async (userId: string, therapistId: string, currentFavorites: string[] = []) => {
    const isFavorited = currentFavorites.includes(therapistId);
    const newFavorites = isFavorited 
      ? currentFavorites.filter(id => id !== therapistId)
      : [...currentFavorites, therapistId];
    
    // Update local profile
    const profile = userService.getUser();
    const updatedProfile = { ...profile, favoritos: newFavorites };
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(updatedProfile));
    
    return newFavorites;
  },

  addReview: async (therapistId: string, currentReviews: any[] = [], review: any) => {
    const therapists = await userService.getTherapists();
    const therapist = therapists.find(t => t.uid === therapistId);
    if (!therapist) return { newReviews: currentReviews, averageRating: 0 };

    const newReviews = [...(therapist.avaliacoes || []), review];
    const totalRating = newReviews.reduce((sum, r) => sum + r.nota, 0);
    const averageRating = totalRating / newReviews.length;

    const updatedTherapists = therapists.map(t => 
      t.uid === therapistId 
        ? { ...t, avaliacoes: newReviews, rating: averageRating } 
        : t
    );
    localStorage.setItem(STORAGE_KEY_THERAPISTS, JSON.stringify(updatedTherapists));
    
    return { newReviews, averageRating };
  },

  // Mock login/signup for the app
  mockLogin: (email: string, type: UserType) => {
    const uid = `user-${crypto.randomUUID()}`;
    const userProfile: UserProfile = {
      uid,
      nome: email.split('@')[0],
      email,
      tipo: type,
      createdAt: new Date().toISOString(),
      favoritos: []
    };
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(userProfile));
    localStorage.setItem('iara_mock_user', JSON.stringify({ uid, email }));
    return userProfile;
  }
};
