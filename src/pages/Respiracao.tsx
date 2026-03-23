import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Wind, Heart } from "lucide-react";

export default function Respiracao() {
  const location = useLocation();
  const navigate = useNavigate();
  const { intensidade = 5, emocao = "" } = location.state || {};

  const [fase, setFase] = useState<"inspira" | "solta" | "finalizado">("inspira");
  const [ciclos, setCiclos] = useState(0);
  const maxCiclos = intensidade > 7 ? 6 : 4;

  const steps = [
    { id: 0, label: "Identificação", completed: true },
    { id: 1, label: "Sinais Vitais", active: true },
    { id: 2, label: "Clínico Geral" },
    { id: 3, label: "Especialista" }
  ];

  useEffect(() => {
    if (fase === "finalizado") {
      const timer = setTimeout(() => {
        navigate("/chat", { state: { intensidade, emocao } });
      }, 2000);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setFase((prev) => {
        if (prev === "inspira") return "solta";
        
        setCiclos((c) => {
          const next = c + 1;
          if (next >= maxCiclos) {
            clearInterval(interval);
            setTimeout(() => setFase("finalizado"), 1000);
          }
          return next;
        });
        
        return "inspira";
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [fase, maxCiclos, navigate, intensidade, emocao]);

  return (
    <div className="min-h-screen bg-[#0a0502] flex flex-col items-center justify-center p-6 text-slate-100 overflow-hidden relative">
      
      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 w-full max-w-xs flex gap-2 px-6 z-50">
        {steps.map((s, i) => (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              s.completed || s.active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className="absolute top-24 text-center space-y-2 z-10">
        <div className="flex items-center gap-2 justify-center text-emerald-400 font-black uppercase tracking-[0.2em] text-xs">
          <Activity className="w-4 h-4" />
          Aferindo Sinais Emocionais
        </div>
        <p className="text-slate-500 text-sm font-light">Ciclo {ciclos + 1} de {maxCiclos}</p>
      </div>

      <AnimatePresence mode="wait">
        {fase !== "finalizado" ? (
          <motion.div
            key={fase}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="text-center space-y-12 relative z-10"
          >
            <div className="space-y-4">
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
                {fase === "inspira" ? "Inspira" : "Expira"}
              </h2>
              <p className="text-emerald-400/60 text-xl font-light max-w-xs mx-auto italic">
                {fase === "inspira" 
                  ? "Sinta o ar renovando sua calma..." 
                  : "Solte toda a tensão acumulada..."}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 relative z-10"
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <Heart className="w-10 h-10 text-slate-950 fill-current" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">Sinais Estabilizados</h2>
              <p className="text-slate-400">Encaminhando para o Clínico Geral (IARA)...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breathing Circle */}
      <motion.div
        animate={{
          scale: fase === "inspira" ? 2 : 1,
          opacity: fase === "inspira" ? 0.3 : 0.1,
          backgroundColor: fase === "inspira" ? "#10b981" : "#3b82f6"
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none"
      />
      
      <div className="fixed bottom-12 flex items-center gap-8 opacity-20">
        <div className="flex flex-col items-center gap-1">
           <Wind className="w-5 h-5" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Fluxo</span>
        </div>
        <div className="flex flex-col items-center gap-1">
           <Activity className="w-5 h-5" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Ritmo</span>
        </div>
      </div>
    </div>
  );
}
