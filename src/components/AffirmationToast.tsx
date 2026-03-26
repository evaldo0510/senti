import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X } from "lucide-react";

const AFFIRMATIONS = [
  "Você é mais forte do que imagina.",
  "Cada pequeno passo é um grande progresso.",
  "Sua saúde mental é uma prioridade.",
  "Você merece paz e felicidade.",
  "Sua jornada é única e valiosa.",
  "Respire fundo, você está indo bem.",
  "Você é capaz de superar desafios.",
  "Seja gentil consigo mesmo hoje.",
  "Sua coragem em buscar ajuda é inspiradora.",
  "Você não está sozinho nessa caminhada."
];

export function AffirmationToast() {
  const [currentAffirmation, setCurrentAffirmation] = useState<string | null>(null);

  useEffect(() => {
    // Show an affirmation every 5-10 minutes or based on events
    const showRandomAffirmation = () => {
      const random = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
      setCurrentAffirmation(random);
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        setCurrentAffirmation(null);
      }, 8000);
    };

    // Initial delay
    const timer = setTimeout(showRandomAffirmation, 10000); // 10s after load
    
    // Interval
    const interval = setInterval(showRandomAffirmation, 300000); // 5 minutes

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {currentAffirmation && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50"
        >
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/20 dark:border-emerald-500/30 p-4 rounded-2xl shadow-2xl shadow-emerald-500/10 flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentAffirmation}
              </p>
            </div>
            <button 
              onClick={() => setCurrentAffirmation(null)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
