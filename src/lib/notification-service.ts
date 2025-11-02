// خدمة الإشعارات الذكية - تعمل عبر الأجهزة المختلفة

export type NotificationType =
  | 'booking_confirmed'      // تأكيد حجز
  | 'booking_cancelled'      // إلغاء حجز
  | 'payment_received'       // استلام دفعة
  | 'payment_overdue'        // تأخر دفع
  | 'checkin_reminder'       // تذكير بالدخول
  | 'checkout_reminder'      // تذكير بالخروج
  | 'room_maintenance'       // صيانة غرفة
  | 'guest_request'          // طلب ضيف
  | 'system_alert'           // تنبيه نظام
  | 'staff_shift'            // مناوبة موظف
  | 'low_occupancy'          // انخفاض الإشغال
  | 'high_demand';           // طلب عالي

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: NotificationType;
  priority: NotificationPriority;
  category: 'bookings' | 'payments' | 'rooms' | 'guests' | 'system' | 'staff';
  requestId?: string;
  bookingId?: string;
  roomId?: string;
  guestId?: string;
  requiresApproval?: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
  timestamp: number;
  expiresAt?: number; // وقت انتهاء الصلاحية
  metadata?: Record<string, any>; // بيانات إضافية
}

const NOTIFICATIONS_KEY = 'smart_notifications';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const LAST_CHECK_KEY = 'last_notification_check';

// إعدادات الإشعارات الافتراضية
const DEFAULT_SETTINGS = {
  enabled: true,
  soundEnabled: true,
  desktopEnabled: true,
  emailEnabled: false,
  types: {
    booking_confirmed: { enabled: true, priority: 'medium' as NotificationPriority },
    booking_cancelled: { enabled: true, priority: 'high' as NotificationPriority },
    payment_received: { enabled: true, priority: 'medium' as NotificationPriority },
    payment_overdue: { enabled: true, priority: 'urgent' as NotificationPriority },
    checkin_reminder: { enabled: true, priority: 'high' as NotificationPriority },
    checkout_reminder: { enabled: true, priority: 'high' as NotificationPriority },
    room_maintenance: { enabled: true, priority: 'medium' as NotificationPriority },
    guest_request: { enabled: true, priority: 'high' as NotificationPriority },
    system_alert: { enabled: true, priority: 'urgent' as NotificationPriority },
    staff_shift: { enabled: true, priority: 'low' as NotificationPriority },
    low_occupancy: { enabled: true, priority: 'medium' as NotificationPriority },
    high_demand: { enabled: true, priority: 'medium' as NotificationPriority }
  }
};

// الحصول على إعدادات الإشعارات
export function getNotificationSettings() {
  try {
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// حفظ إعدادات الإشعارات
export function saveNotificationSettings(settings: any) {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
}

// إضافة إشعار ذكي جديد
export function addSmartNotification(notification: Omit<SmartNotification, 'id' | 'timestamp'>) {
  const settings = getNotificationSettings();

  // التحقق من تفعيل نوع الإشعار
  if (!settings.enabled || !settings.types[notification.type]?.enabled) {
    return null;
  }

  const notifications = getSmartNotifications();

  const newNotification: SmartNotification = {
    ...notification,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    priority: settings.types[notification.type]?.priority || notification.priority
  };

  notifications.unshift(newNotification);

  // حفظ في localStorage
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

  // إرسال event لتحديث كل التابات المفتوحة
  window.dispatchEvent(new CustomEvent('smart-notification-added', {
    detail: newNotification
  }));

  // تشغيل الصوت إذا كان مفعلاً
  if (settings.soundEnabled) {
    playNotificationSound(newNotification);
  }

  // إرسال إشعار سطح المكتب إذا كان مفعلاً
  if (settings.desktopEnabled && 'Notification' in window) {
    showDesktopNotification(newNotification);
  }

  // إرسال الإشعار للأجهزة الأخرى
  broadcastSmartNotification(newNotification);

  return newNotification;
}

// الحصول على جميع الإشعارات الذكية
export function getSmartNotifications(): SmartNotification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications = stored ? JSON.parse(stored) : [];

    // تنظيف الإشعارات المنتهية الصلاحية
    const now = Date.now();
    const validNotifications = notifications.filter((n: SmartNotification) =>
      !n.expiresAt || n.expiresAt > now
    );

    if (validNotifications.length !== notifications.length) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(validNotifications));
    }

    return validNotifications;
  } catch {
    return [];
  }
}

