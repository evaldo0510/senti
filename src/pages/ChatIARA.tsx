import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { falarComIARA, ChatMessage } from "../services/iaraService";
import { Send, ArrowLeft, HeartHandshake, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface Message {
  tipo: "user" | "iara";
  texto: string;
}

export default function ChatIARA() {
  const location = useLocation();
  const navigate = useNavigate();
  const { intensidade, emocao } = location.state || {};

  const [mensagem, setMensagem] = useState("");
  const [chat, setChat] = useState<Message[]>([
    { tipo: "iara", texto: "Eu estou aqui com você... e você não precisa resolver tudo agora." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [alerta, setAlerta] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, alerta]);

  const enviarMensagem = async () => {
    if (!mensagem.trim() || isLoading) return;

    const novaConversa: Message[] = [...chat, { tipo: "user", texto: mensagem }];
    setChat(novaConversa);
    setMensagem("");
    setIsLoading(true);

    const historico: ChatMessage[] = chat.map(msg => ({
      role: msg.tipo === "user" ? "user" : "model",
      parts: [{ text: msg.texto }]
    }));

    const { resposta, risco } = await falarComIARA(mensagem, historico, { emocao, intensidade });

    if (risco === "alto") {
      setAlerta(true);
    }

    setChat([...novaConversa, { tipo: "iara", texto: resposta }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-screen bg-slate-950 text-slate-100"
    >
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-medium text-emerald-400">IARA</h2>
            <p className="text-xs text-slate-400">Sua voz interior</p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/profissionais")}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 rounded-full text-sm font-medium transition-colors border border-emerald-500/20"
        >
          <HeartHandshake className="w-4 h-4" />
          <span className="hidden sm:inline">Falar com Terapeuta</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {alerta && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/30 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 text-red-200"
          >
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-300 mb-1">Você não está sozinho.</p>
              <p className="text-sm text-red-200/80 mb-3">Por favor, procure ajuda imediata. Existem pessoas prontas para te ouvir agora mesmo.</p>
              <a href="tel:188" className="inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors">
                Ligar 188 (CVV)
              </a>
            </div>
          </motion.div>
        )}

        {chat.map((msg, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={index}
            className={`flex ${msg.tipo === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.tipo === "user"
                  ? "bg-emerald-600/20 text-emerald-50 rounded-tr-sm border border-emerald-500/20"
                  : "bg-slate-800/50 text-slate-200 rounded-tl-sm border border-white/5"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2">
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="O que você está sentindo agora?"
            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none min-h-[52px] max-h-32"
            rows={1}
          />
          <button 
            onClick={enviarMensagem}
            disabled={!mensagem.trim() || isLoading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
