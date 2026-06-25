import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Phone, X, Wind, Eye, ShieldAlert, CheckCircle, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../services/firebase';
import { userService } from '../services/userService';

const SOSButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Settings states
  const [emergencyPhone, setEmergencyPhone] = useState<string>("188");
  const [contactName, setContactName] = useState<string>("CVV (Central de Crise)");
  
  // Long-press and Gesture states
  const [pressProgress, setPressProgress] = useState(0);
  const isLongPressTriggered = useRef(false);
  const pressStartTime = useRef(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modal states
  const [showGroundingModal, setShowGroundingModal] = useState(false);
  const [modalTab, setModalTab] = useState<'breathe' | 'sensory' | 'phrases'>('breathe');

  // Breathing simulation state inside Modal
  const [breathingPhase, setBreathingPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathingSec, setBreathingSec] = useState(3);

  const hiddenPaths = ['/emergencia', '/chat', '/respiracao', '/triagem', '/live-iara', '/atendimento'];

  // Preload user's emergency contacts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await userService.getUser(user.uid);
          if (data && data.emergencyContacts && data.emergencyContacts.length > 0) {
            const firstWithPhone = data.emergencyContacts.find(c => c.phone && c.phone.trim() !== "");
            if (firstWithPhone) {
              setEmergencyPhone(firstWithPhone.phone);
              setContactName(firstWithPhone.name);
            }
          }
        } catch (e) {
          console.error("Error loading emergency contact in SOSButton:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 3-second breathing cycle simulator inside the Quick Calm Modal
  useEffect(() => {
    if (!showGroundingModal || modalTab !== 'breathe') return;

    const timer = setInterval(() => {
      setBreathingSec(prev => {
        if (prev <= 1) {
          // Switch phase
          setBreathingPhase(current => {
            if (current === 'in') return 'hold';
            if (current === 'hold') return 'out';
            return 'in';
          });
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showGroundingModal, modalTab]);

  // Logging function
  const logSOSTrigger = (type: 'click' | 'long_press' | 'grounding_complete' | 'dial') => {
    try {
      const logsStr = localStorage.getItem("sos_button_triggers") || "[]";
      const logs = JSON.parse(logsStr);
      logs.push({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        timestamp: new Date().toISOString(),
        type,
        page: window.location.pathname
      });
      localStorage.setItem("sos_button_triggers", JSON.stringify(logs));
    } catch (e) {
      console.error("Error logging SOS trigger:", e);
    }
  };

  // Long press handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle primary button clicks or touch
    if (e.button !== undefined && e.button !== 0) return;

    isLongPressTriggered.current = false;
    pressStartTime.current = Date.now();
    setPressProgress(0);

    // Dynamic visual fill-up over 1000ms
    const intervalTime = 20;
    const duration = 1000;
    const step = (intervalTime / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setPressProgress(prev => {
        if (prev >= 100) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          triggerLongPress();
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (isLongPressTriggered.current) {
      e.preventDefault();
      return;
    }

    const elapsed = Date.now() - pressStartTime.current;
    setPressProgress(0);

    // If it was a quick click/tap, trigger the comforting modal
    if (elapsed < 400) {
      handleNormalClick();
    }
  };

  const handlePointerLeave = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setPressProgress(0);
  };

  const triggerLongPress = () => {
    isLongPressTriggered.current = true;
    
    // Play dual tactile vibrate feedback for high priority alarm
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch (e) {
        console.warn('Vibration API not supported:', e);
      }
    }

    logSOSTrigger('long_press');
    logSOSTrigger('dial');

    // Quick Dial the crisis/emergency number
    window.location.href = `tel:${emergencyPhone}`;
  };

  const handleNormalClick = () => {
    // Soft subtle buzz feedback for clicking the button
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(80);
      } catch (e) {
        console.warn('Vibration API error:', e);
      }
    }
    logSOSTrigger('click');
    setModalTab('breathe');
    setBreathingPhase('in');
    setBreathingSec(3);
    setShowGroundingModal(true);
  };

  const handleCallFromModal = () => {
    logSOSTrigger('dial');
    window.location.href = `tel:${emergencyPhone}`;
  };

  const handleGroundingComplete = () => {
    logSOSTrigger('grounding_complete');
    setShowGroundingModal(false);
  };

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <div className="fixed bottom-44 right-6 z-[100] flex items-center justify-center pointer-events-none">
          {/* Soothing Heartbeat Pulse Animation background rings */}
          <motion.div
            className="absolute rounded-full bg-red-600/25"
            animate={{
              scale: [1, 1.35, 1.22, 1.55, 1, 1],
              opacity: [0.5, 0.15, 0.35, 0, 0, 0.5],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.15, 0.3, 0.5, 0.7, 1],
            }}
            style={{ width: "80px", height: "80px" }}
          />
          <motion.div
            className="absolute rounded-full bg-red-500/15"
            animate={{
              scale: [1, 1.55, 1.35, 1.95, 1, 1],
              opacity: [0.35, 0.1, 0.25, 0, 0, 0.35],
            }}
            transition={{
              duration: 2.2,
              delay: 0.1,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.15, 0.3, 0.5, 0.7, 1],
            }}
            style={{ width: "80px", height: "80px" }}
          />

          {/* Main Interactive Button with Circular SVGs and Heartbeat */}
          <motion.button
            id="sos-floating-button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.08, 1.02, 1.14, 1, 1],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.15, 0.3, 0.5, 0.7, 1],
            }}
            whileHover={{ scale: 1.12, boxShadow: "0 25px 50px -12px rgba(220,38,38,0.5)" }}
            whileTap={{ scale: 0.92 }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            className="pointer-events-auto relative flex h-20 w-20 flex-col items-center justify-center gap-1 overflow-hidden rounded-full bg-[#dc2626] text-white shadow-[0_20px_45px_rgba(220,38,38,0.4)] transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 select-none touch-none"
            aria-label="SOS Emergência"
          >
            {/* SVG circular loading border for long-press feedback */}
            {pressProgress > 0 && (
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none z-20">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#ffffff"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray="226.2"
                  strokeDashoffset={226.2 - (226.2 * pressProgress) / 100}
                  className="transition-all duration-75"
                />
              </svg>
            )}

            {/* Pulsing inner overlay */}
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full" />
            
            <AlertCircle className="h-8 w-8 text-white relative z-10 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="text-[10px] font-black text-white relative z-10 uppercase tracking-tighter">Sinto SOS</span>
          </motion.button>
        </div>
      </AnimatePresence>

      {/* QUICK CALM GROUNDING MODAL */}
      <AnimatePresence>
        {showGroundingModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGroundingModal(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-slate-900 border border-red-500/10 rounded-[2rem] shadow-2xl p-6 text-slate-100 overflow-hidden"
              id="quick-calm-grounding-modal"
            >
              {/* Radial decor */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close button */}
              <button 
                onClick={() => setShowGroundingModal(false)}
                className="absolute right-5 top-5 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10 text-slate-400 hover:text-slate-200"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4 text-red-400">
                <HeartPulse className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Pronto-Socorro Rápido</span>
              </div>

              <h2 className="text-lg font-bold text-slate-100 leading-tight">Mantenha a Calma</h2>
              <p className="text-xs text-slate-400 mt-1 mb-5">Você está seguro. Vamos dar um passo de cada vez para desacelerar o corpo.</p>

              {/* Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/60 rounded-xl mb-6 text-xs font-medium">
                <button
                  onClick={() => setModalTab('breathe')}
                  className={`py-2 px-1 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                    modalTab === 'breathe' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" /> Respire
                </button>
                <button
                  onClick={() => setModalTab('sensory')}
                  className={`py-2 px-1 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                    modalTab === 'sensory' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Ancorar
                </button>
                <button
                  onClick={() => setModalTab('phrases')}
                  className={`py-2 px-1 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                    modalTab === 'phrases' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Pensamentos
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[160px] flex flex-col justify-center">
                {modalTab === 'breathe' && (
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Animated breathing guide ring */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <motion.div 
                        className={`absolute rounded-full border-2 border-dashed ${
                          breathingPhase === 'in' ? 'border-emerald-500 bg-emerald-500/5' :
                          breathingPhase === 'hold' ? 'border-cyan-500 bg-cyan-500/5' : 'border-blue-500 bg-blue-500/5'
                        }`}
                        animate={{
                          scale: breathingPhase === 'in' ? [0.8, 1.4] :
                                 breathingPhase === 'hold' ? 1.4 : [1.4, 0.8]
                        }}
                        transition={{
                          duration: 3,
                          ease: "linear",
                        }}
                        style={{ width: "64px", height: "64px" }}
                      />
                      <span className="text-xl font-bold font-mono text-slate-100 z-10">{breathingSec}s</span>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-200 uppercase tracking-widest animate-pulse">
                        {breathingPhase === 'in' ? '👉 Inspire profundamente' :
                         breathingPhase === 'hold' ? '🛑 Segure o ar' : '💨 Solte devagar'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                        {breathingPhase === 'in' ? 'Sinta o peito se expandir com ar limpo.' :
                         breathingPhase === 'hold' ? 'Apenas sinta a estabilidade do momento.' : 'Deixe ir toda a tensão com a saída do ar.'}
                      </p>
                    </div>
                  </div>
                )}

                {modalTab === 'sensory' && (
                  <div className="space-y-3.5">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider text-center">Técnica dos 5 Sentidos</p>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5 flex items-start gap-3">
                        <span className="text-lg leading-none">👁️</span>
                        <div>
                          <p className="font-bold text-slate-200">Mencione 3 coisas visíveis</p>
                          <p className="text-[11px] text-slate-500">Olhe ao redor: cite 3 objetos de cores diferentes.</p>
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5 flex items-start gap-3">
                        <span className="text-lg leading-none">👂</span>
                        <div>
                          <p className="font-bold text-slate-200">Identifique 2 sons</p>
                          <p className="text-[11px] text-slate-500">Feche os olhos e ouça: o trânsito, a geladeira, sua respiração.</p>
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5 flex items-start gap-3">
                        <span className="text-lg leading-none">🧘</span>
                        <div>
                          <p className="font-bold text-slate-200">Foque em 1 sensação física</p>
                          <p className="text-[11px] text-slate-500">Apoie os pés firmes no chão ou sinta a textura da roupa.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'phrases' && (
                  <div className="space-y-3.5 text-center px-4">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Afirmações de Âncora</p>
                    <div className="bg-slate-950/55 border border-red-500/10 p-4 rounded-2xl italic text-sm text-slate-300 leading-relaxed">
                      "Isto é apenas ansiedade, uma reação física temporária. Meu corpo está liberando energia excessiva. Estou perfeitamente seguro e essa onda vai passar."
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Leia pausadamente em voz alta. A ansiedade sempre atinge o pico e desce naturalmente.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 pt-4 border-t border-white/5 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCallFromModal}
                    className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-red-900/20 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" /> Ligar para {contactName.split(" ")[0]}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowGroundingModal(false);
                      navigate('/emergencia');
                    }}
                    className="py-3 px-4 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-white/10 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Triagem Completa
                  </button>
                </div>

                <button
                  onClick={handleGroundingComplete}
                  className="w-full py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Já estou me sentindo melhor, fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SOSButton;
