﻿'use client';'use client'



import { useEffect, useMemo, useState } from 'react';import React, { useState, useEffect, useCallback } from 'react'

import { Utensils, ShoppingCart, X, Plus, Minus, Trash2, CreditCard, Wallet, UserCircle, CheckCircle, Search, ChefHat } from 'lucide-react';import { useRouter } from 'next/navigation'

import { getRoomsFromStorage } from '@/lib/rooms-data';import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge';import { Button } from '@/components/ui/button'

import { Button } from '@/components/ui/button';import { Input } from '@/components/ui/input'

import { Card, CardContent } from '@/components/ui/card';import { Label } from '@/components/ui/label'

import { Input } from '@/components/ui/input';import { Badge } from '@/components/ui/badge'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';import { Separator } from '@/components/ui/separator'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { playNotificationSound } from '@/lib/notification-sounds';import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { MenuItem, Order } from '@/lib/restaurant-db';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';import {

  Plus,

type MenuItem = {  Edit2,

  id: string;  Trash2,

  name: string;  ChefHat,

  nameAr: string;  DollarSign,

  category: 'appetizer' | 'main' | 'drink' | 'dessert';  Clock,

  price: number;  Users,

  available: boolean;  TrendingUp,

  preparationTime: number;  UtensilsCrossed,

  image?: string;  Beef,

  description?: string;  Fish,

};  Salad,

  Coffee,

type CartItem = {  IceCream,

  menuItem: MenuItem;  ShoppingCart

  quantity: number;} from 'lucide-react'

  notes?: string;

};const categories = ['مقبلات', 'أطباق رئيسية', 'مشروبات', 'حلويات']



