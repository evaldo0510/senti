import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, ShieldCheck, Zap, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
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
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-green/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-indigo/10 rounded-full blur-[150px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-xl glass-card p-12 md:p-16 space-y-10 border-brand-text/5 shadow-2xl rounded-[4rem]"
      >
        <div className="text-center space-y-4">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-green/20 text-brand-green mb-6 shadow-xl border border-brand-green/20"
          >
            <ShieldCheck size={40} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-brand-text">
            Pronto Socorro Emocional
          </h1>
          <p className="text-brand-text/40 text-lg">
            {isLogin ? 'Bem-vindo de volta à sua rede de apoio' : 'Crie sua conta na plataforma'}
          </p>
        </div>

        <div className="flex p-2 bg-brand-slate/50 backdrop-blur-md rounded-2xl border border-brand-text/5 shadow-inner">
          <button
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-4 text-sm font-bold rounded-xl transition-all relative z-10",
              isLogin ? "bg-brand-dark text-white shadow-2xl" : "text-brand-text/40 hover:text-brand-text/60"
            )}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-4 text-sm font-bold rounded-xl transition-all relative z-10",
              !isLogin ? "bg-brand-dark text-white shadow-2xl" : "text-brand-text/40 hover:text-brand-text/60"
            )}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40 ml-2">Nome Completo</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-green transition-colors" size={20} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-slate/50 border border-brand-text/10 rounded-2xl py-5 pl-14 pr-6 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all text-lg"
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40 ml-2">E-mail Corporativo ou Pessoal</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-green transition-colors" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-slate/50 border border-brand-text/10 rounded-2xl py-5 pl-14 pr-6 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all text-lg"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40 ml-2">Sua Senha Segura</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-green transition-colors" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-slate/50 border border-brand-text/10 rounded-2xl py-5 pl-14 pr-6 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all text-lg"
                placeholder="••••••••"
              />
            </div>
          </div>

          {(!isLogin) && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40 ml-2">Tipo de Perfil</label>
              <div className="relative group">
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as UserType)}
                  className="w-full bg-brand-slate/50 border border-brand-text/10 rounded-2xl py-5 px-6 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all appearance-none text-lg cursor-pointer"
                >
                  <option value="usuario">Usuário (Paciente)</option>
                  <option value="terapeuta">Terapeuta</option>
                  <option value="empresa">Empresa (RH)</option>
                  <option value="prefeitura">Prefeitura</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text/20">
                  <Zap size={18} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm text-center font-bold"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green text-white font-bold py-5 rounded-2xl shadow-2xl shadow-brand-green/30 hover:shadow-brand-green/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 text-lg"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
                {isLogin ? 'Entrar na Plataforma' : 'Criar Conta Agora'}
              </>
            )}
          </motion.button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-text/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-brand-bg px-4 text-brand-text/30">Acesso Rápido</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(var(--brand-slate-rgb), 0.8)' }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              enterDemoMode(userType);
              navigate('/dashboard');
            }}
            className="w-full font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 border-2 bg-brand-slate/50 text-brand-text border-brand-text/10 shadow-xl"
          >
            <Zap size={24} className="text-brand-green" />
            <span className="text-lg">Acessar Modo Demonstração</span>
          </motion.button>
        </form>

        <div className="text-center space-y-6 pt-4">
          <p className="text-xs text-brand-text/40 leading-relaxed">
            Ao continuar, você concorda com nossos <span className="text-brand-green font-bold underline cursor-pointer hover:text-brand-green/80">Termos de Uso</span> e <span className="text-brand-green font-bold underline cursor-pointer hover:text-brand-green/80">Política de Privacidade</span>.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            type="button"
            onClick={() => {
              setUserType('empresa');
              setIsLogin(false);
            }}
            className="text-xs text-brand-indigo font-bold uppercase tracking-[0.2em] hover:text-brand-indigo/80 flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <Building2 size={16} />
            Acesso Corporativo (RH)
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
