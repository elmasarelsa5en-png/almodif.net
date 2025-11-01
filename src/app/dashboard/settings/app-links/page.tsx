'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  Copy,
  Check,
  Globe,
  MessageCircle,
  Calendar,
  FileText,
  Search,
  Home,
  Users,
  Phone,
  Mail,
  Smartphone
} from 'lucide-react';

interface AppLink {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: any;
  category: 'public' | 'guest' | 'dashboard';
  color: string;
}

export default function AppLinksPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const appLinks: AppLink[] = [
    // Public Links
    {
      id: 'landing',
      title: 'الصفحة الرئيسية للزائرين',
      description: 'صفحة الهبوط مع معلومات الفندق والغرف والأسعار',
      path: '/public/landing',
      icon: Globe,
      category: 'public',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'faq',
      title: 'الأسئلة الشائعة + الشات بوت',
      description: 'صفحة FAQ مع شات بوت ذكي للرد التلقائي',
      path: '/public/faq',
      icon: MessageCircle,
      category: 'public',
      color: 'from-purple-500 to-purple-600'
    },
    // Guest App Links
    {
      id: 'guest-app',
      title: 'تطبيق الضيوف',
      description: 'الصفحة الرئيسية لتطبيق الضيوف',
      path: '/guest-app',
      icon: Smartphone,
      category: 'guest',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'booking',
      title: 'صفحة الحجز',
      description: 'نموذج الحجز الإلكتروني للضيوف',
      path: '/guest-app/booking',
      icon: Calendar,
      category: 'guest',
      color: 'from-amber-500 to-amber-600'
    },
    {
      id: 'my-bookings',
      title: 'حجوزاتي',
      description: 'عرض حجوزات الضيف',
      path: '/guest-app/my-bookings',
      icon: FileText,
      category: 'guest',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'contact',
      title: 'اتصل بنا',
      description: 'صفحة التواصل مع الفندق',
      path: '/guest-app/contact',
      icon: Phone,
      category: 'guest',
      color: 'from-pink-500 to-pink-600'
    },
    // Dashboard Links
    {
      id: 'dashboard',
      title: 'لوحة التحكم',
      description: 'الصفحة الرئيسية للوحة التحكم',
      path: '/dashboard',
      icon: Home,
      category: 'dashboard',
      color: 'from-slate-500 to-slate-600'
    },
    {
      id: 'guests-dashboard',
      title: 'إدارة الضيوف',
      description: 'صفحة إدارة الضيوف',
      path: '/dashboard/guests',
      icon: Users,
      category: 'dashboard',
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'bookings-dashboard',
      title: 'إدارة الحجوزات',
      description: 'صفحة إدارة الحجوزات',
      path: '/dashboard/bookings',
      icon: Calendar,
      category: 'dashboard',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const copyToClipboard = async (link: AppLink) => {
    const fullUrl = `${baseUrl}${link.path}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openLink = (path: string) => {
    window.open(path, '_blank');
  };

  const categories = {
    public: { title: '🌐 روابط عامة للزائرين', color: 'blue' },
    guest: { title: '📱 روابط تطبيق الضيوف', color: 'green' },
    dashboard: { title: '🎛️ روابط لوحة التحكم', color: 'slate' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔗 روابط التطبيق
          </h1>
          <p className="text-gray-600 text-lg">
            جميع روابط التطبيق في مكان واحد - افتح أو انسخ أي رابط بسهولة
          </p>
        </div>

        {/* Instructions Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <ExternalLink className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">كيفية الاستخدام:</h3>
              <ul className="space-y-1 text-blue-50">
                <li>• اضغط "فتح" لفتح الرابط في نافذة جديدة</li>
                <li>• اضغط "نسخ" لنسخ الرابط الكامل للحافظة</li>
                <li>• استخدم هذه الروابط لمشاركتها مع الضيوف أو الموظفين</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Links by Category */}
        {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
          const categoryLinks = appLinks.filter(link => link.category === categoryKey);
          
          return (
            <div key={categoryKey} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                {categoryInfo.title}
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryLinks.map((link) => {
                  const Icon = link.icon;
                  const isCopied = copiedId === link.id;
                  
                  return (
                    <Card key={link.id} className="bg-white hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      {/* Header with gradient */}
                      <div className={`bg-gradient-to-r ${link.color} p-4 text-white`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="font-bold text-lg">{link.title}</h3>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
                          {link.description}
                        </p>

                        {/* URL Display */}
                        <div className="bg-gray-50 p-2 rounded-lg mb-4 border border-gray-200">
                          <code className="text-xs text-gray-700 break-all" dir="ltr">
                            {baseUrl}{link.path}
                          </code>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openLink(link.path)}
                            className={`flex-1 bg-gradient-to-r ${link.color} hover:opacity-90`}
                          >
                            <ExternalLink className="ml-2 h-4 w-4" />
                            فتح
                          </Button>
                          
                          <Button
                            onClick={() => copyToClipboard(link)}
                            variant="outline"
                            className={`flex-1 ${isCopied ? 'bg-green-50 border-green-500 text-green-700' : ''}`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="ml-2 h-4 w-4" />
                                تم النسخ
                              </>
                            ) : (
                              <>
                                <Copy className="ml-2 h-4 w-4" />
                                نسخ
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* QR Codes Section */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 mt-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">💡 نصيحة احترافية</h3>
              <p className="text-indigo-100">
                يمكنك استخدام مولد QR Code لإنشاء أكواد QR لهذه الروابط وطباعتها في الفندق
              </p>
            </div>
            <Button
              onClick={() => window.open('/guest-app/qr-code', '_blank')}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              <Search className="ml-2 h-4 w-4" />
              انتقل إلى مولد QR
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <Card className="bg-blue-50 border-blue-200 p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {appLinks.filter(l => l.category === 'public').length}
            </div>
            <div className="text-sm text-gray-600">روابط عامة</div>
          </Card>
          
          <Card className="bg-green-50 border-green-200 p-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {appLinks.filter(l => l.category === 'guest').length}
            </div>
            <div className="text-sm text-gray-600">روابط الضيوف</div>
          </Card>
          
          <Card className="bg-slate-50 border-slate-200 p-4 text-center">
            <div className="text-3xl font-bold text-slate-600 mb-1">
              {appLinks.filter(l => l.category === 'dashboard').length}
            </div>
            <div className="text-sm text-gray-600">روابط الإدارة</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
