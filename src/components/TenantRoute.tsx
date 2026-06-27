import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTenant } from "../hooks/useTenant";
import { LoadingScreen } from "./LoadingScreen";
import { ShieldAlert, ArrowLeft } from "lucide-react";

interface TenantRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // Checks if user is an institutional/system admin
}

export const TenantRoute: React.FC<TenantRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { tenant, loading, error, isInstitutionalAdmin, tenantId } = useTenant();
  const params = useParams<{ tenantId?: string }>();

  if (loading) {
    return <LoadingScreen message="Autenticando tenant e verificando acessos..." />;
  }

  // 1. Not logged in or has no tenant linked
  if (!tenantId) {
    return <Navigate to="/login" replace />;
  }

  // 2. Organization is inactive or doesn't exist
  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-[#fafaf5] text-[#1a1a1a] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-black/5 rounded-3xl p-8 text-center shadow-sm space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900">Acesso Restrito ou Inativo</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {error || "Seu usuário não possui uma organização ativa vinculada ou o tenant foi desativado."}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
      </div>
    );
  }

  // 3. Optional param check: If route has :tenantId param, verify match
  if (params.tenantId && params.tenantId !== tenantId) {
    return (
      <div className="min-h-screen bg-[#fafaf5] text-[#1a1a1a] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-black/5 rounded-3xl p-8 text-center shadow-sm space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900">Isolamento Multitenant Ativo</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Você pertence à organização <span className="font-bold text-slate-800">{tenant.name}</span> e não pode acessar os dados de outra entidade.
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
      </div>
    );
  }

  // 4. Admin check: Require institutional/system admin role
  if (requireAdmin && !isInstitutionalAdmin()) {
    return (
      <div className="min-h-screen bg-[#fafaf5] text-[#1a1a1a] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-black/5 rounded-3xl p-8 text-center shadow-sm space-y-6">
          <div className="mx-auto w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900">Acesso Negado</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Esta área é restrita a administradores e gestores autorizados da organização <span className="font-bold text-slate-800">{tenant.name}</span>.
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
