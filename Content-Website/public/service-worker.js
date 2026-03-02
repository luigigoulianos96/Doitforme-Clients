self.addEventListener('push', (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch (_error) {
    payload = {
      title: 'Content Portal',
      body: event.data ? event.data.text() : 'Νέο client feedback.',
      icon: '/service-worker-icon.svg',
      url: '/portal.html',
      requireInteraction: true
    };
  }

  const title = `${payload?.title || 'Content Portal'}`.trim() || 'Content Portal';
  const notificationOptions = {
    body: `${payload?.body || 'Νέο client feedback.'}`.trim(),
    icon: payload?.icon || '/service-worker-icon.svg',
    badge: payload?.badge || payload?.icon || '/service-worker-icon.svg',
    tag: payload?.tag || 'content-review-update',
    requireInteraction: payload?.requireInteraction !== false,
    actions: Array.isArray(payload?.actions) && payload.actions.length > 0
      ? payload.actions
      : [{ action: 'open', title: 'Άνοιγμα' }],
    data: {
      url: payload?.url || '/portal.html'
    }
  };

  event.waitUntil(self.registration.showNotification(title, notificationOptions));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const nextUrl = event.notification?.data?.url || '/portal.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const targetUrl = new URL(nextUrl, self.location.origin).href;
      const matchingClient = clients.find((client) => client.url === targetUrl);
      if (matchingClient) {
        return matchingClient.focus();
      }

      return self.clients.openWindow(nextUrl);
    })
  );
});
