// نظام الحضور الذكي
import React, { useState, useEffect } from 'react';
type Employee = {
  id: string;
  name: string;
  position: string;
  permissions: string[];
};
type Attendance = {
  employeeId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
};
type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  unread: boolean;
};
type AttendanceSystemProps = {
  employees: Employee[];
  attendances: Attendance[];
  onAttendanceUpdate: (attendances: Attendance[]) => void;
};
export function AttendanceSystem({ employees, attendances, onAttendanceUpdate }: AttendanceSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  // تحميل الإشعارات من localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('hr_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // حفظ الإشعارات في localStorage
  const saveNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem('hr_notifications', JSON.stringify(newNotifications));
  };

  // تغيير حالة الحضور لموظف
  const handleAttendance = (employeeId: string, status: 'present' | 'absent' | 'late') => {
    const updated = attendances.filter(a => !(a.employeeId === employeeId && a.date === selectedDate));
    updated.push({ employeeId, date: selectedDate, status });
    onAttendanceUpdate(updated);
    // إضافة إشعار
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      const newNotif: Notification = {
        id: Date.now() + '-' + employeeId,
        title: 'تحديث حضور',
        message: `تم تسجيل حضور ${emp.name} كـ ${status === 'present' ? 'حاضر' : status === 'late' ? 'متأخر' : 'غائب'}`,
        timestamp: Date.now(),
        unread: true,
      };
      saveNotifications([newNotif, ...notifications]);
    }
  };

  // جلب حالة الحضور لموظف في اليوم المحدد
  const getAttendanceStatus = (employeeId: string) => {
    const att = attendances.find(a => a.employeeId === employeeId && a.date === selectedDate);
    return att ? att.status : '';
  };

  // تغيير حالة قراءة الإشعار
  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    saveNotifications(updated);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'Cairo, Arial, sans-serif' }}>
      <h2 style={{ color: '#2980b9', textAlign: 'center' }}>نظام الحضور الذكي</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <label>تاريخ اليوم:
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ marginRight: 8 }} />
          </label>
        </div>
        <button onClick={() => setShowNotifications(s => !s)} style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>
          {showNotifications ? 'إخفاء الإشعارات' : `عرض الإشعارات (${notifications.filter(n => n.unread).length})`}
        </button>
      </div>

      {/* جدول الموظفين */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <thead>
          <tr style={{ background: '#f5f6fa' }}>
            <th style={{ padding: 8 }}>الموظف</th>
            <th style={{ padding: 8 }}>الوظيفة</th>
            <th style={{ padding: 8 }}>الحضور</th>
            <th style={{ padding: 8 }}>إجراء</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td style={{ padding: 8 }}>{emp.name}</td>
              <td style={{ padding: 8 }}>{emp.position}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>
                {getAttendanceStatus(emp.id) === 'present' && <span style={{ color: '#27ae60', fontWeight: 'bold' }}>حاضر</span>}
                {getAttendanceStatus(emp.id) === 'absent' && <span style={{ color: '#c0392b', fontWeight: 'bold' }}>غائب</span>}
                {getAttendanceStatus(emp.id) === 'late' && <span style={{ color: '#f39c12', fontWeight: 'bold' }}>متأخر</span>}
                {!getAttendanceStatus(emp.id) && <span style={{ color: '#7f8c8d' }}>—</span>}
              </td>
              <td style={{ padding: 8 }}>
                <button onClick={() => handleAttendance(emp.id, 'present')} style={{ marginRight: 4, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>حاضر</button>
                <button onClick={() => handleAttendance(emp.id, 'late')} style={{ marginRight: 4, background: '#f39c12', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>متأخر</button>
                <button onClick={() => handleAttendance(emp.id, 'absent')} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>غائب</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* قائمة الإشعارات */}
      {showNotifications && (
        <div style={{ marginTop: 24, background: '#f8f9fa', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px #eee' }}>
          <h3 style={{ color: '#2980b9' }}>الإشعارات</h3>
          {notifications.length === 0 && <div style={{ color: '#7f8c8d' }}>لا توجد إشعارات</div>}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notifications.map(n => (
              <li key={n.id} style={{ marginBottom: 10, background: n.unread ? '#eafaf1' : '#fff', borderRadius: 6, padding: 10, border: n.unread ? '1px solid #27ae60' : '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{n.title}</strong>
                  <div style={{ fontSize: 14 }}>{n.message}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{new Date(n.timestamp).toLocaleString('ar-EG')}</div>
                </div>
                {n.unread && <button onClick={() => markNotificationRead(n.id)} style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer' }}>تمت القراءة</button>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
