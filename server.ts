import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Modality } from "@google/genai";

// Ensure fetch is available globally for @google/genai in Node environments
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = fetch;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
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

  app.post("/api/chat", async (req, res) => {
    try {
      const { mensagemUsuario, historico, contexto, memoria } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing" });
      }

      const ai = new GoogleGenAI({ apiKey });

      function detectarRisco(texto: string): "normal" | "alto" {
        const palavrasRisco = [
          "me machucar", "não aguento mais", "quero morrer", "acabar com tudo",
          "sumir", "me matar", "desistir de tudo"
        ];
        const textoLower = texto.toLowerCase();
        for (let palavra of palavrasRisco) {
          if (textoLower.includes(palavra)) return "alto";
        }
        return "normal";
      }

      const risco = detectarRisco(mensagemUsuario);

      let systemInstruction = `Você é IARA, uma Interface de Acolhimento e Regulação Afetiva baseada em Poesia Cognitiva Hipnótica (PCH).
Regras:
- Fale com calma, use pausas (reticências).
- Use linguagem acolhedora, empática e validante.
- Nunca seja robótica, clínica ou interrogativa.
- Respostas curtas (máximo 3-4 linhas).
- Ajude a regulação da emoção antes de aconselhar.
- Use metáforas reguladoras simples (ex: "como uma folha caindo", "como a maré").
- Não dê diagnósticos.
- Se o risco for ALTO, priorize segurança e ajuda imediata, mas mantenha a calma e o acolhimento.`;

      if (contexto && contexto.emocao) {
        systemInstruction += `\n\nContexto atual do usuário: Sentindo ${contexto.emocao} com intensidade ${contexto.intensidade}/10.`;
      }
      if (memoria) {
        systemInstruction += `\n\nÚltima conversa do usuário: ${memoria}`;
      }
      systemInstruction += `\n\nEstado de risco detectado: ${risco}`;

      const contents = historico ? historico.map((msg: any) => ({
        role: msg.role,
        parts: msg.parts
      })) : [];
      
      contents.push({
        role: "user",
        parts: [{ text: mensagemUsuario }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ resposta: response.text || "Estou aqui com você...", risco });
    } catch (error) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/speech", async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ audio: base64Audio });
    } catch (error) {
      console.error("Error in /api/speech:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/image", async (req, res) => {
    try {
      const { prompt } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing" });
      }

      const ai = new GoogleGenAI({ apiKey });

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

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return res.json({ image: `data:image/png;base64,${part.inlineData.data}` });
        }
      }
      res.json({ image: null });
    } catch (error) {
      console.error("Error in /api/image:", error);
      res.status(500).json({ error: "Internal server error" });
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
