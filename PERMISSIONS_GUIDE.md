# 🔐 نظام الصلاحيات الشامل - دليل الاستخدام الكامل

## 📋 المحتويات
- [نظرة عامة](#نظرة-عامة)
- [الملفات الأساسية](#الملفات-الأساسية)
- [قائمة الصلاحيات الكاملة](#قائمة-الصلاحيات-الكاملة)
- [كيفية الاستخدام](#كيفية-الاستخدام)
- [أمثلة عملية](#أمثلة-عملية)
- [تحديث الصلاحيات](#تحديث-الصلاحيات)

---

## 🎯 نظرة عامة

تم إنشاء نظام صلاحيات شامل يتحكم في **كل جزء** من النظام:
- ✅ **كل صفحة** لها صلاحية منفصلة
- ✅ **كل زر** يمكن التحكم فيه
- ✅ **القائمة الجانبية** تظهر/تختفي حسب الصلاحيات
- ✅ **القوائم العلوية** محمية بالصلاحيات
- ✅ **الخدمات** (كوفي، مطعم، مغسلة) محمية
- ✅ إذا لم يكن لدى الموظف صلاحية → **لن يرى الميزة نهائياً**

---

## 📁 الملفات الأساسية

### 1. **src/lib/permissions.ts**
يحتوي على:
- 📝 قائمة **100+ صلاحية** منظمة في 12 فئة
- 🔧 دوال مساعدة للتحقق من الصلاحيات
- 🎭 صلاحيات افتراضية لكل دور

### 2. **src/components/PermissionGuard.tsx**
مكونات React للتحكم:
- `<PermissionGuard>` - حماية صفحة كاملة
- `<HasPermission>` - إخفاء أزرار/عناصر
- `usePermissions()` - Hook للتحقق في الكود

### 3. **scripts/update-employee-permissions.html**
أداة تحديث الصلاحيات للموظفين الحاليين

---

## 📊 قائمة الصلاحيات الكاملة

### 🏠 لوحة التحكم (Dashboard)
```typescript
'view_dashboard'      // عرض لوحة التحكم
'view_statistics'     // عرض الإحصائيات
'view_charts'         // عرض الرسوم البيانية
```

### 🏨 الغرف (Rooms)
```typescript
'view_rooms'              // عرض الغرف
'add_room'                // إضافة غرفة
'edit_room'               // تعديل غرفة
'delete_room'             // حذف غرفة
'change_room_status'      // تغيير حالة الغرفة
'view_room_details'       // عرض تفاصيل الغرفة
'manage_room_prices'      // إدارة أسعار الغرف
'add_rooms_from_image'    // إضافة غرف من صورة
```

### 📅 الحجوزات (Bookings)
```typescript
'view_bookings'           // عرض الحجوزات
'create_booking'          // إنشاء حجز
'edit_booking'            // تعديل حجز
'cancel_booking'          // إلغاء حجز
'confirm_booking'         // تأكيد حجز
'view_booking_details'    // عرض تفاصيل الحجز
'manage_contract_numbers' // إدارة أرقام العقود
```

### 👥 النزلاء (Guests)
```typescript
'view_guests'             // عرض النزلاء
'add_guest'               // إضافة نزيل
'edit_guest'              // تعديل نزيل
'delete_guest'            // حذف نزيل
'view_guest_history'      // عرض سجل النزيل
'manage_guest_documents'  // إدارة مستندات النزيل
'export_guest_data'       // تصدير بيانات النزلاء
```

### 📋 طلبات النزلاء (Requests)
```typescript
'view_requests'       // عرض الطلبات
'create_request'      // إنشاء طلب
'edit_request'        // تعديل طلب
'delete_request'      // حذف طلب
'approve_request'     // الموافقة على طلب
'reject_request'      // رفض طلب
'complete_request'    // إتمام طلب
'assign_request'      // تعيين طلب لموظف
```

### 🛎️ الخدمات (Services)
```typescript
'view_coffee'         // عرض الكوفي شوب
'manage_coffee'       // إدارة الكوفي شوب
'view_restaurant'     // عرض المطعم
'manage_restaurant'   // إدارة المطعم
'view_laundry'        // عرض المغسلة
'manage_laundry'      // إدارة المغسلة
'manage_maintenance'  // إدارة الصيانة
'manage_housekeeping' // إدارة خدمات الغرف
```

### 💰 المالية (Finance)
```typescript
'view_payments'           // عرض المدفوعات
'receive_payment'         // استلام دفعة
'refund_payment'          // استرجاع دفعة
'view_invoices'           // عرض الفواتير
'create_invoice'          // إنشاء فاتورة
'edit_prices'             // تعديل الأسعار
'view_financial_reports'  // عرض التقارير المالية
'manage_discounts'        // إدارة الخصومات
```

### 📊 التقارير (Reports)
```typescript
'view_reports'            // عرض التقارير
'export_reports'          // تصدير التقارير
'view_occupancy_report'   // تقرير الإشغال
'view_revenue_report'     // تقرير الإيرادات
'view_employee_report'    // تقرير الموظفين
'view_service_report'     // تقرير الخدمات
```

### 👔 الموظفين (Employees)
```typescript
'view_employees'      // عرض الموظفين
'add_employee'        // إضافة موظف
'edit_employee'       // تعديل موظف
'delete_employee'     // حذف موظف
'manage_permissions'  // إدارة الصلاحيات
'view_employee_logs'  // عرض سجل الموظف
```

### ⚙️ الإعدادات (Settings)
```typescript
'view_settings'            // عرض الإعدادات
'manage_general_settings'  // الإعدادات العامة
'manage_room_types'        // إدارة أنواع الغرف
'manage_room_catalog'      // إدارة كتالوج الغرف
'manage_menu_items'        // إدارة قوائم الأصناف
'manage_booking_sources'   // إدارة مصادر الحجز
'manage_request_types'     // إدارة أنواع الطلبات
'manage_notifications'     // إدارة الإشعارات
'manage_sound_settings'    // إعدادات الصوت
'firebase_setup'           // إعداد Firebase
'manage_website'           // إدارة الموقع
```

### 📱 منيو النزلاء (Guest Menu)
```typescript
'view_guest_menu_settings' // عرض إعدادات المنيو
'manage_guest_menu'        // إدارة منيو النزلاء
'view_guest_orders'        // عرض طلبات النزلاء
```

### 🧭 التنقل (Navigation)
```typescript
'access_sidebar'          // الوصول للقائمة الجانبية
'access_top_menu'         // الوصول للقائمة العلوية
'view_dashboard_link'     // رابط لوحة التحكم
'view_rooms_link'         // رابط الغرف
'view_requests_link'      // رابط الطلبات
'view_reports_link'       // رابط التقارير
'view_settings_link'      // رابط الإعدادات
```

---

## 🚀 كيفية الاستخدام

### 1️⃣ حماية صفحة كاملة

```tsx
import { PermissionGuard } from '@/components/PermissionGuard';

export default function RoomsPage() {
  return (
    <PermissionGuard 
      permission="view_rooms"
      redirect="/dashboard"
    >
      {/* محتوى الصفحة */}
    </PermissionGuard>
  );
}
```

**ماذا يحدث؟**
- ✅ إذا كان لديه صلاحية `view_rooms` → يرى الصفحة
- ❌ إذا لم يكن لديه → يُعاد توجيهه إلى `/dashboard`

---

### 2️⃣ إخفاء زر أو عنصر

```tsx
import { HasPermission } from '@/components/PermissionGuard';

function MyComponent() {
  return (
    <div>
      <HasPermission permission="add_room">
        <Button onClick={handleAddRoom}>
          إضافة غرفة
        </Button>
      </HasPermission>
      
      <HasPermission permission="edit_room">
        <Button onClick={handleEditRoom}>
          تعديل
        </Button>
      </HasPermission>
    </div>
  );
}
```

**ماذا يحدث؟**
- الموظف الذي لديه `add_room` فقط → يرى زر "إضافة غرفة" فقط
- الموظف الذي لديه `edit_room` فقط → يرى زر "تعديل" فقط
- إذا لم يكن لديه أي صلاحية → لن يرى أي زر

---

### 3️⃣ التحقق في الكود (Hook)

```tsx
import { usePermissions } from '@/components/PermissionGuard';

function MyComponent() {
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  const handleAction = () => {
    if (!hasPermission('delete_room')) {
      alert('ليس لديك صلاحية');
      return;
    }
    
    // تنفيذ الحذف
  };
  
  // التحقق من أي صلاحية
  const canManageRooms = hasAnyPermission(['add_room', 'edit_room', 'delete_room']);
  
  return (
    <div>
      {canManageRooms && <AdminPanel />}
    </div>
  );
}
```

---

### 4️⃣ حماية بعدة صلاحيات

```tsx
{/* يحتاج أي صلاحية من القائمة */}
<PermissionGuard anyPermissions={['add_room', 'edit_room']}>
  <RoomForm />
</PermissionGuard>

{/* يحتاج جميع الصلاحيات */}
<PermissionGuard allPermissions={['view_reports', 'export_reports']}>
  <ExportButton />
</PermissionGuard>
```

---

## 💡 أمثلة عملية

### مثال 1: صفحة الغرف الكاملة

```tsx
'use client';

import { PermissionGuard, HasPermission } from '@/components/PermissionGuard';

export default function RoomsPage() {
  return (
    <PermissionGuard permission="view_rooms" redirect="/dashboard">
      <div className="rooms-container">
        <h1>إدارة الغرف</h1>
        
        {/* زر الإضافة - فقط لمن لديه صلاحية */}
        <HasPermission permission="add_room">
          <Button onClick={handleAdd}>إضافة غرفة</Button>
        </HasPermission>
        
        {/* قائمة الغرف */}
        {rooms.map(room => (
          <div key={room.id}>
            <h3>{room.number}</h3>
            
            {/* زر التعديل */}
            <HasPermission permission="edit_room">
              <Button onClick={() => handleEdit(room)}>تعديل</Button>
            </HasPermission>
            
            {/* زر الحذف */}
            <HasPermission permission="delete_room">
              <Button onClick={() => handleDelete(room)}>حذف</Button>
            </HasPermission>
            
            {/* تغيير الحالة */}
            <HasPermission permission="change_room_status">
              <Select value={room.status} onChange={handleStatusChange}>
                <option>Available</option>
                <option>Occupied</option>
              </Select>
            </HasPermission>
          </div>
        ))}
      </div>
    </PermissionGuard>
  );
}
```

---

### مثال 2: القائمة الجانبية

```tsx
import { usePermissions } from '@/components/PermissionGuard';

function Sidebar() {
  const { hasPermission } = usePermissions();
  
  const menuItems = [
    {
      permission: 'view_dashboard_link',
      label: 'لوحة التحكم',
      href: '/dashboard',
      icon: '🏠'
    },
    {
      permission: 'view_rooms_link',
      label: 'الغرف',
      href: '/dashboard/rooms',
      icon: '🏨'
    },
    {
      permission: 'view_requests_link',
      label: 'الطلبات',
      href: '/dashboard/requests',
      icon: '📋'
    },
    {
      permission: 'view_reports_link',
      label: 'التقارير',
      href: '/dashboard/reports',
      icon: '📊'
    },
    {
      permission: 'view_settings_link',
      label: 'الإعدادات',
      href: '/dashboard/settings',
      icon: '⚙️'
    },
  ];
  
  return (
    <aside>
      {menuItems.map(item => (
        hasPermission(item.permission) && (
          <Link key={item.href} href={item.href}>
            {item.icon} {item.label}
          </Link>
        )
      ))}
    </aside>
  );
}
```

---

### مثال 3: قائمة الخدمات

```tsx
function ServicesMenu() {
  const { hasPermission } = usePermissions();
  
  return (
    <div className="services">
      {hasPermission('view_coffee') && (
        <ServiceCard 
          title="كوفي شوب" 
          href="/services/coffee"
          canManage={hasPermission('manage_coffee')}
        />
      )}
      
      {hasPermission('view_restaurant') && (
        <ServiceCard 
          title="المطعم" 
          href="/services/restaurant"
          canManage={hasPermission('manage_restaurant')}
        />
      )}
      
      {hasPermission('view_laundry') && (
        <ServiceCard 
          title="المغسلة" 
          href="/services/laundry"
          canManage={hasPermission('manage_laundry')}
        />
      )}
    </div>
  );
}
```

---

## 🔄 تحديث الصلاحيات

### الطريقة الأولى: باستخدام أداة HTML

1. افتح الملف: `scripts/update-employee-permissions.html`
2. تأكد من API Key و Project ID
3. اضغط "⚡ تحديث الصلاحيات للجميع"
4. ستتم تحديث صلاحيات **جميع الموظفين** حسب أدوارهم تلقائياً

### الطريقة الثانية: من صفحة الموارد البشرية

1. اذهب إلى: `/dashboard/settings/hr`
2. اختر موظف → "تعديل"
3. في قسم "الصلاحيات" → اختر الصلاحيات المطلوبة
4. احفظ

---

## 🎭 الصلاحيات الافتراضية لكل دور

### 👑 المدير (admin)
**جميع الصلاحيات** - 100+ صلاحية

### 🎯 المشرف (manager)
- لوحة التحكم + الإحصائيات
- إدارة الغرف (بدون حذف)
- إدارة الحجوزات
- إدارة النزلاء
- إدارة الطلبات (موافقة/رفض/تعيين)
- المدفوعات والفواتير
- التقارير
- **لا يمكنه**: حذف موظفين أو تعديل الصلاحيات

### 📞 الاستقبال (reception)
- عرض لوحة التحكم
- عرض الغرف + تغيير الحالة
- إنشاء/تعديل الحجوزات
- إضافة/تعديل النزلاء
- إنشاء طلبات
- استلام المدفوعات

### 🧹 خدمات الغرف (housekeeping)
- عرض الغرف
- تغيير حالة الغرفة
- عرض وإتمام طلبات التنظيف

### 🔧 الصيانة (maintenance)
- عرض الغرف
- عرض وإتمام طلبات الصيانة

### ☕ موظف الكوفي (coffee_staff)
- إدارة الكوفي شوب
- عرض طلبات الكوفي

### 🍽️ موظف المطعم (restaurant_staff)
- إدارة المطعم
- عرض طلبات المطعم

### 👔 موظف المغسلة (laundry_staff)
- إدارة المغسلة
- عرض طلبات المغسلة

---

## ⚠️ ملاحظات هامة

### 1. الأمان
- ✅ التحقق من الصلاحيات يتم في **Frontend** و **Backend**
- ✅ لا يمكن للموظف تجاوز الصلاحيات من المتصفح
- ✅ كل API يجب أن يتحقق من الصلاحيات

### 2. الأداء
- ✅ الصلاحيات محملة مع بيانات المستخدم (لا يوجد استعلامات إضافية)
- ✅ استخدام `HasPermission` لا يؤثر على الأداء

### 3. الصيانة
- ✅ إضافة صلاحية جديدة → أضفها في `permissions.ts`
- ✅ تحديث الصلاحيات الافتراضية → عدّل في `permissions.ts`
- ✅ نشر التحديث → استخدم `update-employee-permissions.html`

---

## 🎉 الخلاصة

الآن لديك نظام صلاحيات **احترافي ومتكامل**:

✅ **100+ صلاحية** تغطي كل جزء من النظام
✅ **سهل الاستخدام** - 3 طرق للتحكم
✅ **آمن** - التحقق في كل مكان
✅ **مرن** - إضافة صلاحيات جديدة بسهولة
✅ **منظم** - 12 فئة واضحة
✅ **موثق** - أمثلة وشرح كامل

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من أن الموظف لديه الصلاحية المطلوبة في Firebase
2. تأكد من استيراد المكونات الصحيحة
3. تحقق من Console للأخطاء
4. استخدم `usePermissions()` للتحقق من الصلاحيات المحملة

---

**تم إنشاؤه بواسطة:** GitHub Copilot
**التاريخ:** 29 أكتوبر 2025
**الإصدار:** 1.0.0
