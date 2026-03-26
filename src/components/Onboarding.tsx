import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, X, Sparkles, MessageCircle, Search, Activity } from "lucide-react";

interface Step {
  title: string;
  description: string;
  targetId: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: "Bem-vindo ao SENTI!",
    description: "Vamos fazer um tour rápido pelas principais funcionalidades para você aproveitar ao máximo sua jornada.",
    targetId: "onboarding-welcome",
    icon: <Sparkles className="w-6 h-6 text-emerald-500" />
  },
  {
    title: "Conheça a IARA",
    description: "Nossa inteligência artificial está disponível 24/7 para conversar, acolher e te guiar em momentos difíceis.",
    targetId: "onboarding-iara",
    icon: <MessageCircle className="w-6 h-6 text-blue-500" />
  },
  {
    title: "Encontre o Terapeuta Ideal",
    description: "Navegue pelo nosso diretório e encontre profissionais especializados para te acompanhar.",
    targetId: "onboarding-therapists",
    icon: <Search className="w-6 h-6 text-purple-500" />
  },
  {
    title: "Acompanhe seu Humor",
    description: "Registre como você se sente diariamente para entender seus padrões emocionais e progredir.",
    targetId: "onboarding-mood",
    icon: <Activity className="w-6 h-6 text-orange-500" />
  }
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setTimeout(() => {
        setCurrentStep(0);
        setIsVisible(true);
      }, 2000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep === null) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenOnboarding", "true");
    setTimeout(() => setCurrentStep(null), 500);
  };

  if (currentStep === null) return null;

  const step = STEPS[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 opacity-5">
              <Sparkles size={120} className="text-emerald-500" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-inner">
                  {step.icon}
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === currentStep ? "w-8 bg-emerald-500" : "w-2 bg-slate-200 dark:bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <button 
                  onClick={handleNext}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
                >
                  {currentStep === STEPS.length - 1 ? "Começar" : "Próximo"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
