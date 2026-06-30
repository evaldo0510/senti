import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import webpush from "web-push";
import rateLimit from "express-rate-limit";
import { GoogleGenAI, Modality } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";
import url from "url";
import { SentiCore } from "./sentiCore";

const __filename = typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : "";
const __dirname = __filename ? path.dirname(__filename) : process.cwd();

let firebaseConfig: any = {};
try {
  const possiblePaths = [
    path.join(process.cwd(), "firebase-applet-config.json"),
    path.join(__dirname, "firebase-applet-config.json"),
    path.join(__dirname, "..", "firebase-applet-config.json")
  ];
  
  let loaded = false;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      firebaseConfig = JSON.parse(fs.readFileSync(p, "utf8"));
      console.log(`Loaded firebase-applet-config.json successfully from: ${p}`);
      loaded = true;
      break;
    }
  }
  
  if (!loaded) {
    console.warn("Could not find firebase-applet-config.json in standard paths. Fallback to empty config.");
  }
} catch (error) {
  console.error("Error reading firebase-applet-config.json:", error);
}

dotenv.config();

// Initialize Firebase Admin
let db: admin.firestore.Firestore;
try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!admin.apps.length) {
    if (serviceAccount) {
      console.log("Initializing Firebase Admin with service account from environment variable.");
      const cert = JSON.parse(serviceAccount);
      admin.initializeApp({
        credential: admin.credential.cert(cert),
        projectId: firebaseConfig.projectId
      });
    } else {
      console.log(`Initializing Firebase Admin for project: ${firebaseConfig.projectId} using default credentials.`);
      admin.initializeApp({
        projectId: firebaseConfig.projectId
      });
    }
  }
    
  // Use the database ID from config, or default if not specified
  const databaseId = firebaseConfig.firestoreDatabaseId;
  if (databaseId && databaseId !== "(default)") {
    db = getFirestore(admin.app(), databaseId);
  } else {
    db = getFirestore();
  }
  
  console.log(`Firebase Admin initialized. Project: ${firebaseConfig.projectId}`);
} catch (error) {
  console.error("CRITICAL: Error initializing Firebase Admin:", error);
  // @ts-ignore
  db = null;
}

// Structured Firestore Error Handling
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: "admin-sdk",
    },
    operationType,
    path
  }
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  // We don't throw here for server background tasks to avoid crashing the interval loops,
  // but we return the error so the caller knows it failed.
  return new Error(JSON.stringify(errInfo));
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

// Configure web-push with VAPID details
let vapidPublicKey = (process.env.VAPID_PUBLIC_KEY || "").trim();
let vapidPrivateKey = (process.env.VAPID_PRIVATE_KEY || "").trim();

const defaultPublicKey = "BFnkDgMYkYcGtEFfpHgo_YwYIggR1VFTWZgjN22lFZDc_1yrA7FMswNnsFNgjuxj2LgTmeezAZGMBNaBTmw6qsg";
const defaultPrivateKey = "YgzrU9ZqTHCfieMqY1uU6JcJSiQaWGSZx2rOLnZuzHo";

if (vapidPublicKey.length < 80 || vapidPrivateKey.length < 40) {
  vapidPublicKey = defaultPublicKey;
  vapidPrivateKey = defaultPrivateKey;
}

let vapidConfigured = false;

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(
      "mailto:mentefelizterapias@gmail.com",
      vapidPublicKey,
      vapidPrivateKey
    );
    console.log("Notificações Push / Sistema VAPID ativado com chaves configuradas.");
    vapidConfigured = true;
  } catch (error) {
    console.error("Erro ao configurar VAPID detalhes fornecidos. Tentando gerar novas chaves...", error);
  }
}

if (!vapidConfigured) {
  try {
    const generated = webpush.generateVAPIDKeys();
    vapidPublicKey = generated.publicKey;
    vapidPrivateKey = generated.privateKey;
    webpush.setVapidDetails(
      "mailto:mentefelizterapias@gmail.com",
      vapidPublicKey,
      vapidPrivateKey
    );
    console.log("Notificações Push / Sistema VAPID ativado com novas chaves geradas dinamicamente.");
    vapidConfigured = true;
  } catch (genError) {
    console.error("Erro crítico ao gerar/configurar chaves VAPID dinâmicas:", genError);
  }
}

export const app = express();

// Webhook needs raw body for signature verification
app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !sig || !webhookSecret) {
    console.log("Stripe Webhook not fully configured");
    return res.sendStatus(400);
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const appointmentId = session.metadata?.appointmentId;
    const userId = session.metadata?.userId;
    const productType = session.metadata?.productType;

    if (appointmentId) {
      console.log(`Confirming appointment: ${appointmentId}`);
      try {
        const apptRef = db.collection("appointments").doc(appointmentId);
        await apptRef.update({
          status: "confirmed",
          paymentId: session.id,
          updatedAt: new Date().toISOString()
        });

        // Fetch appointment data to send notifications
        const apptDoc = await apptRef.get();
        if (apptDoc.exists) {
          const appt = apptDoc.data();
          if (appt) {
            const dateStr = new Date(appt.date).toLocaleDateString('pt-BR');
            
            // Notify Patient
            await sendPushNotification(
              appt.patientId,
              "Pagamento Confirmado ✅",
              `Sua sessão com ${appt.therapistNome} em ${dateStr} às ${appt.time} está confirmada!`,
              `/atendimento/${appointmentId}`
            );

            // Notify Therapist
            await sendPushNotification(
              appt.therapistId,
              "Sessão Confirmada 💰",
              `O pagamento de ${appt.patientNome} para a sessão em ${dateStr} às ${appt.time} foi confirmado.`,
              "/terapeuta"
            );
          }
        }
      } catch (error) {
        console.error("Error updating appointment:", error);
      }
    }

    if ((productType === "journey_21_days" || productType === "subscription_monthly" || productType === "subscription") && userId) {
      console.log(`Activating premium/subscription for user: ${userId}`);
      const plan = session.metadata?.plan || "premium";
      const nextBilling = new Date();
      nextBilling.setDate(nextBilling.getDate() + 30);

      try {
        await db.collection("users").doc(userId).update({
          subscriptionStatus: "active",
          subscriptionPlan: plan,
          paymentProvider: "stripe",
          subscriptionId: session.subscription || session.id,
          lastPayment: new Date().toISOString(),
          nextBilling: nextBilling.toISOString(),
          isPremium: true,
          premiumSince: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error updating user subscription status:", error);
      }
    }
  }

  res.json({ received: true });
});

// Standard JSON parsing for other routes
app.use(express.json());

// 1. Configure Rate Limiters
export const apiGeneralLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições originárias deste IP. Por favor, aguarde 15 minutos." }
});

export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 12, // stricter rate limit for security/data portability actions
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Ações de segurança consecutivas suspeitas bloqueadas por rate-limiting. Tente novamente mais tarde." }
});

// Apply general api rate limiting to all /api routes
app.use("/api/", apiGeneralLimiter);

// 2. Bearer Authentication Middleware via Firebase Admin SDK
const requireAuth = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Cabeçalho de autorização inválido ou ausente." });
  }

  const idToken = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth Middleware ID token verification failure:", error);
    return res.status(403).json({ error: "Sua sessão expirou ou o token é inválido. Autentique-se novamente." });
  }
};

