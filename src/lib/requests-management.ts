/**
 * مكتبة إدارة الموظفين والطلبات
 */

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
  permissions: string[];
}

export interface RequestType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
}

export interface GuestRequest {
  id: string;
  room: string;
  guest: string;
  phone?: string;
  type: string;
  notes: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'awaiting_employee_approval';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  assignedEmployee?: string;
  employeeApprovalStatus?: 'pending' | 'approved' | 'rejected';
  employeeApprovedAt?: string;
  managerNotified?: boolean;
}

// ============ Request Types Management ============

/**
 * الحصول على أنواع الطلبات
 */
export const getRequestTypes = (): RequestType[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('request_types');
    if (saved) {
      return JSON.parse(saved);
    }
    // إرجاع القيم الافتراضية إذا لم يكن هناك شيء محفوظ
    const defaultTypes: RequestType[] = [
      { id: '1', name: 'تنظيف الغرفة', icon: '🧹', createdAt: new Date().toISOString() },
      { id: '2', name: 'صيانة', icon: '🔧', createdAt: new Date().toISOString() },
      { id: '3', name: 'طلب خدمة', icon: '🛎️', createdAt: new Date().toISOString() },
      { id: '4', name: 'شكوى', icon: '⚠️', createdAt: new Date().toISOString() },
      { id: '5', name: 'معلومة', icon: 'ℹ️', createdAt: new Date().toISOString() },
      { id: '6', name: 'طلب غذائي', icon: '🍽️', createdAt: new Date().toISOString() },
      { id: '7', name: 'طلب مشروبات', icon: '🥤', createdAt: new Date().toISOString() },
      { id: '8', name: 'خدمة الغسيل', icon: '👔', createdAt: new Date().toISOString() },
      { id: '9', name: 'تعديل الحجز', icon: '📅', createdAt: new Date().toISOString() },
      { id: '10', name: 'مساعدة عامة', icon: '🤝', createdAt: new Date().toISOString() },
    ];
    saveRequestTypes(defaultTypes);
    return defaultTypes;
  } catch {
    return [];
  }
};

/**
 * حفظ أنواع الطلبات
 */
export const saveRequestTypes = (types: RequestType[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('request_types', JSON.stringify(types));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving request types:', error);
  }
};

/**
 * إضافة نوع طلب جديد
 */
export const addRequestType = (type: RequestType): void => {
  const types = getRequestTypes();
  types.push(type);
  saveRequestTypes(types);
};

/**
 * تحديث نوع طلب
 */
export const updateRequestType = (id: string, updatedData: Partial<RequestType>): void => {
  const types = getRequestTypes();
  const index = types.findIndex((t) => t.id === id);
  if (index !== -1) {
    types[index] = { ...types[index], ...updatedData };
    saveRequestTypes(types);
  }
};

/**
 * حذف نوع طلب
 */
export const deleteRequestType = (id: string): void => {
  const types = getRequestTypes();
  const filtered = types.filter((t) => t.id !== id);
  saveRequestTypes(filtered);
};

// ============ Employee Management ============

/**
 * الحصول على قائمة الموظفين
 */
export const getEmployeesList = (): Employee[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('employees_list');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/**
 * حفظ قائمة الموظفين
 */
export const saveEmployeesList = (employees: Employee[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('employees_list', JSON.stringify(employees));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving employees:', error);
  }
};

/**
 * إضافة موظف جديد
 */
export const addEmployee = (employee: Employee): void => {
  const employees = getEmployeesList();
  employees.push(employee);
  saveEmployeesList(employees);
};

/**
 * تحديث بيانات موظف
 */
export const updateEmployee = (id: string, updatedData: Partial<Employee>): void => {
  const employees = getEmployeesList();
  const index = employees.findIndex((e) => e.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...updatedData };
    saveEmployeesList(employees);
  }
};

/**
 * حذف موظف
 */
export const deleteEmployee = (id: string): void => {
  const employees = getEmployeesList();
  const filtered = employees.filter((e) => e.id !== id);
  saveEmployeesList(filtered);
};

/**
 * الحصول على موظف بواسطة الـ ID
 */
export const getEmployeeById = (id: string): Employee | null => {
  const employees = getEmployeesList();
  return employees.find((e) => e.id === id) || null;
};

// ============ Guest Requests Management ============

/**
 * الحصول على جميع الطلبات
 */
export const getGuestRequests = (): GuestRequest[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('guest-requests');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/**
 * حفظ الطلبات
 */
export const saveGuestRequests = (requests: GuestRequest[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('guest-requests', JSON.stringify(requests));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving requests:', error);
  }
};

/**
 * إضافة طلب جديد
 */
export const addGuestRequest = (request: GuestRequest): void => {
  const requests = getGuestRequests();
  requests.unshift(request);
  saveGuestRequests(requests);
};

/**
 * تحديث حالة الطلب
 */
export const updateRequestStatus = (
  id: string,
  updates: Partial<GuestRequest>
): void => {
  const requests = getGuestRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    saveGuestRequests(requests);
  }
};

/**
 * الحصول على الطلبات المسندة لموظف معين
 */
export const getRequestsForEmployee = (employeeId: string): GuestRequest[] => {
  const requests = getGuestRequests();
  return requests.filter((r) => r.assignedEmployee === employeeId);
};

/**
 * الحصول على الطلبات التي تنتظر موافقة الموظف
 */
export const getPendingApprovalRequests = (): GuestRequest[] => {
  const requests = getGuestRequests();
  return requests.filter((r) => r.status === 'awaiting_employee_approval');
};

// ============ Notifications Management ============

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  requestId?: string;
  employeeId?: string;
  action?: 'approved' | 'rejected';
}

/**
 * الحصول على الإشعارات
 */
export const getNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/**
 * حفظ الإشعارات
 */
export const saveNotifications = (notifications: Notification[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
};

/**
 * إضافة إشعار
 */
export const addNotification = (notification: Notification): void => {
  const notifications = getNotifications();
  notifications.unshift(notification);
  saveNotifications(notifications);
};

/**
 * وضع علامة على الإشعار كمقروء
 */
export const markAsRead = (id: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    saveNotifications(notifications);
  }
};

/**
 * حذف إشعار
 */
export const deleteNotification = (id: string): void => {
  const notifications = getNotifications();
  const filtered = notifications.filter((n) => n.id !== id);
  saveNotifications(filtered);
};
