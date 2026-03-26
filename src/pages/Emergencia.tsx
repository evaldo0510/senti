import React from "react";
import { useNavigate } from "react-router-dom";
import { Phone, AlertTriangle, Heart, ArrowLeft, ShieldAlert, Activity, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { usePWA } from "../contexts/PWAContext";

export default function Emergencia() {
  const navigate = useNavigate();
  const { handleInstall, isInstallable } = usePWA();

  return (
    <div className="min-h-screen bg-[#0a0502] flex flex-col items-center justify-center p-6 text-slate-100 relative overflow-hidden">
      
      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900/40 backdrop-blur-2xl border border-red-500/20 p-10 rounded-[40px] text-center space-y-8 relative z-10 shadow-2xl"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter text-white">Protocolo de Emergência</h2>
            <p className="text-red-400/80 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
              <Activity className="w-3 h-3" />
              Atenção Imediata Necessária
            </p>
          </div>
        </div>
        
        <p className="text-slate-400 text-lg leading-relaxed font-light">
          Você não precisa enfrentar isso sozinho. Nossa rede de apoio está ativa e pronta para te acolher agora.
        </p>

        <div className="grid gap-4 pt-4">
          <a 
            href="tel:188"
            className="group relative w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-[28px] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.3)] active:scale-[0.98]"
          >
            <Phone className="w-5 h-5 animate-bounce" />
            LIGAR 188 (CVV)
            <div className="absolute -top-2 -right-2 bg-white text-red-600 text-[10px] font-black px-2 py-1 rounded-full shadow-lg">24H</div>
          </a>

          <button 
            onClick={() => navigate("/pronto-atendimento")}
            className="w-full py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[28px] font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Heart className="w-5 h-5 text-emerald-400" />
            Falar com Especialista
          </button>

          <button 
            onClick={() => navigate("/chat")}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[28px] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-[0.98]"
          >
            <Activity className="w-5 h-5 animate-pulse" />
            Falar com a Iara (IA)
          </button>
        </div>

        <div className="pt-8 space-y-4">
          <div className="p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-[32px] space-y-4">
            <p className="text-indigo-300 text-sm font-bold uppercase tracking-widest">Acesso Rápido</p>
            <h3 className="text-white font-black text-lg">Tenha o SENTI sempre com você</h3>
            <button 
              onClick={handleInstall}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.95]"
            >
              <Smartphone className="w-5 h-5" />
              {isInstallable ? "INSTALAR APLICATIVO" : "BAIXAR O APLICATIVO"}
            </button>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button 
              onClick={() => navigate("/")}
              className="text-slate-500 hover:text-slate-300 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancelar Protocolo
            </button>
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-8 text-center w-full px-6 opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
          Privacidade Total • Criptografia de Ponta a Ponta
        </p>
      </div>
    </div>
  );
}
