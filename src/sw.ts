import { precacheAndRoute } from 'workbox-precaching';

const swSelf = self as any;

precacheAndRoute(swSelf.__WB_MANIFEST);

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
