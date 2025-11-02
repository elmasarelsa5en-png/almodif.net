// مفتاح التخزين الرئيسي
export const ROOMS_STORAGE_KEY = 'hotel_rooms_data';

// أنواع البيانات
export interface RoomEvent {
  id: string;
  type: 'status_change' | 'payment' | 'check_in' | 'check_out' | 'service_request';
  description: string;
  timestamp: string;
  user: string;
  oldValue?: string;
  newValue?: string;
  amount?: number;
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: string;
  status: RoomStatus;
  price?: number; // السعر اليومي الافتراضي
  guestName?: string;
  guestPhone?: string;
  guestNationality?: string;
  guestIdType?: string;
  guestIdNumber?: string;
  guestIdExpiry?: string;
  guestEmail?: string;
  guestWorkPhone?: string;
  guestAddress?: string;
  guestNotes?: string;
  balance: number;
  
  // نظام تتبع الديون التلقائي
  currentDebt: number; // إجمالي الديون الحالية (إقامة + خدمات)
  roomDebt: number; // دين الإقامة فقط
  servicesDebt: number; // دين الخدمات (منيو، مطعم، مقهى، مغسلة)
  lastDebtUpdate?: string; // آخر تحديث للدين
  debtStartDate?: string; // تاريخ بدء احتساب الدين
  
  // معلومات التأخير عن موعد الخروج
  overdueInfo?: {
    daysOverdue: number; // عدد الأيام المتأخرة
    extraDebt: number; // المديونية الإضافية
    originalCheckoutDate: string; // تاريخ الخروج الأصلي
  };
  
  payments: {
    id: string;
    amount: number;
    date: string;
    time: string;
    method: 'cash' | 'card' | 'transfer';
    receiptNumber?: string;
    paidBy: string; // اسم الموظف
    note?: string;
  }[];
  
  bookingDetails?: {
    contractNumber: string;
    bookingSource: string;
    rentalType: 'daily' | 'monthly';
    checkIn: {
      date: string;
      time: string;
    };
    checkOut: {
      date: string;
      time: string;
    };
    numberOfDays: number;
    visitType: string;
    company?: any;
    companions?: any[];
    financial: {
      dailyRate: number;
      totalAmount: number;
      deposits: number[];
      advancePayments: number[];
      totalDeposits: number;
      totalAdvance: number;
      remaining: number;
    };
    createdAt: string;
    createdBy: string;
    guestSignature?: string; // التوقيع الإلكتروني للنزيل (base64)
  };
  events: RoomEvent[];
  lastUpdated: string;
}

export type RoomStatus = 
  | 'Available'
  | 'Occupied' 
  | 'Maintenance'
  | 'NeedsCleaning'
  | 'Reserved'
  | 'CheckoutToday'
  | 'Overdue'; // ← شقق متأخرة عن موعد الخروج

export interface PaymentMethod {
  type: 'cash' | 'card' | 'transfer';
  cardType?: string;
  receiptNumber?: string;
}

