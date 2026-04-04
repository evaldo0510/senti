import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, isAuthReady, user } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;

    const tipo = profile?.tipo || localStorage.getItem("tipo") || "usuario";

    // Garantir que o tipo está no localStorage para usos futuros
    localStorage.setItem("tipo", tipo);

    switch (tipo) {
      case "usuario":
      case "paciente":
        navigate("/home");
        break;
      case "terapeuta":
        navigate("/terapeuta");
        break;
      case "empresa":
        navigate("/empresa");
        break;
      case "prefeitura":
        navigate("/prefeitura");
        break;
      case "clinica":
        navigate("/clinica");
        break;
      case "hospital":
        navigate("/hospital");
        break;
      default:
        navigate("/login");
    }
  }, [navigate, profile, isAuthReady, user]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
