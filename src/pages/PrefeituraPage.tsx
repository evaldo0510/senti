import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Activity, 
  Users, 
  Settings, 
  LogOut, 
  TrendingUp,
  AlertTriangle,
  Hospital,
  BarChart3,
  Search
} from 'lucide-react';
import { logout } from '../services/authService';
import { cn } from '../lib/utils';

export const PrefeituraPage: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const regions = [
    { id: '1', name: 'Centro', status: 'Estável', cases: 120, trend: 'down' },
    { id: '2', name: 'Zona Sul', status: 'Crítico', cases: 450, trend: 'up' },
    { id: '3', name: 'Zona Norte', status: 'Alerta', cases: 280, trend: 'stable' },
  ];

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-slate/50 border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center">
            <Hospital size={24} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-brand-text">Gestão Pública</h2>
            <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest">Prefeitura Ativa</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-green/10 text-brand-green rounded-xl font-medium transition-all">
            <MapPin size={20} />
            <span>Regiões</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-brand-text/60 hover:bg-white/5 rounded-xl font-medium transition-all">
            <BarChart3 size={20} />
            <span>Estatísticas</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-brand-text/60 hover:bg-white/5 rounded-xl font-medium transition-all">
            <Users size={20} />
            <span>Atendimentos</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-brand-text/60 hover:bg-white/5 rounded-xl font-medium transition-all">
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
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-text">Painel da Prefeitura</h1>
            <p className="text-brand-text/40">Monitore a saúde emocional da população.</p>
          </div>
          <button className="bg-brand-green text-brand-dark font-bold px-6 py-3 rounded-xl shadow-lg shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            <Activity size={20} />
            Gerenciar CAPS
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text/40">Total de Atendimentos</span>
              <Users className="text-brand-green" size={20} />
            </div>
            <p className="text-4xl font-bold text-brand-text">12.450</p>
            <p className="text-xs text-brand-green">+5% este mês</p>
          </div>
          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text/40">Regiões Críticas</span>
              <AlertTriangle className="text-brand-red" size={20} />
            </div>
            <p className="text-4xl font-bold text-brand-text">2</p>
            <p className="text-xs text-brand-red">Requer intervenção imediata</p>
          </div>
          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text/40">Índice de Resposta</span>
              <TrendingUp className="text-brand-indigo" size={20} />
            </div>
            <p className="text-4xl font-bold text-brand-text">92%</p>
            <p className="text-xs text-brand-green">Meta de 90% atingida</p>
          </div>
        </div>

        {/* Regions List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-brand-text">Monitoramento por Região</h3>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-brand-slate/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Região</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Casos Ativos</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40 text-right">Tendência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {regions.map((region) => (
                  <tr key={region.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 font-medium text-brand-text">{region.name}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        region.status === 'Estável' ? "bg-brand-green/20 text-brand-green" :
                        region.status === 'Crítico' ? "bg-brand-red/20 text-brand-red" :
                        "bg-brand-indigo/20 text-brand-indigo"
                      )}>
                        {region.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-text/60">{region.cases}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "font-bold text-sm",
                        region.trend === 'up' ? "text-brand-red" :
                        region.trend === 'down' ? "text-brand-green" :
                        "text-brand-text/40"
                      )}>
                        {region.trend === 'up' ? '↑ Aumento' : region.trend === 'down' ? '↓ Redução' : '→ Estável'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
