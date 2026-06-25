import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SOSButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on pages where it's redundant or distracting
  const hiddenPaths = ['/emergencia', '/chat', '/respiracao', '/triagem', '/live-iara'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  const handleSOSClick = () => {
    // Tactile vibration feedback: double pulse for high readiness attention
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([100, 80, 150]);
      } catch (e) {
        console.warn('Vibration API not supported or blocked:', e);
      }
    }
    navigate('/emergencia');
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-44 right-6 z-[100] flex items-center justify-center pointer-events-none">
        {/* Continuous Noticeable Pulse Rings in background */}
        <motion.div
          className="absolute rounded-full bg-red-600/35"
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{
            scale: [0.9, 1.8],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{ width: "80px", height: "80px" }}
        />
        <motion.div
          className="absolute rounded-full bg-red-500/20"
          initial={{ scale: 0.9, opacity: 0.4 }}
          animate={{
            scale: [0.9, 2.3],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 2,
            delay: 0.6,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{ width: "80px", height: "80px" }}
        />

        {/* Main Interactive Button */}
        <motion.button
          id="sos-floating-button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.12, boxShadow: "0 25px 50px -12px rgba(220,38,38,0.5)" }}
          whileTap={{ scale: 0.92 }}
          onClick={handleSOSClick}
          className="pointer-events-auto relative flex h-20 w-20 flex-col items-center justify-center gap-1 overflow-hidden rounded-full bg-[#dc2626] text-white shadow-[0_20px_45px_rgba(220,38,38,0.4)] transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-offset-2"
          aria-label="SOS Emergência"
        >
          {/* Inner ripple line */}
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          
          <AlertCircle className="h-8 w-8 text-white relative z-10 animate-bounce" style={{ animationDuration: '3s' }} />
          <span className="text-[10px] font-black text-white relative z-10 uppercase tracking-tighter">Sinto SOS</span>
        </motion.button>
      </div>
    </AnimatePresence>
  );
};

export default SOSButton;
