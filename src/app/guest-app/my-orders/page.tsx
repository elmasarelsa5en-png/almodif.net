'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShoppingBag, Clock, CheckCircle2, XCircle,
  Utensils, Coffee, Shirt, Bell, DollarSign,
  Package, AlertCircle, Search, Download, Eye
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
  }, [router]);

  const loadOrders = async (guestData: any) => {
    setLoading(true);
    try {
      if (!db) {
        console.warn('Firebase not connected - using sample data');
        loadSampleOrders();
        return;
      }

      // 🔥 تحميل الطلبات الفعلية من Firebase
      const requestsRef = collection(db, 'requests');
      const q = query(
        requestsRef,
        where('room', '==', guestData.roomNumber),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const loadedOrders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        const order: Order = {
          id: doc.id,
          type: data.linkedSection === 'restaurant' ? 'restaurant' :
                data.linkedSection === 'coffee-shop' ? 'coffee-shop' :
                data.linkedSection === 'laundry' ? 'laundry' :
                data.type === 'تنظيف' || data.type === 'صيانة' ? 'room-service' : 'other',
          items: data.items || [{ name: data.description || data.notes || 'طلب', quantity: 1, price: data.totalAmount || 0 }],
          totalAmount: data.totalAmount || 0,
          status: data.status === 'completed' ? 'delivered' :
                  data.status === 'accepted' ? 'preparing' :
                  data.status === 'pending' ? 'pending' :
                  data.status === 'ready' ? 'ready' : 'pending',
          orderDate: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          deliveryTime: data.completedAt?.toDate?.()?.toISOString(),
          notes: data.notes || data.description,
          roomNumber: data.room || guestData.roomNumber,
          guestName: data.guest || guestData.name
        };
        
        loadedOrders.push(order);
      });
      
      if (loadedOrders.length > 0) {
        setOrders(loadedOrders);
      } else {
        loadSampleOrders();
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      loadSampleOrders();
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    const amountBeforeTax = order.totalAmount / 1.15;
    const vatData = calculateVAT(amountBeforeTax);
    
    const orderTypeMap = {
      'restaurant': 'مطعم',
      'coffee-shop': 'مقهى',
      'laundry': 'مغسلة',
      'room-service': 'خدمة الغرف',
      'other': 'خدمات أخرى'
    };
    
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
      roomNights: 1,
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
        orderDate: '2025-01-31T14:30:00',
        deliveryTime: '2025-01-31T15:15:00',
        roomNumber: guestSession?.roomNumber || '101',
        guestName: guestSession?.name || 'ضيف',
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
        orderDate: '2025-01-31T09:00:00',
        roomNumber: guestSession?.roomNumber || '101',
        guestName: guestSession?.name || 'ضيف'
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
        orderDate: '2025-01-30T16:00:00',
        roomNumber: guestSession?.roomNumber || '101',
        guestName: guestSession?.name || 'ضيف',
        notes: 'كي فقط'
      }
    ];
    setOrders(sampleOrders);
  };

  const getOrderTypeIcon = (type: string) => {
    const icons = {
      'restaurant': <Utensils className="w-5 h-5 text-white" />,
      'coffee-shop': <Coffee className="w-5 h-5 text-white" />,
      'laundry': <Shirt className="w-5 h-5 text-white" />,
      'room-service': <Bell className="w-5 h-5 text-white" />,
      'other': <ShoppingBag className="w-5 h-5 text-white" />
    };
    return icons[type as keyof typeof icons] || icons.other;
  };

  const getOrderTypeName = (type: string) => {
    const names = {
      'restaurant': 'المطعم',
      'coffee-shop': 'الكوفي شوب',
      'laundry': 'المغسلة',
      'room-service': 'خدمة الغرف',
      'other': 'طلب'
    };
    return names[type as keyof typeof names] || names.other;
  };

  const getOrderTypeColor = (type: string) => {
    const colors = {
      'restaurant': 'from-orange-600/40 to-amber-600/40 border-orange-400/50',
      'coffee-shop': 'from-amber-600/40 to-yellow-600/40 border-amber-400/50',
      'laundry': 'from-cyan-600/40 to-blue-600/40 border-cyan-400/50',
      'room-service': 'from-purple-600/40 to-pink-600/40 border-purple-400/50',
      'other': 'from-slate-600/40 to-slate-700/40 border-slate-400/50'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': <Clock className="w-5 h-5 text-amber-300" />,
      'preparing': <Package className="w-5 h-5 text-blue-300 animate-pulse" />,
      'ready': <CheckCircle2 className="w-5 h-5 text-green-300" />,
      'delivered': <CheckCircle2 className="w-5 h-5 text-emerald-300" />,
      'cancelled': <XCircle className="w-5 h-5 text-red-300" />
    };
    return icons[status as keyof typeof icons] || <AlertCircle className="w-5 h-5 text-slate-300" />;
  };

  const getStatusText = (status: string) => {
    const texts = {
      'pending': 'قيد الانتظار',
      'preparing': 'قيد التحضير',
      'ready': 'جاهز',
      'delivered': 'تم التسليم',
      'cancelled': 'ملغي'
    };
    return texts[status as keyof typeof texts] || 'غير محدد';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-amber-500/30 text-white border-amber-400/50',
      'preparing': 'bg-blue-500/30 text-white border-blue-400/50',
      'ready': 'bg-green-500/30 text-white border-green-400/50',
      'delivered': 'bg-emerald-500/30 text-white border-emerald-400/50',
      'cancelled': 'bg-red-500/30 text-white border-red-400/50'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-500/30 text-white border-slate-400/50';
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.25) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.25) 0%, transparent 50%)`,
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
        className="relative z-10 bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-pink-900/95 backdrop-blur-xl border-b border-purple-400/50 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/20"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                  طلباتي
                </h1>
                <p className="text-sm text-purple-200 mt-1 font-medium">جميع طلباتك في مكان واحد</p>
              </div>
            </div>
            
            {guestSession && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <span className="text-white font-bold text-sm">
                    {guestSession.name?.charAt(0)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-white font-bold">{guestSession.name}</p>
                  <p className="text-xs text-purple-200">غرفة {guestSession.roomNumber}</p>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 border-purple-400/50 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-200 font-semibold">إجمالي الطلبات</p>
                    <p className="text-3xl font-bold text-white drop-shadow-lg">{stats.total}</p>
                  </div>
                  <ShoppingBag className="w-10 h-10 text-purple-300" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-gradient-to-br from-amber-600/40 to-orange-600/40 border-amber-400/50 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-200 font-semibold">قيد الانتظار</p>
                    <p className="text-3xl font-bold text-white drop-shadow-lg">{stats.pending}</p>
                  </div>
                  <Clock className="w-10 h-10 text-amber-300" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-blue-600/40 to-cyan-600/40 border-blue-400/50 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-200 font-semibold">قيد التحضير</p>
                    <p className="text-3xl font-bold text-white drop-shadow-lg">{stats.preparing}</p>
                  </div>
                  <Package className="w-10 h-10 text-blue-300 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-gradient-to-br from-emerald-600/40 to-green-600/40 border-emerald-400/50 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-200 font-semibold">تم التسليم</p>
                    <p className="text-3xl font-bold text-white drop-shadow-lg">{stats.delivered}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-emerald-300" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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
                className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 shadow-lg ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-300/50 scale-105'
                    : 'bg-slate-800/70 text-slate-300 border border-slate-600/50 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                {tab.label} ({tab.count})
              </motion.button>
            ))}
          </div>

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
              className="pr-10 bg-slate-800/70 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 font-medium"
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
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
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
                <Card className={`relative bg-gradient-to-br ${getOrderTypeColor(order.type)} backdrop-blur-xl border-2 overflow-hidden group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-white/20"
                          whileHover={{ rotate: 360, scale: 1.15 }}
                          transition={{ duration: 0.6 }}
                        >
                          {getOrderTypeIcon(order.type)}
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                            {getOrderTypeName(order.type)}
                          </h3>
                          <p className="text-sm text-purple-200 font-semibold">رقم الطلب: #{order.id}</p>
                          <p className="text-xs text-slate-300 mt-1">{formatDate(order.orderDate)}</p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 shadow-lg ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-bold">{getStatusText(order.status)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-sm font-bold text-white">{item.quantity}</span>
                            </div>
                            <span className="text-sm font-semibold text-white">{item.name}</span>
                          </div>
                          {item.price > 0 && (
                            <span className="text-sm font-bold text-amber-300">
                              {item.price} ريال
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="p-3 bg-white/10 rounded-lg border border-purple-400/30 mb-4">
                        <p className="text-xs text-purple-300 font-bold mb-1">ملاحظات:</p>
                        <p className="text-sm text-white font-medium">{order.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-amber-400" />
                        <div>
                          <p className="text-xs text-amber-200 font-bold">المجموع</p>
                          <p className="text-2xl font-bold text-white drop-shadow-lg">
                            {order.totalAmount > 0 ? `${order.totalAmount} ريال` : 'مجاني'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2 border-purple-400/50 text-white font-bold hover:bg-purple-500/30 shadow-lg"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          التفاصيل
                        </Button>
                        {order.status === 'delivered' && (
                          <Button
                            size="sm"
                            onClick={() => handleDownloadInvoice(order)}
                            className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold shadow-xl"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            الفاتورة
                          </Button>
                        )}
                      </div>
                    </div>

                    {order.deliveryTime && (
                      <div className="mt-4 p-3 bg-emerald-500/20 rounded-lg border-2 border-emerald-400/50 shadow-lg">
                        <div className="flex items-center gap-2 text-sm text-white font-bold">
                          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
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
            <Card className="bg-gradient-to-r from-amber-600/40 via-purple-600/40 to-pink-600/40 border-2 border-amber-400/50 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/30">
                      <DollarSign className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-amber-200 font-bold">إجمالي المصروفات</p>
                      <p className="text-4xl font-bold text-white drop-shadow-lg">
                        {stats.totalSpent.toLocaleString()} ريال
                      </p>
                    </div>
                  </div>
                  <Button
                    className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 font-bold shadow-xl"
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
