'use client';

import { useState } from 'react';
import { Shirt, ShoppingCart, X, Plus, Minus, Trash2, CreditCard, Wallet, UserCircle, CheckCircle, Search, Clock, Sparkles, Wind, Droplets, Star } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">خدمة المغسلة</h1>
              <p className="text-blue-200/70">نظام إدارة المغسلة والكوي</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Customer Type */}
            <Select value={customerType} onValueChange={(value: CustomerType) => setCustomerType(value)}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                <SelectItem value="guest" className="text-white focus:bg-white/10 focus:text-white">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    نزيل الفندق
                  </div>
                </SelectItem>
                <SelectItem value="staff" className="text-white focus:bg-white/10 focus:text-white">
                  <div className="flex items-center gap-2">
                    <Badge className="w-4 h-4" />
                    موظف
                  </div>
                </SelectItem>
                <SelectItem value="external" className="text-white focus:bg-white/10 focus:text-white">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    عميل خارجي
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Room Selection for Guests */}
            {customerType === 'guest' && (
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="اختر الغرفة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.number} className="text-white focus:bg-white/10 focus:text-white">
                      غرفة {room.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Cart */}
            <Button 
              onClick={() => setIsCheckoutOpen(true)}
              className="bg-green-600 hover:bg-green-700 relative"
              disabled={cart.length === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              السلة ({cart.length})
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-white/50" />
            <Input
              placeholder="البحث في خدمات المغسلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="اختر نوع الخدمة" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20">
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id} className="text-white focus:bg-white/10 focus:text-white">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredServices.map(service => (
            <Card key={service.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
              <CardContent className="p-4">
                <div className={`aspect-square bg-gradient-to-br ${getCategoryColor(service.category)} rounded-lg mb-3 flex items-center justify-center`}>
                  {getCategoryIcon(service.category)}
                </div>
                
                <h3 className="text-white font-semibold mb-1">{service.nameAr}</h3>
                <p className="text-white/60 text-sm mb-2">{service.name}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-300 text-xs">{service.duration}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 font-bold">{service.price} ر.س</span>
                  <Button
                    onClick={() => addToCart(service)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={customerType === 'guest' && !selectedRoom}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checkout Dialog */}
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="bg-slate-900 border-white/20 text-white max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shirt className="w-5 h-5" />
                تأكيد طلب المغسلة
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.roomNumber}-${index}`} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.nameAr}</h4>
                    <p className="text-white/60 text-sm">{item.price} ر.س</p>
                    {item.roomNumber && (
                      <p className="text-blue-300 text-xs">غرفة {item.roomNumber}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-300 text-xs">{item.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.roomNumber, item.quantity - 1)}
                      className="w-8 h-8 p-0 bg-white/10 border-white/20 text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <span className="w-8 text-center">{item.quantity}</span>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.roomNumber, item.quantity + 1)}
                      className="w-8 h-8 p-0 bg-white/10 border-white/20 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.roomNumber, 0)}
                      className="w-8 h-8 p-0 bg-red-600/20 border-red-400/20 text-red-400 hover:bg-red-600/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div className="border-t border-white/20 pt-4 space-y-2">
                <div className="flex justify-between text-white/80">
                  <span>المجموع الفرعي:</span>
                  <span>{subtotal.toFixed(2)} ر.س</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>خصم الموظفين ({(getDiscount() * 100).toFixed(0)}%):</span>
                    <span>-{discount.toFixed(2)} ر.س</span>
                  </div>
                )}
                
                <div className="flex justify-between text-xl font-bold text-white border-t border-white/20 pt-2">
                  <span>المجموع:</span>
                  <span>{total.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCheckoutOpen(false)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              
              <Button
                onClick={handleCheckout}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                تأكيد الطلب
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}