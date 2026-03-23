export function falarTexto(texto: string) {
  if (!('speechSynthesis' in window)) return;
  
  // Cancela falas anteriores
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(texto);
  speech.lang = "pt-BR";
  speech.rate = 0.85; // Fala mais lenta e calma
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}
