import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, FileText, Lock } from "lucide-react";
import { motion } from "motion/react";

export default function Terms() {
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
            <FileText className="w-5 h-5 text-emerald-600" />
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
            Termos de <span className="text-emerald-700 font-bold not-italic">Uso</span>
          </h1>
          <p className="text-[#6a6a6a] text-lg font-light">Última atualização: 29 de Março de 2026</p>
        </motion.div>

        <div className="prose prose-slate max-w-none space-y-8 text-[#4a4a4a] leading-relaxed font-light">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar a plataforma SENTI, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">2. Natureza do Serviço</h2>
            <p>
              O SENTI é uma plataforma de bem-estar emocional que oferece suporte através de Inteligência Artificial (IARA) e conexão com profissionais de saúde mental. 
              <strong className="font-bold text-[#1a1a1a]"> Importante:</strong> Nossos serviços de IA não substituem o diagnóstico médico ou tratamento profissional. Em caso de emergência ou risco de vida, utilize o botão SOS ou ligue para o CVV (188).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">3. Cadastro e Segurança</h2>
            <p>
              Para utilizar certas funcionalidades, você precisará criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais e por todas as atividades que ocorrem em sua conta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">4. Pagamentos e Cancelamentos</h2>
            <p>
              Consultas e jornadas terapêuticas podem ser pagas. Os valores e políticas de cancelamento são informados no momento da contratação. Reembolsos são processados de acordo com a legislação vigente.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif italic text-[#1a1a1a] border-b border-black/5 pb-2">5. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, design, logotipos e tecnologia da plataforma SENTI são propriedade exclusiva da nossa empresa e protegidos por leis de direitos autorais.
            </p>
          </section>
        </div>

        <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
            <span className="font-bold text-sm uppercase tracking-widest">Uso Seguro e Ético</span>
          </div>
          <p className="text-xs text-[#6a6a6a]">Dúvidas? Entre em contato: suporte@senti.app</p>
        </div>
      </main>
    </div>
  );
}
