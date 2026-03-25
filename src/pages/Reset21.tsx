import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  PlayCircle, 
  Sparkles,
  ChevronRight,
  RefreshCw,
  Zap,
  ArrowRight,
  Volume2
} from "lucide-react";
import { auth } from "../services/firebase";
import { userService } from "../services/userService";
import { cn } from "../lib/utils";
import { journey21 } from "../data/journey21";

export default function Reset21() {
  const navigate = useNavigate();
  const [progresso, setProgresso] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setShowSuccess(true);
      // Clean up URL
      window.history.replaceState({}, document.title, "/reset21");
    }

    const loadUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const profile = await userService.getUser(currentUser.uid);
        if (profile) {
          setProgresso(profile.journeyProgress || 0);
          setIsPremium(profile.isPremium || false);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleStartDay = (dia: number) => {
    if (dia > progresso + 1) return;
    
    // Premium check
    if (dia > 3 && !isPremium) {
      navigate("/reset-21/sales");
      return;
    }

    navigate(`/reset-21/day/${dia}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-slate-100 flex flex-col font-sans relative overflow-hidden pb-20">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <header className="p-6 flex items-center justify-between z-10 relative bg-slate-950/50 backdrop-blur-xl border-b border-white/5 sticky top-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="font-bold tracking-widest uppercase text-[10px] text-emerald-400">Jornada 21 Dias</span>
          </div>
          <h1 className="text-sm font-black tracking-tighter text-white">SENTI App</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="flex-1 p-6 z-10 relative max-w-2xl mx-auto w-full space-y-8">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500/20 border border-emerald-500/30 rounded-[32px] p-6 text-center space-y-3"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white">Bem-vindo ao Premium!</h3>
              <p className="text-emerald-100 text-sm">Sua jornada de 21 dias foi desbloqueada com sucesso.</p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="text-xs font-bold uppercase tracking-widest text-emerald-400"
              >
                Fechar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Card */}
        <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[32px] p-8 text-white shadow-2xl shadow-emerald-900/40 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter">Dia {progresso + 1}</h2>
              <p className="text-emerald-100 font-light text-lg italic">"Você não precisa continuar reagindo igual."</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-200">
                <span>Progresso da Jornada</span>
                <span>{Math.round((progresso / 21) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(progresso / 21) * 100}%` }}
                  className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>
            </div>

            <button 
              onClick={() => handleStartDay(progresso + 1)}
              className="w-full py-4 bg-white text-emerald-700 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <PlayCircle className="w-6 h-6" />
              Continuar ReSet
            </button>
          </div>
        </section>

        {/* Days Grid */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-300 px-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Sua Trilha de Transformação
          </h3>
          
          <div className="space-y-3">
            {journey21.map((dia, index) => {
              const isCompleted = dia.day <= progresso;
              const isCurrent = dia.day === progresso + 1;
              const isLocked = dia.day > progresso + 1;
              const isPremiumLocked = dia.day > 3 && !isPremium;

              return (
                <motion.div
                  key={dia.day}
                  whileHover={!isLocked ? { x: 4 } : {}}
                  onClick={() => !isLocked && setSelectedDay(selectedDay === dia.day ? null : dia.day)}
                  className={cn(
                    "p-5 rounded-[24px] border transition-all cursor-pointer relative overflow-hidden",
                    isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : 
                    isCurrent ? "bg-slate-900 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]" :
                    "bg-slate-900/40 border-white/5 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border",
                      isCompleted ? "bg-emerald-500 border-emerald-400 text-white" :
                      isCurrent ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                      "bg-slate-800 border-white/5 text-slate-500"
                    )}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : 
                       (isLocked || (isPremiumLocked && !isCurrent)) ? <Lock className="w-5 h-5" /> : 
                       <span className="font-black text-xl">{dia.day}</span>}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          "font-bold text-lg leading-tight",
                          isLocked ? "text-slate-500" : "text-slate-100"
                        )}>
                          {dia.title}
                        </h4>
                        {isPremiumLocked && dia.day > 3 && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
                        {isCompleted ? "Concluído" : isCurrent ? "Disponível Agora" : "Bloqueado"}
                      </p>
                    </div>

                    {!isLocked && (
                      <ChevronRight className={cn(
                        "w-5 h-5 transition-transform",
                        selectedDay === dia.day ? "rotate-90" : "",
                        isCurrent ? "text-emerald-400" : "text-slate-600"
                      )} />
                    )}
                  </div>

                  <AnimatePresence>
                    {selectedDay === dia.day && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {dia.pill}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <Volume2 className="w-3 h-3" /> Áudio IARA
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Exercício
                            </span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartDay(dia.day);
                            }}
                            className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold transition-all border border-emerald-500/20 flex items-center justify-center gap-2"
                          >
                            {isPremiumLocked && dia.day > 3 ? (
                              <>
                                <Lock className="w-4 h-4" />
                                Desbloquear Premium
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-4 h-4" />
                                Iniciar Prática
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0502] via-[#0a0502] to-transparent z-20">
        <button 
          onClick={() => navigate("/profissionais")}
          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-xl"
        >
          Precisa de ajuda profissional?
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
