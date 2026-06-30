import { db } from "./firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { UserProfile } from "../types";

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "SentiPae Gratuito",
    price: 0,
    period: "monthly",
    features: [
      "Cadastro e perfil completo na plataforma",
      "Acolhimento com a IARA (Texto com limite diário)",
      "Diário emocional básico de sentimentos",
      "Conteúdos e pílulas de bem-estar gratuitos",
      "Jornada inicial de acolhimento tático"
    ]
  },
  premium: {
    id: "premium",
    name: "SentiPae Premium",
    price: 39.90,
    period: "monthly",
    features: [
      "Conversas ilimitadas com a IARA AI via texto",
      "IARA de Voz em Tempo Real (Google Live)",
      "Programas terapêuticos completos",
      "Biblioteca Premium e pílulas de PCH ilimitadas",
      "Meu Jardim completo com evolução gamificada",
      "Relatórios de evolução profundos com gráficos de humor"
    ]
  },
  plus_familia: {
    id: "plus_familia",
    name: "SentiPae Plus Família",
    price: 79.90,
    period: "monthly",
    features: [
      "Até 4 perfis familiares independentes",
      "Todas as funcionalidades do plano Premium para cada perfil",
      "Acompanhamento e evolução familiar agregada",
      "Jornadas de cuidado compartilhadas",
      "Conteúdos exclusivos voltados para dinâmica familiar"
    ]
  },
  professional_inicial: {
    id: "professional_inicial",
    name: "Profissional Inicial",
    price: 0,
    period: "monthly",
    features: [
      "Perfil público profissional na rede SentiPae",
      "Agenda de atendimentos básica",
      "Presença de destaque na busca por especialistas",
      "Gestão básica de consultas e pacientes"
    ]
  },
  professional: {
    id: "professional",
    name: "Profissional Pro",
    price: 99.90,
    period: "monthly",
    features: [
      "Agenda avançada com sincronização automática do Google Calendar",
      "Teleatendimento por videoconferência encriptada de ponta a ponta",
      "Ferramentas completas de acompanhamento clínico",
      "Evolução e prontuário encriptado de pacientes",
      "Relatórios administrativos automatizados",
      "IA de apoio administrativo e resumos clínicos"
    ]
  },
  clinica: {
    id: "clinica",
    name: "Clínica",
    price: 299.90,
    period: "monthly",
    features: [
      "Gestão de múltiplos profissionais credenciados",
      "Painel administrativo integrado para a clínica",
      "Agenda centralizada da equipe multidisciplinar",
      "Indicadores de produtividade e faturamento centralizados",
      "Relatórios clínicos unificados"
    ]
  },
  empresa: {
    id: "empresa",
    name: "Empresas",
    price: 15.00,
    period: "colaborador",
    features: [
      "Preço sob medida por colaborador ativo",
      "Programas personalizados de saúde e bem-estar",
      "Dashboard institucional exclusivo (Multitenant)",
      "Indicadores agregados 100% anônimos (LGPD)",
      "Campanhas customizadas de bem-estar emocional"
    ]
  },
  universidade: {
    id: "universidade",
    name: "Universidades",
    price: 10.00,
    period: "estudante",
    features: [
      "Acolhimento especial para estudantes e professores",
      "Programas focados em prevenção acadêmica e burnout",
      "Dashboard institucional com monitoramento de clima",
      "Relatórios de satisfação e engajamento anônimos"
    ]
  },
  prefeitura: {
    id: "prefeitura",
    name: "Prefeituras",
    price: 0, // Contrato público
    period: "contrato",
    features: [
      "Contrato institucional de saúde pública",
      "Acolhimento da população de saúde, educação e social",
      "Relatórios demográficos detalhados de saúde mental",
      "Programas de prevenção e triagem preventiva integrada"
    ]
  }
};

export interface PaymentService {
  getPublicKeys: () => { stripe: string; mercadoPago: string };
  hasPremiumAccess: (profile: UserProfile | null) => boolean;
  checkoutStripe: (userId: string, planId: string, isDemo?: boolean) => Promise<{ url: string; isSimulated: boolean }>;
  checkoutMercadoPago: (userId: string, planId: string, isDemo?: boolean) => Promise<{ url: string; isSimulated: boolean }>;
  activateSubscription: (userId: string, planId: string, provider: "stripe" | "mercadopago", subId?: string) => Promise<any>;
  cancelSubscription: (userId: string) => Promise<any>;
  createCheckoutSession: (
    appointmentId: string,
    therapistId: string,
    therapistName: string,
    price: number,
    time: string,
    date: string,
    discountPercentage?: number
  ) => Promise<any>;
  createJourneyCheckoutSession: (userId: string, userEmail: string) => Promise<any>;
  createSubscriptionCheckoutSession: (
    userId: string,
    userEmail: string,
    plan: string,
    provider: string
  ) => Promise<any>;
}

