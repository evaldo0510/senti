import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  History, 
  MessageSquare, 
  Settings, 
  LogOut, 
  User as UserIcon,
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Loader2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { logout, getUserProfile, auth } from '../services/authService';
import { userService } from '../services/userService';
import { cn } from '../lib/utils';
import { UserProfile, Appointment } from '../types';
import { TerapeutaSettings } from '../components/TerapeutaSettings';

export const TerapeutaPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'patients' | 'agenda' | 'history' | 'settings'>('patients');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    let unsubApps: (() => void) | undefined;

    const init = async () => {
      if (auth.currentUser) {
        const p = await getUserProfile(auth.currentUser.uid);
        setProfile(p);
        
        unsubApps = userService.getMyAppointments((apps) => {
          setAppointments(apps);
        }, 'terapeuta');
      }
      setLoading(false);
    };
    init();

    return () => {
      if (unsubApps) unsubApps();
    };
  }, []);

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    await userService.updateAppointmentStatus(id, status);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleToggleOnline = async () => {
    if (!profile || !auth.currentUser) return;
    const newStatus = !profile.online;
    await userService.updateOnlineStatus(auth.currentUser.uid, newStatus);
    setProfile({ ...profile, online: newStatus });
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  const agendaSlots = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <Loader2 className="text-brand-green animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-brand-slate/30 backdrop-blur-2xl border-r border-brand-text/5 p-10 flex flex-col gap-12 relative z-20">
        <div className="flex items-center gap-5">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="w-16 h-16 rounded-3xl bg-brand-green/10 text-brand-green flex items-center justify-center overflow-hidden border-2 border-brand-green/20 shadow-xl"
          >
            {profile?.fotoUrl ? (
              <img src={profile.fotoUrl} alt={profile.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon size={32} />
            )}
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-brand-text truncate max-w-[160px]">{profile?.nome || 'Dr. Terapeuta'}</h2>
            <button 
              onClick={handleToggleOnline}
              className="flex items-center gap-2 group/status"
            >
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                profile?.online ? "bg-brand-green animate-pulse" : "bg-brand-text/20"
              )} />
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                profile?.online ? "text-brand-green" : "text-brand-text/40 group-hover/status:text-brand-text/60"
              )}>
                {profile?.online ? 'Online' : 'Offline'}
              </p>
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {[
            { id: 'patients', icon: Users, label: 'Pacientes' },
            { id: 'agenda', icon: Calendar, label: 'Agenda' },
            { id: 'history', icon: History, label: 'Histórico' },
            { id: 'settings', icon: Settings, label: 'Configurações' },
          ].map((item) => (
            <motion.button 
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-5 px-6 py-5 rounded-3xl font-bold text-sm transition-all group relative overflow-hidden",
                activeTab === item.id 
                  ? "bg-brand-green text-white shadow-2xl shadow-brand-green/20" 
                  : "text-brand-text/40 hover:text-brand-text hover:bg-brand-slate/50"
              )}
            >
              <item.icon size={22} className={cn("transition-transform group-hover:scale-110 relative z-10", activeTab === item.id ? "text-white" : "text-brand-text/40")} />
              <span className="relative z-10">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-tab"
                  className="absolute inset-0 bg-gradient-to-r from-brand-green to-brand-green/80"
                />
              )}
            </motion.button>
          ))}
        </nav>

        <motion.button 
          whileHover={{ x: 5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-5 px-6 py-5 text-brand-red/60 hover:text-brand-red hover:bg-brand-red/5 rounded-3xl font-bold text-sm transition-all group"
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sair da Conta</span>
        </motion.button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 md:p-16 space-y-12 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
        {/* Background Blobs for Main Content */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-indigo/5 rounded-full blur-[120px]" />
        </div>

        {activeTab === 'patients' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-green">Painel do Especialista</p>
                <h1 className="text-5xl font-serif font-bold text-brand-text">Olá, Dr(a). {profile?.nome?.split(' ')[0]}</h1>
                <p className="text-brand-text/40 text-lg">Seu impacto hoje: <span className="text-brand-green font-bold">{pendingAppointments.length} vidas acolhidas</span>.</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('agenda')}
                className="bg-brand-dark text-white font-bold px-10 py-5 rounded-[2rem] shadow-2xl hover:shadow-brand-green/20 transition-all flex items-center justify-center gap-4 border border-white/10 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-green/20 text-brand-green flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
                </div>
                <span className="text-lg">Ver Agenda</span>
              </motion.button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { label: 'Atendimentos Hoje', value: pendingAppointments.length.toString(), trend: '+2 em relação a ontem', icon: TrendingUp, color: 'text-brand-green', bg: 'bg-brand-green/10' },
                { label: 'Tempo Médio', value: '45m', trend: 'Sessões individuais', icon: Clock, color: 'text-brand-indigo', bg: 'bg-brand-indigo/10' },
                { label: 'Avaliação Média', value: profile?.rating || '4.9', trend: 'Baseado em 150 reviews', icon: Star, color: 'text-brand-green', bg: 'bg-brand-green/10' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-card p-10 space-y-6 border-brand-text/5 shadow-2xl rounded-[3rem]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">{stat.label}</span>
                    <div className={cn("p-4 rounded-2xl shadow-inner", stat.bg, stat.color)}>
                      <stat.icon size={24} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-5xl font-bold text-brand-text tracking-tight">{stat.value}</p>
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest", stat.color === 'text-brand-green' ? 'text-brand-green' : 'text-brand-text/40')}>
                      {stat.trend}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Patients List */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-3xl font-serif font-bold text-brand-text">Próximos Atendimentos</h3>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-brand-green/10 text-brand-green text-[10px] font-bold uppercase tracking-widest border border-brand-green/20">
                  <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                  {pendingAppointments.length} confirmados para hoje
                </div>
              </div>
              <div className="glass-card rounded-[3.5rem] overflow-hidden border-brand-text/5 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-brand-slate/40 backdrop-blur-md border-b border-brand-text/5">
                      <tr>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Paciente</th>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Status</th>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Horário</th>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-text/5">
                      {pendingAppointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-brand-slate/30 transition-all group">
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-brand-slate/50 flex items-center justify-center text-brand-text/40 font-bold text-xl border border-brand-text/5 shadow-inner">
                                {appointment.patientNome.charAt(0)}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-bold text-lg text-brand-text block">{appointment.patientNome}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text/30">ID: {appointment.patientId.slice(0, 8)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <span className={cn(
                              "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                              appointment.status === 'confirmed' ? "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20" :
                              appointment.status === 'pending' ? "bg-brand-green/10 text-brand-green border-brand-green/20" :
                              "bg-brand-slate text-brand-text/40 border-brand-text/10"
                            )}>
                              {appointment.status === 'pending' ? 'Pendente' : 'Confirmado'}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-brand-text">
                                <Clock size={14} className="text-brand-green" />
                                <span className="text-base font-bold">{new Date(appointment.date).getHours().toString().padStart(2, '0')}:{new Date(appointment.date).getMinutes().toString().padStart(2, '0')}</span>
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40">{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/direct-chat/${appointment.patientId}`)}
                                className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-white transition-all shadow-lg shadow-brand-green/10"
                                title="Conversar"
                              >
                                <MessageSquare size={22} />
                              </motion.button>
                              {appointment.status === 'pending' && (
                                <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                                  className="px-6 py-3 rounded-2xl bg-brand-indigo text-white text-xs font-bold shadow-lg shadow-brand-indigo/20"
                                >
                                  Confirmar
                                </motion.button>
                              )}
                              {appointment.status === 'confirmed' && (
                                <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                  className="px-6 py-3 rounded-2xl bg-brand-green text-white text-xs font-bold shadow-lg shadow-brand-green/20"
                                >
                                  Marcar como concluído
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pendingAppointments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-10 py-24 text-center">
                            <div className="flex flex-col items-center gap-6 text-brand-text/20">
                              <div className="w-24 h-24 rounded-full bg-brand-slate/50 flex items-center justify-center border border-brand-text/5">
                                <Calendar size={48} />
                              </div>
                              <div className="space-y-2">
                                <p className="text-2xl font-serif font-bold text-brand-text/40 italic">Nenhum atendimento agendado.</p>
                                <p className="text-sm max-w-xs mx-auto text-brand-text/30">Aproveite para revisar seu histórico ou atualizar suas configurações.</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <h3 className="text-3xl font-serif font-bold text-brand-text">Histórico de Atendimentos</h3>
              <p className="text-brand-text/40 text-sm">Visualize todos os seus atendimentos passados.</p>
            </div>
            <div className="glass-card rounded-[2.5rem] overflow-hidden border-brand-text/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-brand-slate/30 border-b border-brand-text/5">
                    <tr>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-text/40">Paciente</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-text/40">Status</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-text/40">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-text/5">
                    {pastAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-brand-slate/20 transition-all">
                        <td className="px-8 py-6 font-bold text-brand-text">{appointment.patientNome}</td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            appointment.status === 'completed' ? "bg-brand-green/10 text-brand-green border-brand-green/20" : "bg-brand-red/10 text-brand-red border-brand-red/20"
                          )}>
                            {appointment.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-brand-text/60 font-medium">
                          {new Date(appointment.date).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                    {pastAppointments.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-8 py-16 text-center text-brand-text/20 italic font-serif text-lg">
                          Nenhum atendimento no histórico.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && profile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <TerapeutaSettings 
              profile={profile} 
              onUpdate={(updated) => setProfile(updated)} 
            />
          </motion.div>
        )}

        {activeTab === 'agenda' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-3xl font-serif font-bold text-brand-text">Minha Agenda</h3>
                  <p className="text-brand-text/40">Gerencie seus horários e disponibilidades.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Month Navigation */}
                  <div className="flex items-center gap-3 bg-brand-slate/30 p-2 rounded-3xl border border-brand-text/5">
                    <button 
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setSelectedDate(newDate);
                      }}
                      className="p-3 hover:bg-brand-slate rounded-2xl text-brand-text/60 transition-all flex items-center gap-2"
                      title="Mês Anterior"
                    >
                      <ArrowLeft size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Mês Anterior</span>
                    </button>
                    <div className="px-4 py-2 text-center min-w-[120px]">
                      <span className="block font-bold text-brand-text uppercase tracking-widest text-xs">
                        {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setSelectedDate(newDate);
                      }}
                      className="p-3 hover:bg-brand-slate rounded-2xl text-brand-text/60 transition-all flex items-center gap-2"
                      title="Próximo Mês"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Próximo Mês</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  {/* Day Navigation */}
                  <div className="flex items-center gap-4 bg-brand-slate/30 p-2 rounded-3xl border border-brand-text/5">
                    <button 
                      onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
                      className="p-3 hover:bg-brand-slate rounded-2xl text-brand-text/60 transition-all"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="px-6 py-2 text-center min-w-[160px]">
                      <span className="block font-bold text-brand-text">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
                      <span className="text-xs text-brand-text/40">{selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
                      className="p-3 hover:bg-brand-slate rounded-2xl text-brand-text/60 transition-all"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {agendaSlots.map((slot) => {
                const appointment = appointments.find(a => {
                  const d = new Date(a.date);
                  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                  return time === slot && d.toDateString() === selectedDate.toDateString();
                });
                return (
                  <motion.div 
                    key={slot}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "p-8 rounded-[2.5rem] border transition-all flex flex-col justify-between gap-6 h-64 shadow-xl",
                      appointment 
                        ? "bg-brand-green/10 border-brand-green/20" 
                        : "bg-brand-slate/20 border-brand-text/5 opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className={appointment ? "text-brand-green" : "text-brand-text/20"} />
                        <span className="font-bold text-lg text-brand-text">{slot}</span>
                      </div>
                      {appointment && (
                        <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                      )}
                    </div>

                    {appointment ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Ocupado</p>
                        <p className="font-serif text-xl font-bold text-brand-text leading-tight">{appointment.patientNome}</p>
                        <button 
                          onClick={() => navigate(`/atendimento/${appointment.id}`)}
                          className="text-xs font-bold text-brand-green hover:underline flex items-center gap-2"
                        >
                          Iniciar Atendimento <ArrowRight size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text/20">Livre</p>
                        <p className="font-serif text-xl font-bold text-brand-text/20 italic">Horário Disponível</p>
                        <button className="text-xs font-bold text-brand-text/40 hover:text-brand-green transition-colors">
                          Bloquear Horário
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
