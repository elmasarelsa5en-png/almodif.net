'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, ArrowLeft, Star, Plus, ShoppingCart, 
  CreditCard, Clock, Crown, Timer,
  Flame, Snowflake, Cookie, Croissant, ChefHat, User, Phone, Home, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RestaurantItem {
  id: string;
  name: string;
  nameAr: string;
  category: 'appetizers' | 'main-courses' | 'grilled' | 'seafood' | 'desserts' | 'beverages';
  price: number;
  image: string;
  description: string;
  rating: number;
  preparationTime: number;
  available: boolean;
  featured?: boolean;
  calories?: number;
  ingredients: string[];
  spicy?: boolean;
  vegetarian?: boolean;
}

interface CartItem extends RestaurantItem {
  quantity: number;
}

interface GuestData {
  name: string;
  phone: string;
  roomNumber: string;
}

const RESTAURANT_MENU: RestaurantItem[] = [
  {
    id: '1',
    name: 'Grilled Salmon',
    nameAr: 'سلمون مشوي',
    category: 'seafood',
    price: 85,
    image: '🐟',
    description: 'سلمون طازج مشوي مع توابل البحر الأبيض المتوسط وخضار مشوية',
    rating: 4.9,
    preparationTime: 15,
    available: true,
    featured: true,
    calories: 320,
    ingredients: ['سلمون طازج', 'زيت زيتون', 'ليمون', 'توابل بحر متوسط', 'خضار مشوية']
  },
  {
    id: '2',
    name: 'Beef Steak',
    nameAr: 'ستيك لحم',
    category: 'grilled',
    price: 120,
    image: '🥩',
    description: 'ستيك لحم بقري طري مشوي على درجة النضج المثالية مع صلصة الخردل',
    rating: 4.8,
    preparationTime: 20,
    available: true,
    featured: true,
    calories: 450,
    ingredients: ['لحم بقري', 'ملح البحر', 'فلفل أسود', 'زيت زيتون', 'ثوم']
  },
  {
    id: '3',
    name: 'Chicken Shawarma',
    nameAr: 'شاورما دجاج',
    category: 'main-courses',
    price: 45,
    image: '🍗',
    description: 'دجاج مشوي بالتوابل الشرقية مع خبز عربي طازج وسلطة',
    rating: 4.7,
    preparationTime: 12,
    available: true,
    calories: 380,
    ingredients: ['دجاج طازج', 'توابل شاورما', 'خبز عربي', 'طحينة', 'خضار طازجة']
  },
  {
    id: '4',
    name: 'Caesar Salad',
    nameAr: 'سلطة سيزر',
    category: 'appetizers',
    price: 35,
    image: '🥗',
    description: 'سلطة سيزر كلاسيكية مع صلصة السيزر الحقيقية وخبز محمص',
    rating: 4.6,
    preparationTime: 8,
    available: true,
    vegetarian: true,
    calories: 280,
    ingredients: ['خس روماني', 'خبز محمص', 'جبن بارميزان', 'صلصة سيزر', 'دجاج مشوي']
  },
  {
    id: '5',
    name: 'Chocolate Lava Cake',
    nameAr: 'كعكة لافا شوكولاتة',
    category: 'desserts',
    price: 28,
    image: '🍫',
    description: 'كعكة شوكولاتة دافئة مع قلب شوكولاتة سائل وآيس كريم فانيليا',
    rating: 4.9,
    preparationTime: 10,
    available: true,
    featured: true,
    calories: 420,
    ingredients: ['شوكولاتة داكنة', 'زبدة', 'بيض', 'سكر', 'آيس كريم فانيليا']
  },
  {
    id: '6',
    name: 'Fresh Orange Juice',
    nameAr: 'عصير برتقال طازج',
    category: 'beverages',
    price: 15,
    image: '🍊',
    description: 'عصير برتقال طازج 100% بدون إضافات أو مواد حافظة',
    rating: 4.5,
    preparationTime: 3,
    available: true,
    calories: 110,
    ingredients: ['برتقال طازج', 'ماء']
  }
];

export default function GuestRestaurantPage() {
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

  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'all') return RESTAURANT_MENU;
    return RESTAURANT_MENU.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addToCart = (item: RestaurantItem) => {
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
      service: 'restaurant'
    };

    try {
      const existingOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
      localStorage.setItem('guest_orders', JSON.stringify([...existingOrders, order]));

      const { addRequest } = await import('@/lib/firebase-data');
      
      const itemsDescription = cart.map(item => 
        `${item.nameAr} (${item.quantity}x) - ${item.price * item.quantity} ريال`
      ).join('\n');

      await addRequest({
        room: guestData.roomNumber,
        guest: guestData.name,
        phone: guestData.phone,
        type: 'طلب من المطعم',
        description: `الطلب:\n${itemsDescription}\n\nالإجمالي: ${cartTotal} ريال`,
        priority: 'medium',
        status: 'awaiting_employee_approval',
        notes: `طلب إلكتروني من المنيو - الخدمة: مطعم`,
        createdAt: new Date().toISOString()
      });

      alert('تم إرسال طلبك بنجاح! سيتم تحضيره قريباً.');
      setCart([]);
      setIsCheckoutOpen(false);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
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
                مطعم فاخر
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
              className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white"
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
            <Card className="bg-white/10 backdrop-blur-xl border-amber-400/20">
              <CardHeader>
                <CardTitle className="text-amber-200">الفئات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'all', label: 'جميع الأطباق' },
                  { id: 'appetizers', label: 'المقبلات' },
                  { id: 'main-courses', label: 'الأطباق الرئيسية' },
                  { id: 'grilled', label: 'المشويات' },
                  { id: 'seafood', label: 'المأكولات البحرية' },
                  { id: 'desserts', label: 'الحلويات' },
                  { id: 'beverages', label: 'المشروبات' }
                ].map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-right ${
                      selectedCategory === category.id ? 'bg-amber-500' : 'text-amber-200'
                    }`}
                  >
                    {category.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMenu.map((item) => (
                <Card key={item.id} className="bg-white/5 backdrop-blur-xl border-amber-400/20">
                  <div className="relative h-48 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 flex items-center justify-center">
                    <div className="text-6xl">{item.image}</div>
                    <Badge className="absolute top-4 left-4 bg-green-500">{item.price} ريال</Badge>
                    {item.featured && (
                      <Badge className="absolute top-4 right-4 bg-purple-500"><Crown className="h-3 w-3 mr-1" />مميز</Badge>
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
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
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
