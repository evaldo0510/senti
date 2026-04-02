import { userService } from "./userService";
import { auth } from "./firebase";

export interface Pill {
  dia: number;
  frase: string;
  reflexao: string;
  acao: string;
  fase: 'CONSCIÊNCIA' | 'ACEITAÇÃO' | 'REGULAÇÃO' | 'RESSIGNIFICAÇÃO' | 'REPROGRAMAÇÃO' | 'FORTALECIMENTO' | 'AUTONOMIA';
}

export const pilulas: Pill[] = [
  {
    dia: 1,
    frase: "Nem tudo que você sente precisa ser resolvido hoje.",
    reflexao: "A urgência não vem da emoção… vem da sua tentativa de controlá-la.",
    acao: "Hoje, escolha não resolver algo. Apenas observe.",
    fase: 'CONSCIÊNCIA'
  },
  {
    dia: 2,
    frase: "A emoção sobe como onda… mas não é o oceano.",
    reflexao: "Você não é o que sente… você está atravessando isso.",
    acao: "Quando vier a emoção, diga internamente: 'isso vai passar'.",
    fase: 'CONSCIÊNCIA'
  },
  {
    dia: 3,
    frase: "O corpo sente antes da mente entender.",
    reflexao: "Às vezes o desconforto não é lógico… é fisiológico.",
    acao: "Respire 3 vezes profundamente agora.",
    fase: 'CONSCIÊNCIA'
  },
  {
    dia: 4,
    frase: "Evitar sentir prolonga o que você quer encurtar.",
    reflexao: "O que você foge… se repete.",
    acao: "Nomeie uma emoção sem fugir dela.",
    fase: 'CONSCIÊNCIA'
  },
  {
    dia: 5,
    frase: "Você não está travado… está repetindo.",
    reflexao: "O padrão não é destino… é hábito emocional.",
    acao: "Perceba qual padrão se repetiu hoje.",
    fase: 'CONSCIÊNCIA'
  },
  // Adicionando mais alguns para preencher a lógica
  {
    dia: 6,
    frase: "Você não é a emoção… você é quem percebe.",
    reflexao: "Existe uma parte em você que observa tudo. Essa parte é maior que o que você sente.",
    acao: "Nomeie: 'estou sentindo...' (sem julgamento)",
    fase: 'CONSCIÊNCIA'
  },
  {
    dia: 7,
    frase: "Sentir não é fraqueza. É sinal de vida.",
    reflexao: "Você não está quebrado… você está sensível.",
    acao: "Permita-se sentir sem se corrigir.",
    fase: 'CONSCIÊNCIA'
  }
];

export const getPillOfDay = (dayOfYear?: number): Pill => {
  const day = dayOfYear || getDayOfYear();
  // Loop back if day > 365 or if we don't have all 365 yet
  const index = (day - 1) % pilulas.length;
  return pilulas[index];
};

const getDayOfYear = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const pillService = {
  getPilulas: () => pilulas,
  
  getPillOfDay: (dayOfYear?: number): Pill => {
    const day = dayOfYear || getDayOfYear();
    const index = (day - 1) % pilulas.length;
    return pilulas[index];
  },

  setFavoritePill: async (pill: Pill) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    try {
      await userService.updateProfile(user.uid, {
        pillOfTheWeek: {
          dia: pill.dia,
          frase: pill.frase,
          timestamp: new Date().toISOString()
        }
      });
      return true;
    } catch (error) {
      console.error("Erro ao salvar pílula favorita:", error);
      return false;
    }
  }
};
