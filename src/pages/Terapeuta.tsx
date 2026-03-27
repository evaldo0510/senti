import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { usePWA } from "../contexts/PWAContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { 
  Users, 
  Calendar, 
  Clock, 
  LogOut, 
  Activity, 
  Settings, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Video,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart
} from "lucide-react";
import { logout } from "../services/firebase";
import { useAuth } from "../components/AuthProvider";
import { userService } from "../services/userService";
import { Appointment } from "../types";
import { cn } from "../lib/utils";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Terapeuta() {
  const navigate = useNavigate();
  const { handleInstall, isInstallable, notificationPermission, requestNotificationPermission } = usePWA();
  const { profile, loading, isAuthReady } = useAuth();
  const { isSubscribed, permission: pushPermission, subscribe } = usePushNotifications(profile?.uid);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    revenue: 0,
    completionRate: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (isAuthReady && !loading) {
      if (!profile || (profile.tipo !== 'terapeuta' && profile.tipo !== 'admin')) {
        navigate("/login");
        return;
      }

      // Auto-subscribe to push notifications if not already subscribed
      if (pushPermission === 'default' && !isSubscribed) {
        subscribe();
      }

      const unsubscribe = userService.getMyAppointments((apps) => {
        setAppointments(apps);
        
        // Calculate stats
        const pending = apps.filter(a => a.status === 'pending').length;
        const completed = apps.filter(a => a.status === 'completed').length;
        const total = apps.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const basePrice = typeof profile.preco === 'number' ? profile.preco : parseInt(profile.preco || "150");
        const discountPercentage = profile.desconto || 0;
        const payoutPerSession = basePrice * (1 - discountPercentage / 100);
        
        const revenue = completed * payoutPerSession;
        
        setStats({
          total,
          pending,
          completed,
          revenue: Math.round(revenue),
          completionRate,
          averageRating: profile.rating || 0
        });
      }, 'terapeuta');

      return () => unsubscribe();
    }
  }, [profile, loading, isAuthReady, navigate]);

  const [activeTab, setActiveTab] = React.useState("dashboard");

  const tips = [
    "Mantenha seu perfil atualizado para atrair mais pacientes.",
    "Confirme seus agendamentos pendentes o quanto antes.",
    "A IARA pode ajudar na triagem inicial dos seus pacientes.",
    "Lembre-se de registrar as notas após cada sessão."
  ];

  const [currentTip, setCurrentTip] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("tipo");
    navigate("/");
  };

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    await userService.updateAppointmentStatus(id, status);
  };

  const toggleOnlineStatus = async () => {
    if (profile) {
      const newStatus = !profile.online;
      await userService.updateOnlineStatus(profile.uid, newStatus);
    }
  };

  const handleConnectCalendar = async () => {
    if (profile) {
      await userService.connectGoogleCalendar(profile.uid);
    }
  };

  const handleConnectEarnings = async () => {
    if (profile) {
      await userService.connectEarnings(profile.uid);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 pb-24 lg:pb-0">
      {/* Sidebar - Desktop only */}
      <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            <Activity className="w-8 h-8" />
            ReSet PCH <span className="text-slate-100 font-light">Pro</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'dashboard' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Activity className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("agenda")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'agenda' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Calendar className="w-5 h-5" />
            Minha Agenda
          </button>
          <button 
            onClick={() => setActiveTab("pacientes")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'pacientes' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Users className="w-5 h-5" />
            Gestão de Pacientes
          </button>
          <button 
            onClick={() => setActiveTab("historico")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'historico' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Clock className="w-5 h-5" />
            Histórico
          </button>
          <button 
            onClick={() => setActiveTab("financeiro")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'financeiro' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <DollarSign className="w-5 h-5" />
            Financeiro
          </button>
          <button 
            onClick={() => setActiveTab("perfil")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all",
              activeTab === 'perfil' ? "bg-emerald-900/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Settings className="w-5 h-5" />
            Meu Perfil
          </button>
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <img 
              src={profile?.fotoUrl || `https://picsum.photos/seed/${profile?.uid}/100/100`} 
              className="w-10 h-10 rounded-full border border-white/10"
              alt="Profile"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">{profile?.nome}</p>
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-2xl transition-all">
            <LogOut className="w-5 h-5" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Notification Prompt Banner */}
          {notificationPermission === 'default' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-600 rounded-2xl p-4 flex items-center justify-between gap-4 text-white shadow-lg shadow-emerald-900/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Ative as notificações</p>
                  <p className="text-xs text-emerald-100">Receba alertas de novos agendamentos em tempo real.</p>
                </div>
              </div>
              <button 
                onClick={requestNotificationPermission}
                className="px-4 py-2 bg-white text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-50 transition-colors"
              >
                Ativar
              </button>
            </motion.div>
          )}

          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
                {activeTab === 'dashboard' && `Olá, Dr(a). ${profile?.nome?.split(' ')[0]}`}
                {activeTab === 'agenda' && 'Minha Agenda'}
                {activeTab === 'pacientes' && 'Meus Pacientes'}
                {activeTab === 'financeiro' && 'Gestão Financeira'}
                {activeTab === 'perfil' && 'Meu Perfil'}
              </h2>
              <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg">
                {activeTab === 'dashboard' && `Você tem ${stats.pending} agendamentos pendentes.`}
                {activeTab === 'agenda' && 'Gerencie seus horários e sessões.'}
                {activeTab === 'pacientes' && 'Acompanhe o progresso de quem você cuida.'}
                {activeTab === 'financeiro' && 'Acompanhe seus ganhos e taxas.'}
                {activeTab === 'perfil' && 'Mantenha suas informações atualizadas.'}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end items-center">
              {/* Uber-like Online Toggle */}
              <button 
                onClick={toggleOnlineStatus}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all border",
                  profile?.online 
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                    : "bg-slate-800 border-white/10 text-slate-500"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  profile?.online ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
                )} />
                {profile?.online ? "ONLINE" : "OFFLINE"}
              </button>

              <div className="hidden xl:block">
                <div className="bg-emerald-900/20 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2 text-sm text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Dica: {tips[currentTip]}
                </div>
              </div>
              <button 
                aria-label="Notificações"
                className="p-3 bg-slate-900 rounded-2xl border border-white/5 relative min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                <Bell className="w-6 h-6 text-slate-400" />
                <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <button 
                onClick={handleLogout} 
                aria-label="Sair"
                className="lg:hidden p-3 bg-slate-900 rounded-2xl border border-white/5 text-slate-400 hover:text-red-400 min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total de Sessões", value: stats.total, icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: "Taxa de Conclusão", value: `${stats.completionRate}%`, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  { label: "Receita Total", value: `R$ ${stats.revenue}`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
                  { label: "Avaliação Média", value: stats.averageRating.toFixed(1), icon: Activity, color: "text-amber-400", bg: "bg-amber-400/10" }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-3"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Appointments List */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-end px-2">
                    <h3 className="text-xl font-bold text-slate-200">Próximos Atendimentos</h3>
                    <button onClick={() => setActiveTab("agenda")} className="text-sm text-emerald-400 font-bold hover:underline">Ver agenda completa</button>
                  </div>

                  <div className="space-y-4">
                    {appointments.length > 0 ? appointments.map((app) => (
                      <motion.div 
                        key={app.id}
                        layout
                        className="bg-slate-900 border border-white/5 p-5 rounded-3xl flex flex-col sm:flex-row gap-4 items-center hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-bold text-emerald-400 border border-white/5">
                            {app.patientNome?.charAt(0) || "P"}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-100 text-lg">{app.patientNome}</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(app.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {app.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(app.id, 'confirmed')}
                                className="flex-1 sm:flex-none p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
                                title="Confirmar"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                                className="flex-1 sm:flex-none p-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-2xl border border-white/5 transition-all"
                                title="Recusar"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          ) : app.status === 'confirmed' ? (
                            <button 
                              onClick={() => navigate(`/atendimento/${app.id}`)}
                              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                            >
                              <Video className="w-5 h-5" />
                              Entrar na Sala
                            </button>
                          ) : (
                            <span className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest",
                              app.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            )}>
                              {app.status === 'completed' ? "Concluída" : "Cancelada"}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )) : (
                      <div className="bg-slate-900/50 border border-dashed border-white/10 p-12 rounded-3xl text-center">
                        <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500">Nenhum agendamento para exibir.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Side Panel: Quick Actions & Tips */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20">
                    <h4 className="text-xl font-bold mb-2">Seu perfil está 80% completo</h4>
                    <p className="text-emerald-100 text-sm mb-6">Adicione um vídeo de apresentação para aumentar suas chances de agendamento em até 40%.</p>
                    <button 
                      onClick={() => setActiveTab("perfil")}
                      className="w-full py-3 bg-white text-emerald-700 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-colors"
                    >
                      Completar Perfil
                    </button>
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-4">
                    <h4 className="font-bold text-slate-200">Distribuição de Sessões</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: 'Concluídas', value: stats.completed, color: '#34d399' },
                              { name: 'Pendentes', value: stats.pending, color: '#fbbf24' },
                              { name: 'Canceladas', value: stats.total - stats.completed - stats.pending, color: '#f87171' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[
                              { name: 'Concluídas', value: stats.completed, color: '#34d399' },
                              { name: 'Pendentes', value: stats.pending, color: '#fbbf24' },
                              { name: 'Canceladas', value: stats.total - stats.completed - stats.pending, color: '#f87171' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                            itemStyle={{ color: '#f1f5f9' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Concluídas</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /> Pendentes</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> Canceladas</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'agenda' && (
            <div className="space-y-8">
              <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-2xl">
                    <Calendar className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-200">Google Calendar</h3>
                    <p className="text-slate-400 text-sm">Sincronize sua agenda profissional automaticamente.</p>
                  </div>
                </div>
                <button 
                  onClick={handleConnectCalendar}
                  className={cn(
                    "px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2",
                    profile?.googleCalendarConnected 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-white text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {profile?.googleCalendarConnected ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Conectado
                    </>
                  ) : (
                    "Conectar Agenda"
                  )}
                </button>
              </div>

              <div className="bg-slate-900 border border-white/5 p-12 rounded-3xl text-center">
                <Clock className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-200 mb-2">Visualização da Agenda</h3>
                <p className="text-slate-400">Sua agenda semanal aparecerá aqui após a conexão.</p>
              </div>
            </div>
          )}

          {activeTab === 'pacientes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-200">Seus Pacientes Ativos</h3>
                <div className="text-sm text-slate-500">Total: {Array.from(new Set(appointments.map(a => a.patientId))).length}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(new Set(appointments.map(a => a.patientId))).map(patientId => {
                  const patientApps = appointments.filter(a => a.patientId === patientId);
                  const lastApp = patientApps[0];
                  const completedCount = patientApps.filter(a => a.status === 'completed').length;
                  
                  return (
                    <motion.div 
                      key={patientId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-bold text-emerald-400 border border-white/5">
                          {lastApp.patientNome?.charAt(0) || "P"}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-100">{lastApp.patientNome}</h4>
                          <p className="text-xs text-slate-500">{completedCount} sessões realizadas</p>
                        </div>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                          <MessageCircle className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>
                      
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Status</div>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase">Em Tratamento</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/terapeuta/paciente/${patientId}`)}
                          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                          Ver Prontuário
                        </button>
                        <button 
                          onClick={async () => {
                            if (profile) {
                              const success = await userService.notifyTherapist(profile.uid, lastApp.patientNome || "Novo Paciente");
                              if (success) {
                                alert("Notificação enviada com sucesso!");
                              }
                            }
                          }}
                          className="px-4 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-500/20 flex items-center gap-2"
                        >
                          <Bell className="w-4 h-4" />
                          Notificar
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                {appointments.length === 0 && (
                  <div className="col-span-full bg-slate-900/50 border border-dashed border-white/10 p-12 rounded-3xl text-center">
                    <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">Você ainda não tem pacientes vinculados.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-200">Histórico de Sessões</h3>
              <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800/50 text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Paciente</th>
                        <th className="px-6 py-4">Data e Hora</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {appointments.map((app) => (
                        <tr key={app.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-white/5">
                                {app.patientNome?.charAt(0) || "P"}
                              </div>
                              <span className="font-medium text-slate-200">{app.patientNome}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {new Date(app.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                              app.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" : 
                              app.status === 'pending' ? "bg-amber-500/10 text-amber-400" : 
                              app.status === 'confirmed' ? "bg-blue-500/10 text-blue-400" :
                              "bg-red-500/10 text-red-400"
                            )}>
                              {app.status === 'completed' ? 'Concluída' : 
                               app.status === 'pending' ? 'Pendente' : 
                               app.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {app.status === 'confirmed' && (
                              <button 
                                onClick={() => navigate(`/atendimento/${app.id}`)}
                                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                              >
                                Acessar Sala
                              </button>
                            )}
                            {app.status === 'pending' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleStatusUpdate(app.id, 'confirmed')} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Confirmar</button>
                                <span className="text-slate-600">|</span>
                                <button onClick={() => handleStatusUpdate(app.id, 'cancelled')} className="text-red-400 hover:text-red-300 font-medium transition-colors">Recusar</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                            Nenhum histórico de sessões encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saldo Disponível</p>
                  <p className="text-2xl font-bold text-emerald-400">R$ {profile?.totalEarnings?.toFixed(2) || "0.00"}</p>
                  <p className="text-[10px] text-slate-500">Pronto para saque</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">A Receber</p>
                  <p className="text-2xl font-bold text-amber-400">R$ {profile?.pendingEarnings?.toFixed(2) || "0.00"}</p>
                  <p className="text-[10px] text-slate-500">Sessões em processamento</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seu Payout</p>
                  <p className="text-2xl font-bold text-emerald-400">R$ {((profile?.preco || 0) * (1 - (profile?.desconto || 0) / 100)).toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500">Por sessão realizada</p>
                </div>
                <div className="bg-emerald-600 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-lg shadow-emerald-900/20 cursor-pointer hover:bg-emerald-500 transition-all">
                  <DollarSign className="w-6 h-6 text-white mb-1" />
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Solicitar Saque</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-purple-500/10 rounded-2xl">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-200">Conexão Bancária</h3>
                    <p className="text-slate-400 text-sm">Receba seus ganhos diretamente em sua conta via PIX ou TED.</p>
                  </div>
                </div>
                <button 
                  onClick={handleConnectEarnings}
                  className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                >
                  Configurar Recebimento
                </button>
              </div>

              <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-200">Histórico de Ganhos</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <PieChart className="w-4 h-4" />
                    Balanço Mensal
                  </div>
                </div>

                <div className="space-y-4">
                  {appointments.filter(a => a.status === 'completed').length > 0 ? (
                    appointments.filter(a => a.status === 'completed').map((app) => {
                      const payout = app.price * (1 - (profile?.desconto || 0) / 100);
                      const fee = payout * 0.10;
                      return (
                        <div key={app.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-900/20 rounded-full flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">Sessão: {app.patientNome}</p>
                              <p className="text-xs text-slate-500">{new Date(app.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400">+ R$ {payout.toFixed(2)}</p>
                            <p className="text-[10px] text-slate-500">Taxa Plataforma: R$ {fee.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      Nenhum ganho registrado ainda.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-3xl flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-200">Descontos para Empresas</h4>
                  <p className="text-sm text-blue-400/80 mt-1 leading-relaxed">
                    Sua conta está habilitada para o programa SENTI Business. Empresas parceiras podem oferecer subsídios aos colaboradores, 
                    garantindo que você receba seu valor integral enquanto o custo para o colaborador é reduzido.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl space-y-8">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <img 
                    src={profile?.fotoUrl || `https://picsum.photos/seed/${profile?.uid}/200`} 
                    alt={profile?.nome} 
                    className="w-32 h-32 rounded-3xl object-cover border-2 border-emerald-500/20 group-hover:opacity-75 transition-opacity"
                  />
                  <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="w-8 h-8 text-white" />
                  </button>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-200">{profile?.nome}</h3>
                  <p className="text-slate-400 text-lg">{profile?.especialidades?.join(', ')}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-widest">Ativo</span>
                    <span className="text-slate-500 text-sm">Membro desde {new Date(profile?.createdAt || Date.now()).getFullYear()}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">DNA Terapêutico</label>
                  <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Intensidade</span>
                      <span className="text-xs font-bold text-emerald-400">{profile?.intensidade || 50}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${profile?.intensidade || 50}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Estilo</p>
                        <p className="text-sm text-slate-200 capitalize">{profile?.estilo || "Acolhedor"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Abordagem</p>
                        <p className="text-sm text-slate-200">{profile?.abordagem || "TCC"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Valor da Sessão</label>
                  <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-200">R$ {profile?.preco}</p>
                      <p className="text-xs text-slate-500">Taxa de desconto: {profile?.desconto || 0}%</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                      <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Biografia Profissional</label>
                  <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 text-slate-300 leading-relaxed italic">
                    "{profile?.biografia || "Nenhuma biografia cadastrada. Adicione uma para que os pacientes conheçam melhor seu trabalho."}"
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => navigate("/terapeuta-setup")}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                >
                  Editar Perfil Completo
                </button>
                <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold transition-all border border-white/5">
                  Visualizar como Paciente
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 px-1 pb-safe pt-2 flex justify-around items-center z-30 lg:hidden">
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'dashboard' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Dash</span>
        </button>
        <button 
          onClick={() => setActiveTab("agenda")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'agenda' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Agenda</span>
        </button>
        <button 
          onClick={() => setActiveTab("pacientes")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'pacientes' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Pacientes</span>
        </button>
        <button 
          onClick={() => setActiveTab("historico")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'historico' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Histórico</span>
        </button>
        <button 
          onClick={() => setActiveTab("financeiro")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'financeiro' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Ganhos</span>
        </button>
        <button 
          onClick={() => setActiveTab("perfil")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 transition-colors min-w-[56px]",
            activeTab === 'perfil' ? "text-emerald-400" : "text-slate-500"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
