import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  LogOut, 
  PlusCircle, 
  FileText, 
  ArrowLeft, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Flag,
  Search,
  Filter
} from "lucide-react";
import { logout } from "../services/firebase";
import { useAuth } from "../components/AuthProvider";

interface ReportedContent {
  id: string;
  autor: string;
  email: string;
  tipoConteudo: "chat" | "diario" | "comunidade";
  conteudo: string;
  motivoDenuncia: string;
  timestamp: string;
  status: "pendente" | "aprovado" | "rejeitado";
}

const INITIAL_REPORTS: ReportedContent[] = [
  {
    id: "REP-4091",
    autor: "Carlos M.",
    email: "carlos.moraes@gmail.com",
    tipoConteudo: "chat",
    conteudo: "Mensagem contendo palavras de desespero acentuado e recusa de ajuda profissional na interação de ontem às 22:15.",
    motivoDenuncia: "Alerta de Crise Grave / Gatilho Auto-lesão",
    timestamp: "Hoje, 10:45",
    status: "pendente"
  },
  {
    id: "REP-3082",
    autor: "Anônimo",
    email: "anonimo48@senti.app",
    tipoConteudo: "comunidade",
    conteudo: "Discussão acalorada sobre medicamentos sem prescrição clínica no canal de apoio mútuo.",
    motivoDenuncia: "Automedicação / Conteúdo Impróprio",
    timestamp: "Hoje, 09:12",
    status: "pendente"
  },
  {
    id: "REP-1024",
    autor: "Sandra S.",
    email: "sandra.s@uol.com.br",
    tipoConteudo: "diario",
    conteudo: "Desabafo sobre isolamento social severo e ideação de fuga.",
    motivoDenuncia: "Alerta Social / Encaminhamento Imediato",
    timestamp: "Ontem, 21:04",
    status: "aprovado"
  }
];

