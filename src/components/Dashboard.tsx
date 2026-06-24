import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "./AuthProvider";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";
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
  Legend,
  TooltipProps
} from "recharts";
import { 
  TrendingUp, 
  Activity, 
  Calendar, 
  BookOpen, 
  Smile, 
  CalendarDays,
  Sparkles,
  Info,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye
} from "lucide-react";
import { Appointment } from "../types";

// Helper function to get past 7 days relative to today
const getPast7Days = () => {
  const days = [];
  const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d,
      dayLabel: weekdayNames[d.getDay()],
      formattedDate: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      dayOfWeek: d.getDay(),
      midnightTimestamp: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    });
  }
  return days;
};

// Check if two dates are on the same calendar day
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    let unsubMoods: (() => void) | undefined;
    let unsubDiaries: (() => void) | undefined;
    let unsubAppointments: (() => void) | undefined;

    const loadData = () => {
      setLoading(true);
      const simUserStr = localStorage.getItem("simulatedUser");
      const simUser = simUserStr ? JSON.parse(simUserStr) : null;
      const currentUser = auth.currentUser || simUser;

      if (!currentUser) {
        setIsDemo(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch Mood History
        unsubMoods = userService.getMoodHistory((history) => {
          setMoodHistory(history || []);
        });

        // Fetch Diary Entries
        unsubDiaries = userService.getDiaryEntries((entries) => {
          setDiaryEntries(entries || []);
        });

        // Fetch Appointments
        const userType = profile?.tipo || (localStorage.getItem("tipo") as any) || "usuario";
        unsubAppointments = userService.getMyAppointments((apps) => {
          setAppointments(apps || []);
        }, userType);

        setIsDemo(false);
      } catch (error) {
        console.error("Erro ao assinar coleções do Firebase para o Dashboard:", error);
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubMoods) unsubMoods();
      if (unsubDiaries) unsubDiaries();
      if (unsubAppointments) unsubAppointments();
    };
  }, [profile]);

  // If there's no real data, we create mock data to keep the interface highly informative
  const activeMoodList = !isDemo && moodHistory.length > 0 ? moodHistory : [
    { value: 8, intensity: 6, note: "Pratiquei meditação e me senti muito calmo", timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), triggers: ["Meditação", "Saúde"] },
    { value: 5, intensity: 5, note: "Dia cansativo no trabalho", timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), triggers: ["Trabalho"] },
    { value: 4, intensity: 7, note: "Tive dor de cabeça no fim da tarde", timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), triggers: ["Saúde"] },
    { value: 7, intensity: 4, note: "Conversei com um amigo de longa data", timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), triggers: ["Amigos"] },
    { value: 9, intensity: 5, note: "Iniciei um projeto novo com ótima energia!", timestamp: new Date().toISOString(), triggers: ["Trabalho", "Família"] }
  ];

  const activeDiaryList = !isDemo && diaryEntries.length > 0 ? diaryEntries : [
    { timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
    { timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
    { timestamp: new Date().toISOString() }
  ];

  const activeAppointmentList = !isDemo && appointments.length > 0 ? appointments : [
    { date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), status: "completed" }
  ];

  // Process data for Recharts Weekly Mood and Frequency of Use
  const past7Days = getPast7Days();

  // 1. Weekly Mood Curve Data
  const weeklyMoodData = past7Days.map((day) => {
    const moodsOnDay = activeMoodList.filter((entry) => {
      if (!entry.timestamp) return false;
      return isSameDay(new Date(entry.timestamp), day.date);
    });

    // If multiple entries on the same day, take the average value
    const avgValue = moodsOnDay.length > 0 
      ? Math.round((moodsOnDay.reduce((acc, m) => acc + (m.value || m.humor || 5), 0) / moodsOnDay.length) * 10) / 10
      : null;

    const avgIntensity = moodsOnDay.length > 0
      ? Math.round((moodsOnDay.reduce((acc, m) => acc + (m.intensity || 5), 0) / moodsOnDay.length) * 10) / 10
      : null;

    const lastNote = moodsOnDay.length > 0 ? moodsOnDay[moodsOnDay.length - 1].note || "" : "";
    const triggers = moodsOnDay.length > 0 ? moodsOnDay.flatMap((m) => m.triggers || []) : [];

    return {
      name: day.dayLabel,
      formattedDate: day.formattedDate,
      humor: avgValue,
      intensidade: avgIntensity,
      note: lastNote,
      triggers: Array.from(new Set(triggers)).slice(0, 3)
    };
  });

  // 2. Frequency of Use Data
  const frequencyData = past7Days.map((day) => {
    const moodsCount = activeMoodList.filter((m) => m.timestamp && isSameDay(new Date(m.timestamp), day.date)).length;
    const diariesCount = activeDiaryList.filter((d) => d.timestamp && isSameDay(new Date(d.timestamp), day.date)).length;
    const appsCount = activeAppointmentList.filter((a) => a.date && isSameDay(new Date(a.date), day.date)).length;

    return {
      name: day.dayLabel,
      formattedDate: day.formattedDate,
      "Humor": moodsCount,
      "Diário": diariesCount,
      "Sessões": appsCount,
      "Total": moodsCount + diariesCount + appsCount
    };
  });

  // Calculate high-level stats for the summary cards
  const validMoods = weeklyMoodData.filter((d) => d.humor !== null);
  const averageMood = validMoods.length > 0 
    ? Math.round((validMoods.reduce((acc, curr) => acc + (curr.humor || 0), 0) / validMoods.length) * 10) / 10 
    : 7.0;

  const totalInteractions = frequencyData.reduce((acc, curr) => acc + curr.Total, 0);
  const activeDaysCount = frequencyData.filter((d) => d.Total > 0).length;

  // Find most frequent trigger
  const allTriggers = activeMoodList.flatMap((m) => m.triggers || []);
  const triggerCounts: { [key: string]: number } = {};
  allTriggers.forEach((t) => {
    triggerCounts[t] = (triggerCounts[t] || 0) + 1;
  });
  const sortedTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]);
  const topTrigger = sortedTriggers.length > 0 ? sortedTriggers[0][0] : "Nenhum registrado";

  // Translate mood values into clean descriptive labels
  const getMoodDescription = (val: number) => {
    if (val >= 9) return "Excelente";
    if (val >= 7) return "Bem";
    if (val >= 5) return "Neutro";
    if (val >= 3) return "Ruim";
    return "Péssimo";
  };

  const getMoodEmoji = (val: number) => {
    if (val >= 9) return "😀";
    if (val >= 7) return "🙂";
    if (val >= 5) return "😐";
    if (val >= 3) return "😟";
    return "😭";
  };

  const getSupportiveMessage = (val: number) => {
    if (val >= 9) {
      return {
        text: "Sua energia está maravilhosa! Aproveite esse momento dourado para realizar suas paixões e espalhar positividade ao seu redor.",
        emoji: "✨",
        bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
      };
    } else if (val >= 7) {
      return {
        text: "Que dia bacana! Continue cultivando essa mente tranquila e anote o que te fez sorrir hoje para guardar com carinho.",
        emoji: "🌱",
        bgColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
      };
    } else if (val >= 5) {
      return {
        text: "Um dia equilibrado. Lembre-se de que a neutralidade é o solo onde a paz interior lança suas raízes duradouras.",
        emoji: "🧘",
        bgColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
      };
    } else if (val >= 3) {
      return {
        text: "Acolha este momento de fragilidade. Seja paciente consigo e faça uma pausa; que tal praticar o exercício de respiração lenta?",
        emoji: "☁️",
        bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
      };
    } else {
      return {
        text: "Estamos com você nesta tempestade. Se precisar de escuta ou apoio urgente, sinta-se seguro para usar o botão SOS.",
        emoji: "❤️",
        bgColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
      };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-slate-500">
        <Activity className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-xs font-semibold tracking-wide uppercase">Carregando painel de estatísticas...</p>
      </div>
    );
  }

  const isActuallyDemo = isDemo || (moodHistory.length === 0 && diaryEntries.length === 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6 w-full"
      id="dashboard-recharts-analytics"
    >
      {/* Dashboard Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-3xl border border-slate-100 dark:border-white/5">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Estatísticas Integradas
          </h3>
          <p className="text-[11px] text-slate-500">Acompanhamento completo de saúde mental e hábitos semanais</p>
        </div>

        {/* High Contrast Toggle Button */}
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
            highContrast
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md ring-2 ring-emerald-500/50"
              : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-white/10"
          }`}
          id="toggle-high-contrast"
          aria-label="Alternar alto contraste"
        >
          <Eye className={`w-3.5 h-3.5 ${highContrast ? "text-emerald-400 dark:text-emerald-600" : "text-slate-400"}`} />
          <span>Alto Contraste: {highContrast ? "Ativo" : "Inativo"}</span>
        </button>
      </div>

      {/* Demo Banner */}
      {isActuallyDemo && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start text-amber-800 dark:text-amber-300">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">Demonstração Ativa</h4>
            <p className="text-xs leading-relaxed opacity-90">
              Ainda não identificamos registros suficientes em sua conta. Exibindo dados ilustrativos abaixo. 
              <strong> Registre seu humor na área superior ou escreva no seu diário</strong> para ver seus gráficos reais em tempo real!
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Média de Humor */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Humor Médio</span>
            <span className="text-xs">{getMoodEmoji(averageMood)}</span>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{averageMood} <span className="text-xs font-medium text-slate-400">/10</span></p>
            <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wide">{getMoodDescription(averageMood)}</p>
          </div>
        </div>

        {/* Card 2: Atividades Semanais */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Uso Semanal</span>
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalInteractions}</p>
            <p className="text-[10px] font-bold uppercase text-indigo-500 tracking-wide">Ações realizadas</p>
          </div>
        </div>

        {/* Card 3: Frequência de Dias */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Frequência</span>
            <CalendarDays className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{activeDaysCount} <span className="text-xs font-medium text-slate-400">/7</span></p>
            <p className="text-[10px] font-bold uppercase text-teal-500 tracking-wide">Dias ativos</p>
          </div>
        </div>

        {/* Card 4: Principal Gatilho */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Maior Impacto</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="space-y-0.5">
            <p className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{topTrigger}</p>
            <p className="text-[10px] font-bold uppercase text-amber-500 tracking-wide">Gatilho mais comum</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Curva de Humor Semanal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 space-y-3 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-100 tracking-wider flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-emerald-500" />
              Nível de Humor diário
            </h4>
            <p className="text-[11px] text-slate-500">Mapeamento dinâmico do bem-estar psicológico nesta semana</p>
          </div>

          <div className="h-56 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyMoodData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHumor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={highContrast ? "#2563eb" : "#10b981"} stopOpacity={highContrast ? 0.45 : 0.2}/>
                    <stop offset="95%" stopColor={highContrast ? "#2563eb" : "#10b981"} stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={highContrast ? "rgba(148, 163, 184, 0.45)" : "rgba(148, 163, 184, 0.08)"} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={highContrast ? "#334155" : "rgba(148, 163, 184, 0.45)"} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={5}
                />
                <YAxis 
                  domain={[0, 10]} 
                  stroke={highContrast ? "#334155" : "rgba(148, 163, 184, 0.45)"} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-5}
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      if (data.humor === null) return null;
                      const support = getSupportiveMessage(data.humor);
                      return (
                        <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-white/10 p-4 rounded-2xl shadow-2xl space-y-3 font-sans text-xs max-w-[280px] text-slate-800 dark:text-slate-200">
                          {/* Header: Date */}
                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-1.5">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{data.formattedDate}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                              Humor diário
                            </span>
                          </div>

                          {/* Level & Emoji Badge */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getMoodEmoji(data.humor)}</span>
                              <div>
                                <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                                  {getMoodDescription(data.humor)}
                                </p>
                                <p className="text-[9px] text-slate-400 font-medium">Nota de bem-estar</p>
                              </div>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black text-sm px-2.5 py-1 rounded-xl border border-emerald-100 dark:border-emerald-950/50">
                              {data.humor}<span className="text-[9px] font-normal text-emerald-400/80">/10</span>
                            </div>
                          </div>

                          {/* Triggers if registered */}
                          {data.triggers && data.triggers.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Fatores e Gatilhos</p>
                              <div className="flex flex-wrap gap-1">
                                {data.triggers.map((trigger: string, i: number) => (
                                  <span 
                                    key={i} 
                                    className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                                  >
                                    {trigger}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Note if registered */}
                          {data.note && (
                            <div className="space-y-1">
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Anotação pessoal</p>
                              <p className="text-[11px] italic text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-white/5">
                                "{data.note}"
                              </p>
                            </div>
                          )}

                          {/* Supportive / Contextual message */}
                          <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed flex gap-2 items-start ${support.bgColor}`}>
                            <span className="text-base shrink-0 select-none mt-0.5">{support.emoji}</span>
                            <div className="space-y-0.5">
                              <p className="font-bold text-[9px] uppercase tracking-wider">Dica / Mensagem</p>
                              <p className="opacity-95 font-medium">{support.text}</p>
                            </div>
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
                  stroke={highContrast ? "#2563eb" : "#10b981"} 
                  strokeWidth={highContrast ? 4.5 : 2.5}
                  fillOpacity={1} 
                  fill="url(#colorHumor)" 
                  connectNulls
                  dot={{ r: highContrast ? 5 : 3, strokeWidth: highContrast ? 2.5 : 1.5, fill: highContrast ? "#2563eb" : "#10b981" }}
                  activeDot={{ r: highContrast ? 7 : 5, strokeWidth: 0, fill: highContrast ? "#2563eb" : "#10b981" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Frequência de Uso */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 space-y-3 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-100 tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500" />
              Frequência de Uso Semanal
            </h4>
            <p className="text-[11px] text-slate-500">Métricas de interação ativa (registro de humor, diário e consultas)</p>
          </div>

          <div className="h-56 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke={highContrast ? "rgba(148, 163, 184, 0.45)" : "rgba(148, 163, 184, 0.08)"} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={highContrast ? "#334155" : "rgba(148, 163, 184, 0.45)"} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={5}
                />
                <YAxis 
                  allowDecimals={false}
                  stroke={highContrast ? "#334155" : "rgba(148, 163, 184, 0.45)"} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-3 rounded-2xl shadow-xl space-y-1.5 font-sans text-xs">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{data.formattedDate}</p>
                          <div className="space-y-1">
                            {payload.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                  <span className="text-slate-550 dark:text-slate-400">{p.name}:</span>
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-100">{p.value}</span>
                              </div>
                            ))}
                            <div className="border-t border-slate-100 dark:border-white/5 pt-1 mt-1 flex justify-between gap-4 font-bold text-slate-800 dark:text-slate-100">
                              <span>Total de interações:</span>
                              <span>{data.Total}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={30} 
                  iconType="circle" 
                  iconSize={6}
                  wrapperStyle={{ fontSize: 10, fontFamily: "sans-serif" }}
                />
                <Bar 
                  dataKey="Humor" 
                  stackId="a" 
                  fill={highContrast ? "#2563eb" : "#10b981"} 
                  stroke={highContrast ? "#000000" : undefined}
                  strokeWidth={highContrast ? 1.5 : undefined}
                  radius={[0, 0, 0, 0]} 
                />
                <Bar 
                  dataKey="Diário" 
                  stackId="a" 
                  fill={highContrast ? "#ea580c" : "#6366f1"} 
                  stroke={highContrast ? "#000000" : undefined}
                  strokeWidth={highContrast ? 1.5 : undefined}
                  radius={[0, 0, 0, 0]} 
                />
                <Bar 
                  dataKey="Sessões" 
                  stackId="a" 
                  fill={highContrast ? "#dc2626" : "#06b6d4"} 
                  stroke={highContrast ? "#000000" : undefined}
                  strokeWidth={highContrast ? 1.5 : undefined}
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
