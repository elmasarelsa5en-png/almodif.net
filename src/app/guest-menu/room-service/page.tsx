'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, ArrowLeft, Star, Plus, ShoppingCart, 
  Clock, User, Phone, CheckCircle, Sparkles, Bed, Bath,
  Wind, Droplets, Wrench, Filter, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RoomServiceItem {
  id: string;
  name: string;
  nameAr: string;
  category: 'bedding' | 'bathroom' | 'cleaning' | 'appliances' | 'maintenance';
  price: number;
  image: string;
  description: string;
  available: boolean;
  deliveryTime: string;
}

interface CartItem extends RoomServiceItem {
  quantity: number;
}

interface GuestData {
  name: string;
  phone: string;
  roomNumber: string;
}

const ROOM_SERVICE_ITEMS: RoomServiceItem[] = [
  // أدوات السرير
  {
    id: '1',
    name: 'Pillow',
    nameAr: 'مخدة',
    category: 'bedding',
    price: 0,
    image: '🛏️',
    description: 'مخدة إضافية ناعمة ومريحة',
    available: true,
    deliveryTime: '15 دقيقة'
  },
  {
    id: '2',
    name: 'Blanket',
    nameAr: 'بطانية',
    category: 'bedding',
    price: 0,
    image: '🛌',
    description: 'بطانية دافئة عالية الجودة',
    available: true,
    deliveryTime: '15 دقيقة'
  },
  {
    id: '3',
    name: 'Bed Sheet',
    nameAr: 'مفرش',
    category: 'bedding',
    price: 0,
    image: '🛏️',
    description: 'مفرش سرير نظيف وأنيق',
    available: true,
    deliveryTime: '20 دقيقة'
  },
  {
    id: '4',
    name: 'Mattress Pad',
    nameAr: 'طراحة',
    category: 'bedding',
    price: 0,
    image: '🛏️',
    description: 'طراحة إضافية مريحة',
    available: true,
    deliveryTime: '20 دقيقة'
  },
  
  // أدوات الحمام
  {
    id: '5',
    name: 'Shampoo',
    nameAr: 'شامبو',
    category: 'bathroom',
    price: 0,
    image: '🧴',
    description: 'شامبو عالي الجودة للشعر',
    available: true,
    deliveryTime: '10 دقائق'
  },
  {
    id: '6',
    name: 'Shower Gel',
    nameAr: 'شاور جل',
    category: 'bathroom',
    price: 0,
    image: '🧴',
    description: 'سائل استحمام منعش',
    available: true,
    deliveryTime: '10 دقائق'
  },
  {
    id: '7',
    name: 'Conditioner',
    nameAr: 'بلسم',
    category: 'bathroom',
    price: 0,
    image: '🧴',
    description: 'بلسم للشعر ناعم',
    available: true,
    deliveryTime: '10 دقائق'
  },
  {
    id: '8',
    name: 'Bath Towel Large',
    nameAr: 'منشفة كبيرة',
    category: 'bathroom',
    price: 0,
    image: '🛁',
    description: 'منشفة استحمام كبيرة',
    available: true,
    deliveryTime: '15 دقيقة'
  },
  {
    id: '9',
    name: 'Bath Towel Small',
    nameAr: 'منشفة صغيرة',
    category: 'bathroom',
    price: 0,
    image: '🛁',
    description: 'منشفة يد صغيرة',
    available: true,
    deliveryTime: '15 دقيقة'
  },
  {
    id: '10',
    name: 'Loofah',
    nameAr: 'ليفة',
    category: 'bathroom',
    price: 0,
    image: '🧽',
    description: 'ليفة استحمام ناعمة',
    available: true,
    deliveryTime: '10 دقائق'
  },
  
  // أدوات التنظيف
  {
    id: '11',
    name: 'Cleaning Supplies',
    nameAr: 'أدوات تنظيف',
    category: 'cleaning',
    price: 0,
    image: '🧹',
    description: 'مجموعة أدوات تنظيف متكاملة',
    available: true,
    deliveryTime: '20 دقيقة'
  },
  {
    id: '12',
    name: 'Vacuum Cleaner',
    nameAr: 'مكنسة كهربائية',
    category: 'appliances',
    price: 0,
    image: '🔌',
    description: 'مكنسة كهربائية للتنظيف السريع',
    available: true,
    deliveryTime: '30 دقيقة'
  },
  
  // الأجهزة
  {
    id: '13',
    name: 'Iron',
    nameAr: 'مكواة',
    category: 'appliances',
    price: 0,
    image: '🔌',
    description: 'مكواة ملابس مع طاولة كي',
    available: true,
    deliveryTime: '25 دقيقة'
  },
  
  // الصيانة
  {
    id: '14',
    name: 'Maintenance Request',
    nameAr: 'طلب صيانة',
    category: 'maintenance',
    price: 0,
    image: '🔧',
    description: 'طلب خدمة صيانة للغرفة',
    available: true,
    deliveryTime: '45 دقيقة'
  }
];

