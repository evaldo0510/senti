import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Mic, 
  MicOff,
  Volume2, 
  VolumeX, 
  Zap, 
  HeartHandshake, 
  AlertTriangle, 
  ArrowRight, 
  Loader2,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Phone,
  PhoneOff
} from "lucide-react";
import { falarComIARA, ChatMessage } from "../services/iaraService";
import { falarTexto } from "../services/voiceService";
import { ouvirUsuario } from "../services/audioInput";
import { playPCM, stopAllAudio } from "../services/audioPlayer";
import { generateImage } from "../services/geminiService";
import { auth, db } from "../services/firebase";
import { salvarDadosAnalytics } from "../services/analyticsService";
import { cn } from "../lib/utils";
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, increment } from "firebase/firestore";

import { iaraHistoryService } from "../services/iaraHistoryService";
import { ArrowLeft } from "lucide-react";

interface Message {
  tipo: "user" | "iara";
  texto: string;
  imagem?: string | null;
}

interface IARAChatProps {
  initialMessage?: string;
  context?: string;
  conversationId?: string;
  initialMessages?: Message[];
  specialization?: string;
  onNewConversationCreated?: (id: string) => void;
  onBack?: () => void;
  onIARARespond?: (result: any) => void;
  onRiscoAlto?: () => void;
  onDirecionar?: (especialidade: string) => void;
  className?: string;
}

