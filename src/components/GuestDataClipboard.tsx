'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Copy, 
  Check, 
  Clipboard, 
  X, 
  User, 
  Phone, 
  Mail,
  CreditCard,
  MapPin,
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface GuestClipboardData {
  fullName: string;
  nationality: string;
  idType: string;
  idNumber: string;
  idCopyNumber?: string; // رقم نسخة البطاقة
  expiryDate?: string; // دعم قديم
  birthDate?: string; // تاريخ الميلاد
  mobile: string;
  workPhone: string;
  email: string;
  address: string;
  notes: string;
  timestamp: string;
}

interface GuestDataClipboardProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const CLIPBOARD_STORAGE_KEY = 'guest_data_clipboard';

export default function GuestDataClipboard({ position = 'bottom-right' }: GuestDataClipboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clipboardData, setClipboardData] = useState<GuestClipboardData | null>(null);
  const [copied, setCopied] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    loadClipboardData();
    
    // استماع للتحديثات من نوافذ أخرى
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CLIPBOARD_STORAGE_KEY) {
        loadClipboardData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadClipboardData = () => {
    try {
      const stored = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setClipboardData(data);
      }
    } catch (error) {
      console.error('Error loading clipboard data:', error);
    }
  };

  const copyToClipboard = async () => {
    if (!clipboardData) return;

    const textData = `
بيانات النزيل:
━━━━━━━━━━━━━━━━━━
👤 الاسم: ${clipboardData.fullName}
🌍 الجنسية: ${clipboardData.nationality}
🆔 نوع الإثبات: ${clipboardData.idType}
🔢 رقم الإثبات: ${clipboardData.idNumber}
📅 تاريخ الانتهاء: ${clipboardData.expiryDate}
📱 الجوال: ${clipboardData.mobile}
☎️ هاتف العمل: ${clipboardData.workPhone}
📧 البريد: ${clipboardData.email}
📍 العنوان: ${clipboardData.address}
📝 ملاحظات: ${clipboardData.notes}
━━━━━━━━━━━━━━━━━━
    `.trim();

    try {
      await navigator.clipboard.writeText(textData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // إظهار إشعار
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('فشل النسخ. جرب مرة أخرى.');
    }
  };

  const clearClipboard = () => {
    localStorage.removeItem(CLIPBOARD_STORAGE_KEY);
    setClipboardData(null);
    setIsOpen(false);
  };

  const hasData = clipboardData !== null;
  
  // تحديد موقع الزر
  const positionClasses = {
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  if (!hasData) return null;

  return (
    <>
      {/* زر عائم */}
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl rounded-full w-14 h-14 p-0"
          title="بيانات نزيل محفوظة"
        >
          <Clipboard className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </Button>
      </div>

      {/* إشعار النسخ */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top">
          <Card className="bg-green-600 border-green-500 text-white shadow-2xl">
            <CardContent className="p-3 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="font-medium">تم النسخ للحافظة بنجاح!</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* نافذة عرض البيانات */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 backdrop-blur-md border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Clipboard className="w-6 h-6 text-purple-400" />
              بيانات النزيل المحفوظة
            </DialogTitle>
            <DialogDescription className="text-blue-200/80">
              تم حفظ بيانات النزيل مؤقتاً - يمكنك استخدامها في أي وقت
            </DialogDescription>
          </DialogHeader>

          {clipboardData && (
            <div className="space-y-4">
              {/* معلومات التوقيت */}
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-200">
                  <AlertCircle className="w-4 h-4" />
                  <span>تم الحفظ: {new Date(clipboardData.timestamp).toLocaleString('ar-EG')}</span>
                </div>
                <Badge className="bg-green-600 text-white">جاهز للاستخدام</Badge>
              </div>

              {/* البيانات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {/* الاسم الكامل */}
                <div className="col-span-full bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                    <User className="w-4 h-4" />
                    <span>الاسم الكامل</span>
                  </div>
                  <p className="text-white font-medium">{clipboardData.fullName || '-'}</p>
                </div>

                {/* الجنسية */}
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                    <span>🌍</span>
                    <span>الجنسية</span>
                  </div>
                  <p className="text-white font-medium">{clipboardData.nationality || '-'}</p>
                </div>

                {/* نوع الإثبات */}
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                    <CreditCard className="w-4 h-4" />
                    <span>نوع الإثبات</span>
                  </div>
                  <p className="text-white font-medium">{clipboardData.idType || '-'}</p>
                </div>

                {/* رقم الإثبات */}
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                    <span>🔢</span>
                    <span>رقم الإثبات</span>
                  </div>
                  <p className="text-white font-medium">{clipboardData.idNumber || '-'}</p>
                </div>

                {/* تاريخ الانتهاء */}
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                    <span>📅</span>
                    <span>تاريخ الانتهاء</span>
                  </div>
                  <p className="text-white font-medium">{clipboardData.expiryDate || '-'}</p>
                </div>

                {/* الجوال */}
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                    <Phone className="w-4 h-4" />
                    <span>رقم الجوال</span>
                  </div>
                  <p className="text-white font-medium" dir="ltr">{clipboardData.mobile || '-'}</p>
                </div>

                {/* هاتف العمل */}
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                    <Phone className="w-4 h-4" />
                    <span>هاتف العمل</span>
                  </div>
                  <p className="text-white font-medium" dir="ltr">{clipboardData.workPhone || '-'}</p>
                </div>

                {/* البريد الإلكتروني */}
                <div className="col-span-full bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                    <Mail className="w-4 h-4" />
                    <span>البريد الإلكتروني</span>
                  </div>
                  <p className="text-white font-medium" dir="ltr">{clipboardData.email || '-'}</p>
                </div>

                {/* العنوان */}
                <div className="col-span-full bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>العنوان</span>
                  </div>
                  <p className="text-white font-medium">{clipboardData.address || '-'}</p>
                </div>

                {/* الملاحظات */}
                {clipboardData.notes && (
                  <div className="col-span-full bg-white/10 rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
                      <FileText className="w-4 h-4" />
                      <span>ملاحظات</span>
                    </div>
                    <p className="text-white font-medium">{clipboardData.notes}</p>
                  </div>
                )}
              </div>

              {/* الأزرار */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={copyToClipboard}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 ml-2" />
                      تم النسخ!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 ml-2" />
                      نسخ كنص
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={clearClipboard}
                  variant="outline"
                  className="border-red-400/30 text-red-200 hover:bg-red-600/20"
                >
                  <X className="w-4 h-4 ml-2" />
                  مسح البيانات
                </Button>
              </div>

              {/* تلميح */}
              <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-3">
                <p className="text-sm text-blue-200">
                  💡 <strong>نصيحة:</strong> اذهب إلى صفحة "إضافة نزيل" لاستخدام هذه البيانات تلقائياً
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// دالة مساعدة لحفظ البيانات في الحافظة
export function saveGuestDataToClipboard(data: Omit<GuestClipboardData, 'timestamp'>) {
  const clipboardData: GuestClipboardData = {
    ...data,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(clipboardData));
  
  // إطلاق حدث لتحديث جميع النوافذ
  window.dispatchEvent(new Event('storage'));
  
  return true;
}

// دالة مساعدة لقراءة البيانات من الحافظة
export function getGuestDataFromClipboard(): GuestClipboardData | null {
  try {
    const stored = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading clipboard data:', error);
  }
  return null;
}

// دالة مساعدة لمسح البيانات
export function clearGuestClipboard() {
  localStorage.removeItem(CLIPBOARD_STORAGE_KEY);
  window.dispatchEvent(new Event('storage'));
}
