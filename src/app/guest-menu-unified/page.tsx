'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" dir="rtl">
      {/* Header الجديد - احترافي */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* معلومات النزيل */}
            <div className="flex items-center gap-3">
              {menuSettings?.showLogo && menuSettings?.logoUrl && (
                <img 
                  src={menuSettings.logoUrl} 
                  alt="Logo" 
                  className="h-14 w-14 object-contain rounded-xl shadow-md"
                />
              )}
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {menuSettings?.hotelNameAr || 'المنيو الإلكتروني'}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium">{guestSession.name}</span>
                  <span className="text-gray-400">•</span>
                  <HomeIcon className="w-3.5 h-3.5" />
                  <span>غرفة {guestSession.roomNumber}</span>
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
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-300"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* رسالة الترحيب */}
          {menuSettings?.showWelcomeMessage && menuSettings?.welcomeMessage && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-700 text-center flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                {menuSettings.welcomeMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* الأقسام */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {sections.map((section) => (
          <Card 
            key={section.id}
            className="overflow-hidden border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl"
          >
            <CardHeader 
              className={`cursor-pointer bg-gradient-to-r ${section.bgGradient} hover:opacity-90 transition-all`}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${section.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-800 text-xl font-bold">{section.title}</span>
                </div>
                <Badge className="bg-white text-gray-700 text-sm px-3 py-1 shadow-sm">
                  {section.items.length} صنف
                </Badge>
              </CardTitle>
            </CardHeader>
            
            {activeSection === section.id && (
              <CardContent className="p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-gray-800 font-bold text-lg mb-1">{item.name}</h4>
                          <p className="text-gray-500 text-sm">{item.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className={`text-2xl font-bold bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>
                          {item.price > 0 ? `${item.price} ر.س` : 'مجاني'}
                        </div>
                        
                        <button
                          onClick={() => addToCart(item, section.title)}
                          className={`p-2.5 bg-gradient-to-r ${section.gradient} text-white rounded-xl hover:shadow-lg transform hover:scale-110 transition-all duration-300`}
                        >
                          <Plus className="w-5 h-5" />
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
  );
}
