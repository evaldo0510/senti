import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, Calendar, Activity, BookOpen, Smile, Frown, Meh, Heart, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { userService } from "../services/userService";
import { MoodEntry } from "../types";

export default function Diario() {
  const navigate = useNavigate();
  const [humor, setHumor] = useState<number>(5);
  const [intensidade, setIntensidade] = useState<number>(5);
  const [nota, setNota] = useState("");
  const [historico, setHistorico] = useState<MoodEntry[]>([]);
  const [salvo, setSalvo] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const unsubscribe = userService.getMoodHistory((hist) => {
      setHistorico(hist);
    });
    return () => unsubscribe();
  }, []);

  const handleSalvar = async () => {
    await userService.saveMood(humor, intensidade, nota);
    setSalvo(true);
    setNota("");
    
    setTimeout(() => {
      setSalvo(false);
    }, 3000);
  };

  const getMoodIcon = (val: number) => {
    if (val <= 3) return <Frown className="w-6 h-6 text-red-400" />;
    if (val <= 6) return <Meh className="w-6 h-6 text-yellow-400" />;
    return <Smile className="w-6 h-6 text-emerald-400" />;
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

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    // Don't go past today
    if (next <= new Date()) {
      setSelectedDate(next);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const filteredHistorico = historico.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate.getDate() === selectedDate.getDate() &&
           entryDate.getMonth() === selectedDate.getMonth() &&
           entryDate.getFullYear() === selectedDate.getFullYear();
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="p-4 border-b border-white/10 flex items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => navigate("/home")} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-4">
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

          <div className="flex flex-col items-center py-6 border-b border-white/5">
            <div className="mb-6 transform transition-transform duration-300 hover:scale-110">
              {getMoodIcon(humor)}
            </div>
            
            <div className="w-full max-w-md px-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Humor (0-10)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={humor}
                onChange={(e) => setHumor(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-wider">
                <span>Difícil</span>
                <span>Razoável</span>
                <span>Bem</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center py-6">
            <div className="w-full max-w-md px-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Intensidade do Sentimento (0-10)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={intensidade}
                onChange={(e) => setIntensidade(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-wider">
                <span>Leve</span>
                <span>Moderada</span>
                <span>Forte</span>
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
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-medium text-slate-200">Seu Histórico</h3>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 border border-white/5 rounded-2xl px-3 py-1.5 shadow-lg">
              <button 
                onClick={handlePrevDay}
                className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Anterior</span>
              </button>
              
              <div className="h-4 w-px bg-white/10 mx-1" />
              
              <span className="text-xs font-bold text-emerald-400 min-w-[80px] text-center uppercase tracking-widest">
                {isToday(selectedDate) ? "Hoje" : selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>

              <div className="h-4 w-px bg-white/10 mx-1" />

              <button 
                onClick={handleNextDay}
                disabled={isToday(selectedDate)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-xl transition-all group ${
                  isToday(selectedDate) 
                    ? "text-slate-700 cursor-not-allowed" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Próximo</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {filteredHistorico.length === 0 ? (
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl text-center">
              <Activity className="w-8 h-8 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum registro para este dia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredHistorico.map((entry, idx) => (
                <motion.div 
                  key={entry.id || idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative"
                >
                  {/* Visual Mood Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-2 h-full rounded-l-3xl z-10 ${getMoodColor(entry.value)} shadow-[4px_0_15px_rgba(0,0,0,0.3)]`} />
                  
                  <div className="bg-slate-900/80 backdrop-blur-sm border border-white/5 p-6 pl-10 rounded-3xl flex flex-col sm:flex-row gap-6 items-start transition-all hover:bg-slate-800/90 hover:border-white/10 shadow-xl">
                    
                    {/* Mood Score Circle */}
                    <div className="flex flex-col items-center justify-center min-w-[90px] aspect-square bg-slate-950 rounded-2xl border border-white/10 shadow-inner relative group-hover:scale-105 transition-transform">
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-lg">
                        <Activity className="w-3 h-3 text-emerald-400" />
                      </div>
                      <div className="mb-1 opacity-80">
                        {getMoodIcon(entry.value)}
                      </div>
                      <span className="text-3xl font-black tracking-tighter text-white leading-none">{entry.value}</span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black mt-1.5">{getMoodLabel(entry.value)}</span>
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {entry.intensity !== undefined && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 rounded-lg border border-blue-500/10">
                              <Zap className="w-3 h-3 text-blue-400 fill-current" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                                Intensidade {entry.intensity}/10
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="relative py-2">
                        <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-white/5 rounded-full" />
                        {entry.note ? (
                          <p className="text-slate-200 text-sm leading-relaxed font-light italic">
                            <span className="text-emerald-500/40 text-2xl font-serif leading-none mr-1">"</span>
                            {entry.note}
                            <span className="text-emerald-500/40 text-2xl font-serif leading-none ml-1">"</span>
                          </p>
                        ) : (
                          <p className="text-slate-600 text-sm italic font-light">Nenhuma reflexão registrada para este momento.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
