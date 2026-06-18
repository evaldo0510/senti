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
  Lock,
  Award
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
  const [unlockedBadge, setUnlockedBadge] = useState<any | null>(null);

  const SET_BADGES = [
    { id: "reset_1", title: "Pé na Estrada", description: "Completou o 1º dia de reprogramação emocional.", day: 1, xpReward: 50 },
    { id: "reset_3", title: "Foco Triplo", description: "Concluiu 3 dias acumulados e iniciou a fixação de novos caminhos neurais.", day: 3, xpReward: 100 },
    { id: "reset_7", title: "Hábito Formado", description: "Superou 7 dias. Primeira semana de transformação concluída!", day: 7, xpReward: 200 },
    { id: "reset_14", title: "Consciência Plena", description: "Duas semanas consecutivas de reeducação persistente.", day: 14, xpReward: 350 },
    { id: "reset_21", title: "Mestre do ReSet", description: "Completou toda a jornada de 21 dias! Mente totalmente reprogramada.", day: 21, xpReward: 500 },
  ];

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
    
    const currentDay = parseInt(dayId || "1");
    let freshlyUnlocked: any = null;

    if (user) {
      // 1. Calculate achievements
      const userAchievements = [...(user.achievements || [])];
      
      // Look for any badge representing currentDay milestone that isn't earned yet
      const matchedBadge = SET_BADGES.find(b => b.day === currentDay);
      if (matchedBadge && !userAchievements.includes(matchedBadge.id)) {
        userAchievements.push(matchedBadge.id);
        freshlyUnlocked = matchedBadge;
        setUnlockedBadge(matchedBadge);
        
        // Reward badge XP
        await addXp(auth.currentUser.uid, matchedBadge.xpReward);
      }

      // 2. Update user progress & badges list in Firebase
      const updateData: any = {};
      if (user.journeyProgress === undefined || user.journeyProgress < currentDay) {
        updateData.journeyProgress = currentDay;
      }
      if (freshlyUnlocked) {
        updateData.achievements = userAchievements;
      }

      if (Object.keys(updateData).length > 0) {
        await userService.updateProfile(auth.currentUser.uid, updateData);
      }

      // Always award daily exercise XP
      if (!user.journeyProgress || user.journeyProgress < currentDay) {
        await addXp(auth.currentUser.uid, XP_ACTIONS.COMPLETE_DAY);
      }
    }

    // Delay before going back, letting user appreciate the victory or badge unlock
    setTimeout(() => {
      navigate("/reset-21");
    }, freshlyUnlocked ? 5000 : 2500);
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
          <span className="font-bold tracking-widest uppercase text-[10px] text-emerald-400 mb-1">Dia {dayData.day} • {dayData.phase}</span>
          
          {/* Subtle micro progress indicator segments for 21-day timeline */}
          <div className="flex gap-1 justify-center items-center h-1.5 mb-1.5">
            {Array.from({ length: 21 }).map((_, i) => {
              const currentDayNum = i + 1;
              const isCompletedJourney = currentDayNum < dayData.day;
              const isCurrentJourney = currentDayNum === dayData.day;
              return (
                <motion.div
                  key={i}
                  className={cn(
                    "h-1 rounded-full",
                    isCompletedJourney ? "bg-emerald-500 w-1.5" :
                    isCurrentJourney ? "bg-teal-400 w-3.5 shadow-[0_0_6px_rgba(45,212,191,0.6)]" :
                    "bg-white/15 w-1"
                  )}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ 
                    delay: i * 0.02, 
                    type: "spring", 
                    stiffness: 100, 
                    damping: 15 
                  }}
                />
              );
            })}
          </div>

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
              {/* Play Button with breathing glow indicator */}
              <div className="relative flex-shrink-0">
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/30 rounded-full -z-10"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                )}
                <button 
                  onClick={togglePlay}
                  className="w-16 h-16 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all active:scale-95 relative z-10"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
              </div>
              
              <div className="flex-1 space-y-2">
                {/* Advanced audio progress timeline with glowing handle dot and smooth progress transitions */}
                <div className="h-2 bg-white/10 rounded-full relative overflow-visible">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "tween", ease: "linear", duration: 0.2 }}
                  />
                  {progress > 0 && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_#10b981] -ml-1.5 pointer-events-none"
                      animate={{ 
                        left: `${progress}%`,
                        scale: isPlaying ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        left: { type: "tween", ease: "linear", duration: 0.2 },
                        scale: { repeat: isPlaying ? Infinity : 0, duration: 1.5, ease: "easeInOut" }
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Início</span>
                  <span className="flex items-center gap-1">
                    {isPlaying && (
                      <span className="flex gap-0.5 items-center mr-1">
                        <motion.span animate={{ height: [3, 8, 3] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} className="w-0.5 h-2 bg-emerald-400" />
                        <motion.span animate={{ height: [6, 2, 6] }} transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut", delay: 0.15 }} className="w-0.5 h-2 bg-emerald-400" />
                        <motion.span animate={{ height: [2, 7, 2] }} transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.3 }} className="w-0.5 h-2 bg-emerald-400" />
                      </span>
                    )}
                    IARA Conduzindo
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-white/5 rounded-xl text-slate-400 transition-colors hover:bg-white/10"
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
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-emerald-950 flex flex-col items-center justify-center text-white p-8 text-center"
          >
            {unlockedBadge ? (
              <motion.div
                initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="max-w-md bg-slate-900 border border-emerald-500/30 p-8 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl" />

                <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(245,158,11,0.4)] animate-bounce">
                  <Award className="w-12 h-12 text-slate-950" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Nova Conquista Desbloqueada!</span>
                  <h3 className="text-3xl font-black tracking-tight text-white">{unlockedBadge.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {unlockedBadge.description}
                  </p>
                </div>

                <div className="flex gap-2 justify-center items-center py-2">
                  <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs font-black text-amber-400 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <Zap className="w-4 h-4" />
                    +{unlockedBadge.xpReward} XP Recompensa
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-black text-emerald-400 flex items-center gap-1.5 border-dashed">
                    <CheckCircle2 className="w-4 h-4" />
                    Dia {unlockedBadge.day} Concluído
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic">Sua mente está se reprogramando a cada escolha consciente.</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6"
              >
                <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.35)] animate-pulse">
                  <CheckCircle2 className="w-16 h-16 text-slate-950" />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tighter mb-2 text-white">Excelente!</h2>
                  <p className="text-emerald-200 text-lg font-light max-w-xs mx-auto">
                    Você deu mais um passo importante na sua reprogramação emocional.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full font-bold text-emerald-300 border border-white/10">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  +20 XP Conquistados
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
