'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  ArrowRight, 
  Save, 
  Upload, 
  Image as ImageIcon,
  QrCode,
  Hotel,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react';

interface MenuSettings {
  hotelName: string;
  hotelNameEnglish: string;
  welcomeMessage: string;
  logo: string; // base64 or URL
  primaryColor: string;
  showLogo: boolean;
  showWelcomeMessage: boolean;
}

export default function GuestMenuSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [guestMenuUrl, setGuestMenuUrl] = useState('/guest-login');
  
  const [settings, setSettings] = useState<MenuSettings>({
    hotelName: 'فندق المضيف',
    hotelNameEnglish: 'Almudif Hotel',
    welcomeMessage: 'مرحباً بك في فندقنا. نتمنى لك إقامة سعيدة',
    logo: '',
    primaryColor: '#3b82f6',
    showLogo: true,
    showWelcomeMessage: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedSettings = localStorage.getItem('guest_menu_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // تحديد رابط المنيو
    if (typeof window !== 'undefined') {
      setGuestMenuUrl(`${window.location.origin}/guest-login`);
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً! الحد الأقصى 2 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // حفظ الإعدادات
    localStorage.setItem('guest_menu_settings', JSON.stringify(settings));
    
    setTimeout(() => {
      setIsSaving(false);
      alert('تم حفظ الإعدادات بنجاح! ✅');
    }, 500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(guestMenuUrl);
    alert('تم نسخ الرابط! 📋');
  };

  const handleOpenPreview = () => {
    window.open(guestMenuUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* خلفية تزيينية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* الهيدر */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  إعدادات المنيو الإلكتروني
                </h1>
                <p className="text-blue-200/70 text-sm">تخصيص شكل ومحتوى المنيو للنزلاء</p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/settings')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            رجوع للإعدادات
          </Button>
        </div>

        {/* معلومات الفندق */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Hotel className="w-5 h-5 text-blue-400" />
              معلومات الفندق
            </CardTitle>
            <CardDescription className="text-blue-200/70">
              هذه المعلومات ستظهر للنزلاء في المنيو الإلكتروني
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotelName" className="text-blue-200">اسم الفندق (عربي) *</Label>
                <Input
                  id="hotelName"
                  value={settings.hotelName}
                  onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
                  placeholder="فندق المضيف"
                  className="bg-white/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotelNameEnglish" className="text-blue-200">اسم الفندق (English)</Label>
                <Input
                  id="hotelNameEnglish"
                  value={settings.hotelNameEnglish}
                  onChange={(e) => setSettings({ ...settings, hotelNameEnglish: e.target.value })}
                  placeholder="Almudif Hotel"
                  className="bg-white/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcomeMessage" className="text-blue-200">رسالة الترحيب</Label>
              <Textarea
                id="welcomeMessage"
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                placeholder="مرحباً بك في فندقنا..."
                rows={3}
                className="bg-white/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showWelcomeMessage}
                  onChange={(e) => setSettings({ ...settings, showWelcomeMessage: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-blue-200 text-sm">إظهار رسالة الترحيب</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showLogo}
                  onChange={(e) => setSettings({ ...settings, showLogo: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-blue-200 text-sm">إظهار الشعار</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* الشعار */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              شعار الفندق
            </CardTitle>
            <CardDescription className="text-blue-200/70">
              ارفع شعار الفندق (يفضل PNG بخلفية شفافة، الحد الأقصى 2MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* معاينة الشعار */}
              <div className="w-full md:w-48 h-48 bg-white/5 border-2 border-dashed border-blue-400/30 rounded-lg flex items-center justify-center">
                {settings.logo ? (
                  <img 
                    src={settings.logo} 
                    alt="Logo" 
                    className="max-w-full max-h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-blue-400/50 mx-auto mb-2" />
                    <p className="text-blue-300/50 text-sm">لا يوجد شعار</p>
                  </div>
                )}
              </div>

              {/* أزرار التحكم */}
              <div className="flex-1 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  {settings.logo ? 'تغيير الشعار' : 'رفع الشعار'}
                </Button>

                {settings.logo && (
                  <Button
                    onClick={() => setSettings({ ...settings, logo: '' })}
                    variant="outline"
                    className="w-full border-red-400/30 text-red-300 hover:bg-red-500/10"
                  >
                    حذف الشعار
                  </Button>
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 text-xs">
                    💡 نصيحة: استخدم صورة بأبعاد مربعة (مثل 500x500) للحصول على أفضل نتيجة
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الألوان */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">الألوان والتخصيص</CardTitle>
            <CardDescription className="text-blue-200/70">
              اختر اللون الأساسي الذي يتناسب مع هوية الفندق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="primaryColor" className="text-blue-200">اللون الأساسي</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-16 h-16 rounded-lg cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  placeholder="#3b82f6"
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* رابط المنيو */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-green-400" />
              رابط المنيو الإلكتروني
            </CardTitle>
            <CardDescription className="text-blue-200/70">
              شارك هذا الرابط مع النزلاء للوصول للمنيو
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/5 border border-blue-400/30 rounded-lg p-4">
              <p className="text-blue-200 text-sm mb-2">رابط تسجيل الدخول:</p>
              <p className="text-white font-mono text-sm break-all bg-gray-900/50 p-3 rounded">
                {guestMenuUrl}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Copy className="w-4 h-4 ml-2" />
                نسخ الرابط
              </Button>
              <Button
                onClick={handleOpenPreview}
                variant="outline"
                className="flex-1 border-blue-400/30 text-blue-200 hover:bg-blue-500/10"
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                معاينة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* زر الحفظ */}
        <div className="flex justify-center pb-8">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-6 text-lg shadow-2xl"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 ml-2" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
