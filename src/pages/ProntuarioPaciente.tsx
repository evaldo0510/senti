import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  Plus
} from "lucide-react";
import { userService } from "../services/userService";
import { UserProfile, Appointment, MoodEntry } from "../types";
import { cn } from "../lib/utils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function ProntuarioPaciente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        const profile = await userService.getUser(id);
        setPaciente(profile);

        // Get appointments for this patient with the current therapist
        // For now, we'll filter all appointments where this patient is involved
        userService.getMyAppointments((apps) => {
          const patientApps = apps.filter(a => a.patientId === id);
          setAppointments(patientApps);
        }, 'terapeuta');

        // Get mood history (mocked for now, or fetched if permissions allow)
        // In a real app, this would be a specific service call
        const history = await userService.getPatientMoodHistory(id);
        setMoodHistory(history);

      } catch (error) {
        console.error("Error loading patient record:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">Paciente não encontrado</h2>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl">Voltar</button>
      </div>
    );
  }

  const chartData = moodHistory.map(m => ({
    date: new Date(m.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    value: m.value,
    intensity: m.intensity
  })).reverse();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Prontuário do Paciente</h1>
              <p className="text-slate-500">Acompanhamento clínico e evolução terapêutica</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/registro/new?patientId=${id}`)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-5 h-5" />
            Nova Evolução
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Info Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-4xl font-bold text-emerald-400 border border-white/5">
                  {paciente.nome?.charAt(0) || "P"}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{paciente.nome}</h2>
                  <p className="text-sm text-slate-500">{paciente.email}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">Em Tratamento</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sessões Realizadas:</span>
                  <span className="font-bold">{appointments.filter(a => a.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Início do Tratamento:</span>
                  <span className="font-bold">{new Date(paciente.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Enviar Mensagem
                </button>
              </div>
            </div>

            {/* Risk Indicator */}
            <div className={cn(
              "p-6 rounded-3xl border flex items-start gap-4",
              appointments[0]?.riskLevel === 'alto' ? "bg-red-900/20 border-red-500/30 text-red-200" :
              appointments[0]?.riskLevel === 'moderado' ? "bg-amber-900/20 border-amber-500/30 text-amber-200" :
              "bg-emerald-900/20 border-emerald-500/30 text-emerald-200"
            )}>
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold uppercase tracking-widest text-[10px] mb-1">Nível de Risco Atual</h4>
                <p className="text-lg font-bold">
                  {appointments[0]?.riskLevel === 'alto' ? "Alto Risco" :
                   appointments[0]?.riskLevel === 'moderado' ? "Risco Moderado" :
                   "Baixo Risco / Estável"}
                </p>
                <p className="text-xs opacity-70 mt-1">Baseado na última sessão realizada em {new Date(appointments[0]?.date || Date.now()).toLocaleDateString('pt-BR')}.</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood Chart */}
            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Evolução do Humor
                </h3>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Humor</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Intensidade</div>
                </div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={[0, 10]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#10b981' }} 
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="intensity" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Session History */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Histórico de Evoluções
              </h3>
              
              <div className="space-y-4">
                {appointments.filter(a => a.status === 'completed').map((app) => (
                  <motion.div 
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-xl">
                          <Calendar className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">Sessão de Acompanhamento</p>
                          <p className="text-xs text-slate-500">{new Date(app.date).toLocaleDateString('pt-BR')} às {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest",
                        app.riskLevel === 'alto' ? "bg-red-500/10 text-red-400" :
                        app.riskLevel === 'moderado' ? "bg-amber-500/10 text-amber-400" :
                        "bg-emerald-500/10 text-emerald-400"
                      )}>
                        Risco: {app.riskLevel || "N/A"}
                      </span>
                    </div>
                    
                    <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                      <p className="text-sm text-slate-400 leading-relaxed italic">
                        {app.notes || "Nenhuma nota registrada para esta sessão."}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:underline">
                        Editar Evolução
                      </button>
                    </div>
                  </motion.div>
                ))}

                {appointments.filter(a => a.status === 'completed').length === 0 && (
                  <div className="bg-slate-900/50 border border-dashed border-white/10 p-12 rounded-3xl text-center">
                    <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">Nenhuma evolução registrada ainda.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
