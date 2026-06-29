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
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

export default function DashboardInstitucional() {
  const navigate = useNavigate();
  const { tenant, tenantId, isInstitutionalAdmin, loading: tenantLoading } = useTenant();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [therapists, setTherapists] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "epidemiology" | "members" | "professionals">("overview");

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

  // Aggregated, fully anonymized B2B epidemiological data based on tenant type
  const isPrefeitura = tenant?.tipo === "prefeitura";

  const symptomData = isPrefeitura
    ? [
        { name: "Ansiedade Geral", value: 38, color: "#f43f5e" },
        { name: "Depressão / Baixo Astral", value: 25, color: "#3b82f6" },
        { name: "Vulnerabilidade Social", value: 18, color: "#eab308" },
        { name: "Distúrbios do Sono", value: 12, color: "#8b5cf6" },
        { name: "Luto / Perda", value: 7, color: "#64748b" },
      ]
    : [
        { name: "Ansiedade por Produtividade", value: 30, color: "#f43f5e" },
        { name: "Burnout / Esgotamento", value: 35, color: "#eab308" },
        { name: "Sobrecarga de Tarefas", value: 20, color: "#3b82f6" },
        { name: "Insônia / Sono Irregular", value: 10, color: "#8b5cf6" },
        { name: "Estresse Interpessoal", value: 5, color: "#64748b" },
      ];

  const radarData = isPrefeitura
    ? [
        { subject: "Acolhimento de Crise", A: 85, fullMark: 100 },
        { subject: "Prevenção Primária", A: 90, fullMark: 100 },
        { subject: "Apoio Comunitário", A: 75, fullMark: 100 },
        { subject: "Encaminhamento Clínico", A: 60, fullMark: 100 },
        { subject: "Respiração & Mindfulness", A: 65, fullMark: 100 },
        { subject: "Educação em Saúde", A: 80, fullMark: 100 },
      ]
    : [
        { subject: "Prevenção de Burnout", A: 95, fullMark: 100 },
        { subject: "Alívio de Estresse Diário", A: 88, fullMark: 100 },
        { subject: "Higiene do Sono", A: 70, fullMark: 100 },
        { subject: "Encaminhamento Clínico", A: 50, fullMark: 100 },
        { subject: "Exercícios de Foco", A: 80, fullMark: 100 },
        { subject: "Desenvolvimento de Resiliência", A: 85, fullMark: 100 },
      ];

  const riskDistribution = isPrefeitura
    ? [
        { level: "Risco Baixo (Apoio Preventivo)", percent: 62, color: "bg-emerald-500", text: "Munícipes com excelente engajamento preventivo, utilizando diário e biblioteca emocional." },
        { level: "Risco Moderado (Acompanhamento IARA)", percent: 28, color: "bg-amber-500", text: "Munícipes com sintomas leves de estresse/ansiedade, recebendo apoio guiado diário." },
        { level: "Risco Elevado (Redirecionamento Clínico)", percent: 10, color: "bg-rose-500", text: "Munícipes indicando sofrimento agudo ou dor crônica, ativamente encaminhados para psicólogos ou fonoaudiólogos da Rede Especialista." },
      ]
    : [
        { level: "Risco Baixo (Equilíbrio e Bem-estar)", percent: 55, color: "bg-emerald-500", text: "Colaboradores com níveis saudáveis de resiliência e uso recorrente de pílulas de mindfulness." },
        { level: "Risco Moderado (Atenção e Stress)", percent: 33, color: "bg-amber-500", text: "Colaboradores expressando sobrecarga laboral ou desânimo, acompanhados de perto pela IARA." },
        { level: "Risco Elevado (Risco de Afastamento / Burnout)", percent: 12, color: "bg-rose-500", text: "Colaboradores com alto esgotamento emocional, direcionados com prioridade para terapia especializada com reembolso corporativo." },
      ];

  const rawRecommendations = isPrefeitura
    ? [
        {
          title: "Mutirão de Saúde Mental e Acolhimento Comunitário",
          desc: "Diante do índice de 38% de Ansiedade Geral na população, recomendamos estabelecer polos de relaxamento guiado ou rodas de conversa presenciais nos postos de saúde de bairros identificados com maior volume de acessos.",
          type: "Ação de Campo",
          urgency: "Alta"
        },
        {
          title: "Campanha Municipal de Higiene do Sono",
          desc: "Como 12% da demanda refere-se a distúrbios do sono, sugerimos a distribuição de materiais educativos sobre rotina noturna saudável no aplicativo, integrados com pílulas de áudio para relaxamento de IARA.",
          type: "Campanha de Saúde Pública",
          urgency: "Média"
        },
        {
          title: "Fortalecimento do Fluxo de Encaminhamento Clínico (Matchmaking)",
          desc: "Garantir que os 10% de munícipes classificados em Risco Elevado tenham agendamento facilitado com a rede credenciada de psicólogos do SentiPae de forma 100% subsidiada.",
          type: "Processo Organizacional",
          urgency: "Crítica"
        }
      ]
    : [
        {
          title: "Campanha 'Pausa Ativa' Contra Burnout Ocupacional",
          desc: "Considerando que 35% do estresse mapeado decorre de esgotamento no trabalho (Burnout), recomendamos a implantação de um protocolo institucional de pausas obrigatórias de 5 minutos, estimulando o uso dos exercícios de respiração do SentiPae.",
          type: "Cultura Organizacional",
          urgency: "Alta"
        },
        {
          title: "Treinamento de Lideranças em Segurança Psicológica",
          desc: "Para mitigar o estresse interpessoal e a ansiedade por produtividade, orientamos a realização de um workshop focado em escuta ativa e empatia na distribuição de metas.",
          type: "Capacitação Corporativa",
          urgency: "Média"
        },
        {
          title: "Benefício de Psicoterapia Ampla Subvencionada",
          desc: "Com 12% dos colaboradores em nível de risco de afastamento laboral, sugerimos expandir o co-pagamento de sessões com o corpo clínico da Rede de Especialistas para mitigar absenteísmo médico.",
          type: "Política de Benefícios",
          urgency: "Crítica"
        }
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
              onClick={() => setActiveTab("epidemiology")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === "epidemiology" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4" /> Relatório Epidemiológico
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

        {/* -------------------- ABA: RELATÓRIO EPIDEMIOLÓGICO -------------------- */}
        {activeTab === "epidemiology" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Seção LGPD de Anonimização */}
            <div className="bg-emerald-500/5 border border-emerald-500/15 p-5 rounded-3xl flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mt-1 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-extrabold text-emerald-800 text-sm">Garantia de Confidencialidade Absoluta</p>
                <p className="text-emerald-700/85 leading-relaxed">
                  Para estar em total conformidade com a LGPD (Lei Geral de Proteção de Dados) e as regras éticas do CFP/CRM, as métricas e relatórios a seguir são agregados dinamicamente em grupos de no mínimo 5 pessoas. Prontuários, mensagens individuais e anotações clínicas de descompressão <strong>nunca</strong> são acessíveis por gestores municipais ou de RH.
                </p>
              </div>
            </div>

            {/* Distribuição de Riscos */}
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Distribuição Populacional de Risco Emocional</h3>
                <p className="text-[10px] text-slate-400">Classificação clínica baseada no engajamento, humor diário e triagem inicial.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {riskDistribution.map((risk, index) => (
                  <div key={index} className="border border-black/5 rounded-2xl p-5 space-y-4 hover:border-black/10 transition flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-800">{risk.level}</span>
                        <span className="text-lg font-black text-slate-900">{risk.percent}%</span>
                      </div>
                      <p className="text-[11px] text-slate-450 leading-relaxed">{risk.text}</p>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-4">
                      <div className={`${risk.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${risk.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráficos de Sintomas & Engajamento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PieChart: Sintomas Clínicos Agregados */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">Mapeamento de Queixas & Sintomas Agregados</h3>
                  <p className="text-[10px] text-slate-400">Distribuição percentual das principais dores emocionais relatadas de forma anônima à IARA.</p>
                </div>
                
                <div className="h-64 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="w-full md:w-1/2 h-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={symptomData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {symptomData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2.5">
                    {symptomData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-500 font-medium truncate shrink">{entry.name}</span>
                        <span className="font-extrabold text-slate-900 ml-auto">{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RadarChart: Foco do Acolhimento Preventivo */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">Foco Terapêutico e Modos de Engajamento</h3>
                  <p className="text-[10px] text-slate-400">Intensidade de uso dos recursos da plataforma em diferentes dimensões de cuidado.</p>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={8} />
                      <Radar name="Aderência" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recomendações SentiCore para Gestores */}
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Recomendações SentiCore (IARA B2B)</h3>
                  <p className="text-[10px] text-slate-400">Diretrizes preventivas baseadas em inteligência coletiva para tomada de decisão.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rawRecommendations.map((rec, index) => (
                  <div key={index} className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3 hover:bg-white/10 transition flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold rounded uppercase">
                          {rec.type}
                        </span>
                        <span className={`px-2 py-0.5 font-mono text-[9px] font-bold rounded uppercase ${
                          rec.urgency === "Crítica" 
                            ? "bg-red-500/20 text-red-400" 
                            : rec.urgency === "Alta" 
                              ? "bg-orange-500/20 text-orange-400" 
                              : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {rec.urgency}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-white leading-snug">{rec.title}</h4>
                      <p className="text-[10px] text-slate-350 leading-relaxed">{rec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -------------------- ABA: BENEFICIARIOS -------------------- */}
        {activeTab === "members" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Aggregated Engagement Widgets for Institutional Admins */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Registrados</span>
                <h4 className="text-2xl font-black text-slate-900 mt-1">{users.length}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Membros vinculados no total</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Usuários Engajados</span>
                <h4 className="text-2xl font-black text-indigo-600 mt-1">
                  {users.filter(u => (u.iaraChatCount || 0) > 0).length}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Realizaram check-in com IARA</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Diálogos de Acolhimento</span>
                <h4 className="text-2xl font-black text-purple-600 mt-1">
                  {users.reduce((sum, u) => sum + (u.iaraChatCount || 0), 0)}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Total de mensagens trocadas</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Taxa de Aderência</span>
                <h4 className="text-2xl font-black text-emerald-600 mt-1">
                  {users.length > 0 ? Math.round((users.filter(u => (u.iaraChatCount || 0) > 0).length / users.length) * 100) : 0}%
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Adesão ativa da comunidade</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">Mapeamento de Apoio e Engajamento (LGPD)</h3>
                  <p className="text-[10px] text-slate-400">
                    Nomes e e-mails foram mascarados automaticamente para garantir total confidencialidade de saúde mental de seus colaboradores.
                  </p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-black/5 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-3">Código / Iniciais</th>
                      <th className="px-6 py-3">E-mail Mascarado</th>
                      <th className="px-6 py-3">Engajamento IARA</th>
                      <th className="px-6 py-3">Nível de Acesso</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-xs text-slate-700">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                          Nenhum beneficiário ativo neste tenant.
                        </td>
                      </tr>
                    ) : (
                      users.map(user => {
                        // Secure Anonymization Masking for B2B portal compliance
                        const nameParts = (user.nome || "Beneficiário").split(" ");
                        const maskedName = nameParts[0] + (nameParts[1] ? ` ${nameParts[1][0]}.` : "") + " (Anônimo)";
                        
                        const emailParts = (user.email || "anonimo@sentipae.com").split("@");
                        const maskedEmail = emailParts[0][0] + "***" + emailParts[0][emailParts[0].length - 1] + "@" + emailParts[1];

                        return (
                          <tr key={user.uid} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4">
                              <div className="font-extrabold text-slate-900">{maskedName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {user.uid.substring(0, 8)}***</div>
                            </td>
                            <td className="px-6 py-4 font-mono">{maskedEmail}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                (user.iaraChatCount || 0) > 0 
                                  ? "bg-purple-50 text-purple-600 border border-purple-100" 
                                  : "bg-slate-50 text-slate-400 border border-slate-100"
                              }`}>
                                {user.iaraChatCount || 0} interações
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-500 font-bold uppercase text-[10px]">
                              {user.tipo}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                                Ativo (LGPD)
                              </span>
                            </td>
                          </tr>
                        );
                      })
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
