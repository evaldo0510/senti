import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { HeartPulse, ArrowLeft, Mail, Lock, User, Briefcase, Building2, Landmark } from "lucide-react";
import { loginWithGoogle } from "../services/firebase";
import { userService } from "../services/userService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100"
    >
      <div className="w-full max-w-md space-y-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors mb-4">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <HeartPulse className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-light tracking-tight text-slate-200">
            Acesso ao Sistema
          </h2>
          <p className="text-slate-400">
            Selecione seu perfil para entrar.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setTipoSelecionado("usuario")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
              tipoSelecionado === "usuario" 
                ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-400" 
                : "bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">Paciente</span>
          </button>
          <button
            type="button"
            onClick={() => setTipoSelecionado("terapeuta")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
              tipoSelecionado === "terapeuta" 
                ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-400" 
                : "bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-sm font-medium">Terapeuta</span>
          </button>
          <button
            type="button"
            onClick={() => setTipoSelecionado("empresa")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
              tipoSelecionado === "empresa" 
                ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-400" 
                : "bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-medium">Empresa (RH)</span>
          </button>
          <button
            type="button"
            onClick={() => setTipoSelecionado("prefeitura")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
              tipoSelecionado === "prefeitura" 
                ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-400" 
                : "bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span className="text-sm font-medium">Prefeitura</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 mt-4"
          >
            Entrar
          </button>
        </form>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">ou</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-3 px-6 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Entrar com Google
        </button>

        <div className="text-center mt-4">
          <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            Esqueci minha senha
          </button>
        </div>
      </div>
    </motion.div>
  );
}