import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ExternalLink, Copy, Check, Bell, X, Wifi, WifiOff, Wind, Heart } from 'lucide-react';

import { auth } from '../services/firebase';
import { NotificationService } from '../services/notificationService';
import { initGA4, trackEvent, flushOfflineEvents, trackUserReturn } from '../services/analyticsService';

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
  isOffline: boolean;
  syncOfflineData: () => Promise<void>;
}


export const useConnectionStatus = () => {
  const [isOffline, setIsOffline] = useState<boolean>(
     Amelia_typeof() ? !navigator.onLine : false
  );

  function Amelia_typeof() {
    return typeof navigator !== 'undefined';
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
};


const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    NotificationService.getPermissionStatus()
  );
  const [showIframeWarning, setShowIframeWarning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const isOffline = useConnectionStatus();
  const [isOfflinePanelMinimized, setIsOfflinePanelMinimized] = useState<boolean>(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Initialize OneSignal clientside dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-onesignal').then(({ default: OneSignal }) => {
        OneSignal.init({
          appId: import.meta.env.VITE_ONESIGNAL_APP_ID || "3cd9c394-b258-40a2-afc4-e69acbe52ef0",
          allowLocalhostAsSecureOrigin: true,
          welcomeNotification: {
            disable: false,
            title: "SENTI Pronto-Socorro Emocional",
            message: "Notificações push devidamente sincronizadas."
          }
        }).then(() => {
          console.log("OneSignal: Inicializado com sucesso!");
          const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
              OneSignal.login(user.uid).catch(e => 
                console.warn("OneSignal: Erro ao registrar login:", e)
              );
            }
          });
          return () => unsubscribe();
        }).catch(err => {
          console.warn("OneSignal: Falha ao inicializar SDK:", err);
        });
      });
    }
  }, []);

  // Sincroniza dados offline quando o navegador volta a ficar online
  const syncOfflineData = async () => {
    try {
      const { offlineStorage } = await import('../services/offlineStorage');
      const { db } = await import('../services/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      
      const unsynced = await offlineStorage.getUnsyncedMoods();
      if (unsynced && unsynced.length > 0) {
        console.log(`PWA: Sincronizando ${unsynced.length} registros offline com o Firestore...`);
        for (const entry of unsynced) {
          // Salva no firestore
          const newEntry = {
            userId: entry.userId,
            emotion: entry.emotion || 'Registro de humor',
            value: entry.value,
            intensity: entry.intensity,
            timestamp: entry.timestamp,
            triggers: entry.triggers || []
          };
          
          await addDoc(collection(db, 'emotion_logs'), newEntry);
          
          // Marca como sincronizado localmente
          if (entry.id) {
            await offlineStorage.markAsSynced(Number(entry.id));
          }
        }
        console.log('PWA: Sincronização offline concluída com sucesso!');
      }
    } catch (err) {
      console.warn('Erro ao sincronizar dados offline:', err);
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Inicializa o GA4 e rastreia o retorno do usuário quando a aplicação carrega
  useEffect(() => {
    initGA4();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      trackUserReturn(user?.uid);
    });
    return () => unsubscribe();
  }, []);

  // Sincroniza dados do diário e humor sempre que a conexão for estabelecida
  useEffect(() => {
    if (!isOffline) {
      syncOfflineData();
      flushOfflineEvents();
      trackEvent('connection_restored');
    } else {
      trackEvent('connection_lost');
    }
  }, [isOffline]);


  // Sincroniza inscrição de push quando o status de autenticação muda ou o aplicativo inicia
  useEffect(() => {
    if (NotificationService.getPermissionStatus() === 'granted') {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          subscribeToPush();
        }
      });
      return () => unsubscribe();
    }
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

    try {
      const permission = await NotificationService.requestPermission();
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
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported by the browser.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get public key from backend
      const response = await fetch('/api/push/public-key');
      const { publicKey } = await response.json();
      
      if (!publicKey) {
        console.warn('No active public key returned from VAPID configuration on server');
        return;
      }
      
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      const userId = auth.currentUser?.uid || 'guest';

      // Send subscription to backend
      const subscribeResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription
        }),
      });

      if (subscribeResponse.ok) {
        console.log('Push subscription fully registered successfully on backend!');
      } else {
        console.error('Failed to register subscription on backend:', await subscribeResponse.text());
      }
    } catch (error) {
      console.error('Error subscribing to push notifications in PWAContext:', error);
    }
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
      setShowIframeWarning,
      isOffline,
      syncOfflineData
    }}>
      {children}

      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[998] max-w-sm w-[calc(100vw-3rem)] bg-slate-900/95 border border-emerald-500/20 backdrop-blur-lg rounded-[2rem] p-6 shadow-2xl text-slate-100 flex flex-col gap-4 overflow-hidden"
            id="pwa-offline-notification"
          >
            {isOfflinePanelMinimized ? (
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsOfflinePanelMinimized(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <WifiOff className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans tracking-tight">Modo Seguro Offline 🛡️</h4>
                    <p className="text-[10px] text-slate-400">Clique para expandir ferramentas</p>
                  </div>
                </div>
                <button className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300">
                  Ver
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <WifiOff className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif italic font-semibold text-white">Estado Offline Ativo</h4>
                      <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest mt-0.5">Modo Seguro & Privado</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOfflinePanelMinimized(true)}
                    className="p-1.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
                    aria-label="Minimizar status offline"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sua rede está temporariamente oscilando, mas o seu cuidado mental segue sem pausas! Suas ferramentas críticas estão prontas e sincronizadas para uso off-grid.
                  </p>
                </div>

                <div className="bg-slate-950/40 rounded-2xl border border-white/5 p-3 space-y-2.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Atividades Offline Sugeridas</p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <a 
                      href="/respiracao"
                      className="flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 rounded-xl transition-all group"
                      onClick={() => {
                        trackEvent('offline_suggested_action', { action: 'breathing' });
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                          <Wind className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Prática Respiratória</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Iniciar &rarr;</span>
                    </a>

                    <a 
                      href="/diario"
                      className="flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 rounded-xl transition-all group"
                      onClick={() => {
                        trackEvent('offline_suggested_action', { action: 'diary' });
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                          <Heart className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Diário de Sentimentos</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Registrar &rarr;</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                  <span>Os dados sincronizam ao reconectar</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
