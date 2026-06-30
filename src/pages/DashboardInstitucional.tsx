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
  AlertCircle,
  Palette,
  FileText,
  UserPlus,
  Plus,
  Settings,
  Send,
  Check,
  Lock
} from "lucide-react";
import { logout } from "../services/firebase";
import { useTenant } from "../hooks/useTenant";
import { organizationService } from "../services/organizationService";
import { UserProfile, InstitutionProgram, OrganizationInvite, InstitutionalContract } from "../types";
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
  const [activeTab, setActiveTab] = useState<"overview" | "epidemiology" | "members" | "professionals" | "programs" | "branding" | "contracts" | "sentiCoreAgent">("overview");

  // New B2B states
  const [programs, setPrograms] = useState<InstitutionProgram[]>([]);
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [contracts, setContracts] = useState<InstitutionalContract[]>([]);

  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteGroup, setInviteGroup] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const [progName, setProgName] = useState("");
  const [progDesc, setProgDesc] = useState("");
  const [progTarget, setProgTarget] = useState("");
  const [progCampaign, setProgCampaign] = useState("");
  const [selectedTrails, setSelectedTrails] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Settings states
  const [primaryColor, setPrimaryColor] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(true);
  const [enableIaraAdvanced, setEnableIaraAdvanced] = useState(true);
  const [enableGoogleLive, setEnableGoogleLive] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // SentiCore Agent Chat
  const [agentQuestion, setAgentQuestion] = useState("");
  const [agentAnswer, setAgentAnswer] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // Sync setting inputs when tenant loads
  useEffect(() => {
    if (tenant) {
      setPrimaryColor(tenant.settings?.primaryColor || "#10b981");
      setWelcomeMessage(tenant.settings?.welcomeMessage || "");
      setAllowSelfRegistration(tenant.settings?.allowSelfRegistration ?? true);
      setEnableIaraAdvanced(tenant.settings?.enableIaraAdvanced ?? true);
      setEnableGoogleLive(tenant.settings?.enableGoogleLive ?? false);
    }
  }, [tenant]);

  // Load organization users, therapists, programs, invites, and contracts
  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      Promise.all([
        organizationService.getOrganizationUsers(tenantId),
        organizationService.getOrganizationTherapists(tenantId),
        organizationService.getPrograms(tenantId),
        organizationService.getInvites(tenantId),
        organizationService.getContracts(tenantId)
      ])
        .then(([tenantUsers, tenantTherapists, tenantPrograms, tenantInvites, tenantContracts]) => {
          setUsers(tenantUsers);
          setTherapists(tenantTherapists);
          setPrograms(tenantPrograms);
          setInvites(tenantInvites);
          setContracts(tenantContracts);
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

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !inviteEmail || !inviteRole) return;
    try {
      const code = `SA-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInvite = await organizationService.createInvite({
        tenantId,
        email: inviteEmail,
        role: inviteRole,
        group: inviteGroup || undefined,
        code
      });
      setInvites(prev => [newInvite, ...prev]);
      setInviteEmail("");
      setInviteRole("");
      setInviteGroup("");
      setInviteMessage(`Convite gerado com sucesso! Código de Onboarding: ${code}`);
      setTimeout(() => setInviteMessage(""), 6000);
    } catch (err) {
      console.error("Erro ao criar convite:", err);
      alert("Erro ao criar convite.");
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !progName || !progDesc) return;
    try {
      const newProg = await organizationService.createProgram({
        tenantId,
        name: progName,
        description: progDesc,
        targetGroup: progTarget || undefined,
        campaignName: progCampaign || undefined,
        contentTrail: selectedTrails,
        goals: selectedGoals,
        active: true
      });
      setPrograms(prev => [newProg, ...prev]);
      setProgName("");
      setProgDesc("");
      setProgTarget("");
      setProgCampaign("");
      setSelectedTrails([]);
      setSelectedGoals([]);
      alert("Programa de Cuidado publicado com sucesso no portal de onboarding!");
    } catch (err) {
      console.error("Erro ao publicar programa de cuidado:", err);
      alert("Erro ao publicar programa de cuidado.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setSavingSettings(true);
    try {
      await organizationService.updateOrganization(tenantId, {
        settings: {
          primaryColor,
          welcomeMessage,
          allowSelfRegistration,
          enableIaraAdvanced,
          enableGoogleLive
        }
      });
      alert("Configurações de marca e portal salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      alert("Erro ao salvar configurações.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateContract = async (name: string, price: number, maxUsers: number, period: 'monthly' | 'annual') => {
    if (!tenantId) return;
    try {
      const newContract = await organizationService.createContract({
        tenantId,
        name,
        value: price,
        maxUsers,
        billingPeriod: period,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        features: ["IARA Avançada", "Corpo Clínico Integrado", "PCH - Poesia Cognitiva Hipnótica", "Relatório Epidemiológico", "Canal Direto Ouvidoria"]
      });
      setContracts(prev => [newContract, ...prev]);
      await organizationService.updateOrganization(tenantId, { maxUsers });
      alert(`Contrato de expansão '${name}' assinado e ativado! Limite expandido para ${maxUsers} usuários.`);
      if (tenant) {
        tenant.maxUsers = maxUsers;
      }
    } catch (err) {
      console.error("Erro ao simular contrato:", err);
    }
  };

  const handleSentiCoreAgentQuestion = async (predefinedQuestion?: string) => {
    if (!tenantId || !tenant) return;
    const q = predefinedQuestion || agentQuestion;
    if (!q) return;
    setAgentLoading(true);
    setAgentAnswer(null);
    try {
      const res = await fetch("/api/gemini/b2b-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: tenant.name,
          organizationType: tenant.tipo,
          indicadores: tenant.indicadores,
          userCount: users.length,
          activePrograms: programs.map(p => p.name),
          question: q
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAgentAnswer(data);
      } else {
        const errData = await res.json();
        alert(`Erro na análise: ${errData.error || 'Erro desconhecido'}`);
      }
    } catch (err: any) {
      console.error("Erro no Agente SentiCore B2B:", err);
      alert("Erro ao conectar com o Agente SentiCore.");
    } finally {
      setAgentLoading(false);
      setAgentQuestion("");
    }
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
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "overview" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Visão Geral & Métricas
            </button>

            <button
              onClick={() => setActiveTab("epidemiology")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "epidemiology" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4 text-rose-400" /> Relatório Epidemiológico
            </button>

            <button
              onClick={() => setActiveTab("members")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "members" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 text-blue-400" /> Membros & Convites
            </button>

            <button
              onClick={() => setActiveTab("programs")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "programs" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Plus className="w-4 h-4 text-purple-400" /> Programas de Cuidado ({programs.length})
            </button>

            <button
              onClick={() => setActiveTab("professionals")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "professionals" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Heart className="w-4 h-4 text-pink-400" /> Corpo Clínico ({therapists.length})
            </button>

            <button
              onClick={() => setActiveTab("sentiCoreAgent")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "sentiCoreAgent" ? "bg-emerald-500 text-white animate-pulse" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" /> Agente SentiCore (AI)
            </button>

            <button
              onClick={() => setActiveTab("branding")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "branding" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Palette className="w-4 h-4 text-sky-400" /> Portal & Branding
            </button>

            <button
              onClick={() => setActiveTab("contracts")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "contracts" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4 text-orange-400" /> Contratos & Vagas
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

            {/* Sub-painel de Convites de Onboarding (RBAC) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Form de Novo Convite */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-emerald-500" />
                    Convidar Novo Usuário
                  </h4>
                  <p className="text-[10px] text-slate-400">Envie um convite de onboarding com papel de acesso (RBAC) definido.</p>
                </div>

                <form onSubmit={handleCreateInvite} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail do Colaborador</label>
                    <input
                      type="email"
                      required
                      placeholder="colaborador@organizacao.com"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Papel de Acesso (RBAC)</label>
                    <select
                      required
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50 font-bold"
                    >
                      <option value="">Selecione o papel...</option>
                      <option value="paciente">Beneficiário Comum (Paciente)</option>
                      <option value="analista">Analista de Saúde Ocupacional</option>
                      <option value="gestor">Gestor / Coordenador</option>
                      <option value="admin">Administrador do Portal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Setor / Departamento</label>
                    <input
                      type="text"
                      placeholder="Ex: Recursos Humanos, Financeiro, Vendas"
                      value={inviteGroup}
                      onChange={e => setInviteGroup(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 text-white hover:bg-emerald-600 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Enviar Convite Seguro
                  </button>
                </form>

                {inviteMessage && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[10px] font-bold p-3 rounded-xl flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{inviteMessage}</span>
                  </div>
                )}
              </div>

              {/* Lista de Convites Ativos */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4 lg:col-span-2">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Histórico de Convites Emitidos
                  </h4>
                  <p className="text-[10px] text-slate-400">Códigos e status dos convites de onboarding vinculados a este tenant.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-black/5 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-2.5">E-mail</th>
                        <th className="px-4 py-2.5">Papel (RBAC)</th>
                        <th className="px-4 py-2.5">Código Onboarding</th>
                        <th className="px-4 py-2.5">Setor</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-xs text-slate-750">
                      {invites.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-[10px]">
                            Nenhum convite pendente. Crie um ao lado!
                          </td>
                        </tr>
                      ) : (
                        invites.map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono">{inv.email}</td>
                            <td className="px-4 py-3 font-bold uppercase text-[9px] text-slate-500">{inv.role}</td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-900 bg-slate-100/50 rounded inline-block mt-1">{inv.code}</td>
                            <td className="px-4 py-3 text-slate-400">{inv.group || "Geral"}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                inv.status === "accepted" 
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                  : "bg-amber-50 text-amber-600 border border-amber-100"
                              }`}>
                                {inv.status === "accepted" ? "Ativado" : "Pendente"}
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

        {/* -------------------- ABA: PROGRAMAS INSTITUCIONAIS -------------------- */}
        {activeTab === "programs" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form de Criação */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-purple-500" />
                    Novo Programa de Cuidado
                  </h3>
                  <p className="text-[10px] text-slate-400">Lance uma jornada preventiva de bem-estar com trilhas e metas exclusivas.</p>
                </div>

                <form onSubmit={handleCreateProgram} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Programa</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Qualidade de Vida SentiPae"
                      value={progName}
                      onChange={e => setProgName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição / Objetivo Principal</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Ex: Campanha de prevenção ao esgotamento psicológico e higiene do sono coletiva."
                      value={progDesc}
                      onChange={e => setProgDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Grupo / Setor de Destino</label>
                    <input
                      type="text"
                      placeholder="Ex: Todos os Colaboradores, Professores"
                      value={progTarget}
                      onChange={e => setProgTarget(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nome da Campanha Ocupacional</label>
                    <input
                      type="text"
                      placeholder="Ex: Janeiro Branco, Setembro Amarelo"
                      value={progCampaign}
                      onChange={e => setProgCampaign(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50"
                    />
                  </div>

                  {/* Seleção de Trilhas */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Trilhas de Apoio</label>
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-black/5 max-h-32 overflow-y-auto">
                      {["IARA Conversa Preventiva", "Mindfulness & Presença", "Manejo de Crise de Ansiedade", "Qualidade de Sono PCH", "Resiliência no Trabalho"].map(trail => (
                        <label key={trail} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTrails.includes(trail)}
                            onChange={e => {
                              if (e.target.checked) setSelectedTrails(p => [...p, trail]);
                              else setSelectedTrails(p => p.filter(t => t !== trail));
                            }}
                            className="rounded text-emerald-500"
                          />
                          <span>{trail}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Seleção de Metas */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Metas Institucionais</label>
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-black/5 max-h-32 overflow-y-auto">
                      {["Reduzir absenteísmo laboral", "Melhorar qualidade de sono coletivo", "Reduzir escala de Burnout", "Apoiar munícipes em isolamento social", "Acolhimento psicológico de urgência"].map(goal => (
                        <label key={goal} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedGoals.includes(goal)}
                            onChange={e => {
                              if (e.target.checked) setSelectedGoals(p => [...p, goal]);
                              else setSelectedGoals(p => p.filter(g => g !== goal));
                            }}
                            className="rounded text-emerald-500"
                          />
                          <span>{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 text-white hover:bg-emerald-600 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" /> Publicar no Portal
                  </button>
                </form>
              </div>

              {/* Lista de Programas */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4 lg:col-span-2">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    Programas Ativos de Bem-estar
                  </h3>
                  <p className="text-[10px] text-slate-400">Jornadas integradas em andamento e divulgadas aos beneficiários deste tenant.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 text-xs border border-dashed border-black/10 rounded-2xl">
                      Nenhum programa customizado ativo. Use o formulário para criar o primeiro!
                    </div>
                  ) : (
                    programs.map(prog => (
                      <div key={prog.id} className="border border-black/5 rounded-2xl p-4 space-y-3 hover:border-purple-500/20 transition">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 font-mono text-[9px] font-bold rounded uppercase">
                            {prog.campaignName || "Preventivo"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Público: {prog.targetGroup || "Geral"}</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-955 leading-snug">{prog.name}</h4>
                        <p className="text-[10px] text-slate-450 leading-relaxed">{prog.description}</p>

                        <div className="space-y-1.5 pt-2 border-t border-black/5">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Trilhas Inclusas:</div>
                          <div className="flex flex-wrap gap-1">
                            {prog.contentTrail.map((t, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-mono font-medium">{t}</span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1.5">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Metas Estabelecidas:</div>
                          <div className="flex flex-wrap gap-1">
                            {prog.goals.map((g, idx) => (
                              <span key={idx} className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-medium">{g}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- ABA: PORTAL & BRANDING -------------------- */}
        {activeTab === "branding" && (
          <div className="space-y-6 animate-fadeIn max-w-3xl">
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-500" />
                  Customização do Portal de Onboarding
                </h3>
                <p className="text-[10px] text-slate-400">
                  Configure a identidade visual do portal e recursos inteligentes disponíveis aos beneficiários do seu tenant.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Cor Primária Institucional</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="w-10 h-8 border border-black/10 rounded cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        placeholder="#10b981"
                        className="flex-1 px-3 py-1.5 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-emerald-500 font-mono bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Onboarding por Domínio de E-mail</label>
                    <div className="flex items-center gap-2.5 h-8">
                      <input
                        type="checkbox"
                        checked={allowSelfRegistration}
                        onChange={e => setAllowSelfRegistration(e.target.checked)}
                        id="selfReg"
                        className="rounded text-emerald-500 w-4 h-4"
                      />
                      <label htmlFor="selfReg" className="text-xs text-slate-700 cursor-pointer font-medium select-none">
                        Permitir auto-cadastro por e-mails com domínio corporativo
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mensagem de Boas-Vindas Personalizada</label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Olá! Seja muito bem-vindo ao portal de saúde do SentiPae. Aqui você conta com apoio profissional e com a IARA 24 horas por dia de forma sigilosa."
                    value={welcomeMessage}
                    onChange={e => setWelcomeMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50"
                  />
                </div>

                <div className="border-t border-black/5 pt-4 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recursos de Inteligência Habilitados</h4>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={enableIaraAdvanced}
                      onChange={e => setEnableIaraAdvanced(e.target.checked)}
                      id="enableIaraAdv"
                      className="rounded text-emerald-500 w-4 h-4"
                    />
                    <div>
                      <label htmlFor="enableIaraAdv" className="text-xs text-slate-800 font-bold cursor-pointer block select-none">
                        IARA Avançada com SentiCore
                      </label>
                      <span className="text-[9px] text-slate-400">Habilita suporte emocional de alta sensibilidade e acompanhamento dinâmico.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={enableGoogleLive}
                      onChange={e => setEnableGoogleLive(e.target.checked)}
                      id="enableLiveVoice"
                      className="rounded text-emerald-500 w-4 h-4"
                    />
                    <div>
                      <label htmlFor="enableLiveVoice" className="text-xs text-slate-800 font-bold cursor-pointer block select-none">
                        Integração Google Live API (Conversação de Voz em Tempo Real)
                      </label>
                      <span className="text-[9px] text-slate-400">Ativa a interface de voz sussurrada e acolhimento imediato de crises via áudio bidirecional.</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2 bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-black rounded-xl transition flex items-center gap-2 shadow disabled:opacity-50"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {savingSettings ? "Salvando configurações..." : "Salvar Configurações de Branding"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* -------------------- ABA: CONTRATOS E VAGAS -------------------- */}
        {activeTab === "contracts" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Resumo do Contrato Ativo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card de Slots/Vagas */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Aproveitamento de Vagas</span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900">{users.length}</h3>
                  <span className="text-slate-400 text-xs font-mono">/ {tenant?.maxUsers || 100}</span>
                </div>
                <p className="text-[10px] text-slate-400">Colaboradores/munícipe cadastrados ativamente.</p>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, ((users.length / (tenant?.maxUsers || 100)) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{Math.round((users.length / (tenant?.maxUsers || 100)) * 100)}% Utilizado</span>
                  <span>{(tenant?.maxUsers || 100) - users.length} Vagas Livres</span>
                </div>
              </div>

              {/* Card de Plano do Contrato */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-3 lg:col-span-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-mono text-[9px] font-bold rounded uppercase">
                      Contrato Premium Corporativo
                    </span>
                    <span className="text-xs font-black text-emerald-600">Status: Ativo</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-snug">Vínculo Contratual Multitenant SentiPae</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Acesso integral à IARA Avançada, biblioteca de Poesia Cognitiva Hipnótica (PCH), agendamentos guiados com corpo clínico multidisciplinar, e analytics de estresse consolidado com total conformidade com a LGPD.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-black/5 text-[11px]">
                  <div>
                    <span className="text-slate-400">Início do Contrato:</span>
                    <div className="font-bold text-slate-700">01/01/2026</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Vencimento:</span>
                    <div className="font-bold text-slate-700">31/12/2026</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Valor Mensal:</span>
                    <div className="font-bold text-slate-700">R$ 2.450,00</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Faturamento:</span>
                    <div className="font-bold text-slate-700">Recorrente</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulação de Expansão de Vagas */}
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  Expansão de Vagas & Upgrade SentiPae (Simulação Comercial)
                </h3>
                <p className="text-[10px] text-slate-400">
                  Precisa incluir mais colaboradores ou ampliar a cobertura pública? Escolha um plano de expansão imediata para simular ou ativar novas vagas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {[
                  { name: "Expansão Plus (250 vagas)", users: 250, price: 4900, desc: "Ideal para prefeituras de pequeno porte ou indústrias em crescimento." },
                  { name: "Expansão Premium (500 vagas)", users: 500, price: 8500, desc: "Suporte expandido, IARA B2B de alta performance e auditorias de estresse semanais." },
                  { name: "Expansão Enterprise (1000 vagas)", users: 1000, price: 14500, desc: "Matchmaking em saúde pública subsidiado, integração com folha de pagamento e SLAs prioritários." }
                ].map(plan => (
                  <div key={plan.name} className="border border-black/5 rounded-2xl p-5 space-y-4 hover:border-emerald-500/20 transition flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-950">{plan.name}</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed">{plan.desc}</p>
                      <div className="pt-2">
                        <span className="text-lg font-black text-slate-900">R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-slate-400 font-mono"> / mês</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateContract(plan.name, plan.price, plan.users, "monthly")}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-[10px] font-bold rounded-xl transition"
                    >
                      Assinar e Ativar Expansão
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico de Contratos */}
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-orange-500" />
                  Histórico de Contratos & Ativações B2B
                </h3>
                <p className="text-[10px] text-slate-400">Registro histórico de todas as faturas e contratos celebrados.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-black/5 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-2.5">Nome do Contrato</th>
                      <th className="px-4 py-2.5">Vagas Contratadas</th>
                      <th className="px-4 py-2.5">Valor Mensal</th>
                      <th className="px-4 py-2.5">Vencimento</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-xs text-slate-700">
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold">Contrato Base Multitenant</td>
                      <td className="px-4 py-3 font-mono">100 vagas</td>
                      <td className="px-4 py-3 font-bold text-slate-900">R$ 2.450,00</td>
                      <td className="px-4 py-3 text-slate-400">31/12/2026</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold">
                          Ativo
                        </span>
                      </td>
                    </tr>
                    {contracts.map(contract => (
                      <tr key={contract.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold">{contract.name}</td>
                        <td className="px-4 py-3 font-mono">{contract.maxUsers} vagas</td>
                        <td className="px-4 py-3 font-bold text-slate-900">R$ {contract.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-slate-400">{contract.endDate}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold">
                            Ativo (Expansão)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- ABA: AGENTE SENTICORE (AI DYNAMIC AUDIT) -------------------- */}
        {activeTab === "sentiCoreAgent" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Banner Informativo */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Agente SentiCore Organizacional</h3>
                  <p className="text-[10px] text-slate-400">Inteligência Artificial de Auditoria Coletiva e Prescrição de Ações Preventivas.</p>
                </div>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed max-w-3xl">
                O Agente SentiCore consolidará os indicadores de humor, estresse, mensagens e engajamento da sua organização de forma 100% anônima (em total conformidade com a LGPD) e gerará uma análise diagnóstica, alertas críticos e um plano tático imediato com base na nossa metodologia proprietária de bem-estar.
              </p>
            </div>

            {/* Console de Perguntas e Respostas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Painel Lateral de Ativação / Prompts Rápidos */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Scans e Perguntas Rápidas</h4>
                <p className="text-[10px] text-slate-455 leading-relaxed">Clique para disparar um scan temático ou digite sua pergunta customizada no campo ao lado.</p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleSentiCoreAgentQuestion("Disparar varredura completa de saúde mental coletiva (Auditoria Geral)")}
                    disabled={agentLoading}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-emerald-50 border border-black/5 rounded-2xl transition text-xs font-bold text-slate-800 hover:text-emerald-700 flex flex-col gap-1"
                  >
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Scan 1</span>
                    Auditoria de Saúde Coletiva
                  </button>

                  <button
                    onClick={() => handleSentiCoreAgentQuestion("Como posso combater sintomas de exaustão e fadiga ocupacional no nosso ecossistema?")}
                    disabled={agentLoading}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-indigo-50 border border-black/5 rounded-2xl transition text-xs font-bold text-slate-800 hover:text-indigo-700 flex flex-col gap-1"
                  >
                    <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider">Scan 2</span>
                    Plano de Alívio de Exaustão
                  </button>

                  <button
                    onClick={() => handleSentiCoreAgentQuestion("Gerar relatório de conformidade e recomendações para o comitê executivo")}
                    disabled={agentLoading}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-purple-50 border border-black/5 rounded-2xl transition text-xs font-bold text-slate-800 hover:text-purple-700 flex flex-col gap-1"
                  >
                    <span className="text-[9px] text-purple-600 font-bold uppercase tracking-wider">Scan 3</span>
                    Relatório Executivo para Comitê
                  </button>
                </div>
              </div>

              {/* Chat Console */}
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-5 lg:col-span-3 flex flex-col justify-between min-h-[450px]">
                {/* Janela de Resultados */}
                <div className="flex-1 overflow-y-auto space-y-5 pr-2 max-h-[500px]">
                  {agentLoading ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Processando Auditoria SentiCore...</p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Analisando indicadores agregados e contextualizando com as diretrizes do portal.</p>
                      </div>
                    </div>
                  ) : agentAnswer ? (
                    <div className="space-y-6">
                      {/* Sumário Executivo */}
                      <div className="border border-black/5 rounded-2xl p-5 bg-emerald-50/20 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-black uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          Sumário Clínico-Institucional
                        </div>
                        <p className="text-xs text-slate-750 leading-relaxed font-medium">{agentAnswer.executiveSummary}</p>
                      </div>

                      {/* Alertas Críticos */}
                      {agentAnswer.criticalAlerts && agentAnswer.criticalAlerts.length > 0 && (
                        <div className="border border-red-500/10 rounded-2xl p-5 bg-red-50/20 space-y-2">
                          <div className="flex items-center gap-2 text-[10px] text-red-700 font-black uppercase tracking-wider">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            Alertas de Atenção Epidemiológica
                          </div>
                          <ul className="list-disc pl-5 text-xs text-red-900 space-y-1">
                            {agentAnswer.criticalAlerts.map((alert: string, idx: number) => (
                              <li key={idx} className="leading-relaxed font-semibold">{alert}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Plano de Ação */}
                      {agentAnswer.actionPlan && agentAnswer.actionPlan.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plano de Ação Preventivo Recomendado</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {agentAnswer.actionPlan.map((action: any, idx: number) => (
                              <div key={idx} className="border border-black/5 rounded-xl p-4 bg-slate-50 space-y-2 hover:border-emerald-500/25 transition">
                                <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase">
                                  <span className="text-emerald-600">Impacto: {action.expectedImpact || 'N/A'}</span>
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    action.urgency === 'Crítica' || action.urgency === 'Alta' 
                                      ? 'bg-red-100 text-red-700' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>{action.urgency}</span>
                                </div>
                                <h5 className="text-xs font-black text-slate-900 leading-snug">{action.title}</h5>
                                <p className="text-[10px] text-slate-450 leading-relaxed">{action.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Insights IARA */}
                      {agentAnswer.iaraInsights && (
                        <div className="border border-purple-500/10 rounded-2xl p-5 bg-purple-50/20 space-y-2">
                          <div className="flex items-center gap-2 text-[10px] text-purple-700 font-black uppercase tracking-wider">
                            <Brain className="w-4 h-4 text-purple-600" />
                            Diretrizes para a IARA Conversacional
                          </div>
                          <p className="text-xs text-purple-900 leading-relaxed font-medium">{agentAnswer.iaraInsights}</p>
                        </div>
                      )}

                      {/* Resposta direta para perguntas customizadas */}
                      {agentAnswer.directAnswer && (
                        <div className="border border-blue-500/10 rounded-2xl p-5 bg-blue-50/20 space-y-2">
                          <div className="flex items-center gap-2 text-[10px] text-blue-700 font-black uppercase tracking-wider">
                            <Mail className="w-4 h-4 text-blue-600" />
                            Resposta Direta Consultiva
                          </div>
                          <p className="text-xs text-blue-900 leading-relaxed font-medium whitespace-pre-line">{agentAnswer.directAnswer}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <Sparkles className="w-8 h-8 text-emerald-300 animate-pulse" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Aguardando Solicitação de Scan</p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Dispare uma auditoria completa ou faça uma pergunta específica utilizando a inteligência do SentiCore.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input de Envio de Pergunta */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSentiCoreAgentQuestion();
                  }}
                  className="flex gap-2 pt-4 border-t border-black/5"
                >
                  <input
                    type="text"
                    placeholder="Faça uma pergunta sobre o comportamento emocional coletivo..."
                    value={agentQuestion}
                    onChange={(e) => setAgentQuestion(e.target.value)}
                    disabled={agentLoading}
                    className="flex-1 px-4 py-2.5 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={agentLoading || !agentQuestion}
                    className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" /> Enviar
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
