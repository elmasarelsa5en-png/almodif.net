// Firebase Data Management Library
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Collections
export const COLLECTIONS = {
  EMPLOYEES: 'employees',
  REQUESTS: 'guest-requests',
  COFFEE_ORDERS: 'coffee-orders',
  LAUNDRY_REQUESTS: 'laundry-requests',
  RESTAURANT_ORDERS: 'restaurant-orders',
  ROOMS: 'rooms',
  BOOKINGS: 'bookings',
  AUDIT_LOG: 'audit-log',
  SOUND_SETTINGS: 'sound-settings',
  REQUEST_TYPES: 'request-types',
  NOTIFICATIONS: 'notifications',
  MENU_ITEMS: 'menu-items',
};

// ==================== EMPLOYEES ====================

export interface Employee {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  phone?: string;
  status: 'available' | 'busy' | 'offline';
  createdAt: string;
  updatedAt?: string;
  permissions?: string[];
}

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
  } catch (error) {
    console.error('Error getting employees:', error);
    return [];
  }
};

// Get single employee
export const getEmployee = async (id: string): Promise<Employee | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.EMPLOYEES, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Employee;
    }
    return null;
  } catch (error) {
    console.error('Error getting employee:', error);
    return null;
  }
};

// Add employee
export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<string | null> => {
  try {
    const docRef = doc(collection(db, COLLECTIONS.EMPLOYEES));
    await setDoc(docRef, {
      ...employee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding employee:', error);
    return null;
  }
};

// Update employee
export const updateEmployee = async (id: string, data: Partial<Employee>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.EMPLOYEES, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating employee:', error);
    return false;
  }
};

// Delete employee
export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.EMPLOYEES, id));
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
};

// Listen to employees changes
export const subscribeToEmployees = (callback: (employees: Employee[]) => void) => {
  const unsubscribe = onSnapshot(
    collection(db, COLLECTIONS.EMPLOYEES),
    (snapshot) => {
      const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      callback(employees);
    },
    (error) => {
      console.error('Error listening to employees:', error);
    }
  );
  return unsubscribe;
};

// ==================== GUEST REQUESTS ====================

export interface GuestRequest {
  id: string;
  room: string;
  guest: string;
  type: string;
  description?: string; // إضافة الوصف
  notes?: string;
  items?: string[];
  phone?: string; // إضافة رقم الهاتف
  priority?: 'low' | 'medium' | 'high'; // إضافة الأولوية
  linkedSection?: 'coffee' | 'laundry' | 'restaurant';
  linkedOrderId?: string;
  status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'completed' | 'awaiting_employee_approval'; // إضافة الحالات المفقودة
  employeeApprovalStatus?: 'pending' | 'approved' | 'rejected'; // إضافة حالة موافقة الموظف
  assignedEmployee?: string;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  completedAt?: string;
}

// Get all requests
export const getRequests = async (): Promise<GuestRequest[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.REQUESTS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GuestRequest));
  } catch (error) {
    console.error('Error getting requests:', error);
    return [];
  }
};

// Add request
export const addRequest = async (request: Omit<GuestRequest, 'id'>): Promise<string | null> => {
  try {
    const docRef = doc(collection(db, COLLECTIONS.REQUESTS));
    
    // Remove undefined values to prevent Firestore errors
    const cleanRequest = Object.fromEntries(
      Object.entries(request).filter(([_, value]) => value !== undefined)
    );
    
    await setDoc(docRef, {
      ...cleanRequest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding request:', error);
    return null;
  }
};

// Update request
export const updateRequest = async (id: string, data: Partial<GuestRequest>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.REQUESTS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating request:', error);
    return false;
  }
};

// Delete request
export const deleteRequest = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.REQUESTS, id));
    return true;
  } catch (error) {
    console.error('Error deleting request:', error);
    return false;
  }
};

// Subscribe to requests
export const subscribeToRequests = (callback: (requests: GuestRequest[]) => void) => {
  const q = query(
    collection(db, COLLECTIONS.REQUESTS),
    orderBy('createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GuestRequest));
      console.log(`🔄 تحديث فوري للطلبات: ${requests.length} طلب`);
      callback(requests);
    },
    (error) => {
      console.error('Error listening to requests:', error);
    }
  );
  return unsubscribe;
};

// ==================== AUDIT LOG ====================

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  description: string;
  details?: any;
  userId?: string;
  userName?: string;
}

