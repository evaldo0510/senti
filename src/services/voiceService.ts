import { generateSpeech } from "./geminiService";

export async function falarTexto(texto: string): Promise<string | null> {
  // Tenta usar a API do Gemini para voz mais humana
  const base64Audio = await generateSpeech(texto);
  
  if (base64Audio) {
    return base64Audio;
  }

  // Fallback para síntese de voz nativa do navegador
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(texto);
    speech.lang = "pt-BR";
    speech.rate = 0.85;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  }
  
  return null;
}
