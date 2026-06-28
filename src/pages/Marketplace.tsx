import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ShoppingBag, 
  Sparkles, 
  Lock, 
  ArrowLeft, 
  Crown, 
  Heart, 
  Gift, 
  BookOpen, 
  BrainCircuit 
} from "lucide-react";

export default function Marketplace() {
  const navigate = useNavigate();

  const marketplaceItems = [
    {
      id: "masterclass",
      title: "Masterclasses de Autocuidado",
      category: "Educação Emocional",
      description: "Vídeos e exercícios guiados por psicólogos renomados para regulação emocional.",
      price: "Em breve",
      icon: BookOpen,
      color: "from-violet-500/10 to-purple-500/10 text-purple-600 dark:text-purple-400"
    },
    {
      id: "sensory_kits",
      title: "Kits Sensoriais SentiPae",
      category: "Bem-estar Físico",
      description: "Acessórios físicos selecionados para ancoragem e descompressão sensorial.",
      price: "Em breve",
      icon: Heart,
      color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400"
    },
    {
      id: "specialist_sessions",
      title: "Workshops de Grupo",
      category: "Conexão Social",
      description: "Sessões dinâmicas coletivas focadas em ansiedade, sono e estresse corporativo.",
      price: "Em breve",
      icon: BrainCircuit,
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400"
    },
    {
      id: "gift_cards",
      title: "Cartões de Presente Clínicos",
      category: "Apoio Familiar",
      description: "Presenteie quem você ama com consultas ou pacotes de terapia em nossa plataforma.",
      price: "Em breve",
      icon: Gift,
      color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 transition-colors font-sans flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 sm:p-6 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md z-20 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/app")}
            className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer text-slate-600 dark:text-slate-400"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h1 className="text-base font-bold font-serif italic text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
              Marketplace SentiPae
            </h1>
            <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Em Desenvolvimento</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 rounded-full animate-pulse">
          Em breve
        </span>
      </header>

      {/* Content */}
      <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6 flex-1 flex flex-col justify-center">
        
        {/* Welcome Section */}
        <div className="space-y-3 text-center max-w-md mx-auto py-4">
          <div className="w-16 h-16 bg-emerald-500/15 rounded-3xl flex items-center justify-center border border-emerald-500/20 mx-auto shadow-sm">
            <Sparkles className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-serif italic text-slate-850 dark:text-slate-100">
              O seu ecossistema de bem-estar completo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Estamos preparando uma curadoria de recursos clínicos, educativos e físicos para acompanhar sua jornada de regulação de ponta a ponta.
            </p>
          </div>
        </div>

        {/* Mock Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {marketplaceItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.id}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl relative overflow-hidden group space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${item.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/5">
                    <Lock className="w-2.5 h-2.5" /> {item.price}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">{item.category}</p>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-normal font-light">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Alert */}
        <div className="bg-emerald-550/5 border border-emerald-500/15 p-5 rounded-3xl text-center space-y-2">
          <Crown className="w-5 h-5 text-emerald-500 mx-auto" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Acesso Premium Vitalício</h4>
          <p className="text-[11px] text-slate-400 font-light leading-relaxed">
            Usuários com assinatura SentiPae Premium ativa terão benefícios especiais e descontos exclusivos em todos os produtos físicos e digitais do Marketplace assim que forem lançados.
          </p>
        </div>

      </main>
    </div>
  );
}
