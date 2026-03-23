import React from "react";
import { useNavigate } from "react-router-dom";
import { Phone, AlertTriangle, Heart, ArrowLeft } from "lucide-react";

export default function Emergencia() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-red-500/30 p-8 rounded-3xl text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-3xl font-light text-slate-200">Você não está sozinho</h2>
        
        <p className="text-slate-400">
          Isso é importante demais para você enfrentar sozinho. Por favor, procure ajuda imediata.
        </p>

        <div className="bg-slate-950 border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-center gap-3 text-2xl font-medium text-emerald-400">
            <Phone className="w-6 h-6" />
            CVV: 188
          </div>
          <p className="text-sm text-slate-500">Atendimento 24h gratuito e sigiloso</p>
        </div>

        <div className="space-y-3 pt-4">
          <button 
            onClick={() => navigate("/profissionais")}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Falar com terapeuta agora
          </button>
          
          <button 
            onClick={() => navigate("/")}
            className="w-full py-4 bg-transparent hover:bg-white/5 text-slate-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
