import React, { useState } from "react";
import { Share2, Check, Lock, ShieldAlert, KeyRound, AlertCircle, HelpCircle } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { cn } from "../lib/utils";

interface ShareTherapistPanelButtonProps {
  therapistId: string;
  therapistName?: string;
  therapistTenantId?: string;
  variant?: "primary" | "secondary" | "outline" | "icon" | "danger" | "ghost";
  className?: string;
}

export default function ShareTherapistPanelButton({
  therapistId,
  therapistName,
  therapistTenantId,
  variant = "primary",
  className,
}: ShareTherapistPanelButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const { user, profile } = useAuth();

  // Fine-grained security check: Who is authorized to access/share this private clinic panel?
  const isSelf = user?.uid === therapistId;
  const isAdmin = profile?.tipo === "admin" || profile?.tipo === "super_admin";
  const isTenantAdmin = 
    (profile?.tipo === "admin_institucional" || 
     profile?.tipo === "prefeitura" || 
     profile?.tipo === "empresa" || 
     profile?.tipo === "clinica" || 
     profile?.tipo === "hospital") && 
    (therapistTenantId ? profile?.tenantId === therapistTenantId : true);

  const isAuthorized = isSelf || isAdmin || isTenantAdmin;

  const generateLink = () => {
    // Generate secure URL with authorization redirect query params
    return `${window.location.origin}/terapeuta?id=${therapistId}&utm_source=sentipae_secure_share&auth_required=true`;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Strict clinical safeguard: If the user lacks proper authorization, show a non-intrusive modal/warning and block generation.
    if (!isAuthorized) {
      setError(true);
      setShowAuthWarning(true);
      setTimeout(() => setError(false), 3000);
      return;
    }

    const url = generateLink();
    const title = `🔒 SentiPae - Painel Restrito - Dr(a). ${therapistName || "Profissional"}`;
    const text = `Acesso restrito e criptografado ao painel do profissional. Requer autenticação clínica ativa no SentiPae.`;

    // Attempt native share API first (excellent for mobile and clinical communication in WhatsApp/Telegram)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Native share failed, falling back to copy", err);
        } else {
          return; // User cancelled
        }
      }
    }

    // Fallback to clipboard copy
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy private dashboard link:", err);
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="relative inline-block w-full sm:w-auto" id={`share-panel-wrapper-${therapistId}`}>
      <button
        onClick={handleShare}
        type="button"
        aria-live="polite"
        aria-label={
          copied 
            ? "Link do painel copiado com sucesso" 
            : `Compartilhar link de acesso restrito do painel de ${therapistName || "Terapeuta"}`
        }
        className={cn(
          "w-full inline-flex items-center justify-center gap-2.5 rounded-2xl text-xs font-bold transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] min-h-[44px] px-5 py-3",
          variant === "primary" && "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/20 border border-amber-500/20",
          variant === "secondary" && "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-white/5",
          variant === "outline" && "bg-transparent border border-amber-500/20 hover:border-amber-500/40 text-amber-500 hover:bg-amber-500/5",
          variant === "icon" && "p-2 bg-slate-900 border border-white/5 text-slate-400 hover:text-amber-400 hover:bg-slate-850",
          variant === "danger" && "bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/10",
          variant === "ghost" && "bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200",
          !isAuthorized && "opacity-75 bg-slate-900 hover:bg-slate-900 text-slate-500 border-slate-950 cursor-not-allowed active:scale-100",
          copied && "bg-emerald-700 hover:bg-emerald-700 text-white border-transparent shadow-none",
          error && "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400",
          className
        )}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-white animate-bounce" />
            <span>Link Copiado!</span>
          </>
        ) : error && !showAuthWarning ? (
          <>
            <ShieldAlert className="w-4 h-4 text-red-500 dark:text-red-400 animate-pulse" />
            <span>Falha ao Copiar</span>
          </>
        ) : !isAuthorized ? (
          <>
            <Lock className="w-4 h-4 text-slate-600" />
            <span>Acesso Restrito</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 text-current transition-transform duration-200 group-hover:scale-110" />
            <span>Compartilhar Painel Seguro</span>
            <KeyRound className="w-3.5 h-3.5 opacity-40 ml-0.5" />
          </>
        )}
      </button>

      {/* Accessible Interactive Security Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 p-3 bg-slate-950 text-slate-300 border border-white/10 rounded-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-250 shadow-2xl z-50 text-[10px] leading-relaxed text-center">
        <span className="font-bold text-slate-100 block mb-1 flex items-center justify-center gap-1">
          {isAuthorized ? "🔒 Link Autenticado" : "⚠️ Permissão Insuficiente"}
        </span>
        {isAuthorized ? (
          <span>Este link exige que o destinatário faça login e tenha permissões clínicas para ver este painel específico.</span>
        ) : (
          <span className="text-red-400">Apenas o próprio terapeuta, administradores ou parceiros institucionais vinculados possuem permissão para compartilhar este painel.</span>
        )}
      </div>

      {/* Non-intrusive Warning Modal overlay for clinical security breaches */}
      {showAuthWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-sm w-full shadow-2xl text-center space-y-4 animate-scaleIn">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-100">Controle de Acesso Clínico</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Você não possui permissões administrativas ou de propriedade para compartilhar o painel de atendimento deste terapeuta.
              </p>
            </div>
            <div className="p-3 bg-slate-950 border border-white/5 rounded-xl text-[10px] text-slate-500 flex gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>
                As diretrizes de proteção de dados e a LGPD limitam o acesso a dados de sessões, prontuários e faturamentos exclusivamente a profissionais devidamente vinculados.
              </span>
            </div>
            <button
              onClick={() => setShowAuthWarning(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold cursor-pointer border border-white/5"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
