import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle, Phone, Send, Sparkles, MapPin } from "lucide-react";
import { motion } from "motion/react";

export default function Contact() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#4a4a4a] hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            <span className="text-xl font-serif italic font-bold tracking-tight">SENTI</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-20 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Estamos aqui para você
              </div>
              <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-[#1a1a1a] leading-none">
                Vamos <span className="text-emerald-700 font-bold not-italic">Conversar?</span>
              </h1>
              <p className="text-[#6a6a6a] text-xl font-light leading-relaxed max-w-md">
                Dúvidas, sugestões ou parcerias? Nossa equipe está pronta para te ouvir e ajudar no que for preciso.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a]">E-mail</h4>
                  <p className="text-[#6a6a6a] font-light">contato@senti.app</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a]">WhatsApp</h4>
                  <p className="text-[#6a6a6a] font-light">+55 (11) 99999-9999</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a]">Escritório</h4>
                  <p className="text-[#6a6a6a] font-light">São Paulo, SP - Brasil</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#f5f5f0] p-10 md:p-16 rounded-[64px] shadow-sm border border-black/5"
          >
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Send className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-3xl font-serif italic text-[#1a1a1a]">Mensagem Enviada!</h3>
                <p className="text-[#6a6a6a] font-light">Obrigado por entrar em contato. Responderemos o mais breve possível.</p>
                <button 
                  onClick={() => setSent(false)}
                  className="text-emerald-700 font-bold uppercase tracking-widest text-xs hover:underline"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6a6a6a] ml-2">Seu Nome</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Como podemos te chamar?"
                    className="w-full px-8 py-5 bg-white border border-black/5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6a6a6a] ml-2">Seu E-mail</label>
                  <input 
                    required
                    type="email" 
                    placeholder="seu@email.com"
                    className="w-full px-8 py-5 bg-white border border-black/5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6a6a6a] ml-2">Mensagem</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Como podemos te ajudar hoje?"
                    className="w-full px-8 py-5 bg-white border border-black/5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-light resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-[#1a1a1a] text-white rounded-[32px] font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                >
                  Enviar Mensagem
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="py-20 px-6 border-t border-black/5 text-center">
        <p className="text-xs text-[#6a6a6a] font-light uppercase tracking-widest">© 2026 SENTI • Cuidado Humano e Inteligente</p>
      </footer>
    </div>
  );
}
