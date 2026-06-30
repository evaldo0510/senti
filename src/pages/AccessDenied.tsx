import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { motion } from "motion/react";
import { auth, db } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";

interface AccessDeniedProps {
  path?: string;
}

export default function AccessDenied({ path = "Área Administrativa" }: AccessDeniedProps) {
  const navigate = useNavigate();
  const loggedRef = useRef(false);

  useEffect(() => {
    // Only log once per mount to prevent double logs
    if (loggedRef.current) return;
    loggedRef.current = true;

    const logUnauthorizedAccess = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const logData = {
          userId: currentUser.uid,
          userEmail: currentUser.email || "unknown",
          action: "falha_seguranca",
          description: `Tentativa de acesso não autorizado à rota: ${path}`,
          fieldsChanged: ["permissao_rota"],
          status: "erro" as const,
          timestamp: new Date().toISOString(),
          clientTimestamp: new Date().toISOString(),
        };

        await addDoc(collection(db, "audit_logs"), logData);
        console.warn(`[Security Alert] Access denied logged for route: ${path}`);
      } catch (error) {
        console.error("Failed to write unauthorized access log:", error);
      }
    };

    logUnauthorizedAccess();
  }, [path]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500"></div>

        <div className="mx-auto w-16 h-16 bg-red-950/50 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
        </div>

        <h1 className="font-sans text-2xl font-bold tracking-tight text-white mb-2">
          Acesso Restrito
        </h1>
        
        <p className="font-mono text-xs text-red-400 uppercase tracking-wider mb-4">
          CÓDIGO: 403_FORBIDDEN
        </p>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Sua credencial de usuário não possui nível de autorização suficiente para visualizar a rota:
          <span className="block mt-2 px-3 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded font-mono text-xs text-slate-300 break-all select-all">
            {path}
          </span>
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 hover:text-white rounded-lg transition-colors font-medium text-sm border border-slate-700/50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar à página anterior
          </button>
          
          <button
            onClick={() => navigate("/home")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-emerald-950/20 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Ir para Área Pública
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
          Esta tentativa de acesso foi gravada na trilha imutável de auditoria.
        </div>
      </motion.div>
    </div>
  );
}
