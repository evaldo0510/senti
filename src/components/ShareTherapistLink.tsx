import React, { useState } from "react";
import { Share2, Check, Lock, ShieldAlert } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { cn } from "../lib/utils";

interface ShareTherapistLinkProps {
  therapistId: string;
  therapistName?: string;
  variant?: "primary" | "secondary" | "outline" | "icon" | "minimal";
  className?: string;
}

export default function ShareTherapistLink({
  therapistId,
  therapistName,
  variant = "primary",
  className,
}: ShareTherapistLinkProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const { user } = useAuth();

  const generateLink = () => {
    // Generates a fully compliant, secure direct access route url
    return `${window.location.origin}/terapeuta-perfil/${therapistId}`;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }

    const url = generateLink();

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
      console.error("Failed to copy therapist link:", err);
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="relative inline-block group" id={`share-link-wrapper-${therapistId}`}>
      <button
        onClick={handleCopy}
        type="button"
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all duration-200 select-none active:scale-[0.98] cursor-pointer",
          variant === "primary" && "px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/10",
          variant === "secondary" && "px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-white/5",
          variant === "outline" && "px-3 py-1.5 bg-transparent border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5",
          variant === "minimal" && "p-1 bg-transparent text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400",
          variant === "icon" && "p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-500 hover:bg-slate-200 dark:hover:bg-slate-850",
          copied && "bg-emerald-700 hover:bg-emerald-700 text-white border-transparent shadow-none",
          error && "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400",
          className
        )}
        aria-label="Compartilhar link de indicação seguro"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-current" />
            {variant !== "icon" && <span>Link Copiado!</span>}
          </>
        ) : error ? (
          <>
            <ShieldAlert className="w-3.5 h-3.5 text-current animate-pulse" />
            {variant !== "icon" && <span>Acesso Restrito</span>}
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-current" />
            {variant !== "icon" && (
              <span className="flex items-center gap-1">
                Compartilhar Indicação
                <Lock className="w-2.5 h-2.5 opacity-60 ml-0.5" />
              </span>
            )}
          </>
        )}
      </button>

      {/* Security notice tooltip */}
      {variant !== "icon" && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white border border-white/5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-50 text-[10px] text-center leading-normal">
          <span className="font-bold block mb-0.5 text-emerald-400">🔒 Link Protegido</span>
          Exige autenticação ativa no SentiPae para visualizar o perfil completo do terapeuta.
        </div>
      )}
    </div>
  );
}
