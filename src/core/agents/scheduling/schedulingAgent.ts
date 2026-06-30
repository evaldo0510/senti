// src/core/agents/scheduling/schedulingAgent.ts
import { SentiCoreAgent, UserContext, AgentDecision } from "../../types";

export class SchedulingAgent implements SentiCoreAgent {
  agentId = "scheduling";

  async process(context: UserContext): Promise<AgentDecision> {
    const message = context.currentMessage.toLowerCase();
    let confidence = 0.2;
    const recommendations: Record<string, any> = {};

    // Detect direct intent to book or view calendars
    if (
      message.includes("agendar") ||
      message.includes("marcar") ||
      message.includes("sessao") ||
      message.includes("consulta") ||
      message.includes("horario")
    ) {
      confidence = 0.9;
      recommendations.triggerBookingDialog = true;
    }

    // Match specialized professional queries
    if (message.includes("psicologo") || message.includes("terapeuta") || message.includes("psicanalista")) {
      confidence = Math.max(confidence, 0.75);
      recommendations.filterTherapistView = true;
      if (message.includes("infantil")) {
        recommendations.specialtyFilter = "Infantil";
      } else if (message.includes("casal")) {
        recommendations.specialtyFilter = "Casal";
      } else {
        recommendations.specialtyFilter = "Psicólogo Clínico";
      }
    }

    return {
      agentId: this.agentId,
      confidence,
      recommendations,
      logSummary: "SchedulingAgent mapeou intenções de consulta e agendas síncronas."
    };
  }
}
