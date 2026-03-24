import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  BarChart3,
  HeartHandshake
} from "lucide-react";

export default function VendasEmpresa() {
  const navigate = useNavigate();

  const abrirWhatsApp = () => {
    const numero = "5511999999999";
    const mensagem = encodeURIComponent("Olá, gostaria de uma demonstração do ReSet Emocional PCH para minha empresa.");
    window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-slate-950 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">ReSet PCH Empresas</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/empresa")} 
              className="px-6 py-2.5 bg-white text-slate-950 hover:bg-purple-400 rounded-full text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95"
            >
              Acessar Painel RH
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 md:pt-56 md:pb-40 px-6">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3" />
            Solução Corporativa de Elite
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-black tracking-tight text-white leading-[0.9]"
          >
            Saúde emocional para <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">sua empresa.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Reduza afastamentos, aumente a produtividade e cuide do seu time com <span className="text-white font-medium">tecnologia preventiva</span> e suporte humano especializado.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-10"
          >
            <button 
              onClick={abrirWhatsApp}
              className="group px-12 py-6 bg-purple-600 hover:bg-purple-500 text-white rounded-3xl text-2xl font-black transition-all hover:scale-105 flex items-center justify-center gap-4 shadow-[0_20px_50px_-10px_rgba(168,85,247,0.4)] mx-auto"
            >
              Falar com um Consultor
              <ArrowRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* BENEFÍCIOS SECTION */}
      <section className="py-32 px-6 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { icon: TrendingUp, title: "Redução de Absenteísmo", desc: "Identifique e trate problemas emocionais antes que se tornem afastamentos custosos." },
            { icon: Zap, title: "Apoio Imediato 24/7", desc: "Seus colaboradores têm acesso à IARA e a terapeutas a qualquer momento, sem filas." },
            { icon: BarChart3, title: "Dashboards de Saúde", desc: "Acompanhe a saúde emocional da empresa através de dados inteligentes e 100% seguros." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 bg-slate-950 border border-white/5 rounded-[40px] space-y-6 text-center group"
            >
              <div className="w-20 h-20 rounded-3xl bg-purple-900/20 text-purple-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <item.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed text-lg">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DETALHES SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.9]">
              O que está <br/>
              <span className="text-purple-400">incluso no plano.</span>
            </h2>
            <p className="text-xl text-slate-400 font-light leading-relaxed">
              Uma solução completa que une inteligência artificial de ponta com a rede de terapeutas mais qualificada do país.
            </p>
            
            <div className="flex items-center gap-4 p-6 bg-purple-500/10 border border-purple-500/20 rounded-3xl">
              <HeartHandshake className="w-10 h-10 text-purple-400" />
              <p className="text-purple-100 font-medium">Implementação guiada e suporte dedicado ao RH.</p>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 md:p-14 rounded-[50px] shadow-2xl">
            <ul className="space-y-8">
              {[
                "Acesso ilimitado à IARA (Apoio 24h)",
                "Encaminhamento para rede de especialistas",
                "Painel RH com métricas em tempo real",
                "Mapeamento de risco por departamento",
                "Onboarding completo para colaboradores",
                "Workshops de conscientização mensal"
              ].map((item, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-5 text-slate-200 text-xl font-medium"
                >
                  <CheckCircle2 className="w-7 h-7 text-purple-500 flex-shrink-0 mt-0.5" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-40 px-6 relative overflow-hidden bg-purple-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-12">
          <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
            Transforme a cultura da sua empresa hoje.
          </h2>
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={abrirWhatsApp}
              className="px-12 py-6 bg-purple-500 hover:bg-purple-400 text-slate-950 rounded-3xl text-2xl font-black transition-all hover:scale-105 shadow-[0_20px_50px_-10px_rgba(168,85,247,0.5)] flex items-center gap-4"
            >
              Agendar Demonstração
              <ArrowRight className="w-8 h-8" />
            </button>
            <p className="text-slate-500 font-medium">Fale com um especialista em menos de 2 minutos.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-white">ReSet PCH Empresas — Saúde Mental Corporativa</span>
          </div>
          <p className="text-slate-600 text-xs">© 2026 ReSet Emocional PCH. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