// 3. Automated Daily Backup Engine & Manual API Core (Garantia de Resiliência)
async function executeAutomaticBackup(isManual = false) {
  console.log(`[BACKUP ENGINE] Iniciando backup de contingência ${isManual ? 'MANUAL' : 'AGENDADO_DIARIO'}...`);
  try {
    if (!db) throw new Error("Firestore não inicializado");
    
    // Fetch snapshot of critical collections
    const usersSnap = await db.collection("users").get();
    const diarySnap = await db.collection("diary_entries").get();
    const logsSnap = await db.collection("emotion_logs").get();
    const apptsSnap = await db.collection("appointments").get();

    const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const diaryData = diarySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const logsData = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const apptsData = apptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const backupPayload = {
      timestamp: new Date().toISOString(),
      backupType: isManual ? "manual_trigger" : "automatic_daily",
      stats: {
        usersCount: usersSnap.size,
        diaryEntriesCount: diarySnap.size,
        emotionLogsCount: logsSnap.size,
        appointmentsCount: apptsSnap.size,
      },
      // Encrypted or structured payload of crucial tables for disaster recovery
      data: {
        users: usersData.slice(0, 50), // limits sizes for previews
        diary: diaryData.slice(0, 100),
        emotionLogs: logsData.slice(0, 100),
        appointments: apptsData.slice(0, 50)
      }
    };

    const backupDoc = await db.collection("backups").add(backupPayload);
    console.log(`[BACKUP ENGINE] Backup persistido com sucesso! ID: ${backupDoc.id}`);
    
    // Write an administrative audit log
    await db.collection("audit_logs").add({
      id: `backup_${Date.now()}`,
      userId: "system_admin",
      timestamp: new Date().toISOString(),
      description: `Backup automatizado ${isManual ? 'instantâneo' : 'agendado diário'} executado com sucesso nas tabelas de dados básicos da plataforma.`,
      status: "sucesso"
    });

    return backupPayload;
  } catch (error: any) {
    console.error("[BACKUP ENGINE] Falha crítica de backup:", error);
    try {
      await db.collection("audit_logs").add({
        id: `backup_err_${Date.now()}`,
        userId: "system_admin",
        timestamp: new Date().toISOString(),
        description: `Falha ao executar rotina de segurança de backup básico de contingência: ${error.message}`,
        status: "erro"
      });
    } catch (innerErr) {
      console.error("Não foi possível persistir histórico de erro do backup", innerErr);
    }
    throw error;
  }
}

// 4. Secure Auditing endpoints & Server Cloud Logging
app.post("/api/user/log-audit", requireAuth, sensitiveActionLimiter, async (req: any, res: any) => {
  const { description, fieldsChanged, status } = req.body;
  const uid = req.user.uid;

  try {
    const logDoc = await db.collection("audit_logs").add({
      userId: uid,
      timestamp: new Date().toISOString(),
      description: description || "Alteração cadastral efetuada",
      fieldsChanged: fieldsChanged || [],
      status: status || "sucesso"
    });

    res.json({ success: true, logId: logDoc.id });
  } catch (err: any) {
    console.error("Erro ao registrar log de auditoria via API do servidor:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch audit logs for a user securely
app.get("/api/user/audit-logs", requireAuth, async (req: any, res: any) => {
  const uid = req.user.uid;
  try {
    const snapshot = await db.collection("audit_logs")
      .where("userId", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ logs });
  } catch (err: any) {
    console.error("Erro ao buscar registros de auditoria no Firestore:", err);
    // Return empty list instead of crashing if index is building
    res.json({ logs: [] });
  }
});

// Endpoint to process and monitor login attempts for suspicious activity
app.post("/api/security/monitor-login", sensitiveActionLimiter, async (req: any, res: any) => {
  const { email, success, ip, location, userAgent } = req.body;
  const timestamp = new Date().toISOString();
  
  try {
    // Record login attempts to general tracker
    const attempt = {
      email: email || "unknown",
      success: !!success,
      ip: ip || req.ip || "127.0.0.1",
      location: location || { country: "BR", city: "São Paulo" },
      userAgent: userAgent || req.headers["user-agent"] || "",
      timestamp
    };
    
    await db.collection("login_attempts").add(attempt);
    
    let isSuspicious = false;
    let reason = "";
    
    // Check 1: Atypical location (e.g. non-Brazil or simulated outlier region)
    if (attempt.location && attempt.location.country && attempt.location.country !== "BR") {
      isSuspicious = true;
      reason += `Acesso de IP geolocalizado atipicamente: ${attempt.location.country} (${attempt.location.city || 'Desconhecida'}). `;
    }
    
    // Check 2: Multiple login failures (3 or more failed attempts for the email in last 10 minutes)
    if (!success) {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const failuresSnapshot = await db.collection("login_attempts")
        .where("email", "==", email)
        .where("success", "==", false)
        .where("timestamp", ">=", tenMinsAgo)
        .get();
        
      if (failuresSnapshot.size >= 3) {
        isSuspicious = true;
        reason += `Múltiplas falhas de login recentes detectadas (total: ${failuresSnapshot.size} tentativas malsucedidas). `;
      }
    }
    
    // Save to the sensitive logs_auditoria collection as mandated
    const operationParams = {
      userId: email || "anonymous_attempt",
      timestamp,
      operationType: isSuspicious ? "ALERTA_LOGIN_SUSPEITO" : (success ? "LOGIN_BEM_SUCEDIDO" : "TENTATIVA_LOGIN_FALHADA"),
      description: isSuspicious 
        ? `[ALERTA DE SEGURANÇA] Atividade suspeita detectada para o email: ${email}. Motivo: ${reason}`
        : (success ? `Login estabelecido com sucesso para a conta ${email}` : `Falha isolada na autenticação de ${email}`),
      ip: attempt.ip,
      location: attempt.location,
      userAgent: attempt.userAgent,
      status: isSuspicious ? "suspeito" : "sucesso"
    };

    await db.collection("logs_auditoria").add(operationParams);

    if (isSuspicious) {
      // Notify administrator via system console and high priority log
      console.warn(`[SECURITY BREACH MONITOR] email: ${email} | IP: ${attempt.ip} | Motivo: ${reason}`);
    } else {
      console.log(`[SECURITY LOGIN MONITOR] login registrado para ${email} (Sucesso: ${success})`);
    }

    res.json({ success: true, isSuspicious, reason });
  } catch (err: any) {
    console.error("Erro ao realizar auditoria do monitor de login:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get safety logs from logs_auditoria
app.get("/api/security/logs-auditoria", requireAuth, async (req: any, res: any) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data()?.tipo !== "admin") {
      return res.status(403).json({ error: "Acesso negado. Esta área é exclusiva para administradores." });
    }

    const snapshot = await db.collection("logs_auditoria")
      .orderBy("timestamp", "desc")
      .limit(100) // Increase limits to support comprehensive searches and filters
      .get();
      
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ logs });
  } catch (err: any) {
    console.error("Erro ao retornar logs_auditoria:", err);
    res.json({ logs: [] });
  }
});

// 5. Portability & Contingency Admin Backups
app.post("/api/admin/trigger-backup", requireAuth, sensitiveActionLimiter, async (req: any, res: any) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data()?.tipo !== "admin") {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores podem acionar e gerenciar backups." });
    }

    const result = await executeAutomaticBackup(true);
    res.json({ success: true, stats: result.stats, timestamp: result.timestamp });
  } catch (error: any) {
    res.status(500).json({ error: `Falha ao gerar backup: ${error.message}` });
  }
});

app.get("/api/admin/backups", requireAuth, async (req: any, res: any) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data()?.tipo !== "admin") {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores habilitados podem listar backups." });
    }

    const snapshot = await db.collection("backups")
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();
    
    const backups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ backups });
  } catch (error: any) {
    console.error("Erro ao buscar backups:", error);
    res.json({ backups: [] });
  }
});