// الحصول على الإشعارات حسب الفئة
export function getNotificationsByCategory(category: string): SmartNotification[] {
  return getSmartNotifications().filter(n => n.category === category);
}

// الحصول على الإشعارات حسب الأولوية
export function getNotificationsByPriority(priority: NotificationPriority): SmartNotification[] {
  return getSmartNotifications().filter(n => n.priority === priority);
}

// الحصول على الإشعارات التي تحتاج إجراء
export function getActionRequiredNotifications(): SmartNotification[] {
  return getSmartNotifications().filter(n => n.actionRequired && n.unread);
}

// تحديد إشعار كمقروء
export function markSmartNotificationAsRead(notificationId: string) {
  const notifications = getSmartNotifications();
  const updated = notifications.map(n =>
    n.id === notificationId ? { ...n, unread: false } : n
  );

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('smart-notifications-updated'));
}

// تحديد جميع الإشعارات كمقروءة
export function markAllSmartNotificationsAsRead() {
  const notifications = getSmartNotifications();
  const updated = notifications.map(n => ({ ...n, unread: false }));

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('smart-notifications-updated'));
}

// حذف إشعار ذكي
export function deleteSmartNotification(notificationId: string) {
  const notifications = getSmartNotifications();
  const updated = notifications.filter(n => n.id !== notificationId);

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('smart-notifications-updated'));
}

// تشغيل صوت الإشعار
function playNotificationSound(notification: SmartNotification) {
  try {
    console.log('🔊 Playing notification sound for:', notification.type, notification.priority);
    
    // تحديد الصوت المناسب
    let soundFile = '/sounds/notification.mp3';
    
    if (notification.priority === 'urgent' || notification.type === 'guest_request') {
      soundFile = '/sounds/long-notification.mp3'; // صوت طويل للطلبات المهمة
    }
    
    // تشغيل الصوت
    const audio = new Audio(soundFile);
    audio.volume = 0.5;
    audio.play()
      .then(() => console.log('✅ Notification sound played successfully'))
      .catch(err => console.warn('⚠️ Failed to play notification sound:', err));
  } catch (error) {
    console.warn('❌ Error playing notification sound:', error);
  }
}

// إظهار إشعار سطح المكتب
function showDesktopNotification(notification: SmartNotification) {
  try {
    if (Notification.permission === 'granted') {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/app-logo.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });

      desktopNotification.onclick = () => {
        // فتح الصفحة المناسبة
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
        desktopNotification.close();
      };

      // إغلاق تلقائي بعد 5 ثواني (إلا إذا كان طارئ)
      if (notification.priority !== 'urgent') {
        setTimeout(() => desktopNotification.close(), 5000);
      }
    }
  } catch (error) {
    console.warn('Failed to show desktop notification:', error);
  }
}

// إرسال الإشعار للأجهزة الأخرى
async function broadcastSmartNotification(notification: SmartNotification) {
  try {
    const broadcastKey = `smart_broadcast_${notification.timestamp}`;
    localStorage.setItem(broadcastKey, JSON.stringify(notification));

    // يمكن استبداله بـ API call لاحقاً
  } catch (error) {
    console.error('Failed to broadcast smart notification:', error);
  }
}

// فحص الإشعارات الجديدة من الأجهزة الأخرى
export function checkForNewSmartBroadcasts(): SmartNotification[] {
  const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0');
  const newNotifications: SmartNotification[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('smart_broadcast_')) {
      try {
        const notification = JSON.parse(localStorage.getItem(key) || '');

        if (notification.timestamp > lastCheck) {
          const existing = getSmartNotifications();
          if (!existing.find(n => n.id === notification.id)) {
            newNotifications.push(notification);
          }
        }

        // حذف البث القديم (أكثر من ساعة)
        if (Date.now() - notification.timestamp > 3600000) {
          localStorage.removeItem(key);
        }
      } catch {
        if (key) localStorage.removeItem(key);
      }
    }
  }

  return newNotifications;
}

// دمج الإشعارات الجديدة
export function mergeNewSmartNotifications(newNotifications: SmartNotification[]) {
  if (newNotifications.length === 0) return;

  console.log('🔄 Merging new smart notifications:', newNotifications);

  const existing = getSmartNotifications();
  const merged = [...newNotifications, ...existing];
  const unique = merged.filter((n, index, self) =>
    index === self.findIndex(t => t.id === n.id)
  );

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(unique));
  window.dispatchEvent(new Event('smart-notifications-updated'));
}

