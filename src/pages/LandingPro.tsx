import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { usePWA } from "../contexts/PWAContext";
import { 
  Heart, 
  Shield, 
  Clock, 
  Users, 
  MessageCircle, 
  Building2, 
  Landmark, 
  ArrowRight, 
  Phone, 
  Mail,
  Sparkles,
  Zap,
  Lock,
  UserCheck,
  AlertCircle,
  Activity,
  Stethoscope,
  UserPlus,
  Smartphone,
  RefreshCw,
  Brain,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from "lucide-react";

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-black/5 rounded-3xl overflow-hidden bg-[#f5f5f0]/50 transition-all hover:bg-[#f5f5f0]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="text-lg font-bold text-[#1a1a1a]">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-emerald-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-emerald-600 shrink-0" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-6 text-[#4a4a4a] font-light leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function LandingPro() {
  const navigate = useNavigate();
  const { handleInstall, isInstallable } = usePWA();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const abrirWhatsApp = () => {
    const numero = "5511999999999";
    const mensagem = encodeURIComponent("Olá, gostaria de saber mais sobre a SENTI para minha empresa/prefeitura.");
    window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-amber-50 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_30%,_rgba(255,255,255,0.8)_0%,_transparent_60%)]"></div>
      </div>

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-[0_10px_20px_rgba(5,150,105,0.2)] group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-[#1a1a1a] font-serif italic">SENTI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4a4a4a]">
            <a href="#metodo" className="hover:text-emerald-700 transition-colors">O Método</a>
            <a href="#solucao" className="hover:text-emerald-700 transition-colors">Acolhimento</a>
            <a href="#segmentos" className="hover:text-emerald-700 transition-colors">Ecossistema</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleInstall}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-bold transition-all text-slate-600"
            >
              <Smartphone className="w-4 h-4" />
              {isInstallable ? "Instalar App" : "Baixar App"}
            </button>
            <button 
              onClick={() => navigate("/login")} 
              className="hidden sm:block text-sm font-semibold text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors px-4"
            >
              Entrar / Cadastrar
            </button>
            <button 
              onClick={() => navigate("/reset")} 
              className="hidden sm:flex px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-full text-sm font-bold transition-all hover:shadow-[0_10px_20px_rgba(5,150,105,0.2)] active:scale-95 items-center gap-2"
            >
              Começar Agora
            </button>
            
            {/* MOBILE MENU BUTTON */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[#1a1a1a] hover:bg-black/5 rounded-xl transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU OVERLAY */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-black/5 overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                <a 
                  href="#metodo" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl font-bold text-[#1a1a1a]"
                >
                  O Método
                </a>
                <a 
                  href="#solucao" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl font-bold text-[#1a1a1a]"
                >
                  Acolhimento
                </a>
                <a 
                  href="#segmentos" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl font-bold text-[#1a1a1a]"
                >
                  Ecossistema
                </a>
                <div className="h-px bg-black/5 my-2" />
                <button 
                  onClick={() => { navigate("/login"); setIsMenuOpen(false); }}
                  className="text-lg font-bold text-[#4a4a4a] text-left"
                >
                  Entrar / Cadastrar
                </button>
                <button 
                  onClick={() => { navigate("/reset"); setIsMenuOpen(false); }}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-center shadow-lg shadow-emerald-600/20"
                >
                  Começar Agora
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 md:pt-56 md:pb-40 px-6 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-[0.3em]"
          >
            <Sparkles className="w-3 h-3" />
            A inteligência que acolhe a sua dor
          </motion.div>

          <div className="space-y-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <h1 className="text-5xl sm:text-7xl md:text-[10vw] font-serif font-light tracking-tight text-[#1a1a1a] leading-[0.85] italic">
                Sua mente em <br />
                <span className="text-emerald-700 font-bold not-italic">paz absoluta.</span>
              </h1>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/40 rounded-full blur-3xl animate-pulse"></div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-3xl text-[#4a4a4a] max-w-4xl mx-auto leading-relaxed font-light px-4"
            >
              A SENTI une a precisão da <span className="font-bold text-emerald-700">IA IARA</span> com o calor humano de <span className="font-bold text-emerald-700">especialistas renomados</span> para um acolhimento 24/7.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <button 
              onClick={() => navigate("/login")}
              className="group w-full sm:w-auto px-12 py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[32px] text-2xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(5,150,105,0.3)] active:scale-95"
            >
              <UserPlus className="w-6 h-6" />
              Criar Conta Grátis
            </button>
            <button 
              onClick={() => navigate("/profissionais")}
              className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-slate-50 text-slate-700 rounded-[32px] text-lg font-bold transition-all flex items-center justify-center gap-3 border border-slate-200 shadow-sm group"
            >
              <Users className="w-5 h-5" />
              Ver Especialistas
            </button>
          </motion.div>
        </div>
      </section>

      {/* DIFERENCIAL IARA */}
      <section className="py-20 md:py-32 px-6 bg-white relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
              Tecnologia Exclusiva
            </div>
            <h2 className="text-4xl md:text-7xl font-serif italic text-[#1a1a1a] leading-tight">
              Conheça a <span className="text-emerald-700 font-bold not-italic">IARA</span>
            </h2>
            <p className="text-xl text-[#4a4a4a] font-light leading-relaxed">
              Não é apenas um chatbot. A IARA é uma Interface de Acolhimento com Resposta Ativa, treinada em protocolos clínicos para oferecer suporte empático e triagem inteligente no momento exato da sua necessidade.
            </p>
            <ul className="space-y-4">
              {[
                "Disponível 24 horas por dia, 7 dias por semana",
                "Escuta ativa e validação emocional sem julgamentos",
                "Triagem clínica baseada no protocolo de Manchester",
                "Conexão imediata com terapeutas em casos críticos"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#4a4a4a]">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => navigate("/chat")}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2 group"
            >
              Conversar com IARA <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-emerald-50 rounded-[64px] overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1531746790731-6c087fecd05a?w=800&auto=format&fit=crop&q=60" 
                alt="IARA AI Interface" 
                className="w-full h-full object-cover mix-blend-multiply opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">IARA Online</span>
                </div>
                <p className="text-sm font-medium text-slate-800 italic">"Estou aqui para ouvir você. Como seu coração se sente hoje?"</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PÍLULAS TERAPÊUTICAS SECTION */}
      <section className="py-20 md:py-32 px-6 bg-white relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative order-2 md:order-1"
          >
            <div className="aspect-[4/5] bg-emerald-50 rounded-[64px] overflow-hidden relative shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=800&auto=format&fit=crop&q=60" 
                alt="Pílulas Terapêuticas" 
                className="w-full h-full object-cover mix-blend-multiply opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent"></div>
              
              {/* Floating Pill Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Alívio Imediato</span>
                </div>
                <p className="text-xs font-bold text-slate-800">"Respire fundo por 4 segundos..."</p>
              </motion.div>
 
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 right-10 bg-emerald-600/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-white fill-current" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Autoacolhimento</span>
                </div>
                <p className="text-xs font-bold text-white">"Você é maior que a sua ansiedade."</p>
              </motion.div>
            </div>
          </motion.div>
 
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 order-1 md:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-widest">
              Novidade Exclusiva
            </div>
            <h2 className="text-4xl md:text-7xl font-serif italic text-[#1a1a1a] leading-tight">
              Pílulas <span className="text-emerald-700 font-bold not-italic">Terapêuticas</span>
            </h2>
            <p className="text-xl text-[#4a4a4a] font-light leading-relaxed">
              Micro-conteúdos em áudio e texto desenhados para intervenções rápidas. Quando a mente acelera, nossas pílulas trazem você de volta ao presente em menos de 2 minutos.
            </p>
            
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a]">Grátis no Plano Premium</h4>
                  <p className="text-sm text-emerald-700">Incluso na assinatura do ReSet 21 Dias</p>
                </div>
              </div>
              <p className="text-sm text-[#4a4a4a] font-light italic">
                "Acesso ilimitado a toda a biblioteca de pílulas para assinantes da jornada de reprogramação emocional."
              </p>
            </div>

            <button 
              onClick={() => navigate("/reset-21/sales")}
              className="px-10 py-5 bg-emerald-600 text-white rounded-[32px] text-lg font-bold transition-all hover:scale-105 flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              Conhecer o Plano Premium
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* JORNADA DO PACIENTE */}
      <section id="metodo" className="py-20 md:py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="grid md:grid-cols-2 gap-12 items-end">
            <div className="space-y-6">
              <div className="w-12 h-1 bg-emerald-600"></div>
              <h2 className="text-4xl md:text-7xl font-serif italic text-[#1a1a1a] tracking-tight leading-none">
                O Fluxo do <br /> <span className="text-emerald-700 font-bold not-italic">Acolhimento</span>
              </h2>
            </div>
            <p className="text-xl text-[#4a4a4a] max-w-md pb-4 border-l-2 border-emerald-200 pl-8 font-light">
              Inspirado no protocolo de Manchester, a SENTI garante que ninguém fique sem resposta no momento da dor.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { 
                icon: Activity, 
                step: "01", 
                title: "Triagem Clínica", 
                desc: "Avaliação instantânea de risco e estado emocional através de nossa IA proprietária.",
                color: "bg-white"
              },
              { 
                icon: Stethoscope, 
                step: "02", 
                title: "ReSet Imediato", 
                desc: "Técnicas de regulação afetiva PCH para baixar a intensidade da crise agora.",
                color: "bg-white"
              },
              { 
                icon: MessageCircle, 
                step: "03", 
                title: "Acolhimento IARA", 
                desc: "Suporte profundo, validante e empático com nossa Interface de Acolhimento.",
                color: "bg-white"
              },
              { 
                icon: UserPlus, 
                step: "04", 
                title: "Conexão Humana", 
                desc: "Direcionamento para o especialista ideal em nossa rede de terapeutas premium.",
                color: "bg-white"
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-10 ${item.color} border border-black/5 rounded-[48px] shadow-sm group hover:shadow-xl hover:-translate-y-2 transition-all flex flex-col justify-between h-[400px]`}
              >
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-8 h-8 text-emerald-600" />
                    </div>
                    <span className="text-4xl font-serif italic text-emerald-100">{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] leading-tight">{item.title}</h3>
                </div>
                <p className="text-[#4a4a4a] text-lg leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="py-20 px-6 bg-emerald-900 text-white relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(5,150,105,0.4)_0%,_transparent_100%)]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
          {[
            { number: "10k+", label: "Vidas Impactadas" },
            { number: "24/7", label: "Acolhimento Imediato" },
            { number: "500+", label: "Terapeutas Verificados" },
            { number: "98%", label: "Taxa de Satisfação" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-2"
            >
              <div className="text-4xl md:text-6xl font-serif italic font-bold text-emerald-300">{stat.number}</div>
              <div className="text-sm md:text-base text-emerald-100 uppercase tracking-widest font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COMO PODEMOS AJUDAR - CAROUSEL */}
      <section id="solucao" className="py-20 md:py-32 px-6 bg-white relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-serif italic text-[#1a1a1a] tracking-tight">
              Como podemos <span className="text-emerald-700 font-bold not-italic">ajudar você?</span>
            </h2>
            <p className="text-xl text-[#4a4a4a] font-light max-w-2xl mx-auto">
              Soluções personalizadas para cada momento da sua jornada emocional.
            </p>
          </div>

          <div className="relative">
            <motion.div 
              className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory"
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              {[
                {
                  title: "Ansiedade e Pânico",
                  desc: "Ferramentas de ReSet imediato e acompanhamento com especialistas em transtornos de ansiedade.",
                  icon: Zap,
                  color: "bg-amber-50 text-amber-600"
                },
                {
                  title: "Burnout e Estresse",
                  desc: "Programas para empresas e indivíduos focados em saúde mental no trabalho e equilíbrio emocional.",
                  icon: Activity,
                  color: "bg-emerald-50 text-emerald-600"
                },
                {
                  title: "Luto e Perdas",
                  desc: "Acolhimento humanizado e grupos de apoio para atravessar momentos de perda com suporte especializado.",
                  icon: Heart,
                  color: "bg-rose-50 text-rose-600"
                },
                {
                  title: "Foco e Performance",
                  desc: "Treinamento em mindfulness e regulação emocional para melhorar sua produtividade e clareza mental.",
                  icon: Brain,
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  title: "Relacionamentos",
                  desc: "Terapia individual ou de casal para desenvolver comunicação não-violenta e inteligência interpessoal.",
                  icon: Users,
                  color: "bg-purple-50 text-purple-600"
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="min-w-[300px] md:min-w-[400px] p-10 bg-[#f5f5f0]/50 rounded-[40px] border border-black/5 snap-center space-y-6 hover:bg-white hover:shadow-xl transition-all"
                  whileHover={{ y: -10 }}
                >
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a]">{item.title}</h3>
                  <p className="text-[#4a4a4a] leading-relaxed font-light">{item.desc}</p>
                  <button 
                    onClick={() => navigate("/reset-21/sales")}
                    className="text-emerald-700 font-bold flex items-center gap-2 group"
                  >
                    Saiba mais <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2, 3, 4].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEGMENTAÇÃO SECTION */}
      <section id="segmentos" className="py-20 md:py-40 px-6 bg-white/40 backdrop-blur-3xl relative z-10">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-8xl font-serif italic text-[#1a1a1a] tracking-tight leading-[1]">
              Um ecossistema <br /> <span className="text-emerald-700 font-bold not-italic">completo.</span>
            </h2>
            <p className="text-2xl text-[#4a4a4a] max-w-3xl mx-auto font-light">
              Soluções escaláveis que humanizam a tecnologia para diferentes necessidades.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: MessageCircle, 
                title: "SENTI App", 
                desc: "Apoio emocional imediato no seu bolso. Triagem inteligente, acolhimento com a IARA e conexão com especialistas 24h.", 
                features: ["Acolhimento 24/7", "ReSet Emocional", "Jornada 21 Dias"],
                path: "/login",
                label: "Para Você",
                theme: "emerald"
              },
              { 
                icon: Stethoscope, 
                title: "SENTI Pro", 
                desc: "Faça parte da nossa rede de especialistas. Gerencie sua agenda, atenda pacientes de todo o Brasil e utilize nossa IA de suporte.", 
                features: ["Gestão de Agenda", "Prontuário Inteligente", "Pagamentos Seguros"],
                path: "/login",
                label: "Para Profissionais",
                theme: "emerald"
              },
              { 
                icon: Building2, 
                title: "SENTI Business", 
                desc: "Cuidado estratégico com o colaborador. Reduza o burnout, melhore o clima e cuide do seu maior ativo: as pessoas.", 
                features: ["Relatórios de Bem-estar", "Suporte ao Colaborador", "Prevenção de Burnout"],
                path: "/vendas-empresa",
                label: "Para Negócios",
                theme: "blue"
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group p-12 bg-white border border-black/5 rounded-[64px] flex flex-col h-full shadow-sm hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <div className="absolute top-10 right-12 text-[10px] font-bold text-[#6a6a6a] uppercase tracking-[0.2em]">{item.label}</div>
                <div className="w-20 h-20 rounded-[32px] bg-emerald-50 flex items-center justify-center mb-12 group-hover:scale-110 transition-transform">
                  <item.icon className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-3xl font-bold text-[#1a1a1a] mb-6 tracking-tight">{item.title}</h3>
                <p className="text-lg text-[#4a4a4a] mb-10 leading-relaxed font-light">{item.desc}</p>
                
                <div className="space-y-4 mb-16 flex-grow">
                  {item.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-[#4a4a4a]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-base font-light">{f}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate(item.path)}
                  className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-bold transition-all flex items-center justify-center gap-3 group/btn text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                >
                  {item.title === "SENTI App" ? "Acessar como Paciente" : item.title === "SENTI Pro" ? "Acessar como Terapeuta" : "Saiba Mais"}
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES DETALHADAS */}
      <section className="py-20 md:py-32 px-6 bg-[#f5f5f0] relative z-10">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-serif italic text-[#1a1a1a] tracking-tight">
              Tudo o que você precisa <br /> <span className="text-emerald-700 font-bold not-italic">em um só lugar.</span>
            </h2>
            <p className="text-xl text-[#4a4a4a] max-w-2xl mx-auto font-light">
              Ferramentas baseadas em ciência para ajudar você a entender, regular e melhorar suas emoções diariamente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Diário Emocional",
                desc: "Registre seu humor diário e descubra padrões. Acompanhe sua evolução com gráficos simples e intuitivos."
              },
              {
                icon: Zap,
                title: "ReSet Rápido",
                desc: "Exercícios de respiração e grounding para momentos de ansiedade aguda ou pânico. Volte ao eixo em minutos."
              },
              {
                icon: MessageCircle,
                title: "IARA AI",
                desc: "Nossa inteligência artificial treinada em protocolos clínicos para acolher você a qualquer hora do dia ou da noite."
              },
              {
                icon: Users,
                title: "Terapeutas Verificados",
                desc: "Conecte-se com profissionais qualificados. Agende sessões online com segurança e praticidade."
              },
              {
                icon: Shield,
                title: "Privacidade Total",
                desc: "Seus dados e conversas são criptografados de ponta a ponta. Sua jornada emocional é apenas sua."
              },
              {
                icon: Activity,
                title: "Jornada 21 Dias",
                desc: "Um programa estruturado para criar hábitos saudáveis e desenvolver inteligência emocional na prática."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 bg-white rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">{feature.title}</h3>
                <p className="text-[#4a4a4a] leading-relaxed font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-40 px-6 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative text-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10 max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-5xl font-serif italic text-[#1a1a1a] leading-tight mb-12">
                "A SENTI não é apenas uma ferramenta, é o respiro que eu precisava quando senti que o mundo estava desabando. A triagem foi rápida e o acolhimento da IARA me deu a clareza para buscar ajuda profissional."
              </h2>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-emerald-600 fill-current" />
                </div>
                <div>
                  <p className="text-[#1a1a1a] font-bold uppercase tracking-widest text-sm">Ana Paula S.</p>
                  <p className="text-[#6a6a6a] text-xs italic">Usuária da plataforma</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 md:py-32 px-6 bg-white relative z-10">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-serif italic text-[#1a1a1a] tracking-tight">
              Perguntas <span className="text-emerald-700 font-bold not-italic">Frequentes</span>
            </h2>
            <p className="text-xl text-[#4a4a4a] font-light">
              Tire suas dúvidas sobre como a SENTI pode ajudar você.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "A IARA substitui um terapeuta humano?",
                a: "Não. A IARA é uma ferramenta de acolhimento imediato e triagem. Ela ajuda a regular emoções no momento da crise e prepara você para o atendimento com um profissional humano, que é insubstituível para um tratamento profundo."
              },
              {
                q: "Meus dados estão seguros?",
                a: "Sim. Utilizamos criptografia de ponta a ponta (E2EE) em todas as conversas e dados sensíveis. Apenas você e seu terapeuta têm acesso às informações das sessões."
              },
              {
                q: "Como funciona a Jornada de 21 Dias?",
                a: "É um programa interativo focado na construção de hábitos saudáveis. A cada dia, você recebe um pequeno desafio ou reflexão baseada em terapia cognitivo-comportamental (TCC) para melhorar sua resiliência emocional."
              },
              {
                q: "Posso usar a SENTI apenas para emergências?",
                a: "Sim! O botão SOS e o ReSet Rápido estão sempre disponíveis para momentos de crise. No entanto, recomendamos o uso contínuo do diário e das sessões para resultados a longo prazo."
              }
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOAD APP SECTION */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[64px] p-12 md:p-20 text-white text-center space-y-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.1)_0%,_transparent_70%)]"></div>
          <div className="space-y-6 relative z-10">
            <h2 className="text-4xl md:text-6xl font-serif italic leading-tight">
              Sua saúde mental <br /> <span className="font-bold not-italic">não pode esperar.</span>
            </h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto font-light">
              Tenha o ecossistema SENTI completo no seu celular. Acolhimento imediato, triagem e especialistas a um toque de distância.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <button 
              onClick={handleInstall}
              className="w-full sm:w-auto px-10 py-5 bg-white text-emerald-900 rounded-3xl font-bold text-lg hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
            >
              <Smartphone className="w-6 h-6" />
              {isInstallable ? "Instalar Aplicativo" : "Baixar Aplicativo"}
            </button>
          </div>
        </div>
      </section>

      {/* NEWSLETTER / DICAS */}
      <section className="py-24 px-6 bg-[#f5f5f0] relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-[48px] p-12 md:p-16 text-center space-y-8 border border-black/5 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif italic text-[#1a1a1a] tracking-tight">
            Receba dicas de <span className="text-emerald-700 font-bold not-italic">bem-estar</span>
          </h2>
          <p className="text-lg text-[#4a4a4a] font-light max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que recebem nossos conteúdos semanais sobre inteligência emocional e saúde mental.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Seu melhor e-mail" 
              className="flex-1 px-6 py-4 bg-[#f5f5f0] border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button 
              type="submit"
              className="px-8 py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold hover:bg-black transition-colors"
            >
              Inscrever
            </button>
          </form>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-20 px-6 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center bg-[#f5f5f0] rounded-[64px] p-12 md:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="space-y-8 relative z-10">
              <h2 className="text-4xl md:text-6xl font-serif italic text-[#1a1a1a] leading-tight tracking-tight">
                Ainda tem <br /> <span className="text-emerald-700 font-bold not-italic">dúvidas?</span>
              </h2>
              <p className="text-xl text-[#4a4a4a] font-light max-w-md">
                Nossa equipe está pronta para te ajudar a encontrar o melhor caminho para o seu bem-estar.
              </p>
              <button 
                onClick={() => navigate("/contato")}
                className="px-10 py-5 bg-[#1a1a1a] text-white rounded-[32px] font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
              >
                Falar com a Equipe
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="relative hidden md:block">
              <div className="aspect-square bg-white rounded-[48px] shadow-2xl p-12 flex flex-col justify-center gap-8 border border-black/5 rotate-3">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <Mail className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#6a6a6a] uppercase tracking-widest">E-mail</p>
                    <p className="text-lg font-medium text-[#1a1a1a]">contato@senti.app</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <Phone className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#6a6a6a] uppercase tracking-widest">WhatsApp</p>
                    <p className="text-lg font-medium text-[#1a1a1a]">+55 (11) 99999-9999</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 border-t border-black/5 bg-white relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Heart className="w-8 h-8 text-emerald-600 fill-current" />
              <span className="text-3xl font-serif italic font-bold text-[#1a1a1a] tracking-tight">SENTI</span>
            </div>
            <p className="text-[#6a6a6a] max-w-sm font-light">Cuidado emocional acessível, imediato e humano. Porque sua mente não pode esperar.</p>
          </div>
          
          <div className="flex gap-12 text-sm text-[#4a4a4a] font-medium">
            <div className="flex flex-col gap-4">
              <span className="text-[#1a1a1a] font-bold uppercase tracking-widest text-xs">Plataforma</span>
              <button onClick={() => navigate("/reset21")} className="text-left hover:text-emerald-600 transition-colors">A Jornada</button>
              <button onClick={() => navigate("/chat")} className="text-left hover:text-emerald-600 transition-colors">IARA AI</button>
              <button onClick={() => navigate("/profissionais")} className="text-left hover:text-emerald-600 transition-colors">Especialistas</button>
              <button onClick={() => navigate("/contato")} className="text-left hover:text-emerald-600 transition-colors">Contato</button>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[#1a1a1a] font-bold uppercase tracking-widest text-xs">Legal</span>
              <button onClick={() => navigate("/termos")} className="text-left hover:text-emerald-600 transition-colors">Termos</button>
              <button onClick={() => navigate("/privacidade")} className="text-left hover:text-emerald-600 transition-colors">Privacidade</button>
              <button onClick={() => navigate("/seguranca")} className="text-left hover:text-emerald-600 transition-colors">Segurança</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <p className="text-[#6a6a6a] text-xs">© 2026 SENTI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
