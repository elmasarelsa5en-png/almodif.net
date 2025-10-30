'use client';

import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, Plus, Search, Phone, Mail, MapPin, Calendar, RefreshCw, User, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

          {/* Guests List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">جاري تحميل الضيوف...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-xl">{error}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuests.length === 0 ? (
                <div className="col-span-full">
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                    <CardContent className="text-center py-12">
                      <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <h3 className="text-white text-xl font-semibold mb-2">لا يوجد ضيوف</h3>
                      <p className="text-white/60">لم يتم العثور على ضيوف تطابق معايير البحث</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredGuests.map((guest) => {
                  const status = getGuestStatus(guest);
                  return (
                    <Card key={guest.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <CardTitle className="text-white text-lg">{guest.name || 'غير محدد'}</CardTitle>
                              <p className="text-white/70 text-sm flex items-center gap-1">
                                <Smartphone className="w-3 h-3" />
                                مسجل في التطبيق
                              </p>
                            </div>
                          </div>
                          <Badge className={`${status.color} border-0`}>
                            {status.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {guest.phone && (
                          <div className="flex items-center gap-2 text-white/70 text-sm">
                            <Phone className="w-4 h-4" />
                            <span>{guest.phone}</span>
                          </div>
                        )}

                        {guest.nationalId && (
                          <div className="flex items-center gap-2 text-white/70 text-sm">
                            <Shield className="w-4 h-4" />
                            <span>رقم الهوية: {guest.nationalId}</span>
                          </div>
                        )}

                        {guest.roomNumber && (
                          <div className="flex items-center gap-2 text-white/70 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>الغرفة: {guest.roomNumber}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-white/10 space-y-1">
                          {guest.checkIn && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-white/70">تاريخ الدخول:</span>
                              <span className="text-white font-semibold">{formatDate(guest.checkIn)}</span>
                            </div>
                          )}
                          {guest.checkOut && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-white/70">تاريخ المغادرة:</span>
                              <span className="text-white font-semibold">{formatDate(guest.checkOut)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/70">آخر تسجيل دخول:</span>
                            <span className="text-white text-xs">{formatDateTime(guest.lastLogin)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/70">تاريخ التسجيل:</span>
                            <span className="text-white text-xs">{formatDate(guest.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}