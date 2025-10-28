'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, ArrowLeft, Star, Plus, ShoppingCart, 
  CreditCard, Clock, Crown, Timer,
  Flame, Snowflake, Cookie, Croissant, ChefHat, User, Phone, Home, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// نفس الأنواع من صفحة الكوفي شوب للموظفين
interface CoffeeItem {
  id: string;
  name: string;
  nameAr: string;
  category: 'hot-coffee' | 'cold-coffee' | 'tea' | 'dessert' | 'pastry';
  price: number;
  image: string;
  description: string;
  rating: number;
  preparationTime: number;
  available: boolean;
  featured?: boolean;
  calories?: number;
  ingredients: string[];
}

interface CartItem extends CoffeeItem {
  quantity: number;
}

interface GuestData {
  name: string;
  phone: string;
  roomNumber: string;
}

// نفس قائمة القهوة من صفحة الموظفين
const COFFEE_MENU: CoffeeItem[] = [
  {
    id: '1',
    name: 'Signature Espresso',
    nameAr: 'إسبريسو مميز',
    category: 'hot-coffee',
    price: 18,
    image: '☕',
    description: 'قهوة إسبريسو إيطالية أصيلة محضرة من أجود حبوب القهوة',
    rating: 4.8,
    preparationTime: 3,
    available: true,
    featured: true,
    calories: 10,
    ingredients: ['حبوب قهوة عربية', 'ماء منقى']
  },
  {
    id: '2',
    name: 'Caramel Macchiato',
    nameAr: 'كاراميل ماكياتو',
    category: 'hot-coffee',
    price: 28,
    image: '🍮',
    description: 'مزيج ساحر من الإسبريسو والحليب المبخر مع صوص الكاراميل',
    rating: 4.9,
    preparationTime: 5,
    available: true,
    featured: true,
    calories: 240,
    ingredients: ['إسبريسو', 'حليب', 'صوص كاراميل', 'فانيليا']
  },
  {
    id: '3',
    name: 'Iced Vanilla Latte',
    nameAr: 'لاتيه فانيليا مثلج',
    category: 'cold-coffee',
    price: 25,
    image: '🧊',
    description: 'لاتيه منعش مع نكهة الفانيليا الطبيعية وكثير من الثلج',
    rating: 4.7,
    preparationTime: 4,
    available: true,
    calories: 190,
    ingredients: ['إسبريسو', 'حليب بارد', 'فانيليا', 'ثلج', 'شراب فانيليا']
  },
  {
    id: '4',
    name: 'Earl Grey Tea',
    nameAr: 'شاي إيرل جراي',
    category: 'tea',
    price: 15,
    image: '🫖',
    description: 'شاي أسود فاخر بنكهة البرغموت الطبيعية',
    rating: 4.5,
    preparationTime: 4,
    available: true,
    calories: 5,
    ingredients: ['شاي أسود', 'برغموت', 'ماء ساخن']
  },
  {
    id: '5',
    name: 'Chocolate Croissant',
    nameAr: 'كرواسان شوكولاتة',
    category: 'pastry',
    price: 22,
    image: '🥐',
    description: 'كرواسان فرنسي طازج محشو بالشوكولاتة الداكنة الفاخرة',
    rating: 4.6,
    preparationTime: 2,
    available: true,
    calories: 340,
    ingredients: ['دقيق فرنسي', 'زبدة', 'شوكولاتة داكنة', 'بيض']
  },
  {
    id: '6',
    name: 'Tiramisu Slice',
    nameAr: 'قطعة تيراميسو',
    category: 'dessert',
    price: 32,
    image: '🍰',
    description: 'تيراميسو إيطالي أصيل بطعم القهوة والمسكربون',
    rating: 4.9,
    preparationTime: 1,
    available: true,
    featured: true,
    calories: 450,
    ingredients: ['مسكاربون', 'قهوة', 'كاكاو', 'بسكويت سافوياردي', 'مارسالا']
  }
];

