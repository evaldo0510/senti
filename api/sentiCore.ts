import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

// Import SentiCore Core Engine Sub-Modules from /src/core
import { SentiCoreAnalysis } from "../src/core/types";
import { ContextManager } from "../src/core/orchestrator/contextManager";
import { Router } from "../src/core/orchestrator/router";
import { DecisionEngine } from "../src/core/orchestrator/decisionEngine";
import { MemoryService } from "../src/core/memory/memoryService";

// Load Firebase Config to get the correct database ID
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
let databaseId = "";
try {
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  databaseId = firebaseConfig.firestoreDatabaseId;
} catch (error) {
  console.error("SentiCore: Error reading firebase-applet-config.json:", error);
}

const getDb = (): admin.firestore.Firestore => {
  if (databaseId && databaseId !== "(default)") {
    return getFirestore(admin.app(), databaseId);
  } else {
    return getFirestore();
  }
};

export const SentiCore = {
  /**
   * Orchestrates SentiCore sub-agents by routing, mapping context, and compiling decisions.
   */
  orchestrate: async (
    userId: string,
    message: string,
    history: any[] = []
  ): Promise<SentiCoreAnalysis> => {
    console.log(`[SentiCore:Orchestrator] Iniciando orquestração inteligente para usuário ${userId}...`);
    const db = getDb();

    // 1. Fetch User data from Firestore
    let userProfile: any = null;
    let longTermMemory: any = null;
    let recentMoods: any[] = [];
    let recentDiary: any[] = [];

    try {
      const [profileDoc, memoryDoc, moodsSnap, diarySnap] = await Promise.all([
        db.collection("users").doc(userId).get(),
        db.collection("memoria_iara").doc(userId).get(),
        db.collection("emotion_logs")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(5)
          .get(),
        db.collection("diary_entries")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(3)
          .get(),
      ]);

      userProfile = profileDoc.exists ? profileDoc.data() : {};
      longTermMemory = memoryDoc.exists ? memoryDoc.data() : {};
      recentMoods = moodsSnap.docs.map((doc) => doc.data());
      recentDiary = diarySnap.docs.map((doc) => doc.data());
    } catch (dbError) {
      console.warn("[SentiCore:Orchestrator] Falha de leitura do Firestore (utilizando fallbacks amigáveis):", dbError);
    }

    // 2. Build Unified context payload
    const context = ContextManager.build(
      userId,
      message,
      userProfile,
      longTermMemory,
      recentMoods,
      recentDiary
    );

    // 3. Smart routing: Resolve active sub-agents
    const activeAgents = Router.route(context);
    console.log(`[SentiCore:Orchestrator] Agentes ativos escalados: ${activeAgents.map(a => a.agentId).join(", ")}`);

    // 4. Compile compiled SentiCore tactical decision analysis
    const analysis = await DecisionEngine.compile(context, activeAgents);

    // 5. Post-Analysis Core Workflows (Memory serialization, crisis audit logs, safety-tagging)
    await SentiCore.executePostAnalysisActions(userId, analysis, longTermMemory, context);

    return analysis;
  },

  /**
   * Performs dynamic operations following compiled agent decisions.
   */
  executePostAnalysisActions: async (
    userId: string,
    analysis: SentiCoreAnalysis,
    currentMemory: any,
    context: any
  ): Promise<void> => {
    try {
      const db = getDb();

      // A. Memory Engine integration: serialize extracted information to memoria_iara
      if (
        (analysis.memory.novas_informacoes && analysis.memory.novas_informacoes.length > 0) ||
        (analysis.memory.preferencias_identificadas && analysis.memory.preferencias_identificadas.length > 0)
      ) {
        console.log(`[SentiCore:MemoryEngine] Integrando novas descobertas na memória de longo prazo...`);
        
        let parsedMemory = { fatos: [], preferencias: [], emocaoAtual: "estável" };
        if (currentMemory && currentMemory.perfil) {
          try {
            parsedMemory = typeof currentMemory.perfil === "string" ? JSON.parse(currentMemory.perfil) : currentMemory.perfil;
          } catch {
            parsedMemory = { fatos: [currentMemory.perfil], preferencias: [], emocaoAtual: "estável" };
          }
        }

        const mergedMemory = MemoryService.merge(
          context,
          analysis.memory.novas_informacoes,
          analysis.memory.preferencias_identificadas
        );

        await db.collection("memoria_iara").doc(userId).set({
          userId,
          perfil: JSON.stringify(mergedMemory),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      // B. Safety Crisis Trigger: Log clinical warning if high risk is signaled
      if (analysis.risk.level === "alto" || analysis.risk.escalar_humano) {
        console.warn(`[SentiCore:RiskEngine] ALERTA DE RISCO ELEVADO - Ativando protocolo de contingência e escalonamento humano.`);
        
        await db.collection("audit_logs").add({
          userId,
          timestamp: new Date().toISOString(),
          type: "RISK_ALERT",
          severity: "HIGH",
          details: analysis.risk.razao,
          actionRequired: "HUMAN_ESCALATION",
        });

        // Set safety flag on the user document
        await db.collection("users").doc(userId).set({
          safetyAlertActive: true,
          safetyAlertReason: analysis.risk.razao,
          safetyAlertDate: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (postError) {
      console.error("[SentiCore:PostAnalysis] Falha ao processar fluxos de feedback pós-orquestração:", postError);
    }
  }
};
