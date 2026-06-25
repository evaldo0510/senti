import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Heart, 
  Zap, 
  Bell, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  BookOpen, 
  Compass, 
  Sparkles, 
  Smile, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { useAuth } from "../components/AuthProvider";
import { usePWA } from "../contexts/PWAContext";
import { userService } from "../services/userService";
import { NotificationService } from "../services/notificationService";
import { trackEvent } from "../services/analyticsService";
import { auth } from "../services/firebase";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, isAuthReady, user } = useAuth();
  const { isOffline, notificationPermission, requestNotificationPermission, subscribeToPush } = usePWA();
  
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7" | "30">("30");
  
  // Reminders Configuration States
  const [reminderActive, setReminderActive] = useState<boolean>(
    localStorage.getItem("reminder_active") === "true"
  );
  const [reminderTime, setReminderTime] = useState<string>(
    localStorage.getItem("reminder_time") || "20:00"
  );
  const [savingReminder, setSavingReminder] = useState(false);
  const [showTestSuccess, setShowTestSuccess] = useState(false);
  const [testError, setTestError] = useState("");

  useEffect(() => {
    if (!isAuthReady) return;
    
    // Fetch historical mood entries
    const unsubscribe = userService.getMoodHistory((history) => {
      setHistorico(history);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [isAuthReady]);

  // Handle active user role check
  const userType = profile?.tipo || localStorage.getItem("tipo") || "usuario";

  // Calculate statistics based on past 30 days
  const filteredForStats = React.useMemo(() => {
    const daysLimit = period === "7" ? 7 : 30;
    const cutoff = Date.now() - daysLimit * 24 * 60 * 60 * 1000;
    return historico.filter(item => new Date(item.timestamp).getTime() >= cutoff);
  }, [historico, period]);

  const stats = React.useMemo(() => {
    if (filteredForStats.length === 0) {
      return { avgMood: 0, avgIntensity: 0, totalEntries: 0, streak: 0, primaryTrigger: "Nenhum" };
    }
    
    const sumMood = filteredForStats.reduce((acc, curr) => acc + curr.value, 0);
    const sumIntensity = filteredForStats.reduce((acc, curr) => acc + (curr.intensity || 5), 0);
    const avgMood = (sumMood / filteredForStats.length).toFixed(1);
    const avgIntensity = (sumIntensity / filteredForStats.length).toFixed(1);
    
    // Calculate primary trigger
    const triggerCounts: { [key: string]: number } = {};
    filteredForStats.forEach(item => {
      if (item.triggers && Array.isArray(item.triggers)) {
        item.triggers.forEach((t: string) => {
          triggerCounts[t] = (triggerCounts[t] || 0) + 1;
        });
      }
    });
    
    let primaryTrigger = "Nenhum";
    let maxCount = 0;
    Object.entries(triggerCounts).forEach(([trigger, count]) => {
      if (count > maxCount) {
        maxCount = count;
        primaryTrigger = trigger;
      }
    });

    const triggerLabels: { [key: string]: string } = {
      trabalho: "Trabalho 💼",
      familia: "Família 🏠",
      saude: "Saúde ❤️",
      financas: "Finanças 💵",
      relacionamento: "Relacionamento 💑",
      amigos: "Amigos 👥",
      sono: "Sono 🌙",
      estudos: "Estudos 📚"
    };

    const friendlyTrigger = triggerLabels[primaryTrigger] || primaryTrigger;

    // Calculate simple streak
    let streak = 0;
    const dates = historico.map(h => new Date(h.timestamp).toDateString());
    const uniqueDates = Array.from(new Set(dates));
    
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toDateString();
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      avgMood,
      avgIntensity,
      totalEntries: filteredForStats.length,
      streak,
      primaryTrigger: friendlyTrigger === "Nenhum" ? "Equilibrado 🧘" : friendlyTrigger
    };
  }, [filteredForStats, historico]);

  // Formatting chart data chronologically
  const chartData = React.useMemo(() => {
    return filteredForStats
      .slice()
      .reverse()
      .map(item => ({
        data: new Date(item.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        humor: item.value,
        intensidade: item.intensity || 5,
        timestamp: new Date(item.timestamp).getTime(),
      }));
  }, [filteredForStats]);

  // Process triggers frequency for Recharts BarChart
  const triggersChartData = React.useMemo(() => {
    const triggerCounts: { [key: string]: number } = {};
    filteredForStats.forEach(item => {
      if (item.triggers && Array.isArray(item.triggers)) {
        item.triggers.forEach((t: string) => {
          triggerCounts[t] = (triggerCounts[t] || 0) + 1;
        });
      }
    });

    const labelMap: { [key: string]: string } = {
      trabalho: "Trabalho",
      familia: "Família",
      saude: "Saúde",
      financas: "Finanças",
      relacionamento: "Relações",
      amigos: "Amigos",
      sono: "Sono",
      estudos: "Estudos"
    };

    return Object.entries(triggerCounts).map(([key, value]) => ({
      name: labelMap[key] || key,
      quantidade: value,
    })).sort((a, b) => b.quantidade - a.quantidade);
  }, [filteredForStats]);

  // Handle Save Reminder Setting in PWA
  const handleSaveReminder = async () => {
    setSavingReminder(true);
    try {
      if (reminderActive) {
        const permission = await NotificationService.requestPermission();
        if (permission === "granted") {
          localStorage.setItem("reminder_active", "true");
          localStorage.setItem("reminder_time", reminderTime);
          
          // Subscribe traditional push in Service Worker too
          try {
            await subscribeToPush();
          } catch (pushErr) {
            console.warn("FCM Subscription failed, falling back to local storage preference:", pushErr);
          }
          
          trackEvent("diary_reminder_enabled", { time: reminderTime });
        } else {
          localStorage.setItem("reminder_active", "false");
          setReminderActive(false);
          alert("Por favor, conceda permissão de notificações no seu navegador para ativarmos os lembretes diários.");
        }
      } else {
        localStorage.setItem("reminder_active", "false");
        trackEvent("diary_reminder_disabled");
      }
    } catch (err) {
      console.error("Error setting reminder", err);
    } finally {
      setSavingReminder(false);
    }
  };

  // Test Notification push trigger
  const handleTestNotification = async () => {
    setTestError("");
    setShowTestSuccess(false);
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      setTestError("Usuário não autenticado ou em modo demonstração.");
      return;
    }

    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: "Sentí Lembrete de Teste 🌸",
          body: "Sua persistência constrói sua evolução. Que tal tirar 2 minutos para preencher seu diário emocional hoje?",
          url: "/diario"
        })
      });

      if (response.ok) {
        setShowTestSuccess(true);
        setTimeout(() => setShowTestSuccess(false), 5000);
      } else {
        const text = await response.text();
        setTestError(`Servidor recusou envio de teste: ${text}. Certifique-se de registrar a inscrição habilitando notificações.`);
      }
    } catch (err: any) {
      setTestError(`Falha ao conectar ao servidor de push: ${err.message}`);
    }
  };

  const welcomeName = profile?.nome || user?.displayName || "Acolhido";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-4 md:p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/app")} 
            className="p-2.5 hover:bg-white/10 rounded-2xl transition-all cursor-pointer active:scale-95 text-slate-400 hover:text-white"
            aria-label="Voltar para a home"
            id="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold font-serif italic text-white flex items-center gap-2">
              Painel de Evolução <Sparkles className="w-4 h-4 text-emerald-400" />
            </h1>
            <p className="text-xs text-slate-400">Dados consolidados do seu progresso emocional</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status Indicator */}
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
            isOffline ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            <span>{isOffline ? "Offline" : "Online"}</span>
          </div>

          <button 
            onClick={() => navigate("/diario")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
          >
            + Novo Registro
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6 z-10">

        {/* Role Helper Callout */}
        {userType === "terapeuta" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-indigo-500/15 border border-indigo-500/20 rounded-3xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3 text-indigo-300">
              <ShieldCheck className="w-5 h-5" />
              <div className="text-xs">
                <span className="font-bold block">Modo Clínico Ativo</span>
                Você está visualizando sua evolução pessoal de bem-estar.
              </div>
            </div>
            <button 
              onClick={() => navigate("/terapeuta")}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
            >
              Ir para Painel Profissional
            </button>
          </motion.div>
        )}

        {/* Dynamic Period Selector */}
        <div className="flex justify-between items-center bg-slate-900/60 p-1.5 border border-white/5 rounded-2xl shadow-xl max-w-xs ml-auto">
          <button
            onClick={() => setPeriod("7")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              period === "7" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "text-slate-400 hover:text-white"
            }`}
          >
            Últimos 7 dias
          </button>
          <button
            onClick={() => setPeriod("30")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              period === "30" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "text-slate-400 hover:text-white"
            }`}
          >
            Últimos 30 dias
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Média de Humor", val: stats.avgMood, unit: "/10", desc: "Sintonia pessoal", icon: Smile, color: "text-emerald-400 bg-emerald-500/10" },
            { label: "Sintomas Ativos", val: stats.avgIntensity, unit: "/10", desc: "Intensidade emocional", icon: Activity, color: "text-blue-400 bg-blue-500/10" },
            { label: "Consistência", val: stats.totalEntries, unit: " logs", desc: "Registros no período", icon: Calendar, color: "text-purple-400 bg-purple-500/10" },
            { label: "Sequência Atual", val: stats.streak, unit: " dias", desc: "Acolhimento diário", icon: Zap, color: "text-amber-400 bg-amber-500/10" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/60 border border-white/5 p-4 rounded-3xl space-y-2 flex flex-col justify-between shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">{item.label}</span>
                  <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-2xl font-black text-white tracking-tight">
                    {item.val}<span className="text-xs font-normal text-slate-500">{item.unit}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Progression Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/70 border border-white/5 p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Histórico de Sintonia do Humor
              </h3>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Sua trajetória emocional nos últimos {period} dias</p>
            </div>
            
            <div className="bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-white/5 text-[10px] text-slate-400 flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Humor</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Intensidade</span>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
          ) : chartData.length < 2 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-950/30 rounded-2xl border border-white/5">
              <BookOpen className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm max-w-xs font-light leading-relaxed">
                Você precisa de pelo menos 2 registros no diário emocional para gerar um gráfico de tendência.
              </p>
              <button 
                onClick={() => navigate("/diario")}
                className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition-all"
              >
                Escrever no Diário Agora
              </button>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHumorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorIntGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="data" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: "bold" }} 
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: "bold" }} 
                  />
                  <Tooltip 
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-950 border border-white/10 p-3 rounded-2xl shadow-2xl space-y-1">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{payload[0].payload.data}</p>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-emerald-400">Humor: {payload[0].value}/10</p>
                              {payload[1] && <p className="text-[11px] text-blue-400">Intensidade: {payload[1].value}/10</p>}
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
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorHumorGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="intensidade" 
                    stroke="#3b82f6" 
                    strokeWidth={1.5} 
                    strokeDasharray="3 3"
                    fillOpacity={1} 
                    fill="url(#colorIntGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Triggers Bar Chart & Push Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Fatores e Gatilhos Frequentes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-slate-900/70 border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Heart className="w-4.5 h-4.5 text-indigo-400" />
                Fatores de Influência Recorrentes
              </h4>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Gatilhos mais citados no diário emocional</p>
            </div>

            {loading ? (
              <div className="h-44 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
              </div>
            ) : triggersChartData.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-950/20 rounded-2xl border border-white/5">
                <HelpCircle className="w-6 h-6 text-slate-700 mb-2" />
                <p className="text-xs text-slate-500">Nenhum gatilho ou fator foi selecionado em seus check-ins ainda.</p>
              </div>
            ) : (
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={triggersChartData} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 8 }} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: "#cbd5e1", fontSize: 9, fontWeight: "bold" }} />
                    <Tooltip 
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-950 border border-white/10 px-2.5 py-1.5 rounded-xl shadow-lg">
                              <p className="text-xs font-bold text-indigo-400">{payload[0].payload.name}: {payload[0].value} vezes</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="quantidade" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12}>
                      {triggersChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Central de Lembretes PWA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/70 border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-amber-400" />
                Central de Lembretes Diários
              </h4>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Configure alertas push nativos do PWA</p>
            </div>

            <div className="bg-slate-950/40 rounded-2xl border border-white/5 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Ativar Notificações</span>
                <button
                  onClick={() => setReminderActive(!reminderActive)}
                  className={`w-11 h-6 rounded-full p-1 transition-all ${
                    reminderActive ? "bg-emerald-600" : "bg-slate-800"
                  }`}
                  aria-label="Toggle lembrete diário"
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                    reminderActive ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {reminderActive && (
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-xs font-bold text-slate-400">Horário do Alerta</span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="bg-slate-900 border border-white/15 hover:border-white/25 focus:border-emerald-500 text-xs font-bold text-white rounded-lg px-2.5 py-1 focus:outline-none uppercase"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleSaveReminder}
                disabled={savingReminder}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-emerald-400 hover:text-emerald-300 border border-emerald-500/25 hover:border-emerald-400/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {savingReminder ? "Sincronizando..." : "Salvar Configurações"}
              </button>

              <button
                onClick={handleTestNotification}
                disabled={!reminderActive}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  reminderActive 
                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 cursor-pointer active:scale-95"
                    : "bg-slate-900 text-slate-600 border border-white/5 cursor-not-allowed"
                }`}
              >
                🧪 Enviar Alerta de Teste Push
              </button>
            </div>

            {/* Notifications Feedbacks Messages */}
            <AnimatePresence>
              {showTestSuccess && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/10 p-2 rounded-xl text-center"
                >
                  🚀 Notificação enviada! Verifique o painel do seu dispositivo.
                </motion.p>
              )}
              {testError && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[10px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/10 p-2 rounded-xl text-center"
                >
                  ⚠️ {testError}
                </motion.p>
              )}
            </AnimatePresence>

          </motion.div>
        </div>

        {/* Recent Reflections Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl"
        >
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
            Suas Reflexões Recentes
          </h4>
          
          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
            </div>
          ) : filteredForStats.filter(e => e.note).length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">Nenhuma reflexão escrita nos últimos {period} dias.</p>
          ) : (
            <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
              {filteredForStats.filter(e => e.note).slice(0, 4).map((entry, idx) => (
                <div key={entry.id || idx} className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-emerald-400 uppercase tracking-widest">
                      Humor {entry.value}/10
                    </span>
                    <span className="text-slate-500">
                      {new Date(entry.timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-light italic leading-relaxed">
                    "{entry.note}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </main>
    </div>
  );
}
