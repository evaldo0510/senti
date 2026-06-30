// src/core/policies/subscriptionEngine.ts
import { UserProfile } from "../../types";

export type PlanId = 
  | "trial" 
  | "free"
  | "premium" 
  | "plus_familia"
  | "professional_inicial" 
  | "professional_pro" 
  | "clinica"
  | "empresa" 
  | "universidade" 
  | "prefeitura";

export type FeatureId =
  | "iara_text"
  | "iara_live_voice"
  | "premium_programs"
  | "premium_library"
  | "meu_jardim_completo"
  | "evolution_reports"
  | "unlimited_iara_messages"
  | "public_profile_crp"
  | "scheduling_system"
  | "google_calendar_sync"
  | "clinical_notes_patient_evolution"
  | "admin_team_management"
  | "aggregated_indicators_dashboard"
  | "custom_wellness_campaigns";

export interface FeatureAccess {
  allowed: boolean;
  reason: string;
  limit?: number; // e.g., daily or total message limits
}

export class SubscriptionEngine {
  /**
   * Helper to normalize dynamic profile configurations into standard subscription categories
   */
  static getPlan(profile: Partial<UserProfile> | null | undefined): PlanId {
    if (!profile) return "free";

    // If tenantId is specified, user is bound to an organization which functions as an Enterprise plan
    if (profile.tenantId && profile.tenantId !== "B2C") {
      if (profile.tipo === "prefeitura") return "prefeitura";
      if (profile.tipo === "empresa") return "empresa";
      if (profile.tipo === "hospital" || profile.tipo === "clinica") return "clinica";
      return "empresa";
    }

    // Rely on explicit profile values
    const plan = profile.subscriptionPlan;
    const status = profile.subscriptionStatus;

    if (status === "expired" || status === "cancelled") {
      return "free";
    }

    if (plan === "premium") return "premium";
    if (plan === "professional") return "professional_pro";
    if (plan === "enterprise") return "empresa";
    if (plan === "trial") return "trial";

    // Fallback based on profile type
    if (profile.tipo === "terapeuta") return "professional_inicial";
    if (profile.tipo === "admin" || profile.tipo === "super_admin") return "professional_pro";

    return "free";
  }

