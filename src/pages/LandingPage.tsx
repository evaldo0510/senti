import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Heart, 
  Zap, 
  MessageCircle, 
  Users, 
  ArrowRight, 
  CheckCircle2,
  BrainCircuit,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BrainCircuit,
      title: "IARA: Inteligência Artificial",
      description: "Nossa IA acolhedora utiliza Poesia Cognitiva Hipnótica para oferecer suporte emocional imediato 24/7.",
      color: "text-brand-green",
      bg: "bg-brand-green/10"
    },
    {
      icon: Users,
      title: "Rede de Terapeutas",
      description: "Conecte-se com profissionais qualificados para sessões individuais e acompanhamento personalizado.",
      color: "text-brand-indigo",
      bg: "bg-brand-indigo/10"
    },
    {
      icon: ShieldAlert,
      title: "Pronto Socorro Emocional",
      description: "Ferramentas de intervenção rápida para momentos de crise, ansiedade ou estresse agudo.",
      color: "text-brand-red",
      bg: "bg-brand-red/10"
    }
  ];

  const stats = [
    { label: "Vidas Impactadas", value: "10k+" },
    { label: "Terapeutas Ativos", value: "500+" },
    { label: "Atendimentos IA", value: "50k+" },
    { label: "Satisfação", value: "98%" }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-brand-green/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/80 backdrop-blur-xl border-b border-brand-text/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight">Pronto Socorro Emocional</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-brand-text/60 hover:text-brand-green transition-colors">Funcionalidades</a>
            <a href="#about" className="text-sm font-medium text-brand-text/60 hover:text-brand-green transition-colors">Sobre nós</a>
            <a href="#contact" className="text-sm font-medium text-brand-text/60 hover:text-brand-green transition-colors">Contato</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-brand-text/60 hover:text-brand-text transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-brand-green/20 hover:scale-105 active:scale-95 transition-all"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-brand-green/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-brand-indigo/10 rounded-full blur-[150px] animate-pulse delay-1000" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-10"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-brand-green/10 backdrop-blur-md border border-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-[0.2em]"
            >
              <Sparkles size={16} className="animate-spin-slow" />
              Onde a mente encontra o seu lugar seguro
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[1.05] tracking-tight text-brand-text">
              Acolhimento <span className="text-brand-green italic relative">
                imediato
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-green/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span> para sua saúde mental.
            </h1>
            
            <p className="text-xl md:text-2xl text-brand-text/50 leading-relaxed max-w-xl font-medium">
              Uma plataforma completa que une Inteligência Artificial humanizada e profissionais especializados para cuidar de você em qualquer momento.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-brand-green text-white px-12 py-6 rounded-[2rem] text-xl font-bold shadow-2xl shadow-brand-green/30 hover:shadow-brand-green/40 transition-all flex items-center justify-center gap-3 group"
              >
                Iniciar Jornada
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-brand-slate/50 backdrop-blur-xl text-brand-text px-12 py-6 rounded-[2rem] text-xl font-bold border border-brand-text/10 hover:bg-brand-slate transition-all shadow-xl"
              >
                Ver Terapeutas
              </motion.button>
            </div>

            <div className="flex items-center gap-6 pt-12 border-t border-brand-text/5">
              <div className="flex -space-x-4">
                {[1,2,3,4,5].map(i => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5, zIndex: 10 }}
                    className="w-12 h-12 rounded-2xl border-4 border-brand-bg bg-brand-slate overflow-hidden shadow-lg"
                  >
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-brand-text/40 font-bold uppercase tracking-widest">
                <span className="text-brand-text">+10.000 vidas</span> impactadas
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[12px] border-white/10 backdrop-blur-2xl">
              <img 
                src="https://picsum.photos/seed/calm/1000/1200" 
                alt="Mental Health" 
                className="w-full aspect-[4/5] object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent" />
              
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-10 left-10 right-10 glass-card p-8 rounded-[2.5rem] border-white/30 shadow-2xl backdrop-blur-3xl"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-brand-green text-white flex items-center justify-center shadow-lg shadow-brand-green/20">
                    <MessageCircle size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold text-lg">IARA está online</p>
                    <p className="text-white/70 text-sm italic">"Como posso acolher seu coração hoje?"</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 glass-card p-6 rounded-3xl border-white/20 shadow-2xl backdrop-blur-2xl z-20"
            >
              <div className="flex items-center gap-3 text-brand-red">
                <Heart size={24} fill="currentColor" />
                <span className="font-bold text-brand-text">Acolhimento</span>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 -left-16 glass-card p-6 rounded-3xl border-white/20 shadow-2xl backdrop-blur-2xl z-20"
            >
              <div className="flex items-center gap-3 text-brand-indigo">
                <ShieldCheck size={24} />
                <span className="font-bold text-brand-text">Segurança</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-20 bg-brand-slate/30 border-y border-brand-text/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <p className="text-4xl md:text-5xl font-serif font-bold text-brand-green">{stat.value}</p>
                <p className="text-sm font-bold uppercase tracking-widest text-brand-text/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* Features Section */}
      <section id="features" className="py-40 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-24 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-brand-green font-bold uppercase tracking-[0.3em] text-xs"
            >
              Nossas Soluções
            </motion.p>
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-brand-text">Cuidado completo em um só lugar.</h2>
            <p className="text-xl text-brand-text/50 leading-relaxed">Desenvolvemos ferramentas específicas para cada etapa da sua jornada de bem-estar emocional.</p>
          </div>
 
          <div className="grid lg:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -15 }}
                className="glass-card p-12 rounded-[3.5rem] space-y-8 border-brand-text/5 hover:border-brand-green/30 transition-all shadow-2xl group"
              >
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3", feature.bg, feature.color)}>
                  <feature.icon size={40} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif font-bold text-brand-text">{feature.title}</h3>
                  <p className="text-brand-text/50 leading-relaxed text-lg">{feature.description}</p>
                </div>
                <ul className="space-y-4 pt-6 border-t border-brand-text/5">
                  {["Acesso 24/7", "Privacidade Total", "Suporte Humanizado"].map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-bold text-brand-text/70">
                      <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                        <CheckCircle2 size={14} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-bg/50 backdrop-blur-3xl -z-10" />
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-brand-dark p-12 md:p-20 text-center space-y-10 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
              Pronto para priorizar sua <span className="text-brand-green italic">paz interior</span>?
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já transformaram sua relação com a saúde mental através do Pronto Socorro Emocional.
            </p>
            <div className="pt-6">
              <button 
                onClick={() => navigate('/login')}
                className="bg-brand-green text-white px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-brand-green/40 hover:scale-105 active:scale-95 transition-all"
              >
                Criar minha conta gratuita
              </button>
            </div>
          </div>
          
          {/* Background glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-green/20 via-transparent to-brand-indigo/20 opacity-50" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-brand-text/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-6 col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-green/20 text-brand-green flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <span className="text-lg font-serif font-bold">Pronto Socorro Emocional</span>
            </div>
            <p className="text-brand-text/40 max-w-xs leading-relaxed">
              Acolhimento emocional acessível, ético e inovador para todos, em qualquer lugar.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-text">Plataforma</h4>
            <ul className="space-y-4 text-sm text-brand-text/60">
              <li><a href="#" className="hover:text-brand-green transition-colors">Como funciona</a></li>
              <li><a href="#" className="hover:text-brand-green transition-colors">Terapeutas</a></li>
              <li><a href="#" className="hover:text-brand-green transition-colors">Para Empresas</a></li>
              <li><a href="#" className="hover:text-brand-green transition-colors">Para Prefeituras</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-text">Legal</h4>
            <ul className="space-y-4 text-sm text-brand-text/60">
              <li><a href="#" className="hover:text-brand-green transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-brand-green transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-brand-green transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-brand-text/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-brand-text/40">
            © 2026 Pronto Socorro Emocional. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Heart size={16} className="text-brand-red animate-pulse" />
            <span className="text-xs text-brand-text/40">Feito com carinho para você</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
