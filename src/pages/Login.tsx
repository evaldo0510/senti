import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { HeartPulse, ArrowLeft, User, Briefcase } from "lucide-react";
import { loginWithGoogle } from "../services/firebase";
import { userService } from "../services/userService";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<"usuario" | "terapeuta" | "empresa" | "prefeitura">("usuario");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate email login
    localStorage.setItem("tipo", tipoSelecionado);
    navigate("/dashboard");
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        await userService.syncProfile(user, tipoSelecionado);
        localStorage.setItem("tipo", tipoSelecionado);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login com Google.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-6 text-[#1a1a1a]"
    >
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[3rem] border border-black/5 shadow-2xl">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors mb-4">
          <ArrowLeft className="w-5 h-5 text-[#4a4a4a]" />
        </button>

        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <HeartPulse className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-serif font-bold tracking-tight text-[#1a1a1a]">
            Bem-vindo de volta
          </h2>
          <p className="text-[#6a6a6a] font-light">
            Selecione seu perfil para entrar.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setTipoSelecionado("usuario")}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              tipoSelecionado === "usuario" 
                ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                : "bg-[#f5f5f0] border-black/5 text-[#6a6a6a] hover:bg-black/5"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Paciente</span>
          </button>
          <button
            type="button"
            onClick={() => setTipoSelecionado("terapeuta")}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              tipoSelecionado === "terapeuta" 
                ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                : "bg-[#f5f5f0] border-black/5 text-[#6a6a6a] hover:bg-black/5"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Terapeuta</span>
          </button>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
            </svg>
            Entrar com Google
          </button>
          
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
            <p className="text-amber-800 text-xs text-center leading-relaxed">
              O cadastro via e-mail não está disponível no momento. <br />
              <strong>Por favor, utilize sua conta Google.</strong>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-[#6a6a6a]">
            Ao entrar, você concorda com nossos <br />
            <span className="text-emerald-600 font-bold cursor-pointer hover:underline">Termos de Uso</span> e <span className="text-emerald-600 font-bold cursor-pointer hover:underline">Privacidade</span>.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
