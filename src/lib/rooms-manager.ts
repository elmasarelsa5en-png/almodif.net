import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';

export interface RoomData {
  id?: string;
  name: string;
  nameEn?: string;
  type: 'غرفة' | 'جناح' | 'شقة' | 'فيلا';
  description: string;
  area: number;
  maxGuests: number;
  beds: {
    single: number;
    double: number;
    sofa: number;
  };
  price: {
    daily: number;
    weekly?: number;
    monthly?: number;
  };
  amenities: string[];
  images: Array<{ id: string; url: string; caption?: string }>;
  features: {
    bathroom: boolean;
    kitchen: boolean;
    balcony: boolean;
    view: string;
  };
  available: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// Sync localStorage rooms to Firebase
export async function syncRoomsToFirebase() {
  try {
    const localRooms = localStorage.getItem('hotelRooms');
    if (!localRooms) return;

    const rooms: RoomData[] = JSON.parse(localRooms);
    
    for (const room of rooms) {
      // Check if room exists in Firebase
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('name', '==', room.name));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Add new room
        await addDoc(collection(db, 'rooms'), {
          ...room,
          status: room.available ? 'available' : 'unavailable',
          pricePerNight: room.price.daily,
          capacity: room.maxGuests,
          number: room.name, // استخدام الاسم كرقم
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } else {
        // Update existing room
        const roomDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'rooms', roomDoc.id), {
          ...room,
          status: room.available ? 'available' : 'unavailable',
          pricePerNight: room.price.daily,
          capacity: room.maxGuests,
          number: room.name,
          updatedAt: Timestamp.now()
        });
      }
    }
    
    console.log('✅ Rooms synced to Firebase successfully');
    return true;
  } catch (error) {
    console.error('❌ Error syncing rooms to Firebase:', error);
    return false;
  }
}

// Get available rooms for booking
export async function getAvailableRooms() {
  try {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('available', '==', true));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RoomData & { id: string }));
  } catch (error) {
    console.error('Error getting available rooms:', error);
    return [];
  }
}

// Subscribe to rooms changes
export function subscribeToRooms(callback: (rooms: RoomData[]) => void) {
  const roomsRef = collection(db, 'rooms');
  
  return onSnapshot(roomsRef, (snapshot) => {
    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RoomData & { id: string }));
    
    callback(rooms);
  });
}

// Check room availability for dates
export async function checkRoomAvailability(
  roomId: string, 
  checkIn: Date, 
  checkOut: Date
): Promise<boolean> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('roomId', '==', roomId),
      where('status', 'in', ['confirmed', 'pending'])
    );
    
    const snapshot = await getDocs(q);
    
    // Check if dates overlap with existing bookings
    for (const doc of snapshot.docs) {
      const booking = doc.data();
      const bookingCheckIn = booking.checkInDate.toDate();
      const bookingCheckOut = booking.checkOutDate.toDate();
      
      // Check for overlap
      if (
        (checkIn >= bookingCheckIn && checkIn < bookingCheckOut) ||
        (checkOut > bookingCheckIn && checkOut <= bookingCheckOut) ||
        (checkIn <= bookingCheckIn && checkOut >= bookingCheckOut)
      ) {
        return false; // Room is not available
      }
    }
    
    return true; // Room is available
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
}

// Get room pricing from calendar
export function getRoomPriceForDate(roomId: string, date: Date): number {
  try {
    const calendarData = localStorage.getItem('calendar_prices');
    if (!calendarData) return 0;
    
    const prices = JSON.parse(calendarData);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayPrice = prices.find((p: any) => 
      p.date === dateStr && p.roomTypeId === roomId
    );
    
    if (dayPrice && dayPrice.platforms) {
      // Get website platform price
      const websitePrice = dayPrice.platforms.find((p: any) => p.platformId === 'website');
      return websitePrice?.price || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting price from calendar:', error);
    return 0;
  }
}
