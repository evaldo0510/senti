import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Activity
} from "lucide-react";
import { cn } from "../lib/utils";

interface MobileDeviceWrapperProps {
  children: React.ReactNode;
}

export default function MobileDeviceWrapper({ children }: MobileDeviceWrapperProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState("");
  const [showTools, setShowTools] = useState(false);

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

  const path = location.pathname;

  // Active state checker
  const isActive = (route: string) => path === route;

  // Tools list for Toolbar
  const quickTools = [
    {
      title: "Respiração Guiada",
      description: "Pratique respiração quadrada para aliviar de imediato a ansiedade.",
      icon: Wind,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      path: "/respiracao"
    },
    {
      title: "IARA Chat",
      description: "Desabafe e receba orientações com nossa IA especializada.",
      icon: MessageSquare,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      path: "/chat"
    },
    {
      title: "Plantão Live (Vídeo)",
      description: "Chame um profissional de plantão para suporte virtual.",
      icon: Video,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      path: "/live-iara"
    },
    {
      title: "Triagem Sentí",
      description: "Faça uma rápida autoavaliação emocional e receba direcionamento.",
      icon: Brain,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      path: "/triagem"
    },
    {
      title: "SOS Emergência",
      description: "Suporte crítico de contingência para crises agudas.",
      icon: AlertOctagon,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      path: "/emergencia"
    },
    {
      title: "Desafio 21 Dias",
      description: "Recondicionamento mental diário com pílulas de evolução.",
      icon: Sparkles,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      path: "/reset"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row items-center justify-center p-0 md:p-6 overflow-x-hidden antialiased font-sans select-none" id="sentí-mobile-stage">
      
      {/* Decorative desktop-only side presentation */}
      <div className="hidden lg:flex flex-col max-w-sm mr-12 space-y-6 text-slate-400 p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-550/30 rounded-2xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 font-serif italic tracking-tight">Sentí</h1>
            <p className="text-xs uppercase tracking-widest font-bold text-emerald-400">Pronto Atendimento Emocional</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed font-light">
          Você está navegando na <strong className="text-slate-200">Demonstração Interativa</strong> otimizada para dispositivos móveis.
        </p>
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex gap-2 items-center text-xs font-bold text-emerald-450">
            <Smartphone className="w-4 h-4" /> COMPILADO NATIVO PWA
          </div>
          <p className="text-xs text-slate-500 leading-normal">
            A barra de navegação inferior e as ferramentas flutuantes imitam a arquitetura nativa com suporte táctil nativo completo.
          </p>
        </div>
        <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          Servidor operando em modo de alta fidelidade
        </div>
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
          {children}
        </div>

        {/* ----------------- NATIVE BOTTOM NAV & TOOLBAR PANELS ----------------- */}

        {/* Quick Horizontal Floating Toolbar (just above the bottom bar) */}
        <div className="absolute bottom-[72px] inset-x-0 px-3 z-40 pointer-events-none flex justify-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-white/5 shadow-lg shadow-slate-900/10 pointer-events-auto"
          >
            <button 
              onClick={() => navigate("/respiracao")}
              className="px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Wind className="w-3.5 h-3.5" />
              Respiração
            </button>
            <div className="w-px h-3 bg-slate-200 dark:bg-white/10" />
            <button 
              onClick={() => navigate("/live-iara")}
              className="px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              Plantão
            </button>
            <div className="w-px h-3 bg-slate-200 dark:bg-white/10" />
            <button 
              onClick={() => navigate("/emergencia")}
              className="px-3 py-1.5 text-[10px] font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
            >
              <span className="w-1.5 h-1.5 bg-rose-550 rounded-full animate-pulse shrink-0" />
              SOS
            </button>
          </motion.div>
        </div>

        {/* 5-to-6 Icon Native Bottom Navigation Interface */}
        <nav className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-2 pb-safe-bottom pt-2.5 flex justify-around items-center z-45 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
          
          {/* Button 1: Início */}
          <button 
            onClick={() => navigate("/home")}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-3 min-w-[56px] transition-all cursor-pointer",
              isActive("/home") 
                ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            id="tab-home"
          >
            <Home className="w-4.5 h-4.5" />
            <span className="text-[9px] uppercase tracking-widest font-black">Início</span>
          </button>

          {/* Button 2: IARA AI Chat */}
          <button 
            onClick={() => navigate("/chat")}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-3 min-w-[56px] transition-all cursor-pointer",
              isActive("/chat") 
                ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            id="tab-chat"
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span className="text-[9px] uppercase tracking-widest font-black">Chat</span>
          </button>

          {/* Button 3: CENTRAL HIGH-ENGAGEMENT MICRO TOOL MENU DOCK (Barra de ferramentas) */}
          <div className="relative -mt-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowTools(true)}
              aria-label="Abrir caixa de ferramentas mentais"
              id="tab-main-tools"
              className={cn(
                "w-13 h-13 rounded-full flex items-center justify-center shadow-lg border-4 transition-all cursor-pointer",
                showTools 
                  ? "bg-emerald-500 text-slate-950 border-white dark:border-slate-950 scale-110 shadow-emerald-500/30" 
                  : "bg-emerald-600 dark:bg-emerald-500 text-white border-white dark:border-slate-950 shadow-emerald-600/30 dark:shadow-emerald-950/40"
              )}
            >
              <Grid className={cn("w-5.5 h-5.5", showTools && "rotate-45 transition-transform duration-200")} />
            </motion.button>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-450 text-center whitespace-nowrap">
              Ferramentas
            </span>
          </div>

          {/* Button 4: Diário Emocional */}
          <button 
            onClick={() => navigate("/diario")}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-3 min-w-[56px] transition-all cursor-pointer",
              isActive("/diario") 
                ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            id="tab-diario"
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span className="text-[9px] uppercase tracking-widest font-black">Diário</span>
          </button>

          {/* Button 5: Perfil */}
          <button 
            onClick={() => navigate("/perfil")}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-3 min-w-[56px] transition-all cursor-pointer",
              isActive("/perfil") 
                ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            id="tab-profile"
          >
            <User className="w-4.5 h-4.5" />
            <span className="text-[9px] uppercase tracking-widest font-black">Perfil</span>
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
                      Painel Clinico & Ferramentas
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowTools(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1">
                  {quickTools.map((tool) => (
                    <div 
                      key={tool.title}
                      onClick={() => {
                        setShowTools(false);
                        navigate(tool.path);
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
      </div>
    </div>
  );
}
