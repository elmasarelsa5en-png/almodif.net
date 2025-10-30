'use client';

import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// بيانات ضيوف تجريبيين
const sampleGuests = [
  {
    name: 'أحمد محمد علي',
    nationalId: '1234567890',
    phone: '+966501234567',
    roomNumber: '101',
    password: 'guest123',
    checkIn: new Date('2025-10-28'),
    checkOut: new Date('2025-11-02')
  },
  {
    name: 'فاطمة عبدالله',
    nationalId: '2345678901',
    phone: '+966502345678',
    roomNumber: '205',
    password: 'guest456',
    checkIn: new Date('2025-10-29'),
    checkOut: new Date('2025-11-05')
  },
  {
    name: 'خالد سعيد',
    nationalId: '3456789012',
    phone: '+966503456789',
    roomNumber: '310',
    password: 'guest789',
    checkIn: new Date('2025-10-30'),
    checkOut: new Date('2025-11-03')
  },
  {
    name: 'سارة محمود',
    nationalId: '4567890123',
    phone: '+966504567890',
    roomNumber: '402',
    password: 'guest321',
    checkIn: new Date('2025-10-25'),
    checkOut: new Date('2025-10-30')
  },
  {
    name: 'يوسف أحمد',
    nationalId: '5678901234',
    phone: '+966505678901',
    roomNumber: '508',
    password: 'guest654',
    checkIn: new Date('2025-10-31'),
    checkOut: new Date('2025-11-07')
  },
  {
    name: 'نورة سالم',
    nationalId: '6789012345',
    phone: '+966506789012',
    roomNumber: '615',
    password: 'guest987',
    checkIn: new Date('2025-10-27'),
    checkOut: new Date('2025-11-01')
  },
  {
    name: 'عبدالرحمن خالد',
    nationalId: '7890123456',
    phone: '+966507890123',
    roomNumber: '720',
    password: 'guest147',
    checkIn: new Date('2025-10-29'),
    checkOut: new Date('2025-11-04')
  },
  {
    name: 'ليلى حسن',
    nationalId: '8901234567',
    phone: '+966508901234',
    roomNumber: '823',
    password: 'guest258',
    checkIn: new Date('2025-10-26'),
    checkOut: new Date('2025-10-31')
  }
];

export default function AddGuestsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [addedCount, setAddedCount] = useState(0);

  const addSampleGuests = async () => {
    setLoading(true);
    setMessage('جاري إضافة الضيوف...');
    setAddedCount(0);

    try {
      let count = 0;
      
      for (const guest of sampleGuests) {
        await addDoc(collection(db, 'guests'), {
          ...guest,
          checkIn: Timestamp.fromDate(guest.checkIn),
          checkOut: Timestamp.fromDate(guest.checkOut),
          createdAt: Timestamp.now(),
          lastLogin: Timestamp.now(),
          isActive: true
        });
        
        count++;
        setAddedCount(count);
        setMessage(`تمت إضافة ${count} من ${sampleGuests.length} ضيف...`);
      }

      setMessage(`✅ تمت إضافة ${count} ضيف بنجاح!`);
      
      setTimeout(() => {
        window.location.href = '/dashboard/guests';
      }, 2000);

    } catch (error) {
      console.error('Error adding guests:', error);
      setMessage('❌ حدث خطأ أثناء إضافة الضيوف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 flex items-center justify-center" dir="rtl">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-2xl text-center">
            إضافة ضيوف تجريبيين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-white/80 text-center space-y-2">
            <p>سيتم إضافة {sampleGuests.length} ضيف تجريبي إلى قاعدة البيانات</p>
            <p className="text-sm">يمكنك استخدامهم لاختبار النظام</p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-center ${
              message.includes('✅') 
                ? 'bg-green-500/20 text-green-400' 
                : message.includes('❌')
                ? 'bg-red-500/20 text-red-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {message}
            </div>
          )}

          {addedCount > 0 && (
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex justify-between text-white/80 text-sm mb-2">
                <span>التقدم</span>
                <span>{addedCount} / {sampleGuests.length}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(addedCount / sampleGuests.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={addSampleGuests}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6"
            >
              {loading ? 'جاري الإضافة...' : 'إضافة الضيوف التجريبيين'}
            </Button>

            <Button
              onClick={() => window.location.href = '/dashboard/guests'}
              variant="outline"
              className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              الذهاب إلى صفحة الضيوف
            </Button>
          </div>

          <div className="bg-white/10 rounded-lg p-4 text-white/70 text-sm space-y-2">
            <p className="font-semibold text-white">ملاحظات:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>سيتم إضافة الضيوف إلى collection "guests" في Firestore</li>
              <li>يمكنك تسجيل الدخول لتطبيق الضيف باستخدام رقم الهوية وكلمة المرور</li>
              <li>كلمة المرور الافتراضية: guest123, guest456, guest789, إلخ</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
