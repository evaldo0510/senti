export function ouvirUsuario(setMensagem: (msg: string) => void, onEnd?: () => void) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert("Reconhecimento de voz não suportado neste navegador.");
    if (onEnd) onEnd();
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const texto = event.results[0][0].transcript;
    setMensagem(texto);
  };

  if (onEnd) {
    recognition.onend = onEnd;
    recognition.onerror = onEnd;
  }

  recognition.start();
}
