import { addGuestRequest as addRequest } from './requests-management';
import { addSmartNotification } from './notification-service';
import type { GuestRequest } from './requests-management';

/**
 * إضافة طلب جديد مع إشعار صوتي
 */
export const addGuestRequest = (request: GuestRequest): void => {
  // إضافة الطلب
  addRequest(request);

  // إضافة إشعار ذكي مع صوت
  addSmartNotification({
    title: 'طلب جديد من نزيل',
    message: `غرفة ${request.room}: ${request.description}`,
    time: new Date().toISOString(),
    unread: true,
    type: 'guest_request',
    priority: 'high',
    category: 'guests',
    requestId: request.id,
    actionRequired: true,
    actionUrl: `/dashboard/requests/${request.id}`,
  });
};