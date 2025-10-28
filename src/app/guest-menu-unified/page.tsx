'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { 
  Hotel, 
  Coffee, 
  UtensilsCrossed, 
  Shirt, 
  Phone,
  Clock,
  LogOut,
  AlertCircle,
  Wrench,
  Plus,
  Minus,
  ShoppingCart,
  X,
  Send,
  User,
  Home as HomeIcon,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  section: string;
}

interface GuestSession {
  name: string;
  phone: string;
  roomNumber: string;
  loginTime: string;
}

export default function GuestMenuUnifiedPage() {
  const router = useRouter();
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [menuSettings, setMenuSettings] = useState<any>(null);
  
  // قوائم الخدمات من localStorage
  const [roomServiceItems, setRoomServiceItems] = useState<any[]>([]);
  const [coffeeShopItems, setCoffeeShopItems] = useState<any[]>([]);
  const [restaurantItems, setRestaurantItems] = useState<any[]>([]);
  const [laundryItems, setLaundryItems] = useState<any[]>([]);
  const [receptionServices, setReceptionServices] = useState<any[]>([]);

  useEffect(() => {
    // التحقق من تسجيل دخول النزيل
    const sessionData = localStorage.getItem('guest_session');
    if (!sessionData) {
      router.push('/guest-login');
      return;
    }
    setGuestSession(JSON.parse(sessionData));

    // تحميل إعدادات المنيو
    const settings = localStorage.getItem('guest_menu_settings');
    if (settings) {
      setMenuSettings(JSON.parse(settings));
    }

    // تحميل الأصناف من localStorage
    loadMenuItems();
  }, [router]);

  const loadMenuItems = () => {
    // خدمة الغرف
    const roomService = JSON.parse(localStorage.getItem('room_service_items') || '[]');
    if (roomService.length === 0) {
      setRoomServiceItems([
        { id: 'rs1', name: 'مخدة إضافية', price: 0, category: 'أساسيات' },
        { id: 'rs2', name: 'مناشف إضافية', price: 0, category: 'أساسيات' },
        { id: 'rs3', name: 'بطانية', price: 0, category: 'أساسيات' },
      ]);
    } else {
      setRoomServiceItems(roomService);
    }

    // الكوفي شوب
    const coffee = JSON.parse(localStorage.getItem('coffee_menu') || '[]');
    if (coffee.length === 0) {
      setCoffeeShopItems([
        { id: 'cf1', name: 'قهوة عربية', price: 8, category: 'مشروبات ساخنة' },
        { id: 'cf2', name: 'قهوة تركية', price: 10, category: 'مشروبات ساخنة' },
      ]);
    } else {
      setCoffeeShopItems(coffee);
    }

    // المطعم
    const restaurant = JSON.parse(localStorage.getItem('restaurant_menu') || '[]');
    if (restaurant.length === 0) {
      setRestaurantItems([
        { id: 'rest1', name: 'فطور أمريكي', price: 35, category: 'إفطار' },
        { id: 'rest2', name: 'فطور عربي', price: 30, category: 'إفطار' },
      ]);
    } else {
      setRestaurantItems(restaurant);
    }

    // المغسلة
    const laundry = JSON.parse(localStorage.getItem('laundry_services') || '[]');
    if (laundry.length === 0) {
      setLaundryItems([
        { id: 'lau1', name: 'غسيل وكي قميص', price: 15, category: 'ملابس رجالية' },
        { id: 'lau2', name: 'غسيل وكي بنطلون', price: 20, category: 'ملابس رجالية' },
      ]);
    } else {
      setLaundryItems(laundry);
    }

    // الاستقبال
    const reception = JSON.parse(localStorage.getItem('reception_services') || '[]');
    if (reception.length === 0) {
      setReceptionServices([
        { id: 'rec1', name: 'طلب تاكسي', price: 0, category: 'خدمات' },
        { id: 'rec2', name: 'إيقاظ صباحي', price: 0, category: 'خدمات' },
      ]);
    } else {
      setReceptionServices(reception);
    }
  };

  // إضافة للسلة
  const addToCart = (item: any, section: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, section }]);
    }
  };

  // تحديث الكمية
  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return { ...item, quantity: Math.max(0, newQuantity) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // حذف من السلة
  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // الإجمالي
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // إرسال الطلب
  const submitOrder = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة! يرجى إضافة عناصر أولاً');
      return;
    }

    const order = {
      id: `order_${Date.now()}`,
      guestName: guestSession?.name,
      roomNumber: guestSession?.roomNumber,
      items: cart,
      total: totalAmount,
      timestamp: new Date().toISOString(),
      status: 'pending',
      type: 'طلب من المنيو الإلكتروني'
    };

    // حفظ الطلب في guest_orders (localStorage)
    const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
    guestOrders.push(order);
    localStorage.setItem('guest_orders', JSON.stringify(guestOrders));

    // إرسال الطلب لـ Firebase (لوحة طلبات النزلاء)
    try {
      const { addRequest } = await import('@/lib/firebase-data');
      
      const itemsList = cart.map(item => `${item.name} (الكمية: ${item.quantity})`).join('\n');
      
      await addRequest({
        room: guestSession?.roomNumber || '',
        guest: guestSession?.name || '',
        type: 'طلب من المنيو الإلكتروني',
        description: `طلب يحتوي على ${cart.length} صنف:\n${itemsList}\n\nالإجمالي: ${totalAmount} ر.س`,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // تشغيل صوت النجاح
      playSuccessSound();

      alert(`✅ تم إرسال طلبك بنجاح!\n\nالإجمالي: ${totalAmount} ر.س\nسيصل إلى غرفتك قريباً 🎉`);
      setCart([]);
      setShowCart(false);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(`⚠️ حدث خطأ في الإرسال!\n\nتم حفظ طلبك محلياً. يرجى التواصل مع الاستقبال.`);
    }
  };

  // تشغيل صوت النجاح
  const playSuccessSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (error) {
      console.log('Sound not available:', error);
    }
  };

  // تسجيل الخروج
  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج؟')) {
      localStorage.removeItem('guest_session');
      router.push('/guest-login');
    }
  };

  if (!guestSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: 'room',
      title: 'خدمة الغرف',
      icon: Hotel,
      items: roomServiceItems,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      id: 'coffee',
      title: 'الكوفي شوب',
      icon: Coffee,
      items: coffeeShopItems,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50'
    },
    {
      id: 'restaurant',
      title: 'المطعم',
      icon: UtensilsCrossed,
      items: restaurantItems,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      id: 'laundry',
      title: 'المغسلة',
      icon: Shirt,
      items: laundryItems,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      id: 'reception',
      title: 'الاستقبال',
      icon: Phone,
      items: receptionServices,
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-50 to-rose-50'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden" dir="rtl">
      <AnimatedBackground />
      
      {/* Content Layer */}
      <div className="relative z-10">
        {/* Header الجديد - احترافي */}
        <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg shadow-lg border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* شعار النظام + معلومات النزيل */}
              <div className="flex items-center gap-3">
                {/* شعار المضيف */}
                <div className="flex items-center gap-3 border-l border-white/20 pl-3">
                  <div className="relative flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-xl ring-2 ring-white/30">
                      <img src="/app-logo.png" alt="المضيف" className="w-8 h-8 rounded-full object-contain" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-pink-200 bg-clip-text text-transparent">
                      المضيف الذكي
                    </h1>
                    <p className="text-purple-200/70 text-xs font-medium">المنيو الإلكتروني</p>
                  </div>
                </div>

                {/* معلومات النزيل */}
                <div className="flex items-center gap-2">
                  {menuSettings?.showLogo && menuSettings?.logoUrl && (
                    <img 
                      src={menuSettings.logoUrl} 
                      alt="Logo" 
                      className="h-10 w-10 object-contain rounded-lg"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3.5 h-3.5 text-blue-300" />
                      <span className="font-medium text-white">{guestSession.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-200">
                      <HomeIcon className="w-3 h-3" />
                      <span>غرفة {guestSession.roomNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex items-center gap-2">
                {/* زر السلة - احترافي */}
                <button
                  onClick={() => setShowCart(true)}
                  className="relative group"
                >
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  {cart.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-bounce">
                      {cart.length}
                    </div>
                  )}
                </button>

                {/* زر الخروج */}
                <button
                  onClick={handleLogout}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 border border-white/20"
                >
                  <LogOut className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* ترحيب خاص بالنزيل - جديد وجميل */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8 shadow-2xl">
          {/* نقاط ديكور */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-block mb-4">
              <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              أهلاً وسهلاً {guestSession.name} 👋
            </h2>
            
            <p className="text-blue-100 text-lg mb-6">
              {menuSettings?.welcomeMessage || 'نتمنى لك إقامة سعيدة في غرفتك رقم ' + guestSession.roomNumber}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/20">
                <HomeIcon className="w-5 h-5 text-white" />
                <span className="text-white font-bold">غرفة {guestSession.roomNumber}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/20">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="text-white font-bold">اطلب ما تشاء</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/20">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span className="text-white font-bold">توصيل سريع</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الأقسام */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {sections.map((section) => (
          <Card 
            key={section.id}
            className="overflow-hidden border-2 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:shadow-2xl"
          >
            <CardHeader 
              className={`cursor-pointer bg-gradient-to-r ${section.bgGradient} bg-opacity-20 hover:opacity-90 transition-all backdrop-blur-sm`}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${section.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xl font-bold">{section.title}</span>
                </div>
                <Badge className="bg-white/20 text-white text-sm px-3 py-1 shadow-sm border border-white/30">
                  {section.items.length} صنف
                </Badge>
              </CardTitle>
            </CardHeader>
            
            {activeSection === section.id && (
              <CardContent className="p-6 bg-black/20 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border-2 border-white/10 hover:border-white/30 hover:shadow-2xl transition-all duration-300"
                    >
                      {/* صورة الصنف */}
                      {item.image ? (
                        <div className="relative h-48 w-full overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          {item.price > 0 && (
                            <div className={`absolute top-3 right-3 bg-gradient-to-r ${section.gradient} text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg`}>
                              {item.price} ر.س
                            </div>
                          )}
                          {item.price === 0 && (
                            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                              مجاني
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`relative h-48 w-full bg-gradient-to-br ${section.gradient} flex items-center justify-center`}>
                          <section.icon className="w-20 h-20 text-white/40" />
                          {item.price > 0 && (
                            <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                              {item.price} ر.س
                            </div>
                          )}
                          {item.price === 0 && (
                            <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                              مجاني
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* تفاصيل الصنف */}
                      <div className="p-5 bg-white/5 backdrop-blur-sm">
                        <h4 className="text-white font-bold text-lg mb-1 line-clamp-2">{item.name}</h4>
                        <p className="text-blue-200 text-sm mb-4">{item.category}</p>
                        
                        {item.description && (
                          <p className="text-blue-100/80 text-xs mb-4 line-clamp-2">{item.description}</p>
                        )}
                        
                        <button
                          onClick={() => addToCart(item, section.title)}
                          className={`w-full py-3 bg-gradient-to-r ${section.gradient} text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2`}
                        >
                          <Plus className="w-5 h-5" />
                          إضافة للسلة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* السلة المنبثقة - احترافية */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all">
            {/* هيدر السلة */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-lg">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">سلة الطلبات</h3>
                    <p className="text-blue-100 text-sm">{cart.length} صنف</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* محتوى السلة */}
            <div className="p-6 overflow-y-auto max-h-96">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">السلة فارغة</p>
                  <p className="text-gray-400 text-sm">أضف بعض الأصناف للبدء</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.section}</p>
                        <p className="text-lg font-bold text-blue-600 mt-1">
                          {item.price > 0 ? `${item.price * item.quantity} ر.س` : 'مجاني'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* تذييل السلة */}
            {cart.length > 0 && (
              <div className="border-t-2 border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-gray-800">الإجمالي:</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {totalAmount} ر.س
                  </span>
                </div>
                
                <button
                  onClick={submitOrder}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  إرسال الطلب
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
