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

      // Webhook para Google Sheets (Looker Studio)
      try {
        const webhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
        if (webhookUrl) {
          fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              data: new Date().toLocaleDateString('pt-BR'),
              usuario: user.displayName || user.email || 'Anônimo',
              humor: value,
              risco: value <= 3 ? 'alto' : value <= 6 ? 'moderado' : 'leve',
              atendimento: 'nao',
              tipo: 'IARA'
            })
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Erro ao enviar para webhook", e);
      }

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
      where("userId", "==", user.uid)
    );

    return onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  getDiaryEntries: (callback: (entries: any[]) => void) => {
    const user = auth.currentUser;
    if (!user) return () => {};

    const path = 'diary_entries';
    const q = query(
      collection(db, path),
      where("userId", "==", user.uid)
    );

    return onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      entries.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(entries);
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
        where("online", "==", true)
      );
      const snapshot = await getDocs(q);
      const therapists = snapshot.docs.map(doc => doc.data() as UserProfile);
      therapists.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return therapists.slice(0, limitCount);
    } catch (error) {
      // Fallback if online/rating query fails due to missing index
      try {
        const qSimple = query(collection(db, path), where("tipo", "==", "terapeuta"));
        const snapshot = await getDocs(qSimple);
        const therapists = snapshot.docs.map(doc => doc.data() as UserProfile);
        therapists.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        return therapists.slice(0, limitCount);
      } catch (fallbackError) {
        handleFirestoreError(fallbackError, OperationType.LIST, path);
        return [];
      }
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
      
      // Trigger push notification to therapist
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: appointment.therapistId,
          title: 'Novo Agendamento',
          body: `Você tem uma nova solicitação de agendamento de ${appointment.patientNome}.`,
          url: '/terapeuta'
        })
      }).catch(console.error);

      // Webhook para Google Sheets (Looker Studio)
      try {
        const webhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
        if (webhookUrl) {
          fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              data: new Date().toLocaleDateString('pt-BR'),
              usuario: appointment.patientNome,
              humor: 5, // Valor padrão para agendamento
              risco: appointment.riskLevel || 'leve',
              atendimento: 'sim',
              tipo: 'terapeuta'
            })
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Erro ao enviar para webhook", e);
      }

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
      where(field, "==", user.uid)
    );

    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  markAppointmentReminded: async (id: string) => {
    const path = `appointments/${id}`;
    try {
      await updateDoc(doc(db, 'appointments', id), { reminded: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  submitReview: async (appointmentId: string, therapistId: string, nota: number, comentario?: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const path = `appointments/${appointmentId}`;
    try {
      // Mark appointment as reviewed
      await updateDoc(doc(db, 'appointments', appointmentId), { reviewed: true });

      // Add review to therapist profile
      const therapistRef = doc(db, 'users', therapistId);
      const therapistDoc = await getDoc(therapistRef);
      
      if (therapistDoc.exists()) {
        const therapistData = therapistDoc.data() as UserProfile;
        const avaliacoes = therapistData.avaliacoes || [];
        
        const newReview = {
          userId: user.uid,
          userName: user.displayName || "Paciente",
          nota,
          comentario,
          data: new Date().toISOString()
        };

        const newAvaliacoes = [...avaliacoes, newReview];
        const newRating = newAvaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / newAvaliacoes.length;

        await updateDoc(therapistRef, {
          avaliacoes: newAvaliacoes,
          rating: newRating
        });
      }
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

  createManualEvolution: async (patientId: string, patientNome: string, notes: string, riskLevel: Appointment['riskLevel']) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const path = 'appointments';
    try {
      const newEvolution = {
        patientId,
        patientNome,
        therapistId: user.uid,
        therapistNome: user.displayName || "Terapeuta",
        date: new Date().toISOString(),
        status: 'completed' as const,
        notes,
        riskLevel,
        createdAt: new Date().toISOString(),
        price: 0, // Manual entries might not have a price
        reviewed: false
      };
      const docRef = await addDoc(collection(db, path), newEvolution);

      // Webhook para Google Sheets (Looker Studio)
      try {
        const webhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
        if (webhookUrl) {
          fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              data: new Date().toLocaleDateString('pt-BR'),
              usuario: patientNome,
              humor: 5, // Valor padrão para evolução manual
              risco: riskLevel || 'leve',
              atendimento: 'sim',
              tipo: 'terapeuta'
            })
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Erro ao enviar para webhook", e);
      }

      return { id: docRef.id, ...newEvolution };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
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

  getPatientMoodHistory: async (patientId: string): Promise<MoodEntry[]> => {
    const path = 'emotion_logs';
    try {
      const q = query(
        collection(db, path),
        where("userId", "==", patientId)
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MoodEntry[];
      history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return history;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  connectGoogleCalendar: async (uid: string) => {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), { googleCalendarConnected: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  connectEarnings: async (uid: string) => {
    const path = `users/${uid}`;
    try {
      // Mocking earnings connection
      await updateDoc(doc(db, 'users', uid), { 
        totalEarnings: 1250.50,
        pendingEarnings: 450.00
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  notifyTherapist: async (therapistId: string, patientNome: string) => {
    try {
      // Trigger push notification to therapist
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: therapistId,
          title: 'Atenção Necessária',
          body: `O paciente ${patientNome} precisa de sua atenção agora.`,
          url: '/terapeuta'
        })
      });
      return response.ok;
    } catch (error) {
      console.error("Error notifying therapist:", error);
      return false;
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

