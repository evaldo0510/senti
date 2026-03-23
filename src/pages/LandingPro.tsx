import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, Shield, Clock, Users, MessageCircle, Building2, Landmark, ArrowRight, Phone } from "lucide-react";

export default function LandingPro() {
  const navigate = useNavigate();

  const abrirWhatsApp = () => {
    const numero = "5511999999999";
    const mensagem = encodeURIComponent("Olá, preciso de apoio emocional pelo PSE");
    window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-emerald-500" />
            <span className="text-xl font-medium tracking-tight">PSE</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Entrar
            </button>
            <button onClick={() => navigate("/lead")} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-sm font-medium transition-colors">
              Começar
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 -z-10"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-light tracking-tight text-white leading-[1.1]"
          >
            Tem momentos que ninguém vê...<br/>
            <span className="text-emerald-400 font-medium">mas você sente tudo.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Um pronto socorro emocional que te escuta, te entende e te guia. Aqui, você não precisa passar por isso sozinho.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <button 
              onClick={() => navigate("/lead")}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-lg font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
            >
              Falar com a IARA agora
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={abrirWhatsApp}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-lg font-medium transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              <Phone className="w-5 h-5" />
              WhatsApp
            </button>
          </motion.div>
        </div>
      </section>

      {/* DOR */}
      <section className="py-24 px-6 bg-slate-900 border-y border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-light text-white">Você já sentiu isso?</h2>
          <p className="text-xl text-slate-400 leading-relaxed">
            Ansiedade... silêncio... pensamentos que não param...<br/>
            e ninguém para ouvir.
          </p>
        </div>
      </section>

      {/* SOLUÇÃO & DEMO */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-light text-white leading-tight">
              IARA — sua <span className="text-emerald-400">voz interior</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Uma inteligência que te escuta sem julgamentos, te ajuda a respirar no seu tempo e te guia com calma de volta ao seu centro.
            </p>
            <ul className="space-y-4">
              {[
                { icon: Clock, text: "Atendimento 24 horas por dia" },
                { icon: Shield, text: "Total anonimato e segurança" },
                { icon: Users, text: "Conexão com suporte humano" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400">
                    <item.icon className="w-5 h-5" />
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-2xl relative">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full"></div>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-slate-800 text-slate-200 p-4 rounded-2xl rounded-tr-sm max-w-[80%]">
                    <p>não estou bem...</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-emerald-900/30 border border-emerald-500/20 text-emerald-100 p-4 rounded-2xl rounded-tl-sm max-w-[80%]">
                    <p>Eu estou aqui com você...<br/>Vamos respirar juntos um pouco?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEGMENTAÇÃO */}
      <section className="py-24 px-6 bg-slate-900 border-y border-white/5">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-light text-white">Para quem é o PSE?</h2>
            <p className="text-slate-400">Um ecossistema completo de cuidado emocional.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MessageCircle, title: "Preciso de ajuda", desc: "Fale com a IARA agora", path: "/lead", color: "text-blue-400", bg: "bg-blue-900/20" },
              { icon: Heart, title: "Sou Terapeuta", desc: "Atenda pacientes", path: "/terapeuta-setup", color: "text-emerald-400", bg: "bg-emerald-900/20" },
              { icon: Building2, title: "Sou Empresa", desc: "Cuide do seu time", path: "/vendas-empresa", color: "text-purple-400", bg: "bg-purple-900/20" },
              { icon: Landmark, title: "Sou Prefeitura", desc: "Escala pública", path: "/prefeitura", color: "text-amber-400", bg: "bg-amber-900/20" }
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => navigate(item.path)}
                className="p-6 bg-slate-950 border border-white/5 rounded-3xl hover:bg-slate-800 transition-all text-left group"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-light text-white">
            Você não precisa passar por isso sozinho.
          </h2>
          <button 
            onClick={() => navigate("/lead")}
            className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full text-xl font-medium transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
          >
            Entrar agora e ser ouvido
          </button>
        </div>
      </section>

    </div>
  );
}
