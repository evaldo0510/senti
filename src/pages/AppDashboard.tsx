import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../components/AuthProvider";
import { userService } from "../services/userService";
import { 
  HeartPulse, 
  MessageSquare, 
  Users, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  User, 
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Check,
  Compass,
  ArrowLeft,
  CalendarDays,
  Activity
} from "lucide-react";
import { cn } from "../lib/utils";

export default function AppDashboard() {
  const navigate = useNavigate();
  const { user, profile, isAuthReady } = useAuth();
  
  // App metrics & appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentMood, setRecentMood] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Check onboarding status on load
  useEffect(() => {
    if (isAuthReady && profile) {
      // If user profile does not have onboardingCompleted, redirect to /onboarding
      if (!profile.onboardingCompleted) {
        navigate("/onboarding");
      }
    }
  }, [isAuthReady, profile, navigate]);

  // Load user data (appointments and mood)
  useEffect(() => {
    let unsubAppts: (() => void) | undefined;
    let unsubMood: (() => void) | undefined;

    if (isAuthReady && user) {
      setLoadingData(true);
      try {
        // Fetch appointments
        unsubAppts = userService.getMyAppointments((appts) => {
          const pendingOrConfirmed = appts.filter(a => a.status === 'pending' || a.status === 'confirmed');
          setUpcomingAppointments(pendingOrConfirmed.slice(0, 2));
        }, 'usuario');

        // Fetch recent mood
        unsubMood = userService.getMoodHistory((history) => {
          if (history && history.length > 0) {
            setRecentMood(history[0]);
          }
          setLoadingData(false);
        });
      } catch (err) {
        console.error("Error loading app dashboard live data:", err);
        setLoadingData(false);
      }
    }

    return () => {
      if (unsubAppts) unsubAppts();
      if (unsubMood) unsubMood();
    };
  }, [isAuthReady, user]);

  const getObjectiveLabel = (id?: string) => {
    switch (id) {
      case "conversar_ia":
        return "Conversar com a IA";
      case "encontrar_terapeuta":
        return "Encontrar um terapeuta";
      case "autoconhecimento":
        return "Desenvolver autoconhecimento";
      case "evolucao_emocional":
        return "Acompanhar evolução emocional";
      default:
        return "Melhoria contínua";
    }
  };

  // Shortcut Cards Configuration
  const shortcuts = [
    {
      id: "ia",
      title: "Atendimento IA",
      description: "Converse com a IARA",
      icon: BrainCircuit,
      color: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      path: "/chat"
    },
    {
      id: "terapeuta",
      title: "Meu Terapeuta",
      description: "Encontre profissionais",
      icon: Users,
      color: "from-indigo-500/10 to-violet-500/10 hover:from-indigo-500/20 hover:to-violet-500/20 border-indigo-500/15 text-indigo-600 dark:text-indigo-400",
      path: "/profissionais"
    },
    {
      id: "agendamentos",
      title: "Agendamentos",
      description: "Sessões marcadas",
      icon: Calendar,
      color: "from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border-amber-500/15 text-amber-600 dark:text-amber-400",
      path: "/pronto-atendimento"
    },
    {
      id: "evolucao",
      title: "Minha Evolução",
      description: "Diário e humor",
      icon: TrendingUp,
      color: "from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-500/15 text-purple-600 dark:text-purple-400",
      path: "/diario"
    },
    {
      id: "conteudos",
      title: "Conteúdos",
      description: "Artigos e práticas",
      icon: BookOpen,
      color: "from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-500/15 text-blue-600 dark:text-blue-400",
      path: "/home"
    },
    {
      id: "perfil",
      title: "Meu Perfil",
      description: "Configurações",
      icon: User,
      color: "from-slate-500/10 to-zinc-500/10 hover:from-slate-500/20 hover:to-zinc-500/20 border-slate-500/15 text-slate-700 dark:text-slate-350",
      path: "/perfil"
    }
  ];

  if (!isAuthReady || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-550">Sincronizando Ecossistema...</p>
      </div>
    );
  }

  const welcomeName = profile.nome || user?.displayName || "Usuário";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 transition-colors font-sans">
      
      {/* Header */}
      <header className="px-4 py-4 sm:p-6 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md z-20 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500/15 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <HeartPulse className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-sm font-bold tracking-wider font-serif italic text-slate-850 dark:text-slate-200">
            SentiPae
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/perfil")}
            className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 text-emerald-500 cursor-pointer text-xs font-bold"
          >
            {profile.fotoUrl ? (
              <img src={profile.fotoUrl} alt={welcomeName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              welcomeName.charAt(0).toUpperCase()
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6">
        
        {/* Welcome Section */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Área do Paciente</p>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif italic text-slate-850 dark:text-slate-100">
            Olá, {welcomeName}
          </h2>
          {profile.preferredService && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-2">
              <Sparkles className="w-3 h-3" />
              <span>Foco: {getObjectiveLabel(profile.preferredService)}</span>
            </div>
          )}
        </div>

        {/* Action Shortcuts Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.id}
                onClick={() => navigate(sc.path)}
                className={cn(
                  "p-5 rounded-3xl border text-left space-y-3 bg-gradient-to-br transition-all duration-300 relative group cursor-pointer active:scale-98 select-none",
                  sc.color
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 transition-transform group-hover:scale-105">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-bold leading-none">{sc.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light leading-none">{sc.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Status Cards (Mood & Appointments) */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Recent Mood Tracker */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 p-5 rounded-[2rem] space-y-3.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Como você está?</h3>
              </div>
              <button 
                onClick={() => navigate("/diario")}
                className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline cursor-pointer"
              >
                Registrar
              </button>
            </div>
            {recentMood ? (
              <div className="bg-slate-50 dark:bg-slate-950/30 p-3.5 rounded-2xl border border-slate-200/40 dark:border-white/5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">"{recentMood.note || 'Registro de humor'}"</p>
                  <p className="text-[10px] text-slate-400 font-light">
                    Intensidade: {recentMood.intensity}/10 • {new Date(recentMood.timestamp).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center font-serif italic text-sm font-bold">
                  {recentMood.value}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-light">Você ainda não registrou seu humor hoje. Toque em Registrar para sintonizar sua evolução.</p>
            )}
          </div>

          {/* Upcoming Consultations */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 p-5 rounded-[2rem] space-y-3.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Próximos Agendamentos</h3>
              </div>
              <button 
                onClick={() => navigate("/profissionais")}
                className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline cursor-pointer"
              >
                Agendar
              </button>
            </div>
            
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingAppointments.map((appt) => (
                  <div 
                    key={appt.id}
                    onClick={() => navigate(`/atendimento/${appt.id}`)}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/40 dark:border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-indigo-500/20 active:scale-99 transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{appt.therapistNome}</p>
                      <p className="text-[10px] text-slate-400 font-light">
                        {new Date(appt.date).toLocaleDateString('pt-BR')} • {appt.time} ({appt.type === 'video' ? 'Videochamada' : 'Chat'})
                      </p>
                    </div>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider",
                      appt.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {appt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-light">Nenhuma consulta pendente ou confirmada. Que tal agendar uma conversa profissional?</p>
            )}
          </div>

        </div>

      </main>

    </div>
  );
}
