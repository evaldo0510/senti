import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Users, Calendar, Clock, LogOut, Activity } from "lucide-react";
import { logout } from "../services/firebase";

export default function Terapeuta() {
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
            <Activity className="w-6 h-6" />
            IARA Terapeuta
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-emerald-900/20 text-emerald-400 rounded-xl">
            <Users className="w-5 h-5" />
            Pacientes
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
            <Calendar className="w-5 h-5" />
            Agenda
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
            <Clock className="w-5 h-5" />
            Histórico
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
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-light tracking-tight text-slate-200">Painel do Terapeuta</h2>
              <p className="text-slate-400 mt-1">Gerencie seus pacientes e sessões.</p>
            </div>
            <button onClick={handleLogout} className="md:hidden p-2 text-slate-400 hover:text-red-400 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-200">Pacientes Aguardando</h3>
                <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full text-sm font-medium">2 online</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 font-medium">M</div>
                    <div>
                      <p className="font-medium text-slate-200">Maria Silva</p>
                      <p className="text-sm text-slate-400">Ansiedade alta</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/atendimento")} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
                    Iniciar
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center text-blue-400 font-medium">J</div>
                    <div>
                      <p className="font-medium text-slate-200">João Pedro</p>
                      <p className="text-sm text-slate-400">Sessão de retorno</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/atendimento")} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
                    Iniciar
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-200">Agenda de Hoje</h3>
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <span className="text-xs font-medium">10h</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-slate-950 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-slate-200">Ana Clara</div>
                      <div className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">Confirmado</div>
                    </div>
                    <div className="text-sm text-slate-400">Terapia Cognitivo-Comportamental</div>
                  </div>
                </div>
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <span className="text-xs font-medium">14h</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-slate-950 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-slate-200">Carlos Eduardo</div>
                      <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">Pendente</div>
                    </div>
                    <div className="text-sm text-slate-400">Primeira Sessão</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
