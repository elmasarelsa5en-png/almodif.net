﻿'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MenuItem, Order } from '@/lib/restaurant-db';
import {
  Plus,
  Edit2,
  Trash2,
  ChefHat,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  UtensilsCrossed,
  Beef,
  Fish,
  Salad,
  Coffee,
  IceCream,
  ShoppingCart,
  Star,
  Crown,
  Sparkles,
  Timer,
  Award,
  Zap,
  ArrowLeft,
  Heart,
  CheckCircle,
  AlertCircle,
  Flame,
  Snowflake,
  Cookie,
  Pizza,
  Soup
} from 'lucide-react'

// Professional animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
}

const tabVariants = {
  inactive: { 
    scale: 0.95, 
    opacity: 0.7,
    y: 2 
  },
  active: { 
    scale: 1, 
    opacity: 1,
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 500, 
      damping: 30 
    }
  }
}

const categories = ['مقبلات', 'أطباق رئيسية', 'مشروبات', 'حلويات']

const categoryIcons = {
  'مقبلات': Salad,
  'أطباق رئيسية': Beef,
  'مشروبات': Coffee,
  'حلويات': IceCream
}
export default function RestaurantPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<{menuItem: MenuItem, quantity: number}[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerType, setCustomerType] = useState<'internal' | 'external'>('external')
  const [roomNumber, setRoomNumber] = useState('')
  const [occupiedRooms, setOccupiedRooms] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'room'>('cash')
  const [orderNotes, setOrderNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'statistics'>('orders')
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل')
  const [isEditingMenu, setIsEditingMenu] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    category: 'مقبلات',
    price: 0,
    description: '',
    available: true
  })

  useEffect(() => {
    const loadData = async () => {
      setOccupiedRooms([]); // إعادة تعيين الحالة قبل التحميل
      try {
        const [menuRes, ordersRes, roomsRes] = await Promise.all([
          fetch('/api/restaurant/menu', { cache: 'no-store' }),
          fetch('/api/restaurant/orders', { cache: 'no-store' }),
          fetch('/api/rooms-catalog', { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store' 
          })
        ]);

        const menuJson = await menuRes.json();
        const ordersJson = await ordersRes.json();
        const roomsJson = await roomsRes.json();

        if (menuJson.success) {
          setMenuItems(menuJson.data);
        } else {
          console.error("فشل في تحميل القائمة:", menuJson.message);
          // إضافة بيانات تجريبية إذا فشل تحميل البيانات
          setMenuItems([
            {
              id: '1',
              name: 'برجر لحم مشوي',
              category: 'أطباق رئيسية',
              price: 45,
              description: 'برجر لحم بقري طازج مع البصل والطماطم والخس',
              available: true
            },
            {
              id: '2', 
              name: 'سلطة سيزر',
              category: 'مقبلات',
              price: 25,
              description: 'سلطة خضراء طازجة مع صوص السيزر والجبن',
              available: true
            },
            {
              id: '3',
              name: 'قهوة عربية',
              category: 'مشروبات', 
              price: 15,
              description: 'قهوة عربية أصيلة محضرة على الطريقة التقليدية',
              available: true
            },
            {
              id: '4',
              name: 'تشيز كيك',
              category: 'حلويات',
              price: 30,
              description: 'تشيز كيك كريمي بالفراولة الطازجة',
              available: true
            },
            {
              id: '5',
              name: 'ستيك لحم مشوي',
              category: 'أطباق رئيسية',
              price: 85,
              description: 'قطعة لحم مشوية مع الخضار والبطاطس المحمرة',
              available: true
            },
            {
              id: '6',
              name: 'عصير برتقال طبيعي',
              category: 'مشروبات',
              price: 12,
              description: 'عصير برتقال طبيعي 100% بدون إضافات',
              available: true
            }
          ]);
        }

        if (ordersJson.success) {
          setOrders(ordersJson.data.map((o: any) => ({...o, orderTime: new Date(o.orderTime)})));
        } else {
          console.error("فشل في تحميل الطلبات:", ordersJson.message);
        }

        if (roomsJson.success && roomsJson.data) {
          const occupied = roomsJson.data.filter((room: any) => room.status === 'Occupied' && room.guestName);
          setOccupiedRooms(occupied);
          console.log('تم تحميل الغرف المشغولة بنجاح');
        } else {
          console.error("فشل في تحميل الغرف:", roomsJson.message);
          // بيانات تجريبية للغرف المشغولة
          setOccupiedRooms([
            { id: '1', number: '101', guestName: 'أحمد محمد', status: 'Occupied' },
            { id: '2', number: '205', guestName: 'سارة أحمد', status: 'Occupied' },
            { id: '3', number: '312', guestName: 'محمد علي', status: 'Occupied' }
          ]);
        }

      } catch (error) {
        console.error("فشل في تحميل البيانات الأولية:", error);
        // في حالة فشل الاتصال، استخدام بيانات تجريبية
        setMenuItems([
          {
            id: '1',
            name: 'برجر لحم مشوي',
            category: 'أطباق رئيسية',
            price: 45,
            description: 'برجر لحم بقري طازج مع البصل والطماطم والخس',
            available: true
          },
          {
            id: '2', 
            name: 'سلطة سيزر',
            category: 'مقبلات',
            price: 25,
            description: 'سلطة خضراء طازجة مع صوص السيزر والجبن',
            available: true
          },
          {
            id: '3',
            name: 'قهوة عربية',
            category: 'مشروبات', 
            price: 15,
            description: 'قهوة عربية أصيلة محضرة على الطريقة التقليدية',
            available: true
          },
          {
            id: '4',
            name: 'تشيز كيك',
            category: 'حلويات',
            price: 30,
            description: 'تشيز كيك كريمي بالفراولة الطازجة',
            available: true
          }
        ]);
        setOccupiedRooms([
          { id: '1', number: '101', guestName: 'أحمد محمد', status: 'Occupied' },
          { id: '2', number: '205', guestName: 'سارة أحمد', status: 'Occupied' }
        ]);
      }
    };
    loadData();
  }, [])

  // إضافة عنصر للطلب الحالي
  const addToCurrentOrder = (menuItem: MenuItem) => {
    const existingIndex = currentOrder.findIndex(item => item.menuItem.id === menuItem.id)
    if (existingIndex >= 0) {
      const newOrder = [...currentOrder]
      newOrder[existingIndex].quantity += 1
      setCurrentOrder(newOrder)
    } else {
      setCurrentOrder([...currentOrder, { menuItem, quantity: 1 }])
    }
  }

  // إزالة عنصر من الطلب الحالي
  const removeFromCurrentOrder = (menuItemId: string) => {
    setCurrentOrder(currentOrder.filter(item => item.menuItem.id !== menuItemId))
  }

  // تحديث كمية عنصر في الطلب
  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCurrentOrder(menuItemId)
      return
    }

    const newOrder = currentOrder.map(item =>
      item.menuItem.id === menuItemId ? { ...item, quantity } : item
    )
    setCurrentOrder(newOrder)
  }

  // التعامل مع تغيير نوع العميل
  const handleCustomerTypeChange = (type: 'internal' | 'external') => {
    setCustomerType(type)
    if (type === 'external') {
      setRoomNumber('')
      setCustomerName('')
    }
  }

  // التعامل مع اختيار الغرفة
  const handleRoomChange = (roomNum: string) => {
    setRoomNumber(roomNum)
    if (roomNum) {
      const room = occupiedRooms.find(r => r.number === roomNum)
      if (room && room.guestName) {
        setCustomerName(room.guestName)
      }
    } else {
      setCustomerName('')
    }
  }

  // حساب إجمالي الطلب
  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0)
  }

  // إنشاء طلب جديد
  const createOrder = async () => {
    if (currentOrder.length === 0 || !customerName.trim()) {
      alert('يرجى إضافة عناصر للطلب وإدخال اسم العميل')
      return
    }

    const orderData = {
      items: currentOrder,
      customerName: customerName.trim(),
      roomNumber: customerType === 'internal' ? roomNumber : undefined,
      totalAmount: calculateTotal(),
      paymentMethod,
      notes: orderNotes.trim() || undefined
    };

    try {
      const response = await fetch('/api/restaurant/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      if (result.success) {
        setOrders([result.data, ...orders]);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      alert('فشل في إنشاء الطلب. يرجى المحاولة مرة أخرى.');
    }

    // إضافة للسجل المالي للغرفة إذا كان الدفع على الغرفة
    if (paymentMethod === 'room' && roomNumber.trim()) {
      // في التطبيق الحقيقي، هذا سيكون استدعاء API
      // await fetch(`/api/accounting/ledger/${roomNumber}`, {
      //   method: 'POST',
      //   body: JSON.stringify({ description: `طلب مطعم - ${customerName}`, amount: calculateTotal() })
      // });
      console.log(`Charge to room ${roomNumber}: ${calculateTotal()}`);
    }

    // إعادة تعيين النموذج
    setCurrentOrder([])
    setCustomerName('')
    setCustomerType('external')
    setRoomNumber('')
    setOrderNotes('')
    setPaymentMethod('cash')

    // توجيه إلى صفحة طلبات النزلاء
    router.push('/dashboard/requests')
  }

  // تحديث حالة الطلب
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {    
    try {
      const response = await fetch(`/api/restaurant/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.success) {
        setOrders(orders.map(order => (order.id === orderId ? { ...order, status } : order)));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert('فشل في تحديث حالة الطلب.');
    }
  }

  // حذف طلب
  const deleteOrder = useCallback(async (orderId: string) => {
    const isConfirmed = window.confirm('هل أنت متأكد من حذف هذا الطلب؟');
    if (!isConfirmed) return;

    const response = await fetch(`/api/restaurant/orders/${orderId}`, { method: 'DELETE' });
    if (response.ok) {
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } else {
      alert('فشل في حذف الطلب.');
    }
  }, []);

  // إضافة/تحديث عنصر في القائمة
  const saveMenuItem = async () => {
    if (!newMenuItem.name.trim() || newMenuItem.price <= 0) {
      alert('يرجى إدخال اسم الطبق والسعر')
      return
    }

    try {
      let result;
      if (editingItem) {
        // Update logic (PUT request to /api/restaurant/menu/[id])
        const response = await fetch(`/api/restaurant/menu/${editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMenuItem),
        });
        result = await response.json();
        if (result.success) {
            setMenuItems(menuItems.map(item => (item.id === editingItem.id ? result.data : item)));
        }
      } else {
        // Create logic
        const response = await fetch('/api/restaurant/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMenuItem),
        });
        result = await response.json();
        if (result.success) {
          setMenuItems([...menuItems, result.data]);
        }
      }

      if (result.success) {
        setNewMenuItem({
          name: '',
          category: 'مقبلات',
          price: 0,
          description: '',
          available: true
        });
        setIsEditingMenu(false);
        setEditingItem(null);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Failed to save menu item:", error);
      alert('فشل في حفظ الطبق. يرجى المحاولة مرة أخرى.');
    }
  }

  // تحرير عنصر من القائمة
  const editMenuItem = (item: MenuItem) => {
    setEditingItem(item)
    setNewMenuItem({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      available: item.available
    })
    setIsEditingMenu(true)
  }

  // حذف عنصر من القائمة
  const deleteMenuItem = useCallback(async (itemId: string) => {
    const isConfirmed = window.confirm('هل أنت متأكد من حذف هذا الطبق؟');
    if (!isConfirmed) return;

    const response = await fetch(`/api/restaurant/menu/${itemId}`, { method: 'DELETE' });
    if (response.ok) {
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } else {
      alert('فشل في حذف الطبق.');
    }
  }, []);

  // إحصائيات المطعم
  const todayOrders = orders.filter(order => {
    const today = new Date()
    const orderDate = new Date(order.orderTime)
    return orderDate.toDateString() === today.toDateString()
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)

  const categoryStats = categories.map(category => {
    const categoryItems = menuItems.filter(item => item.category === category)
    const categoryOrders = orders.flatMap(order =>
      order.items.filter(item => item.menuItem.category === category)
    )
    const totalSold = categoryOrders.reduce((sum, item) => sum + item.quantity, 0)
    return {
      category,
      itemsCount: categoryItems.length,
      totalSold,
      revenue: categoryOrders.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
    }
  })

  // فلترة العناصر حسب الفئة
  const filteredMenuItems = selectedCategory === 'الكل'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory)
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Restaurant Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-900 to-orange-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-transparent to-orange-500/15" />
      
      {/* Floating Food Icons Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-5"
            animate={{
              y: [0, -40, 0],
              rotate: [0, 360],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 20 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 15
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {i % 5 === 0 ? <Pizza className="w-8 h-8 text-red-400" /> :
             i % 5 === 1 ? <Soup className="w-8 h-8 text-orange-400" /> :
             i % 5 === 2 ? <Coffee className="w-8 h-8 text-amber-400" /> :
             i % 5 === 3 ? <IceCream className="w-8 h-8 text-pink-400" /> :
             <Salad className="w-8 h-8 text-green-400" />}
          </motion.div>
        ))}
      </div>

      {/* Main Container */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Professional Header */}
        <motion.div 
          className="mb-12 text-center relative"
          variants={itemVariants}
        >
          <div className="relative inline-block">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.6 }
              }}
            >
              <ChefHat className="h-10 w-10 text-white" />
            </motion.div>
            <div className="absolute -top-2 -right-2">
              <Crown className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent mb-4">
            مطعم بوريسلي الفاخر
          </h1>
          <p className="text-xl text-red-300 font-medium">
            إدارة احترافية للقائمة والطلبات والإحصائيات
          </p>
          
          {/* Decorative Elements */}
          <div className="flex justify-center gap-4 mt-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              >
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Premium Navigation Tabs */}
        <motion.div 
          className="relative mb-8"
          variants={itemVariants}
        >
          <div className="bg-black/20 backdrop-blur-2xl rounded-2xl p-2 border border-red-400/20 shadow-2xl">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'orders', label: 'إنشاء طلب', icon: ShoppingCart, color: 'from-green-500 to-emerald-500' },
                { id: 'menu', label: 'إدارة القائمة', icon: UtensilsCrossed, color: 'from-blue-500 to-indigo-500' },
                { id: 'statistics', label: 'الإحصائيات', icon: TrendingUp, color: 'from-purple-500 to-pink-500' }
              ].map((tab) => (
                <motion.div key={tab.id}>
                  <Button
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full h-14 text-lg font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-xl scale-105`
                        : 'bg-transparent text-red-200 hover:bg-red-500/20 hover:text-white'
                    }`}
                    variants={tabVariants}
                    animate={activeTab === tab.id ? "active" : "inactive"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="h-6 w-6 mr-3" />
                    {tab.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Professional Order Creation */}
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div 
              className="grid grid-cols-1 xl:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
            >
              {/* Premium Menu Display */}
              <div className="xl:col-span-3">
                <motion.div variants={itemVariants}>
                  <Card className="bg-black/20 backdrop-blur-2xl border-red-400/20 shadow-2xl">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-red-200 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="h-6 w-6 text-white" />
                          </div>
                          قائمة أطباقنا المميزة
                        </CardTitle>
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold">
                          <Crown className="h-4 w-4 mr-1" />
                          مطعم 5 نجوم
                        </Badge>
                      </div>
                      
                      {/* Professional Category Filter */}
                      <div className="flex gap-3 mt-6">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant={selectedCategory === 'الكل' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('الكل')}
                            className={`${
                              selectedCategory === 'الكل'
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                                : 'border-red-400/50 text-red-200 hover:bg-red-500/20'
                            } font-semibold px-6 py-2`}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            جميع الأطباق
                          </Button>
                        </motion.div>
                        
                        {categories.map((category, index) => {
                          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
                          return (
                            <motion.div 
                              key={category}
                              whileHover={{ scale: 1.05 }} 
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Button
                                variant={selectedCategory === category ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(category)}
                                className={`${
                                  selectedCategory === category
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                                    : 'border-red-400/50 text-red-200 hover:bg-red-500/20'
                                } font-semibold px-4 py-2`}
                              >
                                <CategoryIcon className="h-4 w-4 mr-2" />
                                {category}
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        variants={containerVariants}
                      >
                        <AnimatePresence>
                          {filteredMenuItems.map((item, index) => (
                            <motion.div
                              key={item.id}
                              variants={itemVariants}
                              layout
                              className="group relative"
                              whileHover={{ scale: 1.02, rotateY: 5 }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-red-400/20 hover:border-red-400/40 transition-all duration-500 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-500/25 h-full">
                                {/* Premium Dish Display */}
                                <div className="relative h-56 bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100 overflow-hidden">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div 
                                      className="text-7xl group-hover:scale-110 transition-transform duration-500"
                                      animate={{ 
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                      }}
                                      transition={{ 
                                        duration: 4,
                                        repeat: Infinity,
                                        delay: index * 0.2
                                      }}
                                    >
                                      {item.category === 'مقبلات' ? '🥗' :
                                       item.category === 'أطباق رئيسية' ? '🍽️' :
                                       item.category === 'مشروبات' ? '☕' : 
                                       '🍰'}
                                    </motion.div>
                                  </div>
                                  
                                  {/* Floating sparkles */}
                                  <div className="absolute inset-0">
                                    {[...Array(3)].map((_, i) => (
                                      <motion.div
                                        key={i}
                                        className="absolute opacity-0 group-hover:opacity-100"
                                        animate={{
                                          y: [0, -20, 0],
                                          scale: [0, 1, 0],
                                          rotate: [0, 180, 360]
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          delay: i * 0.3
                                        }}
                                        style={{
                                          left: `${20 + i * 30}%`,
                                          top: `${20 + i * 20}%`,
                                        }}
                                      >
                                        <Sparkles className="h-4 w-4 text-yellow-400" />
                                      </motion.div>
                                    ))}
                                  </div>
                                  
                                  {/* Premium Price Badge */}
                                  <motion.div 
                                    className="absolute top-4 left-4 z-10"
                                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                  >
                                    <Badge className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-bold text-lg px-4 py-2 shadow-2xl">
                                      <DollarSign className="h-4 w-4 mr-1" />
                                      {item.price} ريال
                                    </Badge>
                                  </motion.div>

                                  {/* Status Badge */}
                                  <div className="absolute top-4 right-4 z-10">
                                    <Badge 
                                      className={`${
                                        item.available 
                                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                          : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                      } shadow-lg font-semibold`}
                                    >
                                      {item.available ? (
                                        <>
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          متوفر
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          غير متوفر
                                        </>
                                      )}
                                    </Badge>
                                  </div>

                                  {/* Category Badge */}
                                  <div className="absolute bottom-4 left-4 z-10">
                                    <Badge 
                                      variant="outline" 
                                      className="bg-white/90 text-gray-800 border-orange-400 font-medium"
                                    >
                                      {item.category}
                                    </Badge>
                                  </div>

                                  {/* Hover Effect Overlay */}
                                  <motion.div 
                                    className="absolute inset-0 bg-gradient-to-t from-green-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center"
                                    whileHover={{ 
                                      background: "linear-gradient(to top, rgba(34, 197, 94, 0.3), transparent, transparent)" 
                                    }}
                                  >
                                    <motion.div
                                      className="bg-green-600 text-white p-4 rounded-full shadow-2xl"
                                      whileHover={{ scale: 1.2, rotate: 360 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <Plus className="h-8 w-8" />
                                    </motion.div>
                                  </motion.div>
                                </div>

                                {/* Premium Dish Information */}
                                <CardContent className="p-6 text-white space-y-4">
                                  {/* Title and Rating */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="text-xl font-bold text-red-200 group-hover:text-yellow-300 transition-colors duration-300">
                                        {item.name}
                                      </h3>
                                      <motion.div 
                                        className="flex items-center gap-1"
                                        whileHover={{ scale: 1.1 }}
                                      >
                                        {[...Array(5)].map((_, i) => (
                                          <motion.div
                                            key={i}
                                            animate={{ 
                                              scale: [1, 1.2, 1],
                                              rotate: [0, 180, 360]
                                            }}
                                            transition={{ 
                                              duration: 2,
                                              repeat: Infinity,
                                              delay: i * 0.1
                                            }}
                                          >
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                          </motion.div>
                                        ))}
                                      </motion.div>
                                    </div>
                                    
                                    <p className="text-red-300/90 text-sm leading-relaxed mb-3">
                                      {item.description || 'طبق مميز من أطباق مطعمنا الفاخر مُحضر بعناية من أجود المكونات'}
                                    </p>
                                  </div>

                                  {/* Professional Features */}
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex gap-2">
                                      <Badge variant="outline" className="text-red-300 border-red-400 bg-red-500/10">
                                        <Timer className="h-3 w-3 mr-1" />
                                        15 دقيقة
                                      </Badge>
                                      <Badge variant="outline" className="text-red-300 border-red-400 bg-red-500/10">
                                        <Award className="h-3 w-3 mr-1" />
                                        طبق مميز
                                      </Badge>
                                    </div>
                                    <Badge variant="outline" className="text-yellow-300 border-yellow-400 bg-yellow-500/10">
                                      <Zap className="h-3 w-3 mr-1" />
                                      250 سعرة
                                    </Badge>
                                  </div>

                                  {/* Add to Cart Button */}
                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Button
                                      onClick={() => addToCurrentOrder(item)}
                                      disabled={!item.available}
                                      className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold py-4 text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed border-0"
                                    >
                                      <Plus className="h-5 w-5 mr-3" />
                                      {item.available ? 'إضافة للطلب الآن' : 'غير متوفر حالياً'}
                                    </Button>
                                  </motion.div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        {/* Premium Empty State */}
                        {filteredMenuItems.length === 0 && (
                          <motion.div 
                            className="col-span-full text-center py-20"
                            variants={itemVariants}
                          >
                            <motion.div
                              animate={{ 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                duration: 3,
                                repeat: Infinity
                              }}
                            >
                              <UtensilsCrossed className="h-24 w-24 text-red-400/50 mx-auto mb-6" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-red-300 mb-4">لا توجد أطباق في هذه الفئة</h3>
                            <p className="text-red-400/70 text-lg">قم بإضافة أطباق جديدة من قسم "إدارة القائمة"</p>
                          </motion.div>
                        )}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>

            {/* تفاصيل الطلب */}
            <div>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    الطلب الحالي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* عناصر الطلب */}
                  {currentOrder.length > 0 ? (
                    <div className="space-y-2">
                      {currentOrder.map(item => (
                        <div key={item.menuItem.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.menuItem.name}</p>
                            <p className="text-gray-300 text-sm">{item.menuItem.price} ريال × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              -
                            </Button>
                            <span className="text-white w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              +
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCurrentOrder(item.menuItem.id)}
                              className="h-6 w-6 p-0 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Separator className="bg-white/20" />
                      <div className="flex justify-between items-center text-lg font-bold text-white">
                        <span>الإجمالي:</span>
                        <span>{calculateTotal()} ريال</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">لا توجد عناصر في الطلب</p>
                  )}

                  <Separator className="bg-white/20" />

                  {/* معلومات العميل */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">نوع العميل</Label>
                      <RadioGroup
                        value={customerType}
                        onValueChange={handleCustomerTypeChange}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="external" id="external" />
                          <Label htmlFor="external" className="text-white">عميل خارجي</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="internal" id="internal" />
                          <Label htmlFor="internal" className="text-white">نزيل في الفندق</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {customerType === 'internal' && (
                      <div>
                        <Label htmlFor="roomNumber" className="text-white">رقم الغرفة *</Label>
                        <Select value={roomNumber} onValueChange={handleRoomChange}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="اختر الغرفة" />
                          </SelectTrigger>
                          <SelectContent>
                            {occupiedRooms.map(room => (
                              <SelectItem key={room.id} value={room.number}>
                                غرفة {room.number} - {room.guestName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="customerName" className="text-white">اسم العميل *</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="أدخل اسم العميل"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        disabled={customerType === 'internal'}
                      />
                    </div>

                    <div>
                      <Label className="text-white">طريقة الدفع</Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(value: 'cash' | 'card' | 'room') => setPaymentMethod(value)}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash" className="text-white">نقدي</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="text-white">بطاقة</Label>
                        </div>
                        {customerType === 'internal' && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="room" id="room" />
                            <Label htmlFor="room" className="text-white">على الغرفة</Label>
                          </div>
                        )}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="orderNotes" className="text-white">ملاحظات (اختياري)</Label>
                      <Input
                        id="orderNotes"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="ملاحظات خاصة بالطلب"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <Button
                      onClick={createOrder}
                      disabled={currentOrder.length === 0 || !customerName.trim() || (customerType === 'internal' && !roomNumber)}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                    >
                      إنشاء طلب ({calculateTotal()} ريال)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* إدارة القائمة */}
        {activeTab === 'menu' && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                إدارة قائمة الطعام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* إضافة/تحرير عنصر */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">
                    {isEditingMenu ? 'تحرير الطبق' : 'إضافة طبق جديد'}
                  </h3>

                  <div>
                    <Label htmlFor="itemName" className="text-white">اسم الطبق</Label>
                    <Input
                      id="itemName"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                      placeholder="أدخل اسم الطبق"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="itemPrice" className="text-white">السعر (ريال)</Label>
                    <Input
                      id="itemPrice"
                      type="number"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({...newMenuItem, price: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="itemCategory" className="text-white">الفئة</Label>
                    <Select value={newMenuItem.category} onValueChange={(value) => setNewMenuItem({...newMenuItem, category: value})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">الحالة</Label>
                    <RadioGroup
                      value={newMenuItem.available ? 'available' : 'unavailable'}
                      onValueChange={(value) => setNewMenuItem({...newMenuItem, available: value === 'available'})}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="available" id="available" />
                        <Label htmlFor="available" className="text-white">متوفر</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unavailable" id="unavailable" />
                        <Label htmlFor="unavailable" className="text-white">غير متوفر</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="itemDescription" className="text-white">الوصف</Label>
                    <Input
                      id="itemDescription"
                      value={newMenuItem.description}
                      onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                      placeholder="وصف الطبق"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveMenuItem} className="flex-1">
                      {isEditingMenu ? 'تحديث' : 'إضافة'}
                    </Button>
                    {isEditingMenu && (
                      <Button variant="outline" onClick={() => {
                        setIsEditingMenu(false)
                        setEditingItem(null)
                        setNewMenuItem({
                          name: '',
                          category: 'مقبلات',
                          price: 0,
                          description: '',
                          available: true
                        })
                      }}>
                        إلغاء
                      </Button>
                    )}
                  </div>
                </div>

                {/* قائمة العناصر */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">قائمة الأطباق</h3>
                    <Badge className="bg-blue-600 text-white">
                      {menuItems.length} طبق
                    </Badge>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {menuItems.map(item => (
                      <div key={item.id} className="group p-4 bg-white/5 rounded-xl border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          {/* أيقونة الطبق */}
                          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-2xl">
                              {item.category === 'مقبلات' ? '🥗' :
                               item.category === 'أطباق رئيسية' ? '🍽️' :
                               item.category === 'مشروبات' ? '☕' : 
                               '🍰'}
                            </span>
                          </div>
                          
                          {/* تفاصيل الطبق */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-white text-lg group-hover:text-yellow-300 transition-colors">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                              
                              {/* أزرار التحكم */}
                              <div className="flex gap-1 ml-4">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => editMenuItem(item)}
                                  className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => deleteMenuItem(item.id)} 
                                  className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* الشارات والسعر */}
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs text-purple-300 border-purple-400"
                                >
                                  {item.category}
                                </Badge>
                                <Badge 
                                  variant={item.available ? 'secondary' : 'destructive'}
                                  className={`text-xs ${item.available ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                                >
                                  {item.available ? 'متوفر' : 'غير متوفر'}
                                </Badge>
                              </div>
                              <div className="text-yellow-400 font-bold text-lg">
                                {item.price} ريال
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {menuItems.length === 0 && (
                      <div className="text-center py-12">
                        <UtensilsCrossed className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">لا توجد أطباق في القائمة</p>
                        <p className="text-gray-500 text-sm mt-2">ابدأ بإضافة أطباق جديدة</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* الإحصائيات */}
        {activeTab === 'statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium">إجمالي الإيرادات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalRevenue} ريال</div>
                <p className="text-xs text-gray-400">منذ البداية</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium">إيرادات اليوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{todayRevenue} ريال</div>
                <p className="text-xs text-gray-400">اليوم</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium">عدد الطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{orders.length}</div>
                <p className="text-xs text-gray-400">إجمالي الطلبات</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium">طلبات اليوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{todayOrders.length}</div>
                <p className="text-xs text-gray-400">اليوم</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* طلبات اليوم */}
        {activeTab === 'orders' && (
          <Card className="mt-8 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                طلبات اليوم ({todayOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayOrders.map(order => (
                  <div key={order.id} className="p-4 bg-white/5 rounded-lg border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{order.customerName}</h4>
                        <p className="text-sm text-gray-300">
                          {new Date(order.orderTime).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {order.roomNumber && (
                          <p className="text-sm text-blue-400">غرفة {order.roomNumber}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className={
                        order.status === 'pending' ? 'bg-yellow-500' :
                        order.status === 'preparing' ? 'bg-blue-500' :
                        order.status === 'ready' ? 'bg-green-500' :
                        'bg-gray-500'
                      }>
                        {order.status === 'pending' ? 'في الانتظار' :
                         order.status === 'preparing' ? 'قيد التحضير' :
                         order.status === 'ready' ? 'جاهز' :
                         order.status === 'delivered' ? 'تم التسليم' : order.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-300">
                          {item.menuItem.name} × {item.quantity}
                        </p>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-yellow-400">{order.totalAmount} ريال</span>
                      <div className="flex gap-1">
                        {order.status !== 'delivered' && (
                          <>
                            {order.status === 'pending' && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                بدء التحضير
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ready')}>
                                جاهز
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                تم التسليم
                              </Button>
                            )}
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => deleteOrder(order.id)} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
