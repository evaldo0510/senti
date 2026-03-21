import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Loader2
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

  useEffect(() => {
    let unsubApps: (() => void) | undefined;

    const init = async () => {
      if (auth.currentUser) {
        const p = await getUserProfile(auth.currentUser.uid);
        setProfile(p);
        
        unsubApps = userService.getMyAppointments((apps) => {
          setAppointments(apps);
        });
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

  const pendingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <Loader2 className="text-brand-green animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-slate/50 border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center overflow-hidden">
            {profile?.fotoUrl ? (
              <img src={profile.fotoUrl} alt={profile.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon size={24} />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-brand-text truncate max-w-[140px]">{profile?.nome || 'Dr. Terapeuta'}</h2>
            <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest">Online</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('patients')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === 'patients' ? "bg-brand-green/10 text-brand-green" : "text-brand-text/60 hover:bg-white/5"
            )}
          >
            <Users size={20} />
            <span>Pacientes</span>
          </button>
          <button 
            onClick={() => setActiveTab('agenda')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === 'agenda' ? "bg-brand-green/10 text-brand-green" : "text-brand-text/60 hover:bg-white/5"
            )}
          >
            <Calendar size={20} />
            <span>Agenda</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === 'history' ? "bg-brand-green/10 text-brand-green" : "text-brand-text/60 hover:bg-white/5"
            )}
          >
            <History size={20} />
            <span>Histórico</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === 'settings' ? "bg-brand-green/10 text-brand-green" : "text-brand-text/60 hover:bg-white/5"
            )}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-brand-red hover:bg-brand-red/10 rounded-xl font-medium transition-all"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {activeTab === 'patients' && (
          <>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-brand-text">Painel do Terapeuta</h1>
                <p className="text-brand-text/40">Gerencie seus atendimentos e agenda.</p>
              </div>
              <button className="bg-brand-green text-brand-dark font-bold px-6 py-3 rounded-xl shadow-lg shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                <MessageSquare size={20} />
                Iniciar Atendimento
              </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-text/40">Atendimentos Hoje</span>
                  <TrendingUp className="text-brand-green" size={20} />
                </div>
                <p className="text-4xl font-bold text-brand-text">12</p>
                <p className="text-xs text-brand-green">+2 em relação a ontem</p>
              </div>
              <div className="glass-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-text/40">Tempo Médio</span>
                  <Clock className="text-brand-indigo" size={20} />
                </div>
                <p className="text-4xl font-bold text-brand-text">45m</p>
                <p className="text-xs text-brand-text/40">Sessões individuais</p>
              </div>
              <div className="glass-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-text/40">Satisfação</span>
                  <CheckCircle2 className="text-brand-green" size={20} />
                </div>
                <p className="text-4xl font-bold text-brand-text">{profile?.rating || '4.9'}</p>
                <p className="text-xs text-brand-text/40">Baseado em 150 avaliações</p>
              </div>
            </div>

            {/* Patients List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-brand-text">Próximos Atendimentos</h3>
              <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-brand-slate/50 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Paciente</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Data/Hora</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-white/5 transition-all">
                        <td className="px-6 py-4 font-medium text-brand-text">{appointment.patientNome}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            appointment.status === 'confirmed' ? "bg-brand-indigo/20 text-brand-indigo" :
                            appointment.status === 'pending' ? "bg-brand-green/20 text-brand-green" :
                            "bg-brand-slate text-brand-text/40"
                          )}>
                            {appointment.status === 'pending' ? 'Pendente' : 'Confirmado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-brand-text/60">
                          {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.slot}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {appointment.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                              className="text-brand-green font-bold text-sm hover:underline"
                            >
                              Confirmar
                            </button>
                          )}
                          <button 
                            onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            className="text-brand-indigo font-bold text-sm hover:underline"
                          >
                            Finalizar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingAppointments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-brand-text/40 italic">
                          Nenhum atendimento agendado para hoje.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-brand-text">Histórico de Atendimentos</h3>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-brand-slate/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Paciente</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pastAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-white/5 transition-all">
                      <td className="px-6 py-4 font-medium text-brand-text">{appointment.patientNome}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          appointment.status === 'completed' ? "bg-brand-green/20 text-brand-green" : "bg-brand-red/20 text-brand-red"
                        )}>
                          {appointment.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-brand-text/60">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                  {pastAppointments.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-brand-text/40 italic">
                        Nenhum atendimento no histórico.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'settings' && profile && (
          <TerapeutaSettings 
            profile={profile} 
            onUpdate={(updated) => setProfile(updated)} 
          />
        )}

        {activeTab === 'agenda' && (
          <div className="flex flex-col items-center justify-center h-64 text-brand-text/40 space-y-4">
            <Calendar size={48} />
            <p className="text-lg font-medium">Funcionalidade em desenvolvimento...</p>
          </div>
        )}
      </main>
    </div>
  );
};
