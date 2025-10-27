// Database operations for Firebase Firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  ROOMS: 'rooms',
  BOOKINGS: 'bookings',
  GUESTS: 'guests',
  INVOICES: 'invoices',
  PAYMENTS: 'payments',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications'
};

// Generic CRUD operations
export class DatabaseService {
  // Create document
  static async create(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Read document by ID
  static async getById(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...(data as any) };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Update document
  static async update(collectionName: string, id: string, data: any) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete document
  static async delete(collectionName: string, id: string) {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Get all documents from collection
  static async getAll(collectionName: string, orderByField = 'createdAt', limitCount?: number) {
    try {
      let q = query(collection(db, collectionName), orderBy(orderByField, 'desc'));

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const documents: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          documents.push({ id: doc.id, ...(data as any) });
        }
      });

      return documents;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  // Query documents with conditions
  static async query(collectionName: string, conditions: any[] = [], orderByField = 'createdAt') {
    try {
      let q: any = collection(db, collectionName);

      // Apply where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });

      // Apply ordering
      q = query(q, orderBy(orderByField, 'desc'));

      const querySnapshot = await getDocs(q);
      const documents: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          documents.push({ id: doc.id, ...(data as any) });
        }
      });

      return documents;
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }

  // Real-time listener
  static listenToCollection(collectionName: string, callback: (documents: any[]) => void, orderByField = 'createdAt') {
    try {
      const q = query(collection(db, collectionName), orderBy(orderByField, 'desc'));

      return onSnapshot(q, (querySnapshot) => {
        const documents: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data) {
            documents.push({ id: doc.id, ...(data as any) });
          }
        });
        callback(documents);
      });
    } catch (error) {
      console.error('Error setting up listener:', error);
      throw error;
    }
  }
}

// Specific collection services
export class UserService extends DatabaseService {
  static async createUser(userData: any) {
    return this.create(COLLECTIONS.USERS, userData);
  }

  static async getUserById(id: string) {
    return this.getById(COLLECTIONS.USERS, id);
  }

  static async getUserByUsername(username: string) {
    const users = await this.query(COLLECTIONS.USERS, [
      { field: 'name', operator: '==', value: username }
    ]);
    return users.length > 0 ? users[0] : null;
  }

  static async updateUser(id: string, userData: any) {
    return this.update(COLLECTIONS.USERS, id, userData);
  }

  static async getAllUsers() {
    return this.getAll(COLLECTIONS.USERS);
  }
}

export class RoomService extends DatabaseService {
  static async createRoom(roomData: any) {
    return this.create(COLLECTIONS.ROOMS, roomData);
  }

  static async getRoomById(id: string) {
    return this.getById(COLLECTIONS.ROOMS, id);
  }

  static async updateRoom(id: string, roomData: any) {
    return this.update(COLLECTIONS.ROOMS, id, roomData);
  }

  static async getAllRooms() {
    return this.getAll(COLLECTIONS.ROOMS);
  }

  static async getAvailableRooms() {
    return this.query(COLLECTIONS.ROOMS, [
      { field: 'status', operator: '==', value: 'available' }
    ]);
  }
}

export class BookingService extends DatabaseService {
  static async createBooking(bookingData: any) {
    return this.create(COLLECTIONS.BOOKINGS, bookingData);
  }

  static async getBookingById(id: string) {
    return this.getById(COLLECTIONS.BOOKINGS, id);
  }

  static async updateBooking(id: string, bookingData: any) {
    return this.update(COLLECTIONS.BOOKINGS, id, bookingData);
  }

  static async getAllBookings() {
    return this.getAll(COLLECTIONS.BOOKINGS);
  }

  static async getBookingsByRoom(roomId: string) {
    return this.query(COLLECTIONS.BOOKINGS, [
      { field: 'roomId', operator: '==', value: roomId }
    ]);
  }
}

export class GuestService extends DatabaseService {
  static async createGuest(guestData: any) {
    return this.create(COLLECTIONS.GUESTS, guestData);
  }

  static async getGuestById(id: string) {
    return this.getById(COLLECTIONS.GUESTS, id);
  }

  static async updateGuest(id: string, guestData: any) {
    return this.update(COLLECTIONS.GUESTS, id, guestData);
  }

