import { getIARAResponse } from "./geminiService";

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface IaraResponse {
  resposta: string;
  emocao: string;
  intensidade: number;
  sugerirRespiracao: boolean;
  direcionarEspecialista: boolean;
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
      emocao: result.emocao,
      intensidade: result.intensidade,
      sugerirRespiracao: result.sugerirRespiracao,
      direcionarEspecialista: result.direcionarEspecialista,
      risco: result.risk as "normal" | "alto"
    };
  } catch (error) {
    console.error("Error calling IARA service:", error);
    return { 
      resposta: "Algo deu errado, mas eu continuo aqui com você.", 
      emocao: "calma",
      intensidade: 5,
      sugerirRespiracao: false,
      direcionarEspecialista: false,
      risco: "normal" 
    };
  }
}
