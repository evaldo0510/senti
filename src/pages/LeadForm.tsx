import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Mail, ArrowRight, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-white/10 p-8 rounded-3xl space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
        
        <div className="text-center space-y-2 relative z-10">
          <h2 className="text-3xl font-light text-slate-200">Antes de começar...</h2>
          <p className="text-slate-400">Como podemos chamar você?</p>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome ou apelido"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email (opcional)"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 justify-center relative z-10">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Seus dados estão seguros e anônimos.</span>
        </div>

        <button 
          onClick={salvar}
          disabled={!nome}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 relative z-10"
        >
          Continuar para o Chat
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
