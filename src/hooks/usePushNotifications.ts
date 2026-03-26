import { useState, useEffect } from 'react';

export function usePushNotifications(userId: string | undefined) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!userId) return false;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported by the browser.');
      return false;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== 'granted') {
        console.warn('Permission not granted for Notification');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Get public key from backend
      const response = await fetch('/api/push/public-key');
      const { publicKey } = await response.json();
      
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Send subscription to backend
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription
        }),
      });

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  };

  return { isSubscribed, permission, subscribe };
}
