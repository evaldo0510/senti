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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any;
try {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (error) {
  console.error("Error reading firebase-applet-config.json:", error);
  firebaseConfig = {}; // Fallback for build/analysis phase
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
  
  // Try to get service account email for debugging (silent)
  admin.auth().listUsers(1).catch(() => {
    // This is expected to fail if not using a service account with admin privileges
  });

  console.log(`Firebase Admin initialized successfully. Project: ${firebaseConfig.projectId}, Database: ${databaseId || "(default)"}`);
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

// Configure web-push
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:suporte@senti.com.br",
    vapidPublicKey,
    vapidPrivateKey
  );
} else {
  console.warn("VAPID keys not found in environment variables. Push notifications will not work.");
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

    if (productType === "journey_21_days" && userId) {
      console.log(`Activating premium for user: ${userId}`);
      try {
        await db.collection("users").doc(userId).update({
          isPremium: true,
          premiumSince: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error updating user premium status:", error);
      }
    }
  }

  res.json({ received: true });
});

// Standard JSON parsing for other routes
app.use(express.json());

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
  res.json({ publicKey: vapidPublicKey });
});

app.post("/api/push/subscribe", async (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription) {
    return res.status(400).json({ error: "userId and subscription are required" });
  }

  try {
    // Store subscription in Firestore under the user's document
    // We use the endpoint as the document ID (base64 encoded to avoid invalid characters)
    const docId = Buffer.from(subscription.endpoint).toString('base64').replace(/\//g, '_');
    await db.collection("users").doc(userId).collection("pushSubscriptions").doc(docId).set(subscription);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error saving subscription:", error);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

app.post("/api/push/send", async (req, res) => {
  const { userId, title, body, url } = req.body;
  if (!userId || !title) {
    return res.status(400).json({ error: "userId and title are required" });
  }

  try {
    const subscriptionsSnapshot = await db.collection("users").doc(userId).collection("pushSubscriptions").get();
    if (subscriptionsSnapshot.empty) {
      return res.status(404).json({ error: "No subscriptions found for user" });
    }

    const payload = JSON.stringify({ title, body, url });
    const sendPromises = subscriptionsSnapshot.docs.map(async (doc) => {
      const subscription = doc.data() as webpush.PushSubscription;
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription has expired or is no longer valid
          await doc.ref.delete();
        } else {
          console.error("Error sending push notification:", error);
        }
      }
    });

    await Promise.all(sendPromises);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending push notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

app.post("/api/create-checkout-session", async (req, res) => {
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

app.post("/api/create-journey-checkout-session", async (req, res) => {
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

async function configureVite() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
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
    const subscriptionsSnapshot = await db.collection("users").doc(userId).collection("pushSubscriptions").get();
    if (subscriptionsSnapshot.empty) return;

    const payload = JSON.stringify({ title, body, url });
    const sendPromises = subscriptionsSnapshot.docs.map(async (doc) => {
      const subscription = doc.data() as webpush.PushSubscription;
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          await doc.ref.delete();
        }
      }
    });
    await Promise.all(sendPromises);
  } catch (error) {
    console.error(`Error sending push to ${userId}:`, error);
  }
}

// Scheduled tasks
let checkAppointmentsInterval: NodeJS.Timeout | null = null;
let sendDailyContentInterval: NodeJS.Timeout | null = null;

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
      
      // Randomly pick a tip and a pill
      const tip = WELLBEING_TIPS[Math.floor(Math.random() * WELLBEING_TIPS.length)];
      const pill = THERAPEUTIC_PILLS[Math.floor(Math.random() * THERAPEUTIC_PILLS.length)];

      // Send Tip
      await sendPushNotification(userId, "Dica de Bem-estar 🌿", tip, "/home");
      
      // Send Pill (delayed or separate)
      setTimeout(() => {
        sendPushNotification(userId, "Pílula Terapêutica 💊", pill, "/respiracao");
      }, 5000);
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

async function startServer() {
  await configureVite();

  if (!process.env.VERCEL) {
    // Only start intervals if not on Vercel (Vercel uses Cron Jobs)
    // NOTE: On Vercel, persistent intervals and Socket.io will not work.
    // Use Vercel Cron Jobs for scheduled tasks.
    checkAppointmentsInterval = setInterval(checkUpcomingAppointments, 5 * 60 * 1000); // Every 5 minutes
    sendDailyContentInterval = setInterval(sendDailyContent, 24 * 60 * 60 * 1000); // Every 24 hours (simulated)
    
    // Run once on startup for demo
    setTimeout(checkUpcomingAppointments, 10000);
    setTimeout(sendDailyContent, 20000);

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
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
