import { getIARAResponse } from "./geminiService";
import { memoriaService, MemoriaIara } from "./memoriaService";
import { auth } from "./firebase";

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
    const userId = auth.currentUser?.uid;
    let memoriaIara: MemoriaIara | null = null;
    
    if (userId) {
      memoriaIara = await memoriaService.buscarMemoria(userId);
    }
    
    // Fallback to local storage if not logged in
    const memoriaLocal = localStorage.getItem("ultimaMensagem") || "Nenhuma conversa anterior.";
    localStorage.setItem("ultimaMensagem", mensagemUsuario);

    const result = await getIARAResponse(mensagemUsuario, historico, contexto, memoriaIara ? JSON.stringify(memoriaIara.perfil) : memoriaLocal);
    
    // Update memory if logged in
    if (userId) {
      await memoriaService.atualizarEmocao(userId, result.emocao, result.intensidade);
      
      // Detect pattern
      if (mensagemUsuario.toLowerCase().includes("ansioso") || mensagemUsuario.toLowerCase().includes("ansiedade")) {
        await memoriaService.atualizarPadrao(userId, "ansiedade recorrente");
      } else if (mensagemUsuario.toLowerCase().includes("triste") || mensagemUsuario.toLowerCase().includes("depressão")) {
        await memoriaService.atualizarPadrao(userId, "tristeza frequente");
      }
    }

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