type OrderItem = {const categoryIcons = {

  menuItemId: string;  'مقبلات': Salad,

  menuItemName: string;  'أطباق رئيسية': Beef,

  quantity: number;  'مشروبات': Coffee,

  price: number;  'حلويات': IceCream

  notes?: string;}

};export default function RestaurantPage() {

  const router = useRouter()

type RestaurantOrder = {  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  id: string;  const [orders, setOrders] = useState<Order[]>([])

  roomNumber: string;  const [currentOrder, setCurrentOrder] = useState<{menuItem: MenuItem, quantity: number}[]>([])

  guestName: string;  const [customerName, setCustomerName] = useState('')

  tableNumber?: string;  const [customerType, setCustomerType] = useState<'internal' | 'external'>('external')

  items: OrderItem[];  const [roomNumber, setRoomNumber] = useState('')

  totalAmount: number;  const [occupiedRooms, setOccupiedRooms] = useState<any[]>([])

  status: OrderStatus;  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'room'>('cash')

  orderDate: string;  const [orderNotes, setOrderNotes] = useState('')

  paymentMethod: 'room_charge' | 'cash' | 'card';  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'statistics'>('orders')

  orderNotes?: string;  const [selectedCategory, setSelectedCategory] = useState<string>('الكل')

};  const [isEditingMenu, setIsEditingMenu] = useState(false)

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

const STORAGE_MENU_KEY = 'restaurant_menu';  const [newMenuItem, setNewMenuItem] = useState({

const STORAGE_ORDERS_KEY = 'restaurant_orders';    name: '',

    category: 'مقبلات',

const DEFAULT_MENU: MenuItem[] = [    price: 0,

  // مقبلات    description: '',

  {     available: true

    id: 'hummus',   })

    name: 'Hummus', 

    nameAr: 'حمص',   useEffect(() => {

    category: 'appetizer',     const loadData = async () => {

    price: 18,       setOccupiedRooms([]); // إعادة تعيين الحالة قبل التحميل

    available: true,       try {

    preparationTime: 5,        const [menuRes, ordersRes, roomsRes] = await Promise.all([

    image: 'https://images.unsplash.com/photo-1599398054066-846f68d2f4e4?w=400&h=400&fit=crop',          fetch('/api/restaurant/menu', { cache: 'no-store' }),

    description: 'حمص طازج مع زيت زيتون'          fetch('/api/restaurant/orders', { cache: 'no-store' }),

  },          fetch('/api/rooms-catalog', { 

  {             method: 'GET',

    id: 'fattoush',             headers: { 'Content-Type': 'application/json' },

    name: 'Fattoush',             cache: 'no-store' 

    nameAr: 'فتوش',           })

    category: 'appetizer',         ]);

    price: 22, 

    available: true,         const menuJson = await menuRes.json();

    preparationTime: 7,        const ordersJson = await ordersRes.json();

    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=400&fit=crop',        const roomsJson = await roomsRes.json();

    description: 'سلطة فتوش لبنانية'

  },        if (menuJson.success) {

  {           setMenuItems(menuJson.data);

    id: 'vine-leaves',         } else {

    name: 'Stuffed Vine Leaves',           console.error("فشل في تحميل القائمة:", menuJson.message);

    nameAr: 'ورق عنب',         }

    category: 'appetizer', 

    price: 25,         if (ordersJson.success) {

    available: true,           setOrders(ordersJson.data.map((o: any) => ({...o, orderTime: new Date(o.orderTime)})));

    preparationTime: 10,        } else {

    image: 'https://images.unsplash.com/photo-1587740908075-9ea5eb93297c?w=400&h=400&fit=crop',          console.error("فشل في تحميل الطلبات:", ordersJson.message);

    description: 'ورق عنب محشي أرز ولحم'        }

  },

  {         if (roomsJson.success && roomsJson.data) {

    id: 'soup',           const occupied = roomsJson.data.filter((room: any) => room.status === 'Occupied' && room.guestName);

    name: 'Lentil Soup',           setOccupiedRooms(occupied);

    nameAr: 'شوربة عدس',           console.log('تم تحميل الغرف المشغولة بنجاح');

    category: 'appetizer',         } else {

    price: 15,           console.error("فشل في تحميل الغرف:", roomsJson.message);

    available: true,         }

    preparationTime: 5,

    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop',      } catch (error) {

    description: 'شوربة عدس ساخنة'        console.error("فشل في تحميل البيانات الأولية:", error);

  },      }

      };

  // أطباق رئيسية    loadData();

  {   }, [])

    id: 'kabsa', 

    name: 'Chicken Kabsa',   // إضافة عنصر للطلب الحالي

    nameAr: 'كبسة دجاج',   const addToCurrentOrder = (menuItem: MenuItem) => {

    category: 'main',     const existingIndex = currentOrder.findIndex(item => item.menuItem.id === menuItem.id)

    price: 45,     if (existingIndex >= 0) {

    available: true,       const newOrder = [...currentOrder]

    preparationTime: 25,      newOrder[existingIndex].quantity += 1

    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=400&fit=crop',      setCurrentOrder(newOrder)

    description: 'كبسة دجاج سعودية أصلية'    } else {

  },      setCurrentOrder([...currentOrder, { menuItem, quantity: 1 }])

  {     }

    id: 'mandi',   }

    name: 'Lamb Mandi', 

    nameAr: 'مندي لحم',   // إزالة عنصر من الطلب الحالي

    category: 'main',   const removeFromCurrentOrder = (menuItemId: string) => {

    price: 55,     setCurrentOrder(currentOrder.filter(item => item.menuItem.id !== menuItemId))

    available: true,   }

    preparationTime: 30,

    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=400&fit=crop',  // تحديث كمية عنصر في الطلب

    description: 'مندي لحم على الطريقة اليمنية'  const updateQuantity = (menuItemId: string, quantity: number) => {

  },    if (quantity <= 0) {

  {       removeFromCurrentOrder(menuItemId)

    id: 'grilled-chicken',       return

    name: 'Grilled Chicken',     }

    nameAr: 'دجاج مشوي', 

    category: 'main',     const newOrder = currentOrder.map(item =>

    price: 38,       item.menuItem.id === menuItemId ? { ...item, quantity } : item

    available: true,     )

    preparationTime: 20,    setCurrentOrder(newOrder)

    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=400&fit=crop',  }

    description: 'دجاج مشوي مع الخضار'

  },  // التعامل مع تغيير نوع العميل

  {   const handleCustomerTypeChange = (type: 'internal' | 'external') => {

    id: 'fish',     setCustomerType(type)

    name: 'Grilled Fish',     if (type === 'external') {

    nameAr: 'سمك مشوي',       setRoomNumber('')

    category: 'main',       setCustomerName('')

    price: 48,     }

    available: true,   }

    preparationTime: 22,

    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop',  // التعامل مع اختيار الغرفة

    description: 'سمك مشوي طازج'  const handleRoomChange = (roomNum: string) => {

  },    setRoomNumber(roomNum)

  {     if (roomNum) {

    id: 'shawarma',       const room = occupiedRooms.find(r => r.number === roomNum)

    name: 'Chicken Shawarma',       if (room && room.guestName) {

    nameAr: 'شاورما دجاج',         setCustomerName(room.guestName)

    category: 'main',       }

    price: 28,     } else {

    available: true,       setCustomerName('')

    preparationTime: 12,    }

    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=400&fit=crop',  }

    description: 'شاورما دجاج لبنانية'

  },  // حساب إجمالي الطلب

  {   const calculateTotal = () => {

    id: 'biryani',     return currentOrder.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0)

    name: 'Chicken Biryani',   }

    nameAr: 'برياني دجاج', 

    category: 'main',   // إنشاء طلب جديد

    price: 42,   const createOrder = async () => {

    available: true,     if (currentOrder.length === 0 || !customerName.trim()) {

    preparationTime: 28,      alert('يرجى إضافة عناصر للطلب وإدخال اسم العميل')

    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop',      return

    description: 'برياني دجاج هندي حار'    }

  },

      const orderData = {

  // مشروبات      items: currentOrder,

  {       customerName: customerName.trim(),

    id: 'fresh-juice',       roomNumber: customerType === 'internal' ? roomNumber : undefined,

    name: 'Fresh Orange Juice',       totalAmount: calculateTotal(),

    nameAr: 'عصير برتقال طازج',       paymentMethod,

    category: 'drink',       notes: orderNotes.trim() || undefined

    price: 12,     };

    available: true, 

    preparationTime: 3,    try {

    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop',      const response = await fetch('/api/restaurant/orders', {

    description: 'عصير برتقال طبيعي 100%'        method: 'POST',

  },        headers: { 'Content-Type': 'application/json' },

  {         body: JSON.stringify(orderData),

    id: 'lemonade',       });

    name: 'Lemonade',       const result = await response.json();

    nameAr: 'ليمونادة',       if (result.success) {

    category: 'drink',         setOrders([result.data, ...orders]);

    price: 10,       } else {

    available: true,         throw new Error(result.message);

    preparationTime: 3,      }

    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f0b?w=400&h=400&fit=crop',    } catch (error) {

    description: 'ليمونادة منعشة'      console.error("Failed to create order:", error);

  },      alert('فشل في إنشاء الطلب. يرجى المحاولة مرة أخرى.');

  {     }

    id: 'soft-drink', 

    name: 'Soft Drink',     // إضافة للسجل المالي للغرفة إذا كان الدفع على الغرفة

    nameAr: 'مشروب غازي',     if (paymentMethod === 'room' && roomNumber.trim()) {

    category: 'drink',       // في التطبيق الحقيقي، هذا سيكون استدعاء API

    price: 5,       // await fetch(`/api/accounting/ledger/${roomNumber}`, {

    available: true,       //   method: 'POST',

    preparationTime: 1,      //   body: JSON.stringify({ description: `طلب مطعم - ${customerName}`, amount: calculateTotal() })

    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop',      // });

    description: 'مشروبات غازية متنوعة'      console.log(`Charge to room ${roomNumber}: ${calculateTotal()}`);

  },    }

  { 

    id: 'arabic-coffee',     // إعادة تعيين النموذج

    name: 'Arabic Coffee',     setCurrentOrder([])

    nameAr: 'قهوة عربية',     setCustomerName('')

    category: 'drink',     setCustomerType('external')

    price: 8,     setRoomNumber('')

    available: true,     setOrderNotes('')

    preparationTime: 5,    setPaymentMethod('cash')

    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',

    description: 'قهوة عربية أصلية'    // توجيه إلى صفحة طلبات النزلاء

  },    router.push('/dashboard/requests')

    }

  // حلويات

  {   // تحديث حالة الطلب

    id: 'kunafa',   const updateOrderStatus = async (orderId: string, status: Order['status']) => {    

    name: 'Kunafa',     try {

    nameAr: 'كنافة',       const response = await fetch(`/api/restaurant/orders/${orderId}`, {

    category: 'dessert',         method: 'PATCH',

    price: 20,         headers: { 'Content-Type': 'application/json' },

    available: true,         body: JSON.stringify({ status }),

    preparationTime: 8,      });

    image: 'https://images.unsplash.com/photo-1608039829572-78524f79607d?w=400&h=400&fit=crop',      const result = await response.json();

    description: 'كنافة بالجبن الطازجة'      if (result.success) {

  },        setOrders(orders.map(order => (order.id === orderId ? { ...order, status } : order)));

  {       } else {

    id: 'baklava',         throw new Error(result.message);

    name: 'Baklava',       }

    nameAr: 'بقلاوة',     } catch (error) {

    category: 'dessert',       console.error("Failed to update order status:", error);

    price: 18,       alert('فشل في تحديث حالة الطلب.');

    available: true,     }

    preparationTime: 5,  }

    image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&h=400&fit=crop',

    description: 'بقلاوة تركية بالفستق'  // حذف طلب

  },  const deleteOrder = useCallback(async (orderId: string) => {

  {     const isConfirmed = window.confirm('هل أنت متأكد من حذف هذا الطلب؟');

    id: 'umm-ali',     if (!isConfirmed) return;

    name: 'Umm Ali', 

    nameAr: 'أم علي',     const response = await fetch(`/api/restaurant/orders/${orderId}`, { method: 'DELETE' });

    category: 'dessert',     if (response.ok) {

    price: 22,       setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));

    available: true,     } else {

    preparationTime: 10,      alert('فشل في حذف الطلب.');

    image: 'https://images.unsplash.com/photo-1587241321921-91a834d82036?w=400&h=400&fit=crop',    }

    description: 'حلى أم علي ساخن'  }, []);

  },

  {   // إضافة/تحديث عنصر في القائمة

    id: 'ice-cream',   const saveMenuItem = async () => {

    name: 'Ice Cream',     if (!newMenuItem.name.trim() || newMenuItem.price <= 0) {

    nameAr: 'آيس كريم',       alert('يرجى إدخال اسم الطبق والسعر')

    category: 'dessert',       return

    price: 15,     }

    available: true, 

    preparationTime: 2,    try {

    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop',      let result;

    description: 'آيس كريم بنكهات متعددة'      if (editingItem) {

  }        // Update logic (PUT request to /api/restaurant/menu/[id])

];        const response = await fetch(`/api/restaurant/menu/${editingItem.id}`, {

            method: 'PUT',

const categoryDictionary: Record<MenuItem['category'], string> = {            headers: { 'Content-Type': 'application/json' },

  appetizer: 'مقبلات',            body: JSON.stringify(newMenuItem),

  main: 'أطباق رئيسية',        });

  drink: 'مشروبات',        result = await response.json();

  dessert: 'حلويات'        if (result.success) {

};            setMenuItems(menuItems.map(item => (item.id === editingItem.id ? result.data : item)));

        }

const formatCurrency = (value: number) => `${value.toFixed(2)} ر.س`;      } else {

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;        // Create logic

        const response = await fetch('/api/restaurant/menu', {

function useLocalStorage<T>(key: string, initial: T) {          method: 'POST',

  const [state, setState] = useState<T>(initial);          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify(newMenuItem),

  useEffect(() => {        });

    try {        result = await response.json();

      const stored = localStorage.getItem(key);        if (result.success) {

      if (stored) setState(JSON.parse(stored));          setMenuItems([...menuItems, result.data]);

    } catch (e) {        }

      console.error(`Storage error: ${key}`, e);      }

    }

  }, [key]);      if (result.success) {

        setNewMenuItem({

  useEffect(() => {          name: '',

    try {          category: 'مقبلات',

      localStorage.setItem(key, JSON.stringify(state));          price: 0,

    } catch (e) {          description: '',

      console.error(`Storage error: ${key}`, e);          available: true

    }        });

  }, [key, state]);        setIsEditingMenu(false);

        setEditingItem(null);

  return [state, setState] as const;      } else {

}        throw new Error(result.message);

      }

export default function RestaurantPOS() {    } catch (error) {

  const [menu, setMenu] = useLocalStorage<MenuItem[]>(STORAGE_MENU_KEY, DEFAULT_MENU);      console.error("Failed to save menu item:", error);

  const [orders, setOrders] = useLocalStorage<RestaurantOrder[]>(STORAGE_ORDERS_KEY, []);      alert('فشل في حفظ الطبق. يرجى المحاولة مرة أخرى.');

  const [cart, setCart] = useState<CartItem[]>([]);    }

  const [selectedCategory, setSelectedCategory] = useState<'all' | MenuItem['category']>('all');  }

  const [searchQuery, setSearchQuery] = useState('');

  const [customerType, setCustomerType] = useState<'internal' | 'external'>('internal');  // تحرير عنصر من القائمة

  const [selectedRoom, setSelectedRoom] = useState('');  const editMenuItem = (item: MenuItem) => {

  const [tableNumber, setTableNumber] = useState('');    setEditingItem(item)

  const [guestName, setGuestName] = useState('');    setNewMenuItem({

  const [paymentMethod, setPaymentMethod] = useState<'room_charge' | 'cash' | 'card'>('room_charge');      name: item.name,

  const [orderNotes, setOrderNotes] = useState('');      category: item.category,

  const [occupiedRooms, setOccupiedRooms] = useState<Array<{ number: string; guestName?: string }>>([]);      price: item.price,

  const [showCheckout, setShowCheckout] = useState(false);      description: item.description,

      available: item.available

  useEffect(() => {    })

    const rooms = getRoomsFromStorage();    setIsEditingMenu(true)

    const occupied = rooms  }

      .filter((room) => room.status === 'Occupied' && room.guestName)

      .map((room) => ({ number: room.number, guestName: room.guestName }));  // حذف عنصر من القائمة

    setOccupiedRooms(occupied);  const deleteMenuItem = useCallback(async (itemId: string) => {

  }, []);    const isConfirmed = window.confirm('هل أنت متأكد من حذف هذا الطبق؟');

    if (!isConfirmed) return;

  // Filter menu items

  const filteredMenu = useMemo(() => {    const response = await fetch(`/api/restaurant/menu/${itemId}`, { method: 'DELETE' });

    return menu.filter((item) => {    if (response.ok) {

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));

      const matchesSearch = !searchQuery ||     } else {

        item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||      alert('فشل في حذف الطبق.');

        item.name.toLowerCase().includes(searchQuery.toLowerCase());    }

      return matchesCategory && matchesSearch && item.available;  }, []);

    });

  }, [menu, selectedCategory, searchQuery]);  // إحصائيات المطعم

  const todayOrders = orders.filter(order => {

  // Calculate cart totals    const today = new Date()

  const cartTotal = useMemo(() => {    const orderDate = new Date(order.orderTime)

    return cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);    return orderDate.toDateString() === today.toDateString()

  }, [cart]);  })



  const cartItemsCount = useMemo(() => {  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

    return cart.reduce((sum, item) => sum + item.quantity, 0);  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)

  }, [cart]);

  const categoryStats = categories.map(category => {

  // Cart operations    const categoryItems = menuItems.filter(item => item.category === category)

  const addToCart = (menuItem: MenuItem) => {    const categoryOrders = orders.flatMap(order =>

    setCart((prev) => {      order.items.filter(item => item.menuItem.category === category)

      const existing = prev.find((item) => item.menuItem.id === menuItem.id);    )

      if (existing) {    const totalSold = categoryOrders.reduce((sum, item) => sum + item.quantity, 0)

        return prev.map((item) =>    return {

          item.menuItem.id === menuItem.id      category,

            ? { ...item, quantity: item.quantity + 1 }      itemsCount: categoryItems.length,

            : item      totalSold,

        );      revenue: categoryOrders.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)

      }    }

      return [...prev, { menuItem, quantity: 1 }];  })

    });

  };  // فلترة العناصر حسب الفئة

  const filteredMenuItems = selectedCategory === 'الكل'

  const updateCartItemQuantity = (menuItemId: string, delta: number) => {    ? menuItems

    setCart((prev) => {    : menuItems.filter(item => item.category === selectedCategory)

      return prev  return (

        .map((item) =>    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">

          item.menuItem.id === menuItemId      <div className="max-w-7xl mx-auto">

            ? { ...item, quantity: Math.max(0, item.quantity + delta) }        {/* Header */}

            : item        <div className="mb-8">

        )          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">

        .filter((item) => item.quantity > 0);            <ChefHat className="h-10 w-10 text-yellow-400" />

    });            إدارة المطعم

  };          </h1>

          <p className="text-gray-300">إدارة القائمة والطلبات والإحصائيات</p>

  const removeFromCart = (menuItemId: string) => {        </div>

    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));

  };        {/* Navigation Tabs */}

        <div className="flex gap-2 mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1">

  const clearCart = () => {          <Button

    setCart([]);            variant={activeTab === 'orders' ? 'default' : 'ghost'}

    setGuestName('');            onClick={() => setActiveTab('orders')}

    setSelectedRoom('');            className={`flex-1 ${activeTab === 'orders' ? 'bg-white text-black' : 'text-white hover:bg-slate-700/50'}`}

    setTableNumber('');          >

    setOrderNotes('');            <ShoppingCart className="h-4 w-4 mr-2" />

    setCustomerType('internal');            إنشاء طلب

    setPaymentMethod('room_charge');          </Button>

  };          <Button

            variant={activeTab === 'menu' ? 'default' : 'ghost'}

  // Complete order            onClick={() => setActiveTab('menu')}

  const completeOrder = () => {            className={`flex-1 ${activeTab === 'menu' ? 'bg-white text-black' : 'text-white hover:bg-slate-700/50'}`}

    if (!guestName.trim() || cart.length === 0) {          >

      alert('يرجى إدخال اسم العميل واختيار الأطباق');            <UtensilsCrossed className="h-4 w-4 mr-2" />

      return;            إدارة القائمة

    }          </Button>

          <Button

    if (customerType === 'internal' && !selectedRoom) {            variant={activeTab === 'statistics' ? 'default' : 'ghost'}

      alert('يرجى اختيار الغرفة');            onClick={() => setActiveTab('statistics')}

      return;            className={`flex-1 ${activeTab === 'statistics' ? 'bg-white text-black' : 'text-white hover:bg-slate-700/50'}`}

    }          >

            <TrendingUp className="h-4 w-4 mr-2" />

    const orderItems: OrderItem[] = cart.map((item) => ({            الإحصائيات

      menuItemId: item.menuItem.id,          </Button>

      menuItemName: item.menuItem.nameAr,        </div>

      quantity: item.quantity,

      price: item.menuItem.price,        {/* إنشاء طلب */}

      notes: item.notes        {activeTab === 'orders' && (

    }));          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* قائمة الطعام */}

    const newOrder: RestaurantOrder = {            <div className="lg:col-span-2">

      id: uid(),              <Card className="bg-white/10 backdrop-blur-sm border-white/20">

      roomNumber: customerType === 'internal' ? selectedRoom : '',                <CardHeader>

      guestName: guestName,                  <CardTitle className="text-white flex items-center gap-2">

      tableNumber: tableNumber,                    <UtensilsCrossed className="h-5 w-5" />

      items: orderItems,                    قائمة الطعام

      totalAmount: cartTotal,                  </CardTitle>

      status: 'pending',                  <div className="flex gap-2">

      orderDate: new Date().toISOString(),                    <Button

      paymentMethod: customerType === 'internal' ? paymentMethod : 'cash',                      variant={selectedCategory === 'الكل' ? 'default' : 'outline'}

      orderNotes: orderNotes                      size="sm"

    };                      onClick={() => setSelectedCategory('الكل')}

                      className="text-xs"

    setOrders((prev) => [newOrder, ...prev]);                    >

                          الكل

    // Play notification sound                    </Button>

    playNotificationSound('new-request');                    {categories.map(category => (

                      <Button

    // Clear cart and form                        key={category}

    clearCart();                        variant={selectedCategory === category ? 'default' : 'outline'}

    setShowCheckout(false);                        size="sm"

                        onClick={() => setSelectedCategory(category)}

    alert('✅ تم إنشاء الطلب بنجاح! سيتم إرساله للمطبخ.');                        className="text-xs"

  };                      >

                        {category}

  // Load menu items from menu-items storage                      </Button>

  useEffect(() => {                    ))}

    try {                  </div>

      const savedMenuItems = localStorage.getItem('menu-items');                </CardHeader>

      if (savedMenuItems) {                <CardContent>

        const parsedItems = JSON.parse(savedMenuItems);                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        const restaurantItems = parsedItems                    {filteredMenuItems.map(item => (

          .filter((item: any) =>                       <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/20 hover:bg-slate-700/50 transition-colors">

            item.category === 'مقبلات' ||                         <div className="flex justify-between items-start mb-2">

            item.category === 'أطباق رئيسية' ||                           <div>

            item.category === 'مشروبات' ||                             <h3 className="font-semibold text-white">{item.name}</h3>

            item.category === 'حلويات'                            <p className="text-sm text-gray-300">{item.description}</p>

          )                            <p className="text-yellow-400 font-bold mt-1">{item.price} ريال</p>

          .map((item: any) => ({                          </div>

            id: item.id,                          <Badge variant={item.available ? 'secondary' : 'outline'}>

            name: item.name,                            {item.available ? 'متوفر' : 'غير متوفر'}

            nameAr: item.name,                          </Badge>

            category: item.category === 'مقبلات' ? 'appetizer' :                         </div>

                     item.category === 'أطباق رئيسية' ? 'main' :                        <Button

                     item.category === 'مشروبات' ? 'drink' : 'dessert',                          onClick={() => addToCurrentOrder(item)}

            price: item.price,                          disabled={!item.available}

            available: true,                          className="w-full mt-2 bg-green-600 hover:bg-green-700"

            preparationTime: 15,                        >

            image: item.image || undefined,                          إضافة للطلب

            description: item.description || ''                        </Button>

          }));                      </div>

                    ))}

        if (restaurantItems.length > 0) {                  </div>

          setMenu((prevMenu) => {                </CardContent>

            const merged = [...prevMenu];              </Card>

            restaurantItems.forEach((newItem: MenuItem) => {            </div>

              const exists = merged.find(m => m.id === newItem.id);

              if (!exists) {            {/* تفاصيل الطلب */}

                merged.push(newItem);            <div>

              }              <Card className="bg-white/10 backdrop-blur-sm border-white/20">

            });                <CardHeader>

            return merged;                  <CardTitle className="text-white flex items-center gap-2">

          });                    <ShoppingCart className="h-5 w-5" />

        }                    الطلب الحالي

      }                  </CardTitle>

    } catch (e) {                </CardHeader>

      console.error('Error loading menu items:', e);                <CardContent className="space-y-4">

    }                  {/* عناصر الطلب */}

  }, []);                  {currentOrder.length > 0 ? (

                    <div className="space-y-2">

  return (                      {currentOrder.map(item => (

    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" dir="rtl">                        <div key={item.menuItem.id} className="flex justify-between items-center p-2 bg-white/5 rounded">

      <div className="flex h-screen">                          <div className="flex-1">

        {/* Main POS Area - Left Side */}                            <p className="text-white font-medium">{item.menuItem.name}</p>

        <div className="flex-1 flex flex-col overflow-hidden">                            <p className="text-gray-300 text-sm">{item.menuItem.price} ريال × {item.quantity}</p>

          {/* Header */}                          </div>

          <div className="bg-white dark:bg-slate-800 shadow-md p-4 border-b border-red-200 dark:border-slate-700">                          <div className="flex items-center gap-2">

            <div className="flex items-center justify-between">                            <Button

              <div className="flex items-center gap-3">                              size="sm"

                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">                              variant="outline"

                  <ChefHat className="h-6 w-6 text-white" />                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}

                </div>                              className="h-6 w-6 p-0"

                <div>                            >

                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">المطعم</h1>                              -

                  <p className="text-sm text-slate-600 dark:text-slate-400">نظام نقطة البيع</p>                            </Button>

                </div>                            <span className="text-white w-8 text-center">{item.quantity}</span>

              </div>                            <Button

                                            size="sm"

              <div className="flex items-center gap-3">                              variant="outline"

                <div className="text-right">                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}

                  <p className="text-xs text-slate-600 dark:text-slate-400">إجمالي المبيعات اليوم</p>                              className="h-6 w-6 p-0"

                  <p className="text-lg font-bold text-red-600 dark:text-red-400">                            >

                    {formatCurrency(                              +

                      orders                            </Button>

                        .filter(o => o.status === 'delivered' && new Date(o.orderDate).toDateString() === new Date().toDateString())                            <Button

                        .reduce((sum, o) => sum + o.totalAmount, 0)                              size="sm"

                    )}                              variant="outline"

                  </p>                              onClick={() => removeFromCurrentOrder(item.menuItem.id)}

                </div>                              className="h-6 w-6 p-0 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"

              </div>                            >

            </div>                              ×

                            </Button>

            {/* Search Bar */}                          </div>

            <div className="mt-4">                        </div>

              <div className="relative">                      ))}

                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />                      <Separator className="bg-white/20" />

                <Input                      <div className="flex justify-between items-center text-lg font-bold text-white">

                  placeholder="ابحث عن طبق..."                        <span>الإجمالي:</span>

                  value={searchQuery}                        <span>{calculateTotal()} ريال</span>

                  onChange={(e) => setSearchQuery(e.target.value)}                      </div>

                  className="pr-10 border-red-200 dark:border-slate-600 focus:border-red-400 dark:focus:border-red-500"                    </div>

                />                  ) : (

              </div>                    <p className="text-gray-400 text-center py-4">لا توجد عناصر في الطلب</p>

            </div>                  )}

          </div>

                  <Separator className="bg-white/20" />

          {/* Category Tabs */}

          <div className="bg-white dark:bg-slate-800 border-b border-red-200 dark:border-slate-700 px-4 py-2">                  {/* معلومات العميل */}

            <div className="flex gap-2 overflow-x-auto">                  <div className="space-y-4">

              <Button                    <div>

                variant={selectedCategory === 'all' ? 'default' : 'outline'}                      <Label className="text-white">نوع العميل</Label>

                onClick={() => setSelectedCategory('all')}                      <RadioGroup

                className={selectedCategory === 'all' ? 'bg-red-500 hover:bg-red-600' : 'border-red-300 dark:border-slate-600'}                        value={customerType}

              >                        onValueChange={handleCustomerTypeChange}

                الكل                        className="flex gap-4 mt-2"

              </Button>                      >

              {Object.entries(categoryDictionary).map(([key, label]) => (                        <div className="flex items-center space-x-2">

                <Button                          <RadioGroupItem value="external" id="external" />

                  key={key}                          <Label htmlFor="external" className="text-white">عميل خارجي</Label>

                  variant={selectedCategory === key ? 'default' : 'outline'}                        </div>

                  onClick={() => setSelectedCategory(key as MenuItem['category'])}                        <div className="flex items-center space-x-2">

                  className={selectedCategory === key ? 'bg-red-500 hover:bg-red-600' : 'border-red-300 dark:border-slate-600'}                          <RadioGroupItem value="internal" id="internal" />

                >                          <Label htmlFor="internal" className="text-white">نزيل في الفندق</Label>

                  {label}                        </div>

                </Button>                      </RadioGroup>

              ))}                    </div>

            </div>

          </div>                    {customerType === 'internal' && (

                      <div>

          {/* Menu Grid */}                        <Label htmlFor="roomNumber" className="text-white">رقم الغرفة *</Label>

          <div className="flex-1 overflow-y-auto p-4">                        <Select value={roomNumber} onValueChange={handleRoomChange}>

            {filteredMenu.length === 0 ? (                          <SelectTrigger className="bg-white/10 border-white/20 text-white">

              <div className="flex items-center justify-center h-full">                            <SelectValue placeholder="اختر الغرفة" />

                <p className="text-slate-400 text-center">لا توجد أطباق متاحة</p>                          </SelectTrigger>

              </div>                          <SelectContent>

            ) : (                            {occupiedRooms.map(room => (

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">                              <SelectItem key={room.id} value={room.number}>

                {filteredMenu.map((item) => (                                غرفة {room.number} - {room.guestName}

                  <Card                               </SelectItem>

                    key={item.id}                            ))}

                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-400 dark:hover:border-red-500 overflow-hidden"                          </SelectContent>

                    onClick={() => addToCart(item)}                        </Select>

                  >                      </div>

                    <CardContent className="p-0">                    )}

                      {/* Image */}

                      <div className="relative h-40 bg-gradient-to-br from-red-100 to-orange-100 dark:from-slate-700 dark:to-slate-600 overflow-hidden">                    <div>

                        {item.image ? (                      <Label htmlFor="customerName" className="text-white">اسم العميل *</Label>

                          <img                       <Input

                            src={item.image}                         id="customerName"

                            alt={item.nameAr}                        value={customerName}

                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"                        onChange={(e) => setCustomerName(e.target.value)}

                          />                        placeholder="أدخل اسم العميل"

                        ) : (                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"

                          <div className="w-full h-full flex items-center justify-center">                        disabled={customerType === 'internal'}

                            <Utensils className="h-16 w-16 text-red-300 dark:text-red-600" />                      />

                          </div>                    </div>

                        )}

                                            <div>

                        {/* Quick Add Button */}                      <Label className="text-white">طريقة الدفع</Label>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">                      <RadioGroup

                          <Button size="sm" className="bg-white text-red-600 hover:bg-red-50">                        value={paymentMethod}

                            <Plus className="h-4 w-4 ml-1" />                        onValueChange={(value: 'cash' | 'card' | 'room') => setPaymentMethod(value)}

                            إضافة                        className="flex gap-4 mt-2"

                          </Button>                      >

                        </div>                        <div className="flex items-center space-x-2">

                          <RadioGroupItem value="cash" id="cash" />

                        {/* Category Badge */}                          <Label htmlFor="cash" className="text-white">نقدي</Label>

                        <Badge className="absolute top-2 right-2 bg-white/90 text-red-700 border-red-300">                        </div>

                          {categoryDictionary[item.category]}                        <div className="flex items-center space-x-2">

                        </Badge>                          <RadioGroupItem value="card" id="card" />

                      </div>                          <Label htmlFor="card" className="text-white">بطاقة</Label>

                        </div>

                      {/* Info */}                        {customerType === 'internal' && (

                      <div className="p-3">                          <div className="flex items-center space-x-2">

                        <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1 truncate">                            <RadioGroupItem value="room" id="room" />

                          {item.nameAr}                            <Label htmlFor="room" className="text-white">على الغرفة</Label>

                        </h3>                          </div>

                        {item.description && (                        )}

                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">                      </RadioGroup>

                            {item.description}                    </div>

                          </p>

                        )}                    <div>

                        <div className="flex items-center justify-between">                      <Label htmlFor="orderNotes" className="text-white">ملاحظات (اختياري)</Label>

                          <p className="text-lg font-bold text-red-600 dark:text-red-400">                      <Input

                            {formatCurrency(item.price)}                        id="orderNotes"

                          </p>                        value={orderNotes}

                          <p className="text-xs text-slate-500 dark:text-slate-400">                        onChange={(e) => setOrderNotes(e.target.value)}

                            {item.preparationTime} دقيقة                        placeholder="ملاحظات خاصة بالطلب"

                          </p>                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"

                        </div>                      />

                      </div>                    </div>

                    </CardContent>

                  </Card>                    <Button

                ))}                      onClick={createOrder}

              </div>                      disabled={currentOrder.length === 0 || !customerName.trim() || (customerType === 'internal' && !roomNumber)}

            )}                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"

          </div>                    >

        </div>                      إنشاء طلب ({calculateTotal()} ريال)

                    </Button>

        {/* Cart Sidebar - Right Side */}                  </div>

        <div className="w-96 bg-white dark:bg-slate-800 border-r border-red-200 dark:border-slate-700 flex flex-col shadow-2xl">                </CardContent>

          {/* Cart Header */}              </Card>

          <div className="p-4 border-b border-red-200 dark:border-slate-700 bg-gradient-to-r from-red-500 to-orange-500">            </div>

            <div className="flex items-center justify-between text-white">          </div>

              <div className="flex items-center gap-2">        )}

                <ShoppingCart className="h-5 w-5" />        {/* إدارة القائمة */}

                <h2 className="text-lg font-bold">الطلب</h2>        {activeTab === 'menu' && (

              </div>          <Card className="bg-white/10 backdrop-blur-sm border-white/20">

              <Badge className="bg-white text-red-600 font-bold">            <CardHeader>

                {cartItemsCount} صنف              <CardTitle className="text-white flex items-center gap-2">

              </Badge>                <UtensilsCrossed className="h-5 w-5" />

            </div>                إدارة قائمة الطعام

          </div>              </CardTitle>

            </CardHeader>

          {/* Cart Items */}            <CardContent>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {cart.length === 0 ? (                {/* إضافة/تحرير عنصر */}

              <div className="flex flex-col items-center justify-center h-full text-slate-400">                <div className="space-y-4">

                <ShoppingCart className="h-16 w-16 mb-2 opacity-20" />                  <h3 className="text-xl font-semibold text-white">

                <p className="text-center">الطلب فارغ</p>                    {isEditingMenu ? 'تحرير الطبق' : 'إضافة طبق جديد'}

                <p className="text-sm text-center mt-1">اضغط على الأطباق لإضافتها</p>                  </h3>

              </div>

            ) : (                  <div>

              cart.map((item) => (                    <Label htmlFor="itemName" className="text-white">اسم الطبق</Label>

                <Card key={item.menuItem.id} className="border-red-200 dark:border-slate-600">                    <Input

                  <CardContent className="p-3">                      id="itemName"

                    <div className="flex items-start gap-3">                      value={newMenuItem.name}

                      {/* Image */}                      onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}

                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 dark:from-slate-700 dark:to-slate-600 flex-shrink-0 overflow-hidden">                      placeholder="أدخل اسم الطبق"

                        {item.menuItem.image ? (                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"

                          <img                     />

                            src={item.menuItem.image}                   </div>

                            alt={item.menuItem.nameAr}

                            className="w-full h-full object-cover"                  <div>

                          />                    <Label htmlFor="itemPrice" className="text-white">السعر (ريال)</Label>

                        ) : (                    <Input

                          <div className="w-full h-full flex items-center justify-center">                      id="itemPrice"

                            <Utensils className="h-6 w-6 text-red-400" />                      type="number"

                          </div>                      value={newMenuItem.price}

                        )}                      onChange={(e) => setNewMenuItem({...newMenuItem, price: parseFloat(e.target.value) || 0})}

                      </div>                      placeholder="0"

                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"

                      {/* Info */}                    />

                      <div className="flex-1 min-w-0">                  </div>

                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm truncate">

                          {item.menuItem.nameAr}                  <div>

                        </h3>                    <Label htmlFor="itemCategory" className="text-white">الفئة</Label>

                        <p className="text-red-600 dark:text-red-400 font-bold text-sm">                    <Select value={newMenuItem.category} onValueChange={(value) => setNewMenuItem({...newMenuItem, category: value})}>

                          {formatCurrency(item.menuItem.price)}                      <SelectTrigger className="bg-white/10 border-white/20 text-white">

                        </p>                        <SelectValue />

                      </SelectTrigger>

                        {/* Quantity Controls */}                      <SelectContent>

                        <div className="flex items-center gap-2 mt-2">                        {categories.map(category => (

                          <Button                          <SelectItem key={category} value={category}>{category}</SelectItem>

                            size="sm"                        ))}

                            variant="outline"                      </SelectContent>

                            className="h-7 w-7 p-0 border-red-300 dark:border-slate-600"                    </Select>

                            onClick={() => updateCartItemQuantity(item.menuItem.id, -1)}                  </div>

                          >

                            <Minus className="h-3 w-3" />                  <div>

                          </Button>                    <Label className="text-white">الحالة</Label>

                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-8 text-center">                    <RadioGroup

                            {item.quantity}                      value={newMenuItem.available ? 'available' : 'unavailable'}

                          </span>                      onValueChange={(value) => setNewMenuItem({...newMenuItem, available: value === 'available'})}

                          <Button                      className="flex gap-4 mt-2"

                            size="sm"                    >

                            variant="outline"                      <div className="flex items-center space-x-2">

                            className="h-7 w-7 p-0 border-red-300 dark:border-slate-600"                        <RadioGroupItem value="available" id="available" />

                            onClick={() => updateCartItemQuantity(item.menuItem.id, 1)}                        <Label htmlFor="available" className="text-white">متوفر</Label>

                          >                      </div>

                            <Plus className="h-3 w-3" />                      <div className="flex items-center space-x-2">

                          </Button>                        <RadioGroupItem value="unavailable" id="unavailable" />

                          <Button                        <Label htmlFor="unavailable" className="text-white">غير متوفر</Label>

                            size="sm"                      </div>

                            variant="ghost"                    </RadioGroup>

                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mr-auto"                  </div>

                            onClick={() => removeFromCart(item.menuItem.id)}

                          >                  <div>

                            <Trash2 className="h-3 w-3" />                    <Label htmlFor="itemDescription" className="text-white">الوصف</Label>

                          </Button>                    <Input

                        </div>                      id="itemDescription"

                      </div>                      value={newMenuItem.description}

                      onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}

                      {/* Item Total */}                      placeholder="وصف الطبق"

                      <div className="text-right">                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"

                        <p className="font-bold text-slate-800 dark:text-white">                    />

                          {formatCurrency(item.menuItem.price * item.quantity)}                  </div>

                        </p>

                      </div>                  <div className="flex gap-2">

                    </div>                    <Button onClick={saveMenuItem} className="flex-1">

                  </CardContent>                      {isEditingMenu ? 'تحديث' : 'إضافة'}

                </Card>                    </Button>

              ))                    {isEditingMenu && (

            )}                      <Button variant="outline" onClick={() => {

          </div>                        setIsEditingMenu(false)

                        setEditingItem(null)

          {/* Cart Footer */}                        setNewMenuItem({

          {cart.length > 0 && (                          name: '',

            <div className="border-t border-red-200 dark:border-slate-700 p-4 space-y-3 bg-red-50 dark:bg-slate-900">                          category: 'مقبلات',

              {/* Total */}                          price: 0,

              <div className="flex items-center justify-between text-lg font-bold">                          description: '',

                <span className="text-slate-700 dark:text-slate-300">الإجمالي:</span>                          available: true

                <span className="text-2xl text-red-600 dark:text-red-400">                        })

                  {formatCurrency(cartTotal)}                      }}>

                </span>                        إلغاء

              </div>                      </Button>

                    )}

              {/* Action Buttons */}                  </div>

              <div className="grid grid-cols-2 gap-2">                </div>

                <Button

                  variant="outline"                {/* قائمة العناصر */}

                  onClick={clearCart}                <div>

                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"                  <h3 className="text-xl font-semibold text-white mb-4">قائمة الأطباق</h3>

                >                  <div className="space-y-2 max-h-96 overflow-y-auto">

                  <X className="h-4 w-4 ml-1" />                    {menuItems.map(item => (

                  مسح                      <div key={item.id} className="p-3 bg-white/5 rounded-lg border border-white/20">

                </Button>                        <div className="flex justify-between items-start">

                <Button                          <div className="flex-1">

                  onClick={() => setShowCheckout(true)}                            <h4 className="font-medium text-white">{item.name}</h4>

                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"                            <p className="text-sm text-gray-300">{item.description}</p>

                >                            <div className="flex gap-2 mt-1">

                  <CreditCard className="h-4 w-4 ml-1" />                              <Badge variant="secondary">{item.category}</Badge>

                  إتمام                              <Badge variant={item.available ? 'secondary' : 'destructive'}>

                </Button>                                {item.available ? 'متوفر' : 'غير متوفر'}

              </div>                              </Badge>

            </div>                            </div>

          )}                            <p className="text-yellow-400 font-bold mt-1">{item.price} ريال</p>

        </div>                          </div>

      </div>                          <div className="flex gap-1">

                            <Button size="sm" variant="outline" onClick={() => editMenuItem(item)}>

      {/* Checkout Dialog */}                              <Edit2 className="h-3 w-3" />

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>                            </Button>

        <DialogContent className="sm:max-w-md border-red-200 dark:border-slate-700">                            <Button size="sm" variant="outline" onClick={() => deleteMenuItem(item.id)} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">

          <DialogHeader>                              <Trash2 className="h-3 w-3" />

            <DialogTitle className="text-xl font-bold">إتمام الطلب</DialogTitle>                            </Button>

          </DialogHeader>                          </div>

                                  </div>

          <div className="space-y-4">                      </div>

            {/* Customer Type */}                    ))}

            <div>                  </div>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">                </div>

                نوع العميل              </div>

              </label>            </CardContent>

              <div className="grid grid-cols-2 gap-2">          </Card>

                <Button        )}

                  variant={customerType === 'internal' ? 'default' : 'outline'}

                  onClick={() => setCustomerType('internal')}        {/* الإحصائيات */}

                  className={customerType === 'internal' ? 'bg-red-500 hover:bg-red-600' : 'border-red-300 dark:border-slate-600'}        {activeTab === 'statistics' && (

                >          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                  <UserCircle className="h-4 w-4 ml-1" />            <Card className="bg-white/10 backdrop-blur-sm border-white/20">

                  نزيل              <CardHeader className="pb-2">

                </Button>                <CardTitle className="text-white text-sm font-medium">إجمالي الإيرادات</CardTitle>

                <Button              </CardHeader>

                  variant={customerType === 'external' ? 'default' : 'outline'}              <CardContent>

                  onClick={() => setCustomerType('external')}                <div className="text-2xl font-bold text-white">{totalRevenue} ريال</div>

                  className={customerType === 'external' ? 'bg-red-500 hover:bg-red-600' : 'border-red-300 dark:border-slate-600'}                <p className="text-xs text-gray-400">منذ البداية</p>

                >              </CardContent>

                  <UserCircle className="h-4 w-4 ml-1" />            </Card>

                  خارجي            <Card className="bg-white/10 backdrop-blur-sm border-white/20">

                </Button>              <CardHeader className="pb-2">

              </div>                <CardTitle className="text-white text-sm font-medium">إيرادات اليوم</CardTitle>

            </div>              </CardHeader>

              <CardContent>

            {/* Room Selection (for internal customers) */}                <div className="text-2xl font-bold text-white">{todayRevenue} ريال</div>

            {customerType === 'internal' && (                <p className="text-xs text-gray-400">اليوم</p>

              <div>              </CardContent>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">            </Card>

                  الغرفة            <Card className="bg-white/10 backdrop-blur-sm border-white/20">

                </label>              <CardHeader className="pb-2">

                <Select value={selectedRoom} onValueChange={setSelectedRoom}>                <CardTitle className="text-white text-sm font-medium">عدد الطلبات</CardTitle>

                  <SelectTrigger className="border-red-200 dark:border-slate-600">              </CardHeader>

                    <SelectValue placeholder="اختر الغرفة" />              <CardContent>

                  </SelectTrigger>                <div className="text-2xl font-bold text-white">{orders.length}</div>

                  <SelectContent>                <p className="text-xs text-gray-400">إجمالي الطلبات</p>

                    {occupiedRooms.map((room) => (              </CardContent>

                      <SelectItem key={room.number} value={room.number}>            </Card>

                        {room.number} - {room.guestName}            <Card className="bg-white/10 backdrop-blur-sm border-white/20">

                      </SelectItem>              <CardHeader className="pb-2">

                    ))}                <CardTitle className="text-white text-sm font-medium">طلبات اليوم</CardTitle>

                  </SelectContent>              </CardHeader>

                </Select>              <CardContent>

              </div>                <div className="text-2xl font-bold text-white">{todayOrders.length}</div>

            )}                <p className="text-xs text-gray-400">اليوم</p>

              </CardContent>

            {/* Table Number */}            </Card>

            <div>          </div>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">        )}

                رقم الطاولة (اختياري)

              </label>        {/* طلبات اليوم */}

              <Input        {activeTab === 'orders' && (

                value={tableNumber}          <Card className="mt-8 bg-white/10 backdrop-blur-sm border-white/20">

                onChange={(e) => setTableNumber(e.target.value)}            <CardHeader>

                placeholder="مثال: 5"              <CardTitle className="text-white flex items-center gap-2">

                className="border-red-200 dark:border-slate-600"                <Clock className="h-5 w-5" />

              />                طلبات اليوم ({todayOrders.length})

            </div>              </CardTitle>

            </CardHeader>

            {/* Guest Name */}            <CardContent>

            <div>              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">                {todayOrders.map(order => (

                اسم العميل                  <div key={order.id} className="p-4 bg-white/5 rounded-lg border border-white/20">

              </label>                    <div className="flex justify-between items-start mb-2">

              <Input                      <div>

                value={guestName}                        <h4 className="font-semibold text-white">{order.customerName}</h4>

                onChange={(e) => setGuestName(e.target.value)}                        <p className="text-sm text-gray-300">

                placeholder="أدخل اسم العميل"                          {new Date(order.orderTime).toLocaleTimeString('ar-SA', {

                className="border-red-200 dark:border-slate-600"                            hour: '2-digit',

              />                            minute: '2-digit'

            </div>                          })}

                        </p>

            {/* Order Notes */}                        {order.roomNumber && (

            <div>                          <p className="text-sm text-blue-400">غرفة {order.roomNumber}</p>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">                        )}

                ملاحظات الطلب (اختياري)                      </div>

              </label>                      <Badge variant="secondary" className={

              <Input                        order.status === 'pending' ? 'bg-yellow-500' :

                value={orderNotes}                        order.status === 'preparing' ? 'bg-blue-500' :

                onChange={(e) => setOrderNotes(e.target.value)}                        order.status === 'ready' ? 'bg-green-500' :

                placeholder="مثال: بدون بصل"                        'bg-gray-500'

                className="border-red-200 dark:border-slate-600"                      }>

              />                        {order.status === 'pending' ? 'في الانتظار' :

            </div>                         order.status === 'preparing' ? 'قيد التحضير' :

                         order.status === 'ready' ? 'جاهز' :

            {/* Payment Method */}                         order.status === 'delivered' ? 'تم التسليم' : order.status}

            <div>                      </Badge>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">                    </div>

                طريقة الدفع                    <div className="space-y-1 mb-3">

              </label>                      {order.items.map((item, index) => (

              <div className="grid grid-cols-3 gap-2">                        <p key={index} className="text-sm text-gray-300">

                <Button                          {item.menuItem.name} × {item.quantity}

                  variant={paymentMethod === 'room_charge' ? 'default' : 'outline'}                        </p>

                  onClick={() => setPaymentMethod('room_charge')}                      ))}

                  className={paymentMethod === 'room_charge' ? 'bg-red-500 hover:bg-red-600' : 'border-red-300 dark:border-slate-600'}                    </div>

                  disabled={customerType === 'external'}                    <div className="flex justify-between items-center">

                >                      <span className="font-bold text-yellow-400">{order.totalAmount} ريال</span>

                  على الحساب                      <div className="flex gap-1">

                </Button>                        {order.status !== 'delivered' && (

                <Button                          <>

                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}                            {order.status === 'pending' && (

                  onClick={() => setPaymentMethod('cash')}                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>

                  className={paymentMethod === 'cash' ? 'bg-red-500 hover:bg-red-600' : 'border-red-300 dark:border-slate-600'}                                بدء التحضير

                >                              </Button>

                  <Wallet className="h-4 w-4" />                            )}

                </Button>                            {order.status === 'preparing' && (

                <Button                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ready')}>

                  variant={paymentMethod === 'card' ? 'default' : 'outline'}                                جاهز

                  onClick={() => setPaymentMethod('card')}                              </Button>

                  className={paymentMethod === 'card' ? 'bg-red-500 hover:bg-red-600' : 'border-red-300 dark:border-slate-600'}                            )}

                >                            {order.status === 'ready' && (

                  <CreditCard className="h-4 w-4" />                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')}>

                </Button>                                تم التسليم

              </div>                              </Button>

            </div>                            )}

                          </>

            {/* Order Summary */}                        )}

            <div className="bg-red-50 dark:bg-slate-900 rounded-lg p-3 border border-red-200 dark:border-slate-700">                        <Button size="sm" variant="outline" onClick={() => deleteOrder(order.id)} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">

              <div className="flex justify-between text-sm mb-2">                          حذف

                <span className="text-slate-600 dark:text-slate-400">عدد الأطباق:</span>                        </Button>

                <span className="font-semibold text-slate-800 dark:text-white">{cartItemsCount}</span>                      </div>

              </div>                    </div>

              <div className="flex justify-between text-lg font-bold border-t border-red-200 dark:border-slate-700 pt-2">                  </div>

                <span className="text-slate-700 dark:text-slate-300">الإجمالي:</span>                ))}

                <span className="text-red-600 dark:text-red-400">{formatCurrency(cartTotal)}</span>              </div>

              </div>            </CardContent>

            </div>          </Card>

          </div>        )}

      </div>

          <DialogFooter className="gap-2">    </div>

            <Button  )

              variant="outline"}

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
              تأكيد و إرسال للمطبخ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
