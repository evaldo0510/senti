import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles, Heart, Sun, Droplets, Calendar, RefreshCw } from "lucide-react";

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
          <p className="text-xs text-slate-500 max-w-lg">
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
          <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: '30s' }} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Sol da Tarde</span>
        </div>

        {/* Dynamic Watering effect */}
        <div className="absolute top-6 right-8 flex items-center gap-1.5 text-blue-500/80">
          <Droplets className="w-4 h-4 animate-bounce" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Nuvem Leve</span>
        </div>

        {/* The Plants Showcase Canvas */}
        <div className="flex items-end justify-center gap-8 sm:gap-16 w-full max-w-lg min-h-[180px] border-b-2 border-slate-200 dark:border-zinc-800 pb-1 relative">
          
          {/* PLANT 1: Tree of Consistency */}
          <motion.div 
            className="flex flex-col items-center relative group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none transition-opacity whitespace-nowrap z-20">
              Streak: {streakDays} Dias
            </div>
            
            {/* Tree SVGs or Pure CSS Shapes based on Level */}
            <div className="relative flex items-center justify-center w-24 h-32">
              {treeLevel === 0 && (
                <div className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center text-xs animate-pulse">🫘</div>
              )}
              
              {treeLevel === 1 && (
                <div className="flex flex-col items-center">
                  <span className="text-2xl animate-bounce">🌱</span>
                  <div className="w-1 bg-amber-800 h-6 rounded-t" />
                </div>
              )}

              {treeLevel === 2 && (
                <div className="flex flex-col items-center">
                  <span className="text-4xl">🌿</span>
                  <div className="w-1.5 bg-amber-800 h-10 rounded-t" />
                </div>
              )}

              {treeLevel === 3 && (
                <div className="flex flex-col items-center">
                  <span className="text-5xl">🌳</span>
                  <div className="w-2 bg-amber-800 h-14 rounded-t" />
                </div>
              )}

              {treeLevel === 4 && (
                <div className="flex flex-col items-center relative">
                  <span className="text-6xl z-10">🌳</span>
                  <motion.span 
                    className="absolute -top-1.5 -right-1 text-sm text-pink-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    🌸
                  </motion.span>
                  <motion.span 
                    className="absolute -top-3 -left-1 text-xs text-pink-400"
                    animate={{ scale: [1.2, 1, 1.2] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                  >
                    🌸
                  </motion.span>
                  <div className="w-2.5 bg-amber-800 h-16 rounded-t" />
                </div>
              )}
            </div>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">Consistência</span>
          </motion.div>

          {/* PLANT 2: Flower of Expression */}
          <motion.div 
            className="flex flex-col items-center relative group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none transition-opacity whitespace-nowrap z-20">
              Diários: {diaryEntriesCount} Registros
            </div>

            <div className="relative flex items-center justify-center w-24 h-32">
              {flowerLevel === 0 && (
                <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-zinc-800 animate-pulse border-2 border-dashed border-slate-400" />
              )}

              {flowerLevel === 1 && (
                <div className="flex flex-col items-center">
                  <span className="text-2xl animate-pulse">🌷</span>
                  <div className="w-1 bg-emerald-600 h-8" />
                </div>
              )}

              {flowerLevel === 2 && (
                <div className="flex flex-col items-center">
                  <span className="text-3xl">🌹</span>
                  <div className="w-1 bg-emerald-600 h-12" />
                </div>
              )}

              {flowerLevel === 3 && (
                <div className="flex flex-col items-center">
                  <span className="text-4xl">🌺</span>
                  <div className="w-1 bg-emerald-600 h-16" />
                </div>
              )}

              {flowerLevel === 4 && (
                <div className="flex flex-col items-center relative">
                  <span className="text-5xl z-10">🌸</span>
                  <span className="absolute -top-2 -right-3 text-sm animate-pulse text-indigo-400">✨</span>
                  <div className="w-1.5 bg-emerald-600 h-20" />
                </div>
              )}
            </div>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">Expressão</span>
          </motion.div>

          {/* PLANT 3: Sprout of Balance (Mood) */}
          <motion.div 
            className="flex flex-col items-center relative group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none transition-opacity whitespace-nowrap z-20">
              Humor: {averageMood.toFixed(1)}/10
            </div>

            <div className="relative flex items-center justify-center w-24 h-32">
              {averageMood < 4.0 ? (
                <div className="flex flex-col items-center">
                  <span className="text-3xl opacity-60">🍂</span>
                  <div className="w-1 bg-amber-700 h-10" />
                </div>
              ) : averageMood < 6.5 ? (
                <div className="flex flex-col items-center">
                  <span className="text-3xl animate-bounce" style={{ animationDuration: '4s' }}>🌱</span>
                  <div className="w-1 bg-emerald-500 h-12" />
                </div>
              ) : (
                <div className="flex flex-col items-center relative">
                  <span className="text-4xl z-10">🌿</span>
                  <span className="absolute -top-3 left-1 text-sm text-yellow-500 animate-pulse">✨</span>
                  <div className="w-1 bg-emerald-500 h-14" />
                </div>
              )}
            </div>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">Acolhimento</span>
          </motion.div>

        </div>

        {/* Floating details banner */}
        <div className="w-full text-center mt-4">
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
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
          <p className="text-[11px] text-slate-500 leading-relaxed">
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
          <p className="text-[11px] text-slate-500 leading-relaxed">
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
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {plantDetails.sprout.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
