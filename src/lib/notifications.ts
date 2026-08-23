export class NotificationService {
  static getPermissionStatus() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    return await Notification.requestPermission();
  }

  static async sendTestNotification() {
    if (this.getPermissionStatus() !== 'granted') return false;
    return this.showNotification("Noor Time Test Notification", {
      body: "Notifications are working correctly.",
    });
  }

  static async showNotification(title: string, options?: NotificationOptions) {
    if (this.getPermissionStatus() !== 'granted') return false;
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, { 
          ...options, 
          icon: options?.icon || '/icon-192.png',
          badge: '/icon-192.png',
          // @ts-ignore
          vibrate: [200, 100, 200]
        });
      } else {
        new Notification(title, { 
          ...options, 
          icon: options?.icon || '/icon-192.png' 
        });
      }
      return true;
    } catch (e) {
      console.error('Notification error', e);
      return false;
    }
  }
}

// Keep this for backwards compatibility with existing imports
export const showNotification = (title: string, options?: NotificationOptions) => {
  return NotificationService.showNotification(title, options);
};