export default function IARAChat({ 
  initialMessage, 
  context, 
  conversationId,
  initialMessages,
  specialization = "geral",
  onNewConversationCreated,
  onBack,
  onIARARespond,
  onRiscoAlto,
  onDirecionar,
  className 
}: IARAChatProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const isTrialUser = !profile || profile.subscriptionPlan === "trial" || profile.subscriptionPlan === undefined;
  const currentChatCount = profile?.iaraChatCount || 0;
  const isLimitReached = isTrialUser && currentChatCount >= 20;

  const [mensagem, setMensagem] = useState("");
  const [chat, setChat] = useState<Message[]>(initialMessages || [
    { 
      tipo: "iara", 
      texto: initialMessage || "Olá. Eu sou a IARA, sua inteligência de acolhimento emocional. Como você está se sentindo agora?" 
    }
  ]);
  const [activeConvId, setActiveConvId] = useState<string | null>(conversationId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [emocaoAtual, setEmocaoAtual] = useState({ emocao: "calma", intensidade: 5 });

  // --- Estados do Modo de Voz Bidirecional (Web Speech API) ---
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking" | "paused">("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [lastUserVoiceInput, setLastUserVoiceInput] = useState("");
  const [lastIaraVoiceOutput, setLastIaraVoiceOutput] = useState("");

  const recognitionRef = useRef<any>(null);
  const nativeUtteranceRef = useRef<any>(null);
  const isVoiceActiveRef = useRef(false);

  // Synchronize ref copy of isVoiceModeActive
  useEffect(() => {
    isVoiceActiveRef.current = isVoiceModeActive;
  }, [isVoiceModeActive]);

  const toggleVoiceMode = () => {
    if (isVoiceModeActive) {
      stopVoiceMode();
    } else {
      startVoiceMode();
    }
  };

  const startVoiceMode = () => {
    setIsVoiceModeActive(true);
    isVoiceActiveRef.current = true;
    setVoiceState("thinking");
    setInterimTranscript("");
    setLastUserVoiceInput("");

    // Use last assistant message to speak, or a custom warm voice greeting
    const lastIaraMsg = chat.slice().reverse().find(m => m.tipo === "iara")?.texto || 
      "Olá, eu sou a IARA. Estou ouvindo você por voz. Como posso acolher seu coração hoje?";
    
    setLastIaraVoiceOutput(lastIaraMsg);
    speakVoiceText(lastIaraMsg);
  };

  const stopVoiceMode = () => {
    setIsVoiceModeActive(false);
    isVoiceActiveRef.current = false;
    setVoiceState("idle");
    setInterimTranscript("");
    
    // Stop all active voice/synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    stopAllAudio();
    setIsSpeaking(false);
    
    // Stop recognition
    stopSpeechRecognition();
  };

  const speakVoiceText = async (texto: string) => {
    if (!isVoiceActiveRef.current) return;
    
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    stopAllAudio();
    setIsSpeaking(false);
    
    setVoiceState("speaking");
    setLastIaraVoiceOutput(texto);

    try {
      // 1. Try Gemini high quality speech
      const base64Audio = await falarTexto(texto);
      
      if (base64Audio && isVoiceActiveRef.current) {
        const source = await playPCM(base64Audio);
        if (source) {
          currentAudioSource.current = source;
          setIsSpeaking(true);
          source.onended = () => {
            setIsSpeaking(false);
            if (isVoiceActiveRef.current) {
              setVoiceState("listening");
            }
          };
          return;
        }
      }
    } catch (err) {
      console.warn("Voice API failed, falling back to Web Speech Synthesis", err);
    }

    // 2. Fallback to native Web Speech Synthesis API
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const cleanText = texto.replace(/[\*\_\#]/g, ""); // strip markdown formatting characters
        const speech = new SpeechSynthesisUtterance(cleanText);
        speech.lang = "pt-BR";
        
        const voices = window.speechSynthesis.getVoices();
        const ptBRVoice = voices.find(
          (voice) => voice.lang.startsWith("pt-BR") || voice.lang.startsWith("pt")
        );
        if (ptBRVoice) {
          speech.voice = ptBRVoice;
        }
        
        speech.rate = 0.95;
        speech.pitch = 1.0;
        
        speech.onstart = () => {
          setIsSpeaking(true);
          setVoiceState("speaking");
        };

        speech.onend = () => {
          setIsSpeaking(false);
          if (isVoiceActiveRef.current) {
            setVoiceState("listening");
          }
        };

        speech.onerror = () => {
          setIsSpeaking(false);
          if (isVoiceActiveRef.current) {
            setVoiceState("listening");
          }
        };

        nativeUtteranceRef.current = speech;
        window.speechSynthesis.speak(speech);
      } catch (speechErr) {
        console.error("Native speechSynthesis error:", speechErr);
        if (isVoiceActiveRef.current) {
          setVoiceState("listening");
        }
      }
    } else {
      if (isVoiceActiveRef.current) {
        setVoiceState("listening");
      }
    }
  };

  const startSpeechRecognition = () => {
    stopSpeechRecognition();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setInterimTranscript("");
    };

    recognition.onresult = (event: any) => {
      let currentInterim = "";
      let finalSpeech = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSpeech += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (currentInterim) {
        setInterimTranscript(currentInterim);
      }

      if (finalSpeech.trim()) {
        setInterimTranscript("");
        setLastUserVoiceInput(finalSpeech);
        handleVoiceInputReceived(finalSpeech);
      }
    };

    recognition.onend = () => {
      // Loop: if still listening and active, restart recognition
      if (isVoiceActiveRef.current && voiceState === "listening") {
        setTimeout(() => {
          if (isVoiceActiveRef.current && voiceState === "listening" && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.warn("Speech start warning:", e);
            }
          }
        }, 400);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Recognition error state:", event.error);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  // Continuous speech recognition toggle hook
  useEffect(() => {
    if (voiceState === "listening" && isVoiceModeActive) {
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
    }
    return () => {
      stopSpeechRecognition();
    };
  }, [voiceState, isVoiceModeActive]);

  // Overall cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      stopAllAudio();
      stopSpeechRecognition();
    };
  }, []);

  const handleVoiceInputReceived = async (text: string) => {
    if (isLimitReached || !isVoiceActiveRef.current) return;
    if (!text.trim() || isLoading) return;

    setVoiceState("thinking");
    setIsLoading(true);

    const novaConversa: Message[] = [...chat, { tipo: "user", texto: text }];
    setChat(novaConversa);

    let currentConvId = activeConvId;
    if (!currentConvId) {
      try {
        const titleSnippet = text.trim().slice(0, 30) + (text.trim().length > 30 ? "..." : "");
        const specializationName = specialization === "geral" ? "Acolhimento" : `Foco: ${specialization.charAt(0).toUpperCase() + specialization.slice(1)}`;
        const title = `${specializationName} (${titleSnippet})`;
        
        currentConvId = await iaraHistoryService.createConversation(title, specialization);
        setActiveConvId(currentConvId);
        if (onNewConversationCreated) {
          onNewConversationCreated(currentConvId);
        }

        if (chat.length > 0 && chat[0].tipo === "iara") {
          await iaraHistoryService.saveMessage(currentConvId, "iara", chat[0].texto, chat[0].imagem);
        }
      } catch (err) {
        console.error("Failed to auto-create conversation on voice input:", err);
      }
    }

    if (currentConvId) {
      await iaraHistoryService.saveMessage(currentConvId, "user", text);
    }

    const historico: ChatMessage[] = chat.map(msg => ({
      role: msg.tipo === "user" ? "user" : "model",
      parts: [{ text: msg.texto }]
    }));

    try {
      const result = await falarComIARA(text, historico, emocaoAtual, specialization);
      
      setEmocaoAtual({ emocao: result.emocao, intensidade: result.intensidade });
      setChat([...novaConversa, { tipo: "iara", texto: result.resposta }]);
      
      if (currentConvId) {
        await iaraHistoryService.saveMessage(currentConvId, "iara", result.resposta);
      }

      if (onIARARespond) {
        onIARARespond(result);
      }

      if (result.risco === "alto" && onRiscoAlto) {
        stopVoiceMode();
        onRiscoAlto();
        return;
      }

      if (isVoiceActiveRef.current) {
        speakVoiceText(result.resposta);
      }

      if (auth.currentUser?.uid) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            iaraChatCount: increment(1)
          });
        } catch (dbErr) {
          console.warn("Could not increment chat count:", dbErr);
        }
      }

      salvarDadosAnalytics({
        usuario: auth.currentUser?.displayName || "Anônimo",
        humor: result.intensidade,
        risco: result.risco,
        atendimento: result.direcionarEspecialista ? "sim" : "nao",
        tipo: "IARA_COMPONENTE"
      });

      if (result.direcionarEspecialista && onDirecionar) {
        stopVoiceMode();
        onDirecionar(result.emocao);
      }

    } catch (err) {
      console.error("Error processing voice step:", err);
      if (isVoiceActiveRef.current) {
        speakVoiceText("Sinto muito... Tive uma pequena oscilação técnica. Mas continuo aqui ouvindo você.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setChat(initialMessages);
    } else {
      setChat([
        { 
          tipo: "iara", 
          texto: initialMessage || "Olá. Eu sou a IARA, sua inteligência de acolhimento emocional. Como você está se sentindo agora?" 
        }
      ]);
    }
    setActiveConvId(conversationId || null);
  }, [conversationId, initialMessages, initialMessage]);
  
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
    if (isLimitReached) return;
    const msgAtual = textoOverride || mensagem;
    if (!msgAtual.trim() || isLoading) return;

    const novaConversa: Message[] = [...chat, { tipo: "user", texto: msgAtual }];
    setChat(novaConversa);
    if (!textoOverride) setMensagem("");
    setIsLoading(true);

    // Dynamic conversation initiation on first user message
    let currentConvId = activeConvId;
    if (!currentConvId) {
      try {
        const titleSnippet = msgAtual.trim().slice(0, 30) + (msgAtual.trim().length > 30 ? "..." : "");
        const specializationName = specialization === "geral" ? "Acolhimento" : `Foco: ${specialization.charAt(0).toUpperCase() + specialization.slice(1)}`;
        const title = `${specializationName} (${titleSnippet})`;
        
        currentConvId = await iaraHistoryService.createConversation(
          title,
          specialization
        );
        setActiveConvId(currentConvId);
        if (onNewConversationCreated) {
          onNewConversationCreated(currentConvId);
        }

        // Save pre-existing assistant welcome text if any
        if (chat.length > 0 && chat[0].tipo === "iara") {
          await iaraHistoryService.saveMessage(currentConvId, "iara", chat[0].texto, chat[0].imagem);
        }
      } catch (err) {
        console.error("Failed to auto-create conversation on first user text:", err);
      }
    }

    // Persist user query to history
    if (currentConvId) {
      await iaraHistoryService.saveMessage(currentConvId, "user", msgAtual);
    }

    const historico: ChatMessage[] = chat.map(msg => ({
      role: msg.tipo === "user" ? "user" : "model",
      parts: [{ text: msg.texto }]
    }));

    try {
      // Forward specialization state to the prompt builder
      const result = await falarComIARA(msgAtual, historico, emocaoAtual, specialization);
      
      setEmocaoAtual({ emocao: result.emocao, intensidade: result.intensidade });

      setChat([...novaConversa, { tipo: "iara", texto: result.resposta }]);
      
      // Persist assistant reply to history
      if (currentConvId) {
        await iaraHistoryService.saveMessage(currentConvId, "iara", result.resposta);
      }

      if (onIARARespond) {
        onIARARespond(result);
      }
      
      if (!isMuted) {
        const base64Audio = await falarTexto(result.resposta);
        if (base64Audio) playAudio(base64Audio);
      }

      // Increment chat count in Firestore for trial users
      if (auth.currentUser?.uid) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            iaraChatCount: increment(1)
          });
        } catch (dbErr) {
          console.warn("Could not increment chat count:", dbErr);
        }
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
    <div className={cn("flex flex-col h-full bg-[#0a0502]/95 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative", className)}>
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && !isVoiceModeActive && (
            <button 
              onClick={onBack}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white mr-1 flex items-center justify-center"
              title="Voltar para a central"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              {specialization === "geral" ? "IARA Chat" : `IARA – ${specialization.charAt(0).toUpperCase() + specialization.slice(1)}`}
              {isVoiceModeActive && (
                <span className="inline-flex w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </h3>
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", emocaoAtual.intensidade > 7 ? "bg-red-500" : "bg-emerald-500")} />
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {emocaoAtual.emocao} ({emocaoAtual.intensidade}/10)
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Real-time Bidirectional Voice Mode Toggle */}
          <button 
            onClick={toggleVoiceMode}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all border text-[11px] font-black uppercase tracking-wider flex items-center gap-2",
              isVoiceModeActive 
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
            )}
            title="Toggle Voice Mode"
          >
            {isVoiceModeActive ? <PhoneOff className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5 animate-bounce" />}
            <span>{isVoiceModeActive ? "Desativar Voz" : "Chamada de Voz"}</span>
          </button>

          {!isVoiceModeActive && (
            <button 
              onClick={handleGerarImagem}
              disabled={isGeneratingImage || isLoading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-emerald-400"
              title="Gerar imagem calmante"
            >
              {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            </button>
          )}
          
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className={cn("w-4 h-4", isSpeaking ? "text-emerald-400 animate-pulse" : "text-slate-400")} />}
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE VOICE CONVERSATION SCREEN */}
      {isVoiceModeActive ? (
        <div className="flex-1 flex flex-col justify-between p-6 relative overflow-hidden bg-radial from-[#120a06] via-[#0a0502] to-black">
          
          {/* Ambient Background Aura Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <AnimatePresence>
              {voiceState === "speaking" && (
                <>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.8, opacity: 0.15 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    className="absolute w-64 h-64 rounded-full border border-emerald-500"
                  />
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 2.3, opacity: 0.08 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    className="absolute w-64 h-64 rounded-full border border-teal-500"
                  />
                </>
              )}
              {voiceState === "listening" && (
                <>
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-64 h-64 rounded-full bg-emerald-500/5 blur-xl"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-72 h-72 rounded-full border border-dashed border-emerald-500/20"
                  />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Top Status */}
          <div className="text-center space-y-2 z-10 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit mx-auto">
              Conexão Segura e Acolhedora
            </p>
            <h4 className="text-lg font-black text-white">Canal de Voz SentiPae</h4>
          </div>

          {/* Center Pulsing Orb */}
          <div className="flex flex-col items-center justify-center space-y-6 z-10 my-auto">
            <motion.div 
              onClick={() => {
                if (voiceState === "listening") {
                  // user triggers manually
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-36 h-36 rounded-full flex items-center justify-center border-4 shadow-2xl relative transition-all duration-700 cursor-pointer",
                voiceState === "speaking" && "bg-emerald-500/10 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.4)]",
                voiceState === "listening" && "bg-emerald-600/20 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-pulse",
                voiceState === "thinking" && "bg-indigo-500/10 border-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.25)]",
                voiceState === "paused" && "bg-slate-800/20 border-slate-600 shadow-none"
              )}
            >
              {/* Dynamic Inner Icon or Visualizer */}
              {voiceState === "speaking" && (
                <Volume2 className="w-12 h-12 text-emerald-300 animate-bounce" />
              )}
              {voiceState === "listening" && (
                <Mic className="w-12 h-12 text-emerald-400 scale-110" />
              )}
              {voiceState === "thinking" && (
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
              )}
              {voiceState === "paused" && (
                <MicOff className="w-12 h-12 text-slate-400" />
              )}

              {/* Status pill overlay */}
              <div className="absolute -bottom-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-950 border border-white/10 shadow-lg text-slate-300">
                {voiceState === "speaking" && "IARA Falando"}
                {voiceState === "listening" && "Pode Falar"}
                {voiceState === "thinking" && "Acolhendo..."}
                {voiceState === "paused" && "Pausado"}
              </div>
            </motion.div>

            {/* Micro-text feedback indicator */}
            <div className="text-center min-h-[24px]">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={voiceState}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs font-medium text-slate-400 tracking-wide"
                >
                  {voiceState === "speaking" && "IARA está compartilhando reflexões e poesia sutil..."}
                  {voiceState === "listening" && "Fale de forma natural... Estou ouvindo com atenção."}
                  {voiceState === "thinking" && "Integrando suas palavras no coração do SentiCore..."}
                  {voiceState === "paused" && "Clique no microfone para retomar a fala."}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Transcripts Area */}
          <div className="bg-white/5 border border-white/5 rounded-[24px] p-4 space-y-3 mx-auto w-full max-w-lg z-10 backdrop-blur-md">
            
            {/* Interim Transcript (Real-time Feedback) */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Ouvindo agora:</span>
              <p className="text-xs text-slate-300 italic min-h-[18px]">
                {interimTranscript ? `"${interimTranscript}"` : (lastUserVoiceInput ? `"${lastUserVoiceInput}"` : "Comece a falar...")}
              </p>
            </div>

            <div className="h-px bg-white/5" />

            {/* Last IARA response */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block">IARA respondeu:</span>
              <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-serif">
                {lastIaraVoiceOutput || "Olá! Sinto sua presença aqui..."}
              </p>
            </div>
          </div>

          {/* Voice Controls Bottom Bar */}
          <div className="flex items-center justify-center gap-6 z-10 pt-4 pb-2">
            
            {/* Pause/Play Mic Listening */}
            <button
              onClick={() => {
                if (voiceState === "listening") {
                  setVoiceState("paused");
                } else if (voiceState === "paused") {
                  setVoiceState("listening");
                }
              }}
              className={cn(
                "p-3.5 rounded-2xl transition-all border",
                voiceState === "paused"
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                  : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
              )}
              title={voiceState === "paused" ? "Retomar Ouvido" : "Pausar Ouvido"}
            >
              {voiceState === "paused" ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Hang Up Phone Call */}
            <button
              onClick={stopVoiceMode}
              className="p-5 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all duration-300 shadow-xl shadow-red-900/30 hover:scale-105 active:scale-95"
              title="Encerrar Chamada por Voz"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Replay last IARA response */}
            <button
              onClick={() => {
                if (lastIaraVoiceOutput) {
                  speakVoiceText(lastIaraVoiceOutput);
                }
              }}
              disabled={voiceState === "thinking" || voiceState === "speaking"}
              className="p-3.5 bg-white/5 text-slate-400 border border-white/5 rounded-2xl hover:bg-white/10 transition-all disabled:opacity-30"
              title="Repetir última fala"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

        </div>
      ) : (
        /* STANDARD CHAT VIEW */
        <>
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
            {isLimitReached ? (
              <div className="py-4 px-2 text-center space-y-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 p-4">
                <div className="flex justify-center">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full">
                    <Zap className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-100">Limite Gratuito do Chat Almejado!</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Você atingiu o limite de 20 conversas gratuitas do período de teste de 7 dias. Faça o upgrade agora para ter conversas 100% ilimitadas com a IARA.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/assinatura")}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 inline-flex items-center gap-1.5"
                >
                  Assinar Plano Premium <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
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
            )}
          </div>
        </>
      )}

    </div>
  );
}
