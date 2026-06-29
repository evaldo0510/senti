import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Sparkles, Bell } from "lucide-react";
import { useFeaturePreview } from "../context/FeaturePreviewContext";
import { cn } from "../lib/utils";

export const FeaturePreviewDialog: React.FC = () => {
  const { isOpen, currentFeature, closePreview, subscribedFeatures, toggleSubscription } = useFeaturePreview();

  if (!currentFeature) return null;

  const Icon = currentFeature.icon || Sparkles;
  const isSubscribed = subscribedFeatures[currentFeature.id] || false;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="feature-preview-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePreview}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            id="feature-preview-card"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full space-y-5 shadow-2xl relative text-slate-800 dark:text-slate-100"
          >
            <button
              id="feature-preview-close"
              onClick={closePreview}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/10">
                <Icon className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse">
                  Novidades no Ecossistema
                </span>
                <h4 className="text-xl font-serif italic font-bold text-slate-850 dark:text-white pt-1">
                  {currentFeature.title}
                </h4>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                {currentFeature.description}
              </p>

              {/* Centralized professional "Em breve, estamos trabalhando para trazer essa funcionalidade até você!" message */}
              <div className="w-full bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 text-center space-y-1">
                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Em breve, estamos trabalhando para trazer essa funcionalidade até você!
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-light">
                  Esta ferramenta incrível está sendo preparada pela nossa equipe clínica e de tecnologia para apoiar seu bem-estar.
                </p>
              </div>

              {/* Centralized notification subscription trigger */}
              <button
                id="feature-preview-subscribe"
                onClick={() => toggleSubscription(currentFeature.id)}
                className={cn(
                  "w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border",
                  isSubscribed
                    ? "bg-slate-100 dark:bg-slate-850 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500/20 shadow-lg shadow-indigo-600/15"
                )}
              >
                <Bell className="w-4 h-4" />
                {isSubscribed ? "Inscrito para Notificações" : "Notificar-me quando disponível"}
              </button>

              <button
                id="feature-preview-back"
                onClick={closePreview}
                className="w-full py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold transition-all uppercase tracking-widest mt-1"
              >
                Voltar ao Painel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
