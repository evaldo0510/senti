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
  Clock,
  X,
  Lock,
  Building2,
  Building,
  GraduationCap,
  Sparkle
} from "lucide-react";
import { cn } from "../lib/utils";
import { Onboarding } from "../components/Onboarding";
import { GAMIFICATION_BADGES, checkAndAwardBadges, Badge } from "../services/gamificationService";

export default function AppDashboard() {
  const navigate = useNavigate();
  const { user, profile, isAuthReady } = useAuth();
  
  // Real-time states
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [inspirationalMessage, setInspirationalMessage] = useState("");
  
  // App metrics & appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentMoods, setRecentMoods] = useState<any[]>([]);
  const [recentDiary, setRecentDiary] = useState<any[]>([]);
  const [totalEntriesCount, setTotalEntriesCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  
  // Modal State for Upcoming Features
  const [upcomingFeatureModal, setUpcomingFeatureModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    icon: any;
  } | null>(null);

  // Digital clock & date setup
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Clock
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);
      
      // Date in Portuguese
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const formattedDate = now.toLocaleDateString('pt-BR', options);
      // Capitalize first letter
      setDateStr(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
      
      // Dynamic inspirational quote based on time
      const hour = now.getHours();
      if (hour >= 6 && hour < 12) {
        setInspirationalMessage("Bom dia! Comece o dia sintonizando seu coração com uma respiração guiada.");
      } else if (hour >= 12 && hour < 18) {
        setInspirationalMessage("Boa tarde! Dedique 2 minutos para registrar como você está se sentindo hoje.");
      } else if (hour >= 18 && hour < 24) {
        setInspirationalMessage("Boa noite! Que tal um diário de gratidão ou meditação para encerrar bem o dia?");
      } else {
        setInspirationalMessage("Olá! Se o sono estiver difícil ou a mente agitada, fale com a IARA. Estou aqui por você.");
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check onboarding status on load
  useEffect(() => {
    if (isAuthReady && profile) {
      if (!profile.onboardingCompleted) {
        navigate("/onboarding");
      }
    }
  }, [isAuthReady, profile, navigate]);

  // Load user data from Firestore
  useEffect(() => {
    let unsubAppts: (() => void) | undefined;
    let unsubMood: (() => void) | undefined;
    let unsubDiary: (() => void) | undefined;

    if (isAuthReady && user) {
      setLoadingData(true);
      try {
        // Evaluate and award achievements on load
        checkAndAwardBadges(user.uid).catch((err) => {
          console.error("Error evaluating achievements:", err);
        });

        // Fetch appointments
        unsubAppts = userService.getMyAppointments((appts) => {
          const sorted = [...appts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const active = sorted.filter(a => a.status === 'pending' || a.status === 'confirmed');
          setUpcomingAppointments(active);
        }, 'usuario');

        // Fetch recent mood history
        unsubMood = userService.getMoodHistory((history) => {
          if (history) {
            setRecentMoods(history.slice(0, 3));
          }
        });

        // Fetch diary entries
        unsubDiary = userService.getDiaryEntries((entries) => {
          if (entries) {
            setRecentDiary(entries.slice(0, 3));
            setTotalEntriesCount(entries.length);
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
      if (unsubDiary) unsubDiary();
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

  // Remaining trial days calculator
  const getTrialDaysRemaining = () => {
    if (profile?.trialEndDate) {
      const remainingTime = new Date(profile.trialEndDate).getTime() - Date.now();
      const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
      return remainingDays > 0 ? remainingDays : 0;
    }
    return null;
  };

  // Active shortcuts configuration (2 col mobile, 4 col desktop)
  const shortcuts = [
    {
      id: "ia",
      title: "IA SentiPae",
      description: "Converse com a IARA 24h",
      icon: BrainCircuit,
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-550/15 text-emerald-600 dark:text-emerald-400 hover:from-emerald-500/15 hover:to-teal-500/15",
      path: "/chat",
      tag: "IARA Ativa"
    },
    {
      id: "terapeuta",
      title: "Meu Terapeuta",
      description: "Agende psicólogos",
      icon: Users,
      color: "from-indigo-500/10 to-violet-500/10 border-indigo-550/15 text-indigo-600 dark:text-indigo-400 hover:from-indigo-500/15 hover:to-violet-500/15",
      path: "/profissionais",
      tag: "Disponíveis"
    },
    {
      id: "agendamentos",
      title: "Agendamentos",
      description: "Gerencie suas sessões",
      icon: Calendar,
      color: "from-amber-500/10 to-orange-500/10 border-amber-550/15 text-amber-600 dark:text-amber-400 hover:from-amber-500/15 hover:to-orange-500/15",
      path: "/pronto-atendimento",
      tag: "Consultas"
    },
    {
      id: "diario",
      title: "Diário Emocional",
      description: "Sintonize sentimentos",
      icon: BookOpen,
      color: "from-rose-500/10 to-pink-500/10 border-rose-550/15 text-rose-600 dark:text-rose-400 hover:from-rose-500/15 hover:to-pink-500/15",
      path: "/diario",
      tag: "Novo Registro"
    },
    {
      id: "evolucao",
      title: "Minha Evolução",
      description: "Gráficos de progresso",
      icon: TrendingUp,
      color: "from-purple-500/10 to-pink-500/10 border-purple-550/15 text-purple-600 dark:text-purple-400 hover:from-purple-500/15 hover:to-pink-500/15",
      path: "/home", // This points to the main patient progress articles or evolution
      tag: "Atualizado"
    },
    {
      id: "biblioteca",
      title: "Biblioteca",
      description: "Artigos e práticas",
      icon: Compass,
      color: "from-blue-500/10 to-cyan-500/10 border-blue-550/15 text-blue-600 dark:text-blue-400 hover:from-blue-500/15 hover:to-cyan-500/15",
      path: "/home",
      tag: "Leituras"
    }
  ];

  // Upcoming features under development
  const upcomingFeatures = [
    {
      id: "marketplace",
      title: "Marketplace",
      description: "Kits sensoriais, livros e cursos recomendados por terapeutas.",
      icon: Sparkles,
      color: "text-amber-500 bg-amber-500/5 border-amber-500/15",
      details: "Em breve: O marketplace unificado SentiPae trará recursos educacionais, livros curados de psicologia, masterclasses, kits físicos para descompressão e regulação sensorial. Assinantes Premium terão acesso com descontos exclusivos."
    },
    {
      id: "empresas",
      title: "Empresas",
      description: "Apoio de saúde mental corporativa para seus colaboradores.",
      icon: Building2,
      color: "text-blue-500 bg-blue-500/5 border-blue-500/15",
      details: "Em breve: Planos corporativos e integração empresarial. Permitirá que empresas ofereçam suporte emocional, dados agregados (anônimos) de estresse e bem-estar, além de agendamento subsidiado de psicoterapia aos colaboradores."
    },
    {
      id: "prefeituras",
      title: "Prefeituras",
      description: "Ecossistema de assistência municipal integrado ao SUS.",
      icon: Building,
      color: "text-indigo-500 bg-indigo-500/5 border-indigo-500/15",
      details: "Em breve: Integração com redes municipais de saúde. Prefeituras conveniadas poderão direcionar triagem primária pelo SentiPae de forma coordenada com CAPS e unidades locais do SUS."
    },
    {
      id: "clinicas",
      title: "Clínicas & Hospitais",
      description: "Sistemas coordenados de encaminhamento clínico médico.",
      icon: HeartPulse,
      color: "text-rose-500 bg-rose-500/5 border-rose-500/15",
      details: "Em breve: Prontuários e fluxos de atendimento integrados para clínicas multidisciplinares e hospitais psiquiátricos parceiros."
    },
    {
      id: "universidades",
      title: "Universidades",
      description: "Apoio mental estudantil e acadêmico especializado.",
      icon: GraduationCap,
      color: "text-purple-500 bg-purple-500/5 border-purple-500/15",
      details: "Em breve: Convênios acadêmicos com universidades para oferecer atendimento psicológico de baixo custo a estudantes universitários e residentes de pós-graduação."
    }
  ];

  if (!isAuthReady || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">Sincronizando SentiPae...</p>
      </div>
    );
  }

  const welcomeName = profile.nome || user?.displayName || "Acolhido";
  const trialDays = getTrialDaysRemaining();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 transition-colors font-sans select-none">
      
      {/* HEADER SECTION */}
      <header className="px-4 py-6 sm:px-6 border-b border-slate-200/60 dark:border-white/5 bg-white/95 dark:bg-slate-950/85 backdrop-blur-md sticky top-0 z-30 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          {/* User Photo */}
          <button 
            onClick={() => navigate("/perfil")}
            className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500/20 flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-pointer text-sm font-black transition-transform active:scale-95 shadow-inner"
          >
            {profile.fotoUrl ? (
              <img src={profile.fotoUrl} alt={welcomeName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              welcomeName.charAt(0).toUpperCase()
            )}
          </button>
          
          <div className="space-y-0.5">
            <h1 className="text-base sm:text-lg font-black font-serif italic text-slate-850 dark:text-slate-100 leading-none">
              Olá, {welcomeName}!
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-emerald-400/80 font-bold uppercase tracking-widest leading-none">
              Seja bem-vindo ao SentiPae
            </p>
          </div>
        </div>

        {/* Live Clock & Info */}
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{time || "00:00"}</span>
          </div>
          <span className="text-[9px] text-slate-400 font-medium leading-none mt-1">{dateStr}</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6">
        
        {/* Dynamic Welcome Affirmation Callout */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-500/15 rounded-3xl space-y-1 relative overflow-hidden">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 shrink-0">
            <Sparkle className="w-16 h-16 text-emerald-500 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" /> Sintonização Diária
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-light leading-relaxed pr-8">
            "{inspirationalMessage}"
          </p>
        </div>

        {/* SEÇÃO 1 — ACESSO RÁPIDO */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Acesso Rápido</h2>
            {profile.preferredService && (
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-550/15 uppercase tracking-wider">
                Foco: {getObjectiveLabel(profile.preferredService)}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
            {shortcuts.map((sc) => {
              const Icon = sc.icon;
              return (
                <button
                  key={sc.id}
                  onClick={() => navigate(sc.path)}
                  className={cn(
                    "p-4 rounded-3xl border text-left bg-gradient-to-br transition-all duration-300 relative group cursor-pointer active:scale-98 select-none flex flex-col justify-between space-y-4",
                    sc.color
                  )}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-black/5 dark:border-white/5 transition-transform group-hover:scale-105">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-white/40 dark:bg-black/25 px-2 py-0.5 rounded-full border border-black/5 dark:border-white/5">
                      {sc.tag}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black leading-tight flex items-center gap-1">
                      {sc.title}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 shrink-0" />
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light leading-snug">{sc.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SEÇÃO 2 — MINHA JORNADA */}
        <section className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 p-5 rounded-[2rem] space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Minha Jornada</h2>
            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {profile?.isPremium ? "Premium SentiPae 👑" : "Plano Gratuito ✨"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Consecutive days streak */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                <Flame className="w-5.5 h-5.5 fill-current" />
              </div>
              <div>
                <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider leading-none">Uso Diário</p>
                <p className="text-lg font-black font-mono mt-1 text-slate-800 dark:text-slate-200 leading-none">
                  {profile?.streak || 0} { (profile?.streak || 0) === 1 ? 'dia' : 'dias' }
                </p>
              </div>
            </div>

            {/* Total Records logged */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                <Activity className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider leading-none">Registros</p>
                <p className="text-lg font-black font-mono mt-1 text-slate-800 dark:text-slate-200 leading-none">
                  {totalEntriesCount} { totalEntriesCount === 1 ? 'nota' : 'notas' }
                </p>
              </div>
            </div>
          </div>

          {/* Weekly Consistency Progress indicator */}
          <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-150 dark:border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Consistência Semanal</span>
              <span className="font-mono text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Sintonia Ativa
              </span>
            </div>
            
            {/* Visual weekday tracker */}
            <div className="grid grid-cols-7 gap-2.5 pt-1">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, idx) => {
                // Mock consistency for visual representation
                const isChecked = idx <= (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <span className="text-[9px] font-medium text-slate-400">{day}</span>
                    <div className={cn(
                      "w-7 h-7 rounded-lg border flex items-center justify-center transition-all",
                      isChecked 
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500 shadow-sm" 
                        : "bg-slate-100 dark:bg-slate-900 border-slate-200/50 dark:border-white/5 text-slate-300 dark:text-slate-700"
                    )}>
                      {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trial callout */}
            {trialDays !== null && (
              <p className="text-[10px] text-slate-450 flex items-center gap-1.5 font-light pt-1 border-t border-slate-200/50 dark:border-white/5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                Seu período de teste expira em <span className="font-bold text-slate-700 dark:text-slate-200">{trialDays} dias</span>.
              </p>
            )}
          </div>
        </section>

        {/* SEÇÃO 3 — ATIVIDADE RECENTE */}
        <section className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 p-5 rounded-[2rem] space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 px-1">Atividade Recente</h2>
          
          <div className="space-y-3">
            
            {/* 1. Últimas conversas com a IA */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-150 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-450 uppercase font-black tracking-wider">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><BrainCircuit className="w-3.5 h-3.5" /> Conversa com IARA</span>
                <span>Ativa</span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">"Estou aqui para te apoiar e guiar sua mente. Desabafe sem julgamentos."</p>
              <button 
                onClick={() => navigate("/chat")}
                className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 hover:underline cursor-pointer"
              >
                Retomar conversa <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 2. Próximos compromissos & Últimos atendimentos */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-150 dark:border-white/5 space-y-2.5">
              <div className="flex justify-between items-center text-[10px] text-slate-450 uppercase font-black tracking-wider border-b border-slate-200/40 dark:border-white/5 pb-1.5">
                <span className="flex items-center gap-1 text-indigo-500"><CalendarDays className="w-3.5 h-3.5" /> Sessões e Atendimentos</span>
                <span>Agenda</span>
              </div>
              
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-2">
                  {upcomingAppointments.slice(0, 2).map((appt) => (
                    <div 
                      key={appt.id}
                      onClick={() => navigate(`/atendimento/${appt.id}`)}
                      className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5 flex justify-between items-center cursor-pointer hover:border-indigo-500/20 active:scale-99 transition-all"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{appt.therapistNome || "Consulta SentiPae"}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">{new Date(appt.date).toLocaleDateString('pt-BR')} às {appt.time}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-wider rounded-full">
                        {appt.status === 'confirmed' ? "Confirmado" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-light py-1">Nenhum compromisso pendente. Agende um suporte profissional na área Meu Terapeuta.</p>
              )}
            </div>

            {/* 3. Últimos registros do diário */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-150 dark:border-white/5 space-y-2.5">
              <div className="flex justify-between items-center text-[10px] text-slate-450 uppercase font-black tracking-wider border-b border-slate-200/40 dark:border-white/5 pb-1.5">
                <span className="flex items-center gap-1 text-rose-500"><BookOpen className="w-3.5 h-3.5" /> Últimos registros</span>
                <span>Diário</span>
              </div>

              {recentMoods.length > 0 ? (
                <div className="space-y-2">
                  {recentMoods.slice(0, 2).map((entry, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5 flex justify-between items-center"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">"{entry.emotion || entry.note || "Check-in emocional"}"</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-light">{new Date(entry.timestamp).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                        {entry.value}/10
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-light py-1">Você ainda não possui registros no diário emocional hoje.</p>
              )}
            </div>

          </div>
        </section>

        {/* SEÇÃO 4 — PRÓXIMAS FUNCIONALIDADES */}
        <section className="space-y-3">
          <div className="px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Próximas Funcionalidades</h2>
            <p className="text-[10px] text-slate-450 mt-1 font-light">Em desenvolvimento e homologação para liberação futura</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {upcomingFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <button
                  key={feat.id}
                  onClick={() => setUpcomingFeatureModal({
                    isOpen: true,
                    title: feat.title,
                    description: feat.details,
                    icon: feat.icon
                  })}
                  className="w-full p-4 bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 hover:border-emerald-500/20 rounded-3xl flex items-center justify-between text-left transition-all active:scale-99 hover:bg-slate-100/50 dark:hover:bg-slate-900/80 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 pr-4 min-w-0">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-transparent", feat.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 leading-none">
                        {feat.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-light mt-1 truncate leading-none">{feat.description}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-full border border-slate-250 dark:border-white/5 text-slate-400 hover:text-emerald-500 transition-colors shrink-0">
                    Em Breve
                  </span>
                </button>
              );
            })}
          </div>
        </section>

      </main>

      <Onboarding />

      {/* Dynamic Feature Detail Modal */}
      <AnimatePresence>
        {upcomingFeatureModal && upcomingFeatureModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUpcomingFeatureModal(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full space-y-5 shadow-2xl relative text-slate-800 dark:text-slate-100"
            >
              <button
                onClick={() => setUpcomingFeatureModal(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4 pt-2">
                <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/10">
                  {(() => {
                    const ModalIcon = upcomingFeatureModal.icon;
                    return <ModalIcon className="w-7 h-7" />;
                  })()}
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
                    Em Breve no Ecossistema
                  </span>
                  <h4 className="text-xl font-serif italic font-bold text-slate-850 dark:text-white pt-1">{upcomingFeatureModal.title}</h4>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                  {upcomingFeatureModal.description}
                </p>

                <button
                  onClick={() => setUpcomingFeatureModal(null)}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-emerald-500/25 mt-2 cursor-pointer uppercase tracking-widest active:scale-95"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
