import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
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
  Smartphone
} from "lucide-react";

export default function LandingPro() {
  const navigate = useNavigate();

  const [installPrompt, setInstallPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  const abrirWhatsApp = () => {
    const numero = "5511999999999";
    const mensagem = encodeURIComponent("Olá, gostaria de saber mais sobre o PSE para minha empresa/prefeitura.");
    window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      
      {/* ATMOSPHERIC BACKGROUND (Recipe 6/7 Hybrid) */}
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
        <span className="text-[10px] font-black text-white relative z-10 uppercase tracking-tighter">SOS CRISE</span>
      </motion.button>

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-[0_10px_20px_rgba(5,150,105,0.2)] group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-[#1a1a1a] font-serif italic">PSE</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4a4a4a]">
            <a href="#jornada" className="hover:text-emerald-700 transition-colors">A Jornada</a>
            <a href="#solucao" className="hover:text-emerald-700 transition-colors">Como funciona</a>
            <a href="#segmentos" className="hover:text-emerald-700 transition-colors">Para quem</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/login")} 
              className="hidden sm:block text-sm font-semibold text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors px-4"
            >
              Entrar
            </button>
            <button 
              onClick={() => navigate("/triagem")} 
              className="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-full text-sm font-bold transition-all hover:shadow-[0_10px_20px_rgba(5,150,105,0.2)] active:scale-95"
            >
              Iniciar Triagem
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
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-[0.2em]"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            Cuidado emocional imediato e humano
          </motion.div>

          <div className="space-y-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <h1 className="text-6xl md:text-[10vw] font-serif font-light tracking-tight text-[#1a1a1a] leading-[1] italic">
                A dor não <br />
                <span className="text-emerald-700 font-bold not-italic">precisa esperar.</span>
              </h1>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/40 rounded-full blur-3xl animate-pulse"></div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-3xl text-[#4a4a4a] max-w-4xl mx-auto leading-relaxed font-light"
            >
              Transformamos o momento de crise em um caminho seguro de acolhimento e esperança.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <button 
              onClick={() => navigate("/triagem")}
              className="group w-full sm:w-auto px-12 py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[32px] text-2xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(5,150,105,0.3)] active:scale-95"
            >
              Iniciar Triagem
              <Zap className="w-6 h-6 fill-current" />
            </button>
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => navigate("/emergencia")}
                className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-red-50 text-red-600 rounded-[32px] text-lg font-bold transition-all flex items-center justify-center gap-3 border border-red-200 shadow-sm group"
              >
                <AlertCircle className="w-5 h-5 group-hover:animate-shake" />
                Estou em Crise
              </button>
              <span className="text-[10px] text-[#6a6a6a] uppercase tracking-widest font-bold">Atendimento Imediato 24h</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* JORNADA DO PACIENTE */}
      <section id="jornada" className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="grid md:grid-cols-2 gap-12 items-end">
            <div className="space-y-6">
              <div className="w-12 h-1 bg-emerald-600"></div>
              <h2 className="text-5xl md:text-7xl font-serif italic text-[#1a1a1a] tracking-tight leading-none">
                O Fluxo do <br /> <span className="text-emerald-700 font-bold not-italic">Cuidado</span>
              </h2>
            </div>
            <p className="text-xl text-[#4a4a4a] max-w-md pb-4 border-l-2 border-emerald-200 pl-8 font-light">
              Inspirado no protocolo de Manchester, nosso sistema garante que ninguém fique sem resposta no momento da dor.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { 
                icon: Activity, 
                step: "01", 
                title: "Triagem Inteligente", 
                desc: "Avaliação instantânea de risco e estado emocional através de IA clínica.",
                color: "bg-white"
              },
              { 
                icon: Stethoscope, 
                step: "02", 
                title: "Estabilização", 
                desc: "Técnicas de regulação afetiva para baixar a intensidade da crise.",
                color: "bg-white"
              },
              { 
                icon: MessageCircle, 
                step: "03", 
                title: "Acolhimento IARA", 
                desc: "Suporte profundo e validante com nossa Interface de Acolhimento.",
                color: "bg-white"
              },
              { 
                icon: UserPlus, 
                step: "04", 
                title: "Conexão Humana", 
                desc: "Direcionamento preciso para o especialista ideal para o seu caso.",
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
              Para quem é o <br /> <span className="text-emerald-700 font-bold not-italic">acolhimento?</span>
            </h2>
            <p className="text-2xl text-[#4a4a4a] max-w-3xl mx-auto font-light">
              Uma solução escalável que humaniza a tecnologia para diferentes necessidades.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: MessageCircle, 
                title: "Usuário", 
                desc: "Apoio emocional imediato no seu bolso. Triagem inteligente, acolhimento com a IARA e conexão com especialistas 24h.", 
                features: ["Acolhimento 24/7", "Diário de Humor", "Chat com Especialistas"],
                path: "/login",
                label: "Para Você",
                theme: "emerald"
              },
              { 
                icon: Stethoscope, 
                title: "Terapeuta", 
                desc: "Seja parte da nossa rede de especialistas. Gerencie sua agenda, atenda pacientes de todo o Brasil e tenha suporte clínico completo.", 
                features: ["Gestão de Agenda", "Prontuário Eletrônico", "Pagamentos Seguros"],
                path: "/login",
                label: "Para Profissionais",
                theme: "emerald"
              },
              { 
                icon: Building2, 
                title: "Empresa", 
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
                  {item.title === "Usuário" ? "Entrar como Paciente" : item.title === "Terapeuta" ? "Entrar como Terapeuta" : "Saiba Mais"}
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST & SECURITY SECTION */}
      <section className="py-32 px-6 relative z-10 border-y border-black/5 bg-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { title: "Privacidade Total", desc: "Seus dados são criptografados e o anonimato é garantido em todos os níveis." },
              { title: "Protocolo Clínico", desc: "Metodologia baseada em evidências e protocolos internacionais de crise." },
              { title: "Disponibilidade 24/7", desc: "Nossa triagem nunca dorme. Acolhimento imediato a qualquer hora." },
              { title: "Conexão Segura", desc: "Intermediação ética entre pacientes e profissionais de saúde mental." }
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <div className="w-8 h-1 bg-emerald-600/30"></div>
                <h4 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-tight">{item.title}</h4>
                <p className="text-[#6a6a6a] text-sm leading-relaxed font-light">{item.desc}</p>
              </div>
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
                "O PSE não é apenas uma ferramenta, é o respiro que eu precisava quando senti que o mundo estava desabando. A triagem foi rápida e o acolhimento da IARA me deu a clareza para buscar ajuda profissional."
              </h2>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-emerald-600" />
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

      {/* PWA INSTALL SECTION */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-emerald-900 text-white rounded-[64px] p-12 md:p-24 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 blur-[120px] rounded-full"></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-10 text-center md:text-left">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-xs font-bold uppercase tracking-widest">
                  <Smartphone className="w-4 h-4" />
                  Experiência Nativa
                </div>
                <h2 className="text-5xl md:text-7xl font-serif italic tracking-tight leading-[1]">
                  Tenha o PSE <br /> <span className="text-emerald-400 font-bold not-italic">sempre com você.</span>
                </h2>
                <p className="text-xl text-emerald-100/80 font-light leading-relaxed">
                  Instale nosso aplicativo diretamente no seu celular para acesso instantâneo, notificações de cuidado e suporte offline em momentos críticos.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <button 
                    onClick={handleInstall}
                    className="px-10 py-5 bg-white text-emerald-900 rounded-[28px] font-bold text-xl transition-all hover:scale-105 shadow-2xl flex items-center gap-3 disabled:opacity-50"
                    disabled={!installPrompt}
                  >
                    {installPrompt ? "Instalar App" : "App Instalado"}
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="aspect-[9/16] w-full max-w-[300px] mx-auto bg-emerald-800 rounded-[48px] border-[8px] border-emerald-700 shadow-2xl relative overflow-hidden">
                  <div className="p-8 space-y-6">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                      <Activity className="w-6 h-6 text-emerald-800" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-white/20 rounded-full"></div>
                      <div className="h-4 w-1/2 bg-white/10 rounded-full"></div>
                    </div>
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
              <Heart className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-serif italic font-bold text-[#1a1a1a] tracking-tight">PSE — Pronto Socorro Emocional</span>
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
          <p className="text-[#6a6a6a] text-xs">© 2026 PSE. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>

  );
}
