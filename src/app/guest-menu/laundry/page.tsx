'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shirt, ArrowLeft, Star, Plus, ShoppingCart, 
  Clock, User, Home, CheckCircle, Droplets, Wind, Sparkles,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LaundryItem {
  id: string;
  name: string;
  nameAr: string;
  category: 'washing' | 'ironing' | 'dry-cleaning' | 'special';
  price: number;
  duration: string;
  available: boolean;
}

interface CartItem extends LaundryItem {
  quantity: number;
}

interface GuestData {
  name: string;
  phone: string;
  roomNumber: string;
}

const LAUNDRY_SERVICES: LaundryItem[] = [
  {
    id: '1',
    name: 'Shirt Washing',
    nameAr: 'غسيل قميص',
    price: 15,
    duration: '24 ساعة',
    category: 'washing',
    available: true
  },
  {
    id: '2',
    name: 'Pants Washing',
    nameAr: 'غسيل بنطلون',
    price: 20,
    duration: '24 ساعة',
    category: 'washing',
    available: true
  },
  {
    id: '3',
    name: 'Dress Washing',
    nameAr: 'غسيل فستان',
    price: 25,
    duration: '48 ساعة',
    category: 'washing',
    available: true
  },
  {
    id: '4',
    name: 'Shirt Ironing',
    nameAr: 'كوي قميص',
    price: 8,
    duration: '12 ساعة',
    category: 'ironing',
    available: true
  },
  {
    id: '5',
    name: 'Pants Ironing',
    nameAr: 'كوي بنطلون',
    price: 10,
    duration: '12 ساعة',
    category: 'ironing',
    available: true
  },
  {
    id: '6',
    name: 'Suit Dry Cleaning',
    nameAr: 'تنظيف بدلة جافة',
    price: 60,
    duration: '72 ساعة',
    category: 'dry-cleaning',
    available: true
  },
  {
    id: '7',
    name: 'Wedding Dress',
    nameAr: 'فستان زفاف',
    price: 150,
    duration: '7 أيام',
    category: 'special',
    available: true
  },
  {
    id: '8',
    name: 'Curtains',
    nameAr: 'ستائر',
    price: 80,
    duration: '5 أيام',
    category: 'special',
    available: true
  },
  {
    id: '9',
    name: 'Bedding Set',
    nameAr: 'طقم ملابس سرير',
    price: 35,
    duration: '24 ساعة',
    category: 'washing',
    available: true
  },
  {
    id: '10',
    name: 'Leather Jacket',
    nameAr: 'جاكيت جلد',
    price: 100,
    duration: '5 أيام',
    category: 'special',
    available: true
  },
  {
    id: '11',
    name: 'Towels (5 pieces)',
    nameAr: 'مناشف (5 قطع)',
    price: 25,
    duration: '24 ساعة',
    category: 'washing',
    available: true
  },
  {
    id: '12',
    name: 'Tie Cleaning',
    nameAr: 'تنظيف ربطة عنق',
    price: 15,
    duration: '48 ساعة',
    category: 'dry-cleaning',
    available: true
  },
  {
    id: '13',
    name: 'Express Service',
    nameAr: 'خدمة سريعة',
    price: 50,
    duration: '4 ساعات',
    category: 'special',
    available: true
  }
];

