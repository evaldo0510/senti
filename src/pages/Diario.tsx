import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, Calendar, Activity, BookOpen, Smile, Frown, Meh, Heart } from "lucide-react";
import { userService } from "../services/userService";
import { MoodEntry } from "../types";

export default function Diario() {
  const navigate = useNavigate();
  const [humor, setHumor] = useState<number>(5);
  const [nota, setNota] = useState("");
  const [historico, setHistorico] = useState<MoodEntry[]>([]);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const unsubscribe = userService.getMoodHistory((hist) => {
      setHistorico(hist);
    });
    return () => unsubscribe();
  }, []);

  const handleSalvar = async () => {
    await userService.saveMood(humor, nota);
    setSalvo(true);
    setNota("");
    
    setTimeout(() => {
      setSalvo(false);
    }, 3000);
  };

  const getMoodIcon = (val: number) => {
    if (val <= 3) return <Frown className="w-8 h-8 text-red-400" />;
    if (val <= 6) return <Meh className="w-8 h-8 text-yellow-400" />;
    return <Smile className="w-8 h-8 text-emerald-400" />;
  };

  const getMoodColor = (val: number) => {
    if (val <= 3) return "bg-red-500";
    if (val <= 6) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const getMoodLabel = (val: number) => {
    if (val <= 3) return "Difícil";
    if (val <= 6) return "Razoável";
    return "Bem";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="p-4 border-b border-white/10 flex items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => navigate("/")} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-4">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-medium text-emerald-400">Diário Emocional</h2>
          <p className="text-xs text-slate-400">Seu espaço seguro de reflexão</p>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-8">
        
        {/* Check-in Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-medium">Como você está hoje?</h3>
          </div>

          <div className="flex flex-col items-center py-6">
            <div className="mb-6 transform transition-transform duration-300 hover:scale-110">
              {getMoodIcon(humor)}
            </div>
            
            <div className="w-full max-w-md px-4">
              <input
                type="range"
                min="0"
                max="10"
                value={humor}
                onChange={(e) => setHumor(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium uppercase tracking-wider">
                <span>Difícil (0)</span>
                <span>Razoável (5)</span>
                <span>Bem (10)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Escreva o que precisa sair...
            </label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Como foi seu dia? O que está sentindo?"
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-32"
            />
          </div>

          <button
            onClick={handleSalvar}
            disabled={salvo}
            className={`w-full py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
              salvo 
                ? "bg-emerald-900/50 text-emerald-400 border border-emerald-500/30" 
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {salvo ? (
              <>
                <Check className="w-5 h-5" />
                Registro Salvo
              </>
            ) : (
              "Salvar Check-in"
            )}
          </button>
        </motion.section>

        {/* History Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-200">Seu Histórico</h3>
          </div>

          {historico.length === 0 ? (
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl text-center">
              <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum registro ainda. Comece seu diário hoje!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((entry, idx) => (
                <div key={entry.id || idx} className="bg-slate-900 border border-white/5 p-5 rounded-2xl flex gap-4 items-start">
                  <div className="flex flex-col items-center justify-center min-w-[60px]">
                    <div className={`w-3 h-3 rounded-full mb-2 ${getMoodColor(entry.value)}`} />
                    <span className="text-2xl font-light">{entry.value}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{getMoodLabel(entry.value)}</span>
                  </div>
                  
                  <div className="flex-1 border-l border-white/5 pl-4">
                    <p className="text-xs text-slate-500 mb-2">
                      {new Date(entry.timestamp).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {entry.note ? (
                      <p className="text-slate-300 text-sm leading-relaxed">{entry.note}</p>
                    ) : (
                      <p className="text-slate-600 text-sm italic">Sem anotações neste dia.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
