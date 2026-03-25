import { generateImage } from "./src/services/geminiService";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Um avatar profissional, acolhedor e moderno para uma terapeuta chamada Dra. Ana Silva, especialista em Ansiedade, Depressão e Terapia Cognitivo-Comportamental. Estilo: retrato digital suave, iluminação quente, fundo neutro, transmitindo paz e confiança.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log(`data:image/png;base64,${part.inlineData.data.substring(0, 50)}...`);
        // We'll write it to a file
        const fs = require('fs');
        fs.writeFileSync('avatar.txt', `data:image/png;base64,${part.inlineData.data}`);
        console.log("Saved to avatar.txt");
        return;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

run();
