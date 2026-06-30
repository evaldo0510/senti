// src/core/analytics/analyticsEngine.ts

export interface LatencyMetric {
  endpoint: string;
  durationMs: number;
  timestamp: string;
}

export interface AiUsageMetric {
  userId: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  timestamp: string;
}

export interface InteractionMetric {
  userId: string;
  type: "diary" | "chat" | "booking" | "exercise";
  details?: string;
  timestamp: string;
}

export class AnalyticsEngine {
  private static instance: AnalyticsEngine;
  
  private latencyMetrics: LatencyMetric[] = [];
  private aiUsageMetrics: AiUsageMetric[] = [];
  private interactions: InteractionMetric[] = [];

  private constructor() {
    // Private constructor for Singleton
  }

  public static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  /**
   * Tracks response time for specific SentiCore/API calls.
   */
  public logLatency(endpoint: string, durationMs: number): void {
    const metric: LatencyMetric = {
      endpoint,
      durationMs,
      timestamp: new Date().toISOString(),
    };
    this.latencyMetrics.push(metric);
    if (this.latencyMetrics.length > 200) this.latencyMetrics.shift();
  }

  /**
   * Tracks generative AI token usage and costs (Gemini SDK wrapper).
   */
  public logAiUsage(userId: string, promptTokens: number, completionTokens: number): void {
    // Standard cost estimate: Gemini 1.5/2.0 Flash is roughly $0.075 / 1M input tokens, $0.30 / 1M output tokens
    const inputCost = (promptTokens / 1_000_000) * 0.075;
    const outputCost = (completionTokens / 1_000_000) * 0.30;
    const totalCost = inputCost + outputCost;

    const metric: AiUsageMetric = {
      userId,
      promptTokens,
      completionTokens,
      estimatedCostUsd: totalCost,
      timestamp: new Date().toISOString(),
    };

    this.aiUsageMetrics.push(metric);
    if (this.aiUsageMetrics.length > 500) this.aiUsageMetrics.shift();
    console.log(`[SentiCore:Analytics] Logged AI usage for User ${userId}. Cost: $${totalCost.toFixed(6)}`);
  }

  /**
   * Tracks general interactive features (diaries written, breathing exercises finished, bookings).
   */
  public logInteraction(userId: string, type: "diary" | "chat" | "booking" | "exercise", details?: string): void {
    const metric: InteractionMetric = {
      userId,
      type,
      details,
      timestamp: new Date().toISOString(),
    };
    this.interactions.push(metric);
    if (this.interactions.length > 500) this.interactions.shift();
  }

  /**
   * Retrieves compiled statistics (average response time, total AI costs, etc.)
   */
  public getTelemetrySummary() {
    const totalLatency = this.latencyMetrics.reduce((sum, m) => sum + m.durationMs, 0);
    const avgLatency = this.latencyMetrics.length > 0 ? totalLatency / this.latencyMetrics.length : 120; // 120ms standard default

    const totalCost = this.aiUsageMetrics.reduce((sum, m) => sum + m.estimatedCostUsd, 0);
    const totalPromptTokens = this.aiUsageMetrics.reduce((sum, m) => sum + m.promptTokens, 0);
    const totalCompletionTokens = this.aiUsageMetrics.reduce((sum, m) => sum + m.completionTokens, 0);

    const counts = {
      diary: this.interactions.filter((i) => i.type === "diary").length,
      chat: this.interactions.filter((i) => i.type === "chat").length,
      booking: this.interactions.filter((i) => i.type === "booking").length,
      exercise: this.interactions.filter((i) => i.type === "exercise").length,
    };

    return {
      averageResponseTimeMs: Math.round(avgLatency),
      totalAiCostUsd: Number(totalCost.toFixed(6)),
      totalPromptTokens,
      totalCompletionTokens,
      activityCounts: counts,
      metricsLoggedCount: {
        latency: this.latencyMetrics.length,
        aiUsage: this.aiUsageMetrics.length,
        interactions: this.interactions.length,
      },
    };
  }
}
