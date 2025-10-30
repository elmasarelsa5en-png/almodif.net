'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowLeft, Star, Plus, ShoppingCart, 
  CreditCard, Clock, Heart, Award, Zap, Crown, Timer,
  Flame, Droplet, Shirt, Wind, User, Users, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { getRoomsFromFirebase } from '@/lib/firebase-sync';
import { getEmployees, addRequest, type Employee, getMenuItemsByCategory, subscribeToMenuItems, type MenuItem } from '@/lib/firebase-data';
import type { Room } from '@/lib/rooms-data';
import { playNotificationSound } from '@/lib/notification-sounds';

// Professional TypeScript interfaces
interface LaundryItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  subCategory?: string;
  price: number;
  image: string;
  description: string;
  rating?: number;
  processingTime?: number;
  available: boolean;
  featured?: boolean;
  services?: string[];
}

interface CartItem extends LaundryItem {
  quantity: number;
}

// Animation variants for professional micro-interactions
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// Premium restaurant menu data
const LAUNDRY_SERVICES: LaundryItem[] = [
  {
    id: '1',
    name: 'Shirt Washing & Ironing',
    nameAr: 'غسيل وكي قميص',
    category: 'washing',
    price: 15,
    image: '👔',
    description: 'غسيل قميص احترافي مع كي وتنشيف وتعطير',
    rating: 4.9,
    processingTime: 120,
    available: true,
    featured: true,
    services: ['غسيل', 'كي', 'تعطير', 'تغليف']
  },
  {
    id: '2',
    name: 'Pants Washing & Ironing',
    nameAr: 'غسيل وكي بنطلون',
    category: 'washing',
    price: 20,
    image: '👖',
    description: 'غسيل بنطلون مع كي احترافي وكريزة مثالية',
    rating: 4.8,
    processingTime: 120,
    available: true,
    services: ['غسيل', 'كي', 'كريزة', 'تعطير']
  },
  {
    id: '3',
    name: 'Dress Washing',
    nameAr: 'غسيل فستان',
    category: 'washing',
    price: 30,
    image: '👗',
    description: 'غسيل فستان بعناية خاصة مع معالجة الأقمشة الحساسة',
    rating: 4.9,
    processingTime: 180,
    available: true,
    featured: true,
    services: ['غسيل حساس', 'كي بخار', 'تعطير', 'تغليف فاخر']
  },
  {
    id: '4',
    name: 'Full Suit Cleaning',
    nameAr: 'غسيل بدلة كاملة',
    category: 'dry-cleaning',
    price: 50,
    image: '🤵',
    description: 'تنظيف جاف احترافي لبدلة كاملة مع كي متقن',
    rating: 4.8,
    processingTime: 240,
    available: true,
    featured: true,
    services: ['تنظيف جاف', 'كي احترافي', 'إزالة بقع', 'تغليف']
  },
  {
    id: '5',
    name: 'Blanket Washing',
    nameAr: 'غسيل بطانية',
    category: 'special',
    price: 40,
    image: '🛏️',
    description: 'غسيل بطانية مع تعقيم وتجفيف كامل',
    rating: 4.7,
    processingTime: 300,
    available: true,
    services: ['غسيل', 'تعقيم', 'تجفيف', 'تعطير']
  },
  {
    id: '6',
    name: 'Dry Cleaning Service',
    nameAr: 'خدمة التنظيف الجاف',
    category: 'dry-cleaning',
    price: 45,
    image: '✨',
    description: 'تنظيف جاف للملابس الحساسة والفاخرة',
    rating: 4.9,
    processingTime: 240,
    available: true,
    services: ['تنظيف جاف', 'معالجة البقع', 'كي بخار', 'تغليف']
  },
  {
    id: '7',
    name: 'Express Ironing',
    nameAr: 'كي سريع',
    category: 'express',
    price: 10,
    image: '🔥',
    description: 'خدمة كي سريعة خلال ساعة واحدة',
    rating: 4.6,
    processingTime: 60,
    available: true,
    services: ['كي سريع', 'بخار', 'تعطير']
  },
  {
    id: '8',
    name: 'Stain Removal',
    nameAr: 'إزالة البقع الصعبة',
    category: 'extra',
    price: 25,
    image: '🧼',
    description: 'معالجة خاصة لإزالة البقع الصعبة والعنيدة',
    rating: 4.8,
    processingTime: 120,
    available: true,
    services: ['معالجة كيميائية', 'إزالة احترافية', 'حماية النسيج']
  }
];

