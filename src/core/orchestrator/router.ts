// src/core/orchestrator/router.ts
import { UserContext, SentiCoreAgent } from "../types";
import { RoutingRules } from "../policies/routingRules";

// Import all sub-agents
import { OnboardingAgent } from "../agents/onboarding/onboardingAgent";
import { JourneyAgent } from "../agents/journey/journeyAgent";
import { DiaryAgent } from "../agents/diary/diaryAgent";
import { SchedulingAgent } from "../agents/scheduling/schedulingAgent";
import { ReferralAgent } from "../agents/referral/referralAgent";
import { MarketplaceAgent } from "../agents/marketplace/marketplaceAgent";
import { NotificationsAgent } from "../agents/notifications/notificationsAgent";

export class Router {
  private static agentsMap: Record<string, SentiCoreAgent> = {
    onboarding: new OnboardingAgent(),
    journey: new JourneyAgent(),
    diary: new DiaryAgent(),
    scheduling: new SchedulingAgent(),
    referral: new ReferralAgent(),
    marketplace: new MarketplaceAgent(),
    notifications: new NotificationsAgent()
  };

  /**
   * Resolves and returns the list of sub-agents scheduled to process the user request.
   */
  static route(context: UserContext, minConfidenceThreshold = 0.3): SentiCoreAgent[] {
    const routingScores = RoutingRules.evaluate(context);
    const activeAgents: SentiCoreAgent[] = [];

    // Select agents that cross the minimum activation threshold
    for (const routing of routingScores) {
      if (routing.score >= minConfidenceThreshold) {
        const agent = this.agentsMap[routing.agentId];
        if (agent) {
          activeAgents.push(agent);
        }
      }
    }

    // Always include journey and notifications as safety/governance baselines if list is empty
    if (activeAgents.length === 0) {
      activeAgents.push(this.agentsMap["journey"]);
      activeAgents.push(this.agentsMap["notifications"]);
    }

    return activeAgents;
  }
}
