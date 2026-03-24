import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { falarComIARA, ChatMessage } from "../services/iaraService";
import { encontrarTerapeutas } from "../services/matchService";
import { generateImage } from "../services/geminiService";
import { falarTexto } from "../services/voiceService";
import { ouvirUsuario } from "../services/audioInput";
import { analisarEmocao } from "../services/emocaoService";
import { gerarExercicio } from "../services/pchService";
import { decidirCaminho } from "../services/decisaoService";
import { playPCM, stopAllAudio } from "../services/audioPlayer";
import { Send, ArrowLeft, HeartHandshake, AlertTriangle, Volume2, VolumeX, Image as ImageIcon, Mic, Book, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../services/firebase";
import { salvarDadosAnalytics } from "../services/analyticsService";

interface Message {
  tipo: "user" | "iara";
  texto: string;
  audio?: string | null;
  imagem?: string | null;
}

export default function ChatIARA() {
  const location = useLocation();
  const navigate = useNavigate();
  const { intensidade, emocao } = location.state || {};

  const [mensagem, setMensagem] = useState("");
  const [chat, setChat] = useState<Message[]>([
    { tipo: "iara", texto: "Olá. Eu sou a IARA, a inteligência de acolhimento da SENTI. Como você está se sentindo agora?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [alerta, setAlerta] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioSource = useRef<AudioBufferSourceNode | null>(null);

  const steps = [
    { id: 0, label: "Identificação", completed: true },
    { id: 1, label: "Sinais Vitais", completed: true },
    { id: 2, label: "Clínico Geral", active: true },
    { id: 3, label: "Especialista" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, alerta, isGeneratingImage]);

  useEffect(() => {
    const speakInitial = async () => {
      if (!isMuted && chat.length === 1 && chat[0].tipo === "iara") {
        const base64Audio = await falarTexto(chat[0].texto);
        if (base64Audio) {
          playAudio(base64Audio);
        }
      }
    };
    speakInitial();

    return () => {
      stopAllAudio();
    };
  }, []);

  const playAudio = async (base64Audio: string) => {
    if (isMuted) return;
    
    if (currentAudioSource.current) {
      try {
        currentAudioSource.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }
    
    const source = await playPCM(base64Audio);
    if (source) {
      currentAudioSource.current = source;
    }
  };

  const [emocaoAtual, setEmocaoAtual] = useState<{ emocao: string; intensidade: number }>({ emocao: emocao || "calma", intensidade: intensidade || 5 });
  const [showBreathing, setShowBreathing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const enviarMensagem = async () => {
    if (!mensagem.trim() || isLoading) return;

    const novaConversa: Message[] = [...chat, { tipo: "user", texto: mensagem }];
    setChat(novaConversa);
    const msgAtual = mensagem;
    setMensagem("");
    setIsLoading(true);

    const historico: ChatMessage[] = chat.map(msg => ({
      role: msg.tipo === "user" ? "user" : "model",
      parts: [{ text: msg.texto }]
    }));

    try {
      const result = await falarComIARA(msgAtual, historico, emocaoAtual);
      
      setEmocaoAtual({ emocao: result.emocao, intensidade: result.intensidade });
      
      if (result.risco === "alto") {
        setAlerta(true);
      }

      // Salva os dados para o Looker Studio
      salvarDadosAnalytics({
        usuario: auth.currentUser?.displayName || "Anônimo",
        humor: result.intensidade,
        risco: result.risco,
        atendimento: result.direcionarEspecialista ? "sim" : "nao",
        tipo: "IARA"
      });

      setChat([...novaConversa, { tipo: "iara", texto: result.resposta }]);
      
      if (!isMuted) {
        const base64Audio = await falarTexto(result.resposta);
        if (base64Audio) {
          playAudio(base64Audio);
        }
      }

      // Handle contextual breathing
      if (result.sugerirRespiracao) {
        setTimeout(() => setShowBreathing(true), 1500);
      }

      // Handle specialist transition
      if (result.direcionarEspecialista) {
        setIsTransitioning(true);
        setTimeout(async () => {
          const terapeutas = await encontrarTerapeutas(msgAtual);
          const terapeutaPrincipal = terapeutas[0];
          navigate(`/profissionais?tipo=${terapeutaPrincipal?.especialidades?.[0] || "geral"}`);
        }, 5000);
      }

    } catch (error) {
      console.error("Erro no chat:", error);
    } finally {
      setIsLoading(false);
    }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (newMuted && currentAudioSource.current) {
      try {
        currentAudioSource.current.stop();
      } catch (e) {
        // Ignore
      }
    }
  };

  const handleMicClick = () => {
    if (isListening) return;
    setIsListening(true);
    ouvirUsuario(
      (texto) => setMensagem(texto),
      () => setIsListening(false)
    );
  };

  const handleReplay = async (texto: string) => {
    const base64Audio = await falarTexto(texto);
    if (base64Audio) {
      playAudio(base64Audio);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-screen bg-[#0a0502] text-slate-100 relative overflow-hidden"
    >
      {/* Breathing Overlay */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="space-y-12 max-w-sm w-full">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-emerald-400 tracking-tighter">Respire com a IARA</h2>
                <p className="text-slate-400">Siga o movimento do círculo para estabilizar seu coração.</p>
              </div>
              
              <div className="relative flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 bg-emerald-500/20 rounded-full border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                />
                <motion.div 
                  animate={{ scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-24 h-24 bg-emerald-400/30 rounded-full blur-xl"
                />
                <div className="absolute text-emerald-400 font-bold tracking-widest uppercase text-xs">
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 8, repeat: Infinity, times: [0, 0.5, 1] }}
                  >
                    Inspira...
                  </motion.span>
                </div>
              </div>

              <button 
                onClick={() => setShowBreathing(false)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all"
              >
                Estou melhor, obrigado
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-6 right-6 z-[90] bg-emerald-600 p-6 rounded-[32px] shadow-2xl flex items-center gap-6 border border-emerald-400/30"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white text-lg leading-tight">Conectando com Especialista</h3>
              <p className="text-emerald-100 text-sm">A IARA identificou que você precisa de um acolhimento humano agora.</p>
            </div>
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xs flex gap-2 px-6 z-50 pointer-events-none">
        {steps.map((s, i) => (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              s.completed || s.active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/20 backdrop-blur-xl sticky top-0 z-10 pt-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tighter text-emerald-400">IARA</h2>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-emerald-500/20">Clínico Geral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                emocaoAtual.intensidade > 7 ? "bg-red-500" : "bg-emerald-500"
              }`} />
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Detectado: {emocaoAtual.emocao} ({emocaoAtual.intensidade}/10)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate("/chat")}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium transition-colors border border-emerald-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Falar com IARA</span>
          </button>
          <button 
            onClick={() => navigate("/diario")}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-900/30 hover:bg-indigo-800/50 text-indigo-300 rounded-full text-sm font-medium transition-colors border border-indigo-500/20"
          >
            <Book className="w-4 h-4" />
            <span className="hidden sm:inline">Diário</span>
          </button>
          <button 
            onClick={toggleMute}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300"
            title={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => navigate("/profissionais")}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 rounded-full text-sm font-medium transition-colors border border-emerald-500/20"
          >
            <HeartHandshake className="w-4 h-4" />
            <span className="hidden sm:inline">Falar com Terapeuta</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isExercising && (
          <div className="flex justify-center my-4">
            <div 
              className="w-20 h-20 rounded-full bg-emerald-500 mx-auto"
              style={{ animation: "pulse 4s infinite" }}
            />
          </div>
        )}
        {alerta && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/30 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 text-red-200"
          >
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-300 mb-1">Você não está sozinho.</p>
              <p className="text-sm text-red-200/80 mb-3">Por favor, procure ajuda imediata. Existem pessoas prontas para te ouvir agora mesmo.</p>
              <a href="tel:188" className="inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors">
                Ligar 188 (CVV)
              </a>
            </div>
          </motion.div>
        )}

        {chat.map((msg, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={index}
            className={`flex ${msg.tipo === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.tipo === "user"
                  ? "bg-emerald-600/20 text-emerald-50 rounded-tr-sm border border-emerald-500/20"
                  : "bg-slate-800/50 text-slate-200 rounded-tl-sm border border-white/5"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
              {msg.tipo === "iara" && (
                <button 
                  onClick={() => handleReplay(msg.texto)}
                  className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-widest transition-colors"
                >
                  <Volume2 className="w-3 h-3" />
                  Ouvir novamente
                </button>
              )}
              {msg.imagem && (
                <img 
                  src={msg.imagem} 
                  alt="Imagem gerada pela IARA" 
                  className="mt-3 rounded-xl w-full object-cover shadow-md border border-white/10"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </motion.div>
        ))}
        {(isLoading || isGeneratingImage) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2">
          <button
            onClick={handleMicClick}
            disabled={isLoading || isListening}
            className={`p-3 rounded-xl transition-colors flex items-center justify-center flex-shrink-0 ${
              isListening 
                ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-white/10"
            }`}
            title="Falar"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={handleGerarImagem}
            disabled={isLoading || isGeneratingImage}
            className="p-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:text-slate-600 text-slate-300 rounded-xl transition-colors flex-shrink-0 border border-white/10"
            title="Gerar imagem calmante"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="O que você está sentindo agora?"
            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none min-h-[52px] max-h-32"
            rows={1}
          />
          <button 
            onClick={enviarMensagem}
            disabled={!mensagem.trim() || isLoading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
