import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PLANS, paymentService } from "../services/paymentService";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  CheckCircle2,
  Users
} from "lucide-react";
import { useAuth } from "../components/AuthProvider";

export default function SimulatedCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const provider = searchParams.get("provider") as "stripe" | "mercadopago" || "stripe";
  const userId = searchParams.get("userId") || "";
  const planId = searchParams.get("planId") as "premium" | "professional" | "enterprise" || "premium";
  const price = searchParams.get("price") || "39.90";

  const plan = PLANS[planId];

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("4000 1234 5678 9010");
  const [cardExpiry, setCardExpiry] = useState("12/29");
  const [cardCvv, setCardCvv] = useState("123");
  
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"checkout" | "success" | "error">("checkout");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (profile && !cardName) {
      setCardName(profile.nome);
    }
  }, [profile]);

  const handleSimulateSuccess = async () => {
    setProcessing(true);
    setErrorMessage("");

    try {
      // Simula pequeno delay de rede do gateway de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ativa no Firestore real usando o serviço de pagamentos!
      await paymentService.activateSubscription(userId, planId, provider);
      
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Falha ao ativar assinatura no Firestore.");
      setStep("error");
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulateFailure = async () => {
    setProcessing(true);
    setErrorMessage("");

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setErrorMessage("O emissor do cartão recusou a transação (Saldo Insuficiente).");
      setStep("error");
    } finally {
      setProcessing(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-emerald-500/10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Pagamento Aprovado!</h2>
            <p className="text-slate-600 text-sm">
              Sua assinatura do plano <span className="font-bold text-emerald-600">{plan?.name}</span> foi ativada com sucesso!
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 text-left space-y-2 border border-slate-100">
            <div><span className="font-bold text-slate-700">ID da Transação:</span> MP-{Math.random().toString(36).substring(2, 12).toUpperCase()}</div>
            <div><span className="font-bold text-slate-700">Provedor:</span> {provider === "stripe" ? "Stripe Direct Secure" : "Mercado Pago IPN"}</div>
            <div><span className="font-bold text-slate-700">Valor Cobrado:</span> R$ {parseFloat(price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <div><span className="font-bold text-slate-700">Renovação Automática:</span> Sim, mensal</div>
          </div>

          <button
            onClick={() => navigate("/home")}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            id="success-go-app-btn"
          >
            Ir para a Home do SentiPae <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf5] text-[#1a1a1a] flex flex-col md:flex-row">
      
      {/* Coluna Esquerda: Resumo da Assinatura */}
      <div className="flex-1 bg-slate-900 text-white p-8 md:p-16 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-extrabold text-white text-lg">
              S
            </div>
            <span className="font-black tracking-wider text-sm uppercase">SentiPae Sandbox Gateway</span>
          </div>

          <div className="space-y-6">
            <span className="px-3 py-1 bg-white/10 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-wider">
              {provider === "stripe" ? "Stripe Sandbox Environment" : "Mercado Pago Sandbox"}
            </span>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              Finalize sua Assinatura
            </h1>
            <p className="text-slate-400 text-sm max-w-md">
              Você está no ambiente de simulação segura. Use cartões fictícios para testar a experiência de ponta a ponta e ativação de banco de dados.
            </p>
          </div>

          {/* Card do Plano */}
          <div className="mt-12 bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 max-w-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-200">{plan?.name}</h3>
                <span className="text-xs text-slate-400">Assinatura Mensal Recorrente</span>
              </div>
              <span className="text-xl font-black text-emerald-400">
                R$ {parseFloat(price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              {plan?.features.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-2 text-slate-500 text-xs">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Conexão criptografada por SSL de 256 bits</span>
        </div>
      </div>

      {/* Coluna Direita: Gateway de Pagamento Simulado */}
      <div className="flex-1 p-8 md:p-16 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" /> Detalhes do Cartão
            </h2>
            <p className="text-xs text-slate-500">
              Insira qualquer nome e dados de teste. Nenhuma cobrança real será executada.
            </p>
          </div>

          {step === "error" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Erro na Transação</p>
                <p className="font-normal mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Formulário de Cartão Simulado */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nome Impresso no Cartão
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Ex: Maria S. Silva"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Número do Cartão
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium tracking-widest"
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Validade
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/AA"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  CVV
                </label>
                <input
                  type="password"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="123"
                  maxLength={3}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium text-center tracking-widest"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação Sandbox */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleSimulateSuccess}
              disabled={processing}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              id="simulate-success-btn"
            >
              {processing ? (
                "Verificando Cartão..."
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Simular Pagamento Aprovado
                </>
              )}
            </button>

            <button
              onClick={handleSimulateFailure}
              disabled={processing}
              className="w-full py-4 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-2xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              id="simulate-failure-btn"
            >
              {processing ? "Cancelando..." : "Simular Erro de Transação"}
            </button>

            <button
              onClick={() => navigate("/assinatura")}
              disabled={processing}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 text-center font-semibold"
              id="simulate-cancel-btn"
            >
              Voltar e Alterar Plano
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
