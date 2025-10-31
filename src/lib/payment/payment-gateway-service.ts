/**
 * 💳 خدمة بوابات الدفع الموحدة
 * Unified Payment Gateway Service
 * 
 * تدعم:
 * - Stripe
 * - PayPal
 * - STC Pay
 * - Mada (عبر HyperPay)
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

export type PaymentProvider = 'stripe' | 'paypal' | 'stcpay' | 'mada' | 'hyperpay';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'wallet' | 'bank_transfer' | 'cash';
export type Currency = 'SAR' | 'USD' | 'EUR' | 'AED';

export interface PaymentTransaction {
  id?: string;
  transactionId: string; // معرف فريد للمعاملة
  bookingId?: string;
  guestId?: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  
  // المبالغ
  amount: number;
  currency: Currency;
  fee: number; // رسوم البوابة
  netAmount: number; // المبلغ الصافي
  
  // الحالة
  status: PaymentStatus;
  statusHistory: PaymentStatusUpdate[];
  
  // تفاصيل المزود
  providerTransactionId?: string; // معرف المعاملة عند المزود
  providerResponse?: any; // استجابة البوابة الكاملة
  
  // البيانات الوصفية
  description?: string;
  metadata?: Record<string, any>;
  
  // URLs
  successUrl?: string;
  cancelUrl?: string;
  callbackUrl?: string;
  
  // معلومات الدفع
  cardLast4?: string; // آخر 4 أرقام من البطاقة
  cardBrand?: string; // نوع البطاقة (Visa, Mastercard, etc.)
  payerEmail?: string;
  payerPhone?: string;
  payerName?: string;
  
  // الأمان
  securityCode?: string; // 3D Secure code
  isSecure: boolean;
  
  // أخطاء
  errorCode?: string;
  errorMessage?: string;
  
  // التواريخ
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  refundedAt?: Timestamp;
  
  // Webhooks
  webhookReceived: boolean;
  webhookData?: any;
}

export interface PaymentStatusUpdate {
  status: PaymentStatus;
  timestamp: Timestamp;
  reason?: string;
  by?: string; // system, admin, user
}

export interface PaymentConfig {
  provider: PaymentProvider;
  isActive: boolean;
  isTestMode: boolean;
  
  // API Keys (مشفرة في production)
  publicKey: string;
  secretKey: string;
  merchantId?: string;
  
  // إعدادات
  currency: Currency;
  minAmount: number;
  maxAmount: number;
  feePercentage: number; // نسبة الرسوم
  feeFixed: number; // رسوم ثابتة
  
  // Webhooks
  webhookUrl: string;
  webhookSecret?: string;
  
  // UI Settings
  displayName: string;
  displayNameAr: string;
  logo: string;
  description?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaymentIntent {
  amount: number;
  currency: Currency;
  provider: PaymentProvider;
  method: PaymentMethod;
  description?: string;
  metadata?: Record<string, any>;
  successUrl: string;
  cancelUrl: string;
  bookingId?: string;
  guestId?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount?: number; // إذا كان فارغ = استرداد كامل
  reason: string;
  requestedBy: string;
}

export interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  totalFees: number;
  completedCount: number;
  failedCount: number;
  refundedCount: number;
  averageAmount: number;
  byProvider: Record<PaymentProvider, {
    count: number;
    amount: number;
    fees: number;
  }>;
  byStatus: Record<PaymentStatus, number>;
}

// =====================================================
// PAYMENT GATEWAY SERVICE
// =====================================================

class PaymentGatewayService {
  
  // =====================================================
  // CONFIGURATION
  // =====================================================
  
  /**
   * حفظ إعدادات بوابة الدفع
   */
  async savePaymentConfig(config: Omit<PaymentConfig, 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const configData = {
        ...config,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'payment_configs'), configData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving payment config:', error);
      throw error;
    }
  }
  
  /**
   * تحديث إعدادات بوابة الدفع
   */
  async updatePaymentConfig(configId: string, updates: Partial<PaymentConfig>): Promise<void> {
    try {
      const configRef = doc(db, 'payment_configs', configId);
      await updateDoc(configRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating payment config:', error);
      throw error;
    }
  }
  
  /**
   * الحصول على إعدادات بوابة معينة
   */
  async getPaymentConfig(provider: PaymentProvider): Promise<PaymentConfig | null> {
    try {
      const q = query(
        collection(db, 'payment_configs'),
        where('provider', '==', provider),
        where('isActive', '==', true),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as PaymentConfig;
    } catch (error) {
      console.error('Error getting payment config:', error);
      return null;
    }
  }
  
  /**
   * الحصول على جميع البوابات المفعلة
   */
  async getActiveProviders(): Promise<PaymentConfig[]> {
    try {
      const q = query(
        collection(db, 'payment_configs'),
        where('isActive', '==', true),
        orderBy('displayName')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentConfig[];
    } catch (error) {
      console.error('Error getting active providers:', error);
      return [];
    }
  }
  
  // =====================================================
  // PAYMENT PROCESSING
  // =====================================================
  
  /**
   * إنشاء معاملة دفع جديدة
   */
  async createPaymentIntent(intent: PaymentIntent): Promise<PaymentTransaction> {
    try {
      // الحصول على إعدادات البوابة
      const config = await this.getPaymentConfig(intent.provider);
      if (!config) {
        throw new Error(`Payment provider ${intent.provider} is not configured or inactive`);
      }
      
      // حساب الرسوم
      const fee = this.calculateFee(intent.amount, config);
      const netAmount = intent.amount - fee;
      
      // إنشاء معرف فريد للمعاملة
      const transactionId = this.generateTransactionId();
      
      // إنشاء المعاملة
      const transaction: Omit<PaymentTransaction, 'id'> = {
        transactionId,
        bookingId: intent.bookingId,
        guestId: intent.guestId,
        provider: intent.provider,
        method: intent.method,
        amount: intent.amount,
        currency: intent.currency,
        fee,
        netAmount,
        status: 'pending',
        statusHistory: [{
          status: 'pending',
          timestamp: Timestamp.now(),
          by: 'system'
        }],
        description: intent.description,
        metadata: intent.metadata,
        successUrl: intent.successUrl,
        cancelUrl: intent.cancelUrl,
        isSecure: false,
        webhookReceived: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // حفظ المعاملة
      const docRef = await addDoc(collection(db, 'payment_transactions'), transaction);
      
      // إنشاء رابط الدفع حسب المزود
      let providerResponse;
      switch (intent.provider) {
        case 'stripe':
          providerResponse = await this.createStripePayment(transaction, config);
          break;
        case 'paypal':
          providerResponse = await this.createPayPalPayment(transaction, config);
          break;
        case 'stcpay':
          providerResponse = await this.createSTCPayPayment(transaction, config);
          break;
        case 'mada':
        case 'hyperpay':
          providerResponse = await this.createHyperPayPayment(transaction, config);
          break;
        default:
          throw new Error(`Provider ${intent.provider} not supported`);
      }
      
      // تحديث المعاملة بمعلومات المزود
      await updateDoc(doc(db, 'payment_transactions', docRef.id), {
        providerTransactionId: providerResponse.id,
        providerResponse,
        updatedAt: Timestamp.now()
      });
      
      return {
        id: docRef.id,
        ...transaction,
        providerTransactionId: providerResponse.id,
        providerResponse
      };
      
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }
  
  /**
   * تحديث حالة المعاملة
   */
  async updateTransactionStatus(
    transactionId: string, 
    status: PaymentStatus, 
    reason?: string,
    by: string = 'system'
  ): Promise<void> {
    try {
      // البحث عن المعاملة
      const q = query(
        collection(db, 'payment_transactions'),
        where('transactionId', '==', transactionId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error(`Transaction ${transactionId} not found`);
      }
      
      const transactionDoc = snapshot.docs[0];
      const transaction = transactionDoc.data() as PaymentTransaction;
      
      // تحديث السجل
      const statusHistory = [...transaction.statusHistory, {
        status,
        timestamp: Timestamp.now(),
        reason,
        by
      }];
      
      const updates: any = {
        status,
        statusHistory,
        updatedAt: Timestamp.now()
      };
      
      // إضافة تاريخ الإكمال أو الاسترداد
      if (status === 'completed') {
        updates.completedAt = Timestamp.now();
      } else if (status === 'refunded') {
        updates.refundedAt = Timestamp.now();
      }
      
      await updateDoc(doc(db, 'payment_transactions', transactionDoc.id), updates);
      
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }
  
  /**
   * معالجة Webhook من بوابة الدفع
   */
  async handleWebhook(provider: PaymentProvider, webhookData: any): Promise<void> {
    try {
      // التحقق من صحة الـ webhook
      const isValid = await this.verifyWebhook(provider, webhookData);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
      
      // استخراج معلومات المعاملة
      const { transactionId, status, providerData } = this.parseWebhookData(provider, webhookData);
      
      // تحديث المعاملة
      const q = query(
        collection(db, 'payment_transactions'),
        where('providerTransactionId', '==', transactionId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const transactionDoc = snapshot.docs[0];
        
        await updateDoc(doc(db, 'payment_transactions', transactionDoc.id), {
          status,
          webhookReceived: true,
          webhookData: providerData,
          updatedAt: Timestamp.now()
        });
        
        // إذا كانت المعاملة مكتملة، تحديث الحجز
        if (status === 'completed') {
          const transaction = transactionDoc.data() as PaymentTransaction;
          if (transaction.bookingId) {
            await this.updateBookingPaymentStatus(transaction.bookingId, 'paid');
          }
        }
      }
      
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }
  
  /**
   * استرداد مبلغ
   */
  async refundPayment(refundRequest: RefundRequest): Promise<void> {
    try {
      // الحصول على المعاملة
      const q = query(
        collection(db, 'payment_transactions'),
        where('transactionId', '==', refundRequest.transactionId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error(`Transaction ${refundRequest.transactionId} not found`);
      }
      
      const transactionDoc = snapshot.docs[0];
      const transaction = transactionDoc.data() as PaymentTransaction;
      
      // التحقق من إمكانية الاسترداد
      if (transaction.status !== 'completed') {
        throw new Error('Cannot refund a transaction that is not completed');
      }
      
      // حساب مبلغ الاسترداد
      const refundAmount = refundRequest.amount || transaction.amount;
      if (refundAmount > transaction.amount) {
        throw new Error('Refund amount cannot exceed original amount');
      }
      
      // الحصول على إعدادات البوابة
      const config = await this.getPaymentConfig(transaction.provider);
      if (!config) {
        throw new Error('Payment provider not configured');
      }
      
      // تنفيذ الاسترداد حسب المزود
      let refundResponse;
      switch (transaction.provider) {
        case 'stripe':
          refundResponse = await this.refundStripePayment(transaction, refundAmount, config);
          break;
        case 'paypal':
          refundResponse = await this.refundPayPalPayment(transaction, refundAmount, config);
          break;
        case 'stcpay':
          refundResponse = await this.refundSTCPayPayment(transaction, refundAmount, config);
          break;
        case 'hyperpay':
          refundResponse = await this.refundHyperPayPayment(transaction, refundAmount, config);
          break;
        default:
          throw new Error(`Refund not supported for ${transaction.provider}`);
      }
      
      // تحديث المعاملة
      await this.updateTransactionStatus(
        refundRequest.transactionId,
        'refunded',
        refundRequest.reason,
        refundRequest.requestedBy
      );
      
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }
  
  // =====================================================
  // PROVIDER-SPECIFIC IMPLEMENTATIONS
  // =====================================================
  
  /**
   * إنشاء دفع عبر Stripe
   */
  private async createStripePayment(transaction: Omit<PaymentTransaction, 'id'>, config: PaymentConfig): Promise<any> {
    // في الإنتاج، استخدم Stripe SDK الحقيقي
    // هنا نموذج توضيحي فقط
    
    if (!config.secretKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    // محاكاة استدعاء Stripe API
    return {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      object: 'payment_intent',
      amount: Math.round(transaction.amount * 100), // Stripe يستخدم cents
      currency: transaction.currency.toLowerCase(),
      status: 'requires_payment_method',
      client_secret: `pi_secret_${Math.random().toString(36).substr(2, 9)}`,
      payment_method_types: ['card'],
      metadata: transaction.metadata
    };
  }
  
  /**
   * إنشاء دفع عبر PayPal
   */
  private async createPayPalPayment(transaction: Omit<PaymentTransaction, 'id'>, config: PaymentConfig): Promise<any> {
    // محاكاة استدعاء PayPal API
    return {
      id: `PAYID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'CREATED',
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=EC-${Math.random().toString(36).substr(2, 9)}`,
          rel: 'approval_url',
          method: 'GET'
        }
      ]
    };
  }
  
  /**
   * إنشاء دفع عبر STC Pay
   */
  private async createSTCPayPayment(transaction: Omit<PaymentTransaction, 'id'>, config: PaymentConfig): Promise<any> {
    // محاكاة استدعاء STC Pay API
    return {
      id: `STC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      paymentUrl: `https://stcpay.com.sa/payment/${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
  }
  
  /**
   * إنشاء دفع عبر HyperPay (Mada)
   */
  private async createHyperPayPayment(transaction: Omit<PaymentTransaction, 'id'>, config: PaymentConfig): Promise<any> {
    // محاكاة استدعاء HyperPay API
    return {
      id: `HP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      checkoutId: Math.random().toString(36).substr(2, 32),
      redirectUrl: `https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${Math.random().toString(36).substr(2, 32)}`,
      status: 'pending'
    };
  }
  
  /**
   * استرداد من Stripe
   */
  private async refundStripePayment(transaction: PaymentTransaction, amount: number, config: PaymentConfig): Promise<any> {
    return { id: `re_${Date.now()}`, status: 'succeeded', amount: Math.round(amount * 100) };
  }
  
  /**
   * استرداد من PayPal
   */
  private async refundPayPalPayment(transaction: PaymentTransaction, amount: number, config: PaymentConfig): Promise<any> {
    return { id: `REFUND-${Date.now()}`, status: 'COMPLETED', amount: { value: amount, currency: transaction.currency } };
  }
  
  /**
   * استرداد من STC Pay
   */
  private async refundSTCPayPayment(transaction: PaymentTransaction, amount: number, config: PaymentConfig): Promise<any> {
    return { id: `STCREF-${Date.now()}`, status: 'completed', amount };
  }
  
  /**
   * استرداد من HyperPay
   */
  private async refundHyperPayPayment(transaction: PaymentTransaction, amount: number, config: PaymentConfig): Promise<any> {
    return { id: `HPREF-${Date.now()}`, status: 'succeeded', amount };
  }
  
  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================
  
  /**
   * حساب رسوم المعاملة
   */
  private calculateFee(amount: number, config: PaymentConfig): number {
    const percentageFee = (amount * config.feePercentage) / 100;
    return percentageFee + config.feeFixed;
  }
  
  /**
   * توليد معرف فريد للمعاملة
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `TXN-${timestamp}-${random}`.toUpperCase();
  }
  
  /**
   * التحقق من صحة Webhook
   */
  private async verifyWebhook(provider: PaymentProvider, webhookData: any): Promise<boolean> {
    // في الإنتاج، التحقق من التوقيع الرقمي
    // هنا نرجع true للتوضيح
    return true;
  }
  
  /**
   * تحليل بيانات Webhook
   */
  private parseWebhookData(provider: PaymentProvider, webhookData: any): { 
    transactionId: string; 
    status: PaymentStatus; 
    providerData: any 
  } {
    // تحليل البيانات حسب المزود
    switch (provider) {
      case 'stripe':
        return {
          transactionId: webhookData.data?.object?.id || '',
          status: this.mapStripeStatus(webhookData.data?.object?.status),
          providerData: webhookData.data?.object
        };
      case 'paypal':
        return {
          transactionId: webhookData.resource?.id || '',
          status: this.mapPayPalStatus(webhookData.resource?.status),
          providerData: webhookData.resource
        };
      default:
        return {
          transactionId: webhookData.id || '',
          status: 'processing',
          providerData: webhookData
        };
    }
  }
  
  /**
   * تحويل حالة Stripe إلى حالتنا
   */
  private mapStripeStatus(stripeStatus?: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'pending',
      'requires_action': 'processing',
      'processing': 'processing',
      'succeeded': 'completed',
      'canceled': 'cancelled',
      'requires_capture': 'processing'
    };
    return statusMap[stripeStatus || ''] || 'pending';
  }
  
  /**
   * تحويل حالة PayPal إلى حالتنا
   */
  private mapPayPalStatus(paypalStatus?: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'CREATED': 'pending',
      'SAVED': 'pending',
      'APPROVED': 'processing',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled',
      'FAILED': 'failed',
      'REFUNDED': 'refunded'
    };
    return statusMap[paypalStatus || ''] || 'pending';
  }
  
  /**
   * تحديث حالة الدفع للحجز
   */
  private async updateBookingPaymentStatus(bookingId: string, status: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        paymentStatus: status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating booking payment status:', error);
    }
  }
  
  // =====================================================
  // QUERIES & REPORTS
  // =====================================================
  
  /**
   * الحصول على معاملة معينة
   */
  async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    try {
      const q = query(
        collection(db, 'payment_transactions'),
        where('transactionId', '==', transactionId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as PaymentTransaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  }
  
  /**
   * الحصول على معاملات ضيف معين
   */
  async getGuestTransactions(guestId: string): Promise<PaymentTransaction[]> {
    try {
      const q = query(
        collection(db, 'payment_transactions'),
        where('guestId', '==', guestId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentTransaction[];
    } catch (error) {
      console.error('Error getting guest transactions:', error);
      return [];
    }
  }
  
  /**
   * الحصول على إحصائيات الدفع
   */
  async getPaymentStats(startDate?: Date, endDate?: Date): Promise<PaymentStats> {
    try {
      let q = query(collection(db, 'payment_transactions'));
      
      if (startDate) {
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where('createdAt', '<=', Timestamp.fromDate(endDate)));
      }
      
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => doc.data() as PaymentTransaction);
      
      const stats: PaymentStats = {
        totalTransactions: transactions.length,
        totalAmount: 0,
        totalFees: 0,
        completedCount: 0,
        failedCount: 0,
        refundedCount: 0,
        averageAmount: 0,
        byProvider: {} as any,
        byStatus: {} as any
      };
      
      transactions.forEach(txn => {
        stats.totalAmount += txn.amount;
        stats.totalFees += txn.fee;
        
        // Count by status
        if (txn.status === 'completed') stats.completedCount++;
        if (txn.status === 'failed') stats.failedCount++;
        if (txn.status === 'refunded') stats.refundedCount++;
        
        // Group by provider
        if (!stats.byProvider[txn.provider]) {
          stats.byProvider[txn.provider] = { count: 0, amount: 0, fees: 0 };
        }
        stats.byProvider[txn.provider].count++;
        stats.byProvider[txn.provider].amount += txn.amount;
        stats.byProvider[txn.provider].fees += txn.fee;
        
        // Group by status
        stats.byStatus[txn.status] = (stats.byStatus[txn.status] || 0) + 1;
      });
      
      stats.averageAmount = transactions.length > 0 
        ? stats.totalAmount / transactions.length 
        : 0;
      
      return stats;
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  }
  
  /**
   * الاشتراك في تحديثات المعاملة
   */
  subscribeToTransaction(transactionId: string, callback: (transaction: PaymentTransaction) => void): () => void {
    const q = query(
      collection(db, 'payment_transactions'),
      where('transactionId', '==', transactionId),
      limit(1)
    );
    
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        callback({ id: doc.id, ...doc.data() } as PaymentTransaction);
      }
    });
  }
}

// تصدير instance واحد
export const paymentGatewayService = new PaymentGatewayService();

// تصدير الوظائف الرئيسية
export const {
  savePaymentConfig,
  updatePaymentConfig,
  getPaymentConfig,
  getActiveProviders,
  createPaymentIntent,
  updateTransactionStatus,
  handleWebhook,
  refundPayment,
  getTransaction,
  getGuestTransactions,
  getPaymentStats,
  subscribeToTransaction
} = paymentGatewayService;
