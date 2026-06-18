import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Wind, Heart, ArrowLeft, Play, Square, Flame, Sparkles, CheckCircle2 } from "lucide-react";
import { offlineStorage, BreathingTechnique } from "../services/offlineStorage";

export default function Respiracao() {
  const location = useLocation();
  const navigate = useNavigate();
  const { intensidade = 5, emocao = "" } = location.state || {};

  const [techniques, setTechniques] = useState<BreathingTechnique[]>([]);
  const [selectedTech, setSelectedTech] = useState<BreathingTechnique | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Breathing animation states
  const [fase, setFase] = useState<"preparar" | "inspira" | "sustemPreso" | "solta" | "sustemVazio" | "finalizado">("preparar");
  const [ciclos, setCiclos] = useState(0);
  const [timeLeftInPhase, setTimeLeftInPhase] = useState(0);
  
  // Timer references for precise cycle pacing
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Load techniques on mount
  useEffect(() => {
    const loadTechniques = async () => {
      const data = await offlineStorage.getBreathingTechniquesOffline();
      setTechniques(data);
      
      // Auto select based on intensity or previous use
      const lastUsedId = await offlineStorage.getLastUsedTechnique();
      const lastUsed = data.find(t => t.id === lastUsedId);
      
      if (lastUsed) {
        setSelectedTech(lastUsed);
      } else {
        // Fallback: choose based on emotion intensity if available
        if (intensidade > 7) {
          // high intensity -> box breathing or panic relief
          setSelectedTech(data.find(t => t.id === "quadrada") || data[0]);
        } else {
          setSelectedTech(data.find(t => t.id === "coerencia") || data[0]);
        }
      }
    };
    loadTechniques();
  }, [intensidade]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startBreathing = async (tech: BreathingTechnique) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    await offlineStorage.saveLastUsedTechnique(tech.id);
    
    setIsPlaying(true);
    setCiclos(0);
    runBreathingCycle(tech, 0, "inspira");
  };

  const stopBreathing = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setIsPlaying(false);
    setFase("preparar");
    setCiclos(0);
  };

  const runBreathingCycle = (tech: BreathingTechnique, currentCycle: number, currentPhase: typeof fase) => {
    if (currentCycle >= tech.cycles) {
      setFase("finalizado");
      setIsPlaying(false);
      // Wait and redirect to chat/home
      setTimeout(() => {
        navigate("/home");
      }, 2500);
      return;
    }

    setFase(currentPhase);
    setCiclos(currentCycle);

    // Determine duration for the phase
    let duration = 4;
    if (currentPhase === "inspira") duration = tech.inhale;
    else if (currentPhase === "sustemPreso") duration = tech.holdIn || 0;
    else if (currentPhase === "solta") duration = tech.exhale;
    else if (currentPhase === "sustemVazio") duration = tech.holdOut || 0;

    setTimeLeftInPhase(duration);

    // Phase countdown ticking
    if (countdownRef.current) clearInterval(countdownRef.current);
    let tempTimeLeft = duration;
    countdownRef.current = setInterval(() => {
      tempTimeLeft -= 1;
      if (tempTimeLeft >= 0) {
        setTimeLeftInPhase(tempTimeLeft);
      }
    }, 1000);

    // Queue next phase translation
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      let nextPhase: typeof fase = "inspira";
      let nextCycle = currentCycle;

      if (currentPhase === "inspira") {
        if (tech.holdIn && tech.holdIn > 0) {
          nextPhase = "sustemPreso";
        } else {
          nextPhase = "solta";
        }
      } else if (currentPhase === "sustemPreso") {
        nextPhase = "solta";
      } else if (currentPhase === "solta") {
        if (tech.holdOut && tech.holdOut > 0) {
          nextPhase = "sustemVazio";
        } else {
          nextPhase = "inspira";
          nextCycle += 1;
        }
      } else if (currentPhase === "sustemVazio") {
        nextPhase = "inspira";
        nextCycle += 1;
      }

      runBreathingCycle(tech, nextCycle, nextPhase);
    }, duration * 1000);
  };

  const getPhaseColorGlow = () => {
    switch (fase) {
      case "inspira":
        return "bg-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.3)]";
      case "sustemPreso":
        return "bg-cyan-500 shadow-[0_0_80px_rgba(6,182,212,0.3)]";
      case "solta":
        return "bg-blue-500 shadow-[0_0_80px_rgba(59,130,246,0.3)]";
      case "sustemVazio":
        return "bg-indigo-500 shadow-[0_0_80px_rgba(99,102,241,0.3)]";
      default:
        return "bg-slate-700";
    }
  };

  const getPhaseLabelPortuguese = () => {
    switch (fase) {
      case "inspira":
        return "Puxe o ar para dentro";
      case "sustemPreso":
        return "Segure os pulmões cheios";
      case "solta":
        return "Solte o ar devagar";
      case "sustemVazio":
        return "Segure os pulmões vazios";
      default:
        return "Prepare sua postura";
    }
  };

  return (
    <div className="min-h-screen bg-[#070302] text-slate-100 flex flex-col font-sans relative overflow-hidden pb-10">
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <header className="p-6 flex items-center justify-between z-10 relative bg-slate-950/55 backdrop-blur-xl border-b border-white/5 sticky top-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-emerald-400" />
            <span className="font-bold tracking-widest uppercase text-[10px] text-emerald-400">Técnicas de Respiração</span>
          </div>
          <h1 className="text-sm font-black tracking-tighter text-white">Modo Offline Habilitado</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="flex-1 p-6 z-10 relative max-w-xl mx-auto w-full flex flex-col justify-center space-y-8">
        
        {!isPlaying ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tighter text-white">Controle seu Ritmo</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Técnicas profissionais de respiração terapêutica, totalmente disponíveis mesmo offline na sua memória local.
              </p>
            </div>

            {/* Techniques selection stack */}
            <div className="space-y-3">
              {techniques.map((tech) => {
                const isSelected = selectedTech?.id === tech.id;
                return (
                  <motion.div
                    key={tech.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTech(tech)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-2 ${
                      isSelected 
                        ? "bg-emerald-550/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                        : "bg-slate-900/60 border-white/5 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
                        <h4 className={`font-bold text-base ${isSelected ? "text-emerald-400" : "text-white"}`}>
                          {tech.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg">
                        {tech.inhale}s-{tech.holdIn || 0}s-{tech.exhale}s-{tech.holdOut || 0}s
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      {tech.description}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-2 font-medium">
                      <span className="flex items-center gap-1 text-emerald-500/70">
                        <Activity className="w-3.5 h-3.5" /> {tech.benefits}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {selectedTech && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => startBreathing(selectedTech)}
                className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-990/30 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Play className="w-6 h-6 fill-current" />
                Iniciar {selectedTech.name.split(" ")[1] || "Respiração"}
              </motion.button>
            )}
          </div>
        ) : (
          /* Active breathing session layer */
          <div className="flex flex-col items-center justify-center space-y-12 py-8">
            
            {/* Visual breathing bellows circle */}
            <div className="relative w-72 h-72 flex items-center justify-center">
              
              {/* Outer pulsing ring */}
              <AnimatePresence>
                <motion.div
                  key={fase}
                  className={`absolute rounded-full -z-10 ${getPhaseColorGlow()}`}
                  initial={{ scale: 0.8, opacity: 0.1 }}
                  animate={{ 
                    scale: fase === "inspira" ? 1.9 : 
                           fase === "sustemPreso" ? 1.9 : 
                           fase === "solta" ? 0.95 : 0.95,
                    opacity: [0.15, 0.4, 0.15]
                  }}
                  transition={{ 
                    duration: timeLeftInPhase > 0 ? timeLeftInPhase : 1, 
                    ease: "easeInOut" 
                  }}
                  style={{ width: "220px", height: "220px" }}
                />
              </AnimatePresence>

              {/* Core interactive bubble */}
              <motion.div
                className={`w-48 h-48 rounded-full border-4 border-white/20 flex flex-col items-center justify-center text-white z-10 select-none shadow-inner relative`}
                animate={{
                  scale: fase === "inspira" ? 1.4 : 
                         fase === "sustemPreso" ? 1.4 : 
                         fase === "solta" ? 1.0 : 1.0,
                  borderColor: fase === "inspira" ? "rgba(16,185,129,0.5)" : "rgba(59,130,246,0.3)"
                }}
                transition={{ 
                  duration: timeLeftInPhase > 0 ? timeLeftInPhase : 1, 
                  ease: "easeInOut" 
                }}
                style={{ backgroundColor: "rgba(15,10,8,0.85)" }}
              >
                <div className="text-center space-y-1">
                  <span className="text-4xl font-serif font-black tracking-wide">
                    {timeLeftInPhase}s
                  </span>
                  <div className="flex gap-0.5 justify-center items-center">
                    <span className="bg-emerald-400 w-1.5 h-1.5 rounded-full inline-block animate-ping" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      Ciclo {ciclos + 1}/{selectedTech?.cycles}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="text-center space-y-3 px-4">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {getPhaseLabelPortuguese()}
              </h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto font-light">
                {fase === "inspira" && "Deixe o ar preencher seus pulmões expandindo o abdômen."}
                {fase === "sustemPreso" && "Mantenha o ar retido em paz, sem fazer esforço."}
                {fase === "solta" && "Esvazie as tensões com um sopro longo e contínuo."}
                {fase === "sustemVazio" && "Repouse no vazio absoluto antes do próximo ciclo."}
              </p>
            </div>

            <button
              onClick={stopBreathing}
              className="py-3 px-6 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Abandonar Exercício
            </button>
          </div>
        )}

        {/* Finished / Success overlay inside viewport */}
        <AnimatePresence>
          {fase === "finalizado" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#070302] flex flex-col items-center justify-center text-white p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="space-y-6 max-w-sm"
              >
                <div className="w-24 h-24 bg-emerald-550/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tight">Ritmo Restabelecido!</h3>
                  <p className="text-slate-400 text-sm font-light">
                    Sua coerência cardíaca muscular e sistema autônomo parassimpático foram reajustados.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-5 py-2.5 rounded-full text-xs font-bold text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  Mente Equilibrada & Focada
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
