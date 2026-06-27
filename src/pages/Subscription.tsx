import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Check, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ChevronUp, 
  ChevronDown,
  Star,
  Activity,
  HeartPulse,
  MessageCircle,
  Video,
  BookOpen,
  Calendar,
  Lock,
  Crown,
  CreditCard,
  Building,
  UserCheck
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../components/AuthProvider";
import { userService } from "../services/userService";
import { paymentService } from "../services/paymentService";

export default function Subscription() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'professional' | 'enterprise'>('premium');
  const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'mercadopago'>('stripe');

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getRemainingTrialDays = () => {
    if (!profile?.trialEndDate) return 0;
    const end = new Date(profile.trialEndDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      let checkoutResult;
      if (selectedProvider === "stripe") {
        checkoutResult = await paymentService.checkoutStripe(user.uid, selectedPlan, true);
      } else {
        checkoutResult = await paymentService.checkoutMercadoPago(user.uid, selectedPlan, true);
      }
      if (checkoutResult && checkoutResult.url) {
        navigate(checkoutResult.url);
      } else {
        throw new Error("Não foi possível gerar a URL de pagamento.");
      }
    } catch (error: any) {
      console.error("Erro ao assinar:", error);
      alert(error.message || "Ocorreu um erro ao processar sua assinatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: "premium" as const,
      name: "Plano Premium",
      price: "R$ 39,90",
      period: "mês",
      icon: Crown,
      description: "Acesso Premium individual com recursos de inteligência artificial ilimitada e relatórios profundos.",
      badge: "Mais Popular",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      features: [
        "Conversas ilimitadas com a IARA AI",
        "Diário emocional completo de sentimentos",
        "Exercícios de biofeedback e respiração",
        "Relatórios analíticos personalizados",
        "Suporte prioritário 24/7"
      ]
    },
    {
      id: "professional" as const,
      name: "Plano Profissional",
      price: "R$ 99,90",
      period: "mês",
      icon: UserCheck,
      description: "Perfeito para terapeutas independentes impulsionarem o atendimento e automatizarem a agenda.",
      badge: "Para Terapeutas",
      color: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400",
      features: [
        "Cadastro e Perfil Público na plataforma",
        "Sistema completo de agendamento de consultas",
        "Gestão clínica de pacientes e evolução",
        "Sincronização com o Google Calendar",
        "Canal exclusivo SENTI Go de urgências"
      ]
    },
    {
      id: "enterprise" as const,
      name: "Plano Institucional",
      price: "Orçamento",
      period: "negociável",
      icon: Building,
      description: "Destinado a Prefeituras, Secretarias de Saúde/Educação, Hospitais, Clínicas, Universidades e Empresas.",
      badge: "Público & Corporativo",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
      features: [
        "Painel administrativo institucional exclusivo (Multitenant)",
        "Cadastro e credenciamento de profissionais e usuários vinculados",
        "Dashboard de indicadores agregados (100% anônimos)",
        "Gestão ativa de campanhas de bem-estar emocional",
        "Suporte técnico prioritário e gerente de conta exclusivo",
        "Biblioteca institucional e biblioteca de conteúdos",
        "Precificação escalável por lotes: Até 100, 500 ou 1000 usuários"
      ]
    }
  ];

  const features = [
    { icon: MessageCircle, title: "IARA Ilimitada", desc: "Converse com nossa IA terapêutica sem restrições de mensagens." },
    { icon: Video, title: "Sessões de Vídeo", desc: "Acesso prioritário a sessões de vídeo com profissionais e IARA Live." },
    { icon: BookOpen, title: "Diário Avançado", desc: "Análise profunda de sentimentos e histórico ilimitado de registros." },
    { icon: Activity, title: "Relatórios de IA", desc: "Relatórios detalhados semanais sobre seu progresso emocional." },
    { icon: ShieldCheck, title: "Garantia SENTI", desc: "Proteção total em todos os seus agendamentos e transações." },
    { icon: Zap, title: "SENTI Go Prioritário", desc: "Conexão instantânea com terapeutas em menos de 60 segundos." },
    { icon: Calendar, title: "Google Calendar", desc: "Sincronização automática de todas as suas sessões e pílulas." },
    { icon: Crown, title: "Ferramentas Exclusivas", desc: "Acesso a todas as ferramentas premium desta sede e futuras atualizações." }
  ];

  const currentActivePlan = profile?.subscriptionPlan || 'trial';
  const isCurrentlyPremium = profile?.subscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative selection:bg-emerald-500/30">
      {/* Header */}
      <header className="px-4 py-4 sm:p-6 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-md z-40 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-3 -ml-2 hover:bg-white/5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <h1 className="text-base sm:text-lg font-medium text-slate-200">Planos e Assinaturas</h1>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12 space-y-16">
        
        {/* Trial Alert Banner */}
        {profile?.subscriptionStatus === 'trial' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-950/40 via-slate-900/40 to-emerald-950/40 border border-emerald-500/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Período de Teste Gratuito Ativo (Trial)</h3>
                <p className="text-sm text-slate-400">
                  Aproveite todos os recursos premium liberados por 7 dias sem taxas.
                </p>
              </div>
            </div>
            <div className="px-5 py-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center shrink-0">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Restam</span>
              <span className="text-lg font-black text-emerald-400">{getRemainingTrialDays()} dias</span>
            </div>
          </motion.div>
        )}

        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest">
            <Star className="w-3 h-3 fill-current" />
            Ecossistema SentiPae
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight">
              Escolha o plano ideal para a sua <span className="text-emerald-400 italic">jornada</span>.
            </h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto font-light leading-relaxed">
              Assinaturas recorrentes seguras sem taxas ocultas. Desbloqueie limites, automatize sua clínica ou conecte sua empresa à rede de cuidado emocional.
            </p>
          </div>
        </section>

        {/* Pricing Bento Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id;
            const PlanIcon = p.icon;
            const isCurrentUsersPlan = isCurrentlyPremium && currentActivePlan === p.id;

            return (
              <motion.div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={cn(
                  "cursor-pointer bg-slate-900/40 border rounded-[2rem] p-8 flex flex-col justify-between transition-all relative overflow-hidden group hover:bg-slate-900/70",
                  isSelected 
                    ? "border-emerald-500 shadow-2xl shadow-emerald-500/5 ring-1 ring-emerald-500/30" 
                    : "border-white/5"
                )}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {/* Visual Glow */}
                {isSelected && (
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                )}

                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br", p.color)}>
                      <PlanIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border",
                      isSelected ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" : "bg-white/5 border-white/10 text-slate-400"
                    )}>
                      {p.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">{p.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-2">
                    <span className="text-3xl sm:text-4xl font-black text-white">{p.price}</span>
                    <span className="text-slate-500 text-sm">/{p.period}</span>
                  </div>

                  <hr className="border-white/5" />

                  <ul className="space-y-3.5 pt-2">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-slate-300 text-xs leading-relaxed">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  {isCurrentUsersPlan ? (
                    <div className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-400 text-center text-xs font-bold border border-white/5 flex items-center justify-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      Seu Plano Ativo
                    </div>
                  ) : (
                    <div className={cn(
                      "w-full py-3.5 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-2",
                      isSelected 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10 group-hover:bg-emerald-500" 
                        : "bg-slate-900 border border-white/5 text-slate-400 group-hover:text-slate-200"
                    )}>
                      {isSelected ? "Plano Selecionado" : "Selecionar Plano"}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Payment Settings and Gateway Choice */}
        <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 sm:p-12 space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                  Etapa Final
                </div>
                <h3 className="text-2xl font-bold text-white">Método de Pagamento</h3>
                <p className="text-slate-400 text-sm">
                  Selecione seu gateway de pagamento preferido para processar a assinatura mensal recorrente de forma totalmente criptografada.
                </p>
              </div>

              {/* Gateway Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedProvider('stripe')}
                  className={cn(
                    "p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 min-h-[80px]",
                    selectedProvider === 'stripe'
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
                      : "border-white/5 bg-slate-950/40 text-slate-400 hover:text-slate-200"
                  )}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Stripe</span>
                </button>
                <button
                  onClick={() => setSelectedProvider('mercadopago')}
                  className={cn(
                    "p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 min-h-[80px]",
                    selectedProvider === 'mercadopago'
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
                      : "border-white/5 bg-slate-950/40 text-slate-400 hover:text-slate-200"
                  )}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-bold">Mercado Pago</span>
                </button>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleSubscribe}
                disabled={loading}
                className={cn(
                  "w-full py-4.5 rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95",
                  "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
                )}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Confirmar e Assinar
                    <Zap className="w-4 h-4 fill-current" />
                  </>
                )}
              </button>
            </div>

            {/* Secure Checkout Trust Card */}
            <div className="bg-slate-950/50 rounded-3xl p-8 border border-white/5 space-y-6 flex flex-col justify-between min-h-[250px]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <h4 className="font-bold text-white text-base">Infraestrutura 100% Blindada</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sua segurança é nossa prioridade. Processamos suas faturas mensalmente de maneira recorrente utilizando protocolos SSL e TLS criptografados. Você pode alterar seu plano ou cancelar a renovação da assinatura a qualquer momento com apenas um clique diretamente do seu painel.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">ID de Usuário: {user?.uid?.substring(0, 10)}...</span>
                <div className="flex gap-2">
                  <div className="w-8 h-5 bg-white/5 rounded border border-white/10" />
                  <div className="w-8 h-5 bg-white/5 rounded border border-white/10" />
                  <div className="w-8 h-5 bg-white/5 rounded border border-white/10" />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-serif font-bold text-white">Ferramentas da Sede</h3>
            <p className="text-slate-400 text-sm">Tudo o que está à sua disposição no ecossistema SENTI.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900/30 border border-white/5 p-6 rounded-3xl space-y-4 hover:border-emerald-500/30 transition-all group"
              >
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-inner">
                  <f.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100">{f.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <section className="text-center space-y-6 pb-12">
          <div className="w-1 h-12 bg-gradient-to-b from-emerald-500 to-transparent mx-auto rounded-full" />
          <p className="text-slate-400 text-sm italic font-light">
            "Cuidar de si mesmo não é um gasto, é o melhor investimento que você pode fazer."
          </p>
          <div className="flex justify-center gap-8">
            <button onClick={() => navigate("/termos")} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">Termos</button>
            <button onClick={() => navigate("/privacidade")} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">Privacidade</button>
            <button onClick={() => navigate("/contato")} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">Suporte</button>
          </div>
        </section>
      </main>

      {/* Floating Navigation */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50 flex flex-col gap-2"
          >
            <button 
              onClick={scrollToTop}
              className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/40 hover:bg-emerald-500 transition-all active:scale-90"
              aria-label="Voltar ao topo"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
