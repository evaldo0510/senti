import { db, auth, handleFirestoreError, OperationType, storage } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  or,
  and,
  updateDoc,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI } from "@google/genai";
import { DirectMessage } from "../types";
import { cryptoService } from './cryptoService';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const chatService = {
  sendMessage: async (appointmentId: string, senderId: string, receiverId: string, text: string, secret?: string) => {
    const path = 'messages';
    try {
      const encryptedText = secret ? await cryptoService.encrypt(text, secret) : text;
      const messageData = {
        senderId,
        receiverId,
        text: encryptedText,
        encrypted: !!secret,
        timestamp: serverTimestamp(),
        appointmentId: appointmentId || null,
        read: false
      };
      const docRef = await addDoc(collection(db, path), messageData);
      
      // Trigger push notification to receiver
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: receiverId,
          title: 'Nova Mensagem',
          body: 'Você recebeu uma nova mensagem.',
          url: appointmentId ? `/atendimento/${appointmentId}?type=chat` : '/terapeuta'
        })
      }).catch(console.error);

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  sendAudioMessage: async (appointmentId: string, senderId: string, receiverId: string, audioBlob: Blob, duration: number, secret?: string) => {
    const path = 'messages';
    try {
      const fileName = `audio_${Date.now()}.webm`;
      const storageRef = ref(storage, `chats/${appointmentId}/${fileName}`);
      await uploadBytes(storageRef, audioBlob);
      const audioUrl = await getDownloadURL(storageRef);

      // Optional: Transcribe audio
      let transcription = "[Áudio]";
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
        });
        reader.readAsDataURL(audioBlob);
        const base64Data = await base64Promise;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            { text: "Transcreva este áudio de terapia. Retorne apenas o texto transcrito." },
            { inlineData: { data: base64Data, mimeType: audioBlob.type } }
          ],
        });
        if (response.text) {
          transcription = response.text;
        }
      } catch (transcribeError) {
        console.error("Transcription failed", transcribeError);
      }

      const encryptedText = secret ? await cryptoService.encrypt(transcription, secret) : transcription;

      const messageData = {
        senderId,
        receiverId,
        text: encryptedText,
        audioUrl,
        duration,
        encrypted: !!secret,
        timestamp: serverTimestamp(),
        appointmentId: appointmentId || null,
        read: false
      };
      
      const docRef = await addDoc(collection(db, path), messageData);
      
      // Trigger push notification to receiver
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: receiverId,
          title: 'Nova Mensagem de Áudio',
          body: 'Você recebeu um novo áudio.',
          url: appointmentId ? `/atendimento/${appointmentId}?type=chat` : '/terapeuta'
        })
      }).catch(console.error);

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  markMessagesAsRead: async (appointmentId: string, userId: string) => {
    const path = 'messages';
    try {
      const q = query(
        collection(db, path),
        where("appointmentId", "==", appointmentId),
        where("receiverId", "==", userId),
        where("read", "==", false)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.update(d.ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  setTypingStatus: async (appointmentId: string, userId: string, isTyping: boolean) => {
    const path = `appointments/${appointmentId}`;
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        [`typing.${userId}`]: isTyping
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  listenTypingStatus: (appointmentId: string, callback: (typing: { [key: string]: boolean }) => void) => {
    const path = `appointments/${appointmentId}`;
    return onSnapshot(doc(db, 'appointments', appointmentId), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().typing || {});
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  listenMessages: (userId: string, otherId: string, callback: (messages: DirectMessage[]) => void) => {
    const path = 'messages';
    
    // Query for messages where (sender=userId AND receiver=otherId) OR (sender=otherId AND receiver=userId)
    const q = query(
      collection(db, path),
      or(
        and(where("senderId", "==", userId), where("receiverId", "==", otherId)),
        and(where("senderId", "==", otherId), where("receiverId", "==", userId))
      )
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DirectMessage[];
      messages.sort((a: any, b: any) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeA - timeB;
      });
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  listenMessagesByAppointment: (appointmentId: string, secret: string | undefined, callback: (messages: DirectMessage[]) => void) => {
    const path = 'messages';
    const q = query(
      collection(db, path),
      where("appointmentId", "==", appointmentId)
    );

    return onSnapshot(q, async (snapshot) => {
      const messages = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        let text = data.text;
        if (data.encrypted && secret) {
          text = await cryptoService.decrypt(text, secret);
        }
        return {
          id: doc.id,
          ...data,
          text
        } as DirectMessage;
      }));
      messages.sort((a: any, b: any) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeA - timeB;
      });
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};

