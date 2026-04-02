import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Mail, ArrowRight, ShieldCheck, HeartPulse, Sparkles } from "lucide-react";

export default function LeadForm() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const salvar = () => {
    if (!nome) return;
    localStorage.setItem("lead", JSON.stringify({ nome, email }));
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] space-y-10 relative shadow-2xl"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <HeartPulse className="w-8 h-8 text-slate-950" />
          </div>
        </div>
        
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-2"
          >
            <Sparkles className="w-3 h-3" />
            Sua jornada começa aqui
          </motion.div>
          <h2 className="text-4xl font-black text-white tracking-tight">Antes de começar...</h2>
          <p className="text-slate-400 font-light text-lg">Como podemos chamar você?</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome ou Apelido</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Maria ou Sol"
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail (Para receber novidades)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com (opcional)"
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-500 justify-center bg-white/5 py-3 rounded-2xl border border-white/5">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span className="font-medium">100% Seguro e Anônimo</span>
        </div>

        <button 
          onClick={salvar}
          disabled={!nome}
          className="group w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] active:scale-95"
        >
          Continuar para o Chat
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      <button 
        onClick={() => navigate("/")}
        className="mt-8 text-slate-500 hover:text-white transition-colors text-sm font-medium"
      >
        Voltar para o início
      </button>
    </div>
  );
}
