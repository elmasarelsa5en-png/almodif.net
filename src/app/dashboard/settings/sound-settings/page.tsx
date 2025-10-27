'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  playNotificationSound, 
  testAllSounds,
  startEmployeeAlert,
  stopEmployeeAlert,
  type NotificationSoundType 
} from '@/lib/notification-sounds';

interface SoundSettings {
  enabled: boolean;
  volume: number;
  sounds: {
    [key: string]: {
      enabled: boolean;
      name: string;
      description: string;
      icon: React.ComponentType<any>;
      color: string;
      type: NotificationSoundType;
    };
  };
  employeeAlertInterval: number; // بالثواني
}

const defaultSettings: SoundSettings = {
  enabled: true,
  volume: 70,
  sounds: {
    'new-request': {
      enabled: true,
      name: 'طلب جديد',
      description: 'عند وصول طلب جديد من النزيل',
      icon: Bell,
      color: 'text-blue-500',
      type: 'new-request',
    },
    'approval': {
      enabled: true,
      name: 'موافقة',
      description: 'عند الموافقة على طلب أو إتمام عملية',
      icon: CheckCircle,
      color: 'text-green-500',
      type: 'approval',
    },
    'rejection': {
      enabled: true,
      name: 'رفض',
      description: 'عند رفض طلب أو إلغاء عملية',
      icon: XCircle,
      color: 'text-red-500',
      type: 'rejection',
    },
    'employee-alert': {
      enabled: true,
      name: 'تنبيه الموظف',
      description: 'نغمة متكررة عند وجود طلبات معلقة للموظف',
      icon: AlertCircle,
      color: 'text-orange-500',
      type: 'employee-alert',
    },
    'general': {
      enabled: true,
      name: 'إشعار عام',
      description: 'للإشعارات والرسائل العامة',
      icon: Volume2,
      color: 'text-gray-500',
      type: 'general',
    },
  },
  employeeAlertInterval: 3, // 3 ثوانٍ
};

export default function SoundSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SoundSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testingAlert, setTestingAlert] = useState(false);

  // Load settings
  useEffect(() => {
    const saved = localStorage.getItem('sound-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading sound settings:', error);
      }
    }
  }, []);

  // Save settings
  const saveSettings = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('sound-settings', JSON.stringify(settings));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving sound settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.setItem('sound-settings', JSON.stringify(defaultSettings));
  };

  // Toggle main sound
  const toggleMainSound = () => {
    setSettings({ ...settings, enabled: !settings.enabled });
  };

  // Toggle individual sound
  const toggleSound = (key: string) => {
    setSettings({
      ...settings,
      sounds: {
        ...settings.sounds,
        [key]: {
          ...settings.sounds[key],
          enabled: !settings.sounds[key].enabled,
        },
      },
    });
  };

  // Test sound
  const testSound = (type: NotificationSoundType) => {
    if (settings.enabled) {
      playNotificationSound(type);
    }
  };

  // Test all sounds
  const handleTestAll = () => {
    if (settings.enabled) {
      setIsTestingAll(true);
      testAllSounds();
      setTimeout(() => setIsTestingAll(false), 6000);
    }
  };

  // Test employee alert (repeating)
  const toggleAlertTest = () => {
    if (testingAlert) {
      stopEmployeeAlert();
      setTestingAlert(false);
    } else {
      startEmployeeAlert();
      setTestingAlert(true);
      // Auto stop after 15 seconds
      setTimeout(() => {
        stopEmployeeAlert();
        setTestingAlert(false);
      }, 15000);
    }
  };

  // Update volume
  const updateVolume = (value: number[]) => {
    setSettings({ ...settings, volume: value[0] });
  };

  // Update alert interval
  const updateAlertInterval = (value: number[]) => {
    setSettings({ ...settings, employeeAlertInterval: value[0] });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/settings')}
              className="text-white hover:text-blue-200"
            >
              <ArrowLeft className="ml-2 h-4 w-4" />
              رجوع
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Volume2 className="h-8 w-8 text-blue-400" />
                إعدادات الأصوات
              </h1>
              <p className="text-gray-400 mt-1">تخصيص التنبيهات الصوتية والإشعارات</p>
            </div>
          </div>

          {/* Success message */}
          {showSuccess && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>تم الحفظ بنجاح!</span>
            </div>
          )}
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Main Sound Control */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {settings.enabled ? (
                    <Volume2 className="h-6 w-6 text-blue-400" />
                  ) : (
                    <VolumeX className="h-6 w-6 text-gray-400" />
                  )}
                  التحكم الرئيسي في الأصوات
                </span>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={toggleMainSound}
                  className="data-[state=checked]:bg-blue-500"
                />
              </CardTitle>
              <CardDescription className="text-gray-400">
                {settings.enabled ? 'الأصوات مفعّلة' : 'الأصوات معطّلة'} - يمكنك تفعيل أو تعطيل جميع الأصوات
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Volume Control */}
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    مستوى الصوت: {settings.volume}%
                  </label>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={updateVolume}
                    max={100}
                    step={5}
                    disabled={!settings.enabled}
                    className="w-full"
                  />
                </div>

                {/* Test All Button */}
                <Button
                  onClick={handleTestAll}
                  disabled={!settings.enabled || isTestingAll}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Play className="ml-2 h-4 w-4" />
                  {isTestingAll ? 'جاري التشغيل...' : 'تشغيل جميع الأصوات (اختبار)'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Individual Sounds */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">الأصوات الفردية</CardTitle>
              <CardDescription className="text-gray-400">
                تحكم في كل صوت على حدة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.sounds).map(([key, sound]) => {
                const Icon = sound.icon;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className={`h-6 w-6 ${sound.color}`} />
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{sound.name}</h3>
                        <p className="text-gray-400 text-sm">{sound.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Test Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testSound(sound.type)}
                        disabled={!settings.enabled || !sound.enabled}
                        className="border-white/20 hover:bg-white/10"
                      >
                        <Play className="h-4 w-4" />
                      </Button>

                      {/* Toggle Switch */}
                      <Switch
                        checked={sound.enabled}
                        onCheckedChange={() => toggleSound(key)}
                        disabled={!settings.enabled}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Employee Alert Settings */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">إعدادات تنبيه الموظف</CardTitle>
              <CardDescription className="text-gray-400">
                تخصيص النغمة المتكررة للطلبات المعلقة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  فترة التكرار: {settings.employeeAlertInterval} ثانية
                </label>
                <Slider
                  value={[settings.employeeAlertInterval]}
                  onValueChange={updateAlertInterval}
                  min={2}
                  max={10}
                  step={1}
                  disabled={!settings.enabled}
                  className="w-full"
                />
                <p className="text-gray-400 text-xs mt-2">
                  النغمة ستتكرر كل {settings.employeeAlertInterval} ثانية عند وجود طلبات معلقة
                </p>
              </div>

              {/* Test Alert Button */}
              <Button
                onClick={toggleAlertTest}
                disabled={!settings.enabled}
                className={`w-full ${
                  testingAlert
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                }`}
              >
                {testingAlert ? (
                  <>
                    <VolumeX className="ml-2 h-4 w-4" />
                    إيقاف الاختبار
                  </>
                ) : (
                  <>
                    <Play className="ml-2 h-4 w-4" />
                    اختبار النغمة المتكررة (15 ثانية)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={saveSettings}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Save className="ml-2 h-5 w-5" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>

            <Button
              onClick={resetToDefaults}
              variant="outline"
              className="border-white/20 hover:bg-white/10"
            >
              <RotateCcw className="ml-2 h-5 w-5" />
              استعادة الافتراضي
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