// بدء المراقبة التلقائية
export function startSmartNotificationSync(callback: (newNotifications: SmartNotification[]) => void) {
  const interval = setInterval(() => {
    const newNotifications = checkForNewSmartBroadcasts();

    if (newNotifications.length > 0) {
      mergeNewSmartNotifications(newNotifications);
      updateLastCheck();
      callback(newNotifications);
    }
  }, 3000);

  return () => clearInterval(interval);
}

// إنشاء إشعارات تلقائية للأحداث المختلفة
export function createAutomaticNotifications() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // فحص الحجوزات القادمة
  checkUpcomingBookings(today);

  // فحص المدفوعات المتأخرة
  checkOverduePayments();

  // فحص الخروج اليوم
  checkTodayCheckouts(today);

  // فحص الدخول اليوم
  checkTodayCheckins(today);

  // فحص معدل الإشغال
  checkOccupancyRate();
}

// فحص الحجوزات القادمة
function checkUpcomingBookings(today: string) {
  try {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    bookings.forEach((booking: any) => {
      if (booking.status === 'قادمة' && booking.checkInDate === tomorrowStr) {
        // إشعار تذكير بالحجز القادم
        const existing = getSmartNotifications().find(n =>
          n.type === 'checkin_reminder' && n.bookingId === booking.id
        );

        if (!existing) {
          addSmartNotification({
            title: 'تذكير: دخول ضيف غداً',
            message: `الضيف ${booking.guestName} سيصل غداً - غرفة ${booking.roomName}`,
            time: 'الآن',
            unread: true,
            type: 'checkin_reminder',
            priority: 'high',
            category: 'bookings',
            bookingId: booking.id,
            actionRequired: true,
            actionUrl: `/dashboard/bookings/${booking.id}`,
            expiresAt: tomorrow.getTime() + (24 * 60 * 60 * 1000) // تنتهي بعد 24 ساعة
          });
        }
      }
    });
  } catch (error) {
    console.warn('Failed to check upcoming bookings:', error);
  }
}

