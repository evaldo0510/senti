import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Building2, TrendingUp, ShieldCheck, Users, ArrowRight, CheckCircle2 } from "lucide-react";

export default function VendasEmpresa() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Building2 className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-medium tracking-tight">PSE Empresas</span>
          </div>
          <button onClick={() => navigate("/empresa")} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-sm font-medium transition-colors">
            Acessar Painel RH
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950 -z-10"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-light tracking-tight text-white leading-[1.1]"
          >
            Saúde emocional para <br/>
            <span className="text-purple-400 font-medium">sua empresa.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Reduza afastamentos, aumente a produtividade e cuide dos seus colaboradores com tecnologia preventiva e suporte humano especializado.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="pt-8"
          >
            <button 
              className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-lg font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] mx-auto"
            >
              Falar com um Consultor
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-24 px-6 bg-slate-900 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { icon: TrendingUp, title: "Redução de Absenteísmo", desc: "Identifique e trate problemas emocionais antes que se tornem afastamentos." },
            { icon: Users, title: "Apoio 24/7", desc: "Seus colaboradores têm acesso à IARA e a terapeutas a qualquer momento." },
            { icon: ShieldCheck, title: "Relatórios Anônimos", desc: "Acompanhe a saúde emocional da empresa através de dashboards inteligentes e seguros." }
          ].map((item, i) => (
            <div key={i} className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-900/20 text-purple-400 flex items-center justify-center mx-auto mb-6">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-medium text-white">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DETALHES */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-light text-white">O que está incluso no plano</h2>
          </div>
          
          <div className="bg-slate-900 border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl">
            <ul className="space-y-6">
              {[
                "Acesso ilimitado à IARA (Inteligência Artificial de Regulação)",
                "Encaminhamento automático para rede de psicólogos e psiquiatras",
                "Painel RH com métricas de saúde emocional (dados anonimizados)",
                "Mapeamento de risco por setor ou departamento",
                "Suporte técnico e onboarding para a equipe",
                "Material de conscientização sobre saúde mental"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-slate-300 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 px-6 relative overflow-hidden bg-purple-900/20 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-light text-white">
            Transforme a cultura da sua empresa hoje.
          </h2>
          <button 
            className="px-10 py-5 bg-purple-500 hover:bg-purple-400 text-slate-950 rounded-full text-xl font-medium transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)]"
          >
            Agendar Demonstração
          </button>
        </div>
      </section>

    </div>
  );
}
