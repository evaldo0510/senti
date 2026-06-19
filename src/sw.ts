import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST);

// Cache-First strategy for images, icons, and fonts
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'senti-media-cache',
  })
);

// Stale-While-Revalidate strategy for JS, CSS, and manifest assets
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'senti-bundle-cache',
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
