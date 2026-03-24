import React from "react";
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
  Sparkles,
  Zap,
  Lock,
  UserCheck,
  AlertCircle,
  Activity,
  Stethoscope,
  UserPlus,
  Smartphone,
  RefreshCw
} from "lucide-react";

export default function LandingPro() {
  const navigate = useNavigate();
  const { handleInstall, isInstallable } = usePWA();

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

      {/* SOS FLOATING BUTTON */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/emergencia")}
        className="fixed bottom-8 right-8 z-[100] w-20 h-20 bg-[#dc2626] rounded-full shadow-[0_20px_40px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center gap-1 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white animate-ping opacity-20"></div>
        <AlertCircle className="w-8 h-8 text-white relative z-10" />
        <span className="text-[10px] font-black text-white relative z-10 uppercase tracking-tighter">SENTI SOS</span>
      </motion.button>

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
              Entrar
            </button>
            <button 
              onClick={() => navigate("/reset")} 
              className="px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-full text-sm font-bold transition-all hover:shadow-[0_10px_20px_rgba(5,150,105,0.2)] active:scale-95 flex items-center gap-2"
            >
              Começar Agora
            </button>
          </div>
        </div>
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
              <h1 className="text-7xl md:text-[10vw] font-serif font-light tracking-tight text-[#1a1a1a] leading-[0.85] italic">
                Onde sua dor <br />
                <span className="text-emerald-700 font-bold not-italic">encontra pausa.</span>
              </h1>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/40 rounded-full blur-3xl animate-pulse"></div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-3xl text-[#4a4a4a] max-w-4xl mx-auto leading-relaxed font-light"
            >
              A SENTI é o primeiro ecossistema de regulação emocional <br/>
              que une IA clínica e conexão humana em tempo real.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <button 
              onClick={() => navigate("/reset")}
              className="group w-full sm:w-auto px-12 py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[32px] text-2xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(5,150,105,0.3)] active:scale-95"
            >
              <RefreshCw className="w-6 h-6" />
              ReSet Emocional
            </button>
            <button 
              onClick={() => navigate("/profissionais")}
              className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-slate-50 text-slate-700 rounded-[32px] text-lg font-bold transition-all flex items-center justify-center gap-3 border border-slate-200 shadow-sm group"
            >
              <Users className="w-5 h-5" />
              Terapeutas Online
            </button>
          </motion.div>
        </div>
      </section>

      {/* JORNADA DO PACIENTE */}
      <section id="metodo" className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="grid md:grid-cols-2 gap-12 items-end">
            <div className="space-y-6">
              <div className="w-12 h-1 bg-emerald-600"></div>
              <h2 className="text-5xl md:text-7xl font-serif italic text-[#1a1a1a] tracking-tight leading-none">
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

      {/* SEGMENTAÇÃO SECTION */}
      <section id="segmentos" className="py-40 px-6 bg-white/40 backdrop-blur-3xl relative z-10">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-8">
            <h2 className="text-5xl md:text-8xl font-serif italic text-[#1a1a1a] tracking-tight leading-[1]">
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
                  {item.title === "SENTI App" ? "Entrar como Paciente" : item.title === "SENTI Pro" ? "Entrar como Terapeuta" : "Saiba Mais"}
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-40 px-6 relative z-10 overflow-hidden">
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
              <a href="#" className="hover:text-emerald-600 transition-colors">A Jornada</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">IARA AI</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Especialistas</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[#1a1a1a] font-bold uppercase tracking-widest text-xs">Legal</span>
              <a href="#" className="hover:text-emerald-600 transition-colors">Termos</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Segurança</a>
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
