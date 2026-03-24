import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, RefreshCw, Calendar } from "lucide-react";
import { auth } from "../services/firebase";
import { salvarDadosAnalytics } from "../services/analyticsService";

const etapas = [
  "O que você está sentindo agora?",
  "Quando isso começou?",
  "Que significado você está dando a isso?",
  "Qual nova resposta você escolhe?"
];

function respostaReset(etapa: number) {
  const falas = [
    "Perceber já é um passo importante…",
    "Entender a origem começa a liberar…",
    "O significado pode ser reescrito…",
    "Agora você assume o controle da resposta…"
  ];
  return falas[etapa];
}

export default function Reset() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [respostas, setRespostas] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [mensagemIara, setMensagemIara] = useState("");
  const [error, setError] = useState(false);

  const proximo = (resposta: string) => {
    if (!resposta.trim()) {
      setError(true);
      return;
    }
    setError(false);
    
    setRespostas([...respostas, resposta]);
    setMensagemIara(respostaReset(step));
    
    if (step + 1 >= etapas.length) {
      salvarDadosAnalytics({
        usuario: auth.currentUser?.displayName || "Anônimo",
        humor: 5,
        risco: "moderado",
        atendimento: "nao",
        tipo: "ReSet"
      });
    }
    
    setStep(step + 1);
    setInputValue("");
  };

  const handleResetClick = () => {
    proximo(inputValue);
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <header className="p-6 flex items-center justify-between z-10 relative">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-emerald-400" />
          <span className="font-bold tracking-widest uppercase text-sm text-emerald-400">ReSet Emocional PCH</span>
        </div>
        <div className="w-11" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative max-w-2xl mx-auto w-full">
        {step < etapas.length ? (
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8"
          >
            {mensagemIara && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-emerald-400/80 italic text-center font-serif text-lg"
              >
                "{mensagemIara}"
              </motion.p>
            )}

            <div className="text-center space-y-2">
              <span className="text-emerald-500 font-bold tracking-widest uppercase text-xs">
                Passo {step + 1} de {etapas.length}
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                {etapas[step]}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (e.target.value.trim()) setError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      proximo(inputValue);
                    }
                  }}
                  placeholder="Digite sua resposta..."
                  className={`w-full h-[56px] bg-[#0F172A] border ${error ? 'border-red-500' : 'border-[#1E293B]'} rounded-[12px] px-[20px] py-[16px] text-[16px] text-[#FFFFFF] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-sans`}
                  autoFocus
                />
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1 absolute left-0"
                  >
                    Por favor, escreva algo antes de continuar.
                  </motion.p>
                )}
              </div>
              
              <button 
                onClick={handleResetClick}
                disabled={!inputValue.trim()}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none mt-6"
              >
                <RefreshCw className="w-5 h-5" />
                ReSet Agora
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <RefreshCw className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                Agora respira…
              </h2>
              <p className="text-xl text-emerald-100/80 font-light">
                Você acabou de se reorganizar.
              </p>
            </div>
            
            <div className="pt-8 space-y-4">
              <button 
                onClick={() => navigate("/reset21")}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Iniciar Jornada 21 Dias
              </button>
              <button 
                onClick={() => navigate("/profissionais")}
                className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-2xl font-bold transition-all"
              >
                Falar com um profissional
              </button>
              <button 
                onClick={() => navigate("/home")}
                className="w-full py-4 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-2xl font-medium transition-all"
              >
                Voltar ao início
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
