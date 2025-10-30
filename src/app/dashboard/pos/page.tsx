'use client';

import { useEffect, useMemo, useState } from 'react';
import { Coffee, Utensils, Shirt, Home, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, Banknote, Receipt } from 'lucide-react';
import useGuestOrders, { GuestOrder } from '@/hooks/useGuestOrders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { playNotificationSound } from '@/lib/notification-sounds';

type ServiceType = 'room-service' | 'coffee-shop' | 'restaurant' | 'laundry';

type MenuItem = {
  id: string;
  name: string;
  nameAr: string;
  service: ServiceType;
  price: number;
  image?: string;
  description?: string;
  available: boolean;
};

type CartItem = {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  quantity: number;
};

const MENU_ITEMS: MenuItem[] = [
  // Room Service
  { id: '1', name: 'Beef Burger & Fries', nameAr: 'برجر بقري مع بطاطس', service: 'room-service', price: 45, available: true },
  { id: '2', name: 'Herb Crusted Salmon', nameAr: 'طبق أرز بالروبيان', service: 'room-service', price: 65, available: true },
  { id: '3', name: 'Grilled Beef Steak', nameAr: 'ستيك لحم بقري', service: 'room-service', price: 75, available: true },
  { id: '4', name: 'Oxtail Soup', nameAr: 'شوربة ذيل الثور', service: 'room-service', price: 35, available: true },
  { id: '5', name: 'Beef Meatballs', nameAr: 'كرات اللحم', service: 'room-service', price: 40, available: true },
  { id: '6', name: 'Grilled Lamb', nameAr: 'لحم مشوي', service: 'room-service', price: 55, available: true },
  
  // Coffee Shop
  { id: '7', name: 'Espresso', nameAr: 'إسبريسو', service: 'coffee-shop', price: 15, available: true },
  { id: '8', name: 'Cappuccino', nameAr: 'كابتشينو', service: 'coffee-shop', price: 20, available: true },
  { id: '9', name: 'Latte', nameAr: 'لاتيه', service: 'coffee-shop', price: 22, available: true },
  { id: '10', name: 'Americano', nameAr: 'أمريكانو', service: 'coffee-shop', price: 18, available: true },
  { id: '11', name: 'Mocha', nameAr: 'موكا', service: 'coffee-shop', price: 25, available: true },
  { id: '12', name: 'Croissant', nameAr: 'كرواسان', service: 'coffee-shop', price: 12, available: true },
  
  // Restaurant
  { id: '13', name: 'Creamy Pasta', nameAr: 'باستا', service: 'restaurant', price: 42, available: true },
  { id: '14', name: 'Penne Pasta', nameAr: 'بيني باستا', service: 'restaurant', price: 38, available: true },
  { id: '15', name: 'Grilled Chicken', nameAr: 'دجاج مار مشوي', service: 'restaurant', price: 48, available: true },
  { id: '16', name: 'Caesar Salad', nameAr: 'سلطة سيزر', service: 'restaurant', price: 28, available: true },
  { id: '17', name: 'Margherita Pizza', nameAr: 'بيتزا مارغريتا', service: 'restaurant', price: 52, available: true },
  { id: '18', name: 'Seafood Platter', nameAr: 'طبق مأكولات بحرية', service: 'restaurant', price: 85, available: true },
  
  // Laundry
  { id: '19', name: 'Shirt Washing', nameAr: 'غسيل قميص', service: 'laundry', price: 8, available: true },
  { id: '20', name: 'Pants Cleaning', nameAr: 'تنظيف بنطال', service: 'laundry', price: 12, available: true },
  { id: '21', name: 'Dress Cleaning', nameAr: 'تنظيف فستان', service: 'laundry', price: 15, available: true },
  { id: '22', name: 'Suit Cleaning', nameAr: 'تنظيف بدلة', service: 'laundry', price: 25, available: true },
];

const SERVICES = [
  { id: 'room-service', name: 'خدمة الغرف', nameEn: 'Room Service', icon: Home, color: 'from-blue-500 to-blue-600' },
  { id: 'coffee-shop', name: 'الكوفي شوب', nameEn: 'Coffee Shop', icon: Coffee, color: 'from-amber-500 to-orange-500' },
  { id: 'restaurant', name: 'المطعم', nameEn: 'Restaurant', icon: Utensils, color: 'from-green-500 to-emerald-500' },
  { id: 'laundry', name: 'المغسلة', nameEn: 'Laundry', icon: Shirt, color: 'from-purple-500 to-violet-500' }
];

