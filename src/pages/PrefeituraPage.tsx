import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Search,
  ArrowRight,
  ShieldAlert
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
  AreaChart,
  Area
} from 'recharts';

export const PrefeituraPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'regions' | 'stats' | 'appointments' | 'settings'>('regions');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [regions, setRegions] = useState([
    { id: '1', name: 'Centro', status: 'Estável', cases: 120, trend: 'down', risk: 'Baixo' },
    { id: '2', name: 'Zona Sul', status: 'Crítico', cases: 450, trend: 'up', risk: 'Alto' },
    { id: '3', name: 'Zona Norte', status: 'Alerta', cases: 280, trend: 'stable', risk: 'Médio' },
    { id: '4', name: 'Zona Leste', status: 'Estável', cases: 95, trend: 'down', risk: 'Baixo' },
    { id: '5', name: 'Zona Oeste', status: 'Alerta', cases: 310, trend: 'up', risk: 'Médio' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRegions(prev => prev.map(region => {
        // Randomly update cases and status
        const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
        const newCases = Math.max(0, region.cases + change);
        
        let newStatus = region.status;
        if (newCases > 400) newStatus = 'Crítico';
        else if (newCases > 250) newStatus = 'Alerta';
        else newStatus = 'Estável';

        let newRisk = region.risk;
        if (newCases > 400) newRisk = 'Alto';
        else if (newCases > 250) newRisk = 'Médio';
        else newRisk = 'Baixo';

        return {
          ...region,
          cases: newCases,
          status: newStatus,
          risk: newRisk,
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const statsData = [
    { name: 'Jan', atendimentos: 4000, crises: 400 },
    { name: 'Fev', atendimentos: 3000, crises: 300 },
    { name: 'Mar', atendimentos: 2000, crises: 200 },
    { name: 'Abr', atendimentos: 2780, crises: 190 },
    { name: 'Mai', atendimentos: 1890, crises: 150 },
    { name: 'Jun', atendimentos: 2390, crises: 180 },
  ];

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-brand-slate/30 backdrop-blur-2xl border-r border-white/5 p-10 flex flex-col gap-12 relative z-20">
        <div className="flex items-center gap-5">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="w-16 h-16 rounded-3xl bg-brand-green/10 text-brand-green flex items-center justify-center border-2 border-brand-green/20 shadow-xl"
          >
            <Hospital size={32} />
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-brand-text">Gestão Pública</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <p className="text-[10px] text-brand-green font-bold uppercase tracking-[0.2em]">Prefeitura Ativa</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {[
            { id: 'regions', icon: MapPin, label: 'Regiões' },
            { id: 'stats', icon: BarChart3, label: 'Estatísticas' },
            { id: 'appointments', icon: Users, label: 'Atendimentos' },
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
                  ? "bg-brand-green text-brand-dark shadow-2xl shadow-brand-green/20" 
                  : "text-brand-text/40 hover:text-brand-text hover:bg-white/5"
              )}
            >
              <item.icon size={22} className={cn("transition-transform group-hover:scale-110 relative z-10", activeTab === item.id ? "text-brand-dark" : "text-brand-text/40")} />
              <span className="relative z-10">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-tab-prefeitura"
                  className="absolute inset-0 bg-brand-green"
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
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-indigo/5 rounded-full blur-[120px]" />
        </div>

        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-green">Monitoramento de Saúde Populacional</p>
            <h1 className="text-5xl font-serif font-bold text-brand-text">Painel Municipal</h1>
            <p className="text-brand-text/40 text-lg">Dados estratégicos para políticas públicas de saúde mental.</p>
          </div>
          <button className="bg-brand-green text-brand-dark font-bold px-10 py-5 rounded-[2rem] shadow-2xl shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-4 group">
            <Activity size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="text-lg">Gerenciar CAPS</span>
          </button>
        </header>

        {activeTab === 'regions' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="glass-card p-10 space-y-6 rounded-[3rem] border-brand-text/5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Total de Atendimentos</span>
                  <div className="p-4 rounded-2xl bg-brand-green/10 text-brand-green">
                    <Users size={24} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-5xl font-bold text-brand-text tracking-tight">12.450</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green">+5% este mês</p>
                </div>
              </div>
              <div className="glass-card p-10 space-y-6 rounded-[3rem] border-brand-text/5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Regiões Críticas</span>
                  <div className="p-4 rounded-2xl bg-brand-red/10 text-brand-red">
                    <AlertTriangle size={24} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-5xl font-bold text-brand-text tracking-tight">2</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-red">Requer intervenção</p>
                </div>
              </div>
              <div className="glass-card p-10 space-y-6 rounded-[3rem] border-brand-text/5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Índice de Resposta</span>
                  <div className="p-4 rounded-2xl bg-brand-indigo/10 text-brand-indigo">
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-5xl font-bold text-brand-text tracking-tight">92%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Meta atingida</p>
                </div>
              </div>
            </div>

            {/* Regions List */}
            <div className="space-y-8">
              <h3 className="text-3xl font-serif font-bold text-brand-text px-4">Monitoramento por Região</h3>
              <div className="glass-card rounded-[3.5rem] overflow-hidden border-brand-text/5 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-brand-slate/40 backdrop-blur-md border-b border-brand-text/5">
                      <tr>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Região</th>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Status</th>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Casos Ativos</th>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Risco</th>
                        <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40 text-right">Tendência</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-text/5">
                      {regions.map((region) => (
                        <tr key={region.id} className="hover:bg-brand-slate/30 transition-all group">
                          <td className="px-10 py-8 font-bold text-lg text-brand-text">{region.name}</td>
                          <td className="px-10 py-8">
                            <span className={cn(
                              "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                              region.status === 'Estável' ? "bg-brand-green/10 text-brand-green border-brand-green/20" :
                              region.status === 'Crítico' ? "bg-brand-red/10 text-brand-red border-brand-red/20" :
                              "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20"
                            )}>
                              {region.status}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-brand-text/60 font-bold text-lg">{region.cases}</td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-2">
                              <ShieldAlert size={16} className={cn(
                                region.risk === 'Alto' ? "text-brand-red" :
                                region.risk === 'Médio' ? "text-brand-indigo" :
                                "text-brand-green"
                              )} />
                              <span className="text-sm font-bold text-brand-text/60">{region.risk}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
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
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="glass-card p-10 rounded-[3rem] space-y-8">
              <h3 className="text-2xl font-serif font-bold text-brand-text">Volume de Atendimentos vs Crises</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={statsData}>
                    <defs>
                      <linearGradient id="colorAtend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCrises" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '16px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="atendimentos" stroke="#22C55E" fillOpacity={1} fill="url(#colorAtend)" strokeWidth={3} />
                    <Area type="monotone" dataKey="crises" stroke="#F43F5E" fillOpacity={1} fill="url(#colorCrises)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="glass-card p-10 rounded-[3rem] space-y-6">
                <h4 className="text-xl font-serif font-bold text-brand-text">Principais Demandas</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Ansiedade', value: 45, color: 'bg-brand-green' },
                    { label: 'Depressão', value: 30, color: 'bg-brand-indigo' },
                    { label: 'Burnout', value: 15, color: 'bg-brand-red' },
                    { label: 'Outros', value: 10, color: 'bg-brand-slate' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-brand-text/60">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          className={cn("h-full rounded-full", item.color)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-10 rounded-[3rem] space-y-6">
                <h4 className="text-xl font-serif font-bold text-brand-text">Faixa Etária</h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { age: '12-18', val: 15 },
                      { age: '19-30', val: 40 },
                      { age: '31-50', val: 35 },
                      { age: '50+', val: 10 },
                    ]}>
                      <XAxis dataKey="age" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="val" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'appointments' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between px-4">
              <h3 className="text-3xl font-serif font-bold text-brand-text">Fila de Atendimento Municipal</h3>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-brand-red/10 text-brand-red text-[10px] font-bold uppercase tracking-widest border border-brand-red/20">
                <AlertTriangle size={14} /> 15 casos prioritários
              </div>
            </div>
            <div className="glass-card rounded-[3.5rem] overflow-hidden border-brand-text/5 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-brand-slate/40 backdrop-blur-md border-b border-brand-text/5">
                    <tr>
                      <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Paciente (Iniciais)</th>
                      <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Região</th>
                      <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">Prioridade</th>
                      <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-text/5">
                    {[
                      { initials: 'A.S.M', region: 'Centro', priority: 'Média', time: '2h atrás' },
                      { initials: 'J.P.L', region: 'Zona Sul', priority: 'Alta', time: '15min atrás' },
                      { initials: 'M.C.R', region: 'Zona Norte', priority: 'Baixa', time: '5h atrás' },
                    ].map((item, i) => (
                      <tr key={i} className="hover:bg-brand-slate/30 transition-all group">
                        <td className="px-10 py-8 font-bold text-lg text-brand-text">{item.initials}</td>
                        <td className="px-10 py-8 text-brand-text/60 font-bold">{item.region}</td>
                        <td className="px-10 py-8">
                          <span className={cn(
                            "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                            item.priority === 'Alta' ? "bg-brand-red/10 text-brand-red border-brand-red/20" :
                            item.priority === 'Média' ? "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20" :
                            "bg-brand-green/10 text-brand-green border-brand-green/20"
                          )}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button className="text-brand-green font-bold text-xs hover:underline flex items-center gap-2 ml-auto">
                            Encaminhar para CAPS <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
