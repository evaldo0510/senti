import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  PlayCircle, 
  Sparkles,
  ChevronRight,
  RefreshCw,
  Zap,
  ArrowRight
} from "lucide-react";
import { auth } from "../services/firebase";
import { cn } from "../lib/utils";

const dias = [
  { dia: 1, tema: "Perceber o que sente", descricao: "Aprenda a identificar suas emoções básicas sem julgamento.", liberado: true },
  { dia: 2, tema: "Nomear a emoção", descricao: "Dê nome ao que sente para começar a ter controle.", liberado: true },
  { dia: 3, tema: "Aceitar sem lutar", descricao: "Acolha sua dor como um visitante passageiro.", liberado: false },
  { dia: 4, tema: "Onde dói no corpo?", descricao: "Localize a sensação física da sua emoção.", liberado: false },
  { dia: 5, tema: "A respiração 4-2-6", descricao: "Técnica fundamental de regulação afetiva.", liberado: false },
  { dia: 6, tema: "Ressignificar o gatilho", descricao: "Mude a história que você conta para si mesmo.", liberado: false },
  { dia: 7, tema: "A escolha da resposta", descricao: "Entre o estímulo e a resposta, existe sua liberdade.", liberado: false },
  { dia: 8, tema: "Consciência Plena", descricao: "Estar presente no agora, sem fugir.", liberado: false },
  { dia: 9, tema: "Diálogo Interno", descricao: "Como você fala consigo mesmo em momentos de crise?", liberado: false },
  { dia: 10, tema: "Auto-compaixão", descricao: "Trate-se com a mesma bondade que trataria um amigo.", liberado: false },
  { dia: 11, tema: "Limites Saudáveis", descricao: "Aprenda a dizer não para proteger sua paz.", liberado: false },
  { dia: 12, tema: "O Poder do Silêncio", descricao: "Encontre a calma no meio do barulho mental.", liberado: false },
  { dia: 13, tema: "Desapego Emocional", descricao: "Deixe ir o que não serve mais para sua evolução.", liberado: false },
  { dia: 14, tema: "Gratidão Ativa", descricao: "Treine seu cérebro para ver o que está funcionando.", liberado: false },
  { dia: 15, tema: "Valores Pessoais", descricao: "O que realmente importa para você?", liberado: false },
  { dia: 16, tema: "Comunicação Não-Violenta", descricao: "Expresse suas necessidades sem atacar.", liberado: false },
  { dia: 17, tema: "Resiliência na Prática", descricao: "Como voltar ao centro após um grande impacto.", liberado: false },
  { dia: 18, tema: "Foco e Intencionalidade", descricao: "Direcione sua energia para o que você pode mudar.", liberado: false },
  { dia: 19, tema: "Perdão e Libertação", descricao: "Solte o peso do passado para caminhar leve.", liberado: false },
  { dia: 20, tema: "Visão de Futuro", descricao: "Quem é a pessoa que responde com consciência?", liberado: false },
  { dia: 21, tema: "Consolidação do Novo Eu", descricao: "O ReSet agora é parte de quem você é.", liberado: false },
];

export default function Reset21() {
  const navigate = useNavigate();
  const [progresso, setProgresso] = useState(2); // Simulação de progresso
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const handleStartDay = (dia: number) => {
    if (dia > progresso + 1) return;
    navigate("/reset", { state: { dia } });
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-slate-100 flex flex-col font-sans relative overflow-hidden pb-20">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <header className="p-6 flex items-center justify-between z-10 relative bg-slate-950/50 backdrop-blur-xl border-b border-white/5 sticky top-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="font-bold tracking-widest uppercase text-[10px] text-emerald-400">Jornada 21 Dias</span>
          </div>
          <h1 className="text-sm font-black tracking-tighter text-white">SENTI App</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="flex-1 p-6 z-10 relative max-w-2xl mx-auto w-full space-y-8">
        {/* Progress Card */}
        <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[32px] p-8 text-white shadow-2xl shadow-emerald-900/40 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter">Dia {progresso + 1}</h2>
              <p className="text-emerald-100 font-light text-lg italic">"Você não precisa continuar reagindo igual."</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-200">
                <span>Progresso da Jornada</span>
                <span>{Math.round((progresso / 21) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(progresso / 21) * 100}%` }}
                  className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>
            </div>

            <button 
              onClick={() => handleStartDay(progresso + 1)}
              className="w-full py-4 bg-white text-emerald-700 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <PlayCircle className="w-6 h-6" />
              Continuar ReSet
            </button>
          </div>
        </section>

        {/* Days Grid */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-300 px-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Sua Trilha de Transformação
          </h3>
          
          <div className="space-y-3">
            {dias.map((dia, index) => {
              const isCompleted = index < progresso;
              const isCurrent = index === progresso;
              const isLocked = index > progresso;

              return (
                <motion.div
                  key={dia.dia}
                  whileHover={!isLocked ? { x: 4 } : {}}
                  onClick={() => !isLocked && setSelectedDay(selectedDay === dia.dia ? null : dia.dia)}
                  className={cn(
                    "p-5 rounded-[24px] border transition-all cursor-pointer relative overflow-hidden",
                    isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : 
                    isCurrent ? "bg-slate-900 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]" :
                    "bg-slate-900/40 border-white/5 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border",
                      isCompleted ? "bg-emerald-500 border-emerald-400 text-white" :
                      isCurrent ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                      "bg-slate-800 border-white/5 text-slate-500"
                    )}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : 
                       isLocked ? <Lock className="w-5 h-5" /> : 
                       <span className="font-black text-xl">{dia.dia}</span>}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-bold text-lg leading-tight",
                        isLocked ? "text-slate-500" : "text-slate-100"
                      )}>
                        {dia.tema}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
                        {isCompleted ? "Concluído" : isCurrent ? "Disponível Agora" : "Bloqueado"}
                      </p>
                    </div>

                    {!isLocked && (
                      <ChevronRight className={cn(
                        "w-5 h-5 transition-transform",
                        selectedDay === dia.dia ? "rotate-90" : "",
                        isCurrent ? "text-emerald-400" : "text-slate-600"
                      )} />
                    )}
                  </div>

                  <AnimatePresence>
                    {selectedDay === dia.dia && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {dia.descricao}
                          </p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartDay(dia.dia);
                            }}
                            className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold transition-all border border-emerald-500/20"
                          >
                            Iniciar Prática
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0502] via-[#0a0502] to-transparent z-20">
        <button 
          onClick={() => navigate("/profissionais")}
          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-xl"
        >
          Precisa de ajuda profissional?
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
