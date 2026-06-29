import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  User, 
  Grid, 
  Wind, 
  Video, 
  AlertOctagon, 
  Brain, 
  Compass, 
  Sparkles, 
  X,
  Smartphone,
  Crown,
  History,
  Activity,
  Download,
  Share,
  Check,
  ShieldAlert,
  Heart,
  Users,
  Calendar,
  ShoppingBag
} from "lucide-react";
import { cn } from "../lib/utils";
import { usePWA } from "../contexts/PWAContext";
import { useAuth } from "./AuthProvider";

interface MobileDeviceWrapperProps {
  children?: React.ReactNode;
}

export default function MobileDeviceWrapper({ children }: MobileDeviceWrapperProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isInstallable, handleInstall } = usePWA();
  const { hasPremiumAccess, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !hasPremiumAccess() && location.pathname !== "/assinatura" && location.pathname !== "/onboarding") {
      navigate("/assinatura", { replace: true });
    }
  }, [hasPremiumAccess, authLoading, location.pathname, navigate]);

  const [time, setTime] = useState("");
  const [showTools, setShowTools] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Simulated native cold-start splash screen
  const [showSplash, setShowSplash] = useState(false);
  const [splashPercent, setSplashPercent] = useState(0);
  const [splashSub, setSplashSub] = useState("Estabelecendo canais criptografados...");
  
  // PWA Installation Guide state
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isAppStandalone, setIsAppStandalone] = useState(false);
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android' | 'other'>('other');
  const [showStickyInstallPrompt, setShowStickyInstallPrompt] = useState(false);

  // Update mock digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Standalone mode detector & OS detector
  useEffect(() => {
    if (typeof window !== "undefined") {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (navigator as any).standalone || 
                         document.referrer.includes('android-app://');
      setIsAppStandalone(!!standalone);

      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setDeviceOS('ios');
      } else if (/android/.test(ua)) {
        setDeviceOS('android');
      }

      // Show sticky install prompt on mobile/tablet after 4 seconds if not running standalone
      if (!standalone && (window.innerWidth < 1024)) {
        const timer = setTimeout(() => {
          const dismissed = localStorage.getItem("senti_install_dismissed");
          if (!dismissed) {
            setShowStickyInstallPrompt(true);
          }
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Cold start splash screen controller (per tab session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasShown = sessionStorage.getItem("senti_splash_shown_v3");
    if (!hasShown) {
      setShowSplash(true);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 6;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setSplashSub("Ambiente seguro de acolhimento pronto.");
          setTimeout(() => {
            setShowSplash(false);
            sessionStorage.setItem("senti_splash_shown_v3", "true");
          }, 500);
        } else {
          if (progress < 25) {
            setSplashSub("Iniciando criptografia grau clínico...");
          } else if (progress < 55) {
            setSplashSub("Sincronizando registros clínicos offline...");
          } else if (progress < 80) {
            setSplashSub("Carregando inteligência de regulação IARA...");
          } else {
            setSplashSub("Conectando ao pronto-atendimento emocional...");
          }
        }
        setSplashPercent(progress);
      }, 60);

      return () => clearInterval(interval);
    }
  }, []);

  const path = location.pathname;

  // Active state checker
  const isActive = (route: string) => path === route;

  // Soft tactile haptic feedback simulation using standard device vibration
  const triggerHaptic = (ms = 15) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // Suppress errors (safari/unsupported devices)
      }
    }
  };

  const handleNavClick = (route: string) => {
    triggerHaptic(12);
    navigate(route);
  };

  const handleOpenTools = () => {
    triggerHaptic(20);
    setShowTools(true);
  };

  const handleTriggerInstall = () => {
    triggerHaptic(25);
    if (isInstallable) {
      handleInstall();
    } else {
      // Open our bespoke guides
      setShowInstallGuide(true);
    }
  };

  const dismissStickyPrompt = () => {
    triggerHaptic(10);
    setShowStickyInstallPrompt(false);
    localStorage.setItem("senti_install_dismissed", "true");
  };

  // Tools list for Toolbar representing the internal application menu
  const quickTools = [
    {
      title: "Início",
      description: "Seu painel pessoal de regulação emocional e atalhos.",
      icon: Home,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      path: "/app"
    },
    {
      title: "Atendimento IA",
      description: "Desabafe e receba orientações com a IARA 24 horas por dia.",
      icon: MessageSquare,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      path: "/chat"
    },
    {
      title: "Terapeutas",
      description: "Encontre e conecte-se com nossa equipe profissional qualificada.",
      icon: Users,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      path: "/profissionais"
    },
    {
      title: "Agendamento",
      description: "Consulte ou agende sessões e atendimentos virtuais.",
      icon: Calendar,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      path: "/pronto-atendimento"
    },
    {
      title: "Minha Evolução",
      description: "Acompanhe seus registros diários, humor e reflexões.",
      icon: BookOpen,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      path: "/diario"
    },
    {
      title: "Espaço Inspirar",
      description: "Poesias Cognitivas, escrita guiada e o Master Plan 2035.",
      icon: Sparkles,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      path: "/inspirar"
    },
    {
      title: "Conteúdos",
      description: "Práticas recomendadas, artigos clínicos e feeds.",
      icon: Sparkles,
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
      path: "/home"
    },
    {
      title: "Perfil",
      description: "Suas configurações, conquistas de nível e dados pessoais.",
      icon: User,
      color: "text-slate-550 bg-slate-500/10 border-slate-500/20",
      path: "/perfil"
    },
    {
      title: "Sobre o SentiPae",
      description: "História da plataforma, nosso propósito e metodologia.",
      icon: Heart,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      path: "/sobre"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row items-center justify-center p-0 md:p-6 overflow-x-hidden antialiased font-sans select-none" id="sentí-mobile-stage">
      
      {/* Decorative desktop-only side presentation - Collapsible Sidebar */}
      <div className={cn(
        "hidden lg:flex flex-col h-[760px] text-slate-400 p-5 shrink-0 border border-slate-200/50 dark:border-white/5 bg-white dark:bg-slate-900/40 rounded-[2.5rem] transition-all duration-300 relative mr-8 select-none",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        {/* Toggle Button */}
        <button 
          onClick={() => {
            triggerHaptic(10);
            setSidebarCollapsed(!sidebarCollapsed);
          }}
          className="absolute -right-3 top-6 w-6 h-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-full flex items-center justify-center cursor-pointer shadow-lg z-10 font-bold"
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-550/30 rounded-xl flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-emerald-500" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-black text-slate-800 dark:text-slate-100 font-serif italic tracking-tight leading-none">SentiPae</h1>
              <p className="text-[8px] uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400 mt-1">Acolhimento</p>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex-1 space-y-1.5 overflow-y-auto">
          {[
            { label: "Início", path: "/app", icon: Home },
            { label: "IA SentiPae", path: "/chat", icon: MessageSquare },
            { label: "Agenda", path: "/pronto-atendimento", icon: Calendar },
            { label: "Marketplace", path: "/marketplace", icon: ShoppingBag },
            { label: "Diário Emocional", path: "/diario", icon: BookOpen },
            { label: "Espaço Inspirar", path: "/inspirar", icon: Sparkles },
            { label: "Meu Perfil", path: "/perfil", icon: User },
            { label: "Respiração", path: "/respiracao", icon: Wind },
            { label: "SOS Emergência", path: "/emergencia", icon: AlertOctagon, isSOS: true },
          ].map((link, idx) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <button
                key={idx}
                onClick={() => handleNavClick(link.path)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer active:scale-98 text-left",
                  active 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold" 
                    : link.isSOS
                      ? "text-rose-600 dark:text-rose-400 hover:bg-rose-500/5 hover:text-rose-500 border border-transparent"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent"
                )}
                title={link.label}
              >
                <Icon className={cn("w-5 h-5 shrink-0", active && "text-emerald-500 dark:text-emerald-400", link.isSOS && "text-rose-500")} />
                {!sidebarCollapsed && (
                  <span className="text-xs font-semibold truncate">{link.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        {!sidebarCollapsed && (
          <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-150 dark:border-white/5 rounded-2xl p-3.5 space-y-1 mt-auto">
            <p className="text-[9px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400">Servidor Seguro</p>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal font-light">Sua conexão com o SentiPae é criptografada.</p>
          </div>
        )}
      </div>

      {/* Main Interactive Device Mockup (Visible above md, full screen below md) */}
      <div className="relative w-full md:w-[410px] h-screen md:h-[840px] md:rounded-[3rem] md:shadow-[0_0_80px_rgba(16,185,129,0.08)] bg-slate-900 md:border-[12px] md:border-slate-800 flex flex-col overflow-hidden shrink-0 transition-all duration-300">
        
        {/* Physical Camera Shell / Buttons overlay on desktop design */}
        <div className="absolute top-0 inset-x-0 h-10 bg-slate-900 z-50 flex items-center justify-between px-6 pointer-events-none hidden md:flex">
          {/* Mock clock left */}
          <span className="text-xs font-semibold text-slate-350">{time || "12:00"}</span>
          
          {/* Dynamic Island / Notch */}
          <div className="w-28 h-5.5 bg-black rounded-full block mx-auto -mt-1 shadow-inner relative">
            <div className="absolute right-3 top-2 w-[5px] h-[5px] bg-slate-800 rounded-full" />
          </div>

          {/* Device indicators right */}
          <div className="flex items-center gap-1.5 text-slate-350">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L17.6 5.8C16.07 4.56 14.12 3.8 12 3zm0 18c4.97 0 9-4.03 9-9 0-2.12-.74-4.07-1.97-5.61L6.4 18.2c1.53 1.24 3.48 2 5.6 2z"/>
            </svg>
            <span className="text-[9px] font-bold">5G</span>
            <div className="w-5.5 h-3 border border-slate-400 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-4/5 bg-emerald-500 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Browser native layout top padding replacement inside phone container */}
        <div className="hidden md:block h-10 w-full shrink-0 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-white/5" />

        {/* Simulated iOS status space for real mobile devices */}
        <div className="block md:hidden pb-safe bg-white dark:bg-slate-950" />

        {/* App body scroll view inside the frame */}
        <div className="flex-1 w-full overflow-y-auto relative bg-slate-50 dark:bg-slate-950 pb-28">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} // smooth native-like spring curve
              className="w-full min-h-full flex flex-col"
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky Install Banner Prompt for mobile browsers */}
        <AnimatePresence>
          {showStickyInstallPrompt && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-32 inset-x-3 bg-slate-900/95 backdrop-blur-md border border-emerald-500/20 shadow-2xl rounded-2xl p-4 z-40 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Smartphone className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Usar Sentí como App</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Adicione à tela inicial para toques instantâneos e suporte offline.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleTriggerInstall}
                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-[10px] rounded-xl uppercase tracking-wider active:scale-95 transition-all"
                >
                  Instalar
                </button>
                <button
                  onClick={dismissStickyPrompt}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400"
                  aria-label="Dispensar recomendação"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ----------------- NATIVE BOTTOM NAV & TOOLBAR PANELS ----------------- */}

        {/* Quick Horizontal Floating Toolbar (just above the bottom bar) */}
        <div className="absolute bottom-[72px] inset-x-0 px-3 z-40 pointer-events-none flex justify-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-white/5 shadow-lg shadow-slate-900/10 pointer-events-auto"
          >
            <button 
              onClick={() => handleNavClick("/respiracao")}
              className="px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Wind className="w-3.5 h-3.5" />
              Respiração
            </button>
            <div className="w-px h-3 bg-slate-200 dark:bg-white/10" />
            <button 
              onClick={() => handleNavClick("/inspirar")}
              className="px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Inspirar
            </button>
            <div className="w-px h-3 bg-slate-200 dark:bg-white/10" />
            <button 
              onClick={() => handleNavClick("/live-iara")}
              className="px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              Plantão
            </button>
            <div className="w-px h-3 bg-slate-200 dark:bg-white/10" />
            <button 
              onClick={() => handleNavClick("/emergencia")}
              className="px-3 py-1.5 text-[10px] font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
            >
              <span className="w-1.5 h-1.5 bg-rose-550 rounded-full animate-pulse shrink-0" />
              SOS
            </button>
          </motion.div>
        </div>

        {/* 5 Icon Native Bottom Navigation Interface */}
        <nav className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-2 pb-safe-bottom pt-2.5 flex justify-around items-center z-45 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
          
          {/* Button 1: Início */}
          <button 
            onClick={() => handleNavClick("/app")}
            className={cn(
              "relative flex flex-col items-center gap-1 py-1.5 px-3 min-w-[56px] transition-all cursor-pointer",
              isActive("/app") 
                ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            id="tab-home"
          >
            <Home className="w-4.5 h-4.5" />
            <span className="text-[9px] uppercase tracking-widest font-black">Início</span>
            {isActive("/app") && (
              <motion.div layoutId="active-tab-dot" className="absolute bottom-0.5 w-1 h-1 bg-emerald-500 rounded-full" />
            )}
          </button>

          {/* Button 2: IA */}
          <button 
            onClick={() => handleNavClick("/chat")}
            className={cn(
              "relative flex flex-col items-center gap-1 py-1.5 px-3 min-w-[56px] transition-all cursor-pointer",
              isActive("/chat") 
                ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            id="tab-chat"
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span className="text-[9px] uppercase tracking-widest font-black">IA</span>
            {isActive("/chat") && (
              <motion.div layoutId="active-tab-dot" className="absolute bottom-0.5 w-1 h-1 bg-emerald-500 rounded-full" />
            )}
          </button>

          {/* Button 3: Agenda */}
          <button 
            onClick={() => handleNavClick("/pronto-atendimento")}
            className={cn(
              "relative flex flex-col items-center gap-1 py-1.5 px-3 min-w-[56px] transition-all cursor-pointer",
              isActive("/pronto-atendimento") 
                ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            id="tab-agenda"
          >
            <Calendar className="w-4.5 h-4.5" />
            <span className="text-[9px] uppercase tracking-widest font-black">Agenda</span>
            {isActive("/pronto-atendimento") && (
              <motion.div layoutId="active-tab-dot" className="absolute bottom-0.5 w-1 h-1 bg-emerald-500 rounded-full" />
            )}
          </button>

          {/* Button 4: Marketplace */}
          <button 
            onClick={() => handleNavClick("/marketplace")}
            className={cn(
              "relative flex flex-col items-center gap-1 py-1.5 px-3 min-w-[56px] transition-all cursor-pointer",
              isActive("/marketplace") 
                ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            id="tab-marketplace"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span className="text-[9px] uppercase tracking-widest font-black">Marketplace</span>
            {isActive("/marketplace") && (
              <motion.div layoutId="active-tab-dot" className="absolute bottom-0.5 w-1 h-1 bg-emerald-500 rounded-full" />
            )}
          </button>

          {/* Button 5: Perfil */}
          <button 
            onClick={() => handleNavClick("/perfil")}
            className={cn(
              "relative flex flex-col items-center gap-1 py-1.5 px-3 min-w-[56px] transition-all cursor-pointer",
              isActive("/perfil") 
                ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            id="tab-profile"
          >
            <User className="w-4.5 h-4.5" />
            <span className="text-[9px] uppercase tracking-widest font-black">Perfil</span>
            {isActive("/perfil") && (
              <motion.div layoutId="active-tab-dot" className="absolute bottom-0.5 w-1 h-1 bg-emerald-500 rounded-full" />
            )}
          </button>
        </nav>

        {/* Decorative Home gesture indicator pill */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full z-50 pointer-events-none hidden md:block" />

        {/* ----------------- EXPANDABLE INTERACTIVE NATIVE SHEET DRAWER ----------------- */}
        <AnimatePresence>
          {showTools && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTools(false)}
                className="absolute inset-0 bg-slate-950/65 z-50 backdrop-blur-xs cursor-pointer"
              />

              {/* Drawer Sheet */}
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="absolute bottom-0 inset-x-0 bg-white dark:bg-slate-900 rounded-t-[2.5rem] border-t border-slate-200 dark:border-white/5 p-6 pb-10 z-55 flex flex-col space-y-5 max-h-[85%] overflow-y-auto shadow-[0_-20px_50px_rgba(0,0,0,0.3)]"
              >
                {/* Drag Handle element */}
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2.5 mb-1 shrink-0" />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Sentí Toolkit</span>
                    <h3 className="text-lg font-bold font-serif italic text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Compass className="w-5 h-5 text-emerald-500" />
                      Painel Clínico & Ferramentas
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowTools(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Optional PWA Install callout inside menu */}
                {!isAppStandalone && (
                  <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/15 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Sentí no seu Celular</p>
                        <p className="text-[9px] text-slate-500">Acesse com um toque na sua tela inicial</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setShowTools(false);
                        handleTriggerInstall();
                      }}
                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-lg uppercase tracking-wider"
                    >
                      Instalar
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1">
                  {quickTools.map((tool) => (
                    <div 
                      key={tool.title}
                      onClick={() => {
                        setShowTools(false);
                        handleNavClick(tool.path);
                      }}
                      className="group p-3.5 bg-slate-50 dark:bg-slate-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/10 border border-slate-150 dark:border-white/5 hover:border-emerald-500/20 rounded-2xl flex items-start gap-3.5 transition-all cursor-pointer active:scale-99"
                    >
                      <div className={cn("p-2.5 rounded-xl border shrink-0 group-hover:scale-105 transition-transform", tool.color)}>
                        <tool.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 text-left min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {tool.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-150 dark:border-white/5 text-center">
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    🔑 Plantão Emergencial e apoio IARA operam sob criptografia fim-a-fim certificada.
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ----------------- NATIVE COLD START SPLASH SCREEN INTERFACE ----------------- */}
        <AnimatePresence>
          {showSplash && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-slate-950 z-[999] flex flex-col items-center justify-between p-8"
              id="native-cold-start-splash"
            >
              {/* Radial backdrop light */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />

              <div className="flex-1 flex flex-col items-center justify-center space-y-5 text-center">
                {/* Custom animated logo ring */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <motion.div
                    className="absolute inset-0 rounded-full border border-emerald-500/10"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.1, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border border-emerald-500/20"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-550/10">
                    <Activity className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-serif italic text-white tracking-tight font-black">Sentí</h1>
                  <p className="text-[10px] font-bold text-emerald-450 uppercase tracking-[0.25em]">Pronto Atendimento Emocional</p>
                </div>
              </div>

              {/* Status & Progress Bar at bottom */}
              <div className="w-full max-w-xs space-y-4 mb-12">
                <div className="space-y-1.5 text-center">
                  <p className="text-[11px] font-medium text-slate-300 font-sans tracking-wide animate-pulse">
                    {splashSub}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 font-mono">
                    {splashPercent}%
                  </p>
                </div>

                {/* Progress ring track */}
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden relative border border-white/5">
                  <motion.div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${splashPercent}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>

                <p className="text-[9px] text-center text-slate-600 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Canais Protegidos Grau Clínico
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ----------------- BESPOKE SMART INSTALLATION WIZARD MODAL ----------------- */}
        <AnimatePresence>
          {showInstallGuide && (
            <div className="absolute inset-0 z-[1000] flex items-end justify-center">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowInstallGuide(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
              />

              {/* Modal Card */}
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="relative w-full bg-slate-900 border-t border-white/10 rounded-t-[2.5rem] p-6 pb-12 text-slate-100 space-y-6 z-10 max-h-[90%] overflow-y-auto"
                id="bespoke-pwa-install-guide"
              >
                {/* Drag Handle */}
                <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto -mt-2.5" />

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Guia de Instalação Rápida</span>
                    <h3 className="text-lg font-bold font-serif italic text-white flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-emerald-400 animate-pulse" />
                      Sentí Nativo no Celular
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowInstallGuide(false)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Para utilizar recursos avançados de hardware (como alertas de batimento, haptics instantâneos e segurança biométrica), o Sentí opera de forma nativa quando adicionado à sua tela de início.
                </p>

                {deviceOS === 'ios' ? (
                  /* Safari / iOS guide */
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-center">
                      📱 Detectado: Dispositivo Apple iOS (Safari)
                    </p>

                    <div className="space-y-3">
                      <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-lg">1</span>
                        </div>
                        <div className="text-left space-y-1">
                          <p className="text-xs font-bold text-slate-200">Toque em Compartilhar</p>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            No menu inferior ou superior do seu navegador Safari, clique no ícone de compartilhar <Share className="w-3.5 h-3.5 inline-block text-blue-400 mx-1" />.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-lg">2</span>
                        </div>
                        <div className="text-left space-y-1">
                          <p className="text-xs font-bold text-slate-200">Role e escolha "Adicionar à Tela de Início"</p>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Role a lista de opções para baixo e clique em <strong className="text-slate-300">"Adicionar à Tela de Início" ➕</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-lg">3</span>
                        </div>
                        <div className="text-left space-y-1">
                          <p className="text-xs font-bold text-slate-200">Inicie o Sentí da sua Tela de Início</p>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Um ícone do <strong className="text-emerald-400">Sentí</strong> surgirá ao lado de seus aplicativos normais. Abra por ele para ocultar todas as abas do navegador!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Chrome / Android guide */
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-center">
                      🤖 Detectado: Dispositivo Android ou Navegador Chrome
                    </p>

                    <div className="space-y-3">
                      <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-lg">1</span>
                        </div>
                        <div className="text-left space-y-1">
                          <p className="text-xs font-bold text-slate-200">Clique em Instalar</p>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Caso o seu navegador seja compatível, basta clicar no botão de instalação automática abaixo para gerar o aplicativo.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-lg">2</span>
                        </div>
                        <div className="text-left space-y-1">
                          <p className="text-xs font-bold text-slate-200">Menu de Três Pontinhos (Alternativo)</p>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Se o botão não responder, toque nos <strong className="text-slate-300">três pontinhos ⋮</strong> no canto superior direito do Chrome e selecione <strong className="text-slate-300">"Instalar aplicativo"</strong> ou <strong className="text-slate-300">"Adicionar à tela inicial"</strong>.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setShowInstallGuide(false);
                        handleInstall();
                      }}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      Disparar Instalação Automática
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    onClick={() => setShowInstallGuide(false)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-semibold transition-all"
                  >
                    Entendi, fechar guia
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
