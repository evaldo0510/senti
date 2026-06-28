import { db, auth } from "./firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";

export interface IaraConversation {
  id: string;
  userId: string;
  title: string;
  specialization: string; // "geral", "ansiedade", "relacionamentos", "trabalho", etc.
  favorite: boolean;
  messages: {
    tipo: "user" | "iara";
    texto: string;
    imagem?: string | null;
    timestamp?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = "iara_conversations";

export const iaraHistoryService = {
  getUserId: () => auth.currentUser?.uid,

  fetchConversations: async (): Promise<IaraConversation[]> => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      try {
        const local = localStorage.getItem("local_iara_conversations");
        return local ? JSON.parse(local) : [];
      } catch (e) {
        console.error("Error parsing local conversations:", e);
        return [];
      }
    }

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", uid),
        orderBy("updatedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const conversations: IaraConversation[] = [];
      querySnapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data()
        } as IaraConversation);
      });
      return conversations;
    } catch (error) {
      console.error("Error fetching Firestore conversations:", error);
      // Fallback silently or return empty
      return [];
    }
  },

  createConversation: async (title: string, specialization: string, initialMessage?: string): Promise<string> => {
    const uid = auth.currentUser?.uid;
    const newConvData = {
      userId: uid || "local_user",
      title: title || "Nova Conversa",
      specialization: specialization || "geral",
      favorite: false,
      messages: initialMessage ? [{
        tipo: "iara" as const,
        texto: initialMessage,
        timestamp: new Date().toISOString()
      }] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!uid) {
      try {
        const local = localStorage.getItem("local_iara_conversations");
        const list: IaraConversation[] = local ? JSON.parse(local) : [];
        const newId = `local_${Date.now()}`;
        const newConv: IaraConversation = {
          id: newId,
          ...newConvData
        };
        list.unshift(newConv);
        localStorage.setItem("local_iara_conversations", JSON.stringify(list));
        return newId;
      } catch (e) {
        console.error("Error saving local conversation:", e);
        return `local_${Date.now()}`;
      }
    }

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...newConvData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating Firestore conversation:", error);
      throw error;
    }
  },

  saveMessage: async (
    conversationId: string, 
    tipo: "user" | "iara", 
    texto: string, 
    imagem: string | null = null
  ): Promise<void> => {
    const uid = auth.currentUser?.uid;
    const newMessage = {
      tipo,
      texto,
      imagem,
      timestamp: new Date().toISOString()
    };

    if (!uid || conversationId.startsWith("local_")) {
      try {
        const local = localStorage.getItem("local_iara_conversations");
        if (local) {
          const list: IaraConversation[] = JSON.parse(local);
          const idx = list.findIndex(c => c.id === conversationId);
          if (idx !== -1) {
            list[idx].messages.push(newMessage);
            list[idx].updatedAt = new Date().toISOString();
            const updatedItem = list.splice(idx, 1)[0];
            list.unshift(updatedItem);
            localStorage.setItem("local_iara_conversations", JSON.stringify(list));
          }
        }
      } catch (e) {
        console.error("Error updating local conversation:", e);
      }
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, conversationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentMessages = data.messages || [];
        const updatedMessages = [...currentMessages, newMessage];
        
        await updateDoc(docRef, {
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error saving message to Firestore:", error);
    }
  },

  toggleFavorite: async (conversationId: string, currentStatus: boolean): Promise<boolean> => {
    const uid = auth.currentUser?.uid;
    const newStatus = !currentStatus;

    if (!uid || conversationId.startsWith("local_")) {
      try {
        const local = localStorage.getItem("local_iara_conversations");
        if (local) {
          const list: IaraConversation[] = JSON.parse(local);
          const idx = list.findIndex(c => c.id === conversationId);
          if (idx !== -1) {
            list[idx].favorite = newStatus;
            localStorage.setItem("local_iara_conversations", JSON.stringify(list));
          }
        }
      } catch (e) {
        console.error("Error toggling local favorite:", e);
      }
      return newStatus;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, conversationId);
      await updateDoc(docRef, {
        favorite: newStatus
      });
      return newStatus;
    } catch (error) {
      console.error("Error updating favorite status:", error);
      return currentStatus;
    }
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    const uid = auth.currentUser?.uid;

    if (!uid || conversationId.startsWith("local_")) {
      try {
        const local = localStorage.getItem("local_iara_conversations");
        if (local) {
          const list: IaraConversation[] = JSON.parse(local);
          const filtered = list.filter(c => c.id !== conversationId);
          localStorage.setItem("local_iara_conversations", JSON.stringify(filtered));
        }
      } catch (e) {
        console.error("Error deleting local conversation:", e);
      }
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, conversationId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting Firestore conversation:", error);
      throw error;
    }
  }
};
