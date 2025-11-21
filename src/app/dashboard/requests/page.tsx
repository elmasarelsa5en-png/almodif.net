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
  Star,
  UserCheck,
  Check,
  ArrowUpDown,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RatingDialog } from '@/components/RatingDialog';
import { RegistrationRequestsSection } from '@/components/RegistrationRequestsSection';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { 
  subscribeToRequests, 
  updateRequest, 
  deleteRequest as deleteRequestFromFirebase,
  GuestRequest 
} from '@/lib/firebase-data';
import { playNotificationSound } from '@/lib/notification-sounds';

export default function RequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const STATUS_CONFIG = {
    pending: { label: t('statusPending'), color: 'bg-yellow-500 text-white font-bold', icon: '⏳' },
    'in-progress': { label: t('statusInProgress'), color: 'bg-blue-600 text-white font-bold', icon: '⚙️' },
    approved: { label: t('statusApproved'), color: 'bg-green-600 text-white font-bold', icon: '✅' },
    completed: { label: t('statusCompleted'), color: 'bg-green-600 text-white font-bold', icon: '✅' },
    rejected: { label: t('statusRejected'), color: 'bg-red-600 text-white font-bold', icon: '❌' },
    'awaiting_employee_approval': { label: t('statusAwaitingEmployeeApproval'), color: 'bg-purple-600 text-white font-bold', icon: '⏱️' },
  } as const;

  const PRIORITY_CONFIG = {
    low: { label: t('priorityLow'), color: 'bg-blue-500 text-white border-blue-600' },
    medium: { label: t('priorityMedium'), color: 'bg-yellow-500 text-white border-yellow-600' },
    high: { label: t('priorityHigh'), color: 'bg-red-500 text-white border-red-600' },
  };
  
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<GuestRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousRequestCount, setPreviousRequestCount] = useState(0);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedRequestForRating, setSelectedRequestForRating] = useState<GuestRequest | null>(null);
  const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ✨ وظيفة حساب الوقت منذ إنشاء الطلب
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  };

  // ✨ تحسين صوت الإشعار
  const playEnhancedNotificationSound = () => {
    try {
      // محاولة تشغيل ملف صوت إذا كان موجوداً
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.7;
      audio.play().catch(() => {
        // إذا فشل، استخدم الصوت المدمج
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
        playBeep(880, 0.2, 0);
        playBeep(1100, 0.2, 250);
        playBeep(1320, 0.3, 500);
      });

      // إضافة اهتزاز للموبايل
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
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
        
        // New request detected - play enhanced sound
        playEnhancedNotificationSound();
        
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
    if (!requests || !Array.isArray(requests)) {
      setFilteredRequests([]);
      return;
    }
    
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((r) => r.priority === priorityFilter);
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

    // ترتيب النتائج
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'priority') {
        const priorityA = priorityOrder[a.priority || 'medium'];
        const priorityB = priorityOrder[b.priority || 'medium'];
        return sortOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
      } else if (sortBy === 'status') {
        return sortOrder === 'asc' 
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });

    setFilteredRequests(filtered);
  }, [requests, statusFilter, priorityFilter, searchTerm, sortBy, sortOrder]);

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

        // تحديث بيانات الغرفة في Firebase
        const { getRoomsFromFirebase, saveRoomToFirebase } = await import('@/lib/firebase-sync');
        const rooms = await getRoomsFromFirebase();
        const room = rooms.find((r: any) => r.number === request.room);
        
        if (room) {
          // إضافة المبلغ للرصيد
          room.balance = (room.balance || 0) + orderAmount;
          
          // إضافة حدث في السجل
          const newEvent = {
            id: Date.now().toString(),
            type: 'service_request' as const,
            description: `طلب مكتمل: ${request.type}${orderAmount > 0 ? ` - المبلغ: ${orderAmount} ر.س` : ''}`,
            timestamp: new Date().toISOString(),
            user: 'النظام',
            newValue: `رصيد جديد: ${room.balance} ر.س`,
            oldValue: `رصيد سابق: ${(room.balance || 0) - orderAmount} ر.س`
          };
          
          if (!room.events) {
            room.events = [];
          }
          room.events.push(newEvent);
          room.lastUpdated = new Date().toISOString();
          
          // حفظ التحديثات في Firebase
          await saveRoomToFirebase(room);
        }

        // حذف الطلب من Firebase
        await deleteRequestFromFirebase(id);
        const successMsg = orderAmount > 0 
          ? `${t('requestCompletedSuccess')}\n${t('amountAddedToRoom', { amount: orderAmount, roomNumber: request.room })}`
          : t('requestCompletedSuccess');
        alert(successMsg);
      } else {
        // تحديث الحالة فقط للحالات الأخرى
        await updateRequest(id, { 
          status: newStatus, 
          approvedAt: new Date().toISOString() 
        });
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert(t('errorUpdatingRequest'));
    }
  };

  const deleteRequest = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      try {
        await deleteRequestFromFirebase(id);
      } catch (error) {
        console.error('Error deleting request:', error);
        alert(t('errorDeletingRequest'));
      }
    }
  };

  // ✅ وظيفة قبول الطلب من قبل الموظف
  const acceptRequest = async (requestId: string) => {
    if (!user) {
      alert(t('mustLoginFirst'));
      return;
    }

    setAcceptingRequestId(requestId);
    
    try {
      const currentEmployeeName = user.name || user.username || user.email || 'موظف';
      
      // تحديث الطلب في Firebase
      await updateRequest(requestId, {
        status: 'in-progress',
        assignedEmployee: currentEmployeeName,
        employeeApprovalStatus: 'approved'
      });

      // ✅ تشغيل صوت نجاح (صوت قصير مجاني)
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 880; // نوتة عالية
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (e) {
        console.log('Sound play failed:', e);
      }

      // ✅ إشعار بصري
      if (typeof window !== 'undefined') {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce';
        alertDiv.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${t('requestAccepted')}</span>
          </div>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
      }

    } catch (error) {
      console.error('Error accepting request:', error);
      alert('حدث خطأ أثناء قبول الطلب. حاول مرة أخرى.');
    } finally {
      setAcceptingRequestId(null);
    }
  };

  const getStatCounts = () => ({
    pending: requests.filter((r) => r.status === 'awaiting_employee_approval').length,
    inProgress: requests.filter((r) => r.status === 'in-progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    awaitingApproval: requests.filter((r) => r.status === 'awaiting_employee_approval').length,
    highPriority: requests.filter((r) => r.priority === 'high').length,
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
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .hover\:shadow-3xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-3 md:p-6 relative overflow-hidden" dir="rtl">
        {/* خلفية تزيينية محسّنة */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute top-40 right-1/4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 space-y-4 md:space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* زر العودة - مخفي على الموبايل */}
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="hidden md:flex border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  {t('back')}
                </Button>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Inbox className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    {t('guestRequests')}
                  </h1>
                  {/* الوصف - مخفي على الموبايل */}
                  <p className="hidden md:block text-purple-200/80">
                    {t('guestRequestsDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <Button
                  onClick={() => router.push('/dashboard/requests/new')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 ml-1 md:ml-2" />
                  <span className="hidden sm:inline">{t('newRequest')}</span>
                  <span className="sm:hidden">جديد</span>
                </Button>

                {/* أزرار التصدير والتحديث - مخفية على الموبايل */}
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="hidden md:flex border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 ml-2" />
                  {t('export')}
                </Button>

                <Button
                  variant="outline"
                  className="hidden md:flex border-white/20 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => {
                    setRequests([...requests]);
                  }}
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  {t('refresh')}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards - محسّنة */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-md border-purple-400/30 shadow-2xl hover:scale-105 transition-transform">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs md:text-sm font-semibold">إجمالي الطلبات</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="bg-purple-500/30 p-2 rounded-lg">
                    <Inbox className="w-5 h-5 md:w-6 md:h-6 text-purple-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-md border-yellow-400/30 shadow-2xl hover:scale-105 transition-transform ${stats.awaitingApproval > 0 ? 'ring-2 ring-yellow-500/50 animate-pulse' : ''}`}>
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs md:text-sm font-semibold">بانتظار الموافقة</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats.awaitingApproval}</p>
                  </div>
                  <div className="bg-yellow-500/30 p-2 rounded-lg">
                    <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-yellow-200" />
                  </div>
                </div>
                {stats.awaitingApproval > 0 && (
                  <div className="mt-2">
                    <Badge className="bg-yellow-600 text-white text-xs font-bold shadow-lg">
                      🔔 جديد
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border-blue-400/30 shadow-2xl hover:scale-105 transition-transform">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs md:text-sm font-semibold">قيد التنفيذ</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats.inProgress}</p>
                  </div>
                  <div className="bg-blue-500/30 p-2 rounded-lg">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border-green-400/30 shadow-2xl hover:scale-105 transition-transform">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs md:text-sm font-semibold">مكتمل</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats.completed}</p>
                  </div>
                  <div className="bg-green-500/30 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-md border-red-400/30 shadow-2xl hover:scale-105 transition-transform">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs md:text-sm font-semibold">مرفوض</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats.rejected}</p>
                  </div>
                  <div className="bg-red-500/30 p-2 rounded-lg">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border-orange-400/30 shadow-2xl hover:scale-105 transition-transform ${stats.highPriority > 0 ? 'ring-2 ring-orange-500/50' : ''}`}>
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs md:text-sm font-semibold">أولوية عالية</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats.highPriority}</p>
                  </div>
                  <div className="bg-orange-500/30 p-2 rounded-lg">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-200" />
                  </div>
                </div>
                {stats.highPriority > 0 && (
                  <div className="mt-2">
                    <Badge className="bg-orange-600 text-white text-xs font-bold shadow-lg">
                      ⚠️ عاجل
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">معدل الإنجاز</p>
                    <p className="text-xl font-bold text-white">
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-3 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">قيد المعالجة</p>
                    <p className="text-xl font-bold text-white">
                      {stats.awaitingApproval + stats.inProgress} طلب
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">متوسط وقت الاستجابة</p>
                    <p className="text-xl font-bold text-white">~15 دقيقة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Requests Section - مخفي على الموبايل */}
          <div className="hidden lg:block">
            <RegistrationRequestsSection />
          </div>

          {/* Search and Filter - محسّن */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-6 shadow-2xl border border-white/20">
            <div className="space-y-3 md:space-y-4">
              {/* الصف الأول: البحث والفلاتر */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4 md:w-5 md:h-5" />
                  <Input
                    placeholder={t('searchRequests')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-9 md:pr-10 text-sm md:text-base"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4 md:w-5 md:h-5" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white pr-9 md:pr-10 pl-3 md:pl-4 py-2 rounded-lg appearance-none cursor-pointer text-sm md:text-base"
                  >
                    <option value="all" className="bg-slate-900">الكل ({stats.total})</option>
                    <option value="awaiting_employee_approval" className="bg-slate-900">🔔 بانتظار الموافقة ({stats.awaitingApproval})</option>
                    <option value="in-progress" className="bg-slate-900">⚙️ قيد التنفيذ ({stats.inProgress})</option>
                    <option value="completed" className="bg-slate-900">✅ مكتمل ({stats.completed})</option>
                    <option value="rejected" className="bg-slate-900">❌ مرفوض ({stats.rejected})</option>
                  </select>
                </div>

                <div className="relative">
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4 md:w-5 md:h-5" />
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white pr-9 md:pr-10 pl-3 md:pl-4 py-2 rounded-lg appearance-none cursor-pointer text-sm md:text-base"
                  >
                    <option value="all" className="bg-slate-900">كل الأولويات</option>
                    <option value="high" className="bg-slate-900">⚠️ عالية ({stats.highPriority})</option>
                    <option value="medium" className="bg-slate-900">⚡ متوسطة</option>
                    <option value="low" className="bg-slate-900">🔵 منخفضة</option>
                  </select>
                </div>
              </div>

              {/* الصف الثاني: الترتيب والإحصائيات السريعة */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">ترتيب حسب:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'status')}
                    className="bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-lg text-sm"
                  >
                    <option value="date" className="bg-slate-900">📅 التاريخ</option>
                    <option value="priority" className="bg-slate-900">⚡ الأولوية</option>
                    <option value="status" className="bg-slate-900">📊 الحالة</option>
                  </select>
                  <Button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    variant="outline"
                    size="sm"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    {sortOrder === 'asc' ? '🔼' : '🔽'}
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/70">عرض:</span>
                  <Badge className="bg-blue-600 text-white font-bold border-blue-700">
                    {filteredRequests.length} من {stats.total} طلب
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-3 md:space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-white/50 mx-auto mb-3 animate-spin" />
                <p className="text-white/70 text-sm md:text-base">جاري تحميل الطلبات...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardContent className="text-center py-8 md:py-12">
                  <Inbox className="w-12 h-12 md:w-16 md:h-16 text-white/30 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-white text-lg md:text-xl font-semibold mb-2">لا توجد طلبات</h3>
                  <p className="text-white/60 text-sm md:text-base">
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
                  className={`bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/15 hover:shadow-3xl transition-all duration-300 group ${
                    request.status === 'awaiting_employee_approval' && !request.assignedEmployee 
                      ? 'ring-2 ring-purple-500/50 ring-offset-2 ring-offset-gray-900 animate-pulse-slow' 
                      : ''
                  } ${
                    request.priority === 'high' 
                      ? 'border-r-4 border-red-500 shadow-red-500/20' 
                      : request.priority === 'medium' 
                        ? 'border-r-4 border-yellow-500 shadow-yellow-500/20' 
                        : 'border-r-4 border-blue-500/30'
                  }`}
                >
                  <div className="p-4 md:p-6">
                    {/* Header - معلومات الطلب الأساسية */}
                    <div className="flex items-start justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                              <span className="text-lg md:text-xl font-bold text-white">{t('room')} {request.room}</span>
                              {request.priority && PRIORITY_CONFIG[request.priority as keyof typeof PRIORITY_CONFIG] && (
                                <Badge className={`${PRIORITY_CONFIG[request.priority as keyof typeof PRIORITY_CONFIG].color} bg-transparent border text-xs px-1.5 md:px-2 py-0.5`}>
                                  {PRIORITY_CONFIG[request.priority as keyof typeof PRIORITY_CONFIG].label}
                                </Badge>
                              )}
                            </div>
                            <p className="text-white/90 font-semibold text-sm md:text-base mb-2">{request.type}</p>
                            
                            {/* ✨ عرض الحالة بشكل بارز */}
                            <div className="mb-2">
                              <Badge className={`${STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-500/20 text-gray-300'} border-0 px-3 py-1.5 text-sm font-semibold shadow-lg`}>
                                {STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]?.icon || '📋'} {STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]?.label || request.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-white/60 flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {request.guest}
                              </span>
                              {/* التاريخ - مخفي على الموبايل الصغير */}
                              <span className="hidden sm:flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(request.createdAt)}
                              </span>
                              {/* ✨ مؤشر الوقت منذ الإنشاء */}
                              <span className="flex items-center gap-1 text-yellow-400">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(request.createdAt)}
                              </span>
                              {/* ✨ زر الاتصال السريع */}
                              {request.phone && (
                                <a
                                  href={`tel:${request.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span className="hidden sm:inline">اتصال</span>
                                  <span className="sm:hidden">📞</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* أزرار القبول/الرفض */}
                      {request.status === 'awaiting_employee_approval' && !request.assignedEmployee && (
                        <div className="flex flex-col md:flex-row items-center gap-2 flex-shrink-0">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptRequest(request.id);
                            }}
                            disabled={acceptingRequestId === request.id}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm w-full md:w-auto"
                          >
                            {acceptingRequestId === request.id ? (
                              <>
                                <Loader2 className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 animate-spin" />
                                <span className="hidden md:inline">{t('acceptingRequest')}</span>
                                <span className="md:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                                {t('accept')}
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateRequestStatus(request.id, 'rejected');
                            }}
                            variant="outline"
                            className="border-red-500/50 text-red-300 hover:bg-red-500/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm w-full md:w-auto"
                          >
                            ❌ {t('reject')}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* معلومات المرسل والموظف المكلف */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="text-white/60">{t('requestedBy')}:</span>
                        <span className="text-white font-semibold">{request.createdBy || user?.name || 'الإدارة'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="w-4 h-4 text-green-400" />
                        <span className="text-white/60">{t('assignedEmployee')}:</span>
                        <span className="text-white font-semibold">{request.assignedEmployee || t('notAssignedYet')}</span>
                      </div>
                    </div>

                    {/* زر عرض التفاصيل */}
                    <button
                      onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                      className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors py-2 border-t border-white/10"
                    >
                      <span className="text-sm">
                        {expandedId === request.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل الكاملة'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${expandedId === request.id ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Expanded Details */}
                    {expandedId === request.id && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Guest Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                              <User className="w-4 h-4" />
                              <span>{t('guest')}:</span>
                            </div>
                            <p className="text-white ml-6">{request.guest}</p>
                          </div>

                          {/* Phone */}
                          {request.phone && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-white/70 text-sm">
                                <Phone className="w-4 h-4" />
                                <span>{t('phone')}:</span>
                              </div>
                              <p className="text-white ml-6">{request.phone}</p>
                            </div>
                          )}

                          {/* Date Created */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>{t('dateCreated')}:</span>
                            </div>
                            <p className="text-white ml-6">{formatDate(request.createdAt)}</p>
                          </div>

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

                        {/* Status Update Actions - تظهر فقط بعد قبول الطلب */}
                        {request.assignedEmployee && (
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                            {request.status !== 'pending' && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateRequestStatus(request.id, 'pending');
                                }}
                                variant="outline"
                                className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 text-xs"
                              >
                                ⏳ قيد الانتظار
                              </Button>
                            )}
                            {request.status !== 'in-progress' && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateRequestStatus(request.id, 'in-progress');
                                }}
                                variant="outline"
                                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs"
                              >
                                ⚙️ قيد التنفيذ
                              </Button>
                            )}
                            {request.status !== 'completed' && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateRequestStatus(request.id, 'completed');
                                }}
                                variant="outline"
                                className="border-green-500/30 text-green-300 hover:bg-green-500/10 text-xs"
                              >
                                ✅ مكتمل
                              </Button>
                            )}
                            {request.status === 'completed' && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequestForRating(request);
                                  setRatingDialogOpen(true);
                                }}
                                variant="outline"
                                className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 text-xs"
                              >
                                <Star className="w-4 h-4 ml-1" />
                                تقييم الخدمة
                              </Button>
                            )}
                            {request.status !== 'rejected' && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateRequestStatus(request.id, 'rejected');
                                }}
                                variant="outline"
                                className="border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs"
                              >
                                ❌ رفض
                              </Button>
                            )}

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRequest(request.id);
                              }}
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20 ml-auto text-xs"
                            >
                              <Trash2 className="w-4 h-4 ml-1" />
                              حذف
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
        </div>
      </div>

      {/* Rating Dialog */}
      {ratingDialogOpen && selectedRequestForRating && (
        <RatingDialog
          type="service"
          targetId={selectedRequestForRating.id}
          targetName={selectedRequestForRating.type}
          guestName={selectedRequestForRating.guestName}
          roomNumber={selectedRequestForRating.roomNumber}
          employeeId={selectedRequestForRating.employeeId}
          employeeName={selectedRequestForRating.employeeName}
          onClose={() => {
            setRatingDialogOpen(false);
            setSelectedRequestForRating(null);
          }}
          onSuccess={() => {
            // يمكن إضافة إشعار نجاح هنا
          }}
        />
      )}
    </ProtectedRoute>
  );
}

