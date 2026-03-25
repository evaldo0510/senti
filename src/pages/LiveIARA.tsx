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
  HeartPulse
} from "lucide-react";
import { GoogleGenAI, Modality } from "@google/genai";
import { auth } from "../services/firebase";
import { salvarDadosAnalytics } from "../services/analyticsService";

export default function LiveIARA() {
  const navigate = useNavigate();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [aiTranscription, setAiTranscription] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const startCall = async () => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize Gemini Live
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "Você é a IARA, uma assistente de acolhimento emocional humanizada. Seu tom é calmo, empático e validador. Você está em uma sessão de vídeo ao vivo com um paciente que busca suporte. Ouça com atenção e ofereça palavras de conforto e técnicas de regulação emocional se necessário.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startAudioStreaming();
            startVideoStreaming();
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              playAudioChunk(message.serverContent.modelTurn.parts[0].inlineData.data);
            }
            if (message.serverContent?.interrupted) {
              stopAudioPlayback();
            }
            if (message.serverContent?.inputAudioTranscription?.text) {
              setTranscription(message.serverContent.inputAudioTranscription.text);
            }
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              setAiTranscription(message.serverContent.modelTurn.parts[0].text);
            }
          },
          onclose: () => {
            setIsConnected(false);
            salvarDadosAnalytics({
              usuario: auth.currentUser?.displayName || "Anônimo",
              humor: 5,
              risco: "moderado",
              atendimento: "sim",
              tipo: "IARA Live"
            });
            navigate("/home");
          },
          onerror: (error: any) => {
            console.error("Gemini Live Error:", error);
            setIsConnecting(false);
          }
        }
      });
      sessionRef.current = session;

    } catch (error) {
      console.error("Error starting live session:", error);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

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
  };

  const startAudioStreaming = () => {
    if (!streamRef.current) return;

    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
    const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (!isMicOn || !sessionRef.current) return;

      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate audio level for UI
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      setAudioLevel(Math.sqrt(sum / inputData.length));

      // Convert to PCM 16-bit
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }

      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      sessionRef.current.sendRealtimeInput({
        audio: { data: base64Data, mimeType: "audio/pcm;rate=16000" }
      });
    };

    source.connect(processor);
    processor.connect(audioContextRef.current.destination);
  };

  const startVideoStreaming = () => {
    const sendFrame = () => {
      if (!isCameraOn || !sessionRef.current || !videoRef.current || !canvasRef.current) {
        requestAnimationFrame(sendFrame);
        return;
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL("image/jpeg", 0.5).split(",")[1];
        sessionRef.current.sendRealtimeInput({
          video: { data: base64Data, mimeType: "image/jpeg" }
        });
      }
      setTimeout(sendFrame, 1000); // Send 1 frame per second to save bandwidth
    };

    sendFrame();
  };

  const audioQueue: string[] = [];
  let isPlaying = false;

  const playAudioChunk = (base64Data: string) => {
    audioQueue.push(base64Data);
    if (!isPlaying) {
      processAudioQueue();
    }
  };

  const processAudioQueue = async () => {
    if (audioQueue.length === 0) {
      isPlaying = false;
      return;
    }

    isPlaying = true;
    const base64Data = audioQueue.shift()!;
    const arrayBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;
    
    if (audioContextRef.current) {
      // Gemini returns PCM 16-bit at 24kHz usually, but we need to decode it
      // For simplicity in this demo, we assume the browser can handle it or we use a simple PCM player
      // A real implementation would need a more robust PCM player
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
      source.onended = () => processAudioQueue();
      source.start();
    }
  };

  const stopAudioPlayback = () => {
    audioQueue.length = 0;
    // In a real implementation, we'd stop the current source
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

  const endCall = () => {
    cleanup();
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="p-4 sm:p-6 flex justify-between items-center z-20 bg-gradient-to-b from-slate-950 to-transparent">
        <button 
          onClick={() => navigate("/home")}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all backdrop-blur-md border border-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3 bg-emerald-500/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-emerald-500/30 backdrop-blur-md">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400 whitespace-nowrap">IARA Live Session</span>
        </div>
        <div className="w-10 sm:w-12" /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4 sm:p-6">
        {/* AI Video (Placeholder/Visualization) */}
        <div className="w-full max-w-4xl aspect-[4/3] sm:aspect-video bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-white/5 overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 sm:space-y-6">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-24 sm:w-32 sm:h-32 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30"
            >
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400" />
            </motion.div>
            <div className="text-center space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl font-serif italic text-emerald-400">IARA</h2>
              <p className="text-slate-500 text-[10px] sm:text-sm font-light uppercase tracking-widest">Acolhimento em tempo real</p>
            </div>
            {!isConnected && !isConnecting && (
              <button 
                onClick={startCall}
                className="mt-8 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                <Video className="w-6 h-6" />
                Iniciar Chamada
              </button>
            )}
          </div>

          {/* AI Transcription Overlay */}
          <AnimatePresence>
            {aiTranscription && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 bg-black/40 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10"
              >
                <p className="text-sm sm:text-lg text-center font-light leading-relaxed italic">"{aiTranscription}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Video (Picture in Picture) */}
        <motion.div 
          drag
          dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          className="absolute bottom-28 right-4 sm:bottom-32 sm:right-10 w-32 sm:w-48 aspect-[3/4] bg-slate-800 rounded-2xl sm:rounded-3xl border-2 border-emerald-500/30 overflow-hidden shadow-2xl z-30 cursor-move"
        >
          {!isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <VideoOff className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
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
          
          {/* Audio Level Indicator */}
          <div className="absolute bottom-3 left-3 right-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${Math.min(audioLevel * 500, 100)}%` }}
              className="h-full bg-emerald-500"
            />
          </div>
        </motion.div>

        {/* User Transcription Overlay */}
        <AnimatePresence>
          {transcription && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-24 sm:top-32 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md px-4 py-1.5 sm:px-6 sm:py-2 rounded-full border border-white/10 max-w-[80%] text-center"
            >
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-widest flex items-center justify-center gap-2 truncate">
                <Mic className="w-3 h-3" /> {transcription}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Controls */}
      <footer className="p-6 sm:p-10 flex items-center justify-center gap-4 sm:gap-6 z-20 bg-gradient-to-t from-slate-950 to-transparent pb-safe">
        <button 
          onClick={toggleMic}
          className={`p-4 sm:p-6 rounded-full transition-all border min-w-[56px] min-h-[56px] flex items-center justify-center ${
            isMicOn 
              ? "bg-white/10 border-white/10 hover:bg-white/20 text-white" 
              : "bg-red-500/20 border-red-500/30 text-red-500"
          }`}
        >
          {isMicOn ? <Mic className="w-6 h-6 sm:w-8 sm:h-8" /> : <MicOff className="w-6 h-6 sm:w-8 sm:h-8" />}
        </button>

        <button 
          onClick={endCall}
          className="p-6 sm:p-8 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-2xl shadow-red-900/40 hover:scale-110 active:scale-95 min-w-[72px] min-h-[72px] flex items-center justify-center"
        >
          <PhoneOff className="w-8 h-8 sm:w-10 sm:h-10" />
        </button>

        <button 
          onClick={toggleCamera}
          className={`p-4 sm:p-6 rounded-full transition-all border min-w-[56px] min-h-[56px] flex items-center justify-center ${
            isCameraOn 
              ? "bg-white/10 border-white/10 hover:bg-white/20 text-white" 
              : "bg-red-500/20 border-red-500/30 text-red-500"
          }`}
        >
          {isCameraOn ? <Video className="w-6 h-6 sm:w-8 sm:h-8" /> : <VideoOff className="w-6 h-6 sm:w-8 sm:h-8" />}
        </button>
      </footer>

      {/* Loading Overlay */}
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
              <p className="text-slate-500 font-light">Preparando seu ambiente de acolhimento...</p>
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
