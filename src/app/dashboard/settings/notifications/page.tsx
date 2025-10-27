'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Volume2,
  Monitor,
  Mail,
  Smartphone,
  Save,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as NotificationService from '@/lib/notification-service';
import type { NotificationType, NotificationPriority } from '@/lib/notification-service';

interface NotificationSetting {
  enabled: boolean;
  priority: NotificationPriority;
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  emailEnabled: boolean;
  types: Record<NotificationType, NotificationSetting>;
}

const notificationTypeLabels: Record<NotificationType, string> = {
  booking_confirmed: 'تأكيد الحجز',
  booking_cancelled: 'إلغاء الحجز',
  payment_received: 'استلام دفعة',
  payment_overdue: 'تأخر دفع',
  checkin_reminder: 'تذكير الدخول',
  checkout_reminder: 'تذكير الخروج',
  room_maintenance: 'صيانة الغرفة',
  guest_request: 'طلب الضيف',
  system_alert: 'تنبيه النظام',
  staff_shift: 'مناوبة الموظف',
  low_occupancy: 'انخفاض الإشغال',
  high_demand: 'طلب عالي'
};

const notificationTypeDescriptions: Record<NotificationType, string> = {
  booking_confirmed: 'عند تأكيد حجز جديد من قبل الضيف',
  booking_cancelled: 'عند إلغاء حجز موجود',
  payment_received: 'عند استلام دفعة من الضيف',
  payment_overdue: 'عند تأخر الضيف في الدفع',
  checkin_reminder: 'تذكير قبل موعد دخول الضيف',
  checkout_reminder: 'تذكير قبل موعد خروج الضيف',
  room_maintenance: 'عند الحاجة لصيانة غرفة',
  guest_request: 'عند تقديم طلب من الضيف',
  system_alert: 'تنبيهات النظام والأخطاء',
  staff_shift: 'تذكير بمناوبات الموظفين',
  low_occupancy: 'عند انخفاض معدل إشغال الفندق',
  high_demand: 'عند ارتفاع الطلب على الغرف'
};

const priorityColors: Record<NotificationPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const priorityLabels: Record<NotificationPriority, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
  urgent: 'طارئ'
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // تحميل الإعدادات
  useEffect(() => {
    const loadSettings = () => {
      const notificationSettings = NotificationService.getNotificationSettings();
      setSettings(notificationSettings);
      setLoading(false);
    };

    loadSettings();
  }, []);

  // تحديث إعداد عام
  const updateGeneralSetting = (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [key]: value
    });
    setHasChanges(true);
  };

  // تحديث إعداد نوع إشعار
  const updateTypeSetting = (
    type: NotificationType,
    key: 'enabled' | 'priority',
    value: boolean | NotificationPriority
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      types: {
        ...settings.types,
        [type]: {
          ...settings.types[type],
          [key]: value
        }
      }
    });
    setHasChanges(true);
  };

  // حفظ الإعدادات
  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      NotificationService.saveNotificationSettings(settings);
      setHasChanges(false);

      // إظهار رسالة نجاح
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = '✅ تم حفظ الإعدادات بنجاح!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);

    } catch (error) {
      console.error('Failed to save settings:', error);

      // إظهار رسالة خطأ
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = '❌ فشل في حفظ الإعدادات';
      document.body.appendChild(errorMessage);

      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  // إعادة تعيين الإعدادات
  const resetSettings = () => {
    const defaultSettings = NotificationService.getNotificationSettings();
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  // طلب إذن الإشعارات
  const requestPermissions = async () => {
    const granted = await NotificationService.requestNotificationPermission();
    if (granted) {
      updateGeneralSetting('desktopEnabled', true);

      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = '✅ تم تفعيل إشعارات سطح المكتب!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } else {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = '❌ تم رفض إذن الإشعارات';
      document.body.appendChild(errorMessage);

      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    }
  };

  if (loading || !settings) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إعدادات الإشعارات الذكية</h1>
                <p className="text-gray-600">تخصيص الإشعارات حسب احتياجاتك</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={saveSettings}
                disabled={!hasChanges || saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 ml-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>

              <Button
                variant="outline"
                onClick={resetSettings}
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>

              <Button
                variant="outline"
                onClick={requestPermissions}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <Monitor className="h-4 w-4 ml-2" />
                تفعيل إشعارات سطح المكتب
              </Button>
            </div>

            {hasChanges && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ لديك تغييرات غير محفوظة. لا تنس النقر على "حفظ الإعدادات".
                </p>
              </div>
            )}
          </div>

          {/* General Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                الإعدادات العامة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">تفعيل الإشعارات</p>
                    <p className="text-sm text-gray-600">تشغيل/إيقاف جميع الإشعارات</p>
                  </div>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateGeneralSetting('enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Volume2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">الأصوات</p>
                    <p className="text-sm text-gray-600">تشغيل أصوات الإشعارات</p>
                  </div>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateGeneralSetting('soundEnabled', checked)}
                  disabled={!settings.enabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Monitor className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">إشعارات سطح المكتب</p>
                    <p className="text-sm text-gray-600">إظهار الإشعارات في سطح المكتب</p>
                  </div>
                </div>
                <Switch
                  checked={settings.desktopEnabled}
                  onCheckedChange={(checked) => updateGeneralSetting('desktopEnabled', checked)}
                  disabled={!settings.enabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Mail className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">البريد الإلكتروني</p>
                    <p className="text-sm text-gray-600">إرسال الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Badge variant="outline" className="text-xs">قريباً</Badge>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => updateGeneralSetting('emailEnabled', checked)}
                  disabled={!settings.enabled || true} // Disabled until implemented
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                أنواع الإشعارات
              </CardTitle>
              <p className="text-sm text-gray-600">
                تخصيص كل نوع من الإشعارات حسب الأولوية والتفعيل
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(notificationTypeLabels).map(([type, label]) => {
                  const typeSettings = settings.types[type as NotificationType];
                  const description = notificationTypeDescriptions[type as NotificationType];

                  return (
                    <div key={type} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{label}</h3>
                            <Badge
                              className={cn("text-xs", priorityColors[typeSettings.priority])}
                            >
                              {priorityLabels[typeSettings.priority]}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                        <Switch
                          checked={typeSettings.enabled}
                          onCheckedChange={(checked) => updateTypeSetting(type as NotificationType, 'enabled', checked)}
                          disabled={!settings.enabled}
                        />
                      </div>

                      {typeSettings.enabled && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">الأولوية:</span>
                          <div className="flex gap-1">
                            {(['low', 'medium', 'high', 'urgent'] as NotificationPriority[]).map((priority) => (
                              <Button
                                key={priority}
                                size="sm"
                                variant={typeSettings.priority === priority ? "default" : "outline"}
                                onClick={() => updateTypeSetting(type as NotificationType, 'priority', priority)}
                                className={cn(
                                  "text-xs",
                                  typeSettings.priority === priority && priorityColors[priority]
                                )}
                              >
                                {priorityLabels[priority]}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                إحصائيات الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(settings.types).filter(t => t.enabled).length}
                  </div>
                  <div className="text-sm text-gray-600">أنواع مفعلة</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(settings.types).filter(t => t.priority === 'urgent' && t.enabled).length}
                  </div>
                  <div className="text-sm text-gray-600">طارئة</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.values(settings.types).filter(t => t.priority === 'high' && t.enabled).length}
                  </div>
                  <div className="text-sm text-gray-600">عالية الأولوية</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {settings.enabled ? 'مفعل' : 'معطل'}
                  </div>
                  <div className="text-sm text-gray-600">الحالة العامة</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}