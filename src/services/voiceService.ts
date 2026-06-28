import { generateSpeech } from "./geminiService";

export async function falarTexto(texto: string): Promise<string | null> {
  try {
    // Tenta usar a API do Gemini para voz mais humana
    const base64Audio = await generateSpeech(texto);
    
    if (base64Audio) {
      return base64Audio;
    }
  } catch (error) {
    console.warn("Erro ao gerar voz via Gemini API, usando fallback nativo:", error);
  }

  // Fallback para síntese de voz nativa do navegador
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(texto);
      speech.lang = "pt-BR";
      
      // Tenta obter as vozes disponíveis no navegador para escolher pt-BR
      const voices = window.speechSynthesis.getVoices();
      const ptBRVoice = voices.find(
        (voice) => voice.lang.startsWith("pt-BR") || voice.lang.startsWith("pt")
      );
      if (ptBRVoice) {
        speech.voice = ptBRVoice;
      }
      
      speech.rate = 0.95;
      speech.pitch = 1.0;
      
      speech.onerror = (e) => {
        console.error("SpeechSynthesis utterance error:", e);
      };

      window.speechSynthesis.speak(speech);
    } catch (speechErr) {
      console.error("Error with native speechSynthesis:", speechErr);
    }
  }
  
  return null;
}
