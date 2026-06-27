import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wind, 
  Flame, 
  Activity, 
  Award, 
  HeartPulse, 
  Calendar, 
  Crown, 
  Compass, 
  Lock, 
  Trophy, 
  Sparkles, 
  X,
  CheckCircle2,
  Bookmark
} from "lucide-react";
import { GAMIFICATION_BADGES, Badge } from "../services/gamificationService";
import { cn } from "../lib/utils";

const iconMap: Record<string, React.ComponentType<any>> = {
  Wind: Wind,
  Flame: Flame,
  Activity: Activity,
  Award: Award,
  HeartPulse: HeartPulse,
  Calendar: Calendar,
  Crown: Crown,
  Compass: Compass,
};

interface AchievementsWidgetProps {
  userAchievements?: string[];
  xp?: number;
  streak?: number;
}

export function AchievementsWidget({ userAchievements = [], xp = 0, streak = 0 }: AchievementsWidgetProps) {
  const [activeTab, setActiveTab] = useState<"all" | "emotion" | "breathing">("all");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const unlockedCount = GAMIFICATION_BADGES.filter(b => userAchievements.includes(b.id)).length;
  const totalCount = GAMIFICATION_BADGES.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = GAMIFICATION_BADGES.filter(badge => {
    if (activeTab === "all") return true;
    return badge.category === activeTab;
  });

  return (
    <div id="achievements-section" className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
      {/* Header and Overall Progress */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
            Insígnias e Evolução PCH
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Explore a auto-observação com a <b>Poesia Cognitiva</b> e a regulação com a <b>Ancoragem Hipnótica</b> para evoluir no seu processo.
          </p>
        </div>
        
        {/* Progress Ring / Bar */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-150 dark:border-white/5">
          <div className="relative flex items-center justify-center w-10 h-10">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                className="text-slate-200 dark:text-white/5"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                className="text-emerald-500 transition-all duration-1000"
                strokeWidth="3.5"
                strokeDasharray={100}
                strokeDashoffset={100 - progressPercent}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-slate-700 dark:text-slate-200">
              {progressPercent}%
            </span>
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 dark:text-slate-200">
              {unlockedCount} de {totalCount} Conquistas
            </p>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              +{unlockedCount * 50} XP Ganhos
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-white/5 select-none self-start w-fit gap-1">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-4 py-1.5 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer",
            activeTab === "all"
              ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-white/5"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Tudo ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab("emotion")}
          className={cn(
            "px-4 py-1.5 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer",
            activeTab === "emotion"
              ? "bg-white dark:bg-slate-900 text-rose-500 dark:text-rose-400 shadow-sm border border-slate-200/50 dark:border-white/5"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Poesia Cognitiva (Diário)
        </button>
        <button
          onClick={() => setActiveTab("breathing")}
          className={cn(
            "px-4 py-1.5 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer",
            activeTab === "breathing"
              ? "bg-white dark:bg-slate-900 text-emerald-500 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-white/5"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Ancoragem Hipnótica
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = userAchievements.includes(badge.id);
          const BadgeIcon = iconMap[badge.icon] || Trophy;

          // Color themes depending on category
          const isEmotion = badge.category === "emotion";
          const colorClass = isEmotion 
            ? "from-rose-500 to-indigo-500" 
            : "from-emerald-500 to-teal-600";
          const lightColorBg = isEmotion 
            ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/10" 
            : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/10";

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setSelectedBadge(badge)}
              className={cn(
                "relative flex flex-col items-center text-center p-4 rounded-3xl border transition-all cursor-pointer shadow-sm group",
                isUnlocked 
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:shadow-md" 
                  : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-150 dark:border-white/5 opacity-60"
              )}
            >
              {/* Badge Icon Container */}
              <div className="relative mb-3">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 relative overflow-hidden",
                  isUnlocked 
                    ? cn("bg-gradient-to-br text-white shadow-md shadow-black/10 scale-105 group-hover:scale-110", colorClass)
                    : "bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-white/5"
                )}>
                  <BadgeIcon className="w-5 h-5 relative z-10" />
                  {isUnlocked && (
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                {/* Lock Badge overlay */}
                {!isUnlocked && (
                  <div className="absolute -bottom-1 -right-1 bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    <Lock className="w-2.5 h-2.5" />
                  </div>
                )}
                {isUnlocked && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
                    <CheckCircle2 className="w-3 h-3 fill-current" />
                  </div>
                )}
              </div>

              {/* Title & Status */}
              <div className="space-y-1 min-w-0 w-full">
                <p className={cn(
                  "text-xs font-black truncate leading-tight",
                  isUnlocked ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-500"
                )}>
                  {badge.title}
                </p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider line-clamp-1">
                  {isUnlocked ? "Desbloqueado" : "Bloqueado"}
                </p>
              </div>

              {/* Detail peek on hover/desktop */}
              <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-7 overflow-hidden">
                {badge.description}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Badge Information Drawer/Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 bottom-8 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white dark:bg-slate-900 max-w-sm w-full p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl z-50 space-y-6 pointer-events-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Inspecionar Insígnia</span>
                </div>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Badge visual center */}
              <div className="flex flex-col items-center text-center space-y-3 py-4">
                {(() => {
                  const isUnlocked = userAchievements.includes(selectedBadge.id);
                  const BadgeIcon = iconMap[selectedBadge.icon] || Trophy;
                  const isEmotion = selectedBadge.category === "emotion";
                  const colorClass = isEmotion 
                    ? "from-rose-500 to-indigo-500" 
                    : "from-emerald-500 to-teal-600";

                  return (
                    <>
                      <div className={cn(
                        "w-20 h-20 rounded-3xl flex items-center justify-center border text-white relative shadow-xl shadow-black/5",
                        isUnlocked 
                          ? cn("bg-gradient-to-br", colorClass)
                          : "bg-slate-100 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-white/5"
                      )}>
                        <BadgeIcon className="w-9 h-9 relative z-10" />
                        {isUnlocked && (
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)]" 
                          />
                        )}
                        {!isUnlocked && (
                          <div className="absolute -bottom-1 -right-1 bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400 w-7 h-7 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-md">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">
                          {selectedBadge.title}
                        </h4>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                            isEmotion 
                              ? "bg-rose-50 dark:bg-rose-950/20 text-rose-500 border-rose-100 dark:border-rose-950/30" 
                              : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border-emerald-100 dark:border-emerald-950/30"
                          )}>
                            {isEmotion ? "Poesia Cognitiva" : "Ancoragem Hipnótica"}
                          </span>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                            isUnlocked 
                              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" 
                              : "bg-slate-100 dark:bg-slate-950 text-slate-500"
                          )}>
                            {isUnlocked ? "Desbloqueada" : "Bloqueada"}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium pt-2">
                        {selectedBadge.description}
                      </p>

                      {/* Criteria box */}
                      <div className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-white/5 text-left space-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Regras de Desbloqueio
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                          {selectedBadge.criteria}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal italic">
                          {isUnlocked 
                            ? "Parabéns! Você já completou este marco e recebeu +50 XP extras na sua conta." 
                            : "Pratique de forma consciente todos os dias para alcançar este emblema especial!"}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Actions */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-95 active:scale-95 transition-all shadow-md"
              >
                Voltar ao Painel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
