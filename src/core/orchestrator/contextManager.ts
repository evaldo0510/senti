// src/core/orchestrator/contextManager.ts
import { UserContext } from "../types";

export class ContextManager {
  /**
   * Constructs the strongly-typed UserContext from dynamic inputs and databases.
   */
  static build(
    userId: string,
    message: string,
    userProfile: any,
    longTermMemory: any,
    recentMoods: any[],
    recentDiary: any[]
  ): UserContext {
    return {
      userId,
      userProfile: {
        nome: userProfile?.nome || "Paciente SentiPae",
        email: userProfile?.email || "",
        tipo: userProfile?.tipo || "usuario",
        tenantId: userProfile?.tenantId || "B2C",
        isPremium: userProfile?.isPremium || false,
        streak: userProfile?.streak || 0,
        xp: userProfile?.xp || 0
      },
      longTermMemory: {
        fatos: longTermMemory?.fatos || [],
        preferencias: longTermMemory?.preferencias || [],
        emocaoAtual: longTermMemory?.emocaoAtual || "estável"
      },
      recentMoods: recentMoods.map((m) => ({
        emotion: m.emotion || m.feeling || "neutro",
        value: m.value || m.score || 5,
        intensity: m.intensity || 5,
        createdAt: m.createdAt || new Date().toISOString()
      })),
      recentDiary: recentDiary.map((d) => ({
        title: d.title || d.note || "Nota",
        mood: d.mood || 5,
        createdAt: d.createdAt || new Date().toISOString()
      })),
      currentMessage: message
    };
  }
}
