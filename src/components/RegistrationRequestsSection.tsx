'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Check, 
  X, 
  Phone, 
  IdCard, 
  Calendar, 
  Globe,
  Home,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notificationService } from '@/lib/notifications/notification-service';

interface RegistrationRequest {
  id: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestNationalId: string;
  guestDateOfBirth: string;
  guestNationality: string;
  status: string;
  createdAt: string;
  assignedRoom?: string;
  requestType?: 'existing' | 'new'; // نوع الطلب
}

interface Room {
  id: string;
  number: string;
  name: string;
  available: boolean;
}

export function RegistrationRequestsSection() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<{ [key: string]: string }>({});
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState<{ [key: string]: boolean }>({});

  // Load pending registration requests
  useEffect(() => {
    const q = query(
      collection(db, 'requests'),
      where('type', '==', 'تسجيل ضيف جديد'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RegistrationRequest[];
      
      setRequests(requestsData);
      setIsLoading(false);
      
      // Play sound if new requests arrived
      if (requestsData.length > 0) {
        playNotificationSound();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load available rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const q = query(
          collection(db, 'rooms'),
          where('available', '==', true)
        );
        const snapshot = await getDocs(q);
        const roomsData = snapshot.docs.map(doc => ({
          id: doc.id,
          number: doc.data().number || doc.data().name,
          name: doc.data().name,
          available: doc.data().available
        })) as Room[];
        setRooms(roomsData);
      } catch (error) {
        console.error('Error loading rooms:', error);
      }
    };

    loadRooms();
  }, []);

  const playNotificationSound = () => {
    try {
      // رنة طويلة للإشعار
      const audio = new Audio('/sounds/long-notification.mp3');
      audio.volume = 1.0;
      audio.loop = false;
      audio.play().catch(err => {
        console.log('Could not play sound:', err);
        // محاولة بديلة: استخدام Web Audio API لتوليد صوت
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // صوت بتردد 800Hz
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          
          // مدة 0.5 ثانية
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          
          // تكرار الصوت 3 مرات
          setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 1000;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.5);
          }, 600);
          
          setTimeout(() => {
            const osc3 = audioContext.createOscillator();
            const gain3 = audioContext.createGain();
            osc3.connect(gain3);
            gain3.connect(audioContext.destination);
            osc3.frequency.value = 1200;
            osc3.type = 'sine';
            gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc3.start(audioContext.currentTime);
            osc3.stop(audioContext.currentTime + 0.5);
          }, 1200);
        } catch (audioErr) {
          console.log('Could not play fallback sound:', audioErr);
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleApprove = async (request: RegistrationRequest) => {
    const roomNumber = selectedRoom[request.id];
    
    if (!roomNumber) {
      alert('الرجاء اختيار رقم الغرفة');
      return;
    }

    setProcessing({ ...processing, [request.id]: true });

    try {
      // 1. تحديث بيانات الضيف في guests
      const guestRef = doc(db, 'guests', request.guestId);
      await updateDoc(guestRef, {
        roomNumber: roomNumber,
        status: 'checked-in',
        checkInDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 2. تحديث حالة الطلب
      const requestRef = doc(db, 'requests', request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        assignedRoom: roomNumber,
        approvedAt: new Date().toISOString(),
        approvedBy: 'reception'
      });

      // 3. تحديث حالة الغرفة (ربطها بالضيف)
      const roomQuery = query(
        collection(db, 'rooms'),
        where('number', '==', roomNumber)
      );
      const roomSnapshot = await getDocs(roomQuery);
      if (!roomSnapshot.empty) {
        const roomDoc = roomSnapshot.docs[0];
        await updateDoc(doc(db, 'rooms', roomDoc.id), {
          available: false,
          guestId: request.guestId,
          guestName: request.guestName,
          guestNationalId: request.guestNationalId,
          checkInDate: new Date().toISOString()
        });
      }

      // 4. إرسال إشعار للضيف
      try {
        await notificationService.sendNotification('in_app', request.guestId, {
          subject: 'مرحباً بك',
          body: `مرحباً ${request.guestName}! تم تسجيل دخولك لغرفة رقم ${roomNumber}. نتمنى لك إقامة سعيدة! 🏨`,
          type: 'custom',
          priority: 'high',
          metadata: {
            roomNumber,
            guestId: request.guestId
          }
        });
      } catch (notifError) {
        console.error('Error sending notification to guest:', notifError);
      }

      alert(`✅ تم الموافقة وتخصيص الغرفة ${roomNumber} للضيف ${request.guestName}`);
      
      // Clear the selected room and menu
      const newSelectedRoom = { ...selectedRoom };
      delete newSelectedRoom[request.id];
      setSelectedRoom(newSelectedRoom);
      setShowActionMenu({ ...showActionMenu, [request.id]: false });

    } catch (error) {
      console.error('Error approving request:', error);
      alert('❌ حدث خطأ أثناء الموافقة على الطلب');
    } finally {
      setProcessing({ ...processing, [request.id]: false });
    }
  };

  // موافقة على ضيف جديد بدون تخصيص غرفة
  const handleApproveNewGuest = async (request: RegistrationRequest) => {
    if (!confirm(`هل أنت متأكد من الموافقة على انضمام ${request.guestName} كضيف جديد؟`)) {
      return;
    }

    setProcessing({ ...processing, [request.id]: true });

    try {
      // 1. تحديث بيانات الضيف
      const guestRef = doc(db, 'guests', request.guestId);
      await updateDoc(guestRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 2. تحديث حالة الطلب
      const requestRef = doc(db, 'requests', request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'reception',
        requestType: 'new'
      });

      // 3. إرسال إشعار للضيف
      try {
        await notificationService.sendNotification('in_app', request.guestId, {
          subject: 'تمت الموافقة',
          body: `مرحباً ${request.guestName}! تم الموافقة على طلب انضمامك إلينا. نتشرف بخدمتك! 🎉`,
          type: 'custom',
          priority: 'high',
          metadata: {
            guestId: request.guestId,
            approvalType: 'new_guest'
          }
        });
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }

      alert(`✅ تم الموافقة على انضمام ${request.guestName} كضيف جديد`);
      setShowActionMenu({ ...showActionMenu, [request.id]: false });

    } catch (error) {
      console.error('Error approving new guest:', error);
      alert('❌ حدث خطأ أثناء الموافقة');
    } finally {
      setProcessing({ ...processing, [request.id]: false });
    }
  };

  const handleReject = async (request: RegistrationRequest) => {
    if (!confirm(`هل أنت متأكد من رفض طلب ${request.guestName}؟`)) {
      return;
    }

    setProcessing({ ...processing, [request.id]: true });

    try {
      // تحديث حالة الطلب
      const requestRef = doc(db, 'requests', request.id);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'reception'
      });

      // حذف بيانات الضيف من guests
      // Note: يمكنك اختيار عدم حذفها والاحتفاظ بها مع حالة rejected

      alert(`❌ تم رفض طلب ${request.guestName}`);

    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('حدث خطأ أثناء رفض الطلب');
    } finally {
      setProcessing({ ...processing, [request.id]: false });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-white/70">جاري تحميل طلبات التسجيل...</p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10">
        <CardContent className="p-8 text-center">
          <UserPlus className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/50">لا توجد طلبات تسجيل جديدة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">طلبات التسجيل الجديدة</h2>
          <p className="text-white/60 text-sm">
            {requests.length} طلب بانتظار المراجعة
          </p>
        </div>
      </div>

      {requests.map((request) => (
        <Card 
          key={request.id} 
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 transition-all"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {request.guestName.charAt(0)}
                  </span>
                </div>
                {request.guestName}
              </CardTitle>
              <Badge className="bg-amber-500/20 text-amber-300 border-0 animate-pulse">
                جديد
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* معلومات الضيف */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70">
                <IdCard className="w-4 h-4 text-purple-400" />
                <span className="text-sm">رقم الهوية:</span>
                <span className="text-white font-semibold">{request.guestNationalId}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/70">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-sm">الجوال:</span>
                <span className="text-white font-semibold">{request.guestPhone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-sm">تاريخ الميلاد:</span>
                <span className="text-white font-semibold">{request.guestDateOfBirth}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/70">
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="text-sm">الجنسية:</span>
                <span className="text-white font-semibold">{request.guestNationality}</span>
              </div>
            </div>

            {/* اختيار رقم الغرفة */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-400" />
                تخصيص غرفة (اختياري للضيف الجديد)
              </Label>
              <select
                value={selectedRoom[request.id] || ''}
                onChange={(e) => setSelectedRoom({ ...selectedRoom, [request.id]: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-400"
                disabled={processing[request.id]}
              >
                <option value="" className="bg-slate-900">اختر رقم الغرفة...</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.number} className="bg-slate-900">
                    غرفة {room.number} - {room.name}
                  </option>
                ))}
              </select>
            </div>

            {/* أزرار الإجراءات - مع قائمة منسدلة */}
            <div className="flex gap-3 relative">
              {!showActionMenu[request.id] ? (
                <>
                  <Button
                    onClick={() => setShowActionMenu({ ...showActionMenu, [request.id]: true })}
                    disabled={processing[request.id]}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
                  >
                    <Check className="w-4 h-4 ml-2" />
                    تخصيص وموافقة
                  </Button>

                  <Button
                    onClick={() => handleReject(request)}
                    disabled={processing[request.id]}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50"
                  >
                    <X className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                </>
              ) : (
                <div className="flex-1 space-y-2">
                  {/* خيار 1: تخصيص غرفة */}
                  <Button
                    onClick={() => handleApprove(request)}
                    disabled={!selectedRoom[request.id] || processing[request.id]}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                  >
                    {processing[request.id] ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <Home className="w-4 h-4 ml-2" />
                        تخصيص غرفة
                      </>
                    )}
                  </Button>

                  {/* خيار 2: ضيف جديد */}
                  <Button
                    onClick={() => handleApproveNewGuest(request)}
                    disabled={processing[request.id]}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0"
                  >
                    {processing[request.id] ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 ml-2" />
                        ضيف جديد (بدون غرفة)
                      </>
                    )}
                  </Button>

                  {/* زر إلغاء */}
                  <Button
                    onClick={() => setShowActionMenu({ ...showActionMenu, [request.id]: false })}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    إلغاء
                  </Button>
                </div>
              )}
            </div>

            {/* تحذير */}
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-200 text-sm">
                <strong>تنبيه:</strong> تأكد من مراجعة بيانات الضيف قبل الموافقة. بعد الموافقة، سيتم ربط الضيف بالغرفة وإرسال إشعار له.
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