// Add audit log entry
export const addAuditLog = async (entry: Omit<AuditLogEntry, 'id'>): Promise<string | null> => {
  try {
    const docRef = doc(collection(db, COLLECTIONS.AUDIT_LOG));
    await setDoc(docRef, {
      ...entry,
      timestamp: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding audit log:', error);
    return null;
  }
};

// Get audit logs
export const getAuditLogs = async (limit = 100): Promise<AuditLogEntry[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.AUDIT_LOG),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .slice(0, limit)
      .map(doc => ({ id: doc.id, ...doc.data() } as AuditLogEntry));
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
};

// ==================== SYNC UTILITIES ====================

// Migrate localStorage to Firebase
export const migrateLocalStorageToFirebase = async () => {
  try {
    const batch = writeBatch(db);
    
    // Migrate employees
    const employeesData = localStorage.getItem('employees');
    if (employeesData) {
      const employees = JSON.parse(employeesData);
      for (const emp of employees) {
        const docRef = doc(collection(db, COLLECTIONS.EMPLOYEES));
        batch.set(docRef, {
          ...emp,
          id: emp.id || docRef.id,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    // Migrate requests
    const requestsData = localStorage.getItem('guest-requests');
    if (requestsData) {
      const requests = JSON.parse(requestsData);
      for (const req of requests) {
        const docRef = doc(collection(db, COLLECTIONS.REQUESTS));
        batch.set(docRef, {
          ...req,
          id: req.id || docRef.id,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    await batch.commit();
    console.log('✅ Data migrated to Firebase successfully!');
    return true;
  } catch (error) {
    console.error('Error migrating data:', error);
    return false;
  }
};

// Sync Firebase to localStorage (for offline support)
export const syncFirebaseToLocalStorage = async () => {
  try {
    const employees = await getEmployees();
    localStorage.setItem('employees', JSON.stringify(employees));
    
    const requests = await getRequests();
    localStorage.setItem('guest-requests', JSON.stringify(requests));
    
    console.log('✅ Data synced to localStorage');
    return true;
  } catch (error) {
    console.error('Error syncing to localStorage:', error);
    return false;
  }
};

// ==================== NOTIFICATIONS ====================

export interface EmployeeNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'new_request' | 'request_update' | 'request_approved' | 'request_rejected';
  title: string;
  message: string;
  requestId?: string;
  roomNumber?: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: string;
}

// إرسال إشعار للموظف
export const sendNotificationToEmployee = async (notification: Omit<EmployeeNotification, 'id'>): Promise<string | null> => {
  try {
    const docRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
    await setDoc(docRef, {
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    });
    console.log(`✅ تم إرسال إشعار للموظف ${notification.employeeName}`);
    return docRef.id;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

// جلب إشعارات الموظف
export const getEmployeeNotifications = async (employeeId: string): Promise<EmployeeNotification[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('employeeId', '==', employeeId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeeNotification));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// الاستماع لإشعارات الموظف (real-time)
export const subscribeToEmployeeNotifications = (
  employeeId: string,
  onUpdate: (notifications: EmployeeNotification[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('employeeId', '==', employeeId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmployeeNotification));
      onUpdate(notifications);
    },
    (error) => {
      console.error('Error listening to notifications:', error);
      if (onError) onError(error);
    }
  );
};

// تعليم الإشعار كمقروء
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(docRef, {
      read: true,
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// تعليم كل إشعارات الموظف كمقروءة
export const markAllNotificationsAsRead = async (employeeId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('employeeId', '==', employeeId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(docSnap => {
      batch.update(docSnap.ref, { read: true });
    });
    
    await batch.commit();
    console.log(`✅ تم تعليم ${querySnapshot.size} إشعار كمقروء`);
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// ==================== MENU ITEMS ====================

export interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  category: 'coffee' | 'restaurant' | 'laundry';
  subCategory?: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  available: boolean;
  featured?: boolean;
  rating?: number;
  preparationTime?: number; // for restaurant
  processingTime?: number; // for laundry
  services?: string[]; // for laundry
  ingredients?: string[]; // for restaurant
  calories?: number;
  createdAt: string;
  updatedAt?: string;
}

// Get all menu items
export const getMenuItems = async (): Promise<MenuItem[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.MENU_ITEMS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MenuItem));
  } catch (error) {
    console.error('Error getting menu items:', error);
    return [];
  }
};

// Get menu items by category
export const getMenuItemsByCategory = async (category: 'coffee' | 'restaurant' | 'laundry'): Promise<MenuItem[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.MENU_ITEMS),
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MenuItem));
  } catch (error) {
    console.error('Error getting menu items by category:', error);
    return [];
  }
};

// Get single menu item
export const getMenuItem = async (id: string): Promise<MenuItem | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.MENU_ITEMS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as MenuItem;
    }
    return null;
  } catch (error) {
    console.error('Error getting menu item:', error);
    return null;
  }
};

// Add new menu item
export const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<string | null> => {
  try {
    const docRef = doc(collection(db, COLLECTIONS.MENU_ITEMS));
    await setDoc(docRef, {
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
    });
    console.log('✅ Menu item added:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding menu item:', error);
    return null;
  }
};

// Update menu item
export const updateMenuItem = async (id: string, data: Partial<MenuItem>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.MENU_ITEMS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Menu item updated:', id);
    return true;
  } catch (error) {
    console.error('Error updating menu item:', error);
    return false;
  }
};

// Delete menu item
export const deleteMenuItem = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MENU_ITEMS, id));
    console.log('✅ Menu item deleted:', id);
    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
};

// Subscribe to menu items changes
export const subscribeToMenuItems = (callback: (items: MenuItem[]) => void) => {
  return onSnapshot(
    collection(db, COLLECTIONS.MENU_ITEMS),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuItem));
      callback(items);
    },
    (error) => {
      console.error('Error listening to menu items:', error);
    }
  );
};

// Bulk import menu items
export const bulkAddMenuItems = async (items: Omit<MenuItem, 'id'>[]): Promise<number> => {
  try {
    const batch = writeBatch(db);
    let count = 0;
    
    items.forEach(item => {
      const docRef = doc(collection(db, COLLECTIONS.MENU_ITEMS));
      batch.set(docRef, {
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
      });
      count++;
    });
    
    await batch.commit();
    console.log(`✅ تم إضافة ${count} صنف بنجاح`);
    return count;
  } catch (error) {
    console.error('Error bulk adding menu items:', error);
    return 0;
  }
};

