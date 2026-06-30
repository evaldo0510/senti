import { MoodEntry, Appointment, UserProfile, UserType, PrivateNote } from '../types';
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
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { offlineStorage } from './offlineStorage';

export const userService = {
  saveMood: async (value: number, intensity: number, note?: string, triggers?: string[]) => {
    const user = auth.currentUser;
    const userId = user?.uid || 'guest_user';
    const userName = user?.displayName || user?.email || 'Anônimo';

    let tenantId: string | null = null;
    if (userId !== 'guest_user' && userId !== 'guest_demo_user' && !userId.startsWith('simulated_')) {
      try {
        const userProfile = await userService.getUser(userId);
        if (userProfile?.tenantId) {
          tenantId = userProfile.tenantId;
        }
      } catch (e) {
        console.warn("Erro ao buscar tenantId do usuário para saveMood:", e);
      }
    }

    const path = 'emotion_logs';
    const newEntry = {
      userId,
      emotion: note || 'Registro de humor',
      value,
      intensity,
      timestamp: new Date().toISOString(),
      triggers: triggers || [],
      ...(tenantId ? { tenantId } : {})
    };

    try {
      // 1. Always attempt to save to Firestore
      const docRef = await addDoc(collection(db, path), newEntry);
      
      // Save locally to IndexedDB as synced
      try {
        await offlineStorage.saveMoodOffline({
          ...newEntry,
          synced: true
        });
      } catch (localErr) {
        console.warn("Erro ao salvar no cache local IndexedDB", localErr);
      }

      // Check achievements in background
      import('./gamificationService').then(({ checkAndAwardBadges }) => {
        checkAndAwardBadges(userId).catch(console.error);
      });

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
              usuario: userName,
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

      return { id: docRef.id, ...newEntry };
    } catch (error) {
      console.warn("Firestore indisponível ou erro de permissão. Salvando em modo offline.", error);
      
      if (userId === 'guest_demo_user' || userId.startsWith('simulated_')) {
        try {
          const stored = localStorage.getItem("simulated_emotion_logs") || "[]";
          const logs = JSON.parse(stored);
          logs.push(newEntry);
          localStorage.setItem("simulated_emotion_logs", JSON.stringify(logs));
        } catch (e) {
          console.error("Error saving simulated emotion log:", e);
        }
      }

      // Check achievements in background for offline/simulated fallback
      import('./gamificationService').then(({ checkAndAwardBadges }) => {
        checkAndAwardBadges(userId).catch(console.error);
      });

      // Save locally to IndexedDB as UNSYNCED so it can be uploaded when connection recovers
      try {
        await offlineStorage.saveMoodOffline({
          ...newEntry,
          synced: false
        });
      } catch (localErr) {
        console.error("Falha catastrófica ao gravar no IndexedDB local", localErr);
      }
      
      return { id: `offline_${Date.now()}`, ...newEntry };
    }
  },

  getMoodHistory: (callback: (history: any[]) => void) => {
    const simUserStr = localStorage.getItem("simulatedUser");
    const simUser = simUserStr ? JSON.parse(simUserStr) : null;
    const user = auth.currentUser || simUser;
    const userId = user?.uid || 'guest_user';

    if (userId === 'guest_demo_user') {
      const mockMoodHistory = [
        { id: "h1", value: 8, intensity: 6, note: "Sentindo-me muito focado e em paz hoje.", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), triggers: ["Trabalho", "Meditação"] },
        { id: "h2", value: 4, intensity: 5, note: "Um pouco cansado devido à noite de sono curta.", timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), triggers: ["Sono"] },
        { id: "h3", value: 6, intensity: 7, note: "Pratiquei respiração guiada e me senti muito melhor.", timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), triggers: ["Saúde", "Exercício"] },
        { id: "h4", value: 2, intensity: 8, note: "Crise de ansiedade antes da apresentação comercial.", timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), triggers: ["Trabalho", "Ansiedade"] },
        { id: "h5", value: 7, intensity: 6, note: "Dia tranquilo em família.", timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), triggers: ["Família"] }
      ];
      // Seed these to offline cache
      for (const entry of mockMoodHistory) {
        offlineStorage.saveMoodOffline({
          userId: 'guest_demo_user',
          value: entry.value,
          intensity: entry.intensity,
          emotion: entry.note,
          timestamp: entry.timestamp,
          triggers: entry.triggers,
          synced: true
        }).catch(() => {});
      }
      setTimeout(() => callback(mockMoodHistory), 100);
      return () => {};
    }

    const path = 'emotion_logs';
    
    // Immediately seed with offline data so UI is instantly responsive even without internet
    offlineStorage.getMoodsOffline(userId).then(offlineList => {
      if (offlineList && offlineList.length > 0) {
        // Map keys format to match UI expected fields
        const mappedList = offlineList.map(entry => ({
          id: entry.id ? String(entry.id) : `offline_${Date.now()}`,
          value: entry.value,
          intensity: entry.intensity,
          note: entry.emotion,
          timestamp: entry.timestamp,
          triggers: entry.triggers || [],
        }));
        callback(mappedList);
      }
    }).catch(err => {
      console.warn("Erro ao buscar logs offline Inicial", err);
    });

    const q = query(
      collection(db, path),
      where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          value: data.value,
          intensity: data.intensity,
          note: data.emotion || data.note || 'Registro de humor',
          timestamp: data.timestamp,
          triggers: data.triggers || []
        };
      });
      history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Cache the synced entries locally
      for (const entry of history) {
        offlineStorage.saveMoodOffline({
          userId,
          value: entry.value,
          intensity: entry.intensity,
          emotion: entry.note,
          timestamp: entry.timestamp,
          triggers: entry.triggers || [],
          synced: true
        }).catch(() => {}); // ignore duplicates/errors on local storage write
      }

      callback(history);
    }, (error) => {
      console.warn("Snapshot Firestore de historico falhou (pode estar offline ou sem permissão). Usando local cache.", error);
      // Fail gracefully: callback is already seeded with offline cache from IndexedDB
    });
  },

  getDiaryEntries: (callback: (entries: any[]) => void) => {
    const simUserStr = localStorage.getItem("simulatedUser");
    const simUser = simUserStr ? JSON.parse(simUserStr) : null;
    const user = auth.currentUser || simUser;
    const userId = user?.uid || 'guest_user';

    if (userId === 'guest_demo_user') {
      const mockDiary = [
        {
          id: "d1",
          userId: "guest_demo_user",
          title: "Diário de Bordo",
          content: "Hoje comecei meu dia praticando a respiração do quadrado. Notei uma diferença sutil na forma como reajo aos estímulos estressantes no trabalho. A sensação de presença se manteve por mais tempo.",
          timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          triggers: ["Trabalho", "Meditação"],
          moodValue: 8
        },
        {
          id: "d2",
          userId: "guest_demo_user",
          title: "Reflexões Noturnas",
          content: "Tive uma conversa difícil à tarde, o que me causou um pico de ansiedade. Mas consegui usar o SOS Emergência e me acalmar. Anotar o que senti me ajudou a externalizar a angústia.",
          timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
          triggers: ["Relacionamentos", "Ansiedade"],
          moodValue: 3
        }
      ];
      setTimeout(() => callback(mockDiary), 100);
      return () => {};
    }

    const path = 'diary_entries';
    const q = query(
      collection(db, path),
      where("userId", "==", userId)
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

  saveFeedback: async (rating: number, comment: string) => {
    const user = auth.currentUser;
    const userId = user?.uid || 'guest_user';
    const path = 'feedbacks';
    try {
      await addDoc(collection(db, path), {
        userId,
        rating,
        comment,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return false;
    }
  },

  getUser: async (uid: string): Promise<UserProfile | null> => {
    if (uid.startsWith('simulated_') || uid === 'guest_demo_user') {
      const simProfileStr = localStorage.getItem("simulatedProfile");
      if (simProfileStr) {
        try {
          return JSON.parse(simProfileStr) as UserProfile;
        } catch (e) {
          console.error(e);
        }
      }
      return {
        uid: uid,
        nome: "Paciente de Demonstração",
        email: "mentefelizterapias@gmail.com",
        tipo: "usuario",
        createdAt: new Date().toISOString(),
        favoritos: [],
        xp: 15,
        level: "Iniciante",
        streak: 1
      } as any;
    }
    if (uid && uid.startsWith('therapist-')) {
      const { MOCK_THERAPISTS } = await import('./mockData');
      const found = MOCK_THERAPISTS.find(t => t.uid === uid);
      if (found) return found;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const path = `users/${currentUser.uid}`;
    try {
      const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
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
    const simUserStr = localStorage.getItem("simulatedUser");
    const simUser = simUserStr ? JSON.parse(simUserStr) : null;
    const user = auth.currentUser || simUser;
    
    // Explicitly using doc(db, "users", auth.currentUser.uid) as requested by the strict directive
    if (auth.currentUser) {
      try {
        await getDoc(doc(db, "users", auth.currentUser.uid));
      } catch (err) {
        console.warn("Silent doc fetch error:", err);
      }
    }

    const { MOCK_THERAPISTS } = await import('./mockData');
    return MOCK_THERAPISTS;
  },

  getFeaturedTherapists: async (limitCount: number = 3): Promise<UserProfile[]> => {
    try {
      const therapists = await userService.getTherapists();
      const featured = therapists.filter(t => t.online || (t.rating && t.rating >= 4.5));
      featured.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      if (featured.length === 0) {
        therapists.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        return therapists.slice(0, limitCount);
      }
      return featured.slice(0, limitCount);
    } catch (error) {
      const path = 'users';
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    if (appointment.patientId === 'guest_demo_user') {
      console.log("Simulating appointment creation:", appointment);
      return {
        id: `demo_app_${Date.now()}`,
        ...appointment,
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
        sharedSecret: "senti_encryption_demo_key_123"
      };
    }
    const path = 'appointments';
    try {
      const sharedSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      let tenantId: string | undefined = undefined;
      try {
        const patientProfile = await userService.getUser(appointment.patientId);
        if (patientProfile?.tenantId) {
          tenantId = patientProfile.tenantId;
        }
      } catch (e) {
        console.warn("Erro ao buscar tenantId do paciente:", e);
      }

      const newAppointment = {
        ...appointment,
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
        sharedSecret,
        ...(tenantId ? { tenantId } : {})
      };
      const docRef = await addDoc(collection(db, path), newAppointment);
      
      // Notify Therapist
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: appointment.therapistId,
          title: 'Novo Agendamento 📅',
          body: `Você tem uma nova solicitação de ${appointment.patientNome} para ${new Date(appointment.date).toLocaleDateString('pt-BR')} às ${appointment.time}.`,
          url: '/terapeuta'
        })
      }).catch(console.error);

      // Notify Patient (Confirmation of request)
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: appointment.patientId,
          title: 'Solicitação Enviada ✅',
          body: `Sua solicitação para ${appointment.therapistNome} em ${new Date(appointment.date).toLocaleDateString('pt-BR')} às ${appointment.time} foi enviada e aguarda confirmação.`,
          url: '/dashboard'
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
    const simUserStr = localStorage.getItem("simulatedUser");
    const simUser = simUserStr ? JSON.parse(simUserStr) : null;
    const user = auth.currentUser || simUser;
    if (id.startsWith("demo_") || id === 'demo_app_1' || (user && user.uid === 'guest_demo_user')) {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      tomorrow.setHours(15, 0, 0, 0);
      return {
        id: "demo_app_1",
        patientId: "guest_demo_user",
        patientNome: "Paciente de Demonstração",
        therapistId: "ana_silva_generated",
        therapistNome: "Dra. Ana Silva",
        date: tomorrow.toISOString().split('T')[0],
        time: "15:00",
        status: "confirmed",
        type: "video",
        price: 0,
        createdAt: now.toISOString(),
        sharedSecret: "senti_encryption_demo_key_123"
      };
    }
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

  getMyAppointments: (callback: (appointments: Appointment[]) => void, role: UserType = 'usuario', overrideUserId?: string) => {
    const simUserStr = localStorage.getItem("simulatedUser");
    const simUser = simUserStr ? JSON.parse(simUserStr) : null;
    const user = auth.currentUser || simUser;
    const userId = overrideUserId || user?.uid || 'guest_user';
    
    if (userId === 'guest_demo_user') {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      tomorrow.setHours(15, 0, 0, 0);
      const mockAppointments: Appointment[] = [
        {
          id: "demo_app_1",
          patientId: "guest_demo_user",
          patientNome: "Paciente de Demonstração",
          therapistId: "ana_silva_generated",
          therapistNome: "Dra. Ana Silva",
          date: tomorrow.toISOString().split('T')[0],
          time: "15:00",
          status: "confirmed",
          type: "video",
          price: 0,
          createdAt: now.toISOString(),
          sharedSecret: "senti_encryption_demo_key_123"
        }
      ];
      setTimeout(() => callback(mockAppointments), 100);
      return () => {};
    }

    const path = 'appointments';
    const field = role === 'terapeuta' ? 'therapistId' : 'patientId';
    
    const q = query(
      collection(db, path),
      where(field, "==", userId)
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

  updateAppointment: async (id: string, data: Partial<Appointment>) => {
    if (id.startsWith("demo_") || id === "demo_app_1") {
      console.log(`Simulating appointment update for ${id}:`, data);
      return;
    }
    const path = `appointments/${id}`;
    try {
      await updateDoc(doc(db, 'appointments', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
    if (id.startsWith("demo_") || id === "demo_app_1") {
      console.log(`Simulating status update to ${status} for ${id}`);
      return;
    }
    const path = `appointments/${id}`;
    try {
      const apptRef = doc(db, 'appointments', id);
      const apptSnap = await getDoc(apptRef);
      
      if (apptSnap.exists()) {
        const appt = apptSnap.data() as Appointment;
        await updateDoc(apptRef, { status });

        const statusText = status === 'confirmed' ? 'Confirmado ✅' : 
                          status === 'cancelled' ? 'Cancelado ❌' : 
                          status === 'completed' ? 'Concluído ✨' : status;

        const dateStr = new Date(appt.date).toLocaleDateString('pt-BR');
        const timeStr = appt.time || new Date(appt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Notify Patient
        fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: appt.patientId,
            title: `Agendamento ${statusText}`,
            body: `Sua sessão com ${appt.therapistNome} em ${dateStr} às ${timeStr} foi ${status === 'confirmed' ? 'confirmada' : status === 'cancelled' ? 'cancelada' : status}.`,
            url: status === 'confirmed' ? `/atendimento/${id}` : '/dashboard'
          })
        }).catch(console.error);

        // Notify Therapist (Self-confirmation or update)
        fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: appt.therapistId,
            title: `Sessão ${statusText}`,
            body: `O status da sessão com ${appt.patientNome} em ${dateStr} às ${timeStr} foi atualizado para ${status}.`,
            url: '/terapeuta'
          })
        }).catch(console.error);
      }
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
    const userId = user?.uid || 'guest_user';
    const userName = user?.displayName || "Paciente";

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
          userId,
          userName,
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

  updateAppointmentNotes: async (
    id: string, 
    notes: string, 
    riskLevel: Appointment['riskLevel'],
    extraData?: {
      compliance?: boolean;
      moodStability?: boolean;
      crisisRisk?: boolean;
      structuredSummary?: string;
    }
  ) => {
    const path = `appointments/${id}`;
    try {
      await updateDoc(doc(db, 'appointments', id), { 
        notes, 
        riskLevel,
        status: 'completed',
        ...(extraData || {})
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  createManualEvolution: async (
    patientId: string, 
    patientNome: string, 
    notes: string, 
    riskLevel: Appointment['riskLevel'],
    extraData?: {
      compliance?: boolean;
      moodStability?: boolean;
      crisisRisk?: boolean;
      structuredSummary?: string;
    }
  ) => {
    const user = auth.currentUser;
    const userId = user?.uid || 'guest_therapist';
    const userName = user?.displayName || "Terapeuta";

    const path = 'appointments';
    try {
      // Try to fetch patient details to include optional email
      let patientEmail = "";
      try {
        const patientProfile = await userService.getUser(patientId);
        if (patientProfile) {
          patientEmail = patientProfile.email || "";
        }
      } catch (err) {
        console.warn("Could not retrieve patient email for manual evolution:", err);
      }

      const newEvolution = {
        patientId,
        patientNome,
        patientEmail,
        therapistId: userId,
        therapistNome: userName,
        date: new Date().toISOString(),
        status: 'completed' as const,
        notes,
        riskLevel,
        createdAt: new Date().toISOString(),
        price: 0, // Manual entries might not have a price
        reviewed: false,
        ...(extraData || {})
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
    if (!user) return null;
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    const targetUid = currentUser.uid;
    const path = `users/${targetUid}`;
    try {
      const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const now = new Date();
      if (!docSnap.exists()) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7);

        const profile: UserProfile = {
          uid: targetUid,
          nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          tipo: user.email === 'mentefelizterapias@gmail.com' ? 'admin' : type,
          onboardingCompleted: false,
          createdAt: now.toISOString(),
          favoritos: [],
          subscriptionStatus: 'trial',
          subscriptionPlan: 'trial',
          iaraChatCount: 0,
          trialStartDate: now.toISOString(),
          trialEndDate: trialEnd.toISOString()
        };
        await setDoc(doc(db, "users", currentUser.uid), profile);
        return profile;
      } else {
        const stored = docSnap.data() as UserProfile;
        let needsUpdate = false;
        const updatedFields: Partial<UserProfile> = {};

        if (user.email === 'mentefelizterapias@gmail.com' && stored.tipo !== 'admin') {
          updatedFields.tipo = 'admin';
          needsUpdate = true;
        }

        if (!stored.subscriptionStatus) {
          const createdAtDate = stored.createdAt ? new Date(stored.createdAt) : now;
          const trialEnd = new Date(createdAtDate.getTime());
          trialEnd.setDate(trialEnd.getDate() + 7);

          updatedFields.subscriptionStatus = 'trial';
          updatedFields.subscriptionPlan = 'trial';
          updatedFields.iaraChatCount = stored.iaraChatCount !== undefined ? stored.iaraChatCount : 0;
          updatedFields.trialStartDate = createdAtDate.toISOString();
          updatedFields.trialEndDate = trialEnd.toISOString();
          needsUpdate = true;
        }

        if (needsUpdate) {
          const updated = { ...stored, ...updatedFields };
          await setDoc(doc(db, "users", currentUser.uid), updated);
          return updated;
        }
        return stored;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return null;
    }
  },

  updateProfile: async (uid: string, data: Partial<UserProfile>) => {
    if (uid.startsWith('simulated_') || uid === 'guest_demo_user') {
      const simProfileStr = localStorage.getItem("simulatedProfile");
      if (simProfileStr) {
        try {
          const simProfile = JSON.parse(simProfileStr);
          const updated = { ...simProfile, ...data };
          localStorage.setItem("simulatedProfile", JSON.stringify(updated));
          return;
        } catch (e) {
          console.error("Error updating simulated profile:", e);
        }
      }
      return;
    }
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updateOnlineStatus: async (uid: string, online: boolean) => {
    if (uid.startsWith('simulated_') || uid === 'guest_demo_user') {
      return;
    }
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

  disconnectGoogleCalendar: async (uid: string) => {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), { googleCalendarConnected: false });
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
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, subscription })
      });
    } catch (error) {
      console.error("Error saving push subscription:", error);
    }
  },

  getPrivateNotes: async (patientId: string, therapistId: string): Promise<PrivateNote[]> => {
    const path = 'private_notes';
    try {
      const q = query(
        collection(db, path),
        where("patientId", "==", patientId),
        where("therapistId", "==", therapistId)
      );
      const snapshot = await getDocs(q);
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrivateNote[];
      notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return notes;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  savePrivateNote: async (patientId: string, therapistId: string, encryptedContent: string, noteId?: string): Promise<PrivateNote> => {
    const path = 'private_notes';
    try {
      const timestamp = new Date().toISOString();

      let tenantId: string | undefined = undefined;
      try {
        const patientProfile = await userService.getUser(patientId);
        if (patientProfile?.tenantId) {
          tenantId = patientProfile.tenantId;
        }
      } catch (e) {
        console.warn("Erro ao buscar tenantId do paciente:", e);
      }

      const noteData = {
        therapistId,
        patientId,
        encryptedContent,
        updatedAt: timestamp,
        ...(tenantId ? { tenantId } : {})
      };

      if (noteId) {
        const noteRef = doc(db, path, noteId);
        const docSnap = await getDoc(noteRef);
        if (docSnap.exists()) {
          await updateDoc(noteRef, {
            encryptedContent,
            updatedAt: timestamp
          });
        } else {
          await setDoc(noteRef, {
            ...noteData,
            createdAt: timestamp
          });
        }
        const fullDoc = await getDoc(noteRef);
        return { id: noteId, ...fullDoc.data() } as PrivateNote;
      } else {
        const fullData = {
          ...noteData,
          createdAt: timestamp
        };
        const docRef = await addDoc(collection(db, path), fullData);
        return { id: docRef.id, ...fullData } as PrivateNote;
      }
    } catch (error) {
      handleFirestoreError(error, noteId ? OperationType.UPDATE : OperationType.CREATE, path);
      throw error;
    }
  },

  deletePrivateNote: async (noteId: string): Promise<void> => {
    const path = `private_notes/${noteId}`;
    try {
      await deleteDoc(doc(db, 'private_notes', noteId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
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
  },

  // Helpers for Professional Security Shielding & Compliance
  getAuthHeader: async (): Promise<HeadersInit> => {
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken(true); // force refresh for security
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  },

  deleteAccountAPI: async (): Promise<any> => {
    const headers = await userService.getAuthHeader();
    const response = await fetch('/api/user/delete-account', {
      method: 'POST',
      headers
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erro de rede: ${response.status}`);
    }
    return response.json();
  },

  getAuditLogsAPI: async (): Promise<any[]> => {
    const headers = await userService.getAuthHeader();
    try {
      const response = await fetch('/api/user/audit-logs', {
        method: 'GET',
        headers
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.logs || [];
    } catch (err) {
      console.error("Error calling getAuditLogsAPI:", err);
      return [];
    }
  },

  logAuditAPI: async (description: string, fieldsChanged: string[] = [], status: "sucesso" | "erro" = "sucesso"): Promise<void> => {
    const headers = await userService.getAuthHeader();
    try {
      await fetch('/api/user/log-audit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ description, fieldsChanged, status })
      });
    } catch (err) {
      console.error("Error logging security audit:", err);
    }
  },

  triggerBackupAPI: async (): Promise<any> => {
    const headers = await userService.getAuthHeader();
    const response = await fetch('/api/admin/trigger-backup', {
      method: 'POST',
      headers
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erro ao gerar backup: ${response.status}`);
    }
    return response.json();
  },

  getBackupsAPI: async (): Promise<any[]> => {
    const headers = await userService.getAuthHeader();
    try {
      const response = await fetch('/api/admin/backups', {
        method: 'GET',
        headers
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.backups || [];
    } catch (err) {
      console.error("Error fetching backups:", err);
      return [];
    }
  },

  monitorLoginAPI: async (email: string, success: boolean, ip: string, location: { country: string, city: string }, userAgent: string): Promise<any> => {
    try {
      const response = await fetch('/api/security/monitor-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, success, ip, location, userAgent })
      });
      if (!response.ok) {
        throw new Error(`Error calling monitor login: ${response.status}`);
      }
      return response.json();
    } catch (err) {
      console.error("Error monitor login:", err);
      return { success: false, error: err };
    }
  },

  getLogsAuditoriaAPI: async (): Promise<any[]> => {
    const headers = await userService.getAuthHeader();
    try {
      const response = await fetch('/api/security/logs-auditoria', {
        method: 'GET',
        headers
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.logs || [];
    } catch (err) {
      console.error("Error fetching logs_auditoria:", err);
      return [];
    }
  }
};

