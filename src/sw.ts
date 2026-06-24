import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';
import firebaseAppletConfig from '../firebase-applet-config.json';

// Initialize Firebase in the Service Worker
let messaging: any = null;
try {
  const firebaseApp = initializeApp(firebaseAppletConfig);
  messaging = getMessaging(firebaseApp);
} catch (error) {
  console.warn('Firebase Service Worker Messaging initialization failed or is not supported:', error);
}

// Handle FCM Background Messages
if (messaging) {
  onBackgroundMessage(messaging, (payload) => {
    console.log('Mensagem em segundo plano recebida:', payload);
    const title = payload.notification?.title || 'SENTI';
    const options = {
      body: payload.notification?.body || 'Você tem uma nova atualização.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: payload.data?.url || '/',
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'Ver Agora' }
      ]
    };

    (self as any).registration.showNotification(title, options);
  });
}

// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST);

// 1. CACHE-FIRST: Crucial external and local static assets (Google Fonts, local icons, images, etc.)
registerRoute(
  ({ url, request }) => {
    const isFont = request.destination === 'font' || url.origin.includes('fonts.gstatic.com') || url.pathname.endsWith('.woff2') || url.pathname.endsWith('.woff');
    const isIconOrImage = request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico)$/);
    return isFont || isIconOrImage;
  },
  new CacheFirst({
    cacheName: 'senti-critical-assets-cache',
  })
);

// 2. STALE-WHILE-REVALIDATE: CSS/JS sheets and crucial application routes (diary, breathing, dashboard views)
registerRoute(
  ({ url, request }) => {
    const isStyleOrScript = request.destination === 'script' || request.destination === 'style';
    const isDiaryOrBreathingRelated = url.pathname.includes('/diario') || url.pathname.includes('/respiracao') || url.pathname.includes('/manifest') || url.pathname.includes('/pwa');
    return isStyleOrScript || isDiaryOrBreathingRelated;
  },
  new StaleWhileRevalidate({
    cacheName: 'senti-core-views-cache',
  })
);

// SPA routing fallback: Serve index.html for all page navigation requests
try {
  const handler = createHandlerBoundToURL('/index.html');
  const navigationRoute = new NavigationRoute(handler, {
    // Avoid routing API requests to index.html
    denylist: [/^\/api/],
  });
  registerRoute(navigationRoute);
} catch (error) {
  console.warn('Falha ao configurar a rota de navegação fallback local:', error);
}

const swSelf = self as any;


swSelf.addEventListener('push', (event: any) => {
  const data = event.data ? event.data.json() : { title: 'SENTI', body: 'Você tem uma nova atualização.' };
  
  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: data.url || '/',
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Ver Agora' }
    ]
  };

  event.waitUntil(
    swSelf.registration.showNotification(data.title, options)
  );
});

swSelf.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data || '/';

  event.waitUntil(
    swSelf.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: any[]) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (swSelf.clients.openWindow) {
        return swSelf.clients.openWindow(urlToOpen);
      }
    })
  );
});
