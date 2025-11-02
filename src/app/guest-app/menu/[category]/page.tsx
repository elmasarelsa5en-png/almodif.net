'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShoppingCart, Plus, Minus, Trash2, 
  Coffee, Utensils, Shirt, UtensilsCrossed, 
  Search, Filter, X, Check, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import PaymentDialog, { PaymentResult } from '@/components/PaymentDialog';

interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  subCategory?: string;
  price: number;
  image?: string;
  description?: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const CATEGORY_CONFIG = {
  restaurant: {
    title: 'المطعم',
    titleEn: 'Restaurant',
    icon: Utensils,
    color: 'from-orange-500 to-red-600',
    firebaseCategory: 'restaurant',
    localStorageKey: 'restaurant_menu',
  },
  'coffee-shop': {
    title: 'الكوفي شوب',
    titleEn: 'Coffee Shop',
    icon: Coffee,
    color: 'from-yellow-600 to-amber-700',
    firebaseCategory: 'coffee',
    localStorageKey: 'coffee_menu',
  },
  laundry: {
    title: 'خدمة المغسلة',
    titleEn: 'Laundry Service',
    icon: Shirt,
    color: 'from-cyan-500 to-blue-600',
    firebaseCategory: 'laundry',
    localStorageKey: 'laundry_services',
  },
  'room-service': {
    title: 'خدمة الغرف',
    titleEn: 'Room Service',
    icon: UtensilsCrossed,
    color: 'from-green-500 to-emerald-600',
    firebaseCategory: 'room-services', // يستخدم نفس قائمة المطعم
    localStorageKey: 'restaurant_menu',
  },
};

// أصناف افتراضية للعرض
const DEFAULT_MENU_ITEMS: Record<string, MenuItem[]> = {
  restaurant: [
    { id: '1', name: 'Grilled Chicken', nameAr: 'دجاج مشوي', category: 'restaurant', price: 45, image: '🍗', available: true, description: 'دجاج طازج مشوي مع البهارات الخاصة' },
    { id: '2', name: 'Mixed Grill', nameAr: 'مشاوي مشكلة', category: 'restaurant', price: 65, image: '🍖', available: true, description: 'تشكيلة من أفضل المشاوي' },
    { id: '3', name: 'Fish Fillet', nameAr: 'فيليه سمك', category: 'restaurant', price: 55, image: '🐟', available: true, description: 'سمك طازج محضر بطريقة صحية' },
    { id: '4', name: 'Chicken Biryani', nameAr: 'برياني دجاج', category: 'restaurant', price: 40, image: '🍚', available: true, description: 'أرز برياني بالدجاج والبهارات' },
    { id: '5', name: 'Caesar Salad', nameAr: 'سلطة سيزر', category: 'restaurant', price: 25, image: '🥗', available: true, description: 'سلطة طازجة مع صوص السيزر' },
    { id: '6', name: 'Margherita Pizza', nameAr: 'بيتزا مارجريتا', category: 'restaurant', price: 35, image: '🍕', available: true, description: 'بيتزا إيطالية كلاسيكية' },
  ],
  coffee: [
    { id: '11', name: 'Espresso', nameAr: 'إسبريسو', category: 'coffee', price: 12, image: '☕', available: true, subCategory: 'قهوة ساخنة' },
    { id: '12', name: 'Cappuccino', nameAr: 'كابتشينو', category: 'coffee', price: 15, image: '☕', available: true, subCategory: 'قهوة ساخنة' },
    { id: '13', name: 'Latte', nameAr: 'لاتيه', category: 'coffee', price: 16, image: '🥤', available: true, subCategory: 'قهوة ساخنة' },
    { id: '14', name: 'Turkish Coffee', nameAr: 'قهوة تركية', category: 'coffee', price: 10, image: '☕', available: true, subCategory: 'قهوة ساخنة' },
    { id: '15', name: 'Iced Coffee', nameAr: 'قهوة مثلجة', category: 'coffee', price: 18, image: '🧊', available: true, subCategory: 'قهوة باردة' },
    { id: '16', name: 'Orange Juice', nameAr: 'عصير برتقال', category: 'coffee', price: 12, image: '🍊', available: true, subCategory: 'عصائر' },
    { id: '17', name: 'Mango Smoothie', nameAr: 'سموذي مانجو', category: 'coffee', price: 20, image: '🥭', available: true, subCategory: 'عصائر' },
    { id: '18', name: 'Croissant', nameAr: 'كرواسون', category: 'coffee', price: 8, image: '🥐', available: true, subCategory: 'معجنات' },
  ],
  laundry: [
    { id: '21', name: 'Shirt', nameAr: 'قميص', category: 'laundry', price: 10, image: '👔', available: true, description: 'غسيل وكي' },
    { id: '22', name: 'Pants', nameAr: 'بنطلون', category: 'laundry', price: 12, image: '👖', available: true, description: 'غسيل وكي' },
    { id: '23', name: 'Dress', nameAr: 'فستان', category: 'laundry', price: 15, image: '👗', available: true, description: 'غسيل وكي' },
    { id: '24', name: 'Suit', nameAr: 'بدلة', category: 'laundry', price: 25, image: '🤵', available: true, description: 'غسيل وكي احترافي' },
    { id: '25', name: 'Bedding', nameAr: 'ملاءات سرير', category: 'laundry', price: 20, image: '🛏️', available: true, description: 'غسيل' },
  ],
  'room-services': [
    { id: '31', name: 'Extra Towels', nameAr: 'مناشف إضافية', category: 'room-services', price: 0, image: '🧺', available: true },
    { id: '32', name: 'Extra Pillows', nameAr: 'وسائد إضافية', category: 'room-services', price: 0, image: '🛏️', available: true },
    { id: '33', name: 'Room Cleaning', nameAr: 'تنظيف الغرفة', category: 'room-services', price: 0, image: '🧹', available: true },
    { id: '34', name: 'Mini Bar Refill', nameAr: 'تعبئة المشروبات', category: 'room-services', price: 0, image: '🥤', available: true },
    { id: '35', name: 'Wake Up Call', nameAr: 'خدمة الإيقاظ', category: 'room-services', price: 0, image: '⏰', available: true },
  ],
};

