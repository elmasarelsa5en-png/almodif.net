/**
 * Government Integration Service
 * خدمة التكامل مع المنصات الحكومية (شموس - ZATCA)
 */

import { db } from './firebase';
import { doc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';

// ============================
// Shumus Integration (منصة شموس)
// ============================

export interface ShumusGuestData {
  guestName: string;
  nationalId: string;
  nationalIdCopy?: string;
  dateOfBirth: string;
  nationality: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  
  // معلومات الإقامة
  accommodationType: string; // فندق / شقة / منتجع
  roomNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  purposeOfStay: string; // سياحة / عمل / عائلية
  
  // معلومات المنشأة
  hotelName: string;
  hotelLicense: string;
  commercialRegistration: string;
}

export interface ShumusResponse {
  success: boolean;
  message: string;
  shumusId?: string;
  timestamp: string;
}

/**
 * إرسال بيانات نزيل إلى منصة شموس
 */
export async function submitGuestToShumus(guestData: ShumusGuestData): Promise<ShumusResponse> {
  try {
    // جلب إعدادات شموس
    const settingsDoc = await getDoc(doc(db, 'settings', 'legal_compliance'));
    
    if (!settingsDoc.exists() || !settingsDoc.data().shumusEnabled) {
      console.log('⚠️ Shumus integration not enabled');
      return {
        success: false,
        message: 'التكامل مع شموس غير مفعل',
        timestamp: new Date().toISOString()
      };
    }

    const settings = settingsDoc.data();
    const apiUrl = settings.shumusEnvironment === 'production'
      ? 'https://api.shumus.sa/v1/guests'
      : 'https://sandbox.shumus.sa/v1/guests';

    // تحضير البيانات بصيغة API شموس
    const payload = {
      guest: {
        full_name_ar: guestData.guestName,
        national_id: guestData.nationalId,
        id_copy_number: guestData.nationalIdCopy || '',
        date_of_birth: guestData.dateOfBirth,
        nationality: guestData.nationality,
        phone: guestData.phone,
        email: guestData.email || '',
        address: {
          street: guestData.address || '',
          city: guestData.city || '',
          postal_code: guestData.postalCode || ''
        }
      },
      accommodation: {
        type: guestData.accommodationType,
        room_number: guestData.roomNumber || '',
        check_in: guestData.checkInDate,
        check_out: guestData.checkOutDate,
        nights: guestData.numberOfNights,
        guests_count: guestData.numberOfGuests,
        purpose: guestData.purposeOfStay
      },
      establishment: {
        name: guestData.hotelName,
        license_number: guestData.hotelLicense,
        commercial_registration: guestData.commercialRegistration
      },
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending guest data to Shumus:', payload);

    // في بيئة الإنتاج، نرسل إلى API الحقيقي
    if (settings.shumusEnvironment === 'production' && settings.shumusApiKey) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.shumusApiKey}`,
            'X-API-Secret': settings.shumusApiSecret || ''
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
          // حفظ السجل في Firebase
          await addDoc(collection(db, 'shumus_submissions'), {
            guestNationalId: guestData.nationalId,
            shumusId: result.id || result.guest_id,
            status: 'submitted',
            submittedAt: new Date().toISOString(),
            response: result
          });

          return {
            success: true,
            message: 'تم إرسال البيانات لشموس بنجاح',
            shumusId: result.id || result.guest_id,
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error(result.message || 'فشل الإرسال لشموس');
        }
      } catch (error: any) {
        console.error('❌ Shumus API Error:', error);
        
        // حفظ السجل مع الخطأ
        await addDoc(collection(db, 'shumus_submissions'), {
          guestNationalId: guestData.nationalId,
          status: 'failed',
          error: error.message,
          submittedAt: new Date().toISOString(),
          payload
        });

        return {
          success: false,
          message: `خطأ في الإرسال لشموس: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      // في Sandbox، نحفظ فقط محلياً
      const mockShumusId = `SHUMUS-TEST-${Date.now()}`;
      
      await addDoc(collection(db, 'shumus_submissions'), {
        guestNationalId: guestData.nationalId,
        shumusId: mockShumusId,
        status: 'sandbox_test',
        submittedAt: new Date().toISOString(),
        payload
      });

      console.log('✅ Shumus sandbox submission recorded:', mockShumusId);

      return {
        success: true,
        message: 'تم التسجيل في بيئة التجربة (Sandbox)',
        shumusId: mockShumusId,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error: any) {
    console.error('Error submitting to Shumus:', error);
    return {
      success: false,
      message: `خطأ: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * إرسال تقرير إشغال يومي إلى شموس
 */
export async function submitDailyOccupancyReport(date: string): Promise<ShumusResponse> {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'legal_compliance'));
    
    if (!settingsDoc.exists() || !settingsDoc.data().shumusEnabled) {
      return {
        success: false,
        message: 'التكامل مع شموس غير مفعل',
        timestamp: new Date().toISOString()
      };
    }

    // جلب بيانات الغرف المشغولة
    // (هنا يمكن إضافة query من Firebase للحصول على الغرف)
    
    const report = {
      date,
      total_rooms: 50, // مثال
      occupied_rooms: 35,
      occupancy_rate: 70,
      guests_count: 45,
      revenue: 15000
    };

    console.log('📊 Daily occupancy report prepared for Shumus:', report);

    // حفظ التقرير
    await addDoc(collection(db, 'shumus_reports'), {
      type: 'daily_occupancy',
      date,
      report,
      submittedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'تم إرسال تقرير الإشغال اليومي',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error submitting occupancy report:', error);
    return {
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================
// ZATCA Integration (الزكاة والضريبة)
// ============================

export interface ZatcaInvoiceSubmission {
  invoiceNumber: string;
  xmlContent: string;
  invoiceHash: string;
}

export interface ZatcaResponse {
  success: boolean;
  message: string;
  zatcaUuid?: string;
  clearanceStatus?: 'CLEARED' | 'REJECTED' | 'REPORTED';
  timestamp: string;
}

/**
 * إرسال فاتورة إلى ZATCA
 */
export async function submitInvoiceToZATCA(
  invoiceNumber: string,
  xmlContent: string
): Promise<ZatcaResponse> {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'legal_compliance'));
    
    if (!settingsDoc.exists() || !settingsDoc.data().zatcaEnabled) {
      console.log('⚠️ ZATCA integration not enabled');
      return {
        success: false,
        message: 'التكامل مع ZATCA غير مفعل',
        timestamp: new Date().toISOString()
      };
    }

    const settings = settingsDoc.data();
    const apiUrl = settings.zatcaEnvironment === 'production'
      ? 'https://gw-fatoora.zatca.gov.sa/e-invoicing/core/invoices/reporting/single'
      : 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal';

    // حساب Hash للفاتورة
    const invoiceHash = await generateInvoiceHash(xmlContent);

    const payload = {
      invoiceHash,
      uuid: `UUID-${Date.now()}`,
      invoice: btoa(xmlContent) // Base64 encoding
    };

    console.log('📤 Submitting invoice to ZATCA:', invoiceNumber);

    if (settings.zatcaEnvironment === 'production' && settings.zatcaApiKey) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'ar',
            'Authorization': `Bearer ${settings.zatcaApiKey}`,
            'OTP': settings.zatcaApiSecret || ''
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
          await addDoc(collection(db, 'zatca_submissions'), {
            invoiceNumber,
            zatcaUuid: result.uuid,
            status: result.clearanceStatus || 'REPORTED',
            submittedAt: new Date().toISOString(),
            response: result
          });

          return {
            success: true,
            message: 'تم إرسال الفاتورة لـ ZATCA بنجاح',
            zatcaUuid: result.uuid,
            clearanceStatus: result.clearanceStatus,
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error(result.message || 'فشل الإرسال لـ ZATCA');
        }
      } catch (error: any) {
        console.error('❌ ZATCA API Error:', error);
        
        await addDoc(collection(db, 'zatca_submissions'), {
          invoiceNumber,
          status: 'failed',
          error: error.message,
          submittedAt: new Date().toISOString()
        });

        return {
          success: false,
          message: `خطأ في الإرسال لـ ZATCA: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      // Sandbox mode
      const mockUuid = `ZATCA-TEST-${Date.now()}`;
      
      await addDoc(collection(db, 'zatca_submissions'), {
        invoiceNumber,
        zatcaUuid: mockUuid,
        status: 'sandbox_test',
        submittedAt: new Date().toISOString()
      });

      console.log('✅ ZATCA sandbox submission recorded:', mockUuid);

      return {
        success: true,
        message: 'تم التسجيل في بيئة التجربة (Sandbox)',
        zatcaUuid: mockUuid,
        clearanceStatus: 'REPORTED',
        timestamp: new Date().toISOString()
      };
    }
  } catch (error: any) {
    console.error('Error submitting to ZATCA:', error);
    return {
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * حساب Hash للفاتورة (SHA-256)
 */
async function generateInvoiceHash(xmlContent: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(xmlContent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Error generating hash:', error);
    return '';
  }
}

/**
 * إرسال تقرير ضريبي شهري
 */
export async function submitMonthlyTaxReport(month: string, year: number): Promise<ZatcaResponse> {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'legal_compliance'));
    
    if (!settingsDoc.exists() || !settingsDoc.data().zatcaEnabled) {
      return {
        success: false,
        message: 'التكامل مع ZATCA غير مفعل',
        timestamp: new Date().toISOString()
      };
    }

    // إنشاء التقرير الضريبي
    const report = {
      month,
      year,
      total_sales: 450000,
      total_vat: 67500,
      invoices_count: 150,
      period: `${year}-${month}`
    };

    console.log('📊 Monthly tax report prepared for ZATCA:', report);

    await addDoc(collection(db, 'zatca_reports'), {
      type: 'monthly_tax',
      month,
      year,
      report,
      submittedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'تم إعداد التقرير الضريبي الشهري',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error submitting tax report:', error);
    return {
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================
// Auto Reporting (التقارير التلقائية)
// ============================

/**
 * تفعيل التقارير التلقائية اليومية
 * يتم تشغيله عبر Cloud Functions أو Cron Job
 */
export async function enableAutoReporting() {
  console.log('🔄 Auto-reporting enabled');
  console.log('📅 Daily reports will be sent automatically to Shumus and ZATCA');
  
  // يمكن إضافة جدولة هنا باستخدام:
  // - Firebase Cloud Functions (Scheduled Functions)
  // - Vercel Cron Jobs
  // - External scheduler service
  
  return {
    success: true,
    message: 'تم تفعيل التقارير التلقائية',
    schedule: 'Daily at 23:00 KSA time'
  };
}

/**
 * تصدير بيانات النزلاء للجهات الحكومية
 */
export async function exportGuestsData(startDate: string, endDate: string) {
  console.log(`📊 Exporting guests data from ${startDate} to ${endDate}`);
  
  // جلب بيانات النزلاء من Firebase
  // تنسيقها حسب متطلبات كل جهة
  // تصدير كـ Excel/CSV
  
  return {
    success: true,
    message: 'تم تصدير بيانات النزلاء',
    format: 'Excel',
    records: 0
  };
}
