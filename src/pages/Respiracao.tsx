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
  const [smoothProgress, setSmoothProgress] = useState(0);

  // Smooth frame timing track
  useEffect(() => {
    if (!isPlaying || fase === "preparar" || fase === "finalizado") {
      setSmoothProgress(0);
      return;
    }

    let duration = 4;
    if (fase === "inspira") duration = selectedTech?.inhale || 4;
    else if (fase === "sustemPreso") duration = selectedTech?.holdIn || 0;
    else if (fase === "solta") duration = selectedTech?.exhale || 4;
    else if (fase === "sustemVazio") duration = selectedTech?.holdOut || 0;

    if (duration <= 0) return;

    const startTime = Date.now();
    const totalMs = duration * 1000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / totalMs);
      setSmoothProgress(progress);

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 16); // 60fps tracking

    return () => clearInterval(timer);
  }, [fase, isPlaying, selectedTech]);

  const getBeadCoords = () => {
    if (!selectedTech) return { x: 120, y: 120 };

    const hasHoldIn = !!(selectedTech.holdIn && selectedTech.holdIn > 0);
    const hasHoldOut = !!(selectedTech.holdOut && selectedTech.holdOut > 0);

    const L = 30;
    const T = 30;
    const R = 210;
    const B = 210;
    const W = 180;
    const H = 180;

    if (hasHoldIn && hasHoldOut) {
      // 4-phase BOX Breathing (Square Path)
      switch (fase) {
        case "inspira":
          // Inhale: Go from Bottom-Left(L, B) up to Top-Left(L, T)
          return { x: L, y: B - (H * smoothProgress) };
        case "sustemPreso":
          // Hold full: Go from Top-Left(L, T) to Top-Right(R, T)
          return { x: L + (W * smoothProgress), y: T };
        case "solta":
          // Exhale: Go from Top-Right(R, T) down to Bottom-Right(R, B)
          return { x: R, y: T + (H * smoothProgress) };
        case "sustemVazio":
          // Hold empty: Go from Bottom-Right(R, B) back to Bottom-Left(L, B)
          return { x: R - (W * smoothProgress), y: B };
        default:
          return { x: L, y: B };
      }
    } else if (hasHoldIn) {
      // 3-phase TRIANGLE Breathing (Triangle Path)
      const TM = 120;
      switch (fase) {
        case "inspira":
          // Inhale: Bottom-Left (L, B) to Top-Middle (TM, T)
          return { 
            x: L + ((TM - L) * smoothProgress), 
            y: B - ((B - T) * smoothProgress) 
          };
        case "sustemPreso":
          // Hold: Top-Middle (TM, T) to Bottom-Right (R, B)
          return { 
            x: TM + ((R - TM) * smoothProgress), 
            y: T + ((B - T) * smoothProgress) 
          };
        case "solta":
          // Exhale: Bottom-Right (R, B) back to Bottom-Left (L, B)
          return { 
            x: R - (W * smoothProgress), 
            y: B 
          };
        default:
          return { x: L, y: B };
      }
    } else {
      // 2-phase COHERENCE Wave/Circle Breathing
      const center = 120;
      const radius = 90;

      if (fase === "inspira") {
        const angle = Math.PI / 2 - Math.PI * smoothProgress;
        return {
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle)
        };
      } else {
        const angle = -Math.PI / 2 - Math.PI * smoothProgress;
        return {
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle)
        };
      }
    }
  };
  
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
            
            {/* Visual breathing bellows circle & geometric layout */}
            <div className="relative w-72 h-72 flex items-center justify-center">
              
              {/* Outer pulsing ring */}
              <AnimatePresence>
                <motion.div
                  key={fase}
                  className={`absolute rounded-full -z-10 ${getPhaseColorGlow()}`}
                  initial={{ scale: 0.8, opacity: 0.1 }}
                  animate={{ 
                    scale: fase === "inspira" ? 1.45 : 
                           fase === "sustemPreso" ? 1.45 : 
                           fase === "solta" ? 0.95 : 0.95,
                    opacity: [0.15, 0.35, 0.15]
                  }}
                  transition={{ 
                    duration: timeLeftInPhase > 0 ? timeLeftInPhase : 1, 
                    ease: "easeInOut" 
                  }}
                  style={{ width: "240px", height: "240px" }}
                />
              </AnimatePresence>

              {/* Dynamic SVG Guide paths for tracking box / triangle / wave */}
              <svg className="absolute inset-0 w-full h-full p-2 z-0 overflow-visible" viewBox="0 0 240 240">
                <defs>
                  <linearGradient id="activeInhale" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="rgba(16, 185, 129, 0.25)" />
                    <stop offset="100%" stopColor="rgba(16, 185, 129, 1)" />
                  </linearGradient>
                  <linearGradient id="activeHoldIn" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(6, 182, 212, 0.25)" />
                    <stop offset="100%" stopColor="rgba(6, 182, 212, 1)" />
                  </linearGradient>
                  <linearGradient id="activeExhale" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 1)" />
                  </linearGradient>
                  <linearGradient id="activeHoldOut" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="rgba(99, 102, 241, 0.25)" />
                    <stop offset="100%" stopColor="rgba(99, 102, 241, 1)" />
                  </linearGradient>
                </defs>

                {(() => {
                  const hasHoldIn = !!(selectedTech?.holdIn && selectedTech.holdIn > 0);
                  const hasHoldOut = !!(selectedTech?.holdOut && selectedTech.holdOut > 0);
                  
                  if (hasHoldIn && hasHoldOut) {
                    return (
                      <>
                        {/* Box Breathing (Square Track) */}
                        <rect x="30" y="30" width="180" height="180" rx="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        {fase === "inspira" && <path d="M30 210 V30" fill="none" stroke="url(#activeInhale)" strokeWidth="6" strokeLinecap="round" />}
                        {fase === "sustemPreso" && <path d="M30 30 H210" fill="none" stroke="url(#activeHoldIn)" strokeWidth="6" strokeLinecap="round" />}
                        {fase === "solta" && <path d="M210 30 V210" fill="none" stroke="url(#activeExhale)" strokeWidth="6" strokeLinecap="round" />}
                        {fase === "sustemVazio" && <path d="M210 210 H30" fill="none" stroke="url(#activeHoldOut)" strokeWidth="6" strokeLinecap="round" />}
                      </>
                    );
                  } else if (hasHoldIn) {
                    return (
                      <>
                        {/* Relaxing Breathing (Triangle Track) */}
                        <polygon points="30,210 120,30 210,210" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        {fase === "inspira" && <path d="M30 210 L120 30" fill="none" stroke="url(#activeInhale)" strokeWidth="6" strokeLinecap="round" />}
                        {fase === "sustemPreso" && <path d="M120 30 L210 210" fill="none" stroke="url(#activeHoldIn)" strokeWidth="6" strokeLinecap="round" />}
                        {fase === "solta" && <path d="M210 210 L30 210" fill="none" stroke="url(#activeExhale)" strokeWidth="6" strokeLinecap="round" />}
                      </>
                    );
                  } else {
                    return (
                      <>
                        {/* Coherence Breathing (Circular Track) */}
                        <circle cx="120" cy="120" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        {fase === "inspira" && <path d="M120 210 A 90 90 0 0 0 120 30" fill="none" stroke="url(#activeInhale)" strokeWidth="6" strokeLinecap="round" />}
                        {fase === "solta" && <path d="M120 30 A 90 90 0 0 0 120 210" fill="none" stroke="url(#activeExhale)" strokeWidth="6" strokeLinecap="round" />}
                      </>
                    );
                  }
                })()}

                {/* Glowing fluid tracing bead at 60fps */}
                {(() => {
                  const bead = getBeadCoords();
                  let beadColor = "#10b981"; // Inhale
                  if (fase === "sustemPreso") beadColor = "#06b6d4";
                  if (fase === "solta") beadColor = "#3b82f6";
                  if (fase === "sustemVazio") beadColor = "#6366f1";
                  
                  return (
                    <g>
                      <circle cx={bead.x} cy={bead.y} r="15" fill={beadColor} opacity="0.25" className="animate-ping" style={{ transformOrigin: `${bead.x}px ${bead.y}px` }} />
                      <circle cx={bead.x} cy={bead.y} r="8" fill={beadColor} className="shadow-2xl" />
                      <circle cx={bead.x} cy={bead.y} r="3" fill="#ffffff" />
                    </g>
                  );
                })()}
              </svg>

              {/* Core interactive bubble nested neatly inside the paths */}
              <motion.div
                className={`w-36 h-36 rounded-full border border-white/10 flex flex-col items-center justify-center text-white z-10 select-none shadow-2xl relative`}
                animate={{
                  scale: fase === "inspira" ? 1.15 : 
                         fase === "sustemPreso" ? 1.15 : 
                         fase === "solta" ? 0.95 : 0.95,
                  borderColor: fase === "inspira" ? "rgba(16,185,129,0.3)" : 
                               fase === "sustemPreso" ? "rgba(6,182,212,0.3)" : 
                               "rgba(59,130,246,0.2)"
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 120,
                  damping: 16
                }}
                style={{ backgroundColor: "rgba(10, 5, 4, 0.85)", backdropFilter: "blur(12px)" }}
              >
                <div className="text-center space-y-1 select-none">
                  <span className="text-4xl font-serif font-black tracking-wide block">
                    {timeLeftInPhase}s
                  </span>
                  <div className="flex gap-0.5 justify-center items-center">
                    <span className="bg-emerald-400 w-1.5 h-1.5 rounded-full inline-block animate-ping" />
                    <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
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
              <p className="text-slate-400 text-sm max-w-xs mx-auto font-light leading-relaxed min-h-[48px]">
                {fase === "inspira" && "Deixe o ar preencher seus pulmões expandindo o abdômen suavemente."}
                {fase === "sustemPreso" && "Mantenha o ar retido em paz, colhendo o silêncio interior."}
                {fase === "solta" && "Esvazie as tensões com um sopro longo, contínuo e silencioso."}
                {fase === "sustemVazio" && "Repouse no vazio absoluto antes de acolher o novo ciclo."}
              </p>
            </div>

            <button
              onClick={stopBreathing}
              className="py-3.5 px-7 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
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
