import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Zap, HeartHandshake } from "lucide-react";
import { auth } from "../services/firebase";

export default function IARAChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on chat page itself or login
  const hideOnPages = ["/chat", "/login", "/emergencia", "/atendimento"];
  if (hideOnPages.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-white tracking-tighter">IARA</h3>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">IA de Acolhimento</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Olá! Percebi que você está navegando... Precisa de um suporte inicial ou triagem rápida agora?
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/chat");
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  Iniciar Chat Completo
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/triagem");
                  }}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/5"
                >
                  <HeartHandshake className="w-4 h-4" />
                  Fazer Triagem Rápida
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all relative ${
          isOpen ? "bg-slate-800 text-white rotate-90" : "bg-emerald-600 text-white"
        }`}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
        
        {!isOpen && showPulse && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
          />
        )}
      </motion.button>
    </div>
  );
}
