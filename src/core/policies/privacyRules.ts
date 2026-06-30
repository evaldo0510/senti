// src/core/policies/privacyRules.ts
import { UserContext } from "../types";

export interface PrivacyCheckResult {
  allowed: boolean;
  reason: string;
  dataMaskRequired: boolean;
}

export class PrivacyRules {
  /**
   * Evaluates if data processing is permitted based on user tenant constraints and permissions.
   */
  static verifyAccess(context: UserContext, resourceType: "piu_notes" | "mood_entries" | "audit_log"): PrivacyCheckResult {
    const { tipo, tenantId } = context.userProfile;

    // Admin has access to audit logs but not private medical notes
    if (tipo === "admin" || tipo === "super_admin") {
      if (resourceType === "audit_log") {
        return { allowed: true, reason: "Acesso administrativo a logs de segurança permitido.", dataMaskRequired: false };
      }
      if (resourceType === "piu_notes") {
        return { allowed: false, reason: "Admins estão estritamente vetados de acessar notas de prontuário clínico.", dataMaskRequired: true };
      }
    }

    // Corporate Tenant / Prefeitura Restrictions: No access to individual raw data!
    if (tenantId && tenantId !== "B2C") {
      if (tipo === "empresa" || tipo === "prefeitura") {
        if (resourceType === "mood_entries" || resourceType === "piu_notes") {
          return {
            allowed: false,
            reason: `Entidades institucionais (${tenantId}) somente possuem acesso a dados agregados anonimizados.`,
            dataMaskRequired: true
          };
        }
      }
    }

    // Default safe state for users accessing their own files
    return {
      allowed: true,
      reason: "Acesso concedido para autogestão ou fluxo direto de cuidado.",
      dataMaskRequired: false
    };
  }

  /**
   * Masks sensitive information from text if dataMaskRequired is true.
   */
  static maskSensitiveContent(text: string): string {
    // Basic regex placeholder to remove clinical notes or medication suggestions if leaked
    return text
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL_OCULTO]")
      .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[CPF_OCULTO]")
      .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, "[CNPJ_OCULTO]");
  }
}
