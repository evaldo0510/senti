import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  ChevronDown, 
  Compass, 
  Heart, 
  BrainCircuit, 
  Users, 
  HeartPulse,
  Sparkles,
  Lock,
  FileText,
  Mail,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, isOpen, onToggle, icon: Icon, children }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl overflow-hidden transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-white/1 flex-row"
      >
        <div className="flex items-center gap-3.5">
          <div className={cn(
            "p-2.5 rounded-xl transition-colors",
            isOpen ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight font-serif italic">{title}</span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 transition-transform duration-350",
          isOpen && "transform rotate-180 text-emerald-500"
        )} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="p-5 pt-0 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-3 font-light">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Sobre() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>("historia");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

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

      <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-5">
        
        {/* Intro Hero Banner */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-indigo-550/5 border border-emerald-500/15 rounded-[2rem] p-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-widest">Guia Institucional</p>
            </div>
            <h2 className="text-2xl font-bold font-serif italic text-slate-850 dark:text-slate-100 leading-tight">
              Acolhimento preventivo de grau clínico na palma da sua mão.
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">
              Explore o propósito sagrado, a nossa história inovadora, a equipe dedicada e a metodologia científica que norteiam cada detalhe do ecossistema SentiPae.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          
          {/* Section 1: História */}
          <AccordionItem
            title="A Nossa História"
            isOpen={openSection === "historia"}
            onToggle={() => toggleSection("historia")}
            icon={Compass}
          >
            <p>
              O SentiPae foi concebido em 2026, diante do crescimento alarmante dos índices de estresse, ansiedade e sobrecarga mental na sociedade contemporânea. O fundador percebeu que faltava uma ponte segura e imediata entre o momento em que a crise se manifesta e o acesso ao suporte clínico qualificado.
            </p>
            <p>
              A proposta inovadora do SentiPae é agir no vácuo preventivo, oferecendo ferramentas autônomas de regulação imediata e, ao mesmo tempo, canais ágeis de contato com profissionais humanos para acompanhamento de longo prazo. O SentiPae nasceu para redefinir as possibilidades de atenção diária à saúde mental.
            </p>
          </AccordionItem>

          {/* Section 2: Propósito */}
          <AccordionItem
            title="Nosso Propósito"
            isOpen={openSection === "proposito"}
            onToggle={() => toggleSection("proposito")}
            icon={Heart}
          >
            <p>
              Acreditamos que o cuidado com a mente deve ser preventivo, contínuo e acessível. Nosso propósito sagrado é garantir que nenhuma pessoa se sinta desamparada ou sozinha durante uma tempestade emocional.
            </p>
            <p>
              Ao democratizar as técnicas de autocompreensão e de estabilização neurofisiológica, criamos um espaço acolhedor e blindado onde qualquer pessoa pode registrar suas angústias e ser cuidada com respeito absoluto à confidencialidade médica.
            </p>
          </AccordionItem>

          {/* Section 3: Metodologia */}
          <AccordionItem
            title="Metodologia & Como Funciona"
            isOpen={openSection === "metodologia"}
            onToggle={() => toggleSection("metodologia")}
            icon={BrainCircuit}
          >
            <p>
              Nossa abordagem une de forma simbiótica ferramentas autônomas preventivas e atendimento profissional especializado:
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="flex gap-2.5">
                <div className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">IARA (Inteligência Artificial Terapêutica)</p>
                  <p className="text-[11px] leading-normal font-light">Escuta imediata disponível 24 horas por dia para ajudar na regulação e organização dos pensamentos.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-5 h-5 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Diário de Humor & Sintonização</p>
                  <p className="text-[11px] leading-normal font-light">Mapeamento constante e geração de relatórios de evolução que ajudam a prever e mitigar picos estressores.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-5 h-5 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Teleconsulta Clínica sob Demanda</p>
                  <p className="text-[11px] leading-normal font-light">Acesso simplificado a psicólogos reais devidamente registrados no conselho profissional.</p>
                </div>
              </div>
            </div>
            <p className="pt-2">
              Toda a metodologia do SentiPae baseia-se nos princípios validados da <strong>Terapia Cognitivo-Comportamental (TCC)</strong> e em protocolos reconhecidos de regulação corporal por biofeedback.
            </p>
          </AccordionItem>

          {/* Section 4: Equipe */}
          <AccordionItem
            title="Quem Faz Acontecer (Equipe)"
            isOpen={openSection === "equipe"}
            onToggle={() => toggleSection("equipe")}
            icon={Users}
          >
            <p>
              Nossa equipe une profissionais dedicados que compartilham da mesma visão de acolhimento e excelência:
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71f1536780?w=120&auto=format&fit=crop&q=80" 
                  alt="Dra. Ana Silva" 
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold text-slate-850 dark:text-slate-200">Dra. Ana Silva</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Diretora de Metodologia Clínica</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-white/5">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 text-lg font-bold shrink-0">I</div>
                <div>
                  <p className="font-bold text-slate-850 dark:text-slate-200">IARA Engine</p>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Inteligência Artificial Preventiva</p>
                </div>
              </div>
            </div>
          </AccordionItem>

        </div>

        {/* Security and Document Quick Links */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 p-5 rounded-[2rem] space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Políticas & Canais</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => navigate("/termos")}
              className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/30 dark:hover:bg-white/5 border border-slate-200/30 dark:border-white/5 rounded-2xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-99"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Termos de Uso</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button 
              onClick={() => navigate("/privacidade")}
              className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/30 dark:hover:bg-white/5 border border-slate-200/30 dark:border-white/5 rounded-2xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-99"
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Política de Privacidade</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button 
              onClick={() => navigate("/contato")}
              className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/30 dark:hover:bg-white/5 border border-slate-200/30 dark:border-white/5 rounded-2xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-99"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fale Conosco</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

      </main>

    </div>
  );
}
