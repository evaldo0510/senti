export interface TarefaJornada {
  id: string;
  title: string;
  description: string;
  category: "crisis_support" | "emotional_rescue" | "sensory_grounding" | "reflection" | "growth" | "exercicio" | "consulta" | "diario";
  actionLabel: string;
  actionUrl: string;
  xpReward: number;
}

export interface Jornada {
  id: string;
  userId: string;
  name: string;
  description: string;
  active: boolean;
  currentStepIndex: number;
  tasks: TarefaJornada[];
  completedTaskIds: string[];
}

// Support existing types for backward compatibility
export type JourneyTask = TarefaJornada;
export type Journey = Jornada;

/**
 * SentiCore Orchestration Engine
 * Analyzes mood scores and diary entries to suggest the most personalized, high-value Next Step.
 * Focuses on offering exercises, consultations, or diary entries based on user's emotional state.
 */
export function orchestrateNextStep(
  moodHistory: { moodValue?: number; value?: number; content?: string; note?: string }[],
  userProfile?: { nome?: string; streak?: number; xp?: number }
): TarefaJornada {
  const userName = userProfile?.nome || "alguém especial";
  
  // 1. Fallback default if no history exists (Diary)
  if (!moodHistory || moodHistory.length === 0) {
    return {
      id: "sc_first_diary",
      title: "Primeiro Registro no Diário",
      description: `Olá, ${userName}! Colocar em palavras o que se passa na nossa mente é o primeiro passo para o acolhimento. Registre seu humor de hoje no seu Diário Emocional.`,
      category: "diario",
      actionLabel: "Escrever no Diário",
      actionUrl: "/diario",
      xpReward: 30
    };
  }

  // Calculate average mood
  const moodScores = moodHistory.map(h => h.moodValue ?? h.value ?? 7.0);
  const avgMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;

  // Search text contents for distress signals or anxiety keywords
  const combinedText = moodHistory
    .map(h => (h.content || h.note || "").toLowerCase())
    .join(" ");

  const anxietyKeywords = ["ansiedade", "ansioso", "ansiosa", "pânico", "medo", "estresse", "aperto", "sufoco", "crise"];
  const depressionKeywords = ["triste", "tristeza", "luto", "vazio", "desânimo", "chorar", "choro", "sozinho", "isolado"];

  const containsAnxiety = anxietyKeywords.some(word => combinedText.includes(word));
  const containsDepression = depressionKeywords.some(word => combinedText.includes(word));

  // 2. Severe Emotional distress / Low mood (Suggest Consultation/Professional Support)
  if (avgMood < 4.5 || containsDepression) {
    return {
      id: "sc_consultation_support",
      title: "Conexão com Especialista",
      description: "Percebemos um peso emocional maior nos seus sentimentos recentemente. Lembramos que a IA apoia, mas o cuidado real é humano. Que tal conversar com um de nossos terapeutas parceiros hoje?",
      category: "consulta",
      actionLabel: "Agendar Consulta",
      actionUrl: "/terapeutas",
      xpReward: 40
    };
  }

  // 3. High stress or anxiety detected (Suggest Breathing Exercise)
  if (containsAnxiety || (avgMood >= 4.5 && avgMood < 6.5)) {
    return {
      id: "sc_box_breathing",
      title: "Respiração Consciente (Exercício)",
      description: "Identificamos sinais de agitação ou estresse elevado em suas reflexões. Dedique 3 minutos para o nosso exercício guiado de Respiração Quadrada e recupere o seu equilíbrio.",
      category: "exercicio",
      actionLabel: "Iniciar Exercício",
      actionUrl: "/guided-flow",
      xpReward: 25
    };
  }

  // 4. Balanced emotional state with high streak (Suggest Poetic/Reflective Reading)
  if (avgMood >= 7.5 && (userProfile?.streak || 0) >= 3) {
    return {
      id: "sc_poetic_growth",
      title: "Poesia Cognitiva Hipnótica",
      description: "Seu jardim interno está florescendo lindamente! Que tal explorar uma pílula de Poesia Cognitiva Hipnótica (PCH) para expandir e consolidar seu bem-estar hoje?",
      category: "growth",
      actionLabel: "Explorar Biblioteca",
      actionUrl: "/diario",
      xpReward: 20
    };
  }

  // 5. Normal stable state (Suggest Daily Diary reflection)
  return {
    id: "sc_daily_reflection",
    title: "Expressão Diária no Diário",
    description: "Você está mantendo um excelente ritmo de autocuidado. Registre as pequenas vitórias ou sentimentos do dia no seu Diário para continuar cultivando seu bem-estar.",
    category: "diario",
    actionLabel: "Escrever no Diário",
    actionUrl: "/diario",
    xpReward: 15
  };
}
