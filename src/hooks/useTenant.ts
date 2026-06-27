import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { organizationService } from "../services/organizationService";
import { Organization } from "../types";

export function useTenant() {
  const { profile, loading: authLoading, isAuthReady } = useAuth();
  const [tenant, setTenant] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady || authLoading) {
      return;
    }

    if (!profile) {
      setTenant(null);
      setLoading(false);
      return;
    }

    const tenantId = profile.tenantId;
    if (!tenantId) {
      setTenant(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    organizationService
      .getOrganization(tenantId)
      .then((org) => {
        if (isMounted) {
          if (org) {
            setTenant(org);
            if (!org.active) {
              setError("Esta organização está temporariamente inativa.");
            } else {
              setError(null);
            }
          } else {
            setError("Organização não encontrada.");
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Erro ao carregar dados do tenant:", err);
          setError("Erro ao carregar dados da organização.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [profile, authLoading, isAuthReady]);

  const hasAccessToTenant = (targetTenantId?: string): boolean => {
    if (!profile) return false;
    // System admin has access to everything
    if (profile.tipo === "admin" || profile.tipo === "super_admin") return true;
    if (!profile.tenantId) return false;
    if (targetTenantId && profile.tenantId !== targetTenantId) return false;
    return true;
  };

  const isInstitutionalAdmin = (): boolean => {
    if (!profile) return false;
    if (profile.tipo === "admin" || profile.tipo === "super_admin") return true;
    
    // User type must be one of the institutional admin roles
    const institutionalRoles = ["prefeitura", "empresa", "clinica", "hospital", "admin_institucional"];
    return !!profile.tenantId && institutionalRoles.includes(profile.tipo);
  };

  return {
    profile,
    tenant,
    loading: authLoading || loading,
    error,
    hasAccessToTenant,
    isInstitutionalAdmin,
    tenantId: profile?.tenantId || null,
  };
}
