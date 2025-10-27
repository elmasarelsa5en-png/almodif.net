'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  MessageSquare,
  Download,
  Upload,
  ArrowLeft,
  MoreHorizontal,
  UserCheck,
  Badge,
  TrendingUp,
  Heart,
  Gift,
  Crown,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ContactsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const contactStats = [
    {
      title: 'إجمالي جهات الاتصال',
      value: '1,247',
      change: '+15%',
      changeType: 'increase',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      description: 'عدد العملاء المسجلين'
    },
    {
      title: 'عملاء نشطون',
      value: '892',
      change: '+8%',
      changeType: 'increase',
      icon: UserCheck,
      color: 'from-green-500 to-emerald-600',
      description: 'نشطون خلال الشهر'
    },
    {
      title: 'عملاء VIP',
      value: '67',
      change: '+12%',
      changeType: 'increase',
      icon: Crown,
      color: 'from-yellow-500 to-orange-600',
      description: 'عملاء مميزون'
    },
    {
      title: 'عملاء جدد',
      value: '124',
      change: '+22%',
      changeType: 'increase',
      icon: UserPlus,
      color: 'from-purple-500 to-pink-600',
      description: 'هذا الشهر'
    }
  ];

  const contacts = [
    {
      id: 'C001',
      name: 'أحمد محمد الأحمد',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      address: 'الرياض، المملكة العربية السعودية',
      vipLevel: 'gold',
      totalBookings: 15,
      totalSpent: 12500,
      lastBooking: '2025-01-10',
      registrationDate: '2023-05-15',
      status: 'active',
      rating: 4.8,
      notes: 'عميل مميز، يفضل الغرف ذات الإطلالة البحرية',
      tags: ['VIP', 'عميل دائم', 'تاجر'],
      preferences: {
        roomType: 'suite',
        view: 'sea',
        amenities: ['wifi', 'minibar', 'room-service']
      },
      birthday: '1985-03-20',
      nationality: 'سعودي',
      company: 'شركة الأحمد للتجارة'
    },
    {
      id: 'C002',
      name: 'فاطمة عبدالله',
      email: 'fatima@example.com',
      phone: '+966507654321',
      address: 'جدة، المملكة العربية السعودية',
      vipLevel: 'silver',
      totalBookings: 8,
      totalSpent: 6800,
      lastBooking: '2025-01-05',
      registrationDate: '2024-02-10',
      status: 'active',
      rating: 4.5,
      notes: 'تحب الإقامة في الطوابق العالية',
      tags: ['عميل دائم', 'طبيبة'],
      preferences: {
        roomType: 'deluxe',
        view: 'city',
        amenities: ['wifi', 'gym', 'spa']
      },
      birthday: '1990-07-15',
      nationality: 'سعودي',
      company: 'مستشفى الملك فهد'
    },
    {
      id: 'C003',
      name: 'محمد علي السعد',
      email: 'mohammed@example.com',
      phone: '+966509876543',
      address: 'الدمام، المملكة العربية السعودية',
      vipLevel: 'standard',
      totalBookings: 3,
      totalSpent: 2100,
      lastBooking: '2024-12-28',
      registrationDate: '2024-12-01',
      status: 'active',
      rating: 4.2,
      notes: 'عميل جديد، مهتم بالخدمات الرياضية',
      tags: ['عميل جديد', 'مهندس'],
      preferences: {
        roomType: 'standard',
        view: 'garden',
        amenities: ['wifi', 'gym', 'pool']
      },
      birthday: '1988-11-03',
      nationality: 'سعودي',
      company: 'أرامكو السعودية'
    }
  ];

  const getVipLevelBadge = (level) => {
    const levels = {
      'platinum': { label: 'بلاتيني', class: 'bg-purple-500/20 text-purple-400', icon: Crown },
      'gold': { label: 'ذهبي', class: 'bg-yellow-500/20 text-yellow-400', icon: Star },
      'silver': { label: 'فضي', class: 'bg-gray-500/20 text-gray-400', icon: Shield },
      'standard': { label: 'عادي', class: 'bg-blue-500/20 text-blue-400', icon: Users }
    };
    return levels[level] || levels.standard;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      'active': { label: 'نشط', class: 'bg-green-500/20 text-green-400' },
      'inactive': { label: 'غير نشط', class: 'bg-gray-500/20 text-gray-400' },
      'blocked': { label: 'محظور', class: 'bg-red-500/20 text-red-400' }
    };
    return statuses[status] || statuses.active;
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm) ||
                         contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'vip') return matchesSearch && contact.vipLevel !== 'standard';
    return matchesSearch && contact.status === selectedFilter;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-4 lg:p-6 relative overflow-hidden" dir="rtl">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 lg:p-6 shadow-2xl border border-white/20">
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
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    إدارة جهات الاتصال
                  </h1>
                  <p className="text-green-200/80 text-sm lg:text-base">
                    إدارة شاملة لقاعدة بيانات العملاء
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsNewContactOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <UserPlus className="w-4 h-4 ml-2" />
                  عميل جديد
                </Button>
                
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  استيراد
                </Button>
                
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {contactStats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 group hover:scale-105">
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
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <Input
                      placeholder="البحث في جهات الاتصال..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { key: 'all', label: 'الكل', count: contacts.length },
                    { key: 'active', label: 'نشط', count: contacts.filter(c => c.status === 'active').length },
                    { key: 'vip', label: 'VIP', count: contacts.filter(c => c.vipLevel !== 'standard').length },
                    { key: 'inactive', label: 'غير نشط', count: contacts.filter(c => c.status === 'inactive').length }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      onClick={() => setSelectedFilter(filter.key)}
                      variant={selectedFilter === filter.key ? "default" : "outline"}
                      className={`whitespace-nowrap ${
                        selectedFilter === filter.key 
                          ? 'bg-green-500 text-white' 
                          : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => {
              const vipBadge = getVipLevelBadge(contact.vipLevel);
              const statusBadge = getStatusBadge(contact.status);
              
              return (
                <Card key={contact.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 group hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{contact.name}</h3>
                          <p className="text-white/60 text-sm">{contact.id}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <UIBadge className={vipBadge.class}>
                          <vipBadge.icon className="w-3 h-3 ml-1" />
                          {vipBadge.label}
                        </UIBadge>
                        <UIBadge className={statusBadge.class}>
                          {statusBadge.label}
                        </UIBadge>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-blue-400" />
                        <span className="text-white/80">{contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-green-400" />
                        <span className="text-white/80">{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className="text-white/80">{contact.address}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">{contact.totalBookings}</div>
                        <div className="text-white/60 text-xs">حجز</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">{contact.totalSpent.toLocaleString()}</div>
                        <div className="text-white/60 text-xs">ريال</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white/80 text-sm">{contact.rating}/5</span>
                      <span className="text-white/60 text-sm">• آخر حجز: {new Date(contact.lastBooking).toLocaleDateString('ar-SA')}</span>
                    </div>

                    {contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {contact.tags.slice(0, 2).map((tag, index) => (
                          <UIBadge key={index} className="bg-blue-500/20 text-blue-400 text-xs">
                            {tag}
                          </UIBadge>
                        ))}
                        {contact.tags.length > 2 && (
                          <UIBadge className="bg-gray-500/20 text-gray-400 text-xs">
                            +{contact.tags.length - 2}
                          </UIBadge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedContact(contact)}
                        className="flex-1 bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                        onClick={() => {
                          setSelectedContact(contact);
                          setIsEditMode(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredContacts.length === 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">لا توجد جهات اتصال</h3>
                <p className="text-white/60">لم يتم العثور على جهات اتصال تطابق البحث</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-green-400" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setIsNewContactOpen(true)}
                  className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 h-20 flex flex-col gap-2"
                >
                  <UserPlus className="w-6 h-6" />
                  <span className="text-sm">إضافة عميل</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/crm/whatsapp')}
                  className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 h-20 flex flex-col gap-2"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-sm">المحادثات</span>
                </Button>
                
                <Button 
                  className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 h-20 flex flex-col gap-2"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">استيراد</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/analytics')}
                  className="bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 h-20 flex flex-col gap-2"
                >
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">التحليلات</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Details Dialog */}
        {selectedContact && !isEditMode && (
          <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
            <DialogContent className="bg-slate-900 border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">ملف العميل - {selectedContact.name}</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">المعلومات الأساسية</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>الاسم:</strong> {selectedContact.name}</div>
                    <div><strong>البريد:</strong> {selectedContact.email}</div>
                    <div><strong>الهاتف:</strong> {selectedContact.phone}</div>
                    <div><strong>العنوان:</strong> {selectedContact.address}</div>
                    <div><strong>الجنسية:</strong> {selectedContact.nationality}</div>
                    <div><strong>تاريخ الميلاد:</strong> {new Date(selectedContact.birthday).toLocaleDateString('ar-SA')}</div>
                    <div><strong>الشركة:</strong> {selectedContact.company}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">إحصائيات العميل</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>المستوى:</strong> {getVipLevelBadge(selectedContact.vipLevel).label}</div>
                    <div><strong>عدد الحجوزات:</strong> {selectedContact.totalBookings}</div>
                    <div><strong>إجمالي الإنفاق:</strong> {selectedContact.totalSpent.toLocaleString()} ريال</div>
                    <div><strong>التقييم:</strong> {selectedContact.rating}/5</div>
                    <div><strong>تاريخ التسجيل:</strong> {new Date(selectedContact.registrationDate).toLocaleDateString('ar-SA')}</div>
                    <div><strong>آخر حجز:</strong> {new Date(selectedContact.lastBooking).toLocaleDateString('ar-SA')}</div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-white font-semibold">التفضيلات</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><strong>نوع الغرفة المفضل:</strong> {selectedContact.preferences.roomType}</div>
                    <div><strong>الإطلالة المفضلة:</strong> {selectedContact.preferences.view}</div>
                    <div><strong>الخدمات المفضلة:</strong> {selectedContact.preferences.amenities.join(', ')}</div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-white font-semibold">العلامات</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContact.tags.map((tag, index) => (
                      <UIBadge key={index} className="bg-blue-500/20 text-blue-400">
                        {tag}
                      </UIBadge>
                    ))}
                  </div>
                </div>
                
                {selectedContact.notes && (
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-white font-semibold">ملاحظات</h4>
                    <p className="text-white/80 text-sm">{selectedContact.notes}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button
                  onClick={() => setSelectedContact(null)}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  إغلاق
                </Button>
                <Button 
                  onClick={() => setIsEditMode(true)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  تعديل
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* New Contact Dialog */}
        <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
          <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">إضافة عميل جديد</DialogTitle>
              <DialogDescription className="text-white/70">
                أدخل معلومات العميل الجديد
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input id="name" className="bg-white/10 border-white/20 text-white" />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" className="bg-white/10 border-white/20 text-white" />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" className="bg-white/10 border-white/20 text-white" />
              </div>
              <div>
                <Label htmlFor="vipLevel">مستوى العضوية</Label>
                <Select>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">عادي</SelectItem>
                    <SelectItem value="silver">فضي</SelectItem>
                    <SelectItem value="gold">ذهبي</SelectItem>
                    <SelectItem value="platinum">بلاتيني</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Input id="address" className="bg-white/10 border-white/20 text-white" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea id="notes" className="bg-white/10 border-white/20 text-white" />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setIsNewContactOpen(false)}
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button className="bg-green-500 hover:bg-green-600">
                حفظ العميل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}