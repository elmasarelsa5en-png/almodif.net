/**
 * نظام جدولة وإدارة الصيانة
 * Comprehensive Maintenance Management System
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// =====================
// Types & Interfaces
// =====================

export type MaintenanceType = 
  | 'cleaning'           // تنظيف
  | 'ac'                 // تكييف
  | 'plumbing'           // سباكة
  | 'electrical'         // كهرباء
  | 'furniture'          // أثاث
  | 'painting'           // دهان
  | 'appliances'         // أجهزة
  | 'general'            // عام
  | 'preventive'         // صيانة وقائية
  | 'emergency';         // طوارئ

export type MaintenanceStatus = 
  | 'scheduled'          // مجدولة
  | 'pending'            // قيد الانتظار
  | 'in-progress'        // قيد التنفيذ
  | 'completed'          // مكتملة
  | 'cancelled'          // ملغاة
  | 'overdue';           // متأخرة

export type MaintenancePriority = 
  | 'low'                // منخفضة
  | 'medium'             // متوسطة
  | 'high'               // عالية
  | 'urgent';            // عاجلة

export type RecurrenceType = 
  | 'once'               // مرة واحدة
  | 'daily'              // يومي
  | 'weekly'             // أسبوعي
  | 'biweekly'           // كل أسبوعين
  | 'monthly'            // شهري
  | 'quarterly'          // ربع سنوي
  | 'semiannual'         // نصف سنوي
  | 'annual';            // سنوي

export interface MaintenanceTask {
  id?: string;
  
  // Basic Info
  title: string;
  description: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  
  // Location
  roomId?: string;
  roomNumber?: string;
  location?: string;
  area?: string;
  
  // Scheduling
  scheduledDate: string;
  scheduledTime?: string;
  estimatedDuration?: number; // minutes
  actualDuration?: number;
  
  // Recurrence
  recurrenceType: RecurrenceType;
  recurrenceEndDate?: string;
  nextScheduledDate?: string;
  
  // Assignment
  assignedTo?: string;
  assignedToName?: string;
  assignedBy?: string;
  assignedByName?: string;
  
  // Cost
  estimatedCost?: number;
  actualCost?: number;
  materials?: string[];
  materialsCost?: number;
  
  // Tracking
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  completionNotes?: string;
  photos?: string[];
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  
  // Notifications
  notificationSent?: boolean;
  remindersSent?: number;
}

export interface MaintenanceHistory {
  taskId: string;
  action: 'created' | 'updated' | 'assigned' | 'started' | 'completed' | 'cancelled';
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details?: string;
  previousStatus?: MaintenanceStatus;
  newStatus?: MaintenanceStatus;
}

export interface MaintenanceStats {
  total: number;
  scheduled: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  cancelled: number;
  byType: Record<MaintenanceType, number>;
  byPriority: Record<MaintenancePriority, number>;
  avgCompletionTime: number; // minutes
  totalCost: number;
  completionRate: number; // percentage
}

// =====================
// Create & Update
// =====================

/**
 * إنشاء مهمة صيانة جديدة
 */
