import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  serverTimestamp,
  doc,
  setDoc
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { DirectMessage } from "../types";

export const chatService = {
  sendMessage: async (senderId: string, receiverId: string, text: string, appointmentId?: string) => {
    const messageId = Date.now().toString();
    const messageData = {
      id: messageId,
      senderId,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      appointmentId: appointmentId || null
    };

    try {
      await setDoc(doc(db, "direct_messages", messageId), messageData);
      return messageId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `direct_messages/${messageId}`);
      throw error;
    }
  },

  listenMessages: (userId: string, otherId: string, callback: (messages: DirectMessage[]) => void) => {
    // We need to listen to messages where (sender=userId AND receiver=otherId) OR (sender=otherId AND receiver=userId)
    // Firestore doesn't support OR across different fields easily in a single query without complex indexes.
    // A common workaround is to have a conversationId = [id1, id2].sort().join('_')
    
    // For now, let's try a simpler approach if possible, or use two listeners.
    // Actually, let's use the conversationId approach for efficiency.
    
    const q = query(
      collection(db, "direct_messages"),
      where("senderId", "in", [userId, otherId]),
      where("receiverId", "in", [userId, otherId]),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => doc.data() as DirectMessage);
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "direct_messages");
    });
  },

  listenMessagesByAppointment: (appointmentId: string, callback: (messages: DirectMessage[]) => void) => {
    const q = query(
      collection(db, "direct_messages"),
      where("appointmentId", "==", appointmentId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => doc.data() as DirectMessage);
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "direct_messages");
    });
  }
};
