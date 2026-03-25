import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  CheckCircle2, 
  Sparkles,
  Zap,
  BookOpen,
  ChevronRight,
  Volume2,
  VolumeX,
  Lock
} from "lucide-react";
import { getDayData, JourneyDay } from "../data/journey21";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";
import { cn } from "../lib/utils";
import { addXp, XP_ACTIONS } from "../services/gamificationService";

export default function Reset21Day() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const [dayData, setDayData] = useState<JourneyDay | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const day = parseInt(dayId || "1");
    setDayData(getDayData(day));

    const loadUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const profile = await userService.getUser(currentUser.uid);
        setUser(profile);
        
        // Check if day is locked (premium check)
        if (day > 3 && !profile?.isPremium) {
          navigate("/reset-21/sales");
        }
      }
    };
    loadUser();
  }, [dayId, navigate]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const handleComplete = async () => {
    if (!dayData || !auth.currentUser) return;
    
    setIsCompleted(true);
    
    // Update user progress in Firebase
    const currentDay = parseInt(dayId || "1");
    if (user && (user.journeyProgress || 0) < currentDay) {
      await userService.updateProfile(auth.currentUser.uid, {
        journeyProgress: currentDay
      });
      
      // Award XP
      await addXp(auth.currentUser.uid, XP_ACTIONS.COMPLETE_DAY);
    }

    // Small delay before going back
    setTimeout(() => {
      navigate("/reset-21");
    }, 2000);
  };

  if (!dayData) return null;

  return (
    <div className="min-h-screen bg-[#0a0502] text-slate-100 flex flex-col font-sans relative overflow-hidden pb-20">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <header className="p-6 flex items-center justify-between z-10 relative bg-slate-950/50 backdrop-blur-xl border-b border-white/5 sticky top-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-bold tracking-widest uppercase text-[10px] text-emerald-400">Dia {dayData.day} • {dayData.phase}</span>
          <h1 className="text-sm font-black tracking-tighter text-white">{dayData.title}</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="flex-1 p-6 z-10 relative max-w-2xl mx-auto w-full space-y-8">
        {/* 1. Pílula (Impacto) */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-[32px] p-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30" />
          <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-4 opacity-50" />
          <p className="text-2xl font-serif italic text-white leading-relaxed">
            "{dayData.pill}"
          </p>
        </motion.section>

        {/* 2. Áudio IARA (Player) */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Guia por Voz (IARA)
          </h3>
          
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 space-y-6">
            <div className="flex items-center gap-6">
              <button 
                onClick={togglePlay}
                className="w-16 h-16 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              
              <div className="flex-1 space-y-2">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Início</span>
                  <span>IARA Conduzindo</span>
                </div>
              </div>

              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-white/5 rounded-xl text-slate-400"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400 italic leading-relaxed text-center">
                "{dayData.audioScript}"
              </p>
            </div>
          </div>
          <audio 
            ref={audioRef}
            src={dayData.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
          />
        </section>

        {/* 3. Exercício & Ação */}
        <section className="grid grid-cols-1 gap-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Exercício Guiado</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {dayData.exercise}
            </p>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Micro Ação do Dia</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {dayData.action}
            </p>
          </div>
        </section>

        {/* Complete Button */}
        <button 
          onClick={handleComplete}
          disabled={isCompleted}
          className={cn(
            "w-full py-5 rounded-[24px] font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl",
            isCompleted 
              ? "bg-emerald-500 text-white" 
              : "bg-white text-slate-900 hover:bg-emerald-50"
          )}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-6 h-6" />
              Dia Concluído!
            </>
          ) : (
            <>
              Concluir Prática
              <ChevronRight className="w-6 h-6" />
            </>
          )}
        </button>
      </main>

      <AnimatePresence>
        {isCompleted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-emerald-500 flex flex-col items-center justify-center text-white p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <CheckCircle2 className="w-32 h-32 mb-6" />
            </motion.div>
            <h2 className="text-4xl font-black tracking-tighter mb-4">Excelente!</h2>
            <p className="text-emerald-100 text-lg font-medium max-w-xs">
              Você deu mais um passo importante na sua reprogramação emocional.
            </p>
            <div className="mt-8 flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full font-bold">
              <Zap className="w-5 h-5 text-yellow-300" />
              +20 XP Conquistados
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
