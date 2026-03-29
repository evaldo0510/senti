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

  return (
    <AnimatePresence>
      <motion.button
        id="sos-floating-button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/emergencia')}
        className="fixed bottom-24 right-6 z-[100] flex h-20 w-20 flex-col items-center justify-center gap-1 overflow-hidden rounded-full bg-[#dc2626] text-white shadow-[0_20px_40px_rgba(220,38,38,0.3)] transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="SOS Emergência"
      >
        <div className="absolute inset-0 bg-white animate-ping opacity-20"></div>
        <AlertCircle className="h-8 w-8 text-white relative z-10" />
        <span className="text-[10px] font-black text-white relative z-10 uppercase tracking-tighter">SENTI SOS</span>
      </motion.button>
    </AnimatePresence>
  );
};

export default SOSButton;
