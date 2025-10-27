'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, Mail, Phone, MapPin, Globe, Save, Eye, 
  Check, AlertCircle, Image as ImageIcon, Palette
} from 'lucide-react';
import { 
  type WebsiteSettings, 
  generateSlug, 
  saveWebsiteSettings, 
  loadWebsiteSettings,
  isWebsiteReady,
  extractColorsFromImage
} from '@/lib/website-settings';

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState<WebsiteSettings>({
    hotelName: '',
    hotelSlug: '',
    description: '',
    contact: {
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
    },
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      logo: '',
    },
    booking: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellationPolicy: '',
      depositPercentage: 30,
    },
    content: {
      aboutUs: '',
      privacyPolicy: '',
      termsAndConditions: '',
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const saved = loadWebsiteSettings();
    if (saved) {
      setSettings(saved);
    }
  }, []);

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setSettings({ ...settings, hotelName: name, hotelSlug: slug });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const logoBase64 = event.target?.result as string;
      
      try {
        const colors = await extractColorsFromImage(file);
        setSettings({
          ...settings,
          theme: {
            ...settings.theme,
            logo: logoBase64,
            primaryColor: colors.primary || settings.theme.primaryColor,
            secondaryColor: colors.secondary || settings.theme.secondaryColor,
            accentColor: colors.accent || settings.theme.accentColor,
          }
        });
      } catch (error) {
        console.error('Error extracting colors:', error);
        setSettings({
          ...settings,
          theme: { ...settings.theme, logo: logoBase64 }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveWebsiteSettings(settings);
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
    }
  };

  const websiteUrl = settings.hotelSlug 
    ? `${window.location.origin}/public-site/${settings.hotelSlug}` 
    : '';

  const readyStatus = isWebsiteReady(settings);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="h-8 w-8 text-blue-600" />
            إعدادات الموقع الإلكتروني
          </h1>
          <p className="text-muted-foreground mt-2">
            قم بإنشاء وتخصيص موقع الفندق الإلكتروني
          </p>
        </div>
        
        {lastSaved && (
          <div className="text-sm text-muted-foreground">
            آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}
          </div>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {readyStatus.ready ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <p className="font-semibold">حالة الموقع</p>
                  <p className="text-sm text-muted-foreground">
                    {readyStatus.ready ? 'جاهز للنشر' : 'غير مكتمل'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold">رابط الموقع</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.hotelSlug || 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold">البيانات المكتملة</p>
                  <p className="text-sm text-muted-foreground">
                    {readyStatus.completedSections} من {readyStatus.totalSections}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Card */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="contact">معلومات التواصل</TabsTrigger>
              <TabsTrigger value="theme">التصميم والألوان</TabsTrigger>
              <TabsTrigger value="booking">إعدادات الحجز</TabsTrigger>
              <TabsTrigger value="content">المحتوى</TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hotelName">اسم الفندق *</Label>
                  <Input
                    id="hotelName"
                    value={settings.hotelName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="فندق النجمة الذهبية"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hotelSlug">رابط الموقع *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hotelSlug"
                      value={settings.hotelSlug}
                      onChange={(e) => setSettings({ ...settings, hotelSlug: e.target.value })}
                      placeholder="golden-star-hotel"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {websiteUrl || 'سيتم إنشاء الرابط تلقائياً'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الفندق</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="نبذة مختصرة عن الفندق..."
                  rows={3}
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-4 border rounded-lg p-6 bg-muted/30">
                <Label htmlFor="logo" className="text-base font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  شعار الفندق (اللوجو)
                </Label>
                <p className="text-sm text-muted-foreground">
                  سيتم استخراج الألوان تلقائياً من الشعار وتطبيقها على الموقع
                </p>
                
                {settings.theme.logo && (
                  <div className="flex items-center gap-4 p-4 border rounded-lg bg-background">
                    <img 
                      src={settings.theme.logo} 
                      alt="Logo" 
                      className="h-20 w-20 object-contain border rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">الشعار الحالي</p>
                      <p className="text-xs text-muted-foreground">تم استخراج الألوان تلقائياً</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings({
                        ...settings,
                        theme: { ...settings.theme, logo: '' }
                      })}
                    >
                      إزالة
                    </Button>
                  </div>
                )}

                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      contact: { ...settings.contact, email: e.target.value }
                    })}
                    placeholder="info@hotel.com"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    رقم الهاتف
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.contact.phone}
                    onChange={(e) => setSettings({
                      ...settings,
                      contact: { ...settings.contact, phone: e.target.value }
                    })}
                    placeholder="+966 12 345 6789"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    واتساب
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={settings.contact.whatsapp}
                    onChange={(e) => setSettings({
                      ...settings,
                      contact: { ...settings.contact, whatsapp: e.target.value }
                    })}
                    placeholder="+966 50 123 4567"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    العنوان
                  </Label>
                  <Input
                    id="address"
                    value={settings.contact.address}
                    onChange={(e) => setSettings({
                      ...settings,
                      contact: { ...settings.contact, address: e.target.value }
                    })}
                    placeholder="الرياض، المملكة العربية السعودية"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">ألوان الموقع</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {settings.theme.logo 
                    ? 'تم استخراج هذه الألوان تلقائياً من الشعار. يمكنك تعديلها إذا أردت.'
                    : 'اختر الألوان الأساسية للموقع أو قم برفع الشعار لاستخراجها تلقائياً.'
                  }
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="primaryColor">اللون الأساسي</Label>
                    <div className="flex gap-3">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.theme.primaryColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: { ...settings.theme, primaryColor: e.target.value }
                        })}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={settings.theme.primaryColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: { ...settings.theme, primaryColor: e.target.value }
                        })}
                        className="flex-1"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                    <div className="flex gap-3">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.theme.secondaryColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: { ...settings.theme, secondaryColor: e.target.value }
                        })}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={settings.theme.secondaryColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: { ...settings.theme, secondaryColor: e.target.value }
                        })}
                        className="flex-1"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="accentColor">لون التمييز</Label>
                    <div className="flex gap-3">
                      <Input
                        id="accentColor"
                        type="color"
                        value={settings.theme.accentColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: { ...settings.theme, accentColor: e.target.value }
                        })}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={settings.theme.accentColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: { ...settings.theme, accentColor: e.target.value }
                        })}
                        className="flex-1"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="border rounded-lg p-6 bg-muted/30">
                  <h4 className="font-medium mb-4">معاينة الألوان</h4>
                  <div className="flex gap-4">
                    <div 
                      className="flex-1 h-24 rounded-lg border-2"
                      style={{ backgroundColor: settings.theme.primaryColor }}
                    />
                    <div 
                      className="flex-1 h-24 rounded-lg border-2"
                      style={{ backgroundColor: settings.theme.secondaryColor }}
                    />
                    <div 
                      className="flex-1 h-24 rounded-lg border-2"
                      style={{ backgroundColor: settings.theme.accentColor }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Booking Tab */}
            <TabsContent value="booking" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime">وقت تسجيل الدخول</Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={settings.booking.checkInTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, checkInTime: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkOutTime">وقت تسجيل الخروج</Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={settings.booking.checkOutTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, checkOutTime: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositPercentage">نسبة العربون (%)</Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.booking.depositPercentage}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, depositPercentage: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellationPolicy">سياسة الإلغاء</Label>
                <Textarea
                  id="cancellationPolicy"
                  value={settings.booking.cancellationPolicy}
                  onChange={(e) => setSettings({
                    ...settings,
                    booking: { ...settings.booking, cancellationPolicy: e.target.value }
                  })}
                  placeholder="تفاصيل سياسة الإلغاء والاسترجاع..."
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="aboutUs">عن الفندق</Label>
                <Textarea
                  id="aboutUs"
                  value={settings.content.aboutUs}
                  onChange={(e) => setSettings({
                    ...settings,
                    content: { ...settings.content, aboutUs: e.target.value }
                  })}
                  placeholder="معلومات تفصيلية عن الفندق..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacyPolicy">سياسة الخصوصية</Label>
                <Textarea
                  id="privacyPolicy"
                  value={settings.content.privacyPolicy}
                  onChange={(e) => setSettings({
                    ...settings,
                    content: { ...settings.content, privacyPolicy: e.target.value }
                  })}
                  placeholder="سياسة الخصوصية والبيانات..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">الشروط والأحكام</Label>
                <Textarea
                  id="termsAndConditions"
                  value={settings.content.termsAndConditions}
                  onChange={(e) => setSettings({
                    ...settings,
                    content: { ...settings.content, termsAndConditions: e.target.value }
                  })}
                  placeholder="الشروط والأحكام..."
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 sticky bottom-6 bg-background/80 backdrop-blur-sm border rounded-lg p-4 mt-6">
        <div className="flex gap-2">
          {settings.hotelSlug && (
            <Button variant="outline" onClick={() => window.open(websiteUrl, '_blank')}>
              <Eye className="h-4 w-4 ml-2" />
              معاينة الموقع
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 ml-2" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>
    </div>
  );
}
