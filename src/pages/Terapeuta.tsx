import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
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
  TrendingDown
} from "lucide-react";
import { logout } from "../services/firebase";
import { useAuth } from "../components/AuthProvider";
import { userService } from "../services/userService";
import { Appointment } from "../types";
import { cn } from "../lib/utils";

export default function Terapeuta() {
  const navigate = useNavigate();
  const { profile, loading, isAuthReady } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    revenue: 0
  });

  useEffect(() => {
    if (isAuthReady && !loading) {
      if (!profile || (profile.tipo !== 'terapeuta' && profile.tipo !== 'admin')) {
        navigate("/login");
        return;
      }

      const unsubscribe = userService.getMyAppointments((apps) => {
        setAppointments(apps);
        
        // Calculate stats
        const pending = apps.filter(a => a.status === 'pending').length;
        const completed = apps.filter(a => a.status === 'completed').length;
        const revenue = completed * (typeof profile.preco === 'number' ? profile.preco : parseInt(profile.preco || "150"));
        
        setStats({
          total: apps.length,
          pending,
          completed,
          revenue
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

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            <Activity className="w-8 h-8" />
            PSE <span className="text-slate-100 font-light">Pro</span>
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
            Meus Pacientes
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
          
          {/* Header */}
          <header className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-slate-100">
                {activeTab === 'dashboard' && `Olá, Dr(a). ${profile?.nome?.split(' ')[0]}`}
                {activeTab === 'agenda' && 'Minha Agenda'}
                {activeTab === 'pacientes' && 'Meus Pacientes'}
                {activeTab === 'perfil' && 'Meu Perfil'}
              </h2>
              <p className="text-slate-500 mt-2 text-lg">
                {activeTab === 'dashboard' && `Você tem ${stats.pending} agendamentos pendentes para hoje.`}
                {activeTab === 'agenda' && 'Gerencie seus horários e sessões.'}
                {activeTab === 'pacientes' && 'Acompanhe o progresso de quem você cuida.'}
                {activeTab === 'perfil' && 'Mantenha suas informações atualizadas.'}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="hidden lg:block">
                <div className="bg-emerald-900/20 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2 text-sm text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Dica: {tips[currentTip]}
                </div>
              </div>
              <button className="p-3 bg-slate-900 rounded-2xl border border-white/5 relative">
                <Bell className="w-6 h-6 text-slate-400" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <button onClick={handleLogout} className="lg:hidden p-3 bg-slate-900 rounded-2xl border border-white/5 text-slate-400 hover:text-red-400">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Sessões Hoje", value: stats.total, icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
                  { label: "Concluídas", value: stats.completed, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  { label: "Receita Est.", value: `R$ ${stats.revenue}`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" }
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
                    <h4 className="font-bold text-slate-200">Dicas IARA</h4>
                    <div className="space-y-4">
                      {tips.map((tip, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                          <p className="text-sm text-slate-400 leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'agenda' && (
            <div className="bg-slate-900 border border-white/5 p-12 rounded-3xl text-center">
              <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-200 mb-2">Sua Agenda em Breve</h3>
              <p className="text-slate-400">Estamos finalizando a integração com o Google Calendar e iCal.</p>
            </div>
          )}

          {activeTab === 'pacientes' && (
            <div className="bg-slate-900 border border-white/5 p-12 rounded-3xl text-center">
              <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-200 mb-2">Gestão de Pacientes</h3>
              <p className="text-slate-400">Aqui você poderá ver o histórico e evolução de cada paciente.</p>
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
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">E-mail Profissional</label>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-slate-300 font-medium">{profile?.email}</div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Valor da Sessão</label>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-slate-300 font-medium">R$ {profile?.preco}</div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Biografia</label>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-slate-300 leading-relaxed">
                    {profile?.biografia || "Nenhuma biografia cadastrada. Adicione uma para que os pacientes conheçam melhor seu trabalho."}
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
    </div>
  );
}
