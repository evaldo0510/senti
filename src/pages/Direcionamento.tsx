import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Phone, User, Building, ArrowLeft } from "lucide-react";

export default function Direcionamento() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100"
    >
      <div className="w-full max-w-md space-y-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors mb-4">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-light tracking-tight text-slate-200">
            Próximos Passos
          </h2>
          <p className="text-slate-400">
            A IARA te ajudou a se acalmar, mas é importante ter acompanhamento. Como você prefere continuar?
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => navigate("/profissionais")}
            className="w-full p-6 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl transition-all flex items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 bg-emerald-900/30 rounded-full flex items-center justify-center group-hover:bg-emerald-800/50 transition-colors">
              <User className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-200">Falar com um Psicólogo</h3>
              <p className="text-sm text-slate-400">Atendimento online imediato ou agendado</p>
            </div>
          </button>

          <button 
            onClick={() => navigate("/profissionais")}
            className="w-full p-6 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl transition-all flex items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-800/50 transition-colors">
              <Building className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-200">Encontrar uma Clínica</h3>
              <p className="text-sm text-slate-400">Clínicas parceiras e CAPS próximos a você</p>
            </div>
          </button>

          <a 
            href="tel:188"
            className="w-full p-6 bg-red-900/20 hover:bg-red-900/30 border border-red-500/20 rounded-2xl transition-all flex items-center gap-4 text-left group block"
          >
            <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center group-hover:bg-red-800/80 transition-colors">
              <Phone className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-200">Emergência (CVV)</h3>
              <p className="text-sm text-red-400/80">Ligue 188 para apoio emocional 24h</p>
            </div>
          </a>
        </div>
      </div>
    </motion.div>
  );
}