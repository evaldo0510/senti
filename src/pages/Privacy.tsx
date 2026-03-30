import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, EyeOff } from "lucide-react";
import { motion } from "motion/react";

export default function Privacy() {
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
            <Lock className="w-5 h-5 text-emerald-600" />
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
            Política de <span className="text-emerald-700 font-bold not-italic">Privacidade</span>
          </h1>
          <p className="text-[#6a6a6a] text-lg font-light">Última atualização: 29 de Março de 2026</p>
        </motion.div>

        <div className="prose prose-slate max-w-none space-y-8 text-[#4a4a4a] leading-relaxed font-light">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">1. Coleta de Dados</h2>
            <p>
              Coletamos informações necessárias para fornecer nossos serviços, incluindo nome, e-mail, histórico de humor e interações com a IARA. Dados sensíveis de saúde são tratados com o mais alto nível de proteção sob a LGPD.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">2. Uso das Informações</h2>
            <p>
              Seus dados são usados para personalizar sua experiência terapêutica, gerar análises de bem-estar e permitir a comunicação com profissionais. <strong className="font-bold text-[#1a1a1a]">Nunca</strong> vendemos seus dados para terceiros.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">3. Criptografia e Segurança</h2>
            <p>
              Todas as comunicações e dados armazenados são protegidos por criptografia de ponta a ponta. Utilizamos infraestrutura segura e auditorias constantes para garantir a integridade das suas informações.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">4. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou excluir seus dados a qualquer momento através das configurações do seu perfil ou entrando em contato com nossa equipe de privacidade.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">5. Cookies</h2>
            <p>
              Utilizamos cookies apenas para manter sua sessão ativa e melhorar a performance da plataforma. Você pode gerenciar as preferências de cookies no seu navegador.
            </p>
          </section>
        </div>

        <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <EyeOff className="w-6 h-6" />
            <span className="font-bold text-sm uppercase tracking-widest">Privacidade Total</span>
          </div>
          <p className="text-xs text-[#6a6a6a]">Contato: privacidade@senti.app</p>
        </div>
      </main>
    </div>
  );
}
