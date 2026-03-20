import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Users, 
  BookOpen, 
  User, 
  Send, 
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
  ArrowRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getIARAResponse } from './services/geminiService';
import { userService } from './services/userService';
import { AppRoute, Message, MoodEntry, Therapist } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) => {
  const variants = {
    primary: 'bg-brand-olive text-white hover:bg-brand-olive/90',
    secondary: 'bg-white text-brand-olive border border-brand-olive/20 hover:bg-brand-cream',
    ghost: 'bg-transparent text-brand-olive hover:bg-brand-olive/10'
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

const Navbar = ({ activeRoute, setRoute }: { activeRoute: AppRoute, setRoute: (r: AppRoute) => void }) => {
  const navItems: { id: AppRoute, icon: any, label: string }[] = [
    { id: 'home', icon: Heart, label: 'Início' },
    { id: 'chat', icon: MessageCircle, label: 'IARA' },
    { id: 'terapeutas', icon: Users, label: 'Terapeutas' },
    { id: 'diario', icon: BookOpen, label: 'Diário' },
    { id: 'perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-brand-olive/10 px-4 py-2 pb-6 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setRoute(item.id)}
            className={cn(
              'flex flex-col items-center gap-1 transition-colors',
              activeRoute === item.id ? 'text-brand-olive' : 'text-brand-olive/40'
            )}
          >
            <item.icon size={24} strokeWidth={activeRoute === item.id ? 2.5 : 2} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
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

const HomePage = ({ setRoute }: { setRoute: (r: AppRoute) => void }) => {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isBreathing, setIsBreathing] = useState(false);
  
  useEffect(() => {
    setMoodHistory(userService.getMoodHistory());
  }, []);

  const lastMood = moodHistory[moodHistory.length - 1];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pb-24 space-y-8"
    >
      <header className="space-y-2">
        <h1 className="text-4xl font-serif italic text-brand-olive">Olá, como você está?</h1>
        <p className="text-brand-ink/60">Seu espaço seguro para respirar e se encontrar.</p>
      </header>

      {/* Breathing Exercise Overlay */}
      <AnimatePresence>
        {isBreathing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-olive flex flex-col items-center justify-center p-8 text-white"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-48 h-48 rounded-full bg-white/20 flex items-center justify-center"
            >
              <div className="w-32 h-32 rounded-full bg-white/30" />
            </motion.div>
            
            <motion.div 
              key={Math.floor(Date.now() / 4000) % 2}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 text-center space-y-4"
            >
              <h2 className="text-3xl font-serif italic">Inspire...</h2>
              <p className="text-white/60">Siga o movimento do círculo</p>
            </motion.div>

            <button 
              onClick={() => setIsBreathing(false)}
              className="absolute top-8 right-8 text-white/60 hover:text-white"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Action: IARA */}
      <section 
        className="glass-card p-6 rounded-3xl hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="bg-brand-sage/20 p-3 rounded-2xl text-brand-sage">
            <Wind size={32} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-sage">Pronto Socorro Emocional</span>
        </div>
        <h2 className="text-2xl mb-2">Precisa de ajuda agora?</h2>
        <p className="text-brand-ink/60 mb-4">A IARA está pronta para te acolher e ajudar a regular suas emoções.</p>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => setRoute('guided-flow')}
            className="w-full bg-red-500 hover:bg-red-600 text-white border-none"
          >
            Preciso de ajuda agora
          </Button>
          <Button 
            variant="secondary"
            onClick={() => setRoute('chat')}
            className="w-full"
          >
            Quero apenas conversar
          </Button>
        </div>
      </section>

      {/* Breathing Tool */}
      <section 
        onClick={() => setIsBreathing(true)}
        className="bg-brand-olive text-white p-6 rounded-3xl cursor-pointer hover:opacity-90 transition-all flex items-center justify-between"
      >
        <div className="space-y-1">
          <h3 className="text-xl font-serif italic">Pausa para Respirar</h3>
          <p className="text-white/70 text-sm">60 segundos de calma</p>
        </div>
        <div className="bg-white/20 p-3 rounded-full">
          <Wind size={24} />
        </div>
      </section>

      {/* Daily Check-in */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif">Check-in Diário</h3>
          <button onClick={() => setRoute('diario')} className="text-sm text-brand-olive font-medium">Ver histórico</button>
        </div>
        <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-brand-ink/60">Último registro</p>
            <p className="text-lg font-medium">
              {lastMood ? `Humor: ${lastMood.value}/10` : 'Nenhum registro hoje'}
            </p>
          </div>
          <Button variant="secondary" onClick={() => setRoute('diario')}>
            {lastMood ? 'Atualizar' : 'Registrar'}
          </Button>
        </div>
      </section>

      {/* Featured Therapists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif">Terapeutas Online</h3>
          <button onClick={() => setRoute('terapeutas')} className="text-sm text-brand-olive font-medium">Ver todos</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {userService.getTherapists().filter(t => t.online).map(t => (
            <div key={t.id} className="min-w-[160px] glass-card p-4 rounded-2xl space-y-3">
              <img src={t.imageUrl} alt={t.name} className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-brand-sage/20" referrerPolicy="no-referrer" />
              <div className="text-center">
                <p className="font-medium text-sm line-clamp-1">{t.name}</p>
                <p className="text-[10px] text-brand-ink/40 uppercase tracking-tighter">{t.specialty}</p>
              </div>
              <Button variant="secondary" className="w-full py-2 text-xs" onClick={() => setRoute('terapeutas')}>Chamar</Button>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

const GuidedFlowPage = ({ setRoute }: { setRoute: (r: AppRoute) => void }) => {
  const [step, setStep] = useState<'triagem' | 'intensidade' | 'risco' | 'respiracao' | 'reflexao' | 'direcionamento' | 'final'>('triagem');
  const [emocao, setEmocao] = useState('');
  const [intensidade, setIntensidade] = useState(5);
  const [showEmergency, setShowEmergency] = useState(false);
  const [reflexao, setReflexao] = useState('');

  const emotions = [
    { id: 'ansiedade', label: 'Ansiedade', icon: <Wind size={20} /> },
    { id: 'tristeza', label: 'Tristeza', icon: <CloudRain size={20} /> },
    { id: 'medo', label: 'Medo', icon: <ShieldAlert size={20} /> },
    { id: 'raiva', label: 'Raiva', icon: <Zap size={20} /> },
  ];

  const renderStep = () => {
    switch (step) {
      case 'triagem':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif italic">Eu estou aqui com você...</h2>
              <p className="text-brand-ink/60">O que está mais forte agora?</p>
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
              <p className="text-brand-ink/60">De 0 a 10, qual a intensidade?</p>
            </div>
            <div className="space-y-6">
              <div className="text-5xl font-serif italic text-brand-olive">{intensidade}</div>
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
              <p className="text-brand-ink/60">Você pensou em se machucar?</p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { setShowEmergency(true); setStep('respiracao'); }}
                className="glass-card p-4 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
              >
                Sim
              </button>
              <button 
                onClick={() => setStep('respiracao')}
                className="glass-card p-4 rounded-2xl hover:bg-green-50 hover:text-green-600 transition-all"
              >
                Não
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
              <p className="text-brand-ink/60">Devagar, abrindo espaço dentro de você.</p>
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
                placeholder="Escreva aqui..."
                className="w-full bg-white border border-brand-olive/10 rounded-3xl p-6 text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-brand-olive/20"
              />
              <Button className="w-full" onClick={() => setStep('direcionamento')}>Enviar</Button>
            </div>
          </div>
        );
      case 'direcionamento':
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic">Qual o próximo passo?</h2>
              <p className="text-brand-ink/60">O que parece melhor para você agora?</p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setRoute('chat')}
                className="glass-card p-6 rounded-3xl flex items-center justify-between hover:bg-brand-olive hover:text-white transition-all group"
              >
                <div className="text-left">
                  <p className="font-medium">Continuar com IARA</p>
                  <p className="text-xs opacity-60">Acolhimento contínuo via chat</p>
                </div>
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => setRoute('terapeutas')}
                className="glass-card p-6 rounded-3xl flex items-center justify-between hover:bg-brand-olive hover:text-white transition-all group"
              >
                <div className="text-left">
                  <p className="font-medium">Falar com terapeuta</p>
                  <p className="text-xs opacity-60">Conexão humana especializada</p>
                </div>
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => setShowEmergency(true)}
                className="glass-card p-6 rounded-3xl flex items-center justify-between hover:bg-red-50 hover:text-red-600 transition-all group"
              >
                <div className="text-left">
                  <p className="font-medium">Buscar ajuda imediata</p>
                  <p className="text-xs opacity-60">Contatos de emergência (CVV/SAMU)</p>
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
              <p className="text-brand-ink/60">Isso importa mais do que você imagina. Estou orgulhosa de você.</p>
            </div>
            <Button className="w-full" onClick={() => setRoute('home')}>Voltar ao Início</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream p-6 flex flex-col">
      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
      
      <header className="flex justify-between items-center mb-12">
        <button onClick={() => setRoute('home')} className="text-brand-olive/60">
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

const ChatIARAPage = ({ setRoute }: { setRoute: (r: AppRoute) => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Olá, eu sou a IARA. Como você está se sentindo neste momento? Estou aqui para te ouvir.', sender: 'iara', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model' as const,
      parts: [{ text: m.text }]
    }));

    const { text, risk } = await getIARAResponse(input, history);
    
    if (risk === 'alto') {
      setShowEmergency(true);
    }

    // Check for keywords to trigger breathing
    const triggers = ['ansioso', 'ansiedade', 'pânico', 'medo', 'respirar', 'ar', 'nervoso', 'crise'];
    if (triggers.some(t => input.toLowerCase().includes(t))) {
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
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-brand-cream overflow-hidden">
      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
      
      <header className="sticky top-0 z-40 p-4 bg-white/90 backdrop-blur-md border-b border-brand-olive/10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-brand-sage/20 p-2 rounded-xl text-brand-sage">
            <Wind size={24} />
          </div>
          <div>
            <h2 className="font-serif text-xl">IARA</h2>
            <p className="text-[10px] uppercase tracking-widest text-brand-sage font-bold">Acolhimento IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowEmergency(true)}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-100"
          >
            S.O.S
          </button>
          <button onClick={() => setRoute('home')} className="text-brand-olive/60 hover:text-brand-olive p-2">
            <ArrowLeft size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={cn(
            'flex flex-col max-w-[85%]',
            m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
          )}>
            <div className={cn(
              'p-4 rounded-2xl text-sm leading-relaxed',
              m.sender === 'user' 
                ? 'bg-brand-olive text-white rounded-tr-none' 
                : 'bg-white text-brand-ink rounded-tl-none shadow-sm border border-brand-olive/5'
            )}>
              {m.text}
            </div>
            <span className="text-[10px] text-brand-ink/30 mt-1">
              {format(m.timestamp, 'HH:mm')}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-brand-ink/40 text-xs italic">
            <div className="animate-pulse">IARA está digitando...</div>
          </div>
        )}
        
        {showBreathing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-3xl border-brand-sage/30 border-2"
          >
            <BreathingExercise onComplete={() => setShowBreathing(false)} />
          </motion.div>
        )}
        
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-brand-olive/5">
        <div className="flex gap-2 max-w-md mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escreva o que está sentindo..."
            className="flex-1 bg-white border border-brand-olive/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-olive/20"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-brand-olive text-white p-3 rounded-full disabled:opacity-50 transition-all active:scale-90"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TerapeutasPage = () => {
  const therapists = userService.getTherapists();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pb-24 space-y-6"
    >
      <header className="space-y-1">
        <h1 className="text-3xl font-serif">Uber Terapêutico</h1>
        <p className="text-brand-ink/60 text-sm">Conecte-se com profissionais qualificados agora.</p>
      </header>

      <div className="space-y-4">
        {therapists.map(t => (
          <div key={t.id} className="glass-card p-4 rounded-3xl flex gap-4 items-center">
            <div className="relative">
              <img src={t.imageUrl} alt={t.name} className="w-20 h-20 rounded-2xl object-cover" referrerPolicy="no-referrer" />
              {t.online && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{t.name}</h3>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star size={12} fill="currentColor" />
                  {t.rating.toFixed(1)}
                </div>
              </div>
              <p className="text-xs text-brand-ink/60">{t.specialty}</p>
              <p className="text-sm font-serif font-bold text-brand-olive">R$ {t.price}/sessão</p>
              <div className="flex gap-2 pt-2">
                <Button className="py-1.5 px-4 text-xs flex-1">Agendar</Button>
                <Button variant="secondary" className="py-1.5 px-4 text-xs flex-1">Perfil</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const DiarioPage = () => {
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [saved, setSaved] = useState(false);

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
    if (val >= 8) return <Smile className="text-green-500" size={48} />;
    if (val >= 4) return <Meh className="text-amber-500" size={48} />;
    return <Frown className="text-red-500" size={48} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pb-24 space-y-8"
    >
      <header>
        <h1 className="text-3xl font-serif">Diário Emocional</h1>
        <p className="text-brand-ink/60 text-sm">Acompanhe sua jornada e padrões.</p>
      </header>

      {/* Mood Input */}
      <section className="glass-card p-6 rounded-3xl space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-serif">Como você está hoje?</h3>
          <div className="flex justify-center py-4">
            {getMoodIcon(mood)}
          </div>
          <p className="text-2xl font-serif italic text-brand-olive">{mood}/10</p>
        </div>

        <input 
          type="range" 
          min="0" 
          max="10" 
          value={mood}
          onChange={(e) => setMood(parseInt(e.target.value))}
          className="w-full h-2 bg-brand-olive/10 rounded-lg appearance-none cursor-pointer accent-brand-olive"
        />

        <textarea 
          placeholder="Escreva o que precisa sair... (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-white/50 border border-brand-olive/10 rounded-2xl p-4 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-brand-olive/20"
        />

        <Button className="w-full" onClick={handleSave} disabled={saved}>
          {saved ? 'Salvo com sucesso!' : 'Salvar Registro'}
        </Button>
      </section>

      {/* Progress Chart */}
      {chartData.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-serif flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-sage" />
            Sua Evolução
          </h3>
          <div className="glass-card p-4 rounded-3xl h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#5A5A40" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#5A5A40' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Recent History */}
      <section className="space-y-4">
        <h3 className="text-xl font-serif">Registros Recentes</h3>
        <div className="space-y-3">
          {history.slice().reverse().slice(0, 5).map(h => (
            <div key={h.id} className="glass-card p-4 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-xs text-brand-ink/40">{format(h.timestamp, "d 'de' MMMM", { locale: ptBR })}</p>
                <p className="text-sm font-medium line-clamp-1">{h.note || 'Sem anotações'}</p>
              </div>
              <div className="text-lg font-serif italic text-brand-olive">{h.value}/10</div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [route, setRoute] = useState<AppRoute>('home');

  const renderRoute = () => {
    switch(route) {
      case 'home': return <HomePage setRoute={setRoute} />;
      case 'guided-flow': return <GuidedFlowPage setRoute={setRoute} />;
      case 'chat': return <ChatIARAPage setRoute={setRoute} />;
      case 'terapeutas': return <TerapeutasPage />;
      case 'diario': return <DiarioPage />;
      case 'perfil': return (
        <div className="p-6 text-center space-y-6">
          <div className="w-24 h-24 bg-brand-olive/10 rounded-full mx-auto flex items-center justify-center text-brand-olive">
            <User size={48} />
          </div>
          <h1 className="text-3xl font-serif">Seu Perfil</h1>
          <p className="text-brand-ink/60">Configurações e dados da conta em breve.</p>
          <Button variant="secondary" onClick={() => setRoute('home')}>Voltar ao Início</Button>
        </div>
      );
      default: return <HomePage setRoute={setRoute} />;
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-brand-cream relative">
      <AnimatePresence mode="wait">
        <div key={route}>
          {renderRoute()}
        </div>
      </AnimatePresence>
      
      {/* Navbar is hidden on Chat page for better focus */}
      {route !== 'chat' && <Navbar activeRoute={route} setRoute={setRoute} />}
    </div>
  );
}
