// Firebase Cloud Messaging Service Worker
// This file MUST be in the /public directory for FCM background notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCSqd8h4ckfsxg0tAp-3wKKkeCnwENEFLE',
  authDomain: 'yarana-lifeos.firebaseapp.com',
  projectId: 'yarana-lifeos',
  storageBucket: 'yarana-lifeos.firebasestorage.app',
  messagingSenderId: '190570205366',
  appId: '1:190570205366:web:9e22d4aa16646d106b5617',
});

const messaging = firebase.messaging();

// Background message handler (app is closed / not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title, body, icon } = payload.notification || {};
  const notificationTitle = title || '⏰ Yarana Reminder';
  const notificationOptions = {
    body: body || 'Aapka reminder aa gaya hai!',
    icon: icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [
      { action: 'open', title: '📱 Open App' },
      { action: 'dismiss', title: '✖ Dismiss' },
    ],
    tag: 'yarana-reminder',
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('yarana') && 'focus' in client) return client.focus();
      }
      return clients.openWindow('/tasks');
    })
  );
});