// فحص المدفوعات المتأخرة
function checkOverduePayments() {
  try {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const now = Date.now();

    bookings.forEach((booking: any) => {
      if (booking.remainingBalance > 0) {
        const checkOutDate = new Date(booking.checkOutDate.split('-').reverse().join('-'));
        const daysSinceCheckout = Math.floor((now - checkOutDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceCheckout > 0) {
          // إشعار تأخر دفع
          const existing = getSmartNotifications().find(n =>
            n.type === 'payment_overdue' && n.bookingId === booking.id
          );

          if (!existing) {
            addSmartNotification({
              title: 'تأخر في الدفع',
              message: `متبقي ${booking.remainingBalance} ر.س من حجز ${booking.bookingNumber}`,
              time: 'الآن',
              unread: true,
              type: 'payment_overdue',
              priority: 'urgent',
              category: 'payments',
              bookingId: booking.id,
              actionRequired: true,
              actionUrl: `/dashboard/payments/${booking.id}`,
              metadata: { overdueDays: daysSinceCheckout, amount: booking.remainingBalance }
            });
          }
        }
      }
    });
  } catch (error) {
    console.warn('Failed to check overdue payments:', error);
  }
}

// فحص خروج اليوم
function checkTodayCheckouts(today: string) {
  try {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

    bookings.forEach((booking: any) => {
      if (booking.status === 'جاهز_خروج' && booking.checkOutDate === today) {
        const existing = getSmartNotifications().find(n =>
          n.type === 'checkout_reminder' && n.bookingId === booking.id
        );

        if (!existing) {
          addSmartNotification({
            title: 'تذكير: خروج ضيف اليوم',
            message: `الضيف ${booking.guestName} سيغادر اليوم - غرفة ${booking.roomName}`,
            time: 'الآن',
            unread: true,
            type: 'checkout_reminder',
            priority: 'high',
            category: 'bookings',
            bookingId: booking.id,
            actionRequired: true,
            actionUrl: `/dashboard/bookings/${booking.id}`,
            expiresAt: Date.now() + (12 * 60 * 60 * 1000) // تنتهي بعد 12 ساعة
          });
        }
      }
    });
  } catch (error) {
    console.warn('Failed to check today checkouts:', error);
  }
}

// فحص دخول اليوم
function checkTodayCheckins(today: string) {
  try {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

    bookings.forEach((booking: any) => {
      if (booking.status === 'جاهز_دخول' && booking.checkInDate === today) {
        const existing = getSmartNotifications().find(n =>
          n.type === 'checkin_reminder' && n.bookingId === booking.id
        );

        if (!existing) {
          addSmartNotification({
            title: 'تذكير: دخول ضيف اليوم',
            message: `الضيف ${booking.guestName} سيصل اليوم - غرفة ${booking.roomName}`,
            time: 'الآن',
            unread: true,
            type: 'checkin_reminder',
            priority: 'high',
            category: 'bookings',
            bookingId: booking.id,
            actionRequired: true,
            actionUrl: `/dashboard/bookings/${booking.id}`,
            expiresAt: Date.now() + (12 * 60 * 60 * 1000) // تنتهي بعد 12 ساعة
          });
        }
      }
    });
  } catch (error) {
    console.warn('Failed to check today checkins:', error);
  }
}

// فحص معدل الإشغال
function checkOccupancyRate() {
  try {
    // حساب معدل الإشغال (افتراضي 50 غرفة)
    const totalRooms = 50;
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const activeBookings = bookings.filter((b: any) =>
      ['قائمة', 'جاهز_دخول', 'جاهز_خروج'].includes(b.status)
    ).length;

    const occupancyRate = Math.round((activeBookings / totalRooms) * 100);

    // إشعار انخفاض الإشغال
    if (occupancyRate < 30) {
      const existing = getSmartNotifications().find(n =>
        n.type === 'low_occupancy' &&
        new Date().toDateString() === new Date(n.timestamp).toDateString()
      );

      if (!existing) {
        addSmartNotification({
          title: 'انخفاض معدل الإشغال',
          message: `معدل الإشغال الحالي ${occupancyRate}% - يمكن تحسين الإيرادات`,
          time: 'الآن',
          unread: true,
          type: 'low_occupancy',
          priority: 'medium',
          category: 'system',
          actionRequired: false,
          actionUrl: '/dashboard/analytics',
          metadata: { occupancyRate, totalRooms, activeBookings }
        });
      }
    }

    // إشعار طلب عالي
    else if (occupancyRate > 85) {
      const existing = getSmartNotifications().find(n =>
        n.type === 'high_demand' &&
        new Date().toDateString() === new Date(n.timestamp).toDateString()
      );

      if (!existing) {
        addSmartNotification({
          title: 'طلب عالي على الغرف',
          message: `معدل الإشغال ${occupancyRate}% - يمكن رفع الأسعار`,
          time: 'الآن',
          unread: true,
          type: 'high_demand',
          priority: 'medium',
          category: 'system',
          actionRequired: false,
          actionUrl: '/dashboard/pricing',
          metadata: { occupancyRate, totalRooms, activeBookings }
        });
      }
    }
  } catch (error) {
    console.warn('Failed to check occupancy rate:', error);
  }
}

// تحديث آخر وقت فحص
export function updateLastCheck() {
  localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
}

// الحصول على إحصائيات الإشعارات
export function getNotificationStats() {
  const notifications = getSmartNotifications();
  const unread = notifications.filter(n => n.unread);
  const urgent = notifications.filter(n => n.priority === 'urgent' && n.unread);
  const actionRequired = notifications.filter(n => n.actionRequired && n.unread);

  return {
    total: notifications.length,
    unread: unread.length,
    urgent: urgent.length,
    actionRequired: actionRequired.length,
    byCategory: {
      bookings: notifications.filter(n => n.category === 'bookings').length,
      payments: notifications.filter(n => n.category === 'payments').length,
      rooms: notifications.filter(n => n.category === 'rooms').length,
      guests: notifications.filter(n => n.category === 'guests').length,
      system: notifications.filter(n => n.category === 'system').length,
      staff: notifications.filter(n => n.category === 'staff').length
    }
  };
}

// طلب إذن الإشعارات
export function requestNotificationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('Notification' in window)) {
      resolve(false);
      return;
    }

    if (Notification.permission === 'granted') {
      resolve(true);
      return;
    }

    if (Notification.permission === 'denied') {
      resolve(false);
      return;
    }

    Notification.requestPermission().then((permission) => {
      resolve(permission === 'granted');
    });
  });
}
