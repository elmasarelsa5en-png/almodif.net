'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

export function SoundSettings() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationVolume, setNotificationVolume] = useState(80);
  const [messageVolume, setMessageVolume] = useState(70);
  const [selectedSound, setSelectedSound] = useState('default');
  const [isPlaying, setIsPlaying] = useState(false);

  const soundOptions = [
    { value: 'default', label: 'الصوت الافتراضي' },
    { value: 'bell', label: 'جرس' },
    { value: 'chime', label: 'رنين' },
    { value: 'notification', label: 'إشعار' },
  ];

  const playTestSound = () => {
    if (isPlaying) return;

    setIsPlaying(true);
    // محاكاة تشغيل صوت للاختبار
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };

  const saveSettings = () => {
    // حفظ الإعدادات في localStorage
    const settings = {
      soundEnabled,
      notificationVolume,
      messageVolume,
      selectedSound,
    };
    localStorage.setItem('soundSettings', JSON.stringify(settings));
    alert('تم حفظ الإعدادات بنجاح!');
  };

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedSettings = localStorage.getItem('soundSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSoundEnabled(settings.soundEnabled ?? true);
      setNotificationVolume(settings.notificationVolume ?? 80);
      setMessageVolume(settings.messageVolume ?? 70);
      setSelectedSound(settings.selectedSound ?? 'default');
    }
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      {/* الإعدادات العامة */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Volume2 className="w-5 h-5 text-blue-400" />
            الإعدادات العامة
          </CardTitle>
          <CardDescription className="text-blue-200">
            التحكم في الأصوات العامة للتطبيق
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled" className="text-sm font-medium text-white">
              تفعيل الأصوات
            </Label>
            <input
              type="checkbox"
              id="sound-enabled"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          {/* نهاية منطقة زر اختبار الصوت */}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">مستوى صوت الإشعارات</Label>
            <div className="flex items-center gap-4">
              <VolumeX className="w-4 h-4 text-gray-300" />
              <input
                type="range"
                min="0"
                max="100"
                value={notificationVolume}
                onChange={(e) => setNotificationVolume(Number(e.target.value))}
                className="flex-1"
                disabled={!soundEnabled}
              />
              <Volume2 className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-blue-200 w-12">{notificationVolume}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">مستوى صوت الرسائل</Label>
            <div className="flex items-center gap-4">
              <VolumeX className="w-4 h-4 text-gray-300" />
              <input
                type="range"
                min="0"
                max="100"
                value={messageVolume}
                onChange={(e) => setMessageVolume(Number(e.target.value))}
                className="flex-1"
                disabled={!soundEnabled}
              />
              <Volume2 className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-blue-200 w-12">{messageVolume}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* اختيار الصوت */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">اختيار الصوت</CardTitle>
          <CardDescription className="text-blue-200">
            اختر نوع الصوت المفضل للإشعارات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">نوع الصوت</Label>
            <Select value={selectedSound} onValueChange={setSelectedSound}>
              <SelectTrigger className={`!bg-slate-700 !border-slate-600 !text-white ${!soundEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <SelectValue placeholder="اختر نوع الصوت" />
              </SelectTrigger>
              <SelectContent className="!bg-slate-700 !border-slate-600">
                {soundOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={!soundEnabled} className="!text-white hover:!bg-slate-600">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            {/* تم حذف زر اختبار الصوت بناءً على طلب المستخدم */}
          </div>
        </CardContent>
      </Card>

      {/* حفظ الإعدادات */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0">
          <Volume2 className="w-4 h-4" />
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
}