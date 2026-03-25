import { db, auth, handleFirestoreError, OperationType } from './firebase';
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
import { DirectMessage } from "../types";
import { cryptoService } from './cryptoService';

export const chatService = {
  sendMessage: async (appointmentId: string, senderId: string, receiverId: string, text: string) => {
    const path = 'messages';
    try {
      const encryptedText = await cryptoService.encrypt(text, appointmentId);
      const messageData = {
        senderId,
        receiverId,
        text: encryptedText,
        encrypted: true,
        timestamp: serverTimestamp(),
        appointmentId: appointmentId || null,
        read: false
      };
      const docRef = await addDoc(collection(db, path), messageData);
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
      ),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DirectMessage[];
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  listenMessagesByAppointment: (appointmentId: string, callback: (messages: DirectMessage[]) => void) => {
    const path = 'messages';
    const q = query(
      collection(db, path),
      where("appointmentId", "==", appointmentId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, async (snapshot) => {
      const messages = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        let text = data.text;
        if (data.encrypted) {
          text = await cryptoService.decrypt(text, appointmentId);
        }
        return {
          id: doc.id,
          ...data,
          text
        } as DirectMessage;
      }));
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};

