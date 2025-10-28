/**
 * نظام الصلاحيات المتكامل
 * Comprehensive Permission System
 */

export interface Permission {
  id: string;
  label: string;
  labelEn: string;
  category: string;
  description?: string;
  icon?: string;
}

export interface PermissionCategory {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  permissions: Permission[];
}

/**
 * جميع الصلاحيات المتاحة في النظام
 */
export const ALL_PERMISSIONS: PermissionCategory[] = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    labelEn: 'Dashboard',
    icon: '📊',
    permissions: [
      { id: 'view_dashboard', label: 'عرض لوحة التحكم', labelEn: 'View Dashboard', category: 'dashboard', description: 'الوصول إلى الصفحة الرئيسية' },
      { id: 'view_statistics', label: 'عرض الإحصائيات', labelEn: 'View Statistics', category: 'dashboard', description: 'رؤية إحصائيات النظام' },
      { id: 'view_charts', label: 'عرض الرسوم البيانية', labelEn: 'View Charts', category: 'dashboard', description: 'عرض التقارير المرئية' },
    ]
  },
  {
    id: 'rooms',
    label: 'الغرف',
    labelEn: 'Rooms',
    icon: '🏨',
    permissions: [
      { id: 'view_rooms', label: 'عرض الغرف', labelEn: 'View Rooms', category: 'rooms', description: 'رؤية قائمة الغرف' },
      { id: 'add_room', label: 'إضافة غرفة', labelEn: 'Add Room', category: 'rooms', description: 'إضافة غرفة جديدة' },
      { id: 'edit_room', label: 'تعديل غرفة', labelEn: 'Edit Room', category: 'rooms', description: 'تعديل بيانات الغرف' },
      { id: 'delete_room', label: 'حذف غرفة', labelEn: 'Delete Room', category: 'rooms', description: 'حذف غرفة من النظام' },
      { id: 'change_room_status', label: 'تغيير حالة الغرفة', labelEn: 'Change Room Status', category: 'rooms', description: 'تحديث حالة الغرفة' },
      { id: 'view_room_details', label: 'عرض تفاصيل الغرفة', labelEn: 'View Room Details', category: 'rooms', description: 'رؤية معلومات الغرفة الكاملة' },
      { id: 'manage_room_prices', label: 'إدارة أسعار الغرف', labelEn: 'Manage Room Prices', category: 'rooms', description: 'تعديل الأسعار' },
      { id: 'add_rooms_from_image', label: 'إضافة غرف من صورة', labelEn: 'Add Rooms from Image', category: 'rooms', description: 'استخراج الغرف من الصور' },
    ]
  },
  {
    id: 'bookings',
    label: 'الحجوزات',
    labelEn: 'Bookings',
    icon: '📅',
    permissions: [
      { id: 'view_bookings', label: 'عرض الحجوزات', labelEn: 'View Bookings', category: 'bookings', description: 'رؤية قائمة الحجوزات' },
      { id: 'create_booking', label: 'إنشاء حجز', labelEn: 'Create Booking', category: 'bookings', description: 'إضافة حجز جديد' },
      { id: 'edit_booking', label: 'تعديل حجز', labelEn: 'Edit Booking', category: 'bookings', description: 'تعديل بيانات الحجز' },
      { id: 'cancel_booking', label: 'إلغاء حجز', labelEn: 'Cancel Booking', category: 'bookings', description: 'إلغاء الحجوزات' },
      { id: 'confirm_booking', label: 'تأكيد حجز', labelEn: 'Confirm Booking', category: 'bookings', description: 'تأكيد الحجوزات' },
      { id: 'view_booking_details', label: 'عرض تفاصيل الحجز', labelEn: 'View Booking Details', category: 'bookings', description: 'رؤية معلومات الحجز الكاملة' },
      { id: 'manage_contract_numbers', label: 'إدارة أرقام العقود', labelEn: 'Manage Contract Numbers', category: 'bookings', description: 'تعديل أرقام العقود' },
    ]
  },
  {
    id: 'guests',
    label: 'النزلاء',
    labelEn: 'Guests',
    icon: '👥',
    permissions: [
      { id: 'view_guests', label: 'عرض النزلاء', labelEn: 'View Guests', category: 'guests', description: 'رؤية قائمة النزلاء' },
      { id: 'add_guest', label: 'إضافة نزيل', labelEn: 'Add Guest', category: 'guests', description: 'تسجيل نزيل جديد' },
      { id: 'edit_guest', label: 'تعديل نزيل', labelEn: 'Edit Guest', category: 'guests', description: 'تعديل بيانات النزيل' },
      { id: 'delete_guest', label: 'حذف نزيل', labelEn: 'Delete Guest', category: 'guests', description: 'حذف نزيل من النظام' },
      { id: 'view_guest_history', label: 'عرض سجل النزيل', labelEn: 'View Guest History', category: 'guests', description: 'رؤية تاريخ النزيل' },
      { id: 'manage_guest_documents', label: 'إدارة مستندات النزيل', labelEn: 'Manage Guest Documents', category: 'guests', description: 'رفع وعرض المستندات' },
      { id: 'export_guest_data', label: 'تصدير بيانات النزلاء', labelEn: 'Export Guest Data', category: 'guests', description: 'تصدير البيانات' },
    ]
  },
  {
    id: 'requests',
    label: 'طلبات النزلاء',
    labelEn: 'Guest Requests',
    icon: '📋',
    permissions: [
      { id: 'view_requests', label: 'عرض الطلبات', labelEn: 'View Requests', category: 'requests', description: 'رؤية طلبات النزلاء' },
      { id: 'create_request', label: 'إنشاء طلب', labelEn: 'Create Request', category: 'requests', description: 'إضافة طلب جديد' },
      { id: 'edit_request', label: 'تعديل طلب', labelEn: 'Edit Request', category: 'requests', description: 'تعديل الطلبات' },
      { id: 'delete_request', label: 'حذف طلب', labelEn: 'Delete Request', category: 'requests', description: 'حذف الطلبات' },
      { id: 'approve_request', label: 'الموافقة على طلب', labelEn: 'Approve Request', category: 'requests', description: 'الموافقة على الطلبات' },
      { id: 'reject_request', label: 'رفض طلب', labelEn: 'Reject Request', category: 'requests', description: 'رفض الطلبات' },
      { id: 'complete_request', label: 'إتمام طلب', labelEn: 'Complete Request', category: 'requests', description: 'تمييز الطلب كمكتمل' },
      { id: 'assign_request', label: 'تعيين طلب لموظف', labelEn: 'Assign Request', category: 'requests', description: 'تعيين المسؤول عن الطلب' },
    ]
  },
  {
    id: 'services',
    label: 'الخدمات',
    labelEn: 'Services',
    icon: '🛎️',
    permissions: [
      { id: 'view_coffee', label: 'عرض الكوفي شوب', labelEn: 'View Coffee Shop', category: 'services', description: 'الوصول لقائمة الكوفي' },
      { id: 'manage_coffee', label: 'إدارة الكوفي شوب', labelEn: 'Manage Coffee Shop', category: 'services', description: 'تعديل منتجات الكوفي' },
      { id: 'view_restaurant', label: 'عرض المطعم', labelEn: 'View Restaurant', category: 'services', description: 'الوصول لقائمة المطعم' },
      { id: 'manage_restaurant', label: 'إدارة المطعم', labelEn: 'Manage Restaurant', category: 'services', description: 'تعديل منتجات المطعم' },
      { id: 'view_laundry', label: 'عرض المغسلة', labelEn: 'View Laundry', category: 'services', description: 'الوصول لخدمات المغسلة' },
      { id: 'manage_laundry', label: 'إدارة المغسلة', labelEn: 'Manage Laundry', category: 'services', description: 'تعديل خدمات المغسلة' },
      { id: 'manage_maintenance', label: 'إدارة الصيانة', labelEn: 'Manage Maintenance', category: 'services', description: 'طلبات الصيانة' },
      { id: 'manage_housekeeping', label: 'إدارة خدمات الغرف', labelEn: 'Manage Housekeeping', category: 'services', description: 'خدمات التنظيف' },
    ]
  },
  {
    id: 'finance',
    label: 'المالية',
    labelEn: 'Finance',
    icon: '💰',
    permissions: [
      { id: 'view_payments', label: 'عرض المدفوعات', labelEn: 'View Payments', category: 'finance', description: 'رؤية سجل المدفوعات' },
      { id: 'receive_payment', label: 'استلام دفعة', labelEn: 'Receive Payment', category: 'finance', description: 'تسجيل دفعة جديدة' },
      { id: 'refund_payment', label: 'استرجاع دفعة', labelEn: 'Refund Payment', category: 'finance', description: 'استرداد المبالغ' },
      { id: 'view_invoices', label: 'عرض الفواتير', labelEn: 'View Invoices', category: 'finance', description: 'رؤية الفواتير' },
      { id: 'create_invoice', label: 'إنشاء فاتورة', labelEn: 'Create Invoice', category: 'finance', description: 'إنشاء فاتورة جديدة' },
      { id: 'edit_prices', label: 'تعديل الأسعار', labelEn: 'Edit Prices', category: 'finance', description: 'تعديل أسعار الخدمات' },
      { id: 'view_financial_reports', label: 'عرض التقارير المالية', labelEn: 'View Financial Reports', category: 'finance', description: 'رؤية التقارير المالية' },
      { id: 'manage_discounts', label: 'إدارة الخصومات', labelEn: 'Manage Discounts', category: 'finance', description: 'إضافة وإلغاء الخصومات' },
    ]
  },
  {
    id: 'reports',
    label: 'التقارير',
    labelEn: 'Reports',
    icon: '📊',
    permissions: [
      { id: 'view_reports', label: 'عرض التقارير', labelEn: 'View Reports', category: 'reports', description: 'الوصول للتقارير' },
      { id: 'export_reports', label: 'تصدير التقارير', labelEn: 'Export Reports', category: 'reports', description: 'تصدير التقارير' },
      { id: 'view_occupancy_report', label: 'تقرير الإشغال', labelEn: 'Occupancy Report', category: 'reports', description: 'تقرير إشغال الغرف' },
      { id: 'view_revenue_report', label: 'تقرير الإيرادات', labelEn: 'Revenue Report', category: 'reports', description: 'تقرير المبيعات' },
      { id: 'view_employee_report', label: 'تقرير الموظفين', labelEn: 'Employee Report', category: 'reports', description: 'أداء الموظفين' },
      { id: 'view_service_report', label: 'تقرير الخدمات', labelEn: 'Service Report', category: 'reports', description: 'إحصائيات الخدمات' },
    ]
  },
  {
    id: 'employees',
    label: 'الموظفين',
    labelEn: 'Employees',
    icon: '👔',
    permissions: [
      { id: 'view_employees', label: 'عرض الموظفين', labelEn: 'View Employees', category: 'employees', description: 'رؤية قائمة الموظفين' },
      { id: 'add_employee', label: 'إضافة موظف', labelEn: 'Add Employee', category: 'employees', description: 'تسجيل موظف جديد' },
      { id: 'edit_employee', label: 'تعديل موظف', labelEn: 'Edit Employee', category: 'employees', description: 'تعديل بيانات الموظف' },
      { id: 'delete_employee', label: 'حذف موظف', labelEn: 'Delete Employee', category: 'employees', description: 'حذف موظف' },
      { id: 'manage_permissions', label: 'إدارة الصلاحيات', labelEn: 'Manage Permissions', category: 'employees', description: 'تعديل صلاحيات الموظفين' },
      { id: 'view_employee_logs', label: 'عرض سجل الموظف', labelEn: 'View Employee Logs', category: 'employees', description: 'رؤية نشاط الموظف' },
    ]
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    labelEn: 'Settings',
    icon: '⚙️',
    permissions: [
      { id: 'view_settings', label: 'عرض الإعدادات', labelEn: 'View Settings', category: 'settings', description: 'الوصول للإعدادات' },
      { id: 'manage_general_settings', label: 'الإعدادات العامة', labelEn: 'General Settings', category: 'settings', description: 'تعديل الإعدادات العامة' },
      { id: 'manage_room_types', label: 'إدارة أنواع الغرف', labelEn: 'Manage Room Types', category: 'settings', description: 'تعديل أنواع الغرف' },
      { id: 'manage_room_catalog', label: 'إدارة كتالوج الغرف', labelEn: 'Manage Room Catalog', category: 'settings', description: 'كتالوج الغرف' },
      { id: 'manage_menu_items', label: 'إدارة قوائم الأصناف', labelEn: 'Manage Menu Items', category: 'settings', description: 'قوائم الطعام والخدمات' },
      { id: 'manage_booking_sources', label: 'إدارة مصادر الحجز', labelEn: 'Manage Booking Sources', category: 'settings', description: 'مصادر الحجوزات' },
      { id: 'manage_request_types', label: 'إدارة أنواع الطلبات', labelEn: 'Manage Request Types', category: 'settings', description: 'أنواع طلبات النزلاء' },
      { id: 'manage_notifications', label: 'إدارة الإشعارات', labelEn: 'Manage Notifications', category: 'settings', description: 'إعدادات الإشعارات' },
      { id: 'manage_sound_settings', label: 'إعدادات الصوت', labelEn: 'Sound Settings', category: 'settings', description: 'أصوات التنبيهات' },
      { id: 'firebase_setup', label: 'إعداد Firebase', labelEn: 'Firebase Setup', category: 'settings', description: 'إعدادات قاعدة البيانات' },
      { id: 'manage_website', label: 'إدارة الموقع', labelEn: 'Manage Website', category: 'settings', description: 'إعدادات الموقع' },
    ]
  },
  {
    id: 'guest_menu',
    label: 'منيو النزلاء',
    labelEn: 'Guest Menu',
    icon: '📱',
    permissions: [
      { id: 'view_guest_menu_settings', label: 'عرض إعدادات المنيو', labelEn: 'View Guest Menu Settings', category: 'guest_menu', description: 'إعدادات منيو النزلاء' },
      { id: 'manage_guest_menu', label: 'إدارة منيو النزلاء', labelEn: 'Manage Guest Menu', category: 'guest_menu', description: 'تعديل المنيو' },
      { id: 'view_guest_orders', label: 'عرض طلبات النزلاء', labelEn: 'View Guest Orders', category: 'guest_menu', description: 'طلبات المنيو' },
    ]
  },
  {
    id: 'navigation',
    label: 'التنقل في النظام',
    labelEn: 'Navigation',
    icon: '🧭',
    permissions: [
      { id: 'access_sidebar', label: 'الوصول للقائمة الجانبية', labelEn: 'Access Sidebar', category: 'navigation', description: 'عرض القائمة الجانبية' },
      { id: 'access_top_menu', label: 'الوصول للقائمة العلوية', labelEn: 'Access Top Menu', category: 'navigation', description: 'عرض القائمة العلوية' },
      { id: 'view_dashboard_link', label: 'رابط لوحة التحكم', labelEn: 'Dashboard Link', category: 'navigation', description: 'عرض رابط لوحة التحكم' },
      { id: 'view_rooms_link', label: 'رابط الغرف', labelEn: 'Rooms Link', category: 'navigation', description: 'عرض رابط الغرف' },
      { id: 'view_requests_link', label: 'رابط الطلبات', labelEn: 'Requests Link', category: 'navigation', description: 'عرض رابط الطلبات' },
      { id: 'view_reports_link', label: 'رابط التقارير', labelEn: 'Reports Link', category: 'navigation', description: 'عرض رابط التقارير' },
      { id: 'view_settings_link', label: 'رابط الإعدادات', labelEn: 'Settings Link', category: 'navigation', description: 'عرض رابط الإعدادات' },
    ]
  },
];

