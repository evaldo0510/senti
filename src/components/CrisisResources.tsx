import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  ShieldAlert, 
  Activity, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  MapPin, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { cn } from "../lib/utils";

interface CrisisContact {
  id: string;
  name: string;
  number: string;
  description: string;
  availability: string;
  category: "mental" | "medical" | "security";
  details: string[];
}

const CRISIS_CONTACTS: CrisisContact[] = [
  {
    id: "cvv",
    name: "CVV - Centro de Valorização da Vida",
    number: "188",
    description: "Apoio emocional e prevenção do suicídio, atendendo voluntária e gratuitamente todas as pessoas que querem conversar.",
    availability: "Disponível 24 Horas",
    category: "mental",
    details: [
      "Atendimento totalmente gratuito, sob sigilo total.",
      "Ligação direta e confidencial de qualquer telefone fixo ou celular.",
      "Disponível também via chat online no site oficial do CVV."
    ]
  },
  {
    id: "samu",
    name: "SAMU - Serviço de Atendimento Móvel de Urgência",
    number: "192",
    description: "Serviço público brasileiro para socorro imediato em situações de crises graves de saúde física ou psiquiátrica extrema.",
    availability: "Disponível 24 Horas",
    category: "medical",
    details: [
      "Acione em caso de crises agudas de pânico, surtos ou autolesão.",
      "Atendimento médico de urgência pré-hospitalar.",
      "Envio de ambulâncias tripuladas por profissionais de saúde habilitados."
    ]
  },
  {
    id: "bombeiros",
    name: "Corpo de Bombeiros",
    number: "193",
    description: "Resgate e salvamento em situações de emergência que apresentam risco iminente à vida.",
    availability: "Disponível 24 Horas",
    category: "medical",
    details: [
      "Profissionais treinados para prestar primeiros socorros em trauma ou asfixia.",
      "Remoção rápida para pronto-socorro mais próximo."
    ]
  },
  {
    id: "pm",
    name: "Polícia Militar",
    number: "190",
    description: "Serviço de emergência para segurança pública e situações que envolvam ameaça direta ou violência.",
    availability: "Disponível 24 Horas",
    category: "security",
    details: [
      "Acione se houver ameaça direta à integridade física.",
      "Atendimento prioritário de segurança."
    ]
  },
  {
    id: "caps",
    name: "CAPS - Centro de Atenção Psicossocial",
    number: "Procurar CAPS Local",
    description: "Unidades do SUS especializadas em saúde mental para acolhimento, tratamento e acompanhamento contínuo gratuito.",
    availability: "Segunda a Sexta (Horário Comercial)",
    category: "mental",
    details: [
      "Atendimento por equipe multiprofissional (médicos, psicólogos, terapeutas).",
      "Não é necessário encaminhamento prévio para a primeira avaliação.",
      "Busque a unidade mais próxima em sua cidade ou região."
    ]
  },
  {
    id: "pode_falar",
    name: "Pode Falar (UNICEF)",
    number: "podefalar.org.br",
    description: "Canal de escuta, acolhimento e orientação focado em adolescentes e jovens de 13 a 24 anos.",
    availability: "Consultar Site Oficial",
    category: "mental",
    details: [
      "Iniciativa do UNICEF voltada à saúde mental juvenil.",
      "Espaço seguro, sigiloso e sem julgamentos para falar sobre sentimentos.",
      "Acesso online pelo portal oficial Pode Falar."
    ]
  }
];