// إعدادات حالات الشقق
export const ROOM_STATUS_CONFIG = {
  Available: {
    label: 'متاحة',
    color: 'bg-green-600 text-white',
    icon: 'CheckCircle2',
    bgColor: 'bg-green-600',
    statusColor: 'text-white',
    accentColor: 'bg-green-500',
    textColor: 'text-white',
    description: 'الشقة متاحة للحجز'
  },
  Occupied: {
    label: 'مشغولة',
    color: 'bg-cyan-600 text-white',
    icon: 'BedDouble',
    bgColor: 'bg-cyan-600',
    statusColor: 'text-white',
    accentColor: 'bg-cyan-500',
    textColor: 'text-white',
    description: 'يوجد نزيل في الشقة'
  },
  CheckoutToday: {
    label: 'خروج اليوم',
    color: 'bg-gradient-to-br from-red-500 via-red-600 to-blue-600 text-white',
    icon: 'Clock',
    bgColor: 'bg-gradient-to-r from-red-500 to-blue-600',
    statusColor: 'text-white',
    accentColor: 'bg-gradient-to-r from-red-500 to-blue-600',
    textColor: 'text-white',
    description: 'موعد خروج النزيل اليوم'
  },
  Overdue: {
    label: 'متأخرة',
    color: 'bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white animate-pulse',
    icon: 'AlertTriangle',
    bgColor: 'bg-gradient-to-r from-red-700 to-red-900',
    statusColor: 'text-white',
    accentColor: 'bg-gradient-to-r from-red-700 to-red-900',
    textColor: 'text-white',
    description: 'متأخرة عن موعد الخروج - يوجد مديونية إضافية'
  },
  Maintenance: {
    label: 'تحت الصيانة',
    color: 'bg-gray-600 text-white',
    icon: 'Hammer',
    bgColor: 'bg-gray-600',
    statusColor: 'text-white',
    accentColor: 'bg-gray-500',
    textColor: 'text-white',
    description: 'الشقة تحتاج صيانة'
  },
  NeedsCleaning: {
    label: 'تحتاج تنظيف',
    color: 'bg-orange-600 text-white',
    icon: 'Trash2',
    bgColor: 'bg-orange-600',
    statusColor: 'text-white',
    accentColor: 'bg-orange-500',
    textColor: 'text-white',
    description: 'تحتاج إلى تنظيف'
  },
  Reserved: {
    label: 'محجوزة',
    color: 'bg-purple-600 text-white',
    icon: 'Clock',
    bgColor: 'bg-purple-600',
    statusColor: 'text-white',
    accentColor: 'bg-purple-500',
    textColor: 'text-white',
    description: 'محجوزة ولم يصل النزيل'
  },
  PendingCleaning: {
    label: 'خروج اليوم',
    color: 'bg-gradient-to-br from-red-600 to-blue-600 text-white',
    icon: 'Clock',
    bgColor: 'bg-blue-500', // Fallback for icon
    statusColor: 'text-white',
    accentColor: 'bg-blue-500', // Fallback for icon
    textColor: 'text-white'
  }
} as const;

// إعدادات أنواع الشقق
export const ROOM_TYPE_CONFIG = {
  'غرفة وصالة': {
    label: 'غرفة وصالة',
    color: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
    borderColor: 'border-blue-500',
    icon: 'Home'
  },
  'غرفتين وصالة': {
    label: 'غرفتين وصالة',
    color: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white',
    borderColor: 'border-purple-500',
    icon: 'Home'
  },
  'ثلاث غرف وصالة': {
    label: 'ثلاث غرف وصالة',
    color: 'bg-gradient-to-r from-green-400 to-green-600 text-white',
    borderColor: 'border-green-500',
    icon: 'Home'
  },
  'استوديو': {
    label: 'استوديو',
    color: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white',
    borderColor: 'border-orange-500',
    icon: 'Home'
  },
  'VIP': {
    label: 'VIP',
    color: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black',
    borderColor: 'border-yellow-500',
    icon: 'Star'
  },
  'غرفتين بدون صالة': {
    label: 'غرفتين بدون صالة',
    color: 'bg-gradient-to-r from-teal-400 to-cyan-600 text-white',
    borderColor: 'border-teal-500',
    icon: 'Home'
  },
  'غرفتين وصالة كبيرة': {
    label: 'غرفتين وصالة كبيرة',
    color: 'bg-gradient-to-r from-pink-400 to-rose-600 text-white',
    borderColor: 'border-pink-500',
    icon: 'Home'
  },
  'غرفة': {
    label: 'غرفة',
    color: 'bg-gradient-to-r from-slate-400 to-slate-600 text-white',
    borderColor: 'border-slate-500',
    icon: 'Home'
  }
} as const;

