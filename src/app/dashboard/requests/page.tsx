'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Inbox,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
  ChevronDown,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  subscribeToRequests, 
  updateRequest, 
  deleteRequest as deleteRequestFromFirebase,
  GuestRequest 
} from '@/lib/firebase-data';

const STATUS_CONFIG = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-500/20 text-yellow-300', icon: '⏳' },
  'in-progress': { label: 'قيد التنفيذ', color: 'bg-blue-500/20 text-blue-300', icon: '⚙️' },
  approved: { label: 'موافق عليه', color: 'bg-green-500/20 text-green-300', icon: '✅' },
  completed: { label: 'مكتمل', color: 'bg-green-500/20 text-green-300', icon: '✅' },
  rejected: { label: 'مرفوض', color: 'bg-red-500/20 text-red-300', icon: '❌' },
  'awaiting_employee_approval': { label: 'بانتظار موافقة الموظف', color: 'bg-purple-500/20 text-purple-300', icon: '⏱️' },
} as const;

const PRIORITY_CONFIG = {
  low: { label: 'منخفضة', color: 'text-blue-400' },
  medium: { label: 'متوسطة', color: 'text-yellow-400' },
  high: { label: 'عالية', color: 'text-red-400' },
};

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<GuestRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousRequestCount, setPreviousRequestCount] = useState(0);

  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      // Create multiple beep sounds for attention
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBeep = (frequency: number, duration: number, delay: number) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, delay);
      };

      // Play a series of attention-grabbing beeps
      playBeep(800, 0.15, 0);      // First beep
      playBeep(1000, 0.15, 200);   // Second beep (higher)
      playBeep(800, 0.15, 400);    // Third beep
      playBeep(1200, 0.3, 600);    // Final longer beep (highest)
      
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Load requests from Firebase with real-time updates
  useEffect(() => {
    setIsLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToRequests((requestsData) => {
      console.log('📨 Received requests update:', requestsData.length, 'requests');
      console.log('Previous count:', previousRequestCount);
      
      // Check if there are new requests
      if (previousRequestCount > 0 && requestsData.length > previousRequestCount) {
        console.log('🔔 NEW REQUEST DETECTED! Playing sound...');
        
        // New request detected - play sound
        playNotificationSound();
        
        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          const newRequest = requestsData[0]; // Most recent request
          new Notification('🔔 طلب جديد من نزيل', {
            body: `غرفة ${newRequest.room} - ${newRequest.type}\n${newRequest.guest}`,
            icon: '/images/logo.png',
            badge: '/images/logo.png',
            tag: 'new-guest-request',
            requireInteraction: true
          });
        }
        
        // Visual alert in the page
        if (typeof window !== 'undefined') {
          const alertDiv = document.createElement('div');
          alertDiv.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce';
          alertDiv.innerHTML = '🔔 طلب جديد وصل!';
          document.body.appendChild(alertDiv);
          setTimeout(() => alertDiv.remove(), 5000);
        }
      }
      
      setPreviousRequestCount(requestsData.length);
      setRequests(requestsData);
      setFilteredRequests(requestsData);
      setIsLoading(false);
    });

    // Request notification permission immediately
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [previousRequestCount]);

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.room.includes(searchTerm) ||
          r.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          r.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm]);

  const updateRequestStatus = async (id: string, newStatus: GuestRequest['status']) => {
    try {
      const request = requests.find(r => r.id === id);
      if (!request) return;

      // إذا كان الطلب مكتمل، نضيف المبلغ للغرفة ونحذف الطلب
      if (newStatus === 'completed') {
        // جلب الطلب من guest_orders للحصول على المبلغ
        const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
        const matchingOrder = guestOrders.find((order: any) => 
          order.roomNumber === request.room && 
          order.guestName === request.guest
        );

        const orderAmount = matchingOrder?.total || 0;

        // تحديث بيانات الغرفة
        const rooms = JSON.parse(localStorage.getItem('hotel_rooms_data') || '[]');
        const roomIndex = rooms.findIndex((r: any) => r.number === request.room);
        
        if (roomIndex !== -1) {
          // إضافة المبلغ للرصيد
          rooms[roomIndex].balance = (rooms[roomIndex].balance || 0) + orderAmount;
          
          // إضافة حدث في السجل
          const newEvent = {
            id: Date.now().toString(),
            type: 'order_completed',
            description: `طلب مكتمل: ${request.type}${orderAmount > 0 ? ` - المبلغ: ${orderAmount} ر.س` : ''}`,
            timestamp: new Date().toISOString(),
            user: 'النظام',
            newValue: `رصيد جديد: ${rooms[roomIndex].balance} ر.س`,
            oldValue: `رصيد سابق: ${(rooms[roomIndex].balance || 0) - orderAmount} ر.س`
          };
          
          if (!rooms[roomIndex].events) {
            rooms[roomIndex].events = [];
          }
          rooms[roomIndex].events.push(newEvent);
          rooms[roomIndex].lastUpdated = new Date().toISOString();
          
          // حفظ التحديثات
          localStorage.setItem('hotel_rooms_data', JSON.stringify(rooms));
        }

        // حذف الطلب من Firebase
        await deleteRequestFromFirebase(id);
        alert(`✅ تم إكمال الطلب بنجاح!\n${orderAmount > 0 ? `تم إضافة ${orderAmount} ر.س لرصيد الغرفة ${request.room}` : ''}`);
      } else {
        // تحديث الحالة فقط للحالات الأخرى
        await updateRequest(id, { 
          status: newStatus, 
          approvedAt: new Date().toISOString() 
        });
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('حدث خطأ أثناء تحديث الطلب');
    }
  };

  const deleteRequest = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        await deleteRequestFromFirebase(id);
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('حدث خطأ أثناء حذف الطلب');
      }
    }
  };

  const getStatCounts = () => ({
    pending: requests.filter((r) => r.status === 'awaiting_employee_approval').length,
    inProgress: requests.filter((r) => r.status === 'in-progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    total: requests.length,
  });

  const stats = getStatCounts();

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const csv = [
      ['الغرفة', 'النزيل', 'نوع الطلب', 'الوصف', 'الحالة', 'الأولوية', 'التاريخ'].join(','),
      ...filteredRequests.map((r) =>
        [
          r.room, 
          r.guest, 
          r.type, 
          r.description || '', 
          STATUS_CONFIG[r.status]?.label || r.status, 
          PRIORITY_CONFIG[r.priority || 'medium']?.label || 'متوسطة', 
          r.createdAt
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `guest-requests-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 relative overflow-hidden" dir="rtl">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
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
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Inbox className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    طلبات النزلاء
                  </h1>
                  <p className="text-purple-200/80">
                    إدارة شاملة لجميع طلبات وشكاوى النزلاء
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={() => router.push('/dashboard/requests/new')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  طلب جديد
                </Button>

                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>

                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => {
                    setRequests([...requests]);
                  }}
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">إجمالي الطلبات</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                  <Inbox className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">قيد الانتظار</p>
                    <p className="text-3xl font-bold text-yellow-300">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">قيد التنفيذ</p>
                    <p className="text-3xl font-bold text-blue-300">{stats.inProgress}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">مكتملة</p>
                    <p className="text-3xl font-bold text-green-300">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <Input
                  placeholder="البحث في الغرفة، النزيل، النوع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                />
              </div>

              <div className="relative">
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white pr-10 pl-4 py-2 rounded-lg appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">الكل</option>
                  <option value="awaiting_employee_approval" className="bg-slate-900">بانتظار موافقة الموظف</option>
                  <option value="in-progress" className="bg-slate-900">قيد التنفيذ</option>
                  <option value="completed" className="bg-slate-900">مكتمل</option>
                  <option value="rejected" className="bg-slate-900">مرفوض</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-white/70">جاري تحميل الطلبات...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardContent className="text-center py-12">
                  <Inbox className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">لا توجد طلبات</h3>
                  <p className="text-white/60">
                    {searchTerm || statusFilter !== 'all'
                      ? 'لم يتم العثور على طلبات تطابق معايير البحث'
                      : 'ابدأ بإنشاء طلب جديد'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card
                  key={request.id}
                  className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 cursor-pointer"
                >
                  <div
                    className="p-6"
                    onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-fit">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl font-bold text-white">غرفة {request.room}</span>
                              {request.priority && (
                                <Badge className={`${PRIORITY_CONFIG[request.priority || 'medium'].color} bg-transparent border`}>
                                  {PRIORITY_CONFIG[request.priority || 'medium'].label}
                                </Badge>
                              )}
                            </div>
                            <p className="text-white/70 text-sm">{request.type}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`${STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-500/20 text-gray-300'} border-0 px-3 py-1`}>
                          {STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]?.icon || '📋'} {STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]?.label || request.status}
                        </Badge>
                        <ChevronDown
                          className={`w-5 h-5 text-white/50 transition-transform ${
                            expandedId === request.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === request.id && (
                      <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Guest Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                              <User className="w-4 h-4" />
                              <span>النزيل:</span>
                            </div>
                            <p className="text-white ml-6">{request.guest}</p>
                          </div>

                          {/* Phone */}
                          {request.phone && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-white/70 text-sm">
                                <Phone className="w-4 h-4" />
                                <span>الهاتف:</span>
                              </div>
                              <p className="text-white ml-6">{request.phone}</p>
                            </div>
                          )}

                          {/* Date Created */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>تاريخ الإنشاء:</span>
                            </div>
                            <p className="text-white ml-6">{formatDate(request.createdAt)}</p>
                          </div>

                          {/* Assigned Employee */}
                          {request.assignedEmployee && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-white/70 text-sm">
                                <User className="w-4 h-4" />
                                <span>الموظف المكلف:</span>
                              </div>
                              <p className="text-white ml-6">{request.assignedEmployee}</p>
                            </div>
                          )}

                          {/* Employee Approval Status */}
                          {request.employeeApprovalStatus && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-white/70 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>حالة الموافقة:</span>
                              </div>
                              <div className="ml-6">
                                <Badge
                                  className={`border-0 px-3 py-1 ${
                                    request.employeeApprovalStatus === 'pending'
                                      ? 'bg-yellow-500/20 text-yellow-300'
                                      : request.employeeApprovalStatus === 'approved'
                                        ? 'bg-green-500/20 text-green-300'
                                        : 'bg-red-500/20 text-red-300'
                                  }`}
                                >
                                  {request.employeeApprovalStatus === 'pending'
                                    ? '⏳ بانتظار الموافقة'
                                    : request.employeeApprovalStatus === 'approved'
                                      ? '✅ موافق عليه'
                                      : '❌ مرفوض'}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* Assigned Employee */}
                          {request.assignedEmployee && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-white/70 text-sm">
                                <User className="w-4 h-4" />
                                <span>الموظف المكلف:</span>
                              </div>
                              <p className="text-white ml-6">{request.assignedEmployee}</p>
                            </div>
                          )}

                          {/* Employee Approval Status */}
                          {request.employeeApprovalStatus && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-white/70 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>حالة الموظف:</span>
                              </div>
                              <Badge className={
                                request.employeeApprovalStatus === 'approved'
                                  ? 'bg-green-500/20 text-green-300'
                                  : request.employeeApprovalStatus === 'rejected'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }>
                                {request.employeeApprovalStatus === 'approved' ? '✅ موافق' : request.employeeApprovalStatus === 'rejected' ? '❌ مرفوض' : '⏳ بانتظار الموافقة'}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        {request.description && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                              <FileText className="w-4 h-4" />
                              <span>الوصف:</span>
                            </div>
                            <p className="text-white/80 ml-6 bg-white/5 p-3 rounded-lg border border-white/10">
                              {request.description}
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        {request.notes && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                              <FileText className="w-4 h-4" />
                              <span>الملاحظات:</span>
                            </div>
                            <p className="text-white/80 ml-6 bg-white/5 p-3 rounded-lg border border-white/10">
                              {request.notes}
                            </p>
                          </div>
                        )}

                        {/* Status Update Actions */}
                        <div className="flex flex-wrap gap-2 pt-4">
                          {request.status !== 'pending' && (
                            <Button
                              onClick={() => updateRequestStatus(request.id, 'pending')}
                              variant="outline"
                              className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 text-xs"
                            >
                              ⏳ قيد الانتظار
                            </Button>
                          )}
                          {request.status !== 'in-progress' && (
                            <Button
                              onClick={() => updateRequestStatus(request.id, 'in-progress')}
                              variant="outline"
                              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs"
                            >
                              ⚙️ قيد التنفيذ
                            </Button>
                          )}
                          {request.status !== 'completed' && (
                            <Button
                              onClick={() => updateRequestStatus(request.id, 'completed')}
                              variant="outline"
                              className="border-green-500/30 text-green-300 hover:bg-green-500/10 text-xs"
                            >
                              ✅ مكتمل
                            </Button>
                          )}
                          {request.status !== 'rejected' && (
                            <Button
                              onClick={() => updateRequestStatus(request.id, 'rejected')}
                              variant="outline"
                              className="border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs"
                            >
                              ❌ مرفوض
                            </Button>
                          )}

                          <Button
                            onClick={() => deleteRequest(request.id)}
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20 ml-auto text-xs"
                          >
                            <Trash2 className="w-4 h-4 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
