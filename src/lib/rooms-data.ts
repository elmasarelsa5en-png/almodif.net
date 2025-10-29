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
  | 'PendingCleaning';

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
    bgColor: 'bg-green-500',
    statusColor: 'text-white',
    accentColor: 'bg-green-500',
    textColor: 'text-white'
  },
  Occupied: {
    label: 'مشغولة',
    color: 'bg-red-600 text-white',
    icon: 'BedDouble',
    bgColor: 'bg-red-500',
    statusColor: 'text-white',
    accentColor: 'bg-red-500',
    textColor: 'text-white'
  },
  Maintenance: {
    label: 'تحت الصيانة',
    color: 'bg-orange-500 text-white',
    icon: 'Hammer',
    bgColor: 'bg-orange-500',
    statusColor: 'text-white',
    accentColor: 'bg-orange-500',
    textColor: 'text-white'
  },
  NeedsCleaning: {
    label: 'تحتاج تنظيف',
    color: 'bg-yellow-500 text-black',
    icon: 'Trash2',
    bgColor: 'bg-yellow-500',
    statusColor: 'text-black',
    accentColor: 'bg-yellow-500',
    textColor: 'text-black'
  },
  Reserved: {
    label: 'محجوزة',
    color: 'bg-purple-600 text-white',
    icon: 'Clock',
    bgColor: 'bg-purple-500',
    statusColor: 'text-white',
    accentColor: 'bg-purple-500',
    textColor: 'text-white'
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
  guestName?: string
): Room[] => {
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

      // إذا الغرفة أصبحت متاحة أو تحت الصيانة، نحذف جميع بيانات الحجز
      const shouldClearBooking = newStatus === 'Available' || newStatus === 'Maintenance';
      
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
        
        return {
          ...cleanRoom,
          status: newStatus,
          balance: 0, // إعادة تعيين الرصيد
          events: [newEvent, ...room.events],
          lastUpdated: new Date().toISOString()
        };
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