// بيانات الشقق الأولية - تبدأ فاضية
export const generateInitialRooms = (): Room[] => {
  // التطبيق يبدأ بدون أي بيانات وهمية
  // المستخدم يضيف الشقق والبيانات بنفسه
  return [];
};

// دوال إدارة البيانات
export const getRoomsFromStorage = (): Room[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(ROOMS_STORAGE_KEY);
  if (stored) {
    try {
      const rooms = JSON.parse(stored);
      // التحقق من وجود بيانات قديمة تحتاج تحديث
      if (rooms.length > 0 && rooms[0].status === 'NeedsCleaning') {
        // مسح البيانات القديمة وإنشاء جديدة
        localStorage.removeItem(ROOMS_STORAGE_KEY);
        const initialRooms = generateInitialRooms();
        localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(initialRooms));
        return initialRooms;
      }
      return rooms;
    } catch (error) {
      console.error('Error parsing rooms data:', error);
    }
  }

  // إذا لم توجد بيانات، إنشاء بيانات أولية
  const initialRooms = generateInitialRooms();
  localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(initialRooms));
  return initialRooms;
};export const saveRoomsToStorage = (rooms: Room[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
};

export const resetRoomsData = (): Room[] => {
  if (typeof window === 'undefined') return [];
  localStorage.removeItem(ROOMS_STORAGE_KEY);
  const initialRooms = generateInitialRooms();
  localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(initialRooms));
  return initialRooms;
};

export const getRoomTypesFromStorage = (): any[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('hotelRoomTypes');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing room types data:', error);
    }
  }
  // البدء بدون أي أنواع غرف وهمية - المستخدم يضيف أنواع الغرف بنفسه
  return [];
};

export const updateRoomStatus = (
  rooms: Room[],
  roomId: string,
  newStatus: RoomStatus,
  user: string,
  guestName?: string,
  clearGuestData: boolean = false
): Room[] => {
  console.log('🔧 updateRoomStatus v4.0 - مع الحفاظ على بيانات النزيل');
  return rooms.map(room => {
    if (room.id === roomId) {
      const oldStatus = room.status;
      const newEvent: RoomEvent = {
        id: `event-${Date.now()}`,
        type: 'status_change',
        description: `تم تغيير الحالة من ${ROOM_STATUS_CONFIG[oldStatus].label} إلى ${ROOM_STATUS_CONFIG[newStatus].label}`,
        timestamp: new Date().toISOString(),
        user,
        oldValue: oldStatus,
        newValue: newStatus
      };

      // نمسح بيانات النزيل فقط إذا طُلب ذلك صراحةً (clearGuestData = true)
      // أو إذا كانت الحالة الجديدة Maintenance (لأن الغرفة في الصيانة)
      const shouldClearBooking = clearGuestData || newStatus === 'Maintenance';
      
      console.log('📊 تغيير الحالة:', {
        roomId: room.number,
        oldStatus,
        newStatus,
        shouldClearBooking
      });
      
      if (shouldClearBooking) {
        // إنشاء غرفة جديدة بدون بيانات الحجز
        const { 
          guestName, 
          guestPhone, 
          guestNationality, 
          guestIdType, 
          guestIdNumber, 
          guestIdExpiry, 
          guestEmail, 
          guestWorkPhone, 
          guestAddress, 
          guestNotes, 
          bookingDetails,
          ...cleanRoom 
        } = room;
        
        const newRoom = {
          ...cleanRoom,
          status: newStatus,
          balance: 0, // إعادة تعيين الرصيد
          events: [newEvent, ...room.events],
          lastUpdated: new Date().toISOString()
        };
        
        console.log('✅ تنظيف كامل للغرفة - الحقول المحذوفة:', {
          hadGuestName: !!guestName,
          hadBookingDetails: !!bookingDetails,
          newRoomHasGuestName: !!(newRoom as any).guestName
        });
        
        return newRoom;
      } else {
        // الغرفة محجوزة أو مشغولة
        const updatedRoom: Room = {
          ...room,
          status: newStatus,
          events: [newEvent, ...room.events],
          lastUpdated: new Date().toISOString()
        };
        
        if (newStatus === 'Occupied' || newStatus === 'Reserved') {
          updatedRoom.guestName = guestName || room.guestName;
        }
        
        return updatedRoom;
      }
    }
    return room;
  });
};

