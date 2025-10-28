'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shirt, ShoppingCart, X, Plus, Minus, Trash2, CreditCard, Wallet, 
  UserCircle, CheckCircle, Search, Clock, Sparkles, Wind, Droplets, 
  Star, Crown, Award, Zap, Timer, ArrowRight, CheckCircle2,
  Package, Truck, Phone, Calendar, RefreshCw, Filter, Home, Badge as BadgeIcon,
  Eye, Edit, Calculator
} from 'lucide-react';
import { getRoomsFromStorage } from '@/lib/rooms-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ServiceItem = {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  duration: string;
  category: 'washing' | 'ironing' | 'dry-cleaning' | 'special';
};

type CartItem = ServiceItem & {
  quantity: number;
  roomNumber?: string;
};

type CustomerType = 'guest' | 'staff' | 'external';

// Professional animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

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
};

const cardVariants = {
  rest: { scale: 1, rotateY: 0 },
  hover: { 
    scale: 1.02, 
    rotateY: 5,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25 
    }
  }
};

export default function LaundryPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerType, setCustomerType] = useState<CustomerType>('guest');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const rooms = getRoomsFromStorage();

  const laundryServices: ServiceItem[] = [
    {
      id: '1',
      name: 'Shirt Washing',
      nameAr: 'غسيل قميص',
      price: 15,
      duration: '24 ساعة',
      category: 'washing'
    },
    {
      id: '2',
      name: 'Pants Washing',
      nameAr: 'غسيل بنطلون',
      price: 20,
      duration: '24 ساعة',
      category: 'washing'
    },
    {
      id: '3',
      name: 'Dress Washing',
      nameAr: 'غسيل فستان',
      price: 25,
      duration: '48 ساعة',
      category: 'washing'
    },
    {
      id: '4',
      name: 'Shirt Ironing',
      nameAr: 'كوي قميص',
      price: 8,
      duration: '12 ساعة',
      category: 'ironing'
    },
    {
      id: '5',
      name: 'Pants Ironing',
      nameAr: 'كوي بنطلون',
      price: 10,
      duration: '12 ساعة',
      category: 'ironing'
    },
    {
      id: '6',
      name: 'Suit Dry Cleaning',
      nameAr: 'تنظيف بدلة جافة',
      price: 60,
      duration: '72 ساعة',
      category: 'dry-cleaning'
    },
    {
      id: '7',
      name: 'Wedding Dress',
      nameAr: 'فستان زفاف',
      price: 150,
      duration: '7 أيام',
      category: 'special'
    },
    {
      id: '8',
      name: 'Curtains',
      nameAr: 'ستائر',
      price: 80,
      duration: '5 أيام',
      category: 'special'
    },
    {
      id: '9',
      name: 'Bedding Set',
      nameAr: 'طقم ملابس سرير',
      price: 35,
      duration: '24 ساعة',
      category: 'washing'
    },
    {
      id: '10',
      name: 'Leather Jacket',
      nameAr: 'جاكيت جلد',
      price: 100,
      duration: '5 أيام',
      category: 'special'
    },
    {
      id: '11',
      name: 'Towels (5 pieces)',
      nameAr: 'مناشف (5 قطع)',
      price: 25,
      duration: '24 ساعة',
      category: 'washing'
    },
    {
      id: '12',
      name: 'Tie Cleaning',
      nameAr: 'تنظيف ربطة عنق',
      price: 15,
      duration: '48 ساعة',
      category: 'dry-cleaning'
    },
    {
      id: '13',
      name: 'Express Service',
      nameAr: 'خدمة سريعة',
      price: 50,
      duration: '4 ساعات',
      category: 'special'
    }
  ];

  const categories = [
    { id: 'all', name: 'جميع الخدمات', nameEn: 'All Services' },
    { id: 'washing', name: 'غسيل', nameEn: 'Washing' },
    { id: 'ironing', name: 'كوي', nameEn: 'Ironing' },
    { id: 'dry-cleaning', name: 'تنظيف جاف', nameEn: 'Dry Cleaning' },
    { id: 'special', name: 'خدمات خاصة', nameEn: 'Special Services' }
  ];

  const filteredServices = laundryServices.filter(service => {
    const matchesSearch = service.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (service: ServiceItem) => {
    const cartItem: CartItem = {
      ...service,
      quantity: 1,
      roomNumber: customerType === 'guest' ? selectedRoom : undefined
    };

    const existingItem = cart.find(item => 
      item.id === service.id && item.roomNumber === cartItem.roomNumber
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === service.id && item.roomNumber === cartItem.roomNumber
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, cartItem]);
    }
  };

  const updateQuantity = (id: string, roomNumber: string | undefined, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => !(item.id === id && item.roomNumber === roomNumber)));
    } else {
      setCart(cart.map(item =>
        item.id === id && item.roomNumber === roomNumber
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getDiscount = () => {
    switch (customerType) {
      case 'staff':
        return 0.25; // 25% discount for staff
      default:
        return 0;
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * getDiscount();
  const total = subtotal - discount;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'washing':
        return 'from-blue-500 to-cyan-500';
      case 'ironing':
        return 'from-amber-500 to-orange-500';
      case 'dry-cleaning':
        return 'from-purple-500 to-pink-500';
      case 'special':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'washing':
        return <Droplets className="w-12 h-12 text-white" />;
      case 'ironing':
        return <Wind className="w-12 h-12 text-white" />;
      case 'dry-cleaning':
        return <Sparkles className="w-12 h-12 text-white" />;
      case 'special':
        return <Star className="w-12 h-12 text-white" />;
      default:
        return <Shirt className="w-12 h-12 text-white" />;
    }
  };

  const handleCheckout = () => {
    console.log('Laundry order processed:', { cart, customerType, total });
    setCart([]);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Laundry Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-blue-900 to-teal-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-cyan-500/15" />
      
      {/* Floating Laundry Icons Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-5"
            animate={{
              y: [0, -50, 0],
              rotate: [0, 360],
              scale: [1, 1.4, 1]
            }}
            transition={{
              duration: 25 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 15
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {i % 4 === 0 ? <Shirt className="w-8 h-8 text-cyan-400" /> :
             i % 4 === 1 ? <Droplets className="w-8 h-8 text-blue-400" /> :
             i % 4 === 2 ? <Wind className="w-8 h-8 text-teal-400" /> :
             <Sparkles className="w-8 h-8 text-cyan-300" />}
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
          className="text-center mb-12"
          variants={itemVariants}
        >
          <div className="relative inline-block mb-8">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.8 }
              }}
            >
              <Shirt className="h-12 w-12 text-white" />
            </motion.div>
            <div className="absolute -top-3 -right-3">
              <Crown className="h-10 w-10 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Sparkles className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-teal-200 bg-clip-text text-transparent mb-4">
            خدمات المغسلة
          </h1>
          <p className="text-2xl text-cyan-300 font-medium mb-6">
            خدمات الغسيل والكي
          </p>
        </motion.div>

        {/* Professional Control Panel */}
        <motion.div 
          className="bg-black/20 backdrop-blur-2xl rounded-3xl p-8 border border-cyan-400/20 shadow-2xl mb-8"
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

            {/* Premium Customer Type Selection */}
            <div className="flex gap-4">
              {[
                { 
                  type: 'guest' as CustomerType, 
                  label: 'نزيل الفندق', 
                  icon: UserCircle,
                  gradient: 'from-blue-500 to-cyan-500'
                },
                { 
                  type: 'staff' as CustomerType, 
                  label: 'موظف الفندق', 
                  icon: BadgeIcon,
                  gradient: 'from-emerald-500 to-teal-500'
                },
                { 
                  type: 'external' as CustomerType, 
                  label: 'عميل خارجي', 
                  icon: UserCircle,
                  gradient: 'from-purple-500 to-pink-500'
                }
              ].map((option) => (
                <motion.button
                  key={option.type}
                  onClick={() => setCustomerType(option.type)}
                  className={`relative px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                    customerType === option.type 
                      ? `bg-gradient-to-r ${option.gradient} text-white shadow-2xl` 
                      : 'bg-white/10 backdrop-blur-sm text-white/80 border border-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    <span className="text-sm">{option.label}</span>
                  </div>
                  
                  {customerType === option.type && (
                    <div className="absolute -top-1 -right-1">
                      <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Premium Room Selection */}
            {customerType === 'guest' && (
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger className="w-48 bg-black/30 backdrop-blur-xl border border-cyan-400/30 text-white rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-cyan-400" />
                      <SelectValue placeholder="اختر رقم الغرفة" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-2xl border border-cyan-400/20 rounded-2xl">
                    {rooms.map(room => (
                      <SelectItem 
                        key={room.id} 
                        value={room.number} 
                        className="text-white focus:bg-cyan-500/20 focus:text-cyan-300 rounded-xl m-1"
                      >
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          غرفة {room.number}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Premium Cart Button */}
            <motion.button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className="relative bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold px-6 py-3 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-emerald-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>السلة ({cart.length})</span>
              </div>
              
              {cart.length > 0 && (
                <>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                  <div className="absolute -bottom-1 -left-1">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                  </div>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Premium Search & Filter Section */}
        <motion.div 
          className="bg-black/20 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl mb-8"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Premium Search Bar */}
            <div className="relative group">
              <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <input
                type="text"
                placeholder="البحث في خدمات المغسلة الفاخرة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/30 backdrop-blur-xl border border-cyan-400/30 text-white placeholder:text-white/60 rounded-2xl px-6 py-4 pr-14 text-lg font-medium focus:outline-none focus:border-cyan-400/60 focus:shadow-lg focus:shadow-cyan-500/20 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Premium Category Filter */}
            <div className="relative">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-black/30 backdrop-blur-xl border border-blue-400/30 text-white rounded-2xl px-6 py-4 text-lg font-medium">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-blue-400" />
                    <SelectValue placeholder="اختر نوع الخدمة المميزة" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-2xl border border-blue-400/20 rounded-2xl">
                  {categories.map(category => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id} 
                      className="text-white focus:bg-blue-500/20 focus:text-blue-300 rounded-xl m-1"
                    >
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>



        {/* Professional Services Grid */}
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                variants={cardVariants}
                whileHover={{ 
                  y: -5,
                  scale: 1.03
                }}
                className="group relative"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Compact Service Card */}
                <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl h-full group-hover:shadow-cyan-500/20 transition-all duration-300">
                  {/* Service Image */}
                  <div className="relative mb-3 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 aspect-square">
                    <img 
                      src={`https://images.unsplash.com/photo-${
                        service.id === '1' ? '1517677129300-07b130802f46' : // قميص أبيض نظيف
                        service.id === '2' ? '1624378439575-a9d6c8f8b6c5' : // بنطلون مكوي
                        service.id === '3' ? '1595777457583-95e059d581b8' : // فستان معلق نظيف
                        service.id === '4' ? '1556821585-5d82e6d92f5d' : // مكواة بخار
                        service.id === '5' ? '1489987707025-afc232f7ea0f' : // ملابس مكوية
                        service.id === '6' ? '1507679799987-3c3b8b9b5a53' : // بدلة رجالي فاخرة
                        service.id === '7' ? '1519741644101-4b1d7da9d9f0' : // فستان زفاف أبيض
                        service.id === '8' ? '1616486029423-aaa4789e8c9c' : // ستائر نظيفة
                        service.id === '9' ? '1631679706896-5d9f5f098f8b' : // ملاءات سرير بيضاء
                        service.id === '10' ? '1551028719-2bba35af529a' : // جاكيت جلد
                        service.id === '11' ? '1631679706895-5d9f5f098f8b' : // مناشف بيضاء
                        service.id === '12' ? '1594633312681-425c7b97ccd1' : // ربطة عنق
                        '1582735689369-4ba29b0f5b1e' // خدمة سريعة
                      }?w=300&h=300&fit=crop&q=80`}
                      alt={service.nameAr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Price Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm px-2 py-1">
                        {service.price} ر.س
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Service Info */}
                  <div className="text-center mb-3">
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-1">
                      {service.nameAr}
                    </h3>
                    <p className="text-white/60 text-xs mb-2 line-clamp-1">{service.name}</p>
                    
                    {/* Duration Badge */}
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span className="text-cyan-300 text-xs">{service.duration}</span>
                    </div>
                  </div>
                  
                  {/* Compact Add Button */}
                  <Button
                    onClick={() => addToCart(service)}
                    disabled={customerType === 'guest' && !selectedRoom}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-2 px-3 rounded-xl text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 inline ml-1" />
                    <span>إضافة</span>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Premium Checkout Dialog */}
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-2xl border border-cyan-400/20 text-white max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl">
            <DialogHeader className="text-center pb-6 border-b border-white/10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative mx-auto mb-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                  <ShoppingCart className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Crown className="h-8 w-8 text-yellow-400 animate-pulse" />
                </div>
              </motion.div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                سلة المغسلة الفاخرة
              </DialogTitle>
              <p className="text-white/60 text-lg mt-2">مراجعة وتأكيد طلبك</p>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div 
                    key={`${item.id}-${item.roomNumber}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                  >
                    {/* Premium Item Card */}
                    <div className="flex items-start gap-4">
                      {/* Service Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Shirt className="h-8 w-8 text-white" />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                          {item.nameAr}
                        </h4>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-emerald-400" />
                            <span className="text-2xl font-bold text-emerald-300">{item.price} ر.س</span>
                          </div>
                          
                          {item.roomNumber && (
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-blue-400" />
                              <span className="text-blue-300 font-medium">غرفة {item.roomNumber}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-cyan-500/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-cyan-400" />
                            <span className="text-cyan-300 text-sm font-medium">{item.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <motion.button
                          onClick={() => updateQuantity(item.id, item.roomNumber, item.quantity - 1)}
                          className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white rounded-2xl flex items-center justify-center transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Minus className="h-5 w-5" />
                        </motion.button>
                        
                        <div className="w-16 h-10 bg-black/50 backdrop-blur-xl border border-cyan-400/30 rounded-2xl flex items-center justify-center">
                          <span className="text-xl font-bold text-cyan-300">{item.quantity}</span>
                        </div>
                        
                        <motion.button
                          onClick={() => updateQuantity(item.id, item.roomNumber, item.quantity + 1)}
                          className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white rounded-2xl flex items-center justify-center transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Plus className="h-5 w-5" />
                        </motion.button>
                      </div>
                      
                      {/* Remove Button */}
                      <motion.button
                        onClick={() => removeFromCart(item.id, item.roomNumber)}
                        className="p-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="font-medium">حذف</span>
                      </motion.button>
                    </div>
                    
                    {/* Premium Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </motion.div>
                ))}
              </AnimatePresence>
                    
              
              {/* Premium Order Summary */}
              <motion.div 
                className="bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-gradient-to-r from-emerald-400/20 to-green-400/20 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent mb-6 text-center">
                  ملخص الطلب المميز
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-black/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Calculator className="h-5 w-5 text-cyan-400" />
                      <span className="text-white/80 text-lg">المجموع الفرعي:</span>
                    </div>
                    <span className="text-2xl font-bold text-cyan-300">{subtotal.toFixed(2)} ر.س</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-400/20">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-emerald-400" />
                        <span className="text-emerald-300 text-lg">خصم الموظفين ({(getDiscount() * 100).toFixed(0)}%):</span>
                      </div>
                      <span className="text-2xl font-bold text-emerald-400">-{discount.toFixed(2)} ر.س</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border-2 border-yellow-400/30">
                    <div className="flex items-center gap-3">
                      <Crown className="h-6 w-6 text-yellow-400" />
                      <span className="text-2xl font-bold text-white">المجموع النهائي:</span>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                        {total.toFixed(2)} ر.س
                      </div>
                      <div className="text-yellow-400/80 text-sm mt-1">شامل جميع الخدمات</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Premium Action Buttons */}
            <DialogFooter className="gap-4 pt-6 border-t border-white/10">
              <motion.button
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10 font-bold py-4 px-6 rounded-2xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <X className="h-5 w-5" />
                  <span>إلغاء</span>
                </div>
              </motion.button>
              
              <motion.button
                onClick={handleCheckout}
                className="flex-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-2xl shadow-emerald-500/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-lg">تأكيد الطلب الفاخر</span>
                  <Crown className="h-5 w-5 text-yellow-300" />
                </div>
              </motion.button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
