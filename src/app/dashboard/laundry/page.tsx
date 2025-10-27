'use client';'use client';



import { useEffect, useMemo, useState } from 'react';import React, { useEffect, useMemo, useState } from 'react';

import { Shirt, ShoppingCart, X, Plus, Minus, Trash2, CreditCard, Wallet, UserCircle, CheckCircle, Search } from 'lucide-react';import {

import { getRoomsFromStorage } from '@/lib/rooms-data';  Clock,

import { Badge } from '@/components/ui/badge';  Shirt,

import { Button } from '@/components/ui/button';  ShoppingBasket,

import { Card, CardContent } from '@/components/ui/card';  CheckCircle,

import { Input } from '@/components/ui/input';  Plus,

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';  Minus,

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';  Trash2,

import { playNotificationSound } from '@/lib/notification-sounds';  Edit2,

  BellRing,

type OrderStatus = 'pending' | 'washing' | 'ready' | 'delivered' | 'cancelled';  Send,

} from 'lucide-react';

type ServiceItem = {import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

  id: string;import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

  name: string;import { getRoomsFromStorage } from '@/lib/rooms-data'

  nameAr: string;import { playNotificationSound } from '@/lib/notification-sounds';

  category: 'clothing' | 'bedding' | 'special';

  price: number;/**

  available: boolean; * Single-file Laundry Managem                      <SelectContent>

  image?: string;                        {occupiedRooms.map((room) => (

  description?: string;                          <SelectItem key={room.number} value={room.number}>

};                            {room.number}

                          </SelectItem>

type CartItem = {                        ))}

  serviceItem: ServiceItem;                      </SelectContent>ture.

  quantity: number; * Paste this file into your React + TypeScript project (e.g., src/features/LaundryFeature.tsx)

}; * Requirements:

 * - Tailwind CSS available for styles referenced below.

type OrderItem = { * - lucide-react installed for icons.

  serviceItemId: string; *

  serviceItemName: string; * Behavior:

  quantity: number; * - Stores requests and menu in localStorage using the keys below.

  price: number; * - Exposes a self-contained dashboard + modal + table.

}; * - Uses minimal placeholders for "rooms" and "notify" integrations — replace as needed.

 */

type LaundryOrder = {

  id: string;/* ------------------------------- Constants -------------------------------- */

  roomNumber: string;const LAUNDRY_REQUESTS_STORAGE_KEY = 'LAUNDRY_REQUESTS_STORAGE_KEY';

  guestName: string;const LAUNDRY_MENU_KEY = 'LAUNDRY_MENU_KEY';

  items: OrderItem[];

  totalAmount: number;/* ------------------------------- Types ------------------------------------ */

  taxAmount: number;type Status = 'Pending' | 'InProgress' | 'ReadyForPickup' | 'Completed';

  grandTotal: number;

  status: OrderStatus;type LaundryItemDef = {

  orderDate: string;  id: string;

  customerType: 'internal' | 'external';  name: string;

  paymentMethod: 'room_charge' | 'cash' | 'card';  price: number; // per unit

  notes?: string;};

};

type LaundryLine = {

const STORAGE_SERVICES_KEY = 'laundry_services';  itemId: string;

const STORAGE_ORDERS_KEY = 'laundry_orders';  qty: number;

const TAX_RATE = 0.15; // 15% ضريبة};



const DEFAULT_SERVICES: ServiceItem[] = [type LaundryRequest = {

  // ملابس  id: string;

  {   roomNumber: string;

    id: 'shirt',   lines: LaundryLine[];

    name: 'Shirt',   total: number;

    nameAr: 'قميص',   status: Status;

    category: 'clothing',   createdAt: string;

    price: 8,   sentToReception?: boolean;

    available: true,  receptionRequestId?: string;

    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop',};

    description: 'غسيل وكي قميص'

  },/* ------------------------------- Helpers ---------------------------------- */

  { const uid = (prefix = '') =>

    id: 'pants',   prefix + Math.random().toString(36).slice(2, 9);

    name: 'Pants', 

    nameAr: 'بنطال', const formatCurrency = (n: number | undefined | null) => {

    category: 'clothing',   // التحقق من أن n رقم صالح

    price: 10,   if (n === undefined || n === null || isNaN(n)) {

    available: true,    return '0.00 ر.س';

    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop',  }

    description: 'غسيل وكي بنطال'  return `${n.toFixed(2)} ر.س`;

  },};

  { 

    id: 'dress', /* ------------------------------- Demo Data --------------------------------

    name: 'Dress',    Replace or preload real menu via localStorage if desired.

    nameAr: 'فستان', */

    category: 'clothing', const DEFAULT_MENU: LaundryItemDef[] = [

    price: 15,   { id: 'shirt_wash_iron', name: 'غسيل وكوي ثوب', price: 10 },

    available: true,  { id: 'dress_wash', name: 'غسيل فستان', price: 15 },

    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',  { id: 'towel_wash', name: 'غسيل فوطة', price: 5 },

    description: 'غسيل وكي فستان'  { id: 'bedsheet_wash', name: 'غسيل ومكوي شرشف', price: 20 },

  },];

  { 

    id: 'suit', /* ------------------------------- Local Storage Hook ----------------------- */

    name: 'Suit', function useLocalStorageState<T>(key: string, initial: T) {

    nameAr: 'بدلة',   const [state, setState] = useState<T>(() => {

    category: 'clothing',     try {

    price: 25,       const raw = localStorage.getItem(key);

    available: true,      if (!raw) return initial;

    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',      

    description: 'تنظيف جاف بدلة كاملة'      const parsed = JSON.parse(raw) as T;

  },      

  {       // تنظيف البيانات: التأكد من أن كل طلب لديه lines و total و status صحيح

    id: 'thobe',       if (key === 'LAUNDRY_REQUESTS_STORAGE_KEY' && Array.isArray(parsed)) {

    name: 'Thobe',         const validStatuses: Status[] = ['Pending', 'InProgress', 'ReadyForPickup', 'Completed'];

    nameAr: 'ثوب',         const cleaned = (parsed as any[]).map(req => ({

    category: 'clothing',           ...req,

    price: 12,           lines: Array.isArray(req.lines) ? req.lines : [],

    available: true,          total: typeof req.total === 'number' ? req.total : 0,

    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop',          status: validStatuses.includes(req.status) ? req.status : 'Pending'

    description: 'غسيل وكي ثوب'        }));

  },        return cleaned as T;

  {       }

    id: 'abaya',       

    name: 'Abaya',       return parsed;

    nameAr: 'عباية',     } catch {

    category: 'clothing',       return initial;

    price: 15,     }

    available: true,  });

    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop',

    description: 'غسيل وكي عباية'  useEffect(() => {

  },    try {

        localStorage.setItem(key, JSON.stringify(state));

  // مفروشات    } catch {}

  {   }, [key, state]);

    id: 'bedsheet', 

    name: 'Bed Sheet',   return [state, setState] as const;

    nameAr: 'ملاءة سرير', }

    category: 'bedding', 

    price: 18, /* ------------------------------- Permission Check ------------------------- */

    available: true,/*

    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop', Replace this with your app's auth/permission check.

    description: 'غسيل وكي ملاءة' For safety, this function returns true by default; adjust as needed.

  },*/

  { const hasPermission = (perm: string) => {

    id: 'pillow',   // Example: check user object, roles, or JWT claims.

    name: 'Pillow Case',   // return currentUser?.permissions?.includes(perm)

    nameAr: 'كيس مخدة',   return true; // keep safe default to show buttons; change to false to hide sensitive actions.

    category: 'bedding', };

    price: 5, 

    available: true,/* ------------------------------- Notification / Sound --------------------- */

    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop',/* Replace with your app's toast/notification and sound system. */

    description: 'غسيل وكي كيس مخدة'const notify = (title: string, body?: string) => {

  },  // simple console fallback; integrate with your app to send to "guest requests" queue

  {   console.info('Notify:', title, body || '');

    id: 'blanket',   // optional local visual notification via browser (permission required)

    name: 'Blanket',   if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {

    nameAr: 'بطانية',     new Notification(title, { body: body || '' });

    category: 'bedding',   }

    price: 30,   // local bell sound

    available: true,  try {

    image: 'https://images.unsplash.com/photo-1585159812596-fac104f2f069?w=400&h=400&fit=crop',    const audio = new Audio(

    description: 'غسيل بطانية'      'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA...'

  },    );

  {     audio.volume = 0.2;

    id: 'towel',     audio.play().catch(() => {});

    name: 'Towel',   } catch {}

    nameAr: 'منشفة', };

    category: 'bedding', 

    price: 6, /* ------------------------------- Status UI Mapping ------------------------ */

    available: true,const STATUS_META: Record<

    image: 'https://images.unsplash.com/photo-1622495435626-61a79b5c5d80?w=400&h=400&fit=crop',  Status,

    description: 'غسيل منشفة'  { label: string; bg: string; Icon: React.ComponentType<any> }

  },> = {

    Pending: { label: 'معلق', bg: 'bg-yellow-500/80', Icon: Clock },

  // خدمات خاصة  InProgress: { label: 'قيد الغسيل', bg: 'bg-blue-500/80', Icon: Shirt },

  {   ReadyForPickup: { label: 'جاهز للاستلام', bg: 'bg-purple-500/80', Icon: ShoppingBasket },

    id: 'carpet',   Completed: { label: 'مكتمل', bg: 'bg-green-500/80', Icon: CheckCircle },

    name: 'Carpet Cleaning', };

    nameAr: 'تنظيف سجاد', 

    category: 'special', /* ------------------------------- Main Component --------------------------- */

    price: 50, export default function LaundryPage() {

    available: true,  const [menu, setMenu] = useLocalStorageState<LaundryItemDef[]>(

    image: 'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?w=400&h=400&fit=crop',    LAUNDRY_MENU_KEY,

    description: 'تنظيف عميق للسجاد'    DEFAULT_MENU

  },  );

  { 

    id: 'curtain',   const [requests, setRequests] = useLocalStorageState<LaundryRequest[]>(

    name: 'Curtain',     LAUNDRY_REQUESTS_STORAGE_KEY,

    nameAr: 'ستارة',     []

    category: 'special',   );

    price: 35, 

    available: true,  // Modal / form state (single modal for add/edit)

    image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=400&h=400&fit=crop',  const [isOpen, setIsOpen] = useState(false);

    description: 'غسيل ستارة'  const [editingId, setEditingId] = useState<string | null>(null);

  },  const [selectedRoom, setSelectedRoom] = useState<string>('');

  {   const [lines, setLines] = useState<Record<string, number>>({}); // itemId => qty

    id: 'shoe-cleaning',   const [chargeToRoom, setChargeToRoom] = useState(true);

    name: 'Shoe Cleaning',   const [customerType, setCustomerType] = useState<'internal' | 'external'>('external');

    nameAr: 'تنظيف أحذية',   const [customerName, setCustomerName] = useState<string>('');

    category: 'special',   const [occupiedRooms, setOccupiedRooms] = useState<any[]>([]);

    price: 20, 

    available: true,  // Load occupied rooms

    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&h=400&fit=crop',  useEffect(() => {

    description: 'تنظيف وتلميع حذاء'    const rooms = getRoomsFromStorage();

  }    const occupied = rooms.filter(room => room.status === 'Occupied' && room.guestName);

];    setOccupiedRooms(occupied);

  }, []);

const categoryDictionary: Record<ServiceItem['category'], string> = {

  clothing: 'ملابس',  // compute totals

  bedding: 'مفروشات',  const computedTotal = useMemo(() => {

  special: 'خدمات خاصة'    return menu.reduce((sum, it) => {

};      const q = lines[it.id] || 0;

      return sum + q * it.price;

const formatCurrency = (value: number) => `${value.toFixed(2)} ر.س`;    }, 0);

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;  }, [menu, lines]);



function useLocalStorage<T>(key: string, initial: T) {  useEffect(() => {

  const [state, setState] = useState<T>(initial);    // init default lines when menu changes

    const initial: Record<string, number> = {};

  useEffect(() => {    menu.forEach((m) => {

    try {      initial[m.id] = 0;

      const stored = localStorage.getItem(key);    });

      if (stored) setState(JSON.parse(stored));    setLines((cur) => {

    } catch (e) {      // if already initialized, keep current to avoid resetting in edit

      console.error(`Storage error: ${key}`, e);      const hasAny = Object.keys(cur).length > 0;

    }      return hasAny ? cur : initial;

  }, [key]);    });

    // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {  }, [menu]);

    try {

      localStorage.setItem(key, JSON.stringify(state));  /* -------------------------- CRUD Operations --------------------------- */

    } catch (e) {  const openAdd = () => {

      console.error(`Storage error: ${key}`, e);    setEditingId(null);

    }    setSelectedRoom('');

  }, [key, state]);    const init: Record<string, number> = {};

    menu.forEach((m) => (init[m.id] = 0));

  return [state, setState] as const;    setLines(init);

}    setChargeToRoom(true);

    setCustomerType('external');

export default function LaundryPOS() {    setCustomerName('');

  const [services, setServices] = useLocalStorage<ServiceItem[]>(STORAGE_SERVICES_KEY, DEFAULT_SERVICES);    setIsOpen(true);

  const [orders, setOrders] = useLocalStorage<LaundryOrder[]>(STORAGE_ORDERS_KEY, []);  };

  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<'all' | ServiceItem['category']>('all');  const openEdit = (id: string) => {

  const [searchQuery, setSearchQuery] = useState('');    const req = requests.find((r) => r.id === id);

  const [customerType, setCustomerType] = useState<'internal' | 'external'>('internal');    if (!req) return;

  const [selectedRoom, setSelectedRoom] = useState('');    const mapping: Record<string, number> = {};

  const [guestName, setGuestName] = useState('');    menu.forEach((m) => (mapping[m.id] = 0));

  const [paymentMethod, setPaymentMethod] = useState<'room_charge' | 'cash' | 'card'>('room_charge');    // فحص وجود lines وأنه array قبل الاستخدام

  const [orderNotes, setOrderNotes] = useState('');    if (req.lines && Array.isArray(req.lines)) {

  const [occupiedRooms, setOccupiedRooms] = useState<Array<{ number: string; guestName?: string }>>([]);      req.lines.forEach((l) => (mapping[l.itemId] = l.qty));

  const [showCheckout, setShowCheckout] = useState(false);    }

    setEditingId(id);

  useEffect(() => {    setSelectedRoom(req.roomNumber);

    const rooms = getRoomsFromStorage();    setLines(mapping);

    const occupied = rooms    setChargeToRoom(true); // when editing, keep same accounting selection previously saved? default true

      .filter((room) => room.status === 'Occupied' && room.guestName)    setIsOpen(true);

      .map((room) => ({ number: room.number, guestName: room.guestName }));  };

    setOccupiedRooms(occupied);

  }, []);  // Handle customer type change

  const handleCustomerTypeChange = (type: 'internal' | 'external') => {

  // Filter services    setCustomerType(type);

  const filteredServices = useMemo(() => {    if (type === 'external') {

    return services.filter((item) => {      setSelectedRoom('');

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;      setCustomerName('');

      const matchesSearch = !searchQuery ||       setChargeToRoom(false); // External customers don't charge to room

        item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||    } else {

        item.name.toLowerCase().includes(searchQuery.toLowerCase());      setChargeToRoom(true); // Internal customers charge to room by default

      return matchesCategory && matchesSearch && item.available;    }

    });  };

  }, [services, selectedCategory, searchQuery]);

  // Handle room selection

  // Calculate cart totals  const handleRoomChange = (roomNum: string) => {

  const cartSubtotal = useMemo(() => {    setSelectedRoom(roomNum);

    return cart.reduce((sum, item) => sum + (item.serviceItem.price * item.quantity), 0);    if (roomNum) {

  }, [cart]);      const room = occupiedRooms.find(r => r.number === roomNum);

      if (room && room.guestName) {

  const cartTax = useMemo(() => {        setCustomerName(room.guestName);

    return cartSubtotal * TAX_RATE;      }

  }, [cartSubtotal]);    } else {

      setCustomerName('');

  const cartTotal = useMemo(() => {    }

    return cartSubtotal + cartTax;  };

  }, [cartSubtotal, cartTax]);

  const removeRequest = (id: string) => {

  const cartItemsCount = useMemo(() => {    if (!hasPermission('manage:laundry')) return;

    return cart.reduce((sum, item) => sum + item.quantity, 0);    const ok = confirm('هل أنت متأكد من حذف هذا الطلب نهائيًا؟');

  }, [cart]);    if (!ok) return;

    setRequests((prev) => prev.filter((p) => p.id !== id));

  // Cart operations    notify('تم حذف طلب المغسلة', `الطلب ${id} تم حذفه`);

  const addToCart = (serviceItem: ServiceItem) => {  };

    setCart((prev) => {

      const existing = prev.find((item) => item.serviceItem.id === serviceItem.id);  const saveRequest = () => {

      if (existing) {    if (customerType === 'internal' && !selectedRoom) {

        return prev.map((item) =>      alert('اختر رقم الغرفة');

          item.serviceItem.id === serviceItem.id      return;

            ? { ...item, quantity: item.quantity + 1 }    }

            : item    if (customerType === 'external' && !customerName.trim()) {

        );      alert('أدخل اسم العميل');

      }      return;

      return [...prev, { serviceItem, quantity: 1 }];    }

    });    const linesArr: LaundryLine[] = Object.entries(lines)

  };      .filter(([, qty]) => qty > 0)

      .map(([itemId, qty]) => ({ itemId, qty }));

  const updateCartItemQuantity = (serviceItemId: string, delta: number) => {    if (linesArr.length === 0) {

    setCart((prev) => {      alert('حدد بندًا واحدًا على الأقل بكمية أكبر من صفر');

      return prev      return;

        .map((item) =>    }

          item.serviceItem.id === serviceItemId    const total = computedTotal;

            ? { ...item, quantity: Math.max(0, item.quantity + delta) }    const customerInfo = customerType === 'internal' ? `غرفة ${selectedRoom}` : customerName;

            : item

        )    if (editingId) {

        .filter((item) => item.quantity > 0);      // update existing

    });      setRequests((prev) =>

  };        prev.map((r) =>

          r.id === editingId ? { ...r, lines: linesArr, total } : r

  const removeFromCart = (serviceItemId: string) => {        )

    setCart((prev) => prev.filter((item) => item.serviceItem.id !== serviceItemId));      );

  };      notify('تم تحديث طلب المغسلة', `${customerInfo} ــ ${formatCurrency(total)}`);

    } else {

  const clearCart = () => {      // create new

    setCart([]);      const newReq: LaundryRequest = {

    setGuestName('');        id: uid('lr_'),

    setSelectedRoom('');        roomNumber: customerType === 'internal' ? selectedRoom : '',

    setOrderNotes('');        lines: linesArr,

    setCustomerType('internal');        total,

    setPaymentMethod('room_charge');        status: 'Pending',

  };        createdAt: new Date().toISOString(),

      };

  // Complete order      setRequests((prev) => [newReq, ...prev]);

  const completeOrder = () => {      // accounting side effects

    if (!guestName.trim() || cart.length === 0) {      if (customerType === 'internal' && chargeToRoom) {

      alert('يرجى إدخال اسم العميل واختيار الخدمات');        // Example: append to room ledger in localStorage under key ROOM_LEDGER_<roomNumber>

      return;        try {

    }          const ledgerKey = `ROOM_LEDGER_${selectedRoom}`;

          const raw = localStorage.getItem(ledgerKey);

    if (customerType === 'internal' && !selectedRoom) {          const ledger = raw ? JSON.parse(raw) : [];

      alert('يرجى اختيار الغرفة');          ledger.push({

      return;            id: uid('ledger_'),

    }            ts: new Date().toISOString(),

            desc: `طلب مغسلة بقيمة ${formatCurrency(total)}`,

    const orderItems: OrderItem[] = cart.map((item) => ({            amount: total,

      serviceItemId: item.serviceItem.id,          });

      serviceItemName: item.serviceItem.nameAr,          localStorage.setItem(ledgerKey, JSON.stringify(ledger));

      quantity: item.quantity,        } catch {}

      price: item.serviceItem.price      }

    }));      // register event to guest requests area (placeholder)

      notify('طلب مغسلة جديد', `${customerInfo} ــ ${formatCurrency(total)}`);

    const newOrder: LaundryOrder = {    }

      id: uid(),    setIsOpen(false);

      roomNumber: customerType === 'internal' ? selectedRoom : '',    setEditingId(null);

      guestName: guestName,  };

      items: orderItems,

      totalAmount: cartSubtotal,  const changeStatus = (id: string, next: Status) => {

      taxAmount: cartTax,    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));

      grandTotal: cartTotal,    const meta = STATUS_META[next];

      status: 'pending',    notify(`حالة الطلب تغيرت إلى ${meta.label}`, `طلب ${id}`);

      orderDate: new Date().toISOString(),  };

      customerType: customerType,

      paymentMethod: customerType === 'internal' ? paymentMethod : 'cash',  const sendToReception = (request: LaundryRequest) => {

      notes: orderNotes    // Get current user as the assigned employee (or create a default reception user)

    };    const currentUser = typeof window !== 'undefined' ? localStorage.getItem('hotel_user') : null;

    let assignedEmployee = 'reception_staff';

    setOrders((prev) => [newOrder, ...prev]);    

        if (currentUser) {

    // Play notification sound      try {

    playNotificationSound('new-request');        const userData = JSON.parse(currentUser);

        // If current user is not reception, assign to a default reception account

    // Clear cart and form        assignedEmployee = userData.role === 'reception' ? userData.username : 'reception_staff';

    clearCart();      } catch (e) {

    setShowCheckout(false);        console.error('Error parsing user data', e);

      }

    alert('✅ تم إنشاء الطلب بنجاح!');    }

  };

    // Create guest request from laundry request

  return (    const guestRequest = {

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" dir="rtl">      id: uid(),

      <div className="flex h-screen">      room: request.roomNumber,

        {/* Main POS Area - Left Side */}      guest: `نزيل غرفة ${request.roomNumber}`,

        <div className="flex-1 flex flex-col overflow-hidden">      phone: '',

          {/* Header */}      type: 'طلب مغسلة',

          <div className="bg-white dark:bg-slate-800 shadow-md p-4 border-b border-cyan-200 dark:border-slate-700">      notes: `${request.lines.map(line => {

            <div className="flex items-center justify-between">        const item = menu.find(m => m.id === line.itemId);

              <div className="flex items-center gap-3">        return `${item?.name || 'صنف'} × ${line.qty}`;

                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">      }).join(', ')}\nالمبلغ: ${formatCurrency(request.total)}`,

                  <Shirt className="h-6 w-6 text-white" />      status: 'pending',

                </div>      createdAt: new Date().toISOString(),

                <div>      priority: 'medium' as const,

                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">المغسلة</h1>      assignedEmployee: assignedEmployee,

                  <p className="text-sm text-slate-600 dark:text-slate-400">نظام نقطة البيع</p>      employeeApprovalStatus: 'pending' as const,

                </div>      linkedSection: 'laundry',

              </div>      originalOrderId: request.id

                  };

              <div className="flex items-center gap-3">

                <div className="text-right">    // Save to guest requests

                  <p className="text-xs text-slate-600 dark:text-slate-400">إجمالي المبيعات اليوم</p>    const requestsData = localStorage.getItem('guest-requests');

                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">    const guestRequests = requestsData ? JSON.parse(requestsData) : [];

                    {formatCurrency(    guestRequests.unshift(guestRequest);

                      orders    localStorage.setItem('guest-requests', JSON.stringify(guestRequests));

                        .filter(o => o.status === 'delivered' && new Date(o.orderDate).toDateString() === new Date().toDateString())

                        .reduce((sum, o) => sum + o.grandTotal, 0)    // Update request status to indicate it's sent to reception

                    )}    setRequests((prev) => prev.map((r) => 

                  </p>      r.id === request.id ? { ...r, sentToReception: true, receptionRequestId: guestRequest.id } : r

                </div>    ));

              </div>

            </div>    // Trigger storage event for other tabs/components

    window.dispatchEvent(new Event('storage'));

            {/* Search Bar */}

            <div className="mt-4">    // Play notification sound

              <div className="relative">    playNotificationSound('new-request');

                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />

                <Input    alert('تم إرسال الطلب للاستقبال بنجاح ✓');

                  placeholder="ابحث عن خدمة..."  };

                  value={searchQuery}

                  onChange={(e) => setSearchQuery(e.target.value)}  /* -------------------------- Utility Renderers -------------------------- */

                  className="pr-10 border-cyan-200 dark:border-slate-600 focus:border-cyan-400 dark:focus:border-cyan-500"  const countNew = requests.filter((r) => r.status === 'Pending').length;

                />  const countCompletedToday = requests.filter((r) => {

              </div>    if (r.status !== 'Completed') return false;

            </div>    const date = new Date(r.createdAt).toLocaleDateString();

          </div>    return date === new Date().toLocaleDateString();

  }).length;

          {/* Category Tabs */}

          <div className="bg-white dark:bg-slate-800 border-b border-cyan-200 dark:border-slate-700 px-4 py-2">  return (

            <div className="flex gap-2 overflow-x-auto">    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">

              <Button      <div className="max-w-7xl mx-auto">

                variant={selectedCategory === 'all' ? 'default' : 'outline'}        {/* Header */}

                onClick={() => setSelectedCategory('all')}        <div className="mb-8">

                className={selectedCategory === 'all' ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-cyan-300 dark:border-slate-600'}          <h1 className="text-3xl font-bold text-white mb-2">إدارة المغسلة</h1>

              >          <p className="text-purple-200">تتبع ومراقبة طلبات الغسيل والكوي</p>

                الكل        </div>

              </Button>

              {Object.entries(categoryDictionary).map(([key, label]) => (        <div className="space-y-6">

                <Button          {/* Mini Dashboard */}

                  key={key}          <div className="flex gap-4 items-center">

                  variant={selectedCategory === key ? 'default' : 'outline'}            <div className="flex-1 grid grid-cols-2 gap-4">

                  onClick={() => setSelectedCategory(key as ServiceItem['category'])}              <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl flex items-center justify-between">

                  className={selectedCategory === key ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-cyan-300 dark:border-slate-600'}                <div>

                >                  <div className="text-sm text-purple-200">طلبات جديدة</div>

                  {label}                  <div className="text-3xl font-bold text-white">{countNew}</div>

                </Button>                </div>

              ))}                <div className="text-yellow-400">

            </div>                  <BellRing size={32} />

          </div>                </div>

              </div>

          {/* Services Grid */}              <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl flex items-center justify-between">

          <div className="flex-1 overflow-y-auto p-4">                <div>

            {filteredServices.length === 0 ? (                  <div className="text-sm text-purple-200">مكتمل اليوم</div>

              <div className="flex items-center justify-center h-full">                  <div className="text-3xl font-bold text-white">{countCompletedToday}</div>

                <p className="text-slate-400 text-center">لا توجد خدمات متاحة</p>                </div>

              </div>                <div className="text-green-400">

            ) : (                  <CheckCircle size={32} />

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">                </div>

                {filteredServices.map((item) => (              </div>

                  <Card             </div>

                    key={item.id}

                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-cyan-400 dark:hover:border-cyan-500 overflow-hidden"            <div>

                    onClick={() => addToCart(item)}              <button

                  >                onClick={openAdd}

                    <CardContent className="p-0">                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"

                      {/* Image */}              >

                      <div className="relative h-40 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 overflow-hidden">                <Plus size={20} />

                        {item.image ? (                إضافة طلب غسيل

                          <img               </button>

                            src={item.image}             </div>

                            alt={item.nameAr}          </div>

                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"

                          />          {/* Table */}

                        ) : (          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl overflow-hidden">

                          <div className="w-full h-full flex items-center justify-center">            <div className="overflow-x-auto">

                            <Shirt className="h-16 w-16 text-cyan-300 dark:text-cyan-600" />              <table className="w-full min-w-[800px] table-auto">

                          </div>                <thead className="bg-white/5">

                        )}                  <tr>

                                            <th className="text-right px-6 py-4 font-semibold text-white">رقم الغرفة</th>

                        {/* Quick Add Button */}                    <th className="text-right px-6 py-4 font-semibold text-white">الأصناف</th>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">                    <th className="text-right px-6 py-4 font-semibold text-white">الإجمالي</th>

                          <Button size="sm" className="bg-white text-cyan-600 hover:bg-cyan-50">                    <th className="text-right px-6 py-4 font-semibold text-white">الحالة</th>

                            <Plus className="h-4 w-4 ml-1" />                    <th className="text-right px-6 py-4 font-semibold text-white">الإجراءات</th>

                            إضافة                  </tr>

                          </Button>                </thead>

                        </div>                <tbody>

                  {requests.length === 0 && (

                        {/* Category Badge */}                    <tr>

                        <Badge className="absolute top-2 right-2 bg-white/90 text-cyan-700 border-cyan-300">                      <td colSpan={5} className="p-8 text-center text-purple-200">

                          {categoryDictionary[item.category]}                        لا توجد طلبات حالياً

                        </Badge>                      </td>

                      </div>                    </tr>

                  )}

                      {/* Info */}                  {requests.map((r) => (

                      <div className="p-3">                    <tr key={r.id} className="border-t border-white/10 hover:bg-slate-700/30">

                        <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1 truncate">                      <td className="px-6 py-4 text-right text-white font-medium">{r.roomNumber}</td>

                          {item.nameAr}                      <td className="px-6 py-4 text-right text-purple-200">

                        </h3>                        {r.lines && Array.isArray(r.lines)

                        {item.description && (                          ? r.lines

                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">                              .map((ln) => {

                            {item.description}                                const def = menu.find((m) => m.id === ln.itemId);

                          </p>                                return def ? `${def.name} (x${ln.qty})` : `${ln.itemId} (x${ln.qty})`;

                        )}                              })

                        <div className="flex items-center justify-between">                              .join('، ')

                          <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">                          : 'لا توجد عناصر'}

                            {formatCurrency(item.price)}                      </td>

                          </p>                      <td className="px-6 py-4 text-right font-bold text-green-400">{formatCurrency(r.total)}</td>

                          <span className="text-xs text-slate-500 dark:text-slate-400">للقطعة</span>                      <td className="px-6 py-4 text-right">

                        </div>                        <StatusBadge status={r.status} />

                      </div>                      </td>

                    </CardContent>                      <td className="px-6 py-4 text-right">

                  </Card>                        <div className="flex justify-end items-center gap-2 flex-wrap">

                ))}                          <button

              </div>                            title="تعديل"

            )}                            onClick={() => openEdit(r.id)}

          </div>                            className="p-2 rounded-lg hover:bg-slate-700/50 text-blue-400 hover:text-blue-300 transition-colors"

        </div>                          >

                            <Edit2 size={18} />

        {/* Cart Sidebar - Right Side */}                          </button>

        <div className="w-96 bg-white dark:bg-slate-800 border-r border-cyan-200 dark:border-slate-700 flex flex-col shadow-2xl">

          {/* Cart Header */}                          <button

          <div className="p-4 border-b border-cyan-200 dark:border-slate-700 bg-gradient-to-r from-cyan-500 to-blue-500">                            title="حذف"

            <div className="flex items-center justify-between text-white">                            onClick={() => removeRequest(r.id)}

              <div className="flex items-center gap-2">                            className={`p-2 rounded-lg hover:bg-slate-700/50 text-red-400 hover:text-red-300 transition-colors ${hasPermission('manage:laundry') ? '' : 'opacity-50 cursor-not-allowed'}`}

                <ShoppingCart className="h-5 w-5" />                            disabled={!hasPermission('manage:laundry')}

                <h2 className="text-lg font-bold">السلة</h2>                          >

              </div>                            <Trash2 size={18} />

              <Badge className="bg-white text-cyan-600 font-bold">                          </button>

                {cartItemsCount} قطعة

              </Badge>                          {/* State transition buttons */}

            </div>                          {r.status === 'Pending' && (

          </div>                            <button

                              onClick={() => changeStatus(r.id, 'InProgress')}

          {/* Cart Items */}                              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"

          <div className="flex-1 overflow-y-auto p-4 space-y-3">                            >

            {cart.length === 0 ? (                              بدء الغسيل

              <div className="flex flex-col items-center justify-center h-full text-slate-400">                            </button>

                <ShoppingCart className="h-16 w-16 mb-2 opacity-20" />                          )}

                <p className="text-center">السلة فارغة</p>                          {r.status === 'InProgress' && (

                <p className="text-sm text-center mt-1">اضغط على الخدمات لإضافتها</p>                            <button

              </div>                              onClick={() => changeStatus(r.id, 'ReadyForPickup')}

            ) : (                              className="px-3 py-1 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors"

              cart.map((item) => (                            >

                <Card key={item.serviceItem.id} className="border-cyan-200 dark:border-slate-600">                              جاهز للاستلام

                  <CardContent className="p-3">                            </button>

                    <div className="flex items-start gap-3">                          )}

                      {/* Image */}                          {r.status === 'ReadyForPickup' && (

                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 flex-shrink-0 overflow-hidden">                            <button

                        {item.serviceItem.image ? (                              onClick={() => changeStatus(r.id, 'Completed')}

                          <img                               className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"

                            src={item.serviceItem.image}                             >

                            alt={item.serviceItem.nameAr}                              تم التسليم

                            className="w-full h-full object-cover"                            </button>

                          />                          )}

                        ) : (

                          <div className="w-full h-full flex items-center justify-center">                          {/* Send to reception button */}

                            <Shirt className="h-6 w-6 text-cyan-400" />                          {!r.sentToReception && (r.status === 'Pending' || r.status === 'InProgress') && (

                          </div>                            <button

                        )}                              onClick={() => sendToReception(r)}

                      </div>                              className="px-3 py-1 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700 transition-colors flex items-center gap-1"

                              title="إرسال للاستقبال"

                      {/* Info */}                            >

                      <div className="flex-1 min-w-0">                              <Send size={14} />

                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm truncate">                              إرسال للاستقبال

                          {item.serviceItem.nameAr}                            </button>

                        </h3>                          )}

                        <p className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">

                          {formatCurrency(item.serviceItem.price)}                          {r.sentToReception && (

                        </p>                            <span className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs flex items-center gap-1">

                              <CheckCircle size={14} />

                        {/* Quantity Controls */}                              تم الإرسال

                        <div className="flex items-center gap-2 mt-2">                            </span>

                          <Button                          )}

                            size="sm"                        </div>

                            variant="outline"                      </td>

                            className="h-7 w-7 p-0 border-cyan-300 dark:border-slate-600"                    </tr>

                            onClick={() => updateCartItemQuantity(item.serviceItem.id, -1)}                  ))}

                          >                </tbody>

                            <Minus className="h-3 w-3" />              </table>

                          </Button>            </div>

                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-8 text-center">          </div>

                            {item.quantity}        </div>

                          </span>

                          <Button        {/* Modal */}

                            size="sm"        {isOpen && (

                            variant="outline"          <div className="fixed inset-0 flex items-center justify-center z-50">

                            className="h-7 w-7 p-0 border-cyan-300 dark:border-slate-600"            <div

                            onClick={() => updateCartItemQuantity(item.serviceItem.id, 1)}              className="absolute inset-0 bg-black/60 backdrop-blur-sm"

                          >              onClick={() => setIsOpen(false)}

                            <Plus className="h-3 w-3" />            />

                          </Button>            <div className="relative max-w-4xl w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-8 z-10 mx-4">

                          <Button              <h3 className="text-xl font-bold text-white mb-6">{editingId ? 'تعديل طلب غسيل' : 'إضافة طلب غسيل'}</h3>

                            size="sm"

                            variant="ghost"              <div className="grid grid-cols-2 gap-6">

                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mr-auto"                <div className="col-span-2">

                            onClick={() => removeFromCart(item.serviceItem.id)}                  <label className="block text-sm text-purple-200 mb-2">نوع العميل</label>

                          >                  <RadioGroup

                            <Trash2 className="h-3 w-3" />                    value={customerType}

                          </Button>                    onValueChange={handleCustomerTypeChange}

                        </div>                    className="flex gap-6"

                      </div>                  >

                    <div className="flex items-center space-x-2">

                      {/* Item Total */}                      <RadioGroupItem value="internal" id="internal" />

                      <div className="text-right">                      <label htmlFor="internal" className="text-white cursor-pointer">عميل داخلي (غرفة)</label>

                        <p className="font-bold text-slate-800 dark:text-white">                    </div>

                          {formatCurrency(item.serviceItem.price * item.quantity)}                    <div className="flex items-center space-x-2">

                        </p>                      <RadioGroupItem value="external" id="external" />

                      </div>                      <label htmlFor="external" className="text-white cursor-pointer">عميل خارجي</label>

                    </div>                    </div>

                  </CardContent>                  </RadioGroup>

                </Card>                </div>

              ))

            )}                {customerType === 'internal' && (

          </div>                  <>

                    <div className="col-span-2 md:col-span-1">

          {/* Cart Footer */}                      <label className="block text-sm text-purple-200 mb-2">رقم الغرفة</label>

          {cart.length > 0 && (                      <Select value={selectedRoom} onValueChange={handleRoomChange}>

            <div className="border-t border-cyan-200 dark:border-slate-700 p-4 space-y-3 bg-cyan-50 dark:bg-slate-900">                        <SelectTrigger className="w-full bg-white/10 border border-white/20 text-white">

              {/* Subtotal */}                          <SelectValue placeholder="اختر غرفة مشغولة" />

              <div className="flex items-center justify-between text-sm">                        </SelectTrigger>

                <span className="text-slate-600 dark:text-slate-400">المجموع الفرعي:</span>                        <SelectContent>

                <span className="font-semibold text-slate-800 dark:text-white">                          {occupiedRooms.map((room) => (

                  {formatCurrency(cartSubtotal)}                            <SelectItem key={room.number} value={room.number}>

                </span>                              {room.number}

              </div>                            </SelectItem>

                          ))}

              {/* Tax */}                        </SelectContent>

              <div className="flex items-center justify-between text-sm">                      </Select>

                <span className="text-slate-600 dark:text-slate-400">الضريبة ({(TAX_RATE * 100)}%):</span>                    </div>

                <span className="font-semibold text-slate-800 dark:text-white">                    <div className="col-span-2 md:col-span-1">

                  {formatCurrency(cartTax)}                      <label className="block text-sm text-purple-200 mb-2">اسم العميل</label>

                </span>                      <input

              </div>                        type="text"

                        value={customerName}

              {/* Total */}                        readOnly

              <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-cyan-200 dark:border-slate-700">                        placeholder="سيتم ملؤه تلقائياً"

                <span className="text-slate-700 dark:text-slate-300">الإجمالي:</span>                        className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300"

                <span className="text-2xl text-cyan-600 dark:text-cyan-400">                      />

                  {formatCurrency(cartTotal)}                    </div>

                </span>                  </>

              </div>                )}



              {/* Action Buttons */}                {customerType === 'external' && (

              <div className="grid grid-cols-2 gap-2">                  <div className="col-span-2 md:col-span-1">

                <Button                    <label className="block text-sm text-purple-200 mb-2">اسم العميل</label>

                  variant="outline"                    <input

                  onClick={clearCart}                      type="text"

                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"                      value={customerName}

                >                      onChange={(e) => setCustomerName(e.target.value)}

                  <X className="h-4 w-4 ml-1" />                      placeholder="أدخل اسم العميل"

                  مسح                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"

                </Button>                    />

                <Button                  </div>

                  onClick={() => setShowCheckout(true)}                )}

                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"

                >                <div className="col-span-2 md:col-span-1">

                  <CreditCard className="h-4 w-4 ml-1" />                  <label className="block text-sm text-purple-200 mb-2">طريقة المحاسبة</label>

                  إتمام                  {customerType === 'internal' ? (

                </Button>                    <div className="px-4 py-3 rounded-lg bg-purple-600 text-white text-center">

              </div>                      تحميل على الشقة (تلقائي للعملاء الداخليين)

            </div>                    </div>

          )}                  ) : (

        </div>                    <div className="flex gap-2">

      </div>                      <button

                        onClick={() => setChargeToRoom(true)}

      {/* Checkout Dialog */}                        className={`px-4 py-3 rounded-lg transition-colors ${chargeToRoom ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200 hover:bg-slate-700/50'}`}

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>                      >

        <DialogContent className="sm:max-w-md border-cyan-200 dark:border-slate-700">                        تحميل على الشقة

          <DialogHeader>                      </button>

            <DialogTitle className="text-xl font-bold">إتمام الطلب</DialogTitle>                      <button

          </DialogHeader>                        onClick={() => setChargeToRoom(false)}

                                  className={`px-4 py-3 rounded-lg transition-colors ${!chargeToRoom ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200 hover:bg-slate-700/50'}`}

          <div className="space-y-4">                      >

            {/* Customer Type */}                        إيراد خدمات

            <div>                      </button>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">                    </div>

                نوع العميل                  )}

              </label>                </div>

              <div className="grid grid-cols-2 gap-2">              </div>

                <Button

                  variant={customerType === 'internal' ? 'default' : 'outline'}              <div className="mt-6 border-t border-white/20 pt-6 space-y-4 max-h-80 overflow-auto">

                  onClick={() => setCustomerType('internal')}                {menu.map((m) => (

                  className={customerType === 'internal' ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-cyan-300 dark:border-slate-600'}                  <div key={m.id} className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-lg">

                >                    <div className="text-right">

                  <UserCircle className="h-4 w-4 ml-1" />                      <div className="font-medium text-white">{m.name}</div>

                  نزيل                      <div className="text-sm text-purple-200">{formatCurrency(m.price)} / وحدة</div>

                </Button>                    </div>

                <Button                    <div className="flex items-center gap-3">

                  variant={customerType === 'external' ? 'default' : 'outline'}                      <button

                  onClick={() => setCustomerType('external')}                        onClick={() =>

                  className={customerType === 'external' ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-cyan-300 dark:border-slate-600'}                          setLines((s) => ({ ...s, [m.id]: Math.max(0, (s[m.id] || 0) - 1) }))

                >                        }

                  <UserCircle className="h-4 w-4 ml-1" />                        className="p-2 rounded-lg bg-white/10 hover:bg-slate-700/50 text-white transition-colors"

                  خارجي                        aria-label={`نقص ${m.name}`}

                </Button>                      >

              </div>                        <Minus size={16} />

            </div>                      </button>

                      <div className="w-16 text-center text-white font-bold text-lg">{lines[m.id] || 0}</div>

            {/* Room Selection (for internal customers) */}                      <button

            {customerType === 'internal' && (                        onClick={() =>

              <div>                          setLines((s) => ({ ...s, [m.id]: (s[m.id] || 0) + 1 }))

                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">                        }

                  الغرفة                        className="p-2 rounded-lg bg-white/10 hover:bg-slate-700/50 text-white transition-colors"

                </label>                        aria-label={`زيادة ${m.name}`}

                <Select value={selectedRoom} onValueChange={setSelectedRoom}>                      >

                  <SelectTrigger className="border-cyan-200 dark:border-slate-600">                        <Plus size={16} />

                    <SelectValue placeholder="اختر الغرفة" />                      </button>

                  </SelectTrigger>                    </div>

                  <SelectContent>                  </div>

                    {occupiedRooms.map((room) => (                ))}

                      <SelectItem key={room.number} value={room.number}>              </div>

                        {room.number} - {room.guestName}

                      </SelectItem>              <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-6">

                    ))}                <div className="text-right">

                  </SelectContent>                  <div className="text-sm text-purple-200">الإجمالي</div>

                </Select>                  <div className="text-3xl font-bold text-green-400">{formatCurrency(computedTotal)}</div>

              </div>                </div>

            )}                <div className="flex gap-3">

                  <button

            {/* Guest Name */}                    onClick={() => {

            <div>                      setIsOpen(false);

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">                    }}

                اسم العميل                    className="px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-slate-700/50 transition-colors"

              </label>                  >

              <Input                    إلغاء

                value={guestName}                  </button>

                onChange={(e) => setGuestName(e.target.value)}                  <button

                placeholder="أدخل اسم العميل"                    onClick={saveRequest}

                className="border-cyan-200 dark:border-slate-600"                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"

              />                  >

            </div>                    إرسال الطلب

                  </button>

            {/* Order Notes */}                </div>

            <div>              </div>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">            </div>

                ملاحظات (اختياري)          </div>

              </label>        )}

              <Input      </div>

                value={orderNotes}    </div>

                onChange={(e) => setOrderNotes(e.target.value)}  );

                placeholder="مثال: بدون نشا، كي خفيف"}

                className="border-cyan-200 dark:border-slate-600"

              />/* ------------------------------- StatusBadge Component ------------------- */

            </div>function StatusBadge({ status }: { status: Status }) {

  const meta = STATUS_META[status];

            {/* Payment Method */}  

            <div>  // حماية: إذا كانت الحالة غير معروفة، استخدم Pending كافتراضي

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">  if (!meta) {

                طريقة الدفع    console.warn(`Unknown status: ${status}, using Pending as fallback`);

              </label>    const fallbackMeta = STATUS_META['Pending'];

              <div className="grid grid-cols-3 gap-2">    const Icon = fallbackMeta.Icon;

                <Button    return (

                  variant={paymentMethod === 'room_charge' ? 'default' : 'outline'}      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white ${fallbackMeta.bg} shadow-lg`}>

                  onClick={() => setPaymentMethod('room_charge')}        <Icon size={16} />

                  className={paymentMethod === 'room_charge' ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-cyan-300 dark:border-slate-600'}        <span className="text-sm font-medium">{status || 'غير محدد'}</span>

                  disabled={customerType === 'external'}      </div>

                >    );

                  على الحساب  }

                </Button>  

                <Button  const Icon = meta.Icon;

                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}  return (

                  onClick={() => setPaymentMethod('cash')}    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white ${meta.bg} shadow-lg`}>

                  className={paymentMethod === 'cash' ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-cyan-300 dark:border-slate-600'}      <Icon size={16} />

                >      <span className="text-sm font-medium">{meta.label}</span>

                  <Wallet className="h-4 w-4" />    </div>

                </Button>  );

                <Button}
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className={paymentMethod === 'card' ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-cyan-300 dark:border-slate-600'}
                >
                  <CreditCard className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-cyan-50 dark:bg-slate-900 rounded-lg p-3 border border-cyan-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">عدد القطع:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{cartItemsCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">المجموع الفرعي:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">الضريبة ({(TAX_RATE * 100)}%):</span>
                <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(cartTax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-cyan-200 dark:border-slate-700 pt-2">
                <span className="text-slate-700 dark:text-slate-300">الإجمالي:</span>
                <span className="text-cyan-600 dark:text-cyan-400">{formatCurrency(cartTotal)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
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
