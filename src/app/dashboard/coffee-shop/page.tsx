'use client';

import { useEffect, useMemo, useState } from 'react';
import { Coffee, Edit2, Minus, Plus, Trash2, CheckCircle, Send, Users, Clock, Phone, Home } from 'lucide-react';
import useGuestOrders, { GuestOrder } from '@/hooks/useGuestOrders';
import { getRoomsFromStorage } from '@/lib/rooms-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { playNotificationSound } from '@/lib/notification-sounds';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

type MenuItem = {
  id: string;
  name: string;
  nameAr: string;
  category: 'coffee' | 'tea' | 'pastry' | 'dessert';
  price: number;
  available: boolean;
  preparationTime: number;
};

type OrderItem = {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
};

type CoffeeOrder = {
  id: string;
  roomNumber: string;
  guestName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  paymentMethod: 'room_charge' | 'cash' | 'card';
  sentToReception?: boolean;
  receptionRequestId?: string;
};

interface OrderFormState {
  customerType: 'internal' | 'external';
  roomNumber: string;
  guestName: string;
  items: Record<string, number>;
  paymentMethod: 'room_charge' | 'cash' | 'card';
}

interface MenuFormState {
  id: string;
  name: string;
  nameAr: string;
  category: MenuItem['category'];
  price: number;
  preparationTime: number;
  available: boolean;
}

const STORAGE_MENU_KEY = 'coffee_menu';
const STORAGE_ORDERS_KEY = 'coffee_orders';

const initialOrderForm: OrderFormState = {
  customerType: 'internal',
  roomNumber: '',
  guestName: '',
  items: {},
  paymentMethod: 'room_charge'
};

const initialMenuForm: MenuFormState = {
  id: '',
  name: '',
  nameAr: '',
  category: 'coffee',
  price: 14,
  preparationTime: 4,
  available: true
};

const DEFAULT_MENU: MenuItem[] = [
  { id: 'espresso', name: 'Espresso', nameAr: 'إسبريسو', category: 'coffee', price: 9, available: true, preparationTime: 2 },
  { id: 'flat-white', name: 'Flat White', nameAr: 'فلات وايت', category: 'coffee', price: 15, available: true, preparationTime: 4 },
  { id: 'spanish-latte', name: 'Spanish Latte', nameAr: 'سبانش لاتيه', category: 'coffee', price: 17, available: true, preparationTime: 5 },
  { id: 'matcha-latte', name: 'Matcha Latte', nameAr: 'ماتشا لاتيه', category: 'tea', price: 16, available: true, preparationTime: 4 },
  { id: 'butter-croissant', name: 'Butter Croissant', nameAr: 'كرواسان زبدة', category: 'pastry', price: 8, available: true, preparationTime: 1 },
  { id: 'cheesecake', name: 'Cheesecake', nameAr: 'تشيز كيك', category: 'dessert', price: 19, available: true, preparationTime: 2 }
];

const ORDER_STATUSES: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'معلق' },
  { value: 'preparing', label: 'قيد التحضير' },
  { value: 'ready', label: 'جاهز' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'cancelled', label: 'ملغي' }
];

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'معلق', color: 'bg-amber-500/20 text-amber-300' },
  preparing: { label: 'قيد التحضير', color: 'bg-blue-500/20 text-blue-200' },
  ready: { label: 'جاهز', color: 'bg-emerald-500/20 text-emerald-200' },
  delivered: { label: 'تم التسليم', color: 'bg-slate-500/20 text-slate-200' },
  cancelled: { label: 'ملغي', color: 'bg-rose-500/20 text-rose-200' }
};

const categoryDictionary: Record<MenuItem['category'], string> = {
  coffee: 'قهوة',
  tea: 'شاي',
  pastry: 'مخبوزات',
  dessert: 'حلويات'
};

const formatCurrency = (value: number) => `${value} ر.س`;
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setState(JSON.parse(stored));
    } catch (e) {
      console.error(`Storage error: ${key}`, e);
    }
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(`Storage error: ${key}`, e);
    }
  }, [key, state]);

  return [state, setState] as const;
}

