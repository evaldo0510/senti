import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "../types";

export async function encontrarTerapeutas(mensagem: string): Promise<UserProfile[]> {
  try {
    const terapeutasRef = collection(db, "users");
    const q = query(terapeutasRef, where("tipo", "==", "terapeuta"));
    const querySnapshot = await getDocs(q);
    
    const todos: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      todos.push({ uid: doc.id, ...doc.data() } as UserProfile);
    });

    const msgLower = mensagem.toLowerCase();
    let matches: UserProfile[] = [];

    if (msgLower.includes("ansiedade") || msgLower.includes("nervoso") || msgLower.includes("medo") || msgLower.includes("pânico")) {
      matches = todos.filter(t => 
        t.especialidades?.some(e => e.toLowerCase().includes("ansiedade") || e.toLowerCase().includes("tcc"))
      );
    } else if (msgLower.includes("triste") || msgLower.includes("depressão") || msgLower.includes("desânimo") || msgLower.includes("luto")) {
      matches = todos.filter(t => 
        t.especialidades?.some(e => e.toLowerCase().includes("depressão") || e.toLowerCase().includes("psicanalista"))
      );
    }

    // Se não encontrar matches específicos, retorna os primeiros da lista como sugestão geral
    if (matches.length === 0) {
      return todos.slice(0, 2);
    }

    return matches;
  } catch (error) {
    console.error("Erro ao encontrar terapeutas:", error);
    return [];
  }
}