/**
 * الحصول على جميع الصلاحيات كمصفوفة مسطحة
 */
export const getAllPermissions = (): Permission[] => {
  return ALL_PERMISSIONS.flatMap(category => category.permissions);
};

/**
 * الحصول على صلاحية معينة
 */
export const getPermission = (permissionId: string): Permission | undefined => {
  return getAllPermissions().find(p => p.id === permissionId);
};

/**
 * التحقق من وجود صلاحية
 */
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};

/**
 * التحقق من وجود أي من الصلاحيات
 */
export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

/**
 * التحقق من وجود جميع الصلاحيات
 */
export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

/**
 * الحصول على الصلاحيات حسب الفئة
 */
export const getPermissionsByCategory = (categoryId: string): Permission[] => {
  const category = ALL_PERMISSIONS.find(c => c.id === categoryId);
  return category ? category.permissions : [];
};

/**
 * صلاحيات المدير الكاملة
 */
export const ADMIN_PERMISSIONS = getAllPermissions().map(p => p.id);

/**
 * صلاحيات المشرف الافتراضية
 */
export const MANAGER_PERMISSIONS = [
  'view_dashboard', 'view_statistics', 'view_charts',
  'view_rooms', 'add_room', 'edit_room', 'change_room_status', 'view_room_details', 'manage_room_prices',
  'view_bookings', 'create_booking', 'edit_booking', 'cancel_booking', 'confirm_booking', 'view_booking_details',
  'view_guests', 'add_guest', 'edit_guest', 'view_guest_history',
  'view_requests', 'create_request', 'edit_request', 'approve_request', 'reject_request', 'complete_request', 'assign_request',
  'view_payments', 'receive_payment', 'view_invoices', 'create_invoice',
  'view_reports', 'export_reports', 'view_occupancy_report', 'view_revenue_report',
  'view_employees',
  'access_sidebar', 'access_top_menu', 'view_dashboard_link', 'view_rooms_link', 'view_requests_link', 'view_reports_link',
];

/**
 * صلاحيات الاستقبال الافتراضية
 */
export const RECEPTION_PERMISSIONS = [
  'view_dashboard', 'view_statistics',
  'view_rooms', 'view_room_details', 'change_room_status',
  'view_bookings', 'create_booking', 'edit_booking', 'view_booking_details',
  'view_guests', 'add_guest', 'edit_guest', 'view_guest_history',
  'view_requests', 'create_request',
  'view_payments', 'receive_payment',
  'access_sidebar', 'access_top_menu', 'view_dashboard_link', 'view_rooms_link', 'view_requests_link',
];
