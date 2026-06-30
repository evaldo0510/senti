// src/core/memory/memoryService.ts
import { UserContext } from "../types";

export interface MemoryPayload {
  fatos: string[];
  preferencias: string[];
  emocaoAtual?: string;
  updatedAt: string;
}

export class MemoryService {
  /**
   * Summarizes and merges newly extracted facts with existing long-term memories.
   */
  static merge(context: UserContext, extractedFacts: string[], extractedPrefs: string[]): MemoryPayload {
    const existingFacts = context.longTermMemory.fatos || [];
    const existingPrefs = context.longTermMemory.preferencias || [];

    // Combine and deduplicate facts (ignoring case/whitespace)
    const allFacts = [...existingFacts];
    for (const fact of extractedFacts) {
      const isDuplicate = allFacts.some(
        (f) => f.toLowerCase().trim() === fact.toLowerCase().trim()
      );
      if (!isDuplicate && fact.trim()) {
        allFacts.push(fact.trim());
      }
    }

    // Combine and deduplicate preferences
    const allPrefs = [...existingPrefs];
    for (const pref of extractedPrefs) {
      const isDuplicate = allPrefs.some(
        (p) => p.toLowerCase().trim() === pref.toLowerCase().trim()
      );
      if (!isDuplicate && pref.trim()) {
        allPrefs.push(pref.trim());
      }
    }

    return {
      fatos: allFacts,
      preferencias: allPrefs,
      emocaoAtual: context.longTermMemory.emocaoAtual || "estável",
      updatedAt: new Date().toISOString()
    };
  }
}
