import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { HeartPulse, User, MessageCircle, Phone, ArrowLeft, Loader2, ShieldCheck, Activity } from "lucide-react";
import { userService } from "../services/userService";
import { UserProfile } from "../types";

export default function ProntoAtendimento() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"searching" | "found" | "not_found">("searching");
  const [therapists, setTherapists] = useState<UserProfile[]>([]);

  useEffect(() => {
    const findTherapists = async () => {
      // Simulate a search delay for "Pronto Atendimento" feel
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const onlineTherapists = await userService.getFeaturedTherapists(3);
      if (onlineTherapists.length > 0) {
        setTherapists(onlineTherapists);
        setStatus("found");
      } else {
        setStatus("not_found");
      }
    };

    findTherapists();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Sentí <span className="text-emerald-500">Go</span></h1>
            <p className="text-slate-400 text-sm italic">Pronto atendimento emocional</p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {status === "searching" && (
            <motion.div 
              key="searching"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="bg-slate-900/50 border border-white/10 p-10 rounded-[40px] text-center space-y-6 backdrop-blur-xl"
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <HeartPulse className="w-10 h-10 text-emerald-500 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Buscando Terapeuta...</h2>
                <p className="text-slate-400">Estamos localizando um profissional disponível para te atender agora.</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <Activity className="w-4 h-4" />
                Triagem em tempo real
              </div>
            </motion.div>
          )}

          {status === "found" && (
            <motion.div 
              key="found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-400 mb-6">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Encontramos profissionais online para você.</span>
              </div>

              {therapists.map((t) => (
                <motion.div 
                  key={t.uid}
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-900 border border-white/10 p-6 rounded-3xl flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-all"
                  onClick={() => navigate(`/agendamento/${t.uid}`)}
                >
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                    {t.fotoUrl ? (
                      <img src={t.fotoUrl} alt={t.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{t.nome}</h3>
                    <p className="text-slate-400 text-sm truncate">{t.especialidades?.[0] || 'Psicólogo Clínico'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Disponível Agora</span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                </motion.div>
              ))}

              <button 
                onClick={() => setStatus("not_found")}
                className="w-full py-4 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
              >
                Ver outras opções
              </button>
            </motion.div>
          )}

          {status === "not_found" && (
            <motion.div 
              key="not_found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 border border-white/10 p-10 rounded-[40px] text-center space-y-8 backdrop-blur-xl"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
                  <MessageCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">IARA está pronta</h2>
                  <p className="text-slate-400">No momento, todos os terapeutas estão em atendimento. Nossa IA de acolhimento pode te ouvir agora mesmo.</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate("/chat")}
                  className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[32px] font-black text-xl transition-all flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-[0.98]"
                >
                  Falar com a IARA
                </button>
                <button 
                  onClick={() => navigate("/profissionais")}
                  className="w-full py-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[32px] font-black text-xl transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                >
                  Ver todos os profissionais
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Você também pode ligar para o CVV (188) para apoio emocional imediato e gratuito.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
