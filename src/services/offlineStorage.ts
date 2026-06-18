// Offline Storage using native IndexedDB for local persistence
// Enables access to diary entries and breathing techniques offline

const DB_NAME = "SentiOfflineDB";
const DB_VERSION = 1;

export interface OfflineMoodEntry {
  id?: string;
  userId: string;
  value: number;
  intensity: number;
  emotion: string; // matches "note" or "emotion"
  timestamp: string;
  synced: boolean;
}

export interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  inhale: number; // seconds
  holdIn?: number; // seconds
  exhale: number; // seconds
  holdOut?: number; // seconds
  cycles: number;
  benefits: string;
}

const DEFAULT_BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: "quadrada",
    name: "Respiração Quadrada (Box Breathing)",
    description: "Altamente recomendada para reequilíbrio imediato e foco em momentos de grande estresse ou pânico.",
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    cycles: 4,
    benefits: "Reduz o cortisol, acalma o ritmo cardíaco e estabiliza o foco neural."
  },
  {
    id: "relaxante",
    name: "Respiração 4-7-8 (Calmante Soneca)",
    description: "Um tranquilizante natural para o sistema nervoso. Ideal para desacelerar o corpo e preparar para dormir.",
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    cycles: 4,
    benefits: "Desativa o modo luta/fuga, proporcionando relaxamento profundo e indução espontânea do sono."
  },
  {
    id: "coerencia",
    name: "Coerência Cardíaca (5-5)",
    description: "Sincronia perfeita entre a respiração e os batimentos cardíacos. Ideal para prática diária.",
    inhale: 5,
    exhale: 5,
    cycles: 6,
    benefits: "Harmoniza as oscilações do sistema autônomo, gerando calma de longo prazo."
  },
  {
    id: "alivio",
    name: "Respiração de Alívio Rápido (3-6)",
    description: "Prática rápida com expiração prolongada. Excelente para aliviar ansiedade social ou nervosismo de performance.",
    inhale: 3,
    exhale: 6,
    cycles: 5,
    benefits: "Estimula o nervo vago de maneira ultrarrápida, promovendo alívio imediato."
  }
];

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      // Mood entries store
      if (!db.objectStoreNames.contains("moodEntries")) {
        const moodStore = db.createObjectStore("moodEntries", {
          keyPath: "id",
          autoIncrement: true
        });
        moodStore.createIndex("userId", "userId", { unique: false });
        moodStore.createIndex("timestamp", "timestamp", { unique: false });
        moodStore.createIndex("synced", "synced", { unique: false });
      }

      // Breathing techniques store
      if (!db.objectStoreNames.contains("breathingTechniques")) {
        db.createObjectStore("breathingTechniques", { keyPath: "id" });
      }

      // App state / last used parameters store
      if (!db.objectStoreNames.contains("appState")) {
        db.createObjectStore("appState", { keyPath: "key" });
      }
    };

    request.onsuccess = async (event: any) => {
      const db = event.target.result;
      
      // Prepopulate breathing techniques once
      try {
        const tx = db.transaction("breathingTechniques", "readwrite");
        const store = tx.objectStore("breathingTechniques");
        
        for (const tech of DEFAULT_BREATHING_TECHNIQUES) {
          store.put(tech);
        }
      } catch (e) {
        console.error("Erro ao prepopular técnicas de respiração", e);
      }

      resolve(db);
    };

    request.onerror = (event: any) => {
      reject(event.target.error || "Erro desconhecido ao abrir IndexedDB");
    };
  });
};

export const offlineStorage = {
  // --- Mood / Diary persistence ---
  saveMoodOffline: async (entry: Omit<OfflineMoodEntry, "id">): Promise<number> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("moodEntries", "readwrite");
      const store = transaction.objectStore("moodEntries");
      const request = store.add(entry);

      request.onsuccess = (e: any) => {
        resolve(e.target.result);
      };

      request.onerror = (e: any) => {
        reject(e.target.error);
      };
    });
  },

  getMoodsOffline: async (userId: string): Promise<OfflineMoodEntry[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("moodEntries", "readonly");
      const store = transaction.objectStore("moodEntries");
      const index = store.index("userId");
      const request = index.getAll(userId);

      request.onsuccess = (e: any) => {
        const results = e.target.result as OfflineMoodEntry[];
        // Sort newest first
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(results);
      };

      request.onerror = (e: any) => {
        reject(e.target.error);
      };
    });
  },

  getUnsyncedMoods: async (): Promise<OfflineMoodEntry[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("moodEntries", "readonly");
      const store = transaction.objectStore("moodEntries");
      const index = store.index("synced");
      const request = index.getAll(0); // false is typically 0 or boolean equivalent in IndexedDB queried indices

      request.onsuccess = (e: any) => {
        const all = e.target.result as OfflineMoodEntry[];
        resolve(all.filter(item => !item.synced));
      };

      request.onerror = (e: any) => {
        reject(e.target.error);
      };
    });
  },

  markAsSynced: async (id: number): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("moodEntries", "readwrite");
      const store = transaction.objectStore("moodEntries");
      const getReq = store.get(id);

      getReq.onsuccess = (e: any) => {
        const entry = e.target.result;
        if (entry) {
          entry.synced = true;
          store.put(entry);
        }
        resolve();
      };

      getReq.onerror = (e: any) => {
        reject(e.target.error);
      };
    });
  },

  // --- Breathing Techniques local get ---
  getBreathingTechniquesOffline: async (): Promise<BreathingTechnique[]> => {
    // If inside node environments, return defaults
    if (typeof indexedDB === 'undefined') {
      return DEFAULT_BREATHING_TECHNIQUES;
    }
    try {
      const db = await initDB();
      return new Promise((resolve) => {
        const transaction = db.transaction("breathingTechniques", "readonly");
        const store = transaction.objectStore("breathingTechniques");
        const request = store.getAll();

        request.onsuccess = (e: any) => {
          const results = e.target.result as BreathingTechnique[];
          resolve(results.length > 0 ? results : DEFAULT_BREATHING_TECHNIQUES);
        };

        request.onerror = () => {
          resolve(DEFAULT_BREATHING_TECHNIQUES);
        };
      });
    } catch (err) {
      return DEFAULT_BREATHING_TECHNIQUES;
    }
  },

  // State keys
  saveLastUsedTechnique: async (techniqueId: string): Promise<void> => {
    if (typeof indexedDB === 'undefined') return;
    try {
      const db = await initDB();
      const transaction = db.transaction("appState", "readwrite");
      const store = transaction.objectStore("appState");
      store.put({ key: "last_used_respiration", id: techniqueId, timestamp: new Date().toISOString() });
    } catch (e) {
      console.error(e);
    }
  },

  getLastUsedTechnique: async (): Promise<string | null> => {
    if (typeof indexedDB === 'undefined') return null;
    try {
      const db = await initDB();
      return new Promise((resolve) => {
        const transaction = db.transaction("appState", "readonly");
        const store = transaction.objectStore("appState");
        const request = store.get("last_used_respiration");

        request.onsuccess = (e: any) => {
          resolve(e.target.result?.id || null);
        };
        request.onerror = () => {
          resolve(null);
        };
      });
    } catch {
      return null;
    }
  }
};
