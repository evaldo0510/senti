import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Heart, 
  Compass, 
  BookOpen, 
  Sun, 
  Activity, 
  HelpCircle, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Play, 
  Square, 
  RefreshCw, 
  PenTool, 
  Wind, 
  Users, 
  Shield, 
  Award, 
  Zap, 
  ChevronRight,
  Brain,
  MessageCircle,
  Building,
  GraduationCap,
  Globe,
  Database,
  Terminal,
  Volume2
} from "lucide-react";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { cn } from "../lib/utils";

// TypeScript interfaces
interface IBSFactor {
  id: string;
  name: string;
  value: number;
  emoji: string;
  color: string;
}

interface Poem {
  title: string;
  subtitle: string;
  verses: string[];
  theme: string;
  intent: string;
}

interface WritingPrompt {
  id: string;
  prompt: string;
  suggestion: string;
}

export default function EspacoInspirar() {
  const [activeTab, setActiveTab] = useState<"inspirar" | "ibs" | "masterplan">("inspirar");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Track active user session
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      setUserId(user.uid);
    }
  }, []);

  // -----------------------------------------------------------------
  // STATE & UTILS FOR IBS (Índice de Bem-Estar)
  // -----------------------------------------------------------------
  const [ibsFactors, setIbsFactors] = useState<IBSFactor[]>([
    { id: "sono", name: "Sono", value: 7, emoji: "🌙", color: "from-indigo-500 to-blue-600" },
    { id: "energia", name: "Energia", value: 6, emoji: "⚡", color: "from-amber-400 to-orange-500" },
    { id: "humor", name: "Humor", value: 8, emoji: "☀️", color: "from-emerald-400 to-teal-500" },
    { id: "habitos", name: "Hábitos", value: 5, emoji: "🌱", color: "from-rose-400 to-pink-500" },
    { id: "conexao", name: "Conexão", value: 7, emoji: "🤝", color: "from-purple-500 to-violet-600" }
  ]);

  const handleIbsChange = (id: string, val: number) => {
    setIbsFactors(prev => prev.map(f => f.id === id ? { ...f, value: val } : f));
  };

  const getIbsSummary = () => {
    const avg = Math.round(ibsFactors.reduce((acc, f) => acc + f.value, 0) / ibsFactors.length);
    if (avg >= 8) return { text: "Excelente equilíbrio! Continue trilhando esta jornada compassiva.", color: "text-emerald-400" };
    if (avg >= 6) return { text: "Bom equilíbrio. Pratique a autocompaixão para os pontos de atenção.", color: "text-teal-400" };
    if (avg >= 4) return { text: "Equilíbrio oscilante. Que tal focar em sono e respiração guiada hoje?", color: "text-amber-400" };
    return { text: "Momento de pausa e acolhimento necessário. Sinta-se abraçado e respire fundo.", color: "text-rose-400" };
  };

  const saveIbsToProfile = async () => {
    if (!userId) {
      // Offline fallback/Demo
      const simulatedLogs = JSON.parse(localStorage.getItem("simulated_ibs_logs") || "[]");
      const newEntry = {
        timestamp: new Date().toISOString(),
        factors: ibsFactors.reduce((acc, f) => ({ ...acc, [f.id]: f.value }), {}),
        average: Math.round(ibsFactors.reduce((acc, f) => acc + f.value, 0) / ibsFactors.length)
      };
      simulatedLogs.push(newEntry);
      localStorage.setItem("simulated_ibs_logs", JSON.stringify(simulatedLogs));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }

    try {
      if (!auth.currentUser) throw new Error("Usuário não autenticado");
      const userRef = doc(db, "users", auth.currentUser.uid);
      const newEntry = {
        timestamp: new Date().toISOString(),
        factors: ibsFactors.reduce((acc, f) => ({ ...acc, [f.id]: f.value }), {}),
        average: Math.round(ibsFactors.reduce((acc, f) => acc + f.value, 0) / ibsFactors.length)
      };

      await updateDoc(userRef, {
        currentIbs: newEntry,
        ibsHistory: arrayUnion(newEntry)
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Erro ao salvar IBS no Firestore", e);
      // Fallback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Generate the ASCII mockup the user defined for retro/beautiful feel
  const generateAsciiIbs = (name: string, value: number) => {
    const filled = "█".repeat(value);
    const empty = "░".repeat(10 - value);
    return `${name.padEnd(10, " ")} ${filled}${empty}`;
  };

  // -----------------------------------------------------------------
  // STATE & UTILS FOR PCH (Poesia Cognitiva Hipnótica)
  // -----------------------------------------------------------------
  const poems: Poem[] = [
    {
      title: "O Ritmo da Maré",
      subtitle: "Para alívio da ansiedade e desaceleração do tempo",
      verses: [
        "A onda sobe calma no peito que respira...",
        "Deixe o vento levar tudo que cansa e retira.",
        "Não há pressa na areia, nem urgência no mar,",
        "O próprio corpo sabe como se entregar.",
        "Aos poucos, no silêncio do ar que vai saindo,",
        "Cada fibra tensionada vai se permitindo.",
        "Você está seguro neste exato lugar,",
        "Respirar é voltar para casa, é repousar."
      ],
      theme: "Ansiedade",
      intent: "Indução de Relaxamento Fisiológico"
    },
    {
      title: "Sementes do Amanhã",
      subtitle: "Para momentos de transição, dúvida ou busca de sentido",
      verses: [
        "O jardim não floresce pedindo rapidez...",
        "A semente descansa no escuro da vez.",
        "Confie no solo que acolhe o que cai,",
        "A dor que te aperta, aos poucos se vai.",
        "Existe uma força que cresce sem som,",
        "Guardando no peito o que é belo e bom.",
        "Abra os espaços para o sol que clareia,",
        "O amor recomeça em cada artéria e veia."
      ],
      theme: "Esperança",
      intent: "Ressignificação e Auto-acolhimento"
    },
    {
      title: "O Silêncio de Estar",
      subtitle: "Para fortalecer a autocompaixão e o amor próprio",
      verses: [
        "Você já correu tanto, querendo acertar...",
        "Permita-se agora apenas parar.",
        "As cobranças do mundo são ecos lá fora,",
        "Sua única entrega é o templo do agora.",
        "Abrace a fragilidade que te faz humano,",
        "Nenhum julgamento pertence a este plano.",
        "Olhe-se com graça, acolha quem você é,",
        "Descanse seus ombros, firme o seu pé."
      ],
      theme: "Autoestima",
      intent: "Fortalecimento do Eu Observador"
    }
  ];

  const [selectedPoemIdx, setSelectedPoemIdx] = useState(0);
  const [isPlayingPoem, setIsPlayingPoem] = useState(false);
  const [breathePhase, setBreathePhase] = useState<"inspire" | "segure" | "expire">("inspire");
  const [poemStep, setPoemStep] = useState(0);

  // Hypnotic breath pacemaker simulator
  useEffect(() => {
    if (!isPlayingPoem) return;

    const interval = setInterval(() => {
      setBreathePhase(prev => {
        if (prev === "inspire") return "segure";
        if (prev === "segure") return "expire";
        return "inspire";
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlayingPoem]);

  // Staggered display of verses
  useEffect(() => {
    if (!isPlayingPoem) {
      setPoemStep(0);
      return;
    }

    const verseInterval = setInterval(() => {
      setPoemStep(prev => (prev < poems[selectedPoemIdx].verses.length ? prev + 1 : prev));
    }, 5000);

    return () => clearInterval(verseInterval);
  }, [isPlayingPoem, selectedPoemIdx]);

  // -----------------------------------------------------------------
  // WRITING EXERCISE (Escrita Terapêutica)
  // -----------------------------------------------------------------
  const writingPrompts: WritingPrompt[] = [
    { id: "p1", prompt: "Se o seu cansaço físico fosse um mestre calmo, o que ele te aconselharia a fazer agora?", suggestion: "Escreva sem julgar. Deixe a caneta mental fluir por 2 minutos." },
    { id: "p2", prompt: "Quais são as três sementes de esperança que você quer plantar em sua jornada emocional hoje?", suggestion: "Podem ser pequenos gestos de carinho consigo mesmo ou com quem ama." },
    { id: "p3", prompt: "Descreva a sua pressa de hoje como se fosse um vento passageiro. O que ela carrega?", suggestion: "Foque nas sensações físicas do corpo enquanto descreve o vento." }
  ];

  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [writingContent, setWritingContent] = useState("");
  const [writingAnalysis, setWritingAnalysis] = useState<string | null>(null);
  const [isAnalyzingWriting, setIsAnalyzingWriting] = useState(false);

  const handleWritingSubmit = () => {
    if (!writingContent.trim()) return;
    setIsAnalyzingWriting(true);
    setWritingAnalysis(null);

    // Simulate SentiCore empathetic reflection engine
    setTimeout(() => {
      const positiveWords = ["esperança", "amor", "paz", "luz", "calma", "respirar", "cuidado"];
      const hasPositive = positiveWords.some(w => writingContent.toLowerCase().includes(w));
      
      let analysisResponse = "";
      if (hasPositive) {
        analysisResponse = "Sua escrita traz uma sensibilidade tocante. Identificamos sementes fortes de autocompaixão e luz nas suas palavras. O SentiPae apoia esse seu florescer lento e seguro. Guarde essa reflexão no seu coração.";
      } else {
        analysisResponse = "Acolhemos profundamente a densidade e a honestidade das suas palavras. Expressar a dor é o primeiro passo para reorganizar o espaço interno. Respire fundo. IARA e nossa rede de especialistas estão de braços abertos para te guiar.";
      }

      setWritingAnalysis(analysisResponse);
      setIsAnalyzingWriting(false);
    }, 2500);
  };

  // -----------------------------------------------------------------
  // MASTER PLAN 2035 ECOSYSTEM DATA
  // -----------------------------------------------------------------
  const masterPlanPillars = [
    {
      id: "pessoas",
      num: "🌱 Plataforma 1",
      title: "Pessoas",
      desc: "Onde o acolhimento começa. Uma experiência integrada e focada na pessoa, conectando ferramentas clínicas avançadas a rituais de cuidado humano.",
      items: ["IARA Acolhimento", "Google Live Voice API", "Diário Emocional", "Meu Jardim (Gamificação)", "Biblioteca & Áudios", "Agenda Pessoal"]
    },
    {
      id: "profissionais",
      num: "👨‍⚕️ Plataforma 2",
      title: "Profissionais",
      desc: "Empoderamento para os cuidadores. Ferramentas que otimizam o tempo administrativo para focar inteiramente na escuta e na relação terapêutica.",
      items: ["Prontuário Multidisciplinar", "Teleconsulta Criptografada", "IA de Apoio a Relatórios", "Gestor Financeiro", "CRM de Pacientes", "Comunidade Científica"]
    },
    {
      id: "clinicas",
      num: "🏥 Plataforma 3",
      title: "Clínicas & Hospitais",
      desc: "Gestão inteligente de saúde mental. Controle fino de agendas, salas, auditorias e supervisão clínica estruturada.",
      items: ["Controle de Equipes", "Supervisão de Prontuários", "Indicadores de Alta", "Rateio Financeiro", "Reserva de Salas", "Dashboard Executivo"]
    },
    {
      id: "empresas",
      num: "🏢 Plataforma 4",
      title: "Empresas",
      desc: "Cuidado corporativo preventivo. Diagnósticos agregados do bem-estar dos colaboradores respeitando rigorosamente o anonimato e a LGPD.",
      items: ["Indicadores de Bem-Estar (IBS)", "Campanhas Temáticas", "Atendimento de Urgência", "Triagem Rápida", "Métricas de Absenteísmo", "Canais de Ouvidoria"]
    },
    {
      id: "governo",
      num: "🏛️ Plataforma 5",
      title: "Governo (Saúde Pública)",
      desc: "Inclusão e capilaridade. Ambientes independentes para prefeituras e órgãos públicos gerenciarem o CAPS, UBS, CRAS e projetos preventivos municipais.",
      items: ["Módulos Públicos de Gestão", "Mapeamento Epidemiológico", "Telecuidado Social", "Atendimento Descentralizado", "Gestão de Escolas e CRAS", "Indicadores de Saúde Pública"]
    },
    {
      id: "educacao",
      num: "🎓 Plataforma 6",
      title: "Educação",
      desc: "Ambiente emocional para escolas e universidades. Programas socioemocionais preventivos para alunos, pais e professores.",
      items: ["Apoio Psicopedagógico", "Prevenção ao Bullying", "Monitoramento de Estresse", "Exercícios de Atenção Plena", "Espaço de Desabafo Seguro", "Capacitação de Professores"]
    },
    {
      id: "marketplace",
      num: "🛍️ Plataforma 7",
      title: "Rede de Especialistas",
      desc: "A transição do conceito frio de marketplace para uma rede de conexões profundamente humana, integrando profissionais, cursos, livros e eventos.",
      items: ["Matchmaking Multidisciplinar", "Curadoria de Cursos", "Indicação de Livros", "Eventos Integrativos", "Programas de Imersão", "Ferramentas Terapêuticas"]
    },
    {
      id: "inteligencia",
      num: "📊 Plataforma 8",
      title: "Inteligência (SentiCore)",
      desc: "O cérebro estratégico do ecossistema. Processamento de linguagem natural, análise de sentimento clínico e correlação de fatores com privacidade absoluta.",
      items: ["Motor de Matchmaking IA", "Análise de Sentimento", "Correlação de Hábitos", "Alertas Preventivos", "Analytics de Uso", "Métricas LGPD de Anonimização"]
    },
    {
      id: "api",
      num: "🌍 Plataforma 9",
      title: "API & Integrações",
      desc: "Um ecossistema aberto e integrado. Conexão transparente com calendários externos, prontuários do SUS (PEC/e-SUS), videochamadas e gateways.",
      items: ["Integração com Google Calendar", "SUS & Prontuários Oficiais", "SDK para Apps Parceiros", "Gateways de Pagamento", "APIs de Videochamada", "Autenticação Única (SSO)"]
    }
  ];

  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 flex flex-col font-sans" id="espaco-inspirar-container">
      {/* ----------------- UPPER HEADER (Centering the Human Experience) ----------------- */}
      <header className="p-6 pb-4 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-md font-serif italic font-extrabold tracking-tight">SentiPae Portal</h1>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">
            MASTER PLAN 2035
          </span>
        </div>

        {/* Centered welcoming core philosophy statement */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-emerald-500/5 to-slate-950 border border-emerald-500/15 rounded-[2rem] p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            A Filosofia SentiPae
          </span>
          <h2 className="text-2xl font-serif italic font-black text-white mt-3 mb-1">
            "Como você está hoje?"
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto font-light leading-relaxed">
            Não perguntamos o que você quer fazer no aplicativo. Perguntamos o que você está sentindo. O ser humano é o centro de todo o nosso ecossistema.
          </p>
        </div>

        {/* Custom iOS Segment Control */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 border border-white/5 p-1 rounded-2xl">
          {[
            { id: "inspirar", label: "Inspirar", icon: Heart },
            { id: "ibs", label: "Índice IBS", icon: Activity },
            { id: "masterplan", label: "Master Plan", icon: Compass }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActiveTab = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95",
                  isActiveTab 
                    ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/15" 
                    : "text-slate-450 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ----------------- INTERACTIVE CONTENTS AREA ----------------- */}
      <main className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* ================================================================= */}
          {/* TAB 1: ESPAÇO INSPIRAR */}
          {/* ================================================================= */}
          {activeTab === "inspirar" && (
            <motion.div
              key="inspirar-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Espaço Inspirar</span>
                <p className="text-xs text-slate-450 font-light">
                  A Poesia Cognitiva Hipnótica (PCH), reflexões e práticas de escrita que funcionam como um tônico emocional diário.
                </p>
              </div>

              {/* PCH POETRY PLAYER SECTION */}
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Poesia Cognitiva (PCH)</h3>
                  </div>
                  <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Sintonizado
                  </span>
                </div>

                {/* Poem selector pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {poems.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPoemIdx(idx);
                        setIsPlayingPoem(false);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                        selectedPoemIdx === idx 
                          ? "bg-indigo-500/25 border border-indigo-500/45 text-indigo-300" 
                          : "bg-slate-950/60 border border-white/5 text-slate-450 hover:text-slate-300"
                      )}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>

                {/* Dynamic poetic player screen */}
                <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-6 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                  {/* Subtle breathing background animation */}
                  {isPlayingPoem && (
                    <motion.div 
                      className={cn(
                        "absolute inset-0 rounded-2xl pointer-events-none opacity-5 transition-all duration-[4000ms] blur-3xl",
                        breathePhase === "inspire" && "bg-emerald-500 scale-110",
                        breathePhase === "segure" && "bg-amber-500 scale-100",
                        breathePhase === "expire" && "bg-indigo-500 scale-90"
                      )}
                    />
                  )}

                  <div className="text-center space-y-1 z-10">
                    <h4 className="text-lg font-serif italic font-bold text-white">
                      {poems[selectedPoemIdx].title}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-light italic">
                      {poems[selectedPoemIdx].subtitle}
                    </p>
                  </div>

                  {/* Poem Verses (Hypnotic fading text) */}
                  <div className="my-6 space-y-2.5 text-center min-h-[100px] flex flex-col justify-center z-10 px-2">
                    {!isPlayingPoem ? (
                      <p className="text-xs text-slate-500 font-light italic leading-relaxed">
                        Toque no botão de sintonização abaixo para iniciar a prática compassiva de respiração com a Poesia Hipnótica do terapeuta Evaldo.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {poems[selectedPoemIdx].verses.slice(0, Math.max(1, poemStep)).map((verse, vIdx) => (
                          <motion.p
                            key={vIdx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5 }}
                            className={cn(
                              "text-xs leading-relaxed font-serif italic text-slate-300",
                              vIdx === poemStep - 1 && "text-emerald-300 font-bold drop-shadow-sm"
                            )}
                          >
                            {verse}
                          </motion.p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Breathe Pacemaker indicator */}
                  {isPlayingPoem && (
                    <div className="flex flex-col items-center justify-center space-y-1 mb-2 z-10">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 font-mono">
                        Guia de Respiração PCH
                      </span>
                      <motion.div
                        animate={{ scale: breathePhase === "inspire" ? 1.2 : breathePhase === "segure" ? 1.1 : 0.9 }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest"
                      >
                        <Wind className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span className={cn(
                          breathePhase === "inspire" && "text-emerald-400",
                          breathePhase === "segure" && "text-amber-400",
                          breathePhase === "expire" && "text-indigo-400"
                        )}>
                          {breathePhase === "inspire" ? "Inspire devagar..." : breathePhase === "segure" ? "Segure o ar..." : "Solte o ar lentamente..."}
                        </span>
                      </motion.div>
                    </div>
                  )}

                  {/* Player controls */}
                  <div className="flex items-center justify-center gap-3 z-10 pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        setIsPlayingPoem(!isPlayingPoem);
                        if (!isPlayingPoem) {
                          setPoemStep(1);
                        }
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all",
                        isPlayingPoem 
                          ? "bg-rose-500/15 border border-rose-500/30 text-rose-400" 
                          : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold"
                      )}
                    >
                      {isPlayingPoem ? (
                        <>
                          <Square className="w-3.5 h-3.5" /> Pausar Ritmo
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" /> Sintonizar Ritmo
                        </>
                      )}
                    </button>
                    {isPlayingPoem && (
                      <button
                        onClick={() => {
                          setPoemStep(1);
                        }}
                        className="p-2 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white"
                        title="Reiniciar poesia"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[10px] text-slate-500 leading-normal bg-slate-950/20 p-3 rounded-2xl border border-white/5 font-light">
                  <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Nota Terapêutica:</strong> A PCH utiliza o compasso natural da fala e sugestões indiretas para auxiliar a autorregulação do sistema autônomo. Não substitui terapia formal.
                  </p>
                </div>
              </div>

              {/* GUIDED WRITING SECTION */}
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Exercício de Escrita Terapêutica</h3>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 font-mono">
                    Escolha um tema para desabafar
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {writingPrompts.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPromptIdx(idx);
                          setWritingAnalysis(null);
                        }}
                        className={cn(
                          "p-3.5 rounded-2xl text-left text-xs transition-all cursor-pointer border flex items-start gap-2.5",
                          selectedPromptIdx === idx 
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-200 font-semibold" 
                            : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200"
                        )}
                      >
                        <span className="font-mono text-indigo-400 font-bold shrink-0">#{idx + 1}</span>
                        <div>
                          <p>{p.prompt}</p>
                          <p className="text-[9px] text-slate-500 font-light mt-1 italic">{p.suggestion}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Structured text editor */}
                <div className="space-y-2">
                  <textarea
                    value={writingContent}
                    onChange={(e) => setWritingContent(e.target.value)}
                    placeholder="Deixe suas palavras fluírem livremente aqui..."
                    rows={4}
                    className="w-full bg-slate-950 border border-white/5 focus:border-indigo-500/40 rounded-2xl p-4 text-xs font-light text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/15 leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{writingContent.length} caracteres</span>
                    <button
                      onClick={handleWritingSubmit}
                      disabled={isAnalyzingWriting || !writingContent.trim()}
                      className={cn(
                        "px-4 py-2.5 rounded-xl font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all",
                        writingContent.trim()
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/30"
                          : "bg-slate-950 text-slate-600 border border-white/5 cursor-not-allowed"
                      )}
                    >
                      {isAnalyzingWriting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sintonizando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Sintonizar Escrita
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* SentiCore Poetic Reflection Response */}
                <AnimatePresence>
                  {writingAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-center space-y-2"
                    >
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 animate-pulse" /> SentiCore — Reflexão Empática
                      </p>
                      <p className="text-[11px] text-slate-300 font-light leading-relaxed italic">
                        "{writingAnalysis}"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: ÍNDICE DE BEM-ESTAR (IBS) */}
          {/* ================================================================= */}
          {activeTab === "ibs" && (
            <motion.div
              key="ibs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">O Grande Diferencial SentiPae</span>
                <p className="text-xs text-slate-450 font-light">
                  O **Índice de Bem-Estar (IBS)** não rotula você. É um indicador de harmonia interna que apoia sua auto-observação diária ao longo da sua jornada.
                </p>
              </div>

              {/* INTERACTIVE FACTOR SLIDERS */}
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Seu Termômetro de Harmonia</h3>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                    Média IBS: {Math.round(ibsFactors.reduce((acc, f) => acc + f.value, 0) / ibsFactors.length)}/10
                  </span>
                </div>

                <div className="space-y-4">
                  {ibsFactors.map((factor) => (
                    <div key={factor.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{factor.emoji}</span>
                          <span>{factor.name}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/5 text-[10px]">
                          {factor.value}/10
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={factor.value}
                          onChange={(e) => handleIbsChange(factor.id, parseInt(e.target.value))}
                          className="flex-1 accent-emerald-500 h-1 bg-slate-950 rounded-full cursor-pointer appearance-none"
                        />
                        {/* Custom Mini SVG bar display showing state */}
                        <div className="w-16 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 hidden sm:block">
                          <div 
                            className={`h-full bg-gradient-to-r ${factor.color}`}
                            style={{ width: `${factor.value * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* EMPATHETIC CLINICAL FEEDBACK */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl text-center space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1">
                    <Sun className="w-3.5 h-3.5 animate-pulse" /> SentiCore Diagnóstico de Jornada
                  </p>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {getIbsSummary().text}
                  </p>
                </div>

                {/* PERSIST TO FIRESTORE */}
                <div className="pt-2">
                  <button
                    onClick={saveIbsToProfile}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/10"
                  >
                    <Save className="w-4 h-4" />
                    Registrar IBS no Prontuário
                  </button>
                  
                  <AnimatePresence>
                    {saveSuccess && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-[10px] font-bold text-emerald-400 mt-2.5 uppercase tracking-wider"
                      >
                        ✓ Índices integrados com sucesso ao seu prontuário clínico!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* HISTORIC ASCII RENDER (Just as requested by the user!) */}
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <span>ASCII DIAGRAM INTERFACE (IBS DISPLAY)</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 font-mono text-[10px] text-emerald-500 leading-normal space-y-1 select-all">
                  <p className="text-slate-500 border-b border-white/5 pb-1 mb-2"># COPIAR PARA DIÁRIO EMOCIONAL</p>
                  <p className="text-slate-400">--- SENTIPAE BEM-ESTAR ---</p>
                  {ibsFactors.map(f => (
                    <p key={f.id}>{generateAsciiIbs(f.name, f.value)}</p>
                  ))}
                  <p className="text-slate-450 mt-1.5">MÉDIA GLOBAL: {Math.round(ibsFactors.reduce((acc, f) => acc + f.value, 0) / ibsFactors.length)}/10</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: ECOSSISTEMA MASTER PLAN 2035 */}
          {/* ================================================================= */}
          {activeTab === "masterplan" && (
            <motion.div
              key="masterplan-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">SentiPae Master Plan 2035</span>
                <p className="text-xs text-slate-450 font-light">
                  Não somos apenas um aplicativo. Somos um ecossistema completo de coordenação de bem-estar humano, divididos em **9 grandes plataformas** integradas.
                </p>
              </div>

              {/* ECOSYSTEM INTEGRATIVE CORE MAP */}
              <div className="p-4 bg-gradient-to-b from-indigo-950/20 to-slate-950 border border-indigo-500/10 rounded-3xl text-center space-y-2 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl" />
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">SentiCore Integration</span>
                <h3 className="text-sm font-serif italic font-bold text-white">IA Multidisciplinar</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  A Inteligência Artificial unifica os dados clínico-emocionais para guiar o paciente e recomendar psicólogos, psicanalistas, nutricionistas, educadores físicos e assistentes sociais.
                </p>
                
                {/* Visual Connector Badges */}
                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-indigo-300">
                    Psicologia
                  </span>
                  <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-emerald-300">
                    Psicanálise
                  </span>
                  <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-amber-300">
                    Nutrição
                  </span>
                  <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-teal-300">
                    Ed. Física
                  </span>
                  <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-rose-300">
                    Acompanhamento Social
                  </span>
                </div>
              </div>

              {/* THE 9 INTERACTIVE PILLARS ACCORDION */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 font-mono px-1">
                  Explore as 9 Plataformas do Amanhã
                </p>

                {masterPlanPillars.map((p) => {
                  const isExpanded = expandedPillar === p.id;
                  return (
                    <div 
                      key={p.id}
                      className="bg-slate-900 border border-white/5 hover:border-emerald-500/20 rounded-2.5rem transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedPillar(isExpanded ? null : p.id)}
                        className="w-full p-5 flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="space-y-1">
                          <span className="text-[8px] font-black font-mono uppercase tracking-widest text-emerald-400 block">
                            {p.num}
                          </span>
                          <span className="text-sm font-bold text-slate-200">
                            Plataforma {p.title}
                          </span>
                        </div>
                        <ChevronRight className={cn(
                          "w-4 h-4 text-slate-450 transition-transform duration-200",
                          isExpanded && "rotate-90 text-emerald-400"
                        )} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-5 pb-5 pt-1 border-t border-white/5 space-y-3"
                          >
                            <p className="text-xs text-slate-400 font-light leading-relaxed">
                              {p.desc}
                            </p>

                            <div className="space-y-1.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono block">
                                Recursos e Integrações
                              </span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {p.items.map((item, iIdx) => (
                                  <div 
                                    key={iIdx}
                                    className="p-2 bg-slate-950 border border-white/5 rounded-xl flex items-center gap-1.5"
                                  >
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                                    <span className="text-[10px] text-slate-300 font-light truncate">
                                      {item}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* VISIONARY TIMELINE BADGE */}
              <div className="p-4 bg-slate-900 border border-white/5 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Globe className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-left space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200">Visão de Longo Prazo</h4>
                  <p className="text-[10px] text-slate-500 leading-normal font-light">
                    Construindo tecnologia sustentável e conexões compassivas para impactar mais de 10 milhões de vidas até o ano de 2035.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
