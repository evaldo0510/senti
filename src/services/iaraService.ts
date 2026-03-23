import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface IaraResponse {
  resposta: string;
  risco: "normal" | "alto";
}

function detectarRisco(texto: string): "normal" | "alto" {
  const palavrasRisco = [
    "me machucar",
    "não aguento mais",
    "quero morrer",
    "acabar com tudo",
    "sumir",
    "me matar",
    "desistir de tudo"
  ];

  const textoLower = texto.toLowerCase();

  for (let palavra of palavrasRisco) {
    if (textoLower.includes(palavra)) {
      return "alto";
    }
  }

  return "normal";
}

export async function falarComIARA(
  mensagemUsuario: string,
  historico: ChatMessage[] = [],
  contexto?: { emocao: string; intensidade: number }
): Promise<IaraResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  const risco = detectarRisco(mensagemUsuario);

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return { resposta: "Algo deu errado, mas eu continuo aqui com você.", risco };
  }

  const ai = new GoogleGenAI({ apiKey });

  let systemInstruction = `Você é IARA, uma Interface de Acolhimento e Regulação Afetiva baseada em Poesia Cognitiva Hipnótica (PCH).
Regras:
- Fale com calma, use pausas (reticências).
- Use linguagem acolhedora, empática e validante.
- Nunca seja robótica, clínica ou interrogativa.
- Respostas curtas (máximo 3-4 linhas).
- Ajude a regular a emoção antes de aconselhar.
- Use metáforas reguladoras simples (ex: "como uma folha caindo", "como a maré").
- Não dê diagnósticos.
- Se o risco for ALTO, priorize segurança e ajuda imediata, mas mantenha a calma e o acolhimento.`;

  if (contexto && contexto.emocao) {
    systemInstruction += `\n\nContexto atual do usuário: Sentindo ${contexto.emocao} com intensidade ${contexto.intensidade}/10.`;
  }
  
  systemInstruction += `\n\nEstado de risco detectado: ${risco}`;

  try {
    const contents = historico.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));
    
    contents.push({
      role: "user",
      parts: [{ text: mensagemUsuario }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return { resposta: response.text || "Estou aqui com você...", risco };
  } catch (error) {
    console.error(error);
    return { resposta: "Algo deu errado, mas eu continuo aqui com você.", risco };
  }
}
