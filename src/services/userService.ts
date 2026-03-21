import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { MoodEntry, Therapist, Appointment, UserProfile } from '../types';

const STORAGE_KEY_MOOD = 'iara_mood_history';

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
    return { name: 'Usuário' };
  },

  getTherapists: async (): Promise<UserProfile[]> => {
    const q = query(collection(db, "users"), where("tipo", "==", "terapeuta"));
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "users");
      return [];
    }
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment = {
      ...appointment,
      createdAt: new Date().toISOString(),
      status: 'pending' as const
    };
    try {
      const docRef = await addDoc(collection(db, "appointments"), newAppointment);
      await updateDoc(docRef, { id: docRef.id });
      return { ...newAppointment, id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "appointments");
      throw error;
    }
  },

  getMyAppointments: (callback: (appointments: Appointment[]) => void) => {
    if (!auth.currentUser) return () => {};
    
    const uid = auth.currentUser.uid;
    // Query for appointments where user is patient OR therapist
    // Note: Firestore doesn't support OR across different fields easily without complex queries or composite indexes.
    // For simplicity, we'll listen to both and merge, or just query one for now if we know the user type.
    // Let's try a simpler approach: query based on current user's role if possible, or just two listeners.
    
    const qPatient = query(collection(db, "appointments"), where("patientId", "==", uid), orderBy("date", "desc"));
    const qTherapist = query(collection(db, "appointments"), where("therapistId", "==", uid), orderBy("date", "desc"));

    let patientApps: Appointment[] = [];
    let therapistApps: Appointment[] = [];

    const update = () => {
      const merged = [...patientApps, ...therapistApps].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      callback(merged);
    };

    const unsubPatient = onSnapshot(qPatient, (snapshot) => {
      patientApps = snapshot.docs.map(doc => doc.data() as Appointment);
      update();
    }, (error) => handleFirestoreError(error, OperationType.LIST, "appointments"));

    const unsubTherapist = onSnapshot(qTherapist, (snapshot) => {
      therapistApps = snapshot.docs.map(doc => doc.data() as Appointment);
      update();
    }, (error) => handleFirestoreError(error, OperationType.LIST, "appointments"));

    return () => {
      unsubPatient();
      unsubTherapist();
    };
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
    const docRef = doc(db, "appointments", id);
    try {
      await updateDoc(docRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  },

  toggleFavorite: async (userId: string, therapistId: string, currentFavorites: string[] = []) => {
    const docRef = doc(db, "users", userId);
    const isFavorited = currentFavorites.includes(therapistId);
    const newFavorites = isFavorited 
      ? currentFavorites.filter(id => id !== therapistId)
      : [...currentFavorites, therapistId];
    
    try {
      await updateDoc(docRef, { favoritos: newFavorites });
      return newFavorites;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      throw error;
    }
  },

  addReview: async (therapistId: string, currentReviews: any[] = [], review: any) => {
    const docRef = doc(db, "users", therapistId);
    const newReviews = [...currentReviews, review];
    
    // Calculate new average rating
    const totalRating = newReviews.reduce((sum, r) => sum + r.nota, 0);
    const averageRating = totalRating / newReviews.length;

    try {
      await updateDoc(docRef, { 
        avaliacoes: newReviews,
        rating: averageRating
      });
      return { newReviews, averageRating };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${therapistId}`);
      throw error;
    }
  }
};
