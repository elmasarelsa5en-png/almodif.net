'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { PermissionGuard, HasPermission, usePermissions } from '@/components/PermissionGuard';
import { RefreshPermissionsButton } from '@/components/RefreshPermissionsButton';
import { 
  BedDouble, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Hammer,
  Trash2,
  CreditCard,
  Search,
  Banknote,
  Smartphone,
  UserPlus,
  Image,
  X,
  FileText,
  LayoutGrid,
  List
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { 
  Room,
  RoomStatus,
  PaymentMethod,
  ROOM_STATUS_CONFIG,
  ROOM_TYPE_CONFIG,
  updateRoomStatus,
  processPayment, 
  getRoomTypesFromStorage,
  autoUpdateRoomStatusByCheckout,
  getLateCheckoutRooms,
  getOverdueRooms, // ← إضافة
  isLateCheckout
} from '@/lib/rooms-data';
// استخدام Firebase فقط - المصدر الاحترافي للبيانات
import { 
  getRoomsFromFirebase, 
  saveRoomToFirebase,
  subscribeToRooms
} from '@/lib/firebase-sync';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AddGuestDialog from '@/components/AddGuestDialog';
import AddRoomsFromImageDialog from '@/components/AddRoomsFromImageDialog';
import GuestDataClipboard from '@/components/GuestDataClipboard';
import BookingDialog from './booking-dialog';
import EarlyCheckoutDialog from './early-checkout-dialog';

const ICON_MAP = {
  CheckCircle2,
  BedDouble,
  Hammer,
  Trash2,
  Clock,
  AlertTriangle
};

// ✨ Services History Dialog Component
function ServicesHistoryDialog({ 
  room, 
  isOpen, 
  onClose, 
  getRoomServicesHistory 
}: { 
  room: Room | null; 
  isOpen: boolean; 
  onClose: () => void;
  getRoomServicesHistory: (room: Room) => Promise<any>;
}) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && room) {
      setLoading(true);
      getRoomServicesHistory(room).then(data => {
        setServices(data.services || []);
        setLoading(false);
      });
    }
  }, [isOpen, room, getRoomServicesHistory]);

  const handlePrint = () => {
    window.print();
  };

  if (!room) return null;

  const totalAmount = services.reduce((sum, service) => sum + (service.amount || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            سجل خدمات غرفة {room.number}
          </DialogTitle>
          <DialogDescription>
            {room.guestName && `النزيل: ${room.guestName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">لا توجد خدمات مسجلة</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold">التاريخ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">النوع</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">التفاصيل</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {service.date ? new Date(service.date).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            service.category === 'coffee' ? 'default' :
                            service.category === 'laundry' ? 'secondary' :
                            'outline'
                          }>
                            {service.category === 'coffee' ? 'قهوة' :
                             service.category === 'laundry' ? 'مغسلة' :
                             service.category === 'restaurant' ? 'مطعم' :
                             service.type || 'خدمة'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {service.details || service.items?.map((item: any) => item.name).join(', ') || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            service.status === 'completed' ? 'default' :
                            service.status === 'pending' ? 'secondary' :
                            'outline'
                          }>
                            {service.status === 'completed' ? 'مكتمل' :
                             service.status === 'pending' ? 'قيد التنفيذ' :
                             service.status === 'accepted' ? 'مقبول' :
                             service.status || 'غير محدد'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {service.amount ? `${service.amount.toFixed(2)} ر.س` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-700">
                        الإجمالي:
                      </td>
                      <td className="px-4 py-3 text-lg font-bold text-blue-600">
                        {totalAmount.toFixed(2)} ر.س
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
          <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
            <FileText className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RoomsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [activeFilter, setActiveFilter] = useState<RoomStatus | 'All' | 'OccupiedAll'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<RoomStatus>('Available');
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [guestName, setGuestName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({ type: 'cash' });
  const [roomPrices, setRoomPrices] = useState<Record<string, { pricePerDay: number; pricePerMonth: number }>>({});
  const [showStatusFilters, setShowStatusFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTypeFilters, setShowTypeFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isAddRoomsFromImageOpen, setIsAddRoomsFromImageOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [lateCheckoutRooms, setLateCheckoutRooms] = useState<Room[]>([]);
  const [showLateCheckoutAlert, setShowLateCheckoutAlert] = useState(false);
  
  // 🔥 Early Checkout Dialog States
  const [isEarlyCheckoutDialogOpen, setIsEarlyCheckoutDialogOpen] = useState(false);
  const [earlyCheckoutRoom, setEarlyCheckoutRoom] = useState<Room | null>(null);
  
  // ✨ Context Menu States
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; room: Room } | null>(null);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(1);
  const [extendNotes, setExtendNotes] = useState('');
  const [isServicesHistoryOpen, setIsServicesHistoryOpen] = useState(false);
  const [selectedRoomForServices, setSelectedRoomForServices] = useState<Room | null>(null);
  const [overdueRooms, setOverdueRooms] = useState<Array<Room & { daysOverdue: number }>>([]);
  const [showOverdueAlert, setShowOverdueAlert] = useState(false);

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadRoomsData();
    
    // الاستماع للتحديثات الفورية من Firebase
    const unsubscribe = subscribeToRooms(
      (updatedRooms) => {
        setRooms(updatedRooms);
        setFilteredRooms(updatedRooms);
      },
      (error) => {
        console.error('خطأ في الاتصال بFirebase:', error);
      }
    );

    const roomTypesData = getRoomTypesFromStorage();
    setRoomTypes(roomTypesData);
    
    // جلب أسعار الغرف من API
    fetchRoomPrices();
    
    return () => unsubscribe();
  }, []);

  // ⚠️ تم تعطيل الفحص التلقائي والحساب التلقائي مؤقتاً لحل مشكلة الـ infinite loop
  // سيتم تفعيلهم لاحقاً بشكل آمن
  
  // ✅ فحص تلقائي للشقق المتأخرة عن موعد الخروج
  useEffect(() => {
    const checkOverdueRooms = () => {
      const overdue = getOverdueRooms(rooms);
      setOverdueRooms(overdue);
      
      if (overdue.length > 0) {
        setShowOverdueAlert(true);
        console.log(`⚠️ تم العثور على ${overdue.length} وحدة متأخرة عن موعد الخروج`);
      }
      
      // تحديث حالة الوحدات تلقائياً
      const updatedRooms = autoUpdateRoomStatusByCheckout(rooms);
      if (JSON.stringify(updatedRooms) !== JSON.stringify(rooms)) {
        setRooms(updatedRooms);
        setFilteredRooms(updatedRooms);
        // حفظ في Firebase
        updatedRooms.forEach(room => {
          if (room.status === 'Overdue') {
            saveRoomToFirebase(room).catch(err => 
              console.error(`خطأ في حفظ الغرفة ${room.number}:`, err)
            );
          }
        });
      }
    };

    // فحص فوري عند تحميل الصفحة
    checkOverdueRooms();

    // فحص دوري كل 5 دقائق
    const interval = setInterval(checkOverdueRooms, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [rooms]);
  
  // ✨ إغلاق Context Menu عند النقر في أي مكان
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleScroll = () => setContextMenu(null);
    
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      document.addEventListener('scroll', handleScroll);
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('scroll', handleScroll);
      };
    }
  }, [contextMenu]);
  
  const loadRoomsData = async () => {
    try {
      const roomsData = await getRoomsFromFirebase();
      setRooms(roomsData);
      setFilteredRooms(roomsData);
    } catch (error) {
      console.error('خطأ في تحميل الغرف:', error);
    }
  };

  // جلب أسعار الغرف من API (معطل مؤقتاً - يمكن تفعيله عند توفر API)
  const fetchRoomPrices = async () => {
    try {
      // تم تعطيل استدعاء API لتجنب خطأ 404
      // يمكن جلب الأسعار من localStorage بدلاً من API
      const roomTypesData = getRoomTypesFromStorage();
      if (roomTypesData && roomTypesData.length > 0) {
        const prices: Record<string, { pricePerDay: number; pricePerMonth: number }> = {};
        roomTypesData.forEach((roomType: any) => {
          if (roomType.name) {
            prices[roomType.name] = {
              pricePerDay: roomType.pricePerDay || 0,
              pricePerMonth: roomType.pricePerMonth || 0
            };
          }
        });
        setRoomPrices(prices);
        console.log('تم تحميل أسعار الغرف من localStorage:', prices);
      }
      
      /* API معطل مؤقتاً
      const response = await fetch('/api/rooms-catalog', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        console.error('API response not ok:', response.status);
        return;
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        const prices: Record<string, { pricePerDay: number; pricePerMonth: number }> = {};
        data.data.forEach((roomType: any) => {
          if (roomType.name) {
            prices[roomType.name] = {
              pricePerDay: roomType.pricePerDay || 0,
              pricePerMonth: roomType.pricePerMonth || 0
            };
          }
        });
        setRoomPrices(prices);
        console.log('تم تحميل أسعار الغرف بنجاح:', prices);
      }
      */
    } catch (error) {
      console.error('خطأ في جلب أسعار الغرف:', error);
      // استمر في العمل حتى لو فشل تحميل الأسعار
    }
  };

  // تصفية الوحدات
  useEffect(() => {
    let filtered = rooms;

    // فلتر الحالة
    if (activeFilter === 'OccupiedAll') {
      // فلتر "مشغولة" يشمل: Occupied + CheckoutToday + Overdue
      filtered = filtered.filter(room => 
        room.status === 'Occupied' || 
        room.status === 'CheckoutToday' || 
        room.status === 'Overdue'
      );
    } else if (activeFilter !== 'All') {
      filtered = filtered.filter(room => room.status === activeFilter);
    }

    // فلتر البحث بالرقم
    if (searchTerm) {
      filtered = filtered.filter(room => room.number.includes(searchTerm));
    }

    // فلتر النوع
    if (typeFilter !== 'All') {
      filtered = filtered.filter(room => room.type === typeFilter);
    }

    setFilteredRooms(filtered);
  }, [rooms, activeFilter, typeFilter, searchTerm]);

  // احصائيات الوحدات
  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'Available').length,
    occupied: rooms.filter(r => r.status === 'Occupied').length,
    occupiedAll: rooms.filter(r => r.status === 'Occupied' || r.status === 'CheckoutToday' || r.status === 'Overdue').length,
    maintenance: rooms.filter(r => r.status === 'Maintenance').length,
    needsCleaning: rooms.filter(r => r.status === 'NeedsCleaning').length,
    reserved: rooms.filter(r => r.status === 'Reserved').length,
    checkoutToday: rooms.filter(r => r.status === 'CheckoutToday').length,
    pendingCleaning: rooms.filter(r => r.status === 'NeedsCleaning').length, // استخدام NeedsCleaning بدلاً من Cleaning
    occupancyRate: Math.round((rooms.filter(r => r.status === 'Occupied').length / rooms.length) * 100)
  };

  // معالج تغيير حالة الوحدة
  const handleStatusChange = async () => {
    if (!selectedRoom || !user) return;
    
    console.log('🔄 بدء تغيير حالة الغرفة:', selectedRoom.number, 'من', selectedRoom.status, 'إلى', newStatus);
    
    // ✅ إذا كانت الحالة الجديدة "Available" والحالة القديمة "Occupied" = checkout
    const isCheckout = selectedRoom.status === 'Occupied' && newStatus === 'Available';
    
    if (isCheckout && selectedRoom.guestIdNumber) {
      try {
        // ✅ تحديث حالة النزيل إلى checked-out
        const { db } = await import('@/lib/firebase');
        const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
        
        const guestsRef = collection(db, 'guests');
        const guestQuery = query(
          guestsRef,
          where('nationalId', '==', selectedRoom.guestIdNumber),
          where('status', '==', 'checked-in')
        );
        const guestSnapshot = await getDocs(guestQuery);
        
        if (!guestSnapshot.empty) {
          const guestDoc = guestSnapshot.docs[0];
          await updateDoc(doc(db, 'guests', guestDoc.id), {
            status: 'checked-out',
            checkOutDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          console.log('✅ تم تحديث حالة النزيل إلى checked-out');
        }
      } catch (error) {
        console.error('❌ خطأ في تحديث حالة النزيل:', error);
      }
    }
    
    const updatedRooms = updateRoomStatus(
      rooms, 
      selectedRoom.id, 
      newStatus, 
      user.name || user.username,
      guestName
    );
    
    try {
      // حفظ الغرفة المحدثة في Firebase
      const updatedRoom = updatedRooms.find(r => r.id === selectedRoom.id);
      if (updatedRoom) {
        console.log('💾 حفظ الغرفة المحدثة في Firebase...');
        console.log('📝 بيانات الغرفة قبل الحفظ:', {
          roomNumber: updatedRoom.number,
          status: updatedRoom.status,
          guestName: updatedRoom.guestName,
          hasGuestName: !!updatedRoom.guestName
        });
        await saveRoomToFirebase(updatedRoom);
        console.log('✅ تم حفظ التغييرات بنجاح');
        
        // تحديث الحالة المحلية فوراً
        setRooms(updatedRooms);
        setFilteredRooms(updatedRooms);
        setSelectedRoom(updatedRoom);
        
        // إغلاق النافذة
        setIsDetailsOpen(false);
        setGuestName('');
        
        // إظهار رسالة نجاح
        if (isCheckout) {
          // ✅ إنشاء طلب تنظيف تلقائي عند checkout
          try {
            console.log('🧹 إنشاء طلب تنظيف تلقائي...');
            const { db } = await import('@/lib/firebase');
            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
            
            const cleaningRequest = {
              room: selectedRoom.number,
              guest: selectedRoom.guestName || 'ضيف سابق',
              phone: selectedRoom.guestPhone || '',
              type: 'تنظيف',
              notes: `تنظيف بعد خروج النزيل - الوحدة ${selectedRoom.number}`,
              description: `الوحدة خرج منها النزيل وتحتاج تنظيف شامل وتجهيز للنزيل القادم`,
              priority: 'high' as const,
              assignedEmployee: '', // طلب عام لكل الموظفين
              status: 'pending' as const,
              createdAt: serverTimestamp(),
              createdBy: user.name || user.username,
              isPublic: true, // طلب عام يظهر لجميع الموظفين
              acceptedBy: null, // سيتم تحديثه عندما يقبل موظف الطلب
              acceptedAt: null
            };

            await addDoc(collection(db, 'requests'), cleaningRequest);
            console.log('✅ تم إنشاء طلب التنظيف بنجاح');
            
            // 🔔 تشغيل صوت إشعار للموظفين
            try {
              const { playNotificationSound } = await import('@/lib/notification-sounds');
              playNotificationSound('new-request');
            } catch (soundError) {
              console.error('⚠️ خطأ في تشغيل صوت الإشعار:', soundError);
            }
            
          } catch (error) {
            console.error('❌ خطأ في إنشاء طلب التنظيف:', error);
          }
          
          alert('✅ تم إنهاء إقامة النزيل وتحديث حالة الوحدة بنجاح\n🧹 تم إنشاء طلب تنظيف تلقائي');
        } else {
          alert('✅ تم تغيير حالة الوحدة بنجاح');
        }
      }
    } catch (error) {
      console.error('❌ خطأ في حفظ التغييرات:', error);
      alert('حدث خطأ في حفظ التغييرات. الرجاء المحاولة مرة أخرى.');
      return;
    }
  };

  // معالج الدفع
  const handlePayment = async () => {
    if (!selectedRoom || !user || paymentAmount <= 0) return;
    
    // حساب المبلغ المتبقي بعد الدفع
    const remainingDebt = Math.max(0, (selectedRoom.currentDebt || 0) - paymentAmount);
    
    const updatedRoom: Room = {
      ...selectedRoom,
      currentDebt: remainingDebt,
      payments: [
        ...(selectedRoom.payments || []),
        {
          id: `payment_${Date.now()}`,
          amount: paymentAmount,
          date: new Date().toLocaleDateString('ar-SA'),
          time: new Date().toLocaleTimeString('ar-SA'),
          method: paymentMethod.type,
          receiptNumber: paymentMethod.receiptNumber,
          paidBy: user.name || user.username || 'غير معروف',
          note: `دفعة لتسديد الديون - المبلغ المتبقي: ${remainingDebt} ر.س`
        }
      ],
      lastDebtUpdate: new Date().toISOString(),
      events: [
        ...selectedRoom.events,
        {
          id: Date.now().toString(),
          type: 'payment' as const,
          description: `تم تسجيل دفعة ${paymentAmount} ر.س - المتبقي: ${remainingDebt} ر.س`,
          timestamp: new Date().toISOString(),
          user: user.name || user.username || 'غير معروف',
          amount: paymentAmount
        }
      ]
    };
    
    try {
      // حفظ الغرفة المحدثة في Firebase
      await saveRoomToFirebase(updatedRoom);
      
      // إنشاء سند قبض في نظام المحاسبة
      try {
        const { createReceipt } = await import('@/lib/receipts-system');
        const receiptId = await createReceipt({
          type: 'room_payment',
          amount: paymentAmount,
          roomNumber: selectedRoom.number,
          guestName: selectedRoom.guestName,
          guestPhone: selectedRoom.guestPhone,
          paymentMethod: paymentMethod.type,
          cardType: paymentMethod.cardType,
          receiptNumberExternal: paymentMethod.receiptNumber,
          description: `دفعة لتسديد ديون الوحدة ${selectedRoom.number}`,
          category: 'room_rent',
          paidBy: user.name || user.username || 'غير معروف',
          createdBy: user.username || user.name || 'unknown',
          notes: `تم خصم ${paymentAmount} ر.س من الدين - المتبقي: ${remainingDebt} ر.س`
        });
        
        if (receiptId) {
          console.log('✅ تم إنشاء سند قبض:', receiptId);
        }
      } catch (receiptError) {
        console.error('⚠️ خطأ في إنشاء سند القبض (سيتم المتابعة):', receiptError);
        // نكمل العملية حتى لو فشل إنشاء السند
      }
      
      // تحديث الحالة المحلية
      const updatedRooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
      setRooms(updatedRooms);
      setSelectedRoom(updatedRoom);
      
      alert(`✅ تم تسجيل الدفعة بنجاح!\n\nالمبلغ المدفوع: ${paymentAmount} ر.س\nالمتبقي: ${remainingDebt} ر.س\n\n📋 تم إنشاء سند قبض`);
      
    } catch (error) {
      console.error('خطأ في حفظ الدفعة:', error);
      alert('حدث خطأ في حفظ الدفعة');
      return;
    }
    
    setIsPaymentOpen(false);
    setPaymentAmount(0);
    setPaymentMethod({ type: 'cash' });
  };

  // فتح تفاصيل الوحدة - دائماً نافذة الحجز
  const openRoomDetails = (room: Room) => {
    setSelectedRoom(room);
    setNewStatus(room.status);
    setGuestName(room.guestName || '');
    setPaymentAmount(room.balance);
    
    // فتح نافذة الحجز مباشرة (سواء فارغة أو مشغولة)
    setIsBookingDialogOpen(true);
  };

  // معالج إضافة نزيل جديد
  const handleAddGuest = async (guestData: {
    fullName: string;
    nationality: string;
    idType: string;
    idNumber: string;
    expiryDate: string;
    mobile: string;
    workPhone: string;
    email: string;
    address: string;
    notes: string;
    roomNumber: string;
  }) => {
    if (!user) return;
    
    // البحث عن الغرفة
    const room = rooms.find(r => r.number === guestData.roomNumber);
    if (!room) {
      alert('رقم الغرفة غير موجود');
      return;
    }
    
    // التحقق من أن الغرفة متاحة أو محجوزة
    if (room.status !== 'Available' && room.status !== 'Reserved') {
      alert('الغرفة غير متاحة للسكن حالياً');
      return;
    }
    
    try {
      // ✅ 1. البحث عن النزيل في قاعدة بيانات guests
      const { db } = await import('@/lib/firebase');
      const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
      
      const guestsRef = collection(db, 'guests');
      const guestQuery = query(
        guestsRef,
        where('nationalId', '==', guestData.idNumber)
      );
      const guestSnapshot = await getDocs(guestQuery);
      
      // ✅ 2. تحديث حالة النزيل إلى checked-in إذا كان موجود
      if (!guestSnapshot.empty) {
        const guestDoc = guestSnapshot.docs[0];
        await updateDoc(doc(db, 'guests', guestDoc.id), {
          status: 'checked-in',
          roomNumber: guestData.roomNumber,
          checkInDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('✅ تم تحديث حالة النزيل إلى checked-in');
      }
      
      // ✅ 3. تحديث بيانات الغرفة
      const updatedRooms = rooms.map(r => {
        if (r.id === room.id) {
          return {
            ...r,
            status: 'Occupied' as RoomStatus,
            guestName: guestData.fullName,
            guestPhone: guestData.mobile,
            guestNationality: guestData.nationality,
            guestIdType: guestData.idType,
            guestIdNumber: guestData.idNumber,
            guestIdExpiry: guestData.expiryDate,
            guestEmail: guestData.email,
            guestWorkPhone: guestData.workPhone,
            guestAddress: guestData.address,
            guestNotes: guestData.notes,
            events: [
              ...r.events,
              {
                id: Date.now().toString(),
                type: 'check_in' as const,
                description: `تسجيل دخول: ${guestData.fullName}`,
                timestamp: new Date().toISOString(),
                user: user.name || user.username,
                newValue: 'Occupied'
              }
            ]
          };
        }
        return r;
      });

      // ✅ 4. حفظ في Firebase
      await saveRoomToFirebase(updatedRooms.find(r => r.id === room.id)!);

      setRooms(updatedRooms);
      setFilteredRooms(updatedRooms);
      setIsAddGuestOpen(false);
      
      alert('✅ تم تسجيل دخول النزيل بنجاح!');
    } catch (error) {
      console.error('❌ خطأ في تسجيل دخول النزيل:', error);
      alert('حدث خطأ أثناء تسجيل دخول النزيل');
    }
  };

  // معالج اكتمال الحجز
  const handleBookingComplete = async (bookingData: any) => {
    if (!selectedRoom || !user) return;
    
    try {
      // 🔥 حساب الديون التلقائي
      const totalDebt = bookingData.financial.remaining; // المتبقي = الدين
      const hasDebt = totalDebt > 0;
      
      console.log('💰 حساب الديون:', {
        totalAmount: bookingData.financial.totalAmount,
        totalDeposits: bookingData.financial.totalDeposits,
        remaining: bookingData.financial.remaining,
        hasDebt
      });
      
      // تحديث بيانات الغرفة مع معلومات الحجز
      const updatedRoom: Room = {
        ...selectedRoom,
        status: 'Occupied' as RoomStatus,
        guestName: bookingData.guest.fullName || bookingData.guest.name,
        guestPhone: bookingData.guest.mobile || bookingData.guest.phone,
        guestNationality: bookingData.guest.nationality,
        guestIdType: bookingData.guest.idType,
        guestIdNumber: bookingData.guest.idNumber,
        guestIdExpiry: bookingData.guest.expiryDate || bookingData.guest.idExpiry,
        guestEmail: bookingData.guest.email,
        balance: bookingData.financial.remaining,
        
        // 🔥 نظام الديون التلقائي
        currentDebt: totalDebt, // إجمالي الديون الحالية
        roomDebt: totalDebt, // دين الإقامة فقط (الآن)
        servicesDebt: 0, // دين الخدمات (سيُحسب لاحقاً من المنيو)
        lastDebtUpdate: new Date().toISOString(),
        debtStartDate: hasDebt ? new Date().toISOString() : undefined,
        
        // حفظ بيانات الحجز الإضافية
        bookingDetails: {
          contractNumber: bookingData.contractNumber,
          bookingSource: bookingData.bookingSource,
          rentalType: bookingData.rentalType,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          numberOfDays: bookingData.numberOfDays,
          visitType: bookingData.visitType,
          company: bookingData.company,
          companions: bookingData.companions,
          financial: bookingData.financial,
          createdAt: bookingData.createdAt,
          createdBy: user.name || user.username
        },
        events: [
          ...selectedRoom.events,
          {
            id: Date.now().toString(),
            type: 'check_in' as const,
            description: `حجز جديد - عقد رقم: ${bookingData.contractNumber} - ${bookingData.guest.fullName || bookingData.guest.name}${hasDebt ? ` - دين: ${totalDebt} ر.س` : ''}`,
            timestamp: new Date().toISOString(),
            user: user.name || user.username,
            newValue: 'Occupied'
          }
        ]
      };

      console.log('💾 حفظ الغرفة مع بيانات النزيل:', {
        roomNumber: updatedRoom.number,
        guestName: updatedRoom.guestName,
        guestPhone: updatedRoom.guestPhone,
        status: updatedRoom.status,
        hasDebt,
        totalDebt
      });

      // حفظ في Firebase
      await saveRoomToFirebase(updatedRoom);

      console.log('✅ تم حفظ الغرفة في Firebase - تحديث الحالة المحلية');

      // تحديث القائمة المحلية
      const updatedRooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
      setRooms(updatedRooms);
      setFilteredRooms(updatedRooms);
      
      console.log('📋 الغرف المحدثة:', updatedRooms.find(r => r.id === updatedRoom.id));

      alert('✅ تم إنشاء الحجز بنجاح!');
      setIsBookingDialogOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('خطأ في حفظ الحجز:', error);
      alert('حدث خطأ أثناء حفظ الحجز');
    }
  };

  // معالج إضافة غرف من صورة
  const handleAddRoomsFromImage = async (newRooms: Partial<Room>[]) => {
    if (!user) return;
    
    // التحقق من عدم وجود غرف مكررة
    const existingNumbers = rooms.map(r => r.number);
    const uniqueRooms = newRooms.filter(room => 
      room.number && !existingNumbers.includes(room.number)
    );
    
    if (uniqueRooms.length === 0) {
      alert('جميع الغرف موجودة بالفعل في النظام');
      return;
    }
    
    // إضافة الغرف الجديدة
    const roomsToAdd: Room[] = uniqueRooms.map(room => ({
      id: room.id || `room_${Date.now()}_${Math.random()}`,
      number: room.number || '',
      floor: room.floor || Math.floor(parseInt(room.number || '0') / 100),
      type: room.type || 'غرفة',
      status: 'Available' as RoomStatus,
      balance: 0,
      currentDebt: 0,
      roomDebt: 0,
      servicesDebt: 0,
      payments: [],
      events: [{
        id: Date.now().toString(),
        type: 'status_change',
        description: 'تم إنشاء الغرفة من الصورة',
        timestamp: new Date().toISOString(),
        user: user.name || user.username,
        newValue: 'Available'
      }],
      lastUpdated: new Date().toISOString()
    }));
    
    try {
      // حفظ كل غرفة جديدة في Firebase
      for (const room of roomsToAdd) {
        await saveRoomToFirebase(room);
      }
      
      const updatedRooms = [...rooms, ...roomsToAdd];
      setRooms(updatedRooms);
      alert(`تم إضافة ${roomsToAdd.length} غرفة بنجاح`);
    } catch (error) {
      console.error('خطأ في حفظ الغرف:', error);
      alert('حدث خطأ في حفظ الغرف');
      return;
    }
    
    setIsAddRoomsFromImageOpen(false);
  };

  // التحقق من الصلاحيات
  const canChangeStatus = (fromStatus: RoomStatus, toStatus: RoomStatus): boolean => {
    if (!user) return false;
    
    // المدير والمشرف يمكنهم تغيير أي حالة
    if (user.role === 'admin' || user.role === 'supervisor') return true;
    
    // موظف النظافة يمكنه تغيير من "تحتاج تنظيف" إلى "متاحة"
    // والموظفين يمكنهم تغيير الحالات الأخرى
    if (user.role === 'housekeeping') {
      return fromStatus === 'NeedsCleaning' && toStatus === 'Available';
    }
    if (user.role === 'staff' || user.role === 'admin' || user.role === 'supervisor') {
      return (fromStatus === 'Occupied' && toStatus === 'NeedsCleaning') ||
             (fromStatus === 'NeedsCleaning' && toStatus === 'Available');
    }
    
    return false;
  };

  // ✨ معالج Context Menu (كليك يمين)
  const handleContextMenu = (e: React.MouseEvent, room: Room) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      room
    });
  };

  // ✨ معالج التمديد
  const handleExtendStay = async () => {
    if (!contextMenu || !user) return;
    
    const room = contextMenu.room;
    
    // التحقق من أن الغرفة مشغولة
    if (room.status !== 'Occupied' && room.status !== 'CheckoutToday') {
      alert('لا يمكن تمديد إقامة غرفة غير مشغولة');
      setIsExtendDialogOpen(false);
      return;
    }

    if (!room.bookingDetails?.checkOut?.date) {
      alert('لا يوجد تاريخ checkout محدد لهذه الغرفة');
      setIsExtendDialogOpen(false);
      return;
    }

    try {
      // حساب التاريخ الجديد
      const currentCheckout = new Date(room.bookingDetails.checkOut.date);
      const newCheckout = new Date(currentCheckout);
      newCheckout.setDate(newCheckout.getDate() + extendDays);

      const updatedRoom: Room = {
        ...room,
        bookingDetails: {
          ...room.bookingDetails,
          checkOut: {
            ...room.bookingDetails.checkOut,
            date: newCheckout.toISOString()
          }
        },
        status: 'Occupied', // تغيير الحالة إلى Occupied إذا كانت CheckoutToday
        events: [
          ...room.events,
          {
            id: Date.now().toString(),
            type: 'status_change' as const,
            description: `تم تمديد الإقامة ${extendDays} يوم - التاريخ الجديد: ${newCheckout.toLocaleDateString('ar-SA')}${extendNotes ? ` - ملاحظة: ${extendNotes}` : ''}`,
            timestamp: new Date().toISOString(),
            user: user.name || user.username || 'غير معروف'
          }
        ],
        lastUpdated: new Date().toISOString()
      };

      await saveRoomToFirebase(updatedRoom);
      
      alert(`✅ تم تمديد الإقامة ${extendDays} يوم بنجاح!\nالتاريخ الجديد: ${newCheckout.toLocaleDateString('ar-SA')}`);
      
      setIsExtendDialogOpen(false);
      setExtendDays(1);
      setExtendNotes('');
      setContextMenu(null);
    } catch (error) {
      console.error('خطأ في تمديد الإقامة:', error);
      alert('حدث خطأ في تمديد الإقامة');
    }
  };

  // ✨ جلب سجل الخدمات للغرفة
  const getRoomServicesHistory = async (room: Room) => {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      // جلب جميع الطلبات من Firebase
      const requestsRef = collection(db, 'requests');
      const q = query(requestsRef, where('room', '==', room.number));
      const querySnapshot = await getDocs(q);
      
      const services: any[] = [];
      let totalAmount = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        services.push({
          id: doc.id,
          type: data.type || 'خدمة',
          description: data.description || data.notes || '',
          amount: data.totalAmount || 0,
          date: data.createdAt || new Date().toISOString(),
          status: data.status || 'pending',
          category: data.menuCategory || data.linkedSection || 'عام'
        });
        totalAmount += (data.totalAmount || 0);
      });
      
      return {
        services: services.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        totalAmount
      };
    } catch (error) {
      console.error('خطأ في جلب سجل الخدمات:', error);
      return { services: [], totalAmount: 0 };
    }
  };

  // مكون بطاقة الوحدة
  const RoomCard = ({ room }: { room: Room }) => {
    const config = ROOM_STATUS_CONFIG[room.status];
    const typeConfig = ROOM_TYPE_CONFIG[room.type as keyof typeof ROOM_TYPE_CONFIG] || {
      color: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
      borderColor: 'border-gray-500',
      icon: 'Home'
    };
    const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP];
    const roomPrice = roomPrices[room.type];
    const catalogRoomType = roomTypes.find(rt => rt.name === room.type);
    const imageUrl = catalogRoomType?.images?.[0];
    const isOccupied = room.status === 'Occupied' || room.status === 'CheckoutToday';
    const isCheckoutToday = room.status === 'CheckoutToday';
    const isLate = isCheckoutToday && room.bookingDetails?.checkOut?.date && isLateCheckout(room.bookingDetails.checkOut.date);

    return (
      <div
        className={`relative group cursor-pointer transition-transform duration-200 will-change-transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20 rounded-2xl overflow-hidden min-h-[220px] ${
          imageUrl ? '' : config.bgColor
        } active:scale-95 ${isLate ? 'animate-pulse ring-4 ring-red-500' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openRoomDetails(room);
        }}
        onContextMenu={(e) => handleContextMenu(e, room)}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {/* تنبيه متأخر عن checkout */}
        {isLate && (
          <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold py-1 px-2 text-center z-20 animate-pulse">
            ⚠️ متأخر عن checkout
          </div>
        )}

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine transition-opacity pointer-events-none"></div>
        
        {imageUrl && <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors pointer-events-none"></div>}
        <div className={`p-3 flex flex-col justify-between h-full min-h-[140px] relative z-10 ${isLate ? 'pt-8' : ''}`}>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ${
                imageUrl 
                  ? config.bgColor 
                  : 'bg-black/20'
              } shadow-lg`}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white drop-shadow-md">{config.label}</p>
                {isCheckoutToday && (
                  <p className="text-[10px] text-yellow-300 font-bold">{t('checkoutToday')}</p>
                )}
              </div>
            </div>
            <span className="text-xl font-bold drop-shadow-md group-hover:scale-110 transition-transform duration-300 text-white">{room.number}</span>
          </div>

          <div className="flex-grow flex flex-col justify-end mt-2 z-10">
            <div className="text-center mb-2">
              <p className="text-sm font-semibold opacity-90 truncate text-white drop-shadow-md">{room.type}</p>
            </div>
            
            {/* اسم العميل - بشكل بارز للغرف المشغولة */}
            {room.guestName && room.guestName.trim() !== '' && (
              <div className={`text-center ${
                isCheckoutToday 
                  ? 'bg-gradient-to-r from-red-600/90 to-blue-600/90' 
                  : 'bg-gradient-to-r from-red-600/90 to-red-700/90'
              } backdrop-blur-sm p-2 rounded-lg border-2 border-white/30 shadow-xl mb-2`}>
                <p className="text-sm font-bold text-white truncate drop-shadow-md">👤 {room.guestName}</p>
                {room.guestPhone && (
                  <p className="text-xs text-white/90 truncate mt-0.5">📱 {room.guestPhone}</p>
                )}
                {/* عرض الديون إذا كانت موجودة */}
                {(room.currentDebt || 0) > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <p className="text-xs text-yellow-300 font-bold">{t('currentDebt')}</p>
                    <p className="text-lg font-bold text-white mt-1">{room.currentDebt} ر.س</p>
                    {(room.roomDebt || 0) > 0 && (
                      <p className="text-[10px] text-white/70">{t('accommodationDebt', { amount: room.roomDebt })}</p>
                    )}
                    {(room.servicesDebt || 0) > 0 && (
                      <p className="text-[10px] text-white/70">{t('servicesDebt', { amount: room.servicesDebt })}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {room.balance !== 0 && (
              <div className="text-center mt-1">
                <Badge className={`shadow-md px-2 py-1 text-xs font-bold border ${
                  room.balance > 0 
                    ? 'bg-red-500/80 text-white border-red-400/40' 
                    : 'bg-green-500/80 text-white border-green-400/40'
                }`}>
                  {room.balance > 0 ? '+' : ''}{room.balance} ر.س
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <PermissionGuard 
      permission="view_rooms"
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/20 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('error')}</h2>
            <p className="text-gray-300 mb-6">
              {t('noData')}
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium"
            >
              {t('back')}
            </button>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
      {/* خلفية تزيينية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* تنبيه الوحدات المتأخرة عن موعد الخروج - أعلى أولوية */}
      {showOverdueAlert && overdueRooms.length > 0 && (
        <div className="fixed top-4 right-4 left-4 z-[60] max-w-2xl mx-auto animate-in slide-in-from-top">
          <div className="bg-gradient-to-r from-red-800 via-red-900 to-red-950 text-white rounded-2xl shadow-2xl border-2 border-red-600 overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('overdueRoomsAlertTitle')}</h3>
                    <p className="text-sm text-white/90">{t('overdueRoomsAlertDesc', { count: overdueRooms.length })}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOverdueAlert(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {overdueRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors border border-red-400/30"
                    onClick={() => {
                      openRoomDetails(room);
                      setShowOverdueAlert(false);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg animate-pulse">
                        {room.number}
                      </div>
                      <div>
                        <p className="text-lg font-bold">{room.guestName || t('unknownGuest')}</p>
                        <p className="text-sm text-white/80">
                          {room.guestPhone && `📱 ${room.guestPhone}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-red-500/30 px-2 py-1 rounded-lg">
                            ⚠️ {room.daysOverdue === 1 ? t('lateDay', { count: room.daysOverdue }) : t('lateDays', { count: room.daysOverdue })}
                          </span>
                          <span className="text-xs text-white/70">
                            {t('expectedCheckout', { date: room.bookingDetails?.checkOut?.date || '' })}
                          </span>
                        </div>
                        {room.overdueInfo && (
                          <p className="text-xs text-yellow-300 mt-1 font-semibold">
                            {t('extraDebt', { amount: room.overdueInfo.extraDebt.toLocaleString() })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-2">
                      <Button
                        size="sm"
                        className="bg-white text-red-600 hover:bg-white/90"
                      >
                        {t('callImmediately')}
                      </Button>
                      <span className="text-xs text-white/70">
                        {t('totalDebt', { amount: room.currentDebt?.toLocaleString() || '0' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-white/80" dangerouslySetInnerHTML={{ __html: t('noteOverdueDebt') }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تنبيه النزلاء المتأخرين عن checkout */}
      {showLateCheckoutAlert && lateCheckoutRooms.length > 0 && (
        <div className="fixed top-4 right-4 left-4 z-50 max-w-2xl mx-auto animate-in slide-in-from-top">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl shadow-2xl border-2 border-red-400 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('lateCheckoutAlertTitle')}</h3>
                    <p className="text-sm text-white/90">{t('lateCheckoutAlertDesc')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLateCheckoutAlert(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {lateCheckoutRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => {
                      openRoomDetails(room);
                      setShowLateCheckoutAlert(false);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center text-2xl font-bold">
                        {room.number}
                      </div>
                      <div>
                        <p className="text-lg font-bold">{room.guestName || t('unknownGuest')}</p>
                        <p className="text-sm text-white/80">
                          {room.guestPhone && `📱 ${room.guestPhone}`}
                        </p>
                        <p className="text-xs text-white/70 mt-1">
                          {t('checkout')}: {room.bookingDetails?.checkOut?.date} - {room.bookingDetails?.checkOut?.time || '12:00 ظهراً'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button
                        size="sm"
                        className="bg-white text-red-600 hover:bg-white/90"
                      >
                        {t('callNow')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-[1800px] mx-auto space-y-8 p-4 lg:p-8">
        {/* Filter Section - تصميم أنيق */}
        <div className="bg-gradient-to-r from-slate-800/80 via-blue-900/80 to-purple-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10">
          {/* Header مع أزرار العرض */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🔽</span>
              </div>
              <h2 className="text-xl font-bold text-white">{t('filterByStatus')}</h2>
            </div>
            
            {/* أزرار طريقة العرض - في أعلى اليسار */}
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-2 border-green-400'
                    : 'bg-slate-700/50 text-blue-200 border-2 border-slate-600 hover:bg-slate-600/70 hover:text-white'
                }`}
                title="عرض شبكة"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-2 border-green-400'
                    : 'bg-slate-700/50 text-blue-200 border-2 border-slate-600 hover:bg-slate-600/70 hover:text-white'
                }`}
                title="عرض قائمة"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* زر عرض الكل */}
            <Button
              onClick={() => setActiveFilter('All')}
              className={`px-6 py-6 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                activeFilter === 'All'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-2 border-blue-400'
                  : 'bg-slate-700/50 text-blue-200 border-2 border-slate-600 hover:bg-slate-600/70 hover:text-white'
              }`}
            >
              <span className="text-xl mr-2">📊</span>
              {t('viewAll')} ({stats.total})
            </Button>

            {/* زر التقرير */}
            <div className="relative z-[100]" onMouseLeave={(e) => {
              // تأخير إخفاء القائمة
              const target = e.currentTarget;
              setTimeout(() => {
                if (!target.matches(':hover')) {
                  target.classList.remove('show-dropdown');
                }
              }, 200);
            }} onMouseEnter={(e) => e.currentTarget.classList.add('show-dropdown')}>
              <Button
                className="px-6 py-6 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400"
              >
                <span className="text-xl mr-2">📋</span>
                تقرير
              </Button>
              
              {/* قائمة منسدلة - مع z-index عالي جداً */}
              <style jsx>{`
                .show-dropdown .dropdown-menu {
                  display: block !important;
                }
              `}</style>
              <div className="dropdown-menu absolute top-full left-0 mt-2 hidden z-[9999] min-w-[200px]">
                <div className="bg-slate-900/98 backdrop-blur-xl rounded-xl border-2 border-white/20 shadow-2xl p-2 space-y-2">
                  {/* محجوزة */}
                  <button
                    onClick={() => setActiveFilter('Reserved')}
                    className="w-full px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">📅</span>
                    <div className="flex-1 text-right">
                      <div>محجوزة</div>
                      <div className="text-xs text-purple-200">({stats.reserved})</div>
                    </div>
                  </button>
                  
                  {/* تحت الصيانة */}
                  <button
                    onClick={() => setActiveFilter('Maintenance')}
                    className="w-full px-4 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-bold text-sm transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">🔧</span>
                    <div className="flex-1 text-right">
                      <div>تحت الصيانة</div>
                      <div className="text-xs text-gray-200">({stats.maintenance})</div>
                    </div>
                  </button>
                  
                  {/* تحتاج تنظيف */}
                  <button
                    onClick={() => setActiveFilter('NeedsCleaning')}
                    className="w-full px-4 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">🧹</span>
                    <div className="flex-1 text-right">
                      <div>تحتاج تنظيف</div>
                      <div className="text-xs text-orange-200">({stats.needsCleaning})</div>
                    </div>
                  </button>
                  
                  {/* مشغولة (جديد) */}
                  <button
                    onClick={() => setActiveFilter('OccupiedAll')}
                    className="w-full px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">🛏️</span>
                    <div className="flex-1 text-right">
                      <div>مشغولة</div>
                      <div className="text-xs text-cyan-200">({stats.occupiedAll})</div>
                    </div>
                  </button>
                  
                  {/* خروج اليوم */}
                  <button
                    onClick={() => setActiveFilter('CheckoutToday')}
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-bold text-sm transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">⏰</span>
                    <div className="flex-1 text-right">
                      <div>{t('roomStatusCheckoutToday')}</div>
                      <div className="text-xs text-white/80">({stats.checkoutToday})</div>
                    </div>
                  </button>
                  
                  {/* مشغولة */}
                  <button
                    onClick={() => setActiveFilter('Occupied')}
                    className="w-full px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">🛏️</span>
                    <div className="flex-1 text-right">
                      <div>{t('roomStatusOccupied')}</div>
                      <div className="text-xs text-cyan-200">({stats.occupied})</div>
                    </div>
                  </button>
                  
                  {/* متاحة */}
                  <button
                    onClick={() => setActiveFilter('Available')}
                    className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">✅</span>
                    <div className="flex-1 text-right">
                      <div>{t('roomStatusAvailable')}</div>
                      <div className="text-xs text-green-200">({stats.available})</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* أزرار الحالات */}
            {Object.entries(ROOM_STATUS_CONFIG).map(([status, config]) => {
              const count = rooms.filter(r => r.status === status).length;
              if (count === 0) return null;
              
              return (
                <Button
                  key={status}
                  onClick={() => setActiveFilter(status as RoomStatus)}
                  className={`px-6 py-6 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                    activeFilter === status
                      ? `${config.bgColor} text-white border-2 border-white/40 ring-4 ring-white/20`
                      : 'bg-slate-700/50 text-blue-200 border-2 border-slate-600 hover:bg-slate-600/70 hover:text-white'
                  }`}
                >
                  <span className="text-xl mr-2">
                    {status === 'Available' && '✅'}
                    {status === 'Occupied' && '🛏️'}
                    {status === 'CheckoutToday' && '⏰'}
                    {status === 'NeedsCleaning' && '🧹'}
                    {status === 'Maintenance' && '🔧'}
                    {status === 'Reserved' && '📅'}
                  </span>
                  {config.label} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* عرض الوحدات - Grid أو List */}
        {viewMode === 'grid' ? (
          /* شبكة الوحدات */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredRooms
              .sort((a, b) => a.number.localeCompare(b.number))
              .map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
          </div>
        ) : (
          /* عرض القائمة - تصميم جدول احترافي */
          <div className="bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border-2 border-white/20">
            {/* رأس الجدول */}
            <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 text-white border-b-2 border-white/20">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 font-bold text-sm">
                <div className="col-span-1 text-center">رقم الوحدة</div>
                <div className="col-span-1 text-center">الحالة</div>
                <div className="col-span-2">اسم النزيل</div>
                <div className="col-span-2">دخول في</div>
                <div className="col-span-2">خروج في</div>
                <div className="col-span-1 text-center">الوحدة</div>
                <div className="col-span-1 text-right">الليالي (الإيجار)</div>
                <div className="col-span-1 text-right">الإيجار الكلي</div>
                <div className="col-span-1 text-center">الرصيد</div>
              </div>
            </div>

            {/* محتوى الجدول */}
            <div className="divide-y divide-white/10">
              {filteredRooms
                .sort((a, b) => a.number.localeCompare(b.number))
                .map((room, index) => {
                  const config = ROOM_STATUS_CONFIG[room.status];
                  const roomPrice = roomPrices[room.type];
                  const isOccupied = room.status === 'Occupied' || room.status === 'CheckoutToday' || room.status === 'Overdue';
                  
                  // حساب عدد الليالي
                  let nights = 0;
                  let totalRent = 0;
                  if (room.bookingDetails?.checkIn?.date && room.bookingDetails?.checkOut?.date) {
                    const checkIn = new Date(room.bookingDetails.checkIn.date);
                    const checkOut = new Date(room.bookingDetails.checkOut.date);
                    nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                    if (roomPrice) {
                      totalRent = nights * roomPrice.pricePerDay;
                    }
                  }

                  return (
                    <div
                      key={room.id}
                      onClick={() => openRoomDetails(room)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, room });
                        setSelectedRoom(room);
                      }}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all cursor-pointer ${
                        index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'
                      }`}
                    >
                      {/* رقم الوحدة */}
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg px-3 py-2 text-lg shadow-lg">
                          {room.number}
                        </div>
                      </div>

                      {/* الحالة */}
                      <div className="col-span-1 flex items-center justify-center">
                        <Badge className={`${config.color} text-xs whitespace-nowrap shadow-md`}>
                          {config.label}
                        </Badge>
                      </div>

                      {/* اسم النزيل */}
                      <div className="col-span-2 flex items-center">
                        {isOccupied && room.guestName ? (
                          <div>
                            <div className="font-semibold text-white">{room.guestName}</div>
                            {room.guestPhone && (
                              <div className="text-xs text-blue-200">📱 {room.guestPhone}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/40 text-sm">-</span>
                        )}
                      </div>

                      {/* دخول في */}
                      <div className="col-span-2 flex items-center">
                        {room.bookingDetails?.checkIn?.date ? (
                          <div>
                            <div className="text-sm font-medium text-white">
                              {new Date(room.bookingDetails.checkIn.date).toLocaleDateString('ar-EG', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-blue-200">
                              {room.bookingDetails.checkIn.time || '12:00 ظهراً'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-white/40 text-sm">-</span>
                        )}
                      </div>

                      {/* خروج في */}
                      <div className="col-span-2 flex items-center">
                        {room.bookingDetails?.checkOut?.date ? (
                          <div>
                            <div className="text-sm font-medium text-white">
                              {new Date(room.bookingDetails.checkOut.date).toLocaleDateString('ar-EG', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-blue-200">
                              {room.bookingDetails.checkOut.time || '12:00 ظهراً'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-white/40 text-sm">-</span>
                        )}
                      </div>

                      {/* نوع الوحدة */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className="text-sm text-blue-100 text-center">{room.type}</span>
                      </div>

                      {/* الليالي (الإيجار اليومي) */}
                      <div className="col-span-1 flex items-center justify-end">
                        {nights > 0 && roomPrice ? (
                          <div className="text-right">
                            <div className="font-semibold text-white">{nights}</div>
                            <div className="text-xs text-blue-200">شهري</div>
                          </div>
                        ) : (
                          <span className="text-white/40 text-sm">-</span>
                        )}
                      </div>

                      {/* الإيجار الكلي */}
                      <div className="col-span-1 flex items-center justify-end">
                        {totalRent > 0 ? (
                          <div className="text-right">
                            <div className="font-bold text-yellow-300">{totalRent.toLocaleString()}</div>
                          </div>
                        ) : roomPrice ? (
                          <div className="text-right">
                            <div className="font-semibold text-yellow-200">{roomPrice.pricePerDay.toLocaleString()}</div>
                          </div>
                        ) : (
                          <span className="text-white/40 text-sm">-</span>
                        )}
                      </div>

                      {/* الرصيد */}
                      <div className="col-span-1 flex items-center justify-center">
                        {room.currentDebt > 0 ? (
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1 rounded-lg text-sm shadow-lg">
                            {room.currentDebt.toLocaleString()}
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-sm shadow-lg">
                            0
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* إجمالي في النهاية */}
            {filteredRooms.length === 0 && (
              <div className="py-12 text-center text-white/60">
                <BedDouble className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">لا توجد وحدات متاحة</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* نافذة تفاصيل الوحدة */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg p-4 -m-6 mb-6">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BedDouble className="w-6 h-6 text-white" />
              </div>
              {t('roomDetails')} {selectedRoom?.number}
            </DialogTitle>
            <DialogDescription className="text-blue-200/80 font-medium">
              {t('roomDetailsDesc')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoom && (
            <div className="space-y-6">
              {/* زر إنشاء طلب للغرف المشغولة */}
              {selectedRoom && selectedRoom.status === 'Occupied' && selectedRoom.guestName && (
                <>
                  <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-md border-blue-400/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{t('createRequestForGuest')}</h3>
                          <p className="text-sm text-blue-200">{t('createRequestDesc', { guestName: selectedRoom.guestName })}</p>
                        </div>
                        <Button
                          onClick={() => {
                            window.location.href = `/dashboard/requests/new?roomNumber=${selectedRoom.number}&guestName=${encodeURIComponent(selectedRoom.guestName || '')}&phone=${encodeURIComponent(selectedRoom.guestPhone || '')}`;
                          }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-6 py-3 shadow-lg"
                        >
                          <FileText className="w-5 h-5 mr-2" />
                          {t('createNewRequest')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* بطاقة الديون والدفعات */}
                  {(selectedRoom.currentDebt || 0) > 0 && (
                    <Card className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md border-red-400/30">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-white mb-1">{t('currentDebts')}</h3>
                              <p className="text-sm text-red-200">{t('totalDueOnGuest')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-white">{selectedRoom.currentDebt} ر.س</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
                            <div className="bg-white/10 p-3 rounded-lg">
                              <p className="text-xs text-white/70">{t('roomDebt')}</p>
                              <p className="text-lg font-bold text-white">{selectedRoom.roomDebt || 0} ر.س</p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg">
                              <p className="text-xs text-white/70">{t('servicesDebtLabel')}</p>
                              <p className="text-lg font-bold text-white">{selectedRoom.servicesDebt || 0} ر.س</p>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => setIsPaymentOpen(true)}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 shadow-lg"
                          >
                            <DollarSign className="w-5 h-5 mr-2" />
                            {t('recordNewPayment')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* زر تصفية الحجز */}
                  <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md border-orange-400/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{t('checkoutProcess')}</h3>
                          <p className="text-sm text-orange-200">{t('checkoutProcessDesc')}</p>
                        </div>
                        <Button
                          onClick={async () => {
                            if (confirm(t('confirmCheckout', { roomNumber: selectedRoom.number }))) {
                              try {
                                const updatedRoom: Room = {
                                  ...selectedRoom,
                                  status: 'Cleaning' as RoomStatus,
                                  guestName: '',
                                  guestPhone: '',
                                  guestNationality: '',
                                  guestIdNumber: '',
                                  bookingDetails: undefined,
                                  events: [
                                    ...selectedRoom.events,
                                    {
                                      id: Date.now().toString(),
                                      timestamp: new Date().toISOString(),
                                      type: 'status_change' as const,
                                      description: `تصفية الحجز - تحويل الحالة من "مشغولة" إلى "تحتاج تنظيف"`,
                                      user: user?.username || 'مجهول',
                                      oldValue: selectedRoom.status,
                                      newValue: 'Cleaning',
                                    },
                                  ],
                                };
                                
                                await saveRoomToFirebase(updatedRoom);
                                setSelectedRoom(updatedRoom);
                                alert(t('checkoutSuccess'));
                                setIsDetailsOpen(false);
                              } catch (error) {
                                console.error('Error clearing reservation:', error);
                                alert(t('checkoutError'));
                              }
                            }
                          }}
                          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-6 py-3 shadow-lg"
                        >
                          <Trash2 className="w-5 h-5 mr-2" />
                          {t('clearReservation')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {/* زر الحجز السريع للغرف المتاحة */}
              {selectedRoom && selectedRoom.status === 'Available' && (
                <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border-green-400/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{t('roomAvailableForBooking')}</h3>
                        <p className="text-sm text-green-200">{t('roomAvailableDesc')}</p>
                      </div>
                      <Button
                        onClick={() => {
                          setIsDetailsOpen(false);
                          setIsBookingDialogOpen(true);
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 py-3 shadow-lg"
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        فتح نافذة الحجز
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* معلومات الوحدة الحالية */}
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-4">
                    <label className="text-sm font-semibold text-blue-200 mb-2 block">الحالة الحالية</label>
                    <div className="flex items-center gap-3">
                      <Badge className={`${ROOM_STATUS_CONFIG[selectedRoom.status].bgColor} text-white shadow-lg px-3 py-1`}>
                        {ROOM_STATUS_CONFIG[selectedRoom.status].label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className={`bg-white/10 backdrop-blur-md border-white/20`}>
                  <CardContent className="p-4">
                    <label className="text-sm font-semibold text-blue-200 mb-2 block">الرصيد المستحق</label>
                    <div className="flex items-center gap-3">
                      <p className={`text-2xl font-bold ${selectedRoom.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {selectedRoom.balance} ر.س
                      </p>
                      {selectedRoom.balance > 0 && (
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                          onClick={() => setIsPaymentOpen(true)}
                        >
                          تسديد المبلغ
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* تغيير الحالة */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-purple-400" />
                    {t('changeStatus')}
                  </CardTitle>
                  <CardDescription className="text-blue-200/80 text-sm">
                    {t('selectNewStatus')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-blue-200 block">{t('newStatus')}</label>
                    
                    {/* عرض الحالات كأزرار كبيرة وواضحة */}
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(ROOM_STATUS_CONFIG).map(([status, config]) => {
                        const isDisabled = !canChangeStatus(selectedRoom.status, status as RoomStatus);
                        const isSelected = newStatus === status;
                        
                        return (
                          <button
                            key={status}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setNewStatus(status as RoomStatus)}
                            className={`
                              w-full p-4 rounded-xl border-2 transition-all duration-200 text-right
                              ${isSelected 
                                ? `${config.bgColor} border-white/50 shadow-lg transform scale-[1.02]` 
                                : 'bg-white/5 border-white/20 hover:border-white/40 hover:bg-slate-700/50'
                              }
                              ${isDisabled 
                                ? 'opacity-40 cursor-not-allowed' 
                                : 'cursor-pointer hover:shadow-lg'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${config.bgColor} shadow-sm`}></div>
                                <div className="text-right">
                                  <div className="text-white font-semibold text-lg">{config.label}</div>
                                  <div className="text-white/70 text-sm">
                                    {status === 'Available' && 'الوحدة جاهزة للحجز'}
                                    {status === 'Occupied' && 'يوجد نزيل في الوحدة'}
                                    {status === 'Reserved' && 'محجوزة ولم يصل النزيل بعد'}
                                    {status === 'Cleaning' && 'تحتاج إلى تنظيف وتجهيز'}
                                    {status === 'Maintenance' && 'تحتاج إلى صيانة أو إصلاح'}
                                    {status === 'OutOfOrder' && 'غير صالحة للاستخدام مؤقتاً'}
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-6 h-6 text-white" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {(newStatus === 'Occupied' || newStatus === 'Reserved') && (
                    <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                      <label className="text-sm font-semibold text-blue-200 block mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        اسم النزيل
                      </label>
                      <Input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="أدخل اسم النزيل المقيم أو المحجوز للوحدة"
                        className="border-2 border-blue-400/50 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60 text-lg p-3"
                      />
                      <p className="text-xs text-blue-200/70 mt-2">
                        {newStatus === 'Occupied' ? 'اسم النزيل المقيم حالياً في الوحدة' : 'اسم الشخص الذي حجز الوحدة'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* سجل الأحداث */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    سجل الأحداث
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 overflow-y-auto space-y-3">
                    {selectedRoom.events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-start gap-3 rounded-lg bg-white/5 p-3 border border-white/10">
                        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                          <Clock className="h-4 w-4 text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{event.description}</p>
                          <div className="mt-1 flex items-center gap-4 text-xs text-blue-200/70">
                            <span>بواسطة: {event.user}</span>
                            <span>
                              {new Date(event.timestamp).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter className="bg-slate-800/50 rounded-lg p-4 -m-6 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsOpen(false)}
              className="border-2 border-white/30 hover:bg-slate-700/50 text-white font-medium"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleStatusChange}
              disabled={!selectedRoom || newStatus === selectedRoom.status || 
                ((newStatus === 'Occupied' || newStatus === 'Reserved') && !guestName.trim())}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg disabled:opacity-50"
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة الدفع */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg p-4 -m-6 mb-6">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              تسديد المبلغ - وحدة {selectedRoom?.number}
            </DialogTitle>
            <DialogDescription className="text-blue-200/80 font-medium">
              إدخال تفاصيل عملية الدفع
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* عرض إجمالي الديون */}
            <Card className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md border-red-400/30">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-red-200 mb-1">💰 إجمالي الديون الحالية</p>
                  <p className="text-4xl font-bold text-white">{selectedRoom?.currentDebt || 0} ر.س</p>
                  <div className="flex gap-4 justify-center mt-3 pt-3 border-t border-white/20">
                    <div>
                      <p className="text-xs text-white/70">دين الإقامة</p>
                      <p className="text-lg font-bold text-white">{selectedRoom?.roomDebt || 0} ر.س</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70">دين الخدمات</p>
                      <p className="text-lg font-bold text-white">{selectedRoom?.servicesDebt || 0} ر.س</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <label className="text-sm font-semibold text-blue-200 mb-2 block">المبلغ المستحق</label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="text-xl font-bold text-center border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white"
                />
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <label className="text-sm font-semibold text-blue-200 block mb-4">طريقة الدفع</label>
                <RadioGroup 
                  value={paymentMethod.type} 
                  onValueChange={(value) => setPaymentMethod({ type: value as 'cash' | 'card' | 'transfer' })}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/20 hover:bg-slate-700/50 transition-colors">
                    <RadioGroupItem value="cash" className="border-white/50 text-white" />
                    <Banknote className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-white">نقدي</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/20 hover:bg-slate-700/50 transition-colors">
                    <RadioGroupItem value="card" className="border-white/50 text-white" />
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-white">بطاقة الشبكة</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/20 hover:bg-slate-700/50 transition-colors">
                    <RadioGroupItem value="transfer" className="border-white/50 text-white" />
                    <Smartphone className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-white">تحويل بنكي</span>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            {paymentMethod.type === 'card' && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-blue-200 block mb-2">نوع البطاقة</label>
                    <Select 
                      value={paymentMethod.cardType || ''} 
                      onValueChange={(value) => setPaymentMethod({...paymentMethod, cardType: value})}
                    >
                      <SelectTrigger className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white">
                        <SelectValue placeholder="اختر نوع البطاقة" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/20">
                        <SelectItem value="mada" className="text-white hover:bg-slate-700/50">مدى</SelectItem>
                        <SelectItem value="visa" className="text-white hover:bg-slate-700/50">فيزا</SelectItem>
                        <SelectItem value="mastercard" className="text-white hover:bg-slate-700/50">ماستركارد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-blue-200 block mb-2">رقم الإيصال</label>
                    <Input
                      value={paymentMethod.receiptNumber || ''}
                      onChange={(e) => setPaymentMethod({...paymentMethod, receiptNumber: e.target.value})}
                      placeholder="أدخل رقم الإيصال"
                      className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <DialogFooter className="bg-slate-800/50 rounded-lg p-4 -m-6 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsPaymentOpen(false)}
              className="border-2 border-white/30 hover:bg-slate-700/50 text-white font-medium"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={paymentAmount <= 0 || !selectedRoom}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg disabled:opacity-50"
            >
              تأكيد الدفع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة إضافة نزيل */}
      <AddGuestDialog
        open={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        onSubmit={handleAddGuest}
        availableRooms={rooms.filter(r => r.status === 'Available' || r.status === 'Reserved').map(r => r.number)}
      />

      {/* نافذة إضافة غرف من صورة */}
      <AddRoomsFromImageDialog
        open={isAddRoomsFromImageOpen}
        onClose={() => setIsAddRoomsFromImageOpen(false)}
        onSubmit={handleAddRoomsFromImage}
      />

      {/* نافذة الحجز الاحترافية */}
      <BookingDialog
        room={selectedRoom}
        isOpen={isBookingDialogOpen}
        onClose={() => {
          setIsBookingDialogOpen(false);
          setSelectedRoom(null);
        }}
        onSave={handleBookingComplete}
        onStatusChange={async (roomId: string, newStatus: string) => {
          console.log('🔄 تغيير حالة الغرفة من نافذة الحجز:', roomId, newStatus);
          
          if (!user) return;
          
          // 🔥 التحقق من الخروج المبكر
          if (newStatus === 'NeedsCleaning') {
            const room = rooms.find(r => r.id === roomId);
            if (room && room.bookingDetails) {
              const bookedCheckoutDate = new Date(room.bookingDetails.checkOut.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              bookedCheckoutDate.setHours(0, 0, 0, 0);
              
              // إذا كان تاريخ الخروج المحجوز في المستقبل (خروج مبكر)
              if (bookedCheckoutDate > today) {
                console.log('⚠️ اكتشاف خروج مبكر - فتح نافذة التنبيه');
                setEarlyCheckoutRoom(room);
                setIsEarlyCheckoutDialogOpen(true);
                return; // إيقاف العملية حتى يختار المستخدم
              }
            }
          }
          
          // 🔥 عند تغيير الحالة لـ NeedsCleaning، نحذف بيانات النزيل تماماً
          const clearGuestData = newStatus === 'NeedsCleaning' || newStatus === 'Available' || newStatus === 'Maintenance';
          
          const updatedRooms = updateRoomStatus(
            rooms,
            roomId,
            newStatus as RoomStatus,
            user.name || user.username,
            undefined, // guestName
            clearGuestData // مسح بيانات النزيل
          );
          
          try {
            const updatedRoom = updatedRooms.find(r => r.id === roomId);
            if (updatedRoom) {
              await saveRoomToFirebase(updatedRoom);
              setRooms(updatedRooms);
              setFilteredRooms(updatedRooms);
              
              if (newStatus === 'NeedsCleaning') {
                alert('✅ تم إنهاء العقد وتغيير الحالة إلى "تحتاج تنظيف"');
              } else {
                alert('✅ تم تغيير حالة الوحدة بنجاح');
              }
            }
          } catch (error) {
            console.error('❌ خطأ في حفظ التغييرات:', error);
            alert('حدث خطأ في حفظ التغييرات');
          }
        }}
        onRoomChange={async (oldRoomId: string, newRoomNumber: string) => {
          console.log('🔄 نقل النزيل من غرفة إلى أخرى:', oldRoomId, newRoomNumber);
          
          if (!user) return false;
          
          try {
            // 1. العثور على الغرفة القديمة والجديدة
            const oldRoom = rooms.find(r => r.id === oldRoomId);
            const newRoom = rooms.find(r => r.number === newRoomNumber);
            
            if (!oldRoom || !newRoom) {
              console.error('❌ لم يتم العثور على الغرف');
              return false;
            }
            
            if (newRoom.status !== 'Available') {
              console.error('❌ الغرفة الجديدة غير متاحة');
              return false;
            }
            
            // 2. نسخ بيانات النزيل والحجز من الغرفة القديمة
            const guestData = {
              guestName: oldRoom.guestName,
              guestPhone: oldRoom.guestPhone,
              guestNationality: oldRoom.guestNationality,
              guestIdType: oldRoom.guestIdType,
              guestIdNumber: oldRoom.guestIdNumber,
              guestIdExpiry: oldRoom.guestIdExpiry,
              guestEmail: oldRoom.guestEmail,
              guestWorkPhone: oldRoom.guestWorkPhone,
              guestAddress: oldRoom.guestAddress,
              guestNotes: oldRoom.guestNotes,
              balance: oldRoom.balance,
              bookingDetails: oldRoom.bookingDetails ? {
                ...oldRoom.bookingDetails,
                roomNumber: newRoomNumber // تحديث رقم الغرفة في تفاصيل الحجز
              } : undefined
            };
            
            // 3. تحديث الغرفة الجديدة بالبيانات
            const updatedNewRoom: Room = {
              ...newRoom,
              ...guestData,
              status: oldRoom.status, // نفس حالة الغرفة القديمة (Occupied/Reserved)
              events: [
                {
                  id: `event-${Date.now()}`,
                  type: 'status_change',
                  description: `تم نقل النزيل ${guestData.guestName} من غرفة ${oldRoom.number}`,
                  timestamp: new Date().toISOString(),
                  user: user.name || user.username,
                  oldValue: oldRoom.number,
                  newValue: newRoomNumber
                },
                ...newRoom.events
              ],
              lastUpdated: new Date().toISOString()
            };
            
            // 4. تنظيف الغرفة القديمة
            const { 
              guestName, guestPhone, guestNationality, guestIdType, 
              guestIdNumber, guestIdExpiry, guestEmail, guestWorkPhone, 
              guestAddress, guestNotes, bookingDetails, ...cleanOldRoom 
            } = oldRoom;
            
            const updatedOldRoom: Room = {
              ...cleanOldRoom,
              status: 'NeedsCleaning' as RoomStatus,
              balance: 0,
              events: [
                {
                  id: `event-${Date.now() + 1}`,
                  type: 'status_change',
                  description: `تم نقل النزيل ${guestData.guestName} إلى غرفة ${newRoomNumber}`,
                  timestamp: new Date().toISOString(),
                  user: user.name || user.username,
                  oldValue: 'Occupied',
                  newValue: 'NeedsCleaning'
                },
                ...oldRoom.events
              ],
              lastUpdated: new Date().toISOString()
            };
            
            // 5. تحديث قائمة الغرف
            const updatedRooms = rooms.map(r => {
              if (r.id === oldRoomId) return updatedOldRoom;
              if (r.id === newRoom.id) return updatedNewRoom;
              return r;
            });
            
            // 6. حفظ التغييرات في Firebase
            await saveRoomToFirebase(updatedOldRoom);
            await saveRoomToFirebase(updatedNewRoom);
            
            // 7. تحديث الحالة
            setRooms(updatedRooms);
            setFilteredRooms(updatedRooms);
            
            console.log('✅ تم نقل النزيل بنجاح');
            return true;
            
          } catch (error) {
            console.error('❌ خطأ في نقل النزيل:', error);
            return false;
          }
        }}
        allRooms={rooms}
      />

      {/* زر تحديث الصلاحيات */}
      <RefreshPermissionsButton />

      {/* حافظة بيانات النزيل العائمة */}
      <GuestDataClipboard position="bottom-left" />

      {/* ✨ Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-[9999] min-w-[200px]"
          style={{
            top: contextMenu.y,
            left: contextMenu.x
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-gray-200 font-semibold text-gray-700">
            غرفة {contextMenu.room.number}
          </div>
          
          {/* تغيير الحالة */}
          <div className="border-b border-gray-200">
            <div className="px-4 py-2 text-sm font-semibold text-gray-500">تغيير الحالة</div>
            
            {contextMenu.room.status === 'Occupied' && (
              <button
                onClick={async () => {
                  if (!user) return;
                  
                  // تنبيه الخروج المبكر
                  const room = contextMenu.room;
                  if (room.bookingDetails) {
                    const bookedCheckoutDate = new Date(room.bookingDetails.checkOut.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    bookedCheckoutDate.setHours(0, 0, 0, 0);
                    
                    if (bookedCheckoutDate > today) {
                      setEarlyCheckoutRoom(room);
                      setIsEarlyCheckoutDialogOpen(true);
                      setContextMenu(null);
                      return;
                    }
                  }
                  
                  // خروج عادي
                  const updatedRooms = updateRoomStatus(
                    rooms,
                    room.id,
                    'NeedsCleaning' as RoomStatus,
                    user.name || user.username,
                    undefined,
                    true
                  );
                  
                  const updatedRoom = updatedRooms.find(r => r.id === room.id);
                  if (updatedRoom) {
                    await saveRoomToFirebase(updatedRoom);
                    setRooms(updatedRooms);
                    setFilteredRooms(updatedRooms);
                    alert('✅ تم تسجيل الخروج');
                  }
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-right hover:bg-orange-50 transition-colors flex items-center gap-2 text-gray-700"
              >
                <Trash2 className="w-4 h-4 text-orange-600" />
                تسجيل خروج (إنهاء العقد)
              </button>
            )}
            
            {contextMenu.room.status === 'NeedsCleaning' && (
              <>
                <button
                  onClick={async () => {
                    if (!user) return;
                    const updatedRooms = updateRoomStatus(
                      rooms,
                      contextMenu.room.id,
                      'Available' as RoomStatus,
                      user.name || user.username
                    );
                    const updatedRoom = updatedRooms.find(r => r.id === contextMenu.room.id);
                    if (updatedRoom) {
                      await saveRoomToFirebase(updatedRoom);
                      setRooms(updatedRooms);
                      setFilteredRooms(updatedRooms);
                      alert('✅ تم تغيير الحالة إلى متاحة');
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-right hover:bg-green-50 transition-colors flex items-center gap-2 text-gray-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  متاحة
                </button>
                <button
                  onClick={async () => {
                    if (!user) return;
                    const updatedRooms = updateRoomStatus(
                      rooms,
                      contextMenu.room.id,
                      'Maintenance' as RoomStatus,
                      user.name || user.username
                    );
                    const updatedRoom = updatedRooms.find(r => r.id === contextMenu.room.id);
                    if (updatedRoom) {
                      await saveRoomToFirebase(updatedRoom);
                      setRooms(updatedRooms);
                      setFilteredRooms(updatedRooms);
                      alert('✅ تم تغيير الحالة إلى صيانة');
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-right hover:bg-yellow-50 transition-colors flex items-center gap-2 text-gray-700"
                >
                  <Hammer className="w-4 h-4 text-yellow-600" />
                  صيانة
                </button>
              </>
            )}
            
            {(contextMenu.room.status === 'Available' || contextMenu.room.status === 'Maintenance') && (
              <button
                onClick={async () => {
                  if (!user) return;
                  const targetStatus = contextMenu.room.status === 'Available' ? 'Maintenance' : 'Available';
                  const updatedRooms = updateRoomStatus(
                    rooms,
                    contextMenu.room.id,
                    targetStatus as RoomStatus,
                    user.name || user.username
                  );
                  const updatedRoom = updatedRooms.find(r => r.id === contextMenu.room.id);
                  if (updatedRoom) {
                    await saveRoomToFirebase(updatedRoom);
                    setRooms(updatedRooms);
                    setFilteredRooms(updatedRooms);
                    alert(`✅ تم تغيير الحالة إلى ${targetStatus === 'Maintenance' ? 'صيانة' : 'متاحة'}`);
                  }
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-right hover:bg-blue-50 transition-colors flex items-center gap-2 text-gray-700"
              >
                {contextMenu.room.status === 'Available' ? (
                  <>
                    <Hammer className="w-4 h-4 text-yellow-600" />
                    صيانة
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    متاحة
                  </>
                )}
              </button>
            )}
          </div>
          
          {(contextMenu.room.status === 'Occupied' || contextMenu.room.status === 'CheckoutToday') && (
            <button
              onClick={() => {
                setIsExtendDialogOpen(true);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-right hover:bg-blue-50 transition-colors flex items-center gap-2 text-gray-700"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              تمديد الإقامة
            </button>
          )}
          
          <button
            onClick={async () => {
              setSelectedRoomForServices(contextMenu.room);
              setIsServicesHistoryOpen(true);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-right hover:bg-green-50 transition-colors flex items-center gap-2 text-gray-700"
          >
            <FileText className="w-4 h-4 text-green-600" />
            سجل الخدمات
          </button>
        </div>
      )}

      {/* ✨ Dialog تمديد الإقامة */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              تمديد الإقامة
            </DialogTitle>
            <DialogDescription>
              {contextMenu && `غرفة ${contextMenu.room.number} - ${contextMenu.room.guestName}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">عدد الأيام</label>
              <Input
                type="number"
                min="1"
                max="365"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 1)}
                className="text-right"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">ملاحظات (اختياري)</label>
              <Input
                type="text"
                value={extendNotes}
                onChange={(e) => setExtendNotes(e.target.value)}
                placeholder="سبب التمديد..."
                className="text-right"
              />
            </div>
            
            {contextMenu?.room.bookingDetails?.checkOut?.date && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="text-gray-600">
                  <strong>التاريخ الحالي:</strong> {new Date(contextMenu.room.bookingDetails.checkOut.date).toLocaleDateString('ar-SA')}
                </p>
                <p className="text-blue-600 font-semibold mt-1">
                  <strong>التاريخ الجديد:</strong> {new Date(new Date(contextMenu.room.bookingDetails.checkOut.date).setDate(new Date(contextMenu.room.bookingDetails.checkOut.date).getDate() + extendDays)).toLocaleDateString('ar-SA')}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsExtendDialogOpen(false);
                setExtendDays(1);
                setExtendNotes('');
              }}
            >
              إلغاء
            </Button>
            <Button onClick={handleExtendStay} className="bg-blue-600 hover:bg-blue-700">
              تأكيد التمديد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✨ Dialog سجل الخدمات */}
      <ServicesHistoryDialog
        room={selectedRoomForServices}
        isOpen={isServicesHistoryOpen}
        onClose={() => {
          setIsServicesHistoryOpen(false);
          setSelectedRoomForServices(null);
        }}
        getRoomServicesHistory={getRoomServicesHistory}
      />

      {/* 🔥 Early Checkout Dialog */}
      {earlyCheckoutRoom && (
        <EarlyCheckoutDialog
          isOpen={isEarlyCheckoutDialogOpen}
          onClose={() => {
            setIsEarlyCheckoutDialogOpen(false);
            setEarlyCheckoutRoom(null);
          }}
          onConfirm={async (checkoutDate: string, refundMethod: 'cash' | 'card' | 'transfer') => {
            if (!earlyCheckoutRoom || !user) return;

            try {
              console.log('💰 معالجة الخروج المبكر:', {
                roomNumber: earlyCheckoutRoom.number,
                checkoutDate,
                refundMethod
              });

              // حساب المبلغ المسترد
              const bookedCheckoutDate = new Date(earlyCheckoutRoom.bookingDetails!.checkOut.date);
              const selectedCheckoutDate = new Date(checkoutDate);
              const diffTime = Math.abs(bookedCheckoutDate.getTime() - selectedCheckoutDate.getTime());
              const unusedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const dailyRate = earlyCheckoutRoom.bookingDetails!.financial.dailyRate;
              const refundAmount = unusedDays * dailyRate;

              // 🔥 إنشاء سند صرف إذا كان هناك مبلغ مسترد
              if (refundAmount > 0 && checkoutDate === new Date().toISOString().split('T')[0] && db) {
                const paymentMethodAr = refundMethod === 'cash' ? 'نقدي' : 
                                       refundMethod === 'card' ? 'شبكة' : 'تحويل بنكي';
                
                const refundData = {
                  type: 'refund',
                  amount: refundAmount,
                  paymentMethod: refundMethod,
                  paymentMethodAr,
                  guestName: earlyCheckoutRoom.guestName,
                  roomNumber: earlyCheckoutRoom.number,
                  contractNumber: earlyCheckoutRoom.bookingDetails!.contractNumber,
                  description: `استرداد مبلغ لـ ${earlyCheckoutRoom.guestName} - خروج مبكر من غرفة ${earlyCheckoutRoom.number} - ${unusedDays} أيام غير مستخدمة`,
                  date: new Date().toISOString(),
                  createdAt: serverTimestamp(),
                  createdBy: user.name || user.username,
                  status: 'completed',
                  unusedDays,
                  originalCheckoutDate: earlyCheckoutRoom.bookingDetails!.checkOut.date,
                  actualCheckoutDate: checkoutDate
                };

                await addDoc(collection(db, 'refunds'), refundData);
                
                // إضافة في الحسابات العامة كسند صرف
                await addDoc(collection(db, 'accounting-transactions'), {
                  ...refundData,
                  category: 'refund',
                  categoryAr: 'مستردات'
                });
                
                console.log('✅ تم إنشاء سند صرف رقم:', refundData.contractNumber);
              }

              // تحديث حالة الغرفة
              const updatedRooms = updateRoomStatus(
                rooms,
                earlyCheckoutRoom.id,
                'NeedsCleaning' as RoomStatus,
                user.name || user.username,
                undefined,
                true // مسح بيانات النزيل
              );

              const updatedRoom = updatedRooms.find(r => r.id === earlyCheckoutRoom.id);
              if (updatedRoom) {
                await saveRoomToFirebase(updatedRoom);
                setRooms(updatedRooms);
                setFilteredRooms(updatedRooms);
                
                alert(`✅ تم إنهاء العقد${refundAmount > 0 ? ` وإنشاء سند صرف بمبلغ ${refundAmount} ر.س` : ''}`);
              }

              setIsEarlyCheckoutDialogOpen(false);
              setEarlyCheckoutRoom(null);
            } catch (error) {
              console.error('❌ خطأ في معالجة الخروج المبكر:', error);
              alert('حدث خطأ في معالجة الخروج المبكر');
            }
          }}
          bookedDays={earlyCheckoutRoom.bookingDetails?.numberOfDays || 0}
          actualDays={(() => {
            if (!earlyCheckoutRoom.bookingDetails) return 0;
            const checkInDate = new Date(earlyCheckoutRoom.bookingDetails.checkIn.date);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - checkInDate.getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          })()}
          contractCheckoutDate={earlyCheckoutRoom.bookingDetails?.checkOut.date || ''}
          todayDate={new Date().toISOString().split('T')[0]}
          dailyRate={earlyCheckoutRoom.bookingDetails?.financial.dailyRate || 0}
        />
      )}
      </div>
    </PermissionGuard>
  )
}