// src/core/agents/referral/referralAgent.ts
import { SentiCoreAgent, UserContext, AgentDecision } from "../../types";

export class ReferralAgent implements SentiCoreAgent {
  agentId = "referral";

  async process(context: UserContext): Promise<AgentDecision> {
    const message = context.currentMessage.toLowerCase();
    let confidence = 0.25;
    const recommendations: Record<string, any> = {};

    // Explicit requests for human doctors or therapists
    const wantsHuman = 
      message.includes("preciso de um profissional") ||
      message.includes("falar com psicologo") ||
      message.includes("terapeuta humano") ||
      message.includes("atendimento real") ||
      message.includes("falar com alguem");

    if (wantsHuman) {
      confidence = 0.95;
    }

    // Match specialized clinican types based on key terms
    let proposedSpecialties: string[] = ["Psicólogo Clínico"];
    let referralReason = "Apoio e acolhimento contínuo para autoconhecimento.";

    if (message.includes("ansiedade") || message.includes("panico") || message.includes("medo")) {
      proposedSpecialties = ["Psicólogo Clínico", "Terapeuta Cognitivo"];
      referralReason = "Regulação de episódios ansiosos e pânico agudo.";
    } else if (message.includes("casamento") || message.includes("relacionamento") || message.includes("briga")) {
      proposedSpecialties = ["Terapeuta de Casal e Família"];
      referralReason = "Mediação de dinâmicas familiares e afetivas.";
    } else if (message.includes("filho") || message.includes("criança") || message.includes("escola")) {
      proposedSpecialties = ["Psicopedagogo", "Psicólogo Infantil"];
      referralReason = "Suporte ao desenvolvimento infanto-juvenil.";
    } else if (message.includes("comida") || message.includes("peso") || message.includes("comer")) {
      proposedSpecialties = ["Nutricionista"];
      referralReason = "Reorganização do comportamento e bem-estar alimentar.";
    }

    recommendations.indicar_profissional = wantsHuman || message.includes("ansiedade") || message.includes("panico") || message.includes("medo") || message.includes("preciso");
    recommendations.tipo_profissional = proposedSpecialties;
    recommendations.razao = referralReason;

    return {
      agentId: this.agentId,
      confidence,
      recommendations,
      logSummary: `ReferralAgent estabeleceu pareamento clínico com: ${proposedSpecialties.join(", ")}.`
    };
  }
}