  static async getAllGuests() {
    return this.getAll(COLLECTIONS.GUESTS);
  }

  static async searchGuests(searchTerm: string) {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - you might want to use Algolia or ElasticSearch for better search
    return this.query(COLLECTIONS.GUESTS, [
      { field: 'name', operator: '>=', value: searchTerm },
      { field: 'name', operator: '<=', value: searchTerm + '\uf8ff' }
    ]);
  }
}

export class InvoiceService extends DatabaseService {
  static async createInvoice(invoiceData: any) {
    return this.create(COLLECTIONS.INVOICES, invoiceData);
  }

  static async getInvoiceById(id: string) {
    return this.getById(COLLECTIONS.INVOICES, id);
  }

  static async updateInvoice(id: string, invoiceData: any) {
    return this.update(COLLECTIONS.INVOICES, id, invoiceData);
  }

  static async getAllInvoices() {
    return this.getAll(COLLECTIONS.INVOICES);
  }

  static async getInvoicesByGuest(guestId: string) {
    return this.query(COLLECTIONS.INVOICES, [
      { field: 'guestId', operator: '==', value: guestId }
    ]);
  }

  static async getPendingInvoices() {
    return this.query(COLLECTIONS.INVOICES, [
      { field: 'status', operator: '==', value: 'pending' }
    ]);
  }
}

export class PaymentService extends DatabaseService {
  static async createPayment(paymentData: any) {
    return this.create(COLLECTIONS.PAYMENTS, paymentData);
  }

  static async getPaymentById(id: string) {
    return this.getById(COLLECTIONS.PAYMENTS, id);
  }

  static async updatePayment(id: string, paymentData: any) {
    return this.update(COLLECTIONS.PAYMENTS, id, paymentData);
  }

  static async getAllPayments() {
    return this.getAll(COLLECTIONS.PAYMENTS);
  }

  static async getPaymentsByInvoice(invoiceId: string) {
    return this.query(COLLECTIONS.PAYMENTS, [
      { field: 'invoiceId', operator: '==', value: invoiceId }
    ]);
  }

  static async getPaymentsByDateRange(startDate: Date, endDate: Date) {
    return this.query(COLLECTIONS.PAYMENTS, [
      { field: 'date', operator: '>=', value: Timestamp.fromDate(startDate) },
      { field: 'date', operator: '<=', value: Timestamp.fromDate(endDate) }
    ]);
  }
}

export class NotificationService extends DatabaseService {
  static async createNotification(notificationData: any) {
    return this.create(COLLECTIONS.NOTIFICATIONS, notificationData);
  }

  static async getNotificationById(id: string) {
    return this.getById(COLLECTIONS.NOTIFICATIONS, id);
  }

  static async updateNotification(id: string, notificationData: any) {
    return this.update(COLLECTIONS.NOTIFICATIONS, id, notificationData);
  }

  static async getAllNotifications() {
    return this.getAll(COLLECTIONS.NOTIFICATIONS);
  }

  static async getUnreadNotifications() {
    return this.query(COLLECTIONS.NOTIFICATIONS, [
      { field: 'read', operator: '==', value: false }
    ]);
  }

  static async markAsRead(id: string) {
    return this.update(COLLECTIONS.NOTIFICATIONS, id, { read: true });
  }
}

// Settings service for app configuration
export class SettingsService extends DatabaseService {
  static async getSettings() {
    const settings = await this.getAll(COLLECTIONS.SETTINGS);
    return settings.length > 0 ? settings[0] : null;
  }

  static async updateSettings(settingsData: any) {
    const currentSettings = await this.getSettings();
    if (currentSettings) {
      return this.update(COLLECTIONS.SETTINGS, currentSettings.id, settingsData);
    } else {
      return this.create(COLLECTIONS.SETTINGS, settingsData);
    }
  }
}

// Utility functions
export const initializeDefaultData = async () => {
  try {
    // Create default settings if they don't exist
    const settings = await SettingsService.getSettings();
    if (!settings) {
      await DatabaseService.create(COLLECTIONS.SETTINGS, {
        hotelName: 'فندق الموديف',
        currency: 'EGP',
        language: 'ar',
        timezone: 'Africa/Cairo',
        checkInTime: '14:00',
        checkOutTime: '12:00'
      });
    }

    console.log('Default data initialized successfully');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};