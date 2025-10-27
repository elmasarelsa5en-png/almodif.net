// CRM Technical Support System - Database Schema & Operations
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
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// DATABASE SCHEMA INTERFACES
// ============================================

// 1. Users (Employees)
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'agent' | 'supervisor' | 'observer';
  status: 'active' | 'inactive' | 'on-leave';
  avatar?: string;
  department: string;
  joinDate: Timestamp;
  lastSeen: Timestamp;
  isOnline: boolean;
  currentStatus: 'available' | 'busy' | 'offline';
  stats: {
    totalChats: number;
    totalMessagesReplied: number;
    avgResponseTime: number; // في الثواني
    totalTasksCompleted: number;
    performanceScore: number; // 0-100
    issuesResolved: number;
  };
  settings: {
    language: 'ar' | 'en';
    notificationsEnabled: boolean;
    theme: 'light' | 'dark';
  };
}

// 2. Customers
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsappNumber: string;
  createdAt: Timestamp;
  lastInteractionAt: Timestamp;
  stage: 'trial' | 'follow-up' | 'purchase' | 'rejected' | 'inactive';
  status: 'active' | 'blocked' | 'archived';
  trialExpiresAt?: Timestamp;
  notes: string;
  tags: string[];
  issuesCount: number;
  totalChats: number;
  satisfactionScore?: number; // 1-5
}

// 3. Chats (Conversations)
export interface Chat {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  currentAgentId?: string;
  previousAgents: {
    agentId: string;
    agentName: string;
    transferredAt: Timestamp;
    handledFrom: Timestamp;
    handledTo?: Timestamp;
  }[];
  status: 'open' | 'closed' | 'pending' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Timestamp;
  closedAt?: Timestamp;
  lastMessageAt: Timestamp;
  unreadCount: number;
  messageCount: number;
  isAssigned: boolean;
  assignedAt?: Timestamp;
  tags: string[];
  linkedIssueId?: string;
  linkedTaskIds: string[];
  notes: string;
  metadata: {
    deviceType?: string;
    location?: string;
    source: 'whatsapp' | 'web' | 'app';
  };
}

// 4. Messages
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'agent' | 'customer';
  senderName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document' | 'audio';
  timestamp: Timestamp;
  isRead: boolean;
  readAt?: Timestamp;
  reactions: { emoji: string; count: number }[];
  isEdited: boolean;
  editedAt?: Timestamp;
  attachments: {
    url: string;
    name: string;
    size: number;
    type: string;
  }[];
}

// 5. Tasks
export interface Task {
  id: string;
  customerId: string;
  createdBy: string;
  assignedTo: string;
  title: string;
  description: string;
  stage: 'trial' | 'follow-up' | 'purchase' | 'post-sale' | 'rejected';
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Timestamp;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  linkedChatIds: string[];
  linkedIssueIds: string[];
  attachments: {
    url: string;
    type: string;
    name: string;
  }[];
  checklist: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  progress: number; // 0-100
  notes: string;
}

// 6. Issues (Problems)
export interface Issue {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'reopened';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  firstReportedAt: Timestamp;
  frequency: number; // كم مرة تكررت
  relatedChats: string[];
  solution?: {
    description: string;
    videoUrl?: string;
    steps: string[];
    createdBy: string;
    createdAt: Timestamp;
  };
  tags: string[];
  assignedTo?: string;
}

// 7. Attendance (Check-in/Check-out)
export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkInTime: Timestamp;
  checkOutTime?: Timestamp;
  duration: number; // في الدقائق
  status: 'present' | 'absent' | 'late' | 'leave';
  notes?: string;
  isManualEntry: boolean;
  verifiedBy?: string;
}

// 8. Performance Reports
export interface PerformanceReport {
  id: string;
  employeeId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: Timestamp;
  metrics: {
    totalChatsHandled: number;
    totalMessagesReplied: number;
    avgResponseTime: number; // بالثواني
    firstResponseTime: number;
    customerSatisfaction: number;
    issuesResolved: number;
    tasksCompleted: number;
    averageSessionDuration: number;
    peakHours: string[];
    qualityScore: number; // 0-100
  };
  issues: {
    delayedResponses: number;
    unfinishedChats: number;
    customerComplaints: number;
    errors: number;
  };
  achievements: string[];
  recommendations: string[];
  generatedAt: Timestamp;
}

