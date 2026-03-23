import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Building2, Users, Activity, LogOut, PlusCircle, FileText } from "lucide-react";
import { logout } from "../services/firebase";

export default function Empresa() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("tipo");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-medium text-emerald-400 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            IARA RH
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-emerald-900/20 text-emerald-400 rounded-xl">
            <Users className="w-5 h-5" />
            Colaboradores
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
            <Activity className="w-5 h-5" />
            Saúde Emocional
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
            <FileText className="w-5 h-5" />
            Relatórios
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
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-light tracking-tight text-slate-200">Painel RH</h2>
              <p className="text-slate-400 mt-1">Gestão de saúde emocional corporativa.</p>
            </div>
            <button onClick={handleLogout} className="md:hidden p-2 text-slate-400 hover:text-red-400 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-slate-400 font-medium">Colaboradores Ativos</h3>
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-slate-100 mt-4">120</p>
              <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                <span className="font-medium">+5</span> este mês
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-slate-400 font-medium">Indicador Emocional</h3>
                <div className="p-2 bg-emerald-900/30 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-slate-100 mt-4">6.8<span className="text-xl text-slate-500">/10</span></p>
              <p className="text-sm text-slate-500 mt-2">Média geral da empresa</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-center text-center border-dashed hover:bg-slate-800 transition-colors cursor-pointer group"
            >
              <PlusCircle className="w-10 h-10 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-slate-200">Adicionar Funcionário</h3>
              <p className="text-sm text-slate-400 mt-1">Enviar convite de acesso</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-slate-200">Alertas Anonimizados</h3>
              <button className="text-sm text-emerald-400 hover:underline">Ver relatório completo</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-slate-200">Aumento de Ansiedade (Setor de Vendas)</p>
                    <p className="text-sm text-slate-400">Detectado em 15% dos colaboradores do setor nos últimos 7 dias.</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors">
                  Ação Recomendada
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-slate-200">Melhora no Sono Geral</p>
                    <p className="text-sm text-slate-400">Aumento de 20% nos relatos positivos após campanha de bem-estar.</p>
                  </div>
                </div>
                <span className="text-sm text-slate-500">Há 2 dias</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
