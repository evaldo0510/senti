import React from "react";
import { motion } from "motion/react";
import { Users, Activity, Clock, LogOut, Settings, Home, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { logout } from "../services/firebase";

const data = [
  { name: 'Seg', atendimentos: 12 },
  { name: 'Ter', atendimentos: 19 },
  { name: 'Qua', atendimentos: 15 },
  { name: 'Qui', atendimentos: 22 },
  { name: 'Sex', atendimentos: 28 },
  { name: 'Sáb', atendimentos: 35 },
  { name: 'Dom', atendimentos: 42 },
];

export default function Prefeitura() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-medium text-emerald-400 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            IARA Admin
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-emerald-900/20 text-emerald-400 rounded-xl">
            <Home className="w-5 h-5" />
            Visão Geral
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
            <Users className="w-5 h-5" />
            Profissionais
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
            <BarChart2 className="w-5 h-5" />
            Relatórios
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            Configurações
          </a>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-light tracking-tight text-slate-200">Dashboard</h2>
              <p className="text-slate-400 mt-1">Visão geral dos atendimentos e regulação emocional.</p>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-slate-400 font-medium">Atendimentos Hoje</h3>
                <div className="p-2 bg-emerald-900/30 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-slate-100 mt-4">142</p>
              <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                <span className="font-medium">+12%</span> em relação a ontem
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-slate-400 font-medium">Tempo Médio (IARA)</h3>
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-slate-100 mt-4">4m 12s</p>
              <p className="text-sm text-slate-500 mt-2">Tempo de regulação</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-slate-400 font-medium">Encaminhamentos</h3>
                <div className="p-2 bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-slate-100 mt-4">38</p>
              <p className="text-sm text-slate-500 mt-2">Para profissionais humanos</p>
            </motion.div>
          </div>

          {/* Chart Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
          >
            <h3 className="text-lg font-medium text-slate-200 mb-6">Volume de Atendimentos (Últimos 7 dias)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" tick={{fill: '#ffffff50'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" tick={{fill: '#ffffff50'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="atendimentos" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAtendimentos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Looker Studio Dashboard Embed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex flex-col h-[600px]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-slate-200">Dashboard Detalhado (Looker Studio)</h3>
              <a 
                href="https://lookerstudio.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Abrir no Looker Studio
              </a>
            </div>
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-white/5 bg-slate-950 flex items-center justify-center relative">
              {/* Substitua o src abaixo pelo link de incorporação (embed) do seu relatório do Looker Studio */}
              {/* <iframe 
                width="100%" 
                height="100%" 
                src="https://lookerstudio.google.com/embed/reporting/00000000-0000-0000-0000-000000000000/page/1M" 
                frameBorder="0" 
                style={{ border: 0 }} 
                allowFullScreen 
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                title="Dashboard Looker Studio"
              /> */}
              <div className="text-center p-8 max-w-2xl">
                <BarChart2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-slate-200 mb-4">Como configurar o Looker Studio</h4>
                <div className="text-left text-slate-400 space-y-4 text-sm">
                  <p>1. Crie uma planilha no Google Sheets com as colunas: Data, Usuario, Humor, Risco, Atendimento, Tipo.</p>
                  <p>2. Acesse <a href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">lookerstudio.google.com</a> e crie um novo relatório.</p>
                  <p>3. Conecte sua planilha do Google Sheets como fonte de dados.</p>
                  <p>4. Crie seus gráficos (Scorecards, Gráficos de Linha, Pizza, etc).</p>
                  <p>5. No Looker Studio, vá em Arquivo {'>'} Incorporar relatório e copie o link gerado.</p>
                  <p>6. Substitua o código deste componente no arquivo <code>src/pages/Prefeitura.tsx</code> pelo iframe gerado.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}