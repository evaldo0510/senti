import { getIARAResponse } from "./geminiService";

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface IaraResponse {
  resposta: string;
  risco: "normal" | "alto";
}

export async function falarComIARA(
  mensagemUsuario: string,
  historico: ChatMessage[] = [],
  contexto?: { emocao: string; intensidade: number }
): Promise<IaraResponse> {
  try {
    const memoria = localStorage.getItem("ultimaMensagem") || "Nenhuma conversa anterior.";
    localStorage.setItem("ultimaMensagem", mensagemUsuario);

    const result = await getIARAResponse(mensagemUsuario, historico, contexto, memoria);
    
    return {
      resposta: result.text,
      risco: result.risk as "normal" | "alto"
    };
  } catch (error) {
    console.error("Error calling IARA service:", error);
    return { resposta: "Algo deu errado, mas eu continuo aqui com você.", risco: "normal" };
  }
}
