import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  or,
  and
} from 'firebase/firestore';
import { DirectMessage } from "../types";

export const chatService = {
  sendMessage: async (senderId: string, receiverId: string, text: string, appointmentId?: string) => {
    const path = 'messages';
    try {
      const messageData = {
        senderId,
        receiverId,
        text,
        timestamp: new Date().toISOString(),
        appointmentId: appointmentId || null
      };
      const docRef = await addDoc(collection(db, path), messageData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
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

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DirectMessage[];
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};

