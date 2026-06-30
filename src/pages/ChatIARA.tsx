import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Send, 
  ArrowLeft, 
  HeartHandshake, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Image as ImageIcon, 
  Mic, 
  Book, 
  MessageCircle, 
  Calendar, 
  Search, 
  Heart, 
  Trash2, 
  Sparkles, 
  Activity, 
  BookOpen, 
  X, 
  Brain, 
  Users, 
  Briefcase, 
  Building2, 
  Compass, 
  Smile, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import IARAChat from "../components/IARAChat";
import { iaraHistoryService, IaraConversation } from "../services/iaraHistoryService";
import { useAuth } from "../components/AuthProvider";

interface Step {
  id: number;
  label: string;
  completed?: boolean;
  active?: boolean;
}

export default function ChatIARA() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { intensidade, emocao, initialMessage, context, therapistName, therapistId } = location.state || {};

  // View States
  const [activeView, setActiveView] = useState<"central" | "chat">("central");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  const [specialization, setSpecialization] = useState<string>("geral");
  const [autoStartVoice, setAutoStartVoice] = useState(false);

  // Overlays & Progress
  const [alerta, setAlerta] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showHumanOffer, setShowHumanOffer] = useState(false);
  const [offerReason, setOfferReason] = useState("");
  const [currentStep, setCurrentStep] = useState(2);
  const [steps, setSteps] = useState<Step[]>([
    { id: 0, label: "Acolhimento", completed: true },
    { id: 1, label: "Avaliação", completed: true },
    { id: 2, label: "Triagem", active: true },
    { id: 3, label: "Direcionamento" }
  ]);

  // History states
  const [conversations, setConversations] = useState<IaraConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Load conversations on component mount or view change
  const loadConversations = async () => {
    try {
      const list = await iaraHistoryService.fetchConversations();
      setConversations(list);
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [activeView, user]);

  const handleRiscoAlto = () => {
    setAlerta(true);
    setSteps(prev => prev.map(s => 
      s.id === 2 ? { ...s, active: false, completed: true } : 
      s.id === 3 ? { ...s, active: true, label: "EMERGÊNCIA" } : s
    ));
    setCurrentStep(3);
  };

  const handleIARAResponseForCriticalMoments = (result: any) => {
    const lastUserMessage = result.userMessage?.toLowerCase() || "";
    const lastIaraMessage = result.resposta?.toLowerCase() || "";
    
    const distressKeywords = [
      "me matar", "suicídio", "não aguento mais", "desespero", "morrer", "sozinho", 
      "vazio enorme", "tristeza profunda", "preciso de psicólogo", "terapeuta", 
      "consulta", "agendar", "sessão", "atendimento humano", "médico", "psiquiatra"
    ];

    const hasDistressKeyword = distressKeywords.some(keyword => 
      lastUserMessage.includes(keyword) || lastIaraMessage.includes(keyword)
    );

    if (result.risco === "alto" || result.direcionarEspecialista || hasDistressKeyword) {
      setOfferReason(
        result.risco === "alto" 
          ? "Identificamos um momento de sofrimento intenso. Nossa rede de terapeutas está de braços abertos para te acolher de forma direta." 
          : "A IARA sugere que conversar com um profissional humano trará o aconchego ideal e o suporte especializado para você agora."
      );
      setShowHumanOffer(true);
    }
  };

  const handleDirecionar = (especialidade: string) => {
    setIsTransitioning(true);
    setSteps(prev => prev.map(s => 
      s.id === 2 ? { ...s, active: false, completed: true } : 
      s.id === 3 ? { ...s, active: true } : s
    ));
    setCurrentStep(3);
    setTimeout(() => {
      navigate(`/profissionais?tipo=${especialidade || "geral"}`);
    }, 5000);
  };

  // Quick Mood Selection Initiation
  const moods = [
    { label: "Feliz", emoji: "😊", color: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-300", message: "Olá IARA! Hoje estou me sentindo muito feliz e gostaria de compartilhar e refletir sobre essa energia positiva.", response: "Que notícia maravilhosa! Fico muito feliz em saber disso... Me conte, o que trouxe esse sorriso para o seu dia hoje?" },
    { label: "Neutro", emoji: "😐", color: "bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/20 text-slate-300", message: "Olá IARA. Hoje estou me sentindo neutro, apenas buscando um momento de calma e clareza.", response: "Compreendo perfeitamente... Estar neutro é um ótimo momento para respirar e apenas 'ser'... Como está sua mente neste momento?" },
    { label: "Triste", emoji: "😔", color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-300", message: "Olá IARA. Hoje estou me sentindo triste e com pensamentos um pouco pesados.", response: "Estou aqui com você... sinto muito que as coisas estejam cinzentas hoje. Respire fundo... o que tem pesado no seu coração?" },
    { label: "Ansioso", emoji: "😟", color: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300", message: "Olá IARA. Estou me sentindo bastante ansioso e com a mente acelerada.", response: "Estou aqui... você está seguro. Sinta o ar entrando e saindo bem devagar... Quer me contar o que está acelerando seus pensamentos?" },
    { label: "Estressado", emoji: "😤", color: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-300", message: "Olá IARA. Estou sob muito estresse e exaustão hoje.", response: "Sinto essa tensão... vamos soltar os ombros devagar. Você não precisa carregar o mundo sozinho agora... Qual o principal foco de estresse hoje?" },
    { label: "Cansado", emoji: "😴", color: "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 text-indigo-300", message: "Olá IARA. Me sinto extremamente exausto fisicamente e mentalmente.", response: "O cansaço pede pausa... feche os olhos por um segundo se puder. Estou aqui para te ouvir sem julgamentos. Como foi o seu dia?" },
    { label: "Preciso conversar", emoji: "😢", color: "bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/20 text-teal-300", message: "Olá IARA. Estou em um momento delicado e preciso conversar com alguém.", response: "Estou aqui para você de braços abertos... Fale o que vier à mente, no seu tempo. Estou escutando cada palavra com carinho..." }
  ];

  const handleMoodSelect = async (mood: typeof moods[0]) => {
    try {
      const title = `Acolhimento: Sentindo-se ${mood.label}`;
      const id = await iaraHistoryService.createConversation(title, "geral");
      
      // Seed first user message and assistant reply to save in history
      await iaraHistoryService.saveMessage(id, "user", mood.message);
      await iaraHistoryService.saveMessage(id, "iara", mood.response);

      setSelectedConversationId(id);
      setSpecialization("geral");
      setActiveMessages([
        { tipo: "user", texto: mood.message },
        { tipo: "iara", texto: mood.response }
      ]);
      setActiveView("chat");
    } catch (e) {
      console.error("Error creating mood-based conversation:", e);
    }
  };

  const handleStartVoiceCall = async () => {
    try {
      const title = "Chamada por Voz: Acolhimento";
      const id = await iaraHistoryService.createConversation(title, "geral");
      
      const welcomeText = "Olá, eu sou a IARA. Estou ouvindo você por voz em tempo real. Como posso acolher seu coração hoje?";
      await iaraHistoryService.saveMessage(id, "iara", welcomeText);

      setSelectedConversationId(id);
      setSpecialization("geral");
      setAutoStartVoice(true);
      setActiveMessages([
        { tipo: "iara", texto: welcomeText }
      ]);
      setActiveView("chat");
    } catch (e) {
      console.error("Error creating voice conversation:", e);
    }
  };

  // Shortcuts / Quick access cards
  const shortcuts = [
    { id: "ansiedade", label: "Ansiedade", icon: Brain, color: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15", welcome: "Olá! Sou a IARA e estou aqui com o canal focado em regulação da ansiedade e calma cognitiva... Como posso acolher sua mente hoje?" },
    { id: "relacionamentos", label: "Relacionamentos", icon: HeartHandshake, color: "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15", welcome: "Olá! Seja bem-vindo à nossa conversa especializada em relacionamentos, conexões e afetos... O que tem ocupado seu coração?" },
    { id: "trabalho", label: "Trabalho", icon: Briefcase, color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15", welcome: "Olá! Vamos refletir sobre sua jornada de trabalho, síndrome de burnout ou propósito profissional... O que gostaria de clarear hoje?" },
    { id: "familia", label: "Família", icon: Users, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/15", welcome: "Olá! Nosso porto seguro também nos traz grandes desafios emocionais. Como estão as relações em sua família ultimamente?" },
    { id: "sono", label: "Sono", icon: Sparkles, color: "text-teal-400 bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/15", welcome: "Olá! Vamos relaxar os pensamentos, soltar as tensões corporais e preparar sua mente para um sono profundo e reparador..." },
    { id: "autoconhecimento", label: "Autoconhecimento", icon: Compass, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15", welcome: "Olá! Cada passo da nossa reflexão nos ajuda a desvelar quem realmente somos. Qual aspecto de sua verdade interna quer explorar hoje?" },
    { id: "espiritualidade", label: "Espiritualidade", icon: Smile, color: "text-violet-400 bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/15", welcome: "Olá! Vamos nos sintonizar com o transcendente, a esperança e a paz existencial... O que sua essência está buscando neste momento?" },
    { id: "reflexao", label: "Reflexão", icon: BookOpen, color: "text-pink-400 bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/15", welcome: "Olá! Este é o seu refúgio para reflexões livres e poesia de alma... Escreva livremente o que estiver passando por você agora." }
  ];

  const handleShortcutSelect = async (shortcut: typeof shortcuts[0]) => {
    try {
      const title = `Foco: ${shortcut.label}`;
      const id = await iaraHistoryService.createConversation(title, shortcut.id);
      
      // Seed first welcome message
      await iaraHistoryService.saveMessage(id, "iara", shortcut.welcome);

      setSelectedConversationId(id);
      setSpecialization(shortcut.id);
      setActiveMessages([
        { tipo: "iara", texto: shortcut.welcome }
      ]);
      setActiveView("chat");
    } catch (e) {
      console.error("Error creating shortcut-based conversation:", e);
    }
  };

  // Preparation for Specialized IAs list (Channels architecture structure)
  const specializedIAs = [
    { name: "IA Ansiedade", icon: Brain, desc: "Aconselhamento e técnicas clínicas de PCH focadas em crises e transtornos ansiosos.", color: "from-amber-600/20 to-amber-900/20 border-amber-500/30 text-amber-300" },
    { name: "IA Relacionamentos", icon: HeartHandshake, desc: "Análise profunda de dilemas afetivos, dependência emocional e autoestima.", color: "from-rose-600/20 to-rose-900/20 border-rose-500/30 text-rose-300" },
    { name: "IA Adolescente", icon: Users, desc: "Linguagem e abordagem acolhedora específica para dilemas da juventude e transição.", color: "from-indigo-600/20 to-indigo-900/20 border-indigo-500/30 text-indigo-300" },
    { name: "IA Casais", icon: Users, desc: "Suporte consultivo para mediação de conflitos e comunicação assertiva conjugal.", color: "from-teal-600/20 to-teal-900/20 border-teal-500/30 text-teal-300" },
    { name: "IA Empresas", icon: Briefcase, desc: "Foco em produtividade saudável, burnout corporativo e inteligência emocional no trabalho.", color: "from-blue-600/20 to-blue-900/20 border-blue-500/30 text-blue-300" },
    { name: "IA Prefeituras", icon: Building2, desc: "Atendimento focado em políticas públicas, triagem de saúde da rede e acolhimento social.", color: "from-emerald-600/20 to-emerald-900/20 border-emerald-500/30 text-emerald-300" }
  ];

  // Continue historical conversation
  const handleContinueConversation = (conv: IaraConversation) => {
    setSelectedConversationId(conv.id);
    setSpecialization(conv.specialization || "geral");
    setActiveMessages(conv.messages || []);
    setActiveView("chat");
  };

  // Favorite toggle helper
  const handleToggleFavorite = async (e: React.MouseEvent, convId: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
      const newStatus = await iaraHistoryService.toggleFavorite(convId, currentStatus);
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, favorite: newStatus } : c));
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // Delete helper
  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente excluir esta conversa do seu histórico?")) {
      try {
        await iaraHistoryService.deleteConversation(convId);
        setConversations(prev => prev.filter(c => c.id !== convId));
        if (selectedConversationId === convId) {
          setSelectedConversationId(null);
          setActiveMessages([]);
          setActiveView("central");
        }
      } catch (err) {
        console.error("Error deleting conversation:", err);
      }
    }
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const titleMatch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const messageMatch = c.messages?.some(m => m.texto.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSearch = titleMatch || messageMatch;
      const matchesFavorite = filterFavorites ? c.favorite : true;
      return matchesSearch && matchesFavorite;
    });
  }, [conversations, searchQuery, filterFavorites]);

  const initialText = context === "scheduling" && therapistName 
    ? `Olá! Vi que você está interessado em agendar uma sessão com ${therapistName}. Eu sou a IARA e posso tirar suas dúvidas iniciais sobre o processo de agendamento ou sobre como funciona a terapia na SENTI. O que você gostaria de saber?`
    : initialMessage || "Olá. Eu sou a IARA, a inteligência de acolhimento da SENTI. Como você está se sentindo agora?";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-screen bg-[#0a0502] text-slate-100 relative overflow-hidden"
    >
      {/* Breathing Overlay */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="space-y-12 max-w-sm w-full">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-emerald-400 tracking-tighter">Respire com a IARA</h2>
                <p className="text-slate-400">Siga o movimento do círculo para estabilizar seu coração.</p>
              </div>
              
              <div className="relative flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 bg-emerald-500/20 rounded-full border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                />
                <motion.div 
                  animate={{ scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-24 h-24 bg-emerald-400/30 rounded-full blur-xl"
                />
                <div className="absolute text-emerald-400 font-bold tracking-widest uppercase text-xs">
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 8, repeat: Infinity, times: [0, 0.5, 1] }}
                  >
                    Inspira...
                  </motion.span>
                </div>
              </div>

              <button 
                onClick={() => setShowBreathing(false)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all"
              >
                Estou melhor, obrigado
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-6 right-6 z-[90] bg-emerald-600 p-6 rounded-[32px] shadow-2xl flex items-center gap-6 border border-emerald-400/30"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white text-lg leading-tight">Conectando com Especialista</h3>
              <p className="text-emerald-100 text-sm">A IARA identificou que você precisa de um acolhimento humano agora.</p>
            </div>
            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Human Transition Offer Modal */}
      <AnimatePresence>
        {showHumanOffer && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-emerald-500/30 p-6 md:p-8 rounded-[32px] max-w-md w-full shadow-2xl relative space-y-6"
            >
              <button 
                onClick={() => setShowHumanOffer(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center border border-emerald-500/25 animate-pulse">
                  <HeartHandshake className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight leading-tight">Cuidado Humano SentiPae</h3>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Apoio Profissional Integrado</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {offerReason || "Percebemos que uma conexão com um terapeuta humano seria extremamente benéfica para você neste momento."}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Oferecemos atendimento online humanizado, sigiloso e alinhado com a LGPD.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setShowHumanOffer(false);
                    navigate("/profissionais");
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Sessão de Terapia
                </button>
                
                <button
                  onClick={() => {
                    setShowHumanOffer(false);
                    navigate("/pronto-atendimento");
                  }}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-200 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/5 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Pronto Atendimento Online
                </button>

                <button
                  onClick={() => setShowHumanOffer(false)}
                  className="w-full py-3 text-slate-500 hover:text-slate-400 text-xs font-semibold transition-colors animate-pulse"
                >
                  Continuar conversando com a IARA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Progress Bar (Only shown in Chat View) */}
      {activeView === "chat" && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xs flex gap-2 px-6 z-50 pointer-events-none">
          {steps.map((s, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                s.completed || s.active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/20 backdrop-blur-xl sticky top-0 z-10 pt-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (activeView === "chat") {
                setActiveView("central");
                setSelectedConversationId(null);
                setActiveMessages([]);
              } else {
                navigate(-1);
              }
            }} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tighter text-emerald-400">IARA</h2>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest border border-emerald-500/20">
                {activeView === "chat" ? (specialization === "geral" ? "Acolhimento" : `Foco: ${specialization}`) : "Central Inteligente"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setShowBreathing(true)}
            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all border border-emerald-500/20 mr-1 flex items-center gap-1.5 text-xs font-bold"
            title="Exercício de Respiração"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">Respirar</span>
          </button>
          {context === "scheduling" && therapistId && (
            <button 
              onClick={() => navigate(`/agendamento/${therapistId}`)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-1.5"
            >
              <Calendar className="w-3 h-3" />
              Agendar Agora
            </button>
          )}
          <button 
            onClick={() => navigate("/diario")}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all border border-white/5"
            title="Ir para o Diário Emocional"
          >
            <Book className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {alerta && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/30 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 text-red-200 mb-4"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-300 mb-1">Você não está sozinho.</p>
              <p className="text-sm text-red-200/80 mb-3">Por favor, procure ajuda imediata. Existem pessoas prontas para te ouvir agora mesmo.</p>
              <a href="tel:188" className="inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors">
                Ligar 188 (CVV)
              </a>
            </div>
          </motion.div>
        )}

        {activeView === "central" ? (
          <div className="space-y-8 pb-12">
            {/* 1. Header Hero section */}
            <div className="text-center space-y-3 py-4">
              <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl mb-1">
                <HeartHandshake className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                IARA – Inteligência Artificial de Apoio Emocional
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Um espaço para organizar pensamentos, refletir e encontrar caminhos. A IARA não substitui profissionais de saúde, mas pode apoiar sua jornada.
              </p>
            </div>

            {/* 1.5. Chamada de Voz em Tempo Real Hero Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              onClick={handleStartVoiceCall}
              className="bg-gradient-to-r from-emerald-950/40 via-[#1a0f0a]/40 to-emerald-950/40 border border-emerald-500/20 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer shadow-xl relative overflow-hidden group"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
              
              <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-[24px] flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <Volume2 className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
                      Exclusivo SentiPae
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                      Hands-free
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    Fale com a IARA por Chamada de Voz
                  </h2>
                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                    Experimente uma conversa bidirecional fluida e acolhedora em tempo real, combinando inteligência de fala com o aconchego imediato da SENTI.
                  </p>
                </div>
              </div>

              <button 
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2 w-full md:w-auto justify-center"
              >
                Iniciar Chamada <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* 2. Check-in Emocional Rápido */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400/80">Como você está se sentindo hoje?</h3>
              <div className="flex flex-wrap gap-2">
                {moods.map((m, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleMoodSelect(m)}
                    className={`px-4 py-3 rounded-2xl border text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${m.color}`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 3. Shortcuts / Atalhos Inteligentes */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400/80">Atalhos de Acolhimento Temático</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {shortcuts.map((sc, i) => {
                  const IconComp = sc.icon;
                  return (
                    <motion.button
                      key={sc.id}
                      whileHover={{ y: -3, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleShortcutSelect(sc)}
                      className={`p-4 rounded-3xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center gap-2.5 transition-all hover:border-white/10 ${sc.color}`}
                    >
                      <div className="p-2.5 bg-white/5 rounded-2xl">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{sc.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 4. Preparation for Future Specialized agents */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400/80">Canais de IA Especializada</h3>
                <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-bold uppercase">Arquitetura de Expansão</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {specializedIAs.map((spec, idx) => {
                  const IconComp = spec.icon;
                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-3xl border bg-gradient-to-br ${spec.color} flex gap-3 relative overflow-hidden`}
                    >
                      <div className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full text-white/50">
                        Em breve
                      </div>
                      <div className="p-3 bg-white/5 rounded-2xl h-fit">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 pr-6">
                        <h4 className="text-sm font-bold text-slate-200">{spec.name}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{spec.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Histórico de Conversas */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400/80">Histórico de Sessões IARA</h3>
                
                {/* Search & Favorites Filter Toggle */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Pesquisar conversas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 focus:border-emerald-500/50 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none transition-all"
                    />
                  </div>
                  
                  <button
                    onClick={() => setFilterFavorites(!filterFavorites)}
                    className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs ${
                      filterFavorites 
                        ? "bg-red-500/10 border-red-500/30 text-red-400 font-bold" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                    title={filterFavorites ? "Mostrar todas" : "Mostrar apenas favoritos"}
                  >
                    <Heart className={`w-4 h-4 ${filterFavorites ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="hidden sm:inline">Favoritos</span>
                  </button>
                </div>
              </div>

              {filteredConversations.length === 0 ? (
                <div className="text-center py-10 bg-white/5 border border-white/5 rounded-3xl space-y-2">
                  <MessageCircle className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400 font-medium">Nenhuma conversa encontrada</p>
                  <p className="text-xs text-slate-500">Inicie uma nova conversa escolhendo um humor ou atalho acima!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleContinueConversation(conv)}
                      className="p-4 bg-white/5 border border-white/5 rounded-3xl hover:border-emerald-500/30 transition-all flex justify-between items-center cursor-pointer group"
                    >
                      <div className="space-y-1.5 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {conv.title}
                          </span>
                          <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded-md text-slate-400 uppercase tracking-wider font-bold">
                            {conv.specialization || "geral"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{conv.messages?.length || 0} interações</span>
                          <span>•</span>
                          <span>{new Date(conv.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleToggleFavorite(e, conv.id, conv.favorite)}
                          className="p-2 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                          title="Favoritar conversa"
                        >
                          <Heart className={`w-3.5 h-3.5 ${conv.favorite ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className="p-2 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="Excluir conversa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
            {/* Interactive IARA Chat */}
            <div className="flex-1 min-h-0 relative">
              <IARAChat 
                conversationId={selectedConversationId || undefined}
                initialMessages={activeMessages}
                specialization={specialization}
                onNewConversationCreated={(id) => setSelectedConversationId(id)}
                onRiscoAlto={handleRiscoAlto}
                onDirecionar={handleDirecionar}
                onIARARespond={handleIARAResponseForCriticalMoments}
                onBack={() => {
                  setActiveView("central");
                  setSelectedConversationId(null);
                  setActiveMessages([]);
                  setAutoStartVoice(false);
                }}
                autoStartVoiceMode={autoStartVoice}
                className="h-full"
              />
            </div>

            {/* Recommendations Section (Optional / Dismissible) */}
            <AnimatePresence>
              {showRecommendations && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-3xl relative"
                >
                  <button 
                    onClick={() => setShowRecommendations(false)}
                    className="absolute top-3 right-3 p-1 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Recursos e Recomendações Integradas</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                      Além da conversa acolhedora com a IARA, nosso pronto socorro emocional possui recursos adicionais para consolidar seu equilíbrio:
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
                      <button
                        onClick={() => navigate("/respiracao")}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-left border border-white/5 transition-all flex items-center gap-2 group"
                      >
                        <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-200">Exercício Clínico</p>
                          <p className="text-[8px] text-slate-400">Respiração guiada</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navigate("/home")}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-left border border-white/5 transition-all flex items-center gap-2 group"
                      >
                        <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-105 transition-transform">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-200">Biblioteca Senti</p>
                          <p className="text-[8px] text-slate-400">Artigos e leituras</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navigate("/diario")}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-left border border-white/5 transition-all flex items-center gap-2 group"
                      >
                        <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:scale-105 transition-transform">
                          <Smile className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-200">Diário Emocional</p>
                          <p className="text-[8px] text-slate-400">Registrar reflexões</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navigate("/profissionais")}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-left border border-white/5 transition-all flex items-center gap-2 group"
                      >
                        <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-xl group-hover:scale-105 transition-transform">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-200">Agendar Terapia</p>
                          <p className="text-[8px] text-slate-400">Falar com terapeuta</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
