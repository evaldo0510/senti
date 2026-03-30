import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, ShieldAlert, Activity } from "lucide-react";
import { motion } from "motion/react";

export default function Security() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#4a4a4a] hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-xl font-serif italic font-bold tracking-tight">SENTI</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20 space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-6xl font-serif italic tracking-tight text-[#1a1a1a]">
            Segurança de <span className="text-emerald-700 font-bold not-italic">Dados</span>
          </h1>
          <p className="text-[#6a6a6a] text-lg font-light">Última atualização: 29 de Março de 2026</p>
        </motion.div>

        <div className="prose prose-slate max-w-none space-y-8 text-[#4a4a4a] leading-relaxed font-light">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">1. Criptografia de Ponta a Ponta</h2>
            <p>
              Todas as suas conversas com a IARA e com profissionais são protegidas por criptografia de ponta a ponta. Isso significa que apenas você e o destinatário podem ler o conteúdo das mensagens.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">2. Infraestrutura Segura</h2>
            <p>
              Utilizamos servidores de alta segurança e conformidade com padrões internacionais de proteção de dados (HIPAA, GDPR, LGPD). Nossos sistemas são monitorados 24/7 para detectar e prevenir qualquer tentativa de acesso não autorizado.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">3. Anonimato e Identidade</h2>
            <p>
              Você pode escolher utilizar a plataforma de forma anônima ou com um pseudônimo. Seus dados de identidade real são armazenados separadamente dos seus registros terapêuticos para garantir o máximo de privacidade.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">4. Auditorias de Segurança</h2>
            <p>
              Realizamos auditorias de segurança periódicas e testes de intrusão para garantir que nossa plataforma permaneça resiliente contra ameaças cibernéticas em constante evolução.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">5. Backup e Recuperação</h2>
            <p>
              Seus dados são salvos em backups redundantes e criptografados, garantindo que suas informações não sejam perdidas em caso de falhas técnicas.
            </p>
          </section>
        </div>

        <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <ShieldAlert className="w-6 h-6" />
            <span className="font-bold text-sm uppercase tracking-widest">Proteção Ativa</span>
          </div>
          <p className="text-xs text-[#6a6a6a]">Segurança: seguranca@senti.app</p>
        </div>
      </main>
    </div>
  );
}
