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
  notes?: string;
  items?: string[];
  linkedSection?: 'coffee' | 'laundry' | 'restaurant';
  linkedOrderId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
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
    await setDoc(docRef, {
      ...request,
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
  const unsubscribe = onSnapshot(
    collection(db, COLLECTIONS.REQUESTS),
    (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GuestRequest));
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
