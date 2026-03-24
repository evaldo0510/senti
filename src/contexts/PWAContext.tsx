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

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push');
        return;
      }

      // In a real app, you'd get the public VAPID key from your server
      // For this demo, we'll use a placeholder or assume it's handled
      // const subscription = await registration.pushManager.subscribe({
      //   userVisibleOnly: true,
      //   applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      // });
      
      // console.log('Push subscription successful:', subscription);
      // Save subscription to backend
      // await userService.savePushSubscription(subscription);
      
      console.log('Push subscription logic ready (requires VAPID keys for full implementation)');
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
