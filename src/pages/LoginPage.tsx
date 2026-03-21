import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, ShieldCheck, Zap, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, isFirebaseOffline } from '../services/firebase';
import { login, registrar, enterDemoMode } from '../services/authService';
import { UserType } from '../types';
import { cn } from '../lib/utils';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>('usuario');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await registrar(email, password, name, userType);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-green/20 text-brand-green mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text">
            Pronto Socorro Emocional
          </h1>
          <p className="text-brand-text/60">
            {isLogin ? 'Bem-vindo de volta à sua rede de apoio' : 'Crie sua conta na plataforma'}
          </p>
        </div>

        <div className="flex p-1 bg-brand-slate rounded-xl border border-brand-text/5">
          <button
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              isLogin ? "bg-brand-dark text-brand-text shadow-lg" : "text-brand-text/40 hover:text-brand-text/60"
            )}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              !isLogin ? "bg-brand-dark text-brand-text shadow-lg" : "text-brand-text/40 hover:text-brand-text/60"
            )}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-text/40 ml-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/20" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-slate border border-brand-text/10 rounded-xl py-3 pl-10 pr-4 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all"
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-text/40 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/20" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-slate border border-brand-text/10 rounded-xl py-3 pl-10 pr-4 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-text/40 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/20" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-slate border border-brand-text/10 rounded-xl py-3 pl-10 pr-4 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {(!isLogin || isFirebaseOffline) && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-text/40 ml-1">Tipo de Perfil</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as UserType)}
                className="w-full bg-brand-slate border border-brand-text/10 rounded-xl py-3 px-4 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all appearance-none"
              >
                <option value="usuario">Usuário (Paciente)</option>
                <option value="terapeuta">Terapeuta</option>
                <option value="empresa">Empresa (RH)</option>
                <option value="prefeitura">Prefeitura</option>
              </select>
            </div>
          )}

          {isFirebaseOffline && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs text-center space-y-2">
              <p className="font-bold">⚠️ Conexão Limitada</p>
              <p>O sistema está operando em modo offline. Use o botão de demonstração abaixo para acessar.</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isFirebaseOffline}
            className="w-full bg-brand-green text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                {isLogin ? 'Entrar na Plataforma' : 'Criar Conta'}
              </>
            )}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-text/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-brand-bg px-2 text-brand-text/40">Recomendado</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              enterDemoMode(userType);
              navigate('/dashboard');
            }}
            className={cn(
              "w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 border-2",
              isFirebaseOffline 
                ? "bg-brand-green text-white border-brand-green shadow-lg animate-pulse" 
                : "bg-brand-slate text-brand-text border-brand-text/10 hover:bg-brand-slate/80"
            )}
          >
            <Zap size={20} className={isFirebaseOffline ? "text-white" : "text-brand-green"} />
            Acessar Modo de Demonstração
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-xs text-brand-text/40">
            Ao continuar, você concorda com nossos <span className="text-brand-green underline cursor-pointer">Termos de Uso</span> e <span className="text-brand-green underline cursor-pointer">Política de Privacidade</span>.
          </p>
          
          <button
            type="button"
            onClick={() => {
              setUserType('empresa');
              setIsLogin(false);
            }}
            className="text-xs text-brand-indigo font-bold uppercase tracking-widest hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <Building2 size={14} />
            Acesso Corporativo (RH)
          </button>
        </div>
      </motion.div>
    </div>
  );
};
