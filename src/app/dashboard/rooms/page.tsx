'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
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
  X
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
  isLateCheckout
} from '@/lib/rooms-data';
// استخدام Firebase فقط - المصدر الاحترافي للبيانات
import { 
  getRoomsFromFirebase, 
  saveRoomToFirebase,
  subscribeToRooms
} from '@/lib/firebase-sync';
import AddGuestDialog from '@/components/AddGuestDialog';
import AddRoomsFromImageDialog from '@/components/AddRoomsFromImageDialog';
import GuestDataClipboard from '@/components/GuestDataClipboard';
import BookingDialog from './booking-dialog';

const ICON_MAP = {
  CheckCircle2,
  BedDouble,
  Hammer,
  Trash2,
  Clock
};

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [activeFilter, setActiveFilter] = useState<RoomStatus | 'All'>('All');
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
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isAddRoomsFromImageOpen, setIsAddRoomsFromImageOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [lateCheckoutRooms, setLateCheckoutRooms] = useState<Room[]>([]);
  const [showLateCheckoutAlert, setShowLateCheckoutAlert] = useState(false);

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

  // الفحص التلقائي لحالة الغرف بناءً على تاريخ الخروج - كل دقيقة
  useEffect(() => {
    const checkRoomsStatus = async () => {
      if (rooms.length === 0) return;
      
      console.log('🔍 فحص تلقائي لحالة الغرف...');
      
      // تحديث حالة الغرف تلقائياً
      const updatedRooms = autoUpdateRoomStatusByCheckout(rooms);
      
      // التحقق من وجود تغييرات
      const hasChanges = updatedRooms.some((room, index) => 
        room.status !== rooms[index].status
      );
      
      if (hasChanges) {
        console.log('✅ تم تحديث حالة الغرف تلقائياً');
        setRooms(updatedRooms);
        setFilteredRooms(updatedRooms);
        
        // حفظ التغييرات في Firebase
        for (const room of updatedRooms) {
          const oldRoom = rooms.find(r => r.id === room.id);
          if (oldRoom && room.status !== oldRoom.status) {
            await saveRoomToFirebase(room);
          }
        }
      }
      
      // التحقق من النزلاء المتأخرين
      const lateRooms = getLateCheckoutRooms(updatedRooms);
      setLateCheckoutRooms(lateRooms);
      
      if (lateRooms.length > 0) {
        setShowLateCheckoutAlert(true);
      }
    };
    
    // فحص فوري عند التحميل
    checkRoomsStatus();
    
    // فحص كل دقيقة
    const interval = setInterval(checkRoomsStatus, 60000);
    
    return () => clearInterval(interval);
  }, [rooms]);
  
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

  // تصفية الشقق
  useEffect(() => {
    let filtered = rooms;

    // فلتر الحالة
    if (activeFilter !== 'All') {
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

  // احصائيات الشقق
  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'Available').length,
    occupied: rooms.filter(r => r.status === 'Occupied').length,
    maintenance: rooms.filter(r => r.status === 'Maintenance').length,
    needsCleaning: rooms.filter(r => r.status === 'NeedsCleaning').length,
    reserved: rooms.filter(r => r.status === 'Reserved').length,
    pendingCleaning: rooms.filter(r => r.status === 'PendingCleaning').length,
    occupancyRate: Math.round((rooms.filter(r => r.status === 'Occupied').length / rooms.length) * 100)
  };

  // معالج تغيير حالة الشقة
  const handleStatusChange = async () => {
    if (!selectedRoom || !user) return;
    
    console.log('🔄 بدء تغيير حالة الغرفة:', selectedRoom.number, 'من', selectedRoom.status, 'إلى', newStatus);
    
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
        alert('✅ تم تغيير حالة الشقة بنجاح');
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
    
    const updatedRooms = processPayment(
      rooms,
      selectedRoom.id,
      paymentAmount,
      paymentMethod,
      user.name || user.username
    );
    
    try {
      // حفظ الغرفة المحدثة في Firebase
      const updatedRoom = updatedRooms.find(r => r.id === selectedRoom.id);
      if (updatedRoom) {
        await saveRoomToFirebase(updatedRoom);
        setRooms(updatedRooms);
        setSelectedRoom(updatedRoom);
      }
    } catch (error) {
      console.error('خطأ في حفظ الدفعة:', error);
      alert('حدث خطأ في حفظ الدفعة');
      return;
    }
    
    setIsPaymentOpen(false);
    setPaymentAmount(0);
    setPaymentMethod({ type: 'cash' });
  };

  // فتح تفاصيل الشقة - دائماً نافذة الحجز
  const openRoomDetails = (room: Room) => {
    console.log('🔵 تم الضغط على الغرفة:', room.number, 'الحالة:', room.status);
    
    setSelectedRoom(room);
    setNewStatus(room.status);
    setGuestName(room.guestName || '');
    setPaymentAmount(room.balance);
    
    // فتح نافذة الحجز مباشرة (سواء فارغة أو مشغولة)
    console.log('📋 فتح نافذة الحجز للغرفة:', room.number);
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
    
    // تحديث بيانات الغرفة
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

    // حفظ في Firebase
    await saveRoomToFirebase(updatedRooms.find(r => r.id === room.id)!);

    setRooms(updatedRooms);
    setFilteredRooms(updatedRooms);
    setIsAddGuestOpen(false);
  };

  // معالج اكتمال الحجز
  const handleBookingComplete = async (bookingData: any) => {
    if (!selectedRoom || !user) return;
    
    try {
      // تحديث بيانات الغرفة مع معلومات الحجز
      const updatedRoom: Room = {
        ...selectedRoom,
        status: 'Occupied' as RoomStatus,
        guestName: bookingData.guest.name,
        guestPhone: bookingData.guest.phone,
        guestNationality: bookingData.guest.nationality,
        guestIdType: bookingData.guest.idType,
        guestIdNumber: bookingData.guest.idNumber,
        guestIdExpiry: bookingData.guest.idExpiry,
        guestEmail: bookingData.guest.email,
        balance: bookingData.financial.remaining,
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
            description: `حجز جديد - عقد رقم: ${bookingData.contractNumber} - ${bookingData.guest.name}`,
            timestamp: new Date().toISOString(),
            user: user.name || user.username,
            newValue: 'Occupied'
          }
        ]
      };

      // حفظ في Firebase
      await saveRoomToFirebase(updatedRoom);

      // تحديث القائمة المحلية
      const updatedRooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
      setRooms(updatedRooms);
      setFilteredRooms(updatedRooms);

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
    
    // موظف النظافة يمكنه تغيير من "تحتاج تنظيف" إلى "خروج اليوم"
    // والموظفين يمكنهم تغيير من "مشغولة" إلى "خروج اليوم"
    // والموظفين يمكنهم تغيير من "خروج اليوم" إلى "تحتاج تنظيف" أو "متاحة"
    if (user.role === 'housekeeping') {
      return fromStatus === 'NeedsCleaning' && toStatus === 'PendingCleaning';
    }
    if (user.role === 'staff' || user.role === 'admin' || user.role === 'supervisor') {
      return (fromStatus === 'Occupied' && toStatus === 'PendingCleaning') ||
             (fromStatus === 'PendingCleaning' && (toStatus === 'NeedsCleaning' || toStatus === 'Available'));
    }
    
    return false;
  };

  // مكون بطاقة الشقة
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
        className={`relative group cursor-pointer transition-all duration-500 hover:scale-110 hover:rotate-1 hover:shadow-2xl hover:shadow-blue-500/30 rounded-2xl overflow-hidden ${
          imageUrl ? '' : config.bgColor
        } active:scale-95 ${isLate ? 'animate-pulse ring-4 ring-red-500' : ''}`}
        onClick={() => {
          console.log('🖱️ Click على الغرفة:', room.number);
          openRoomDetails(room);
        }}
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
        
        {imageUrl && <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors"></div>}
        <div className={`p-3 flex flex-col justify-between h-full min-h-[140px] ${isLate ? 'pt-8' : ''}`}>
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
                  <p className="text-[10px] text-yellow-300 font-bold">خروج اليوم</p>
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
            {room.guestName && (
              <div className={`text-center ${
                isCheckoutToday 
                  ? 'bg-gradient-to-r from-red-600/90 to-blue-600/90' 
                  : 'bg-gradient-to-r from-red-600/90 to-red-700/90'
              } backdrop-blur-sm p-2 rounded-lg border-2 border-white/30 shadow-xl mb-2`}>
                <p className="text-sm font-bold text-white truncate drop-shadow-md">👤 {room.guestName}</p>
                {room.guestPhone && (
                  <p className="text-xs text-white/90 truncate mt-0.5">📱 {room.guestPhone}</p>
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
            <h2 className="text-2xl font-bold text-white mb-2">غير مصرح لك</h2>
            <p className="text-gray-300 mb-6">
              ليس لديك الصلاحية لعرض صفحة الغرف
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium"
            >
              العودة للخلف
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
                    <h3 className="text-xl font-bold">⚠️ تنبيه: نزلاء متأخرين عن checkout</h3>
                    <p className="text-sm text-white/90">تأخروا عن الساعة 2 ظهراً</p>
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
                        <p className="text-lg font-bold">{room.guestName || 'نزيل غير معروف'}</p>
                        <p className="text-sm text-white/80">
                          {room.guestPhone && `📱 ${room.guestPhone}`}
                        </p>
                        <p className="text-xs text-white/70 mt-1">
                          الخروج: {room.bookingDetails?.checkOut?.date} - {room.bookingDetails?.checkOut?.time || '12:00 ظهراً'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button
                        size="sm"
                        className="bg-white text-red-600 hover:bg-white/90"
                      >
                        اتصل الآن
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 max-w-[1800px] mx-auto space-y-8 p-4 lg:p-8">
        {/* Header Section - تصميم احترافي جداً */}
        <div className="bg-gradient-to-r from-slate-800/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* العنوان */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <BedDouble className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-1">
                  إدارة الشقق - متشغولة
                </h1>
                <p className="text-blue-200/70 text-sm font-medium">
                  {activeFilter !== 'All' 
                    ? `عرض: ${ROOM_STATUS_CONFIG[activeFilter as RoomStatus]?.label}` 
                    : 'عرض جميع الشقق'}
                  {' • '}
                  {filteredRooms.length} شقة
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <HasPermission permission="add_guest">
                <Button
                  onClick={() => setIsAddGuestOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 font-bold px-6 py-6 rounded-xl hover:scale-105"
                >
                  <UserPlus className="w-5 h-5 ml-2" />
                  إضافة نزيل
                </Button>
              </HasPermission>

              <HasPermission permission="add_rooms_from_image">
                <Button
                  onClick={() => setIsAddRoomsFromImageOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 font-bold px-6 py-6 rounded-xl hover:scale-105"
                >
                  <Image className="w-5 h-5 ml-2" />
                  إضافة من صورة
                </Button>
              </HasPermission>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-300/60" />
              <Input
                placeholder="🔍 ابحث برقم الشقة أو اسم النزيل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 bg-white/10 border-2 border-white/20 text-white text-lg placeholder:text-blue-200/50 pl-16 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filter Section - تصميم أنيق */}
        <div className="bg-gradient-to-r from-slate-800/80 via-blue-900/80 to-purple-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🔽</span>
            </div>
            <h2 className="text-xl font-bold text-white">تصفية حسب الحالة</h2>
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
              عرض الكل ({stats.total})
            </Button>

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
                    {status === 'Occupied' && '🔴'}
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

        {/* Stats Cards - إحصائيات احترافية */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* متاحة */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-green-400/30"
               onClick={() => setActiveFilter('Available')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-white">{stats.available}</span>
            </div>
            <p className="text-green-50 font-bold text-sm">متاحة</p>
          </div>

          {/* مشغولة */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-red-400/30"
               onClick={() => setActiveFilter('Occupied')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BedDouble className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-white">{stats.occupied}</span>
            </div>
            <p className="text-red-50 font-bold text-sm">مشغولة</p>
          </div>

          {/* خروج اليوم */}
          <div className="bg-gradient-to-br from-red-500 via-red-600 to-blue-600 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-purple-400/30"
               onClick={() => setActiveFilter('CheckoutToday')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-white">{rooms.filter(r => r.status === 'CheckoutToday').length}</span>
            </div>
            <p className="text-white font-bold text-sm">خروج اليوم</p>
          </div>

          {/* تحتاج تنظيف */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-orange-400/30"
               onClick={() => setActiveFilter('NeedsCleaning')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-white">{stats.needsCleaning}</span>
            </div>
            <p className="text-orange-50 font-bold text-sm">تحتاج تنظيف</p>
          </div>

          {/* صيانة */}
          <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-gray-400/30"
               onClick={() => setActiveFilter('Maintenance')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Hammer className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-white">{stats.maintenance}</span>
            </div>
            <p className="text-gray-50 font-bold text-sm">تحت الصيانة</p>
          </div>

          {/* محجوزة */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-purple-400/30"
               onClick={() => setActiveFilter('Reserved')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-white">{stats.reserved}</span>
            </div>
            <p className="text-purple-50 font-bold text-sm">محجوزة</p>
          </div>
        </div>

        {/* شبكة الشقق */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {filteredRooms
            .sort((a, b) => a.number.localeCompare(b.number))
            .map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
        </div>
      </div>

      {/* نافذة تفاصيل الشقة */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg p-4 -m-6 mb-6">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BedDouble className="w-6 h-6 text-white" />
              </div>
              تفاصيل الشقة {selectedRoom?.number}
            </DialogTitle>
            <DialogDescription className="text-blue-200/80 font-medium">
              عرض وتعديل تفاصيل الشقة وحالتها
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoom && (
            <div className="space-y-6">
              {/* زر الحجز السريع للغرف المتاحة */}
              {selectedRoom && selectedRoom.status === 'Available' && (
                <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border-green-400/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">🎉 الغرفة متاحة للحجز!</h3>
                        <p className="text-sm text-green-200">يمكنك حجز هذه الغرفة للنزلاء مباشرة</p>
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
              
              {/* معلومات الشقة الحالية */}
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
                    تغيير الحالة
                  </CardTitle>
                  <CardDescription className="text-blue-200/80 text-sm">
                    اختر الحالة الجديدة للشقة من القائمة أدناه
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-blue-200 block">الحالة الجديدة</label>
                    
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
                                    {status === 'Available' && 'الشقة جاهزة للحجز'}
                                    {status === 'Occupied' && 'يوجد نزيل في الشقة'}
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
                        placeholder="أدخل اسم النزيل المقيم أو المحجوز للشقة"
                        className="border-2 border-blue-400/50 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60 text-lg p-3"
                      />
                      <p className="text-xs text-blue-200/70 mt-2">
                        {newStatus === 'Occupied' ? 'اسم النزيل المقيم حالياً في الشقة' : 'اسم الشخص الذي حجز الشقة'}
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
              تسديد المبلغ - شقة {selectedRoom?.number}
            </DialogTitle>
            <DialogDescription className="text-blue-200/80 font-medium">
              إدخال تفاصيل عملية الدفع
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
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
          
          const updatedRooms = updateRoomStatus(
            rooms,
            roomId,
            newStatus as RoomStatus,
            user.name || user.username
          );
          
          try {
            const updatedRoom = updatedRooms.find(r => r.id === roomId);
            if (updatedRoom) {
              await saveRoomToFirebase(updatedRoom);
              setRooms(updatedRooms);
              setFilteredRooms(updatedRooms);
              alert('✅ تم تغيير حالة الشقة بنجاح');
            }
          } catch (error) {
            console.error('❌ خطأ في حفظ التغييرات:', error);
            alert('حدث خطأ في حفظ التغييرات');
          }
        }}
      />

      {/* زر تحديث الصلاحيات */}
      <RefreshPermissionsButton />

      {/* حافظة بيانات النزيل العائمة */}
      <GuestDataClipboard position="bottom-left" />

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes shine {
          from {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          to {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.6);
          }
        }

        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
    </PermissionGuard>
  )
}