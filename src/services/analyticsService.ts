export const salvarDadosAnalytics = async (dados: {
  usuario?: string;
  humor?: number;
  risco?: string;
  atendimento?: string;
  tipo?: string;
}) => {
  const url = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  
  if (!url) {
    console.warn("VITE_GOOGLE_SCRIPT_URL não está configurada. Os dados não foram enviados para o Google Sheets.");
    return;
  }

  try {
    const payload = {
      Data: new Date().toLocaleDateString('pt-BR'),
      Usuario: dados.usuario || 'Anônimo',
      Humor: dados.humor || 0,
      Risco: dados.risco || 'não avaliado',
      Atendimento: dados.atendimento || 'não',
      Tipo: dados.tipo || 'app'
    };

    await fetch(url, {
      method: "POST",
      mode: "no-cors", // Permite enviar a requisição sem problemas de CORS no navegador
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    
    console.log("Dados enviados para o Looker Studio (Google Sheets) com sucesso.");
  } catch (error) {
    console.error("Erro ao enviar dados para analytics:", error);
  }
};
