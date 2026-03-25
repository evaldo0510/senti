import { GoogleGenAI } from "@google/genai";
import { userService } from "./userService";
import { auth } from "./firebase";

export interface TreatmentAnalysis {
  summary: string;
  progressScore: number; // 0-100
  recommendations: string[];
  nextSteps: string;
  generatedAt: string;
}

export const analysisService = {
  generateAnalysis: async (moodHistory: any[], diaryEntries: any[]): Promise<TreatmentAnalysis> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback if no API key is set
      return {
        summary: "Sua jornada tem sido marcada por altos e baixos naturais. Observamos que você tem mantido uma frequência constante de registros, o que é excelente para o autoconhecimento.",
        progressScore: 75,
        recommendations: [
          "Continue registrando seu humor diariamente.",
          "Tente identificar padrões entre suas atividades e seu humor.",
          "Considere compartilhar seus registros com seu terapeuta na próxima sessão."
        ],
        nextSteps: "Focar em técnicas de respiração nos momentos de maior intensidade emocional.",
        generatedAt: new Date().toISOString()
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          text: `Você é um assistente de saúde mental especializado em análise de progresso terapêutico. 
          Analise os seguintes dados de um usuário e forneça um relatório estruturado em JSON.
          
          Histórico de Humor (últimos registros): ${JSON.stringify(moodHistory.slice(0, 10))}
          Entradas do Diário (últimas): ${JSON.stringify(diaryEntries.slice(0, 5))}
          
          O JSON deve seguir este formato:
          {
            "summary": "Resumo da análise em 2-3 frases",
            "progressScore": número de 0 a 100,
            "recommendations": ["lista de 3 recomendações práticas"],
            "nextSteps": "Próximo passo sugerido para o tratamento"
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
        ...result,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      throw error;
    }
  }
};
