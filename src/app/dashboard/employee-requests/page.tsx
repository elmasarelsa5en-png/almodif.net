'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Bell,
  User,
  Phone,
  FileText,
  Calendar,
  ChevronDown,
  Filter,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { playNotificationSound, startEmployeeAlert, stopEmployeeAlert, isEmployeeAlertActive } from '@/lib/notification-sounds';

interface GuestRequest {
  id: string;
  room: string;
  guest: string;
  phone?: string;
  type: string;
  notes: string;
  status: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  assignedEmployee?: string;
  employeeApprovalStatus?: 'pending' | 'approved' | 'rejected';
  employeeApprovedAt?: string;
  managerNotified?: boolean;
}

const PRIORITY_CONFIG = {
  low: { label: 'منخفضة', color: 'text-blue-400' },
  medium: { label: 'متوسطة', color: 'text-yellow-400' },
  high: { label: 'عالية', color: 'text-red-400' },
};

export default function EmployeeRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<GuestRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousRequestCount, setPreviousRequestCount] = useState(0);

  // Load requests assigned to current employee
  useEffect(() => {
    const loadRequests = () => {
      try {
        const saved = localStorage.getItem('guest-requests');
        const allRequests = saved ? JSON.parse(saved) : [];

        // Filter requests assigned to current user
        const myRequests = allRequests.filter((req: GuestRequest) => req.assignedEmployee === user?.username);
        
        // Check for new pending requests and play sound
        const newPendingRequests = myRequests.filter(
          (req: GuestRequest) => req.employeeApprovalStatus === 'pending'
        );
        
        // تشغيل النغمة المتكررة إذا كان هناك طلبات معلقة
        if (newPendingRequests.length > 0) {
          if (!isEmployeeAlertActive()) {
            console.log(`🔔 Found ${newPendingRequests.length} pending requests, starting alert...`);
            startEmployeeAlert();
          }
        } else {
          // إيقاف النغمة إذا لم يعد هناك طلبات معلقة
          if (isEmployeeAlertActive()) {
            console.log('🔕 No pending requests, stopping alert...');
            stopEmployeeAlert();
          }
        }
        
        setPreviousRequestCount(newPendingRequests.length);
        setRequests(myRequests);
        setFilteredRequests(myRequests);
      } catch (error) {
        console.error('خطأ في تحميل الطلبات:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();

    // Listen for storage updates
    const handleStorageChange = () => {
      loadRequests();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup: إيقاف النغمة عند الخروج من الصفحة
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.username, requests.length]);

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.employeeApprovalStatus === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.room.includes(searchTerm) ||
          r.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm]);

  // Approve request
  const approveRequest = (id: string) => {
    const request = requests.find(r => r.id === id);
    
    const updated = requests.map((r) =>
      r.id === id
        ? {
            ...r,
            employeeApprovalStatus: 'approved' as const,
            employeeApprovedAt: new Date().toISOString(),
            managerNotified: true,
            status: 'in-progress',
          }
        : r
    );
    setRequests(updated);

    // Update global storage
    const allRequests = JSON.parse(localStorage.getItem('guest-requests') || '[]');
    const updatedAll = allRequests.map((req: GuestRequest) =>
      req.id === id
        ? {
            ...req,
            employeeApprovalStatus: 'approved' as const,
            employeeApprovedAt: new Date().toISOString(),
            managerNotified: true,
            status: 'in-progress',
          }
        : req
    );
    localStorage.setItem('guest-requests', JSON.stringify(updatedAll));
    
    // إيقاف النغمة المتكررة بعد الموافقة على آخر طلب
    const remainingPending = updatedAll.filter(
      (req: GuestRequest) => 
        req.assignedEmployee === user?.username && 
        req.employeeApprovalStatus === 'pending'
    );
    
    if (remainingPending.length === 0) {
      console.log('✅ All requests approved, stopping alert...');
      stopEmployeeAlert();
    }
    
    // Update linked section order if exists
    if (request && (request as any).linkedSection && (request as any).originalOrderId) {
      const linkedSection = (request as any).linkedSection;
      const originalOrderId = (request as any).originalOrderId;
      
      if (linkedSection === 'coffee') {
        const coffeeOrders = JSON.parse(localStorage.getItem('coffee_orders') || '[]');
        const updatedOrders = coffeeOrders.map((order: any) => 
          order.id === originalOrderId ? { ...order, status: 'preparing', approvedByReception: true } : order
        );
        localStorage.setItem('coffee_orders', JSON.stringify(updatedOrders));
      } else if (linkedSection === 'laundry') {
        const laundryRequests = JSON.parse(localStorage.getItem('LAUNDRY_REQUESTS_STORAGE_KEY') || '[]');
        const updatedRequests = laundryRequests.map((req: any) => 
          req.id === originalOrderId ? { ...req, status: 'InProgress', approvedByReception: true } : req
        );
        localStorage.setItem('LAUNDRY_REQUESTS_STORAGE_KEY', JSON.stringify(updatedRequests));
      } else if (linkedSection === 'restaurant') {
        const restaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders') || '[]');
        const updatedOrders = restaurantOrders.map((order: any) => 
          order.id === originalOrderId ? { ...order, status: 'preparing', approvedByReception: true } : order
        );
        localStorage.setItem('restaurant_orders', JSON.stringify(updatedOrders));
      }
    }
    
    window.dispatchEvent(new Event('storage'));

    // Play approval sound
    playNotificationSound('approval');

    // Add notification for manager
    addManagerNotification(id, 'approved');
  };

  // Reject request
  const rejectRequest = (id: string) => {
    const request = requests.find(r => r.id === id);
    
    const updated = requests.map((r) =>
      r.id === id
        ? {
            ...r,
            employeeApprovalStatus: 'rejected' as const,
            employeeApprovedAt: new Date().toISOString(),
            managerNotified: true,
          }
        : r
    );
    setRequests(updated);

    // Update global storage
    const allRequests = JSON.parse(localStorage.getItem('guest-requests') || '[]');
    const updatedAll = allRequests.map((req: GuestRequest) =>
      req.id === id
        ? {
            ...req,
            employeeApprovalStatus: 'rejected' as const,
            employeeApprovedAt: new Date().toISOString(),
            managerNotified: true,
          }
        : req
    );
    localStorage.setItem('guest-requests', JSON.stringify(updatedAll));
    
    // Update linked section order if exists
    if (request && (request as any).linkedSection && (request as any).originalOrderId) {
      const linkedSection = (request as any).linkedSection;
      const originalOrderId = (request as any).originalOrderId;
      
      if (linkedSection === 'coffee') {
        const coffeeOrders = JSON.parse(localStorage.getItem('coffee_orders') || '[]');
        const updatedOrders = coffeeOrders.map((order: any) => 
          order.id === originalOrderId ? { ...order, status: 'cancelled', rejectedByReception: true } : order
        );
        localStorage.setItem('coffee_orders', JSON.stringify(updatedOrders));
      } else if (linkedSection === 'laundry') {
        const laundryRequests = JSON.parse(localStorage.getItem('LAUNDRY_REQUESTS_STORAGE_KEY') || '[]');
        const updatedRequests = laundryRequests.map((req: any) => 
          req.id === originalOrderId ? { ...req, status: 'Cancelled' as any, rejectedByReception: true } : req
        );
        localStorage.setItem('LAUNDRY_REQUESTS_STORAGE_KEY', JSON.stringify(updatedRequests));
      } else if (linkedSection === 'restaurant') {
        const restaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders') || '[]');
        const updatedOrders = restaurantOrders.map((order: any) => 
          order.id === originalOrderId ? { ...order, status: 'cancelled', rejectedByReception: true } : order
        );
        localStorage.setItem('restaurant_orders', JSON.stringify(updatedOrders));
      }
    }
    
    window.dispatchEvent(new Event('storage'));

    // Play rejection sound
    playNotificationSound('rejection');

    // Add notification for manager
    addManagerNotification(id, 'rejected');
  };

  // Add notification for manager
  const addManagerNotification = (requestId: string, action: 'approved' | 'rejected') => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    const notification = {
      id: `notif-${Date.now()}`,
      type: 'employee_approval',
      title: action === 'approved' ? '✅ وافق الموظف على الطلب' : '❌ رفض الموظف الطلب',
      message: `${user?.name} ${action === 'approved' ? 'وافق على' : 'رفض'} طلب الغرفة ${request.room}`,
      time: new Date().toISOString(),
      read: false,
      requestId,
      action,
      employeeId: user?.username,
    };

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  const getStatCounts = () => ({
    pending: requests.filter((r) => r.employeeApprovalStatus === 'pending').length,
    approved: requests.filter((r) => r.employeeApprovalStatus === 'approved').length,
    rejected: requests.filter((r) => r.employeeApprovalStatus === 'rejected').length,
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
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                    طلباتي
                  </h1>
                  <p className="text-cyan-200/80">
                    الطلبات المسندة إليك للمراجعة والموافقة
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
                    <p className="text-white/70 text-sm">إجمالي الطلبات</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                  <Bell className="w-8 h-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">بانتظار الموافقة</p>
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
                    <p className="text-white/70 text-sm">موافق عليها</p>
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
                    <p className="text-white/70 text-sm">مرفوضة</p>
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
                  placeholder="البحث في الغرفة، النزيل..."
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
                  <option value="all" className="bg-slate-900">
                    الكل
                  </option>
                  <option value="pending" className="bg-slate-900">
                    بانتظار الموافقة
                  </option>
                  <option value="approved" className="bg-slate-900">
                    موافق عليها
                  </option>
                  <option value="rejected" className="bg-slate-900">
                    مرفوضة
                  </option>
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
                  <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">لا توجد طلبات</h3>
                  <p className="text-white/60">
                    {searchTerm || statusFilter !== 'all'
                      ? 'لم يتم العثور على طلبات تطابق معايير البحث'
                      : 'لم تُسند إليك أي طلبات حتى الآن'}
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
                          <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-cyan-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl font-bold text-white">غرفة {request.room}</span>
                              <Badge className={`${PRIORITY_CONFIG[request.priority].color} bg-transparent border`}>
                                {PRIORITY_CONFIG[request.priority].label}
                              </Badge>
                            </div>
                            <p className="text-white/70 text-sm">{request.type}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
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

                          {/* Approval Date */}
                          {request.employeeApprovedAt && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-white/70 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>تاريخ المراجعة:</span>
                              </div>
                              <p className="text-white ml-6">{formatDate(request.employeeApprovedAt)}</p>
                            </div>
                          )}
                        </div>

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

                        {/* Action Buttons */}
                        {request.employeeApprovalStatus === 'pending' && (
                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={() => approveRequest(request.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex-1"
                            >
                              <CheckCircle className="w-4 h-4 ml-2" />
                              الموافقة
                            </Button>
                            <Button
                              onClick={() => rejectRequest(request.id)}
                              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 flex-1"
                            >
                              <XCircle className="w-4 h-4 ml-2" />
                              الرفض
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Info Box */}
          <Card className="bg-blue-500/20 backdrop-blur-md border-blue-500/30 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-200 text-sm">
                  <p className="font-semibold mb-1">💡 ملاحظة مهمة:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>عند الموافقة: سيتم إخطار المدير والطلب ينتقل لحالة "قيد التنفيذ"</li>
                    <li>عند الرفض: سيتم إخطار المدير بسبب الرفض</li>
                    <li>جميع إجراءاتك يتم تسجيلها في السجل</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
