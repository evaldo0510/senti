import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Activity, 
  Clock, 
  LogOut, 
  Settings, 
  Home, 
  BarChart2, 
  ArrowLeft, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  Lock, 
  Search, 
  CheckCircle, 
  PlusCircle, 
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Check,
  Globe,
  Database
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { logout } from "../services/firebase";
import { useAuth } from "../components/AuthProvider";
import { cn } from "../lib/utils";

// Mock database tables for rich desktop admin interaction
const initialTherapists = [
  { id: "1", nome: "Dra. Ana Silva", crp: "CRP 06/145289", especialidade: "Terapia Cognitivo-Comportamental", status: "Online", rating: 5.0, atendimentos: 124 },
  { id: "2", nome: "Dr. Gabriel Alencar", crp: "CRP 06/198744", especialidade: "Gestalt-terapia & Ansiedade", status: "Online", rating: 4.9, atendimentos: 98 },
  { id: "3", nome: "Dra. Letícia Costa", crp: "CRP 12/221045", especialidade: "Psicologia Infanto-Juvenil", status: "Offline", rating: 4.8, atendimentos: 156 },
  { id: "4", nome: "Dr. Marcos Rocha", crp: "CRP 08/99852", especialidade: "Neuropsicologia Clinica", status: "Online", rating: 5.0, atendimentos: 74 },
  { id: "5", nome: "Dra. Juliana Mendes", crp: "CRP 06/184112", especialidade: "Terapia de Casal e Família", status: "Offline", rating: 4.7, atendimentos: 210 }
];

const initialSecurityLogs = [
  { id: "LOG-1021", horaria: "14:18:22", acao: "Tentativa de login brute-force bloqueada", ip: "185.220.101.5", status: "Crítico", icone: AlertTriangle },
  { id: "LOG-1022", horaria: "14:19:10", acao: "Varredura automatizada com AES-256", ip: "Sistema Interno", status: "Normal", icone: ShieldCheck },
  { id: "LOG-1023", horaria: "14:20:05", acao: "Sessão duplicada expirada por segurança", ip: "201.85.12.99", status: "Suspeito", icone: Terminal },
  { id: "LOG-1024", horaria: "14:20:44", acao: "Backups redundantes sincronizados no Cloud Storage", ip: "Firestore Sync", status: "Normal", icone: Database },
  { id: "LOG-1025", horaria: "14:21:15", acao: "Acesso administrativo autorizado - Admin Bypass", ip: "127.0.0.1", status: "Normal", icone: ShieldCheck }
];

const dashboardStats = [
  { name: 'Seg', atendimentos: 124, urgencias: 14 },
  { name: 'Ter', atendimentos: 148, urgencias: 19 },
  { name: 'Qua', atendimentos: 135, urgencias: 11 },
  { name: 'Qui', atendimentos: 162, urgencias: 24 },
  { name: 'Sex', atendimentos: 188, urgencias: 28 },
  { name: 'Sáb', atendimentos: 215, urgencias: 35 },
  { name: 'Dom', atendimentos: 242, urgencias: 42 },
];

