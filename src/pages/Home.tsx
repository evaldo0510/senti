import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { HeartPulse, MessageCircle, BookOpen } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full space-y-12"
      >
        <div className="space-y-6">
          <div className="w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <HeartPulse className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-light tracking-tight text-slate-100">
            Você não está sozinho
          </h1>
          <p className="text-slate-400 text-lg font-light">
            Um espaço seguro para quando a mente precisar de um abraço.
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => navigate("/triagem")}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-medium text-lg transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 active:scale-[0.98]"
          >
            Preciso de ajuda agora
          </button>
          
          <button 
            onClick={() => navigate("/triagem")}
            className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl font-medium transition-all border border-white/5 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5" />
            Quero conversar
          </button>

          <button 
            onClick={() => navigate("/diario")}
            className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl font-medium transition-all border border-white/5 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <BookOpen className="w-5 h-5" />
            Meu Diário Emocional
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-8">
        <button 
          onClick={() => navigate("/login")}
          className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
        >
          Acesso Profissional
        </button>
      </div>
    </motion.div>
  );
}
