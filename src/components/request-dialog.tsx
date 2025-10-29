'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Send, Loader2 } from 'lucide-react';
import { addRequest, getEmployees, Employee } from '@/lib/firebase-data';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username?: string;
    email?: string;
    name?: string;
  } | null;
}

const REQUEST_TYPES = [
  { value: 'maintenance', label: '🔧 صيانة', icon: '🔧' },
  { value: 'cleaning', label: '🧹 تنظيف', icon: '🧹' },
  { value: 'food', label: '🍔 طعام', icon: '🍔' },
  { value: 'laundry', label: '👔 غسيل', icon: '👔' },
  { value: 'coffee', label: '☕ قهوة', icon: '☕' },
  { value: 'complaint', label: '⚠️ شكوى', icon: '⚠️' },
  { value: 'inquiry', label: '❓ استفسار', icon: '❓' },
  { value: 'other', label: '📋 أخرى', icon: '📋' }
];

export function RequestDialog({ isOpen, onClose, currentUser }: RequestDialogProps) {
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const employeesList = await getEmployees();
      // تصفية الموظفين المتاحين فقط
      setEmployees(employeesList.filter(emp => emp.status === 'available'));
    } catch (error) {
      console.error('خطأ في تحميل الموظفين:', error);
    }
  };

  const handleSubmit = async () => {
    if (!requestType || !description.trim() || !selectedEmployee || !roomNumber.trim()) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. إنشاء الطلب في صفحة طلبات النزلاء
      const requestId = await addRequest({
        room: roomNumber,
        guest: currentUser?.name || currentUser?.username || 'ضيف',
        type: REQUEST_TYPES.find(t => t.value === requestType)?.label || requestType,
        description: description,
        priority: priority,
        status: 'pending',
        assignedEmployee: selectedEmployee,
        createdAt: new Date().toISOString(),
      });

      if (!requestId) {
        throw new Error('فشل في إنشاء الطلب');
      }

      // 2. إرسال رسالة في المحادثات للموظف المختار
      const currentUserId = currentUser?.username || currentUser?.email;
      const chatId = [currentUserId, selectedEmployee].sort().join('_');

      await addDoc(collection(db, 'messages'), {
        chatId: chatId,
        senderId: currentUserId,
        text: `📋 طلب جديد: ${REQUEST_TYPES.find(t => t.value === requestType)?.label}\n\n📍 غرفة: ${roomNumber}\n⚠️ الأولوية: ${priority === 'high' ? 'عالية' : priority === 'medium' ? 'متوسطة' : 'منخفضة'}\n\n📝 التفاصيل:\n${description}\n\n🆔 رقم الطلب: #${requestId.slice(-6)}`,
        type: 'text',
        timestamp: serverTimestamp(),
        read: false,
      });

      // 3. إشعار نجاح
      alert('✅ تم إرسال الطلب بنجاح!');
      
      // 4. إعادة تعيين النموذج
      setRequestType('');
      setDescription('');
      setPriority('medium');
      setSelectedEmployee('');
      setRoomNumber('');
      onClose();
    } catch (error: any) {
      console.error('خطأ في إرسال الطلب:', error);
      setError(error.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            📋 إرسال طلب جديد
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* نوع الطلب */}
          <div className="space-y-2">
            <Label className="text-purple-200 font-semibold">نوع الطلب *</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                <SelectValue placeholder="اختر نوع الطلب" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-purple-500/30 z-[100]">
                {REQUEST_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-white">
                    <span className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* رقم الغرفة */}
          <div className="space-y-2">
            <Label className="text-purple-200 font-semibold">رقم الغرفة *</Label>
            <Input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="مثال: 101"
              className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
            />
          </div>

          {/* الأولوية */}
          <div className="space-y-2">
            <Label className="text-purple-200 font-semibold">الأولوية *</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-purple-500/30 z-[100]">
                <SelectItem value="low" className="text-white">🟢 منخفضة</SelectItem>
                <SelectItem value="medium" className="text-white">🟡 متوسطة</SelectItem>
                <SelectItem value="high" className="text-white">🔴 عالية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* الموظف المسؤول */}
          <div className="space-y-2">
            <Label className="text-purple-200 font-semibold">الموظف المسؤول *</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-purple-500/30 z-[100]">
                {employees.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    لا يوجد موظفين متاحين حالياً
                  </div>
                ) : (
                  employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.username} className="text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>{emp.name}</span>
                        <span className="text-xs text-gray-400">({emp.department})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* الوصف */}
          <div className="space-y-2">
            <Label className="text-purple-200 font-semibold">تفاصيل الطلب *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب تفاصيل طلبك هنا..."
              rows={4}
              className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 ml-2" />
                  إرسال الطلب
                </>
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
              className="border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