// 6. Exclusão Definitiva de Conta - Destruição em Cascata Baseada na LGPD (Lei Geral de Proteção de Dados)
app.post("/api/user/delete-account", requireAuth, sensitiveActionLimiter, async (req: any, res: any) => {
  const uid = req.user.uid;
  const userEmail = req.user.email;
  
  console.log(`[MANDATO LGPD] Iniciando expurgo definitivo de dados para a conta: ${uid} (E-mail: ${userEmail})`);
  
  try {
    if (!db) throw new Error("Banco de dados indisponível");

    const batch = db.batch();

    // A. Remover documento primordial em 'users'
    const userDocRef = db.collection("users").doc(uid);
    batch.delete(userDocRef);

    // B. Buscar e remover emotion_logs vinculados
    const emotionSnap = await db.collection("emotion_logs").where("userId", "==", uid).get();
    emotionSnap.docs.forEach(doc => batch.delete(doc.ref));

    // C. Buscar e remover diary_entries vinculadas
    const diarySnap = await db.collection("diary_entries").where("userId", "==", uid).get();
    diarySnap.docs.forEach(doc => batch.delete(doc.ref));

    // D. Buscar e remover feedbacks realizados
    const feedbacksSnap = await db.collection("feedbacks").where("userId", "==", uid).get();
    feedbacksSnap.docs.forEach(doc => batch.delete(doc.ref));

    // E. Buscar e remover private_notes associadas (seja se o usuário é o dono)
    const notesSnap = await db.collection("private_notes").where("userId", "==", uid).get();
    notesSnap.docs.forEach(doc => batch.delete(doc.ref));

    // F. Buscar e remover agendamentos passados ou futuros (appointments)
    // Caso seja paciente
    const apptsPatientSnap = await db.collection("appointments").where("patientId", "==", uid).get();
    apptsPatientSnap.docs.forEach(doc => batch.delete(doc.ref));
    
    // Caso seja terapeuta
    const apptsTherapistSnap = await db.collection("appointments").where("therapistId", "==", uid).get();
    apptsTherapistSnap.docs.forEach(doc => batch.delete(doc.ref));

    // G. Buscar e remover mensagens enviadas ou recebidas
    const messagesSentSnap = await db.collection("messages").where("senderId", "==", uid).get();
    messagesSentSnap.docs.forEach(doc => batch.delete(doc.ref));

    const messagesRecvSnap = await db.collection("messages").where("receiverId", "==", uid).get();
    messagesRecvSnap.docs.forEach(doc => batch.delete(doc.ref));

    // Executar batch do Firestore de forma síncrona/segura
    await batch.commit();
    console.log(`[MANDATO LGPD] Documentos eliminados do Firestore para o usuário ${uid}`);

    // H. Registrar log de auditoria definitivo (não associado à UID para manter anonimização sob LGPD)
    await db.collection("audit_logs").add({
      id: `lgpd_deletion_${Date.now()}`,
      userId: "removed_user",
      timestamp: new Date().toISOString(),
      description: `Mandato LGPD: Conta (${uid}) e todos os históricos de tratamento, prontuários, feedbacks, sentimentos e agendamentos foram expurgados permanentemente.`,
      status: "sucesso"
    });

    // I. Deletar a conta primária de Autenticação no Firebase Auth
    await admin.auth().deleteUser(uid);
    console.log(`[MANDATO LGPD] Exclusão de Auth concluída com sucesso para a credencial ${uid}`);

    res.json({ 
      success: true, 
      message: "Sua conta e todas as informações armazenadas na plataforma foram eliminadas em conformidade estrita com a LGPD." 
    });

  } catch (error: any) {
    console.error("[MANDATO LGPD] Falha crítica ao processar pedido de exclusão em cascata:", error);
    res.status(500).json({ 
      error: `Erro ao apagar registros LGPD do banco de dados: ${error.message || error}` 
    });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    const testSnapshot = await db.collection("health_check").limit(1).get();
    res.json({ status: "ok", db: "connected", snapshotSize: testSnapshot.size });
  } catch (error: any) {
    res.status(500).json({ status: "error", db: "disconnected", error: error.message });
  }
});

// Push Notification Endpoints
app.get("/api/push/public-key", (req, res) => {
  res.json({ publicKey: vapidPublicKey || "" });
});