export default function GuestLaundryPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [guestData, setGuestData] = useState<GuestData | null>(null);

  React.useEffect(() => {
    const savedGuestData = localStorage.getItem('guest_session');
    if (!savedGuestData) {
      router.push('/guest-login');
      return;
    }
    setGuestData(JSON.parse(savedGuestData));
  }, [router]);

  // مراقبة تغييرات السلة
  React.useEffect(() => {
    console.log('🛒 تحديث السلة:', cart.length, 'أصناف');
    console.log('السلة الحالية:', cart);
  }, [cart]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return LAUNDRY_SERVICES;
    return LAUNDRY_SERVICES.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addToCart = (item: LaundryItem) => {
    console.log('🛒 إضافة إلى السلة:', item.nameAr, item);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        console.log('✅ تحديث الكمية للصنف الموجود');
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      console.log('✅ إضافة صنف جديد إلى السلة');
      return [...prevCart, { ...item, quantity: 1 }];
    });
    
    // إشعار بالإضافة
    const notification = document.createElement('div');
    notification.textContent = `✅ تمت إضافة ${item.nameAr} إلى السلة`;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 9999;
      font-weight: bold;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
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
    if (!guestData) return;
    
    const order = {
      id: `order-${Date.now()}`,
      guestData,
      items: cart,
      total: cartTotal,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      service: 'laundry'
    };

    try {
      const existingOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
      localStorage.setItem('guest_orders', JSON.stringify([...existingOrders, order]));

      const { addRequest } = await import('@/lib/firebase-data');
      
      const itemsDescription = cart.map(item => 
        `${item.nameAr} (${item.quantity}x) - ${item.price * item.quantity} ر.س - ${item.duration}`
      ).join('\n');

      await addRequest({
        room: guestData.roomNumber,
        guest: guestData.name,
        phone: guestData.phone,
        type: 'طلب من المغسلة',
        description: `الطلب:\n${itemsDescription}\n\nالإجمالي: ${cartTotal} ر.س`,
        priority: 'low',
        status: 'awaiting_employee_approval',
        notes: `طلب إلكتروني من المنيو - الخدمة: مغسلة`,
        createdAt: new Date().toISOString()
      });

      alert('تم إرسال طلبك بنجاح! سيتم معالجته قريباً.');
      setCart([]);
      setIsCheckoutOpen(false);
      
      // إعادة التوجيه لصفحة القائمة الرئيسية
      setTimeout(() => {
        router.push('/guest-menu');
      }, 1500);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'washing': return <Droplets className="h-4 w-4" />;
      case 'ironing': return <Wind className="h-4 w-4" />;
      case 'dry-cleaning': return <Sparkles className="h-4 w-4" />;
      case 'special': return <Star className="h-4 w-4" />;
      default: return <Shirt className="h-4 w-4" />;
    }
  };

  if (!guestData) {
    return <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-teal-900 flex items-center justify-center">
      <div className="text-white text-xl">جاري التحميل...</div>
    </div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-blue-900 to-teal-900" />
      
      <motion.header 
        className="relative z-50 bg-black/20 backdrop-blur-2xl border-b border-cyan-500/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/guest-menu')}
              className="text-white border-cyan-400/50 hover:bg-cyan-500/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              العودة للقائمة
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                خدمات المغسلة
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm text-cyan-300 mt-1">
                <User className="h-4 w-4" />
                <span>{guestData.name}</span>
                <span>•</span>
                <Home className="h-4 w-4" />
                <span>غرفة {guestData.roomNumber}</span>
              </div>
            </div>
            
            <Button
              onClick={() => setIsCheckoutOpen(true)}
              className="relative bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              السلة
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-6 w-6 rounded-full">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-xl border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-cyan-200 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  الفئات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'all', label: 'جميع الخدمات' },
                  { id: 'washing', label: 'غسيل' },
                  { id: 'ironing', label: 'كوي' },
                  { id: 'dry-cleaning', label: 'تنظيف جاف' },
                  { id: 'special', label: 'خدمات خاصة' }
                ].map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-right ${
                      selectedCategory === category.id ? 'bg-cyan-500' : 'text-cyan-200'
                    }`}
                  >
                    {category.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredServices.map((service) => (
                <Card key={service.id} className="bg-white/5 backdrop-blur-xl border-cyan-400/20">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 aspect-square">
                    <img 
                      src={`https://images.unsplash.com/photo-${
                        service.id === '1' ? '1517677129300-07b130802f46' :
                        service.id === '2' ? '1624378439575-a9d6c8f8b6c5' :
                        service.id === '3' ? '1595777457583-95e059d581b8' :
                        service.id === '4' ? '1556821585-5d82e6d92f5d' :
                        service.id === '5' ? '1489987707025-afc232f7ea0f' :
                        service.id === '6' ? '1507679799987-3c3b8b9b5a53' :
                        service.id === '7' ? '1519741644101-4b1d7da9d9f0' :
                        service.id === '8' ? '1616486029423-aaa4789e8c9c' :
                        service.id === '9' ? '1631679706896-5d9f5f098f8b' :
                        service.id === '10' ? '1551028719-2bba35af529a' :
                        service.id === '11' ? '1631679706895-5d9f5f098f8b' :
                        service.id === '12' ? '1594633312681-425c7b97ccd1' :
                        '1582735689369-4ba29b0f5b1e'
                      }?w=300&h=300&fit=crop&q=80`}
                      alt={service.nameAr}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-green-500 text-white text-sm">
                      {service.price} ر.س
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4 text-white">
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{service.nameAr}</h3>
                    <p className="text-white/60 text-xs mb-2 line-clamp-1">{service.name}</p>
                    <div className="flex items-center gap-1 mb-3">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span className="text-cyan-300 text-xs">{service.duration}</span>
                    </div>
                    
                    <Button
                      onClick={() => {
                        console.log('🔘 تم الضغط على زر الإضافة!');
                        console.log('الصنف:', service.nameAr);
                        console.log('متاح؟', service.available);
                        addToCart(service);
                      }}
                      disabled={!service.available}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm py-2 hover:from-cyan-600 hover:to-blue-600 transition-all"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-2xl border-cyan-400/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-cyan-200">سلة المغسلة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-cyan-300">السلة فارغة</div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                    <Shirt className="h-8 w-8 text-cyan-400" />
                    <div className="flex-1">
                      <h4 className="text-cyan-200 font-semibold">{item.nameAr}</h4>
                      <p className="text-cyan-300 text-sm">{item.price} ر.س • {item.duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    </div>
                  </div>
                ))}

                <div className="bg-cyan-500/20 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-cyan-200">المجموع:</span>
                    <span className="text-2xl font-bold text-green-400">{cartTotal} ر.س</span>
                  </div>
                  <div className="text-cyan-300 text-sm">
                    <div>الاسم: {guestData.name}</div>
                    <div>رقم الغرفة: {guestData.roomNumber}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>إلغاء</Button>
            <Button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              إرسال الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
