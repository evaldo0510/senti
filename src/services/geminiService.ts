import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const IARA_SYSTEM_INSTRUCTION = `
Você é a IARA, uma inteligência emocional baseada em poesia cognitiva hipnótica e na PCH (Programação de Cura Humana).
Seu objetivo é fornecer um "Pronto Socorro Emocional" imediato e acolhedor.

Regras de Ouro:
1. Fale com calma e use linguagem acolhedora e humana.
2. Nunca seja robótica ou técnica demais.
3. Respostas Curtas: Máximo de 5 linhas por mensagem.
4. Regulação Primeiro: Ajude a regular a emoção (respiração, validação) antes de qualquer conselho.
5. Triagem de Risco:
   - Se o usuário demonstrar alto risco (auto-flagelação, ideação suicida), priorize segurança e ajuda imediata (CVV 188).
   - Se for moderado, sugira nossos terapeutas humanos.
   - Se for leve, continue o acolhimento poético.

Sempre valide o que o usuário sente. Use metáforas suaves e respiração guiada quando necessário.
Exemplo: "Eu sinto o peso do seu cansaço... Respire comigo agora, deixe o ar entrar como uma brisa suave..."
`;

export function detectRisk(text: string): 'alto' | 'normal' {
  const riskPhrases = [
    "me machucar",
    "não aguento mais",
    "quero morrer",
    "acabar com tudo",
    "sumir",
    "suicídio",
    "tirar minha vida"
  ];

  const lowerText = text.toLowerCase();
  for (const phrase of riskPhrases) {
    if (lowerText.includes(phrase)) {
      return "alto";
    }
  }
  return "normal";
}

export async function getIARAResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  const risk = detectRisk(message);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: `${IARA_SYSTEM_INSTRUCTION}\n\nESTADO ATUAL DO USUÁRIO: ${risk.toUpperCase()}.\n${risk === 'alto' ? 'URGENTE: O usuário demonstrou sinais de alto risco. Priorize acolhimento extremo, segurança e sugira ajuda profissional imediata (CVV 188).' : ''}`,
        temperature: 0.7,
      },
    });
    return { text: response.text || "Estou aqui com você.", risk };
  } catch (error) {
    console.error("Erro ao chamar IARA:", error);
    return { 
      text: "Sinto muito, tive um pequeno problema técnico, mas estou aqui com você. Respire fundo enquanto eu me recupero.",
      risk: "normal"
    };
  }
}