export default function POSPage() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'room_charge'>('room_charge');
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const { 
    orders: guestOrders, 
    updateOrderStatus: updateGuestOrderStatus,
    getOrdersByService,
  } = useGuestOrders();

  const filteredItems = useMemo(() => {
    if (!selectedService) return [];
    return MENU_ITEMS.filter(item => item.service === selectedService && item.available);
  }, [selectedService]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, {
          id: item.id,
          name: item.name,
          nameAr: item.nameAr,
          price: item.price,
          quantity: 1
        }];
      }
    });
    playNotificationSound('general');
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCart(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const processOrder = () => {
    if (cart.length === 0) return;
    
    // Here you would typically send the order to your backend
    console.log('Processing order:', {
      items: cart,
      customer: customerName,
      room: roomNumber,
      payment: paymentMethod,
      total: cartTotal,
      service: selectedService
    });

    // Clear the cart and form
    clearCart();
    setCustomerName('');
    setRoomNumber('');
    setOrderDialogOpen(false);
    playNotificationSound('approval');
  };

  const currentService = SERVICES.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">نظام نقاط البيع</h1>
              <p className="text-sm text-gray-600">Point of Sale System</p>
            </div>
            <div className="flex items-center gap-4">
              {cart.length > 0 && (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                  إجمالي السلة: {cartTotal} ر.س
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Services & Menu */}
        <div className="flex-1 flex flex-col">
          {!selectedService ? (
            // Service Selection
            <div className="flex-1 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">اختر الخدمة</h2>
              <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                {SERVICES.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <Card
                      key={service.id}
                      className={`cursor-pointer hover:scale-105 transition-all duration-200 border-0 bg-gradient-to-br ${service.color} text-white h-40`}
                      onClick={() => setSelectedService(service.id as ServiceType)}
                    >
                      <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                        <IconComponent className="h-12 w-12 mb-4" />
                        <h3 className="text-xl font-bold mb-1">{service.name}</h3>
                        <p className="text-white/80 text-sm">{service.nameEn}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            // Menu Items
            <div className="flex-1 flex flex-col">
              {/* Service Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedService(null)}
                      className="text-gray-600"
                    >
                      ← العودة
                    </Button>
                    <div className="flex items-center gap-3">
                      {currentService && (
                        <>
                          <currentService.icon className="h-6 w-6 text-gray-700" />
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">{currentService.name}</h2>
                            <p className="text-sm text-gray-600">{currentService.nameEn}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Grid */}
              <div className="flex-1 p-6 bg-gray-50">
                <div className="grid grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border border-gray-200 overflow-hidden"
                      onClick={() => addToCart(item)}
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
                        {/* Placeholder image */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                          <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                          </div>
                        </div>
                        {/* Price Badge */}
                        <div className="absolute top-3 left-3">
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                            ${item.price}
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-tight">
                          {item.nameAr}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{item.name}</p>
                        <div className="text-center">
                          <span className="text-lg font-bold text-gray-900">{item.price} ر.س</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Cart & Orders */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Cart Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                السلة ({cart.length})
              </h3>
              {cart.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCart}>
                  مسح الكل
                </Button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">السلة فارغة</p>
                <p className="text-sm text-gray-400">اختر عناصر من القائمة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.nameAr}</h4>
                        <p className="text-xs text-gray-500">{item.name}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartQuantity(item.id, 0)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-bold text-sm">{item.price * item.quantity} ر.س</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="mb-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>الإجمالي:</span>
                  <span>{cartTotal} ر.س</span>
                </div>
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setOrderDialogOpen(true)}
              >
                <Receipt className="h-4 w-4 mr-2" />
                إتمام الطلب
              </Button>
            </div>
          )}

          {/* Recent Orders */}
          <div className="border-t border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">طلبات النزلاء الحديثة</h4>
            <div className="space-y-2 max-h-40 overflow-auto">
              {getOrdersByService(selectedService || 'coffee').slice(0, 3).map((order: GuestOrder) => (
                <div key={order.id} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">{order.guestData.name}</span>
                    <Badge className="text-xs">
                      {order.status === 'pending' ? 'معلق' : 'قيد التحضير'}
                    </Badge>
                  </div>
                  <p className="text-gray-500">غرفة {order.guestData.roomNumber}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle>تأكيد الطلب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">اسم العميل</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="اسم العميل"
                className="border-gray-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">رقم الغرفة (اختياري)</label>
              <Input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="رقم الغرفة"
                className="border-gray-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">طريقة الدفع</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className="text-xs"
                >
                  <Banknote className="h-3 w-3 mr-1" />
                  نقداً
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="text-xs"
                >
                  <CreditCard className="h-3 w-3 mr-1" />
                  بطاقة
                </Button>
                <Button
                  variant={paymentMethod === 'room_charge' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('room_charge')}
                  className="text-xs"
                >
                  <Home className="h-3 w-3 mr-1" />
                  الغرفة
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between font-bold">
                <span>الإجمالي:</span>
                <span>{cartTotal} ر.س</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={processOrder}
              disabled={!customerName.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              تأكيد الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}