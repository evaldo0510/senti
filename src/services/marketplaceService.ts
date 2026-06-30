import { db, auth } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, query, where, Timestamp } from 'firebase/firestore';

export interface MarketplaceItem {
  id?: string;
  title: string;
  description: string;
  category: "Programas" | "Cursos" | "Livros" | "Eventos" | "Materiais";
  price: number;
  creatorId: string;
  creatorName: string;
  imageUrl?: string;
  duration?: string;
  date?: string; // For events
  linkUrl?: string;
  createdAt: string;
}

// Initial seed products for the marketplace to avoid empty lists
const INITIAL_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: "m1",
    title: "Jornada da Mente Focada: Superando o Burnout",
    description: "Um programa completo de 4 semanas com áudios, exercícios e diário de mindfulness desenhado para profissionais sob alta pressão corporal e corporativa.",
    category: "Programas",
    price: 49.90,
    creatorId: "therapist-1",
    creatorName: "Dra. Ana Silva",
    duration: "4 semanas",
    imageUrl: "https://picsum.photos/seed/burnout/600/400",
    createdAt: new Date().toISOString()
  },
  {
    id: "m2",
    title: "Comunicação Não-Violenta nos Relacionamentos",
    description: "Curso completo em vídeo abordando as melhores ferramentas de CNV para casais e relações familiares. Inclui PDF didático.",
    category: "Cursos",
    price: 89.90,
    creatorId: "therapist-2",
    creatorName: "Dr. Marcos Oliveira",
    duration: "8 horas",
    imageUrl: "https://picsum.photos/seed/relationships/600/400",
    createdAt: new Date().toISOString()
  },
  {
    id: "m3",
    title: "Workshop Ao Vivo: Manejo de Crises de Ansiedade",
    description: "Masterclass interativa com práticas reais de ancoragem sensorial e respiração diafragmática rápida. Vagas limitadas.",
    category: "Eventos",
    price: 35.00,
    creatorId: "therapist-3",
    creatorName: "Dra. Beatriz Costa",
    date: "15/07/2026 - 19:30",
    imageUrl: "https://picsum.photos/seed/workshop/600/400",
    createdAt: new Date().toISOString()
  },
  {
    id: "m4",
    title: "Poesias Cognitivas Hipnóticas para o Sono",
    description: "Compilado de áudios relaxantes e poesias construídas com sugestões indiretas para restaurar o sono profundo e reequilibrar o humor.",
    category: "Materiais",
    price: 19.90,
    creatorId: "therapist-1",
    creatorName: "Dra. Ana Silva",
    duration: "10 faixas de áudio",
    imageUrl: "https://picsum.photos/seed/poetry/600/400",
    createdAt: new Date().toISOString()
  }
];

export const marketplaceService = {
  /**
   * Fetches all items from the marketplace, merging firestore collections and fallback seeds.
   */
  getItems: async (category?: string): Promise<MarketplaceItem[]> => {
    try {
      const colRef = collection(db, "marketplaceItems");
      let q = query(colRef);
      if (category && category !== "Todos") {
        q = query(colRef, where("category", "==", category));
      }
      
      const snap = await getDocs(q);
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketplaceItem));
      
      if (items.length === 0) {
        // Return seeded items, filter if category specified
        if (category && category !== "Todos") {
          return INITIAL_MARKETPLACE_ITEMS.filter(item => item.category === category);
        }
        return INITIAL_MARKETPLACE_ITEMS;
      }
      return items;
    } catch (e) {
      console.warn("Firestore marketplaceItems collection error, returning mock data:", e);
      if (category && category !== "Todos") {
        return INITIAL_MARKETPLACE_ITEMS.filter(item => item.category === category);
      }
      return INITIAL_MARKETPLACE_ITEMS;
    }
  },

  /**
   * Registers a new item into the marketplace.
   */
  createItem: async (item: Omit<MarketplaceItem, "id" | "createdAt">): Promise<MarketplaceItem | null> => {
    try {
      const colRef = collection(db, "marketplaceItems");
      const newItem = {
        ...item,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(colRef, newItem);
      return { id: docRef.id, ...newItem };
    } catch (e) {
      console.error("Error creating marketplace item in firestore:", e);
      return null;
    }
  },

  /**
   * Purchases a marketplace item (Simulated or via custom transactions).
   */
  purchaseItem: async (itemId: string, userId: string): Promise<boolean> => {
    try {
      const purchasesCol = collection(db, "marketplacePurchases");
      await addDoc(purchasesCol, {
        itemId,
        userId,
        purchasedAt: Timestamp.now(),
        status: "completed"
      });
      return true;
    } catch (e) {
      console.error("Error creating purchase record:", e);
      return false;
    }
  },

  /**
   * Returns items purchased by a specific user.
   */
  getUserPurchases: async (userId: string): Promise<string[]> => {
    try {
      const q = query(
        collection(db, "marketplacePurchases"),
        where("userId", "==", userId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data().itemId as string);
    } catch (e) {
      console.error("Error loading user purchases:", e);
      return [];
    }
  }
};
