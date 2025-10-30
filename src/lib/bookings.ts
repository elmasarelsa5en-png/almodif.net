/**
 * Bookings Management System
 * Handles all booking-related operations and data
 */

// Booking Status Types
export type BookingStatus = 
  | 'غير مؤكدة' // Unconfirmed
  | 'قائمة' // Active
  | 'جاهز_دخول' // Ready for Check-in
  | 'جاهز_خروج' // Ready for Check-out
  | 'قادمة' // Upcoming
  | 'مكتملة' // Completed
  | 'ملغية'; // Cancelled

// Booking Source Types
export type BookingSource = 
  | 'حجز_مباشر' // Direct Booking
  | 'موقع_الكتروني' // Website
  | 'وكيل_سفر' // Travel Agent
  | 'تطبيق_الهاتف' // Mobile App
  | 'فندق_آخر'; // Other Hotel

// Room Type
export type RoomType = 
  | 'عادية' // Standard
  | 'جناح' // Suite
  | 'سويت' // Suite
  | 'فيلا' // Villa
  | 'بنتهاوس'; // Penthouse

// Payment Status
export type PaymentStatus = 
  | 'مسدد' // Paid
  | 'جزئي' // Partial
  | 'متأخر' // Pending
  | 'ملغي'; // Cancelled

// Guest Interface
export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationalId?: string; // رقم الهوية/الجواز
  passportNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Room Interface
export interface Room {
  id: string;
  name: string;
  number: string;
  type: RoomType;
  floor: number;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isActive: boolean;
}

// Price Customization Interface
export interface PriceCustomization {
  date: string; // Format: YYYY-MM-DD
  price: number;
  reason?: string;
}

// Booking Interface (Main)
export interface Booking {
  id: string;
  bookingNumber: string; // Reference number
  guestId: string;
  guestName: string;
  roomId: string;
  roomName: string;
  status: BookingStatus;
  source: BookingSource;
  
  // Dates
  checkInDate: string; // Format: YYYY-MM-DD
  checkOutDate: string; // Format: YYYY-MM-DD
  nights: number;
  
  // Pricing
  basePrice: number; // سعر الليلة الأساسي
  totalPrice: number; // الإجمالي
  paidAmount: number; // المبلغ المدفوع
  remainingBalance: number; // الرصيد المتبقي
  advancePayment?: number; // دفعة مقدمة
  priceCustomizations?: PriceCustomization[]; // تخصيص السعر لأيام معينة
  
  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod?: 'نقد' | 'شيك' | 'تحويل' | 'بطاقة'; // Cash, Check, Transfer, Card
  
  // Company Details (if applicable)
  companyName?: string;
  companyTaxId?: string;
  companyContact?: string;
  
  // Additional Info
  numberOfGuests: number;
  childrenCount?: number;
  specialRequests?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  
  // Dates
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  approvedBy?: string; // Name of person who approved
}

// Booking Statistics Interface
export interface BookingStatistics {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingPayments: number; // المدين
  collectedPayments: number; // الدائن
  occupancyRate: number; // نسبة التشغيل
  averageNightlyRate: number;
}

