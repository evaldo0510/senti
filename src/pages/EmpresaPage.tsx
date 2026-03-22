import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Search,
  ArrowRight,
  Download
} from 'lucide-react';
import { logout } from '../services/authService';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const EmpresaPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'employees' | 'reports' | 'health' | 'docs'>('employees');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const employees = [
    { id: '1', name: 'Ana Silva', department: 'TI', status: 'Estável', lastCheck: 'Hoje' },
    { id: '2', name: 'João Santos', department: 'Vendas', status: 'Alerta', lastCheck: 'Ontem' },
    { id: '3', name: 'Maria Oliveira', department: 'RH', status: 'Ótimo', lastCheck: '2 dias atrás' },
    { id: '4', name: 'Pedro Costa', department: 'Financeiro', status: 'Estável', lastCheck: 'Hoje' },
    { id: '5', name: 'Carla Souza', department: 'Marketing', status: 'Alerta', lastCheck: '3 dias atrás' },
  ];

  const moodData = [
    { name: 'Seg', valor: 7.8 },
    { name: 'Ter', valor: 8.2 },
    { name: 'Qua', valor: 8.0 },
    { name: 'Qui', valor: 8.5 },
    { name: 'Sex', valor: 8.4 },
  ];

  const deptData = [
    { name: 'TI', value: 8.5 },
    { name: 'Vendas', value: 7.2 },
    { name: 'RH', value: 8.8 },
    { name: 'Financeiro', value: 8.1 },
    { name: 'Marketing', value: 7.9 },
  ];

  const COLORS = ['#22C55E', '#6366F1', '#F43F5E', '#EAB308', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-brand-slate/30 backdrop-blur-2xl border-r border-brand-text/5 p-10 flex flex-col gap-12 relative z-20">
        <div className="flex items-center gap-5">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -3 }}
            className="w-16 h-16 rounded-3xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center border-2 border-brand-indigo/20 shadow-xl"
          >
            <Building2 size={32} />
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-brand-text">RH Corporativo</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-indigo animate-pulse" />
              <p className="text-[10px] text-brand-indigo font-bold uppercase tracking-[0.2em]">Empresa Ativa</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {[
            { id: 'employees', icon: Users, label: 'Colaboradores' },
            { id: 'reports', icon: BarChart3, label: 'Relatórios' },
            { id: 'health', icon: Activity, label: 'Saúde Mental' },
            { id: 'docs', icon: FileText, label: 'Documentos' },
          ].map((item) => (
            <motion.button 
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-5 px-6 py-5 rounded-3xl font-bold text-sm transition-all group relative overflow-hidden",
                activeTab === item.id 
                  ? "bg-brand-indigo text-white shadow-2xl shadow-brand-indigo/20" 
                  : "text-brand-text/40 hover:text-brand-text hover:bg-brand-slate/50"
              )}
            >
              <item.icon size={22} className={cn("transition-transform group-hover:scale-110 relative z-10", activeTab === item.id ? "text-white" : "text-brand-text/40")} />
              <span className="relative z-10">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-tab-empresa"
                  className="absolute inset-0 bg-gradient-to-r from-brand-indigo to-brand-indigo/80"
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
          <span>Sair do Painel</span>
        </motion.button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 md:p-16 space-y-12 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
        {/* Background Blobs */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-indigo/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px]" />
        </div>

        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-indigo">Gestão Estratégica de Pessoas</p>
            <h1 className="text-5xl font-serif font-bold text-brand-text">Painel Corporativo</h1>
            <p className="text-brand-text/40 text-lg">Monitore o bem-estar emocional da sua equipe em tempo real.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand-dark text-white font-bold px-10 py-5 rounded-[2rem] shadow-2xl hover:shadow-brand-indigo/20 transition-all flex items-center justify-center gap-4 border border-white/10 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-brand-indigo/20 text-brand-indigo flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <span className="text-lg">Adicionar Colaborador</span>
          </motion.button>
        </header>

        {activeTab === 'employees' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { label: 'Total de Colaboradores', value: '150', trend: '98% de engajamento', icon: Users, color: 'text-brand-indigo', bg: 'bg-brand-indigo/10' },
                { label: 'Índice de Bem-estar', value: '8.4', trend: '+0.2 este mês', icon: Heart, color: 'text-brand-red', bg: 'bg-brand-red/10' },
                { label: 'Alertas Ativos', value: '3', trend: 'Requer atenção do RH', icon: Activity, color: 'text-brand-red', bg: 'bg-brand-red/10' },
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
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest", stat.color === 'text-brand-indigo' ? 'text-brand-indigo' : 'text-brand-red')}>
                      {stat.trend}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-6 bg-brand-slate/40 backdrop-blur-md p-6 rounded-[2rem] border border-brand-text/5 focus-within:border-brand-indigo/30 transition-all shadow-xl group">
              <Search className="text-brand-text/20 group-focus-within:text-brand-indigo transition-colors" size={24} />
              <input 
                type="text" 
                placeholder="Buscar colaborador ou departamento..."
                className="bg-transparent border-none outline-none text-brand-text flex-1 font-bold text-lg placeholder:text-brand-text/20"
              />
            </div>

            {/* Employees List */}
            <div className="space-y-8">
              <h3 className="text-3xl font-serif font-bold text-brand-text px-4">Colaboradores Cadastrados</h3>
              <div className="glass-card rounded-[3.5rem] overflow-hidden border-brand-text/5 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-brand-slate/40 backdrop-blur-md border-b border-brand-text/5">
                      <tr>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Colaborador</th>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Departamento</th>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Status Emocional</th>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-text/5">
                      {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-brand-slate/30 transition-all group">
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-brand-slate/50 flex items-center justify-center text-brand-text/40 font-bold text-xl border border-brand-text/5 shadow-inner">
                                {employee.name.charAt(0)}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-bold text-lg text-brand-text block">{employee.name}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text/30">ID: {employee.id.padStart(8, '0')}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-brand-text/60 font-bold text-base">{employee.department}</td>
                          <td className="px-10 py-8">
                            <span className={cn(
                              "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                              employee.status === 'Ótimo' ? "bg-brand-green/10 text-brand-green border-brand-green/20" :
                              employee.status === 'Estável' ? "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20" :
                              "bg-brand-red/10 text-brand-red border-brand-red/20"
                            )}>
                              {employee.status}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-8 py-3 rounded-2xl bg-brand-slate text-brand-text/60 text-xs font-bold hover:bg-brand-indigo hover:text-white transition-all shadow-md"
                            >
                              Ver Relatório
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="glass-card p-10 rounded-[3rem] space-y-8">
                <h3 className="text-2xl font-serif font-bold text-brand-text">Evolução do Bem-estar</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} domain={[0, 10]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '16px', color: '#fff' }}
                        itemStyle={{ color: '#6366F1' }}
                      />
                      <Line type="monotone" dataKey="valor" stroke="#6366F1" strokeWidth={4} dot={{ r: 6, fill: '#6366F1' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-10 rounded-[3rem] space-y-8">
                <h3 className="text-2xl font-serif font-bold text-brand-text">Média por Departamento</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} domain={[0, 10]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '16px', color: '#fff' }}
                      />
                      <Bar dataKey="value" fill="#22C55E" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[3rem] space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-bold text-brand-text">Distribuição de Status</h3>
                <button className="text-brand-indigo font-bold text-sm flex items-center gap-2 hover:underline">
                  Exportar PDF <Download size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Ótimo', value: 45 },
                          { name: 'Estável', value: 35 },
                          { name: 'Alerta', value: 15 },
                          { name: 'Crítico', value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deptData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Ótimo', value: '45%', color: 'bg-brand-green' },
                    { label: 'Estável', value: '35%', color: 'bg-brand-indigo' },
                    { label: 'Alerta', value: '15%', color: 'bg-brand-red' },
                    { label: 'Crítico', value: '5%', color: 'bg-brand-dark' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-brand-slate/20 rounded-2xl border border-brand-text/5">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", item.color)} />
                        <span className="font-bold text-brand-text">{item.label}</span>
                      </div>
                      <span className="font-bold text-brand-text/60">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'health' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <div className="glass-card p-12 rounded-[4rem] text-center space-y-8 border-brand-indigo/20 shadow-2xl shadow-brand-indigo/10">
              <div className="w-24 h-24 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center mx-auto border-2 border-brand-indigo/20">
                <Heart size={48} className="animate-pulse" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-serif font-bold text-brand-text">Monitor de Saúde Mental</h2>
                <p className="text-brand-text/40 text-lg max-w-2xl mx-auto">
                  Nossa IA analisa padrões anônimos para identificar departamentos que precisam de suporte preventivo.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-brand-slate/30 rounded-[2.5rem] border border-brand-text/5">
                  <p className="text-3xl font-bold text-brand-green">92%</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-text/40 mt-2">Nível de Satisfação</p>
                </div>
                <div className="p-8 bg-brand-slate/30 rounded-[2.5rem] border border-brand-text/5">
                  <p className="text-3xl font-bold text-brand-indigo">12</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-text/40 mt-2">Sessões Realizadas</p>
                </div>
                <div className="p-8 bg-brand-slate/30 rounded-[2.5rem] border border-brand-text/5">
                  <p className="text-3xl font-bold text-brand-red">0</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-text/40 mt-2">Casos Críticos</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-3xl font-serif font-bold text-brand-text px-4">Ações Recomendadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Workshop de Mindfulness', desc: 'Sugerido para o time de Vendas devido ao alto volume de trabalho.', icon: Activity, color: 'text-brand-indigo' },
                  { title: 'Pausa Ativa Coletiva', desc: 'Implementar 10min de respiração guiada para o time de TI.', icon: TrendingUp, color: 'text-brand-green' },
                ].map((action, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="glass-card p-8 rounded-[2.5rem] border-brand-text/5 flex items-start gap-6"
                  >
                    <div className={cn("p-4 rounded-2xl bg-brand-slate/50", action.color)}>
                      <action.icon size={24} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-xl text-brand-text">{action.title}</h4>
                      <p className="text-brand-text/40 text-sm leading-relaxed">{action.desc}</p>
                      <button className="text-brand-indigo font-bold text-xs mt-4 flex items-center gap-2">
                        Agendar Agora <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'docs' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between px-4">
              <h3 className="text-3xl font-serif font-bold text-brand-text">Documentos e Políticas</h3>
              <button className="bg-brand-indigo/10 text-brand-indigo font-bold px-6 py-3 rounded-xl border border-brand-indigo/20 flex items-center gap-2">
                <Plus size={20} /> Upload
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: 'Política de Saúde Mental 2024.pdf', size: '2.4 MB', date: '12/01/2024' },
                { name: 'Guia de Benefícios - Bem-estar.pdf', size: '1.8 MB', date: '05/02/2024' },
                { name: 'Relatório Anual 2023.pdf', size: '5.2 MB', date: '20/12/2023' },
              ].map((doc, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="glass-card p-8 rounded-[2.5rem] border-brand-text/5 space-y-6 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-brand-slate/50 text-brand-text/20 flex items-center justify-center group-hover:text-brand-indigo transition-colors">
                    <FileText size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-brand-text truncate">{doc.name}</p>
                    <p className="text-xs text-brand-text/40">{doc.size} • {doc.date}</p>
                  </div>
                  <button className="w-full py-4 rounded-2xl bg-brand-slate/50 text-brand-text/60 font-bold text-xs hover:bg-brand-indigo hover:text-white transition-all">
                    Download
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
