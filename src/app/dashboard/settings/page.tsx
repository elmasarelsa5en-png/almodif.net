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
  Building2,
  MessageSquare
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
      id: 'contract-settings',
      title: 'إعدادات العقد',
      description: 'بيانات المنشأة وبنود العقد والشروط والأحكام',
      icon: FileText,
      color: 'from-orange-500 via-red-500 to-pink-500',
      href: '/dashboard/settings/contract-settings',
      badge: '📝 جديد'
    },
    {
      id: 'social-media',
      title: 'منصات التواصل الاجتماعي',
      description: 'ربط وإدارة حسابات واتساب وماسنجر وانستجرام',
      icon: MessageSquare,
      color: 'from-cyan-500 via-blue-500 to-purple-500',
      href: '/dashboard/settings/social-media',
      badge: '📱 جديد'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 space-y-8">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8" />
          الإعدادات
        </h1>
        <p className="text-white/70 mt-2 text-lg">
          إدارة إعدادات النظام والتخصيصات
        </p>
      </div>

      {/* Developer Settings - يظهر فقط لـ akram */}
      {isDeveloper && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Code2 className="h-6 w-6 text-purple-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">إعدادات المطور</h2>
            <Badge className="bg-red-500/80 text-white border-0 shadow-lg">Exclusive</Badge>
          </div>
          
          {/* بطاقة إعدادات المطور الرئيسية */}
          <Card 
            className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all duration-300 cursor-pointer group shadow-xl mb-8"
            onClick={() => router.push('/dashboard/settings/developer')}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg group-hover:scale-105 transition-transform">
                  <Code2 className="h-8 w-8" />
                </div>
                <Badge className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 border-0 shadow-md">
                  ⚡ Full Access
                </Badge>
              </div>
              <CardTitle className="mt-4 flex items-center justify-between group-hover:text-purple-300 transition-colors text-2xl text-white">
                إعدادات المطور الكاملة
                <ChevronRight className="h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all text-purple-300" />
              </CardTitle>
              <CardDescription className="text-base mt-3 space-y-2 text-white/80">
                <p className="font-semibold text-purple-200">🎯 الوصول الكامل لجميع الأدوات التقنية:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm text-white/70">
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
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Building2 className="h-6 w-6 text-blue-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">إعدادات المنشأة</h2>
          <Badge className="bg-blue-500/80 text-white border-0 shadow-lg">🏨 Hotel</Badge>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hotelSettings.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.id}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group shadow-xl"
                onClick={() => router.push(action.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {action.badge && (
                      <Badge className="text-xs bg-white/20 text-white border-0 backdrop-blur-sm">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 flex items-center justify-between group-hover:text-blue-300 transition-colors text-white">
                    {action.title}
                    <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all text-blue-300" />
                  </CardTitle>
                  <CardDescription className="text-white/70">{action.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-blue-400" />
            ملاحظة مهمة
          </CardTitle>
          <CardDescription className="text-base leading-relaxed text-white/80">
            جميع الإعدادات يتم حفظها في Firebase. تأكد من الاتصال بالإنترنت لحفظ التغييرات.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}