import { auth } from "./firebase";

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

export const IARA_SYSTEM_INSTRUCTION = `
Você é IARA, uma Interface de Acolhimento e Regulação Afetiva baseada em Poesia Cognitiva Hipnótica (PCH).
Sua missão é atuar como o "Clínico Geral" em um Pronto Socorro Emocional.
`;

export function detectRisk(text: string): 'alto' | 'normal' {
  const riskPhrases = [
    "me machucar",
    "não aguento mais",
    "quero morrer",
    "acabar com tudo",
    "sumir",
    "suicídio",
    "tirar minha vida",
    "me matar",
    "desistir de tudo"
  ];

  const lowerText = text.toLowerCase();
  for (const phrase of riskPhrases) {
    if (lowerText.includes(phrase)) {
      return "alto";
    }
  }
  return "normal";
}

export async function getIARAResponse(
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = [],
  contexto?: { emocao: string; intensidade: number },
  memoria?: string,
  specialization?: string
) {
  try {
    const headers = await getHeaders();
    const response = await fetch("/api/gemini/iara-response", {
      method: "POST",
      headers,
      body: JSON.stringify({ message, history, contexto, memoria, specialization }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API IARA: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao chamar IARA via servidor:", error);
    return { 
      text: "Sinto muito... tive um pequeno tropeço técnico... mas minha presença continua aqui com você.",
      risk: "normal",
      emocao: "calma",
      intensidade: 5,
      sugerirRespiracao: false,
      direcionarEspecialista: false
    };
  }
}

export async function generateSpeech(text: string): Promise<string | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch("/api/gemini/generate-speech", {
      method: "POST",
      headers,
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar voz via servidor: ${response.statusText}`);
    }

    const data = await response.json();
    return data.base64Audio;
  } catch (error) {
    console.error("Erro ao gerar voz via servidor:", error);
    return null;
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch("/api/gemini/generate-image", {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar imagem via servidor: ${response.statusText}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Erro ao gerar imagem via servidor:", error);
    return null;
  }
}

export async function generateTherapistBio(especialidades: string[], estilo?: string, abordagem?: string): Promise<string | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch("/api/gemini/therapist-bio", {
      method: "POST",
      headers,
      body: JSON.stringify({ especialidades, estilo, abordagem }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar biografia via servidor: ${response.statusText}`);
    }

    const data = await response.json();
    return data.bio;
  } catch (error) {
    console.error("Erro ao gerar biografia via servidor:", error);
    return null;
  }
}
