'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { playNotificationSound, testAllSounds, NotificationSoundType } from '@/lib/notification-sounds';
import { Volume2, Bell, CheckCircle, XCircle, Info } from 'lucide-react';

export default function TestSoundsPage() {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const testSounds: Array<{
    id: NotificationSoundType;
    name: string;
    description: string;
    icon: any;
    color: string;
  }> = [
    { 
      id: 'new-request', 
      name: 'طلب جديد 🔔', 
      description: 'صوت صاعد لافت للانتباه (3 نغمات) - للموظف الذي سينفذ الطلب',
      icon: Bell,
      color: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50 text-orange-300'
    },
    { 
      id: 'approval', 
      name: 'موافقة ✅', 
      description: 'صوت مبهج صاعد (نغمتين سريعتين) - عند الموافقة على الطلب',
      icon: CheckCircle,
      color: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/50 text-green-300'
    },
    { 
      id: 'rejection', 
      name: 'رفض ❌', 
      description: 'صوت هابط (نغمتين) - عند رفض الطلب',
      icon: XCircle,
      color: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-300'
    },
    { 
      id: 'general', 
      name: 'إشعار عام ℹ️', 
      description: 'صوت بسيط مزدوج - للإشعارات العادية',
      icon: Info,
      color: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50 text-blue-300'
    },
  ];

  const handleTestSound = async (soundId: NotificationSoundType, name: string) => {
    setIsPlaying(soundId);
    
    try {
      playNotificationSound(soundId);
      setTimeout(() => setIsPlaying(null), 1500);
    } catch (error) {
      console.error('خطأ في تشغيل الصوت:', error);
      setIsPlaying(null);
    }
  };

  const handleTestAll = () => {
    testAllSounds();
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🔊 اختبار نظام الأصوات
            </CardTitle>
            <CardDescription className="text-center text-slate-300 text-lg">
              أصوات احترافية مميزة لكل نوع إشعار
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTestAll}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 text-lg"
            >
              <Volume2 className="ml-2 w-6 h-6" />
              اختبر جميع الأصوات بالترتيب
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testSounds.map((sound) => {
            const isCurrentlyPlaying = isPlaying === sound.id;
            const Icon = sound.icon;

            return (
              <Card 
                key={sound.id} 
                className={`bg-slate-800/50 border-2 transition-all duration-300 ${
                  isCurrentlyPlaying 
                    ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 scale-105' 
                    : sound.color.includes('border') ? sound.color : 'border-slate-700'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Icon className={`w-6 h-6 ${isCurrentlyPlaying ? 'animate-bounce' : ''}`} />
                    {sound.name}
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-sm mt-2">
                    {sound.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleTestSound(sound.id, sound.name)}
                    disabled={isCurrentlyPlaying}
                    className={`w-full font-bold py-6 ${
                      isCurrentlyPlaying 
                        ? 'bg-yellow-500 animate-pulse' 
                        : sound.color
                    }`}
                  >
                    {isCurrentlyPlaying ? (
                      <span className="flex items-center justify-center gap-2">
                        <Volume2 className="w-5 h-5 animate-pulse" />
                        يتم التشغيل...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        تشغيل الصوت
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* تعليمات */}
        <Card className="mt-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-slate-200">📝 كيفية الاستخدام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-orange-400 mt-1" />
              <div>
                <strong className="text-orange-300">طلب جديد:</strong> صوت صاعد بـ 3 نغمات لافت للانتباه - يُشغل عندما يصل طلب جديد للموظف
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <strong className="text-green-300">موافقة:</strong> صوت مبهج صاعد - يُشغل للمُرسل عند الموافقة على طلبه
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-1" />
              <div>
                <strong className="text-red-300">رفض:</strong> صوت هابط - يُشغل للمُرسل عند رفض طلبه
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <strong className="text-blue-300">إشعار عام:</strong> صوت بسيط مزدوج - للإشعارات العادية والتحديثات
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-400">{testSounds.length}</div>
              <div className="text-sm text-slate-400 mt-2">أنواع الأصوات</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-400">✓</div>
              <div className="text-sm text-slate-400 mt-2">جاهز للاستخدام</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-400">🎵</div>
              <div className="text-sm text-slate-400 mt-2">جودة عالية</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-yellow-400">⚡</div>
              <div className="text-sm text-slate-400 mt-2">Web Audio API</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}