export default function LaundryPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerType, setCustomerType] = useState<'guest' | 'external'>('guest');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLaundryStaff, setIsLaundryStaff] = useState(false);
  const [menuItems, setMenuItems] = useState<LaundryItem[]>(LAUNDRY_SERVICES);
  const [menuLoading, setMenuLoading] = useState(true);

  // Load menu items from Firebase
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setMenuLoading(true);
        const items = await getMenuItemsByCategory('laundry');
        // Use Firebase items if available, otherwise keep default data
        if (items && items.length > 0) {
          setMenuItems(items as LaundryItem[]);
        }
      } catch (error) {
        console.error('Error loading laundry menu:', error);
        // Keep default data on error
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenuItems();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToMenuItems((allItems) => {
      const laundryItems = allItems.filter(item => item.category === 'laundry');
      if (laundryItems.length > 0) {
        setMenuItems(laundryItems as LaundryItem[]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      setIsLaundryStaff(user.role === 'laundry_staff');
      
      // If laundry staff, auto-select themselves
      if (user.role === 'laundry_staff' && user.employeeId) {
        setSelectedEmployee(user.employeeId);
      }
    }
  }, []);

  // Load rooms and employees
  useEffect(() => {
    loadRooms();
    if (!isLaundryStaff) {
      loadEmployees();
    }
  }, [isLaundryStaff]);

  const loadRooms = async () => {
    try {
      const data = await getRoomsFromFirebase();
      setRooms(data.filter(r => r.status === 'Occupied' || r.status === 'Reserved'));
      console.log('✅ تم تحميل الغرف:', data.length);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      // Only load laundry_staff (not admin or manager)
      const laundryEmployees = data.filter(
        emp => emp.role === 'laundry_staff'
      );
      setEmployees(laundryEmployees);
      console.log('✅ تم تحميل موظفي المغسلة:', laundryEmployees.length);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  // Auto-fill guest name when room selected
  useEffect(() => {
    if (selectedRoom && customerType === 'guest') {
      const room = rooms.find(r => r.id === selectedRoom);
      if (room?.guestName) {
        setGuestName(room.guestName);
        console.log('✅ تم تعبئة اسم النزيل تلقائياً:', room.guestName);
      }
    }
  }, [selectedRoom, rooms, customerType]);

  // Professional memoized computations
  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'all') return menuItems;
    return menuItems.filter(item => item.subCategory === selectedCategory);
  }, [selectedCategory, menuItems]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Professional cart management functions
  const addToCart = (item: LaundryItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة');
      return;
    }

    if (customerType === 'guest' && !selectedRoom) {
      alert('الرجاء اختيار الغرفة');
      return;
    }

    if (customerType === 'external' && !guestName) {
      alert('الرجاء إدخال اسم العميل');
      return;
    }

    // Only check employee selection if user is NOT laundry staff
    if (!isLaundryStaff && !selectedEmployee) {
      alert('الرجاء اختيار الموظف المسؤول');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsDescription = cart.map(item => 
        `${item.nameAr} (${item.quantity}x) - ${item.price * item.quantity} ر.س`
      ).join('\n');

      // Get employee name
      let selectedEmployeeName = currentUser?.username || 'غير معروف';
      if (!isLaundryStaff && selectedEmployee) {
        selectedEmployeeName = employees.find(e => e.id === selectedEmployee)?.name || 'غير معروف';
      }

      await addRequest({
        room: customerType === 'guest' ? selectedRoom : 'عميل خارجي',
        guest: guestName || 'عميل خارجي',
        phone: customerType === 'external' ? '' : undefined, // Only include phone if external
        type: 'طلب من المغسلة',
        description: `الطلب:\n${itemsDescription}\n\nالإجمالي: ${cartTotal} ر.س\n\nالموظف المسؤول: ${selectedEmployeeName}`,
        priority: 'medium',
        status: 'awaiting_employee_approval',
        notes: `طلب من المغسلة - تم إدخاله بواسطة ${currentUser?.username || 'موظف'}\nالموظف المسؤول: ${selectedEmployeeName}`,
        createdAt: new Date().toISOString()
      });

      alert('✅ تم إرسال الطلب بنجاح!');
      playNotificationSound('new-request');
      setCart([]);
      setIsCartOpen(false);
      setSelectedRoom('');
      setGuestName('');
      if (!isLaundryStaff) {
        setSelectedEmployee('');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'washing': return <Droplet className="h-5 w-5" />;
      case 'ironing': return <Flame className="h-5 w-5" />;
      case 'dry-cleaning': return <Sparkles className="h-5 w-5" />;
      case 'express': return <Zap className="h-5 w-5" />;
      case 'special': return <Star className="h-5 w-5" />;
      case 'extra': return <Award className="h-5 w-5" />;
      default: return <Shirt className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-blue-500/20" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Sparkles className="w-6 h-6 text-cyan-300" />
          </motion.div>
        ))}
      </div>

      {/* Professional Header */}
      <motion.header 
        className="relative z-50 bg-black/20 backdrop-blur-2xl border-b border-cyan-500/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                onClick={() => router.push('/guest-menu')}
                className="text-white border-cyan-400/50 hover:bg-cyan-500/20 hover:border-cyan-400"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                العودة للقائمة الرئيسية
              </Button>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="flex items-center gap-4 justify-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-xl">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Crown className="h-5 w-5 text-yellow-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent">
                    خدمات المغسلة الفاخرة
                  </h1>
                  <p className="text-cyan-300 text-sm font-medium">Premium Laundry Services</p>
                </div>
              </div>
            </motion.div>
            
            {/* Cart button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                السلة
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Customer Type Selection */}
          <div className="mt-4 flex gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setCustomerType('guest')}
                className={`${
                  customerType === 'guest'
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                نزيل
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setCustomerType('external')}
                className={`${
                  customerType === 'external'
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                عميل خارجي
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <motion.div
            className="lg:col-span-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-cyan-400/20 shadow-2xl sticky top-24">
              <CardHeader>
                <CardTitle className="text-cyan-200 flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  الفئات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[ 
                  { id: 'all', label: 'جميع الأطباق', icon: <Star className="h-4 w-4" /> },
                  { id: 'washing', label: 'الغسيل', icon: <Sparkles className="h-4 w-4" /> },
                  { id: 'dry-cleaning', label: 'تنظيف جاف', icon: <Shirt className="h-4 w-4" /> },
                  { id: 'express', label: 'سريع', icon: <Flame className="h-4 w-4" /> },
                  { id: 'special', label: 'خاص', icon: <Droplet className="h-4 w-4" /> },
                  { id: 'extra', label: 'إضافي', icon: <Star className="h-4 w-4" /> },
                  { id: 'extra', label: 'إضافي', icon: <Award className="h-4 w-4" /> }
                ].map((category) => (
                  <motion.div key={category.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full justify-start text-right ${
                        selectedCategory === category.id
                          ? 'bg-cyan-500 text-white shadow-lg'
                          : 'text-cyan-200 hover:bg-cyan-500/20'
                      }`}
                    >
                      {category.icon}
                      <span className="mr-2">{category.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Menu Grid */}
          <div className="lg:col-span-3">
            {menuLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto mb-4" />
                  <p className="text-cyan-200 text-lg">جاري تحميل القائمة...</p>
                </div>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-20">
                <Shirt className="h-20 w-20 text-cyan-400/50 mx-auto mb-4" />
                <p className="text-cyan-200 text-xl mb-2">لا توجد خدمات في القائمة</p>
                <p className="text-cyan-300/60">يمكنك إضافة خدمات من صفحة الإعدادات</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {filteredMenu.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    layout
                    className="group"
                  >
                    <Card className="bg-white/5 backdrop-blur-xl border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 overflow-hidden shadow-2xl hover:shadow-cyan-500/25 h-full">
                      {/* Item image and badges */}
                      <div className="relative h-48 bg-gradient-to-br from-cyan-100 via-blue-50 to-purple-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div 
                            className="text-6xl group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                          >
                            {item.image}
                          </motion.div>
                        </div>
                        
                        {/* Price badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg px-3 py-2 shadow-lg">
                            {item.price} ريال
                          </Badge>
                        </div>

                        {/* Featured badge */}
                        {item.featured && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              <Crown className="h-3 w-3 mr-1" />
                              مميز
                            </Badge>
                          </div>
                        )}

                        {/* Category badge */}
                        <div className="absolute bottom-4 left-4">
                          <Badge variant="outline" className="bg-white/90 text-cyan-800 border-cyan-400">
                            {getCategoryIcon(item.category)}
                            <span className="mr-1 text-xs">
                              {item.category === 'washing' ? 'غسيل' :
                               item.category === 'dry-cleaning' ? 'أطباق رئيسية' :
                               item.category === 'express' ? 'مشويات' :
                               item.category === 'special' ? 'مأكولات بحرية' :
                               item.category === 'extra' ? 'حلويات' : 'مشروبات'}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      {/* Item details */}
                      <CardContent className="p-6 text-white">
                        <div className="space-y-4">
                          {/* Title and rating */}
                          <div>
                            <h3 className="text-xl font-bold text-cyan-200 mb-1">
                              {item.nameAr}
                            </h3>
                            <p className="text-cyan-300/80 text-sm mb-2">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(item.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-400'
                                    }`}
                                  />
                                ))}
                                <span className="text-yellow-400 text-sm mr-1">
                                  {item.rating}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs text-cyan-300 border-cyan-400">
                                <Timer className="h-3 w-3 mr-1" />
                                {item.processingTime} دقيقة
                              </Badge>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-cyan-100/90 text-sm leading-relaxed">
                            {item.description}
                          </p>

                          {/* Calories and services */}
                          <div className="flex items-center gap-4 text-xs">
                            
                            <Badge variant="outline" className="text-cyan-300 border-cyan-400">
                              {item.services.length} مكونات
                            </Badge>
                          </div>

                          {/* Add to cart button */}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => addToCart(item)}
                              disabled={!item.available}
                              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              {item.available ? 'إضافة للسلة' : 'غير متوفر'}
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-96 bg-black/90 backdrop-blur-2xl border-l border-cyan-400/20 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-200">السلة</h2>
                <Button
                  variant="ghost"
                  onClick={() => setIsCartOpen(false)}
                  className="text-cyan-200 hover:bg-cyan-500/20"
                >
                  ×
                </Button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="h-16 w-16 text-cyan-400/50 mx-auto mb-4" />
                  <p className="text-cyan-300">السلة فارغة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="bg-white/5 rounded-xl p-4 border border-cyan-400/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{item.image}</div>
                        <div className="flex-1">
                          <h4 className="text-cyan-200 font-semibold">{item.nameAr}</h4>
                          <p className="text-cyan-300/80 text-sm">{item.price} ريال</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 text-cyan-300 border-cyan-400"
                          >
                            -
                          </Button>
                          <span className="text-white w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 text-cyan-300 border-cyan-400"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Customer Info */}
                  <div className="space-y-3 mt-6 pt-4 border-t border-cyan-400/20">
                    {customerType === 'guest' && (
                      <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                        <SelectTrigger className="bg-white/10 border-cyan-400/50 text-white">
                          <SelectValue placeholder="اختر الغرفة" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-cyan-400/30">
                          {rooms.map(room => (
                            <SelectItem key={room.id} value={room.id} className="text-white hover:bg-cyan-500/20 focus:bg-cyan-500/30">
                              غرفة {room.number} - {room.guestName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {customerType === 'external' && (
                      <input
                        type="text"
                        placeholder="اسم العميل"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-cyan-400/50 rounded-lg text-white placeholder-cyan-300/50 text-right"
                       
                      />
                    )}

                    {/* Show employee selection only for admin/manager/reception */}
                    {!isLaundryStaff && (
                      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger className="bg-white/10 border-cyan-400/50 text-white">
                          <SelectValue placeholder="اختر الموظف المسؤول" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-cyan-400/30">
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id} className="text-white hover:bg-cyan-500/20 focus:bg-cyan-500/30">
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Show info message for laundry staff */}
                    {isLaundryStaff && (
                      <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-3">
                        <p className="text-cyan-300 text-sm text-center">
                          سيتم إرسال الطلب باسمك كموظف مسؤول
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-cyan-400/20">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-cyan-200">الإجمالي:</span>
                      <span className="text-2xl font-bold text-green-400">{cartTotal} ريال</span>
                    </div>
                    <Button 
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-5 w-5 mr-2" />
                      )}
                      إتمام الطلب
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for cart */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsCartOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}




