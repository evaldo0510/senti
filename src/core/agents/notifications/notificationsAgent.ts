// src/core/agents/notifications/notificationsAgent.ts
import { SentiCoreAgent, UserContext, AgentDecision } from "../../types";

export class NotificationsAgent implements SentiCoreAgent {
  agentId = "notifications";

  async process(context: UserContext): Promise<AgentDecision> {
    const message = context.currentMessage.toLowerCase();
    let confidence = 0.2;
    const recommendations: Record<string, any> = {};

    // Detect if safety alerts are triggered - immediately dispatching critical alarms
    const isCrisis =
      message.includes("morrer") ||
      message.includes("suicidio") ||
      message.includes("suicídio") ||
      message.includes("me matar");

    if (isCrisis) {
      confidence = 0.95;
      recommendations.sendUrgentPush = true;
      recommendations.notificationTitle = "Acolhimento Ativo Acionado 🛡️";
      recommendations.notificationBody = "Estamos aqui com você. Acesse o suporte imediato ou fale com um especialista.";
    }

    // Trigger standard diary reminder flag if user hasn't recorded recent entries
    if (context.recentMoods.length === 0) {
      recommendations.suggestDiaryReminder = true;
    }

    return {
      agentId: this.agentId,
      confidence,
      recommendations,
      logSummary: "NotificationsAgent validou o status de alertas urgentes e lembretes táticos."
    };
  }
}
