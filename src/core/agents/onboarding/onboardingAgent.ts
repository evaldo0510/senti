// src/core/agents/onboarding/onboardingAgent.ts
import { SentiCoreAgent, UserContext, AgentDecision } from "../../types";

export class OnboardingAgent implements SentiCoreAgent {
  agentId = "onboarding";

  async process(context: UserContext): Promise<AgentDecision> {
    const message = context.currentMessage.toLowerCase();
    let confidence = 0.15;
    const recommendations: Record<string, any> = {};

    // Detect greetings and first-time expressions
    if (
      message.includes("ola") ||
      message.includes("oi") ||
      message.includes("bom dia") ||
      message.includes("boa tarde") ||
      message.includes("como funciona") ||
      message.includes("primeira vez")
    ) {
      confidence = 0.85;
      recommendations.greetWithHeart = true;
      recommendations.explainPlatform = message.includes("como funciona") || message.includes("primeira vez");
    }

    // Check if user is missing emergency contacts or critical onboarding details
    const hasEmergencyContacts = context.userProfile?.isPremium !== undefined; // mock condition or check profile
    if (!hasEmergencyContacts) {
      recommendations.suggestProfileCompletion = true;
      recommendations.suggestionMessage = "Preencher contatos de segurança";
    }

    return {
      agentId: this.agentId,
      confidence,
      recommendations,
      logSummary: "OnboardingAgent avaliou o tom de boas-vindas e prontidão do perfil."
    };
  }
}
