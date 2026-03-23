import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function Respiracao() {
  const location = useLocation();
  const navigate = useNavigate();
  const { intensidade = 5, emocao = "" } = location.state || {};

  const [fase, setFase] = useState<"inspira" | "solta" | "finalizado">("inspira");
  const [ciclos, setCiclos] = useState(0);
  const maxCiclos = intensidade > 7 ? 4 : 2;

  useEffect(() => {
    if (fase === "finalizado") {
      navigate("/chat", { state: { intensidade, emocao } });
      return;
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={fase}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="text-center space-y-12 relative z-10"
        >
          <h2 className="text-4xl font-light tracking-tight text-emerald-100">
            {fase === "inspira" ? "Inspira..." : "E solta..."}
          </h2>
          <p className="text-emerald-400/60 text-lg font-light max-w-xs mx-auto">
            {fase === "inspira" 
              ? "como se estivesse abrindo espaço dentro de você..." 
              : "como se estivesse devolvendo um pouco desse peso..."}
          </p>
        </motion.div>
      </AnimatePresence>

      <motion.div
        animate={{
          scale: fase === "inspira" ? 1.5 : 1,
          opacity: fase === "inspira" ? 0.2 : 0.1,
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="absolute w-64 h-64 bg-emerald-500 rounded-full blur-3xl pointer-events-none"
      />
    </div>
  );
}
