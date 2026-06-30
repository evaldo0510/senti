// src/core/policies/escalationRules.ts
import { UserContext, RiskLevel } from "../types";

export interface EscalationAssessment {
  escalate: boolean;
  riskLevel: RiskLevel;
  reason: string;
  suggestedAction: string;
}

export class EscalationRules {
  /**
   * Assesses if a clinical safety escalation to human professionals is required.
   */
  static assess(context: UserContext): EscalationAssessment {
    const message = context.currentMessage.toLowerCase();
    
    // Hard trigger words for suicide, self-harm, or active life threat
    const criticalCrisisKeywords = [
      "suicidio", "suicídio", "quero morrer", "me matar", "tirar minha vida",
      "autolesao", "autolesão", "me cortar", "acabar com tudo", "desisto de viver",
      "morrer hoje", "pular da ponte"
    ];

    for (const keyword of criticalCrisisKeywords) {
      if (message.includes(keyword)) {
        return {
          escalate: true,
          riskLevel: "alto",
          reason: `Detecção de palavra-chave crítica de segurança emocional: "${keyword}"`,
          suggestedAction: "Ativar Protocolo SOS e exibir imediatamente recursos de crise humana (CrisisResources)."
        };
      }
    }

    // Medium triggers for high anxiety, panic, or persistent lower-level distress
    const moderateCrisisKeywords = [
      "panico", "pânico", "crise de ansiedade", "não consigo respirar", "socorro",
      "desesperado", "me ajuda por favor", "muita dor no peito", "medo extremo"
    ];

    for (const keyword of moderateCrisisKeywords) {
      if (message.includes(keyword)) {
        return {
          escalate: true,
          riskLevel: "medio",
          reason: `Sinais de crise aguda ou pânico: "${keyword}"`,
          suggestedAction: "Apresentar exercício de regulação imediata (Aterramento 5-4-3-2-1) e recomendar atendimento síncrono."
        };
      }
    }

    // Check recent mood history for severe clinical decline (e.g. consistently low score)
    if (context.recentMoods.length >= 3) {
      const recentScores = context.recentMoods.slice(0, 3).map(m => m.value);
      const averageMood = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      
      if (averageMood <= 2.5) {
        return {
          escalate: true,
          riskLevel: "medio",
          reason: "Declínio persistente de humor (média recente de sentimentos extremamente baixos).",
          suggestedAction: "Sugerir delicadamente matchmaking com profissional multidisciplinar e agendamento preventivo."
        };
      }
    }

    return {
      escalate: false,
      riskLevel: "baixo",
      reason: "Nenhum sinal ativo de crise identificado no input de entrada.",
      suggestedAction: "Manter o acolhimento padrão pela assistente virtual IARA."
    };
  }
}
