export const showNotification = async (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, options);
  } catch (e) {
    if (e instanceof TypeError && navigator.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
      } catch (swError) {
        console.error('SW notification error', swError);
      }
    }
  }
};
