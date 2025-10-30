'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Smartphone, Save, Upload, Image as ImageIcon, 
  CheckCircle, AlertCircle, Settings, Home, Bell
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface GuestAppSettings {
  hotelName: string;
  hotelNameEn: string;
  logoUrl: string;
  welcomeMessage: string;
  welcomeMessageEn: string;
  enableBooking: boolean;
  enableRequests: boolean;
  enableQRMenu: boolean;
  contactPhone: string;
  contactEmail: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function GuestAppSettingsPage() {
  const [settings, setSettings] = useState<GuestAppSettings>({
    hotelName: 'فندق المضيف',
    hotelNameEn: 'Al Modif Hotel',
    logoUrl: '',
    welcomeMessage: 'مرحباً بك في فندق المضيف',
    welcomeMessageEn: 'Welcome to Al Modif Hotel',
    enableBooking: true,
    enableRequests: true,
    enableQRMenu: true,
    contactPhone: '+968 12345678',
    contactEmail: 'info@almodif.net',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // تحميل الإعدادات من Firebase
  useEffect(() => {
    const loadSettings = async () => {
      if (!db) {
        console.warn('⚠️ Firebase غير متصل');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'settings', 'guest-app');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSettings({ ...settings, ...docSnap.data() });
          console.log('✅ تم تحميل إعدادات تطبيق النزيل');
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل الإعدادات:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // حفظ الإعدادات
  const handleSave = async () => {
    if (!db) {
      setMessage({ type: 'error', text: '❌ Firebase غير متصل. لا يمكن حفظ الإعدادات.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const docRef = doc(db, 'settings', 'guest-app');
      await setDoc(docRef, settings, { merge: true });
      
      setMessage({ type: 'success', text: '✅ تم حفظ الإعدادات بنجاح!' });
      console.log('✅ تم حفظ إعدادات تطبيق النزيل');
    } catch (error) {
      console.error('❌ خطأ في حفظ الإعدادات:', error);
      setMessage({ type: 'error', text: '❌ حدث خطأ أثناء الحفظ. حاول مرة أخرى.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // رفع الشعار
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSettings({ ...settings, logoUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <Smartphone className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">إعدادات تطبيق النزيل</h1>
            <p className="text-muted-foreground">
              تخصيص تطبيق النزلاء والخدمات المتاحة
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="lg"
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <Card className={`border-2 ${message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <CardContent className="p-4 flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className={message.type === 'success' ? 'text-green-900' : 'text-red-900'}>
              {message.text}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Hotel Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            معلومات الفندق
          </CardTitle>
          <CardDescription>اسم الفندق والشعار</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>اسم الفندق (عربي)</Label>
              <Input
                value={settings.hotelName}
                onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
                placeholder="فندق المضيف"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Hotel Name (English)</Label>
              <Input
                value={settings.hotelNameEn}
                onChange={(e) => setSettings({ ...settings, hotelNameEn: e.target.value })}
                placeholder="Al Modif Hotel"
                className="mt-2"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <Label>شعار الفندق</Label>
            <div className="mt-2 flex items-center gap-4">
              {settings.logoUrl && (
                <div className="w-24 h-24 rounded-lg border-2 border-primary/20 p-2 bg-white">
                  <img 
                    src={settings.logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  يُفضل صورة مربعة بحجم 512x512 بكسل
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            رسائل الترحيب
          </CardTitle>
          <CardDescription>الرسالة التي تظهر للنزيل عند فتح التطبيق</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>رسالة الترحيب (عربي)</Label>
            <Textarea
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              placeholder="مرحباً بك في فندق المضيف"
              className="mt-2 min-h-[100px]"
            />
          </div>

          <div>
            <Label>Welcome Message (English)</Label>
            <Textarea
              value={settings.welcomeMessageEn}
              onChange={(e) => setSettings({ ...settings, welcomeMessageEn: e.target.value })}
              placeholder="Welcome to Al Modif Hotel"
              className="mt-2 min-h-[100px]"
              dir="ltr"
            />
          </div>
        </CardContent>
      </Card>

      {/* Features Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            الخدمات المتاحة
          </CardTitle>
          <CardDescription>تفعيل أو إيقاف خدمات التطبيق</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium">نظام الحجز</p>
              <p className="text-sm text-muted-foreground">السماح للنزلاء بحجز الغرف</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableBooking}
                onChange={(e) => setSettings({ ...settings, enableBooking: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <p className="font-medium">نظام الطلبات</p>
              <p className="text-sm text-muted-foreground">طلبات الخدمة والصيانة</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableRequests}
                onChange={(e) => setSettings({ ...settings, enableRequests: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="font-medium">المنيو الإلكتروني (QR)</p>
              <p className="text-sm text-muted-foreground">عرض قائمة الطعام والمشروبات</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableQRMenu}
                onChange={(e) => setSettings({ ...settings, enableQRMenu: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات التواصل</CardTitle>
          <CardDescription>تظهر في التطبيق للتواصل مع الاستقبال</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>رقم الهاتف</Label>
              <Input
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                placeholder="+968 12345678"
                className="mt-2"
                dir="ltr"
              />
            </div>

            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="info@almodif.net"
                className="mt-2"
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Colors */}
      <Card>
        <CardHeader>
          <CardTitle>ألوان التطبيق</CardTitle>
          <CardDescription>تخصيص ألوان واجهة التطبيق</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>اللون الأساسي</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-20 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <Label>اللون الثانوي</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="w-20 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  placeholder="#8B5CF6"
                  className="flex-1"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
