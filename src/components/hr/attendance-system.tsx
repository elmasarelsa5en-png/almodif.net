'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut, Bell, AlertCircle } from 'lucide-react';

interface Employee {
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

interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'present' | 'absent' | 'late';
  location?: string;
}

interface Notification {
  id: string;
  type: 'check_in' | 'check_out' | 'late' | 'absent';
  employeeName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AttendanceSystemProps {
  employees: Employee[];
  attendances: Attendance[];
  onAttendanceUpdate: (attendances: Attendance[]) => void;
}

export function AttendanceSystem({ employees, attendances, onAttendanceUpdate }: AttendanceSystemProps) {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // تحديد المديرين (الموظفين الذين لديهم صلاحيات إدارية)
  const managers = employees.filter(emp =>
    emp.permissions.includes('hr:view_employees') ||
    emp.permissions.includes('attendance:view') ||
    emp.position.toLowerCase().includes('مدير')
  );

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

  // إضافة إشعار جديد
  const addNotification = (type: Notification['type'], employeeName: string, message: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      employeeName,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };

    const updatedNotifications = [newNotification, ...notifications];
    saveNotifications(updatedNotifications);

    // إشعار صوتي للمديرين (إذا كان متاحاً)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`إشعار حضور: ${employeeName}`, {
        body: message,
        icon: '/favicon.ico'
      });
    }
  };

  // طلب إذن الإشعارات
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  // تسجيل الدخول
  const handleCheckIn = (employee: Employee) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeString = now.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // التحقق من وجود تسجيل دخول سابق اليوم
    const existingAttendance = attendances.find(
      a => a.employeeId === employee.id && a.date === today
    );

    if (existingAttendance && existingAttendance.checkIn) {
      alert('لقد قمت بتسجيل الدخول مسبقاً اليوم');
      return;
    }

    const newAttendance: Attendance = {
      id: Date.now().toString(),
      employeeId: employee.id,
      employeeName: employee.name,
      date: today,
      checkIn: timeString,
      checkOut: null,
      status: 'present'
    };

    let updatedAttendances;
    if (existingAttendance) {
      updatedAttendances = attendances.map(a =>
        a.id === existingAttendance.id ? { ...a, checkIn: timeString } : a
      );
    } else {
      updatedAttendances = [...attendances, newAttendance];
    }

    onAttendanceUpdate(updatedAttendances);

    // إرسال إشعار للمديرين
    const message = `قام ${employee.name} بتسجيل الدخول في ${timeString}`;
    addNotification('check_in', employee.name, message);

    alert(`تم تسجيل الدخول بنجاح في ${timeString}`);
  };

  // تسجيل الخروج
  const handleCheckOut = (employee: Employee) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeString = now.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const existingAttendance = attendances.find(
      a => a.employeeId === employee.id && a.date === today
    );

    if (!existingAttendance || !existingAttendance.checkIn) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    if (existingAttendance.checkOut) {
      alert('لقد قمت بتسجيل الخروج مسبقاً اليوم');
      return;
    }

    const updatedAttendances = attendances.map(a =>
      a.id === existingAttendance.id ? { ...a, checkOut: timeString } : a
    );

    onAttendanceUpdate(updatedAttendances);

    // إرسال إشعار للمديرين
    const message = `قام ${employee.name} بتسجيل الخروج في ${timeString}`;
    addNotification('check_out', employee.name, message);

    alert(`تم تسجيل الخروج بنجاح في ${timeString}`);
  };

  // تحديد حالة الحضور للموظف اليوم
  const getTodayAttendance = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return attendances.find(a => a.employeeId === employeeId && a.date === today);
  };

  // حساب عدد الإشعارات غير المقروءة
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // تحديد الإشعارات كمقروءة
  const markNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updatedNotifications);
  };

  return (
    <div className="space-y-6">
      {/* رأس النظام */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">نظام الحضور والانصراف</h3>
          <p className="text-gray-300 text-sm">تسجيل الدخول والخروج مع إشعارات فورية للمديرين</p>
        </div>

        <div className="flex items-center gap-4">
          {/* زر الإشعارات */}
          <div className="relative">
            <Button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsAsRead();
              }}
              variant="outline"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 min-w-[18px] h-[18px] flex items-center justify-center">
                  {unreadNotificationsCount}
                </Badge>
              )}
            </Button>

            {/* قائمة الإشعارات */}
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-slate-700">
                  <h4 className="text-white font-semibold">الإشعارات</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.id} className={`p-3 border-b border-slate-700 hover:bg-slate-700/50 ${!notification.read ? 'bg-blue-500/10' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.type === 'check_in' ? 'bg-green-500/20 text-green-400' :
                            notification.type === 'check_out' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {notification.type === 'check_in' ? <LogIn className="w-4 h-4" /> :
                             notification.type === 'check_out' ? <LogOut className="w-4 h-4" /> :
                             <AlertCircle className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{notification.employeeName}</p>
                            <p className="text-gray-300 text-xs">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(notification.timestamp).toLocaleString('ar-SA')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* زر طلب إذن الإشعارات */}
          <Button
            onClick={requestNotificationPermission}
            variant="outline"
            className="border-green-500/50 text-green-400 hover:bg-green-500/20"
          >
            تفعيل الإشعارات
          </Button>
        </div>
      </div>

      {/* اختيار الموظف الحالي */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            تسجيل الحضور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                اختر الموظف الحالي:
              </label>
              <select
                value={currentEmployee?.id || ''}
                onChange={(e) => {
                  const employee = employees.find(emp => emp.id === e.target.value);
                  setCurrentEmployee(employee || null);
                }}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر موظف...</option>
                {employees.filter(emp => emp.status === 'active').map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>

            {currentEmployee && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-semibold">{currentEmployee.name}</h4>
                    <p className="text-gray-300 text-sm">{currentEmployee.position}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCheckIn(currentEmployee)}
                      disabled={getTodayAttendance(currentEmployee.id)?.checkIn ? true : false}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      تسجيل الدخول
                    </Button>
                    <Button
                      onClick={() => handleCheckOut(currentEmployee)}
                      disabled={!getTodayAttendance(currentEmployee.id)?.checkIn || getTodayAttendance(currentEmployee.id)?.checkOut ? true : false}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      تسجيل الخروج
                    </Button>
                  </div>
                </div>

                {/* حالة الحضور اليوم */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-600/50 rounded-lg p-3">
                    <p className="text-gray-300 text-sm">الدخول</p>
                    <p className="text-white font-semibold">
                      {getTodayAttendance(currentEmployee.id)?.checkIn || 'لم يسجل'}
                    </p>
                  </div>
                  <div className="bg-slate-600/50 rounded-lg p-3">
                    <p className="text-gray-300 text-sm">الخروج</p>
                    <p className="text-white font-semibold">
                      {getTodayAttendance(currentEmployee.id)?.checkOut || 'لم يسجل'}
                    </p>
                  </div>
                  <div className="bg-slate-600/50 rounded-lg p-3">
                    <p className="text-gray-300 text-sm">الحالة</p>
                    <Badge variant={getTodayAttendance(currentEmployee.id)?.status === 'present' ? 'default' : 'secondary'}>
                      {getTodayAttendance(currentEmployee.id)?.status === 'present' ? 'حاضر' : 'غائب'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* قائمة الحضور اليوم */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">الحضور اليوم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendances
              .filter(a => a.date === new Date().toISOString().split('T')[0])
              .map(attendance => {
                const employee = employees.find(e => e.id === attendance.employeeId);
                return (
                  <div key={attendance.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                    <div>
                      <p className="text-white font-medium">{attendance.employeeName}</p>
                      <p className="text-gray-300 text-sm">{employee?.position}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-300">الدخول</p>
                        <p className="text-green-400">{attendance.checkIn || '-'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-300">الخروج</p>
                        <p className="text-blue-400">{attendance.checkOut || '-'}</p>
                      </div>
                      <Badge variant={attendance.status === 'present' ? 'default' : 'secondary'}>
                        {attendance.status === 'present' ? 'حاضر' : 'غائب'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            {attendances.filter(a => a.date === new Date().toISOString().split('T')[0]).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                لا يوجد تسجيلات حضور اليوم
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}