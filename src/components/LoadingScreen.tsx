import React from 'react';
import { motion } from 'motion/react';
import { HeartPulse } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Carregando sua experiência..." }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative">
        {/* Rotating ring around the logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border-2 border-transparent border-t-emerald-500/60 border-r-emerald-500/20 rounded-full"
        />
        
        {/* Logo container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-24 h-24 bg-slate-900 border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden group"
        >
          {/* Inner pulse */}
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-emerald-500/20"
          />
          
          <HeartPulse className="w-12 h-12 text-emerald-500 relative z-10" />
        </motion.div>
      </div>

      <div className="mt-10 space-y-3 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="text-3xl font-black text-white tracking-tighter uppercase italic"
        >
          SENTI
        </motion.h2>
        
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.8, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 0.4, 
                repeat: Infinity, 
                delay: i * 0.08,
                ease: "easeInOut"
              }}
              className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
            />
          ))}
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]"
        >
          {message}
        </motion.p>
      </div>

      {/* Bottom info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-12 text-center"
      >
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
          Pronto Atendimento Emocional • 2026
        </p>
      </motion.div>
    </div>
  );
};
