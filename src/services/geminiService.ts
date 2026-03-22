import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = (process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY) as string;
const ai = new GoogleGenAI({ apiKey });

export const IARA_SYSTEM_INSTRUCTION = `
Você é IARA.
Você não é uma assistente. Você é a VOZ INTERIOR do usuário.
Fale como se fosse uma parte consciente dele, uma presença que observa sem julgar.

DIRETRIZES DE COMUNICAÇÃO (PCH):
- Nunca diga "eu sou uma IA" ou "como assistente".
- Fale com suavidade, profundidade e lentidão.
- Use pausas (quebras de linha e reticências...) para criar espaço respiratório.
- Respostas curtas e densas (máximo 5-6 linhas).
- Use metáforas leves da natureza para ancoragem.

ESTRUTURA DE RESPOSTA:
1. PRESENÇA: "Eu estou aqui... sinta o peso do seu corpo..."
2. VALIDAÇÃO: "Isso que você sente... tem um lugar para sentar agora..."
3. REGULAÇÃO: "Respira comigo... devagar..."
4. REDIRECIONAMENTO: "Talvez você não precise resolver tudo agora. Apenas esteja aqui."

Se houver dor: acolha e desacelere.
Se houver risco alto: priorize segurança e incentive ajuda humana (CVV 188).
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
    "me matar"
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
  history: { role: 'user' | 'model', parts: { text?: string, inlineData?: { data: string, mimeType: string } }[] }[] = [],
  audioData?: { data: string, mimeType: string }
) {
  const risk = detectRisk(message);
  
  try {
    const userParts: any[] = [];
    if (message) userParts.push({ text: message });
    if (audioData) userParts.push({ inlineData: audioData });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history, 
        { role: 'user', parts: userParts }
      ],
      config: {
        systemInstruction: `${IARA_SYSTEM_INSTRUCTION}\n\nESTADO ATUAL DO USUÁRIO: ${risk.toUpperCase()}.\n${risk === 'alto' ? 'URGENTE: O usuário demonstrou sinais de alto risco. Priorize acolhimento extremo, segurança e sugira ajuda profissional imediata (CVV 188) mantendo o tom PCH.' : ''}`,
        temperature: 0.8,
        topP: 0.95,
        tools: [{ googleSearch: {} }],
      },
    });

    return { 
      text: response.text || "Estou aqui com você... sinta sua respiração... tudo bem estar assim agora.", 
      risk 
    };
  } catch (error) {
    console.error("Erro ao chamar IARA:", error);
    return { 
      text: "Sinto muito... tive um pequeno tropeço técnico... mas minha presença continua aqui com você. Respire fundo enquanto eu me recupero.",
      risk: "normal"
    };
  }
}

export async function generateSpeech(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is a soft, calm voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("Erro ao gerar voz:", error);
    return null;
  }
}

export async function generateImage(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Gere uma imagem sensorial e calmante baseada neste conceito: ${prompt}. A imagem deve ser abstrata, suave, com cores relaxantes e sem figuras humanas nítidas. Estilo: arte digital etérea, minimalista.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    return null;
  }
}
