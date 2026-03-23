import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, AlertTriangle } from "lucide-react";

export default function Triagem() {
  const [step, setStep] = useState(0);
  const [emocao, setEmocao] = useState("");
  const [intensidade, setIntensidade] = useState(5);
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/respiracao", { state: { intensidade, emocao } });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md space-y-8 text-center"
          >
            <h3 className="text-3xl font-light tracking-tight text-slate-200">
              O que está mais forte em você agora?
            </h3>
            <div className="grid gap-4">
              {["Ansiedade", "Tristeza", "Medo", "Raiva", "Confusão"].map((emo) => (
                <button
                  key={emo}
                  onClick={() => {
                    setEmocao(emo);
                    setStep(1);
                  }}
                  className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl text-lg font-medium transition-all active:scale-[0.98] text-slate-300 hover:text-white"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md space-y-12 text-center"
          >
            <div className="space-y-4">
              <h3 className="text-3xl font-light tracking-tight text-slate-200">
                De 0 a 10... o quanto isso está intenso?
              </h3>
              <p className="text-slate-400">
                Sendo 0 muito calmo e 10 insuportável.
              </p>
            </div>

            <div className="space-y-8">
              <div className="relative pt-8 pb-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={intensidade}
                  onChange={(e) => setIntensidade(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-5xl font-light text-emerald-400">
                  {intensidade}
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium uppercase tracking-wider">
                <span>Leve</span>
                <span>Moderado</span>
                <span>Intenso</span>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Continuar <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
