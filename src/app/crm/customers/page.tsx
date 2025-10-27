'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Tag,
  Star,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
  MoreVertical,
  UserPlus,
  Award,
  Home,
  Activity,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type CustomerStatus = 'active' | 'inactive' | 'vip' | 'blocked';
type CustomerStage = 'trial' | 'follow-up' | 'purchase' | 'rejected' | 'loyal';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  status: CustomerStatus;
  stage: CustomerStage;
  priority: Priority;
  tags: string[];
  notes: string;
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate: string;
  createdAt: string;
  satisfactionScore?: number;
  assignedTo?: string;
  address?: string;
  birthDate?: string;
  source: 'whatsapp' | 'website' | 'referral' | 'direct' | 'social-media';
}

export default function CustomersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<CustomerStage | 'all'>('all');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'none' | 'revenue' | 'orders' | 'newThisMonth'>('none');

  // بيانات تجريبية
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'أحمد محمد علي',
      phone: '+966501234567',
      email: 'ahmed@example.com',
      company: 'شركة النجاح',
      status: 'vip',
      stage: 'loyal',
      priority: 'high',
      tags: ['VIP', 'دائم', 'مميز'],
      notes: 'عميل مهم جداً - يفضل التواصل صباحاً',
      totalOrders: 45,
      totalRevenue: 125000,
      lastOrderDate: '2024-10-15',
      createdAt: '2023-01-15',
      satisfactionScore: 4.8,
      assignedTo: 'محمد أحمد',
      address: 'الرياض، حي النخيل',
      birthDate: '1985-05-20',
      source: 'whatsapp'
    },
    {
      id: '2',
      name: 'فاطمة عبدالله',
      phone: '+966509876543',
      email: 'fatima@example.com',
      status: 'active',
      stage: 'purchase',
      priority: 'medium',
      tags: ['منتظم', 'موثوق'],
      notes: 'عميلة جيدة - تفضل الدفع الإلكتروني',
      totalOrders: 12,
      totalRevenue: 28000,
      lastOrderDate: '2024-10-10',
      createdAt: '2024-03-20',
      satisfactionScore: 4.5,
      assignedTo: 'سارة خالد',
      address: 'جدة، حي الزهراء',
      source: 'website'
    },
    {
      id: '3',
      name: 'خالد سعيد',
      phone: '+966551234567',
      status: 'active',
      stage: 'follow-up',
      priority: 'medium',
      tags: ['جديد', 'محتمل'],
      notes: 'متابعة بعد أسبوع',
      totalOrders: 2,
      totalRevenue: 3500,
      lastOrderDate: '2024-10-08',
      createdAt: '2024-09-25',
      satisfactionScore: 4.0,
      assignedTo: 'أحمد سالم',
      source: 'referral'
    },
    {
      id: '4',
      name: 'نورة محمود',
      phone: '+966541234567',
      email: 'noura@example.com',
      status: 'active',
      stage: 'trial',
      priority: 'low',
      tags: ['تجربة', 'جديد'],
      notes: 'أول طلب - متابعة الرضا',
      totalOrders: 1,
      totalRevenue: 500,
      lastOrderDate: '2024-10-16',
      createdAt: '2024-10-16',
      satisfactionScore: 5.0,
      source: 'social-media'
    },
    {
      id: '5',
      name: 'عبدالرحمن يوسف',
      phone: '+966531234567',
      status: 'inactive',
      stage: 'rejected',
      priority: 'low',
      tags: ['غير نشط'],
      notes: 'لم يكمل الطلب - السعر مرتفع',
      totalOrders: 0,
      totalRevenue: 0,
      lastOrderDate: '-',
      createdAt: '2024-08-10',
      source: 'direct'
    }
  ]);

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    company: '',
    status: 'active',
    stage: 'trial',
    priority: 'medium',
    tags: [],
    notes: '',
    source: 'direct'
  });

  // إحصائيات
  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    vip: customers.filter(c => c.status === 'vip').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalRevenue, 0),
    avgOrderValue: customers.reduce((sum, c) => sum + c.totalRevenue, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0) || 0,
    newThisMonth: customers.filter(c => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
  }), [customers]);

  // تصفية وترتيب العملاء
  const filteredCustomers = useMemo(() => {
    let result = customers.filter(customer => {
      const matchSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery) ||
                         customer.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchStage = stageFilter === 'all' || customer.stage === stageFilter;
      return matchSearch && matchStatus && matchStage;
    });

    // ترتيب حسب المعيار المحدد
    if (sortBy === 'revenue') {
      result = result.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else if (sortBy === 'orders') {
      result = result.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (sortBy === 'newThisMonth') {
      const now = new Date();
      result = result.filter(c => {
        const created = new Date(c.createdAt);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      });
    }

    return result;
  }, [customers, searchQuery, statusFilter, stageFilter, sortBy]);

  // إضافة عميل جديد
  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert('الرجاء إدخال الاسم ورقم الهاتف');
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      company: newCustomer.company,
      status: newCustomer.status as CustomerStatus,
      stage: newCustomer.stage as CustomerStage,
      priority: newCustomer.priority as Priority,
      tags: newCustomer.tags || [],
      notes: newCustomer.notes || '',
      totalOrders: 0,
      totalRevenue: 0,
      lastOrderDate: '-',
      createdAt: new Date().toISOString().split('T')[0],
      source: newCustomer.source as any
    };

    setCustomers([customer, ...customers]);
    setShowAddCustomer(false);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      company: '',
      status: 'active',
      stage: 'trial',
      priority: 'medium',
      tags: [],
      notes: '',
      source: 'direct'
    });
  };

  // حذف عميل
  const handleDeleteCustomer = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      setCustomers(customers.filter(c => c.id !== id));
      setShowCustomerDetails(false);
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: CustomerStatus) => {
    const colors = {
      active: 'bg-green-600',
      inactive: 'bg-gray-600',
      vip: 'bg-yellow-600',
      blocked: 'bg-red-600'
    };
    return colors[status];
  };

  const getStatusLabel = (status: CustomerStatus) => {
    const labels = {
      active: '🟢 نشط',
      inactive: '⚫ غير نشط',
      vip: '⭐ مميز',
      blocked: '🔴 محظور'
    };
    return labels[status];
  };

  const getStageColor = (stage: CustomerStage) => {
    const colors = {
      trial: 'bg-blue-600/80',
      'follow-up': 'bg-yellow-600/80',
      purchase: 'bg-green-600/80',
      rejected: 'bg-red-600/80',
      loyal: 'bg-purple-600/80'
    };
    return colors[stage];
  };

  const getStageLabel = (stage: CustomerStage) => {
    const labels = {
      trial: '🔵 تجربة',
      'follow-up': '🟡 متابعة',
      purchase: '🟢 شراء',
      rejected: '🔴 مرفوض',
      loyal: '🟣 دائم'
    };
    return labels[stage];
  };

  return (
    <div className="min-h-screen relative text-white p-6 overflow-hidden">
      {/* خلفية احترافية متحركة */}
      <div className="fixed inset-0 -z-10">
        {/* الطبقة الأساسية */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        
        {/* دوائر متوهجة */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* شبكة منقطة */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
        
        {/* تدرج علوي */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-purple-950/20" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* أزرار التنقل */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/crm/whatsapp')}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                title="العودة إلى CRM"
              >
                <ArrowLeft className="h-5 w-5 ml-2" />
                CRM
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                title="العودة إلى لوحة التحكم"
              >
                <Home className="h-5 w-5 ml-2" />
                لوحة التحكم
              </Button>
            </div>
            <div className="h-8 w-px bg-slate-700" /> {/* فاصل */}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-400" />
                إدارة العملاء
              </h1>
              <p className="text-slate-400 mt-1">نظام شامل لإدارة ومتابعة العملاء</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddCustomer(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
          >
            <UserPlus className="h-5 w-5 ml-2" />
            عميل جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card 
            onClick={() => {
              setStatusFilter('all');
              setStageFilter('all');
              setSearchQuery('');
              setSortBy('none');
            }}
            className="border-blue-600 bg-gradient-to-r from-blue-600/80 to-cyan-600/70 hover:from-blue-600/90 hover:to-cyan-600/80 transition-all shadow-lg hover:shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <Users className="h-4 w-4" /> إجمالي العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.total}</p>
              <p className="text-xs font-semibold text-blue-100 mt-1">عرض الكل</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => {
              setStatusFilter('active');
              setStageFilter('all');
              setSortBy('none');
            }}
            className="border-green-600 bg-gradient-to-r from-green-600/80 to-emerald-600/70 hover:from-green-600/90 hover:to-emerald-600/80 transition-all shadow-lg hover:shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> نشط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.active}</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => {
              setStatusFilter('vip');
              setStageFilter('all');
              setSortBy('none');
            }}
            className="border-yellow-600 bg-gradient-to-r from-yellow-600/80 to-amber-600/70 hover:from-yellow-600/90 hover:to-amber-600/80 transition-all shadow-lg hover:shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <Star className="h-4 w-4" /> VIP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.vip}</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => {
              setStatusFilter('inactive');
              setStageFilter('all');
              setSortBy('none');
            }}
            className="border-gray-600 bg-gradient-to-r from-gray-600/80 to-slate-600/70 hover:from-gray-600/90 hover:to-slate-600/80 transition-all shadow-lg hover:shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> غير نشط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.inactive}</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => {
              setStatusFilter('all');
              setStageFilter('all');
              setSortBy('revenue');
            }}
            className="border-purple-600 bg-gradient-to-r from-purple-600/80 to-pink-600/70 hover:from-purple-600/90 hover:to-pink-600/80 transition-all shadow-lg hover:shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> إجمالي المبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-extrabold text-white">{stats.totalRevenue.toLocaleString('ar-SA')} ر.س</p>
              <p className="text-xs font-semibold text-purple-100 mt-1">اضغط للترتيب</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => {
              setStatusFilter('all');
              setStageFilter('all');
              setSortBy('orders');
            }}
            className="border-cyan-600 bg-gradient-to-r from-cyan-600/80 to-blue-600/70 hover:from-cyan-600/90 hover:to-blue-600/80 transition-all shadow-lg hover:shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <Activity className="h-4 w-4" /> متوسط الطلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-extrabold text-white">{Math.round(stats.avgOrderValue).toLocaleString('ar-SA')} ر.س</p>
              <p className="text-xs font-semibold text-cyan-100 mt-1">اضغط للترتيب</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => {
              setStatusFilter('all');
              setStageFilter('all');
              setSortBy('newThisMonth');
            }}
            className="border-indigo-600 bg-gradient-to-r from-indigo-600/80 to-purple-600/70 hover:from-indigo-600/90 hover:to-purple-600/80 transition-all shadow-lg hover:shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <UserPlus className="h-4 w-4" /> جديد هذا الشهر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.newThisMonth}</p>
              <p className="text-xs font-semibold text-indigo-100 mt-1">اضغط للعرض</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-700/50 bg-slate-900/70 backdrop-blur-xl mb-6 shadow-2xl">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="بحث عن عميل (الاسم، الهاتف، البريد)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white pr-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">كل الحالات</SelectItem>
                  <SelectItem value="active" className="text-white">🟢 نشط</SelectItem>
                  <SelectItem value="vip" className="text-white">⭐ VIP</SelectItem>
                  <SelectItem value="inactive" className="text-white">⚫ غير نشط</SelectItem>
                  <SelectItem value="blocked" className="text-white">🔴 محظور</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as any)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="المرحلة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">كل المراحل</SelectItem>
                  <SelectItem value="trial" className="text-white">🔵 تجربة</SelectItem>
                  <SelectItem value="follow-up" className="text-white">🟡 متابعة</SelectItem>
                  <SelectItem value="purchase" className="text-white">🟢 شراء</SelectItem>
                  <SelectItem value="loyal" className="text-white">🟣 دائم</SelectItem>
                  <SelectItem value="rejected" className="text-white">🔴 مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers Grid */}
        {filteredCustomers.length === 0 ? (
          <Card className="border-slate-700/50 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">لا توجد نتائج</h3>
              <p className="text-slate-500">جرب تغيير معايير البحث أو الفلترة</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                className="border-slate-700/50 bg-slate-900/70 backdrop-blur-xl hover:bg-slate-800/80 transition-all shadow-xl hover:shadow-2xl cursor-pointer group"
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowCustomerDetails(true);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{customer.name}</CardTitle>
                        <p className="text-sm text-slate-400">{customer.phone}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(customer.status) + ' text-white shadow-lg'}>
                      {getStatusLabel(customer.status).split(' ')[1]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Stage & Priority */}
                  <div className="flex gap-2">
                    <Badge className={getStageColor(customer.stage) + ' text-white text-xs shadow-md'}>
                      {getStageLabel(customer.stage)}
                    </Badge>
                    {customer.email && (
                      <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs bg-slate-800/50">
                        <Mail className="h-3 w-3 ml-1" />
                        بريد
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800/70 backdrop-blur p-2 rounded border border-slate-700/50">
                      <p className="text-xs text-slate-400">الطلبات</p>
                      <p className="text-lg font-bold text-white">{customer.totalOrders}</p>
                    </div>
                    <div className="bg-slate-800/70 backdrop-blur p-2 rounded border border-slate-700/50">
                      <p className="text-xs text-slate-400">المبيعات</p>
                      <p className="text-lg font-bold text-green-400">{customer.totalRevenue.toLocaleString('ar-SA')} ر.س</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {customer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="border-blue-600 text-blue-300 text-xs bg-blue-950/30">
                          <Tag className="h-3 w-3 ml-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Rating */}
                  {customer.satisfactionScore && (
                    <div className="flex items-center gap-2 text-sm bg-yellow-950/20 p-2 rounded border border-yellow-900/30">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-semibold">{customer.satisfactionScore.toFixed(1)}</span>
                      <span className="text-slate-400">/ 5.0</span>
                    </div>
                  )}

                  {/* Last Order */}
                  <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-800/30 p-2 rounded">
                    <Clock className="h-3 w-3" />
                    آخر طلب: {customer.lastOrderDate}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog: Add Customer */}
        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <UserPlus className="h-6 w-6 text-blue-400" />
                إضافة عميل جديد
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                أدخل معلومات العميل الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">الاسم الكامل *</label>
                  <Input
                    placeholder="مثال: أحمد محمد علي"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">رقم الهاتف *</label>
                  <Input
                    placeholder="+966501234567"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">الشركة</label>
                  <Input
                    placeholder="اسم الشركة"
                    value={newCustomer.company}
                    onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">الحالة</label>
                  <Select value={newCustomer.status} onValueChange={(v) => setNewCustomer({ ...newCustomer, status: v as CustomerStatus })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="active" className="text-white">🟢 نشط</SelectItem>
                      <SelectItem value="vip" className="text-white">⭐ VIP</SelectItem>
                      <SelectItem value="inactive" className="text-white">⚫ غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">المرحلة</label>
                  <Select value={newCustomer.stage} onValueChange={(v) => setNewCustomer({ ...newCustomer, stage: v as CustomerStage })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="trial" className="text-white">🔵 تجربة</SelectItem>
                      <SelectItem value="follow-up" className="text-white">🟡 متابعة</SelectItem>
                      <SelectItem value="purchase" className="text-white">🟢 شراء</SelectItem>
                      <SelectItem value="loyal" className="text-white">🟣 دائم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">الأولوية</label>
                  <Select value={newCustomer.priority} onValueChange={(v) => setNewCustomer({ ...newCustomer, priority: v as Priority })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="low" className="text-white">💧 منخفض</SelectItem>
                      <SelectItem value="medium" className="text-white">⚡ متوسط</SelectItem>
                      <SelectItem value="high" className="text-white">⚠️ عالي</SelectItem>
                      <SelectItem value="urgent" className="text-white">🔥 عاجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">المصدر</label>
                <Select value={newCustomer.source} onValueChange={(v) => setNewCustomer({ ...newCustomer, source: v as any })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="whatsapp" className="text-white">💬 واتساب</SelectItem>
                    <SelectItem value="website" className="text-white">🌐 الموقع</SelectItem>
                    <SelectItem value="referral" className="text-white">👥 إحالة</SelectItem>
                    <SelectItem value="social-media" className="text-white">📱 سوشيال ميديا</SelectItem>
                    <SelectItem value="direct" className="text-white">🚶 مباشر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">ملاحظات</label>
                <Textarea
                  placeholder="أي معلومات إضافية عن العميل..."
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  rows={4}
                  className="bg-slate-800 border-slate-700 text-white resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddCustomer(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4 mr-2" />
                إلغاء
              </Button>
              <Button
                onClick={handleAddCustomer}
                disabled={!newCustomer.name || !newCustomer.phone}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                إضافة العميل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Customer Details */}
        <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 text-white max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {selectedCustomer && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedCustomer.name}
                        <Badge className={getStatusColor(selectedCustomer.status) + ' text-white'}>
                          {getStatusLabel(selectedCustomer.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 font-normal">{selectedCustomer.phone}</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-r from-blue-600/85 to-cyan-600/75 p-4 rounded-lg text-center">
                      <MessageSquare className="h-6 w-6 text-white mx-auto mb-2" />
                      <p className="text-xs font-semibold text-blue-100">الطلبات</p>
                      <p className="text-2xl font-extrabold text-white">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-600/85 to-emerald-600/75 p-4 rounded-lg text-center">
                      <TrendingUp className="h-6 w-6 text-white mx-auto mb-2" />
                      <p className="text-xs font-semibold text-green-100">المبيعات</p>
                      <p className="text-2xl font-extrabold text-white">{selectedCustomer.totalRevenue.toLocaleString('ar-SA')}</p>
                      <p className="text-xs font-semibold text-green-100">ريال</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-600/85 to-amber-600/75 p-4 rounded-lg text-center">
                      <Star className="h-6 w-6 text-white mx-auto mb-2" />
                      <p className="text-xs font-semibold text-yellow-100">التقييم</p>
                      <p className="text-2xl font-extrabold text-white">{selectedCustomer.satisfactionScore?.toFixed(1) || '-'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-600/85 to-pink-600/75 p-4 rounded-lg text-center">
                      <Badge className={getStageColor(selectedCustomer.stage) + ' text-white'}>
                        {getStageLabel(selectedCustomer.stage)}
                      </Badge>
                      <p className="text-xs font-semibold text-purple-100 mt-2">المرحلة</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/70 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      معلومات الاتصال
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedCustomer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300">{selectedCustomer.email}</span>
                        </div>
                      )}
                      {selectedCustomer.company && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300">{selectedCustomer.company}</span>
                        </div>
                      )}
                      {selectedCustomer.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300">{selectedCustomer.address}</span>
                        </div>
                      )}
                      {selectedCustomer.assignedTo && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300">مسؤول: {selectedCustomer.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedCustomer.tags.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 p-4 rounded-lg">
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        الوسوم
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="border-blue-600 text-blue-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedCustomer.notes && (
                    <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 p-4 rounded-lg">
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        ملاحظات
                      </h4>
                      <p className="text-slate-300 text-sm">{selectedCustomer.notes}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      التسلسل الزمني
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">تاريخ الإضافة</span>
                        <span className="text-white font-semibold">{selectedCustomer.createdAt}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">آخر طلب</span>
                        <span className="text-white font-semibold">{selectedCustomer.lastOrderDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                    className="border-red-700 text-red-400 hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    حذف
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomerDetails(false)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    إغلاق
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    تعديل
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
