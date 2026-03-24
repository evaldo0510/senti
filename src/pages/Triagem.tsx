import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, AlertTriangle, Activity, Heart, Shield, Info, ArrowLeft } from "lucide-react";
import { salvarDadosAnalytics } from "../services/analyticsService";

export default function Triagem() {
  const [step, setStep] = useState(0);
  const [emocao, setEmocao] = useState("");
  const [intensidade, setIntensidade] = useState(5);
  const [risco, setRisco] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    // Determinar o nível de risco com base na intensidade e resposta de risco
    let nivelRisco = "leve";
    if (risco) {
      nivelRisco = "alto";
    } else if (intensidade >= 7) {
      nivelRisco = "moderado";
    }

    // Salvar dados no Google Sheets para o Looker Studio
    salvarDadosAnalytics({
      usuario: "Anônimo", // Pode ser substituído pelo nome do usuário logado se houver auth
      humor: intensidade,
      risco: nivelRisco,
      atendimento: "sim",
      tipo: "IARA"
    });

    if (risco) {
      navigate("/emergencia");
    } else {
      navigate("/respiracao", { state: { intensidade, emocao } });
    }
  };

  const steps = [
    { id: 0, label: "Identificação" },
    { id: 1, label: "Intensidade" },
    { id: 2, label: "Triagem de Risco" }
  ];

  return (
    <div className="min-h-screen bg-[#0a0502] flex flex-col items-center justify-center p-6 text-slate-100 relative overflow-hidden">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate("/home")}
        className="fixed top-8 left-8 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all z-50"
      >
        <ArrowLeft className="w-6 h-6 text-slate-400" />
      </button>
      
      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 w-full max-w-xs flex gap-2 px-6 z-50">
        {steps.map((s) => (
          <div 
            key={s.id} 
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              step >= s.id ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md space-y-12 text-center relative z-10"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                <Activity className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-4xl font-black tracking-tighter text-white">
                O que você está sentindo agora?
              </h3>
              <p className="text-slate-400 font-light">Selecione o sentimento predominante para iniciarmos o acolhimento.</p>
            </div>

            <div className="grid gap-3">
              {["Ansiedade", "Tristeza Profunda", "Pânico", "Raiva", "Vazio/Solidão"].map((emo) => (
                <button
                  key={emo}
                  onClick={() => {
                    setEmocao(emo);
                    setStep(1);
                  }}
                  className="w-full py-5 px-6 bg-white/5 hover:bg-emerald-500 hover:text-slate-950 border border-white/5 rounded-3xl text-xl font-bold transition-all active:scale-[0.98] text-slate-300"
                >
                  {emo}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md space-y-16 text-center relative z-10"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
                <Heart className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-4xl font-black tracking-tighter text-white">
                Qual a intensidade disso?
              </h3>
              <p className="text-slate-400 font-light">
                De 0 (leve) a 10 (insuportável).
              </p>
            </div>

            <div className="space-y-12">
              <div className="relative pt-12 pb-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={intensidade}
                  onChange={(e) => setIntensidade(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
                <motion.div 
                  key={intensidade}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 text-7xl font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                >
                  {intensidade}
                </motion.div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest">
                <span>Calmo</span>
                <span>Moderado</span>
                <span>Crítico</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-6 px-8 bg-white text-slate-950 rounded-[32px] font-black text-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl"
            >
              Próximo Passo <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md space-y-10 text-center relative z-10"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-4xl font-black tracking-tighter text-white">
                Triagem de Segurança
              </h3>
              <p className="text-slate-400 font-light">
                Você sente que corre risco imediato ou tem pensamentos de se machucar?
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => setRisco(true)}
                className={`w-full py-6 px-8 border-2 rounded-[32px] text-xl font-black transition-all flex items-center justify-between ${
                  risco === true ? "bg-red-600 border-red-600 text-white" : "bg-white/5 border-white/10 text-slate-300 hover:bg-red-600/10 hover:border-red-600/30"
                }`}
              >
                <span>Sim, preciso de ajuda urgente</span>
                <AlertTriangle className="w-6 h-6" />
              </button>
              <button
                onClick={() => setRisco(false)}
                className={`w-full py-6 px-8 border-2 rounded-[32px] text-xl font-black transition-all flex items-center justify-between ${
                  risco === false ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white/5 border-white/10 text-slate-300 hover:bg-emerald-600/10 hover:border-emerald-600/30"
                }`}
              >
                <span>Não, quero apenas conversar</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <AnimatePresence>
              {risco !== null && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleContinue}
                  className="w-full py-6 px-8 bg-white text-slate-950 rounded-[32px] font-black text-xl transition-all shadow-2xl"
                >
                  Finalizar Triagem
                </motion.button>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 justify-center text-slate-500 text-sm">
              <Info className="w-4 h-4" />
              <span>Sua resposta é confidencial</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