export async function createMaintenanceTask(task: Omit<MaintenanceTask, 'id' | 'createdAt'>): Promise<string> {
  try {
    const taskData: MaintenanceTask = {
      ...task,
      createdAt: new Date().toISOString(),
      status: task.status || 'scheduled',
      recurrenceType: task.recurrenceType || 'once',
      priority: task.priority || 'medium',
      notificationSent: false,
      remindersSent: 0
    };

    // حساب التاريخ التالي للصيانة المتكررة
    if (task.recurrenceType !== 'once') {
      taskData.nextScheduledDate = calculateNextScheduledDate(task.scheduledDate, task.recurrenceType);
    }

    const docRef = await addDoc(collection(db, 'maintenance_tasks'), taskData);

    // تسجيل في السجل
    await addMaintenanceHistory({
      taskId: docRef.id,
      action: 'created',
      performedBy: task.createdBy,
      performedByName: task.assignedByName || 'النظام',
      timestamp: new Date().toISOString(),
      details: `تم إنشاء مهمة صيانة: ${task.title}`
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating maintenance task:', error);
    throw error;
  }
}

/**
 * تحديث مهمة صيانة
 */
export async function updateMaintenanceTask(
  taskId: string, 
  updates: Partial<MaintenanceTask>,
  updatedBy: string,
  updatedByName: string
): Promise<boolean> {
  try {
    const taskRef = doc(db, 'maintenance_tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    
    if (!taskSnap.exists()) {
      throw new Error('Task not found');
    }

    const previousTask = taskSnap.data() as MaintenanceTask;
    
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy
    });

    // تسجيل التغييرات في السجل
    if (updates.status && updates.status !== previousTask.status) {
      await addMaintenanceHistory({
        taskId,
        action: 'updated',
        performedBy: updatedBy,
        performedByName: updatedByName,
        timestamp: new Date().toISOString(),
        previousStatus: previousTask.status,
        newStatus: updates.status,
        details: `تم تغيير الحالة من ${getStatusLabel(previousTask.status)} إلى ${getStatusLabel(updates.status)}`
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating maintenance task:', error);
    return false;
  }
}

/**
 * تعيين مهمة صيانة لموظف
 */
export async function assignMaintenanceTask(
  taskId: string,
  assignedTo: string,
  assignedToName: string,
  assignedBy: string,
  assignedByName: string
): Promise<boolean> {
  try {
    const taskRef = doc(db, 'maintenance_tasks', taskId);
    
    await updateDoc(taskRef, {
      assignedTo,
      assignedToName,
      assignedBy,
      assignedByName,
      status: 'pending',
      updatedAt: new Date().toISOString()
    });

    await addMaintenanceHistory({
      taskId,
      action: 'assigned',
      performedBy: assignedBy,
      performedByName: assignedByName,
      timestamp: new Date().toISOString(),
      details: `تم تعيين المهمة إلى ${assignedToName}`
    });

    return true;
  } catch (error) {
    console.error('Error assigning maintenance task:', error);
    return false;
  }
}

/**
 * بدء تنفيذ مهمة صيانة
 */
export async function startMaintenanceTask(
  taskId: string,
  userId: string,
  userName: string
): Promise<boolean> {
  try {
    const taskRef = doc(db, 'maintenance_tasks', taskId);
    
    await updateDoc(taskRef, {
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    });

    await addMaintenanceHistory({
      taskId,
      action: 'started',
      performedBy: userId,
      performedByName: userName,
      timestamp: new Date().toISOString(),
      details: 'تم بدء تنفيذ المهمة'
    });

    return true;
  } catch (error) {
    console.error('Error starting maintenance task:', error);
    return false;
  }
}

/**
 * إكمال مهمة صيانة
 */
export async function completeMaintenanceTask(
  taskId: string,
  completionData: {
    actualCost?: number;
    actualDuration?: number;
    completionNotes?: string;
    photos?: string[];
  },
  userId: string,
  userName: string
): Promise<boolean> {
  try {
    const taskRef = doc(db, 'maintenance_tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    
    if (!taskSnap.exists()) {
      throw new Error('Task not found');
    }

    const task = taskSnap.data() as MaintenanceTask;
    const completedAt = new Date().toISOString();

    // حساب المدة الفعلية إذا لم تُحدد
    let actualDuration = completionData.actualDuration;
    if (!actualDuration && task.startedAt) {
      const startTime = new Date(task.startedAt).getTime();
      const endTime = new Date(completedAt).getTime();
      actualDuration = Math.round((endTime - startTime) / (1000 * 60)); // minutes
    }

    await updateDoc(taskRef, {
      status: 'completed',
      completedAt,
      actualCost: completionData.actualCost || task.estimatedCost,
      actualDuration,
      completionNotes: completionData.completionNotes,
      photos: completionData.photos,
      updatedAt: completedAt,
      updatedBy: userId
    });

    // إنشاء مهمة جديدة إذا كانت متكررة
    if (task.recurrenceType !== 'once' && task.nextScheduledDate) {
      await createMaintenanceTask({
        ...task,
        id: undefined,
        status: 'scheduled',
        scheduledDate: task.nextScheduledDate,
        startedAt: undefined,
        completedAt: undefined,
        actualCost: undefined,
        actualDuration: undefined,
        completionNotes: undefined,
        photos: undefined,
        createdBy: userId
      });
    }

    await addMaintenanceHistory({
      taskId,
      action: 'completed',
      performedBy: userId,
      performedByName: userName,
      timestamp: completedAt,
      details: `تم إكمال المهمة${completionData.completionNotes ? ': ' + completionData.completionNotes : ''}`
    });

    return true;
  } catch (error) {
    console.error('Error completing maintenance task:', error);
    return false;
  }
}

/**
 * إلغاء مهمة صيانة
 */
export async function cancelMaintenanceTask(
  taskId: string,
  reason: string,
  userId: string,
  userName: string
): Promise<boolean> {
  try {
    const taskRef = doc(db, 'maintenance_tasks', taskId);
    
    await updateDoc(taskRef, {
      status: 'cancelled',
      completionNotes: reason,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    });

    await addMaintenanceHistory({
      taskId,
      action: 'cancelled',
      performedBy: userId,
      performedByName: userName,
      timestamp: new Date().toISOString(),
      details: `تم إلغاء المهمة: ${reason}`
    });

    return true;
  } catch (error) {
    console.error('Error cancelling maintenance task:', error);
    return false;
  }
}

/**
 * حذف مهمة صيانة
 */
export async function deleteMaintenanceTask(taskId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'maintenance_tasks', taskId));
    return true;
  } catch (error) {
    console.error('Error deleting maintenance task:', error);
    return false;
  }
}

// =====================
// Read Operations
// =====================

/**
 * جلب جميع مهام الصيانة
 */
export async function getAllMaintenanceTasks(): Promise<MaintenanceTask[]> {
  try {
    const q = query(
      collection(db, 'maintenance_tasks'),
      orderBy('scheduledDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask));
  } catch (error) {
    console.error('Error getting maintenance tasks:', error);
    return [];
  }
}

/**
 * جلب مهام الصيانة حسب الحالة
 */
export async function getMaintenanceTasksByStatus(status: MaintenanceStatus): Promise<MaintenanceTask[]> {
  try {
    const q = query(
      collection(db, 'maintenance_tasks'),
      where('status', '==', status),
      orderBy('scheduledDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask));
  } catch (error) {
    console.error('Error getting maintenance tasks by status:', error);
    return [];
  }
}

/**
 * جلب مهام الصيانة لشقة معينة
 */
export async function getMaintenanceTasksByRoom(roomId: string): Promise<MaintenanceTask[]> {
  try {
    const q = query(
      collection(db, 'maintenance_tasks'),
      where('roomId', '==', roomId),
      orderBy('scheduledDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask));
  } catch (error) {
    console.error('Error getting maintenance tasks by room:', error);
    return [];
  }
}

/**
 * جلب مهام الصيانة المعينة لموظف
 */
export async function getMaintenanceTasksByEmployee(employeeId: string): Promise<MaintenanceTask[]> {
  try {
    const q = query(
      collection(db, 'maintenance_tasks'),
      where('assignedTo', '==', employeeId),
      orderBy('scheduledDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask));
  } catch (error) {
    console.error('Error getting maintenance tasks by employee:', error);
    return [];
  }
}

/**
 * جلب المهام المتأخرة
 */
export async function getOverdueTasks(): Promise<MaintenanceTask[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'maintenance_tasks'),
      where('status', 'in', ['scheduled', 'pending', 'in-progress']),
      where('scheduledDate', '<', today)
    );
    const snapshot = await getDocs(q);
    
    // تحديث حالة المهام المتأخرة
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask));
    for (const task of tasks) {
      if (task.status !== 'overdue') {
        await updateDoc(doc(db, 'maintenance_tasks', task.id!), { status: 'overdue' });
      }
    }
    
    return tasks;
  } catch (error) {
    console.error('Error getting overdue tasks:', error);
    return [];
  }
}

/**
 * جلب المهام المجدولة للأيام القادمة
 */
export async function getUpcomingTasks(days: number = 7): Promise<MaintenanceTask[]> {
  try {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    const q = query(
      collection(db, 'maintenance_tasks'),
      where('status', '==', 'scheduled'),
      where('scheduledDate', '>=', today.toISOString().split('T')[0]),
      where('scheduledDate', '<=', futureDate.toISOString().split('T')[0]),
      orderBy('scheduledDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask));
  } catch (error) {
    console.error('Error getting upcoming tasks:', error);
    return [];
  }
}

/**
 * جلب إحصائيات الصيانة
 */
export async function getMaintenanceStats(): Promise<MaintenanceStats> {
  try {
    const tasks = await getAllMaintenanceTasks();
    
    const stats: MaintenanceStats = {
      total: tasks.length,
      scheduled: tasks.filter(t => t.status === 'scheduled').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status === 'overdue').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      byType: {} as Record<MaintenanceType, number>,
      byPriority: {} as Record<MaintenancePriority, number>,
      avgCompletionTime: 0,
      totalCost: 0,
      completionRate: 0
    };

    // Count by type
    tasks.forEach(task => {
      stats.byType[task.type] = (stats.byType[task.type] || 0) + 1;
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
      if (task.actualCost) {
        stats.totalCost += task.actualCost;
      }
    });

    // Calculate average completion time
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.actualDuration);
    if (completedTasks.length > 0) {
      const totalDuration = completedTasks.reduce((sum, t) => sum + (t.actualDuration || 0), 0);
      stats.avgCompletionTime = Math.round(totalDuration / completedTasks.length);
    }

    // Calculate completion rate
    const totalNonCancelled = tasks.filter(t => t.status !== 'cancelled').length;
    if (totalNonCancelled > 0) {
      stats.completionRate = Math.round((stats.completed / totalNonCancelled) * 100);
    }

    return stats;
  } catch (error) {
    console.error('Error getting maintenance stats:', error);
    throw error;
  }
}

// =====================
// History & Logs
// =====================

/**
 * إضافة سجل في تاريخ الصيانة
 */
async function addMaintenanceHistory(history: Omit<MaintenanceHistory, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'maintenance_history'), history);
  } catch (error) {
    console.error('Error adding maintenance history:', error);
  }
}

/**
 * جلب تاريخ مهمة صيانة
 */
export async function getMaintenanceHistory(taskId: string): Promise<MaintenanceHistory[]> {
  try {
    const q = query(
      collection(db, 'maintenance_history'),
      where('taskId', '==', taskId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceHistory));
  } catch (error) {
    console.error('Error getting maintenance history:', error);
    return [];
  }
}

// =====================
// Real-time Subscriptions
// =====================

/**
 * الاشتراك في تحديثات الصيانة
 */
export function subscribeToMaintenanceTasks(callback: (tasks: MaintenanceTask[]) => void): () => void {
  const q = query(
    collection(db, 'maintenance_tasks'),
    orderBy('scheduledDate', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask));
    callback(tasks);
  });
}

