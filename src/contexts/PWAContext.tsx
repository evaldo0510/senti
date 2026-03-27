import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
  installPrompt: any;
  handleInstall: () => Promise<void>;
  isInstallable: boolean;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<void>;
  subscribeToPush: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

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
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      await subscribeToPush();
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
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push');
        // Still send to backend just in case it's missing there
        const { auth } = await import('../services/firebase');
        const userId = auth.currentUser?.uid;
        if (userId) {
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, subscription: existingSubscription })
          });
        }
        return;
      }

      // Fetch VAPID Public Key from backend
      const response = await fetch('/api/push/public-key');
      const { publicKey } = await response.json();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      
      console.log('Push subscription successful:', subscription);
      
      // Get current user from Auth
      const { auth } = await import('../services/firebase');
      const userId = auth.currentUser?.uid;
      
      if (userId) {
        // Save subscription to backend
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, subscription })
        });
        console.log('Push subscription saved to backend');
      }
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
    }
  };

  return (
    <PWAContext.Provider value={{ 
      installPrompt, 
      handleInstall, 
      isInstallable: !!installPrompt,
      notificationPermission,
      requestNotificationPermission,
      subscribeToPush
    }}>
      {children}
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
