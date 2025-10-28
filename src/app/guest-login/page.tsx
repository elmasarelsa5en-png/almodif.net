'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, Home, CheckCircle2, AlertCircle } from 'lucide-react';

export default function GuestLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      setError('الرجاء إدخال الاسم ورقم الهاتف');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // البحث عن الحجز في الغرف المشغولة
      const rooms = JSON.parse(localStorage.getItem('hotel_rooms_data') || '[]');
      
      // البحث عن غرفة مشغولة أو محجوزة بنفس اسم النزيل ورقم الهاتف
      const matchedRoom = rooms.find((room: any) => {
        const isOccupied = room.status === 'Occupied' || room.status === 'Reserved';
        const nameMatch = room.guestName && room.guestName.trim().toLowerCase() === formData.name.trim().toLowerCase();
        
        // البحث في events عن رقم الهاتف
        let phoneMatch = false;
        if (room.events && Array.isArray(room.events)) {
          phoneMatch = room.events.some((event: any) => 
            event.description && event.description.includes(formData.phone)
          );
        }
        
        // البحث في بيانات الحجز المحفوظة
        if (!phoneMatch && room.guestPhone) {
          phoneMatch = room.guestPhone === formData.phone;
        }
        
        return isOccupied && nameMatch && phoneMatch;
      });

      if (!matchedRoom) {
        // محاولة البحث بالاسم فقط إذا لم يتم إيجاد تطابق كامل
        const roomByName = rooms.find((room: any) => {
          const isOccupied = room.status === 'Occupied' || room.status === 'Reserved';
          const nameMatch = room.guestName && room.guestName.trim().toLowerCase() === formData.name.trim().toLowerCase();
          return isOccupied && nameMatch;
        });

        if (roomByName) {
          // وُجِد الاسم لكن رقم الهاتف غير متطابق
          setError('رقم الهاتف غير مطابق للحجز المسجل. يرجى التحقق من رقم الهاتف.');
          setLoading(false);
          return;
        }

        // لم يتم العثور على حجز
        setError('عذراً، لم يتم العثور على حجز بهذا الاسم. يرجى التواصل مع الاستقبال.');
        setLoading(false);
        return;
      }

      // تم العثور على الحجز - حفظ بيانات النزيل
      const guestData = {
        name: formData.name,
        phone: formData.phone,
        roomNumber: matchedRoom.number,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('guest_session', JSON.stringify(guestData));

      // التوجه لصفحة المنيو الرئيسية
      setTimeout(() => {
        router.push('/guest-menu');
      }, 800);

    } catch (error) {
      console.error('Error during login:', error);
      setError('حدث خطأ أثناء التحقق من البيانات. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Home className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">مرحباً بك</CardTitle>
          <p className="text-gray-300 text-sm">يرجى إدخال بياناتك للوصول إلى خدمات الفندق</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* رسالة خطأ */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* الاسم */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white flex items-center gap-2">
                <User className="h-4 w-4" />
                الاسم الكامل
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسمك كما هو مسجل في الحجز"
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* رقم الهاتف */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white flex items-center gap-2">
                <Phone className="h-4 w-4" />
                رقم الهاتف
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05xxxxxxxx"
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* معلومات إضافية */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-300 text-sm space-y-1">
                  <p className="font-semibold">ملاحظة هامة:</p>
                  <p>• تأكد من إدخال الاسم كما هو مسجل في الحجز</p>
                  <p>• تأكد من إدخال رقم الهاتف المسجل في الحجز</p>
                  <p>• سيتم التحقق تلقائياً من بياناتك</p>
                </div>
              </div>
            </div>

            {/* زر الدخول */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري التحقق من البيانات...
                </div>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 ml-2" />
                  تحقق ودخول
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs mb-2">
              إذا كانت لديك مشكلة في تسجيل الدخول
            </p>
            <p className="text-gray-400 text-xs">
              يرجى التواصل مع الاستقبال
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
