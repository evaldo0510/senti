import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { usePWA } from "../contexts/PWAContext";
import { 
  HeartPulse, 
  MessageCircle, 
  BookOpen, 
  Calendar, 
  Search, 
  Star, 
  Video, 
  ArrowRight, 
  Bell, 
  User,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCw,
  PlayCircle,
  Sun,
  Moon,
  MessageSquarePlus,
  Lightbulb,
  Smartphone,
  Check,
  Wind,
  Shield,
  Users,
  Brain
} from "lucide-react";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";
import { UserProfile, Appointment, MoodEntry, NewsCardProps } from "../types";
import { cn } from "../lib/utils";
import { useTheme } from "../contexts/ThemeContext";
import { FeedbackModal } from "../components/FeedbackModal";
import { ReviewModal } from "../components/ReviewModal";
import { NewsCard } from "../components/NewsCard";
import StarRating from "../components/StarRating";
import Especialidades from "../components/Especialidades";
import { getPillOfDay, Pill } from "../services/pillService";
import { addXp, updateStreak, XP_ACTIONS, getLevelByXp, getNextLevel, LEVELS } from "../services/gamificationService";
import { Onboarding } from "../components/Onboarding";
import { AffirmationToast } from "../components/AffirmationToast";
import { generateTherapistAvatar } from "../services/imageService";

