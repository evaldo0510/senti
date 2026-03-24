import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
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
  Smartphone
} from "lucide-react";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";
import { UserProfile, Appointment, MoodEntry } from "../types";
import { cn } from "../lib/utils";
import { useTheme } from "../contexts/ThemeContext";
import { FeedbackModal } from "../components/FeedbackModal";

export default function DashboardPaciente() {
  const navigate = useNavigate();
  const { handleInstall, isInstallable, notificationPermission, requestNotificationPermission } = usePWA();
  const { theme, toggleTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [recentMood, setRecentMood] = useState<MoodEntry | null>(null);
  const [featuredTherapists, setFeaturedTherapists] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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
        setFeaturedTherapists(therapists);

        // Get next appointment
        unsubAppointments = userService.getMyAppointments((apps) => {
          const upcoming = apps.find(a => a.status === 'pending' || a.status === 'confirmed');
          setNextAppointment(upcoming || null);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 transition-colors">
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* Header */}
      <header className="p-6 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-20 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
            <HeartPulse className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-slate-800 dark:text-slate-200">
              {getGreeting()}, <span className="text-emerald-600 dark:text-emerald-400">{userProfile?.nome?.split(' ')[0] || "Paciente"}</span>
            </h1>
            <p className="text-xs text-slate-500">SENTI App</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <MessageSquarePlus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button 
            onClick={() => navigate("/perfil")}
            className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-8">
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
                  <Bell className="w-5 h-5 text-emerald-100" />
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-sm"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
            <Activity className="w-24 h-24 text-emerald-500 dark:text-emerald-400" />
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
                <Zap className="w-5 h-5" />
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
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 opacity-20">
            <Smartphone className="w-32 h-32 rotate-12" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black">SENTI no seu Bolso</h3>
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
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm"
        >
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-32 h-32 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">Jornada 21 Dias</h3>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100">Seu ReSet Diário</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-32 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[15%]" />
                </div>
                <span className="text-[10px] font-bold text-slate-500">Dia 3/21</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <PlayCircle className="w-6 h-6" />
            </div>
          </div>
        </motion.section>

        {/* IARA Live Call to Action */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/40 relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Video className="w-6 h-6" />
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
                <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
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
              <Video className="w-5 h-5" />
            </button>
          </motion.section>
        )}

        {/* Marketplace / Terapeutas Online Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200">Terapeutas Online</h3>
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm"
              >
                <div className="relative">
                  <img 
                    src={prof.fotoUrl || `https://picsum.photos/seed/${prof.uid}/200/200`} 
                    alt={prof.nome} 
                    className="w-16 h-16 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">{prof.nome}</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400/80">{prof.especialidades?.join(", ") || "Psicólogo"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{prof.rating?.toFixed(1) || "5.0"}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-600">•</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">R$ {prof.preco || "150"}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-700" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate("/triagem")}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Nova Triagem</span>
          </button>
          <button 
            onClick={() => navigate("/diario")}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Meu Diário</span>
          </button>
        </section>

        {/* Emergency Call */}
        <button 
          onClick={() => navigate("/emergencia")}
          className="w-full py-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Protocolo de Crise
        </button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-white/5 p-4 flex justify-around items-center z-30">
        <button 
          onClick={() => navigate("/home")}
          className="flex flex-col items-center gap-1 text-emerald-600 dark:text-emerald-400"
        >
          <Zap className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Início</span>
        </button>
        <button 
          onClick={() => navigate("/profissionais")}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Buscar</span>
        </button>
        <button 
          onClick={() => navigate("/live-iara")}
          className="w-14 h-14 bg-emerald-600 dark:bg-emerald-500 rounded-full flex items-center justify-center -mt-10 shadow-xl shadow-emerald-600/20 dark:shadow-emerald-900/40 border-4 border-white dark:border-slate-950 active:scale-90 transition-transform"
        >
          <Video className="w-7 h-7 text-white" />
        </button>
        <button 
          onClick={() => navigate("/diario")}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Diário</span>
        </button>
        <button 
          onClick={() => navigate("/perfil")}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
