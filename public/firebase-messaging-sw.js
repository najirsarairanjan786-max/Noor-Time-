importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBeTuy5728fi_JrqhpBuHso7bErLnzqr2o",
  authDomain: "gen-lang-client-0176002567.firebaseapp.com",
  projectId: "gen-lang-client-0176002567",
  storageBucket: "gen-lang-client-0176002567.firebasestorage.app",
  messagingSenderId: "632912827177",
  appId: "1:632912827177:web:8986558398214c70d0dd38",
  measurementId: "G-N6JSRNQKDT"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Background Message';
  const notificationOptions = {
    body: payload.notification?.body,
  };

  
  if (!payload.notification) {
    self.registration.showNotification(notificationTitle, notificationOptions);
  }

});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
