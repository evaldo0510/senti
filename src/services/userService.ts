import { MoodEntry, Appointment, UserProfile, UserType } from '../types';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  addDoc
} from 'firebase/firestore';

export const userService = {
  saveMood: async (value: number, intensity: number, note?: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const path = 'emotion_logs';
    try {
      const newEntry = {
        userId: user.uid,
        emotion: note || 'Registro de humor',
        value,
        intensity,
        timestamp: new Date().toISOString()
      };
      await addDoc(collection(db, path), newEntry);
      return newEntry;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  getMoodHistory: (callback: (history: any[]) => void) => {
    const user = auth.currentUser;
    if (!user) return () => {};

    const path = 'emotion_logs';
    const q = query(
      collection(db, path),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  getUser: async (uid: string): Promise<UserProfile | null> => {
    const path = `users/${uid}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  getTherapists: async (): Promise<UserProfile[]> => {
    const path = 'users';
    try {
      const q = query(collection(db, path), where("tipo", "==", "terapeuta"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  getFeaturedTherapists: async (limitCount: number = 3): Promise<UserProfile[]> => {
    const path = 'users';
    try {
      const q = query(
        collection(db, path), 
        where("tipo", "==", "terapeuta"),
        where("online", "==", true),
        orderBy("rating", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limitCount).map(doc => doc.data() as UserProfile);
    } catch (error) {
      // Fallback if online/rating query fails due to missing index
      const qSimple = query(collection(db, path), where("tipo", "==", "terapeuta"));
      const snapshot = await getDocs(qSimple);
      return snapshot.docs.slice(0, limitCount).map(doc => doc.data() as UserProfile);
    }
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const path = 'appointments';
    try {
      const newAppointment = {
        ...appointment,
        createdAt: new Date().toISOString(),
        status: 'pending' as const
      };
      const docRef = await addDoc(collection(db, path), newAppointment);
      return { id: docRef.id, ...newAppointment };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  getAppointment: async (id: string): Promise<Appointment | null> => {
    const path = `appointments/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'appointments', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Appointment;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  getMyAppointments: (callback: (appointments: Appointment[]) => void, role: UserType = 'usuario') => {
    const user = auth.currentUser;
    if (!user) return () => {};
    
    const path = 'appointments';
    const field = role === 'terapeuta' ? 'therapistId' : 'patientId';
    
    const q = query(
      collection(db, path),
      where(field, "==", user.uid),
      orderBy("date", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      callback(appointments);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
    const path = `appointments/${id}`;
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updateAppointmentNotes: async (id: string, notes: string, riskLevel: Appointment['riskLevel']) => {
    const path = `appointments/${id}`;
    try {
      await updateDoc(doc(db, 'appointments', id), { 
        notes, 
        riskLevel,
        status: 'completed' 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  toggleFavorite: async (userId: string, therapistId: string, isFavorited: boolean) => {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), {
        favoritos: isFavorited ? arrayRemove(therapistId) : arrayUnion(therapistId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  addReview: async (therapistId: string, review: any) => {
    const path = `users/${therapistId}`;
    try {
      // This is a bit complex for a simple updateDoc if we want to update average rating too.
      // For now, just add to the array.
      await updateDoc(doc(db, 'users', therapistId), {
        avaliacoes: arrayUnion(review)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  syncProfile: async (user: any, type: UserType = 'usuario') => {
    const path = `users/${user.uid}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (!docSnap.exists()) {
        const profile: UserProfile = {
          uid: user.uid,
          nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          tipo: type,
          createdAt: new Date().toISOString(),
          favoritos: []
        };
        await setDoc(doc(db, 'users', user.uid), profile);
        return profile;
      }
      return docSnap.data() as UserProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  updateProfile: async (uid: string, data: Partial<UserProfile>) => {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updateOnlineStatus: async (uid: string, online: boolean) => {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), { online });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  savePushSubscription: async (subscription: PushSubscription) => {
    const user = auth.currentUser;
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        pushSubscription: JSON.parse(JSON.stringify(subscription))
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  seedMockData: async () => {
    const { MOCK_THERAPISTS } = await import('./mockData');
    const therapists = await userService.getTherapists();
    
    if (therapists.length === 0) {
      console.log("Seeding mock therapists...");
      for (const t of MOCK_THERAPISTS) {
        await setDoc(doc(db, 'users', t.uid), t);
      }
    }
  }
};

