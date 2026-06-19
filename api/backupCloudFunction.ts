import * as functions from "firebase-functions/v2";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { google } from "googleapis";

// Guarantee firebase-admin initialization
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Firestore Trigger listening to all write operations on any document in any collection
 * and logging it to the secure write-only logs_auditoria collection.
 */
export const onAnyDocumentWritten = onDocumentWritten(
  "{collectionId}/{documentId}",
  async (event) => {
    const { collectionId, documentId } = event.params;
    
    // Strict guard to prevent infinite trigger loop
    if (
      collectionId === "logs_auditoria" || 
      collectionId === "audit_logs" || 
      collectionId === "login_attempts"
    ) {
      return;
    }
    
    const db = admin.firestore();
    const beforeData = event.data?.before.data() || null;
    const afterData = event.data?.after.data() || null;
    
    let operationType = "UNKNOWN";
    if (!beforeData && afterData) {
      operationType = "CREATE";
    } else if (beforeData && afterData) {
      operationType = "UPDATE";
    } else if (beforeData && !afterData) {
      operationType = "DELETE";
    }
    
    // safe user resolution
    let userId = "authenticated_user";
    if (afterData && (afterData.userId || afterData.userUid || afterData.uid || afterData.email)) {
      userId = afterData.userId || afterData.userUid || afterData.uid || afterData.email;
    } else if (beforeData && (beforeData.userId || beforeData.userUid || beforeData.uid || beforeData.email)) {
      userId = beforeData.userId || beforeData.userUid || beforeData.uid || beforeData.email;
    }
    
    const timestamp = new Date().toISOString();
    
    try {
      await db.collection("logs_auditoria").add({
        userId,
        timestamp,
        operationType: `DB_${operationType}`,
        description: `Trigger detectou alteração de ${operationType} no documento [${documentId}] na coleção [${collectionId}].`,
        alteredDocument: {
          collection: collectionId,
          docId: documentId,
          before: beforeData,
          after: afterData
        },
        ip: "firebase_trigger_daemon",
        location: { country: "BR", city: "Cloud Engine" },
        status: "sucesso"
      });
      console.log(`[TRIGGER LOGGED WRITE] Gravado log de auditoria para DB_${operationType} em ${collectionId}/${documentId}`);
    } catch (err) {
      console.error("Erro ao gravar log no trigger do Firestore:", err);
    }
  }
);

/**
 * Cloud Function Triggered Daily (scheduler-v2)
 * Performs automated Firestore export/backup to a Google Cloud Storage bucket.
 * Designed to guarantee long-term data integrity and compliance with LGPD (Lei Geral de Proteção de Dados).
 */
export const dailyFirestoreBackup = functions.scheduler.onSchedule(
  {
    schedule: "0 2 * * *", // Daily at 2:00 AM UTC-3
    timeZone: "America/Sao_Paulo",
    memory: "256MiB"
  },
  async (event) => {
    const firestore = google.firestore("v1");
    const auth = new google.auth.GoogleAuth({
      scopes: [
        "https://www.googleapis.com/auth/datastore",
        "https://www.googleapis.com/auth/cloud-platform"
      ]
    });
    
    const authClient = await auth.getClient();
    google.options({ auth: authClient });
    
    // Try to retrieve the current Firebase Project ID dynamically
    let projectId = "pronto-socorro-emocional";
    if (process.env.GCP_PROJECT) {
      projectId = process.env.GCP_PROJECT;
    } else if (process.env.FIREBASE_CONFIG) {
      try {
        const config = JSON.parse(process.env.FIREBASE_CONFIG);
        if (config.projectId) {
          projectId = config.projectId;
        }
      } catch (e) {
        console.warn("Could not parse FIREBASE_CONFIG JSON:", e);
      }
    }
    
    const databaseName = `projects/${projectId}/databases/(default)`;
    
    // Create GCS subfolder name with strict timestamp labeling
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputUriPrefix = `gs://${projectId}-firestore-backups/daily-${timestamp}`;
    
    console.log(`[LGPD COMPLIANCE BACKUP] Iniciando rotina de exportação consolidada do Firestore.`);
    console.log(`Origem: ${databaseName}`);
    console.log(`Destino: ${outputUriPrefix}`);
    
    try {
      const response = await firestore.projects.databases.exportDocuments({
        name: databaseName,
        requestBody: {
          outputUriPrefix: outputUriPrefix,
          collectionIds: [] // Empty array exports all collections
        }
      });
      console.log(`[LGPD SUCCESS] Exportação de backup iniciada com sucesso no GCP. Operação: ${response.data.name}`);
      return { success: true, operationId: response.data.name, bucketPath: outputUriPrefix };
    } catch (error: any) {
      console.error("[LGPD FAILURE] Erro catastrófico ao disparar exportação automática do Firestore:", error);
      throw error;
    }
  }
);
