import React from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  BookOpen, 
  Sparkles
} from "lucide-react";
import { cn } from "../lib/utils";
import { sentimentService } from "../services/sentimentService";
import { useNavigate } from "react-router-dom";

interface MoodTrend7DaysProps {
  diaryEntries: any[];
}

export default function MoodTrend7Days({ diaryEntries }: MoodTrend7DaysProps) {
  const navigate = useNavigate();

  // Get weekly sentiment data
  const data = React.useMemo(() => {
    return sentimentService.getWeeklySentimentTrend(diaryEntries);
  }, [diaryEntries]);

  // Calculations for insights
  const stats = React.useMemo(() => {
    const activeDays = data.filter(d => d.score !== null);
    if (activeDays.length === 0) {
      return { avgScore: 0, trend: "Sem dados", activeCount: 0, percentage: 0 };
    }
    
    const sum = activeDays.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avgScore = Math.round((sum / activeDays.length) * 10) / 10;

    // Trend analysis (compare last 3 days vs preceding 3-4 days or general trend direction)
    let trend: "up" | "down" | "stable" = "stable";
    if (activeDays.length >= 2) {
      const firstHalf = activeDays.slice(0, Math.floor(activeDays.length / 2));
      const secondHalf = activeDays.slice(Math.floor(activeDays.length / 2));
      
      const firstAvg = firstHalf.reduce((acc, curr) => acc + (curr.score || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((acc, curr) => acc + (curr.score || 0), 0) / secondHalf.length;

      const diff = secondAvg - firstAvg;
      if (diff > 0.4) trend = "up";
      else if (diff < -0.4) trend = "down";
    }

    return {
      avgScore,
      trend,
      activeCount: activeDays.length,
      percentage: Math.round((activeDays.length / 7) * 100)
    };
  }, [data]);

  const getTrendIconAndText = () => {
    switch (stats.trend) {
      case "up":
        return {
          icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
          text: "Em ascensão (Melhoria)",
          color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          advice: "Que ótimo! Seus registros recentes no diário apontam para um aumento no bem-estar emocional. Continue praticando o autocuidado!"
        };
      case "down":
        return {
          icon: <TrendingDown className="w-4 h-4 text-rose-500" />,
          text: "Declínio recente",
          color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
          advice: "Seus registros recentes indicam uma queda no bem-estar. Que tal tirar alguns minutos para respirar ou conversar com a IARA?"
        };
      default:
        return {
          icon: <Minus className="w-4 h-4 text-slate-500" />,
          text: "Estável",
          color: "text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20",
          advice: "Seu humor tem se mantido estável nos últimos dias. Continue acompanhando e registrando suas emoções no diário."
        };
    }
  };

  const trendMeta = getTrendIconAndText();

  // If there are no active days with logs in the last 7 days
  const hasData = stats.activeCount > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-100 dark:shadow-none relative overflow-hidden group">
      {/* Visual background subtle ornament */}
      <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <Activity size={120} className="text-indigo-500" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              SentiCore Analytics
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
            Tendência de Bem-Estar (Últimos 7 dias)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            Gráfico gerado a partir da análise de sentimentos e humor atribuídos em cada escrita de diário.
          </p>
        </div>

        {hasData && (
          <div className="flex items-center gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 rounded-3xl text-center min-w-[90px]">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Média</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {stats.avgScore}/10
              </span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 rounded-3xl text-center min-w-[90px]">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Registros</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {stats.activeCount}
              </span>
            </div>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="relative z-10 py-12 px-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-950/10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Sem registros nos últimos 7 dias</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Escreva no seu diário emocional para que o SentiCore possa calcular suas tendências de bem-estar.
            </p>
          </div>
          <button
            onClick={() => navigate("/diario")}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Escrever no Diário
          </button>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Chart block */}
          <div className="lg:col-span-2 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWellbeing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="rgba(148, 163, 184, 0.45)" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 10]} 
                  stroke="rgba(148, 163, 184, 0.45)" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(99, 102, 241, 0.2)", strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      if (item.score === null) {
                        return (
                          <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl text-left font-sans">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">{item.dateLabel}</span>
                            <span className="text-xs text-slate-500 mt-1 block font-medium">Sem registros neste dia</span>
                          </div>
                        );
                      }
                      
                      const sentiment = sentimentService.analyzeDiarySentiment("", item.score);

                      return (
                        <div className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl text-left font-sans space-y-2 min-w-[150px]">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">{item.dateLabel}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-lg">{sentiment.emoji}</span>
                              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono">
                                {item.score}/10
                              </span>
                            </div>
                          </div>
                          
                          <div className="border-t border-slate-100 dark:border-white/5 pt-1.5 flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estado</span>
                            <span className={cn("text-xs font-bold", sentiment.color)}>
                              {sentiment.label}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {item.count} {item.count === 1 ? "registro" : "registros"}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorWellbeing)" 
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.score === null) return null;
                    return (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={4} 
                        stroke="#6366f1" 
                        strokeWidth={2} 
                        fill="#ffffff" 
                        className="dark:fill-slate-900"
                      />
                    );
                  }}
                  activeDot={{ r: 6, stroke: "#6366f1", strokeWidth: 2, fill: "#fff" }}
                  connectNulls={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Insights block */}
          <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-white/5 rounded-[2rem] p-5 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status da Tendência</span>
                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5", trendMeta.color)}>
                  {trendMeta.icon}
                  {trendMeta.text}
                </span>
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Visão do SentiCore</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  {trendMeta.advice}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-white/5 pt-3 mt-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consistência</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                {stats.percentage}% de consistência
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