export default function CoffeeShopPage() {
  const [menu, setMenu] = useLocalStorage<MenuItem[]>(STORAGE_MENU_KEY, DEFAULT_MENU);
  const [orders, setOrders] = useLocalStorage<CoffeeOrder[]>(STORAGE_ORDERS_KEY, []);
  const [occupiedRooms, setOccupiedRooms] = useState<Array<{ number: string; guestName?: string }>>([]);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderFormState>(initialOrderForm);
  const [menuForm, setMenuForm] = useState<MenuFormState>(initialMenuForm);
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  
  // طلبات النزلاء
  const { 
    orders: guestOrders, 
    updateOrderStatus: updateGuestOrderStatus,
    getOrdersByService,
    refreshOrders
  } = useGuestOrders();

  useEffect(() => {
    setOccupiedRooms(getRoomsFromStorage());
  }, []);

  const activeOrders = useMemo(() => {
    return orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (orderFilter !== 'all') {
      filtered = filtered.filter(order => order.status === orderFilter);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(order => 
        order.guestName.toLowerCase().includes(term) ||
        order.roomNumber.includes(term) ||
        order.id.toLowerCase().includes(term)
      );
    }
    return filtered.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, orderFilter, search]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = { ...order, status: newStatus };
        if (newStatus === 'ready') {
          playNotificationSound('order-ready');
        }
        return updated;
      }
      return order;
    }));
  };

  const sendToReception = (order: CoffeeOrder) => {
    // Create reception request
    const receptionData = {
      id: uid(),
      type: 'coffee_order',
      details: {
        orderId: order.id,
        roomNumber: order.roomNumber,
        guestName: order.guestName,
        items: order.items,
        totalAmount: order.totalAmount,
        requestedBy: 'coffee_shop'
      },
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Save to reception requests
    try {
      const existing = JSON.parse(localStorage.getItem('reception_requests') || '[]');
      existing.push(receptionData);
      localStorage.setItem('reception_requests', JSON.stringify(existing));
      
      // Mark order as sent to reception
      setOrders(prev => prev.map(o => 
        o.id === order.id ? { ...o, sentToReception: true, receptionRequestId: receptionData.id } : o
      ));

      playNotificationSound('notification');
    } catch (error) {
      console.error('Error sending to reception:', error);
    }
  };

  const openOrderModal = (order?: CoffeeOrder) => {
    if (order) {
      setEditingOrderId(order.id);
      const items: Record<string, number> = {};
      order.items.forEach(item => {
        items[item.menuItemId] = item.quantity;
      });
      setOrderForm({
        customerType: order.roomNumber ? 'internal' : 'external',
        roomNumber: order.roomNumber || '',
        guestName: order.guestName,
        items,
        paymentMethod: order.paymentMethod
      });
    } else {
      setEditingOrderId(null);
      setOrderForm(initialOrderForm);
    }
    setOrderDialogOpen(true);
  };

  const openMenuModal = (item?: MenuItem) => {
    if (item) {
      setEditingMenuId(item.id);
      setMenuForm({ ...item });
    } else {
      setEditingMenuId(null);
      setMenuForm(initialMenuForm);
    }
    setMenuDialogOpen(true);
  };

  const handleSaveOrder = () => {
    const selectedItems = Object.entries(orderForm.items)
      .filter(([, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => {
        const menuItem = menu.find(m => m.id === itemId);
        if (!menuItem) throw new Error(`Menu item not found: ${itemId}`);
        return {
          menuItemId: itemId,
          menuItemName: menuItem.nameAr,
          quantity,
          price: menuItem.price
        };
      });

    if (selectedItems.length === 0) {
      alert('يرجى اختيار عنصر واحد على الأقل');
      return;
    }

    const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderData: CoffeeOrder = {
      id: editingOrderId || uid(),
      roomNumber: orderForm.customerType === 'internal' ? orderForm.roomNumber : '',
      guestName: orderForm.guestName,
      items: selectedItems,
      totalAmount,
      status: 'pending',
      orderDate: new Date().toISOString(),
      paymentMethod: orderForm.paymentMethod
    };

    if (editingOrderId) {
      setOrders(prev => prev.map(o => o.id === editingOrderId ? orderData : o));
    } else {
      setOrders(prev => [orderData, ...prev]);
      playNotificationSound('new-order');
    }

    setOrderDialogOpen(false);
    setOrderForm(initialOrderForm);
    setEditingOrderId(null);
  };

  const handleSaveMenuItem = () => {
    if (!menuForm.nameAr.trim() || !menuForm.name.trim()) {
      alert('يرجى إدخال اسم العنصر');
      return;
    }

    const itemData: MenuItem = {
      ...menuForm,
      id: editingMenuId || uid()
    };

    if (editingMenuId) {
      setMenu(prev => prev.map(item => item.id === editingMenuId ? itemData : item));
    } else {
      setMenu(prev => [itemData, ...prev]);
    }

    setMenuDialogOpen(false);
    setMenuForm(initialMenuForm);
    setEditingMenuId(null);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const handleDeleteMenuItem = (itemId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      setMenu(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const toggleItemAvailability = (itemId: string) => {
    setMenu(prev => prev.map(item => 
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
  };

  const updateItemQuantity = (itemId: string, delta: number) => {
    const currentQty = orderForm.items[itemId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    setOrderForm(prev => ({
      ...prev,
      items: { ...prev.items, [itemId]: newQty }
    }));
  };

  const getTotalOrderValue = () => {
    return Object.entries(orderForm.items).reduce((sum, [itemId, quantity]) => {
      const item = menu.find(m => m.id === itemId);
      return sum + (item ? item.price * quantity : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Menu Section */}
            <Card className="border-slate-800 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-white">القائمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {menu.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">لا توجد عناصر</p>
                ) : (
                  <div className="space-y-3">
                    {menu.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/50">
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm sm:text-base">{item.nameAr}</p>
                          <div className="flex gap-2 mt-1 text-xs text-slate-400">
                            <span>{formatCurrency(item.price)}</span>
                            <span>{item.preparationTime} دقيقة</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Switch 
                            checked={item.available} 
                            onCheckedChange={() => toggleItemAvailability(item.id)}
                            size="sm"
                          />
                          <Button size="sm" variant="ghost" onClick={() => openMenuModal(item)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteMenuItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* طلبات النزلاء فقط */}
            <Card className="border-slate-800 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  طلبات النزلاء ({getOrdersByService('coffee').length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {getOrdersByService('coffee').length === 0 ? (
                  <p className="text-slate-400 text-center py-4">لا توجد طلبات من النزلاء</p>
                ) : (
                  getOrdersByService('coffee')
                    .filter(order => order.status !== 'delivered')
                    .map((order: GuestOrder) => (
                      <div key={order.id} className="p-4 rounded-lg border border-slate-800 bg-slate-950/50 hover:border-slate-700 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <p className="font-semibold text-white text-sm">{order.guestData.name}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Home className="h-3 w-3" />
                                غرفة {order.guestData.roomNumber}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {order.guestData.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(order.createdAt).toLocaleTimeString('ar-SA', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                          <Badge className={
                            order.status === 'pending' ? 'bg-yellow-600 text-white' :
                            order.status === 'preparing' ? 'bg-blue-600 text-white' :
                            order.status === 'ready' ? 'bg-green-600 text-white' :
                            order.status === 'cancelled' ? 'bg-red-600 text-white' :
                            'bg-gray-600 text-white'
                          }>
                            {order.status === 'pending' ? 'معلق' :
                             order.status === 'preparing' ? 'قيد التحضير' :
                             order.status === 'ready' ? 'جاهز' :
                             order.status === 'cancelled' ? 'ملغي' : 'تم التسليم'}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-white mb-1">الطلبات:</p>
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="text-xs text-slate-300 flex justify-between">
                                <span>{item.name} x{item.quantity}</span>
                                <span>{item.price} جنيه</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-green-400">
                            المجموع: {order.items.reduce((total, item) => total + (item.price * item.quantity), 0)} جنيه
                          </p>
                          {order.notes && (
                            <p className="text-xs text-slate-400">ملاحظات: {order.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateGuestOrderStatus(order.id, 
                              order.status === 'pending' ? 'preparing' :
                              order.status === 'preparing' ? 'ready' :
                              order.status === 'ready' ? 'delivered' : order.status
                            )}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                          >
                            تحديث
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Orders List */}
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/40 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">الإجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => openOrderModal()} 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  طلب جديد
                </Button>
                <Button 
                  onClick={() => openMenuModal()} 
                  variant="outline" 
                  className="w-full border-slate-600 text-white hover:bg-slate-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة منتج للقائمة
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingOrderId ? 'تعديل الطلب' : 'طلب جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">نوع العميل</label>
                <Select 
                  value={orderForm.customerType} 
                  onValueChange={(v) => setOrderForm(prev => ({ ...prev, customerType: v as 'internal' | 'external' }))}
                >
                  <SelectTrigger className="border-slate-700 bg-slate-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="internal">نزيل داخلي</SelectItem>
                    <SelectItem value="external">عميل خارجي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {orderForm.customerType === 'internal' && (
                <div>
                  <label className="text-sm font-medium">رقم الغرفة</label>
                  <Select 
                    value={orderForm.roomNumber} 
                    onValueChange={(v) => {
                      const room = occupiedRooms.find(r => r.number === v);
                      setOrderForm(prev => ({ 
                        ...prev, 
                        roomNumber: v,
                        guestName: room?.guestName || ''
                      }));
                    }}
                  >
                    <SelectTrigger className="border-slate-700 bg-slate-950">
                      <SelectValue placeholder="اختر الغرفة" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {occupiedRooms.map((room) => (
                        <SelectItem key={room.number} value={room.number}>
                          غرفة {room.number} - {room.guestName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium">اسم العميل</label>
              <Input
                value={orderForm.guestName}
                onChange={(e) => setOrderForm(prev => ({ ...prev, guestName: e.target.value }))}
                className="border-slate-700 bg-slate-950"
                placeholder="اسم العميل"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">طريقة الدفع</label>
              <Select 
                value={orderForm.paymentMethod} 
                onValueChange={(v) => setOrderForm(prev => ({ ...prev, paymentMethod: v as typeof orderForm.paymentMethod }))}
              >
                <SelectTrigger className="border-slate-700 bg-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="room_charge">إضافة للفاتورة</SelectItem>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="card">بطاقة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">العناصر</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {menu.filter(item => item.available).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded border border-slate-700">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.nameAr}</p>
                      <p className="text-xs text-slate-400">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => updateItemQuantity(item.id, -1)}
                        disabled={!orderForm.items[item.id]}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{orderForm.items[item.id] || 0}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => updateItemQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-semibold text-green-400">
                المجموع: {formatCurrency(getTotalOrderValue())}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOrderDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveOrder} className="bg-amber-600 hover:bg-amber-700">
              {editingOrderId ? 'تحديث' : 'إضافة'} الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingMenuId ? 'تعديل المنتج' : 'منتج جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">الاسم بالعربية</label>
                <Input
                  value={menuForm.nameAr}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, nameAr: e.target.value }))}
                  className="border-slate-700 bg-slate-950"
                />
              </div>
              <div>
                <label className="text-sm font-medium">الاسم بالإنجليزية</label>
                <Input
                  value={menuForm.name}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                  className="border-slate-700 bg-slate-950"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">الفئة</label>
              <Select 
                value={menuForm.category} 
                onValueChange={(v) => setMenuForm(prev => ({ ...prev, category: v as MenuItem['category'] }))}
              >
                <SelectTrigger className="border-slate-700 bg-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="coffee">قهوة</SelectItem>
                  <SelectItem value="tea">شاي</SelectItem>
                  <SelectItem value="pastry">مخبوزات</SelectItem>
                  <SelectItem value="dessert">حلويات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">السعر (ر.س)</label>
                <Input
                  type="number"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  className="border-slate-700 bg-slate-950"
                />
              </div>
              <div>
                <label className="text-sm font-medium">وقت التحضير (دقيقة)</label>
                <Input
                  type="number"
                  value={menuForm.preparationTime}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
                  className="border-slate-700 bg-slate-950"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={menuForm.available} 
                onCheckedChange={(checked) => setMenuForm(prev => ({ ...prev, available: checked }))}
              />
              <label className="text-sm">متاح</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMenuDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveMenuItem} className="bg-amber-600 hover:bg-amber-700">
              {editingMenuId ? 'تحديث' : 'إضافة'} المنتج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}