'use client';

import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, Plus, Search, Phone, Mail, MapPin, Calendar, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { GuestService } from '@/lib/database';

export default function GuestsPage() {
  const router = useRouter();
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load guests data from Firestore
  useEffect(() => {
    const loadGuests = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const guestsData = await GuestService.getAllGuests();
        setGuests(guestsData);
        setFilteredGuests(guestsData);

      } catch (err) {
        console.error('Error loading guests:', err);
        setError('فشل في تحميل بيانات العملاء');
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
        guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone?.includes(searchTerm) ||
        guest.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGuests(filtered);
    }
  }, [guests, searchTerm]);

  const formatDate = (date) => {
    if (!date) return 'غير محدد';
    return new Date(date.seconds * 1000).toLocaleDateString('ar-SA');
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
                    إدارة العملاء
                  </h1>
                  <p className="text-purple-200/80">
                    متابعة وإدارة جميع عملاء الفندق
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Plus className="w-4 h-4 ml-2" />
                  عميل جديد
                </Button>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">إجمالي العملاء</p>
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
                    <p className="text-white/70 text-sm">عملاء نشطين</p>
                    <p className="text-3xl font-bold text-white">
                      {guests.filter(g => g.status === 'active').length}
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
                    <p className="text-white/70 text-sm">إجمالي الحجوزات</p>
                    <p className="text-3xl font-bold text-white">
                      {guests.reduce((total, guest) => total + (guest.totalBookings || 0), 0)}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <Input
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
              />
            </div>
          </div>

          {/* Guests List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">جاري تحميل العملاء...</div>
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
                      <h3 className="text-white text-xl font-semibold mb-2">لا يوجد عملاء</h3>
                      <p className="text-white/60">لم يتم العثور على عملاء تطابق معايير البحث</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredGuests.map((guest) => (
                  <Card key={guest.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{guest.name || 'غير محدد'}</CardTitle>
                            <p className="text-white/70 text-sm">عميل #{guest.id?.slice(-6) || 'غير محدد'}</p>
                          </div>
                        </div>
                        <Badge className={`${
                          guest.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        } border-0`}>
                          {guest.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {guest.email && (
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <Mail className="w-4 h-4" />
                          <span>{guest.email}</span>
                        </div>
                      )}

                      {guest.phone && (
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <Phone className="w-4 h-4" />
                          <span>{guest.phone}</span>
                        </div>
                      )}

                      {guest.address && (
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{guest.address}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>تاريخ التسجيل: {formatDate(guest.createdAt)}</span>
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/70">إجمالي الحجوزات:</span>
                          <span className="text-white font-semibold">{guest.totalBookings || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-white/70">إجمالي الإنفاق:</span>
                          <span className="text-white font-semibold">{guest.totalSpent || 0} ريال</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}