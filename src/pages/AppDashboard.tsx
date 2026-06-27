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
  Activity,
  HelpCircle,
  Award,
  Wind,
  Flame,
  Crown,
  Zap,
  X
} from "lucide-react";
import { cn } from "../lib/utils";
import { Onboarding } from "../components/Onboarding";
import { GAMIFICATION_BADGES, checkAndAwardBadges, Badge } from "../services/gamificationService";

export default function AppDashboard() {
  const navigate = useNavigate();
  const { user, profile, isAuthReady } = useAuth();
  
  // App metrics & appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentMood, setRecentMood] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Check onboarding status on load
  useEffect(() => {
    if (isAuthReady && profile) {
      // If user profile does not have onboardingCompleted, redirect to /onboarding
      if (!profile.onboardingCompleted) {
        navigate("/onboarding");
      }
    }
  }, [isAuthReady, profile, navigate]);

  // Load user data (appointments and mood) and check achievements
  useEffect(() => {
    let unsubAppts: (() => void) | undefined;
    let unsubMood: (() => void) | undefined;

    if (isAuthReady && user) {
      setLoadingData(true);
      try {
        // Evaluate and award achievements on load
        checkAndAwardBadges(user.uid).catch((err) => {
          console.error("Error evaluating achievements:", err);
        });

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
            onClick={() => window.dispatchEvent(new CustomEvent("start-onboarding-tour"))}
            aria-label="Iniciar Tour de Boas-Vindas"
            title="Tour de Boas-Vindas"
            className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer text-slate-600 dark:text-slate-400"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
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
            const elementId = sc.id === "ia" ? "quick-action-chat" : sc.id === "evolucao" ? "quick-action-diario" : undefined;
            return (
              <button
                id={elementId}
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

        {/* System of Achievements (Conquistas) */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 p-5 rounded-[2rem] space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Conquistas do Paciente</h3>
            </div>
            <button 
              onClick={() => navigate("/perfil")}
              className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline cursor-pointer"
            >
              Ver Todas
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-150 dark:border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Progresso de Emblemas</span>
              <span className="font-bold text-emerald-500 dark:text-emerald-400">
                {(profile?.achievements || []).length} de {GAMIFICATION_BADGES.length} Ativos
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${((profile?.achievements || []).length / GAMIFICATION_BADGES.length) * 100}%` }}
              />
            </div>
            {profile?.streak && profile.streak > 0 ? (
              <p className="text-[10px] text-slate-400 flex items-center gap-1 font-light pt-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                Uso consistente: Você está em uma sequência de <span className="font-bold text-slate-700 dark:text-slate-200">{profile.streak} dias</span>!
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-light pt-0.5">
                Use consistentemente o Diário e Exercícios de Respiração para desbloquear novos emblemas!
              </p>
            )}
          </div>

          {/* Badges Mini-Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {GAMIFICATION_BADGES.map((badge) => {
              const isUnlocked = profile?.achievements?.includes(badge.id);
              
              const getBadgeIcon = (iconName: string) => {
                switch (iconName) {
                  case "Wind": return <Wind className="w-4 h-4" />;
                  case "Flame": return <Flame className="w-4 h-4" />;
                  case "Activity": return <Activity className="w-4 h-4" />;
                  case "Award": return <Award className="w-4 h-4" />;
                  case "HeartPulse": return <HeartPulse className="w-4 h-4" />;
                  case "Calendar": return <Calendar className="w-4 h-4" />;
                  case "Crown": return <Crown className="w-4 h-4" />;
                  case "Compass": return <Compass className="w-4 h-4" />;
                  default: return <Award className="w-4 h-4" />;
                }
              };

              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  title={`${badge.title} - ${isUnlocked ? 'Conquistado' : 'Bloqueado'}`}
                  className={cn(
                    "p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all relative group cursor-pointer active:scale-95 select-none h-16",
                    isUnlocked
                      ? badge.category === 'breathing'
                        ? "bg-sky-500/10 border-sky-500/20 text-sky-500 hover:bg-sky-500/15"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/15"
                      : "bg-slate-50 dark:bg-slate-950/20 border-slate-200/50 dark:border-white/5 text-slate-300 dark:text-slate-700 hover:border-slate-300 dark:hover:border-white/10"
                  )}
                >
                  {getBadgeIcon(badge.icon)}
                  {isUnlocked && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-white dark:border-slate-950 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
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

      <Onboarding />

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-slate-800 dark:text-slate-100"
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg transition-all duration-500",
                  profile?.achievements?.includes(selectedBadge.id)
                    ? selectedBadge.category === 'breathing'
                      ? "bg-sky-500/15 border-sky-500/30 text-sky-500 shadow-sky-500/10"
                      : "bg-amber-500/15 border-amber-500/30 text-amber-500 shadow-amber-500/10"
                    : "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-600"
                )}>
                  {(() => {
                    switch (selectedBadge.icon) {
                      case "Wind": return <Wind className="w-6 h-6" />;
                      case "Flame": return <Flame className="w-6 h-6" />;
                      case "Activity": return <Activity className="w-6 h-6" />;
                      case "Award": return <Award className="w-6 h-6" />;
                      case "HeartPulse": return <HeartPulse className="w-6 h-6" />;
                      case "Calendar": return <Calendar className="w-6 h-6" />;
                      case "Crown": return <Crown className="w-6 h-6" />;
                      case "Compass": return <Compass className="w-6 h-6" />;
                      default: return <Award className="w-6 h-6" />;
                    }
                  })()}
                </div>

                <div className="space-y-1">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                    profile?.achievements?.includes(selectedBadge.id)
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5"
                  )}>
                    {profile?.achievements?.includes(selectedBadge.id) ? "Conquistado" : "Bloqueado"}
                  </span>
                  <h4 className="text-lg font-serif italic font-bold text-slate-850 dark:text-white pt-1">{selectedBadge.title}</h4>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                  {selectedBadge.description}
                </p>

                <div className="w-full bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-white/5 text-left">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Critério de Conquista</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">{selectedBadge.criteria}</p>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    navigate(selectedBadge.category === 'breathing' ? '/respiracao' : '/diario');
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-500/25 mt-2 cursor-pointer"
                >
                  {selectedBadge.category === 'breathing' ? "Praticar Respiração" : "Registrar no Diário"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
