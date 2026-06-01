import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ExternalLink, Copy, Check, Bell, X } from 'lucide-react';

import { auth } from '../services/firebase';

interface PWAContextType {
  installPrompt: any;
  handleInstall: () => Promise<void>;
  isInstallable: boolean;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<void>;
  subscribeToPush: () => Promise<void>;
  isInIframe: boolean;
  showIframeWarning: boolean;
  setShowIframeWarning: (show: boolean) => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [showIframeWarning, setShowIframeWarning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      console.log('PWA install prompt not available');
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const requestNotificationPermission = async () => {
    if (isInIframe) {
      setShowIframeWarning(true);
      return;
    }

    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setShowIframeWarning(true);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    console.log('Sistema de Notificações Push (VAPID) desativado temporariamente.');
    return;
  };

  return (
    <PWAContext.Provider value={{ 
      installPrompt, 
      handleInstall, 
      isInstallable: !!installPrompt,
      notificationPermission,
      requestNotificationPermission,
      subscribeToPush,
      isInIframe,
      showIframeWarning,
      setShowIframeWarning
    }}>
      {children}

      <AnimatePresence>
        {showIframeWarning && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-emerald-500/20 rounded-[2.5rem] p-8 max-w-sm w-full space-y-6 shadow-2xl relative overflow-hidden text-slate-100"
              id="iframe-warning-modal"
            >
              <button 
                onClick={() => setShowIframeWarning(false)}
                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif italic text-white font-medium">Visualização em Iframe</h3>
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Ativação Requer Acesso Direto</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para proteger sua segurança e privacidade, os navegadores impedem a ativação de notificações push dentro do painel integrado de desenvolvimento (iframe).
                </p>
                <p className="text-xs text-slate-300 font-medium">
                  Abra a aplicação diretamente em uma nova aba para ativar as notificações normalmente!
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3 overflow-hidden">
                  <span className="text-[11px] font-mono text-slate-400 truncate select-all flex-1">
                    {typeof window !== 'undefined' ? window.location.href : ''}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copiar endereço"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowIframeWarning(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all"
                  >
                    Fechar
                  </button>
                  <a 
                    href={typeof window !== 'undefined' ? window.location.href : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2"
                  >
                    Abrir Aba
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
