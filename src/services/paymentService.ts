import { db } from "./firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { UserProfile } from "../types";

export interface Plan {
  id: "trial" | "premium" | "professional" | "enterprise";
  name: string;
  price: number;
  period: "7_days" | "15_days" | "monthly";
  features: string[];
}

export const PLANS: Record<string, Plan> = {
  trial: {
    id: "trial",
    name: "Período Gratuito (7 Dias de Teste)",
    price: 0,
    period: "7_days",
    features: [
      "Período de 7 dias de experimentação",
      "Até 20 conversas com a IA (IARA) no total",
      "Diário emocional totalmente liberado",
      "Acesso completo a conteúdos básicos",
      "Busca e contato com terapeutas autorizados",
      "Agendamento de consultas permitido"
    ]
  },
  premium: {
    id: "premium",
    name: "Plano Premium",
    price: 39.90,
    period: "monthly",
    features: [
      "IA (IARA) totalmente ilimitada e de alta velocidade",
      "Diário completo de humor com gráficos de evolução",
      "Conteúdos avançados e pílulas exclusivas",
      "Exercícios respiratórios guiados ilimitados",
      "Histórico completo sem limitação de tempo",
      "Relatórios de inteligência de humor prontos para exportar"
    ]
  },
  professional: {
    id: "professional",
    name: "Plano Profissional (Terapeuta)",
    price: 99.90,
    period: "monthly",
    features: [
      "Destaque profissional nas buscas",
      "Agenda de consultas automatizada",
      "Acompanhamento clínico de múltiplos pacientes",
      "Sala de videoconferência integrada e criptografada",
      "Perfil público profissional otimizado",
      "Dashboard de faturamento e produtividade"
    ]
  },
  enterprise: {
    id: "enterprise",
    name: "Plano Institucional (Órgãos Públicos & Empresas)",
    price: 499.90,
    period: "monthly",
    features: [
      "Para Prefeituras, Secretarias de Saúde/Educação, Clínicas e Empresas",
      "Painel administrativo institucional exclusivo (Multitenant)",
      "Gestão e credenciamento de profissionais e usuários vinculados",
      "Dashboard institucional com indicadores agregados (100% anônimos)",
      "Gestão ativa de campanhas de bem-estar emocional",
      "Biblioteca de conteúdos exclusiva e suporte técnico prioritário",
      "Precificação escalável por lotes: Até 100, 500 ou 1000 usuários"
    ]
  }
};

export interface PaymentService {
  getPublicKeys: () => { stripe: string; mercadoPago: string };
  hasPremiumAccess: (profile: UserProfile | null) => boolean;
  checkoutStripe: (userId: string, planId: "premium" | "professional" | "enterprise", isDemo?: boolean) => Promise<{ url: string; isSimulated: boolean }>;
  checkoutMercadoPago: (userId: string, planId: "premium" | "professional" | "enterprise", isDemo?: boolean) => Promise<{ url: string; isSimulated: boolean }>;
  activateSubscription: (userId: string, planId: "premium" | "professional" | "enterprise", provider: "stripe" | "mercadopago", subId?: string) => Promise<any>;
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
