'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useGuestOrders from '@/hooks/useGuestOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  User, 
  Phone, 
  Home,
  Coffee,
  Utensils,
  ArrowLeft,
  Clock,
  Star,
  CheckCircle
} from 'lucide-react';

interface GuestData {
  name: string;
  phone: string;
  roomNumber: string;
  service: string;
  loginTime: string;
}

interface MenuItem {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function GuestMenuPage({ params }: { params: { service: string } }) {
  const router = useRouter();
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // استخدام hook إدارة الطلبات
  const { addOrder } = useGuestOrders();

  useEffect(() => {
    // التحقق من بيانات الضيف
    const savedGuestData = localStorage.getItem('guest_session');
    if (!savedGuestData) {
      router.push('/guest-login');
      return;
    }

    const guest = JSON.parse(savedGuestData);
    setGuestData(guest);

    // تحميل عناصر القائمة
    loadMenuItems(params.service);
  }, [params.service, router]);

  const loadMenuItems = (service: string) => {
    const storageKey = service === 'coffee' ? 'coffee_menu' : 'restaurant_menu';
    const savedItems = localStorage.getItem(storageKey);
    
    if (savedItems) {
      const items = JSON.parse(savedItems);
      setMenuItems(items.filter((item: MenuItem) => item.available));
    } else {
      // عناصر افتراضية للعرض
      const defaultItems = service === 'coffee' ? getCoffeeItems() : getRestaurantItems();
      setMenuItems(defaultItems);
    }
    setLoading(false);
  };

  const getCoffeeItems = (): MenuItem[] => [
    {
      id: 'coffee-1',
      nameAr: 'قهوة عربية',
      nameEn: 'Arabic Coffee',
      price: 15,
      category: 'coffee',
      available: true,
      description: 'قهوة عربية أصيلة'
    },
    {
      id: 'coffee-2', 
      nameAr: 'كابتشينو',
      nameEn: 'Cappuccino',
      price: 18,
      category: 'coffee',
      available: true,
      description: 'كابتشينو كريمي'
    },
    {
      id: 'coffee-3',
      nameAr: 'لاتيه',
      nameEn: 'Latte',
      price: 20,
      category: 'coffee',
      available: true,
      description: 'لاتيه بالحليب'
    }
  ];

  const getRestaurantItems = (): MenuItem[] => [
    {
      id: 'food-1',
      nameAr: 'برجر لحم',
      nameEn: 'Beef Burger',
      price: 45,
      category: 'restaurant',
      available: true,
      description: 'برجر لحم طازج'
    },
    {
      id: 'food-2',
      nameAr: 'بيتزا مارجريتا',
      nameEn: 'Margherita Pizza',
      price: 55,
      category: 'restaurant', 
      available: true,
      description: 'بيتزا كلاسيكية'
    },
    {
      id: 'food-3',
      nameAr: 'سلطة قيصر',
      nameEn: 'Caesar Salad',
      price: 30,
      category: 'restaurant',
      available: true,
      description: 'سلطة قيصر طازجة'
    }
  ];

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      return prevCart.map(cartItem =>
        cartItem.id === itemId && cartItem.quantity > 1
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ).filter(cartItem => cartItem.quantity > 0);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('السلة فارغة');
      return;
    }

    // إنشاء الطلب
    const order = {
      id: `order-${Date.now()}`,
      guestData,
      items: cart,
      total: getTotalPrice(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      service: params.service
    };

    // إضافة الطلب باستخدام hook
    addOrder(order);

    // مسح السلة
    setCart([]);
    setShowCart(false);

    // عرض رسالة تأكيد
    alert('تم إرسال الطلب بنجاح! سيتم التحضير قريباً.');
  };

  const logout = () => {
    localStorage.removeItem('guest_session');
    router.push('/guest-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/guest-login')}
                className="text-white hover:bg-gray-700/50"
              >
                <ArrowLeft className="h-5 w-5 ml-2" />
                العودة
              </Button>
              <div className="flex items-center gap-2">
                {params.service === 'coffee' ? (
                  <Coffee className="h-6 w-6 text-blue-400" />
                ) : (
                  <Utensils className="h-6 w-6 text-orange-400" />
                )}
                <h1 className="text-xl font-bold text-white">
                  {params.service === 'coffee' ? 'كوفي شوب' : 'المطعم'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* معلومات الضيف */}
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
                <User className="h-4 w-4" />
                <span>{guestData?.name}</span>
                <span>•</span>
                <Home className="h-4 w-4" />
                <span>غرفة {guestData?.roomNumber}</span>
              </div>

              {/* السلة */}
              <Button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                السلة
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>

              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 hover:bg-gray-700/50"
              >
                خروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* قائمة الطعام */}
          <div className="flex-1">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                MENU
              </h2>
              <p className="text-lg text-gray-300 font-semibold">
                {params.service === 'coffee' ? 'COFFEE SHOP' : 'RESTAURANT'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group"
                >
                  {/* صورة العنصر */}
                  <div className="relative mb-4">
                    <div className="w-full h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.nameAr}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          {params.service === 'coffee' ? (
                            <Coffee className="h-12 w-12 mx-auto mb-2" />
                          ) : (
                            <Utensils className="h-12 w-12 mx-auto mb-2" />
                          )}
                          <div className="text-sm">لا توجد صورة</div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                        متوفر
                      </Badge>
                    </div>
                  </div>

                  {/* تفاصيل العنصر */}
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-white text-lg mb-1 group-hover:text-blue-300 transition-colors">
                      {item.nameAr}
                    </h3>
                    <p className="text-gray-400 text-sm uppercase font-medium">
                      {item.nameEn}
                    </p>
                    {item.description && (
                      <p className="text-gray-500 text-xs mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* السعر والإضافة */}
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {item.price} <span className="text-sm text-gray-400">ر.س</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => addToCart(item)}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 group-hover:scale-105 transition-transform"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      إضافة
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {menuItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {params.service === 'coffee' ? (
                    <Coffee className="h-16 w-16 mx-auto" />
                  ) : (
                    <Utensils className="h-16 w-16 mx-auto" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد عناصر متاحة</h3>
                <p className="text-gray-400">يرجى المحاولة لاحقاً أو التواصل مع الاستقبال</p>
              </div>
            )}
          </div>

          {/* السلة الجانبية */}
          {showCart && (
            <div className="w-80 bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 h-fit sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                سلة التسوق
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>السلة فارغة</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-white text-sm font-medium">{item.nameAr}</h4>
                          <p className="text-gray-400 text-xs">{item.price} ر.س</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 p-0 border-gray-600 text-gray-300"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(item)}
                            className="h-6 w-6 p-0 border-gray-600 text-gray-300"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-300">الإجمالي:</span>
                      <span className="text-xl font-bold text-white">
                        {getTotalPrice()} ر.س
                      </span>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      إرسال الطلب
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}