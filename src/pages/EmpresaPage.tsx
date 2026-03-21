import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Plus, 
  LogOut, 
  TrendingUp,
  Activity,
  Heart,
  FileText,
  Search
} from 'lucide-react';
import { logout } from '../services/authService';
import { cn } from '../lib/utils';

export const EmpresaPage: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const employees = [
    { id: '1', name: 'Ana Silva', department: 'TI', status: 'Estável', lastCheck: 'Hoje' },
    { id: '2', name: 'João Santos', department: 'Vendas', status: 'Alerta', lastCheck: 'Ontem' },
    { id: '3', name: 'Maria Oliveira', department: 'RH', status: 'Ótimo', lastCheck: '2 dias atrás' },
  ];

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-slate/50 border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-indigo/20 text-brand-indigo flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-brand-text">RH Corporativo</h2>
            <p className="text-[10px] text-brand-indigo font-bold uppercase tracking-widest">Empresa Ativa</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-indigo/10 text-brand-indigo rounded-xl font-medium transition-all">
            <Users size={20} />
            <span>Colaboradores</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-brand-text/60 hover:bg-white/5 rounded-xl font-medium transition-all">
            <BarChart3 size={20} />
            <span>Relatórios</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-brand-text/60 hover:bg-white/5 rounded-xl font-medium transition-all">
            <Activity size={20} />
            <span>Saúde Mental</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-brand-text/60 hover:bg-white/5 rounded-xl font-medium transition-all">
            <FileText size={20} />
            <span>Documentos</span>
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
            <h1 className="text-3xl font-bold text-brand-text">Painel da Empresa</h1>
            <p className="text-brand-text/40">Monitore o bem-estar emocional da sua equipe.</p>
          </div>
          <button className="bg-brand-indigo text-brand-text font-bold px-6 py-3 rounded-xl shadow-lg shadow-brand-indigo/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            <Plus size={20} />
            Adicionar Colaborador
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text/40">Total de Colaboradores</span>
              <Users className="text-brand-indigo" size={20} />
            </div>
            <p className="text-4xl font-bold text-brand-text">150</p>
            <p className="text-xs text-brand-green">98% de engajamento</p>
          </div>
          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text/40">Índice de Bem-estar</span>
              <Heart className="text-brand-red" size={20} />
            </div>
            <p className="text-4xl font-bold text-brand-text">8.4</p>
            <p className="text-xs text-brand-green">+0.2 este mês</p>
          </div>
          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text/40">Alertas Ativos</span>
              <Activity className="text-brand-red" size={20} />
            </div>
            <p className="text-4xl font-bold text-brand-text">3</p>
            <p className="text-xs text-brand-red">Requer atenção do RH</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 bg-brand-slate/50 p-4 rounded-xl border border-white/5">
          <Search className="text-brand-text/20" size={20} />
          <input 
            type="text" 
            placeholder="Buscar colaborador ou departamento..."
            className="bg-transparent border-none outline-none text-brand-text flex-1"
          />
        </div>

        {/* Employees List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-brand-text">Colaboradores Cadastrados</h3>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-brand-slate/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Colaborador</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Departamento</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40">Status Emocional</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-text/40 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 font-medium text-brand-text">{employee.name}</td>
                    <td className="px-6 py-4 text-brand-text/60">{employee.department}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        employee.status === 'Ótimo' ? "bg-brand-green/20 text-brand-green" :
                        employee.status === 'Estável' ? "bg-brand-indigo/20 text-brand-indigo" :
                        "bg-brand-red/20 text-brand-red"
                      )}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-brand-indigo font-bold text-sm hover:underline">
                        Ver Relatório
                      </button>
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
