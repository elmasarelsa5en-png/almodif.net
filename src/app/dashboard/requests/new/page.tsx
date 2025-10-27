'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Send,
  X,
  User,
  Phone,
  FileText,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getRequestTypes, type RequestType } from '@/lib/requests-management';

interface GuestRequest {
  id: string;
  room: string;
  guest: string;
  phone?: string;
  type: string;
  description: string;
  notes: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'awaiting_employee_approval';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  assignedEmployee?: string;
  employeeApprovalStatus?: 'pending' | 'approved' | 'rejected';
  employeeApprovedAt?: string;
  managerNotified?: boolean;
}

interface Room {
  id: string;
  number: string;
  guestName?: string;
  phone?: string;
  status: string;
}

interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  position?: string;
  status?: string;
  department?: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [formData, setFormData] = useState({
    room: '',
    guest: '',
    phone: '',
    type: '',
    notes: '',
    description: '', // الحقل الخاص بالملاحظات (سيتم إعادة تسميته)
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedEmployee: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // تحميل الشقق والموظفين عند بدء الصفحة
  useEffect(() => {
    loadRoomsAndEmployees();

    // الاستماع لتحديثات البيانات
    const handleStorageChange = () => {
      loadRoomsAndEmployees();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadRoomsAndEmployees = () => {
    try {
      // تحميل الشقق المشغولة من localStorage
      const roomsData = JSON.parse(localStorage.getItem('hotel_rooms_data') || '[]');
      const occupiedRooms = roomsData.filter((room: Room) => room.status === 'Occupied');
      setRooms(occupiedRooms);

      // تحميل الموظفين من HR (hr_employees) أولاً، وإلا من employees_list
      let employeesData = JSON.parse(localStorage.getItem('hr_employees') || '[]');
      if (employeesData.length === 0) {
        employeesData = JSON.parse(localStorage.getItem('employees_list') || '[]');
      }
      setEmployees(employeesData);

      // تحميل أنواع الطلبات من الإعدادات
      const types = getRequestTypes();
      setRequestTypes(types);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // عند اختيار غرفة، تحديث بيانات النزيل والهاتف تلقائياً
  const handleRoomChange = (roomNumber: string) => {
    setFormData((prev) => ({ ...prev, room: roomNumber }));
    
    const selectedRoom = rooms.find((r) => r.number === roomNumber);
    if (selectedRoom) {
      setFormData((prev) => ({
        ...prev,
        guest: selectedRoom.guestName || '',
        phone: selectedRoom.phone || '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.room.trim()) newErrors.room = 'رقم الغرفة مطلوب';
    if (!formData.guest.trim()) newErrors.guest = 'اسم النزيل مطلوب';
    if (!formData.type) newErrors.type = 'نوع الطلب مطلوب';
    // الملاحظات أصبحت اختيارية - تم حذف التحقق منها
    if (!formData.assignedEmployee) newErrors.assignedEmployee = 'يجب تحديد موظف';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Generate unique ID
      const id = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create request object
      const newRequest: GuestRequest = {
        id,
        room: formData.room,
        guest: formData.guest,
        phone: formData.phone || undefined,
        type: formData.type,
        description: formData.notes, // الملاحظات
        notes: formData.notes,
        status: 'awaiting_employee_approval',
        createdAt: new Date().toISOString(),
        priority: formData.priority,
        assignedEmployee: formData.assignedEmployee,
        employeeApprovalStatus: 'pending',
      };

      // Get existing requests
      const existingRequests = JSON.parse(localStorage.getItem('guest-requests') || '[]');

      // Add new request at the beginning
      const updatedRequests = [newRequest, ...existingRequests];

      // Save to localStorage
      localStorage.setItem('guest-requests', JSON.stringify(updatedRequests));

      // Trigger storage event for real-time updates
      window.dispatchEvent(new Event('storage'));

      // Show success message
      setSuccessMessage('✅ تم إنشاء الطلب بنجاح! سيتم إخطار الموظف والمدير.');

      // Reset form
      setFormData({
        room: '',
        guest: '',
        phone: '',
        type: '',
        notes: '',
        description: '',
        priority: 'medium',
        assignedEmployee: '',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/requests');
      }, 2000);
    } catch (error) {
      console.error('Error creating request:', error);
      setErrors({ submit: 'حدث خطأ أثناء إنشاء الطلب' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 relative overflow-hidden" dir="rtl">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </Button>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                  طلب جديد
                </h1>
                <p className="text-green-200/80">
                  إنشاء طلب جديد من النزيل
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <Card className="bg-green-500/20 backdrop-blur-md border-green-500/30 shadow-2xl mb-6">
              <CardContent className="p-4 text-green-300 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span>{successMessage}</span>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grid for form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Room Number - Dropdown */}
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      رقم الغرفة
                      <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="room"
                      value={formData.room}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className={`w-full bg-white/10 border-2 text-white p-2 rounded-lg appearance-none cursor-pointer ${
                        errors.room ? 'border-red-500' : 'border-white/20 focus:border-green-500'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'left 8px center',
                        paddingLeft: '28px',
                      }}
                    >
                      <option value="" className="bg-slate-900">-- اختر الغرفة --</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.number} className="bg-slate-900">
                          الغرفة {room.number} - {room.guestName || 'بدون نزيل'}
                        </option>
                      ))}
                    </select>
                    {errors.room && <p className="text-red-400 text-xs">{errors.room}</p>}
                  </div>

                  {/* Guest Name - Auto-filled */}
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      اسم النزيل
                      <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      name="guest"
                      value={formData.guest}
                      onChange={handleInputChange}
                      placeholder="سيتم ملؤه تلقائياً"
                      readOnly
                      className={`bg-white/10 border-2 text-white placeholder:text-white/50 cursor-not-allowed ${
                        errors.guest ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.guest && <p className="text-red-400 text-xs">{errors.guest}</p>}
                  </div>

                  {/* Phone - Auto-filled */}
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-400" />
                      رقم الهاتف
                      <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="سيتم ملؤه تلقائياً"
                      readOnly
                      className="bg-white/10 border-2 border-white/20 focus:border-green-500 text-white placeholder:text-white/50 cursor-not-allowed"
                    />
                  </div>

                  {/* Request Type */}
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      نوع الطلب
                      <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`w-full bg-white/10 border-2 text-white p-2 rounded-lg appearance-none cursor-pointer ${
                        errors.type ? 'border-red-500' : 'border-white/20 focus:border-green-500'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'left 8px center',
                        paddingLeft: '28px',
                      }}
                    >
                      <option value="" className="bg-slate-900">-- اختر نوع الطلب --</option>
                      {requestTypes.map((type) => (
                        <option key={type.id} value={type.name} className="bg-slate-900">
                          {type.icon && `${type.icon} `}{type.name}
                        </option>
                      ))}
                    </select>
                    {errors.type && <p className="text-red-400 text-xs">{errors.type}</p>}
                  </div>

                  {/* Assigned Employee */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      تعيين الموظف
                      <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="assignedEmployee"
                      value={formData.assignedEmployee}
                      onChange={handleInputChange}
                      className={`w-full bg-white/10 border-2 text-white p-2 rounded-lg appearance-none cursor-pointer ${
                        errors.assignedEmployee ? 'border-red-500' : 'border-white/20 focus:border-green-500'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'left 8px center',
                        paddingLeft: '28px',
                      }}
                    >
                      <option value="" className="bg-slate-900">-- اختر موظف --</option>
                      {employees.map((emp) => {
                        const designation = emp.position || emp.role || emp.department || '';
                        return (
                          <option key={emp.id} value={emp.id} className="bg-slate-900">
                            {emp.name} {designation ? `- ${designation}` : ''}
                          </option>
                        );
                      })}
                    </select>
                    {errors.assignedEmployee && <p className="text-red-400 text-xs">{errors.assignedEmployee}</p>}
                  </div>

                  {/* Priority */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-white/80 text-sm font-semibold">الأولوية</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, priority }))}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                            formData.priority === priority
                              ? priority === 'low'
                                ? 'bg-blue-500/40 border-2 border-blue-400 text-blue-300'
                                : priority === 'medium'
                                  ? 'bg-yellow-500/40 border-2 border-yellow-400 text-yellow-300'
                                  : 'bg-red-500/40 border-2 border-red-400 text-red-300'
                              : 'bg-white/10 border-2 border-white/20 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {priority === 'low' ? 'منخفضة' : priority === 'medium' ? 'متوسطة' : 'عالية'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes/Description */}
                <div className="space-y-2">
                  <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    الملاحظات
                    <span className="text-white/50 text-xs">(اختياري)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="أدخل الملاحظات والتفاصيل (اختياري)..."
                    rows={5}
                    className={`w-full bg-white/10 border-2 text-white placeholder:text-white/50 p-3 rounded-lg focus:outline-none resize-none ${
                      errors.notes ? 'border-red-500' : 'border-white/20 focus:border-green-500'
                    }`}
                  />
                  {errors.notes && <p className="text-red-400 text-xs">{errors.notes}</p>}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <Card className="bg-red-500/20 backdrop-blur-md border-red-500/30">
                    <CardContent className="p-4 text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>{errors.submit}</span>
                    </CardContent>
                  </Card>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                  >
                    <Send className="w-4 h-4 ml-2" />
                    {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20 flex-1"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="bg-blue-500/20 backdrop-blur-md border-blue-500/30 shadow-2xl mt-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-200 text-sm">
                  <p className="font-semibold mb-1">💡 ملاحظة مهمة:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>عند اختيار الغرفة: سيتم تعبئة اسم النزيل ورقم الهاتف تلقائياً</li>
                    <li>تحديد الموظف: سيتم إخطاره بالطلب فوراً مع نغمة صوتية</li>
                    <li>قبول الموظف: عند قبوله للطلب، سيتم إخطار المدير فوراً</li>
                    <li>الملاحظات: حقل اختياري يمكن تركه فارغاً</li>
                    <li>جميع الحقول المشار إليها بـ * مطلوبة</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
