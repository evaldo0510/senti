import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, X, Sparkles, MessageCircle, Shield, BookOpen, ChevronLeft, HelpCircle } from "lucide-react";

interface Step {
  title: string;
  description: string;
  targetId?: string; // If undefined, show as a centered intro modal
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: "Bem-vindo ao Sentí! ✨",
    description: "Sua jornada de acolhimento e regulação emocional começa aqui. Preparamos um tour interativo rápido pelas principais funcionalidades do aplicativo para você se sentir em casa. Vamos lá?",
    icon: <Sparkles className="w-8 h-8 text-emerald-500" />
  },
  {
    title: "Seu Diário de Bordo 📔",
    description: "O Diário é seu espaço seguro para registrar humores, refletir sobre o seu dia e registrar seus pensamentos cotidianos. A análise de sentimentos integrada ajuda você a identificar padrões de humor e cuidar do seu bem-estar.",
    targetId: "quick-action-diario",
    icon: <BookOpen className="w-8 h-8 text-indigo-500" />
  },
  {
    title: "Sua Assistente IARA 🤖",
    description: "A IARA é sua assistente virtual de inteligência artificial, disponível 24 horas por dia. Use este atalho de chat rápido ou o balão flutuante para desabafar, organizar seus sentimentos e receber acolhimento personalizado.",
    targetId: "quick-action-chat",
    icon: <MessageCircle className="w-8 h-8 text-emerald-500" />
  },
  {
    title: "Apoio Imediato & SOS 🛡️",
    description: "Em momentos de pânico, ansiedade intensa ou crise, conte com o botão SOS flutuante. Ele oferece técnicas de ancoragem imediata (exercícios de respiração guiada, ancoragem sensorial 5-4-3-2-1) e discagem rápida para o CVV (188) ou contato de segurança.",
    targetId: "sos-floating-button",
    icon: <Shield className="w-8 h-8 text-rose-500" />
  }
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update spotlight coordinates whenever step changes
  useEffect(() => {
    if (currentStep === null || currentStep === 0 || !isVisible) {
      setCoords(null);
      return;
    }

    const targetId = STEPS[currentStep].targetId;
    if (!targetId) {
      setCoords(null);
      return;
    }

    const updateCoords = () => {
      const element = document.getElementById(targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        }
      }
    };

    // First, scroll the target element smoothly into view
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Set coordinates after scrolling completes
    const timer = setTimeout(updateCoords, 300);
    const backupTimer = setTimeout(updateCoords, 700);

    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, { capture: true, passive: true });

    return () => {
      clearTimeout(timer);
      clearTimeout(backupTimer);
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, { capture: true });
    };
  }, [currentStep, isVisible]);

  // Handle manual trigger via dispatch/event or external action if desired
  useEffect(() => {
    const handleTriggerTour = () => {
      setCurrentStep(0);
      setIsVisible(true);
    };

    window.addEventListener("start-onboarding-tour", handleTriggerTour);
    return () => window.removeEventListener("start-onboarding-tour", handleTriggerTour);
  }, []);

  const handleNext = () => {
    if (currentStep === null) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep === null || currentStep === 0) return;
    setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenOnboarding", "true");
    setTimeout(() => setCurrentStep(null), 400);
  };

  if (currentStep === null || !isVisible) return null;

  const step = STEPS[currentStep];

  // Tooltip coordinates logic
  const getCardStyle = (): React.CSSProperties => {
    if (!coords) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "calc(100% - 2rem)",
        maxWidth: "440px",
      };
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) {
      return {
        position: "fixed",
        bottom: "24px",
        left: "16px",
        right: "16px",
        transform: "none",
      };
    }

    const { top, left, width, height } = coords;
    const cardWidth = 380;
    const spacing = 20;

    let cardLeft = left + width / 2 - cardWidth / 2;
    // Safe bounds
    if (cardLeft < spacing) cardLeft = spacing;
    if (cardLeft + cardWidth > window.innerWidth - spacing) {
      cardLeft = window.innerWidth - cardWidth - spacing;
    }

    let cardTop = top + height + spacing;
    // Place above if close to bottom
    if (top + height + 240 > window.innerHeight && top > 240) {
      cardTop = top - 240 - spacing;
    }

    return {
      position: "fixed",
      top: `${cardTop}px`,
      left: `${cardLeft}px`,
      width: `${cardWidth}px`,
    };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9995] overflow-hidden pointer-events-none">
        {/* Full screen backdrop blocker */}
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs z-[9996] pointer-events-auto" />

        {/* Animated Spotlight ring with high-contrast box-shadow overlay */}
        {coords && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              top: coords.top - 8,
              left: coords.left - 8,
              width: coords.width + 16,
              height: coords.height + 16,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed z-[9997] rounded-3xl border-2 border-dashed border-emerald-400 dark:border-emerald-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.75)] dark:shadow-[0_0_0_9999px_rgba(3,7,18,0.85)] pointer-events-none"
          >
            {/* Soft inner pulse glow to highlight target */}
            <span className="absolute inset-0 rounded-3xl border border-emerald-400/35 animate-ping opacity-40 pointer-events-none" />
          </motion.div>
        )}

        {/* Tooltip Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={getCardStyle()}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-white/5 pointer-events-auto z-[9999]"
        >
          {/* Subtle decoration background shape */}
          <div className="absolute -right-8 -top-8 opacity-5 text-emerald-500">
            <Sparkles size={140} />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              {/* Feature Icon container */}
              <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-inner">
                {step.icon}
              </div>
              
              {/* Skip/Close action */}
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
                title="Pular Tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description Text */}
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                {step.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                {step.description}
              </p>
            </div>

            {/* Interaction Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
              {/* Progress dots / steps tracker */}
              <div className="flex gap-2">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentStep 
                        ? "w-8 bg-emerald-500" 
                        : "w-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20"
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  {currentStep === STEPS.length - 1 ? "Concluir" : "Próximo"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
