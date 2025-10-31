'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShoppingBag, Clock, CheckCircle2, XCircle,
  Utensils, Coffee, Shirt, Bell, Calendar, Phone, DollarSign,
  Package, AlertCircle, Filter, Search, Download, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { generateAndPrintInvoice, calculateVAT, type InvoiceData } from '@/lib/invoice-generator';

interface Order {
  id: string;
  type: 'restaurant' | 'coffee-shop' | 'laundry' | 'room-service' | 'other';
  items: any[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryTime?: string;
  notes?: string;
  roomNumber: string;
  guestName: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [guestSession, setGuestSession] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('guest_session');
    if (!session) {
      router.push('/guest-app/login');
      return;
    }

    const guestData = JSON.parse(session);
    setGuestSession(guestData);
    loadOrders(guestData);
  }, []);

  const loadOrders = async (guestData: any) => {
    setLoading(true);
    try {
      if (!db) {
        console.warn('Firebase not connected - using sample data');
        loadSampleOrders();
        return;
      }

      // يمكن تحميل الطلبات من Firebase هنا
      // للآن نستخدم بيانات تجريبية
      loadSampleOrders();
    } catch (error) {
      console.error('Error loading orders:', error);
      loadSampleOrders();
    } finally {
      setLoading(false);
    }
  };

  // دالة تحميل الفاتورة
  const handleDownloadInvoice = (order: Order) => {
    // حساب الضريبة
    const amountBeforeTax = order.totalAmount / 1.15; // إزالة الـ 15% VAT
    const vatData = calculateVAT(amountBeforeTax);
    
    // تحديد نوع الطلب بالعربية
    const orderTypeMap = {
      'restaurant': 'مطعم',
      'coffee-shop': 'مقهى',
      'laundry': 'مغسلة',
      'room-service': 'خدمة الغرف',
      'other': 'خدمات أخرى'
    };
    
    // بناء وصف تفصيلي للطلبات
    const itemsDescription = order.items.map(item => 
      `${item.name} (${item.quantity}×)`
    ).join(', ');
    
    const invoiceData: InvoiceData = {
      id: order.id,
      number: `ORD-${order.id}-${new Date().getFullYear()}`,
      date: new Date(order.orderDate).toISOString().split('T')[0],
      customerName: order.guestName,
      phone: guestSession?.phone || '',
      room: order.roomNumber,
      description: `${orderTypeMap[order.type]} - ${itemsDescription}${order.notes ? `\nملاحظات: ${order.notes}` : ''}`,
      amountBeforeTax: amountBeforeTax,
      taxAmount: vatData.taxAmount,
      amountAfterTax: order.totalAmount,
      paymentType: 'مدفوع',
      bookingId: `ORDER-${order.id}`,
      roomNights: 1, // للطلبات نستخدم 1 كعدد افتراضي
      hotelName: 'المضيف سمارت لإدارة الفنادق والمنتجعات',
      hotelAddress: 'أبها، شارع العرين',
      hotelPhone: '+966559902557',
      hotelEmail: 'akramabdelaziz1992@gmail.com',
      hotelVAT: '300092095780003',
      hotelCR: '7017845756'
    };
    
    generateAndPrintInvoice(invoiceData);
  };

  const loadSampleOrders = () => {
    const sampleOrders: Order[] = [
      {
        id: '001',
        type: 'restaurant',
        items: [
          { name: 'برجر لحم', quantity: 2, price: 45 },
          { name: 'بطاطس مقلية', quantity: 1, price: 15 },
          { name: 'مشروب غازي', quantity: 2, price: 10 }
        ],
        totalAmount: 115,
        status: 'delivered',
        orderDate: '2025-10-31T14:30:00',
        deliveryTime: '2025-10-31T15:15:00',
        roomNumber: guestSession?.roomNumber || '101',
        guestName: guestSession?.name || 'عقرم المضيف',
        notes: 'بدون خيار'
      },
      {
        id: '002',
        type: 'coffee-shop',
        items: [
          { name: 'كابتشينو', quantity: 1, price: 18 },
          { name: 'كروسان بالشوكولاتة', quantity: 2, price: 25 }
        ],
        totalAmount: 68,
        status: 'preparing',
        orderDate: '2025-10-31T09:00:00',
        roomNumber: guestSession?.roomNumber || '101',
        guestName: guestSession?.name || 'عقرم المضيف'
      },
      {
        id: '003',
        type: 'laundry',
        items: [
          { name: 'قميص', quantity: 3, price: 15 },
          { name: 'بنطلون', quantity: 2, price: 20 }
        ],
        totalAmount: 85,
        status: 'ready',
        orderDate: '2025-10-30T16:00:00',
        roomNumber: guestSession?.roomNumber || '101',
        guestName: guestSession?.name || 'عقرم المضيف',
        notes: 'كي فقط'
      },
      {
        id: '004',
        type: 'room-service',
        items: [
          { name: 'منشفة إضافية', quantity: 2, price: 0 },
          { name: 'شامبو', quantity: 1, price: 0 }
        ],
        totalAmount: 0,
        status: 'delivered',
        orderDate: '2025-10-30T11:00:00',
        deliveryTime: '2025-10-30T11:20:00',
        roomNumber: guestSession?.roomNumber || '101',
        guestName: guestSession?.name || 'عقرم المضيف'
      },
      {
        id: '005',
        type: 'restaurant',
        items: [
          { name: 'ستيك لحم', quantity: 1, price: 95 },
          { name: 'سلطة خضراء', quantity: 1, price: 25 }
        ],
        totalAmount: 120,
        status: 'pending',
        orderDate: '2025-10-31T18:00:00',
        roomNumber: guestSession?.roomNumber || '101',
        guestName: guestSession?.name || 'عقرم المضيف'
      }
    ];
    setOrders(sampleOrders);
    setLoading(false);
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <Utensils className="w-5 h-5" />;
      case 'coffee-shop':
        return <Coffee className="w-5 h-5" />;
      case 'laundry':
        return <Shirt className="w-5 h-5" />;
      case 'room-service':
        return <Bell className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const getOrderTypeName = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'المطعم';
      case 'coffee-shop':
        return 'الكوفي شوب';
      case 'laundry':
        return 'المغسلة';
      case 'room-service':
        return 'خدمة الغرف';
      default:
        return 'طلب';
    }
  };

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'from-orange-500/20 to-amber-500/20 border-orange-400/30';
      case 'coffee-shop':
        return 'from-yellow-500/20 to-amber-500/20 border-yellow-400/30';
      case 'laundry':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30';
      case 'room-service':
        return 'from-purple-500/20 to-pink-500/20 border-purple-400/30';
      default:
        return 'from-slate-500/20 to-slate-600/20 border-slate-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'ready':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'preparing':
        return 'قيد التحضير';
      case 'ready':
        return 'جاهز';
      case 'delivered':
        return 'تم التسليم';
      case 'cancelled':
        return 'ملغي';
      default:
        return 'غير محدد';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'preparing':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'ready':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchQuery === '' || 
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.id.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalSpent: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0)
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(217, 179, 69, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`,
            backgroundSize: '400% 400%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-purple-500/30 shadow-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="text-purple-200 hover:text-purple-100 hover:bg-purple-500/20"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                  طلباتي
                </h1>
                <p className="text-sm text-slate-400 mt-1">جميع طلباتك في مكان واحد</p>
              </div>
            </div>
            
            {guestSession && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {guestSession.name?.charAt(0)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-purple-100 font-medium">{guestSession.name}</p>
                  <p className="text-xs text-slate-400">غرفة {guestSession.roomNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">قيد الانتظار</p>
                    <p className="text-2xl font-bold text-white">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">قيد التحضير</p>
                    <p className="text-2xl font-bold text-white">{stats.preparing}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">تم التسليم</p>
                    <p className="text-2xl font-bold text-white">{stats.delivered}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap flex-1">
            {[
              { key: 'all', label: 'الكل', count: stats.total },
              { key: 'pending', label: 'قيد الانتظار', count: stats.pending },
              { key: 'preparing', label: 'قيد التحضير', count: stats.preparing },
              { key: 'ready', label: 'جاهز', count: stats.ready },
              { key: 'delivered', label: 'تم التسليم', count: stats.delivered }
            ].map((tab, index) => (
              <motion.button
                key={tab.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  filter === tab.key
                    ? 'bg-purple-500/30 text-purple-100 border-2 border-purple-400/50'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800/80'
                }`}
              >
                {tab.label} ({tab.count})
              </motion.button>
            ))}
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن طلب..."
              className="pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400"
            />
          </motion.div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <ShoppingBag className="w-24 h-24 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">لا توجد طلبات</h3>
            <p className="text-slate-500 mb-6">ابدأ بطلب شيء من خدماتنا</p>
            <Button
              onClick={() => router.push('/guest-app')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              اطلب الآن
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`relative bg-gradient-to-br ${getOrderTypeColor(order.type)} backdrop-blur-xl border overflow-hidden group hover:shadow-2xl transition-all duration-300`}>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                  
                  <CardContent className="p-6 relative z-10">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          {getOrderTypeIcon(order.type)}
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {getOrderTypeName(order.type)}
                          </h3>
                          <p className="text-sm text-slate-400">رقم الطلب: #{order.id}</p>
                          <p className="text-xs text-slate-500 mt-1">{formatDate(order.orderDate)}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium">{getStatusText(order.status)}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-purple-300">{item.quantity}</span>
                            </div>
                            <span className="text-sm text-slate-300">{item.name}</span>
                          </div>
                          {item.price > 0 && (
                            <span className="text-sm font-medium text-amber-300">
                              {item.price} ريال
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="p-3 bg-white/5 rounded-lg border border-slate-700/50 mb-4">
                        <p className="text-xs text-slate-400 mb-1">ملاحظات:</p>
                        <p className="text-sm text-slate-300">{order.notes}</p>
                      </div>
                    )}

                    {/* Total and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-xs text-slate-400">المجموع</p>
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-100">
                            {order.totalAmount > 0 ? `${order.totalAmount} ريال` : 'مجاني'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          التفاصيل
                        </Button>
                        {order.status === 'delivered' && (
                          <Button
                            size="sm"
                            onClick={() => handleDownloadInvoice(order)}
                            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            الفاتورة
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Delivery Time */}
                    {order.deliveryTime && (
                      <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-400/30">
                        <div className="flex items-center gap-2 text-sm text-green-300">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تم التسليم في: {formatDate(order.deliveryTime)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Total Spent Summary */}
        {stats.totalSpent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border-amber-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">إجمالي المصروفات</p>
                      <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-purple-200">
                        {stats.totalSpent.toLocaleString()} ريال
                      </p>
                    </div>
                  </div>
                  <Button
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    تحميل كشف حساب
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
