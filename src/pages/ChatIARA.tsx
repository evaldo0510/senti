import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, HeartHandshake, AlertTriangle, Volume2, VolumeX, Image as ImageIcon, Mic, Book, MessageCircle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import IARAChat from "../components/IARAChat";

interface Step {
  id: number;
  label: string;
  completed?: boolean;
  active?: boolean;
}

export default function ChatIARA() {
  const location = useLocation();
  const navigate = useNavigate();
  const { intensidade, emocao, initialMessage, context, therapistName, therapistId } = location.state || {};

  const [alerta, setAlerta] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);
  const [steps, setSteps] = useState<Step[]>([
    { id: 0, label: "Acolhimento", completed: true },
    { id: 1, label: "Avaliação", completed: true },
    { id: 2, label: "Triagem", active: true },
    { id: 3, label: "Direcionamento" }
  ]);

  const handleRiscoAlto = () => {
    setAlerta(true);
    setSteps(prev => prev.map(s => 
      s.id === 2 ? { ...s, active: false, completed: true } : 
      s.id === 3 ? { ...s, active: true, label: "EMERGÊNCIA" } : s
    ));
    setCurrentStep(3);
  };

  const handleDirecionar = (especialidade: string) => {
    setIsTransitioning(true);
    setSteps(prev => prev.map(s => 
      s.id === 2 ? { ...s, active: false, completed: true } : 
      s.id === 3 ? { ...s, active: true } : s
    ));
    setCurrentStep(3);
    setTimeout(() => {
      navigate(`/profissionais?tipo=${especialidade || "geral"}`);
    }, 5000);
  };

  const initialText = context === "scheduling" && therapistName 
    ? `Olá! Vi que você está interessado em agendar uma sessão com ${therapistName}. Eu sou a IARA e posso tirar suas dúvidas iniciais sobre o processo de agendamento ou sobre como funciona a terapia na SENTI. O que você gostaria de saber?`
    : initialMessage || "Olá. Eu sou a IARA, a inteligência de acolhimento da SENTI. Como você está se sentindo agora?";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-screen bg-[#0a0502] text-slate-100 relative overflow-hidden"
    >
      {/* Breathing Overlay */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="space-y-12 max-w-sm w-full">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-emerald-400 tracking-tighter">Respire com a IARA</h2>
                <p className="text-slate-400">Siga o movimento do círculo para estabilizar seu coração.</p>
              </div>
              
              <div className="relative flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 bg-emerald-500/20 rounded-full border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                />
                <motion.div 
                  animate={{ scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-24 h-24 bg-emerald-400/30 rounded-full blur-xl"
                />
                <div className="absolute text-emerald-400 font-bold tracking-widest uppercase text-xs">
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 8, repeat: Infinity, times: [0, 0.5, 1] }}
                  >
                    Inspira...
                  </motion.span>
                </div>
              </div>

              <button 
                onClick={() => setShowBreathing(false)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all"
              >
                Estou melhor, obrigado
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-6 right-6 z-[90] bg-emerald-600 p-6 rounded-[32px] shadow-2xl flex items-center gap-6 border border-emerald-400/30"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white text-lg leading-tight">Conectando com Especialista</h3>
              <p className="text-emerald-100 text-sm">A IARA identificou que você precisa de um acolhimento humano agora.</p>
            </div>
            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xs flex gap-2 px-6 z-50 pointer-events-none">
        {steps.map((s, i) => (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              s.completed || s.active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/20 backdrop-blur-xl sticky top-0 z-10 pt-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tighter text-emerald-400">IARA</h2>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest border border-emerald-500/20">Clínico Geral</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {context === "scheduling" && therapistId && (
            <button 
              onClick={() => navigate(`/agendamento/${therapistId}`)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-1.5"
            >
              <Calendar className="w-3 h-3" />
              Agendar Agora
            </button>
          )}
          <button 
            onClick={() => navigate("/diario")}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all border border-white/5"
            title="Diário"
          >
            <Book className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-4">
        {alerta && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/30 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 text-red-200 mb-4"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-300 mb-1">Você não está sozinho.</p>
              <p className="text-sm text-red-200/80 mb-3">Por favor, procure ajuda imediata. Existem pessoas prontas para te ouvir agora mesmo.</p>
              <a href="tel:188" className="inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors">
                Ligar 188 (CVV)
              </a>
            </div>
          </motion.div>
        )}

        <IARAChat 
          initialMessage={initialText}
          context={context}
          onRiscoAlto={handleRiscoAlto}
          onDirecionar={handleDirecionar}
          className="h-full"
        />
      </div>
    </motion.div>
  );
}
