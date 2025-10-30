'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Bed,
  BookOpen,
  Users,
  Volume2,
  Sparkles,
  ServerCog,
  ChevronRight,
  FileText,
  Globe,
  List,
  Cloud,
  Wand2,
  UtensilsCrossed,
  Coffee,
  Shirt,
  Bell,
  Menu as MenuIcon,
  QrCode,
  Code2,
  Building2
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // التحقق من أن المستخدم هو akram
  const isDeveloper = user?.email === 'akram@almodif.net' || user?.username === 'akram';

  // إعدادات المنشأة - للفندق
  const hotelSettings = [
    {
      id: 'hotel-website',
      title: 'إعدادات موقع الفندق',
      description: 'كتالوج الغرف وإعدادات تطبيق النزلاء والموقع الإلكتروني',
      icon: Globe,
      color: 'from-blue-500 via-purple-500 to-pink-500',
      href: '/dashboard/settings/hotel-website',
      badge: '🌐 جديد'
    },
    {
      id: 'menu-items',
      title: 'قوائم الأصناف',
      description: 'إدارة أصناف الكوفي والمطعم والمغسلة - رفع Excel والصور',
      icon: UtensilsCrossed,
      color: 'from-green-500 via-emerald-500 to-teal-500',
      href: '/dashboard/settings/menu-items',
      badge: '🔥 جديد'
    },
    {
      id: 'request-types',
      title: 'أنواع طلبات النزلاء',
      description: 'إدارة الأنواع المتاحة لطلبات النزلاء',
      icon: List,
      color: 'from-cyan-500 to-blue-500',
      href: '/dashboard/settings/request-types',
      badge: 'جديد'
    },
    {
      id: 'rooms-management',
      title: 'إدارة الغرف',
      description: 'إضافة، تعديل، وضبط إعدادات الغرف والشقق',
      icon: Bed,
      color: 'from-blue-500 to-cyan-500',
      href: '/dashboard/settings/rooms-management',
      badge: null
    },
    {
      id: 'hr',
      title: 'إدارة الصلاحيات',
      description: 'تعيين الأدوار والوصول لكل فريق عمل',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      href: '/dashboard/settings/hr',
      badge: null
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-2">
          إدارة إعدادات النظام والتخصيصات
        </p>
      </div>

      {/* Developer Settings - يظهر فقط لـ akram */}
      {isDeveloper && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="h-5 w-5 text-purple-600" />
            <h2 className="text-2xl font-bold">إعدادات المطور</h2>
            <Badge variant="destructive" className="mr-2">Exclusive</Badge>
          </div>
          
          {/* بطاقة إعدادات المطور الرئيسية */}
          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5 mb-8"
            onClick={() => router.push('/dashboard/settings/developer')}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg">
                  <Code2 className="h-8 w-8" />
                </div>
                <Badge variant="default" className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1">
                  ⚡ Full Access
                </Badge>
              </div>
              <CardTitle className="mt-4 flex items-center justify-between group-hover:text-purple-600 transition-colors text-2xl">
                إعدادات المطور الكاملة
                <ChevronRight className="h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </CardTitle>
              <CardDescription className="text-base mt-3 space-y-2">
                <p className="font-semibold text-purple-900 dark:text-purple-200">🎯 الوصول الكامل لجميع الأدوات التقنية:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2 text-sm">
                  <p>• 🖼️ إدارة صور الصفحة الرئيسية</p>
                  <p>• 📱 التحكم في أقسام Dashboard</p>
                  <p>• 🔥 إعداد Firebase والمزامنة</p>
                  <p>• 🌐 إدارة الموقع الإلكتروني</p>
                  <p>• 💬 سيرفر WhatsApp والبوت</p>
                  <p>• 🤖 مساعد الذكاء الاصطناعي</p>
                  <p>• 🔔 الأصوات والإشعارات</p>
                  <p>• 📋 سجل التدقيق والأمان</p>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Hotel Settings - إعدادات المنشأة */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold">إعدادات المنشأة</h2>
          <Badge variant="default" className="mr-2">🏨 Hotel</Badge>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hotelSettings.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(action.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 flex items-center justify-between group-hover:text-primary transition-colors">
                    {action.title}
                    <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            ملاحظة مهمة
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            جميع الإعدادات يتم حفظها في Firebase. تأكد من الاتصال بالإنترنت لحفظ التغييرات.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}