import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useConnectionStatus } from "../contexts/PWAContext";

export default function NetworkStatusIndicator() {
  const isOffline = useConnectionStatus();
  const [showNotification, setShowNotification] = useState(false);
  const [lastState, setLastState] = useState<boolean | null>(null);

  useEffect(() => {
    // When the component mounts, if the user is offline, show it.
    // If the user goes online or offline, trigger a beautiful temporary indicator.
    if (lastState === null) {
      setLastState(isOffline);
      if (isOffline) {
        setShowNotification(true);
      }
      return;
    }

    setShowNotification(true);
    setLastState(isOffline);

    // If it changed to online, let the "Online" success banner fade out after 3.5 seconds
    if (!isOffline) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[999] pointer-events-none w-full max-w-[340px] px-4">
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 18, stiffness: 200 }}
            className="pointer-events-auto w-full"
          >
            {isOffline ? (
              <div 
                id="network-status-offline"
                className="flex items-center justify-between px-4 py-2.5 bg-rose-950/90 dark:bg-rose-950/90 border border-rose-500/30 backdrop-blur-md rounded-2xl shadow-xl shadow-rose-950/25 text-rose-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </div>
                  <WifiOff className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Modo Offline Ativo</span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-rose-500/15 rounded-lg border border-rose-500/20 uppercase tracking-widest text-rose-300">
                  Sem rede
                </span>
              </div>
            ) : (
              <div 
                id="network-status-online"
                className="flex items-center justify-between px-4 py-2.5 bg-emerald-950/90 dark:bg-emerald-950/90 border border-emerald-500/30 backdrop-blur-md rounded-2xl shadow-xl shadow-emerald-950/25 text-emerald-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Conexão Restabelecida</span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-500/15 rounded-lg border border-emerald-500/20 uppercase tracking-widest text-emerald-300 animate-pulse">
                  Online
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent ultra-subtle indicator when closed but offline */}
      <AnimatePresence>
        {!showNotification && isOffline && (
          <motion.button
            onClick={() => setShowNotification(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-auto mx-auto flex items-center gap-1.5 px-3 py-1 bg-rose-950/70 hover:bg-rose-950/95 border border-rose-500/20 backdrop-blur-xs rounded-full shadow-md text-rose-350 transition-all"
            id="network-status-persistent-offline"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
            <WifiOff className="w-3 h-3 text-rose-400/90" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-rose-300">Offline</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
