import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Users, 
  BookOpen, 
  User, 
  ArrowLeft,
  Calendar,
  Star,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Wind,
  CloudRain,
  ShieldAlert,
  Zap,
  ArrowRight,
  HelpCircle,
  Volume2,
  VolumeX,
  Loader2,
  Mic,
  Square,
  Sun,
  Moon,
  MessageSquare,
  Send,
  Search,
  History
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation,
  useParams
} from 'react-router-dom';

import { getIARAResponse, generateSpeech } from './services/geminiService';
import { userService } from './services/userService';
import { chatService } from './services/chatService';
import { auth, getUserProfile, logout, isMockMode, getAuthenticatedUser, enterDemoMode } from './services/authService';
import { AppRoute, Message, MoodEntry, Therapist, UserProfile, DirectMessage } from './types';
import { cn, blobToBase64 } from './lib/utils';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TerapeutaPage } from './pages/TerapeutaPage';
import { EmpresaPage } from './pages/EmpresaPage';
import { PrefeituraPage } from './pages/PrefeituraPage';
import { NewsCard } from './components/NewsCard';

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) => {
  const variants = {
    primary: 'bg-brand-green text-white hover:bg-brand-green/90 shadow-lg shadow-brand-green/20',
    secondary: 'bg-brand-slate text-brand-text border border-white/10 hover:bg-brand-slate/80',
    ghost: 'bg-transparent text-brand-text hover:bg-white/10'
  };
  
  return (
    <button 
      className={cn(
        'px-6 py-3 rounded-full font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeRoute = location.pathname.split('/')[1] || 'dashboard';

  const navItems = [
    { id: 'dashboard', path: '/dashboard', icon: Heart, label: 'Início' },
    { id: 'chat', path: '/chat', icon: MessageCircle, label: 'IARA' },
    { id: 'terapeutas', path: '/terapeutas', icon: Users, label: 'Terapeutas' },
    { id: 'diario', path: '/diario', icon: BookOpen, label: 'Diário' },
    { id: 'perfil', path: '/perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-brand-bg/90 backdrop-blur-xl border-t border-brand-text/10 pt-2 pb-8 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-lg mx-auto flex justify-around items-stretch">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={activeRoute === item.id ? 'page' : undefined}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 transition-all relative min-h-[56px]',
              activeRoute === item.id ? 'text-brand-green' : 'text-brand-text/40 hover:text-brand-text/60'
            )}
          >
            <item.icon size={24} strokeWidth={activeRoute === item.id ? 2.5 : 2} />
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest transition-all",
              activeRoute === item.id ? "opacity-100" : "opacity-60"
            )}>
              {item.label}
            </span>
            {activeRoute === item.id && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute top-0 w-1 h-1 bg-brand-green rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

// --- Pages ---

const BreathingExercise = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'inspire' | 'segure' | 'expire' | 'complete'>('inspire');
  const [counter, setCounter] = useState(4);

  useEffect(() => {
    if (phase === 'complete') return;
    
    const timer = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          if (phase === 'inspire') { setPhase('segure'); return 4; }
          if (phase === 'segure') { setPhase('expire'); return 4; }
          if (phase === 'expire') { setPhase('complete'); return 0; }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  if (phase === 'complete') {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="bg-brand-sage/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-brand-sage">
          <Smile size={32} />
        </div>
        <h3 className="text-xl font-serif">Como se sente agora?</h3>
        <Button onClick={onComplete}>Continuar</Button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-8 py-12">
      <motion.div 
        animate={{ 
          scale: phase === 'inspire' ? 1.5 : phase === 'expire' ? 1 : 1.5,
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="w-32 h-32 bg-brand-sage/20 rounded-full mx-auto flex items-center justify-center text-brand-sage"
      >
        <Wind size={48} />
      </motion.div>
      <div className="space-y-2">
        <h3 className="text-2xl font-serif capitalize">{phase}...</h3>
        <p className="text-4xl font-serif italic text-brand-olive">{counter}</p>
      </div>
    </div>
  );
};

const EmergencyModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-ink/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl"
      >
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <Frown size={32} />
          <h3 className="font-serif text-xl">Ajuda Urgente</h3>
        </div>
        <p className="text-brand-ink/60 text-sm leading-relaxed">
          Se você está em perigo imediato ou pensando em se machucar, por favor, entre em contato com um serviço de emergência agora.
        </p>
        <div className="space-y-3">
          <a href="tel:188" className="block w-full bg-red-600 text-white py-4 rounded-full text-center font-bold hover:bg-red-700 transition-colors">
            Ligar para CVV (188)
          </a>
          <a href="tel:192" className="block w-full border border-red-200 text-red-600 py-4 rounded-full text-center font-bold hover:bg-red-50 transition-colors">
            SAMU (192)
          </a>
        </div>
        <button onClick={onClose} className="w-full text-brand-ink/40 text-sm font-medium">Voltar</button>
      </motion.div>
    </div>
  );
};

const HomePage = ({ userProfile }: { userProfile: UserProfile | null }) => {
  const navigate = useNavigate();
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isBreathing, setIsBreathing] = useState(false);
  const [therapists, setTherapists] = useState<UserProfile[]>([]);
  
  useEffect(() => {
    setMoodHistory(userService.getMoodHistory());
    
    const fetchTherapists = async () => {
      const t = await userService.getTherapists();
      setTherapists(t.slice(0, 5));
    };
    fetchTherapists();
  }, []);

  const lastMood = moodHistory[moodHistory.length - 1];

  const mockNews = [
    {
      id: 1,
      title: "Nova funcionalidade de respiração guiada",
      description: "Aprenda a usar a nova ferramenta de respiração para controlar a ansiedade em momentos de crise.",
      date: "21 MAR 2026",
      imageUrl: "https://picsum.photos/seed/respira/400/200"
    },
    {
      id: 2,
      title: "A importância do Check-in diário",
      description: "Descubra como registrar suas emoções diariamente pode ajudar no seu autoconhecimento.",
      date: "20 MAR 2026",
      imageUrl: "https://picsum.photos/seed/diario/400/200"
    },
    {
      id: 3,
      title: "Como a Poesia Cognitiva ajuda",
      description: "Entenda a ciência por trás da abordagem da IARA e como ela atua no seu bem-estar.",
      date: "19 MAR 2026",
      imageUrl: "https://picsum.photos/seed/poesia/400/200"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pb-24 space-y-8 bg-brand-bg min-h-screen"
    >
      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-brand-text font-bold">Olá, {userProfile?.nome || 'Visitante'}</h1>
          <p className="text-brand-text/50 text-sm">Onde a mente encontra o seu lugar.</p>
        </div>
        <div className="w-12 h-12 bg-brand-slate rounded-2xl flex items-center justify-center text-brand-green shadow-inner">
          <Heart size={24} fill="currentColor" />
        </div>
      </header>

      {/* Breathing Exercise Overlay */}
      <AnimatePresence>
        {isBreathing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-dark flex flex-col items-center justify-center p-8 text-white"
          >
            <div className="relative flex items-center justify-center">
              <motion.div 
                animate={{ 
                  scale: [1, 1.8, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-48 h-48 rounded-full bg-brand-green/30 blur-2xl absolute"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.5, 1],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-40 h-40 rounded-full border-2 border-brand-green flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-brand-green" />
              </motion.div>
            </div>
            
            <motion.div 
              key={Math.floor(Date.now() / 4000) % 2}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 text-center space-y-4"
            >
              <h2 className="text-4xl font-serif font-bold tracking-tight">Inspire...</h2>
              <p className="text-brand-text/40 uppercase tracking-widest text-[10px] font-bold">Sincronize sua respiração</p>
            </motion.div>

            <button 
              onClick={() => setIsBreathing(false)}
              className="absolute top-8 right-8 text-brand-text/40 hover:text-brand-text transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero: Pronto Socorro Emocional */}
      <motion.section 
        whileHover={{ scale: 1.01 }}
        className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-green to-brand-green/80 text-white shadow-2xl relative overflow-hidden border-none"
      >
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-full">
            <ShieldAlert size={14} />
            Pronto Socorro Emocional
          </div>
          <h2 className="text-3xl font-serif leading-tight font-bold">Você não precisa carregar tudo sozinho.</h2>
          <p className="text-white/80 text-sm leading-relaxed">A IARA está pronta para te acolher agora com Poesia Cognitiva Hipnótica.</p>
          <div className="flex flex-col gap-3 pt-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => navigate('/guided-flow')}
                className="w-full bg-white text-brand-dark hover:bg-brand-text border-none py-4 text-lg font-bold"
              >
                Preciso de ajuda agora
              </Button>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/chat')}
              className="text-sm text-white/70 hover:text-white transition-colors font-medium"
            >
              Quero apenas conversar
            </motion.button>
          </div>
        </div>
        {/* Abstract background element */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
      </motion.section>

      {/* Breathing Tool */}
      <motion.section 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsBreathing(true)}
        className="bg-brand-slate p-6 rounded-[2rem] cursor-pointer hover:bg-brand-slate/80 transition-all flex items-center justify-between border border-white/5 shadow-lg"
      >
        <div className="space-y-1">
          <h3 className="text-xl font-serif font-bold">Pausa para Respirar</h3>
          <p className="text-brand-text/40 text-sm">60 segundos de calma guiada</p>
        </div>
        <div className="bg-brand-green/10 p-3 rounded-2xl text-brand-green">
          <Wind size={24} />
        </div>
      </motion.section>

      {/* Daily Check-in */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold">Check-in Diário</h3>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/diario')} className="text-sm text-brand-green font-bold">Ver histórico</motion.button>
        </div>
        <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-6 rounded-[2rem] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-brand-text/40">Último registro</p>
            <p className="text-lg font-bold">
              {lastMood ? `Humor: ${lastMood.value}/10` : 'Nenhum registro hoje'}
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="secondary" onClick={() => navigate('/diario')} className="px-4 py-2 text-xs">
              {lastMood ? 'Atualizar' : 'Registrar'}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Notícias do Bem-Estar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold">Notícias do Bem-Estar</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
          {mockNews.map((news) => (
            <div key={news.id} className="min-w-[280px] snap-center">
              <NewsCard 
                title={news.title}
                description={news.description}
                date={news.date}
                imageUrl={news.imageUrl}
                loading={false}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Active Chats */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold">Conversas Ativas</h3>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-sm text-brand-green font-bold">Ver todas</motion.button>
        </div>
        <div className="space-y-3">
          {therapists.slice(0, 2).map(t => (
            <motion.div 
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              key={t.uid} 
              onClick={() => navigate(`/direct-chat/${t.uid}`)}
              className="glass-card p-4 rounded-[1.5rem] flex items-center gap-4 cursor-pointer hover:bg-brand-slate/50 transition-all border border-white/5"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-slate">
                <img 
                  src={t.fotoUrl || `https://picsum.photos/seed/${t.uid}/200`} 
                  alt={t.nome} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-brand-text">{t.nome}</h4>
                <p className="text-[10px] text-brand-text/40 line-clamp-1">Clique para continuar a conversa...</p>
              </div>
              <div className="bg-brand-green/10 p-2 rounded-xl text-brand-green">
                <MessageSquare size={16} />
              </div>
            </motion.div>
          ))}
          {therapists.length === 0 && (
            <p className="text-sm text-brand-text/40 italic py-2">Inicie um agendamento para conversar.</p>
          )}
        </div>
      </section>

      {/* Featured Therapists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold">Terapeutas Online</h3>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/terapeutas')} className="text-sm text-brand-green font-bold">Ver todos</motion.button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {therapists.map(t => (
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              key={t.uid} 
              className="min-w-[180px] glass-card p-5 rounded-[2rem] space-y-4 text-center"
            >
              <div className="relative w-20 h-20 mx-auto">
                <img src={t.fotoUrl || `https://picsum.photos/seed/${t.uid}/200`} alt={t.nome} className="w-full h-full rounded-3xl object-cover border-2 border-brand-green/20" referrerPolicy="no-referrer" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-green rounded-full border-2 border-brand-slate" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm line-clamp-1">{t.nome}</p>
                <p className="text-[9px] text-brand-text/40 uppercase tracking-widest font-bold">{t.especialidades?.[0] || 'Terapia'}</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="secondary" className="w-full py-2 text-[10px] uppercase tracking-widest font-bold" onClick={() => navigate('/terapeutas')}>Agendar</Button>
              </motion.div>
            </motion.div>
          ))}
          {therapists.length === 0 && (
            <p className="text-sm text-brand-text/40 italic py-4">Nenhum terapeuta online agora.</p>
          )}
        </div>
      </section>

      {/* My Appointments / Chats */}
      <section className="space-y-4">
        <h3 className="text-xl font-serif font-bold">Conversas Ativas</h3>
        <div className="space-y-3">
          {therapists.slice(0, 2).map(t => (
            <div 
              key={t.uid} 
              onClick={() => navigate(`/direct-chat/${t.uid}`)}
              className="glass-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-brand-slate/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <img src={t.fotoUrl || `https://picsum.photos/seed/${t.uid}/200`} alt={t.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{t.nome}</p>
                <p className="text-xs text-brand-text/40">Clique para conversar</p>
              </div>
              <MessageSquare size={20} className="text-brand-green" />
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

const GuidedFlowPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'impacto' | 'triagem' | 'intensidade' | 'risco' | 'respiracao' | 'reflexao' | 'validacao' | 'direcionamento' | 'final'>('impacto');
  const [emocao, setEmocao] = useState('');
  const [intensidade, setIntensidade] = useState(5);
  const [showEmergency, setShowEmergency] = useState(false);
  const [reflexao, setReflexao] = useState('');
  const [validationResponse, setValidationResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emotions = [
    { id: 'ansiedade', label: 'Ansiedade', icon: <Wind size={20} /> },
    { id: 'tristeza', label: 'Tristeza', icon: <CloudRain size={20} /> },
    { id: 'medo', label: 'Medo', icon: <ShieldAlert size={20} /> },
    { id: 'raiva', label: 'Raiva', icon: <Zap size={20} /> },
    { id: 'confusao', label: 'Confusão', icon: <HelpCircle size={20} /> },
  ];

  const handleReflexaoSubmit = async () => {
    if (!reflexao.trim()) {
      setStep('direcionamento');
      return;
    }
    
    setIsLoading(true);
    setStep('validacao');
    
    const prompt = `O usuário está em uma jornada guiada. Ele sentiu ${emocao} com intensidade ${intensidade}/10. 
    Após um exercício de respiração, ele refletiu: "${reflexao}". 
    Dê uma resposta de validação emocional curta (máx 3 linhas) usando Poesia Cognitiva Hipnótica.`;
    
    const { text } = await getIARAResponse(prompt);
    setValidationResponse(text || 'Eu ouço o que seu coração diz. Respire fundo.');
    setIsLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 'impacto':
        return (
          <div className="space-y-12 text-center py-12">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-32 h-32 bg-brand-olive/10 rounded-full mx-auto flex items-center justify-center text-brand-olive"
            >
              <Wind size={64} />
            </motion.div>
            <div className="space-y-4">
              <h2 className="text-3xl font-serif italic text-brand-ink">Você não precisa passar por isso sozinho.</h2>
              <p className="text-brand-ink/60 max-w-xs mx-auto">Estou aqui para te segurar enquanto você respira.</p>
            </div>
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <Button 
                onClick={() => setStep('triagem')}
                className="w-full py-6 text-lg shadow-xl bg-brand-olive hover:bg-brand-olive/90"
              >
                Preciso de ajuda agora
              </Button>
              <button 
                onClick={() => navigate('/chat')}
                className="text-brand-ink/40 text-sm hover:text-brand-olive transition-colors"
              >
                Quero apenas conversar
              </button>
            </div>
          </div>
        );
      case 'triagem':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif italic">Eu estou aqui com você...</h2>
              <p className="text-brand-ink/60">O que está mais forte em você agora?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {emotions.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setEmocao(e.id); setStep('intensidade'); }}
                  className="glass-card p-6 rounded-3xl flex flex-col items-center gap-3 hover:bg-brand-olive hover:text-white transition-all"
                >
                  <div className="p-3 bg-brand-sage/10 rounded-2xl">
                    {e.icon}
                  </div>
                  <span className="font-medium">{e.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'intensidade':
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic">O quanto isso está pesado?</h2>
              <p className="text-brand-ink/60">De 0 a 10, qual a intensidade desse sentimento agora?</p>
            </div>
            <div className="space-y-6">
              <div className="text-6xl font-serif italic text-brand-olive">{intensidade}</div>
              <input
                type="range"
                min="0"
                max="10"
                value={intensidade}
                onChange={(e) => setIntensidade(parseInt(e.target.value))}
                className="w-full h-2 bg-brand-olive/10 rounded-lg appearance-none cursor-pointer accent-brand-olive"
              />
              <Button className="w-full" onClick={() => setStep('risco')}>Continuar</Button>
            </div>
          </div>
        );
      case 'risco':
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic">Sua segurança importa.</h2>
              <p className="text-brand-ink/60">Você está em um lugar seguro e sente que pode cuidar de si agora?</p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setStep('respiracao')}
                className="glass-card p-4 rounded-2xl hover:bg-green-50 hover:text-green-600 transition-all"
              >
                Sim, estou seguro
              </button>
              <button 
                onClick={() => { setShowEmergency(true); setStep('respiracao'); }}
                className="glass-card p-4 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
              >
                Não, me sinto em risco
              </button>
              <button 
                onClick={() => setStep('respiracao')}
                className="text-sm text-brand-ink/40"
              >
                Prefiro não responder
              </button>
            </div>
          </div>
        );
      case 'respiracao':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif italic">Respire comigo...</h2>
              <p className="text-brand-ink/60 italic">Devagar... como se estivesse abrindo espaço dentro de você... E solta... deixando um pouco desse peso ir...</p>
            </div>
            <div className="glass-card p-8 rounded-3xl border-brand-sage/30 border-2">
              <BreathingExercise onComplete={() => setStep('reflexao')} />
            </div>
          </div>
        );
      case 'reflexao':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif italic">Dando voz ao sentir</h2>
              <p className="text-brand-ink/60">Se esse sentimento pudesse falar, o que ele diria agora?</p>
            </div>
            <div className="space-y-4">
              <textarea
                value={reflexao}
                onChange={(e) => setReflexao(e.target.value)}
                placeholder="O que você mais precisava ouvir nesse momento?"
                className="w-full bg-white border border-brand-olive/10 rounded-3xl p-6 text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-brand-olive/20"
              />
              <Button className="w-full" onClick={handleReflexaoSubmit}>Enviar</Button>
            </div>
          </div>
        );
      case 'validacao':
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-serif italic">IARA ouve você...</h2>
              <div className="glass-card p-8 rounded-3xl bg-brand-olive text-white italic leading-relaxed">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s] mx-1" />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                  </div>
                ) : (
                  validationResponse
                )}
              </div>
            </div>
            {!isLoading && <Button className="w-full" onClick={() => setStep('direcionamento')}>Continuar</Button>}
          </div>
        );
      case 'direcionamento':
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic">Qual o próximo passo?</h2>
              <p className="text-brand-ink/60">Agora que você respirou um pouco, vamos escolher o caminho juntos.</p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setStep('final')}
                className="glass-card p-6 rounded-3xl flex items-center justify-between hover:bg-brand-olive hover:text-white transition-all group"
              >
                <div className="text-left">
                  <p className="font-medium">Sessão PCH Guiada</p>
                  <p className="text-xs opacity-60">Continuar regulação profunda</p>
                </div>
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => navigate('/terapeutas')}
                className="glass-card p-6 rounded-3xl flex items-center justify-between hover:bg-brand-olive hover:text-white transition-all group"
              >
                <div className="text-left">
                  <p className="font-medium">Falar com terapeuta online</p>
                  <p className="text-xs opacity-60">Conexão humana especializada agora</p>
                </div>
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => setShowEmergency(true)}
                className="glass-card p-6 rounded-3xl flex items-center justify-between hover:bg-red-50 hover:text-red-600 transition-all group border-red-100 border"
              >
                <div className="text-left">
                  <p className="font-medium">Ajuda Imediata</p>
                  <p className="text-xs opacity-60">CVV 188 / Emergência local</p>
                </div>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        );
      case 'final':
        return (
          <div className="space-y-8 text-center py-12">
            <div className="w-24 h-24 bg-brand-sage/20 rounded-full mx-auto flex items-center justify-center text-brand-sage">
              <Heart size={48} fill="currentColor" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-serif italic">Você ficou.</h2>
              <p className="text-brand-ink/60">Você passou por um momento difícil... e mesmo assim ficou aqui. Isso já diz muito sobre sua força.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={() => navigate('/home')}>Salvar reflexão e voltar</Button>
              <button onClick={() => navigate('/home')} className="text-sm text-brand-ink/40 underline">Voltar depois</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream p-6 flex flex-col">
      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
      
      <header className="flex justify-between items-center mb-12">
        <button onClick={() => navigate('/home')} className="text-brand-olive/60">
          <ArrowLeft size={24} />
        </button>
        <div className="text-[10px] uppercase tracking-widest text-brand-sage font-bold">Jornada de Acolhimento</div>
        <div className="w-6" />
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const ChatIARAPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Eu estou aqui... sinta o peso do seu corpo... Como você está se sentindo agora?', sender: 'iara', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [pastSessions] = useState([
    { id: '1', date: new Date(Date.now() - 86400000), preview: 'Sessão sobre ansiedade no trabalho', duration: '15 min' },
    { id: '2', date: new Date(Date.now() - 86400000 * 3), preview: 'Exercício de respiração guiada', duration: '5 min' },
    { id: '3', date: new Date(Date.now() - 86400000 * 7), preview: 'Conversa sobre autoestima', duration: '22 min' }
  ]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Stop audio if voice is disabled
  useEffect(() => {
    if (!isVoiceEnabled && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [isVoiceEnabled]);

  // Play first message on mount
  useEffect(() => {
    const playFirst = async () => {
      if (isVoiceEnabled && messages.length === 1 && messages[0].sender === 'iara') {
        const audio = await generateSpeech(messages[0].text);
        if (audio) playAudio(audio);
      }
    };
    playFirst();
  }, []);

  const playAudio = (base64Data: string) => {
    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (!isVoiceEnabled) return;

      const audioSrc = `data:audio/mp3;base64,${base64Data}`;
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      
      audio.play().catch(err => {
        console.error("Erro ao reproduzir áudio:", err);
        // Tentar como WAV se MP3 falhar
        const wavSrc = `data:audio/wav;base64,${base64Data}`;
        const wavAudio = new Audio(wavSrc);
        audioRef.current = wavAudio;
        wavAudio.play().catch(e => console.error("Falha total na reprodução:", e));
      });

      audio.onended = () => {
        audioRef.current = null;
      };
    } catch (e) {
      console.error("Erro na função playAudio:", e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const base64Audio = await blobToBase64(audioBlob);
        handleSend(undefined, { data: base64Audio, mimeType: 'audio/webm' }, audioUrl);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Reset timer
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async (textOverride?: string, audioData?: { data: string, mimeType: string }, audioUrl?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() && !audioData) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: messageText || "[Áudio enviado]",
      sender: 'user',
      timestamp: new Date(),
      audioUrl
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: (m.sender === 'user' ? 'user' : 'model') as "user" | "model",
      parts: [{ text: m.text }]
    }));

    const { text, risk } = await getIARAResponse(messageText, history, audioData);
    
    if (risk === 'alto') {
      setShowEmergency(true);
    }

    // Check for keywords to trigger breathing
    const triggers = ['ansioso', 'ansiedade', 'pânico', 'medo', 'respirar', 'ar', 'nervoso', 'crise'];
    if (messageText && triggers.some(t => messageText.toLowerCase().includes(t))) {
      setShowBreathing(true);
    }

    const iaraMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: text || 'Estou aqui com você. Respire fundo.',
      sender: 'iara',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, iaraMsg]);
    setIsTyping(false);

    // Gerar e tocar voz se habilitado
    if (isVoiceEnabled && text) {
      const audioBase64 = await generateSpeech(text);
      if (audioBase64) {
        playAudio(audioBase64);
      }
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-brand-bg overflow-hidden">
      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
      
      <header className="sticky top-0 z-40 p-4 bg-brand-bg/80 backdrop-blur-xl border-b border-brand-text/5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-brand-green/20 p-2 rounded-2xl text-brand-green">
            <Wind size={24} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold">IARA</h2>
            <p className="text-[9px] uppercase tracking-widest text-brand-green font-bold">Voz Interior</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "p-2 rounded-full transition-all",
                showHistory ? "bg-brand-indigo/20 text-brand-indigo" : "bg-brand-slate text-brand-text/40"
              )}
            >
              <History size={18} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-text/40">Voz</span>
            <button 
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={cn(
                "p-2 rounded-full transition-all",
                isVoiceEnabled ? "bg-brand-green/20 text-brand-green" : "bg-brand-slate text-brand-text/40"
              )}
            >
              {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
          <button 
            onClick={() => setShowEmergency(true)}
            className="bg-brand-red/10 text-brand-red px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-red/20"
          >
            S.O.S
          </button>
          <button onClick={() => navigate('/home')} className="text-brand-text/40 hover:text-brand-text p-2">
            <ArrowLeft size={24} />
          </button>
        </div>
      </header>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-dark">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold">Histórico de Conversas</h2>
            <p className="text-sm text-brand-text/60">Revisite suas sessões anteriores com a IARA.</p>
          </div>
          
          <div className="space-y-4">
            {pastSessions.map(session => (
              <div key={session.id} className="glass-card p-5 rounded-2xl flex flex-col gap-3 cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-brand-green">
                    <MessageCircle size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">{format(session.date, "dd MMM yyyy", { locale: ptBR })}</span>
                  </div>
                  <span className="text-xs text-brand-text/40">{session.duration}</span>
                </div>
                <p className="text-sm font-medium">{session.preview}</p>
                <div className="flex justify-end">
                  <button className="text-xs text-brand-indigo font-bold uppercase tracking-widest flex items-center gap-1">
                    Ler transcrição <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
            {/* Breathing Pulse Indicator */}
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 rounded-full bg-brand-green/20 flex items-center justify-center animate-pulse-slow">
                <div className="w-8 h-8 rounded-full bg-brand-green/40 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-brand-green" />
                </div>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-brand-green font-bold mt-2 opacity-60">Respire com o pulso</p>
            </div>

            {messages.map((m) => (
              <div key={m.id} className={cn(
                'flex flex-col max-w-[80%]',
                m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              )}>
                <div className={cn(
                  'p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-lg relative group',
                  m.sender === 'user' 
                    ? 'bg-brand-green text-white rounded-tr-none' 
                    : 'bg-brand-slate text-brand-text rounded-tl-none border border-white/5'
                )}>
                  {m.audioUrl ? (
                    <div className="flex flex-col gap-2">
                      <audio src={m.audioUrl} controls className="h-8 max-w-full" />
                      {m.text !== "[Áudio enviado]" && <span>{m.text}</span>}
                    </div>
                  ) : (
                    m.text
                  )}
                  {m.sender === 'iara' && (
                    <button 
                      onClick={async () => {
                        const audio = await generateSpeech(m.text);
                        if (audio) playAudio(audio);
                      }}
                      className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 bg-brand-slate rounded-full text-brand-green opacity-0 group-hover:opacity-100 transition-opacity border border-white/5"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-brand-text/30 mt-2 font-bold uppercase tracking-widest">
                  {format(m.timestamp, 'HH:mm')}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-brand-green/60 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                IARA está presente
              </div>
            )}
            
            {showBreathing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 rounded-[2.5rem] border-brand-green/30 border-2"
              >
                <BreathingExercise onComplete={() => setShowBreathing(false)} />
              </motion.div>
            )}
            
            <div ref={scrollRef} />
          </div>

          <div className="p-4 bg-brand-bg/80 backdrop-blur-xl border-t border-brand-text/5">
            <div className="flex flex-col gap-4 max-w-md mx-auto">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button 
                  onClick={() => navigate('/sensorial')}
                  className="whitespace-nowrap bg-brand-green/10 text-brand-green px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-green/20"
                >
                  Ativação Sensorial
                </button>
                <button 
                  onClick={() => navigate('/terapeutas')}
                  className="whitespace-nowrap bg-brand-slate text-brand-text/60 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5"
                >
                  Falar com Humano
                </button>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isRecording ? `Gravando... ${formatTime(recordingTime)}` : "Fale comigo..."}
                    disabled={isRecording}
                    className="w-full bg-brand-slate border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-brand-text placeholder:text-brand-text/20 disabled:opacity-50"
                  />
                  {isRecording && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-brand-red rounded-full animate-pulse" />
                      <span className="text-[10px] font-mono text-brand-red font-bold">{formatTime(recordingTime)}</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn(
                    "p-4 rounded-2xl transition-all shadow-lg",
                    isRecording ? "bg-brand-red text-white animate-pulse" : "bg-brand-slate text-brand-green border border-white/10"
                  )}
                >
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
                </button>
                <button 
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !isRecording) || isTyping}
                  className="bg-brand-green text-white p-4 rounded-2xl disabled:opacity-50 transition-all active:scale-90 shadow-lg shadow-brand-green/20"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import { BookingModal } from './components/BookingModal';

const TerapeutasPage = () => {
  const [filter, setFilter] = useState<'todos' | 'online' | 'presencial'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [therapists, setTherapists] = useState<UserProfile[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<UserProfile | null>(null);
  const [quickBookData, setQuickBookData] = useState<{ day: string; slot: string } | null>(null);
  const [patientProfile, setPatientProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    const init = async () => {
      const t = await userService.getTherapists();
      setTherapists(t);
      
      if (auth.currentUser) {
        const p = await getUserProfile(auth.currentUser.uid);
        setPatientProfile(p);
        if (p?.favoritos) {
          setFavorites(p.favoritos);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleToggleFavorite = async (therapistId: string) => {
    if (!auth.currentUser) return;
    try {
      const newFavs = await userService.toggleFavorite(auth.currentUser.uid, therapistId, favorites);
      setFavorites(newFavs);
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    }
  };

  const handleAddReview = async (therapistId: string) => {
    if (!auth.currentUser || !patientProfile) return;
    try {
      const therapist = therapists.find(t => t.uid === therapistId);
      if (!therapist) return;
      
      const newReview = {
        userId: auth.currentUser.uid,
        userName: patientProfile.nome,
        nota: reviewRating,
        comentario: reviewText,
        data: new Date().toISOString()
      };
      
      const { newReviews, averageRating } = await userService.addReview(therapistId, therapist.avaliacoes || [], newReview);
      
      setTherapists(prev => prev.map(t => 
        t.uid === therapistId 
          ? { ...t, avaliacoes: newReviews, rating: averageRating } 
          : t
      ));
      
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      console.error("Erro ao adicionar avaliação:", error);
    }
  };

  // Calculate patient mental health status based on recent mood history
  // For simplicity, we'll just use a mock status or derive it from local storage mood history
  const moodHistory = userService.getMoodHistory();
  const recentMood = moodHistory.length > 0 ? moodHistory[moodHistory.length - 1].value : 5;
  let patientStatus = { label: 'Estável', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: <Smile size={12} /> };
  if (recentMood <= 3) {
    patientStatus = { label: 'Alerta', color: 'text-red-400', bg: 'bg-red-400/10', icon: <ShieldAlert size={12} /> };
  } else if (recentMood >= 8) {
    patientStatus = { label: 'Ótimo', color: 'text-brand-green', bg: 'bg-brand-green/10', icon: <Sun size={12} /> };
  }

  const filteredTherapists = therapists.filter(t => {
    // Filter by type (online/presencial) - mock logic for now
    if (filter === 'online' && false) return false; 
    if (filter === 'presencial' && false) return false; 
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = t.nome?.toLowerCase().includes(term);
      const matchSpec = t.especialidades?.some(e => e.toLowerCase().includes(term));
      const matchPrice = t.preco?.toString().includes(term);
      
      if (!matchName && !matchSpec && !matchPrice) return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-dark">
        <Loader2 className="w-12 h-12 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pb-24 space-y-8 bg-brand-dark min-h-screen"
    >
      <header className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold">Rede de Apoio</h1>
          <p className="text-brand-text/40 text-sm">Escolha o profissional que mais ressoa com você agora.</p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, especialidade ou preço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-slate border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-brand-text placeholder:text-brand-text/40"
          />
        </div>

        {/* Uber-style Filter Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => setFilter('todos')}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'todos' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-brand-slate text-brand-text/40 border border-white/5'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('online')}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'online' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-brand-slate text-brand-text/40 border border-white/5'}`}
          >
            Online Agora
          </button>
          <button 
            onClick={() => setFilter('presencial')}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'presencial' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-brand-slate text-brand-text/40 border border-white/5'}`}
          >
            Presencial
          </button>
        </div>
      </header>

      {filteredTherapists.length > 0 && (
        <div className="bg-brand-green/10 border border-brand-green/20 p-4 rounded-2xl flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-brand-green flex items-center gap-2">
              <Zap size={16} /> Agendamento Rápido
            </h3>
            <p className="text-xs text-brand-text/60">Disponível agora: {filteredTherapists[0].nome}</p>
          </div>
          <Button 
            onClick={() => {
              const therapist = filteredTherapists[0];
              if (therapist.disponibilidade && therapist.disponibilidade.length > 0) {
                const firstDay = therapist.disponibilidade[0];
                if (firstDay.slots && firstDay.slots.length > 0) {
                  setQuickBookData({ day: firstDay.day, slot: firstDay.slots[0] });
                }
              }
              setSelectedTherapist(therapist);
            }}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
          >
            Agendar
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {filteredTherapists.map(t => (
          <div key={t.uid} className="glass-card p-6 rounded-[2.5rem] flex flex-col gap-6 border-none shadow-2xl relative">
            <button 
              onClick={() => handleToggleFavorite(t.uid)}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-brand-dark/50 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Heart 
                size={20} 
                className={favorites.includes(t.uid) ? "fill-brand-red text-brand-red" : "text-brand-text/40"} 
              />
            </button>
            <div className="flex gap-5 items-center">
              <div className="relative">
                <img src={t.fotoUrl || `https://picsum.photos/seed/${t.uid}/200`} alt={t.nome} className="w-24 h-24 rounded-[2rem] object-cover shadow-xl" referrerPolicy="no-referrer" />
                <div className="absolute -bottom-1 -right-1 bg-brand-green text-white text-[8px] font-bold px-2 py-0.5 rounded-full border-2 border-brand-slate uppercase tracking-tighter">
                  Online
                </div>
              </div>
              <div className="flex-1 space-y-2 pr-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-xl font-bold leading-tight">{t.nome}</h3>
                    <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest mt-1">
                      {t.especialidades?.join(', ') || 'Terapia Geral'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                    <Star size={10} fill="currentColor" />
                    {t.rating?.toFixed(1) || '5.0'} ({t.avaliacoes?.length || 0})
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${patientStatus.bg} ${patientStatus.color}`}>
                    {patientStatus.icon}
                    <span>Seu Status: {patientStatus.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <p className="text-sm font-serif font-bold text-brand-green">R$ {t.preco || '100'}</p>
                  <span className="text-[10px] text-brand-text/30 italic">Sessão de 50min</span>
                </div>
              </div>
            </div>
            
            <div className="bg-brand-dark/50 p-4 rounded-2xl border border-white/5">
              <p className="text-xs text-brand-text/60 leading-relaxed italic">
                "{t.biografia || 'Acredito que cada pessoa carrega em si a semente da própria cura. Meu papel é apenas ajudar a regar.'}"
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setSelectedTherapist(t)}
                className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest"
              >
                Agendar Agora
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setExpandedReviews(expandedReviews === t.uid ? null : t.uid)}
                className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest"
              >
                Avaliações
              </Button>
            </div>

            {/* Avaliações Section */}
            <AnimatePresence>
              {expandedReviews === t.uid && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/5 pt-4 space-y-4"
                >
                  <h4 className="text-sm font-bold text-brand-text">Avaliações dos Pacientes</h4>
                  
                  {/* Lista de Avaliações */}
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {t.avaliacoes && t.avaliacoes.length > 0 ? (
                      t.avaliacoes.map((av, idx) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-brand-text/80">{av.userName || 'Paciente Anônimo'}</span>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < av.nota ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </div>
                          {av.comentario && <p className="text-xs text-brand-text/60 italic">"{av.comentario}"</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-brand-text/40 italic">Nenhuma avaliação ainda. Seja o primeiro!</p>
                    )}
                  </div>

                  {/* Form de Nova Avaliação */}
                  <div className="bg-brand-dark/30 p-4 rounded-2xl space-y-3 border border-white/5">
                    <p className="text-xs font-bold text-brand-text/60 uppercase tracking-widest">Deixe sua avaliação</p>
                    <div className="flex gap-2 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)} className="hover:scale-110 transition-transform">
                          <Star size={20} fill={star <= reviewRating ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Como foi sua experiência? (opcional)"
                      className="w-full bg-brand-slate border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-brand-text placeholder:text-brand-text/40 resize-none h-20"
                    />
                    <Button 
                      onClick={() => handleAddReview(t.uid)}
                      className="w-full py-2 text-[10px] font-bold uppercase tracking-widest"
                    >
                      Enviar Avaliação
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {filteredTherapists.length === 0 && (
          <div className="text-center py-20 text-brand-text/40 italic">
            Nenhum terapeuta encontrado.
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTherapist && (
          <BookingModal 
            therapist={selectedTherapist} 
            patientProfile={patientProfile}
            initialDay={quickBookData?.day}
            initialSlot={quickBookData?.slot}
            onClose={() => {
              setSelectedTherapist(null);
              setQuickBookData(null);
            }} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DiarioPage = () => {
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [moodFilter, setMoodFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');

  useEffect(() => {
    setHistory(userService.getMoodHistory());
  }, []);

  const handleSave = () => {
    userService.saveMood(mood, note);
    setHistory(userService.getMoodHistory());
    setSaved(true);
    setNote('');
    setTimeout(() => setSaved(false), 3000);
  };

  const chartData = history.slice(-7).map(h => ({
    date: format(h.timestamp, 'dd/MM'),
    valor: h.value
  }));

  const getMoodIcon = (val: number) => {
    if (val >= 8) return <Smile className="text-brand-green" size={56} />;
    if (val >= 4) return <Meh className="text-brand-indigo" size={56} />;
    return <Frown className="text-brand-red" size={56} />;
  };

  const filteredHistory = history.filter(h => {
    if (moodFilter === 'positive') return h.value >= 8;
    if (moodFilter === 'neutral') return h.value >= 4 && h.value <= 7;
    if (moodFilter === 'negative') return h.value <= 3;
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pb-24 space-y-10 bg-brand-dark min-h-screen"
    >
      <header className="space-y-1">
        <h1 className="text-3xl font-serif font-bold">Diário Emocional</h1>
        <p className="text-brand-text/40 text-sm">Acompanhe sua jornada e padrões.</p>
      </header>

      {/* Mood Input */}
      <section className="glass-card p-8 rounded-[2.5rem] space-y-8 shadow-2xl border-none">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-serif font-bold">Como você está hoje?</h3>
          <div className="flex justify-center py-4">
            <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
              {getMoodIcon(mood)}
            </div>
          </div>
          <p className="text-4xl font-serif font-bold text-brand-green">{mood}/10</p>
        </div>

        <input 
          type="range" 
          min="0" 
          max="10" 
          value={mood}
          onChange={(e) => setMood(parseInt(e.target.value))}
          className="w-full h-3 bg-brand-slate rounded-full appearance-none cursor-pointer accent-brand-green"
        />

        <textarea 
          placeholder="Escreva o que precisa sair... (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-brand-dark border border-white/10 rounded-2xl p-6 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-brand-text placeholder:text-brand-text/20"
        />

        <Button className="w-full py-4 text-[10px] font-bold uppercase tracking-widest" onClick={handleSave} disabled={saved}>
          {saved ? 'Salvo com sucesso!' : 'Salvar Registro'}
        </Button>
      </section>

      {/* Progress Chart */}
      {chartData.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-serif font-bold flex items-center gap-3">
            <TrendingUp size={24} className="text-brand-green" />
            Sua Evolução
          </h3>
          <div className="glass-card p-6 rounded-[2.5rem] h-72 border-none shadow-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#E2E8F0' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#22C55E" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#22C55E', strokeWidth: 0 }} 
                  activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Recent History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif">Registros Recentes</h3>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => setMoodFilter('all')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${moodFilter === 'all' ? 'bg-brand-green text-white' : 'bg-brand-slate text-brand-text/40'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setMoodFilter('positive')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${moodFilter === 'positive' ? 'bg-brand-green text-white' : 'bg-brand-slate text-brand-text/40'}`}
          >
            Positivos (8-10)
          </button>
          <button 
            onClick={() => setMoodFilter('neutral')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${moodFilter === 'neutral' ? 'bg-brand-indigo text-white' : 'bg-brand-slate text-brand-text/40'}`}
          >
            Neutros (4-7)
          </button>
          <button 
            onClick={() => setMoodFilter('negative')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${moodFilter === 'negative' ? 'bg-brand-red text-white' : 'bg-brand-slate text-brand-text/40'}`}
          >
            Difíceis (0-3)
          </button>
        </div>

        <div className="space-y-3">
          {filteredHistory.slice().reverse().slice(0, 5).map(h => (
            <div key={h.id} className="glass-card p-4 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-xs text-brand-ink/40">{format(h.timestamp, "d 'de' MMMM", { locale: ptBR })}</p>
                <p className="text-sm font-medium line-clamp-1">{h.note || 'Sem anotações'}</p>
              </div>
              <div className="text-lg font-serif italic text-brand-olive">{h.value}/10</div>
            </div>
          ))}
          {filteredHistory.length === 0 && (
            <p className="text-sm text-brand-text/40 italic py-4 text-center">Nenhum registro encontrado para este filtro.</p>
          )}
        </div>
      </section>
    </motion.div>
  );
};

const PerfilPage = ({ userProfile }: { userProfile: UserProfile | null }) => {
  const navigate = useNavigate();
  const [favoriteTherapists, setFavoriteTherapists] = useState<UserProfile[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (userProfile?.favoritos && userProfile.favoritos.length > 0) {
        const allTherapists = await userService.getTherapists();
        const favs = allTherapists.filter(t => userProfile.favoritos?.includes(t.uid));
        setFavoriteTherapists(favs);
      } else {
        setFavoriteTherapists([]);
      }
    };
    fetchFavorites();
    setMoodHistory(userService.getMoodHistory());
  }, [userProfile?.favoritos]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Process data for the chart (last 7 days)
  const chartData = moodHistory
    .slice(-7)
    .map(entry => ({
      date: format(entry.timestamp, 'dd/MM'),
      value: entry.value
    }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pb-24 space-y-8 min-h-screen bg-[#0F172A] text-slate-100"
    >
      <header className="text-center space-y-4">
        <div className="w-24 h-24 bg-white/5 rounded-full mx-auto flex items-center justify-center text-brand-green border-2 border-white/10 shadow-inner">
          <User size={48} />
        </div>
        <div>
          <h1 className="text-3xl font-serif text-white">{userProfile?.nome || 'Usuário'}</h1>
          <p className="text-slate-400 text-sm">Membro desde {userProfile ? format(new Date(userProfile.createdAt), 'MMMM yyyy', { locale: ptBR }) : 'Março 2026'}</p>
        </div>
      </header>

      {/* Strategic Dashboard (Mood History Chart) */}
      <section className="space-y-4">
        <h3 className="text-xl font-serif flex items-center gap-2 text-slate-200">
          <TrendingUp size={20} className="text-brand-green" />
          Impacto da sua Jornada
        </h3>
        
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-[2rem] space-y-6 shadow-2xl">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                  dy={10}
                />
                <YAxis 
                  hide 
                  domain={[0, 10]} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#22C55E', fontWeight: 'bold' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22C55E" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#22C55E', strokeWidth: 2, stroke: '#0F172A' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 p-4 rounded-3xl text-center space-y-1 border border-white/5">
              <p className="text-2xl font-serif font-bold text-brand-green">12</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Crises Reguladas</p>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-3xl text-center space-y-1 border border-white/5">
              <p className="text-2xl font-serif font-bold text-brand-green">45m</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Tempo de Calma</p>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-3xl text-center space-y-1 border border-white/5">
              <p className="text-2xl font-serif font-bold text-brand-green">8</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Reflexões Salvas</p>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-3xl text-center space-y-1 border border-white/5">
              <p className="text-2xl font-serif font-bold text-brand-green">92%</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Taxa de Resgate</p>
            </div>
          </div>
        </div>
      </section>

      {/* B2B / B2G Pitch Section */}
      <section className="bg-brand-green/5 border-brand-green/20 border p-6 rounded-[2rem] space-y-4">
        <div className="flex items-center gap-2 text-brand-green">
          <Users size={20} />
          <h3 className="font-serif text-lg">IARA para Organizações</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Leve o Pronto Socorro Emocional para sua empresa ou cidade. Reduza o burnout e ofereça acolhimento imediato com tecnologia PCH.
        </p>
        <Button variant="secondary" className="w-full text-xs py-2 border-brand-green/30 text-brand-green hover:bg-brand-green/10">
          Solicitar Proposta B2B/B2G
        </Button>
      </section>

      {/* Favorite Therapists Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-serif flex items-center gap-2 text-slate-200">
          <Heart size={20} className="text-brand-green" />
          Terapeutas Favoritos
        </h3>
        {favoriteTherapists.length > 0 ? (
          <div className="space-y-3">
            {favoriteTherapists.map(t => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={t.uid} 
                onClick={() => navigate(`/terapeutas`)}
                className="bg-slate-800/40 backdrop-blur-xl p-4 rounded-[1.5rem] flex items-center gap-4 cursor-pointer hover:bg-slate-800/60 transition-all border border-white/5"
              >
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900">
                  <img 
                    src={t.fotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.uid}`} 
                    alt={t.nome} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold font-serif text-white">{t.nome}</h4>
                  <p className="text-xs text-slate-400">{t.especialidades?.[0] || 'Terapeuta'}</p>
                </div>
                <div className="text-brand-green">
                  <Heart size={20} fill="currentColor" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/40 p-6 rounded-[2rem] text-center space-y-2 border border-white/5">
            <p className="text-slate-400 text-sm">Você ainda não tem terapeutas favoritos.</p>
            <Button variant="secondary" onClick={() => navigate('/terapeutas')} className="text-xs py-2">
              Encontrar Terapeutas
            </Button>
          </div>
        )}
      </section>

      <div className="space-y-3">
        <Button variant="secondary" className="w-full justify-start px-6 bg-slate-800/40 border-slate-700 text-slate-200" onClick={() => navigate('/home')}>
          <Heart size={18} className="mr-2" /> Configurações de Privacidade
        </Button>
        <Button variant="secondary" className="w-full justify-start px-6 bg-slate-800/40 border-slate-700 text-slate-200" onClick={() => navigate('/home')}>
          <ShieldAlert size={18} className="mr-2" /> Termos e Ética PCH
        </Button>
        <Button variant="ghost" className="w-full text-red-400 hover:bg-red-400/10" onClick={handleLogout}>
          Sair da Conta
        </Button>
      </div>
    </motion.div>
  );
};

// --- Sensorial Activation Page ---

const SensorialPage = () => {
  const navigate = useNavigate();
  const [fase, setFase] = useState(0);
  const etapas = [
    "Feche os olhos por um instante...",
    "Sinta seus pés tocando o chão...",
    "Perceba sua respiração entrando devagar...",
    "Agora imagine um lugar seguro...",
    "Fique aqui por alguns segundos...",
    "Sinta a calma se espalhando...",
    "Você está em segurança."
  ];

  const playAudio = (base64Data: string) => {
    try {
      const audioSrc = `data:audio/mp3;base64,${base64Data}`;
      const audio = new Audio(audioSrc);
      audio.play().catch(err => console.error("Erro ao reproduzir áudio sensorial:", err));
    } catch (e) {
      console.error("Erro na função playAudio sensorial:", e);
    }
  };

  useEffect(() => {
    const speakStep = async () => {
      const audio = await generateSpeech(etapas[fase]);
      if (audio) playAudio(audio);
    };
    speakStep();

    const intervalo = setInterval(() => {
      setFase((prev) => (prev < etapas.length - 1 ? prev + 1 : prev));
    }, 5000); // 5 seconds per step for better pacing
    return () => clearInterval(intervalo);
  }, [fase]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-[100dvh] bg-brand-dark text-brand-text p-8 items-center justify-center text-center space-y-16"
    >
      <div className="space-y-4">
        <div className="w-24 h-24 rounded-[2.5rem] bg-brand-green/20 flex items-center justify-center text-brand-green mx-auto shadow-2xl shadow-brand-green/10 animate-pulse-slow">
          <Wind size={48} />
        </div>
        <h2 className="font-serif text-2xl font-bold uppercase tracking-widest text-brand-green opacity-60">Ativação Sensorial</h2>
      </div>

      <AnimatePresence mode="wait">
        <motion.p 
          key={fase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-2xl font-serif font-bold leading-relaxed max-w-xs"
        >
          {etapas[fase]}
        </motion.p>
      </AnimatePresence>

      <div className="flex gap-3">
        {etapas.map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-1.5 rounded-full transition-all duration-1000",
              i <= fase ? "w-8 bg-brand-green shadow-[0_0_10px_#22C55E]" : "w-2 bg-white/10"
            )} 
          />
        ))}
      </div>

      {fase === etapas.length - 1 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="w-full max-w-xs"
        >
          <Button className="w-full py-5 text-[10px] font-bold uppercase tracking-widest" onClick={() => navigate('/chat')}>
            Voltar para IARA
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

// --- Main App ---

const DirectChatPage = () => {
  const { receiverId } = useParams<{ receiverId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const [receiverProfile, setReceiverProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const user = getAuthenticatedUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const profile = await getUserProfile(user.uid);
      setCurrentUser(profile);

      if (receiverId) {
        const rProfile = await getUserProfile(receiverId);
        setReceiverProfile(rProfile);

        const unsub = chatService.listenMessages(user.uid, receiverId, (msgs) => {
          setMessages(msgs);
        });
        return () => unsub();
      }
    };
    init();
  }, [receiverId, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentUser || !receiverId) return;

    const text = input;
    setInput('');
    await chatService.sendMessage(currentUser.uid, receiverId, text);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-brand-bg overflow-hidden">
      <header className="sticky top-0 z-40 p-4 bg-brand-bg/80 backdrop-blur-xl border-b border-brand-text/5 flex items-center gap-4 shadow-lg">
        <button onClick={() => navigate(-1)} className="text-brand-text/40 hover:text-brand-text p-2">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-slate">
            <img 
              src={receiverProfile?.fotoUrl || `https://picsum.photos/seed/${receiverId}/200`} 
              alt={receiverProfile?.nome} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="font-bold text-brand-text">{receiverProfile?.nome || 'Carregando...'}</h2>
            <p className="text-[10px] uppercase tracking-widest text-brand-green font-bold">Online</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={cn(
            'flex flex-col max-w-[80%]',
            m.senderId === currentUser?.uid ? 'ml-auto items-end' : 'mr-auto items-start'
          )}>
            <div className={cn(
              'p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-lg',
              m.senderId === currentUser?.uid 
                ? 'bg-brand-green text-white rounded-tr-none' 
                : 'bg-brand-slate text-brand-text rounded-tl-none border border-white/5'
            )}>
              {m.text}
            </div>
            <span className="text-[9px] text-brand-text/30 mt-2 font-bold uppercase tracking-widest">
              {format(new Date(m.timestamp), 'HH:mm')}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-brand-bg/80 backdrop-blur-xl border-t border-brand-text/5">
        <div className="flex gap-3 items-center max-w-md mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escreva uma mensagem..."
            className="flex-1 bg-brand-slate border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-brand-text placeholder:text-brand-text/20"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-brand-green text-white p-4 rounded-2xl shadow-lg shadow-brand-green/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    }
    return 'dark';
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (!loading && userProfile && (location.pathname === '/login' || location.pathname === '/')) {
      navigate('/dashboard');
    }
  }, [userProfile, loading, location.pathname, navigate]);

  useEffect(() => {
    // Timeout para evitar ficar preso no loading se o Firebase estiver offline
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Auth timeout reached. Bypassing loading.");
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      try {
        const currentUser = user || getAuthenticatedUser();
        if (currentUser) {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (e) {
        console.error("Auth state change error:", e);
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-bold text-brand-text mb-2">Iniciando Rede de Apoio...</h2>
        <p className="text-brand-text/40 text-sm max-w-xs mb-8">
          Estamos preparando seu ambiente seguro e acolhedor.
        </p>
      </div>
    );
  }

  const showNavbar = 
    userProfile?.tipo === 'usuario' && 
    !['/chat', '/sensorial', '/guided-flow', '/login', '/dashboard'].includes(location.pathname);

  return (
    <div className={cn(
      "min-h-[100dvh] bg-brand-bg relative overflow-hidden",
      userProfile?.tipo === 'usuario' ? "max-w-md mx-auto" : "max-w-none"
    )}>
      {/* Global Theme Toggle */}
      {!['/login'].includes(location.pathname) && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
          {isMockMode() && (
            <div className="px-3 py-1 bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
              Modo Demo
            </div>
          )}
          <button 
            onClick={toggleTheme}
            className="p-3 bg-brand-slate/80 backdrop-blur-xl border border-brand-text/10 rounded-2xl text-brand-green shadow-lg active:scale-90 transition-all"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="h-full"
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Paciente Routes */}
            <Route path="/home" element={<HomePage userProfile={userProfile} />} />
            <Route path="/guided-flow" element={<GuidedFlowPage />} />
            <Route path="/chat" element={<ChatIARAPage />} />
            <Route path="/direct-chat/:receiverId" element={<DirectChatPage />} />
            <Route path="/terapeutas" element={<TerapeutasPage />} />
            <Route path="/diario" element={<DiarioPage />} />
            <Route path="/perfil" element={<PerfilPage userProfile={userProfile} />} />
            <Route path="/sensorial" element={<SensorialPage />} />
            
            {/* Specialized Panels */}
            <Route path="/terapeuta-panel" element={<TerapeutaPage />} />
            <Route path="/empresa-panel" element={<EmpresaPage />} />
            <Route path="/prefeitura-panel" element={<PrefeituraPage />} />
            
            {/* Fallback */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      
      {showNavbar && (
        <Navbar />
      )}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
