'use client';

import { useRouter } from 'next/navigation';
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
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  const quickActions = [
    {
      id: 'website',
      title: 'الموقع الإلكتروني',
      description: 'إنشاء وإدارة موقع الفندق للحجز أونلاين',
      icon: Globe,
      color: 'from-indigo-500 to-purple-500',
      href: '/dashboard/settings/website',
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
      id: 'rooms-catalog',
      title: 'كتالوج الشقق',
      description: 'قاعدة بيانات الغرف للذكاء الاصطناعي',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      href: '/dashboard/settings/rooms-catalog',
      badge: 'AI'
    },
    {
      id: 'hr',
      title: 'إدارة الصلاحيات',
      description: 'تعيين الأدوار والوصول لكل فريق عمل',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      href: '/dashboard/settings/hr',
      badge: null
    },
    {
      id: 'sounds',
      title: 'إعدادات الأصوات',
      description: 'تخصيص التنبيهات الصوتية للنظام',
      icon: Volume2,
      color: 'from-orange-500 to-red-500',
      href: '/sound-settings',
      badge: null
    },
    {
      id: 'ai-assistant',
      title: 'مساعد الذكاء الاصطناعي',
      description: 'إعدادات وتدريب مساعد الشات بوت',
      icon: Sparkles,
      color: 'from-yellow-500 to-amber-500',
      href: '/crm/whatsapp',
      badge: 'AI'
    },
    {
      id: 'whatsapp-server',
      title: 'سيرفر WhatsApp',
      description: 'إدارة الاتصال بـ WhatsApp وإعدادات البوت',
      icon: ServerCog,
      color: 'from-teal-500 to-green-500',
      href: '/whatsapp-bot',
      badge: null
    },
    {
      id: 'audit-logs',
      title: 'سجل التدقيق',
      description: 'جميع العمليات المسجلة في النظام (لا تُمسح أبداً)',
      icon: FileText,
      color: 'from-gray-500 to-slate-500',
      href: '/dashboard/audit-logs',
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

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">مركز الإعدادات</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
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
            جميع الإعدادات يتم حفظها محلياً في المتصفح. للاحتفاظ بالبيانات، تأكد من عمل نسخة احتياطية دورية.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}