export default function Prefeitura() {
  const navigate = useNavigate();
  const { profile, loading, isAuthReady } = useAuth();
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"overview" | "therapists" | "security" | "pills">("overview");

  // Interaction local states
  const [therapists, setTherapists] = useState(initialTherapists);
  const [securityLogs, setSecurityLogs] = useState(initialSecurityLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  // Pill of the day state management (CMS)
  const [pillPhrase, setPillPhrase] = useState("Seja a mudança que você deseja ver em sua mente. O hoje é uma tela limpa.");
  const [pillAuthor, setPillAuthor] = useState("Sêneca Moderno");
  const [pillSuccessToast, setPillSuccessToast] = useState(false);

  // New Therapist form state
  const [showAddTherapistModal, setShowAddTherapistModal] = useState(false);
  const [newTherapistName, setNewTherapistName] = useState("");
  const [newTherapistCrp, setNewTherapistCrp] = useState("");
  const [newTherapistSpec, setNewTherapistSpec] = useState("");

  useEffect(() => {
    if (isAuthReady && !loading) {
      if (!profile || (profile.tipo !== 'prefeitura' && profile.tipo !== 'admin')) {
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
    navigate("/");
  };

  // Add new physician simulation
  const handleAddTherapist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTherapistName || !newTherapistCrp || !newTherapistSpec) return;

    const added = {
      id: String(therapists.length + 1),
      nome: newTherapistName,
      crp: newTherapistCrp,
      especialidade: newTherapistSpec,
      status: "Online",
      rating: 5.0,
      atendimentos: 0
    };

    setTherapists([added, ...therapists]);
    setNewTherapistName("");
    setNewTherapistCrp("");
    setNewTherapistSpec("");
    setShowAddTherapistModal(false);
  };

  // Toggle therapist status online/offline
  const toggleTherapistStatus = (id: string) => {
    setTherapists(
      therapists.map(t => t.id === id ? { ...t, status: t.status === "Online" ? "Offline" : "Online" } : t)
    );
  };

  // Security defensive scan simulator
  const runSecurityDefenseScan = () => {
    setIsScanning(true);
    setScanMessage("Iniciando auditoria preventiva dos certificados TLS/IP Sec...");
    
    setTimeout(() => {
      setScanMessage("Verificando integridade das coleções do Firestore com criptografia AES-256...");
    }, 1200);

    setTimeout(() => {
      setScanMessage("Analisando tentativas recentes de brute-force oriundas de firewalls externos...");
    }, 2400);

    setTimeout(() => {
      // Add secure log to head of list
      const secureLog = {
        id: `LOG-${Math.floor(Math.random() * 9000) + 1000}`,
        horaria: new Date().toLocaleTimeString(),
        acao: "Varredura manual concluída - 0 vulnerabilidades identificadas",
        ip: "Admin Exec Local",
        status: "Normal",
        icone: ShieldCheck
      };
      setSecurityLogs([secureLog, ...securityLogs]);
      setIsScanning(false);
      setScanMessage("");
    }, 3600);
  };

  // Save Pill of the day simulator
  const handleSavePill = (e: React.FormEvent) => {
    e.preventDefault();
    setPillSuccessToast(true);
    setTimeout(() => setPillSuccessToast(false), 3000);
  };

  // Filter therapists by query
  const filteredTherapists = therapists.filter(t => 
    t.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.especialidade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950" id="desktop-admin-dashboard">
      
      {/* Sidebar - Desktop Only */}
      <aside className="w-72 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 hidden lg:flex">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-100 tracking-tight font-serif italic">Sentí</h1>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest leading-none block">Painel Administrativo</span>
            </div>
          </div>
        </div>

        {/* Navigation Options */}
        <nav className="flex-1 px-4 py-8 space-y-1.5">
          <button 
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 w-full text-sm font-bold rounded-xl transition-all cursor-pointer text-left",
              activeTab === "overview" 
                ? "bg-emerald-950/40 text-emerald-400 border-l-4 border-emerald-500 pl-3" 
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Home className="w-4.5 h-4.5" />
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab("therapists")}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 w-full text-sm font-bold rounded-xl transition-all cursor-pointer text-left",
              activeTab === "therapists" 
                ? "bg-emerald-950/40 text-emerald-400 border-l-4 border-emerald-500 pl-3" 
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Users className="w-4.5 h-4.5" />
            Profissionais Credenciados
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 w-full text-sm font-bold rounded-xl transition-all cursor-pointer text-left",
              activeTab === "security" 
                ? "bg-emerald-950/40 text-emerald-400 border-l-4 border-emerald-500 pl-3" 
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <ShieldCheck className="w-4.5 h-4.5" />
            Logs de Segurança 
          </button>
          <button 
            onClick={() => setActiveTab("pills")}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 w-full text-sm font-bold rounded-xl transition-all cursor-pointer text-left",
              activeTab === "pills" 
                ? "bg-emerald-950/40 text-emerald-400 border-l-4 border-emerald-500 pl-3" 
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <BookOpen className="w-4.5 h-4.5" />
            Pílulas do Dia (CMS)
          </button>
        </nav>

        {/* Logged profile metadata */}
        <div className="p-4 border-t border-white/5 bg-slate-950/20">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-white/5 font-extrabold text-emerald-400 uppercase text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-100 truncate">Administração Central</p>
              <p className="text-[10px] text-slate-400 truncate">mentefelizterapias@gmail</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full text-xs font-bold text-slate-450 hover:text-rose-450 hover:bg-rose-950/10 rounded-xl transition-colors cursor-pointer mt-2"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header row */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-emerald-400 bg-emerald-550/10 px-3 py-1 rounded-full border border-emerald-500/10 self-start">
                <Globe className="w-3.5 h-3.5" /> SINALIZADOR OPERACIONAL CLOUD RUN
              </div>
              <h2 className="text-3xl font-black font-serif italic text-slate-200 tracking-tight">
                {activeTab === "overview" && "Visão Analítica"}
                {activeTab === "therapists" && "Gestão Profissional"}
                {activeTab === "security" && "Logs de Auditoria Interna"}
                {activeTab === "pills" && "Gerenciador do Conhecimento"}
              </h2>
              <p className="text-sm text-slate-400">
                {activeTab === "overview" && "Mapeamento em tempo real de crises psicológicas e consultas clínicas."}
                {activeTab === "therapists" && "Acesse as licenças de psicólogos, gerencie credenciamento e disponibilidade."}
                {activeTab === "security" && "Proteção ativa e registro de incidentes criptografados."}
                {activeTab === "pills" && "Escreva ou modifique as pílulas diárias de sabedoria enviadas via PWA."}
              </p>
            </div>

            {/* Quick action buttons per tab */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate("/home")}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-slate-100 rounded-xl border border-white/5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Visualizar App Mobile
              </button>
              {activeTab === "therapists" && (
                <button 
                  onClick={() => setShowAddTherapistModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-555 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                >
                  <PlusCircle className="w-4 h-4" /> Cadastrar Psicólogo
                </button>
              )}
            </div>
          </header>

          {/* -------------------- TAB 1: VISÃO GERAL -------------------- */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Stats highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-slate-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-emerald-550/5 font-sans font-black text-9xl pointer-events-none">142</div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Triagens de Hoje</h3>
                    <div className="p-2.5 bg-emerald-950/50 border border-emerald-500/10 rounded-xl">
                      <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-5xl font-black text-slate-100 tracking-tight mt-5">142</p>
                  <p className="text-xs text-emerald-400 mt-3 flex items-center gap-1">
                    <span className="font-bold">+14%</span> em relação ao penúltimo ciclo
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-slate-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-blue-550/5 font-sans font-black text-9xl pointer-events-none">4m</div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tempo de Respiração</h3>
                    <div className="p-2.5 bg-blue-900/20 border border-blue-500/10 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-5xl font-black text-slate-100 tracking-tight mt-5">4m 12s</p>
                  <p className="text-xs text-slate-450 mt-3">Tempo médio gasto em regulação quadrática</p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-slate-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-rose-550/5 font-sans font-black text-9xl pointer-events-none">38</div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Encaminhados Críticos</h3>
                    <div className="p-2.5 bg-rose-900/20 border border-rose-500/10 rounded-xl">
                      <Users className="w-5 h-5 text-rose-455" />
                    </div>
                  </div>
                  <p className="text-5xl font-black text-slate-100 tracking-tight mt-5">38</p>
                  <p className="text-xs text-rose-450 mt-3 flex items-center gap-1 font-bold">
                    ⚠️ Atendido em prontidão imediata (0 em fila)
                  </p>
                </motion.div>
              </div>

              {/* Data Recharts Area Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main analytical graph (Recharts) */}
                <div className="lg:col-span-2 bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-base font-bold font-serif italic text-slate-200">Cronograma de Atendimentos Semanal</h3>
                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-lg border border-white/5 text-[11px] font-bold text-slate-450">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Total: 1,070 sessões
                    </div>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorUrgencias" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff08', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" name="Consultas Comuns" dataKey="atendimentos" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAtendimentos)" />
                        <Area type="monotone" name="Casos de Urgência" dataKey="urgencias" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorUrgencias)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Side bento graph for emotional distribution */}
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col justify-between space-y-6">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold font-serif italic text-slate-200">Status Emocional dos Usuários</h3>
                    <p className="text-xs text-slate-500">Categorização recente efetuada pela IARA artificial.</p>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "Ansioso", quant: 45, fill: "#3b82f6" },
                        { name: "Calmo", quant: 32, fill: "#10b981" },
                        { name: "Estressado", quant: 58, fill: "#ef4444" },
                        { name: "Depressivo", quant: 18, fill: "#8b5cf6" }
                      ]}>
                        <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff08', borderRadius: '12px' }} />
                        <Bar dataKey="quant" radius={[8, 8, 0, 0]}>
                          <Cell fill="#3b82f6" />
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                          <Cell fill="#8b5cf6" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider pt-2 border-t border-white/5 text-slate-450 font-bold">
                    <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-550" /> 45% Instabilidade</div>
                    <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-550" /> 32% Regulação</div>
                    <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-550" /> 58% Alerta Crítico</div>
                    <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-550" /> 18% Melancolia</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- TAB 2: GESTÃO DE TERAPEUTAS -------------------- */}
          {activeTab === "therapists" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Search filter row */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                  <input 
                    type="text" 
                    placeholder="Filtrar por nome do terapeuta ou abordagem..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-550 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div className="text-xs text-slate-450 font-semibold bg-slate-900 px-4 py-2.5 rounded-xl border border-white/5">
                  Mostrando <strong className="text-slate-100">{filteredTherapists.length}</strong> de {therapists.length} profissionais
                </div>
              </div>

              {/* Doctors Registry Table */}
              <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <th className="p-5">Nome do Profissional</th>
                      <th className="p-5">Identificação (CRP)</th>
                      <th className="p-5">Área de Abordagem</th>
                      <th className="p-5">Avaliação Média</th>
                      <th className="p-5">Atendimentos</th>
                      <th className="p-5">Status Atual</th>
                      <th className="p-5 text-right">Ação Corretiva</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTherapists.map((doc) => (
                      <tr key={doc.id} className="hover:bg-white/5 transition-colors text-xs text-slate-300">
                        <td className="p-5 font-bold text-slate-100">{doc.nome}</td>
                        <td className="p-5 text-slate-450 font-mono font-medium">{doc.crp}</td>
                        <td className="p-5">{doc.especialidade}</td>
                        <td className="p-5">
                          <span className="flex items-center gap-1 font-bold text-amber-450">
                            ⭐ {doc.rating.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-5 text-slate-450 font-semibold">{doc.atendimentos}</td>
                        <td className="p-5">
                          <span className={cn(
                            "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md border",
                            doc.status === "Online" 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : "bg-slate-800 border-slate-700 text-slate-450"
                          )}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button 
                            onClick={() => toggleTherapistStatus(doc.id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-white/5 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95"
                          >
                            Alternar Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -------------------- TAB 3: LOGS DE SEGURANÇA -------------------- */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Defense scan card console */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-450" />
                    <h3 className="text-base font-bold text-slate-100 font-serif italic">Console de Defesa Ativa</h3>
                  </div>
                  <p className="text-xs text-slate-450">Efetue escaneamentos dinâmico preventiva contra vulnerabilidades cibernéticas.</p>
                </div>

                <div className="flex h-12 items-center gap-3">
                  {isScanning && (
                    <div className="text-xs font-bold font-mono text-emerald-400 animate-pulse bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2 max-w-sm">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      {scanMessage}
                    </div>
                  )}
                  <button 
                    onClick={runSecurityDefenseScan}
                    disabled={isScanning}
                    className={cn(
                      "h-full px-5 bg-emerald-600 active:scale-95 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                      isScanning && "bg-slate-800 text-slate-500"
                    )}
                  >
                    🚀 Varredura de Segurança
                  </button>
                </div>
              </div>

              {/* Logs Stream Panel */}
              <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-slate-950/40 border-b border-white/5 flex justify-between items-center header-row-block">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Fluxo em Tempo Real de Atividades Auditáveis</h4>
                  <span className="text-[10px] font-bold text-slate-450">Total: {securityLogs.length} incidentes</span>
                </div>

                <div className="divide-y divide-white/5 text-xs text-slate-350 font-mono">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg border",
                          log.status === "Crítico" 
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                            : log.status === "Suspeito" 
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                              : "bg-slate-850 border-slate-700 text-slate-400"
                        )}>
                          <log.icone className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-100 font-bold">{log.acao}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>Hash Ref: <strong className="text-slate-400">{log.id}</strong></span> • <span>Ip Auditado: {log.ip}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-[11px] text-slate-500 font-bold">{log.horaria}</span>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
                          log.status === "Crítico" 
                            ? "text-rose-455 bg-rose-500/10 border-rose-500/10" 
                            : log.status === "Suspeito" 
                              ? "text-amber-455 bg-amber-500/11 border-amber-500/10" 
                              : "text-slate-400 bg-slate-800 border-slate-700"
                        )}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* -------------------- TAB 4: PÍLULAS DO DIA -------------------- */}
          {activeTab === "pills" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Form Content card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CMS Form editor */}
                <div className="lg:col-span-2 bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-6">
                  <div className="space-y-1 pb-4 border-b border-white/5">
                    <h3 className="text-base font-bold font-serif italic text-slate-200">Editor de Reflexões e Pílulas Diárias</h3>
                    <p className="text-xs text-slate-550">Personalize a frase exibida para todos os pacientes em seu início de jornada.</p>
                  </div>

                  <form onSubmit={handleSavePill} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Frase Espetacular (Reflexão Clínicas)</label>
                      <textarea 
                        rows={4}
                        value={pillPhrase}
                        onChange={(e) => setPillPhrase(e.target.value)}
                        placeholder="Escreva a sabedoria motivacional..."
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Autor / Profissional de Origem</label>
                        <input 
                          type="text" 
                          value={pillAuthor}
                          onChange={(e) => setPillAuthor(e.target.value)}
                          placeholder="Ex: Confúcio, Dr. Carl Jung..."
                          className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Duração Estimada do Exercício</label>
                        <select className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-xs text-slate-350 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold">
                          <option>Ação de 1 minuto</option>
                          <option>Leitura de 2 minutos</option>
                          <option>Acolhimento imediato</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2.5">
                      <button 
                        type="button"
                        onClick={() => {
                          setPillPhrase("Seja a mudança que você deseja ver em sua mente. O hoje é uma tela limpa.");
                          setPillAuthor("Sêneca Moderno");
                        }}
                        className="px-5 py-3.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Resetar Defaults
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-555 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Aplicar de Imediato
                      </button>
                    </div>
                  </form>
                </div>

                {/* Simulated PWA Widget preview */}
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col justify-between space-y-6">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-450">Simulador de Dispositivo</span>
                    <h3 className="text-base font-bold font-serif italic text-slate-200">Widget de Pílulas Sentí</h3>
                    <p className="text-xs text-slate-500">Visualização de alta-fidelidade do cartão recebido nas contas dos pacientes.</p>
                  </div>

                  {/* High quality visual box mock */}
                  <div className="bg-slate-950/50 rounded-2.5rem p-5 border border-white/5 space-y-4 text-left relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 text-emerald-500/5 font-sans font-black text-7xl select-none">
                      P
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-550/15 border border-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 leading-none">Pílula do Dia</h4>
                        <span className="text-[8px] text-slate-500 font-semibold leading-none">Sabedoria Curativa</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 font-serif italic leading-relaxed">
                      "{pillPhrase || "Carregando reflexão..."}"
                    </p>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      — {pillAuthor || "Autor do Sentí"}
                    </div>
                  </div>

                  <div className="h-0.5 bg-white/5 w-full" />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    📌 Ao pressionar o botão de aplicação acima, todos os usuários logados do Sentí receberão um gatilho de reflexão sincronizado instantaneamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Looker Studio instruction block inside Desktop for analytics integration */}
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 shrink-0 text-emerald-550/10 font-bold select-none text-7xl uppercase">
              BI
            </div>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold font-serif italic text-slate-200">Painel Detalhado de Telemetria Analítica (Looker Studio)</h4>
                <p className="text-xs text-slate-450 leading-none">Conector nativo do Google BigQuery / Sheets para auditoria reguladora.</p>
              </div>
            </div>
            <div className="text-[13px] text-slate-400 leading-relaxed max-w-4xl space-y-1.5">
              <p>Mapeie dados agregados de humor e consultas conectando sua planilha diretamente. Para incorporar o widget definitivo neste painel:</p>
              <p className="text-xs text-slate-500 font-medium">1. Ative a incorporação no Looker Studio copiando o frame gerado • 2. Insira o Iframe correspondente em seu terminal de auditoria em conformidade com as diretivas éticas.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Success notification panel */}
      <AnimatePresence>
        {pillSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-emerald-550 text-slate-950 px-6 py-4 rounded-2xl font-bold text-xs shadow-xl flex items-center gap-3 border border-emerald-400/20 z-55 uppercase tracking-wider"
          >
            <CheckCircle className="w-5 h-5" /> Reflexão atualizada com sucesso para todos os PWAs!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Therapist Modal dialog simulator */}
      <AnimatePresence>
        {showAddTherapistModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddTherapistModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-55 cursor-pointer"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-white/5 rounded-3xl p-6 w-full max-w-md z-55 space-y-5 shadow-2xl"
            >
              <h3 className="text-base font-bold font-serif italic text-slate-100 pb-3 border-b border-white/5">Novo Credenciamento Médico</h3>
              <form onSubmit={handleAddTherapist} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome do Profissional</label>
                  <input 
                    type="text" 
                    value={newTherapistName}
                    onChange={(e) => setNewTherapistName(e.target.value)}
                    placeholder="Ex: Dra. Letícia Costa"
                    required
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Código de Credencial CRP</label>
                  <input 
                    type="text" 
                    value={newTherapistCrp}
                    onChange={(e) => setNewTherapistCrp(e.target.value)}
                    placeholder="Ex: CRP 06/142908"
                    required
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400"> abordagem Terapeuta</label>
                  <input 
                    type="text" 
                    value={newTherapistSpec}
                    onChange={(e) => setNewTherapistSpec(e.target.value)}
                    placeholder="Ex: TCC, Ansiedade, Cognitiva"
                    required
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => setShowAddTherapistModal(false)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-white/5 rounded-xl text-xs font-bold text-slate-400"
                  >
                    Mudar de Ideia
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-555 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest"
                  >
                    Credenciar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