export const processPayment = (
  rooms: Room[],
  roomId: string,
  amount: number,
  paymentMethod: PaymentMethod,
  user: string
): Room[] => {
  return rooms.map(room => {
    if (room.id === roomId) {
      const newEvent: RoomEvent = {
        id: `event-${Date.now()}`,
        type: 'payment',
        description: `تم دفع مبلغ ${amount} ر.س عبر ${getPaymentMethodText(paymentMethod)}`,
        timestamp: new Date().toISOString(),
        user,
        amount
      };

      return {
        ...room,
        balance: Math.max(0, room.balance - amount),
        events: [newEvent, ...room.events],
        lastUpdated: new Date().toISOString()
      };
    }
    return room;
  });
};

const getPaymentMethodText = (method: PaymentMethod): string => {
  switch (method.type) {
    case 'cash': return 'النقد';
    case 'card': return `البطاقة (${method.cardType})`;
    case 'transfer': return 'التحويل البنكي';
    default: return method.type;
  }
};

/**
 * التحقق من ما إذا كان checkout اليوم
 * @param checkoutDate تاريخ الخروج من bookingDetails
 * @returns true إذا كان الخروج اليوم
 */
export const isCheckoutToday = (checkoutDate: string): boolean => {
  if (!checkoutDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkout = new Date(checkoutDate);
  checkout.setHours(0, 0, 0, 0);
  
  return today.getTime() === checkout.getTime();
};

/**
 * التحقق من تأخر الـ checkout (بعد الساعة 2 ظهراً)
 * @param checkoutDate تاريخ الخروج من bookingDetails
 * @returns true إذا كان الخروج اليوم وتأخر عن الساعة 2 ظهراً
 */
export const isLateCheckout = (checkoutDate: string): boolean => {
  if (!isCheckoutToday(checkoutDate)) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // بعد الساعة 2 ظهراً (14:00)
  return currentHour >= 14;
};

/**
 * التحقق من تجاوز تاريخ الخروج (Overdue Checkout)
 * @param checkoutDate تاريخ الخروج من bookingDetails
 * @returns عدد الأيام المتأخرة (0 = لم يتأخر، 1+ = متأخر)
 */
export const getDaysOverdue = (checkoutDate: string): number => {
  if (!checkoutDate) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkout = new Date(checkoutDate);
  checkout.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - checkout.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

/**
 * التحقق إذا كانت الشقة متأخرة عن موعد الخروج
 * @param checkoutDate تاريخ الخروج
 * @returns true إذا كان التاريخ الحالي بعد تاريخ الخروج
 */
export const isOverdueCheckout = (checkoutDate: string): boolean => {
  return getDaysOverdue(checkoutDate) > 0;
};

/**
 * تحديث حالة الغرف تلقائياً بناءً على تاريخ الخروج
 * @param rooms قائمة الغرف
 * @returns قائمة الغرف المحدثة
 */
export const autoUpdateRoomStatusByCheckout = (rooms: Room[]): Room[] => {
  return rooms.map(room => {
    // فقط الغرف المشغولة التي لها تاريخ خروج
    if (room.status === 'Occupied' && room.bookingDetails?.checkOut?.date) {
      const checkoutDate = room.bookingDetails.checkOut.date;
      const daysOverdue = getDaysOverdue(checkoutDate);
      
      // إذا متأخر عن موعد الخروج بيوم أو أكثر
      if (daysOverdue > 0) {
        console.log(`⚠️ تحديث تلقائي: الغرفة ${room.number} - متأخرة ${daysOverdue} يوم`);
        
        // حساب المديونية الإضافية للأيام المتأخرة
        const extraDebt = daysOverdue * (room.price || 0);
        const currentServicesDebt = room.servicesDebt || 0;
        const currentRoomDebt = room.roomDebt || 0;
        
        return {
          ...room,
          status: 'Overdue' as RoomStatus, // حالة جديدة للشقق المتأخرة
          roomDebt: currentRoomDebt + extraDebt,
          currentDebt: currentRoomDebt + extraDebt + currentServicesDebt,
          overdueInfo: {
            daysOverdue,
            extraDebt,
            originalCheckoutDate: checkoutDate,
          },
          lastUpdated: new Date().toISOString(),
          lastDebtUpdate: new Date().toISOString()
        };
      }
      
      // إذا الخروج اليوم
      if (isCheckoutToday(checkoutDate)) {
        console.log(`🔄 تحديث تلقائي: الغرفة ${room.number} - الخروج اليوم`);
        return {
          ...room,
          status: 'CheckoutToday' as RoomStatus,
          lastUpdated: new Date().toISOString()
        };
      }
    }
    
    // إذا كانت الغرفة CheckoutToday لكن التاريخ مختلف، نرجعها لـ Occupied أو Overdue
    if (room.status === 'CheckoutToday' && room.bookingDetails?.checkOut?.date) {
      const checkoutDate = room.bookingDetails.checkOut.date;
      const daysOverdue = getDaysOverdue(checkoutDate);
      
      if (daysOverdue > 0) {
        console.log(`⚠️ تحديث تلقائي: الغرفة ${room.number} - تحويل لمتأخرة`);
        const extraDebt = daysOverdue * (room.price || 0);
        const currentServicesDebt = room.servicesDebt || 0;
        const currentRoomDebt = room.roomDebt || 0;
        
        return {
          ...room,
          status: 'Overdue' as RoomStatus,
          roomDebt: currentRoomDebt + extraDebt,
          currentDebt: currentRoomDebt + extraDebt + currentServicesDebt,
          overdueInfo: {
            daysOverdue,
            extraDebt,
            originalCheckoutDate: checkoutDate,
          },
          lastUpdated: new Date().toISOString(),
          lastDebtUpdate: new Date().toISOString()
        };
      }
      
      if (!isCheckoutToday(checkoutDate)) {
        console.log(`🔄 تحديث تلقائي: الغرفة ${room.number} - إرجاع لـ مشغولة`);
        return {
          ...room,
          status: 'Occupied' as RoomStatus,
          lastUpdated: new Date().toISOString()
        };
      }
    }
    
    return room;
  });
};

/**
 * الحصول على قائمة النزلاء المتأخرين عن checkout
 * @param rooms قائمة الغرف
 * @returns قائمة الغرف المتأخرة
 */
export const getLateCheckoutRooms = (rooms: Room[]): Room[] => {
  return rooms.filter(room => {
    // الغرف اللي الخروج بتاعها اليوم وبعد الساعة 2 ظهراً
    if (room.status === 'CheckoutToday' && room.bookingDetails?.checkOut?.date) {
      return isLateCheckout(room.bookingDetails.checkOut.date);
    }
    return false;
  });
};

/**
 * الحصول على قائمة الشقق المتأخرة عن موعد الخروج (Overdue)
 * @param rooms قائمة الغرف
 * @returns قائمة الغرف المتأخرة مع عدد الأيام
 */
export const getOverdueRooms = (rooms: Room[]): Array<Room & { daysOverdue: number }> => {
  return rooms
    .filter(room => {
      if ((room.status === 'Occupied' || room.status === 'Overdue' || room.status === 'CheckoutToday') && 
          room.bookingDetails?.checkOut?.date) {
        return isOverdueCheckout(room.bookingDetails.checkOut.date);
      }
      return false;
    })
    .map(room => ({
      ...room,
      daysOverdue: getDaysOverdue(room.bookingDetails!.checkOut!.date)
    }));
};
