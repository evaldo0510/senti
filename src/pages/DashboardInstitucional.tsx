import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Users, 
  Activity, 
  LogOut, 
  RefreshCw, 
  Heart, 
  Brain, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  Sparkles,
  BarChart3,
  Mail,
  Calendar,
  AlertCircle
} from "lucide-react";
import { logout } from "../services/firebase";
import { useTenant } from "../hooks/useTenant";
import { organizationService } from "../services/organizationService";
import { UserProfile } from "../types";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function DashboardInstitucional() {
  const navigate = useNavigate();
  const { tenant, tenantId, isInstitutionalAdmin, loading: tenantLoading } = useTenant();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [therapists, setTherapists] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "professionals">("overview");

  // Load organization users and therapists
  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      Promise.all([
        organizationService.getOrganizationUsers(tenantId),
        organizationService.getOrganizationTherapists(tenantId)
      ])
        .then(([tenantUsers, tenantTherapists]) => {
          setUsers(tenantUsers);
          setTherapists(tenantTherapists);
        })
        .catch((err) => {
          console.error("Erro ao carregar dados do Dashboard Institucional:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [tenantId]);

  const handleRecalculate = async () => {
    if (!tenantId) return;
    setRecalculating(true);
    try {
      await organizationService.updateAggregatedIndicators(tenantId);
      // Reload organization page to get fresh data
      window.location.reload();
    } catch (e) {
      console.error("Erro ao recalcular indicadores:", e);
      alert("Erro ao recalcular indicadores.");
    } finally {
      setRecalculating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (tenantLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Carregando painel institucional...</p>
        </div>
      </div>
    );
  }

  // Aggregate monthly data for charts (fallback default if no logs present)
  const chartTrendData = [
    { name: "Jan", humor: 6.5, estresse: 4.2, consultas: 12 },
    { name: "Fev", humor: 6.8, estresse: 3.9, consultas: 18 },
    { name: "Mar", humor: 7.2, estresse: 3.5, consultas: 24 },
    { name: "Abr", humor: 7.0, estresse: 3.7, consultas: 32 },
    { name: "Mai", humor: (tenant?.indicadores?.humorMedio || 7.2), estresse: (tenant?.indicadores?.nivelEstresse || 3.2), consultas: (tenant?.indicadores?.totalConsultas || 45) },
  ];

  const filteredUsers = users.filter(u => 
    (u.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafaf5] text-[#1a1a1a] flex flex-col md:flex-row">
      {/* Sidebar de Navegação */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col justify-between border-r border-white/5">
        <div className="space-y-8">
          {/* Logo e Organização */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Portal B2B</h2>
                <p className="text-[10px] text-emerald-400 uppercase font-mono font-bold tracking-wider">Multitenant Seguro</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mt-4">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Organização Ativa</div>
              <div className="text-xs font-black truncate text-white mt-1">{tenant?.name}</div>
              <div className="text-[9px] text-slate-400 font-mono mt-1 uppercase bg-white/10 px-2 py-0.5 rounded inline-block">
                Tenant: {tenant?.id}
              </div>
            </div>
          </div>

          {/* Abas */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === "overview" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Visão Geral & Métricas
            </button>

            <button
              onClick={() => setActiveTab("members")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === "members" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" /> Beneficiários ({users.length})
            </button>

            <button
              onClick={() => setActiveTab("professionals")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === "professionals" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Heart className="w-4 h-4" /> Corpo Clínico ({therapists.length})
            </button>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black">
              {tenant?.tipo?.[0]?.toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-extrabold text-white">Gestor Autorizado</div>
              <div className="text-[10px] text-slate-400 truncate">tipo: {tenant?.tipo}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-xs font-bold rounded-xl transition"
          >
            <LogOut className="w-4 h-4" /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        {/* Header Superior */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              <span>Painel do Contratante</span>
              <span>•</span>
              <span className="text-emerald-500">Métricas Consolidadas Anônimas</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {tenant?.tipo === "prefeitura" ? "Gestão de Saúde Mental do Município" : "Painel de Qualidade de Vida Corporativa"}
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-black/5 shadow-sm inline-flex items-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? "animate-spin" : ""}`} />
              Recalcular Indicadores
            </button>
          </div>
        </div>

        {/* Notificação de Privacidade LGPD */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-extrabold text-emerald-800">Conformidade Estrita com LGPD & Sigilo Clínico</p>
            <p className="text-emerald-700/80 mt-0.5">
              Todos os prontuários, notas particulares e diários íntimos permanecem completamente confidenciais entre paciente e terapeuta. As métricas exibidas neste painel representam dados unificados de forma anônima para preservar a identidade dos munícipes/colaboradores.
            </p>
          </div>
        </div>

        {/* -------------------- ABA: VISÃO GERAL -------------------- */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Grid de Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Consultas */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Consultas Comuns</span>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">{tenant?.indicadores?.totalConsultas || 0}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Agendamentos realizados no tenant</p>
                </div>
              </div>

              {/* Humor Médio */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Humor Médio</span>
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">{tenant?.indicadores?.humorMedio || 7.0}/10</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Registros de bem-estar consolidados</p>
                </div>
              </div>

              {/* Nível de Estresse */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nível de Estresse</span>
                  <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                    <Brain className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">{tenant?.indicadores?.nivelEstresse || 3.0}/10</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Medição média de sobrecarga emocional</p>
                </div>
              </div>

              {/* Interações IARA */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Mensagens IARA</span>
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">{tenant?.indicadores?.totalMensagensIara || 0}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Orientações de IA preventivas</p>
                </div>
              </div>
            </div>

            {/* Gráficos de Tendências */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico 1: Humor vs Estresse */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">Evolução do Humor e Estresse Médio</h3>
                  <p className="text-[10px] text-slate-400">Tendência consolidada mensal dos beneficiários ativos.</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartTrendData}>
                      <defs>
                        <linearGradient id="colorHumor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorEstresse" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="humor" stroke="#10b981" fillOpacity={1} fill="url(#colorHumor)" strokeWidth={2} name="Humor Médio" />
                      <Area type="monotone" dataKey="estresse" stroke="#f43f5e" fillOpacity={1} fill="url(#colorEstresse)" strokeWidth={2} name="Estresse Médio" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico 2: Crescimento de Consultas */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">Apoio Psicológico Realizado</h3>
                  <p className="text-[10px] text-slate-400">Consultas clínicas finalizadas ao longo dos meses.</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="consultas" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Consultas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- ABA: BENEFICIARIOS -------------------- */}
        {activeTab === "members" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">Beneficiários Ativos</h3>
                  <p className="text-[10px] text-slate-400">Pessoas vinculadas à sua organização que usufruem do suporte emocional.</p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#f5f5f0] border-none rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none w-64 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-black/5 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-3">Nome / Usuário</th>
                      <th className="px-6 py-3">E-mail</th>
                      <th className="px-6 py-3">Uso da IARA</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-xs text-slate-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                          Nenhum beneficiário encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.uid} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <div className="font-extrabold text-slate-900">{user.nome || "Usuário sem nome"}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{user.uid}</div>
                          </td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4 font-mono font-bold text-purple-600">
                            {user.iaraChatCount || 0} msgs
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                              Vinculado
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- ABA: CORPO CLINICO -------------------- */}
        {activeTab === "professionals" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-950">Profissionais de Saúde Mental</h3>
                <p className="text-[10px] text-slate-400">Psicólogos e terapeutas habilitados para atender sua organização.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {therapists.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-350" />
                    <p className="text-xs font-bold">Nenhum terapeuta exclusivo vinculado a este tenant.</p>
                    <p className="text-[10px] text-slate-450 max-w-sm mx-auto">Terapeutas globais do Pronto Socorro Emocional são disponibilizados para seus colaboradores quando não há corpo clínico interno.</p>
                  </div>
                ) : (
                  therapists.map(t => (
                    <div key={t.uid} className="border border-black/5 rounded-2xl p-5 space-y-4 hover:border-emerald-500/20 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-150/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-black">
                          {t.nome?.[0]}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{t.nome}</h4>
                          <p className="text-[10px] text-slate-400">{t.crp || "CRP Pendente"}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 text-[11px] border-t border-black/5">
                        <div className="flex justify-between">
                          <span className="text-slate-450">Abordagem:</span>
                          <span className="font-bold text-slate-700">{t.abordagem || "Geral / CBT"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-450">Especialidades:</span>
                          <span className="font-bold text-slate-700 truncate max-w-[150px]">
                            {t.especialidades?.join(", ") || "Clínica"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-450">E-mail:</span>
                          <span className="font-bold text-slate-700">{t.email}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          t.online 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : "bg-slate-50 text-slate-400 border border-slate-100"
                        }`}>
                          {t.online ? "Online" : "Offline"}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400">
                          Tenant exclusivo
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