export default function RoomServicePage() {
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

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return ROOM_SERVICE_ITEMS;
    return ROOM_SERVICE_ITEMS.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addToCart = (item: RoomServiceItem) => {
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
    if (!guestData) return;
    
    const order = {
      id: `order-${Date.now()}`,
      guestData,
      items: cart,
      total: cartTotal,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      service: 'room-service'
    };

    try {
      const existingOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
      localStorage.setItem('guest_orders', JSON.stringify([...existingOrders, order]));

      const { addRequest } = await import('@/lib/firebase-data');
      
      const itemsDescription = cart.map(item => 
        `${item.nameAr} (${item.quantity}x)${item.price > 0 ? ' - ' + item.price * item.quantity + ' ريال' : ''}`
      ).join('\n');

      await addRequest({
        room: guestData.roomNumber,
        guest: guestData.name,
        phone: guestData.phone,
        type: 'خدمة الغرف',
        description: `الطلب:\n${itemsDescription}${cartTotal > 0 ? '\n\nالإجمالي: ' + cartTotal + ' ريال' : '\n\nخدمة مجانية'}`,
        priority: 'high',
        status: 'awaiting_employee_approval',
        notes: `طلب إلكتروني من المنيو - الخدمة: خدمة الغرف`,
        createdAt: new Date().toISOString()
      });

      alert('تم إرسال طلبك بنجاح! سيتم تلبيته قريباً.');
      setCart([]);
      setIsCheckoutOpen(false);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bedding': return <Bed className="h-4 w-4" />;
      case 'bathroom': return <Bath className="h-4 w-4" />;
      case 'cleaning': return <Sparkles className="h-4 w-4" />;
      case 'appliances': return <Wind className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  if (!guestData) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
      <div className="text-white text-xl">جاري التحميل...</div>
    </div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" />
      
      <motion.header 
        className="relative z-50 bg-black/20 backdrop-blur-2xl border-b border-blue-500/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/guest-menu')}
              className="text-white border-blue-400/50 hover:bg-blue-500/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              العودة للقائمة
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                خدمة الغرف
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm text-blue-300 mt-1">
                <User className="h-4 w-4" />
                <span>{guestData.name}</span>
                <span>•</span>
                <Home className="h-4 w-4" />
                <span>غرفة {guestData.roomNumber}</span>
              </div>
            </div>
            
            <Button
              onClick={() => setIsCheckoutOpen(true)}
              className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
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
            <Card className="bg-white/10 backdrop-blur-xl border-blue-400/20 sticky top-24">
              <CardHeader>
                <CardTitle className="text-blue-200 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  الفئات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'all', label: 'جميع الخدمات', icon: <Star className="h-4 w-4" /> },
                  { id: 'bedding', label: 'أدوات السرير', icon: <Bed className="h-4 w-4" /> },
                  { id: 'bathroom', label: 'أدوات الحمام', icon: <Bath className="h-4 w-4" /> },
                  { id: 'cleaning', label: 'أدوات التنظيف', icon: <Sparkles className="h-4 w-4" /> },
                  { id: 'appliances', label: 'الأجهزة', icon: <Wind className="h-4 w-4" /> },
                  { id: 'maintenance', label: 'الصيانة', icon: <Wrench className="h-4 w-4" /> }
                ].map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full justify-start text-right ${
                      selectedCategory === category.id ? 'bg-blue-500' : 'text-blue-200'
                    }`}
                  >
                    {category.icon}
                    <span className="mr-2">{category.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="bg-white/5 backdrop-blur-xl border-blue-400/20 hover:border-blue-400/40 transition-all">
                  <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 aspect-square flex items-center justify-center">
                    <div className="text-6xl">{item.image}</div>
                    {item.price > 0 && (
                      <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                        {item.price} ريال
                      </Badge>
                    )}
                    {item.price === 0 && (
                      <Badge className="absolute top-2 left-2 bg-blue-500 text-white">
                        مجاناً
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4 text-white">
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{item.nameAr}</h3>
                    <p className="text-white/60 text-xs mb-2 line-clamp-1">{item.name}</p>
                    <div className="flex items-center gap-1 mb-3">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-300 text-xs">{item.deliveryTime}</span>
                    </div>
                    <p className="text-white/80 text-xs mb-3 line-clamp-2">{item.description}</p>
                    
                    <Button
                      onClick={() => addToCart(item)}
                      disabled={!item.available}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm py-2"
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
        <DialogContent className="bg-black/90 backdrop-blur-2xl border-blue-400/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-200">سلة خدمة الغرف</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-blue-300">السلة فارغة</div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className="text-3xl">{item.image}</div>
                    <div className="flex-1">
                      <h4 className="text-blue-200 font-semibold">{item.nameAr}</h4>
                      <p className="text-blue-300 text-sm">
                        {item.price > 0 ? `${item.price} ريال` : 'مجاناً'} • {item.deliveryTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-500/20 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-200">الإجمالي:</span>
                    <span className="text-2xl font-bold text-green-400">
                      {cartTotal > 0 ? `${cartTotal} ريال` : 'خدمة مجانية'}
                    </span>
                  </div>
                  <div className="text-blue-300 text-sm">
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