export default function Moderador() {
  const navigate = useNavigate();
  const { profile, loading, isAuthReady } = useAuth();
  const [reports, setReports] = useState<ReportedContent[]>(INITIAL_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "pendente" | "aprovado" | "rejeitado">("todos");
  const [actionToast, setActionToast] = useState<{ show: boolean; msg: string; type: "success" | "info" }>({
    show: false,
    msg: "",
    type: "success"
  });

  React.useEffect(() => {
    if (isAuthReady && !loading) {
      if (!profile || (profile.tipo !== 'moderador' && profile.tipo !== 'admin' && profile.tipo !== 'super_admin')) {
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

  const handleReportAction = (id: string, action: "aprovar" | "rejeitar") => {
    setReports(prev => prev.map(rep => {
      if (rep.id === id) {
        return { ...rep, status: action === "aprovar" ? "aprovado" : "rejeitado" };
      }
      return rep;
    }));

    const actionText = action === "aprovar" ? "Denúncia Aprovada - Notificação enviada à equipe médica!" : "Denúncia Rejeitada e arquivada.";
    setActionToast({
      show: true,
      msg: actionText,
      type: action === "aprovar" ? "info" : "success"
    });

    setTimeout(() => {
      setActionToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const filteredReports = reports.filter(rep => {
    const matchesSearch = rep.conteudo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rep.autor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rep.motivoDenuncia.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "todos" ? true : rep.status === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col hidden md:flex shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-medium text-emerald-400 flex items-center gap-2 font-serif italic">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Sentí Moderador
          </h1>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mt-1 block">Filtro de Integridade</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="flex items-center gap-3 px-4 py-3 bg-emerald-900/20 text-emerald-400 rounded-xl w-full text-left font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            Moderação de Conteúdo
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors w-full text-left font-bold text-xs">
            <MessageSquare className="w-4 h-4" />
            Audit de Mensagens
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors w-full text-left font-bold text-xs">
            <Users className="w-4 h-4" />
            Avisos de Segurança
          </button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-colors font-bold text-xs">
            <LogOut className="w-4.5 h-4.5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Voltar"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-3xl font-light tracking-tight text-slate-200 font-serif italic">Painel de Moderador</h2>
                <p className="text-slate-400 text-sm mt-1">Inspeção ética de conteúdo gerado, triagem de riscos e conformidade terapêutica.</p>
              </div>
            </div>
            <button onClick={handleLogout} className="md:hidden p-2 text-slate-400 hover:text-red-400 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </button>
          </header>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Denúncias Pendentes</h3>
                <div className="p-2 bg-amber-950/40 rounded-lg border border-amber-500/10">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <p className="text-4xl font-light text-slate-100 mt-4">
                {reports.filter(r => r.status === "pendente").length}
              </p>
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                Aguardando revisão prioritária
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tempo de Resposta Médio</h3>
                <div className="p-2 bg-blue-950/40 rounded-lg border border-blue-500/10">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-slate-100 mt-4">8m</p>
              <p className="text-xs text-slate-500 mt-2">Dentro dos limites recomendados</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Resolvidos Hoje</h3>
                <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-500/10">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-slate-100 mt-4">12</p>
              <p className="text-xs text-emerald-400 mt-2">100% de precisão de IA</p>
            </motion.div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Pesquisar por autor, denúncia ou conteúdo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setFilterType("todos")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterType === "todos" 
                    ? "bg-emerald-600 text-slate-950 font-black" 
                    : "bg-slate-950 text-slate-400 border border-white/5 hover:bg-slate-900"
                }`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterType("pendente")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterType === "pendente" 
                    ? "bg-amber-600 text-slate-950 font-black" 
                    : "bg-slate-950 text-slate-400 border border-white/5 hover:bg-slate-900"
                }`}
              >
                Pendentes
              </button>
              <button 
                onClick={() => setFilterType("aprovado")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterType === "aprovado" 
                    ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/20" 
                    : "bg-slate-950 text-slate-400 border border-white/5 hover:bg-slate-900"
                }`}
              >
                Aprovados
              </button>
            </div>
          </div>

          {/* Reports Stream */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 rounded-2xl border border-white/5 space-y-3">
                <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-slate-300 font-serif font-bold">Tudo limpo por aqui!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Nenhum registro pendente de revisão se enquadra na pesquisa correspondente.</p>
              </div>
            ) : (
              filteredReports.map((rep) => (
                <motion.div 
                  key={rep.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-slate-950 px-2.5 py-1 rounded-md border border-white/5">
                        {rep.id}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Autor: <strong className="text-slate-200">{rep.autor}</strong> ({rep.email})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-medium">{rep.timestamp}</span>
                      <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                        rep.status === "pendente" 
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                          : rep.status === "aprovado" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                      <Flag className="w-4 h-4 shrink-0" />
                      <span>Motivo: {rep.motivoDenuncia}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5 font-serif italic">
                      "{rep.conteudo}"
                    </p>
                  </div>

                  {rep.status === "pendente" && (
                    <div className="flex justify-end gap-2.5 pt-2">
                      <button 
                        onClick={() => handleReportAction(rep.id, "rejeitar")}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-white/5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-colors min-h-[40px] flex items-center justify-center cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 mr-1.5 text-red-400" /> Rejeitar Denúncia
                      </button>
                      <button 
                        onClick={() => handleReportAction(rep.id, "aprovar")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-555 text-slate-950 rounded-xl text-[10.5px] font-black uppercase tracking-widest transition-all min-h-[40px] flex items-center justify-center cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" /> Confirmar & Encaminhar
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Action toast feedback */}
      <AnimatePresence>
        {actionToast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 ${
              actionToast.type === "info" ? "bg-blue-600 text-white" : "bg-emerald-600 text-slate-950"
            } px-6 py-4 rounded-2xl font-bold text-xs shadow-xl flex items-center gap-3 border border-white/10 z-55 uppercase tracking-wider`}
          >
            <ShieldCheck className="w-5 h-5 shrink-0" /> {actionToast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
