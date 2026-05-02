// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyB2aHXu-p7sLQtVFkGRfWPGNhCLHHbVr3E",
  authDomain: "flowday-app-ba4f0.firebaseapp.com",
  projectId: "flowday-app-ba4f0",
  storageBucket: "flowday-app-ba4f0.firebasestorage.app",
  messagingSenderId: "978385392444",
  appId: "1:978385392444:web:5a7fa0c1bd9ae1b1f84439"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Flowday Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/white-logo.png',
    badge: '/icons/white-logo.png',
    tag: payload.data?.tag || 'default',
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  // Get the URL from notification data or default to home
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  // Open app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
