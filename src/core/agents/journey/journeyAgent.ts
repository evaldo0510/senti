// src/core/agents/journey/journeyAgent.ts
import { SentiCoreAgent, UserContext, AgentDecision, StepProgress } from "../../types";

export class JourneyAgent implements SentiCoreAgent {
  agentId = "journey";

  async process(context: UserContext): Promise<AgentDecision> {
    let confidence = 0.4;
    const recommendations: Record<string, any> = {};

    // Determine current progression stage
    let currentStage: StepProgress = "acolhimento";
    const recentLogsCount = context.recentMoods.length;

    if (recentLogsCount > 10) {
      currentStage = "acompanhamento";
    } else if (recentLogsCount > 5) {
      currentStage = "desenvolvimento_pessoal";
    } else if (recentLogsCount > 2) {
      currentStage = "estabilizacao";
    }

    recommendations.progresso_etapa = currentStage;

    // Set daily challenges based on current emotional context
    let suggestedMeta = "Fazer um diário de gratidão simples com 3 coisas boas hoje.";
    let currentMoodTrend = "Estável";

    if (context.recentMoods.length > 0) {
      const lastMood = context.recentMoods[0];
      if (lastMood.value <= 4) {
        currentMoodTrend = `Vulnerável / Baixo (${lastMood.emotion})`;
        suggestedMeta = "Fazer uma pausa de 3 minutos para acalmar a mente e respirar devagar.";
      } else if (lastMood.value >= 8) {
        currentMoodTrend = `Excelente (${lastMood.emotion})`;
        suggestedMeta = "Compartilhar um sentimento positivo ou praticar um ato gentil.";
      }
    }

    recommendations.analise_humor = currentMoodTrend;
    recommendations.sugestao_meta_diaria = suggestedMeta;

    return {
      agentId: this.agentId,
      confidence,
      recommendations,
      logSummary: `JourneyAgent analisou o humor recente e estabeleceu meta: "${suggestedMeta}".`
    };
  }
}