// Booking Filter Interface
export interface BookingFilters {
  status?: BookingStatus[];
  source?: BookingSource[];
  roomType?: RoomType[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  guestName?: string;
  bookingNumber?: string;
  paymentStatus?: PaymentStatus[];
}

// ====== STORAGE FUNCTIONS ======

/**
 * Initialize sample bookings in localStorage
 */
export function initializeSampleBookings(): void {
  if (typeof window === 'undefined') return;
  
  const existing = localStorage.getItem('bookings');
  if (existing) return;

  const sampleBookings: Booking[] = [
    {
      id: '1',
      bookingNumber: 'BK-2025-001',
      guestId: '1',
      guestName: 'محمد أحمد',
      roomId: '1',
      roomName: 'غرفة 101',
      status: 'قائمة',
      source: 'حجز_مباشر',
      checkInDate: '2025-10-19',
      checkOutDate: '2025-10-22',
      nights: 3,
      basePrice: 250,
      totalPrice: 750,
      paidAmount: 750,
      remainingBalance: 0,
      paymentStatus: 'مسدد',
      numberOfGuests: 2,
      createdAt: new Date('2025-10-15').toISOString(),
      updatedAt: new Date('2025-10-19').toISOString(),
    },
    {
      id: '2',
      bookingNumber: 'BK-2025-002',
      guestId: '2',
      guestName: 'فاطمة علي',
      roomId: '2',
      roomName: 'جناح 202',
      status: 'جاهز_دخول',
      source: 'موقع_الكتروني',
      checkInDate: '2025-10-20',
      checkOutDate: '2025-10-25',
      nights: 5,
      basePrice: 500,
      totalPrice: 2500,
      paidAmount: 1500,
      remainingBalance: 1000,
      advancePayment: 1500,
      paymentStatus: 'جزئي',
      numberOfGuests: 3,
      createdAt: new Date('2025-10-10').toISOString(),
      updatedAt: new Date('2025-10-18').toISOString(),
    },
  ];

  localStorage.setItem('bookings', JSON.stringify(sampleBookings));
  console.log('✅ Bookings initialized');
}

/**
 * Get all bookings
 */
export function getBookings(): Booking[] {
  try {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('bookings');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Error getting bookings:', error);
    return [];
  }
}

/**
 * Get single booking by ID
 */
export function getBookingById(id: string): Booking | null {
  const bookings = getBookings();
  return bookings.find(b => b.id === id) || null;
}

/**
 * Create new booking
 */
export function createBooking(booking: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt'>): Booking {
  const bookings = getBookings();
  
  // Generate booking number
  const bookingNumber = `BK-${new Date().getFullYear()}-${String(bookings.length + 1).padStart(4, '0')}`;
  
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(),
    bookingNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  bookings.push(newBooking);
  localStorage.setItem('bookings', JSON.stringify(bookings));

  return newBooking;
}

/**
 * Update booking
 */
export function updateBooking(id: string, updates: Partial<Booking>): Booking | null {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);

  if (index === -1) return null;