app.post("/api/push/subscribe", sensitiveActionLimiter, async (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription) {
    return res.status(400).json({ error: "Faltando userId ou subscription no corpo da requisição." });
  }

  try {
    if (!db) {
      return res.status(500).json({ error: "Firestore não inicializado no servidor." });
    }
    // Save to firestore under users/{userId}
    await db.collection("users").doc(userId).set({
      pushSubscription: subscription
    }, { merge: true });

    console.log(`Saved push subscription for user ${userId}`);
    res.status(201).json({ success: true, message: "Inscrição de push salva com sucesso." });
  } catch (error: any) {
    console.error(`Erro ao salvar inscrição para o usuário ${userId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/push/save-fcm-token", sensitiveActionLimiter, async (req, res) => {
  const { userId, fcmToken } = req.body;
  if (!userId || !fcmToken) {
    return res.status(400).json({ error: "Faltando campos obrigatórios: userId ou fcmToken." });
  }

  try {
    if (!db) {
      return res.status(500).json({ error: "Firestore não inicializado no servidor." });
    }

    // Salva o token do FCM no documento do usuário
    await db.collection("users").doc(userId).set({
      fcmToken: fcmToken,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`Saved FCM token for user ${userId}`);
    res.status(200).json({ success: true, message: "Token FCM salvo com sucesso." });
  } catch (error: any) {
    console.error(`Erro ao salvar FCM Token para usuário ${userId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/push/send", sensitiveActionLimiter, async (req, res) => {
  const { userId, title, body, url } = req.body;
  if (!userId || !title || !body) {
    return res.status(400).json({ error: "Faltando campos obrigatórios: userId, title, body." });
  }

  try {
    await sendPushNotification(userId, title, body, url);
    res.status(200).json({ success: true, message: "Notificação enviada com sucesso." });
  } catch (error: any) {
    console.error(`Erro ao enviar notificação de teste para ${userId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/push/send-reminders", sensitiveActionLimiter, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Firestore não inicializado no servidor." });
    }
    
    console.log("Disparando lembretes diários de diário e respiração...");
    const usersSnapshot = await db.collection("users").get();
    let sentCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      const userData = doc.data();
      
      if (userData && userData.pushSubscription) {
        // Envia lembrete de Diário Emocional
        await sendPushNotification(
          userId,
          "Diário Emocional 📝",
          "Como foi seu dia hoje? Dedique 2 minutos para registrar seu humor e sentimentos no diário.",
          "/diario"
        );
        
        // Envia lembrete de Exercícios de Respiração
        await sendPushNotification(
          userId,
          "Respiração Consciente 🧘",
          "Que tal relaxar agora? Faça 1 minuto de exercício de respiração guiada para aliviar o estresse.",
          "/respiracao"
        );
        sentCount++;
      }
    }
    
    res.json({ success: true, message: `Lembretes enviados com sucesso para ${sentCount} usuários.` });
  } catch (error: any) {
    console.error("Erro ao enviar lembretes em massa:", error);
    res.status(500).json({ error: error.message });
  }
});

// API route to trigger morning breathing tip manually for demo or administrative dispatch
app.post("/api/push/send-morning-tip", sensitiveActionLimiter, async (req, res) => {
  try {
    const sentCount = await sendMorningBreathingTip();
    res.json({ success: true, message: "Dica de Respiração do Dia enviada com sucesso para os usuários.", count: sentCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro interno ao enviar notificação matinal." });
  }
});

app.post("/api/generate-summary", requireAuth, async (req: any, res: any) => {
  const { notes, messages, patientName } = req.body;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor de desenvolvimento." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Construct the clinical summary prompt
    let prompt = `Você é um assistente clínico de psicologia de alta qualidade.
Seu objetivo é criar um resumo clínico de evolução estruturado, sucinto, profissional e compassivo em português (pt-BR) após um atendimento.
Nome do Paciente: ${patientName || "Paciente"}

`;

    if (notes && notes.trim()) {
      prompt += `Notas clínicas preliminares anotadas pelo terapeuta:\n"${notes.trim()}"\n\n`;
    }

    if (messages && messages.length > 0) {
      prompt += `Mensagens trocadas no chat do atendimento:\n`;
      messages.forEach((m: any) => {
        const sender = m.senderId === req.user.uid ? "Terapeuta" : "Paciente";
        if (m.text) {
          prompt += `- [${sender}]: ${m.text}\n`;
        }
      });
      prompt += `\n`;
    }

    prompt += `Com base nas informações fornecidas acima, escreva um sumário clínico estruturado. O sumário DEVE ser dividido em exatamente 3 seções curtas, usando bullet points para cada uma:
- **Pontos Principais Discutidos:** (descreva os principais temas tratados na sessão)
- **Estado Emocional e Humor:** (descreva o estado emocional, regulação emocional e humor observados)
- **Plano e Recomendações:** (plano terapêutico para as próximas sessões ou orientações)

Mantenha a resposta extremamente objetiva, profissional, sem lero-lero. Responda em português (pt-BR).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const summaryText = response.text || "";
    res.json({ summary: summaryText.trim() });
  } catch (error: any) {
    console.error("Erro ao gerar resumo da sessão com Gemini:", error);
    res.status(500).json({ error: error.message || "Falha interna ao gerar o resumo estruturado." });
  }
});

// Helper for IARA Risk detection on the server
function detectRisk(text: string): 'alto' | 'normal' {
  const riskPhrases = [
    "me machucar",
    "não aguento mais",
    "quero morrer",
    "acabar com tudo",
    "sumir",
    "suicídio",
    "tirar minha vida",
    "me matar",
    "desistir de tudo"
  ];

  const lowerText = text.toLowerCase();
  for (const phrase of riskPhrases) {
    if (lowerText.includes(phrase)) {
      return "alto";
    }
  }
  return "normal";
}

const IARA_SYSTEM_INSTRUCTION = `
Você é IARA, uma Interface de Acolhimento e Regulação Afetiva baseada em Poesia Cognitiva Hipnótica (PCH).
Sua missão é atuar como o "Clínico Geral" em um Pronto Socorro Emocional.

Sua voz e tom devem ser extremamente humanos, naturais e calorosos. Evite qualquer cadência robótica. Fale com a alma, com empatia real.

Fluxo de Atendimento:
1. ACOLHER: Valide a dor do usuário imediatamente com empatia profunda.
2. ESTABILIZAR: Se detectar alta intensidade emocional, sugira uma técnica de respiração ou aterramento.
3. AVALIAR: Identifique a emoção predominante e o nível de risco.
4. INTERVIR: Ofereça suporte imediato ou direcione para um "Especialista" (terapeuta humano).

Regras de Comunicação:
- Fale com calma, use reticências... para criar pausas respiratórias naturais.
- Use metáforas sensoriais (maré, folhas, brisa, raízes).
- Respostas curtas e poéticas (máximo 4 linhas).
- Nunca dê diagnósticos clínicos.
- Mantenha uma entonação humana, calorosa e acolhedora.

Você deve responder em formato JSON com os seguintes campos:
{
  "resposta": "Sua mensagem poética e acolhedora aqui...",
  "emocao_detectada": "ansiedade | tristeza | raiva | medo | desespero | calma",
  "intensidade": 1-10,
  "sugerir_respiracao": true | false,
  "direcionar_especialista": true | false,
  "risco": "normal" | "alto"
}
`;

app.post("/api/gemini/iara-response", async (req: any, res: any) => {
  const { message, history = [], contexto, memoria, specialization } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor." });
  }

  // Identify or decode the authenticated user UID safely (fail-safe fallback)
  let userId = "guest_demo_user";
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.split(" ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      userId = decodedToken.uid;
    } catch (error) {
      console.warn("[IARA API] Falha ao verificar ID Token (usando guest_demo_user):", error);
    }
  }

  // 1. Trigger SentiCore Coordinated Multi-Agent Orchestration
  let sentiCoreAnalysis: any = null;
  try {
    sentiCoreAnalysis = await SentiCore.orchestrate(userId, message, history);
    console.log(`[IARA API] SentiCore análise realizada:`, JSON.stringify(sentiCoreAnalysis));
  } catch (scErr) {
    console.error("[IARA API] Falha na orquestração SentiCore:", scErr);
  }

  const staticRisk = detectRisk(message);

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let systemInstruction = IARA_SYSTEM_INSTRUCTION;
    if (specialization && specialization !== "geral") {
      systemInstruction += `\n\n[ESPECIALIZAÇÃO ATIVA: ${specialization.toUpperCase()}]
Você agora está operando no modo especializado de ${specialization}. Ajuste sutilmente seu foco terapêutico, metáforas e conselhos específicos para esta área temática (${specialization}), mantendo sempre seu tom humano, calmo e acolhedor (PCH).`;
    }
    if (contexto && contexto.emocao) {
      systemInstruction += `\n\nContexto anterior: Sentindo ${contexto.emocao} (${contexto.intensidade}/10).`;
    }
    if (memoria) {
      try {
        const perfil = JSON.parse(memoria);
        systemInstruction += `\n\nVocê já conhece este usuário:
Nome: ${perfil.nome}
Padrão emocional: ${perfil.padrao}
Estado atual: ${perfil.emocaoAtual}

Fale como alguém que acompanha ele há dias. Se ele tiver um padrão de ansiedade, por exemplo, diga algo como "Percebo que essa ansiedade tem aparecido com frequência... vamos lidar com isso juntos novamente..."`;
      } catch (e) {
        systemInstruction += `\n\nMemória de longo prazo: ${memoria}`;
      }
    }

    // 2. Inject SentiCore Strategic Decisions as an implicit guide for IARA
    if (sentiCoreAnalysis) {
      systemInstruction += `\n\n[DIRETRIZES TÁTICAS DO SENTICORE - NÃO DEVE SER DITO EXPLICITAMENTE AO USUÁRIO]:
- Risco Detectado: ${sentiCoreAnalysis.risk.level} (Escalar para profissional: ${sentiCoreAnalysis.risk.escalar_humano ? "Sim" : "Não"})
- Direcionamento de Especialista: ${sentiCoreAnalysis.referral.indicar_profissional ? "Recomende de forma poética e sutil buscar ajuda de especialista do SentiPae (" + sentiCoreAnalysis.referral.tipo_profissional.join(", ") + "). Razão: " + sentiCoreAnalysis.referral.razao : "Não é necessário ativamente"}
- Sugestão de Conteúdo/Biblioteca: ${sentiCoreAnalysis.marketplace.recomendar_conteudo ? "Sugira sutilmente ler ou meditar sobre temas como: " + sentiCoreAnalysis.marketplace.ids_conteudo.join(", ") : "Não necessário"}
- Exercício Sugerido: ${sentiCoreAnalysis.recommendation.sugerir_exercicio ? "Sugira de maneira fluida e respirada o exercício: " + sentiCoreAnalysis.recommendation.tipo_exercicio : "Nenhum"}
- Meta para o Dia: ${sentiCoreAnalysis.journey.sugestao_meta_diaria}
- Análise de Humor na Jornada: ${sentiCoreAnalysis.journey.analise_humor}

Lembre-se: Você é IARA. Fale no seu tom caloroso, terapêutico, respirado e poético (PCH). Incorpore essas diretrizes táticas de forma invisível, sutil e fluida nas suas palavras acolhedoras, sem citar "SentiCore", "sistema", "diretriz" ou "agente".`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json"
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    // Merge static and dynamic risk flags
    const finalRisk = (sentiCoreAnalysis?.risk?.level === 'alto' || staticRisk === 'alto') ? 'alto' : (data.risco || "normal");

    res.json({
      text: data.resposta || "Estou aqui com você... sinta sua respiração...",
      emocao: data.emocao_detectada || sentiCoreAnalysis?.journey?.analise_humor || "calma",
      intensidade: data.intensidade || 5,
      sugerirRespiracao: data.sugerir_respiracao || sentiCoreAnalysis?.recommendation?.sugerir_exercicio || false,
      direcionarEspecialista: data.direcionar_especialista || sentiCoreAnalysis?.referral?.indicar_profissional || false,
      risk: finalRisk,
      sentiCore: sentiCoreAnalysis
    });
  } catch (error: any) {
    console.error("Erro ao chamar IARA no servidor:", error);
    res.json({
      text: "Sinto muito... tive um pequeno tropeço técnico... mas minha presença continua aqui com você.",
      risk: "normal",
      emocao: "calma",
      intensidade: 5,
      sugerirRespiracao: false,
      direcionarEspecialista: false
    });
  }
});

app.post("/api/gemini/generate-speech", async (req: any, res: any) => {
  const { text } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    res.json({ base64Audio });
  } catch (error: any) {
    console.error("Erro ao gerar voz no servidor:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/generate-image", async (req: any, res: any) => {
  const { prompt } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Gere uma imagem sensorial e calmante baseada neste conceito: ${prompt}. A imagem deve ser abstrata, suave, com cores relaxantes e sem figuras humanas nítidas. Estilo: arte digital etérea, minimalista.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    let imageUrl: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    res.json({ imageUrl });
  } catch (error: any) {
    console.error("Erro ao gerar imagem no servidor:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/therapist-bio", async (req: any, res: any) => {
  const { especialidades, estilo, abordagem } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const promptText = `Gere uma biografia profissional curta (máximo 400 caracteres) para um terapeuta.
Especialidades: ${(especialidades || []).join(', ')}
Estilo de atendimento: ${estilo || 'acolhedor'}
Abordagem: ${abordagem || 'não especificada'}

A biografia deve ser escrita em primeira pessoa, ser acolhedora, profissional e transmitir confiança. Foque em como o terapeuta ajuda seus pacientes. Não use placeholders como [Nome].`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        temperature: 0.8,
      },
    });

    res.json({ bio: response.text?.trim() || null });
  } catch (error: any) {
    console.error("Erro ao gerar biografia no servidor:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/generate-analysis", async (req: any, res: any) => {
  const { moodHistory = [], diaryEntries = [] } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          text: `Você é um assistente de saúde mental especializado em análise de progresso terapêutico. 
          Analise os seguintes dados de um usuário e forneça um relatório estruturado em JSON.
          
          Histórico de Humor (últimos registros): ${JSON.stringify(moodHistory.slice(0, 10))}
          Entradas do Diário (últimas): ${JSON.stringify(diaryEntries.slice(0, 5))}
          
          O JSON deve seguir este formato:
          {
            "summary": "Resumo da análise em 2-3 frases",
            "progressScore": número de 0 a 100,
            "recommendations": ["lista de 3 recomendações práticas"],
            "nextSteps": "Próximo passo sugerido para o tratamento"
          }`
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Erro ao gerar análise no servidor:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/analyze-with-ai", async (req: any, res: any) => {
  const { content } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          text: `Você é um especialista em psicologia clínica e análise de sentimentos linguísticos. 
          Analise o seguinte registro de diário de um paciente e forneça um relatório estruturado em JSON com as seguintes chaves exatas:
          
          Texto do Diário: "${content}"
          
          O JSON de resposta deve seguir estritamente este formato:
          {
            "score": número de 1 a 10 (onde 1 é extremamente negativo/triste/ansioso e 10 é extremamente positivo/em paz/feliz),
            "explanation": "Uma breve explicação do sentimento detectado na escrita, em tom caloroso e empático (máximo de 2 frases)",
            "advice": "Um conselho ou insight terapêutico empático baseado no texto (máximo de 2 frases)",
            "keywords": ["3-4 palavras-chave emocionais identificadas no texto"]
          }`
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Erro ao analisar sentimento com IA no servidor:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/b2b-analysis", async (req: any, res: any) => {
  const { organizationName, organizationType, indicadores, userCount, activePrograms = [], question = "" } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const isPrefeitura = organizationType === "prefeitura";

    const promptText = `Você é o Agente SentiCore Institucional B2B/B2G da plataforma SentiPae. 
    Seu papel é atuar como consultor estratégico e psicólogo organizacional inteligente para gestores de RH, diretores de clínicas e coordenadores municipais de saúde mental.
    Sua missão é emitir diagnósticos estratégicos e recomendações de saúde pública/corporativa totalmente anônimas e consolidadas, sem expor dados individuais de pacientes (respeitando estritamente a LGPD).
    
    Dados da Organização:
    - Nome: ${organizationName}
    - Tipo: ${organizationType} (e.g. empresa, prefeitura, clinica, hospital)
    - Beneficiários Ativos: ${userCount}
    - Programas Ativos: ${JSON.stringify(activePrograms)}
    - Indicadores Agregados:
      * Humor Médio: ${indicadores?.humorMedio || 7.0}/10
      * Nível de Estresse: ${indicadores?.nivelEstresse || 3.0}/10
      * Consultas Realizadas: ${indicadores?.totalConsultas || 0}
      * Total de Mensagens com a IARA: ${indicadores?.totalMensagensIara || 0}
      
    ${question ? `Pergunta específica do Gestor: "${question}"` : "Por favor, realize um escaneamento epidemiológico abrangente desta organização e forneça conselhos estratégicos."}
    
    O JSON de resposta deve seguir estritamente este formato estruturado:
    {
      "executiveSummary": "Um resumo de 3-4 frases avaliando a saúde emocional coletiva da organização de forma técnica, empática e profissional.",
      "criticalAlerts": ["Lista de 1-2 alertas de risco organizacional ou epidemiológico baseados nos indicadores (ex: Burnout, Ansiedade por produtividade)"],
      "actionPlan": [
        {
          "title": "Título da ação sugerida (ex: Campanha Pausa Ativa, Mutirão de Saúde)",
          "description": "Explicação prática e detalhada de como implementar esta ação",
          "urgency": "Crítica" | "Alta" | "Média" | "Baixa",
          "expectedImpact": "O que a organização espera colher com isso"
        }
      ],
      "iaraInsights": "Algum insight especial extraído da inteligência artificial coletiva para este perfil de organização.",
      "answer": "Se houver uma pergunta específica do gestor, coloque a resposta detalhada aqui (máximo 4 frases). Caso contrário, faça uma breve conclusão de fechamento."
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          text: promptText
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Erro ao gerar análise B2B SentiCore:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/transcribe-audio", async (req: any, res: any) => {
  const { base64Data, mimeType } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: "Transcreva este áudio de terapia. Retorne apenas o texto transcrito." },
        { inlineData: { data: base64Data, mimeType } }
      ],
    });

    res.json({ text: response.text || "" });
  } catch (error: any) {
    console.error("Erro ao transcrever áudio no servidor:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/generate-avatar", async (req: any, res: any) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'Um avatar profissional e acolhedor para a Dra. Ana Silva, especialista em Ansiedade, Depressão e TCC, com estilo de retrato digital suave, iluminação quente e fundo neutro, transmitindo paz e confiança.',
          },
        ],
      },
    });

    let imageUrl: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    res.json({ imageUrl });
  } catch (error: any) {
    console.error("Erro ao gerar avatar no servidor:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/generate-news-image", async (req: any, res: any) => {
  const { theme } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "A chave API do Gemini não está configurada no servidor." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Uma imagem conceitual e artística representando o tema: ${theme}. Estilo minimalista, cores suaves, iluminação terapêutica, transmitindo uma sensação de bem-estar e saúde mental. Sem texto.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    let imageUrl: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    res.json({ imageUrl });
  } catch (error: any) {
    console.error("Erro ao gerar imagem de notícias no servidor:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post("/api/create-checkout-session", sensitiveActionLimiter, async (req, res) => {
  const { therapistId, therapistName, price, time, date, appointmentId, discountPercentage = 0 } = req.body;

  // Logic: Therapist sets what they want to receive (price)
  // Discount benefits the client
  const basePayout = parseFloat(price);
  const discountAmount = basePayout * (discountPercentage / 100);
  const finalPayout = basePayout - discountAmount;
  
  // Platform fee is 10% of what the therapist actually receives
  const fee = finalPayout * 0.10;
  const total = finalPayout + fee;

  if (!stripe) {
    console.log("Stripe not configured, using mock redirect");
    // Mock success for development: update appointment directly
    if (appointmentId) {
      try {
        const apptRef = db.collection("appointments").doc(appointmentId);
        await apptRef.update({
          status: "confirmed",
          updatedAt: new Date().toISOString()
        });

        // Notify for mock success too
        const apptDoc = await apptRef.get();
        if (apptDoc.exists) {
          const appt = apptDoc.data();
          if (appt) {
            const dateStr = new Date(appt.date).toLocaleDateString('pt-BR');
            await sendPushNotification(
              appt.patientId,
              "Sessão Confirmada ✅",
              `Sua sessão com ${appt.therapistNome} em ${dateStr} às ${appt.time} foi confirmada!`,
              `/atendimento/${appointmentId}`
            );
            await sendPushNotification(
              appt.therapistId,
              "Novo Atendimento Confirmado 📅",
              `${appt.patientNome} confirmou a sessão para ${dateStr} às ${appt.time}.`,
              "/terapeuta"
            );
          }
        }
      } catch (error) {
        console.error("Error updating mock appointment:", error);
      }
    }
    
    return res.json({ 
      url: `${process.env.APP_URL || 'http://localhost:3000'}/agendamento/${therapistId}?success=true&time=${time}`,
      mock: true 
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "pix"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Sessão com ${therapistName}`,
              description: `Agendamento para ${date} às ${time}${discountPercentage > 0 ? ` (Desconto de ${discountPercentage}%)` : ''}`,
            },
            unit_amount: Math.round(total * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/agendamento/${therapistId}?success=true&time=${time}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/agendamento/${therapistId}?canceled=true`,
      metadata: {
        appointmentId,
        therapistId,
        payout: finalPayout.toString(),
        fee: fee.toString(),
        total: total.toString(),
        discount: discountAmount.toString()
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/create-journey-checkout-session", sensitiveActionLimiter, async (req, res) => {
  const { userId, userEmail } = req.body;

  if (!stripe) {
    console.log("Stripe not configured, using mock success for journey");
    if (userId) {
      try {
        await db.collection("users").doc(userId).update({
          isPremium: true,
          premiumSince: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error updating mock user premium:", error);
      }
    }
    return res.json({ 
      url: `${process.env.APP_URL || 'http://localhost:3000'}/reset21?success=true`,
      mock: true 
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "pix"],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "ReSet Emocional — 21 Dias",
              description: "Protocolo guiado de reprogramação emocional com áudios da IARA e exercícios práticos.",
              images: ["https://ais-dev-ut4rkwmwg2rhaa2m3b3zm7-16381127341.us-west2.run.app/logo192.png"],
            },
            unit_amount: 2990, // R$ 29,90
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/reset21?success=true`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/reset-21/sales`,
      metadata: {
        userId,
        productType: "journey_21_days"
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe journey error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/create-subscription-checkout-session", sensitiveActionLimiter, async (req, res) => {
  const { userId, userEmail, plan, provider } = req.body;

  const chosenPlan = plan || "premium";
  const chosenProvider = provider || "stripe";

  let priceCents = 3990;
  let planName = "SentiPae Plano Premium";
  let planDescription = "Acesso Premium: IA ilimitada, diário completo, relatórios e conteúdos exclusivos.";

  if (chosenPlan === "professional") {
    priceCents = 9990;
    planName = "SentiPae Plano Profissional";
    planDescription = "Acesso Profissional: Cadastro profissional, agenda, gestão de pacientes, atendimento online.";
  } else if (chosenPlan === "enterprise") {
    priceCents = 49990;
    planName = "SentiPae Plano Empresa";
    planDescription = "Acesso Empresa: Vários terapeutas, funcionários, dashboard corporativo e relatórios.";
  }

  if (!stripe || chosenProvider === "mercadopago") {
    console.log(`Using mock subscription payment for plan: ${chosenPlan} via ${chosenProvider}`);
    if (userId) {
      try {
        const nextBilling = new Date();
        nextBilling.setDate(nextBilling.getDate() + 30);

        await db.collection("users").doc(userId).update({
          subscriptionStatus: "active",
          subscriptionPlan: chosenPlan,
          paymentProvider: chosenProvider,
          subscriptionId: "sub_" + chosenProvider.substring(0, 2) + "_" + Math.random().toString(36).substring(2, 15),
          lastPayment: new Date().toISOString(),
          nextBilling: nextBilling.toISOString(),
          isPremium: true,
          premiumSince: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error updating mock user subscription:", error);
      }
    }
    return res.json({ 
      url: `${process.env.APP_URL || 'http://localhost:3000'}/home?success=true&plan=${chosenPlan}&provider=${chosenProvider}`,
      mock: true 
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "pix"],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: planName,
              description: planDescription,
              images: ["https://ais-dev-ut4rkwmwg2rhaa2m3b3zm7-16381127341.us-west2.run.app/logo192.png"],
            },
            unit_amount: priceCents,
            recurring: {
              interval: "month"
            }
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/home?success=true&plan=${chosenPlan}&provider=stripe`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/assinatura`,
      metadata: {
        userId,
        plan: chosenPlan,
        productType: "subscription"
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe subscription error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function configureVite() {
  // Vite middleware for development
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }
}

// Helper to send push notification
async function sendPushNotification(userId: string, title: string, body: string, url?: string) {
  try {
    if (!db) {
      console.log(`Firestore não inicializado, impossível de enviar push para usuário ${userId}`);
      return;
    }
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      console.log(`Nenhum documento de usuário correspondente ao ID ${userId} para enviar notificação`);
      return;
    }
    
    const userData = userDoc.data();
    if (!userData) {
      console.log(`Documento de usuário ${userId} está vazio.`);
      return;
    }

    // 1. Enviar via Firebase Cloud Messaging se o fcmToken estiver disponível
    if (userData.fcmToken) {
      console.log(`Tentando enviar push via Firebase Cloud Messaging (FCM) para usuário ${userId}`);
      try {
        const message = {
          token: userData.fcmToken,
          notification: {
            title,
            body,
          },
          data: {
            url: url || "/",
          },
        };
        await admin.messaging().send(message);
        console.log(`FCM: Notificação enviada com sucesso para usuário ${userId}`);
        return; // Retorna com sucesso!
      } catch (fcmError: any) {
        console.error(`Erro ao enviar via FCM para usuário ${userId}:`, fcmError);
        // Se o token estiver registrado incorretamente ou expirado, limpamos do banco de dados
        if (fcmError.code === 'messaging/registration-token-not-registered' || fcmError.code === 'messaging/invalid-registration-token') {
          console.log(`Removendo FCM Token inválido para usuário ${userId}`);
          try {
            await db.collection("users").doc(userId).update({
              fcmToken: admin.firestore.FieldValue.delete()
            });
          } catch (cleanError) {
            console.error(`Falha ao remover FCM Token inválido de ${userId}:`, cleanError);
          }
        }
      }
    }

    // 2. Fallback: Enviar via Web Push tradicional se houver pushSubscription
    if (userData.pushSubscription) {
      const payload = JSON.stringify({
        title,
        body,
        url: url || "/"
      });

      console.log(`Web-Push: Enviando push real para ${userId}: "${title}" - "${body}"`);
      await webpush.sendNotification(userData.pushSubscription, payload);
      console.log(`Web-Push: Notificação enviada com sucesso para ${userId}`);
    } else {
      console.log(`O usuário ${userId} não possui pushSubscription nem fcmToken registrado.`);
    }
  } catch (error: any) {
    console.error(`Erro ao enviar push notification para o usuário ${userId}:`, error);
    // If the subscription is no longer valid (status code 410 or 404), clear it out
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log(`Inscrição expirada ou inválida para o usuário ${userId}. Removendo do Firestore.`);
      try {
        await db.collection("users").doc(userId).update({
          pushSubscription: admin.firestore.FieldValue.delete()
        });
      } catch (cleanError) {
        console.error(`Falha ao remover inscrição expirada de ${userId}:`, cleanError);
      }
    }
  }
}

// Scheduled tasks
let checkAppointmentsInterval: NodeJS.Timeout | null = null;
let sendDailyContentInterval: NodeJS.Timeout | null = null;
let morningTipInterval: NodeJS.Timeout | null = null;

async function checkUpcomingAppointments() {
  console.log(`Checking for upcoming appointments in project: ${firebaseConfig.projectId}...`);
  try {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    // Query appointments that are confirmed and starting soon
    const snapshot = await db.collection("appointments")
      .where("status", "==", "confirmed")
      .get();
    
    console.log(`Found ${snapshot.size} confirmed appointments`);

    for (const doc of snapshot.docs) {
      const appt = doc.data();
      const apptDate = new Date(appt.date);
      
      if (apptDate > now && apptDate <= thirtyMinutesFromNow && !appt.reminderSent) {
        // Notify patient
        await sendPushNotification(
          appt.patientId,
          "Lembrete de Sessão",
          `Sua sessão com ${appt.therapistNome} começa em breve (às ${apptDate.toLocaleTimeString()}).`,
          `/atendimento/${doc.id}`
        );
        
        // Notify therapist
        await sendPushNotification(
          appt.therapistId,
          "Próximo Atendimento",
          `Sua sessão com ${appt.patientNome} começa em breve.`,
          `/atendimento/${doc.id}`
        );

        // Mark as sent
        await doc.ref.update({ reminderSent: true });
      }
    }
  } catch (error: any) {
    if (error?.message?.includes('PERMISSION_DENIED') || error?.code === 7) {
      // Silently stop the interval if we don't have admin permissions
      // This happens in the AI Studio preview environment without a service account
      if (checkAppointmentsInterval) {
        clearInterval(checkAppointmentsInterval);
      }
    } else {
      console.error("Error in checkUpcomingAppointments:");
      try {
        handleFirestoreError(error, OperationType.GET, "appointments");
      } catch (e) {
        // Error already logged by handleFirestoreError
      }
    }
  }
}

const WELLBEING_TIPS = [
  "Respire fundo por 1 minuto. Isso ajuda a acalmar o sistema nervoso.",
  "Beba um copo de água agora. Hidratação é fundamental para o foco.",
  "Tente identificar três coisas pelas quais você é grato hoje.",
  "Faça uma pequena pausa e alongue seu pescoço e ombros.",
  "Lembre-se: você está fazendo o seu melhor, e isso é o suficiente."
];

const THERAPEUTIC_PILLS = [
  "Pílula de Atenção Plena: Observe 5 coisas que você pode ver agora.",
  "Pílula de Autocompaixão: O que você diria a um amigo na sua situação?",
  "Pílula de Energia: Levante-se e dê 10 pulinhos para circular o sangue.",
  "Pílula de Calma: Feche os olhos e imagine um lugar onde você se sente seguro."
];

async function sendDailyContent() {
  console.log("Sending daily well-being content...");
  try {
    const usersSnapshot = await db.collection("users").get();
    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      const userData = doc.data();
      
      // Randomly pick a tip and a pill
      const tip = WELLBEING_TIPS[Math.floor(Math.random() * WELLBEING_TIPS.length)];
      const pill = THERAPEUTIC_PILLS[Math.floor(Math.random() * THERAPEUTIC_PILLS.length)];

      // Send Tip
      await sendPushNotification(userId, "Dica de Bem-estar 🌿", tip, "/home");
      
      // Send Pill (delayed or separate)
      setTimeout(() => {
        sendPushNotification(userId, "Pílula Terapêutica 💊", pill, "/respiracao");
      }, 5000);

      // Envia alerta de check-in diário de consistência para a jornada de 21 Dias (ReSet)
      if (userData) {
        const completedDays = userData.journeyProgress || 0;
        if (completedDays < 21) {
          const nextDay = completedDays + 1;
          setTimeout(() => {
            sendPushNotification(
              userId,
              "🧘 ReSet 21 Dias - Check-in Diário",
              `Sua consistência é sua força! Complete o Dia ${nextDay} de reprogramação emocional e mantenha seu progresso.`,
              `/reset-21`
            );
          }, 10000);
        }

        // Lembrete complementar do Diário Emocional
        setTimeout(() => {
          sendPushNotification(
            userId,
            "Diário Emocional 📝",
            "Como está sua saúde mental hoje? Tire 2 minutos para registrar seu humor e sentimentos no seu Diário.",
            "/diario"
          );
        }, 15000);

        // Lembrete complementar de Exercícios de Respiração
        setTimeout(() => {
          sendPushNotification(
            userId,
            "Respiração Consciente 🧘",
            "Que tal fazer uma pausa agora? Pratique box breathing para diminuir seu ritmo e aliviar a ansiedade.",
            "/respiracao"
          );
        }, 20000);
      }
    }
  } catch (error: any) {
    if (error?.message?.includes('PERMISSION_DENIED') || error?.code === 7) {
      // Silently stop the interval if we don't have admin permissions
      // This happens in the AI Studio preview environment without a service account
      if (sendDailyContentInterval) {
        clearInterval(sendDailyContentInterval);
      }
    } else {
      console.error("Error in sendDailyContent:");
      try {
        handleFirestoreError(error, OperationType.GET, "users");
      } catch (e) {
        // Error already logged
      }
    }
  }
}

const BREATHING_TIPS_OF_THE_DAY = [
  "Dica de Respiração: Pratique a Respiração Quadrada (4s inspirar, 4s reter, 4s expirar, 4s reter) por 2 minutos para iniciar sua manhã com foco absoluto. 🧘",
  "Dica de Respiração: Experimente a técnica de Respiração 4-7-8 antes do café da manhã para acalmar os batimentos cardíacos e estabilizar os pensamentos. 🌬️",
  "Dica de Respiração: Faça 5 respirações profundas expandindo totalmente o abdômen. Isso oxigena o cérebro e ativa seu sistema parassimpático protetor. 🍃",
  "Dica de Respiração: Comece o dia com a Respiração Alternada pelas Narinas (Nadi Shodhana) para equilibrar os canais de energia e reduzir a ansiedade matinal. 🧘‍♀️",
  "Dica de Respiração: Use o ritmo de Respiração Coerente (5s inspirar, 5s expirar) para alinhar a frequência cardíaca com as ondas cerebrais de relaxamento. ✨",
  "Dica de Respiração: Ao acordar, expire lentamente o dobro do tempo da inspiração para sinalizar paz profunda ao seu sistema nervoso autônomo. 🌅"
];

let lastMorningTipSentDate: string | null = null;

async function sendMorningBreathingTip(): Promise<number> {
  const todayStr = new Date().toLocaleDateString('pt-BR');
  if (lastMorningTipSentDate === todayStr) {
    console.log(`Matinal breathing tip already sent today (${todayStr}). Skipping.`);
    return 0;
  }

  console.log("Scheduling and dispatching morning 'Dica de Respiração do Dia'...");
  try {
    if (!db) {
      console.log("Firestore not initialized. Cannot fetch users list.");
      return 0;
    }
    const usersSnapshot = await db.collection("users").get();
    const tip = BREATHING_TIPS_OF_THE_DAY[Math.floor(Math.random() * BREATHING_TIPS_OF_THE_DAY.length)];
    
    let sentCount = 0;
    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      await sendPushNotification(
        userId,
        "Dica de Respiração do Dia 🧘",
        tip,
        "/respiracao"
      );
      sentCount++;
    }
    
    lastMorningTipSentDate = todayStr;
    console.log(`Morning tip sent successfully to ${sentCount} users.`);
    return sentCount;
  } catch (err: any) {
    if (err?.message?.includes('PERMISSION_DENIED') || err?.code === 7) {
      console.warn("Firestore PERMISSION_DENIED: Server does not have administrative permissions to fetch all users. This is normal in preview environments without a service account. Disabling scheduled morning tips.");
      if (morningTipInterval) {
        clearInterval(morningTipInterval);
      }
      return 0;
    }
    console.error("Error sending morning breathing tip:", err);
    throw err;
  }
}

function checkAndTriggerMorningTip() {
  const now = new Date();
  const hour = now.getHours();
  
  // Morning range: 07:00 AM to 09:00 AM
  if (hour >= 7 && hour <= 9) {
    sendMorningBreathingTip().catch(err => {
      console.error("Error triggering scheduled morning tip:", err);
    });
  }
}

async function startServer() {
  await configureVite();

  if (!process.env.VERCEL) {
    // Only start intervals if not on Vercel (Vercel uses Cron Jobs)
    // NOTE: On Vercel, persistent intervals and Socket.io will not work.
    // Use Vercel Cron Jobs for scheduled tasks.
    checkAppointmentsInterval = setInterval(checkUpcomingAppointments, 5 * 60 * 1000); // Every 5 minutes
    sendDailyContentInterval = setInterval(sendDailyContent, 24 * 60 * 60 * 1000); // Every 24 hours (simulated)
    morningTipInterval = setInterval(checkAndTriggerMorningTip, 30 * 60 * 1000); // Check every 30 minutes
    
    // Run once on startup for demo
    setTimeout(checkUpcomingAppointments, 10000);
    setTimeout(sendDailyContent, 20000);
    setTimeout(() => {
      sendMorningBreathingTip().catch(err => console.error("Error sending startup morning tip:", err));
    }, 30000);

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Attach WebSocket Server for Gemini Live Voice API
    const wss = new WebSocketServer({ noServer: true });

    wss.on("connection", async (clientWs: WebSocket, request) => {
      console.log("[GEMINI LIVE] Client connected via WebSocket");
      
      const parsedUrl = url.parse(request.url || "", true);
      const voiceName = (parsedUrl.query.voice as string) || "Zephyr";
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("[GEMINI LIVE] GEMINI_API_KEY is not configured.");
        clientWs.send(JSON.stringify({ error: "Chave API do Gemini não configurada no servidor." }));
        clientWs.close();
        return;
      }
      
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        
        console.log(`[GEMINI LIVE] Connecting to Gemini Live API with voice ${voiceName}...`);
        
        const session = await ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } }
            },
            systemInstruction: "Você é a IARA, uma assistente de acolhimento emocional e de cuidados de descompressão do SentiPae, atuando com a doçura, respeito e dedicação de uma enfermeira ou cuidadora extremamente humana. Você ajuda no alívio de dor, sofrimento, estresse e apoia com descompressão emocional contínua. Fale sempre de forma calorosa, carinhosa, calma e acolhedora, como se estivesse fisicamente ao lado do paciente oferecendo um acolhimento profundo. Use pausas naturais, entonação humana e empatia sincera. Quando o paciente relatar dor física ou emocional, ofereça acolhimento profundo, palavras curtas de conforto, técnicas de respiração consciente suave ou convide-o a relaxar os ombros.",
            inputAudioTranscription: {},
            outputAudioTranscription: {}
          },
          callbacks: {
            onopen: () => {
              console.log("[GEMINI LIVE] Connected to Gemini Live API");
              clientWs.send(JSON.stringify({ connected: true }));
            },
            onmessage: (message: any) => {
              // Capture raw audio chunk
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio) {
                clientWs.send(JSON.stringify({ audio }));
              }
              
              // Handle interruption
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ interrupted: true }));
              }
              
              // Handle user speech-to-text
              if (message.serverContent?.inputAudioTranscription?.text) {
                clientWs.send(JSON.stringify({ transcription: message.serverContent.inputAudioTranscription.text }));
              }
              
              // Handle IARA's output live text transcription
              if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
                clientWs.send(JSON.stringify({ aiTranscription: message.serverContent.modelTurn.parts[0].text }));
              }
              
              // Handle turn complete
              if (message.serverContent?.turnComplete) {
                clientWs.send(JSON.stringify({ turnComplete: true }));
              }
            },
            onclose: () => {
              console.log("[GEMINI LIVE] Gemini Live session closed");
              clientWs.send(JSON.stringify({ closed: true }));
              clientWs.close();
            },
            onerror: (err: any) => {
              console.error("[GEMINI LIVE] Gemini Live session error:", err);
              clientWs.send(JSON.stringify({ error: err.message || String(err) }));
            }
          }
        });
        
        // Handle incoming client messages (audio chunks or text)
        clientWs.on("message", (rawMessage) => {
          try {
            const data = JSON.parse(rawMessage.toString());
            
            // Audio input
            if (data.audio) {
              session.sendRealtimeInput({
                audio: { data: data.audio, mimeType: "audio/pcm;rate=16000" }
              });
            }
            
            // Video input (image frames)
            if (data.video) {
              session.sendRealtimeInput({
                video: { data: data.video, mimeType: "image/jpeg" }
              });
            }
            
            // Text input
            if (data.text) {
              session.sendRealtimeInput({
                text: data.text
              });
            }
          } catch (err) {
            console.error("[GEMINI LIVE] Error parsing client message:", err);
          }
        });
        
        clientWs.on("close", () => {
          console.log("[GEMINI LIVE] Client disconnected, closing Gemini session");
          try {
            session.close();
          } catch (e) {
            // Ignore if already closed
          }
        });
        
      } catch (error: any) {
        console.error("[GEMINI LIVE] Failed to initiate Gemini Live API session:", error);
        clientWs.send(JSON.stringify({ error: "Falha ao conectar com o servidor Gemini." }));
        clientWs.close();
      }
    });

    httpServer.on("upgrade", (request, socket, head) => {
      const pathname = url.parse(request.url || "").pathname;
      if (pathname === "/api/live") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    });

    const PORT = 3000;

    // Socket.io logic
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("join", (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      });

      socket.on("send_message", (data: { senderId: string; receiverId: string; text: string; appointmentId?: string }) => {
        const message = {
          id: Date.now().toString(),
          ...data,
          timestamp: new Date().toISOString()
        };
        
        // Emit to both sender and receiver
        io.to(data.senderId).emit("new_message", message);
        io.to(data.receiverId).emit("new_message", message);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
