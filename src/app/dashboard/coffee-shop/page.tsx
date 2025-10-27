'use client';'use client';



import { useEffect, useMemo, useState } from 'react';import { useEffect, useMemo, useState } from 'react';

import { Coffee, ShoppingCart, X, Plus, Minus, Trash2, CreditCard, Wallet, UserCircle, CheckCircle, Search } from 'lucide-react';import { Coffee, Edit2, Minus, Plus, Trash2, CheckCircle, Send } from 'lucide-react';

import { getRoomsFromStorage } from '@/lib/rooms-data';import { getRoomsFromStorage } from '@/lib/rooms-data';

import { Badge } from '@/components/ui/badge';import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/button';

import { Card, CardContent } from '@/components/ui/card';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Input } from '@/components/ui/input';import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';import { Switch } from '@/components/ui/switch';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { playNotificationSound } from '@/lib/notification-sounds';import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { playNotificationSound } from '@/lib/notification-sounds';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

type MenuItem = {

  id: string;type MenuItem = {

  name: string;  id: string;

  nameAr: string;  name: string;

  category: 'coffee' | 'tea' | 'pastry' | 'dessert';  nameAr: string;

  price: number;  category: 'coffee' | 'tea' | 'pastry' | 'dessert';

  available: boolean;  price: number;

  preparationTime: number;  available: boolean;

  image?: string;  preparationTime: number;

};};



type CartItem = {type OrderItem = {

  menuItem: MenuItem;  menuItemId: string;

  quantity: number;  menuItemName: string;

};  quantity: number;

  price: number;

type OrderItem = {};

  menuItemId: string;

  menuItemName: string;type CoffeeOrder = {

  quantity: number;  id: string;

  price: number;  roomNumber: string;

};  guestName: string;

  items: OrderItem[];

type CoffeeOrder = {  totalAmount: number;

  id: string;  status: OrderStatus;

  roomNumber: string;  orderDate: string;

  guestName: string;  paymentMethod: 'room_charge' | 'cash' | 'card';

  items: OrderItem[];  sentToReception?: boolean;

  totalAmount: number;  receptionRequestId?: string;

  status: OrderStatus;};

  orderDate: string;

  paymentMethod: 'room_charge' | 'cash' | 'card';interface OrderFormState {

  sentToReception?: boolean;  customerType: 'internal' | 'external';

  receptionRequestId?: string;  roomNumber: string;

};  guestName: string;

  items: Record<string, number>;

const STORAGE_MENU_KEY = 'coffee_menu';  paymentMethod: 'room_charge' | 'cash' | 'card';

const STORAGE_ORDERS_KEY = 'coffee_orders';}



const DEFAULT_MENU: MenuItem[] = [interface MenuFormState {

  {   id: string;

    id: 'espresso',   name: string;

    name: 'Espresso',   nameAr: string;

    nameAr: 'إسبريسو',   category: MenuItem['category'];

    category: 'coffee',   price: number;

    price: 9,   preparationTime: number;

    available: true,   available: boolean;

    preparationTime: 2,}

    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop'

  },const STORAGE_MENU_KEY = 'coffee_menu';

  { const STORAGE_ORDERS_KEY = 'coffee_orders';

    id: 'flat-white', 

    name: 'Flat White', const initialOrderForm: OrderFormState = {

    nameAr: 'فلات وايت',   customerType: 'internal',

    category: 'coffee',   roomNumber: '',

    price: 15,   guestName: '',

    available: true,   items: {},

    preparationTime: 4,  paymentMethod: 'room_charge'

    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop'};

  },

  { const initialMenuForm: MenuFormState = {

    id: 'spanish-latte',   id: '',

    name: 'Spanish Latte',   name: '',

    nameAr: 'سبانش لاتيه',   nameAr: '',

    category: 'coffee',   category: 'coffee',

    price: 17,   price: 14,

    available: true,   preparationTime: 4,

    preparationTime: 5,  available: true

    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop'};

  },

  { const DEFAULT_MENU: MenuItem[] = [

    id: 'cappuccino',   { id: 'espresso', name: 'Espresso', nameAr: 'إسبريسو', category: 'coffee', price: 9, available: true, preparationTime: 2 },

    name: 'Cappuccino',   { id: 'flat-white', name: 'Flat White', nameAr: 'فلات وايت', category: 'coffee', price: 15, available: true, preparationTime: 4 },

    nameAr: 'كابتشينو',   { id: 'spanish-latte', name: 'Spanish Latte', nameAr: 'سبانش لاتيه', category: 'coffee', price: 17, available: true, preparationTime: 5 },

    category: 'coffee',   { id: 'matcha-latte', name: 'Matcha Latte', nameAr: 'ماتشا لاتيه', category: 'tea', price: 16, available: true, preparationTime: 4 },

    price: 14,   { id: 'butter-croissant', name: 'Butter Croissant', nameAr: 'كرواسان زبدة', category: 'pastry', price: 8, available: true, preparationTime: 1 },

    available: true,   { id: 'cheesecake', name: 'Cheesecake', nameAr: 'تشيز كيك', category: 'dessert', price: 19, available: true, preparationTime: 2 }

    preparationTime: 4,];

    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=400&fit=crop'

  },const ORDER_STATUSES: Array<{ value: OrderStatus; label: string }> = [

  {   { value: 'pending', label: 'معلق' },

    id: 'matcha-latte',   { value: 'preparing', label: 'قيد التحضير' },

    name: 'Matcha Latte',   { value: 'ready', label: 'جاهز' },

    nameAr: 'ماتشا لاتيه',   { value: 'delivered', label: 'تم التسليم' },

    category: 'tea',   { value: 'cancelled', label: 'ملغي' }

    price: 16, ];

    available: true, 

    preparationTime: 4,const statusConfig: Record<OrderStatus, { label: string; color: string }> = {

    image: 'https://images.unsplash.com/photo-1536013564243-18e7f2d4c9c0?w=400&h=400&fit=crop'  pending: { label: 'معلق', color: 'bg-amber-500/20 text-amber-300' },

  },  preparing: { label: 'قيد التحضير', color: 'bg-blue-500/20 text-blue-200' },

  {   ready: { label: 'جاهز', color: 'bg-emerald-500/20 text-emerald-200' },

    id: 'green-tea',   delivered: { label: 'تم التسليم', color: 'bg-slate-500/20 text-slate-200' },

    name: 'Green Tea',   cancelled: { label: 'ملغي', color: 'bg-rose-500/20 text-rose-200' }

    nameAr: 'شاي أخضر', };

    category: 'tea', 

    price: 12, const categoryDictionary: Record<MenuItem['category'], string> = {

    available: true,   coffee: 'قهوة',

    preparationTime: 3,  tea: 'شاي',

    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop'  pastry: 'مخبوزات',

  },  dessert: 'حلويات'

  { };

    id: 'butter-croissant', 

    name: 'Butter Croissant', const formatCurrency = (value: number) => `${value} ر.س`;

    nameAr: 'كرواسان زبدة', const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    category: 'pastry', 

    price: 8, function useLocalStorage<T>(key: string, initial: T) {

    available: true,   const [state, setState] = useState<T>(initial);

    preparationTime: 1,

    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop'  useEffect(() => {

  },    try {

  {       const stored = localStorage.getItem(key);

    id: 'chocolate-muffin',       if (stored) setState(JSON.parse(stored));

    name: 'Chocolate Muffin',     } catch (e) {

    nameAr: 'مافن شوكولاتة',       console.error(`Storage error: ${key}`, e);

    category: 'pastry',     }

    price: 10,   }, [key]);

    available: true, 

    preparationTime: 1,  useEffect(() => {

    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop'    try {

  },      localStorage.setItem(key, JSON.stringify(state));

  {     } catch (e) {

    id: 'cheesecake',       console.error(`Storage error: ${key}`, e);

    name: 'Cheesecake',     }

    nameAr: 'تشيز كيك',   }, [key, state]);

    category: 'dessert', 

    price: 19,   return [state, setState] as const;

    available: true, }

    preparationTime: 2,

    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=400&fit=crop'export default function CoffeeShopPage() {

  },  const [menu, setMenu] = useLocalStorage<MenuItem[]>(STORAGE_MENU_KEY, DEFAULT_MENU);

  {   const [orders, setOrders] = useLocalStorage<CoffeeOrder[]>(STORAGE_ORDERS_KEY, []);

    id: 'tiramisu',   const [occupiedRooms, setOccupiedRooms] = useState<Array<{ number: string; guestName?: string }>>([]);

    name: 'Tiramisu',   const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

    nameAr: 'تيراميسو',   const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

    category: 'dessert',   const [orderDialogOpen, setOrderDialogOpen] = useState(false);

    price: 22,   const [menuDialogOpen, setMenuDialogOpen] = useState(false);

    available: true,   const [orderForm, setOrderForm] = useState<OrderFormState>(initialOrderForm);

    preparationTime: 2,  const [menuForm, setMenuForm] = useState<MenuFormState>(initialMenuForm);

    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop'  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');

  }  const [search, setSearch] = useState('');

];

  useEffect(() => {

const categoryDictionary: Record<MenuItem['category'], string> = {    const rooms = getRoomsFromStorage();

  coffee: 'قهوة',    const occupied = rooms

  tea: 'شاي',      .filter((room) => room.status === 'Occupied' && room.guestName)

  pastry: 'مخبوزات',      .map((room) => ({ number: room.number, guestName: room.guestName }));

  dessert: 'حلويات'    setOccupiedRooms(occupied);

};  }, []);



