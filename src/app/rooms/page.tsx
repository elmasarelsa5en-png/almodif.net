'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bed,
  Users,
  User,
  Wifi,
  Car,
  Coffee,
  Tv,
  Bath,
  Wind,
  Star,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  MapPin,
  Phone,
  Image,
  Settings,
  RefreshCw,
  TrendingUp,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function RoomsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);

  // تحميل البيانات المحفوظة
  useEffect(() => {
    const loadRooms = () => {
      const saved = localStorage.getItem('rooms');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setRooms(data);
        } catch (error) {
          console.error('خطأ في تحميل البيانات:', error);
          createDefaultRooms();
        }
      } else {
        createDefaultRooms();
      }
    };

    const createDefaultRooms = () => {
      const defaultRooms = [];
      const statuses = ['متاحة', 'مشغولة', 'تنظيف', 'صيانة', 'تحت الإصلاح'];
      const types = ['غرفة عادية', 'غرفة مزدوجة', 'جناح'];
      
      // إنشاء 35 غرفة
      for (let i = 1; i <= 35; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const floor = Math.ceil(i / 10);
        const priceBase = type === 'غرفة عادية' ? 300 : type === 'غرفة مزدوجة' ? 450 : 650;
        
        defaultRooms.push({
          id: `R${String(i).padStart(3, '0')}`,
          number: `${floor}${String(i % 10 || 10).padStart(2, '0')}`,
          type: type,
          status: status,
          floor: floor,
          capacity: type === 'جناح' ? 4 : type === 'غرفة مزدوجة' ? 3 : 2,
          area: type === 'جناح' ? 55 : type === 'غرفة مزدوجة' ? 35 : 25,
          pricePerNight: priceBase,
          view: ['إطلالة بحرية', 'إطلالة على الحديقة', 'إطلالة على المدينة'][Math.floor(Math.random() * 3)],
          amenities: ['wifi', 'tv', 'ac', 'minibar'],
          lastCleaned: new Date().toISOString(),
          nextBooking: status === 'محجوزة' ? new Date(Date.now() + 86400000).toISOString() : null,
          rating: 4 + Math.random(),
          reviews: Math.floor(Math.random() * 50) + 10,
          description: `${type} مريحة ونظيفة`
        });
      }
      
      localStorage.setItem('rooms', JSON.stringify(defaultRooms));
      setRooms(defaultRooms);
    };

    loadRooms();
  }, []);

  // حساب الإحصائيات من البيانات الموجودة
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'متاحة').length;
  const occupiedRooms = rooms.filter(r => r.status === 'مشغولة' || r.status === 'محجوزة').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'تحت الإصلاح' || r.status === 'صيانة').length;

  const roomStats = [
    {
      title: 'إجمالي الغرف',
      value: totalRooms.toString(),
      change: `${totalRooms} غرفة`,
      changeType: 'increase',
      icon: Home,
      color: 'from-blue-500 to-indigo-600',
      description: 'مجموع الغرف'
    },
    {
      title: 'غرف متاحة',
      value: availableRooms.toString(),
      change: 'جاهزة للحجز',
      changeType: 'increase',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      description: 'متاحة للحجز'
    },
    {
      title: 'غرف مشغولة',
      value: occupiedRooms.toString(),
      change: 'نزلاء حاليين',
      changeType: 'increase',
      icon: Calendar,
      color: 'from-purple-500 to-pink-600',
      description: 'محجوزة حالياً'
    },
    {
      title: 'تحت الصيانة',
      value: maintenanceRooms.toString(),
      change: 'قيد الصيانة',
      changeType: maintenanceRooms > 0 ? 'decrease' : 'increase',
      icon: Settings,
      color: 'from-orange-500 to-red-600',
      description: 'تحتاج صيانة'
    }
  ];

  const getRoomTypeName = (type) => {
    const types = {
      'standard': 'غرفة عادية',
      'deluxe': 'غرفة مزدوجة', 
      'suite': 'جناح',
      'family': 'غرفة عائلية',
      'غرفة عادية': 'غرفة عادية',
      'غرفة مزدوجة': 'غرفة مزدوجة'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      'available': { label: 'متاحة', class: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      'متاحة': { label: 'متاحة', class: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      'occupied': { label: 'مشغولة', class: 'bg-blue-500/20 text-blue-400', icon: Users },
      'مشغولة': { label: 'مشغولة', class: 'bg-blue-500/20 text-blue-400', icon: Users },
      'محجوزة': { label: 'محجوزة', class: 'bg-purple-500/20 text-purple-400', icon: Calendar },
      'cleaning': { label: 'تنظيف', class: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
      'maintenance': { label: 'صيانة', class: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
      'تحت الإصلاح': { label: 'صيانة', class: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
      'reserved': { label: 'محجوزة', class: 'bg-purple-500/20 text-purple-400', icon: Calendar }
    };
    return statuses[status] || { label: status, class: 'bg-gray-500/20 text-gray-400', icon: AlertTriangle };
  };

  const getViewName = (view) => {
    const views = {
      'sea': 'إطلالة بحرية',
      'garden': 'إطلالة على الحديقة',
      'city': 'إطلالة على المدينة',
      'mountain': 'إطلالة جبلية',
      'pool': 'إطلالة على المسبح'
    };
    return views[view] || view;
  };

  const getAmenityIcon = (amenity) => {
    const amenities = {
      'wifi': <Wifi className="w-4 h-4" />,
      'tv': <Tv className="w-4 h-4" />,
      'ac': <Wind className="w-4 h-4" />,
      'minibar': <Coffee className="w-4 h-4" />,
      'balcony': <MapPin className="w-4 h-4" />,
      'safe': <Settings className="w-4 h-4" />,
      'jacuzzi': <Bath className="w-4 h-4" />,
      'kitchenette': <Home className="w-4 h-4" />
    };
    return amenities[amenity] || <Settings className="w-4 h-4" />;
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.includes(searchTerm) ||
                         getRoomTypeName(room.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.guestName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    
    // ربط الفلاتر الإنجليزية بالعربية
    const statusMap = {
      'available': 'متاحة',
      'occupied': 'مشغولة',
      'maintenance': 'تحت الإصلاح',
      'cleaning': 'تنظيف'
    };
    
    const filterStatus = statusMap[selectedFilter] || selectedFilter;
    return matchesSearch && (room.status === selectedFilter || room.status === filterStatus);
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 lg:p-6 relative overflow-hidden" dir="rtl">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-white/20 bg-gray-800/50 text-white hover:bg-gray-600/50"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  رجوع
                </Button>
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bed className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                    إدارة الغرف
                  </h1>
                  <p className="text-indigo-200/80 text-sm lg:text-base">
                    إدارة وتتبع جميع غرف الفندق
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة غرفة
                </Button>
                
                <Button
                  variant="outline"
                  className="border-white/20 bg-gray-800/50 text-white hover:bg-gray-600/50"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {roomStats.map((stat, index) => (
              <Card key={index} className="bg-gray-800/50 backdrop-blur-md border-white/20 shadow-2xl hover:bg-gray-700/50 transition-all duration-300 group hover:scale-105">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      stat.changeType === 'increase' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {stat.changeType === 'increase' ? <TrendingUp className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-white/80 text-sm font-medium">{stat.title}</h3>
                    <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                    <p className="text-white/60 text-xs">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search & Filter */}
          <Card className="bg-gray-800/50 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <Input
                      placeholder="البحث عن غرفة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 bg-gray-800/50 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { key: 'all', label: 'الكل', count: rooms.length },
                    { key: 'available', label: 'متاحة', count: rooms.filter(r => r.status === 'متاحة').length },
                    { key: 'occupied', label: 'مشغولة', count: rooms.filter(r => r.status === 'مشغولة').length },
                    { key: 'cleaning', label: 'تنظيف', count: rooms.filter(r => r.status === 'تنظيف').length },
                    { key: 'maintenance', label: 'صيانة', count: rooms.filter(r => r.status === 'صيانة' || r.status === 'تحت الإصلاح').length }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      onClick={() => setSelectedFilter(filter.key)}
                      variant={selectedFilter === filter.key ? "default" : "outline"}
                      className={`whitespace-nowrap ${
                        selectedFilter === filter.key 
                          ? 'bg-indigo-500 text-white' 
                          : 'border-white/20 bg-gray-800/50 text-white hover:bg-gray-600/50'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const statusBadge = getStatusBadge(room.status);
              return (
                <Card key={room.id} className="bg-gray-800/50 backdrop-blur-md border-white/20 shadow-2xl hover:bg-gray-700/50 transition-all duration-300 group hover:scale-105">
                  <CardContent className="p-0">
                    {/* Room Image */}
                    <div className="relative h-48 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image className="w-16 h-16 text-white/30" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className={statusBadge.class}>
                          <statusBadge.icon className="w-3 h-3 ml-1" />
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/50 text-white">
                          غرفة {room.number}
                        </Badge>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-lg">{getRoomTypeName(room.type)}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white/80 text-sm">{room.rating?.toFixed(1)}</span>
                          <span className="text-white/60 text-sm">({room.reviews})</span>
                        </div>
                      </div>

                      <p className="text-white/70 text-sm">{room.description}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span>{room.capacity} أشخاص</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Home className="w-4 h-4 text-green-400" />
                            <span>{room.area} متر²</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <MapPin className="w-4 h-4 text-purple-400" />
                            <span>الطابق {room.floor}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-right">
                            <div className="text-white/60 text-xs">السعر/ليلة</div>
                            <div className="text-white font-bold text-lg">{room.pricePerNight} ريال</div>
                          </div>
                          <div className="text-white/80 text-sm">{getViewName(room.view)}</div>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 4).map((amenity, index) => (
                          <div key={index} className="flex items-center gap-1 bg-gray-800/50 rounded-full px-2 py-1">
                            {getAmenityIcon(amenity)}
                            <span className="text-xs text-white/80 capitalize">{amenity}</span>
                          </div>
                        ))}
                        {room.amenities.length > 4 && (
                          <div className="bg-gray-800/50 rounded-full px-2 py-1">
                            <span className="text-xs text-white/80">+{room.amenities.length - 4}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedRoom(room)}
                          className="flex-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30"
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          عرض
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 bg-gray-800/50 text-white hover:bg-gray-600/50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 bg-gray-800/50 text-white hover:bg-gray-600/50"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredRooms.length === 0 && (
            <Card className="bg-gray-800/50 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="text-center py-12">
                <Bed className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">لا توجد غرف</h3>
                <p className="text-white/60">لم يتم العثور على أي غرف تطابق البحث</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="bg-gray-800/50 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-3">
                <Settings className="w-6 h-6 text-indigo-400" />
                العمليات السريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => router.push('/dashboard/bookings')}
                  className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 h-20 flex flex-col gap-2"
                >
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm">الحجوزات</span>
                </Button>
                
                <Button 
                  className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 h-20 flex flex-col gap-2"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-sm">تنظيف الغرف</span>
                </Button>
                
                <Button 
                  className="bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 h-20 flex flex-col gap-2"
                >
                  <AlertTriangle className="w-6 h-6" />
                  <span className="text-sm">طلبات الصيانة</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/analytics')}
                  className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 h-20 flex flex-col gap-2"
                >
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">التقارير</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Details Dialog */}
        {selectedRoom && (
          <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
            <DialogContent className="bg-slate-900 border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">تفاصيل الغرفة {selectedRoom.number}</DialogTitle>
                <DialogDescription className="text-white/70">
                  معلومات شاملة عن الغرفة والحجوزات
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3">المعلومات الأساسية</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>رقم الغرفة:</strong> {selectedRoom.number}</div>
                      <div><strong>النوع:</strong> {getRoomTypeName(selectedRoom.type)}</div>
                      <div><strong>الحالة:</strong> {getStatusBadge(selectedRoom.status).label}</div>
                      <div><strong>الطابق:</strong> {selectedRoom.floor}</div>
                      <div><strong>السعة:</strong> {selectedRoom.capacity} أشخاص</div>
                      <div><strong>المساحة:</strong> {selectedRoom.area} متر مربع</div>
                      <div><strong>الإطلالة:</strong> {getViewName(selectedRoom.view)}</div>
                      <div><strong>السعر/ليلة:</strong> {selectedRoom.pricePerNight} ريال</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-3">التقييمات</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span><strong>التقييم:</strong> {selectedRoom.rating?.toFixed(1)}/5</span>
                      </div>
                      <div><strong>عدد المراجعات:</strong> {selectedRoom.reviews}</div>
                      <div><strong>آخر تنظيف:</strong> {new Date(selectedRoom.lastCleaned).toLocaleDateString('ar-SA')}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-3">الوصف</h4>
                  <p className="text-white/80">{selectedRoom.description}</p>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-3">الخدمات المتوفرة</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedRoom.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-2">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={() => setSelectedRoom(null)}
                  variant="outline"
                  className="border-white/20 bg-gray-800/50 text-white hover:bg-gray-600/50"
                >
                  إغلاق
                </Button>
                <Button className="bg-indigo-500 hover:bg-indigo-600">
                  تحرير الغرفة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProtectedRoute>
  );
}