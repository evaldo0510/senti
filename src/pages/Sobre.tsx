import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  ArrowLeft, 
  Compass, 
  Users, 
  ShieldCheck, 
  FileText, 
  Mail, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  Star,
  Activity,
  HeartPulse,
  BrainCircuit,
  Lock,
  MessageSquare
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Sobre() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'historia' | 'metodologia' | 'equipe' | 'seguranca'>('historia');

  const tabs = [
    { id: 'historia', label: 'História & Propósito', icon: Compass },
    { id: 'metodologia', label: 'Como Funciona', icon: BrainCircuit },
    { id: 'equipe', label: 'Equipe SentiPae', icon: Users },
    { id: 'seguranca', label: 'Segurança & Termos', icon: ShieldCheck },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-55 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 transition-colors font-sans">
      
      {/* Header */}
      <header className="px-4 py-4 sm:p-6 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md z-20 border-b border-slate-200 dark:border-white/5">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 -ml-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer text-slate-500 dark:text-slate-400"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base sm:text-lg font-bold font-serif italic text-slate-850 dark:text-slate-200">Sobre o SentiPae</h1>
        <div className="w-10 h-10 flex items-center justify-center">
          <HeartPulse className="w-5 h-5 text-emerald-500" />
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6">
        
        {/* Intro Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-indigo-550/5 border border-emerald-500/15 rounded-[2rem] p-6 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-widest">Nossa Missão</p>
            </div>
            <h2 className="text-2xl font-bold font-serif italic text-slate-850 dark:text-slate-100 leading-tight">
              Seu espaço seguro de acolhimento e regulação emocional diária.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
              O SentiPae nasceu para democratizar o suporte psicológico e estruturar uma jornada contínua de autoconhecimento, unindo inteligência preventiva e terapeutas licenciados em um ambiente seguro grau clínico.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer select-none",
                  isSelected 
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md scale-102" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-emerald-500" : "text-slate-400")} />
                <span className="text-center">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="min-h-[250px] transition-all">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {activeTab === 'historia' && (
                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" /> A Nossa História
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                      O SentiPae foi concebido em 2026, diante do crescimento alarmante dos índices de estresse, ansiedade e sobrecarga mental na sociedade contemporânea. O fundador percebeu que faltava uma ponte segura e imediata entre o momento em que a crise se manifesta e o acesso ao suporte clínico qualificado.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                      A proposta inovadora do SentiPae é agir no vácuo preventivo, oferecendo ferramentas autônomas de regulação imediata e, ao mesmo tempo, canais ágeis de contato com profissionais humanos para acompanhamento de longo prazo.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" /> Propósito Sagrado
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                      Acreditamos que o cuidado com a mente deve ser preventivo, contínuo e acessível. Nosso propósito é garantir que nenhuma pessoa se sinta desamparada ou sozinha durante uma tempestade emocional, provendo um porto seguro digital disponível 24 horas por dia.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'metodologia' && (
                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-emerald-500" /> Como Funciona o Ecossistema
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                      Combinamos regulação guiada autônoma com agendamento de teleconsultas em um fluxo dinâmico de cuidado:
                    </p>
                    
                    <div className="space-y-3 pt-2">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Acolhimento Inteligente (IARA)</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Nossa inteligência artificial terapêutica ajuda você a organizar seus sentimentos, desabafar com segurança e encontrar as melhores estratégias no momento da tensão.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Diário de Bordo & Triagem</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Mapeamento constante do seu humor, sono e exercícios físicos, gerando índices emocionais que ajudam a prever e prevenir picos de estresse ou recaídas.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Atendimento Clínico Sob Demanda</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Precisa falar com um profissional? Conecte-se com nossa equipe licenciada em consultas agendadas ou de plantão direto do seu painel.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest">Metodologia Científica</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                      Nossos exercícios e protocolos de suporte baseiam-se na <strong>Terapia Cognitivo-Comportamental (TCC)</strong> e em técnicas validadas de <i>Mindfulness</i> e regulação neurofisiológica de biofeedback (como a respiração quadrada coerente).
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'equipe' && (
                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" /> Quem Faz Acontecer
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                      Nossa equipe é formada por programadores, designers, psicólogos clínicos renomados e especialistas em segurança da informação médica.
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-white/5">
                        <img 
                          src="https://images.unsplash.com/photo-1559839734-2b71f1536780?w=120&auto=format&fit=crop&q=80" 
                          alt="Dra. Ana Silva" 
                          className="w-10 h-10 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Dra. Ana Silva</p>
                          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Diretora de Metodologia Clínica</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-white/5">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 text-lg font-bold">I</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">IARA Engine</p>
                          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Inteligência Artificial Preventiva</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seguranca' && (
                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" /> Criptografia & Privacidade
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                      O SentiPae segue rigorosamente todas as determinações da LGPD e as normas de prontuário eletrônico médico do Conselho Federal de Psicologia. Todos os seus diários e registros de chat são confidenciais e criptografados fim-a-fim.
                    </p>
                  </div>

                  {/* Document Links */}
                  <div className="grid grid-cols-1 gap-2.5">
                    <button 
                      onClick={() => navigate("/termos")}
                      className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-99"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-200/50 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Termos de Uso</p>
                          <p className="text-[10px] text-slate-500">Nossas regras e acordos de uso.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button 
                      onClick={() => navigate("/privacidade")}
                      className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-99"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-200/50 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Política de Privacidade</p>
                          <p className="text-[10px] text-slate-500">Como protegemos suas reflexões e registros.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button 
                      onClick={() => navigate("/seguranca")}
                      className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-99"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-200/50 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Canais de Segurança</p>
                          <p className="text-[10px] text-slate-500">Criptografia grau clínico certificada.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button 
                      onClick={() => navigate("/contato")}
                      className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-99"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-200/50 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Fale Conosco / Contato</p>
                          <p className="text-[10px] text-slate-500">Suporte administrativo e técnico.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quick Back to App Callout */}
        <div className="text-center pt-4">
          <p className="text-[10px] text-slate-550 font-bold uppercase tracking-widest">
            SentiPae — Juntos por uma mente feliz
          </p>
        </div>

      </main>

    </div>
  );
}
