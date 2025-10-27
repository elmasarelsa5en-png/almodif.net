'use client';

import { SoundSettings } from '@/components/settings/sound-settings';
import { NotificationSoundManager } from '@/components/NotificationSoundManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SoundSettingsPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6" dir="rtl">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Volume2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    إعدادات الأصوات والإشعارات
                  </h1>
                  <p className="text-blue-200/80 text-sm">
                    تخصيص أصوات التنبيهات لجميع أقسام النظام
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                رجوع
              </Button>
            </div>
          </div>

          {/* System Sounds */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                أصوات النظام العامة
              </CardTitle>
              <CardDescription className="text-white/70">
                إعدادات عامة لأصوات النظام والإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SoundSettings />
            </CardContent>
          </Card>

          {/* Department Specific Sounds */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-400" />
                أصوات الأقسام المختلفة
              </CardTitle>
              <CardDescription className="text-white/70">
                تخصيص صوت مختلف لكل قسم (طلبات الموظفين، الكوفي، المغسلة، المطعم)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSoundManager />
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-2">💡 ملاحظة</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    سيتم تشغيل الأصوات تلقائياً عند وصول طلب جديد في كل قسم. 
                    يمكنك تخصيص مستوى الصوت لكل قسم على حدة أو إيقاف الصوت تماماً.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}