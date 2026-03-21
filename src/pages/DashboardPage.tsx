import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, getUserProfile, getAuthenticatedUser } from '../services/authService';
import { UserProfile } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = getAuthenticatedUser();
      
      // Se não houver usuário, tenta esperar um pouco ou redireciona
      if (!user) {
        // Pequeno delay para dar tempo ao onAuthStateChanged
        const timer = setTimeout(() => {
          if (!getAuthenticatedUser()) {
            navigate('/login');
          }
        }, 2000);
        return () => clearTimeout(timer);
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (!profile) {
          setError('Perfil não encontrado. Por favor, entre em contato com o suporte.');
          setLoading(false);
          return;
        }

        // Redirecionamento inteligente baseado no tipo de usuário
        switch (profile.tipo) {
          case 'usuario':
            navigate('/home');
            break;
          case 'terapeuta':
            navigate('/terapeuta-panel');
            break;
          case 'empresa':
            navigate('/empresa-panel');
            break;
          case 'prefeitura':
            navigate('/prefeitura-panel');
            break;
          default:
            navigate('/home');
        }
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar seu perfil.');
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-6"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-brand-green/20 text-brand-green flex items-center justify-center mx-auto animate-pulse">
            <ShieldCheck size={40} />
          </div>
          <div className="absolute -bottom-2 -right-2">
            <Loader2 className="animate-spin text-brand-green" size={24} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-brand-text">Configurando seu acesso</h2>
          <p className="text-brand-text/40 max-w-xs mx-auto">
            {error || 'Estamos preparando sua experiência personalizada no Pronto Socorro Emocional...'}
          </p>
        </div>

        {error && (
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-brand-slate text-brand-text rounded-xl font-bold hover:bg-brand-slate/80 transition-all"
          >
            Voltar para Login
          </button>
        )}
      </motion.div>
    </div>
  );
};
