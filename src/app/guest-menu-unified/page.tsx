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
  Home as HomeIcon
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
      // بيانات افتراضية إذا لم توجد
      setRoomServiceItems([
        { id: 'rs1', name: 'مخدة إضافية', price: 0, category: 'أساسيات' },
        { id: 'rs2', name: 'مناشف إضافية', price: 0, category: 'أساسيات' },
        { id: 'rs3', name: 'بطانية', price: 0, category: 'أساسيات' },
        { id: 'rs4', name: 'مكواة ملابس', price: 0, category: 'أدوات' },
        { id: 'rs5', name: 'مجفف شعر', price: 0, category: 'أدوات' },
        { id: 'rs6', name: 'أدوات تنظيف', price: 0, category: 'نظافة' },
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
        { id: 'cf3', name: 'كابتشينو', price: 15, category: 'مشروبات ساخنة' },
        { id: 'cf4', name: 'لاتيه', price: 15, category: 'مشروبات ساخنة' },
        { id: 'cf7', name: 'عصير برتقال طازج', price: 12, category: 'مشروبات باردة' },
        { id: 'cf8', name: 'عصير مانجو', price: 14, category: 'مشروبات باردة' },
      ]);
    } else {
      setCoffeeShopItems(coffee);
    }

    // المطعم
    const restaurant = JSON.parse(localStorage.getItem('restaurant_menu') || '[]');
    if (restaurant.length === 0) {
      setRestaurantItems([
        { id: 'r1', name: 'حمص بالطحينة', price: 15, category: 'مقبلات' },
        { id: 'r2', name: 'متبل باذنجان', price: 18, category: 'مقبلات' },
        { id: 'r5', name: 'كباب مشوي', price: 45, category: 'أطباق رئيسية' },
        { id: 'r6', name: 'فراخ مشوية', price: 40, category: 'أطباق رئيسية' },
      ]);
    } else {
      setRestaurantItems(restaurant);
    }

    // المغسلة
    const laundry = JSON.parse(localStorage.getItem('laundry_services') || '[]');
    if (laundry.length === 0) {
      setLaundryItems([
        { id: 'l1', name: 'قميص', price: 8, category: 'غسيل وكي' },
        { id: 'l2', name: 'بنطلون', price: 10, category: 'غسيل وكي' },
        { id: 'l3', name: 'ثوب', price: 12, category: 'غسيل وكي' },
      ]);
    } else {
      setLaundryItems(laundry);
    }

    // خدمات الاستقبال
    const reception = JSON.parse(localStorage.getItem('reception_services') || '[]');
    if (reception.length === 0) {
      setReceptionServices([
        { id: 'rec1', name: 'تمديد الإقامة', price: 0, category: 'خدمات' },
        { id: 'rec2', name: 'تشيك أوت مبكر', price: 0, category: 'خدمات' },
        { id: 'rec3', name: 'تقديم شكوى', price: 0, category: 'استفسارات' },
        { id: 'rec4', name: 'طلب صيانة', price: 0, category: 'صيانة' },
      ]);
    } else {
      setReceptionServices(reception);
    }
  };

  // إضافة للسلة
  const addToCart = (item: any, section: string) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { 
        ...item, 
        quantity: 1, 
        section 
      }]);
    }
  };

  // تقليل الكمية
  const decreaseQuantity = (id: string) => {
    const item = cart.find(i => i.id === id);
    if (item && item.quantity > 1) {
      setCart(cart.map(i => 
        i.id === id 
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ));
    } else {
      removeFromCart(id);
    }
  };

  // حذف من السلة
  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  // حساب الإجمالي
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // إرسال الطلب
  const submitOrder = () => {
    if (cart.length === 0) {
      alert('السلة فارغة! يرجى إضافة عناصر أولاً');
      return;
    }

    const order = {
      guestName: guestSession?.name,
      roomNumber: guestSession?.roomNumber,
      items: cart,
      total: totalAmount,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // حفظ الطلب في localStorage
    const existingOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
    existingOrders.push(order);
    localStorage.setItem('guest_orders', JSON.stringify(existingOrders));

    alert(`تم إرسال طلبك بنجاح!\nالإجمالي: ${totalAmount} ر.س`);
    setCart([]);
    setShowCart(false);
  };

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('guest_session');
    router.push('/guest-login');
  };

  if (!guestSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      {/* الهيدر */}
      <div className="max-w-6xl mx-auto mb-6">
        {/* رسالة الترحيب والشعار */}
        {menuSettings && (menuSettings.showLogo || menuSettings.showWelcomeMessage) && (
          <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 mb-4">
            <CardContent className="p-6 text-center">
              {menuSettings.showLogo && menuSettings.logo && (
                <div className="mb-4">
                  <img 
                    src={menuSettings.logo} 
                    alt={menuSettings.hotelName}
                    className="h-20 w-auto mx-auto object-contain"
                  />
                </div>
              )}
              {menuSettings.showWelcomeMessage && menuSettings.welcomeMessage && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {menuSettings.hotelName}
                  </h2>
                  <p className="text-gray-300">
                    {menuSettings.welcomeMessage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold">{guestSession.name}</h2>
                  <p className="text-gray-300 text-sm flex items-center gap-1">
                    <HomeIcon className="w-4 h-4" />
                    غرفة {guestSession.roomNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* زر السلة */}
                <Button
                  onClick={() => setShowCart(!showCart)}
                  className="relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
                {/* زر الخروج */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* قسم خدمة الغرف */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-800/50 transition-colors"
            onClick={() => setActiveSection(activeSection === 'room' ? null : 'room')}
          >
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Hotel className="w-5 h-5 text-white" />
                </div>
                <span>خدمة الغرف</span>
              </div>
              <Badge variant="secondary">{roomServiceItems.length} صنف</Badge>
            </CardTitle>
          </CardHeader>
          {activeSection === 'room' && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roomServiceItems.map((item) => (
                  <div key={item.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{item.name}</h4>
                      <p className="text-gray-400 text-sm">{item.category}</p>
                      <p className="text-green-400 font-bold">{item.price > 0 ? `${item.price} ر.س` : 'مجاني'}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item, 'خدمة الغرف')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* قسم الكوفي شوب */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-800/50 transition-colors"
            onClick={() => setActiveSection(activeSection === 'coffee' ? null : 'coffee')}
          >
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                <span>الكوفي شوب</span>
              </div>
              <Badge variant="secondary">{coffeeShopItems.length} صنف</Badge>
            </CardTitle>
          </CardHeader>
          {activeSection === 'coffee' && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {coffeeShopItems.map((item) => (
                  <div key={item.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{item.name}</h4>
                      <p className="text-gray-400 text-sm">{item.category}</p>
                      <p className="text-green-400 font-bold">{item.price} ر.س</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item, 'الكوفي شوب')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* قسم المطعم */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-800/50 transition-colors"
            onClick={() => setActiveSection(activeSection === 'restaurant' ? null : 'restaurant')}
          >
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <span>المطعم</span>
              </div>
              <Badge variant="secondary">{restaurantItems.length} صنف</Badge>
            </CardTitle>
          </CardHeader>
          {activeSection === 'restaurant' && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {restaurantItems.map((item) => (
                  <div key={item.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{item.name}</h4>
                      <p className="text-gray-400 text-sm">{item.category}</p>
                      <p className="text-green-400 font-bold">{item.price} ر.س</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item, 'المطعم')}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* قسم المغسلة */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-800/50 transition-colors"
            onClick={() => setActiveSection(activeSection === 'laundry' ? null : 'laundry')}
          >
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Shirt className="w-5 h-5 text-white" />
                </div>
                <span>المغسلة</span>
              </div>
              <Badge variant="secondary">{laundryItems.length} صنف</Badge>
            </CardTitle>
          </CardHeader>
          {activeSection === 'laundry' && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {laundryItems.map((item) => (
                  <div key={item.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{item.name}</h4>
                      <p className="text-gray-400 text-sm">{item.category}</p>
                      <p className="text-green-400 font-bold">{item.price} ر.س</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item, 'المغسلة')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* قسم الاستقبال */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-800/50 transition-colors"
            onClick={() => setActiveSection(activeSection === 'reception' ? null : 'reception')}
          >
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span>الاستقبال</span>
              </div>
              <Badge variant="secondary">{receptionServices.length} خدمة</Badge>
            </CardTitle>
          </CardHeader>
          {activeSection === 'reception' && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {receptionServices.map((item) => {
                  let Icon = Phone;
                  if (item.id === 'rec1') Icon = Clock;
                  if (item.id === 'rec2') Icon = LogOut;
                  if (item.id === 'rec3') Icon = AlertCircle;
                  if (item.id === 'rec4') Icon = Wrench;

                  return (
                    <div key={item.id} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{item.name}</h4>
                          <p className="text-gray-400 text-sm">{item.category}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToCart(item, 'الاستقبال')}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* نافذة السلة المنزلقة */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-auto">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  <span>سلة الطلبات</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">السلة فارغة</p>
                  <p className="text-gray-500 text-sm">ابدأ بإضافة عناصر من الأقسام أعلاه</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-medium">{item.name}</h4>
                          <p className="text-gray-400 text-sm">{item.section}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => decreaseQuantity(item.id)}
                            className="h-7 w-7 p-0 hover:bg-gray-600"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </Button>
                          <span className="text-white font-medium px-3">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addToCart(item, item.section)}
                            className="h-7 w-7 p-0 hover:bg-gray-600"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </Button>
                        </div>
                        <span className="text-green-400 font-bold">
                          {item.price * item.quantity} ر.س
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* الإجمالي */}
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="flex items-center justify-between text-xl font-bold mb-4">
                      <span className="text-white">الإجمالي:</span>
                      <span className="text-green-400">{totalAmount} ر.س</span>
                    </div>
                    <Button
                      onClick={submitOrder}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-6"
                    >
                      <Send className="w-5 h-5 ml-2" />
                      إرسال الطلب
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
