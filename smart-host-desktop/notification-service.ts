// خدمات الإشعارات الذكية
const NOTIFICATIONS_KEY = 'notifications';
const LAST_CHECK_KEY = 'last_check';
export type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  unread: boolean;
};
export function getNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
export function getNewNotifications(): Notification[] {
  const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0');
  const notifications = getNotifications();
  return notifications.filter(n => n.timestamp > lastCheck && n.unread);
}
export function updateLastCheck() {
  localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
}
export function markAsRead(notificationId: string) {
  const notifications = getNotifications();
  const updated = notifications.map(n =>
    n.id === notificationId ? { ...n, unread: false } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('notifications-updated'));
}
export function markAllAsRead() {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, unread: false }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('notifications-updated'));
}
export function deleteNotification(notificationId: string) {
  const notifications = getNotifications();
  const updated = notifications.filter(n => n.id !== notificationId);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('notifications-updated'));
}
export function mergeNewNotifications(newNotifications: Notification[]) {
  if (newNotifications.length === 0) return;
  const existing = getNotifications();
  const merged = [...newNotifications, ...existing];
  const unique = merged.filter((n, index, self) =>
    index === self.findIndex(t => t.id === n.id)
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(unique));
  window.dispatchEvent(new Event('notifications-updated'));
}
export function startNotificationSync(callback: (newNotifications: Notification[]) => void) {
  const interval = setInterval(() => {
    const newNotifications = getNewNotifications();
    if (newNotifications.length > 0) {
      mergeNewNotifications(newNotifications);
      updateLastCheck();
      callback(newNotifications);
    }
  }, 3000);
  return () => clearInterval(interval);
}