  const updatedBooking: Booking = {
    ...bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  bookings[index] = updatedBooking;
  localStorage.setItem('bookings', JSON.stringify(bookings));

  return updatedBooking;
}

/**
 * Delete booking
 */
export async function deleteBooking(id: string): Promise<boolean> {
  try {
    // حذف من Firebase
    const { db } = await import('@/lib/firebase');
    const { doc, deleteDoc } = await import('firebase/firestore');
    
    const bookingRef = doc(db, 'bookings', id);
    await deleteDoc(bookingRef);
    
    console.log('✅ Booking deleted from Firebase:', id);
    
    // حذف من localStorage
    const bookings = getBookings();
    const filtered = bookings.filter(b => b.id !== id);

    if (filtered.length === bookings.length) return false;

    localStorage.setItem('bookings', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    
    // حتى لو فشل Firebase، نحذف من localStorage
    const bookings = getBookings();
    const filtered = bookings.filter(b => b.id !== id);

    if (filtered.length === bookings.length) return false;

    localStorage.setItem('bookings', JSON.stringify(filtered));
    return true;
  }
}

/**
 * Filter bookings based on criteria
 */
export function filterBookings(filters: BookingFilters): Booking[] {
  let bookings = getBookings();

  // Status filter
  if (filters.status?.length) {
    bookings = bookings.filter(b => filters.status!.includes(b.status));
  }

  // Source filter
  if (filters.source?.length) {
    bookings = bookings.filter(b => filters.source!.includes(b.source));
  }

  // Room type filter
  if (filters.roomType?.length) {
    bookings = bookings.filter(b => {
      const room = localStorage.getItem(`room-${b.roomId}`);
      if (!room) return false;
      return filters.roomType!.includes(JSON.parse(room).type);
    });
  }

  // Date range filter
  if (filters.dateRange) {
    bookings = bookings.filter(b => {
      const checkIn = new Date(b.checkInDate);
      const checkOut = new Date(b.checkOutDate);
      const rangeStart = new Date(filters.dateRange!.startDate);
      const rangeEnd = new Date(filters.dateRange!.endDate);

      return (checkIn <= rangeEnd && checkOut >= rangeStart);
    });
  }

  // Guest name filter
  if (filters.guestName) {
    bookings = bookings.filter(b => 
      b.guestName.toLowerCase().includes(filters.guestName!.toLowerCase())
    );
  }

  // Booking number filter
  if (filters.bookingNumber) {
    bookings = bookings.filter(b => 
      b.bookingNumber.toLowerCase().includes(filters.bookingNumber!.toLowerCase())
    );
  }

  // Payment status filter
  if (filters.paymentStatus?.length) {
    bookings = bookings.filter(b => filters.paymentStatus!.includes(b.paymentStatus));
  }

  return bookings;
}

/**
 * Get booking statistics
 */
export function getBookingStatistics(): BookingStatistics {
  const bookings = getBookings();
  const today = new Date().toISOString().split('T')[0];

  const activeBookings = bookings.filter(b => 
    b.status === 'قائمة' && 
    b.checkOutDate > today
  );

  const completedBookings = bookings.filter(b => b.status === 'مكتملة');
  const cancelledBookings = bookings.filter(b => b.status === 'ملغية');

  const totalRevenue = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const pendingPayments = bookings.reduce((sum, b) => sum + b.remainingBalance, 0);

  return {
    totalBookings: bookings.length,
    activeBookings: activeBookings.length,
    completedBookings: completedBookings.length,
    cancelledBookings: cancelledBookings.length,
    totalRevenue,
    pendingPayments,
    collectedPayments: totalRevenue,
    occupancyRate: activeBookings.length > 0 ? (activeBookings.length / bookings.length) * 100 : 0,
    averageNightlyRate: bookings.length > 0 
      ? totalRevenue / bookings.reduce((sum, b) => sum + b.nights, 1)
      : 0,
  };
}

/**
 * Get upcoming check-ins for today
 */
export function getTodayCheckIns(): Booking[] {
  const today = new Date().toISOString().split('T')[0];
  return getBookings().filter(b => b.checkInDate === today && b.status !== 'ملغية');
}

/**
 * Get upcoming check-outs for today
 */
export function getTodayCheckOuts(): Booking[] {
  const today = new Date().toISOString().split('T')[0];
  return getBookings().filter(b => b.checkOutDate === today && b.status !== 'ملغية');
}

/**
 * Get upcoming bookings for next 7 days
 */
export function getUpcomingBookings(days: number = 7): Booking[] {
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

  return getBookings().filter(b => {
    const checkInDate = new Date(b.checkInDate);
    return checkInDate >= today && checkInDate <= futureDate && b.status !== 'ملغية';
  });
}

/**
 * Calculate booking statistics by period
 */
export function getBookingStatisticsByPeriod(startDate: string, endDate: string) {
  const bookings = filterBookings({
    dateRange: { startDate, endDate }
  });

  return {
    count: bookings.length,
    revenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
    nights: bookings.reduce((sum, b) => sum + b.nights, 0),
    guests: bookings.reduce((sum, b) => sum + b.numberOfGuests, 0),
  };
}

/**
 * Export bookings to CSV
 */
export function exportBookingsToCSV(bookings: Booking[]): string {
  const headers = ['رقم الحجز', 'الضيف', 'الغرفة', 'الحالة', 'تاريخ الدخول', 'تاريخ الخروج', 'الليالي', 'الإجمالي', 'المدفوع', 'الرصيد'];
  
  const rows = bookings.map(b => [
    b.bookingNumber,
    b.guestName,
    b.roomName,
    b.status,
    b.checkInDate,
    b.checkOutDate,
    b.nights,
    b.totalPrice,
    b.paidAmount,
    b.remainingBalance,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
}

/**
 * Export bookings to JSON
 */
export function exportBookingsToJSON(bookings: Booking[]): string {
  return JSON.stringify(bookings, null, 2);
}
