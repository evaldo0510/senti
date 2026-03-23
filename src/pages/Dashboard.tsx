import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const tipo = localStorage.getItem("tipo");

    switch (tipo) {
      case "usuario":
      case "paciente":
        navigate("/chat");
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
      default:
        navigate("/login");
    }
  }, [navigate]);

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
