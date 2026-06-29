import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles, Sun, Droplets } from "lucide-react";

interface MeuJardimProps {
  streakDays?: number;
  diaryEntriesCount?: number;
  averageMood?: number;
  totalXP?: number;
}

export default function MeuJardim({
  streakDays = 3,
  diaryEntriesCount = 5,
  averageMood = 7.5,
  totalXP = 120
}: MeuJardimProps) {

  // Calculate growth levels (0 to 4)
  const treeLevel = useMemo(() => {
    if (streakDays === 0) return 0;
    if (streakDays <= 2) return 1;
    if (streakDays <= 4) return 2;
    if (streakDays <= 7) return 3;
    return 4; // Majestic Blooming Tree
  }, [streakDays]);

  const flowerLevel = useMemo(() => {
    if (diaryEntriesCount === 0) return 0;
    if (diaryEntriesCount <= 1) return 1;
    if (diaryEntriesCount <= 3) return 2;
    if (diaryEntriesCount <= 6) return 3;
    return 4; // Complete Lavender Fields
  }, [diaryEntriesCount]);

  const waterLevel = useMemo(() => {
    // Represents self-care nurturing index from 0% to 100%
    const base = (streakDays * 10) + (diaryEntriesCount * 15);
    return Math.min(100, Math.max(20, base));
  }, [streakDays, diaryEntriesCount]);

  // Plant stage descriptions
  const plantDetails = useMemo(() => {
    const details = {
      tree: {
        title: "Árvore da Consistência",
        desc: "",
        icon: "🌳",
        color: "text-emerald-500"
      },
      flower: {
        title: "Flor da Expressão",
        desc: "",
        icon: "🌸",
        color: "text-indigo-500"
      },
      sprout: {
        title: "Brotos de Acolhimento",
        desc: "",
        icon: "🌱",
        color: "text-amber-500"
      }
    };

    if (treeLevel === 0) {
      details.tree.desc = "Uma semente adormecida na terra fértil. Faça login amanhã para brotar.";
      details.tree.icon = "🫘";
    } else if (treeLevel === 1) {
      details.tree.desc = "Um pequeno broto verde surgindo. Continue acessando para crescer.";
      details.tree.icon = "🌱";
    } else if (treeLevel === 2) {
      details.tree.desc = "Um arbusto jovem e resiliente. Seus hábitos diários dão força.";
      details.tree.icon = "🌿";
    } else if (treeLevel === 3) {
      details.tree.desc = "Uma jovem árvore robusta com galhos firmes e novas folhas.";
      details.tree.icon = "🌳";
    } else {
      details.tree.desc = "Uma grande árvore antiga e florida. Sua consistência inspira vida.";
      details.tree.icon = "🌳✨";
    }

    if (flowerLevel === 0) {
      details.flower.desc = "Sem registros recentes de escrita. Suas palavras nutrem esta flor.";
      details.flower.icon = "🫙";
    } else if (flowerLevel === 1) {
      details.flower.desc = "Um pequeno botão tímido e arroxeado. Continue escrevendo no seu diário.";
      details.flower.icon = "🌷";
    } else if (flowerLevel === 2) {
      details.flower.desc = "Flor abrindo suas pétalas. A escrita ajuda a clarear sua mente.";
      details.flower.icon = "🌹";
    } else if (flowerLevel === 3) {
      details.flower.desc = "Um buquê perfumado de flores silvestres. Seus sentimentos têm voz.";
      details.flower.icon = "🌺";
    } else {
      details.flower.desc = "Um lindo campo de lavandas floridas. Expressão e autoconhecimento plenos.";
      details.flower.icon = "🌸✨";
    }

    // Sprout reflects mood stability
    if (averageMood < 4.0) {
      details.sprout.desc = "Solo necessitando de água e carinho. Acolha suas feridas com IARA.";
      details.sprout.icon = "🍂";
    } else if (averageMood < 6.5) {
      details.sprout.desc = "Brotos sensíveis crescendo em ritmo próprio. Dê tempo ao tempo.";
      details.sprout.icon = "🌱";
    } else {
      details.sprout.desc = "Brotos radiantes absorvendo sol. Seu equilíbrio interno brilha.";
      details.sprout.icon = "🌿✨";
    }

    return details;
  }, [treeLevel, flowerLevel, averageMood]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-100 dark:shadow-none relative overflow-hidden">
      {/* Dynamic Background Aura */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Metaphor Introduction */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 px-2.5 py-1 rounded-md">
              Mapeador de Evolução Pessoal
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            Meu Jardim <Sparkles size={18} className="text-emerald-500 animate-pulse" />
          </h3>
          <p className="text-xs text-slate-550 dark:text-slate-450 max-w-lg">
            Acompanhe seu autocuidado através de uma metáfora orgânica. Sem cobranças, apenas crescimento contínuo de suas ações diárias.
          </p>
        </div>

        {/* Vitality indicators */}
        <div className="flex items-center gap-2 font-mono font-bold text-xs bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
          <span className="text-blue-500">💧 {waterLevel}% Nutrito</span>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span className="text-amber-500">✨ Level {Math.floor(totalXP / 100) + 1}</span>
        </div>
      </div>

      {/* Visual Garden Render Stage (Interactive Vector Canvas) */}
      <div className="relative z-10 bg-gradient-to-b from-sky-50 to-emerald-50/50 dark:from-slate-950/50 dark:to-emerald-950/20 border border-slate-100 dark:border-white/5 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
        
        {/* Dynamic Sky Ambient elements */}
        <div className="absolute top-6 left-8 flex items-center gap-1 text-amber-500/80">
          <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: "30s" }} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Sol da Tarde</span>
        </div>

        {/* Dynamic Watering effect */}
        <div className="absolute top-6 right-8 flex items-center gap-1.5 text-blue-500/80">
          <Droplets className="w-4 h-4 animate-bounce" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Nuvem Leve</span>
        </div>

        {/* The Plants Showcase Canvas */}
        <div className="flex items-end justify-center gap-8 sm:gap-16 w-full max-w-lg min-h-[180px] border-b-2 border-slate-200 dark:border-zinc-850 pb-1 relative">
          
          {/* PLANT 1: Tree of Consistency */}
          <motion.div 
            className="flex flex-col items-center relative group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-slate-900 dark:bg-slate-950 border border-white/5 text-white text-[10px] px-2.5 py-1 rounded-md pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-md">
              Série: {streakDays} {streakDays === 1 ? "Dia" : "Dias"}
            </div>
            
            {/* Tree SVGs based on level */}
            <div className="relative flex items-end justify-center w-24 h-32 overflow-visible">
              {treeLevel === 0 && (
                <svg viewBox="0 0 100 100" className="w-14 h-14 overflow-visible">
                  {/* Seed in soil */}
                  <ellipse cx="50" cy="85" rx="14" ry="8" fill="#5c4033" />
                  <ellipse cx="50" cy="83" rx="8" ry="5" fill="#a0522d" className="animate-pulse" />
                  <circle cx="50" cy="81" r="3.5" fill="#f59e0b" />
                </svg>
              )}
              
              {treeLevel === 1 && (
                <svg viewBox="0 0 100 100" className="w-20 h-24 overflow-visible">
                  {/* Small sprout */}
                  <ellipse cx="50" cy="90" rx="16" ry="6" fill="#5c4033" />
                  <path d="M 50,90 Q 48,65 52,45" stroke="#78350f" strokeWidth="4" strokeLinecap="round" fill="none" />
                  {/* Leaf 1 */}
                  <path d="M 52,45 Q 64,35 60,50 Q 52,55 52,45" fill="#10b981" />
                  {/* Leaf 2 */}
                  <path d="M 52,55 Q 38,48 42,60 Q 50,62 52,55" fill="#059669" />
                </svg>
              )}

              {treeLevel === 2 && (
                <svg viewBox="0 0 100 100" className="w-22 h-28 overflow-visible">
                  {/* Growing twig */}
                  <ellipse cx="50" cy="90" rx="18" ry="6" fill="#5c4033" />
                  <path d="M 50,90 Q 49,60 51,35" stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none" />
                  {/* Branches */}
                  <path d="M 50,65 Q 38,50 32,45" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M 51,52 Q 62,40 68,36" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />
                  {/* Leaves */}
                  <circle cx="32" cy="45" r="9" fill="#10b981" />
                  <circle cx="68" cy="36" r="10" fill="#059669" />
                  <circle cx="51" cy="35" r="11" fill="#34d399" />
                </svg>
              )}

              {treeLevel === 3 && (
                <svg viewBox="0 0 100 120" className="w-24 h-32 overflow-visible">
                  {/* Robust young tree */}
                  <path d="M 50,110 Q 49,70 51,45" stroke="#78350f" strokeWidth="9" strokeLinecap="round" fill="none" />
                  <path d="M 50,75 Q 36,60 28,55" stroke="#78350f" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <path d="M 51,65 Q 64,50 72,45" stroke="#78350f" strokeWidth="4" strokeLinecap="round" fill="none" />
                  {/* Dense leafy canopy */}
                  <circle cx="50" cy="42" r="20" fill="#10b981" opacity="0.95" />
                  <circle cx="30" cy="52" r="15" fill="#059669" opacity="0.9" />
                  <circle cx="70" cy="46" r="16" fill="#047857" opacity="0.9" />
                </svg>
              )}

              {treeLevel === 4 && (
                <svg viewBox="0 0 100 120" className="w-24 h-32 overflow-visible">
                  {/* Blooming magnificent tree */}
                  <path d="M 50,110 Q 50,65 50,42" stroke="#78350f" strokeWidth="11" strokeLinecap="round" fill="none" />
                  <path d="M 50,75 Q 34,58 26,52" stroke="#78350f" strokeWidth="5" strokeLinecap="round" fill="none" />
                  <path d="M 50,62 Q 66,48 74,42" stroke="#78350f" strokeWidth="5" strokeLinecap="round" fill="none" />
                  {/* Canopy clusters */}
                  <circle cx="50" cy="38" r="23" fill="#10b981" opacity="0.95" />
                  <circle cx="28" cy="50" r="17" fill="#059669" opacity="0.9" />
                  <circle cx="72" cy="44" r="18" fill="#047857" opacity="0.9" />
                  <circle cx="50" cy="54" r="14" fill="#34d399" opacity="0.85" />
                  {/* Blossoms */}
                  <motion.circle cx="45" cy="28" r="4.5" fill="#ec4899" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} />
                  <motion.circle cx="58" cy="40" r="3.5" fill="#f472b6" animate={{ scale: [1.2, 1, 1.2] }} transition={{ repeat: Infinity, duration: 2 }} />
                  <motion.circle cx="30" cy="44" r="4" fill="#f472b6" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 3 }} />
                  <motion.circle cx="70" cy="36" r="5" fill="#ec4899" animate={{ scale: [1.1, 0.9, 1.1] }} transition={{ repeat: Infinity, duration: 2.8 }} />
                  <circle cx="52" cy="48" r="3.5" fill="#f472b6" />
                  <circle cx="36" cy="56" r="3" fill="#ec4899" />
                </svg>
              )}
            </div>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">Consistência</span>
          </motion.div>

          {/* PLANT 2: Flower of Expression */}
          <motion.div 
            className="flex flex-col items-center relative group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-slate-900 dark:bg-slate-950 border border-white/5 text-white text-[10px] px-2.5 py-1 rounded-md pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-md">
              Escritas: {diaryEntriesCount} {diaryEntriesCount === 1 ? "Diário" : "Diários"}
            </div>

            <div className="relative flex items-end justify-center w-24 h-32 overflow-visible">
              {flowerLevel === 0 && (
                <svg viewBox="0 0 100 100" className="w-14 h-14 overflow-visible">
                  {/* Empty soil pot */}
                  <ellipse cx="50" cy="85" rx="14" ry="6" fill="#4b5563" />
                  <path d="M 38,85 L 42,97 L 58,97 L 62,85 Z" fill="#374151" />
                  <line x1="42" y1="91" x2="58" y2="91" stroke="#4b5563" strokeWidth="1" strokeDasharray="2" />
                </svg>
              )}

              {flowerLevel === 1 && (
                <svg viewBox="0 0 100 100" className="w-20 h-24 overflow-visible">
                  {/* A tiny budding stem */}
                  <ellipse cx="50" cy="90" rx="14" ry="5" fill="#5c4033" />
                  <path d="M 50,90 Q 48,70 50,55" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
                  {/* Bud */}
                  <ellipse cx="50" cy="52" rx="4" ry="6.5" fill="#818cf8" className="animate-pulse" />
                </svg>
              )}

              {flowerLevel === 2 && (
                <svg viewBox="0 0 100 100" className="w-20 h-26 overflow-visible">
                  {/* Half opened stem and leaves */}
                  <ellipse cx="50" cy="90" rx="14" ry="5" fill="#5c4033" />
                  <path d="M 50,90 Q 48,65 50,45" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
                  {/* Left leaf */}
                  <path d="M 49,70 Q 38,65 42,75 Q 49,75 49,70" fill="#059669" />
                  {/* Slightly opening rose flower */}
                  <circle cx="50" cy="40" r="7" fill="#6366f1" />
                  <path d="M 46,40 C 46,32 54,32 54,40 Z" fill="#4f46e5" />
                  <path d="M 48,43 C 44,38 56,38 52,43 Z" fill="#818cf8" />
                </svg>
              )}

              {flowerLevel === 3 && (
                <svg viewBox="0 0 100 120" className="w-24 h-32 overflow-visible">
                  {/* Fully opened elegant flower */}
                  <ellipse cx="50" cy="105" rx="16" ry="5" fill="#5c4033" />
                  <path d="M 50,105 Q 48,72 50,48" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  {/* Leaves */}
                  <path d="M 49,80 Q 34,74 38,86 Q 49,84 49,80" fill="#059669" />
                  <path d="M 50,70 Q 66,66 62,78 Q 50,76 50,70" fill="#059669" />
                  {/* Petals */}
                  <g className="origin-center animate-bounce" style={{ animationDuration: "6s" }}>
                    <circle cx="50" cy="40" r="6" fill="#f59e0b" /> {/* center */}
                    <ellipse cx="50" cy="27" rx="6" ry="10" fill="#a855f7" opacity="0.9" />
                    <ellipse cx="50" cy="53" rx="6" ry="10" fill="#a855f7" opacity="0.9" />
                    <ellipse cx="37" cy="40" rx="10" ry="6" fill="#a855f7" opacity="0.9" />
                    <ellipse cx="63" cy="40" rx="10" ry="6" fill="#a855f7" opacity="0.9" />
                  </g>
                </svg>
              )}

              {flowerLevel === 4 && (
                <svg viewBox="0 0 120 120" className="w-26 h-32 overflow-visible">
                  {/* Multiple lush flowers - lavender field metaphor */}
                  <ellipse cx="60" cy="110" rx="28" ry="6" fill="#5c4033" />
                  
                  {/* Left flower (shorter) */}
                  <path d="M 40,110 Q 36,85 38,62" stroke="#059669" strokeWidth="2.5" fill="none" />
                  <ellipse cx="38" cy="58" rx="4.5" ry="7.5" fill="#f43f5e" />
                  <circle cx="33" cy="58" r="4" fill="#fb7185" />
                  <circle cx="43" cy="58" r="4" fill="#fb7185" />
                  <circle cx="38" cy="51" r="4" fill="#fb7185" />
                  <circle cx="38" cy="65" r="4" fill="#fb7185" />

                  {/* Right flower (medium) */}
                  <path d="M 80,110 Q 84,80 82,56" stroke="#059669" strokeWidth="2.5" fill="none" />
                  <ellipse cx="82" cy="50" rx="4.5" ry="7.5" fill="#ec4899" />
                  <circle cx="77" cy="50" r="4" fill="#f472b6" />
                  <circle cx="87" cy="50" r="4" fill="#f472b6" />
                  <circle cx="82" cy="43" r="4" fill="#f472b6" />
                  <circle cx="82" cy="57" r="4" fill="#f472b6" />

                  {/* Central flower (tall and majestic) */}
                  <path d="M 60,110 Q 58,70 60,40" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M 59,75 Q 46,72 50,82" fill="#059669" />
                  <path d="M 60,62 Q 74,60 70,70" fill="#059669" />
                  
                  <g className="origin-center animate-spin" style={{ animationDuration: "25s" }}>
                    <circle cx="60" cy="30" r="6" fill="#f59e0b" />
                    <ellipse cx="60" cy="16" rx="6.5" ry="11" fill="#6366f1" />
                    <ellipse cx="60" cy="44" rx="6.5" ry="11" fill="#6366f1" />
                    <ellipse cx="46" cy="30" rx="11" ry="6.5" fill="#6366f1" />
                    <ellipse cx="74" cy="30" rx="11" ry="6.5" fill="#6366f1" />
                  </g>
                  {/* Floating particles */}
                  <motion.circle cx="50" cy="20" r="1" fill="#fff" animate={{ y: [-5, -15], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
                  <motion.circle cx="72" cy="18" r="1.5" fill="#818cf8" animate={{ y: [-2, -18], opacity: [0, 0.8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} />
                </svg>
              )}
            </div>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">Expressão</span>
          </motion.div>

          {/* PLANT 3: Sprout of Balance (Mood) */}
          <motion.div 
            className="flex flex-col items-center relative group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-slate-900 dark:bg-slate-950 border border-white/5 text-white text-[10px] px-2.5 py-1 rounded-md pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-md">
              Média: {averageMood.toFixed(1)}/10
            </div>

            <div className="relative flex items-end justify-center w-24 h-32 overflow-visible">
              {averageMood < 4.0 ? (
                <svg viewBox="0 0 100 100" className="w-20 h-24 overflow-visible">
                  {/* Wilted brown/yellow leaf */}
                  <ellipse cx="50" cy="90" rx="14" ry="5" fill="#5c4033" />
                  <path d="M 50,90 Q 42,68 35,58" stroke="#b45309" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  {/* Drooping wilted leaf */}
                  <path d="M 35,58 Q 20,52 24,65 Q 35,68 35,58" fill="#d97706" opacity="0.8" />
                  <circle cx="28" cy="74" r="1.5" fill="#b45309" opacity="0.5" />
                </svg>
              ) : averageMood < 6.5 ? (
                <svg viewBox="0 0 100 100" className="w-20 h-24 overflow-visible">
                  {/* Simple green upright sprout */}
                  <ellipse cx="50" cy="90" rx="15" ry="5" fill="#5c4033" />
                  <path d="M 50,90 Q 49,65 50,48" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
                  {/* Active growing double leaves */}
                  <path d="M 50,48 Q 36,36 42,48 Z" fill="#34d399" />
                  <path d="M 50,48 Q 64,36 58,48 Z" fill="#059669" />
                </svg>
              ) : (
                <svg viewBox="0 0 100 110" className="w-22 h-28 overflow-visible">
                  {/* Glowing healthy sprout */}
                  <ellipse cx="50" cy="95" rx="16" ry="5" fill="#5c4033" />
                  <path d="M 50,95 Q 49,65 50,42" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />
                  {/* Glowing leafy sprout */}
                  <path d="M 50,42 Q 32,28 38,42 Q 50,44 50,42" fill="#34d399" />
                  <path d="M 50,42 Q 68,28 62,42 Q 50,44 50,42" fill="#059669" />
                  
                  {/* Radiant Sunbeam / Sparkles above the healthy plant */}
                  <g className="text-yellow-500">
                    <motion.circle cx="50" cy="24" r="2" fill="#fbbf24" animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                    <motion.circle cx="34" cy="30" r="1.5" fill="#f59e0b" animate={{ scale: [1.3, 1, 1.3], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2 }} />
                    <motion.circle cx="66" cy="30" r="1.5" fill="#f59e0b" animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.8 }} />
                  </g>
                </svg>
              )}
            </div>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">Acolhimento</span>
          </motion.div>

        </div>

        {/* Floating details banner */}
        <div className="w-full text-center mt-4">
          <p className="text-[11px] font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest">
            Alimentado por SentiCore • Dados anônimos e protegidos
          </p>
        </div>
      </div>

      {/* Explanatory Cards list */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tree explanation card */}
        <div className="p-4 rounded-3xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{plantDetails.tree.icon}</span>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
              {plantDetails.tree.title}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
            {plantDetails.tree.desc}
          </p>
        </div>

        {/* Flower explanation card */}
        <div className="p-4 rounded-3xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{plantDetails.flower.icon}</span>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
              {plantDetails.flower.title}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
            {plantDetails.flower.desc}
          </p>
        </div>

        {/* Sprout explanation card */}
        <div className="p-4 rounded-3xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{plantDetails.sprout.icon}</span>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
              {plantDetails.sprout.title}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
            {plantDetails.sprout.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
