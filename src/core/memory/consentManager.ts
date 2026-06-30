// src/core/memory/consentManager.ts
import { UserContext } from "../types";

export interface UserConsent {
  userId: string;
  allowMemoryStorage: boolean;
  allowPushNotifications: boolean;
  allowAnonymizedAnalytics: boolean;
  lastUpdated: string;
}

export class ConsentManager {
  /**
   * Retrieves or establishes default consent status for a user.
   */
  static getConsent(userId: string, existingConsent?: any): UserConsent {
    if (existingConsent) {
      return {
        userId,
        allowMemoryStorage: existingConsent.allowMemoryStorage !== false,
        allowPushNotifications: existingConsent.allowPushNotifications !== false,
        allowAnonymizedAnalytics: existingConsent.allowAnonymizedAnalytics !== false,
        lastUpdated: existingConsent.lastUpdated || new Date().toISOString()
      };
    }

    // Default safe consent profile (Opt-in for memory & notifications by default, but completely togglable)
    return {
      userId,
      allowMemoryStorage: true,
      allowPushNotifications: true,
      allowAnonymizedAnalytics: true,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Evaluates if a process can proceed based on active consent.
   */
  static canProcess(consent: UserConsent, action: "store_memory" | "send_push" | "track_metrics"): boolean {
    switch (action) {
      case "store_memory":
        return consent.allowMemoryStorage;
      case "send_push":
        return consent.allowPushNotifications;
      case "track_metrics":
        return consent.allowAnonymizedAnalytics;
      default:
        return false;
    }
  }
}
