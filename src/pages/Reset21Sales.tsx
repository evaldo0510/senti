import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight,
  Star,
  Heart,
  Brain,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { auth } from "../services/firebase";
import { userService } from "../services/userService";

export default function Reset21Sales() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("/api/create-journey-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          userEmail: currentUser.email
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Erro ao criar sessão de checkout");
      }
    } catch (error) {
      console.error("Erro no checkout:", error);
      alert("Ocorreu um erro ao processar seu pedido. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-slate-100 flex flex-col font-sans relative overflow-x-hidden pb-20">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]"></div>
      </div>

      <header className="p-6 flex items-center justify-between z-10 relative">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-black tracking-tighter text-white">SENTI Premium</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="flex-1 p-6 z-10 relative max-w-2xl mx-auto w-full space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-emerald-500/20 rounded-[28px] flex items-center justify-center mx-auto border border-emerald-500/30"
          >
            <Sparkles className="w-10 h-10 text-emerald-400" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter text-white leading-none">
              ReSet Emocional <br />
              <span className="text-emerald-400">21 Dias</span>
            </h2>
            <p className="text-slate-400 font-medium text-lg italic">
              "Você não precisa continuar reagindo igual."
            </p>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="grid grid-cols-1 gap-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Reprogramação Prática</h4>
              <p className="text-sm text-slate-400">Um protocolo guiado para reorganizar sua resposta emocional.</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Áudios IARA</h4>
              <p className="text-sm text-slate-400">Condução por voz para estados de calma e clareza profunda.</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Menos Reatividade</h4>
              <p className="text-sm text-slate-400">Aprenda a escolher sua resposta em vez de apenas reagir.</p>
            </div>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[40px] p-8 text-white shadow-2xl shadow-emerald-900/40 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <Star className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-1.5 rounded-full">Oferta Premium</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold">R$</span>
                <span className="text-6xl font-black tracking-tighter">29</span>
                <span className="text-xl font-bold text-emerald-200">,90</span>
              </div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest opacity-80">Pagamento Único • Acesso Vitalício</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span className="text-sm font-medium">Jornada completa de 21 dias</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span className="text-sm font-medium">Todos os áudios da IARA</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span className="text-sm font-medium">Histórico e acompanhamento</span>
              </div>
            </div>

            <button 
              onClick={handlePurchase}
              disabled={loading}
              className="w-full py-5 bg-white text-emerald-700 rounded-[24px] font-black text-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  Desbloquear Agora
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-200 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              Compra 100% Segura
            </div>
          </div>
        </section>

        {/* FAQ / Social Proof */}
        <section className="text-center space-y-4">
          <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-xs mx-auto">
            Junte-se a centenas de pessoas que já iniciaram sua reprogramação emocional.
          </p>
          <div className="flex justify-center -space-x-2">
            {[1,2,3,4,5].map(i => (
              <img 
                key={i}
                src={`https://i.pravatar.cc/100?img=${i+10}`} 
                className="w-8 h-8 rounded-full border-2 border-[#0a0502]"
                alt="user"
              />
            ))}
          </div>
        </section>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0502] via-[#0a0502] to-transparent z-20">
        <button 
          onClick={() => navigate(-1)}
          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-xl"
        >
          Ainda não estou pronto
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