export default function CrisisResources() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "mental" | "medical">("all");

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredContacts = CRISIS_CONTACTS.filter(contact => {
    if (filter === "all") return true;
    return contact.category === filter;
  });

  return (
    <div 
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/30 dark:shadow-none space-y-6"
      id="crisis-resources-panel"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-500/20 shrink-0">
            <ShieldAlert className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              Recursos de Apoio e Emergência
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Você não está sozinho. Encontre canais gratuitos de acolhimento imediato.
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-1.5 self-start sm:self-center">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer",
              filter === "all"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md"
                : "bg-slate-50 text-slate-500 hover:text-slate-700 dark:bg-white/5 dark:text-slate-400 hover:dark:bg-white/10"
            )}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("mental")}
            className={cn(
              "px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer",
              filter === "mental"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-50 text-slate-500 hover:text-slate-700 dark:bg-white/5 dark:text-slate-400 hover:dark:bg-white/10"
            )}
          >
            Mental
          </button>
          <button
            onClick={() => setFilter("medical")}
            className={cn(
              "px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer",
              filter === "medical"
                ? "bg-red-600 text-white shadow-md"
                : "bg-slate-50 text-slate-500 hover:text-slate-700 dark:bg-white/5 dark:text-slate-400 hover:dark:bg-white/10"
            )}
          >
            Urgências
          </button>
        </div>
      </div>

      {/* Guide Note */}
      <div className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start text-amber-900 dark:text-amber-300">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed font-medium">
          <strong>Aviso de Segurança:</strong> Este aplicativo oferece suporte de bem-estar emocional, mas não substitui serviços médicos ou psicológicos de emergência. Se você estiver em perigo imediato ou risco de vida, ligue para o <strong>CVV (188)</strong> ou <strong>SAMU (192)</strong> imediatamente.
        </p>
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        {filteredContacts.map((contact) => {
          const isExpanded = expandedId === contact.id;
          const isCopied = copiedId === contact.id;
          const isPhone = /^\d+$/.test(contact.number);

          return (
            <div 
              key={contact.id}
              className={cn(
                "border rounded-3xl transition-all overflow-hidden bg-slate-50/50 dark:bg-slate-950/20",
                isExpanded 
                  ? "border-emerald-500/40 dark:border-emerald-500/30 ring-1 ring-emerald-500/10" 
                  : "border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
              )}
            >
              <div 
                onClick={() => toggleExpand(contact.id)}
                className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">
                      {contact.name}
                    </h4>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                      contact.category === "mental" 
                        ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : contact.category === "medical"
                        ? "bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/20"
                        : "bg-slate-500/5 text-slate-600 dark:text-slate-400 border-slate-500/20"
                    )}>
                      {contact.category === "mental" ? "Apoio Emocional" : contact.category === "medical" ? "Emergência Médica" : "Segurança"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate pr-4">
                    {contact.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Styled Dialing / Copy Button */}
                  {isPhone ? (
                    <a
                      href={`tel:${contact.number}`}
                      onClick={(e) => e.stopPropagation()}
                      className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black tracking-wider flex items-center gap-2 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Ligar {contact.number}
                    </a>
                  ) : contact.number.startsWith("http") || contact.number.includes(".") ? (
                    <a
                      href={`https://${contact.number}`}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      onClick={(e) => e.stopPropagation()}
                      className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black tracking-wider flex items-center gap-2 transition-colors"
                    >
                      Acessar Site
                    </a>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(contact.id, contact.number);
                      }}
                      className="h-10 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black tracking-wider flex items-center gap-2 transition-colors border border-slate-200/50 dark:border-white/5"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? "Copiado!" : "Copiar"}
                    </button>
                  )}

                  {/* Expand toggle */}
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expansion Details */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="border-t border-slate-100 dark:border-white/5 bg-slate-100/30 dark:bg-slate-950/40"
                  >
                    <div className="p-4 space-y-4 text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-450">
                        <Activity className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-bold uppercase tracking-wider text-[10px]">
                          Disponibilidade: {contact.availability}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest text-[9px]">
                          Informações adicionais e orientações:
                        </p>
                        <ul className="list-disc pl-4 space-y-1.5 text-slate-550 dark:text-slate-400">
                          {contact.details.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Manual dialing fallback if needed */}
                      {!isPhone && contact.number !== "Procurar CAPS Local" && !contact.number.includes(".") && (
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-white/5 rounded-2xl mt-2">
                          <span className="text-slate-500 text-[11px]">Número de Acesso:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{contact.number}</span>
                            <button
                              onClick={() => handleCopy(contact.id, contact.number)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500"
                              title="Copiar Número"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer support card */}
      <div className="bg-gradient-to-br from-emerald-500/5 to-indigo-500/5 border border-slate-150 dark:border-white/5 rounded-[2rem] p-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse fill-red-500" />
            Precisa de suporte continuado?
          </h4>
          <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
            Consulte nossos terapeutas credenciados para realizar sessões de acolhimento individuais de forma contínua e personalizada.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="/profissionais"
            className="px-4 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shrink-0 text-center"
          >
            Ver Profissionais
          </a>
        </div>
      </div>
    </div>
  );
}
