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

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mensagemUsuario,
        historico,
        contexto,
        memoria
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling /api/chat:", error);
    return { resposta: "Algo deu errado, mas eu continuo aqui com você.", risco: "normal" };
  }
}
