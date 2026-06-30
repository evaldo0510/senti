// src/core/policies/routingRules.ts
import { UserContext } from "../types";

export interface RoutingScore {
  agentId: string;
  score: number; // 0 to 1
}

export class RoutingRules {
  /**
   * Evaluates which sub-agents are most appropriate for the current message.
   */
  static evaluate(context: UserContext): RoutingScore[] {
    const message = context.currentMessage.toLowerCase();
    const scores: RoutingScore[] = [
      { agentId: "onboarding", score: 0.1 },
      { agentId: "journey", score: 0.2 },
      { agentId: "diary", score: 0.2 },
      { agentId: "scheduling", score: 0.1 },
      { agentId: "referral", score: 0.1 },
      { agentId: "marketplace", score: 0.1 },
      { agentId: "notifications", score: 0.1 }
    ];

    // Scheduling triggers
    if (
      message.includes("agendar") ||
      message.includes("consulta") ||
      message.includes("marcar") ||
      message.includes("horario") ||
      message.includes("sessao") ||
      message.includes("terapeuta") ||
      message.includes("psicologo")
    ) {
      this.boost(scores, "scheduling", 0.8);
      this.boost(scores, "referral", 0.6);
    }

    // Diary/Emotional state triggers
    if (
      message.includes("diario") ||
      message.includes("escrever") ||
      message.includes("sentindo") ||
      message.includes("hoje eu") ||
      message.includes("triste") ||
      message.includes("feliz") ||
      message.includes("ansioso") ||
      message.includes("raiva")
    ) {
      this.boost(scores, "diary", 0.9);
      this.boost(scores, "journey", 0.5);
    }

    // Onboarding triggers (new user context or greeting)
    if (
      message.includes("ola") ||
      message.includes("oi") ||
      message.includes("bom dia") ||
      message.includes("boa tarde") ||
      message.includes("como funciona") ||
      message.includes("primeira vez") ||
      message.includes("onboarding")
    ) {
      this.boost(scores, "onboarding", 0.9);
    }

    // Library/Marketplace content triggers
    if (
      message.includes("meditar") ||
      message.includes("meditacao") ||
      message.includes("ler") ||
      message.includes("poesia") ||
      message.includes("musica") ||
      message.includes("audio") ||
      message.includes("biblioteca") ||
      message.includes("reset")
    ) {
      this.boost(scores, "marketplace", 0.9);
    }

    // Crisis or high risk keywords (Escalation / Referral)
    if (
      message.includes("morrer") ||
      message.includes("suicidio") ||
      message.includes("desespero") ||
      message.includes("socorro") ||
      message.includes("urgente") ||
      message.includes("panico") ||
      message.includes("crise") ||
      message.includes("machucar") ||
      message.includes("cortar")
    ) {
      this.boost(scores, "referral", 0.95);
      this.boost(scores, "notifications", 0.8);
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  private static boost(scores: RoutingScore[], agentId: string, amount: number) {
    const item = scores.find((s) => s.agentId === agentId);
    if (item) {
      item.score = Math.min(1.0, item.score + amount);
    }
  }
}
