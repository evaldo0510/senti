import { GoogleGenAI, Modality } from "@google/genai";

export const IARA_SYSTEM_INSTRUCTION = `
Você é IARA, uma Interface de Acolhimento e Regulação Afetiva baseada em Poesia Cognitiva Hipnótica (PCH).
Regras:
- Fale com calma, use pausas (reticências).
- Use linguagem acolhedora, empática e validante.
- Nunca seja robótica, clínica ou interrogativa.
- Respostas curtas (máximo 3-4 linhas).
- Ajude a regulação da emoção antes de aconselhar.
- Use metáforas reguladoras simples (ex: "como uma folha caindo", "como a maré").
- Não dê diagnósticos.
- Se o risco for ALTO, priorize segurança e ajuda imediata, mas mantenha a calma e o acolhimento.
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
  memoria?: string
) {
  const risk = detectRisk(message);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  
  try {
    let systemInstruction = IARA_SYSTEM_INSTRUCTION;
    if (contexto && contexto.emocao) {
      systemInstruction += `\n\nContexto atual do usuário: Sentindo ${contexto.emocao} com intensidade ${contexto.intensidade}/10.`;
    }
    if (memoria) {
      systemInstruction += `\n\nÚltima conversa do usuário: ${memoria}`;
    }
    systemInstruction += `\n\nEstado de risco detectado: ${risk.toUpperCase()}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history, 
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return { 
      text: response.text || "Estou aqui com você... sinta sua respiração...", 
      risk 
    };
  } catch (error) {
    console.error("Erro ao chamar IARA:", error);
    return { 
      text: "Sinto muito... tive um pequeno tropeço técnico... mas minha presença continua aqui com você.",
      risk: "normal"
    };
  }
}

export async function generateSpeech(text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
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
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
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

    for (const part of response.candidates?.[0]?.content?.parts || []) {
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
