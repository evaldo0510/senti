import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Building2, Users, Activity, LogOut, PlusCircle, FileText, Stethoscope, ArrowLeft } from "lucide-react";
import { logout } from "../services/firebase";
import { useAuth } from "../components/AuthProvider";

export default function Hospital() {
  const navigate = useNavigate();
  const { profile, loading, isAuthReady } = useAuth();

  React.useEffect(() => {
    if (isAuthReady && !loading) {
      if (!profile || (profile.tipo !== 'hospital' && profile.tipo !== 'admin')) {
        navigate("/login");
      }
    }
  }, [profile, loading, isAuthReady, navigate]);

  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
            <Stethoscope className="w-6 h-6" />
            IARA Hospital
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-emerald-900/20 text-emerald-400 rounded-xl">
            <Users className="w-5 h-5" />
            Pacientes Internos
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
            <Activity className="w-5 h-5" />
            Triagem de Emergência
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors">
            <FileText className="w-5 h-5" />
            Prontuários
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
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                title="Voltar"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-3xl font-light tracking-tight text-slate-200">Painel Hospitalar</h2>
                <p className="text-slate-400 mt-1">Gestão de leitos e atendimentos psicológicos.</p>
              </div>
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
                <h3 className="text-slate-400 font-medium">Leitos Ativos</h3>
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-slate-100 mt-4">85</p>
              <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                <span className="font-medium">92%</span> ocupação
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-slate-400 font-medium">Alertas de Risco</h3>
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <Activity className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-slate-100 mt-4">4</p>
              <p className="text-sm text-red-400 mt-2 font-medium">Ação imediata necessária</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-center text-center border-dashed hover:bg-slate-800 transition-colors cursor-pointer group"
            >
              <PlusCircle className="w-10 h-10 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-slate-200">Novo Prontuário</h3>
              <p className="text-sm text-slate-400 mt-1">Iniciar triagem hospitalar</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-slate-200">Monitoramento em Tempo Real</h3>
              <button className="text-sm text-emerald-400 hover:underline">Ver mapa de leitos</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-900/20 rounded-full flex items-center justify-center text-red-400 font-bold">L12</div>
                  <div>
                    <p className="font-medium text-slate-200">Leito 12 - Crise de Ansiedade Aguda</p>
                    <p className="text-sm text-slate-400">Paciente: Ricardo M. - Há 15 min</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">
                  Atender Agora
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-900/20 rounded-full flex items-center justify-center text-blue-400 font-bold">L05</div>
                  <div>
                    <p className="font-medium text-slate-200">Leito 05 - Pós-operatório (Suporte)</p>
                    <p className="text-sm text-slate-400">Paciente: Sandra P. - Há 1 hora</p>
                  </div>
                </div>
                <span className="text-sm text-slate-500">Aguardando Dr. Lucas</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
