'use client';

import { useEffect, useMemo, useState } from 'react';
import { Coffee, Edit2, Minus, Plus, Trash2, CheckCircle } from 'lucide-react';
import { getRoomsFromStorage } from '@/lib/rooms-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  useEffect(() => {
    const rooms = getRoomsFromStorage();
    const occupied = rooms
      .filter((room) => room.status === 'Occupied' && room.guestName)
      .map((room) => ({ number: room.number, guestName: room.guestName }));
    setOccupiedRooms(occupied);
  }, []);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending').length;
    const preparing = orders.filter((o) => o.status === 'preparing').length;
    const ready = orders.filter((o) => o.status === 'ready').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);
    return { pending, preparing, ready, delivered, totalRevenue, total: orders.length };
  }, [orders]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const matchesStatus = orderFilter === 'all' || o.status === orderFilter;
        const matchesSearch = !search || o.guestName.toLowerCase().includes(search.toLowerCase()) || o.roomNumber.includes(search);
        return matchesStatus && matchesSearch;
      }),
    [orders, orderFilter, search]
  );

  const activeOrders = useMemo(() => orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)), [orders]);

  const resetOrderForm = () => {
    setOrderForm(initialOrderForm);
    setEditingOrderId(null);
  };

  const resetMenuForm = () => {
    setMenuForm(initialMenuForm);
    setEditingMenuId(null);
  };

  const openOrderModal = (order?: CoffeeOrder) => {
    if (order) {
      setEditingOrderId(order.id);
      setOrderForm({
        customerType: order.roomNumber ? 'internal' : 'external',
        roomNumber: order.roomNumber,
        guestName: order.guestName,
        items: order.items.reduce<Record<string, number>>((acc, item) => {
          acc[item.menuItemId] = item.quantity;
          return acc;
        }, {}),
        paymentMethod: order.paymentMethod
      });
    } else {
      resetOrderForm();
    }
    setOrderDialogOpen(true);
  };

  const openMenuModal = (item?: MenuItem) => {
    if (item) {
      setEditingMenuId(item.id);
      setMenuForm({
        id: item.id,
        name: item.name,
        nameAr: item.nameAr,
        category: item.category,
        price: item.price,
        preparationTime: item.preparationTime,
        available: item.available
      });
    } else {
      resetMenuForm();
    }
    setMenuDialogOpen(true);
  };

  const adjustItemQuantity = (itemId: string, delta: number) => {
    setOrderForm((prev) => {
      const current = prev.items[itemId] ?? 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev.items };
      if (next === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = next;
      }
      return { ...prev, items: updated };
    });
  };

  const handleSaveOrder = () => {
    const selectedItems = Object.entries(orderForm.items)
      .filter(([, quantity]) => quantity > 0)
      .map(([menuItemId, quantity]) => {
        const menuItem = menu.find((item) => item.id === menuItemId);
        if (!menuItem) return null;
        return {
          menuItemId,
          menuItemName: menuItem.nameAr,
          quantity,
          price: menuItem.price
        };
      })
      .filter(Boolean) as OrderItem[];

    if (!orderForm.guestName.trim() || !selectedItems.length) return;
    if (orderForm.customerType === 'internal' && !orderForm.roomNumber) return;

    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const payload: CoffeeOrder = {
      id: editingOrderId ?? uid(),
      roomNumber: orderForm.customerType === 'internal' ? orderForm.roomNumber : '',
      guestName: orderForm.guestName,
      items: selectedItems,
      totalAmount,
      status: editingOrderId ? (orders.find((o) => o.id === editingOrderId)?.status ?? 'pending') : 'pending',
      orderDate: editingOrderId ? (orders.find((o) => o.id === editingOrderId)?.orderDate ?? new Date().toISOString()) : new Date().toISOString(),
      paymentMethod: orderForm.customerType === 'internal' ? orderForm.paymentMethod : 'cash'
    };

    setOrders((prev) => (editingOrderId ? prev.map((o) => (o.id === editingOrderId ? payload : o)) : [payload, ...prev]));
    setOrderDialogOpen(false);
    resetOrderForm();
  };

  const handleSaveMenu = () => {
    if (!menuForm.name.trim() || !menuForm.nameAr.trim()) return;

    const payload: MenuItem = {
      id: editingMenuId ?? uid(),
      name: menuForm.name,
      nameAr: menuForm.nameAr,
      category: menuForm.category,
      price: Number(menuForm.price) || 0,
      preparationTime: Number(menuForm.preparationTime) || 1,
      available: menuForm.available
    };

    setMenu((prev) => (editingMenuId ? prev.map((item) => (item.id === editingMenuId ? payload : item)) : [...prev, payload]));
    setMenuDialogOpen(false);
    resetMenuForm();
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleToggleAvailability = (itemId: string) => {
    setMenu((prev) => prev.map((item) => (item.id === itemId ? { ...item, available: !item.available } : item)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="flex items-center gap-2 text-3xl sm:text-4xl font-bold text-white">
              <Coffee className="h-8 w-8 text-amber-500" />
              الكوفي شوب
            </h1>
            <p className="text-sm sm:text-base text-slate-300">إدارة المشروبات والطلبات</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => openOrderModal()} className="bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base">
              <Plus className="h-4 w-4 mr-2" /> طلب جديد
            </Button>
            <Button onClick={() => openMenuModal()} variant="outline" className="border-slate-700 text-slate-300 text-sm sm:text-base">
              <Plus className="h-4 w-4 mr-2" /> عنصر
            </Button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-slate-300">الطلبات النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-white">{activeOrders.length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-slate-300">تم التسليم</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.delivered}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-slate-300">الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-amber-400">{formatCurrency(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-slate-300">عناصر القائمة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-blue-400">{menu.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - 2 Column Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Menu and Active Orders - 2 columns */}
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
                          <Button size="sm" variant="ghost" onClick={() => openMenuModal(item)} className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleAvailability(item.id)}
                            className={`h-8 w-8 p-0 ${item.available ? 'text-emerald-400' : 'text-slate-600'}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Orders Section */}
            <Card className="border-slate-800 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-white">الطلبات النشطة ({activeOrders.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {activeOrders.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">لا توجد طلبات نشطة</p>
                ) : (
                  activeOrders.map((order) => {
                    const status = statusConfig[order.status];
                    return (
                      <div key={order.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/50">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-white text-sm sm:text-base">{order.guestName}</p>
                            <p className="text-xs text-slate-400">{order.roomNumber ? `غرفة ${order.roomNumber}` : 'خارجي'}</p>
                          </div>
                          <Badge className={`${status.color} border-none text-xs`}>{status.label}</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 mb-2">{order.items.length} عنصر - {formatCurrency(order.totalAmount)}</p>
                        <div className="flex gap-2">
                          <Select value={order.status} onValueChange={(s) => handleStatusChange(order.id, s as OrderStatus)}>
                            <SelectTrigger className="h-8 text-xs border-slate-700 bg-slate-900">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900">
                              {ORDER_STATUSES.map((st) => (
                                <SelectItem key={st.value} value={st.value}>
                                  {st.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="ghost" onClick={() => openOrderModal(order)} className="h-8 px-2 text-xs">
                            تعديل
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Orders List */}
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/40 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">جميع الطلبات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="بحث..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 text-sm border-slate-700 bg-slate-950"
                />
                <Select value={orderFilter} onValueChange={(v) => setOrderFilter(v as 'all' | OrderStatus)}>
                  <SelectTrigger className="h-8 text-sm border-slate-700 bg-slate-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900">
                    <SelectItem value="all">جميع</SelectItem>
                    {ORDER_STATUSES.map((st) => (
                      <SelectItem key={st.value} value={st.value}>
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredOrders.length === 0 ? (
                    <p className="text-slate-400 text-center py-4 text-sm">لا توجد نتائج</p>
                  ) : (
                    filteredOrders.map((order) => {
                      const status = statusConfig[order.status];
                      return (
                        <div key={order.id} className="p-2 rounded-lg border border-slate-800 bg-slate-950/50 cursor-pointer hover:border-slate-700" onClick={() => openOrderModal(order)}>
                          <p className="text-xs font-semibold text-white truncate">{order.guestName}</p>
                          <p className="text-xs text-slate-400">{formatCurrency(order.totalAmount)}</p>
                          <Badge className={`${status.color} border-none text-xs mt-1`}>{status.label}</Badge>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="h-6 w-6 p-0 mt-1 text-rose-400 hover:bg-rose-500/10">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="border-slate-800 bg-slate-950 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingOrderId ? 'تعديل طلب' : 'طلب جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 block mb-1">نوع العميل</label>
                <div className="flex gap-2">
                  {(['internal', 'external'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={orderForm.customerType === type ? 'default' : 'outline'}
                      className={orderForm.customerType === type ? 'bg-amber-600' : ''}
                      onClick={() => setOrderForm((p) => ({ ...p, customerType: type, roomNumber: type === 'internal' ? p.roomNumber : '' }))}
                    >
                      {type === 'internal' ? 'داخلي' : 'خارجي'}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300 block mb-1">طريقة الدفع</label>
                <Select value={orderForm.paymentMethod} onValueChange={(v) => setOrderForm((p) => ({ ...p, paymentMethod: v as any }))}>
                  <SelectTrigger className="border-slate-700 bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900">
                    <SelectItem value="room_charge">على الحساب</SelectItem>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="card">بطاقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {orderForm.customerType === 'internal' && (
              <div>
                <label className="text-sm text-slate-300 block mb-1">الغرفة</label>
                <Select value={orderForm.roomNumber} onValueChange={(v) => setOrderForm((p) => ({ ...p, roomNumber: v }))}>
                  <SelectTrigger className="border-slate-700 bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900">
                    {occupiedRooms.map((room) => (
                      <SelectItem key={room.number} value={room.number}>
                        {room.number} - {room.guestName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm text-slate-300 block mb-1">اسم العميل</label>
              <Input value={orderForm.guestName} onChange={(e) => setOrderForm((p) => ({ ...p, guestName: e.target.value }))} className="border-slate-700 bg-slate-900" />
            </div>

            <div>
              <label className="text-sm text-slate-300 block mb-2">العناصر</label>
              <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-800 rounded p-2 bg-slate-950">
                {menu.map((item) => {
                  const qty = orderForm.items[item.id] ?? 0;
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="flex-1">{item.nameAr}</span>
                      <span className="text-slate-400 w-12 text-right">{formatCurrency(item.price)}</span>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => adjustItemQuantity(item.id, -1)} className="h-6 w-6 p-0">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{qty}</span>
                        <Button size="sm" variant="ghost" onClick={() => adjustItemQuantity(item.id, 1)} className="h-6 w-6 p-0">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              إلغاء
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSaveOrder}>
              {editingOrderId ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="border-slate-800 bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle>{editingMenuId ? 'تعديل عنصر' : 'عنصر جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 block mb-1">الاسم عربي</label>
                <Input value={menuForm.nameAr} onChange={(e) => setMenuForm((p) => ({ ...p, nameAr: e.target.value }))} className="border-slate-700 bg-slate-900" />
              </div>
              <div>
                <label className="text-sm text-slate-300 block mb-1">الاسم إنجليزي</label>
                <Input value={menuForm.name} onChange={(e) => setMenuForm((p) => ({ ...p, name: e.target.value }))} className="border-slate-700 bg-slate-900" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-slate-300 block mb-1">السعر</label>
                <Input type="number" value={menuForm.price} onChange={(e) => setMenuForm((p) => ({ ...p, price: Number(e.target.value) }))} className="border-slate-700 bg-slate-900" />
              </div>
              <div>
                <label className="text-sm text-slate-300 block mb-1">التحضير (دقيقة)</label>
                <Input type="number" value={menuForm.preparationTime} onChange={(e) => setMenuForm((p) => ({ ...p, preparationTime: Number(e.target.value) }))} className="border-slate-700 bg-slate-900" />
              </div>
              <div>
                <label className="text-sm text-slate-300 block mb-1">الفئة</label>
                <Select value={menuForm.category} onValueChange={(v) => setMenuForm((p) => ({ ...p, category: v as any }))}>
                  <SelectTrigger className="border-slate-700 bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900">
                    {Object.entries(categoryDictionary).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 border border-slate-800 rounded">
              <Switch checked={menuForm.available} onCheckedChange={(c) => setMenuForm((p) => ({ ...p, available: c }))} />
              <span className="text-sm text-slate-300">متاح للطلب</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuDialogOpen(false)}>
              إلغاء
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSaveMenu}>
              {editingMenuId ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
