import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { HeartPulse, ArrowLeft, User, Briefcase } from "lucide-react";
import { loginWithGoogle } from "../services/firebase";
import { userService } from "../services/userService";
import { useAuth } from "../components/AuthProvider";
import { useSecurityAudit } from "../hooks/useSecurityAudit";

export default function Login() {
  const navigate = useNavigate();
  const { user, profile, isAuthReady } = useAuth();
  const [error, setError] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<"usuario" | "terapeuta" | "empresa" | "prefeitura">("usuario");
  const { logSecurityEvent } = useSecurityAudit();

  useEffect(() => {
    if (isAuthReady && user && profile) {
      // Se já estiver logado e tiver perfil, vai para o dashboard
      navigate("/dashboard");
    }
  }, [user, profile, isAuthReady, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate email login
    localStorage.setItem("tipo", tipoSelecionado);
    navigate("/dashboard");
  };

  const handleDemoLogin = () => {
    setError("");
    
    const displayNameMap = {
      usuario: "Paciente de Demonstração",
      terapeuta: "Dr. Gabriel Alencar (Demonstração)",
      empresa: "MenteFeliz Empresas (Demonstração)",
      prefeitura: "Prefeitura de São Paulo (Demonstração)"
    };
    const displayName = displayNameMap[tipoSelecionado] || "Usuário de Demonstração";

    const mockUser = {
      uid: "guest_demo_user",
      displayName: displayName,
      email: "mentefelizterapias@gmail.com",
      emailVerified: true,
      providerData: [],
      photoURL: tipoSelecionado === "terapeuta" 
        ? "https://images.unsplash.com/photo-1559839734-2b71f1536780?w=100&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    } as any;

    const targetType = tipoSelecionado;

    const mockProfile = {
      uid: "guest_demo_user",
      nome: mockUser.displayName,
      email: mockUser.email,
      tipo: targetType,
      createdAt: new Date().toISOString(),
      favoritos: [],
      xp: 15,
      level: "Iniciante",
      streak: 1
    } as any;

    localStorage.setItem("simulatedUser", JSON.stringify(mockUser));
    localStorage.setItem("simulatedProfile", JSON.stringify(mockProfile));
    localStorage.setItem("tipo", targetType);
    navigate("/dashboard");
    window.location.reload();
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      console.log("Iniciando login com Google...");
      const user = await loginWithGoogle();
      if (user) {
        console.log("Login com Google bem-sucedido, sincronizando perfil...");
        const profile = await userService.syncProfile(user, tipoSelecionado);
        console.log("Perfil sincronizado:", profile);
        localStorage.setItem("tipo", profile?.tipo || tipoSelecionado);
        
        // Log critical security event: login success
        try {
          await logSecurityEvent('login', `Autenticação com Google efetuada com sucesso como perfil: ${profile?.tipo || tipoSelecionado}`, [], 'sucesso');
        } catch (auditErr) {
          console.error("Erro ao registrar log de auditoria de login:", auditErr);
        }

        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Erro detalhado no login:", err);
      let message = "Erro ao fazer login com Google.";
      
      const currentDomain = window.location.hostname;
      
      // Handle specific Firebase Auth errors
      if (err.code === 'auth/unauthorized-domain') {
        message = `Este domínio (${currentDomain}) não está autorizado no Firebase Console. 
        
        Para resolver:
        1. Acesse o Console do Firebase (console.firebase.google.com)
        2. Vá em Autenticação > Configurações > Domínios Autorizados
        3. Adicione o domínio: ${currentDomain}`;
      } else if (err.code === 'auth/popup-blocked') {
        message = "O popup de login foi bloqueado pelo seu navegador. Por favor, permita popups para este site.";
      } else {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error) message = parsed.error;
        } catch (e) {
          message = err.message || message;
        }
      }
      
      // Log failed login security event
      try {
        await logSecurityEvent('falha_seguranca', `Falha na tentativa de login com Google: ${message}`, [], 'erro');
      } catch (auditErr) {
        console.error("Erro ao registrar log de auditoria de falha de login:", auditErr);
      }

      setError(message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-4 sm:p-6 text-[#1a1a1a]"
    >
      <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-black/5 shadow-2xl">
        <button onClick={() => navigate(-1)} className="p-3 -ml-2 hover:bg-black/5 rounded-full transition-colors mb-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[#4a4a4a]" />
        </button>

        <div className="space-y-4 sm:space-y-6 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <HeartPulse className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#1a1a1a]">
            Acesse a Plataforma
          </h2>
          <p className="text-[#6a6a6a] font-light text-sm sm:text-base">
            Selecione seu perfil. Se for seu primeiro acesso, seu cadastro será criado automaticamente.
          </p>
        </div>

        {error && (
          <div className="p-5 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-medium whitespace-pre-line">
            <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-widest text-[10px]">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Erro de Configuração
            </div>
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
            Entrar ou Cadastrar com Google
          </button>
          
          <button 
            onClick={handleDemoLogin}
            type="button"
            className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 min-h-[48px] cursor-pointer"
          >
            🔑 Acessar Modo de Demonstração (Bypass)
          </button>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
            <p className="text-amber-800 text-xs text-center leading-relaxed">
              Dica: Domínio não cadastrado no Firebase? Clique acima em <strong>Modo de Demonstração (Bypass)</strong> para visualizar instantaneamente o sistema!
            </p>
          </div>
        </div>

        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-[#6a6a6a]">
            Ao entrar, você concorda com nossos <br />
            <span className="text-emerald-600 font-bold cursor-pointer hover:underline">Termos de Uso</span> e <span className="text-emerald-600 font-bold cursor-pointer hover:underline">Privacidade</span>.
          </p>
          
          <div className="pt-4 border-t border-black/5">
            <button 
              onClick={() => navigate("/contato")}
              className="text-xs text-[#9a9a9a] hover:text-emerald-600 transition-colors"
            >
              Problemas com o login? Entre em contato com o suporte.
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
