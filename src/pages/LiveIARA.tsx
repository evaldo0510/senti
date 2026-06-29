import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Sparkles, 
  MessageCircle,
  ArrowLeft,
  Activity,
  HeartPulse,
  Send,
  Volume2,
  VolumeX,
  Compass,
  Smile,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { auth } from "../services/firebase";
import { salvarDadosAnalytics } from "../services/analyticsService";

interface ChatHistoryItem {
  sender: "user" | "iara";
  text: string;
  time: string;
}

export default function LiveIARA() {
  const navigate = useNavigate();
  
  // Audio & video controls
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Real-time voice parameters
  const [transcription, setTranscription] = useState("");
  const [aiTranscription, setAiTranscription] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlayingState, setIsPlayingState] = useState(false);
  
  // Custom caretaker settings
  const [selectedVoice, setSelectedVoice] = useState<string>("Zephyr");
  const [statusText, setStatusText] = useState<string>("Pronta para apoiar");
  
  // Multi-modal text integration
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [typedMessage, setTypedMessage] = useState("");
  
  // Chat history with a warm welcoming caretaker greeting
  const chatHistoryRef = useRef<ChatHistoryItem[]>([
    { 
      sender: "iara", 
      text: "Olá! Eu sou a IARA, sua assistente de acolhimento emocional e cuidados de descompressão. Fique à vontade para falar por voz clicando no botão Iniciar Chamada, ou escreva aqui no chat se preferir.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(chatHistoryRef.current);

  // References to keep callbacks current and handle PCM audio
  const isMicOnRef = useRef<boolean>(true);
  const isCameraOnRef = useRef<boolean>(true);
  const isIaraTurnActiveRef = useRef<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const audioQueueRef = useRef<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep reference states synced with user controls
    isMicOnRef.current = isMicOn;
  }, [isMicOn]);

  useEffect(() => {
    isCameraOnRef.current = isCameraOn;
  }, [isCameraOn]);

  useEffect(() => {
    // Auto scroll chat to bottom when updated
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatOpen]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const appendOrUpdateUserMessage = (text: string) => {
    const lastMsg = chatHistoryRef.current[chatHistoryRef.current.length - 1];
    if (lastMsg && lastMsg.sender === "user") {
      lastMsg.text = text;
    } else {
      chatHistoryRef.current.push({ 
        sender: "user", 
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    setChatHistory([...chatHistoryRef.current]);
  };

  const appendOrUpdateIaraMessage = (textChunk: string) => {
    const lastMsg = chatHistoryRef.current[chatHistoryRef.current.length - 1];
    if (lastMsg && lastMsg.sender === "iara" && isIaraTurnActiveRef.current) {
      lastMsg.text += textChunk;
    } else {
      isIaraTurnActiveRef.current = true;
      chatHistoryRef.current.push({ 
        sender: "iara", 
        text: textChunk,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    setChatHistory([...chatHistoryRef.current]);
  };

  const startCall = async () => {
    setIsConnecting(true);
    setStatusText("Conectando...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Establish a secure, server-side proxied Gemini Live WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live?voice=${selectedVoice}`;
      console.log(`[CLIENT LIVE] Connecting to ${wsUrl}...`);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log("[CLIENT LIVE] WebSocket connected, waiting for server-to-Gemini connection...");
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.connected) {
            console.log("[CLIENT LIVE] Server confirmed connection to Gemini Live!");
            setIsConnected(true);
            setIsConnecting(false);
            setStatusText("Ouvindo com atenção...");
            startAudioStreaming();
            startVideoStreaming();
          }
          
          // 1. Play real-time audio chunk
          if (message.audio) {
            playAudioChunk(message.audio);
            setStatusText("IARA está falando...");
          }
          
          // 2. Interrupted immediately if user talks over IARA
          if (message.interrupted) {
            stopAudioPlayback();
            isIaraTurnActiveRef.current = false;
            setStatusText("Ouvindo com atenção...");
          }
          
          // 3. User Speech-to-text live transcription
          if (message.transcription) {
            const text = message.transcription;
            setTranscription(text);
            appendOrUpdateUserMessage(text);
            setStatusText("IARA está pensando...");
          }
          
          // 4. IARA response live text transcription
          if (message.aiTranscription) {
            const textChunk = message.aiTranscription;
            setAiTranscription(prev => prev + textChunk);
            appendOrUpdateIaraMessage(textChunk);
          }

          // 5. Detect turn completed
          if (message.turnComplete) {
            isIaraTurnActiveRef.current = false;
            setAiTranscription("");
            setStatusText("Ouvindo com atenção...");
          }

          if (message.error) {
            console.error("[CLIENT LIVE] Server-side Gemini Live Error:", message.error);
            setStatusText(`Erro: ${message.error}`);
          }
          
          if (message.closed) {
            ws.close();
          }
        } catch (err) {
          console.error("[CLIENT LIVE] Error parsing WebSocket message:", err);
        }
      };

      ws.onclose = () => {
        console.log("[CLIENT LIVE] WebSocket closed");
        setIsConnected(false);
        salvarDadosAnalytics({
          usuario: auth.currentUser?.displayName || "Anônimo",
          humor: 5,
          risco: "moderado",
          atendimento: "sim",
          tipo: "IARA Live"
        });
        navigate("/home");
      };

      ws.onerror = (error: any) => {
        console.error("[CLIENT LIVE] WebSocket error:", error);
        setIsConnecting(false);
        setStatusText("Erro na conexão");
      };

      sessionRef.current = ws;

    } catch (error) {
      console.error("Error starting live session:", error);
      setIsConnecting(false);
      setStatusText("Erro ao acessar mídia");
    }
  };

  const cleanup = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        // Ignore
      }
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    stopAudioPlayback();
  };

  const startAudioStreaming = () => {
    if (!streamRef.current) return;

    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
    const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (!isMicOnRef.current || !sessionRef.current || sessionRef.current.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate audio level for waveform feedback
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      setAudioLevel(rms);

      // Convert to 16-bit PCM for Gemini Live transmission
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }

      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      sessionRef.current.send(JSON.stringify({
        audio: base64Data
      }));
    };

    source.connect(processor);
    processor.connect(audioContextRef.current.destination);
  };

  const startVideoStreaming = () => {
    const sendFrame = () => {
      if (!isCameraOnRef.current || !sessionRef.current || sessionRef.current.readyState !== WebSocket.OPEN || !videoRef.current || !canvasRef.current) {
        if (sessionRef.current && sessionRef.current.readyState === WebSocket.OPEN) {
          requestAnimationFrame(sendFrame);
        }
        return;
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL("image/jpeg", 0.5).split(",")[1];
        sessionRef.current.send(JSON.stringify({
          video: base64Data
        }));
      }
      setTimeout(sendFrame, 1000); // Send 1 video frame per second to conserve resource
    };

    sendFrame();
  };

  const playAudioChunk = (base64Data: string) => {
    audioQueueRef.current.push(base64Data);
    if (!isPlayingRef.current) {
      processAudioQueue();
    }
  };

  const processAudioQueue = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsPlayingState(false);
      setStatusText("Ouvindo com atenção...");
      return;
    }

    isPlayingRef.current = true;
    setIsPlayingState(true);
    const base64Data = audioQueueRef.current.shift()!;
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;
    
    if (audioContextRef.current) {
      const pcmData = new Int16Array(arrayBuffer);
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 0x7FFF;
      }

      const buffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
      buffer.getChannelData(0).set(floatData);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      activeSourcesRef.current.push(source);
      
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
        processAudioQueue();
      };
      source.start();
    } else {
      isPlayingRef.current = false;
      setIsPlayingState(false);
    }
  };

  const stopAudioPlayback = () => {
    audioQueueRef.current = [];
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignored
      }
    });
    activeSourcesRef.current = [];
    isPlayingRef.current = false;
    setIsPlayingState(false);
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !isCameraOn;
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const sendTextMessage = (text: string) => {
    if (!text.trim()) return;
    
    // Add text message directly into history
    chatHistoryRef.current.push({
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setChatHistory([...chatHistoryRef.current]);
    setTypedMessage("");
    setTranscription("");
    setAiTranscription("");
    setStatusText("IARA está pensando...");

    if (sessionRef.current && sessionRef.current.readyState === WebSocket.OPEN) {
      // Send text input over the live multimodal API connection
      sessionRef.current.send(JSON.stringify({
        text: text
      }));
    } else {
      // If offline/not connected, suggest starting a call
      setTimeout(() => {
        chatHistoryRef.current.push({
          sender: "iara",
          text: "Estou pronta para conversar com você! Inicie nossa sessão ao vivo clicando no botão 'Iniciar Chamada' abaixo para falarmos por áudio e vídeo.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setChatHistory([...chatHistoryRef.current]);
        setStatusText("Pronta para apoiar");
      }, 800);
    }
  };

  const endCall = () => {
    cleanup();
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* LEFT SECTION - ACTIVE VOICE WORKSPACE (GarageBand style) */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_50%)] pointer-events-none" />

        {/* Header */}
        <header className="p-4 sm:p-6 flex justify-between items-center z-20 bg-gradient-to-b from-slate-950 to-transparent">
          <button 
            onClick={() => navigate("/home")}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all backdrop-blur-md border border-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30 backdrop-blur-md">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400 whitespace-nowrap">
              {isConnected ? "SESSÃO LIVE ATIVA" : "IARA CONSULTÓRIO"}
            </span>
          </div>

          {/* Real-time Voice Choice Dropdown */}
          <div className="relative">
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={isConnected || isConnecting}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500/50 cursor-pointer disabled:opacity-50"
            >
              <option value="Zephyr">Voz: Zephyr (Calma)</option>
              <option value="Kore">Voz: Kore (Suave)</option>
              <option value="Puck">Voz: Puck (Carinhosa)</option>
              <option value="Fenrir">Voz: Fenrir (Firme)</option>
              <option value="Charon">Voz: Charon (Segura)</option>
            </select>
          </div>
        </header>

        {/* Main interactive area */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Active Tool Waveform Container */}
          <div className="w-full max-w-4xl flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl mb-4">
            {/* Elegant horizontal grid line */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            
            {/* Active Status Header Bar */}
            <div className="absolute top-4 left-6 flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isPlayingState ? 'text-purple-400 animate-pulse' : 'text-emerald-400'}`} />
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{statusText}</span>
            </div>

            <div className="relative w-full aspect-[4/3] sm:aspect-video flex flex-col items-center justify-center">
              {/* Backglow element dynamically shifting colors based on activity */}
              <div className={`absolute w-64 h-64 rounded-full blur-[100px] transition-all duration-1000 ${
                isConnecting ? "bg-amber-500/10" :
                isPlayingState ? "bg-purple-500/15 animate-pulse" :
                audioLevel > 0.01 ? "bg-emerald-500/15" :
                isConnected ? "bg-emerald-500/5" : "bg-slate-500/5"
              }`} />

              {/* Center interactive orb representation of IARA */}
              <motion.div 
                animate={{ 
                  scale: isPlayingState ? [1, 1.08, 1] : [1, 1.03, 1],
                  borderWidth: isPlayingState ? "3px" : "1px"
                }}
                transition={{ duration: isPlayingState ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 ${
                  isConnecting ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)]" :
                  isPlayingState ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_60px_rgba(168,85,247,0.3)]" :
                  audioLevel > 0.01 ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]" :
                  isConnected ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : 
                  "bg-slate-900 border-slate-800"
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <motion.div
                    animate={{ rotate: isPlayingState ? [0, 360] : 0 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className={`w-12 h-12 transition-all duration-500 ${
                      isConnecting ? "text-amber-400" :
                      isPlayingState ? "text-purple-400" :
                      audioLevel > 0.01 ? "text-emerald-400" :
                      isConnected ? "text-emerald-500" : "text-slate-600"
                    }`} />
                  </motion.div>
                  <span className="text-sm font-serif italic font-bold tracking-wider text-slate-200">IARA Live</span>
                </div>

                {isPlayingState && (
                  <>
                    <span className="absolute inset-0 border border-purple-500/30 rounded-full animate-ping pointer-events-none" style={{ animationDuration: "1.5s" }} />
                    <span className="absolute -inset-4 border border-purple-500/10 rounded-full animate-pulse pointer-events-none" style={{ animationDuration: "2s" }} />
                  </>
                )}
                {audioLevel > 0.01 && (
                  <span className="absolute inset-0 border border-emerald-500/30 rounded-full animate-ping pointer-events-none" />
                )}
              </motion.div>

              {/* Active Audio Waveforms (GarageBand and voice spectrum style) */}
              <div className="absolute inset-x-0 bottom-6 h-20 flex items-center justify-center pointer-events-none z-10">
                {isPlayingState ? (
                  // Flowing glowing bezier waves representing active speech
                  <svg className="w-full h-full opacity-80" viewBox="0 0 800 100" preserveAspectRatio="none">
                    <motion.path
                      animate={{
                        d: [
                          "M 0 50 Q 100 20, 200 50 T 400 50 T 600 50 T 800 50",
                          "M 0 50 Q 100 80, 200 50 T 400 50 T 600 50 T 800 50",
                          "M 0 50 Q 100 20, 200 50 T 400 50 T 600 50 T 800 50"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.5"
                      className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    />
                    <motion.path
                      animate={{
                        d: [
                          "M 0 50 Q 100 70, 250 50 T 500 50 T 750 50 T 800 50",
                          "M 0 50 Q 100 30, 250 50 T 500 50 T 750 50 T 800 50",
                          "M 0 50 Q 100 70, 250 50 T 500 50 T 750 50 T 800 50"
                        ]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="drop-shadow-[0_0_6px_rgba(192,132,252,0.4)]"
                    />
                  </svg>
                ) : isConnected && audioLevel > 0.005 ? (
                  // Bouncing visualizer bars representing user speech
                  <div className="flex items-center gap-1.5 h-12">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [
                            "8px", 
                            `${Math.max(12, audioLevel * 180 * (0.4 + Math.sin(i * 0.5) * 0.6))}px`, 
                            "8px"
                          ]
                        }}
                        transition={{
                          duration: 0.3 + (i % 3) * 0.1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      />
                    ))}
                  </div>
                ) : isConnected ? (
                  // Idle peaceful baseline wave
                  <svg className="w-full h-4 opacity-25" viewBox="0 0 800 100" preserveAspectRatio="none">
                    <path d="M 0 50 L 800 50" fill="none" stroke="#10b981" strokeWidth="2" />
                  </svg>
                ) : null}
              </div>

              {/* Overlay display of subtitles/transcriptions for accessibility */}
              <AnimatePresence>
                {aiTranscription && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute bottom-6 left-6 right-6 bg-slate-950/80 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/5 text-center shadow-lg z-20"
                  >
                    <p className="text-sm sm:text-base md:text-lg text-slate-100 font-medium leading-relaxed italic">
                      "{aiTranscription}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isConnected && !isConnecting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm rounded-[2.5rem] z-30">
                  <div className="text-center space-y-4 max-w-sm px-6">
                    <HeartPulse className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                    <h3 className="text-xl font-bold">Chamada de Descompressão</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Converse com a IARA por voz e vídeo em tempo real como se fosse uma cuidadora de acolhimento. Sinta-se confortável para se expressar livremente.
                    </p>
                    <button 
                      onClick={startCall}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95"
                    >
                      <Video className="w-5 h-5" />
                      Iniciar Chamada
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Support Quick Buttons (Palliative caretaker/Decompression theme) */}
            {isConnected && (
              <div className="mt-4 w-full px-4 flex flex-col items-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Acolhimento Rápido (Toque para acionar)</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { text: "Estou com crise de ansiedade 🩺", prompt: "Estou com uma forte crise de estresse e ansiedade, me ajude a me acalmar." },
                    { text: "Me guie em uma respiração 💨", prompt: "IARA, estou tenso. Pode conduzir um ciclo guiado de respiração consciente comigo?" },
                    { text: "Me sinto sozinho 🫂", prompt: "Estou me sentindo muito sozinho hoje e vulnerável. Pode me acolher com carinho?" },
                    { text: "Estou com muita dor / cansaço 🩹", prompt: "Estou sentindo dores e cansaço físico. Pode me passar uma mensagem reconfortante de alívio?" }
                  ].map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendTextMessage(act.prompt)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 active:bg-emerald-500/20 text-[11px] text-slate-300 hover:text-emerald-400 font-medium rounded-full border border-white/10 hover:border-emerald-500/30 transition-all duration-300"
                    >
                      {act.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Draggable User Video (Picture-in-Picture) */}
          {isConnected && (
            <motion.div 
              drag
              dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
              className="absolute bottom-24 right-4 sm:bottom-28 sm:right-10 w-28 sm:w-40 aspect-[3/4] bg-slate-800 rounded-2xl border-2 border-emerald-500/30 overflow-hidden shadow-2xl z-30 cursor-move"
            >
              {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <VideoOff className="w-5 h-5 text-slate-600" />
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`} 
              />
              <canvas ref={canvasRef} width="320" height="240" className="hidden" />
              
              <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: `${Math.min(audioLevel * 300, 100)}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          )}

          {/* User speech live subtitles */}
          <AnimatePresence>
            {transcription && (
              <motion.div 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 max-w-[80%] text-center z-10"
              >
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-widest flex items-center justify-center gap-2 truncate">
                  <Mic className="w-3 h-3 text-emerald-400 animate-pulse" /> {transcription}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Live Controls Bar */}
        <footer className="p-4 sm:p-6 flex items-center justify-center gap-4 sm:gap-6 z-20 bg-gradient-to-t from-slate-950 to-transparent pb-safe">
          <button 
            onClick={toggleMic}
            disabled={!isConnected}
            className={`p-4 rounded-full transition-all border min-w-[52px] min-h-[52px] flex items-center justify-center disabled:opacity-30 ${
              isMicOn 
                ? "bg-white/10 border-white/10 hover:bg-white/20 text-white" 
                : "bg-red-500/20 border-red-500/30 text-red-500"
            }`}
            title={isMicOn ? "Mutar Microfone" : "Ativar Microfone"}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button 
            onClick={isConnected ? endCall : startCall}
            className={`p-5 rounded-full transition-all shadow-2xl hover:scale-105 active:scale-95 min-w-[64px] min-h-[64px] flex items-center justify-center ${
              isConnected 
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/40" 
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40"
            }`}
            title={isConnected ? "Encerrar Chamada" : "Iniciar Chamada"}
          >
            {isConnected ? <PhoneOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button 
            onClick={toggleCamera}
            disabled={!isConnected}
            className={`p-4 rounded-full transition-all border min-w-[52px] min-h-[52px] flex items-center justify-center disabled:opacity-30 ${
              isCameraOn 
                ? "bg-white/10 border-white/10 hover:bg-white/20 text-white" 
                : "bg-red-500/20 border-red-500/30 text-red-500"
            }`}
            title={isCameraOn ? "Desativar Câmera" : "Ativar Câmera"}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Toggle chat sidebar drawer */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-4 rounded-full transition-all border min-w-[52px] min-h-[52px] flex items-center justify-center relative ${
              isChatOpen 
                ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400" 
                : "bg-white/10 border-white/10 hover:bg-white/20 text-slate-300"
            }`}
            title="Chat integrado"
          >
            <MessageCircle className="w-5 h-5" />
            {!isChatOpen && chatHistory.length > 1 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" />
            )}
          </button>
        </footer>
      </div>

      {/* RIGHT SECTION - INTEGRATED SIDEBAR CHAT DRAWER */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full md:w-96 border-t md:border-t-0 md:border-l border-white/10 bg-slate-900/60 backdrop-blur-xl flex flex-col h-[400px] md:h-screen z-20 relative"
          >
            {/* Chat Drawer Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm tracking-tight">Chat de Descompressão</h3>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors md:block"
                title="Fechar chat"
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Scrolling Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-emerald-600/20 text-emerald-100 border border-emerald-500/20 rounded-tr-none"
                      : "bg-white/5 text-slate-200 border border-white/5 rounded-tl-none"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Text Input area (Option for text conversational fallback) */}
            <div className="p-4 border-t border-white/10 bg-slate-950/40">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  sendTextMessage(typedMessage);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="Escreva algo para a IARA..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!typedMessage.trim()}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-[10px] text-slate-500 mt-2 text-center">
                IARA responde por texto e sintetiza voz simultaneamente.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Spinning Overlay */}
      <AnimatePresence>
        {isConnecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center space-y-8"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif italic text-white">Iniciando IARA Live</h3>
              <p className="text-slate-400 font-light text-sm">Configurando ambiente de descompressão emocional...</p>
              <p className="text-xs text-slate-500">IARA atuará como sua enfermeira e assistente de suporte.</p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-emerald-500 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
