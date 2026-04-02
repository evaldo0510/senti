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
  Crown
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../components/AuthProvider";
import { userService } from "../services/userService";

export default function Subscription() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      // Simulate subscription process
      await userService.updateProfile(user.uid, { isPremium: true });
      alert("Parabéns! Você agora tem a Licença Completa.");
      navigate("/home");
    } catch (error) {
      console.error("Erro ao assinar:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: MessageCircle, title: "IARA Ilimitada", desc: "Converse com nossa IA terapêutica sem restrições de mensagens." },
    { icon: Video, title: "Sessões de Vídeo", desc: "Acesso prioritário a sessões de vídeo com profissionais e IARA Live." },
    { icon: BookOpen, title: "Diário Avançado", desc: "Análise profunda de sentimentos e histórico ilimitado de registros." },
    { icon: Activity, title: "Relatórios de IA", desc: "Relatórios semanais detalhados sobre seu progresso emocional." },
    { icon: ShieldCheck, title: "Garantia SENTI", desc: "Proteção total em todos os seus agendamentos e transações." },
    { icon: Zap, title: "SENTI Go Prioritário", desc: "Conexão instantânea com terapeutas em menos de 60 segundos." },
    { icon: Calendar, title: "Google Calendar", desc: "Sincronização automática de todas as suas sessões e pílulas." },
    { icon: Crown, title: "Ferramentas Exclusivas", desc: "Acesso a todas as ferramentas premium desta sede e futuras atualizações." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative selection:bg-emerald-500/30">
      {/* Header */}
      <header className="px-4 py-4 sm:p-6 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-md z-40 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-3 -ml-2 hover:bg-white/5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <h1 className="text-base sm:text-lg font-medium text-slate-200">Licença Completa</h1>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest"
          >
            <Star className="w-3 h-3 fill-current" />
            Acesso Premium
          </motion.div>
          
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl font-serif font-bold text-white leading-tight"
            >
              Tudo o que você precisa para <span className="text-emerald-400 italic">evoluir</span>.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto font-light"
            >
              A licença completa inclui todas as ferramentas que temos nesta sede. 
              Pague mensalmente e continue produzindo sua melhor versão.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <button 
              onClick={scrollToFeatures}
              className="flex flex-col items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">Ver Benefícios</span>
              <ChevronDown className="w-5 h-5 animate-bounce group-hover:scale-110" />
            </button>
          </motion.div>
        </section>

        {/* Pricing Card */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-indigo-500/20 blur-3xl -z-10" />
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
              <Crown className="w-16 h-16 text-amber-400/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">Plano Mensal</h3>
                  <p className="text-slate-400">Acesso total e ilimitado a todas as ferramentas.</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">R$ 49,90</span>
                  <span className="text-slate-500 font-medium">/mês</span>
                </div>

                <ul className="space-y-4">
                  {[
                    "Todas as ferramentas incluídas",
                    "Suporte prioritário 24/7",
                    "Novas ferramentas mensais",
                    "Sem fidelidade, cancele quando quiser"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={handleSubscribe}
                  disabled={loading || profile?.isPremium}
                  className={cn(
                    "w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95",
                    profile?.isPremium 
                      ? "bg-slate-800 text-slate-500 cursor-default" 
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                  )}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : profile?.isPremium ? (
                    "Plano Ativo"
                  ) : (
                    <>
                      Assinar Agora
                      <Zap className="w-5 h-5 fill-current" />
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950/50 rounded-[2rem] p-8 border border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <h4 className="font-bold text-white">Pagamento Seguro</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Processamos seus dados de forma criptografada. Aceitamos cartões de crédito, débito e PIX. 
                  Sua assinatura será renovada automaticamente a cada 30 dias.
                </p>
                <div className="pt-4 flex gap-4 opacity-50 grayscale">
                  <div className="w-10 h-6 bg-slate-800 rounded" />
                  <div className="w-10 h-6 bg-slate-800 rounded" />
                  <div className="w-10 h-6 bg-slate-800 rounded" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-serif font-bold text-white">Ferramentas da Sede</h3>
            <p className="text-slate-500">Tudo o que está à sua disposição com a Licença Completa.</p>
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
          <p className="text-slate-500 text-sm italic">
            "Cuidar de si mesmo não é um gasto, é o melhor investimento que você pode fazer."
          </p>
          <div className="flex justify-center gap-8">
            <button onClick={() => navigate("/termos")} className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">Termos</button>
            <button onClick={() => navigate("/privacidade")} className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">Privacidade</button>
            <button onClick={() => navigate("/contato")} className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">Suporte</button>
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
            <button 
              onClick={() => window.scrollBy({ top: 500, behavior: "smooth" })}
              className="w-12 h-12 bg-slate-900 border border-white/10 text-slate-400 rounded-full flex items-center justify-center shadow-xl hover:text-white transition-all active:scale-90"
              aria-label="Descer"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Spacer */}
      <div className="h-20" />
    </div>
  );
}
