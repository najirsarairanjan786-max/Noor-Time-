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

  self.registration.showNotification(notificationTitle, notificationOptions);
});