  /**
   * Resolves whether a specific user can access a feature based on their current plan
   */
  static canAccess(profile: Partial<UserProfile> | null | undefined, feature: FeatureId): FeatureAccess {
    const plan = this.getPlan(profile);
    const isPremiumActive = profile?.subscriptionStatus === "active" || profile?.subscriptionStatus === "trial";

    switch (feature) {
      case "iara_text":
        return { allowed: true, reason: "Acesso ao acolhimento via texto é liberado para todos os seres humanos." };

      case "unlimited_iara_messages":
        if (plan === "premium" || plan === "plus_familia" || plan === "professional_pro" || plan === "clinica" || plan === "empresa" || plan === "universidade" || plan === "prefeitura") {
          return { allowed: true, reason: "Mensagens de acolhimento ilimitadas ativas em seu plano." };
        }
        return { 
          allowed: false, 
          reason: "Limite de 20 mensagens diárias ativas no plano gratuito. Adquira o Plano Premium para conversar sem restrições.", 
          limit: 20 
        };

      case "iara_live_voice":
        if ((plan === "premium" || plan === "plus_familia" || plan === "professional_pro" || plan === "clinica" || plan === "empresa" || plan === "universidade" || plan === "prefeitura") && isPremiumActive) {
          return { allowed: true, reason: "Canal de conversação por voz Google Live API liberado." };
        }
        return { 
          allowed: false, 
          reason: "O canal IARA de Voz em Tempo Real (Google Live) requer uma assinatura Premium ativa." 
        };

      case "premium_programs":
      case "premium_library":
      case "meu_jardim_completo":
      case "evolution_reports":
        if ((plan === "premium" || plan === "plus_familia" || plan === "professional_pro" || plan === "clinica" || plan === "empresa" || plan === "universidade" || plan === "prefeitura") && isPremiumActive) {
          return { allowed: true, reason: "Recurso liberado no seu plano de autocuidado contínuo." };
        }
        return { 
          allowed: false, 
          reason: "Este recurso faz parte do pacote Premium. Faça o upgrade para expandir seu acompanhamento." 
        };

      case "public_profile_crp":
        if (profile?.tipo === "terapeuta" || plan === "professional_inicial" || plan === "professional_pro" || plan === "clinica") {
          return { allowed: true, reason: "Profissional credenciado qualificado para a rede SentiPae." };
        }
        return { allowed: false, reason: "Seu perfil de usuário não possui prerrogativas profissionais para credenciamento." };

      case "scheduling_system":
        if (plan === "professional_inicial" || plan === "professional_pro" || plan === "clinica") {
          return { allowed: true, reason: "Sistema de marcação de consultas integrado ativo." };
        }
        return { allowed: false, reason: "Marcação de sessões restrita a perfis profissionais habilitados." };

      case "google_calendar_sync":
      case "clinical_notes_patient_evolution":
        if (plan === "professional_pro" || plan === "clinica") {
          return { allowed: true, reason: "Recurso profissional completo habilitado." };
        }
        return { 
          allowed: false, 
          reason: "Sincronização com Google Calendar e anotações clínicas privadas requerem assinatura do plano Profissional Pro." 
        };

      case "admin_team_management":
        if (plan === "clinica" || profile?.tipo === "admin" || profile?.tipo === "super_admin") {
          return { allowed: true, reason: "Gerenciamento corporativo de múltiplos profissionais liberado." };
        }
        return { allowed: false, reason: "Exclusivo para coordenadores de clínicas ou administradores de sistemas." };

      case "aggregated_indicators_dashboard":
        if (plan === "empresa" || plan === "universidade" || plan === "prefeitura" || plan === "clinica" || profile?.tipo === "admin" || profile?.tipo === "super_admin") {
          return { allowed: true, reason: "Painel estratégico de monitoramento populacional liberado." };
        }
        return { allowed: false, reason: "Indicadores populacionais exclusivos de planos institucionais (B2B)." };

      case "custom_wellness_campaigns":
        if (plan === "empresa" || plan === "universidade" || plan === "prefeitura") {
          return { allowed: true, reason: "Campanhas corporativas preventivas autorizadas." };
        }
        return { allowed: false, reason: "Criação de campanhas disponível exclusivamente para instituições parceiras." };

      default:
        return { allowed: false, reason: "Funcionalidade não mapeada." };
    }
  }

  /**
   * Generates analytical business telemetry metrics for simulated cost-margin financial board
   */
  static getFinanceDashboardMetrics(activeUsersCount: number) {
    const activePremiumCount = Math.round(activeUsersCount * 0.18); // ~18% conversion rate
    const activeProCount = Math.round(activeUsersCount * 0.05); // ~5% therapists
    const activeEnterpriseUsers = Math.round(activeUsersCount * 0.45); // ~45% corporate contracts
    
    const premiumMRR = activePremiumCount * 39.90;
    const proMRR = activeProCount * 99.90;
    const enterpriseMRR = activeEnterpriseUsers * 15.00; // Average R$15/seat
    const totalMRR = premiumMRR + proMRR + enterpriseMRR;

    // AI usage cost metrics: Avg tokens / prompts costs
    const iaraCostPerUser = 1.12; // Average cost of Gemini API calls per active user monthly
    const totalAICosts = activeUsersCount * iaraCostPerUser;
    const infrastructureCosts = 450.00; // Cloud Run + Firestore
    const netProfit = totalMRR - totalAICosts - infrastructureCosts;
    const marginPercent = totalMRR > 0 ? (netProfit / totalMRR) * 100 : 0;

    return {
      activePremiumCount,
      activeProCount,
      activeEnterpriseUsers,
      premiumMRR,
      proMRR,
      enterpriseMRR,
      totalMRR,
      totalAICosts,
      infrastructureCosts,
      netProfit,
      marginPercent
    };
  }
}
