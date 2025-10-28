'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Upload, 
  Download, 
  RefreshCw, 
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Globe,
  Volume2,
  Wifi,
  Smartphone,
  Mail,
  Lock,
  Key,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    // إعدادات عامة
    hotelName: 'فندق المضيف',
    hotelDescription: 'فندق فاخر يوفر خدمات متميزة',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    currency: 'SAR',
    
    // إعدادات الواجهة
    theme: 'dark',
    primaryColor: 'blue',
    showLogo: true,
    compactView: false,
    
    // إعدادات الإشعارات
    enableNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    soundEnabled: true,
    
    // إعدادات الأمان
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'medium',
    loginAttempts: 3,
    
    // إعدادات النسخ الاحتياطي
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    
    // إعدادات API
    apiEnabled: false,
    apiKey: '',
    webhookUrl: ''
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // حفظ الإعدادات في localStorage
      localStorage.setItem('app_settings', JSON.stringify(settings));
      
      // محاكاة حفظ على الخادم
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      
      // إخفاء رسالة الحالة بعد 3 ثوانٍ
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleReset = () => {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
      localStorage.removeItem('app_settings');
      window.location.reload();
    }
  };

  const generateApiKey = () => {
    const key = 'ak_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    setSettings(prev => ({ ...prev, apiKey: key }));
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const themeColors = [
    { value: 'blue', label: 'أزرق', class: 'bg-blue-500' },
    { value: 'green', label: 'أخضر', class: 'bg-green-500' },
    { value: 'purple', label: 'بنفسجي', class: 'bg-purple-500' },
    { value: 'orange', label: 'برتقالي', class: 'bg-orange-500' },
    { value: 'red', label: 'أحمر', class: 'bg-red-500' },
    { value: 'pink', label: 'وردي', class: 'bg-pink-500' }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 lg:p-6" dir="rtl">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-white/20 bg-gray-800/50 text-white hover:bg-gray-600/50"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  رجوع
                </Button>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    إعدادات النظام
                  </h1>
                  <p className="text-blue-200/80">
                    تخصيص وإدارة إعدادات التطبيق
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  إعادة تعيين
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </div>

            {/* Save Status */}
            {saveStatus && (
              <div className="mt-4">
                {saveStatus === 'success' && (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300">
                      تم حفظ الإعدادات بنجاح!
                    </AlertDescription>
                  </Alert>
                )}
                {saveStatus === 'error' && (
                  <Alert className="border-red-500/30 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                      حدث خطأ في حفظ الإعدادات. يرجى المحاولة مرة أخرى.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-gray-800/50 border border-white/20">
              <TabsTrigger value="general" className="data-[state=active]:bg-gray-700">
                <Globe className="w-4 h-4 ml-2" />
                عام
              </TabsTrigger>
              <TabsTrigger value="interface" className="data-[state=active]:bg-gray-700">
                <Palette className="w-4 h-4 ml-2" />
                الواجهة
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-700">
                <Bell className="w-4 h-4 ml-2" />
                الإشعارات
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-gray-700">
                <Shield className="w-4 h-4 ml-2" />
                الأمان
              </TabsTrigger>
              <TabsTrigger value="backup" className="data-[state=active]:bg-gray-700">
                <Database className="w-4 h-4 ml-2" />
                النسخ الاحتياطي
              </TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-gray-700">
                <Wifi className="w-4 h-4 ml-2" />
                API
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">الإعدادات العامة</CardTitle>
                  <CardDescription className="text-gray-400">
                    إعدادات أساسية للتطبيق
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hotelName" className="text-white">اسم الفندق</Label>
                      <Input
                        id="hotelName"
                        value={settings.hotelName}
                        onChange={(e) => updateSetting('hotelName', e.target.value)}
                        className="bg-gray-700/30 border-white/20 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-white">اللغة</Label>
                      <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                        <SelectTrigger className="bg-gray-700/30 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/20">
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-white">المنطقة الزمنية</Label>
                      <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                        <SelectTrigger className="bg-gray-700/30 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/20">
                          <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                          <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                          <SelectItem value="Europe/London">لندن (GMT+0)</SelectItem>
                          <SelectItem value="America/New_York">نيويورك (GMT-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-white">العملة</Label>
                      <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                        <SelectTrigger className="bg-gray-700/30 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/20">
                          <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                          <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                          <SelectItem value="EUR">يورو (EUR)</SelectItem>
                          <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">وصف الفندق</Label>
                    <Textarea
                      id="description"
                      value={settings.hotelDescription}
                      onChange={(e) => updateSetting('hotelDescription', e.target.value)}
                      className="bg-gray-700/30 border-white/20 text-white min-h-[100px]"
                      placeholder="أدخل وصفاً مختصراً عن الفندق..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interface Settings */}
            <TabsContent value="interface" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">إعدادات الواجهة</CardTitle>
                  <CardDescription className="text-gray-400">
                    تخصيص مظهر التطبيق
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">المظهر</Label>
                        <div className="flex gap-3">
                          {[
                            { value: 'light', label: 'فاتح', icon: Sun },
                            { value: 'dark', label: 'داكن', icon: Moon },
                            { value: 'auto', label: 'تلقائي', icon: Monitor }
                          ].map((theme) => (
                            <Button
                              key={theme.value}
                              onClick={() => updateSetting('theme', theme.value)}
                              variant={settings.theme === theme.value ? 'default' : 'outline'}
                              className={`flex-1 ${
                                settings.theme === theme.value 
                                  ? 'bg-blue-500 text-white' 
                                  : 'border-white/20 bg-gray-700/30 text-white hover:bg-gray-600/50'
                              }`}
                            >
                              <theme.icon className="w-4 h-4 ml-2" />
                              {theme.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">اللون الرئيسي</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {themeColors.map((color) => (
                            <Button
                              key={color.value}
                              onClick={() => updateSetting('primaryColor', color.value)}
                              variant="outline"
                              className={`border-white/20 bg-gray-700/30 text-white hover:bg-gray-600/50 ${
                                settings.primaryColor === color.value ? 'ring-2 ring-blue-500' : ''
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full ${color.class} ml-2`} />
                              {color.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">إظهار الشعار</Label>
                        <Switch
                          checked={settings.showLogo}
                          onCheckedChange={(checked) => updateSetting('showLogo', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-white">العرض المضغوط</Label>
                        <Switch
                          checked={settings.compactView}
                          onCheckedChange={(checked) => updateSetting('compactView', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">إعدادات الإشعارات</CardTitle>
                  <CardDescription className="text-gray-400">
                    إدارة طريقة استلام الإشعارات
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-white font-medium">تفعيل الإشعارات</div>
                          <div className="text-gray-400 text-sm">استلام إشعارات النظام</div>
                        </div>
                      </div>
                      <Switch
                        checked={settings.enableNotifications}
                        onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-green-400" />
                        <div>
                          <div className="text-white font-medium">إشعارات البريد الإلكتروني</div>
                          <div className="text-gray-400 text-sm">استلام إشعارات عبر البريد</div>
                        </div>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                        disabled={!settings.enableNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-white font-medium">رسائل SMS</div>
                          <div className="text-gray-400 text-sm">استلام رسائل نصية</div>
                        </div>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                        disabled={!settings.enableNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-orange-400" />
                        <div>
                          <div className="text-white font-medium">الأصوات</div>
                          <div className="text-gray-400 text-sm">تشغيل أصوات الإشعارات</div>
                        </div>
                      </div>
                      <Switch
                        checked={settings.soundEnabled}
                        onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                        disabled={!settings.enableNotifications}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">إعدادات الأمان</CardTitle>
                  <CardDescription className="text-gray-400">
                    تأمين الحساب وإدارة كلمات المرور
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <div className="text-white font-medium">التحقق بخطوتين</div>
                          <div className="text-gray-400 text-sm">حماية إضافية للحساب</div>
                        </div>
                      </div>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">انتهاء الجلسة (دقيقة)</Label>
                        <Select 
                          value={settings.sessionTimeout.toString()} 
                          onValueChange={(value) => updateSetting('sessionTimeout', parseInt(value))}
                        >
                          <SelectTrigger className="bg-gray-700/30 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-white/20">
                            <SelectItem value="15">15 دقيقة</SelectItem>
                            <SelectItem value="30">30 دقيقة</SelectItem>
                            <SelectItem value="60">60 دقيقة</SelectItem>
                            <SelectItem value="120">ساعتين</SelectItem>
                            <SelectItem value="0">بدون انتهاء</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">محاولات تسجيل الدخول</Label>
                        <Select 
                          value={settings.loginAttempts.toString()} 
                          onValueChange={(value) => updateSetting('loginAttempts', parseInt(value))}
                        >
                          <SelectTrigger className="bg-gray-700/30 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-white/20">
                            <SelectItem value="3">3 محاولات</SelectItem>
                            <SelectItem value="5">5 محاولات</SelectItem>
                            <SelectItem value="10">10 محاولات</SelectItem>
                            <SelectItem value="0">بدون حد</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">سياسة كلمة المرور</Label>
                      <Select value={settings.passwordPolicy} onValueChange={(value) => updateSetting('passwordPolicy', value)}>
                        <SelectTrigger className="bg-gray-700/30 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/20">
                          <SelectItem value="weak">ضعيفة (6+ أحرف)</SelectItem>
                          <SelectItem value="medium">متوسطة (8+ أحرف + أرقام)</SelectItem>
                          <SelectItem value="strong">قوية (12+ أحرف + رموز خاصة)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backup Settings */}
            <TabsContent value="backup" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">النسخ الاحتياطي</CardTitle>
                  <CardDescription className="text-gray-400">
                    إدارة النسخ الاحتياطية واستعادة البيانات
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">النسخ التلقائي</div>
                        <div className="text-gray-400 text-sm">إنشاء نسخ احتياطية تلقائياً</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">تكرار النسخ</Label>
                      <Select 
                        value={settings.backupFrequency} 
                        onValueChange={(value) => updateSetting('backupFrequency', value)}
                        disabled={!settings.autoBackup}
                      >
                        <SelectTrigger className="bg-gray-700/30 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/20">
                          <SelectItem value="hourly">كل ساعة</SelectItem>
                          <SelectItem value="daily">يومياً</SelectItem>
                          <SelectItem value="weekly">أسبوعياً</SelectItem>
                          <SelectItem value="monthly">شهرياً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">الاحتفاظ بالنسخ (أيام)</Label>
                      <Input
                        type="number"
                        value={settings.backupRetention}
                        onChange={(e) => updateSetting('backupRetention', parseInt(e.target.value) || 30)}
                        className="bg-gray-700/30 border-white/20 text-white"
                        min="1"
                        max="365"
                        disabled={!settings.autoBackup}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30">
                      <Download className="w-4 h-4 ml-2" />
                      إنشاء نسخة احتياطية
                    </Button>
                    <Button className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30">
                      <Upload className="w-4 h-4 ml-2" />
                      استعادة نسخة احتياطية
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Settings */}
            <TabsContent value="api" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">إعدادات API</CardTitle>
                  <CardDescription className="text-gray-400">
                    إدارة واجهة برمجة التطبيقات والتكاملات الخارجية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wifi className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">تفعيل API</div>
                        <div className="text-gray-400 text-sm">السماح بالوصول عبر API</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.apiEnabled}
                      onCheckedChange={(checked) => updateSetting('apiEnabled', checked)}
                    />
                  </div>

                  {settings.apiEnabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">مفتاح API</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type={showApiKey ? 'text' : 'password'}
                              value={settings.apiKey}
                              onChange={(e) => updateSetting('apiKey', e.target.value)}
                              className="bg-gray-700/30 border-white/20 text-white pr-10"
                              placeholder="أدخل مفتاح API أو اضغط على توليد"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                            >
                              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          <Button
                            onClick={generateApiKey}
                            variant="outline"
                            className="border-white/20 bg-gray-700/30 text-white hover:bg-gray-600/50"
                          >
                            <Key className="w-4 h-4 ml-2" />
                            توليد
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="webhookUrl" className="text-white">رابط Webhook</Label>
                        <Input
                          id="webhookUrl"
                          value={settings.webhookUrl}
                          onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                          className="bg-gray-700/30 border-white/20 text-white"
                          placeholder="https://yourapp.com/webhook"
                        />
                      </div>

                      <Alert className="border-yellow-500/30 bg-yellow-500/10">
                        <Info className="h-4 w-4 text-yellow-400" />
                        <AlertDescription className="text-yellow-300">
                          <strong>تنبيه أمني:</strong> احتفظ بمفتاح API في مكان آمن ولا تشاركه مع أحد. 
                          يمكن استخدامه للوصول لجميع بيانات النظام.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}