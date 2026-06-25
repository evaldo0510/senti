import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../components/AuthProvider";
import { userService } from "../services/userService";
import { 
  HeartPulse, 
  BrainCircuit, 
  Users, 
  Compass, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Check
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, isAuthReady } = useAuth();
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthReady && profile) {
      // If user has already completed onboarding, redirect directly to the app dashboard
      if (profile.onboardingCompleted) {
        navigate("/app");
      }
    }
  }, [isAuthReady, profile, navigate]);

  const objectives = [
    { 
      id: "conversar_ia", 
      label: "Conversar com a IA", 
      desc: "Acolhimento imediato e escuta sem julgamentos 24/7 com a IARA.", 
      icon: BrainCircuit,
      bgColor: "from-emerald-500/10 to-teal-500/5",
      borderColor: "border-emerald-500/20",
      accentColor: "text-emerald-500 bg-emerald-500/10"
    },
    { 
      id: "encontrar_terapeuta", 
      label: "Encontrar um terapeuta", 
      desc: "Sessões estruturadas e teleconsultas com psicólogos clínicos qualificados.", 
      icon: Users,
      bgColor: "from-indigo-500/10 to-purple-500/5",
      borderColor: "border-indigo-500/20",
      accentColor: "text-indigo-500 bg-indigo-500/10"
    },
    { 
      id: "autoconhecimento", 
      label: "Desenvolver autoconhecimento", 
      desc: "Diários, reflexões diárias, desafios guiados e controle de emoções.", 
      icon: Compass,
      bgColor: "from-amber-500/10 to-orange-500/5",
      borderColor: "border-amber-500/20",
      accentColor: "text-amber-500 bg-amber-500/10"
    },
    { 
      id: "evolucao_emocional", 
      label: "Acompanhar minha evolução emocional", 
      desc: "Mapeamento diário de humor, sono, atividades físicas e hábitos saudáveis.", 
      icon: TrendingUp,
      bgColor: "from-rose-500/10 to-pink-500/5",
      borderColor: "border-rose-500/20",
      accentColor: "text-rose-500 bg-rose-500/10"
    },
  ];

  const handleConfirm = async () => {
    if (!selectedObjective || !user) return;
    setSaving(true);
    
    try {
      const updatedFields = {
        onboardingCompleted: true,
        preferredService: selectedObjective,
        lastAccess: new Date().toISOString()
      };

      if (user.uid === 'guest_demo_user') {
        const simProfileStr = localStorage.getItem("simulatedProfile");
        if (simProfileStr) {
          const simProfile = JSON.parse(simProfileStr);
          const updatedProfile = { ...simProfile, ...updatedFields };
          localStorage.setItem("simulatedProfile", JSON.stringify(updatedProfile));
        }
      } else {
        await userService.updateProfile(user.uid, updatedFields);
      }
      
      // Redirect to internal application home / app dashboard
      navigate("/app");
    } catch (err) {
      console.error("Error saving onboarding selection:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-550">Sintonizando SentiPae...</p>
      </div>
    );
  }

  const welcomeName = profile?.nome || user?.displayName || "Usuário";

  return (
    <div className="min-h-screen bg-slate-55 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors font-sans">
      
      {/* Top Header Decorator */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center border border-emerald-500/20">
          <HeartPulse className="w-5 h-5 text-emerald-500 animate-pulse" />
        </div>
        <span className="text-sm font-bold tracking-wider font-serif italic text-slate-850 dark:text-slate-200">
          SentiPae
        </span>
      </div>

      {/* Main Content Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6 space-y-6">
        
        {/* Welcome & Intro */}
        <div className="text-center space-y-2.5 px-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Primeiro Acesso</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif italic text-slate-850 dark:text-slate-100 leading-tight">
            Bem-vindo ao SentiPae, {welcomeName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-sm mx-auto">
            Vamos personalizar sua jornada de regulação e acolhimento. Qual é o seu objetivo principal hoje?
          </p>
        </div>

        {/* Objectives Option List */}
        <div className="space-y-3">
          {objectives.map((obj) => {
            const Icon = obj.icon;
            const isSelected = selectedObjective === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => setSelectedObjective(obj.id)}
                className={cn(
                  "w-full p-4.5 rounded-[2rem] border text-left flex items-start gap-4 transition-all duration-300 relative overflow-hidden group cursor-pointer active:scale-99 select-none bg-gradient-to-br",
                  isSelected 
                    ? "from-emerald-500/10 to-emerald-500/5 border-emerald-500/40 text-slate-900 dark:text-slate-100 shadow-sm" 
                    : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/1"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-2xl mt-0.5 transition-transform duration-300 group-hover:scale-105",
                  isSelected ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : obj.accentColor
                )}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1 z-10 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold font-serif italic tracking-tight">{obj.label}</p>
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal font-light pr-4">{obj.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Proceed Action Button */}
        <div className="px-1">
          <button
            disabled={!selectedObjective || saving}
            onClick={handleConfirm}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
              selectedObjective 
                ? "bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-98" 
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            )}
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Iniciar Jornada Personalizada</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="text-center pb-2">
        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
          SentiPae — Espaço Seguro & Confidencial
        </p>
      </footer>

    </div>
  );
}