export const paymentService: PaymentService = {
  /**
   * Obtém as chaves públicas configuradas em ambiente de forma segura.
   */
  getPublicKeys: () => {
    return {
      stripe: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
      mercadoPago: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || ""
    };
  },

  /**
   * Verifica se o usuário tem acesso às funcionalidades Premium.
   * Retorna true se estiver ativo ou em período de teste (trial) não expirado.
   */
  hasPremiumAccess: (profile: UserProfile | null): boolean => {
    if (!profile) return false;
    
    // Admins e Super Admins sempre têm acesso irrestrito
    if (profile.tipo === "admin" || profile.tipo === "super_admin") {
      return true;
    }

    const status = profile.subscriptionStatus || "trial";
    const plan = profile.subscriptionPlan || "trial";

    // Se a assinatura está explicitamente ativa
    if (status === "active") {
      return true;
    }

    // Se está em período experimental (trial)
    if (status === "trial" && plan === "trial") {
      if (!profile.trialEndDate) return true; // Se não tem data final por algum motivo, assume válido
      const endDate = new Date(profile.trialEndDate);
      return endDate > new Date(); // Válido se o fim do trial for maior que agora
    }

    return false;
  },

  /**
   * Simula ou redireciona para a tela de checkout do Stripe.
   */
  checkoutStripe: async (userId: string, planId: keyof typeof PLANS, isDemo: boolean = true) => {
    const plan = PLANS[planId];
    if (!plan) throw new Error("Plano inválido");

    const publicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publicKey || isDemo) {
      // Simulação de checkout para fins de teste/estética na sandbox do AI Studio
      return {
        url: `/checkout/simulated?provider=stripe&userId=${userId}&planId=${planId}&price=${plan.price}`,
        isSimulated: true
      };
    }

    // Código de inicialização real do Stripe Checkout (deve ser roteado para o backend `/api/stripe` para criar a session)
    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planId })
      });
      if (!response.ok) throw new Error("Erro ao criar sessão de checkout");
      const session = await response.json();
      return { url: session.url, isSimulated: false };
    } catch (e) {
      console.warn("Falha ao integrar com backend real, usando checkout simulado:", e);
      return {
        url: `/checkout/simulated?provider=stripe&userId=${userId}&planId=${planId}&price=${plan.price}`,
        isSimulated: true
      };
    }
  },

  /**
   * Simula ou redireciona para o checkout do Mercado Pago.
   */
  checkoutMercadoPago: async (userId: string, planId: keyof typeof PLANS, isDemo: boolean = true) => {
    const plan = PLANS[planId];
    if (!plan) throw new Error("Plano inválido");

    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

    if (!publicKey || isDemo) {
      return {
        url: `/checkout/simulated?provider=mercadopago&userId=${userId}&planId=${planId}&price=${plan.price}`,
        isSimulated: true
      };
    }

    try {
      const response = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planId })
      });
      if (!response.ok) throw new Error("Erro ao criar preferência de pagamento");
      const preference = await response.json();
      return { url: preference.init_point, isSimulated: false };
    } catch (e) {
      console.warn("Falha ao integrar Mercado Pago real, usando checkout simulado:", e);
      return {
        url: `/checkout/simulated?provider=mercadopago&userId=${userId}&planId=${planId}&price=${plan.price}`,
        isSimulated: true
      };
    }
  },

  /**
   * Ativa a assinatura do usuário após confirmação de pagamento.
   */
  activateSubscription: async (
    userId: string, 
    planId: "premium" | "professional" | "enterprise", 
    provider: "stripe" | "mercadopago",
    subId: string = ""
  ) => {
    const userRef = doc(db, "users", userId);
    const now = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const subscriptionData = {
      subscriptionStatus: "active" as const,
      subscriptionPlan: planId,
      paymentProvider: provider,
      subscriptionId: subId || `SUB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      lastPayment: now.toISOString(),
      nextBilling: nextBillingDate.toISOString()
    };

    await updateDoc(userRef, subscriptionData);
    return subscriptionData;
  },

  /**
   * Cancela ou expira uma assinatura existente.
   */
  cancelSubscription: async (userId: string) => {
    const userRef = doc(db, "users", userId);
    const subscriptionData = {
      subscriptionStatus: "cancelled" as const,
      nextBilling: ""
    };
    await updateDoc(userRef, subscriptionData);
    return subscriptionData;
  },

  /**
   * Cria uma sessão de checkout para agendamento de consulta.
   */
  createCheckoutSession: async (
    appointmentId: string,
    therapistId: string,
    therapistName: string,
    price: number,
    time: string,
    date: string,
    discountPercentage: number = 0
  ) => {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId,
        therapistId,
        therapistName,
        price,
        time,
        date,
        discountPercentage
      })
    });
    if (!response.ok) throw new Error("Erro ao criar sessão de checkout");
    return response.json();
  },

  /**
   * Cria uma sessão de checkout para a jornada de 21 dias.
   */
  createJourneyCheckoutSession: async (userId: string, userEmail: string) => {
    const response = await fetch("/api/create-journey-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userEmail })
    });
    if (!response.ok) throw new Error("Erro ao criar sessão de checkout da jornada");
    return response.json();
  },

  /**
   * Cria uma sessão de checkout de assinatura recorrente.
   */
  createSubscriptionCheckoutSession: async (
    userId: string,
    userEmail: string,
    plan: string,
    provider: string
  ) => {
    const response = await fetch("/api/create-subscription-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userEmail, plan, provider })
    });
    if (!response.ok) throw new Error("Erro ao criar checkout de assinatura");
    return response.json();
  }
};
