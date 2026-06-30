// src/core/orchestrator/decisionEngine.ts
import { UserContext, SentiCoreAnalysis, SentiCoreAgent, RiskLevel, StepProgress, ExerciseType } from "../types";
import { EscalationRules } from "../policies/escalationRules";

export class DecisionEngine {
  /**
   * Compiles individual sub-agent recommendations into a unified, clean tactical SentiCore payload.
   */
  static async compile(context: UserContext, activeAgents: SentiCoreAgent[]): Promise<SentiCoreAnalysis> {
    console.log(`[SentiCore:DecisionEngine] Processando ${activeAgents.length} agentes ativos em paralelo...`);
    
    // 1. Run all routed agents
    const decisions = await Promise.all(
      activeAgents.map(async (agent) => {
        try {
          return await agent.process(context);
        } catch (err) {
          console.error(`[SentiCore:DecisionEngine] Falha ao processar agente ${agent.agentId}:`, err);
          return null;
        }
      })
    );

    // 2. Establish baseline fallbacks
    let finalRiskLevel: RiskLevel = "baixo";
    let humanEscalation = false;
    let riskReason = "Nenhum risco clínico agudo detectado.";

    let extractedFacts: string[] = [];
    let extractedPrefs: string[] = [];

    let currentProgress: StepProgress = "acolhimento";
    let moodAnalysis = "Estável / Equilibrado";
    let dailyGoal = "Fazer uma pausa de 3 minutos para respirar conscientemente hoje.";

    let suggestClinician = false;
    let clinicianSpecialties: string[] = [];
    let referralReason = "";

    let recommendContent = false;
    let contentList: string[] = [];
    let contentReason = "";

    let nextStepMessage = "Oferecer acolhimento literário e escuta sensível.";
    let suggestActiveExercise = false;
    let chosenExercise: ExerciseType = "nenhum";

    // 3. Compile and merge decisions from each agent based on priority/confidence
    for (const decision of decisions) {
      if (!decision) continue;

      const { agentId, recommendations } = decision;

      switch (agentId) {
        case "onboarding":
          if (recommendations.suggestionMessage) {
            nextStepMessage = `Auxiliar onboarding: ${recommendations.suggestionMessage}`;
          }
          break;

        case "journey":
          if (recommendations.progresso_etapa) currentProgress = recommendations.progresso_etapa;
          if (recommendations.analise_humor) moodAnalysis = recommendations.analise_humor;
          if (recommendations.sugestao_meta_diaria) dailyGoal = recommendations.sugestao_meta_diaria;
          break;

        case "diary":
          if (recommendations.identifiedThemes && recommendations.identifiedThemes.length > 0) {
            extractedFacts.push(...recommendations.identifiedThemes.map((t: string) => `Tema identificado: ${t}`));
          }
          break;

        case "scheduling":
          if (recommendations.triggerBookingDialog) {
            nextStepMessage = "Direcionar usuário para agendamento síncrono ativo.";
          }
          break;

        case "referral":
          if (recommendations.indicar_profissional) {
            suggestClinician = true;
            clinicianSpecialties = recommendations.tipo_profissional || ["Psicólogo Clínico"];
            referralReason = recommendations.razao || "Pareamento preventivo.";
          }
          break;

        case "marketplace":
          if (recommendations.recomendar_conteudo) {
            recommendContent = true;
            contentList = recommendations.ids_conteudo || [];
            contentReason = recommendations.razao || "";
            // Set exercise trigger if match found
            if (contentList.some(c => c.toLowerCase().includes("sono") || c.toLowerCase().includes("hipnotica"))) {
              suggestActiveExercise = true;
              chosenExercise = "respiracao_478";
            }
          }
          break;

        case "notifications":
          if (recommendations.sendUrgentPush) {
            humanEscalation = true;
            finalRiskLevel = "alto";
          }
          break;
      }
    }

    // 4. Overwrite/Validate Safety using Strict Clinical Escalation Policy (Clinical Guardrails)
    const safetyCheck = EscalationRules.assess(context);
    if (safetyCheck.riskLevel === "alto" || safetyCheck.riskLevel === "medio") {
      finalRiskLevel = safetyCheck.riskLevel;
      humanEscalation = safetyCheck.escalate;
      riskReason = safetyCheck.reason;
      
      // Override next steps to protect patient
      nextStepMessage = `PROTOCOLO DE SEGURANÇA ATIVO: ${safetyCheck.suggestedAction}`;
      suggestActiveExercise = true;
      chosenExercise = safetyCheck.riskLevel === "alto" ? "aterramento_54321" : "respiracao_478";
      suggestClinician = true;
      clinicianSpecialties = Array.from(new Set([...clinicianSpecialties, "Psicólogo Clínico", "Psiquiatra de Plantão"]));
      referralReason = `Encaminhamento prioritário por risco clínico: ${safetyCheck.reason}`;
    }

    return {
      risk: {
        level: finalRiskLevel,
        escalar_humano: humanEscalation,
        razao: riskReason
      },
      memory: {
        novas_informacoes: extractedFacts,
        preferencias_identificadas: extractedPrefs
      },
      journey: {
        progresso_etapa: currentProgress,
        analise_humor: moodAnalysis,
        sugestao_meta_diaria: dailyGoal
      },
      referral: {
        indicar_profissional: suggestClinician,
        tipo_profissional: clinicianSpecialties,
        razao: referralReason
      },
      marketplace: {
        recomendar_conteudo: recommendContent,
        ids_conteudo: contentList,
        razao: contentReason
      },
      recommendation: {
        proximo_passo: nextStepMessage,
        sugerir_exercicio: suggestActiveExercise,
        tipo_exercicio: chosenExercise
      }
    };
  }
}
