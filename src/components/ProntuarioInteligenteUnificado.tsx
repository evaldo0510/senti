import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Unlock, 
  User, 
  Activity, 
  TrendingUp, 
  Clock, 
  Calendar, 
  FileText, 
  Bot, 
  Building, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle,
  Brain,
  AlertTriangle,
  Flame,
  Award,
  ArrowRight,
  Database,
  Eye,
  Settings,
  RefreshCw
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  RadialBarChart, 
  RadialBar, 
  Legend, 
  BarChart, 
  Bar, 
  Cell 
} from "recharts";
import { userService } from "../services/userService";
import { auth } from "../services/firebase";
import { cn } from "../lib/utils";

interface PIUProps {
  patientId?: string;
  userType?: "paciente" | "terapeuta" | "institucional" | "ia" | "admin";
  defaultTab?: "usuario" | "profissional" | "institucional" | "ia";
  onTabChange?: (tab: string) => void;
}

export default function ProntuarioInteligenteUnificado({ 
  patientId, 
  userType = "paciente", 
  defaultTab = "usuario",
  onTabChange 
}: PIUProps) {
  const [activeLayer, setActiveLayer] = useState<"usuario" | "profissional" | "institucional" | "ia">(defaultTab);
  const [iccValue, setIccValue] = useState(78);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Layers checklist completion states (ICC calculations)
  const [checklist, setChecklist] = useState({
    regularidadeDiario: true,   // +25%
    programasReset: true,       // +20%
    comparecimentoConsultas: false, // +25%
    atividadesRespiracao: true, // +15%
    pilulasSabedoria: true,     // +15%
  });

  // Calculate dynamic ICC
  useEffect(() => {
    let score = 0;
    if (checklist.regularidadeDiario) score += 25;
    if (checklist.programasReset) score += 20;
    if (checklist.comparecimentoConsultas) score += 25;
    if (checklist.atividadesRespiracao) score += 15;
    if (checklist.pilulasSabedoria) score += 15;
    setIccValue(score);
  }, [checklist]);

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Static Data for Visual Charts
  const historicalICCData = [
    { name: "Semana 1", icc: 55, bemEstar: 5.4, adesao: 60 },
    { name: "Semana 2", icc: 65, bemEstar: 6.2, adesao: 70 },
    { name: "Semana 3", icc: 72, bemEstar: 6.8, adesao: 75 },
    { name: "Semana 4", icc: 78, bemEstar: 7.5, adesao: 85 },
  ];

  const institutionalMockData = [
    { name: "Engajamento", valor: 84, fill: "#10b981" },
    { name: "Satisfeito", valor: 91, fill: "#6366f1" },
    { name: "Adesão PCH", valor: 76, fill: "#f59e0b" },
    { name: "Redução Estresse", valor: 68, fill: "#06b6d4" },
  ];

  const iaSafeContext = {
    identificadoresSeguros: {
      nome_abreviado: "G. Silva",
      idade_faixa: "25-34",
      tempo_plataforma: "18 dias"
    },
    humorRecente: {
      medio_7d: "7.4 / 10",
      estabilidade: "Alta",
      predominante: "Neutro / Feliz"
    },
    seguranca: {
      alerta_crise: "BAIXO",
      palavras_gatilho_detectadas: "nenhuma",
      encaminhamento_humano: "Não requerido"
    },
    metasPessoais: [
      "Reduzir ansiedade matinal",
      "Melhorar a regularidade do sono",
      "Escrever no diário poético 3x por semana"
    ]
  };

  return (
    <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl space-y-8 text-slate-100" id="piu-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            SentiPae Enterprise Security Protocols
          </div>
          <h2 className="text-2xl font-black tracking-tight font-sans text-white">
            Prontuário Inteligente Unificado (PIU)
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhamento integral, privacidade baseada em camadas (RBAC) e Índice de Continuidade do Cuidado (ICC).
          </p>
        </div>

        {/* Info-Badge ICC */}
        <div className="bg-slate-950/80 border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="text-lg font-black text-emerald-400">{iccValue}%</span>
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Índice ICC Atual</div>
            <div className="text-xs font-bold text-slate-300">
              {iccValue >= 80 ? "Excelente Engajamento ✨" : iccValue >= 50 ? "Ritmo Saudável 👍" : "Atenção Necessária ⚠️"}
            </div>
          </div>
        </div>
      </div>

      {/* Camadas Switcher (Tabs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => { setActiveLayer("usuario"); onTabChange?.("usuario"); }}
          className={cn(
            "py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeLayer === "usuario" 
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <User className="w-4 h-4" />
          Usuário
        </button>

        <button
          onClick={() => { setActiveLayer("profissional"); onTabChange?.("profissional"); }}
          className={cn(
            "py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeLayer === "profissional" 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Lock className="w-4 h-4" />
          Profissional
        </button>

        <button
          onClick={() => { setActiveLayer("institucional"); onTabChange?.("institucional"); }}
          className={cn(
            "py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeLayer === "institucional" 
              ? "bg-purple-600 text-white shadow-lg shadow-purple-950/40" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Building className="w-4 h-4" />
          Institucional
        </button>

        <button
          onClick={() => { setActiveLayer("ia"); onTabChange?.("ia"); }}
          className={cn(
            "py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeLayer === "ia" 
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-950/40" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Bot className="w-4 h-4" />
          Camada de IA
        </button>
      </div>

      {/* Layer Content Viewports */}
      <div className="space-y-6">
        
        {/* 1. USUÁRIO LAYER */}
        {activeLayer === "usuario" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ICC Continuity Breakdown Checklist */}
              <div className="lg:col-span-5 bg-slate-950/40 border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" /> Calculador de Hábitos (ICC)
                  </h3>
                  <span title="O ICC calcula seu engajamento com hábitos saudáveis sugeridos na plataforma" className="cursor-pointer">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  O <strong>Índice de Continuidade do Cuidado (ICC)</strong> acompanha seu progresso em 5 áreas fundamentais. Marque as tarefas que realizou recentemente para ver seu engajamento flutuar positivamente!
                </p>

                <div className="space-y-3 pt-2">
                  <div 
                    onClick={() => toggleChecklistItem("regularidadeDiario")}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center border",
                        checklist.regularidadeDiario ? "bg-emerald-500 border-emerald-400 text-white" : "border-slate-700"
                      )}>
                        {checklist.regularidadeDiario && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-bold text-slate-200">Diário Emocional regular</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+25%</span>
                  </div>

                  <div 
                    onClick={() => toggleChecklistItem("programasReset")}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center border",
                        checklist.programasReset ? "bg-emerald-500 border-emerald-400 text-white" : "border-slate-700"
                      )}>
                        {checklist.programasReset && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-bold text-slate-200">Participar do Reset 21 Dias</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+20%</span>
                  </div>

                  <div 
                    onClick={() => toggleChecklistItem("comparecimentoConsultas")}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center border",
                        checklist.comparecimentoConsultas ? "bg-emerald-500 border-emerald-400 text-white" : "border-slate-700"
                      )}>
                        {checklist.comparecimentoConsultas && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-bold text-slate-200">Comparecer às sessões marcadas</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+25%</span>
                  </div>

                  <div 
                    onClick={() => toggleChecklistItem("atividadesRespiracao")}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center border",
                        checklist.atividadesRespiracao ? "bg-emerald-500 border-emerald-400 text-white" : "border-slate-700"
                      )}>
                        {checklist.atividadesRespiracao && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-bold text-slate-200">Exercícios de Respiração diários</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+15%</span>
                  </div>

                  <div 
                    onClick={() => toggleChecklistItem("pilulasSabedoria")}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center border",
                        checklist.pilulasSabedoria ? "bg-emerald-500 border-emerald-400 text-white" : "border-slate-700"
                      )}>
                        {checklist.pilulasSabedoria && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-bold text-slate-200">Interagir com Pílulas de Poesia</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+15%</span>
                  </div>
                </div>
              </div>

              {/* ICC Progress Trend Chart */}
              <div className="lg:col-span-7 bg-slate-950/40 border border-white/5 rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Curva de Continuidade & Estabilidade
                  </h3>
                  <p className="text-[10px] text-slate-400">Relação direta entre seu engajamento (ICC) e a autopercepção de bem-estar semanal.</p>
                </div>

                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalICCData}>
                      <defs>
                        <linearGradient id="colorIcc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBemEstar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px" }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area name="Índice ICC (%)" type="monotone" dataKey="icc" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIcc)" />
                      <Area name="Bem-Estar Estimado (x10)" type="monotone" dataKey="bemEstar" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorBemEstar)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Core Patient Journey Goals */}
            <div className="bg-slate-950/20 border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Meus Objetivos e Programas Ativos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-200">ReSet 21 Dias</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Dia 12 / 21</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: "57%" }} />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">Programa guiado de reconfiguração neural e regulação emocional sob PCH.</p>
                </div>

                <div className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-200">Controle de Crise</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Alcançado 🏅</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">Reduzir picos de angústia extrema usando os exercícios rápidos de respiração.</p>
                </div>

                <div className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-200">Autogestão de Sono</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">74% Concluído</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: "74%" }} />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">Estabelecer rotina noturna estável através de meditações de fixação lírica.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PROFISSIONAL LAYER */}
        {activeLayer === "profissional" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Security Notice */}
            <div className="bg-blue-950/30 border border-blue-500/15 p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/15 flex-shrink-0">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-blue-300">Acesso Restrito: Camada Clínica Criptografada</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  Esta camada exibe as anotações clínicas privadas protegidas com chaves <strong>AES-256</strong>. O paciente concede consentimento dinâmico de compartilhamento, e as prefeituras ou corporações contratantes não têm acesso a essas informações individuais.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Clinical notes E2E demo */}
              <div className="lg:col-span-8 bg-slate-950/40 border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Prontuário de Evoluções e Sinais de Risco</h3>
                    <p className="text-[10px] text-slate-500">Últimas avaliações sincronizadas sob o sigilo profissional.</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold uppercase tracking-wider rounded">E2EE Habilitada</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-bold text-slate-200">Sessão #4 — 29/06/2026</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Risco: Baixo</span>
                    </div>
                    <p className="text-xs text-slate-350 font-sans leading-relaxed">
                      Paciente demonstra ótima evolução após iniciar o ReSet de 21 dias. Relatou que a metáfora da &quot;ancoragem náutica&quot; sugerida por IARA ajudou a interromper crises de ruminação antes de dormir. O humor estabilizou em 7.5.
                    </p>
                    <div className="pt-2 flex gap-4 text-[10px] text-slate-500">
                      <span>Adesão (Compliance): <strong className="text-emerald-400">Sim</strong></span>
                      <span>Estabilidade de Humor: <strong className="text-emerald-400">Sim</strong></span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-bold text-slate-200">Sessão #3 — 22/06/2026</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Risco: Moderado</span>
                    </div>
                    <p className="text-xs text-slate-350 font-sans leading-relaxed">
                      Queixa principal de estresse agudo decorrente de pressões institucionais. Foi instruído a usar o SOS da plataforma em caso de picos de angústia. Indicamos o protocolo guiado de respiração em 4-2-6.
                    </p>
                    <div className="pt-2 flex gap-4 text-[10px] text-slate-500">
                      <span>Adesão (Compliance): <strong className="text-emerald-400">Sim</strong></span>
                      <span>Estabilidade de Humor: <strong className="text-red-400">Não</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Consent & Shared Access Controller */}
              <div className="lg:col-span-4 bg-slate-950/40 border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-blue-400" /> Chaves de Consentimento (LGPD)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Controle dinâmico dos profissionais autorizados a ler as anotações do prontuário:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Dra. Ana Silva (Psicóloga)</div>
                      <div className="text-[10px] text-slate-500">Autorizado em 11/06/2026</div>
                    </div>
                    <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Ativo</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Dr. Pedro Ramos (Psiquiatra)</div>
                      <div className="text-[10px] text-slate-500">Pendente de assinatura</div>
                    </div>
                    <span className="text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Pendente</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5 opacity-50">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Módulo de IA (IARA Engine)</div>
                      <div className="text-[10px] text-slate-500">Apenas variáveis não-sensíveis</div>
                    </div>
                    <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Seguro</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. INSTITUCIONAL LAYER */}
        {activeLayer === "institucional" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Corporate Summary Box */}
            <div className="bg-purple-950/20 border border-purple-500/15 p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/15 flex-shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-purple-300">Camada Institucional (Anônima e Agregada)</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  Permite que prefeituras, clínicas, hospitais ou empresas contratantes monitorem os indicadores gerais de saúde mental da sua população ou colaboradores. Nenhuma informação individual ou nota privada é visível, garantindo total segurança jurídica e conformidade com a LGPD.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Institutional KPIs Radial Chart */}
              <div className="lg:col-span-5 bg-slate-950/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white">KPIs de Saúde Organizacional</h3>
                  <p className="text-[10px] text-slate-500">Métricas acumuladas dos colaboradores/cidadãos ativos na plataforma.</p>
                </div>

                <div className="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={10} data={institutionalMockData}>
                      <RadialBar
                        label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 'bold' }}
                        background
                        dataKey="valor"
                      />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px" }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Engajamento</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Satisfação</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Adesão PCH</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Redução Estresse</span>
                </div>
              </div>

              {/* Corporate Health and Care continuity summary */}
              <div className="lg:col-span-7 bg-slate-950/40 border border-white/5 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Impacto Econômico e Clínico</h3>
                  <p className="text-[10px] text-slate-500">Demonstrativos consolidados de retorno de investimento (ROI) e prevenção.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Afastamentos Prevenidos</span>
                    <p className="text-2xl font-black text-emerald-400">32 Casos</p>
                    <p className="text-[10px] text-slate-500">Estimativa baseada em triagens com melhora de risco agudo.</p>
                  </div>

                  <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">ROI Estimado (Prevenção)</span>
                    <p className="text-2xl font-black text-purple-400">4.8 x</p>
                    <p className="text-[10px] text-slate-500">Economia em custos de sinistralidade de plano de saúde.</p>
                  </div>

                  <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Adesão Média a Consultas</span>
                    <p className="text-2xl font-black text-blue-400">92.4%</p>
                    <p className="text-[10px] text-slate-500">Presença estável nas consultas de psicologia clínica.</p>
                  </div>

                  <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Índice ICC Médio</span>
                    <p className="text-2xl font-black text-cyan-400">76.8 %</p>
                    <p className="text-[10px] text-slate-500">Engajamento consistente com hábitos preventivos diários.</p>
                  </div>
                </div>

                {/* Simulated tenant/organization switcher */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-xs text-slate-400">
                    Visualizando dados para: <strong className="text-purple-400">Prefeitura de Amostra SentiPae</strong>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:underline flex items-center gap-1 cursor-pointer">
                    Trocar Organização <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. IA LAYER */}
        {activeLayer === "ia" && (
          <div className="space-y-6 animate-fadeIn">
            {/* IA Context Overview Notice */}
            <div className="bg-cyan-950/30 border border-cyan-500/15 p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/15 flex-shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-cyan-300">Camada de IA (IARA Prompt Guard & Context Injector)</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  Aqui você vê exatamente quais parâmetros não-sensíveis do prontuário do paciente (metas, progresso do ICC, histórico de humor geral) são passados para a IARA personalizar as conversas e pílulas de <strong>Poesia Cognitiva Hipnótica (PCH)</strong> sem expor notas confidenciais.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* IA Safe Variables Panel */}
              <div className="lg:col-span-6 bg-slate-950/40 border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" /> Parâmetros de Injeção de Contexto
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Lista de variáveis filtradas e limpas repassadas ao modelo LLM (Gemini 2.5 Flash / Live API) a cada turno de conversa.
                </p>

                <div className="space-y-3 font-mono text-[11px] bg-slate-950 p-4 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-purple-400 font-bold">const</span> <span className="text-cyan-400">safeUserContext</span> = &#123;
                    <div className="pl-4 text-slate-400">
                      nome_curto: <span className="text-green-400">&quot;{iaSafeContext.identificadoresSeguros.nome_abreviado}&quot;</span>,<br />
                      faixa_etaria: <span className="text-green-400">&quot;{iaSafeContext.identificadoresSeguros.idade_faixa}&quot;</span>,<br />
                      antiguidade: <span className="text-green-400">&quot;{iaSafeContext.identificadoresSeguros.tempo_plataforma}&quot;</span>
                    </div>
                    &#125;;
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <span className="text-purple-400 font-bold">const</span> <span className="text-cyan-400">emotionalStatus</span> = &#123;
                    <div className="pl-4 text-slate-400">
                      humor_7d_medio: <span className="text-green-400">&quot;{iaSafeContext.humorRecente.medio_7d}&quot;</span>,<br />
                      estabilidade_humor: <span className="text-green-400">&quot;{iaSafeContext.humorRecente.estabilidade}&quot;</span>,<br />
                      tom_predominante: <span className="text-green-400">&quot;{iaSafeContext.humorRecente.predominante}&quot;</span>
                    </div>
                    &#125;;
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <span className="text-purple-400 font-bold">const</span> <span className="text-cyan-400">safetyGuards</span> = &#123;
                    <div className="pl-4 text-slate-400">
                      crise_alerta: <span className="text-green-400">&quot;{iaSafeContext.seguranca.alerta_crise}&quot;</span>,<br />
                      escalar_profissional: <span className="text-green-400">false</span>,<br />
                      palavras_bloqueadas: <span className="text-green-400">&quot;nenhuma&quot;</span>
                    </div>
                    &#125;;
                  </div>
                </div>
              </div>

              {/* Gemini PCH Generative Simulator */}
              <div className="lg:col-span-6 bg-slate-950/40 border border-white/5 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Simulação de Geração de Metáfora (PCH)
                  </h3>
                  <p className="text-[10px] text-slate-400">Como a IARA utiliza o contexto acima para criar uma pílula poética personalizada.</p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-cyan-500/10 rounded-2xl text-xs space-y-3 leading-relaxed text-slate-300 font-sans italic">
                  <p>
                    &quot;Como as correntes invisíveis que sustentam a âncora nas profundezas do oceano, a sua respiração hoje é o cabo de aço que impede a sua mente de derivar nas tempestades. Ao fechar os olhos nesta noite, sinta o peso firme da terra sob seus pés. Você está seguro. Você está ancorado.&quot;
                  </p>
                  <div className="pt-2 border-t border-white/5 flex justify-between text-[9px] font-mono font-bold text-cyan-400">
                    <span>Módulo: Metáfora de Ancoragem</span>
                    <span>Consonância: 96.4%</span>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <RefreshCw className="w-3.5 h-3.5" /> Re-calibrar Metáfora
                  </button>
                  <button className="py-2.5 px-4 bg-slate-850 hover:bg-slate-800 border border-white/5 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Ver Prompt Completo
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
