import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate() {
  try {
    console.log("Generating image...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A professional and welcoming digital portrait avatar of a female therapist named Dra. Ana Silva. Soft digital portrait style, warm lighting, neutral background, conveying peace and trust. She has a warm, empathetic smile, wearing professional yet approachable clothing. High quality, detailed.',
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(path.join(publicDir, 'ana-silva.png'), Buffer.from(base64EncodeString, 'base64'));
        console.log('Image saved to public/ana-silva.png');
      }
    }
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

generate();