const formatCurrency = (value: number) => `${value.toFixed(2)} ر.س`;  const stats = useMemo(() => {

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;    const pending = orders.filter((o) => o.status === 'pending').length;

    const preparing = orders.filter((o) => o.status === 'preparing').length;

function useLocalStorage<T>(key: string, initial: T) {    const ready = orders.filter((o) => o.status === 'ready').length;

  const [state, setState] = useState<T>(initial);    const delivered = orders.filter((o) => o.status === 'delivered').length;

    const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);

  useEffect(() => {    return { pending, preparing, ready, delivered, totalRevenue, total: orders.length };

    try {  }, [orders]);

      const stored = localStorage.getItem(key);

      if (stored) setState(JSON.parse(stored));  const filteredOrders = useMemo(

    } catch (e) {    () =>

      console.error(`Storage error: ${key}`, e);      orders.filter((o) => {

    }        const matchesStatus = orderFilter === 'all' || o.status === orderFilter;

  }, [key]);        const matchesSearch = !search || o.guestName.toLowerCase().includes(search.toLowerCase()) || o.roomNumber.includes(search);

        return matchesStatus && matchesSearch;

  useEffect(() => {      }),

    try {    [orders, orderFilter, search]

      localStorage.setItem(key, JSON.stringify(state));  );

    } catch (e) {

      console.error(`Storage error: ${key}`, e);  const activeOrders = useMemo(() => orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)), [orders]);

    }

  }, [key, state]);  const resetOrderForm = () => {

    setOrderForm(initialOrderForm);

  return [state, setState] as const;    setEditingOrderId(null);

}  };