export default function GuestMenuPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // إذا كان الـ category غير موجود، نرجع للصفحة الرئيسية
  useEffect(() => {
    if (!config) {
      router.push('/guest-app');
    }
  }, [config, router]);

  // جلب menu items من Firebase أو localStorage
  useEffect(() => {
    const loadMenuItems = async () => {
      if (!config) return;
      
      setLoading(true);
      try {
        let foundItems: MenuItem[] = [];
        
        // نجرب localStorage أولاً (أسرع)
        const localData = localStorage.getItem(config.localStorageKey);
        if (localData) {
          const items = JSON.parse(localData) as MenuItem[];
          foundItems = items.filter(item => item.available !== false);
          console.log(`✅ Loaded ${foundItems.length} items from localStorage for ${category}`);
        }

        // إذا لم يوجد في localStorage، نجرب Firebase
        if (foundItems.length === 0 && db) {
          console.log(`🔥 Trying Firebase for category: ${config.firebaseCategory}`);
          const menuItemsRef = collection(db, 'menu-items');
          const q = query(
            menuItemsRef,
            where('category', '==', config.firebaseCategory)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            foundItems = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as MenuItem));
            foundItems = foundItems.filter(item => item.available !== false);
            console.log(`✅ Loaded ${foundItems.length} items from Firebase`);
          }
        }
        
        // إذا ما فيش حاجة، نستخدم البيانات الافتراضية
        if (foundItems.length === 0) {
          console.log(`⚠️ No items found, using default items for ${config.firebaseCategory}`);
          foundItems = DEFAULT_MENU_ITEMS[config.firebaseCategory] || [];
        }
        
        setMenuItems(foundItems);
      } catch (error) {
        console.error('❌ Error loading menu items:', error);
        // استخدام البيانات الافتراضية في حالة الخطأ
        const defaultItems = DEFAULT_MENU_ITEMS[config.firebaseCategory] || [];
        setMenuItems(defaultItems);
      } finally {
        setLoading(false);
      }
    };

    if (config) {
      loadMenuItems();
    }
  }, [config]);

  // جلب السلة من localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`guest_cart_${category}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [category]);

  // حفظ السلة في localStorage عند التغيير
  useEffect(() => {
    localStorage.setItem(`guest_cart_${category}`, JSON.stringify(cart));
  }, [cart, category]);

  const Icon = config?.icon || Utensils;

  // الحصول على الفئات الفرعية الفريدة
  const subCategories = ['all', ...new Set(menuItems.map(item => item.subCategory).filter(Boolean))];

  // فلترة القوائم حسب البحث والفئة
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = 
      item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
      selectedSubCategory === 'all' || item.subCategory === selectedSubCategory;
    return matchesSearch && matchesCategory;
  });

  // إضافة عنصر للسلة
  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // إزالة عنصر من السلة
  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  // حذف عنصر من السلة بالكامل
  const deleteFromCart = (itemId: string) => {
    setCart(cart.filter(cartItem => cartItem.id !== itemId));
  };

  // حساب الإجمالي
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // إرسال الطلب - فتح نافذة الدفع
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // التحقق من تسجيل الدخول
    const guestSession = localStorage.getItem('guest_session');
    if (!guestSession) {
      const confirmLogin = confirm('⚠️ يجب تسجيل الدخول أولاً\n\nهل تريد الانتقال لصفحة تسجيل الدخول؟');
      if (confirmLogin) {
        router.push('/guest-app/login');
      }
      return;
    }

    // فتح نافذة الدفع
    setIsPaymentOpen(true);
  };

  // معالجة الدفع الناجح
  const handlePaymentSuccess = async (paymentData: PaymentResult) => {
    const guestSession = localStorage.getItem('guest_session');
    if (!guestSession) return;

    const session = JSON.parse(guestSession);
    
    try {
      // استيراد دالة addRequest من Firebase
      const { addRequest } = await import('@/lib/firebase-data');
      
      // تحضير وصف الطلب
      const itemsDescription = cart.map(item => 
        `${item.nameAr} (${item.quantity}x) - ${item.price * item.quantity} ر.س`
      ).join('\n');

      // تحديد نوع الطلب حسب الفئة
      const requestTypeMap: Record<string, string> = {
        'restaurant': 'طلب من المطعم',
        'coffee-shop': 'طلب من الكافتيريا',
        'laundry': 'طلب غسيل',
        'room-service': 'طلب خدمة الغرف'
      };

      const requestType = requestTypeMap[category] || 'طلب من تطبيق النزيل';

      // معلومات الدفع
      const paymentInfo = paymentData.method === 'pay-later' 
        ? '\n\n💳 طريقة الدفع: الدفع لاحقاً (عند الاستلام)'
        : `\n\n💳 طريقة الدفع: ${
            paymentData.method === 'apple-pay' ? 'Apple Pay' : 'بطاقة ائتمان'
          }\n✅ تم الدفع - رقم العملية: ${paymentData.transactionId}`;

      // إرسال الطلب إلى Firebase (سيظهر في صفحة الطلبات)
      await addRequest({
        room: session.roomNumber,
        guest: session.name || session.phone || 'نزيل',
        guestName: session.name || session.phone || 'نزيل',
        roomNumber: session.roomNumber,
        type: requestType,
        description: `الطلب:\n${itemsDescription}\n\nالإجمالي: ${cartTotal} ر.س${paymentInfo}\n\n📱 من: تطبيق النزيل`,
        priority: 'medium',
        status: 'awaiting_employee_approval',
        createdBy: session.name || 'نزيل',
        createdAt: new Date().toISOString()
      });

      // مسح السلة
      setCart([]);
      localStorage.removeItem(`guest_cart_${category}`);
      setIsCartOpen(false);
      setIsPaymentOpen(false);

      // رسالة تأكيد
      const paymentMessage = paymentData.method === 'pay-later'
        ? 'سيتم الدفع عند الاستلام'
        : 'تم الدفع بنجاح';
      
      alert(`✅ تم إرسال طلبك بنجاح!\n${paymentMessage}\nسيتم التواصل معك قريباً.`);
      router.push('/guest-app');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('❌ حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى.');
    }
  };

  if (!config) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p>جاري تحميل القائمة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      <AnimatedBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl"
      >
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              onClick={() => router.push('/guest-app')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 px-2"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
              <span className="hidden sm:inline">رجوع</span>
            </Button>

            <div className="flex items-center gap-2">
              <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${config.color}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-white">{config.title}</h1>
                <p className="text-xs sm:text-sm text-blue-200">{config.titleEn}</p>
              </div>
            </div>

            <Button
              onClick={() => setIsCartOpen(true)}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white relative px-2 sm:px-4"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-5 w-5 sm:h-6 sm:w-6 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Search & Filter */}
      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            type="text"
            placeholder="ابحث في القائمة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 text-sm sm:text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        {subCategories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {subCategories.map((subCat) => (
              <Button
                key={subCat}
                onClick={() => setSelectedSubCategory(subCat)}
                variant={selectedSubCategory === subCat ? 'default' : 'outline'}
                size="sm"
                className={`whitespace-nowrap text-xs sm:text-sm ${
                  selectedSubCategory === subCat
                    ? 'bg-white text-purple-900'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {subCat === 'all' ? 'الكل' : subCat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Items Grid */}
      <div className="relative z-10 container mx-auto px-2 sm:px-4 pb-24 mb-16">
        {filteredItems.length === 0 ? (
          <div className="text-center text-white py-12">
            <p className="text-lg sm:text-xl">لا توجد عناصر متاحة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all h-full">
                  <CardContent className="p-3 sm:p-4 md:p-6 flex flex-col h-full">
                    <div className="flex-1">
                      {item.image && (
                        <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 text-center">{item.image}</div>
                      )}
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">{item.nameAr}</h3>
                      <p className="text-xs sm:text-sm text-blue-200 mb-1">{item.name}</p>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <span className="text-xl sm:text-2xl font-bold text-green-400">
                          {item.price} ر.س
                        </span>
                        {item.subCategory && (
                          <Badge className="bg-purple-500/30 text-white text-xs">
                            {item.subCategory}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => addToCart(item)}
                      size="sm"
                      className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90 text-white text-sm sm:text-base py-2 sm:py-3`}
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                      إضافة للطلب
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-0 h-full w-full sm:w-96 bg-slate-900 z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">طلبك</h2>
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">السلة فارغة</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {cart.map((item) => (
                      <Card key={item.id} className="bg-white/10 border-white/20">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-sm sm:text-base font-bold text-white">{item.nameAr}</h3>
                              <p className="text-xs sm:text-sm text-gray-400">{item.name}</p>
                            </div>
                            <Button
                              onClick={() => deleteFromCart(item.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 sm:gap-2 bg-white/10 rounded-lg p-1">
                              <Button
                                onClick={() => removeFromCart(item.id)}
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <span className="text-white font-bold w-6 sm:w-8 text-center text-sm sm:text-base">
                                {item.quantity}
                              </span>
                              <Button
                                onClick={() => addToCart(item)}
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                            <span className="text-base sm:text-lg font-bold text-green-400">
                              {item.price * item.quantity} ر.س
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <div className="border-t border-white/20 pt-4 mt-4 sm:mt-6">
                      <div className="flex justify-between text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                        <span>الإجمالي:</span>
                        <span className="text-green-400">{cartTotal} ر.س</span>
                      </div>

                      <Button
                        onClick={handleCheckout}
                        disabled={cartTotal === 0}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 sm:py-6 text-base sm:text-lg shadow-xl"
                      >
                        <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                        الدفع والطلب ({cartTotal} ريال)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Dialog */}
      <PaymentDialog
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={cartTotal}
        orderId={`ORD-${Date.now()}`}
        onPaymentSuccess={handlePaymentSuccess}
        allowPayLater={true}
      />
    </div>
  );
}
