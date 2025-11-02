/**
 * 🔔 نظام الإشعارات المتكامل
 * Unified Notification Service
 * 
 * يدعم:
 * - WhatsApp Business API
 * - SMS (Twilio, Unifonic)
 * - Email (SendGrid, AWS SES)
 * - إشعارات داخل النظام (In-App)
 * - Push Notifications
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export type NotificationChannel = 'whatsapp' | 'sms' | 'email' | 'in_app' | 'push';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationType = 
  | 'booking_confirmation' 
  | 'booking_reminder' 
  | 'payment_received'
  | 'check_in_reminder'
  | 'check_out_reminder'
  | 'order_received'
  | 'order_ready'
  | 'maintenance_scheduled'
  | 'marketing_campaign'
  | 'custom';

export interface NotificationTemplate {
  id?: string;
  name: string;
  nameAr: string;
  type: NotificationType;
  channel: NotificationChannel;
  
  // المحتوى
  subject?: string; // للبريد الإلكتروني
  subjectAr?: string;
  body: string;
  bodyAr: string;
  
  // Variables في القالب (مثل: {guestName}, {bookingId}, {amount})
  variables: string[];
  
  // الإعدادات
  isActive: boolean;
  priority: NotificationPriority;
  
  // WhatsApp specific
  whatsappTemplateId?: string;
  whatsappLanguage?: string;
  
  // الوسائط
  mediaUrl?: string;
  attachments?: string[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NotificationLog {
  id?: string;
  channel: NotificationChannel;
  type: NotificationType;
  recipient: string; // phone, email, userId
  recipientName?: string;
  
  // المحتوى المرسل
  subject?: string;
  body: string;
  mediaUrl?: string;
  
  // الحالة
  status: NotificationStatus;
  statusHistory: NotificationStatusUpdate[];
  
  // معلومات المزود
  provider?: string; // twilio, unifonic, sendgrid, etc.
  providerMessageId?: string;
  providerResponse?: any;
  
  // الأخطاء
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  
  // الوقت
  createdAt: Timestamp;
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  readAt?: Timestamp;
  
  // البيانات الوصفية
  metadata?: Record<string, any>;
  bookingId?: string;
  guestId?: string;
}

export interface NotificationStatusUpdate {
  status: NotificationStatus;
  timestamp: Timestamp;
  reason?: string;
}

export interface WhatsAppConfig {
  isActive: boolean;
  provider: 'whatsapp_business_api' | 'twilio' | 'custom';
  
  // WhatsApp Business API
  accessToken?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  
  // Twilio WhatsApp
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  
  webhookUrl: string;
  webhookSecret?: string;
}

export interface SMSConfig {
  isActive: boolean;
  provider: 'twilio' | 'unifonic' | 'custom';
  
  // Twilio
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  
  // Unifonic
  appSid?: string;
  senderName?: string;
  
  // الإعدادات
  maxLength: number;
  arabicSupport: boolean;
  unicodeEnabled: boolean;
}

export interface EmailConfig {
  isActive: boolean;
  provider: 'sendgrid' | 'aws_ses' | 'smtp' | 'custom';
  
  // SendGrid
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  
  // AWS SES
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  
  // SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  
  // إعدادات
  replyToEmail?: string;
  ccEmails?: string[];
  bccEmails?: string[];
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  byChannel: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
    rate: number;
  }>;
  byType: Record<NotificationType, number>;
}

// =====================================================
// NOTIFICATION SERVICE
// =====================================================

class NotificationService {
  
  // =====================================================
  // CONFIGURATION
  // =====================================================
  
  /**
   * حفظ إعدادات WhatsApp
   */
  async saveWhatsAppConfig(config: WhatsAppConfig): Promise<void> {
    try {
      await updateDoc(doc(db, 'notification_configs', 'whatsapp'), {
        ...config,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      throw error;
    }
  }
  
  /**
   * حفظ إعدادات SMS
   */
  async saveSMSConfig(config: SMSConfig): Promise<void> {
    try {
      await updateDoc(doc(db, 'notification_configs', 'sms'), {
        ...config,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error saving SMS config:', error);
      throw error;
    }
  }
  
  /**
   * حفظ إعدادات Email
   */
  async saveEmailConfig(config: EmailConfig): Promise<void> {
    try {
      await updateDoc(doc(db, 'notification_configs', 'email'), {
        ...config,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error saving Email config:', error);
      throw error;
    }
  }
  
  /**
   * الحصول على إعدادات القناة
   */
  async getChannelConfig(channel: NotificationChannel): Promise<any> {
    try {
      const docRef = doc(db, 'notification_configs', channel);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error getting channel config:', error);
      return null;
    }
  }
  
  // =====================================================
  // TEMPLATES
  // =====================================================
  
  /**
   * إنشاء قالب إشعار جديد
   */
  async createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const templateData = {
        ...template,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'notification_templates'), templateData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }
  
  /**
   * الحصول على القوالب حسب النوع
   */
  async getTemplates(type?: NotificationType, channel?: NotificationChannel): Promise<NotificationTemplate[]> {
    try {
      let q = query(collection(db, 'notification_templates'), where('isActive', '==', true));
      
      if (type) {
        q = query(q, where('type', '==', type));
      }
      if (channel) {
        q = query(q, where('channel', '==', channel));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationTemplate[];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }
  
  /**
   * ملء متغيرات القالب
   */
  private fillTemplate(template: string, variables: Record<string, any>): string {
    let result = template;
    Object.keys(variables).forEach(key => {
      const value = variables[key] || '';
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return result;
  }
  
  // =====================================================
  // SEND NOTIFICATIONS
  // =====================================================
  
  /**
   * إرسال إشعار واحد
   */
  async sendNotification(
    channel: NotificationChannel,
    recipient: string,
    content: {
      subject?: string;
      body: string;
      mediaUrl?: string;
      type?: NotificationType;
      priority?: NotificationPriority;
      metadata?: Record<string, any>;
    }
  ): Promise<NotificationLog> {
    try {
      // إنشاء سجل الإشعار - تأكد من عدم تمرير قيم undefined إلى Firestore
      const logBase: Omit<NotificationLog, 'id'> = {
        channel,
        type: content.type || 'custom',
        recipient,
        body: content.body,
        status: 'pending',
        statusHistory: [{
          status: 'pending',
          timestamp: Timestamp.now()
        }],
        retryCount: 0,
        maxRetries: 3,
        createdAt: Timestamp.now(),
        metadata: content.metadata || {}
      };

      // أضف الحقول الاختيارية فقط إذا كانت معرفة
      const log: Omit<NotificationLog, 'id'> = {
        ...logBase,
        ...(typeof content.subject !== 'undefined' && content.subject !== null ? { subject: content.subject } : {}),
        ...(typeof content.mediaUrl !== 'undefined' && content.mediaUrl !== null ? { mediaUrl: content.mediaUrl } : {})
      };
      
      // حفظ السجل
      const docRef = await addDoc(collection(db, 'notification_logs'), log);
      const logId = docRef.id;
      
      // إرسال الإشعار حسب القناة
      let result;
      switch (channel) {
        case 'whatsapp':
          result = await this.sendWhatsApp(recipient, content.body, content.mediaUrl);
          break;
        case 'sms':
          result = await this.sendSMS(recipient, content.body);
          break;
        case 'email':
          result = await this.sendEmail(recipient, content.subject || '', content.body, content.mediaUrl);
          break;
        case 'in_app':
          result = await this.sendInAppNotification(recipient, content.body);
          break;
        case 'push':
          result = await this.sendPushNotification(recipient, content.subject || '', content.body);
          break;
        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }
      
      // تحديث السجل بالنتيجة
      await updateDoc(doc(db, 'notification_logs', logId), {
        status: 'sent',
        sentAt: Timestamp.now(),
        providerMessageId: result.messageId,
        providerResponse: result,
        statusHistory: [
          ...log.statusHistory,
          { status: 'sent', timestamp: Timestamp.now() }
        ]
      });
      
      return {
        id: logId,
        ...log,
        status: 'sent',
        sentAt: Timestamp.now(),
        providerMessageId: result.messageId,
        providerResponse: result
      };
      
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
  
  /**
   * إرسال إشعارات جماعية
   */
  async sendBulkNotifications(
    channel: NotificationChannel,
    recipients: string[],
    content: {
      subject?: string;
      body: string;
      mediaUrl?: string;
      type?: NotificationType;
    }
  ): Promise<NotificationLog[]> {
    const results: NotificationLog[] = [];
    
    for (const recipient of recipients) {
      try {
        const log = await this.sendNotification(channel, recipient, content);
        results.push(log);
      } catch (error) {
        console.error(`Error sending to ${recipient}:`, error);
      }
    }
    
    return results;
  }
  
  // =====================================================
  // WHATSAPP
  // =====================================================
  
  /**
   * إرسال رسالة WhatsApp
   */
  private async sendWhatsApp(phone: string, message: string, mediaUrl?: string): Promise<any> {
    try {
      const config = await this.getChannelConfig('whatsapp') as WhatsAppConfig;
      
      if (!config || !config.isActive) {
        throw new Error('WhatsApp is not configured or inactive');
      }
      
      // تنسيق رقم الهاتف (إزالة + و 0 وإضافة كود الدولة)
      const formattedPhone = this.formatPhoneNumber(phone);
      
      switch (config.provider) {
        case 'whatsapp_business_api':
          return await this.sendWhatsAppBusinessAPI(formattedPhone, message, mediaUrl, config);
        case 'twilio':
          return await this.sendTwilioWhatsApp(formattedPhone, message, mediaUrl, config);
        default:
          throw new Error(`Unsupported WhatsApp provider: ${config.provider}`);
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      throw error;
    }
  }
  
  /**
   * إرسال عبر WhatsApp Business API
   */
  private async sendWhatsAppBusinessAPI(phone: string, message: string, mediaUrl?: string, config: WhatsAppConfig): Promise<any> {
    // محاكاة استدعاء WhatsApp Business API
    // في الإنتاج، استخدم المكتبة الرسمية
    
    const payload: any = {
      messaging_product: 'whatsapp',
      to: phone,
      type: mediaUrl ? 'image' : 'text'
    };
    
    if (mediaUrl) {
      payload.image = {
        link: mediaUrl,
        caption: message
      };
    } else {
      payload.text = { body: message };
    }
    
    // محاكاة الاستجابة
    return {
      messageId: `wamid.${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      phone
    };
  }
  
  /**
   * إرسال عبر Twilio WhatsApp
   */
  private async sendTwilioWhatsApp(phone: string, message: string, mediaUrl?: string, config: WhatsAppConfig): Promise<any> {
    // محاكاة استدعاء Twilio WhatsApp API
    return {
      messageId: `SM${Math.random().toString(36).substr(2, 32)}`,
      status: 'queued',
      phone
    };
  }
  
  // =====================================================
  // SMS
  // =====================================================
  
  /**
   * إرسال SMS
   */
  private async sendSMS(phone: string, message: string): Promise<any> {
    try {
      const config = await this.getChannelConfig('sms') as SMSConfig;
      
      if (!config || !config.isActive) {
        throw new Error('SMS is not configured or inactive');
      }
      
      const formattedPhone = this.formatPhoneNumber(phone);
      
      switch (config.provider) {
        case 'twilio':
          return await this.sendTwilioSMS(formattedPhone, message, config);
        case 'unifonic':
          return await this.sendUnifonicSMS(formattedPhone, message, config);
        default:
          throw new Error(`Unsupported SMS provider: ${config.provider}`);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
  
  /**
   * إرسال عبر Twilio SMS
   */
  private async sendTwilioSMS(phone: string, message: string, config: SMSConfig): Promise<any> {
    // محاكاة استدعاء Twilio API
    return {
      messageId: `SM${Math.random().toString(36).substr(2, 32)}`,
      status: 'queued',
      phone,
      segments: Math.ceil(message.length / 160)
    };
  }
  
  /**
   * إرسال عبر Unifonic SMS
   */
  private async sendUnifonicSMS(phone: string, message: string, config: SMSConfig): Promise<any> {
    // محاكاة استدعاء Unifonic API
    return {
      messageId: `UNI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'Sent',
      phone,
      cost: 0.05
    };
  }
  
  // =====================================================
  // EMAIL
  // =====================================================
  
  /**
   * إرسال Email
   */
  private async sendEmail(email: string, subject: string, body: string, attachment?: string): Promise<any> {
    try {
      const config = await this.getChannelConfig('email') as EmailConfig;
      
      if (!config || !config.isActive) {
        throw new Error('Email is not configured or inactive');
      }
      
      switch (config.provider) {
        case 'sendgrid':
          return await this.sendSendGridEmail(email, subject, body, attachment, config);
        case 'aws_ses':
          return await this.sendAWSSESEmail(email, subject, body, attachment, config);
        default:
          throw new Error(`Unsupported email provider: ${config.provider}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
  
  /**
   * إرسال عبر SendGrid
   */
  private async sendSendGridEmail(email: string, subject: string, body: string, attachment?: string, config: EmailConfig): Promise<any> {
    // محاكاة استدعاء SendGrid API
    return {
      messageId: `SG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      email
    };
  }
  
  /**
   * إرسال عبر AWS SES
   */
  private async sendAWSSESEmail(email: string, subject: string, body: string, attachment?: string, config: EmailConfig): Promise<any> {
    // محاكاة استدعاء AWS SES API
    return {
      messageId: `SES-${Math.random().toString(36).substr(2, 16)}`,
      status: 'sent',
      email
    };
  }
  
  // =====================================================
  // IN-APP & PUSH
  // =====================================================
  
  /**
   * إرسال إشعار داخل النظام
   */
  private async sendInAppNotification(userId: string, message: string): Promise<any> {
    try {
      const notificationData = {
        userId,
        message,
        isRead: false,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'in_app_notifications'), notificationData);
      
      return {
        messageId: docRef.id,
        status: 'delivered',
        userId
      };
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      throw error;
    }
  }
  
  /**
   * إرسال Push Notification
   */
  private async sendPushNotification(userId: string, title: string, body: string): Promise<any> {
    // محاكاة إرسال Push Notification عبر FCM
    return {
      messageId: `FCM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      userId
    };
  }
  
  // =====================================================
  // AUTOMATED NOTIFICATIONS
  // =====================================================
  
  /**
   * إرسال تأكيد الحجز
   */
  async sendBookingConfirmation(bookingId: string, guestPhone: string, guestEmail: string, guestName: string): Promise<void> {
    const message = `مرحباً ${guestName}! تم تأكيد حجزك رقم ${bookingId}. شكراً لاختياركم فندقنا.`;
    
    // إرسال عبر كل القنوات المفعلة
    await Promise.allSettled([
      this.sendNotification('whatsapp', guestPhone, {
        subject: 'تأكيد الحجز',
        body: message,
        type: 'booking_confirmation',
        metadata: { bookingId }
      }),
      this.sendNotification('sms', guestPhone, {
        subject: 'تأكيد الحجز',
        body: message,
        type: 'booking_confirmation',
        metadata: { bookingId }
      }),
      this.sendNotification('email', guestEmail, {
        subject: 'تأكيد الحجز - Booking Confirmation',
        body: message,
        type: 'booking_confirmation',
        metadata: { bookingId }
      })
    ]);
  }
  
  /**
   * إرسال تذكير تسجيل الوصول
   */
  async sendCheckInReminder(bookingId: string, guestPhone: string, checkInDate: Date): Promise<void> {
    const message = `تذكير: موعد تسجيل الوصول الخاص بك غداً ${checkInDate.toLocaleDateString('ar-SA')}. نتطلع لاستقبالك!`;
    
    await this.sendNotification('whatsapp', guestPhone, {
      subject: 'تذكير بتسجيل الوصول',
      body: message,
      type: 'check_in_reminder',
      priority: 'high',
      metadata: { bookingId }
    });
  }
  
  /**
   * إرسال إيصال الدفع
   */
  async sendPaymentReceipt(paymentId: string, guestEmail: string, amount: number, currency: string): Promise<void> {
    const message = `تم استلام دفعتك بنجاح بقيمة ${amount} ${currency}. رقم العملية: ${paymentId}`;
    
    await this.sendNotification('email', guestEmail, {
      subject: 'إيصال الدفع - Payment Receipt',
      body: message,
      type: 'payment_received',
      metadata: { paymentId, amount, currency }
    });
  }
  
  // =====================================================
  // UTILITIES
  // =====================================================
  
  /**
   * تنسيق رقم الهاتف
   */
  private formatPhoneNumber(phone: string): string {
    // إزالة المسافات والرموز
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // إزالة + إذا كان موجود
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // إزالة 0 في البداية وإضافة كود السعودية إذا لازم
    if (cleaned.startsWith('0')) {
      cleaned = '966' + cleaned.substring(1);
    } else if (!cleaned.startsWith('966')) {
      cleaned = '966' + cleaned;
    }
    
    return cleaned;
  }
  
  /**
   * الحصول على إحصائيات الإشعارات
   */
  async getNotificationStats(startDate?: Date, endDate?: Date): Promise<NotificationStats> {
    try {
      let q = query(collection(db, 'notification_logs'));
      
      if (startDate) {
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where('createdAt', '<=', Timestamp.fromDate(endDate)));
      }
      
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => doc.data() as NotificationLog);
      
      const stats: NotificationStats = {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0,
        byChannel: {} as any,
        byType: {} as any
      };
      
      logs.forEach(log => {
        // إجمالي
        if (log.status === 'sent' || log.status === 'delivered') {
          stats.totalSent++;
        }
        if (log.status === 'delivered') {
          stats.totalDelivered++;
        }
        if (log.status === 'failed') {
          stats.totalFailed++;
        }
        
        // حسب القناة
        if (!stats.byChannel[log.channel]) {
          stats.byChannel[log.channel] = { sent: 0, delivered: 0, failed: 0, rate: 0 };
        }
        if (log.status === 'sent' || log.status === 'delivered') {
          stats.byChannel[log.channel].sent++;
        }
        if (log.status === 'delivered') {
          stats.byChannel[log.channel].delivered++;
        }
        if (log.status === 'failed') {
          stats.byChannel[log.channel].failed++;
        }
        
        // حسب النوع
        stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      });
      
      // حساب معدلات التوصيل
      stats.deliveryRate = stats.totalSent > 0 
        ? (stats.totalDelivered / stats.totalSent) * 100 
        : 0;
      
      Object.keys(stats.byChannel).forEach(channel => {
        const ch = stats.byChannel[channel as NotificationChannel];
        ch.rate = ch.sent > 0 ? (ch.delivered / ch.sent) * 100 : 0;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
  
  /**
   * الاشتراك في تحديثات الإشعار
   */
  subscribeToNotificationUpdates(callback: (logs: NotificationLog[]) => void): () => void {
    const q = query(
      collection(db, 'notification_logs'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationLog[];
      callback(logs);
    });
  }
}

// تصدير instance واحد
export const notificationService = new NotificationService();

// تصدير الوظائف الرئيسية
export const {
  saveWhatsAppConfig,
  saveSMSConfig,
  saveEmailConfig,
  getChannelConfig,
  createTemplate,
  getTemplates,
  sendNotification,
  sendBulkNotifications,
  sendBookingConfirmation,
  sendCheckInReminder,
  sendPaymentReceipt,
  getNotificationStats,
  subscribeToNotificationUpdates
} = notificationService;
