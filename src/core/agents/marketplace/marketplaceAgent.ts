// src/core/agents/marketplace/marketplaceAgent.ts
import { SentiCoreAgent, UserContext, AgentDecision } from "../../types";

export class MarketplaceAgent implements SentiCoreAgent {
  agentId = "marketplace";

  async process(context: UserContext): Promise<AgentDecision> {
    const message = context.currentMessage.toLowerCase();
    let confidence = 0.3;
    const recommendations: Record<string, any> = {};

    // Match topics to content recommendations in the library
    let recommendedContent: string[] = ["Prática de Atenção Plena Básica"];
    let reason = "Introdução amigável à meditação guiada.";

    if (message.includes("ansiedade") || message.includes("nervoso") || message.includes("preocupado")) {
      recommendedContent = ["Meditação: Alívio Rápido da Ansiedade", "Poesia Hipnótica: Ancoragem de Paz"];
      reason = "Acalmar as ondas de preocupação e desacelerar pensamentos acelerados.";
      confidence = 0.85;
    } else if (message.includes("sono") || message.includes("dormir") || message.includes("noite")) {
      recommendedContent = ["PCH: Indução ao Sono Profundo", "Audio: Chuva com Ruído Branco"];
      reason = "Apoiar a transição para um sono reparador.";
      confidence = 0.85;
    } else if (message.includes("foco") || message.includes("trabalho") || message.includes("estudar")) {
      recommendedContent = ["Som: Ondas Binaurais para Foco Ativo", "Prática: Reset Mental de 5 minutos"];
      reason = "Facilitar o engajamento cognitivo estável.";
      confidence = 0.7;
    }

    recommendations.recomendar_conteudo = confidence >= 0.6;
    recommendations.ids_conteudo = recommendedContent;
    recommendations.razao = reason;

    return {
      agentId: this.agentId,
      confidence,
      recommendations,
      logSummary: `MarketplaceAgent selecionou conteúdos: ${recommendedContent.join(", ")}.`
    };
  }
}
