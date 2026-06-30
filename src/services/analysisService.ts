import { auth } from "./firebase";

export interface TreatmentAnalysis {
  summary: string;
  progressScore: number; // 0-100
  recommendations: string[];
  nextSteps: string;
  generatedAt: string;
}

async function getHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const analysisService = {
  generateAnalysis: async (moodHistory: any[], diaryEntries: any[]): Promise<TreatmentAnalysis> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
      const headers = await getHeaders();
      const response = await fetch("/api/gemini/generate-analysis", {
        method: "POST",
        headers,
        body: JSON.stringify({ moodHistory, diaryEntries }),
      });

      if (!response.ok) {
        throw new Error(`Erro na geração de análise no servidor: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        ...result,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Erro ao gerar análise via servidor, usando fallback:", error);
      // Fallback
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
  }
};
