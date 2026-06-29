import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, Calendar, Activity, BookOpen, Smile, Frown, Meh, Heart, ChevronLeft, ChevronRight, Zap, TrendingUp, WifiOff, Eye } from "lucide-react";
import { userService } from "../services/userService";
import { MoodEntry } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { trackEvent } from "../services/analyticsService";
import { usePWA } from "../contexts/PWAContext";
import { auth } from "../services/firebase";
import { offlineStorage } from "../services/offlineStorage";

export default function Diario() {
  const navigate = useNavigate();
  const { isOffline, syncOfflineData } = usePWA();
  const [humor, setHumor] = useState<number>(5);
  const [intensidade, setIntensidade] = useState<number>(5);
  const [nota, setNota] = useState("");
  const [historico, setHistorico] = useState<MoodEntry[]>([]);
  const [offlineMoods, setOfflineMoods] = useState<any[]>([]);
  const [salvo, setSalvo] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [chartTab, setChartTab] = useState<"recent" | "weekly" | "monthly" | "quarterly">("weekly");
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const unsubscribe = userService.getMoodHistory((hist) => {
      setHistorico(hist);
    });
    return () => unsubscribe();
  }, []);

  // Check unsynced count
  useEffect(() => {
    const checkUnsynced = async () => {
      try {
        const unsynced = await offlineStorage.getUnsyncedMoods();
        setUnsyncedCount(unsynced ? unsynced.length : 0);
      } catch (e) {
        console.warn("Error checking unsynced moods:", e);
      }
    };
    checkUnsynced();
  }, [historico, offlineMoods]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncOfflineData();
      // Reload history and local offline entries
      const unsubscribe = userService.getMoodHistory((hist) => {
        setHistorico(hist);
      });
      const userId = auth.currentUser?.uid || "guest";
      const localMoods = await offlineStorage.getMoodsOffline(userId);
      setOfflineMoods(localMoods);
      
      const unsynced = await offlineStorage.getUnsyncedMoods();
      setUnsyncedCount(unsynced ? unsynced.length : 0);
    } catch (e) {
      console.error("Manual sync failed:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync / Load offline local moods
  useEffect(() => {
    const loadOfflineEntries = async () => {
      try {
        const userId = auth.currentUser?.uid || "guest";
        const localMoods = await offlineStorage.getMoodsOffline(userId);
        setOfflineMoods(localMoods);
      } catch (e) {
        console.error("Error loading offline moods", e);
      }
    };
    loadOfflineEntries();
  }, [historico, isOffline]);

  // Combine firestore history and local offline unsynced moods
  const combinedHistorico = React.useMemo(() => {
    // Map firestore entries with synced = true
    const firestoreEntries = historico.map((h) => ({
      ...h,
      synced: true,
    }));

    // Find unsynced local moods
    const unsyncedLocal = offlineMoods.filter((o) => !o.synced);

    // Map unsynced local moods to match MoodEntry interface
    const formattedUnsynced = unsyncedLocal.map((u) => ({
      id: u.id?.toString() || Math.random().toString(),
      value: u.value,
      intensity: u.intensity,
      note: u.emotion, // matches "note" in types and "emotion" in IndexedDB schema
      timestamp: u.timestamp,
      triggers: u.triggers,
      synced: false,
    }));

    // Merge and sort newest first
    const merged = [...formattedUnsynced, ...firestoreEntries];
    merged.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    return merged as MoodEntry[];
  }, [historico, offlineMoods]);

  // Compute a specific dataset for calendar days (Trend) based on selected range
  const trendData = React.useMemo(() => {
    let days = 7;
    if (chartTab === "monthly") {
      days = 30;
    } else if (chartTab === "quarterly") {
      days = 90;
    } else if (chartTab === "recent") {
      return []; // Not used for trendData
    }

    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      // Get weekday name (e.g., "seg", "ter")
      const weekdayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayName = (weekdayStr || "").replace('.', '').slice(0, 3).toUpperCase();
      
      // Filter entries on this calendar day
      const dayEntries = combinedHistorico.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.getDate() === d.getDate() &&
               entryDate.getMonth() === d.getMonth() &&
               entryDate.getFullYear() === d.getFullYear();
      });
      
      let avgHumor: number | null = null;
      let avgIntensity: number | null = null;
      
      if (dayEntries.length > 0) {
        const sumHumor = dayEntries.reduce((sum, e) => sum + e.value, 0);
        const sumIntensity = dayEntries.reduce((sum, e) => sum + (e.intensity || 0), 0);
        avgHumor = parseFloat((sumHumor / dayEntries.length).toFixed(1));
        avgIntensity = parseFloat((sumIntensity / dayEntries.length).toFixed(1));
      }
      
      result.push({
        dateStr: dateString,
        dayName: days === 7 ? dayName : dateString,
        humor: avgHumor, // can be null if no entry
        intensity: avgIntensity,
        hasData: dayEntries.length > 0,
      });
    }
    
    return result;
  }, [combinedHistorico, chartTab]);

  const handleSalvar = async () => {
    const userId = auth.currentUser?.uid || "guest";
    const timestamp = new Date().toISOString();

    // 1. Save locally to IndexedDB first
    try {
      await offlineStorage.saveMoodOffline({
        userId,
        value: humor,
        intensity: intensidade,
        emotion: nota,
        timestamp,
        synced: !isOffline,
        triggers: selectedTriggers,
      });
    } catch (e) {
      console.error("Error saving mood offline", e);
    }

    // 2. If online, also write to Firestore
    if (!isOffline) {
      try {
        await userService.saveMood(humor, intensidade, nota, selectedTriggers);
      } catch (e) {
        console.error("Error saving mood online", e);
      }
    }

    trackEvent("diary_saved", {
      humor,
      intensidade,
      numTriggers: selectedTriggers.length,
      hasNote: !!nota,
      offline: isOffline,
    });

    setSalvo(true);
    setNota("");
    setSelectedTriggers([]);

    // Force reload offline entries immediately
    try {
      const localMoods = await offlineStorage.getMoodsOffline(userId);
      setOfflineMoods(localMoods);
    } catch (e) {}

    setTimeout(() => {
      setSalvo(false);
    }, 3000);
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      // Page styling / Colors
      const primaryColor = [16, 185, 129]; // Emerald
      const textColor = [30, 41, 59]; // slate-800
      const lightGray = [100, 116, 139]; // slate-500
      
      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Sentí", 20, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text("Pronto Socorro Emocional - Relatório de Evolução", 20, 26);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 140, 20);
      
      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 32, 190, 32);
      
      // Metadata section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("Sumário de Atividades", 20, 42);
      
      // Calculando métricas
      const totalRegistros = historico.length;
      const mediaHumor = totalRegistros > 0 
        ? (historico.reduce((acc, curr) => acc + curr.value, 0) / totalRegistros).toFixed(1)
        : "0.0";
      const mediaIntensidade = totalRegistros > 0
        ? (historico.reduce((acc, curr) => acc + (curr.intensity || 5), 0) / totalRegistros).toFixed(1)
        : "0.0";
        
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Total de Check-ins Registrados: ${totalRegistros}`, 20, 50);
      doc.text(`Média de Sintonia do Humor: ${mediaHumor}/10`, 20, 56);
      doc.text(`Média de Intensidade do Sentimento: ${mediaIntensidade}/10`, 20, 62);
      
      // Divider
      doc.line(20, 68, 190, 68);
      
      // Journal Histórico title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Histórico Detalhado de Registros", 20, 78);
      
      let y = 88;
      doc.setFontSize(10);
      
      historico.forEach((entry, index) => {
        // Check page overflow
        if (y > 260) {
          doc.addPage();
          y = 25;
        }
        
        doc.setFont("helvetica", "bold");
        const entryDate = new Date(entry.timestamp).toLocaleString('pt-BR');
        doc.text(`Momento: ${entryDate} | Humor: ${entry.value}/10`, 20, y);
        
        doc.setFont("helvetica", "normal");
        const intensityText = entry.intensity !== undefined ? ` | Intensidade: ${entry.intensity}/10` : "";
        
        const triggerLabelMap: { [key: string]: string } = {
          trabalho: "Trabalho",
          familia: "Família",
          saude: "Saúde",
          financas: "Finanças",
          relacionamento: "Relacionamento",
          amigos: "Amigos",
          sono: "Sono",
          estudos: "Estudos"
        };
        const activeTriggers = entry.triggers && Array.isArray(entry.triggers)
          ? entry.triggers.map(t => triggerLabelMap[t] || t).join(", ")
          : "";
        const triggersText = activeTriggers ? ` | Gatilhos: ${activeTriggers}` : "";
        
        doc.setFontSize(9);
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.text(`Sintomas e Fatores: ${intensityText}${triggersText}`, 20, y + 5);
        
        doc.setFontSize(10);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        const notaText = entry.note ? `Reflexão: "${entry.note}"` : "Sem reflexões adicionais registradas.";
        
        // Wrap text to fit page width
        const splitNota = doc.splitTextToSize(notaText, 170);
        doc.text(splitNota, 20, y + 10);
        
        y += 15 + (splitNota.length * 5);
        
        // Separator between items
        doc.setDrawColor(241, 245, 249);
        doc.line(20, y - 2, 190, y - 2);
        y += 3;
      });
      
      // Footer/Compliance text on the last page or each page
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("Este documento foi gerado pelo aplicativo oficial Sentí e está em plena conformidade com a privacidade de dados da LGPD.", 20, 287);
      
      doc.save(`Senti_Progresso_Mental_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    }
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

  const filteredHistorico = combinedHistorico.filter(entry => {
          const entryDate = new Date(entry.timestamp);
    return entryDate.getDate() === selectedDate.getDate() &&
           entryDate.getMonth() === selectedDate.getMonth() &&
           entryDate.getFullYear() === selectedDate.getFullYear();
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={() => navigate("/home")} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-4" aria-label="Voltar para Home">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-medium text-emerald-400">Diário Emocional</h2>
            <p className="text-xs text-slate-400">Seu espaço seguro de reflexão</p>
          </div>
        </div>

        {/* Alto Contraste Toggle */}
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
            highContrast
              ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] font-black"
              : "bg-slate-900/80 text-slate-300 border-white/10 hover:bg-white/5 hover:text-white"
          }`}
          title="Ativar modo de alto contraste para o gráfico"
          aria-pressed={highContrast}
        >
          <Eye className={`w-4 h-4 ${highContrast ? "text-black animate-pulse" : "text-emerald-400"}`} />
          <span className="hidden sm:inline">Alto Contraste</span>
          <span className="inline sm:hidden">Contraste</span>
          <span className={`w-2 h-2 rounded-full ${highContrast ? "bg-black" : "bg-white/25"}`} />
        </button>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-8">
        
        {/* Offline & Unsynced Status Banners */}
        {isOffline && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 text-amber-400 text-xs shadow-lg"
          >
            <WifiOff className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
            <div className="space-y-0.5">
              <span className="font-bold uppercase tracking-wider block text-[10px]">Você está offline</span>
              <p className="text-slate-400 leading-relaxed font-light">Seus registros serão guardados localmente com total segurança via IndexedDB e sincronizados automaticamente assim que você estiver online novamente.</p>
            </div>
          </motion.div>
        )}

        {unsyncedCount > 0 && !isOffline && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-emerald-400 text-xs shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
              <div className="space-y-0.5">
                <span className="font-bold uppercase tracking-wider block text-[10px]">Sincronização pendente</span>
                <p className="text-slate-400 leading-relaxed font-light">Você tem {unsyncedCount} {unsyncedCount === 1 ? 'registro' : 'registros'} salvo(s) localmente no IndexedDB aguardando sincronização com o banco de dados.</p>
              </div>
            </div>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all text-[11px] disabled:opacity-50 shrink-0 w-full sm:w-auto text-center"
            >
              {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
            </button>
          </motion.div>
        )}
        
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

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 block">Destaque os Gatilhos do dia (Opcional):</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "trabalho", label: "💼 Trabalho" },
                { id: "familia", label: "🏠 Família" },
                { id: "saude", label: "❤️ Saúde" },
                { id: "financas", label: "💵 Finanças" },
                { id: "relacionamento", label: "💑 Relacionamento" },
                { id: "amigos", label: "👥 Amigos" },
                { id: "sono", label: "🌙 Sono" },
                { id: "estudos", label: "📚 Estudos" }
              ].map((trigger) => {
                const isSelected = selectedTriggers.includes(trigger.id);
                return (
                  <button
                    key={trigger.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTriggers(prev => prev.filter(t => t !== trigger.id));
                      } else {
                        setSelectedTriggers(prev => [...prev, trigger.id]);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                      isSelected 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/10"
                        : "bg-slate-950 text-slate-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {trigger.label}
                  </button>
                );
              })}
            </div>
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

        {/* Mood Evolution Chart Card */}
        {combinedHistorico.length >= 1 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`p-6 rounded-3xl space-y-4 transition-all duration-300 ${
              highContrast 
                ? "bg-black border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.15)] text-white" 
                : "bg-slate-900 border border-white/5"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border transition-all ${
                  highContrast 
                    ? "bg-white border-white text-black" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse"
                }`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold transition-all ${highContrast ? "text-white font-black text-lg" : "text-white"}`}>Evolução do seu Humor</h3>
                  <p className={`text-[10px] font-medium uppercase tracking-widest transition-all ${highContrast ? "text-white font-bold" : "text-slate-500"}`}>Acompanhe suas oscilações emocionais</p>
                </div>
              </div>
              
              {/* Premium segment control */}
              <div className={`flex flex-wrap border p-1 rounded-xl text-[10px] font-black uppercase tracking-wider self-stretch sm:self-auto gap-1 transition-all ${
                highContrast ? "bg-black border-white" : "bg-slate-950 border-white/10"
              }`}>
                <button
                  type="button"
                  onClick={() => setChartTab("weekly")}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                    chartTab === "weekly"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/15"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Semanal
                </button>
                <button
                  type="button"
                  onClick={() => setChartTab("monthly")}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                    chartTab === "monthly"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/15"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setChartTab("quarterly")}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                    chartTab === "quarterly"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/15"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Trimestral
                </button>
                <button
                  type="button"
                  onClick={() => setChartTab("recent")}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                    chartTab === "recent"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/15"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Recentes
                </button>
              </div>
            </div>

            <div className="h-60 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    chartTab !== "recent"
                      ? trendData.map(d => ({
                          data: d.dayName,
                          dataCompleta: `${d.dayName} (${d.dateStr})`,
                          humor: d.humor,
                          intensidade: d.intensity
                        }))
                      : [...combinedHistorico]
                          .reverse()
                          .slice(-10)
                          .map(entry => {
                            const d = new Date(entry.timestamp);
                            return {
                              data: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                              dataCompleta: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
                              humor: entry.value,
                              intensidade: entry.intensity || 0
                            };
                          })
                  }
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorHumor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={highContrast ? "#00ffcc" : "#10b981"} stopOpacity={highContrast ? 0.45 : 0.3}/>
                      <stop offset="95%" stopColor={highContrast ? "#00ffcc" : "#10b981"} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIntensidade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={highContrast ? "#ffff00" : "#3b82f6"} stopOpacity={highContrast ? 0.3 : 0.15}/>
                      <stop offset="95%" stopColor={highContrast ? "#ffff00" : "#3b82f6"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray={highContrast ? "3 3" : "4 4"} 
                    stroke={highContrast ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.05)"} 
                  />
                  <XAxis 
                    dataKey="data" 
                    stroke={highContrast ? "#ffffff" : "#475569"} 
                    fontSize={highContrast ? 11 : 10} 
                    tickLine={highContrast} 
                    axisLine={highContrast}
                    dy={5}
                    style={{ fontWeight: highContrast ? "800" : "500" }}
                    interval={
                      chartTab === "weekly"
                        ? 0
                        : chartTab === "monthly"
                        ? 4
                        : chartTab === "quarterly"
                        ? 12
                        : "preserveEnd"
                    }
                  />
                  <YAxis 
                    stroke={highContrast ? "#ffffff" : "#475569"} 
                    fontSize={highContrast ? 11 : 10} 
                    tickLine={highContrast} 
                    axisLine={highContrast}
                    domain={[0, 10]}
                    tickCount={6}
                    dx={-5}
                    style={{ fontWeight: highContrast ? "800" : "500" }}
                  />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const hasValue = payload[0].value !== undefined && payload[0].value !== null;
                        return (
                          <div className={`p-3.5 rounded-2xl shadow-2xl relative z-50 border transition-all ${
                            highContrast 
                              ? "bg-black border-2 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.35)]" 
                              : "bg-slate-950 border border-white/10"
                          }`}>
                            <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-2 ${
                              highContrast ? "text-white" : "text-slate-500"
                            }`}>
                              {payload[0].payload.dataCompleta}
                            </p>
                            <div className="space-y-1">
                              {hasValue ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${highContrast ? "bg-[#00ffcc]" : "bg-emerald-400"}`} />
                                    <span className={`text-xs font-bold ${highContrast ? "text-white font-black" : "text-white"}`}>
                                      Humor Médio: <span className={`text-sm ${highContrast ? "font-black text-[#00ffcc]" : "font-extrabold text-white"}`}>{payload[0].value}</span>/10
                                    </span>
                                  </div>
                                  {payload[1] && payload[1].value !== undefined && payload[1].value !== null && (
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2.5 h-2.5 rounded-full ${highContrast ? "bg-[#ffff00]" : "bg-blue-400"}`} />
                                      <span className={`text-xs font-bold ${highContrast ? "text-white font-black" : "text-slate-300"}`}>
                                        Intensidade Média: <span className={highContrast ? "text-[#ffff00] font-black" : ""}>{payload[1].value}</span>/10
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className={`text-xs italic ${highContrast ? "text-white/80" : "text-slate-500"}`}>Sem registros neste dia</p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="humor" 
                    stroke={highContrast ? "#00ffcc" : "#10b981"} 
                    strokeWidth={highContrast ? 5 : 3}
                    fillOpacity={1} 
                    fill="url(#colorHumor)"
                    connectNulls={true}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="intensidade" 
                    stroke={highContrast ? "#ffff00" : "#3b82f6"} 
                    strokeWidth={highContrast ? 3.5 : 1.5}
                    strokeDasharray={highContrast ? undefined : "4 4"}
                    fillOpacity={1} 
                    fill="url(#colorIntensidade)"
                    connectNulls={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex gap-4 justify-center items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Nível de Humor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Intensidade Emocional</span>
              </div>
            </div>
          </motion.section>
        )}

        {/* History Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-medium text-slate-200">Seu Histórico</h3>
            </div>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 hover:border-emerald-400/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              📥 Exportar Relatório PDF
            </button>
          </div>
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Filtragem de data</div>
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
                          {entry.synced === false && (
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 animate-pulse">
                              <WifiOff className="w-3 h-3" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                Offline
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {entry.triggers && entry.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.triggers.map((trigger: string) => {
                            const labels: { [key: string]: string } = {
                              trabalho: "💼 Trabalho",
                              familia: "🏠 Família",
                              saude: "❤️ Saúde",
                              financas: "💵 Finanças",
                              relacionamento: "💑 Relacionamento",
                              amigos: "👥 Amigos",
                              sono: "🌙 Sono",
                              estudos: "📚 Estudos"
                            };
                            return (
                              <span 
                                key={trigger}
                                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md"
                              >
                                {labels[trigger] || trigger}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      
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