// =====================
// Helper Functions
// =====================

/**
 * حساب التاريخ التالي للصيانة المتكررة
 */
function calculateNextScheduledDate(currentDate: string, recurrence: RecurrenceType): string {
  const date = new Date(currentDate);
  
  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'semiannual':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annual':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return currentDate;
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * الحصول على تسمية الحالة
 */
function getStatusLabel(status: MaintenanceStatus): string {
  const labels: Record<MaintenanceStatus, string> = {
    'scheduled': 'مجدولة',
    'pending': 'قيد الانتظار',
    'in-progress': 'قيد التنفيذ',
    'completed': 'مكتملة',
    'cancelled': 'ملغاة',
    'overdue': 'متأخرة'
  };
  return labels[status] || status;
}

/**
 * الحصول على تسمية النوع
 */
export function getTypeLabel(type: MaintenanceType): string {
  const labels: Record<MaintenanceType, string> = {
    'cleaning': 'تنظيف',
    'ac': 'تكييف',
    'plumbing': 'سباكة',
    'electrical': 'كهرباء',
    'furniture': 'أثاث',
    'painting': 'دهان',
    'appliances': 'أجهزة',
    'general': 'عام',
    'preventive': 'صيانة وقائية',
    'emergency': 'طوارئ'
  };
  return labels[type] || type;
}

/**
 * الحصول على تسمية الأولوية
 */
export function getPriorityLabel(priority: MaintenancePriority): string {
  const labels: Record<MaintenancePriority, string> = {
    'low': 'منخفضة',
    'medium': 'متوسطة',
    'high': 'عالية',
    'urgent': 'عاجلة'
  };
  return labels[priority] || priority;
}

/**
 * الحصول على تسمية التكرار
 */
export function getRecurrenceLabel(recurrence: RecurrenceType): string {
  const labels: Record<RecurrenceType, string> = {
    'once': 'مرة واحدة',
    'daily': 'يومي',
    'weekly': 'أسبوعي',
    'biweekly': 'كل أسبوعين',
    'monthly': 'شهري',
    'quarterly': 'ربع سنوي',
    'semiannual': 'نصف سنوي',
    'annual': 'سنوي'
  };
  return labels[recurrence] || recurrence;
}