// 9. Chat Transfers
export interface ChatTransfer {
  id: string;
  chatId: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  reason: string;
  transferredAt: Timestamp;
  acceptedAt?: Timestamp;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
}

// ============================================
// DATABASE COLLECTIONS NAMES
// ============================================

export const COLLECTIONS = {
  EMPLOYEES: 'crm_employees',
  CUSTOMERS: 'crm_customers',
  CHATS: 'crm_chats',
  MESSAGES: 'crm_messages',
  TASKS: 'crm_tasks',
  ISSUES: 'crm_issues',
  ATTENDANCE: 'crm_attendance',
  REPORTS: 'crm_performance_reports',
  TRANSFERS: 'crm_chat_transfers',
  NOTIFICATIONS: 'crm_notifications',
  AUDIT_LOG: 'crm_audit_log'
};

// ============================================
// EMPLOYEE OPERATIONS
// ============================================

export class EmployeeService {
  static async createEmployee(data: Partial<Employee>) {
    const employee = {
      ...data,
      createdAt: Timestamp.now(),
      stats: {
        totalChats: 0,
        totalMessagesReplied: 0,
        avgResponseTime: 0,
        totalTasksCompleted: 0,
        performanceScore: 0,
        issuesResolved: 0
      },
      settings: {
        language: 'ar',
        notificationsEnabled: true,
        theme: 'dark'
      }
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.EMPLOYEES), employee);
    return { id: docRef.id, ...employee };
  }

  static async getEmployee(employeeId: string) {
    const docRef = doc(db, COLLECTIONS.EMPLOYEES, employeeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  static async getAllEmployees() {
    const q = query(collection(db, COLLECTIONS.EMPLOYEES), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateEmployeeStatus(employeeId: string, status: 'available' | 'busy' | 'offline') {
    await updateDoc(doc(db, COLLECTIONS.EMPLOYEES, employeeId), {
      currentStatus: status,
      lastSeen: Timestamp.now()
    });
  }

  static subscribeToEmployee(employeeId: string, callback: Function) {
    const unsubscribe = onSnapshot(
      doc(db, COLLECTIONS.EMPLOYEES, employeeId),
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        }
      }
    );
    return unsubscribe;
  }
}

// ============================================
// CUSTOMER OPERATIONS
// ============================================

export class CustomerService {
  static async createCustomer(data: Partial<Customer>) {
    const customer = {
      ...data,
      createdAt: Timestamp.now(),
      lastInteractionAt: Timestamp.now(),
      stage: 'trial',
      status: 'active',
      issuesCount: 0,
      totalChats: 0,
      tags: []
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.CUSTOMERS), customer);
    return { id: docRef.id, ...customer };
  }

  static async getCustomer(customerId: string) {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  static async findCustomerByPhone(phone: string) {
    const q = query(
      collection(db, COLLECTIONS.CUSTOMERS),
      where('whatsappNumber', '==', phone)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 
      ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      : null;
  }

  static async updateCustomerStage(customerId: string, stage: string) {
    await updateDoc(doc(db, COLLECTIONS.CUSTOMERS, customerId), {
      stage: stage,
      lastInteractionAt: Timestamp.now()
    });
  }

  static async updateCustomer(customerId: string, updates: Partial<Customer>) {
    await updateDoc(doc(db, COLLECTIONS.CUSTOMERS, customerId), {
      ...updates,
      lastInteractionAt: Timestamp.now()
    });
  }
}

// ============================================
// CHAT OPERATIONS
// ============================================

export class ChatService {
  static async createChat(data: Partial<Chat>) {
    const chat = {
      ...data,
      createdAt: Timestamp.now(),
      lastMessageAt: Timestamp.now(),
      status: 'open',
      priority: 'medium',
      unreadCount: 0,
      messageCount: 0,
      isAssigned: false,
      previousAgents: [],
      linkedTaskIds: [],
      tags: []
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.CHATS), chat);
    return { id: docRef.id, ...chat };
  }

  static async assignChat(chatId: string, agentId: string, agentName: string) {
    const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
    
    await updateDoc(chatRef, {
      currentAgentId: agentId,
      isAssigned: true,
      assignedAt: Timestamp.now(),
      unreadCount: 0,
      status: 'open'
    });

    // إضافة سجل التحويل
    await addDoc(collection(db, COLLECTIONS.TRANSFERS), {
      chatId,
      fromAgentId: 'system',
      fromAgentName: 'System',
      toAgentId: agentId,
      toAgentName: agentName,
      reason: 'Initial assignment',
      transferredAt: Timestamp.now(),
      status: 'accepted'
    });
  }

  static async transferChat(
    chatId: string,
    fromAgentId: string,
    toAgentId: string,
    toAgentName: string,
    reason: string
  ) {
    const batch = writeBatch(db);

    // تحديث المحادثة
    const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
    batch.update(chatRef, {
      currentAgentId: toAgentId,
      previousAgents: arrayUnion({
        agentId: fromAgentId,
        agentName: 'Agent', // يمكن تحديثه لاحقاً
        transferredAt: Timestamp.now(),
        handledFrom: Timestamp.now()
      })
    });

    // إضافة سجل التحويل
    const transferRef = doc(collection(db, COLLECTIONS.TRANSFERS));
    batch.set(transferRef, {
      chatId,
      fromAgentId,
      fromAgentName: 'Agent',
      toAgentId,
      toAgentName,
      reason,
      transferredAt: Timestamp.now(),
      status: 'pending'
    });

    await batch.commit();
  }

  static async closeChat(chatId: string) {
    await updateDoc(doc(db, COLLECTIONS.CHATS, chatId), {
      status: 'closed',
      closedAt: Timestamp.now()
    });
  }

  static async getOpenChats() {
    const q = query(
      collection(db, COLLECTIONS.CHATS),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getAgentChats(agentId: string) {
    const q = query(
      collection(db, COLLECTIONS.CHATS),
      where('currentAgentId', '==', agentId),
      where('status', '==', 'open')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static subscribeToOpenChats(callback: Function) {
    const q = query(
      collection(db, COLLECTIONS.CHATS),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(chats);
    });
    
    return unsubscribe;
  }
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

export class MessageService {
  static async sendMessage(
    chatId: string,
    content: string,
    senderId: string,
    senderType: 'agent' | 'customer',
    senderName: string,
    mediaUrl?: string,
    mediaType?: string
  ) {
    const message = {
      chatId,
      senderId,
      senderType,
      senderName,
      content,
      mediaUrl,
      mediaType,
      timestamp: Timestamp.now(),
      isRead: false,
      isEdited: false,
      reactions: [],
      attachments: []
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), message);

    // تحديث آخر رسالة في المحادثة
    await updateDoc(doc(db, COLLECTIONS.CHATS, chatId), {
      lastMessageAt: Timestamp.now(),
      messageCount: increment(1)
    });

    return { id: docRef.id, ...message };
  }

  static async getMessages(chatId: string, limitCount: number = 50) {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async markMessageAsRead(messageId: string) {
    await updateDoc(doc(db, COLLECTIONS.MESSAGES, messageId), {
      isRead: true,
      readAt: Timestamp.now()
    });
  }

  static subscribeToMessages(chatId: string, callback: Function) {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    });

    return unsubscribe;
  }
}

// ============================================
// TASK OPERATIONS
// ============================================

export class TaskService {
  static async createTask(data: Partial<Task>) {
    const task = {
      ...data,
      createdAt: Timestamp.now(),
      status: 'todo',
      progress: 0,
      linkedChatIds: [],
      linkedIssueIds: [],
      attachments: [],
      checklist: [],
      notes: ''
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), task);
    return { id: docRef.id, ...task };
  }

  static async updateTaskStatus(taskId: string, status: string) {
    const updates: any = {
      status
    };

    if (status === 'done') {
      updates.completedAt = Timestamp.now();
      updates.progress = 100;
    }

    await updateDoc(doc(db, COLLECTIONS.TASKS, taskId), updates);
  }

  static async getTasksByCustomer(customerId: string) {
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('customerId', '==', customerId),
      orderBy('dueDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getTasksByStage(stage: string) {
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('stage', '==', stage),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// ============================================
// ISSUE OPERATIONS
// ============================================

export class IssueService {
  static async createIssue(data: Partial<Issue>) {
    const issue = {
      ...data,
      createdAt: Timestamp.now(),
      firstReportedAt: Timestamp.now(),
      status: 'open',
      frequency: 1,
      relatedChats: [],
      tags: []
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.ISSUES), issue);
    return { id: docRef.id, ...issue };
  }

  static async getFrequentIssues(limitCount: number = 10) {
    const q = query(
      collection(db, COLLECTIONS.ISSUES),
      where('frequency', '>', 1),
      orderBy('frequency', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getIssuesByCustomer(customerId: string) {
    const q = query(
      collection(db, COLLECTIONS.ISSUES),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async addSolutionToIssue(
    issueId: string,
    description: string,
    videoUrl?: string,
    steps?: string[]
  ) {
    await updateDoc(doc(db, COLLECTIONS.ISSUES, issueId), {
      solution: {
        description,
        videoUrl,
        steps: steps || [],
        createdBy: 'agent',
        createdAt: Timestamp.now()
      },
      status: 'resolved'
    });
  }
}

// ============================================
// ATTENDANCE OPERATIONS
// ============================================

export class AttendanceService {
  static async checkIn(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = {
      employeeId,
      date: today,
      checkInTime: Timestamp.now(),
      status: 'present',
      isManualEntry: false
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.ATTENDANCE), attendance);
    return { id: docRef.id, ...attendance };
  }

  static async checkOut(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    // العثور على سجل الحضور اليومي
    const q = query(
      collection(db, COLLECTIONS.ATTENDANCE),
      where('employeeId', '==', employeeId),
      where('date', '==', today)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      const docId = snapshot.docs[0].id;
      const checkInTime = snapshot.docs[0].data().checkInTime;
      
      const duration = Math.floor(
        (new Date().getTime() - checkInTime.toDate().getTime()) / 60000
      ); // بالدقائق

      await updateDoc(doc(db, COLLECTIONS.ATTENDANCE, docId), {
        checkOutTime: Timestamp.now(),
        duration
      });
    }
  }

  static async getAttendanceRecord(employeeId: string, date: string) {
    const q = query(
      collection(db, COLLECTIONS.ATTENDANCE),
      where('employeeId', '==', employeeId),
      where('date', '==', date)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 
      ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      : null;
  }

  static async getMonthlyAttendance(employeeId: string, month: string) {
    const q = query(
      collection(db, COLLECTIONS.ATTENDANCE),
      where('employeeId', '==', employeeId),
      where('date', '>=', `${month}-01`),
      where('date', '<', `${month}-32`),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// ============================================
// REPORTING OPERATIONS
// ============================================

export class ReportingService {
  static async generatePerformanceReport(employeeId: string, period: 'daily' | 'weekly' | 'monthly') {
    // جمع البيانات والإحصائيات
    const docSnap = await getDoc(doc(db, COLLECTIONS.EMPLOYEES, employeeId));
    const employeeData = docSnap.data() as any;
    
    if (!employeeData) return null;

    const report = {
      employeeId,
      period,
      date: Timestamp.now(),
      metrics: {
        totalChatsHandled: employeeData.stats?.totalChats || 0,
        totalMessagesReplied: employeeData.stats?.totalMessagesReplied || 0,
        avgResponseTime: employeeData.stats?.avgResponseTime || 0,
        firstResponseTime: 0,
        customerSatisfaction: 0,
        issuesResolved: employeeData.stats?.issuesResolved || 0,
        tasksCompleted: employeeData.stats?.totalTasksCompleted || 0,
        averageSessionDuration: 0,
        peakHours: [],
        qualityScore: employeeData.stats?.performanceScore || 0
      },
      issues: {
        delayedResponses: 0,
        unfinishedChats: 0,
        customerComplaints: 0,
        errors: 0
      },
      achievements: [],
      recommendations: [],
      generatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.REPORTS), report);
    return { id: docRef.id, ...report };
  }

  static async getEmployeeReports(employeeId: string, limitCount: number = 12) {
    const q = query(
      collection(db, COLLECTIONS.REPORTS),
      where('employeeId', '==', employeeId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export default {
  EmployeeService,
  CustomerService,
  ChatService,
  MessageService,
  TaskService,
  IssueService,
  AttendanceService,
  ReportingService,
  COLLECTIONS
};
