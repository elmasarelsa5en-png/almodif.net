'use client';

import { useRouter } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  Globe,
  BookOpen,
  Smartphone,
  Home,
  ImageIcon
} from 'lucide-react';

export default function HotelWebsiteSettingsPage() {
  const router = useRouter();

  const websiteSettings = [
    {
      id: 'website-images',
      title: 'صور الموقع',
      description: 'رفع وتعديل صور الغلاف والخدمات في صفحة الزائرين',
      icon: ImageIcon,
      color: 'from-pink-500 via-rose-500 to-red-500',
      href: '/dashboard/settings/hotel-website/images',
      badge: '🖼️ جديد'
    },
    {
      id: 'rooms-catalog',
      title: 'كتالوج الغرف',
      description: 'إدارة الوحدات المتاحة للحجز - الصور والأسعار والمواصفات',
      icon: BookOpen,
      color: 'from-blue-500 via-cyan-500 to-teal-500',
      href: '/dashboard/settings/rooms-catalog',
      badge: '🏨 Hotel'
    },
    {
      id: 'guest-app-settings',
      title: 'إعدادات تطبيق النزيل',
      description: 'تخصيص تطبيق النزلاء - الشعار، الترحيب، الخدمات المتاحة',
      icon: Smartphone,
      color: 'from-purple-500 via-pink-500 to-rose-500',
      href: '/dashboard/settings/guest-app-settings',
      badge: '📱 جديد'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <Globe className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">إعدادات موقع الفندق</h1>
            <p className="text-muted-foreground mt-1">
              إدارة إعدادات الموقع الإلكتروني وتطبيق النزلاء
            </p>
          </div>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {websiteSettings.map((setting) => {
          const Icon = setting.icon;
          return (
            <Card 
              key={setting.id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50"
              onClick={() => router.push(setting.href)}
            >
              <CardHeader className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${setting.color} text-white shadow-lg`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  {setting.badge && (
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {setting.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl flex items-center justify-between group-hover:text-primary transition-colors">
                  {setting.title}
                  <ChevronRight className="h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <CardDescription className="text-base mt-3 leading-relaxed">
                  {setting.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600" />
            معلومات مهمة
          </CardTitle>
          <CardDescription className="text-base leading-relaxed space-y-2">
            <p>• <strong>صور الموقع:</strong> رفع وتعديل صور الغلاف والخدمات</p>
            <p>• <strong>كتالوج الغرف:</strong> يظهر في تطبيق النزلاء للحجز المباشر</p>
            <p>• <strong>إعدادات التطبيق:</strong> تخصيص الشعار ورسالة الترحيب والخدمات</p>
            <p>• جميع التعديلات تُحفظ في Firebase وتظهر فوراً للنزلاء</p>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