export default function CoffeeShopPOS() {  const resetMenuForm = () => {

  const [menu, setMenu] = useLocalStorage<MenuItem[]>(STORAGE_MENU_KEY, DEFAULT_MENU);    setMenuForm(initialMenuForm);

  const [orders, setOrders] = useLocalStorage<CoffeeOrder[]>(STORAGE_ORDERS_KEY, []);    setEditingMenuId(null);

  const [cart, setCart] = useState<CartItem[]>([]);  };

  const [selectedCategory, setSelectedCategory] = useState<'all' | MenuItem['category']>('all');

  const [searchQuery, setSearchQuery] = useState('');  const openOrderModal = (order?: CoffeeOrder) => {

  const [customerType, setCustomerType] = useState<'internal' | 'external'>('internal');    if (order) {

  const [selectedRoom, setSelectedRoom] = useState('');      setEditingOrderId(order.id);

  const [guestName, setGuestName] = useState('');      setOrderForm({

  const [paymentMethod, setPaymentMethod] = useState<'room_charge' | 'cash' | 'card'>('room_charge');        customerType: order.roomNumber ? 'internal' : 'external',

  const [occupiedRooms, setOccupiedRooms] = useState<Array<{ number: string; guestName?: string }>>([]);        roomNumber: order.roomNumber,

  const [showCheckout, setShowCheckout] = useState(false);        guestName: order.guestName,

        items: order.items.reduce<Record<string, number>>((acc, item) => {

  useEffect(() => {          acc[item.menuItemId] = item.quantity;

    const rooms = getRoomsFromStorage();          return acc;

    const occupied = rooms        }, {}),

      .filter((room) => room.status === 'Occupied' && room.guestName)        paymentMethod: order.paymentMethod

      .map((room) => ({ number: room.number, guestName: room.guestName }));      });

    setOccupiedRooms(occupied);    } else {

  }, []);      resetOrderForm();

    }

  // Filter menu items    setOrderDialogOpen(true);

  const filteredMenu = useMemo(() => {  };

    return menu.filter((item) => {

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;  const openMenuModal = (item?: MenuItem) => {

      const matchesSearch = !searchQuery ||     if (item) {

        item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||      setEditingMenuId(item.id);

        item.name.toLowerCase().includes(searchQuery.toLowerCase());      setMenuForm({

      return matchesCategory && matchesSearch && item.available;        id: item.id,

    });        name: item.name,

  }, [menu, selectedCategory, searchQuery]);        nameAr: item.nameAr,

        category: item.category,

  // Calculate cart totals        price: item.price,

  const cartTotal = useMemo(() => {        preparationTime: item.preparationTime,

    return cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);        available: item.available

  }, [cart]);      });

    } else {

  const cartItemsCount = useMemo(() => {      resetMenuForm();

    return cart.reduce((sum, item) => sum + item.quantity, 0);    }

  }, [cart]);    setMenuDialogOpen(true);

  };

  // Cart operations

  const addToCart = (menuItem: MenuItem) => {  const adjustItemQuantity = (itemId: string, delta: number) => {

    setCart((prev) => {    setOrderForm((prev) => {

      const existing = prev.find((item) => item.menuItem.id === menuItem.id);      const current = prev.items[itemId] ?? 0;

      if (existing) {      const next = Math.max(0, current + delta);

        return prev.map((item) =>      const updated = { ...prev.items };

          item.menuItem.id === menuItem.id      if (next === 0) {

            ? { ...item, quantity: item.quantity + 1 }        delete updated[itemId];

            : item      } else {

        );        updated[itemId] = next;

      }      }

      return [...prev, { menuItem, quantity: 1 }];      return { ...prev, items: updated };

    });    });

  };  };



  const updateCartItemQuantity = (menuItemId: string, delta: number) => {  const handleSaveOrder = () => {

    setCart((prev) => {    const selectedItems = Object.entries(orderForm.items)

      return prev      .filter(([, quantity]) => quantity > 0)

        .map((item) =>      .map(([menuItemId, quantity]) => {

          item.menuItem.id === menuItemId        const menuItem = menu.find((item) => item.id === menuItemId);

            ? { ...item, quantity: Math.max(0, item.quantity + delta) }        if (!menuItem) return null;

            : item        return {

        )          menuItemId,

        .filter((item) => item.quantity > 0);          menuItemName: menuItem.nameAr,

    });          quantity,

  };          price: menuItem.price

        };

  const removeFromCart = (menuItemId: string) => {      })

    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));      .filter(Boolean) as OrderItem[];

  };

    if (!orderForm.guestName.trim() || !selectedItems.length) return;

  const clearCart = () => {    if (orderForm.customerType === 'internal' && !orderForm.roomNumber) return;

    setCart([]);

    setGuestName('');    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    setSelectedRoom('');    const payload: CoffeeOrder = {

    setCustomerType('internal');      id: editingOrderId ?? uid(),

    setPaymentMethod('room_charge');      roomNumber: orderForm.customerType === 'internal' ? orderForm.roomNumber : '',

  };      guestName: orderForm.guestName,

      items: selectedItems,

  // Complete order      totalAmount,

  const completeOrder = () => {      status: editingOrderId ? (orders.find((o) => o.id === editingOrderId)?.status ?? 'pending') : 'pending',

    if (!guestName.trim() || cart.length === 0) {      orderDate: editingOrderId ? (orders.find((o) => o.id === editingOrderId)?.orderDate ?? new Date().toISOString()) : new Date().toISOString(),

      alert('يرجى إدخال اسم العميل واختيار الأصناف');      paymentMethod: orderForm.customerType === 'internal' ? orderForm.paymentMethod : 'cash'

      return;    };

    }

    setOrders((prev) => (editingOrderId ? prev.map((o) => (o.id === editingOrderId ? payload : o)) : [payload, ...prev]));

    if (customerType === 'internal' && !selectedRoom) {    setOrderDialogOpen(false);

      alert('يرجى اختيار الغرفة');    resetOrderForm();

      return;  };

    }

  const handleSaveMenu = () => {

    const orderItems: OrderItem[] = cart.map((item) => ({    if (!menuForm.name.trim() || !menuForm.nameAr.trim()) return;

      menuItemId: item.menuItem.id,

      menuItemName: item.menuItem.nameAr,    const payload: MenuItem = {

      quantity: item.quantity,      id: editingMenuId ?? uid(),

      price: item.menuItem.price      name: menuForm.name,

    }));      nameAr: menuForm.nameAr,

      category: menuForm.category,

    const newOrder: CoffeeOrder = {      price: Number(menuForm.price) || 0,

      id: uid(),      preparationTime: Number(menuForm.preparationTime) || 1,

      roomNumber: customerType === 'internal' ? selectedRoom : '',      available: menuForm.available

      guestName: guestName,    };

      items: orderItems,

      totalAmount: cartTotal,    setMenu((prev) => (editingMenuId ? prev.map((item) => (item.id === editingMenuId ? payload : item)) : [...prev, payload]));

      status: 'pending',    setMenuDialogOpen(false);

      orderDate: new Date().toISOString(),    resetMenuForm();

      paymentMethod: customerType === 'internal' ? paymentMethod : 'cash'  };

    };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {

    setOrders((prev) => [newOrder, ...prev]);    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

      };

    // Play notification sound

    playNotificationSound('new-request');  const handleDeleteOrder = (orderId: string) => {

    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    // Clear cart and form  };

    clearCart();

    setShowCheckout(false);  const sendToReception = (order: CoffeeOrder) => {

    // Get current user as the assigned employee (or create a default reception user)

    alert('✅ تم إنشاء الطلب بنجاح!');    const currentUser = typeof window !== 'undefined' ? localStorage.getItem('hotel_user') : null;

  };    let assignedEmployee = 'reception_staff';

    

  // Load menu items from menu-items storage    if (currentUser) {

  useEffect(() => {      try {

    try {        const userData = JSON.parse(currentUser);

      const savedMenuItems = localStorage.getItem('menu-items');        // If current user is not reception, assign to a default reception account

      if (savedMenuItems) {        assignedEmployee = userData.role === 'reception' ? userData.username : 'reception_staff';

        const parsedItems = JSON.parse(savedMenuItems);      } catch (e) {

        // Map menu items to coffee menu format        console.error('Error parsing user data', e);

        const coffeeItems = parsedItems      }

          .filter((item: any) =>     }

            item.category === 'قهوة' || 

            item.category === 'شاي' ||     // Create guest request from coffee order

            item.category === 'مخبوزات' ||     const guestRequest = {

            item.category === 'حلويات'      id: uid(),

          )      room: order.roomNumber,

          .map((item: any) => ({      guest: order.guestName,

            id: item.id,      phone: '',

            name: item.name,      type: 'طلب كوفي شوب',

            nameAr: item.name,      notes: `${order.items.map(item => `${item.menuItemName} × ${item.quantity}`).join(', ')}\nالمبلغ: ${order.totalAmount.toFixed(2)} ر.س`,

            category: item.category === 'قهوة' ? 'coffee' :       status: 'pending',

                     item.category === 'شاي' ? 'tea' :      createdAt: new Date().toISOString(),

                     item.category === 'مخبوزات' ? 'pastry' : 'dessert',      priority: 'medium' as const,

            price: item.price,      assignedEmployee: assignedEmployee,

            available: true,      employeeApprovalStatus: 'pending' as const,

            preparationTime: 5,      linkedSection: 'coffee',

            image: item.image || undefined      originalOrderId: order.id

          }));    };



        if (coffeeItems.length > 0) {    // Save to guest requests

          // Merge with default menu, avoiding duplicates    const requestsData = localStorage.getItem('guest-requests');

          setMenu((prevMenu) => {    const requests = requestsData ? JSON.parse(requestsData) : [];

            const merged = [...prevMenu];    requests.unshift(guestRequest);

            coffeeItems.forEach((newItem: MenuItem) => {    localStorage.setItem('guest-requests', JSON.stringify(requests));

              const exists = merged.find(m => m.id === newItem.id);

              if (!exists) {    // Update order status to indicate it's sent to reception

                merged.push(newItem);    setOrders((prev) => prev.map((o) => 

              }      o.id === order.id ? { ...o, sentToReception: true, receptionRequestId: guestRequest.id } : o

            });    ));

            return merged;

          });    // Trigger storage event for other tabs/components

        }    window.dispatchEvent(new Event('storage'));

      }

    } catch (e) {    // Play notification sound

      console.error('Error loading menu items:', e);    playNotificationSound('new-request');

    }

  }, []);    alert('تم إرسال الطلب للاستقبال بنجاح ✓');

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" dir="rtl">  const handleToggleAvailability = (itemId: string) => {

      <div className="flex h-screen">    setMenu((prev) => prev.map((item) => (item.id === itemId ? { ...item, available: !item.available } : item)));

        {/* Main POS Area - Left Side */}  };

        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}  return (

          <div className="bg-white dark:bg-slate-800 shadow-md p-4 border-b border-amber-200 dark:border-slate-700">    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6" dir="rtl">

            <div className="flex items-center justify-between">      <div className="mx-auto max-w-6xl space-y-6">

              <div className="flex items-center gap-3">        {/* Header */}

                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <Coffee className="h-6 w-6 text-white" />          <div className="space-y-2">

                </div>            <h1 className="flex items-center gap-2 text-3xl sm:text-4xl font-bold text-white">

                <div>              <Coffee className="h-8 w-8 text-amber-500" />

                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">كوفي شوب</h1>              الكوفي شوب

                  <p className="text-sm text-slate-600 dark:text-slate-400">نظام نقطة البيع</p>            </h1>

                </div>            <p className="text-sm sm:text-base text-slate-300">إدارة المشروبات والطلبات</p>

              </div>          </div>

                        <div className="flex gap-2">

              <div className="flex items-center gap-3">            <Button onClick={() => openOrderModal()} className="bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base">

                <div className="text-right">              <Plus className="h-4 w-4 mr-2" /> طلب جديد

                  <p className="text-xs text-slate-600 dark:text-slate-400">إجمالي المبيعات اليوم</p>            </Button>

                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">            <Button onClick={() => openMenuModal()} variant="outline" className="border-slate-700 text-slate-300 text-sm sm:text-base">

                    {formatCurrency(              <Plus className="h-4 w-4 mr-2" /> عنصر

                      orders            </Button>

                        .filter(o => o.status === 'delivered' && new Date(o.orderDate).toDateString() === new Date().toDateString())          </div>

                        .reduce((sum, o) => sum + o.totalAmount, 0)        </header>

                    )}

                  </p>        {/* Stats */}

                </div>        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">

              </div>          <Card className="border-slate-800 bg-slate-900/50">

            </div>            <CardHeader className="pb-2">

              <CardTitle className="text-xs sm:text-sm text-slate-300">الطلبات النشطة</CardTitle>

            {/* Search Bar */}            </CardHeader>

            <div className="mt-4">            <CardContent>

              <div className="relative">              <p className="text-2xl sm:text-3xl font-bold text-white">{activeOrders.length}</p>

                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />            </CardContent>

                <Input          </Card>

                  placeholder="ابحث عن صنف..."          <Card className="border-slate-800 bg-slate-900/50">

                  value={searchQuery}            <CardHeader className="pb-2">

                  onChange={(e) => setSearchQuery(e.target.value)}              <CardTitle className="text-xs sm:text-sm text-slate-300">تم التسليم</CardTitle>

                  className="pr-10 border-amber-200 dark:border-slate-600 focus:border-amber-400 dark:focus:border-amber-500"            </CardHeader>

                />            <CardContent>

              </div>              <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.delivered}</p>

            </div>            </CardContent>

          </div>          </Card>

          <Card className="border-slate-800 bg-slate-900/50">

          {/* Category Tabs */}            <CardHeader className="pb-2">

          <div className="bg-white dark:bg-slate-800 border-b border-amber-200 dark:border-slate-700 px-4 py-2">              <CardTitle className="text-xs sm:text-sm text-slate-300">الإيرادات</CardTitle>

            <div className="flex gap-2 overflow-x-auto">            </CardHeader>

              <Button            <CardContent>

                variant={selectedCategory === 'all' ? 'default' : 'outline'}              <p className="text-xl sm:text-2xl font-bold text-amber-400">{formatCurrency(stats.totalRevenue)}</p>

                onClick={() => setSelectedCategory('all')}            </CardContent>

                className={selectedCategory === 'all' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 dark:border-slate-600'}          </Card>

              >          <Card className="border-slate-800 bg-slate-900/50">

                الكل            <CardHeader className="pb-2">

              </Button>              <CardTitle className="text-xs sm:text-sm text-slate-300">عناصر القائمة</CardTitle>

              {Object.entries(categoryDictionary).map(([key, label]) => (            </CardHeader>

                <Button            <CardContent>

                  key={key}              <p className="text-2xl sm:text-3xl font-bold text-blue-400">{menu.length}</p>

                  variant={selectedCategory === key ? 'default' : 'outline'}            </CardContent>

                  onClick={() => setSelectedCategory(key as MenuItem['category'])}          </Card>

                  className={selectedCategory === key ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 dark:border-slate-600'}        </div>

                >

                  {label}        {/* Main Content - 2 Column Grid */}

                </Button>        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              ))}          {/* Menu and Active Orders - 2 columns */}

            </div>          <div className="lg:col-span-2 space-y-6">

          </div>            {/* Menu Section */}

            <Card className="border-slate-800 bg-slate-900/40">

          {/* Menu Grid */}              <CardHeader>

          <div className="flex-1 overflow-y-auto p-4">                <CardTitle className="text-white">القائمة</CardTitle>

            {filteredMenu.length === 0 ? (              </CardHeader>

              <div className="flex items-center justify-center h-full">              <CardContent className="space-y-4 max-h-96 overflow-y-auto">

                <p className="text-slate-400 text-center">لا توجد أصناف متاحة</p>                {menu.length === 0 ? (

              </div>                  <p className="text-slate-400 text-center py-4">لا توجد عناصر</p>

            ) : (                ) : (

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">                  <div className="space-y-3">

                {filteredMenu.map((item) => (                    {menu.map((item) => (

                  <Card                       <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/50">

                    key={item.id}                        <div className="flex-1">

                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-amber-400 dark:hover:border-amber-500 overflow-hidden"                          <p className="font-semibold text-white text-sm sm:text-base">{item.nameAr}</p>

                    onClick={() => addToCart(item)}                          <div className="flex gap-2 mt-1 text-xs text-slate-400">

                  >                            <span>{formatCurrency(item.price)}</span>

                    <CardContent className="p-0">                            <span>{item.preparationTime} دقيقة</span>

                      {/* Image */}                          </div>

                      <div className="relative h-40 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-600 overflow-hidden">                        </div>

                        {item.image ? (                        <div className="flex gap-1">

                          <img                           <Button size="sm" variant="ghost" onClick={() => openMenuModal(item)} className="h-8 w-8 p-0 text-slate-400 hover:text-white">

                            src={item.image}                             <Edit2 className="h-4 w-4" />

                            alt={item.nameAr}                          </Button>

                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"                          <Button

                          />                            size="sm"

                        ) : (                            variant="ghost"

                          <div className="w-full h-full flex items-center justify-center">                            onClick={() => handleToggleAvailability(item.id)}

                            <Coffee className="h-16 w-16 text-amber-300 dark:text-amber-600" />                            className={`h-8 w-8 p-0 ${item.available ? 'text-emerald-400' : 'text-slate-600'}`}

                          </div>                          >

                        )}                            <CheckCircle className="h-4 w-4" />

                                                  </Button>

                        {/* Quick Add Button */}                        </div>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">                      </div>

                          <Button size="sm" className="bg-white text-amber-600 hover:bg-amber-50">                    ))}

                            <Plus className="h-4 w-4 ml-1" />                  </div>

                            إضافة                )}

                          </Button>              </CardContent>

                        </div>            </Card>



                        {/* Category Badge */}            {/* Active Orders Section */}

                        <Badge className="absolute top-2 right-2 bg-white/90 text-amber-700 border-amber-300">            <Card className="border-slate-800 bg-slate-900/40">

                          {categoryDictionary[item.category]}              <CardHeader>

                        </Badge>                <CardTitle className="text-white">الطلبات النشطة ({activeOrders.length})</CardTitle>

                      </div>              </CardHeader>

              <CardContent className="space-y-3 max-h-96 overflow-y-auto">

                      {/* Info */}                {activeOrders.length === 0 ? (

                      <div className="p-3">                  <p className="text-slate-400 text-center py-4">لا توجد طلبات نشطة</p>

                        <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1 truncate">                ) : (

                          {item.nameAr}                  activeOrders.map((order) => {

                        </h3>                    const status = statusConfig[order.status];

                        <div className="flex items-center justify-between">                    return (

                          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">                      <div key={order.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/50">

                            {formatCurrency(item.price)}                        <div className="flex items-start justify-between gap-2 mb-2">

                          </p>                          <div>

                          <p className="text-xs text-slate-500 dark:text-slate-400">                            <p className="font-semibold text-white text-sm sm:text-base">{order.guestName}</p>

                            {item.preparationTime} دقيقة                            <p className="text-xs text-slate-400">{order.roomNumber ? `غرفة ${order.roomNumber}` : 'خارجي'}</p>

                          </p>                          </div>

                        </div>                          <Badge className={`${status.color} border-none text-xs`}>{status.label}</Badge>

                      </div>                        </div>

                    </CardContent>                        <p className="text-xs sm:text-sm text-slate-300 mb-2">{order.items.length} عنصر - {formatCurrency(order.totalAmount)}</p>

                  </Card>                        <div className="flex flex-wrap gap-2">

                ))}                          <Select value={order.status} onValueChange={(s) => handleStatusChange(order.id, s as OrderStatus)}>

              </div>                            <SelectTrigger className="h-8 text-xs border-slate-700 bg-slate-900">

            )}                              <SelectValue />

          </div>                            </SelectTrigger>

        </div>                            <SelectContent className="bg-slate-900">

                              {ORDER_STATUSES.map((st) => (

        {/* Cart Sidebar - Right Side */}                                <SelectItem key={st.value} value={st.value}>

        <div className="w-96 bg-white dark:bg-slate-800 border-r border-amber-200 dark:border-slate-700 flex flex-col shadow-2xl">                                  {st.label}

          {/* Cart Header */}                                </SelectItem>

          <div className="p-4 border-b border-amber-200 dark:border-slate-700 bg-gradient-to-r from-amber-500 to-orange-500">                              ))}

            <div className="flex items-center justify-between text-white">                            </SelectContent>

              <div className="flex items-center gap-2">                          </Select>

                <ShoppingCart className="h-5 w-5" />                          <Button size="sm" variant="ghost" onClick={() => openOrderModal(order)} className="h-8 px-2 text-xs">

                <h2 className="text-lg font-bold">السلة</h2>                            تعديل

              </div>                          </Button>

              <Badge className="bg-white text-amber-600 font-bold">                          {!order.sentToReception && (order.status === 'pending' || order.status === 'preparing') && (

                {cartItemsCount} صنف                            <Button 

              </Badge>                              size="sm" 

            </div>                              onClick={() => sendToReception(order)} 

          </div>                              className="h-8 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"

                            >

          {/* Cart Items */}                              <Send className="h-3 w-3 mr-1" />

          <div className="flex-1 overflow-y-auto p-4 space-y-3">                              إرسال للاستقبال

            {cart.length === 0 ? (                            </Button>

              <div className="flex flex-col items-center justify-center h-full text-slate-400">                          )}

                <ShoppingCart className="h-16 w-16 mb-2 opacity-20" />                          {order.sentToReception && (

                <p className="text-center">السلة فارغة</p>                            <Badge className="bg-green-600 text-white text-xs h-8 px-2 flex items-center">

                <p className="text-sm text-center mt-1">اضغط على الأصناف لإضافتها</p>                              <CheckCircle className="h-3 w-3 mr-1" />

              </div>                              تم الإرسال

            ) : (                            </Badge>

              cart.map((item) => (                          )}

                <Card key={item.menuItem.id} className="border-amber-200 dark:border-slate-600">                        </div>

                  <CardContent className="p-3">                      </div>

                    <div className="flex items-start gap-3">                    );

                      {/* Image */}                  })

                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-600 flex-shrink-0 overflow-hidden">                )}

                        {item.menuItem.image ? (              </CardContent>

                          <img             </Card>

                            src={item.menuItem.image}           </div>

                            alt={item.menuItem.nameAr}

                            className="w-full h-full object-cover"          {/* Sidebar - Orders List */}

                          />          <div className="space-y-6">

                        ) : (            <Card className="border-slate-800 bg-slate-900/40 sticky top-6">

                          <div className="w-full h-full flex items-center justify-center">              <CardHeader>

                            <Coffee className="h-6 w-6 text-amber-400" />                <CardTitle className="text-white text-lg">جميع الطلبات</CardTitle>

                          </div>              </CardHeader>

                        )}              <CardContent className="space-y-3">

                      </div>                <Input

                  placeholder="بحث..."

                      {/* Info */}                  value={search}

                      <div className="flex-1 min-w-0">                  onChange={(e) => setSearch(e.target.value)}

                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm truncate">                  className="h-8 text-sm border-slate-700 bg-slate-950"

                          {item.menuItem.nameAr}                />

                        </h3>                <Select value={orderFilter} onValueChange={(v) => setOrderFilter(v as 'all' | OrderStatus)}>

                        <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">                  <SelectTrigger className="h-8 text-sm border-slate-700 bg-slate-950">

                          {formatCurrency(item.menuItem.price)}                    <SelectValue />

                        </p>                  </SelectTrigger>

                  <SelectContent className="bg-slate-900">

                        {/* Quantity Controls */}                    <SelectItem value="all">جميع</SelectItem>

                        <div className="flex items-center gap-2 mt-2">                    {ORDER_STATUSES.map((st) => (

                          <Button                      <SelectItem key={st.value} value={st.value}>

                            size="sm"                        {st.label}

                            variant="outline"                      </SelectItem>

                            className="h-7 w-7 p-0 border-amber-300 dark:border-slate-600"                    ))}

                            onClick={() => updateCartItemQuantity(item.menuItem.id, -1)}                  </SelectContent>

                          >                </Select>

                            <Minus className="h-3 w-3" />

                          </Button>                <div className="max-h-96 overflow-y-auto space-y-2">

                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-8 text-center">                  {filteredOrders.length === 0 ? (

                            {item.quantity}                    <p className="text-slate-400 text-center py-4 text-sm">لا توجد نتائج</p>

                          </span>                  ) : (

                          <Button                    filteredOrders.map((order) => {

                            size="sm"                      const status = statusConfig[order.status];

                            variant="outline"                      return (

                            className="h-7 w-7 p-0 border-amber-300 dark:border-slate-600"                        <div key={order.id} className="p-2 rounded-lg border border-slate-800 bg-slate-950/50 cursor-pointer hover:border-slate-700" onClick={() => openOrderModal(order)}>

                            onClick={() => updateCartItemQuantity(item.menuItem.id, 1)}                          <p className="text-xs font-semibold text-white truncate">{order.guestName}</p>

                          >                          <p className="text-xs text-slate-400">{formatCurrency(order.totalAmount)}</p>

                            <Plus className="h-3 w-3" />                          <Badge className={`${status.color} border-none text-xs mt-1`}>{status.label}</Badge>

                          </Button>                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="h-6 w-6 p-0 mt-1 text-rose-400 hover:bg-rose-500/10">

                          <Button                            <Trash2 className="h-3 w-3" />

                            size="sm"                          </Button>

                            variant="ghost"                        </div>

                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mr-auto"                      );

                            onClick={() => removeFromCart(item.menuItem.id)}                    })

                          >                  )}

                            <Trash2 className="h-3 w-3" />                </div>

                          </Button>              </CardContent>

                        </div>            </Card>

                      </div>          </div>

        </div>

                      {/* Item Total */}      </div>

                      <div className="text-right">

                        <p className="font-bold text-slate-800 dark:text-white">      {/* Order Dialog */}

                          {formatCurrency(item.menuItem.price * item.quantity)}      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>

                        </p>        <DialogContent className="border-slate-800 bg-slate-950 text-white max-w-2xl">

                      </div>          <DialogHeader>

                    </div>            <DialogTitle>{editingOrderId ? 'تعديل طلب' : 'طلب جديد'}</DialogTitle>

                  </CardContent>          </DialogHeader>

                </Card>          <div className="space-y-4">

              ))            <div className="grid grid-cols-2 gap-4">

            )}              <div>

          </div>                <label className="text-sm text-slate-300 block mb-1">نوع العميل</label>

                <div className="flex gap-2">

          {/* Cart Footer */}                  {(['internal', 'external'] as const).map((type) => (

          {cart.length > 0 && (                    <Button

            <div className="border-t border-amber-200 dark:border-slate-700 p-4 space-y-3 bg-amber-50 dark:bg-slate-900">                      key={type}

              {/* Total */}                      variant={orderForm.customerType === type ? 'default' : 'outline'}

              <div className="flex items-center justify-between text-lg font-bold">                      className={orderForm.customerType === type ? 'bg-amber-600' : ''}

                <span className="text-slate-700 dark:text-slate-300">الإجمالي:</span>                      onClick={() => setOrderForm((p) => ({ ...p, customerType: type, roomNumber: type === 'internal' ? p.roomNumber : '' }))}

                <span className="text-2xl text-amber-600 dark:text-amber-400">                    >

                  {formatCurrency(cartTotal)}                      {type === 'internal' ? 'داخلي' : 'خارجي'}

                </span>                    </Button>

              </div>                  ))}

                </div>

              {/* Action Buttons */}              </div>

              <div className="grid grid-cols-2 gap-2">              <div>

                <Button                <label className="text-sm text-slate-300 block mb-1">طريقة الدفع</label>

                  variant="outline"                <Select value={orderForm.paymentMethod} onValueChange={(v) => setOrderForm((p) => ({ ...p, paymentMethod: v as any }))}>

                  onClick={clearCart}                  <SelectTrigger className="border-slate-700 bg-slate-900">

                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"                    <SelectValue />

                >                  </SelectTrigger>

                  <X className="h-4 w-4 ml-1" />                  <SelectContent className="bg-slate-900">

                  مسح                    <SelectItem value="room_charge">على الحساب</SelectItem>

                </Button>                    <SelectItem value="cash">نقدي</SelectItem>

                <Button                    <SelectItem value="card">بطاقة</SelectItem>

                  onClick={() => setShowCheckout(true)}                  </SelectContent>

                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"                </Select>

                >              </div>

                  <CreditCard className="h-4 w-4 ml-1" />            </div>

                  إتمام

                </Button>            {orderForm.customerType === 'internal' && (

              </div>              <div>

            </div>                <label className="text-sm text-slate-300 block mb-1">الغرفة</label>

          )}                <Select value={orderForm.roomNumber} onValueChange={(v) => setOrderForm((p) => ({ ...p, roomNumber: v }))}>

        </div>                  <SelectTrigger className="border-slate-700 bg-slate-900">

      </div>                    <SelectValue />

                  </SelectTrigger>

      {/* Checkout Dialog */}                  <SelectContent className="bg-slate-900">

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>                    {occupiedRooms.map((room) => (

        <DialogContent className="sm:max-w-md border-amber-200 dark:border-slate-700">                      <SelectItem key={room.number} value={room.number}>

          <DialogHeader>                        {room.number} - {room.guestName}

            <DialogTitle className="text-xl font-bold">إتمام الطلب</DialogTitle>                      </SelectItem>

          </DialogHeader>                    ))}

                            </SelectContent>

          <div className="space-y-4">                </Select>

            {/* Customer Type */}              </div>

            <div>            )}

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">

                نوع العميل            <div>

              </label>              <label className="text-sm text-slate-300 block mb-1">اسم العميل</label>

              <div className="grid grid-cols-2 gap-2">              <Input value={orderForm.guestName} onChange={(e) => setOrderForm((p) => ({ ...p, guestName: e.target.value }))} className="border-slate-700 bg-slate-900" />

                <Button            </div>

                  variant={customerType === 'internal' ? 'default' : 'outline'}

                  onClick={() => setCustomerType('internal')}            <div>

                  className={customerType === 'internal' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 dark:border-slate-600'}              <label className="text-sm text-slate-300 block mb-2">العناصر</label>

                >              <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-800 rounded p-2 bg-slate-950">

                  <UserCircle className="h-4 w-4 ml-1" />                {menu.map((item) => {

                  نزيل                  const qty = orderForm.items[item.id] ?? 0;

                </Button>                  return (

                <Button                    <div key={item.id} className="flex items-center justify-between text-sm">

                  variant={customerType === 'external' ? 'default' : 'outline'}                      <span className="flex-1">{item.nameAr}</span>

                  onClick={() => setCustomerType('external')}                      <span className="text-slate-400 w-12 text-right">{formatCurrency(item.price)}</span>

                  className={customerType === 'external' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 dark:border-slate-600'}                      <div className="flex items-center gap-1">

                >                        <Button size="sm" variant="ghost" onClick={() => adjustItemQuantity(item.id, -1)} className="h-6 w-6 p-0">

                  <UserCircle className="h-4 w-4 ml-1" />                          <Minus className="h-3 w-3" />

                  خارجي                        </Button>

                </Button>                        <span className="w-6 text-center text-sm">{qty}</span>

              </div>                        <Button size="sm" variant="ghost" onClick={() => adjustItemQuantity(item.id, 1)} className="h-6 w-6 p-0">

            </div>                          <Plus className="h-3 w-3" />

                        </Button>

            {/* Room Selection (for internal customers) */}                      </div>

            {customerType === 'internal' && (                    </div>

              <div>                  );

                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">                })}

                  الغرفة              </div>

                </label>            </div>

                <Select value={selectedRoom} onValueChange={setSelectedRoom}>          </div>

                  <SelectTrigger className="border-amber-200 dark:border-slate-600">          <DialogFooter>

                    <SelectValue placeholder="اختر الغرفة" />            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>

                  </SelectTrigger>              إلغاء

                  <SelectContent>            </Button>

                    {occupiedRooms.map((room) => (            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSaveOrder}>

                      <SelectItem key={room.number} value={room.number}>              {editingOrderId ? 'تحديث' : 'حفظ'}

                        {room.number} - {room.guestName}            </Button>

                      </SelectItem>          </DialogFooter>

                    ))}        </DialogContent>

                  </SelectContent>      </Dialog>

                </Select>

              </div>      {/* Menu Dialog */}

            )}      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>

        <DialogContent className="border-slate-800 bg-slate-950 text-white">

            {/* Guest Name */}          <DialogHeader>

            <div>            <DialogTitle>{editingMenuId ? 'تعديل عنصر' : 'عنصر جديد'}</DialogTitle>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">          </DialogHeader>

                اسم العميل          <div className="space-y-4">

              </label>            <div className="grid grid-cols-2 gap-4">

              <Input              <div>

                value={guestName}                <label className="text-sm text-slate-300 block mb-1">الاسم عربي</label>

                onChange={(e) => setGuestName(e.target.value)}                <Input value={menuForm.nameAr} onChange={(e) => setMenuForm((p) => ({ ...p, nameAr: e.target.value }))} className="border-slate-700 bg-slate-900" />

                placeholder="أدخل اسم العميل"              </div>

                className="border-amber-200 dark:border-slate-600"              <div>

              />                <label className="text-sm text-slate-300 block mb-1">الاسم إنجليزي</label>

            </div>                <Input value={menuForm.name} onChange={(e) => setMenuForm((p) => ({ ...p, name: e.target.value }))} className="border-slate-700 bg-slate-900" />

              </div>

            {/* Payment Method */}            </div>

            <div>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">            <div className="grid grid-cols-3 gap-4">

                طريقة الدفع              <div>

              </label>                <label className="text-sm text-slate-300 block mb-1">السعر</label>

              <div className="grid grid-cols-3 gap-2">                <Input type="number" value={menuForm.price} onChange={(e) => setMenuForm((p) => ({ ...p, price: Number(e.target.value) }))} className="border-slate-700 bg-slate-900" />

                <Button              </div>

                  variant={paymentMethod === 'room_charge' ? 'default' : 'outline'}              <div>

                  onClick={() => setPaymentMethod('room_charge')}                <label className="text-sm text-slate-300 block mb-1">التحضير (دقيقة)</label>

                  className={paymentMethod === 'room_charge' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 dark:border-slate-600'}                <Input type="number" value={menuForm.preparationTime} onChange={(e) => setMenuForm((p) => ({ ...p, preparationTime: Number(e.target.value) }))} className="border-slate-700 bg-slate-900" />

                  disabled={customerType === 'external'}              </div>

                >              <div>

                  على الحساب                <label className="text-sm text-slate-300 block mb-1">الفئة</label>

                </Button>                <Select value={menuForm.category} onValueChange={(v) => setMenuForm((p) => ({ ...p, category: v as any }))}>

                <Button                  <SelectTrigger className="border-slate-700 bg-slate-900">

                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}                    <SelectValue />

                  onClick={() => setPaymentMethod('cash')}                  </SelectTrigger>

                  className={paymentMethod === 'cash' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 dark:border-slate-600'}                  <SelectContent className="bg-slate-900">

                >                    {Object.entries(categoryDictionary).map(([v, l]) => (

                  <Wallet className="h-4 w-4" />                      <SelectItem key={v} value={v}>

                </Button>                        {l}

                <Button                      </SelectItem>

                  variant={paymentMethod === 'card' ? 'default' : 'outline'}                    ))}

                  onClick={() => setPaymentMethod('card')}                  </SelectContent>

                  className={paymentMethod === 'card' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 dark:border-slate-600'}                </Select>

                >              </div>

                  <CreditCard className="h-4 w-4" />            </div>

                </Button>

              </div>            <div className="flex items-center gap-3 p-2 border border-slate-800 rounded">

            </div>              <Switch checked={menuForm.available} onCheckedChange={(c) => setMenuForm((p) => ({ ...p, available: c }))} />

              <span className="text-sm text-slate-300">متاح للطلب</span>

            {/* Order Summary */}            </div>

            <div className="bg-amber-50 dark:bg-slate-900 rounded-lg p-3 border border-amber-200 dark:border-slate-700">          </div>

              <div className="flex justify-between text-sm mb-2">          <DialogFooter>

                <span className="text-slate-600 dark:text-slate-400">عدد الأصناف:</span>            <Button variant="outline" onClick={() => setMenuDialogOpen(false)}>

                <span className="font-semibold text-slate-800 dark:text-white">{cartItemsCount}</span>              إلغاء

              </div>            </Button>

              <div className="flex justify-between text-lg font-bold border-t border-amber-200 dark:border-slate-700 pt-2">            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSaveMenu}>

                <span className="text-slate-700 dark:text-slate-300">الإجمالي:</span>              {editingMenuId ? 'تحديث' : 'حفظ'}

                <span className="text-amber-600 dark:text-amber-400">{formatCurrency(cartTotal)}</span>            </Button>

              </div>          </DialogFooter>

            </div>        </DialogContent>

          </div>      </Dialog>

    </div>

          <DialogFooter className="gap-2">  );

            <Button}

              variant="outline"
              onClick={() => setShowCheckout(false)}
              className="border-slate-300 dark:border-slate-600"
            >
              إلغاء
            </Button>
            <Button
              onClick={completeOrder}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <CheckCircle className="h-4 w-4 ml-1" />
              تأكيد الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
