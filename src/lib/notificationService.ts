export class NotificationService {
  static getPermissionStatus() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    const permission = await Notification.requestPermission();
    return permission;
  }

  static async sendTestNotification(title: string, body: string) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    try {
      if (navigator.serviceWorker) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, { body, icon: '/icon-192.png' });
      } else {
        new Notification(title, { body, icon: '/icon-192.png' });
      }
      return true;
    } catch (e) {
      console.error('Test notification failed:', e);
      return false;
    }
  }

  static async showNotification(title: string, options?: NotificationOptions) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    try {
      if (navigator.serviceWorker) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, { ...options, icon: options?.icon || '/icon-192.png' });
      } else {
        new Notification(title, { ...options, icon: options?.icon || '/icon-192.png' });
      }
      return true;
    } catch (e) {
      console.error('Notification failed:', e);
      return false;
    }
  }
}
