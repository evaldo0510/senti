import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Send, Mic, Volume2, VolumeX, Zap, HeartHandshake, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { falarComIARA, ChatMessage } from "../services/iaraService";
import { falarTexto } from "../services/voiceService";
import { ouvirUsuario } from "../services/audioInput";
import { playPCM, stopAllAudio } from "../services/audioPlayer";
import { auth } from "../services/firebase";
import { salvarDadosAnalytics } from "../services/analyticsService";

interface Message {
  tipo: "user" | "iara";
  texto: string;
}

export default function IARATriageChat() {
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState("");
  const [chat, setChat] = useState<Message[]>([
    { tipo: "iara", texto: "Olá. Eu sou a IARA. Estou aqui para te ouvir e entender como posso te ajudar hoje. O que está acontecendo?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [step, setStep] = useState(0); // 0: Acolhimento, 1: Avaliação, 2: Triagem, 3: Direcionamento
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioSource = useRef<AudioBufferSourceNode | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const playAudio = async (base64Audio: string) => {
    if (isMuted) return;
    if (currentAudioSource.current) {
      try { currentAudioSource.current.stop(); } catch (e) {}
    }
    const source = await playPCM(base64Audio);
    if (source) {
      currentAudioSource.current = source;
      setIsSpeaking(true);
      source.onended = () => setIsSpeaking(false);
    }
  };

  const enviarMensagem = async (textoOverride?: string) => {
    const msgAtual = textoOverride || mensagem;
    if (!msgAtual.trim() || isLoading) return;

    const novaConversa: Message[] = [...chat, { tipo: "user", texto: msgAtual }];
    setChat(novaConversa);
    if (!textoOverride) setMensagem("");
    setIsLoading(true);

    const historico: ChatMessage[] = chat.map(msg => ({
      role: msg.tipo === "user" ? "user" : "model",
      parts: [{ text: msg.texto }]
    }));

    try {
      const result = await falarComIARA(msgAtual, historico);
      
      // Update triage step based on result
      if (result.risco === "alto") setStep(3);
      else if (result.direcionarEspecialista) setStep(3);
      else if (chat.length > 4) setStep(2);
      else if (chat.length > 2) setStep(1);

      setChat([...novaConversa, { tipo: "iara", texto: result.resposta }]);
      
      if (!isMuted) {
        const base64Audio = await falarTexto(result.resposta);
        if (base64Audio) playAudio(base64Audio);
      }

      // Analytics
      salvarDadosAnalytics({
        usuario: auth.currentUser?.displayName || "Anônimo",
        humor: result.intensidade,
        risco: result.risco,
        atendimento: result.direcionarEspecialista ? "sim" : "nao",
        tipo: "IARA_TRIAGEM"
      });

      if (result.risco === "alto") {
        setTimeout(() => navigate("/emergencia"), 3000);
      } else if (result.direcionarEspecialista) {
        setTimeout(() => navigate("/profissionais"), 5000);
      }

    } catch (error) {
      console.error("Erro na triagem IARA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) return;
    setIsListening(true);
    ouvirUsuario(
      (texto) => {
        setMensagem(texto);
        enviarMensagem(texto);
      },
      () => setIsListening(false)
    );
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">IARA Triagem</h3>
            <div className="flex gap-1 mt-1">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`h-1 w-4 rounded-full ${step >= i ? "bg-emerald-500" : "bg-white/10"}`} />
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className={`w-4 h-4 ${isSpeaking ? "text-emerald-400 animate-pulse" : "text-slate-400"}`} />}
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {chat.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.tipo === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.tipo === "user" ? "bg-emerald-600/20 text-emerald-50 border border-emerald-500/20" : "bg-white/5 text-slate-200 border border-white/5"
            }`}>
              {msg.texto}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={handleMicClick}
            className={`p-3 rounded-xl transition-all ${isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
            placeholder="Fale com a IARA..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button
            onClick={() => enviarMensagem()}
            disabled={!mensagem.trim() || isLoading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