export default function GuestCoffeeShopPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [guestData, setGuestData] = useState<GuestData | null>(null);

  // التحقق من بيانات النزيل
  React.useEffect(() => {
    const savedGuestData = localStorage.getItem('guest_session');
    if (!savedGuestData) {
      router.push('/guest-login');
      return;
    }
    setGuestData(JSON.parse(savedGuestData));
  }, [router]);

  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'all') return COFFEE_MENU;
    return COFFEE_MENU.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addToCart = (item: CoffeeItem) => {
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

  const handleCheckout = () => {
    if (!guestData) return;
    
    const order = {
      id: `order-${Date.now()}`,
      guestData,
      items: cart,
      total: cartTotal,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      service: 'coffee-shop'
    };

    // حفظ الطلب
    const existingOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
    localStorage.setItem('guest_orders', JSON.stringify([...existingOrders, order]));

    alert('تم إرسال طلبك بنجاح! سيتم تحضيره قريباً.');
    setCart([]);
    setIsCheckoutOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hot-coffee': return <Flame className="h-5 w-5" />;
      case 'cold-coffee': return <Snowflake className="h-5 w-5" />;
      case 'tea': return <Coffee className="h-5 w-5" />;
      case 'dessert': return <Cookie className="h-5 w-5" />;
      case 'pastry': return <Croissant className="h-5 w-5" />;
      default: return <Coffee className="h-5 w-5" />;
    }
  };

  if (!guestData) {
    return <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900 flex items-center justify-center">
      <div className="text-white text-xl">جاري التحميل...</div>
    </div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-orange-500/20" />

      {/* Header */}
      <motion.header 
        className="relative z-50 bg-black/20 backdrop-blur-2xl border-b border-amber-500/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/guest-menu')}
              className="text-white border-amber-400/50 hover:bg-amber-500/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              العودة للقائمة
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-200 bg-clip-text text-transparent">
                كوفي شوب بريميوم
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm text-amber-300 mt-1">
                <User className="h-4 w-4" />
                <span>{guestData.name}</span>
                <span>•</span>
                <Home className="h-4 w-4" />
                <span>غرفة {guestData.roomNumber}</span>
              </div>
            </div>
            
            <Button
              onClick={() => setIsCheckoutOpen(true)}
              className="relative bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              السلة
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-xl border-amber-400/20 shadow-2xl sticky top-24">
              <CardHeader>
                <CardTitle className="text-amber-200">الفئات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'all', label: 'جميع المنتجات' },
                  { id: 'hot-coffee', label: 'قهوة ساخنة' },
                  { id: 'cold-coffee', label: 'قهوة مثلجة' },
                  { id: 'tea', label: 'شاي وأعشاب' },
                  { id: 'dessert', label: 'حلويات' },
                  { id: 'pastry', label: 'معجنات' }
                ].map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full justify-start text-right ${
                      selectedCategory === category.id
                        ? 'bg-amber-500 text-white'
                        : 'text-amber-200 hover:bg-amber-500/20'
                    }`}
                  >
                    {category.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Menu Grid */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMenu.map((item) => (
                <Card key={item.id} className="bg-white/5 backdrop-blur-xl border-amber-400/20 hover:border-amber-400/40 transition-all">
                  <div className="relative h-48 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 flex items-center justify-center">
                    <div className="text-6xl">{item.image}</div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 text-white font-bold">{item.price} ريال</Badge>
                    </div>
                    {item.featured && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-purple-500 text-white"><Crown className="h-3 w-3 mr-1" />مميز</Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6 text-white">
                    <h3 className="text-xl font-bold text-amber-200 mb-2">{item.nameAr}</h3>
                    <p className="text-amber-300/80 text-sm mb-3">{item.name}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 text-sm">{item.preparationTime} دقيقة</span>
                    </div>
                    <p className="text-amber-100/90 text-sm mb-4">{item.description}</p>
                    
                    <Button
                      onClick={() => addToCart(item)}
                      disabled={!item.available}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      إضافة للسلة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-2xl border-amber-400/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-amber-200">سلة التسوق</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-amber-300">السلة فارغة</div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className="text-3xl">{item.image}</div>
                    <div className="flex-1">
                      <h4 className="text-amber-200 font-semibold">{item.nameAr}</h4>
                      <p className="text-amber-300 text-sm">{item.price} ريال</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    </div>
                  </div>
                ))}

                <div className="bg-amber-500/20 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-amber-200">المجموع:</span>
                    <span className="text-2xl font-bold text-green-400">{cartTotal} ريال</span>
                  </div>
                  <div className="text-amber-300 text-sm">
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
