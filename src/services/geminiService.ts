import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

// 🧠 memória simples em sessão
let historico: string[] = [];

export async function gerarRespostaPCH(mensagem: string) {
  try {
    // adiciona mensagem do usuário
    historico.push(`Usuário: ${mensagem}`);

    // limita memória (últimas 6 interações)
    if (historico.length > 6) {
      historico.shift();
    }

    const contexto = historico.join("\n");

    const prompt = `
Você é um terapeuta que usa Poesia Cognitiva Hipnótica (PCH).

Histórico da conversa:
${contexto}

Objetivo:
- lembrar do que o usuário disse antes
- responder com continuidade emocional
- usar linguagem acolhedora, metafórica e clara

Nova mensagem:
"${mensagem}"

Resposta:
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });

    const texto = response.text;

    // salva resposta da IA
    historico.push(`IA: ${texto}`);

    return texto;
  } catch (error) {
    console.error("Erro Gemini:", error);
    return "Estou aqui com você… mas algo interno falhou.";
  }
}
export const IARA_SYSTEM_INSTRUCTION = `
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
export function resetMemoria() {
  historico = [];
}
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

export async function getIARAResponse(
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = [],
  contexto?: { emocao: string; intensidade: number },
  memoria?: string
) {
  const risk = detectRisk(message);
  
  try {
    let systemInstruction = IARA_SYSTEM_INSTRUCTION;
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
        // If it's not JSON, it's the fallback local storage memory
        systemInstruction += `\n\nMemória de longo prazo: ${memoria}`;
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    const data = JSON.parse(response.text || "{}");
    
    // Override risk if detected manually for safety
    if (risk === 'alto') data.risco = 'alto';

    return { 
      text: data.resposta || "Estou aqui com você... sinta sua respiração...", 
      emocao: data.emocao_detectada || "calma",
      intensidade: data.intensidade || 5,
      sugerirRespiracao: data.sugerir_respiracao || false,
      direcionarEspecialista: data.direcionar_especialista || false,
      risk: data.risco || "normal"
    };
  } catch (error) {
    console.error("Erro ao chamar IARA:", error);
    return { 
      text: "Sinto muito... tive um pequeno tropeço técnico... mas minha presença continua aqui com você.",
      risk: "normal",
      emocao: "calma",
      intensidade: 5,
      sugerirRespiracao: false,
      direcionarEspecialista: false
    };
  }
}

export async function generateSpeech(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
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

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("Erro ao gerar voz:", error);
    return null;
  }
}

export async function generateImage(prompt: string) {
  try {
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
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    return null;
  }
}
