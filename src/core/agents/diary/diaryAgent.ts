// src/core/agents/diary/diaryAgent.ts
import { SentiCoreAgent, UserContext, AgentDecision } from "../../types";

export class DiaryAgent implements SentiCoreAgent {
  agentId = "diary";

  async process(context: UserContext): Promise<AgentDecision> {
    const message = context.currentMessage.toLowerCase();
    let confidence = 0.3;
    const recommendations: Record<string, any> = {};

    // Check if user is proactively recording a diary or sharing feelings
    if (
      message.includes("diario") ||
      message.includes("escrever") ||
      message.includes("sinto que") ||
      message.includes("estou me sentindo") ||
      message.includes("hoje meu dia")
    ) {
      confidence = 0.85;
    }

    // Keyword sentiment mapping & cognitive themes
    const themes: string[] = [];
    if (message.includes("cansado") || message.includes("exausto") || message.includes("trabalho")) {
      themes.push("estresse_laboral_ou_fadiga");
    }
    if (message.includes("dormir") || message.includes("sono") || message.includes("insonia")) {
      themes.push("ciclo_do_sono_desregulado");
    }
    if (message.includes("sozinho") || message.includes("solitude") || message.includes("vazio")) {
      themes.push("sentimento_de_solidao");
    }

    recommendations.identifiedThemes = themes;
    recommendations.saveToDiary = confidence >= 0.7;

    return {
      agentId: this.agentId,
      confidence,
      recommendations,
      logSummary: `DiaryAgent identificou temas de reflexão: ${themes.join(", ") || "nenhum tema agudo"}.`
    };
  }
}
