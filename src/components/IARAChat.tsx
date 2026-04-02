import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  Zap, 
  HeartHandshake, 
  AlertTriangle, 
  ArrowRight, 
  Loader2,
  Image as ImageIcon,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { falarComIARA, ChatMessage } from "../services/iaraService";
import { falarTexto } from "../services/voiceService";
import { ouvirUsuario } from "../services/audioInput";
import { playPCM, stopAllAudio } from "../services/audioPlayer";
import { generateImage } from "../services/geminiService";
import { auth } from "../services/firebase";
import { salvarDadosAnalytics } from "../services/analyticsService";
import { cn } from "../lib/utils";

interface Message {
  tipo: "user" | "iara";
  texto: string;
  imagem?: string | null;
}

interface IARAChatProps {
  initialMessage?: string;
  context?: string;
  onRiscoAlto?: () => void;
  onDirecionar?: (especialidade: string) => void;
  className?: string;
}

export default function IARAChat({ 
  initialMessage, 
  context, 
  onRiscoAlto, 
  onDirecionar,
  className 
}: IARAChatProps) {
  const [mensagem, setMensagem] = useState("");
  const [chat, setChat] = useState<Message[]>([
    { 
      tipo: "iara", 
      texto: initialMessage || "Olá. Eu sou a IARA, sua inteligência de acolhimento emocional. Como você está se sentindo agora?" 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [emocaoAtual, setEmocaoAtual] = useState({ emocao: "calma", intensidade: 5 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioSource = useRef<AudioBufferSourceNode | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, isLoading, isGeneratingImage]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

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
      const result = await falarComIARA(msgAtual, historico, emocaoAtual);
      
      setEmocaoAtual({ emocao: result.emocao, intensidade: result.intensidade });

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
        tipo: "IARA_COMPONENTE"
      });

      if (result.risco === "alto" && onRiscoAlto) {
        onRiscoAlto();
      } else if (result.direcionarEspecialista && onDirecionar) {
        onDirecionar(result.emocao);
      }

    } catch (error) {
      console.error("Erro no chat IARA:", error);
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

  const handleGerarImagem = async () => {
    if (isLoading || isGeneratingImage) return;
    setIsGeneratingImage(true);
    
    const lastUserMessage = chat.slice().reverse().find(m => m.tipo === "user")?.texto || "Paz e tranquilidade";
    const imageData = await generateImage(lastUserMessage);
    
    if (imageData) {
      setChat(prev => [...prev, { 
        tipo: "iara", 
        texto: "Criei esta imagem para ajudar você a se acalmar e focar no momento presente...", 
        imagem: imageData 
      }]);
    }
    setIsGeneratingImage(false);
  };

  return (
    <div className={cn("flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl", className)}>
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">IARA Chat</h3>
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", emocaoAtual.intensidade > 7 ? "bg-red-500" : "bg-emerald-500")} />
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {emocaoAtual.emocao} ({emocaoAtual.intensidade}/10)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleGerarImagem}
            disabled={isGeneratingImage || isLoading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-emerald-400"
            title="Gerar imagem calmante"
          >
            {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className={cn("w-4 h-4", isSpeaking ? "text-emerald-400 animate-pulse" : "text-slate-400")} />}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {chat.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn("flex", msg.tipo === "user" ? "justify-end" : "justify-start")}
          >
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
              msg.tipo === "user" 
                ? "bg-emerald-600/20 text-emerald-50 border border-emerald-500/20 rounded-tr-sm" 
                : "bg-white/5 text-slate-200 border border-white/5 rounded-tl-sm"
            )}>
              <p className="whitespace-pre-wrap">{msg.texto}</p>
              {msg.imagem && (
                <img 
                  src={msg.imagem} 
                  alt="IARA visual" 
                  className="mt-3 rounded-xl w-full object-cover shadow-lg border border-white/10"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">IARA está processando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/5">
        <div className="flex items-end gap-2">
          <button
            onClick={handleMicClick}
            disabled={isLoading || isListening}
            className={cn(
              "p-3 rounded-xl transition-all flex-shrink-0",
              isListening 
                ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
            )}
          >
            <Mic className="w-4 h-4" />
          </button>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviarMensagem();
              }
            }}
            placeholder="Fale com a IARA..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none min-h-[48px] max-h-32"
            rows={1}
          />
          <button
            onClick={() => enviarMensagem()}
            disabled={!mensagem.trim() || isLoading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
