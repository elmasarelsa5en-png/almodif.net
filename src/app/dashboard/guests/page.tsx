'use client';

import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, Search, Phone, Mail, MapPin, Calendar, RefreshCw, User, Shield, Smartphone, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Guest {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  roomNumber?: string;
  checkIn?: any;
  checkOut?: any;
  password: string;
  createdAt: any;
  lastLogin?: any;
  isActive?: boolean;
}

export default function GuestsPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Load guests data from Firestore
  useEffect(() => {
    const loadGuests = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const q = query(collection(db, 'guests'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const guestsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Guest[];

        setGuests(guestsData);
        setFilteredGuests(guestsData);

      } catch (err) {
        console.error('Error loading guests:', err);
        setError('فشل في تحميل بيانات الضيوف');
      } finally {
        setIsLoading(false);
      }
    };

    loadGuests();
  }, []);

  // Filter guests based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredGuests(guests);
    } else {
      const filtered = guests.filter(guest =>
        guest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone?.includes(searchTerm) ||
        guest.nationalId?.includes(searchTerm) ||
        guest.roomNumber?.includes(searchTerm)
      );
      setFilteredGuests(filtered);
    }
  }, [guests, searchTerm]);

  const formatDate = (date: any) => {
    if (!date) return 'غير محدد';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('ar-SA');
    }
    return new Date(date).toLocaleDateString('ar-SA');
  };

  const formatDateTime = (date: any) => {
    if (!date) return 'لم يسجل دخول';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleString('ar-SA');
    }
    return new Date(date).toLocaleString('ar-SA');
  };

  const getGuestStatus = (guest: Guest) => {
    if (!guest.checkOut) return { label: 'مقيم حالياً', color: 'bg-green-500/20 text-green-400' };
    const checkOutDate = guest.checkOut.seconds ? new Date(guest.checkOut.seconds * 1000) : new Date(guest.checkOut);
    if (checkOutDate < new Date()) return { label: 'مغادر', color: 'bg-gray-500/20 text-gray-400' };
    return { label: 'مقيم حالياً', color: 'bg-green-500/20 text-green-400' };
  };

  const handleViewGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsDetailsOpen(true);
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

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة
                </Button>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    إدارة الضيوف
                  </h1>
                  <p className="text-purple-200/80">
                    متابعة جميع من يستخدم تطبيق الضيف
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">إجمالي الضيوف</p>
                    <p className="text-3xl font-bold text-white">{guests.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">مقيمين حالياً</p>
                    <p className="text-3xl font-bold text-white">
                      {guests.filter(g => getGuestStatus(g).label === 'مقيم حالياً').length}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">لديهم حساب في التطبيق</p>
                    <p className="text-3xl font-bold text-white">{guests.length}</p>
                  </div>
                  <Smartphone className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">مغادرين</p>
                    <p className="text-3xl font-bold text-white">
                      {guests.filter(g => getGuestStatus(g).label === 'مغادر').length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <Input
                placeholder="البحث في الضيوف (الاسم، رقم الهوية، رقم الغرفة، الجوال)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
              />
            </div>
          </div>

          {/* Guests Table */}
          {isLoading ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-white/20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <div className="text-white text-xl">جاري تحميل الضيوف...</div>
            </div>
          ) : error ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-white/20 text-center">
              <div className="text-red-400 text-xl">{error}</div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {filteredGuests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">لا يوجد ضيوف</h3>
                  <p className="text-white/60">لم يتم العثور على ضيوف تطابق معايير البحث</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="text-right p-4 text-white font-bold text-sm">#</th>
                        <th className="text-right p-4 text-white font-bold text-sm">الاسم</th>
                        <th className="text-right p-4 text-white font-bold text-sm">رقم الجوال</th>
                        <th className="text-right p-4 text-white font-bold text-sm">رقم الغرفة</th>
                        <th className="text-right p-4 text-white font-bold text-sm">الحالة</th>
                        <th className="text-right p-4 text-white font-bold text-sm">تاريخ الدخول</th>
                        <th className="text-center p-4 text-white font-bold text-sm">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.map((guest, index) => {
                        const status = getGuestStatus(guest);
                        return (
                          <tr 
                            key={guest.id} 
                            className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => handleViewGuest(guest)}
                          >
                            <td className="p-4 text-white/70 text-sm">{index + 1}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-semibold">{guest.name || 'غير محدد'}</p>
                                  <p className="text-white/50 text-xs flex items-center gap-1">
                                    <Smartphone className="w-3 h-3" />
                                    مسجل في التطبيق
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-white/70 text-sm">
                                <Phone className="w-4 h-4" />
                                <span>{guest.phone || 'غير محدد'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-white/70 text-sm">
                                <MapPin className="w-4 h-4" />
                                <span>{guest.roomNumber || 'غير محدد'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={`${status.color} border-0`}>
                                {status.label}
                              </Badge>
                            </td>
                            <td className="p-4 text-white/70 text-sm">
                              {formatDate(guest.checkIn)}
                            </td>
                            <td className="p-4 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewGuest(guest);
                                }}
                              >
                                <Eye className="w-4 h-4 ml-1" />
                                عرض
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Guest Details Dialog */}
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  تفاصيل الضيف
                </DialogTitle>
              </DialogHeader>

              {selectedGuest && (
                <div className="space-y-6 mt-4">
                  {/* اسم الضيف */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">المعلومات الأساسية</h3>
                      <Badge className={`${getGuestStatus(selectedGuest).color} border-0`}>
                        {getGuestStatus(selectedGuest).label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/50 text-sm mb-1 block">الاسم الكامل</label>
                        <p className="text-white font-semibold">{selectedGuest.name || 'غير محدد'}</p>
                      </div>
                      <div>
                        <label className="text-white/50 text-sm mb-1 block">رقم الجوال</label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-400" />
                          <p className="text-white">{selectedGuest.phone || 'غير محدد'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-white/50 text-sm mb-1 block">رقم الهوية</label>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-400" />
                          <p className="text-white">{selectedGuest.nationalId || 'غير محدد'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-white/50 text-sm mb-1 block">رقم الغرفة</label>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <p className="text-white">{selectedGuest.roomNumber || 'غير محدد'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* معلومات الإقامة */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-3">معلومات الإقامة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/50 text-sm mb-1 block">تاريخ الدخول</label>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-400" />
                          <p className="text-white">{formatDate(selectedGuest.checkIn)}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-white/50 text-sm mb-1 block">تاريخ المغادرة المتوقع</label>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-red-400" />
                          <p className="text-white">{formatDate(selectedGuest.checkOut)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* معلومات التطبيق */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                      معلومات التطبيق
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">تاريخ التسجيل في التطبيق</span>
                        <span className="text-white font-semibold">{formatDate(selectedGuest.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">آخر تسجيل دخول</span>
                        <span className="text-white text-sm">{formatDateTime(selectedGuest.lastLogin)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">حالة الحساب</span>
                        <Badge className="bg-green-500/20 text-green-400 border-0">
                          نشط
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailsOpen(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      إغلاق
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  );
}