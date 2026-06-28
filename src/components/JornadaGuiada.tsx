import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Wind, 
  Award,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { orchestrateNextStep } from "../lib/SentiCore";

interface Task {
  id: string;
  title: string;
  description: string;
  category: "chat" | "exercise" | "journal" | "appointment" | "reading";
  xpReward: number;
  completed: boolean;
  actionText: string;
  path: string;
}

interface JornadaGuiadaProps {
  userId?: string;
  diaryEntries?: any[];
  moodHistory?: any[];
}

export default function JornadaGuiada({ userId, diaryEntries = [], moodHistory = [] }: JornadaGuiadaProps) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState(3); // Mock or local storage streak
  const [totalXp, setTotalXp] = useState(0);

  // Dynamically generate the tasks based on user history or provide defaults
  useEffect(() => {
    // Check local storage for task completion states to keep it persistent for the user
    const storedState = localStorage.getItem("sentipae_daily_journey_tasks");
    if (storedState) {
      try {
        setTasks(JSON.parse(storedState));
        return;
      } catch (e) {
        console.error("Error loading task states", e);
      }
    }

    // Determine current day of week to vary the tasks slightly
    const today = new Date().getDay();
    
    // Check if user has already written in the diary today
    const hasWrittenToday = diaryEntries.some(entry => {
      if (!entry.createdAt) return false;
      const entryDate = new Date(entry.createdAt.seconds ? entry.createdAt.seconds * 1000 : entry.createdAt);
      return entryDate.toDateString() === new Date().toDateString();
    });

    // Run SentiCore Orchestration Engine
    const coreSuggestion = orchestrateNextStep(diaryEntries);
    const mappedCategory = 
      coreSuggestion.category === "crisis_support" || coreSuggestion.category === "emotional_rescue" ? "chat" :
      coreSuggestion.category === "sensory_grounding" ? "exercise" :
      coreSuggestion.category === "reflection" ? "journal" : "reading";

    const initialTasks: Task[] = [
      {
        id: "senticore-orchestrated",
        title: `✨ SentiCore: ${coreSuggestion.title}`,
        description: coreSuggestion.description,
        category: mappedCategory as any,
        xpReward: coreSuggestion.xpReward,
        completed: false,
        actionText: coreSuggestion.actionLabel,
        path: coreSuggestion.actionUrl
      },
      {
        id: "daily-iara",
        title: "Acolhimento com IARA",
        description: "Faça seu check-in de humor diário e receba suporte emocional guiado.",
        category: "chat",
        xpReward: 15,
        completed: false,
        actionText: "Conversar com IARA",
        path: "/chat"
      },
      {
        id: "daily-journal",
        title: "Registro de Expressão Diária",
        description: "Escreva seus pensamentos de hoje no seu Diário Emocional.",
        category: "journal",
        xpReward: 20,
        completed: hasWrittenToday,
        actionText: "Escrever no Diário",
        path: "/diario"
      },
      {
        id: "explore-therapists",
        title: "Conectar com Especialista",
        description: "Explore nossa Rede de Cuidado e encontre profissionais recomendados para você.",
        category: "appointment",
        xpReward: 5,
        completed: false,
        actionText: "Ver Especialistas",
        path: "/terapeutas"
      }
    ];

    setTasks(initialTasks);
  }, [diaryEntries]);

  const saveTaskStates = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem("sentipae_daily_journey_tasks", JSON.stringify(updatedTasks));
  };

  const handleToggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tasks.map(task => {
      if (task.id === id) {
        const nextState = !task.completed;
        if (nextState) {
          setTotalXp(prev => prev + task.xpReward);
        } else {
          setTotalXp(prev => Math.max(0, prev - task.xpReward));
        }
        return { ...task, completed: nextState };
      }
      return task;
    });
    saveTaskStates(updated);
  };

  const handleExecuteAction = (task: Task) => {
    navigate(task.path);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Next active pending task
  const activeTask = tasks.find(t => !t.completed) || tasks[0];

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "chat":
        return {
          icon: <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
          bg: "bg-indigo-100 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/10",
          text: "text-indigo-600 dark:text-indigo-400"
        };
      case "journal":
        return {
          icon: <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          bg: "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/10",
          text: "text-emerald-600 dark:text-emerald-400"
        };
      case "exercise":
        return {
          icon: <Wind className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
          bg: "bg-sky-100 dark:bg-sky-500/20 border-sky-200 dark:border-sky-500/10",
          text: "text-sky-600 dark:text-sky-400"
        };
      default:
        return {
          icon: <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
          bg: "bg-purple-100 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/10",
          text: "text-purple-600 dark:text-purple-400"
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-100 dark:shadow-none relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Coordenador de Jornada
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            Sua Jornada Diária <Sparkles size={18} className="text-amber-500 animate-pulse" />
          </h3>
          <p className="text-xs text-slate-500">
            Passos integrados de autocuidado, triagem e acompanhamento humano sugeridos hoje.
          </p>
        </div>

        {/* Streak & XP status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-700 dark:text-amber-400">
            <span className="text-lg">🔥</span>
            <span className="text-xs font-extrabold font-mono">{streak} Dias</span>
          </div>
          {totalXp > 0 && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-700 dark:text-indigo-400">
              <Award size={14} className="text-indigo-500" />
              <span className="text-xs font-extrabold font-mono">+{totalXp} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Main progress bar */}
      <div className="relative z-10 space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Progresso Diário</span>
          <span className="font-mono text-slate-600 dark:text-slate-300">
            {completedCount}/{tasks.length} Concluídos ({progressPercent}%)
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Featured next suggestion ("Tarefa de hoje" / Hero Action) */}
      {activeTask && !activeTask.completed && (
        <div className="relative z-10 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-indigo-500/20">
          <div className="flex gap-4 items-start">
            <div className={`p-3.5 rounded-2xl border ${getCategoryStyles(activeTask.category).bg}`}>
              {getCategoryStyles(activeTask.category).icon}
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-md">
                Próximo Passo Recomendado
              </span>
              <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                {activeTask.title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                {activeTask.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleExecuteAction(activeTask)}
            className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap self-end sm:self-center"
          >
            {activeTask.actionText}
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* All Journey items */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => {
          const cat = getCategoryStyles(task.category);
          return (
            <div 
              key={task.id}
              onClick={() => handleExecuteAction(task)}
              className={`p-4 rounded-3xl border transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer group/item hover:scale-[1.01] ${
                task.completed 
                  ? "bg-slate-50/40 dark:bg-slate-950/10 border-slate-200/60 dark:border-white/5 opacity-70" 
                  : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => handleToggleComplete(task.id, e)}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-zinc-700" />
                  )}
                </button>
                <div className="text-left space-y-0.5">
                  <h5 className={`text-xs font-extrabold transition-colors ${
                    task.completed 
                      ? "line-through text-slate-400 dark:text-slate-600" 
                      : "text-slate-700 dark:text-slate-200 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400"
                  }`}>
                    {task.title}
                  </h5>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase">
                    <span className={cat.text}>{task.category}</span>
                    <span>•</span>
                    <span className="text-amber-500">+{task.xpReward} XP</span>
                  </div>
                </div>
              </div>
              
              <ChevronRight size={14} className="text-slate-300 dark:text-zinc-700 group-hover/item:translate-x-0.5 transition-transform" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
