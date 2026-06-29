import React from "react";
import { Scale, Award, HeartHandshake, ShieldAlert, Sparkles } from "lucide-react";

export default function ConselhoCientifico() {
  const membros = [
    {
      nome: "Dra. Ana Silva",
      cargo: "Presidente do Conselho & Diretora de Metodologia Clínica",
      registro: "CRP 06/12345",
      bio: "Psicóloga Clínica com mais de 15 anos de atuação, doutora em Psicologia Cognitiva pela USP e especialista em TCC (Terapia Cognitivo-Comportamental)."
    },
    {
      nome: "Dr. Roberto Mendes",
      cargo: "Consultor de Psiquiatria & Neurociência",
      registro: "CRM-SP 98765",
      bio: "Médico Psiquiatra, mestre em Neurociências pela UNIFESP, com foco em saúde mental pública e intervenção de crise."
    },
    {
      nome: "Prof. Dra. Clarice Antunes",
      cargo: "Especialista em Ética de IA & Humanidades",
      registro: "PhD em Filosofia e Ética",
      bio: "Professora adjunta de ética tecnológica, pesquisadora de interações humanas com inteligência artificial e bem-estar comunitário."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Indicator */}
      <div className="border-l-4 border-emerald-500 pl-4 space-y-1">
        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
          Governança & Rigor Científico <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
        </h4>
        <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
          O SentiPae é guiado por uma diretriz rígida de ética, integridade clínica e conformidade legal. Nossos protocolos são revisados constantemente por especialistas.
        </p>
      </div>

      {/* Compromissos de Ética */}
      <div className="grid grid-cols-1 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-white/5 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-500">
            <HeartHandshake className="w-4 h-4" />
            <h5 className="text-xs font-bold text-slate-850 dark:text-slate-200">A Tecnologia Acolhe, as Pessoas Cuidam</h5>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-light">
            A Inteligência Artificial atua estritamente como uma recepcionista inicial e facilitadora de hábitos. O cuidado terapêutico verdadeiro e os diagnósticos permanecem de responsabilidade exclusiva de profissionais humanos devidamente habilitados.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-white/5 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-500">
            <Scale className="w-4 h-4" />
            <h5 className="text-xs font-bold text-slate-850 dark:text-slate-200">Conformidade e Ética Rígida</h5>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-light">
            Nossos sistemas operam em estrita conformidade com a LGPD (Lei Geral de Proteção de Dados) e as resoluções vigentes dos conselhos profissionais de saúde e psicologia, garantindo criptografia ponta a ponta e sigilo absoluto.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-white/5 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-500">
            <ShieldAlert className="w-4 h-4" />
            <h5 className="text-xs font-bold text-slate-850 dark:text-slate-200">Princípio do Não-Diagnóstico</h5>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-light">
            A plataforma nunca realiza diagnósticos médicos, prescrição de medicamentos ou simulações clínicas. Nosso papel é a regulação emocional e o encaminhamento ágil e responsável para quem realmente cura: o profissional humano.
          </p>
        </div>
      </div>

      {/* Lista de Membros */}
      <div className="space-y-3 pt-2">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-indigo-500" /> Membros Titulares
        </h5>
        
        <div className="space-y-3.5">
          {membros.map((membro, index) => (
            <div key={index} className="p-4 rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex justify-between items-start gap-2 flex-wrap">
                <div>
                  <h6 className="text-xs font-black text-slate-800 dark:text-slate-200">{membro.nome}</h6>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">{membro.cargo}</p>
                </div>
                <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-850 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/5">
                  {membro.registro}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                {membro.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
