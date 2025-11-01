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
        // محاولة بديلة بصوت النظام
        const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeaTRAMT6fj7rFeGAU4jtTxy3keGwc+k9XyfykKJnXG79qFOAQZXrLo6qdWEQo/neHwv24fBSt+y/DadzsIGGa56+iVSw4MT6Xh7K9cFwU2jdPvyXUcBzmQ1PDaizsHJnPA7tmBNgQYWq/m6qJUEAo+m+DutlweBS19yO/XdDsHF2S36+aSSw0LSqPg661aFgU1i9Hvx3QbBzaO0+/JdRsFN47U78p2HAg6kdXwy3oeCCRzvO3Vfz0FGFux5emhUhAKPp3g77RaHAUsfsjv1nM6BxdjtOjjkUoNDEmi4O6sWhYFNIrQ7sdyGwc1jdLux3McBziO0+/JdBwHO5HU8Mt5HQcjcrzt1nw+BRhZr+PqoFAPCj6c3+6zWRsFLH7I7tVyOQcXYrPk45BKDAxHo+DgrFkaBS+JzuzGcRsHNYzS7sdwHAc4jtPvyHQaBzuP0+/KeBwHJnO87dV6PgUYWK7i6Z9PDgo9m9/rslcaBSx9xu3TcDkHF2Gx4+GQSQoLRqDd6atYGAQuidHpv2saBTWL0O7FbxsFN4zR78hxGwg5jdPuyHQZBzyP0u7KeBoHI3K67NR4PgUXV6zh6J5ODgk8md/psFcaBCt8xe3RbjgHF2Cv4d+OSAoLQ5/b56lXGAQriNDov2kaBTSKz+7CbhsFNo3P78ZvGwc4jdHvx3EaBzuO0u7JchsHI3G569N3PgUXVqvi6J1NDgk8md/or1YaBCt7w+3PbTgGF1+u3t2NRwoLQp7a5qdWFwQriM/lvmcZBTOJzu26bBoFNo3P7sRuGgc3jNHux28aBzuO0e7JcRkHI3C46tJ2PQUXVang6JxNDgk7mN7nrlQZBCp6w+vObTgGF16t3NuLRQgKP5zZ5qlUFgQqhczkwGYYBTKIzeu5ahkFNIrO7cJtGgc2jNDuxG0ZBzqO0O3JcBkHI267 69F1PAQWVang2JtMDgk6ld7mq1MYBC17wenlbDcGF12r29mJRAcJPprY46hSFQQphczjvmQYBTGHy+m3aRgEMovN68FqGAQ1is3tw2waBy+EyOu8aBkEMovO7MNrGAYzi9DuxGsaBjOMze/Gbh0HJnK47NF0OwQWU6ng15pLDgk4k93lqlIXBCx5v+jinzAGF1yo2deIQwYJO5fW4aZREwQng8rhvGMXBTCFyui1ZhcEMovL6r5oFwQ0is7sw2oZBjKKze/EaxoGM4zO78VrGQYyitDtxGsaBjOM0O/Gbh0FJnG169B0OgQWUqjf1plKDgk2kdzkolAWBCt4v+LinzAGF1qm2NSHQgYJOpXV36RQEwQngsrgumIWBS+EyOezZBYEMYnK6bxnFwQzi83rwmoZBjKJze7DaxkGMozP7sVsGQYxitDtxmsZBzKL0O7GbRwFJm+169BzOgQVUKjf1ZdJDQk1j9vnn08WBCt2vuLemC8GFlml1tKGQAYIOJTT3aFPEwQmgcnfuV8VBS6Cxuexa
BUEMIfI6btlFgQyiMno");
        beep.play().catch(() => {});
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
                    variant="destructive"
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
