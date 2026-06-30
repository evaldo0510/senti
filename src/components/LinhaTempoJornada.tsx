import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  Calendar, 
  BookOpen, 
  UserPlus, 
  Bot, 
  Compass, 
  Heart, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { cn } from "../lib/utils";

interface TimelineStep {
  id: number;
  titulo: string;
  subtitulo: string;
  descricao: string;
  status: "completed" | "current" | "upcoming";
  data?: string;
  icone: any;
  cor: string;
  dicaIARA: string;
}

export default function LinhaTempoJornada() {
  const [selectedStep, setSelectedStep] = useState<number>(3);

  const steps: TimelineStep[] = [
    {
      id: 1,
      titulo: "Acolhimento Caloroso",
      subtitulo: "Boas-vindas e Onboarding",
      descricao: "Cadastro realizado com sucesso na plataforma e primeira triagem integradora com IARA AI.",
      status: "completed",
      data: "12 Jun 2026",
      icone: UserPlus,
      cor: "emerald",
      dicaIARA: "Sua chegada aqueceu nosso coração. Você deu o primeiro passo na direção do cuidado."
    },
    {
      id: 2,
      titulo: "Orquestração SentiCore",
      subtitulo: "Mapeamento Tático de Risco",
      descricao: "Nossos sub-agentes analisaram as primeiras interações de forma invisível para garantir segurança clínica.",
      status: "completed",
      data: "12 Jun 2026",
      icone: Bot,
      cor: "cyan",
      dicaIARA: "Seu perfil de cuidado foi estruturado de forma anônima e segura. Sem ameaças à integridade identificadas."
    },
    {
      id: 3,
      titulo: "Auto-registro Diário",
      subtitulo: "Primeiros Hábitos Ativados",
      descricao: "Registro inicial de humor e reflexão literária inserida no seu Diário Emocional do SentiPae.",
      status: "completed",
      data: "18 Jun 2026",
      icone: BookOpen,
      cor: "indigo",
      dicaIARA: "Suas palavras no diário de hoje ajudaram a alimentar o índice de engajamento clínico (ICC) em +25%."
    },
    {
      id: 4,
      titulo: "Encontro Humano",
      subtitulo: "Matchmaking de Especialista",
      descricao: "Agendamento da sua primeira sessão síncrona com terapeuta multidisciplinar especializado.",
      status: "current",
      data: "Amanhã às 14h",
      icone: Calendar,
      cor: "violet",
      dicaIARA: "Você tem um encontro marcado. Quer que eu ajude você a preparar alguns pontos para conversar com Dra. Ana?"
    },
    {
      id: 5,
      titulo: "Regulação Ativa",
      subtitulo: "Programa ReSet 21 Dias",
      descricao: "Participação e engajamento contínuo nas sessões guiadas de Poesia Cognitiva Hipnótica (PCH).",
      status: "upcoming",
      icone: Compass,
      cor: "amber",
      dicaIARA: "Após consolidar seu encontro, iniciaremos a reprogramação de ciclos de sono e ansiedade."
    },
    {
      id: 6,
      titulo: "Sustentabilidade",
      subtitulo: "Autonomia e Cuidado Contínuo",
      descricao: "Estabilização emocional alcançada, novos objetivos estabelecidos e alta assistida pela rede.",
      status: "upcoming",
      icone: Heart,
      cor: "pink",
      dicaIARA: "Sua jornada rumo ao bem-estar se torna um hábito definitivo. Estarei sempre aqui de prontidão."
    }
  ];

  return (
    <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-xl space-y-6 text-slate-100" id="journey-timeline-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Senti Design System — Journey Timeline
          </div>
          <h3 className="text-xl font-black tracking-tight text-white mt-1">
            Linha do Tempo da Jornada Terapêutica
          </h3>
          <p className="text-xs text-slate-400">
            Acompanhe visualmente a evolução e os marcos alcançados no seu tratamento integrado.
          </p>
        </div>

        {/* Current status summary badge */}
        <div className="text-xs font-bold text-slate-300 bg-slate-950/80 border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
          Fase Atual: <strong className="text-violet-400 font-extrabold uppercase tracking-wide">Conexão Humana</strong>
        </div>
      </div>

      {/* Timeline graphical representation */}
      <div className="relative pt-6">
        {/* Horizontal Connecting Line for Desktop */}
        <div className="hidden md:block absolute top-[43px] left-8 right-8 h-1 bg-slate-800 rounded-full" />

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
          {steps.map((step) => {
            const Icon = step.icone;
            const isSelected = selectedStep === step.id;
            
            return (
              <div 
                key={step.id} 
                onClick={() => setSelectedStep(step.id)}
                className="flex flex-row md:flex-col items-center md:text-center gap-4 cursor-pointer group"
              >
                {/* Node bubble */}
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 relative shrink-0",
                  step.status === "completed" && "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-950/40",
                  step.status === "current" && "bg-violet-500/20 border-violet-500 text-violet-400 shadow-lg shadow-violet-950/60 ring-4 ring-violet-500/10 scale-105 animate-pulse",
                  step.status === "upcoming" && "bg-slate-950 border-slate-800 text-slate-600 group-hover:border-slate-700 group-hover:text-slate-400",
                  isSelected && "ring-2 ring-white scale-110"
                )}>
                  {step.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}

                  {/* Step counter badge on node */}
                  <span className="absolute -bottom-2 -right-2 bg-slate-950 text-slate-400 border border-white/10 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {step.id}
                  </span>
                </div>

                {/* Text details */}
                <div className="text-left md:text-center space-y-1">
                  <h4 className={cn(
                    "text-xs font-black transition-all",
                    step.status === "completed" && "text-slate-200",
                    step.status === "current" && "text-violet-400",
                    step.status === "upcoming" && "text-slate-500"
                  )}>
                    {step.titulo}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px] hidden md:block">
                    {step.subtitulo}
                  </p>
                  {step.data && (
                    <span className="text-[9px] font-mono text-slate-500 block">
                      {step.data}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Selected Node Detailed View Panel */}
      {selectedStep && (
        <div className="bg-slate-950/80 rounded-2xl p-6 border border-white/5 space-y-4 animate-fadeIn">
          {(() => {
            const step = steps.find(s => s.id === selectedStep);
            if (!step) return null;
            const Icon = step.icone;
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-900 border border-white/5 rounded-xl text-slate-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{step.titulo}</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{step.subtitulo}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-350 leading-relaxed font-sans font-medium">
                    {step.descricao}
                  </p>
                </div>

                {/* Cozy Coordenadora de Jornada IARA guidance advice */}
                <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                    <Bot className="w-16 h-16 text-cyan-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Coordenadora IARA</span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic leading-normal">
                    &quot;{step.dicaIARA}&quot;
                  </p>
                  {step.status === "current" && (
                    <button className="text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:underline flex items-center gap-1.5 mt-2 cursor-pointer">
                      Acessar Preparativo <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
