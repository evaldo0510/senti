import React from "react";
import { useAuth } from "./AuthProvider";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingScreen } from "./LoadingScreen";
import AccessDenied from "../pages/AccessDenied";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, profile, loading, isAuthReady } = useAuth();
  const location = useLocation();

  if (loading || !isAuthReady) {
    return <LoadingScreen message="Verificando privilégios administrativos..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = profile?.tipo === "admin" || profile?.tipo === "super_admin";

  if (!isAdmin) {
    return <AccessDenied path={location.pathname} />;
  }

  return <>{children}</>;
};
