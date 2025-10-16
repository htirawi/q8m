// Firebase Cloud Messaging Service Worker
// This handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (will be replaced with actual config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-app.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-app.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your-sender-id',
  appId: process.env.VITE_FIREBASE_APP_ID || 'your-app-id',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Q8M Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/logo.png',
    badge: '/badge-icon.png',
    image: payload.notification?.image,
    data: payload.data,
    tag: payload.data?.tag || 'default',
    requireInteraction: payload.data?.requireInteraction === 'true',
    actions: getNotificationActions(payload.data?.type),
    vibrate: [200, 100, 200],
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Define notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'streak_reminder':
      return [
        { action: 'take_quiz', title: '📚 Take Quiz', icon: '/icons/quiz.png' },
        { action: 'dismiss', title: 'Later', icon: '/icons/close.png' },
      ];
    case 'challenge':
      return [
        { action: 'accept_challenge', title: '⚔️ Accept', icon: '/icons/accept.png' },
        { action: 'decline', title: 'Decline', icon: '/icons/decline.png' },
      ];
    case 'achievement':
      return [
        { action: 'view_achievement', title: '👀 View', icon: '/icons/view.png' },
        { action: 'share', title: '📤 Share', icon: '/icons/share.png' },
      ];
    case 'new_content':
      return [
        { action: 'explore', title: '🔍 Explore', icon: '/icons/explore.png' },
      ];
    case 'trial_ending':
      return [
        { action: 'upgrade', title: '⭐ Upgrade Now', icon: '/icons/upgrade.png' },
        { action: 'remind_later', title: 'Remind Later', icon: '/icons/clock.png' },
      ];
    default:
      return [
        { action: 'open', title: 'Open', icon: '/icons/open.png' },
      ];
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received.', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  // Define URL based on action
  let targetUrl = '/';

  switch (action) {
    case 'take_quiz':
      targetUrl = '/select';
      break;
    case 'accept_challenge':
      targetUrl = data.challengeUrl || `/challenges/${data.challengeId}`;
      break;
    case 'decline':
      // Just close, no navigation
      return;
    case 'view_achievement':
      targetUrl = data.achievementUrl || '/profile#achievements';
      break;
    case 'share':
      targetUrl = data.shareUrl || '/profile';
      break;
    case 'explore':
      targetUrl = data.contentUrl || '/';
      break;
    case 'upgrade':
      targetUrl = '/pricing';
      break;
    case 'remind_later':
      // Just close, will remind again
      return;
    case 'open':
    default:
      targetUrl = data.url || '/';
      break;
  }

  // Open or focus the target URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === new URL(targetUrl, self.location.origin).href && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window if none exist
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );

  // Track analytics
  fetch('/api/v1/analytics/notification-clicked', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      notificationId: data.notificationId,
      type: data.type,
      action: action || 'open',
      timestamp: new Date().toISOString(),
    }),
  }).catch((err) => console.error('Failed to track notification click:', err));
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed.', event);

  const data = event.notification.data;

  // Track dismissal analytics
  fetch('/api/v1/analytics/notification-dismissed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      notificationId: data.notificationId,
      type: data.type,
      timestamp: new Date().toISOString(),
    }),
  }).catch((err) => console.error('Failed to track notification dismissal:', err));
});

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});
