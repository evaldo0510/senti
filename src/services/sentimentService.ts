import { GoogleGenAI } from "@google/genai";
import { auth } from "./firebase";

export interface SentimentAnalysisResult {
  score: number; // 1-10
  label: "Muito Positivo" | "Positivo" | "Neutro" | "Negativo" | "Muito Negativo";
  color: string;
  emoji: string;
  dominantEmotion: string;
}

export interface AISentimentReport {
  score: number;
  explanation: string;
  advice: string;
  keywords: string[];
}

export const sentimentService = {
  analyzeDiarySentiment: (content: string, moodValue?: number): SentimentAnalysisResult => {
    const text = content.toLowerCase();
    
    // Base score from moodValue if available, otherwise default to neutral 5.5
    let score = moodValue !== undefined && moodValue !== null ? moodValue : 5.5;
    
    const positiveWords = [
      "feliz", "alegre", "ótimo", "bom", "paz", "tranquilo", "calma", "consegui", 
      "melhor", "gratidão", "grato", "amor", "sorri", "produtivo", "leve", "esperança",
      "calmo", "excelente", "maravilhoso", "recomposto", "focado", "foco", "animado",
      "calmou", "tranquilizou", "alívio", "aliviado"
    ];
    
    const negativeWords = [
      "triste", "ansioso", "ruim", "mal", "chateado", "raiva", "ódio", "desespero", 
      "difícil", "cansado", "dor", "medo", "angústia", "crise", "pânico", "chorar", 
      "chorei", "sofrer", "solidão", "sozinho", "inseguro", "frustrado", "culpa", "pesado",
      "esgotado", "desesperada", "ansiosa", "tristinha", "tristinho"
    ];

    const anxiousWords = ["ansioso", "ansiosa", "ansiedade", "pânico", "medo", "nervoso", "nervosa", "preocupado", "preocupada", "tensão", "tenso"];
    const sadWords = ["triste", "tristeza", "desanimado", "desanimada", "chorar", "chorei", "vazio", "solidão", "sozinho", "sozinha"];
    const angryWords = ["raiva", "irritado", "irritada", "chateado", "chateada", "ódio", "frustrado", "frustrada", "estressado", "estressada"];
    const calmWords = ["paz", "tranquilo", "tranquila", "calma", "leve", "relaxado", "relaxada", "focado", "focada", "sereno", "serena"];

    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(w => {
      const regex = new RegExp(w, 'g');
      const matches = text.match(regex);
      if (matches) positiveCount += matches.length;
    });
    
    negativeWords.forEach(w => {
      const regex = new RegExp(w, 'g');
      const matches = text.match(regex);
      if (matches) negativeCount += matches.length;
    });

    // Adjust score based on words if no strict moodValue was provided
    if (moodValue === undefined || moodValue === null) {
      if (positiveCount > 0 || negativeCount > 0) {
        const diff = positiveCount - negativeCount;
        score = 5.5 + diff * 1.2;
      }
    } else {
      // If we have a moodValue, adjust it slightly based on textual positive/negative sentiment
      const diff = positiveCount - negativeCount;
      score = score + diff * 0.5;
    }
    
    // Clamp score between 1 and 10
    score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));

    // Determine dominant emotion
    let dominantEmotion = "Neutro";
    let maxCount = 0;
    
    const emotions = [
      { name: "Ansiedade", words: anxiousWords },
      { name: "Tristeza", words: sadWords },
      { name: "Irritação/Raiva", words: angryWords },
      { name: "Calma/Paz", words: calmWords }
    ];
    
    emotions.forEach(emo => {
      let count = 0;
      emo.words.forEach(w => {
        const matches = text.match(new RegExp(w, 'g'));
        if (matches) count += matches.length;
      });
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emo.name;
      }
    });

    if (dominantEmotion === "Neutro") {
      if (score >= 7.5) dominantEmotion = "Calma/Alegria";
      else if (score <= 3.5) dominantEmotion = "Desconforto";
    }

    // Map to label, color, emoji
    let label: "Muito Positivo" | "Positivo" | "Neutro" | "Negativo" | "Muito Negativo" = "Neutro";
    let color = "text-amber-500 dark:text-amber-400";
    let emoji = "😐";

    if (score >= 8.5) {
      label = "Muito Positivo";
      color = "text-emerald-500 dark:text-emerald-400";
      emoji = "😊";
    } else if (score >= 6.0) {
      label = "Positivo";
      color = "text-teal-500 dark:text-teal-400";
      emoji = "🙂";
    } else if (score >= 4.0) {
      label = "Neutro";
      color = "text-slate-500 dark:text-slate-400";
      emoji = "😐";
    } else if (score >= 2.0) {
      label = "Negativo";
      color = "text-indigo-500 dark:text-indigo-400";
      emoji = "😔";
    } else {
      label = "Muito Negativo";
      color = "text-rose-500 dark:text-rose-400";
      emoji = "😭";
    }

    return { score, label, color, emoji, dominantEmotion };
  },

  getWeeklySentimentTrend: (diaryEntries: any[]): { date: string; dateLabel: string; score: number | null; count: number }[] => {
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const result: { [key: string]: { sum: number; count: number; dateLabel: string } } = {};
    
    // Initialize last 7 days
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayName = daysOfWeek[d.getDay()];
      const dateLabel = `${d.getDate()}/${d.getMonth() + 1} (${dayName})`;
      result[dateKey] = { sum: 0, count: 0, dateLabel };
    }
    
    // Populate with diary entries
    diaryEntries.forEach(entry => {
      if (!entry.timestamp) return;
      const entryDate = new Date(entry.timestamp);
      const dateKey = entryDate.toISOString().split('T')[0];
      
      if (result[dateKey] !== undefined) {
        const sentiment = sentimentService.analyzeDiarySentiment(entry.content, entry.moodValue);
        result[dateKey].sum += sentiment.score;
        result[dateKey].count += 1;
      }
    });
    
    return Object.keys(result).map(key => {
      const item = result[key];
      return {
        date: key,
        dateLabel: item.dateLabel,
        score: item.count > 0 ? Math.round((item.sum / item.count) * 10) / 10 : null,
        count: item.count
      };
    });
  },

  analyzeWithAI: async (content: string): Promise<AISentimentReport> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const apiKey = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined) || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback if no API key is set
      const localResult = sentimentService.analyzeDiarySentiment(content);
      return {
        score: localResult.score,
        explanation: `Sua escrita reflete sentimentos relacionados a ${localResult.dominantEmotion.toLowerCase()}. O tom geral é classificado como ${localResult.label.toLowerCase()}.`,
        advice: "Escrever ajuda a reorganizar as conexões mentais. Continue esse hábito acolhedor.",
        keywords: [localResult.dominantEmotion, "Diário"]
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: `Você é um especialista em psicologia clínica e análise de sentimentos linguísticos. 
          Analise o seguinte registro de diário de um paciente e forneça um relatório estruturado em JSON com as seguintes chaves exatas:
          
          Texto do Diário: "${content}"
          
          O JSON de resposta deve seguir estritamente este formato:
          {
            "score": número de 1 a 10 (onde 1 é extremamente negativo/triste/ansioso e 10 é extremamente positivo/em paz/feliz),
            "explanation": "Uma breve explicação do sentimento detectado na escrita, em tom caloroso e empático (máximo de 2 frases)",
            "advice": "Um conselho ou insight terapêutico empático baseado no texto (máximo de 2 frases)",
            "keywords": ["3-4 palavras-chave emocionais identificadas no texto"]
          }`
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    try {
      const response = await model;
      const result = JSON.parse(response.text || "{}");
      return {
        score: typeof result.score === 'number' ? result.score : 5.0,
        explanation: result.explanation || "Não foi possível analisar detalhadamente.",
        advice: result.advice || "Continue registrando seus sentimentos.",
        keywords: Array.isArray(result.keywords) ? result.keywords : []
      };
    } catch (error) {
      console.error("Error generating AI sentiment report:", error);
      const localResult = sentimentService.analyzeDiarySentiment(content);
      return {
        score: localResult.score,
        explanation: `Sentimentos de ${localResult.dominantEmotion.toLowerCase()} detectados localmente.`,
        advice: "Focar em respiração consciente e autocompaixão.",
        keywords: [localResult.dominantEmotion]
      };
    }
  }
};
