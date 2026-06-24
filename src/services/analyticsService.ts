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

const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string) || "G-G10JT9C99G";

// Inicializa o Google Analytics 4 (GA4) dinamicamente no navegador
export const initGA4 = () => {
  if (typeof window === "undefined") return;
  if ((window as any).gtag) return;

  try {
    // Adiciona a tag de script do Google Analytics dinamicamente
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Configura o dataLayer e o comando gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtagTemp = function(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    };
    (window as any).gtag = gtagTemp;

    (window as any).gtag("js", new Date());
    (window as any).gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: true,
      persist_values: true
    });

    console.log(`GA4: Inicializado com sucesso sob ID ${GA_MEASUREMENT_ID}`);
  } catch (error) {
    console.error("Erro ao inicializar o GA4:", error);
  }
};

// Envia dados de eventos para GA4 ou armazena offline se o usuário não possuir conectividade
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window === "undefined") return;

  const isOnline = navigator.onLine;
  const enrichedParams = {
    ...params,
    timestamp: new Date().toISOString(),
    is_offline: !isOnline
  };

  if (isOnline) {
    // Inicializa se necessário mas já envia de forma segura
    initGA4();
    const gtagFn = (window as any).gtag;
    if (typeof gtagFn === "function") {
      gtagFn("event", eventName, enrichedParams);
      console.log(`GA4 [Tracking Event]: ${eventName}`, enrichedParams);
    }
  } else {
    // Caso esteja offline, enfileira o evento no localStorage
    try {
      const stored = localStorage.getItem("senti_offline_analytics");
      const queue = stored ? JSON.parse(stored) : [];
      queue.push({ name: eventName, params: enrichedParams });
      localStorage.setItem("senti_offline_analytics", JSON.stringify(queue));
      console.log(`GA4 [Offline Buffered]: ${eventName}`, enrichedParams);
    } catch (e) {
      console.error("Erro ao armazenar em cache evento de análise offline:", e);
    }
  }
};

// Sincroniza e envia todos os eventos que foram salvos em cache enquanto o usuário esteve offline
export const flushOfflineEvents = () => {
  if (typeof window === "undefined") return;
  if (!navigator.onLine) return;

  try {
    const stored = localStorage.getItem("senti_offline_analytics");
    if (!stored) return;

    const queue = JSON.parse(stored);
    if (queue.length === 0) return;

    console.log(`GA4: Sincronizando ${queue.length} eventos pendentes do modo offline...`);
    initGA4();

    const gtagFn = (window as any).gtag;
    if (typeof gtagFn === "function") {
      for (const event of queue) {
        gtagFn("event", event.name, {
          ...event.params,
          offline_synced: true,
          synced_at: new Date().toISOString()
        });
      }
      localStorage.removeItem("senti_offline_analytics");
      console.log("GA4: Todos os eventos de buffer offline foram sincronizados.");
    }
  } catch (e) {
    console.error("Erro ao sincronizar eventos salvos do GA4 offline:", e);
  }
};

// Monitora e registra a frequência de retorno dos usuários à aplicação
export const trackUserReturn = (userId?: string) => {
  if (typeof window === "undefined") return;

  try {
    const now = Date.now();
    const lastVisitStr = localStorage.getItem("senti_last_visit");
    const visitCountStr = localStorage.getItem("senti_visit_count") || "0";

    let visitCount = parseInt(visitCountStr, 10);
    let daysSinceLastVisit = 0;

    if (lastVisitStr) {
      const lastVisit = parseInt(lastVisitStr, 10);
      const diffMs = now - lastVisit;
      daysSinceLastVisit = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Considera uma nova visita de retorno se o intervalo for maior que 15 minutos
      if (diffMs > 15 * 60 * 1000) {
        visitCount += 1;
        localStorage.setItem("senti_visit_count", visitCount.toString());

        trackEvent("user_return_session", {
          visit_number: visitCount,
          days_since_last_visit: daysSinceLastVisit,
          user_id: userId || "anonimo"
        });
      }
    } else {
      visitCount = 1;
      localStorage.setItem("senti_visit_count", "1");
      trackEvent("user_first_visit", {
        user_id: userId || "anonimo"
      });
    }

    localStorage.setItem("senti_last_visit", now.toString());
  } catch (e) {
    console.error("Erro ao registrar a frequência de visitas e retorno:", e);
  }
};
