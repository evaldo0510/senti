import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Sparkles, Send, Loader2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "../types";
import { getIARAResponse } from "../services/geminiService";
import { cn } from "../lib/utils";

interface IARASchedulingAssistantProps {
  therapist: UserProfile;
}

export default function IARASchedulingAssistant({ therapist }: IARASchedulingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: 'model', 
          text: `Olá! Eu sou a IARA. Percebi que você está interessado no perfil de ${therapist.nome}. Tem alguma dúvida sobre como funciona o agendamento ou sobre a terapia na SENTI que eu possa te ajudar agora?` 
        }
      ]);
    }
  }, [isOpen, therapist.nome, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const schedulingContext = `
        Você é a IARA, assistente de agendamento da SENTI.
        O usuário está visualizando o perfil de ${therapist.nome}.
        Informações do terapeuta:
        - Especialidades: ${therapist.especialidades?.join(", ")}
        - Valor da sessão: R$ ${therapist.preco}
        - Bio: ${therapist.biografia}
        
        Responda de forma curta, acolhedora e foque em tirar dúvidas sobre o processo de agendamento ou sobre o profissional.
        Se o usuário quiser agendar, incentive-o a clicar no botão de agendamento.
      `;

      const response = await getIARAResponse(userMsg, history, undefined, schedulingContext);
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error("Erro no chat IARA:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, tive um problema técnico. Como posso te ajudar com o agendamento?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[150]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/40 border border-emerald-500/20 relative group"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">Dúvidas com IARA</h3>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Suporte ao Agendamento</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
              >
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-emerald-600 text-white rounded-tr-sm" 
                        : "bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                      <span className="text-xs text-slate-500">IARA está escrevendo...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-slate-800/30">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Tire sua dúvida aqui..."
                    className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/agendamento/${therapist.uid}`);
                    }}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/5 flex items-center gap-2 justify-center"
                  >
                    <Calendar className="w-4 h-4" />
                    Ir para Agendamento
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