export default function DashboardPaciente() {
  const navigate = useNavigate();
  const { handleInstall, isInstallable, notificationPermission, requestNotificationPermission } = usePWA();
  const { theme, toggleTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [appointmentToReview, setAppointmentToReview] = useState<Appointment | null>(null);
  const [appointmentToRemind, setAppointmentToRemind] = useState<Appointment | null>(null);
  const [recentMood, setRecentMood] = useState<MoodEntry | null>(null);
  const [featuredTherapists, setFeaturedTherapists] = useState<UserProfile[]>([]);
  const [news, setNews] = useState<NewsCardProps[]>([]);
  const [visibleNewsCount, setVisibleNewsCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [dailyPill, setDailyPill] = useState<Pill | null>(null);
  const [pillRead, setPillRead] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreNews = () => {
    setVisibleNewsCount(prev => prev + 3);
  };

  useEffect(() => {
    const isNewUser = localStorage.getItem("isNewUser");
    if (!isNewUser) {
      setShowWelcome(true);
      localStorage.setItem("isNewUser", "false");
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleNewsCount < news.length) {
          loadMoreNews();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [news.length, visibleNewsCount]);

  useEffect(() => {
    let unsubAppointments: (() => void) | undefined;
    let unsubMood: (() => void) | undefined;

    const loadData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const profile = await userService.getUser(user.uid);
        setUserProfile(profile);

        // Get featured therapists
        const therapists = await userService.getFeaturedTherapists(3);
        
        // Check for Ana Silva in the fetched list
        const anaSilva = therapists.find(t => t.nome === "Dra. Ana Silva");
        
        if (!anaSilva) {
          // If not found, we'll add her, but first check if we already have an avatar for her
          const avatar = await generateTherapistAvatar();
          const newAnaSilva: UserProfile = {
            uid: "ana_silva_generated",
            nome: "Dra. Ana Silva",
            email: "ana.silva@senti.app",
            tipo: "terapeuta",
            fotoUrl: avatar || "https://images.unsplash.com/photo-1559839734-2b71f1536780?w=400&auto=format&fit=crop&q=60",
            especialidades: ["Ansiedade", "Depressão", "TCC"],
            rating: 5.0,
            reviewCount: 1,
            online: true,
            biografia: "Especialista em Terapia Cognitivo-Comportamental, focada em ajudar pacientes com ansiedade e depressão a encontrarem paz e equilíbrio.",
            estilo: "acolhedor",
            abordagem: "TCC",
            intensidade: 40,
            createdAt: new Date().toISOString()
          };
          setFeaturedTherapists([newAnaSilva, ...therapists.slice(0, 2)]);
        } else {
          // If she exists but has a dicebear avatar, update it
          if (anaSilva.fotoUrl && anaSilva.fotoUrl.includes('dicebear')) {
            const avatar = await generateTherapistAvatar();
            if (avatar) {
              await userService.updateProfile(anaSilva.uid, { fotoUrl: avatar });
              anaSilva.fotoUrl = avatar;
            }
          }
          setFeaturedTherapists(therapists);
        }

        // Mock news data
        const mockNews: NewsCardProps[] = [
          {
            id: "1",
            title: "Como a meditação ajuda na ansiedade",
            description: "Estudos mostram que 10 minutos de meditação diária podem reduzir significativamente os níveis de cortisol.",
            image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60",
            category: "Bem-estar",
            readTime: "5 min",
            url: "https://exemplo.com/meditacao",
            therapistName: "Dr. Ricardo Santos",
            therapistId: "therapist_1",
            isOnline: true
          },
          {
            id: "2",
            title: "A importância do sono para a saúde mental",
            description: "Dormir bem é fundamental para a regulação emocional e a consolidação da memória.",
            image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=60",
            category: "Saúde",
            readTime: "4 min",
            url: "https://exemplo.com/sono",
            therapistName: "Dra. Ana Oliveira",
            therapistId: "therapist_2",
            isOnline: false
          },
          {
            id: "3",
            title: "Exercícios físicos e depressão",
            description: "A prática regular de atividades físicas libera endorfinas que combatem sintomas depressivos.",
            image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60",
            category: "Fitness",
            readTime: "6 min",
            url: "https://exemplo.com/exercicios"
          },
          {
            id: "4",
            title: "Alimentação e humor",
            description: "O que você come pode influenciar diretamente como você se sente. Conheça os alimentos amigos do cérebro.",
            image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=60",
            category: "Nutrição",
            readTime: "7 min",
            url: "https://exemplo.com/alimentacao"
          },
          {
            id: "5",
            title: "Mindfulness no trabalho",
            description: "Dicas práticas para manter o foco e a calma durante a jornada de trabalho.",
            image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60",
            category: "Produtividade",
            readTime: "5 min",
            url: "https://exemplo.com/mindfulness-trabalho"
          },
          {
            id: "6",
            title: "A arte da resiliência",
            description: "Como desenvolver a capacidade de se recuperar de desafios e traumas.",
            image: "https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=800&auto=format&fit=crop&q=60",
            category: "Psicologia",
            readTime: "8 min",
            url: "https://exemplo.com/resiliencia"
          }
        ];
        setNews(mockNews);

        // Get daily pill
        setDailyPill(getPillOfDay());

        // Gamification: Update streak and add XP for opening app
        await updateStreak(user.uid);
        await addXp(user.uid, XP_ACTIONS.OPEN_APP);

        // Get next appointment
        unsubAppointments = userService.getMyAppointments((apps) => {
          const upcoming = apps.find(a => a.status === 'pending' || a.status === 'confirmed');
          setNextAppointment(upcoming || null);

          // Check for reminders (within 24h)
          const now = new Date();
          const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          const toRemind = apps.find(a => 
            (a.status === 'pending' || a.status === 'confirmed') && 
            !a.reminded && 
            new Date(a.date) > now && 
            new Date(a.date) <= soon
          );
          if (toRemind) setAppointmentToRemind(toRemind);

          // Check for reviews (completed and not reviewed)
          const toReview = apps.find(a => a.status === 'completed' && !a.reviewed);
          if (toReview) setAppointmentToReview(toReview);
        }, 'usuario');

        // Get recent mood
        unsubMood = userService.getMoodHistory((history) => {
          if (history.length > 0) {
            setRecentMood(history[0]);
          }
        });

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubAppointments) unsubAppointments();
      if (unsubMood) unsubMood();
    };
  }, [navigate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleReadPill = async () => {
    if (!pillRead && auth.currentUser) {
      await addXp(auth.currentUser.uid, XP_ACTIONS.READ_PILL);
      setPillRead(true);
    }
  };

  const currentLevel = userProfile?.xp ? getLevelByXp(userProfile.xp) : LEVELS[0];
  const nextLevel = userProfile?.xp ? getNextLevel(userProfile.xp) : LEVELS[1];
  const progress = (userProfile?.xp && nextLevel) 
    ? ((userProfile.xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100 
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const dicasDoDia = [
    "Respire fundo: Inspire por 4s, segure por 2s, expire por 6s.",
    "Acolha suas emoções: Não lute contra o que sente, apenas observe.",
    "Pausa consciente: Tire 5 minutos hoje apenas para não fazer nada.",
    "Hidratação: Beber água também ajuda a regular o sistema nervoso."
  ];
  const dicaHoje = dicasDoDia[new Date().getDate() % dicasDoDia.length];

  const quickActions = [
    { id: 'chat', label: 'IARA', icon: MessageCircle, path: '/chat', color: 'bg-emerald-500' },
    { id: 'diario', label: 'Diário', icon: BookOpen, path: '/diario', color: 'bg-indigo-500' },
    { id: 'respiracao', label: 'Respirar', icon: Wind, path: '/respiracao', color: 'bg-sky-500' },
    { id: 'sos', label: 'SOS', icon: Shield, path: '/emergencia', color: 'bg-rose-500' },
    { id: 'profissionais', label: 'Terapeutas', icon: Users, path: '/profissionais', color: 'bg-violet-500' },
    { id: 'reset', label: 'ReSet', icon: RefreshCw, path: '/reset', color: 'bg-amber-500' },
    { id: 'live', label: 'Live', icon: Video, path: '/live-iara', color: 'bg-emerald-600' },
    { id: 'triagem', label: 'Triagem', icon: Activity, path: '/triagem', color: 'bg-slate-500' },
    { id: 'perfil', label: 'Perfil', icon: User, path: '/perfil', color: 'bg-blue-500' },
  ];

  const moods = [
    { emoji: "😊", label: "Bem", value: 8 },
    { emoji: "😐", label: "Ok", value: 5 },
    { emoji: "😔", label: "Triste", value: 3 },
    { emoji: "😠", label: "Irritado", value: 2 },
    { emoji: "😴", label: "Cansado", value: 4 },
    { emoji: "🤩", label: "Radiante", value: 10 },
    { emoji: "😰", label: "Ansioso", value: 2 },
  ];

  const handleQuickMood = async (value: number) => {
    if (auth.currentUser) {
      await userService.saveMood(value, 5, "Registro rápido via dashboard");
      // Refresh mood history
      const history = await new Promise<MoodEntry[]>((resolve) => {
        const unsub = userService.getMoodHistory((h) => {
          unsub();
          resolve(h);
        });
      });
      if (history.length > 0) setRecentMood(history[0]);
      await addXp(auth.currentUser.uid, XP_ACTIONS.LOG_MOOD);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-32 transition-colors">
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <Onboarding />
      <AffirmationToast />

      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-200 dark:border-white/5 text-center space-y-8"
            >
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                  Bem-vindo ao seu pronto atendimento emocional
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  Estamos muito felizes em ter você aqui. O <span className="font-bold text-emerald-600 dark:text-emerald-400">Sentí</span> é o seu espaço seguro para cuidar da mente e do coração.
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowWelcome(false);
                    navigate("/chat");
                  }}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-95"
                >
                  Falar com a IARA
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowWelcome(false)}
                  className="w-full py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-base hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  Explorar o App
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {appointmentToReview && (
        <ReviewModal 
          isOpen={!!appointmentToReview} 
          onClose={() => setAppointmentToReview(null)} 
          appointmentId={appointmentToReview.id}
          therapistId={appointmentToReview.therapistId}
          therapistName={appointmentToReview.therapistNome}
        />
      )}

      {/* Header */}
      <header id="onboarding-welcome" className="px-4 py-4 sm:px-6 sm:py-6 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-20 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
            <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 truncate">
              {getGreeting()}, <span className="text-emerald-600 dark:text-emerald-400">{userProfile?.nome?.split(' ')[0] || "Paciente"}</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Sentí • Pronto Atendimento</p>
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <button 
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            aria-label="Enviar feedback"
            className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <MessageSquarePlus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button 
            onClick={() => navigate("/perfil")}
            aria-label="Ver perfil"
            className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 sm:space-y-8">
        {/* Quick Mood Carousel */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Como você está agora?</h3>
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {moods.map((m, idx) => (
              <motion.button
                key={m.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuickMood(m.value)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl border border-white/5 transition-all",
                  "w-16 bg-white dark:bg-slate-900 shadow-sm",
                  idx % 2 === 0 ? "rotate-1" : "-rotate-1"
                )}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase">{m.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Quick Actions Carousel */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Acesso Rápido</h3>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {quickActions.map((action, idx) => (
              <motion.button
                key={action.id}
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/10 shadow-sm transition-all",
                  "w-20 sm:w-24",
                  idx % 3 === 0 ? "bg-slate-900 dark:bg-white/5" : "bg-white dark:bg-slate-900",
                  "hover:shadow-lg hover:shadow-emerald-500/5",
                  idx % 2 === 0 ? "mt-1" : "mt-0"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-inner",
                  action.color
                )}>
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center truncate w-full">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Gamification Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-white/5 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Streak</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{userProfile?.streak || 0} dias</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-white/5 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nível</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{userProfile?.level || 'Iniciante'}</p>
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        {nextLevel && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span>Progresso para {nextLevel.name}</span>
              <span>{userProfile?.xp || 0} / {nextLevel.minXp} XP</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Daily Pill */}
        {dailyPill && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Sparkles size={48} className="text-emerald-500" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Pílula do Dia • {dailyPill.fase}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Dia {dailyPill.dia} de 365</div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  "{dailyPill.frase}"
                </h2>
                
                <div className="space-y-4 pt-2">
                  <div className="flex gap-4">
                    <div className="w-1 bg-emerald-500/30 rounded-full" />
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
                      {dailyPill.reflexao}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={14} className="text-amber-500 fill-current" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ação Sugerida</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                      {dailyPill.acao}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  onClick={handleReadPill}
                  disabled={pillRead}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                    pillRead 
                      ? "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-default"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                  )}
                >
                  {pillRead ? <Check className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  {pillRead ? "Pílula Absorvida" : "Absorver Pílula (+3 XP)"}
                </button>
                <button 
                  onClick={() => navigate("/reset")}
                  className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Fazer ReSet Agora
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notification Prompt */}
        {notificationPermission === 'default' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-600 dark:bg-emerald-500 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-emerald-100" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">Notificações</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Fique por dentro</h3>
                <p className="text-sm text-emerald-50/80 leading-relaxed">Ative as notificações para receber lembretes de sessões e dicas diárias.</p>
              </div>
              <button 
                onClick={requestNotificationPermission}
                className="px-6 py-3 bg-white text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg shadow-black/5"
              >
                Ativar
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </motion.div>
        )}

        {/* Session Reminder */}
        {appointmentToRemind && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500 dark:bg-amber-600 rounded-[2rem] p-6 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-amber-100" />
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-100">Lembrete de Sessão</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Sessão em menos de 24h</h3>
                <p className="text-sm text-amber-50/90 leading-relaxed">
                  Sua sessão com {appointmentToRemind.therapistNome} é amanhã às {new Date(appointmentToRemind.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    userService.updateAppointmentStatus(appointmentToRemind.id, 'confirmed');
                    userService.markAppointmentReminded(appointmentToRemind.id);
                    setAppointmentToRemind(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white text-amber-600 rounded-xl font-bold text-xs hover:bg-amber-50 transition-colors shadow-lg shadow-black/5"
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => navigate(`/agendamento/${appointmentToRemind.therapistId}`)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-amber-400/30 text-white rounded-xl font-bold text-xs hover:bg-amber-400/40 transition-colors border border-white/20"
                >
                  Reagendar
                </button>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </motion.div>
        )}
        
        {/* Sentí Go - Instant Help (Uber-like) */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-emerald-500/30 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 backdrop-blur-md">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Sentí Go</h3>
                <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest">Ajuda Instantânea</p>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed">
              Precisa falar com alguém agora? O <span className="text-white font-bold">Sentí Go</span> encontra o primeiro terapeuta disponível para você em segundos.
            </p>

            <button 
              onClick={() => {
                const onlineTherapist = featuredTherapists.find(t => t.online);
                if (onlineTherapist) {
                  navigate(`/agendamento/${onlineTherapist.uid}`);
                } else {
                  navigate("/profissionais");
                }
              }}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3 active:scale-95"
            >
              Conectar Agora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.section>

        {/* Dica do Dia */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">Dica do Dia</h4>
            <p className="text-sm text-amber-700 dark:text-amber-200/80 leading-relaxed">{dicaHoje}</p>
          </div>
        </motion.section>

        {/* Mood Card */}
        <motion.section 
          id="onboarding-mood"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-sm card-hover"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
            <Activity className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Como você está hoje?</h3>
                <p className="text-2xl font-light text-slate-800 dark:text-slate-100">
                  {recentMood ? `Último registro: ${recentMood.value}/10` : "Ainda não registrou hoje"}
                </p>
              </div>
              <button 
                onClick={() => navigate("/diario")}
                className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => navigate("/reset")}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                ReSet Agora
              </button>
              <button 
                id="onboarding-iara"
                onClick={() => navigate("/chat")}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-sm font-bold transition-all border border-slate-200 dark:border-white/5 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com IARA
              </button>
            </div>
          </div>
        </motion.section>

        {/* Download App CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden card-hover"
        >
          <div className="absolute -right-6 -top-6 opacity-20">
            <Smartphone className="w-16 h-16 rotate-12" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black">Sentí no seu Bolso</h3>
              <p className="text-indigo-100 text-xs">Baixe o app para acesso offline e notificações em tempo real.</p>
            </div>
            <button 
              onClick={handleInstall}
              className="w-full py-3 bg-white text-indigo-700 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              {isInstallable ? "Instalar Aplicativo" : "Baixar Aplicativo"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.section>

        {/* 21 Days Journey Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate("/reset21")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm card-hover"
        >
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-16 h-16 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">Jornada 21 Dias</h3>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100">Seu ReSet Diário</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-32 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-50 w-[15%]" />
                </div>
                <span className="text-[10px] font-bold text-slate-500">Dia 3/21</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
        </motion.section>

        {/* IARA Live Call to Action */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/40 relative overflow-hidden card-hover"
        >
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <Sparkles className="w-20 h-20" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Sessão IARA Live</h3>
                <p className="text-emerald-100 text-xs">Converse com a IARA por vídeo agora</p>
              </div>
            </div>
            <button 
              onClick={() => navigate("/live-iara")}
              className="w-full py-3 bg-white text-emerald-700 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              Iniciar Sessão ao Vivo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.section>

        {/* Next Appointment */}
        {nextAppointment && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl p-6 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400/60 uppercase tracking-widest font-bold">Próxima Sessão</p>
                <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100">
                  {new Date(nextAppointment.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às {new Date(nextAppointment.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Com Dr(a). {nextAppointment.therapistNome}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/atendimento/${nextAppointment.id}`)}
              className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/40 hover:scale-110 transition-transform"
            >
              <Video className="w-4 h-4" />
            </button>
          </motion.section>
        )}

        {/* Guided Direction - Especialidades */}
        <section className="space-y-4">
          <div className="px-2">
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200">Como você está se sentindo?</h3>
            <p className="text-sm text-slate-500">Escolha um tema para direcionamento guiado</p>
          </div>
          <Especialidades 
            selecionada="" 
            onSelecionar={(e) => navigate(`/profissionais?tipo=${e}`)} 
          />
        </section>

        {/* Marketplace / Terapeutas Online Section */}
        <section id="onboarding-therapists" className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200">Match Inteligente</h3>
              <p className="text-sm text-slate-500">Profissionais online agora</p>
            </div>
            <button 
              onClick={() => navigate("/profissionais")}
              className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {featuredTherapists.map((prof) => (
              <motion.div 
                key={prof.uid}
                whileHover={{ x: 4 }}
                onClick={() => navigate(`/terapeuta-perfil/${prof.uid}`)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm group"
              >
                <div className="relative">
                  <img 
                    src={prof.fotoUrl || `https://picsum.photos/seed/${prof.uid}/200/200`} 
                    alt={prof.nome} 
                    className="w-16 h-16 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {prof.online && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">{prof.nome}</h4>
                    <StarRating rating={prof.rating || 4.8} count={prof.reviewCount || 124} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{prof.especialidades?.join(", ") || "Psicólogo"}</p>
                  
                  {/* DNA Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {prof.estilo && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md border border-blue-500/10">
                        {prof.estilo}
                      </span>
                    )}
                    {prof.abordagem && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md border border-purple-500/10">
                        {prof.abordagem}
                      </span>
                    )}
                    {prof.intensidade !== undefined && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-md border border-orange-500/10">
                        {prof.intensidade}% Intensidade
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/agendamento/${prof.uid}`);
                      }}
                      className="flex-1 py-1.5 bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-emerald-500 transition-colors"
                    >
                      Agendar
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const numero = "5511999999999";
                        const mensagem = encodeURIComponent(`Olá, vi seu perfil no ReSet PCH e gostaria de tirar uma dúvida.`);
                        window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
                      }}
                      className="flex-1 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5"
                    >
                      Falar Direto
                    </button>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const onlineTherapist = featuredTherapists.find(t => t.online);
              if (onlineTherapist) {
                navigate(`/agendamento/${onlineTherapist.uid}`);
              } else {
                navigate("/profissionais");
              }
            }}
            className="bg-emerald-600 dark:bg-emerald-500 p-6 rounded-3xl text-white flex flex-col items-center gap-3 shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/40"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <span className="text-sm font-bold">SENTI Go</span>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profissionais")}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
              <Search className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Explorar</span>
          </motion.button>
        </section>

        {/* News Section */}
        <section className="space-y-6 pt-4">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200">Conteúdo para você</h3>
              <p className="text-sm text-slate-500">Artigos e dicas para seu bem-estar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {news.slice(0, visibleNewsCount).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NewsCard 
                  {...item} 
                  onConnect={(id) => navigate(`/agendamento/${id}`)}
                  onViewProfile={(id) => navigate(`/terapeuta-perfil/${id}`)}
                />
              </motion.div>
            ))}
          </div>

          <div ref={observerTarget} className="h-4 w-full" />

          {visibleNewsCount < news.length && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMoreNews}
                className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold text-sm shadow-sm hover:border-emerald-500/30 transition-all flex items-center gap-2"
              >
                Carregar mais artigos
                <ArrowRight className="w-4 h-4 rotate-90" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-2 pb-safe pt-2 flex justify-around items-center z-30 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <button 
          onClick={() => navigate("/home")}
          className="flex flex-col items-center gap-1 py-2 px-4 text-emerald-600 dark:text-emerald-400 min-w-[64px]"
        >
          <Zap className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Início</span>
        </button>
        <button 
          onClick={() => navigate("/profissionais")}
          className="flex flex-col items-center gap-1 py-2 px-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors min-w-[64px]"
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Buscar</span>
        </button>
        
        <div className="relative -mt-10">
          <button 
            onClick={() => navigate("/live-iara")}
            aria-label="Sessão IARA Live"
            className="w-16 h-16 bg-emerald-600 dark:bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/40 dark:shadow-emerald-900/60 border-4 border-white dark:border-slate-950 active:scale-90 transition-all hover:scale-105"
          >
            <Video className="w-8 h-8 text-white" />
          </button>
        </div>

        <button 
          onClick={() => navigate("/diario")}
          className="flex flex-col items-center gap-1 py-2 px-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors min-w-[64px]"
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Diário</span>
        </button>
        <button 
          onClick={() => navigate("/perfil")}
          className="flex flex-col items-center gap-1 py-2 px-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors min-w-[64px]"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
