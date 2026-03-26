import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, Calendar, Activity, BookOpen, Smile, Frown, Meh, Heart, ChevronLeft, ChevronRight } from "lucide-react";
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
              <Calendar className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-200">Seu Histórico</h3>
            </div>
            <div className="flex items-center gap-3 bg-slate-900 border border-white/5 rounded-full px-2 py-1">
              <button 
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-slate-300 min-w-[100px] text-center">
                {isToday(selectedDate) ? "Hoje" : selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
              <button 
                onClick={handleNextDay}
                disabled={isToday(selectedDate)}
                className={`p-1.5 rounded-full transition-colors ${
                  isToday(selectedDate) 
                    ? "text-slate-600 cursor-not-allowed" 
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredHistorico.length === 0 ? (
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl text-center">
              <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum registro para este dia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredHistorico.map((entry, idx) => (
                <motion.div 
                  key={entry.id || idx} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative overflow-hidden group"
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${getMoodColor(entry.value)}`} />
                  <div className="bg-slate-900 border border-white/5 p-5 pl-7 rounded-2xl flex flex-col sm:flex-row gap-4 items-start transition-all hover:bg-slate-800/80">
                    <div className="flex flex-col items-center justify-center min-w-[80px] bg-slate-950/50 p-3 rounded-xl border border-white/5">
                      <div className="mb-2">
                        {getMoodIcon(entry.value)}
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-white">{entry.value}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{getMoodLabel(entry.value)}</span>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <Activity className="w-3 h-3" />
                          <span>{new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          {entry.intensity !== undefined && (
                            <>
                              <span className="text-slate-700">•</span>
                              <span className="text-blue-400">Intensidade {entry.intensity}/10</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="relative">
                        {entry.note ? (
                          <p className="text-slate-300 text-sm leading-relaxed italic">"{entry.note}"</p>
                        ) : (
                          <p className="text-slate-600 text-sm italic">Sem anotações registradas.</p>
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
