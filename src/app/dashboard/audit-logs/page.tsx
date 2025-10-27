'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  auditLog, 
  AuditLogEntry, 
  AuditAction, 
  AuditCategory,
  AuditStats 
} from '@/lib/audit-log';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  FileText,
  Download,
  Search,
  Calendar,
  User,
  Activity,
  Filter,
  RefreshCw,
  TrendingUp,
  Clock,
  BarChart3,
  Archive,
  Eye,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<AuditAction | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<AuditCategory | 'ALL'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // تحميل البيانات
  useEffect(() => {
    loadData();
  }, []);

  // فلترة السجلات
  useEffect(() => {
    filterLogs();
  }, [searchQuery, selectedAction, selectedCategory, selectedDate, logs]);

  const loadData = () => {
    setIsLoading(true);
    try {
      const allLogs = auditLog.getAllLogs();
      const statistics = auditLog.getStats();
      setLogs(allLogs);
      setFilteredLogs(allLogs);
      setStats(statistics);
    } catch (error) {
      console.error('خطأ في تحميل السجلات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // البحث النصي
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q)
      );
    }

    // فلترة حسب نوع العملية
    if (selectedAction !== 'ALL') {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    // فلترة حسب الفئة
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    // فلترة حسب التاريخ
    if (selectedDate) {
      filtered = filtered.filter(log => log.date.includes(selectedDate));
    }

    setFilteredLogs(filtered);
  };

  const handleExport = (format: 'json' | 'csv') => {
    auditLog.exportLogs(format);
  };

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'CREATE': return <CheckCircle className="w-4 h-4" />;
      case 'UPDATE': return <RefreshCw className="w-4 h-4" />;
      case 'DELETE': return <XCircle className="w-4 h-4" />;
      case 'LOGIN': return <User className="w-4 h-4" />;
      case 'EXPORT': return <Download className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case 'CREATE': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'UPDATE': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'LOGIN': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'LOGOUT': return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    }
  };

  const translateAction = (action: AuditAction): string => {
    const translations: Record<AuditAction, string> = {
      CREATE: 'إضافة',
      UPDATE: 'تعديل',
      DELETE: 'حذف',
      VIEW: 'عرض',
      LOGIN: 'دخول',
      LOGOUT: 'خروج',
      EXPORT: 'تصدير',
      IMPORT: 'استيراد',
      APPROVE: 'موافقة',
      REJECT: 'رفض',
      RESTORE: 'استعادة',
      ARCHIVE: 'أرشفة',
      PRINT: 'طباعة',
      SEND: 'إرسال',
      RECEIVE: 'استلام',
      PAYMENT: 'دفع',
      REFUND: 'استرداد'
    };
    return translations[action] || action;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">جاري تحميل السجلات...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6" dir="rtl">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    سجل التدقيق
                  </h1>
                  <p className="text-blue-200/80 text-sm">
                    جميع العمليات المسجلة في النظام
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExport('json')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 ml-2" />
                  JSON
                </Button>
                <Button
                  onClick={() => handleExport('csv')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 ml-2" />
                  CSV
                </Button>
                <Button
                  onClick={loadData}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* إحصائيات */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">إجمالي السجلات</p>
                      <p className="text-white text-3xl font-bold">{stats.totalLogs.toLocaleString()}</p>
                    </div>
                    <Activity className="w-10 h-10 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">اليوم</p>
                      <p className="text-white text-3xl font-bold">{stats.todayLogs}</p>
                    </div>
                    <Clock className="w-10 h-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">هذا الأسبوع</p>
                      <p className="text-white text-3xl font-bold">{stats.thisWeekLogs}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">هذا الشهر</p>
                      <p className="text-white text-3xl font-bold">{stats.thisMonthLogs}</p>
                    </div>
                    <BarChart3 className="w-10 h-10 text-pink-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* الفلاتر */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* البحث */}
                <div>
                  <label className="text-white text-sm mb-2 block">بحث</label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2 text-white placeholder-white/30"
                    />
                  </div>
                </div>

                {/* نوع العملية */}
                <div>
                  <label className="text-white text-sm mb-2 block">نوع العملية</label>
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="ALL">الكل</option>
                    <option value="CREATE">إضافة</option>
                    <option value="UPDATE">تعديل</option>
                    <option value="DELETE">حذف</option>
                    <option value="LOGIN">دخول</option>
                    <option value="LOGOUT">خروج</option>
                    <option value="EXPORT">تصدير</option>
                  </select>
                </div>

                {/* الفئة */}
                <div>
                  <label className="text-white text-sm mb-2 block">الفئة</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="ALL">الكل</option>
                    <option value="EMPLOYEE">موظفين</option>
                    <option value="ROOM">غرف</option>
                    <option value="BOOKING">حجوزات</option>
                    <option value="VOUCHER">سندات</option>
                    <option value="SETTINGS">إعدادات</option>
                    <option value="USER">مستخدمين</option>
                  </select>
                </div>

                {/* التاريخ */}
                <div>
                  <label className="text-white text-sm mb-2 block">التاريخ</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-white/70 text-sm">
                  عرض {filteredLogs.length} من {logs.length} سجل
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAction('ALL');
                    setSelectedCategory('ALL');
                    setSelectedDate('');
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  إعادة تعيين
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* قائمة السجلات */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                السجلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">لا توجد سجلات</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {/* الأيقونة */}
                          <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                            {getActionIcon(log.action)}
                          </div>

                          {/* المحتوى */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getActionColor(log.action)}>
                                {translateAction(log.action)}
                              </Badge>
                              <span className="text-white/50 text-xs">•</span>
                              <span className="text-white/70 text-sm">{log.entity}</span>
                            </div>
                            <p className="text-white font-medium mb-2">{log.description}</p>
                            <div className="flex items-center gap-4 text-xs text-white/50">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.userName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {log.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {log.time}
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-white/30" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal تفاصيل السجل */}
        {selectedLog && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedLog(null)}
          >
            <Card
              className="bg-slate-900 border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  تفاصيل السجل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-sm">نوع العملية</p>
                    <Badge className={getActionColor(selectedLog.action)}>
                      {translateAction(selectedLog.action)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">الفئة</p>
                    <p className="text-white">{selectedLog.entity}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">المستخدم</p>
                    <p className="text-white">{selectedLog.userName}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">البريد</p>
                    <p className="text-white text-sm">{selectedLog.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">التاريخ</p>
                    <p className="text-white">{selectedLog.date}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">الوقت</p>
                    <p className="text-white">{selectedLog.time}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">الجهاز</p>
                    <p className="text-white">{selectedLog.device}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">المتصفح</p>
                    <p className="text-white">{selectedLog.browser}</p>
                  </div>
                </div>

                <div>
                  <p className="text-white/50 text-sm mb-2">الوصف</p>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{selectedLog.description}</p>
                </div>

                {selectedLog.changes && selectedLog.changes.length > 0 && (
                  <div>
                    <p className="text-white/50 text-sm mb-2">التغييرات</p>
                    <div className="space-y-2">
                      {selectedLog.changes.map((change, index) => (
                        <div key={index} className="bg-white/5 p-3 rounded-lg">
                          <p className="text-white font-medium mb-1">{change.fieldLabel}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-red-400">القديم: </span>
                              <span className="text-white/70">{change.oldValue || 'لا يوجد'}</span>
                            </div>
                            <div>
                              <span className="text-green-400">الجديد: </span>
                              <span className="text-white/70">{change.newValue || 'لا يوجد'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setSelectedLog(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  إغلاق
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
