'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  requestId?: string;
  employeeId?: string;
  action?: 'approved' | 'rejected';
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const saved = localStorage.getItem('notifications');
        const data = saved ? JSON.parse(saved) : [];
        setNotifications(data);
        setFilteredNotifications(data);
      } catch (error) {
        console.error('خطأ في تحميل الإشعارات:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Listen for storage updates
    const handleStorageChange = () => {
      loadNotifications();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;

    if (typeFilter !== 'all') {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, typeFilter, searchTerm]);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const markAsUnread = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: false } : n));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const getStatCounts = () => ({
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    approved: notifications.filter((n) => n.action === 'approved').length,
    rejected: notifications.filter((n) => n.action === 'rejected').length,
  });

  const stats = getStatCounts();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;

    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 relative overflow-hidden" dir="rtl">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة
                </Button>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                    الإشعارات
                  </h1>
                  <p className="text-orange-200/80">
                    إشعارات موافقات ورفضات الموظفين على الطلبات
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">إجمالي الإشعارات</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                  <Bell className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">غير مقروءة</p>
                    <p className="text-3xl font-bold text-yellow-300">{stats.unread}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">موافقات</p>
                    <p className="text-3xl font-bold text-green-300">{stats.approved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">رفضات</p>
                    <p className="text-3xl font-bold text-red-300">{stats.rejected}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <Input
                  placeholder="البحث في الإشعارات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                />
              </div>

              <div className="relative">
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white pr-10 pl-4 py-2 rounded-lg appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">
                    الكل
                  </option>
                  <option value="employee_approval" className="bg-slate-900">
                    موافقات الموظفين
                  </option>
                  <option value="request_created" className="bg-slate-900">
                    طلبات جديدة
                  </option>
                  <option value="system" className="bg-slate-900">
                    إشعارات النظام
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-white/70">جاري تحميل الإشعارات...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardContent className="text-center py-12">
                  <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">لا توجد إشعارات</h3>
                  <p className="text-white/60">
                    {searchTerm || typeFilter !== 'all'
                      ? 'لم يتم العثور على إشعارات تطابق معايير البحث'
                      : 'لم تصل إشعارات جديدة بعد'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`backdrop-blur-md shadow-2xl transition-all duration-300 ${
                    notification.read
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/15 border-white/30 ring-2 ring-orange-500/50'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notification.action === 'approved'
                              ? 'bg-green-500/20'
                              : notification.action === 'rejected'
                                ? 'bg-red-500/20'
                                : 'bg-blue-500/20'
                          }`}
                        >
                          {notification.action === 'approved' ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : notification.action === 'rejected' ? (
                            <XCircle className="w-6 h-6 text-red-400" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-blue-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-white font-semibold">{notification.title}</h3>
                            {!notification.read && (
                              <Badge className="bg-orange-500 text-white text-xs">جديد</Badge>
                            )}
                          </div>
                          <p className="text-white/70 text-sm mb-2">{notification.message}</p>
                          <p className="text-white/50 text-xs">{formatDate(notification.time)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white/70 hover:text-white hover:bg-white/20"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white/70 hover:text-white hover:bg-white/20"
                            onClick={() => markAsUnread(notification.id)}
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-400"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
