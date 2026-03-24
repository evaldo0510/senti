import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
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

      if (appointmentId) {
        console.log(`Confirming appointment: ${appointmentId}`);
        try {
          await db.collection("appointments").doc(appointmentId).update({
            status: "confirmed",
            paymentId: session.id,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error updating appointment:", error);
        }
      }
    }

    res.json({ received: true });
  });

  // Standard JSON parsing for other routes
  app.use(express.json());
  
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

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
          await db.collection("appointments").doc(appointmentId).update({
            status: "confirmed",
            updatedAt: new Date().toISOString()
          });
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
        payment_method_types: ["card"],
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
