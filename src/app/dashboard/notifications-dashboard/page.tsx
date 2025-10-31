'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Mail,
  Send,
  Bell,
  Smartphone,
  TrendingUp,
  Check,
  X,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';
import {
  getNotificationStats,
  NotificationStats
} from '@/lib/notifications/notification-service';

export default function NotificationsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await getNotificationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          لوحة الإشعارات
        </h1>
        <p className="text-gray-600 mt-1">
          إحصائيات ومعلومات الإشعارات المرسلة
        </p>
        
        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => window.location.href = '/dashboard/settings/notifications-config'}
            variant="default"
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            إعدادات الإشعارات
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي المرسل</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalSent.toLocaleString('ar-SA')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Send className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">تم التوصيل</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.totalDelivered.toLocaleString('ar-SA')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">فشل التوصيل</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.totalFailed.toLocaleString('ar-SA')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">معدل التوصيل</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.deliveryRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {Object.entries(stats.byChannel).map(([channel, data]) => {
              const getChannelInfo = (ch: string) => {
                switch (ch) {
                  case 'whatsapp':
                    return { name: 'WhatsApp', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' };
                  case 'sms':
                    return { name: 'SMS', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-100' };
                  case 'email':
                    return { name: 'Email', icon: Mail, color: 'text-purple-600', bg: 'bg-purple-100' };
                  default:
                    return { name: ch, icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' };
                }
              };

              const info = getChannelInfo(channel);
              const Icon = info.icon;

              return (
                <Card key={channel}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-10 h-10 ${info.bg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${info.color}`} />
                      </div>
                      {info.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">المرسل</span>
                        <span className="font-semibold">{data.sent}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">تم التوصيل</span>
                        <span className="font-semibold text-green-600">{data.delivered}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">فشل</span>
                        <span className="font-semibold text-red-600">{data.failed}</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">معدل النجاح</span>
                          <Badge variant="default" className={data.rate >= 90 ? 'bg-green-600' : data.rate >= 70 ? 'bg-yellow-600' : 'bg-red-600'}>
                            {data.rate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Type Stats */}
          <Card>
            <CardHeader>
              <CardTitle>الإشعارات حسب النوع</CardTitle>
              <CardDescription>توزيع الإشعارات المرسلة حسب النوع</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.byType).map(([type, count]) => {
                  const getTypeInfo = (t: string) => {
                    switch (t) {
                      case 'booking_confirmation':
                        return { name: 'تأكيد الحجز', icon: Calendar, color: 'text-blue-600' };
                      case 'payment_received':
                        return { name: 'دفع مستلم', icon: DollarSign, color: 'text-green-600' };
                      case 'check_in_reminder':
                        return { name: 'تذكير الوصول', icon: Users, color: 'text-purple-600' };
                      default:
                        return { name: t, icon: Bell, color: 'text-gray-600' };
                    }
                  };

                  const info = getTypeInfo(type);
                  const Icon = info.icon;

                  return (
                    <div key={type} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${info.color}`} />
                        <span className="text-sm font-medium">{info.name}</span>
                      </div>
                      <p className="text-2xl font-bold">{count.toLocaleString('ar-SA')}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
