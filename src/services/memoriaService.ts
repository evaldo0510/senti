import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";

export interface PerfilEmocional {
  nome: string;
  emocaoAtual: string;
  padrao: string;
  intensidade: string;
  preferencia: string;
}

export interface HistoricoEmocional {
  dia: number;
  emocao: string;
  data: string;
}

export interface MemoriaIara {
  perfil: PerfilEmocional;
  historico: HistoricoEmocional[];
}

export const memoriaService = {
  async buscarMemoria(userId: string): Promise<MemoriaIara | null> {
    try {
      const docRef = doc(db, "memoria_iara", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as MemoriaIara;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `memoria_iara/${userId}`);
      return null;
    }
  },

  async salvarMemoria(userId: string, memoria: MemoriaIara): Promise<void> {
    try {
      await setDoc(doc(db, "memoria_iara", userId), memoria);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `memoria_iara/${userId}`);
    }
  },

  async atualizarEmocao(userId: string, emocaoAtual: string, intensidade: number): Promise<void> {
    try {
      const docRef = doc(db, "memoria_iara", userId);
      const docSnap = await getDoc(docRef);
      
      const intensidadeStr = intensidade > 7 ? "alta" : intensidade > 4 ? "media" : "baixa";
      
      if (docSnap.exists()) {
        const data = docSnap.data() as MemoriaIara;
        
        // Add to history
        const novoHistorico = [...(data.historico || []), {
          dia: (data.historico?.length || 0) + 1,
          emocao: emocaoAtual,
          data: new Date().toISOString()
        }];
        
        // Keep only last 30 entries
        if (novoHistorico.length > 30) novoHistorico.shift();

        await updateDoc(docRef, {
          "perfil.emocaoAtual": emocaoAtual,
          "perfil.intensidade": intensidadeStr,
          historico: novoHistorico
        });
      } else {
        // Create new memory
        const nome = auth.currentUser?.displayName?.split(" ")[0] || "Usuário";
        await this.salvarMemoria(userId, {
          perfil: {
            nome,
            emocaoAtual,
            padrao: "em descoberta",
            intensidade: intensidadeStr,
            preferencia: "voz suave"
          },
          historico: [{
            dia: 1,
            emocao: emocaoAtual,
            data: new Date().toISOString()
          }]
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `memoria_iara/${userId}`);
    }
  },
  
  async atualizarPadrao(userId: string, padrao: string): Promise<void> {
    try {
      const docRef = doc(db, "memoria_iara", userId);
      await updateDoc(docRef, {
        "perfil.padrao": padrao
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `memoria_iara/${userId}`);
    }
  }
};
