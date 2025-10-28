﻿'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MenuItem, Order } from '@/lib/restaurant-db';
import {
  Plus,
  Edit2,
  Trash2,
  ChefHat,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  UtensilsCrossed,
  Beef,
  Fish,
  Salad,
  Coffee,
  IceCream,
  ShoppingCart
} from 'lucide-react'

const categories = ['مقبلات', 'أطباق رئيسية', 'مشروبات', 'حلويات']

const categoryIcons = {
  'مقبلات': Salad,
  'أطباق رئيسية': Beef,
  'مشروبات': Coffee,
  'حلويات': IceCream
}
export default function RestaurantPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<{menuItem: MenuItem, quantity: number}[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerType, setCustomerType] = useState<'internal' | 'external'>('external')
  const [roomNumber, setRoomNumber] = useState('')
  const [occupiedRooms, setOccupiedRooms] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'room'>('cash')
  const [orderNotes, setOrderNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'statistics'>('orders')
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل')
  const [isEditingMenu, setIsEditingMenu] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    category: 'مقبلات',
    price: 0,
    description: '',
    available: true
  })

  useEffect(() => {
    const loadData = async () => {
      setOccupiedRooms([]); // إعادة تعيين الحالة قبل التحميل
      try {
        const [menuRes, ordersRes, roomsRes] = await Promise.all([
          fetch('/api/restaurant/menu', { cache: 'no-store' }),
          fetch('/api/restaurant/orders', { cache: 'no-store' }),
          fetch('/api/rooms-catalog', { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store' 
          })
        ]);

        const menuJson = await menuRes.json();
        const ordersJson = await ordersRes.json();
        const roomsJson = await roomsRes.json();

        if (menuJson.success) {
          setMenuItems(menuJson.data);
        } else {
          console.error("فشل في تحميل القائمة:", menuJson.message);
        }

        if (ordersJson.success) {
          setOrders(ordersJson.data.map((o: any) => ({...o, orderTime: new Date(o.orderTime)})));
        } else {
          console.error("فشل في تحميل الطلبات:", ordersJson.message);
        }

        if (roomsJson.success && roomsJson.data) {
          const occupied = roomsJson.data.filter((room: any) => room.status === 'Occupied' && room.guestName);
          setOccupiedRooms(occupied);
          console.log('تم تحميل الغرف المشغولة بنجاح');
        } else {
          console.error("فشل في تحميل الغرف:", roomsJson.message);
        }

      } catch (error) {
        console.error("فشل في تحميل البيانات الأولية:", error);
      }
    };
    loadData();
  }, [])

  // إضافة عنصر للطلب الحالي
  const addToCurrentOrder = (menuItem: MenuItem) => {
    const existingIndex = currentOrder.findIndex(item => item.menuItem.id === menuItem.id)
    if (existingIndex >= 0) {
      const newOrder = [...currentOrder]
      newOrder[existingIndex].quantity += 1
      setCurrentOrder(newOrder)
    } else {
      setCurrentOrder([...currentOrder, { menuItem, quantity: 1 }])
    }
  }

  // إزالة عنصر من الطلب الحالي
  const removeFromCurrentOrder = (menuItemId: string) => {
    setCurrentOrder(currentOrder.filter(item => item.menuItem.id !== menuItemId))
  }

  // تحديث كمية عنصر في الطلب
  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCurrentOrder(menuItemId)
      return
    }

    const newOrder = currentOrder.map(item =>
      item.menuItem.id === menuItemId ? { ...item, quantity } : item
    )
    setCurrentOrder(newOrder)
  }

  // التعامل مع تغيير نوع العميل
  const handleCustomerTypeChange = (type: 'internal' | 'external') => {
    setCustomerType(type)
    if (type === 'external') {
      setRoomNumber('')
      setCustomerName('')
    }
  }

  // التعامل مع اختيار الغرفة
  const handleRoomChange = (roomNum: string) => {
    setRoomNumber(roomNum)
    if (roomNum) {
      const room = occupiedRooms.find(r => r.number === roomNum)
      if (room && room.guestName) {
        setCustomerName(room.guestName)
      }
    } else {
      setCustomerName('')
    }
  }

  // حساب إجمالي الطلب
  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0)
  }

  // إنشاء طلب جديد
  const createOrder = async () => {
    if (currentOrder.length === 0 || !customerName.trim()) {
      alert('يرجى إضافة عناصر للطلب وإدخال اسم العميل')
      return
    }

    const orderData = {
      items: currentOrder,
      customerName: customerName.trim(),
      roomNumber: customerType === 'internal' ? roomNumber : undefined,
      totalAmount: calculateTotal(),
      paymentMethod,
      notes: orderNotes.trim() || undefined
    };

    try {
      const response = await fetch('/api/restaurant/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      if (result.success) {
        setOrders([result.data, ...orders]);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      alert('فشل في إنشاء الطلب. يرجى المحاولة مرة أخرى.');
    }

    // إضافة للسجل المالي للغرفة إذا كان الدفع على الغرفة
    if (paymentMethod === 'room' && roomNumber.trim()) {
      // في التطبيق الحقيقي، هذا سيكون استدعاء API
      // await fetch(`/api/accounting/ledger/${roomNumber}`, {
      //   method: 'POST',
      //   body: JSON.stringify({ description: `طلب مطعم - ${customerName}`, amount: calculateTotal() })
      // });
      console.log(`Charge to room ${roomNumber}: ${calculateTotal()}`);
    }

    // إعادة تعيين النموذج
    setCurrentOrder([])
    setCustomerName('')
    setCustomerType('external')
    setRoomNumber('')
    setOrderNotes('')
    setPaymentMethod('cash')

    // توجيه إلى صفحة طلبات النزلاء
    router.push('/dashboard/requests')
  }

  // تحديث حالة الطلب
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {    
    try {
      const response = await fetch(`/api/restaurant/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.success) {
        setOrders(orders.map(order => (order.id === orderId ? { ...order, status } : order)));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert('فشل في تحديث حالة الطلب.');
    }
  }

  // حذف طلب
  const deleteOrder = useCallback(async (orderId: string) => {
    const isConfirmed = window.confirm('هل أنت متأكد من حذف هذا الطلب؟');
    if (!isConfirmed) return;

    const response = await fetch(`/api/restaurant/orders/${orderId}`, { method: 'DELETE' });
    if (response.ok) {
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } else {
      alert('فشل في حذف الطلب.');
    }
  }, []);

  // إضافة/تحديث عنصر في القائمة
  const saveMenuItem = async () => {
    if (!newMenuItem.name.trim() || newMenuItem.price <= 0) {
      alert('يرجى إدخال اسم الطبق والسعر')
      return
    }

    try {
      let result;
      if (editingItem) {
        // Update logic (PUT request to /api/restaurant/menu/[id])
        const response = await fetch(`/api/restaurant/menu/${editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMenuItem),
        });
        result = await response.json();
        if (result.success) {
            setMenuItems(menuItems.map(item => (item.id === editingItem.id ? result.data : item)));
        }
      } else {
        // Create logic
        const response = await fetch('/api/restaurant/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMenuItem),
        });
        result = await response.json();
        if (result.success) {
          setMenuItems([...menuItems, result.data]);
        }
      }

      if (result.success) {
        setNewMenuItem({
          name: '',
          category: 'مقبلات',
          price: 0,
          description: '',
          available: true
        });
        setIsEditingMenu(false);
        setEditingItem(null);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Failed to save menu item:", error);
      alert('فشل في حفظ الطبق. يرجى المحاولة مرة أخرى.');
    }
  }

  // تحرير عنصر من القائمة
  const editMenuItem = (item: MenuItem) => {
    setEditingItem(item)
    setNewMenuItem({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      available: item.available
    })
    setIsEditingMenu(true)
  }

  // حذف عنصر من القائمة
  const deleteMenuItem = useCallback(async (itemId: string) => {
    const isConfirmed = window.confirm('هل أنت متأكد من حذف هذا الطبق؟');
    if (!isConfirmed) return;

    const response = await fetch(`/api/restaurant/menu/${itemId}`, { method: 'DELETE' });
    if (response.ok) {
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } else {
      alert('فشل في حذف الطبق.');
    }
  }, []);

  // إحصائيات المطعم
  const todayOrders = orders.filter(order => {
    const today = new Date()
    const orderDate = new Date(order.orderTime)
    return orderDate.toDateString() === today.toDateString()
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)

  const categoryStats = categories.map(category => {
    const categoryItems = menuItems.filter(item => item.category === category)
    const categoryOrders = orders.flatMap(order =>
      order.items.filter(item => item.menuItem.category === category)
    )
    const totalSold = categoryOrders.reduce((sum, item) => sum + item.quantity, 0)
    return {
      category,
      itemsCount: categoryItems.length,
      totalSold,
      revenue: categoryOrders.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
    }
  })

  // فلترة العناصر حسب الفئة
  const filteredMenuItems = selectedCategory === 'الكل'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ChefHat className="h-10 w-10 text-yellow-400" />
            إدارة المطعم
          </h1>
          <p className="text-gray-300">إدارة القائمة والطلبات والإحصائيات</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1">
          <Button
            variant={activeTab === 'orders' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('orders')}
            className={`flex-1 ${activeTab === 'orders' ? 'bg-gray-600 text-white' : 'text-white hover:bg-slate-700/50'}`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            إنشاء طلب
          </Button>
          <Button
            variant={activeTab === 'menu' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('menu')}
            className={`flex-1 ${activeTab === 'menu' ? 'bg-gray-600 text-white' : 'text-white hover:bg-slate-700/50'}`}
          >
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            إدارة القائمة
          </Button>
          <Button
            variant={activeTab === 'statistics' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('statistics')}
            className={`flex-1 ${activeTab === 'statistics' ? 'bg-gray-600 text-white' : 'text-white hover:bg-slate-700/50'}`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            الإحصائيات
          </Button>
        </div>

        {/* إنشاء طلب */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* قائمة الطعام */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    قائمة الطعام
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedCategory === 'الكل' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('الكل')}
                      className="text-xs"
                    >
                      الكل
                    </Button>
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="text-xs"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMenuItems.map(item => (
                      <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/20 hover:bg-slate-700/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{item.name}</h3>
                            <p className="text-sm text-gray-300">{item.description}</p>
                            <p className="text-yellow-400 font-bold mt-1">{item.price} ريال</p>
                          </div>
                          <Badge variant={item.available ? 'secondary' : 'outline'}>
                            {item.available ? 'متوفر' : 'غير متوفر'}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => addToCurrentOrder(item)}
                          disabled={!item.available}
                          className="w-full mt-2 bg-green-600 hover:bg-green-700"
                        >
                          إضافة للطلب
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* تفاصيل الطلب */}
            <div>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    الطلب الحالي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* عناصر الطلب */}
                  {currentOrder.length > 0 ? (
                    <div className="space-y-2">
                      {currentOrder.map(item => (
                        <div key={item.menuItem.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.menuItem.name}</p>
                            <p className="text-gray-300 text-sm">{item.menuItem.price} ريال × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              -
                            </Button>
                            <span className="text-white w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              +
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCurrentOrder(item.menuItem.id)}
                              className="h-6 w-6 p-0 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Separator className="bg-white/20" />
                      <div className="flex justify-between items-center text-lg font-bold text-white">
                        <span>الإجمالي:</span>
                        <span>{calculateTotal()} ريال</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">لا توجد عناصر في الطلب</p>
                  )}

                  <Separator className="bg-white/20" />

                  {/* معلومات العميل */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">نوع العميل</Label>
                      <RadioGroup
                        value={customerType}
                        onValueChange={handleCustomerTypeChange}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="external" id="external" />
                          <Label htmlFor="external" className="text-white">عميل خارجي</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="internal" id="internal" />
                          <Label htmlFor="internal" className="text-white">نزيل في الفندق</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {customerType === 'internal' && (
                      <div>
                        <Label htmlFor="roomNumber" className="text-white">رقم الغرفة *</Label>
                        <Select value={roomNumber} onValueChange={handleRoomChange}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="اختر الغرفة" />
                          </SelectTrigger>
                          <SelectContent>
                            {occupiedRooms.map(room => (
                              <SelectItem key={room.id} value={room.number}>
                                غرفة {room.number} - {room.guestName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="customerName" className="text-white">اسم العميل *</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="أدخل اسم العميل"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        disabled={customerType === 'internal'}
                      />
                    </div>

                    <div>
                      <Label className="text-white">طريقة الدفع</Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(value: 'cash' | 'card' | 'room') => setPaymentMethod(value)}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash" className="text-white">نقدي</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="text-white">بطاقة</Label>
                        </div>
                        {customerType === 'internal' && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="room" id="room" />
                            <Label htmlFor="room" className="text-white">على الغرفة</Label>
                          </div>
                        )}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="orderNotes" className="text-white">ملاحظات (اختياري)</Label>
                      <Input
                        id="orderNotes"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="ملاحظات خاصة بالطلب"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <Button
                      onClick={createOrder}
                      disabled={currentOrder.length === 0 || !customerName.trim() || (customerType === 'internal' && !roomNumber)}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                    >
                      إنشاء طلب ({calculateTotal()} ريال)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {/* إدارة القائمة */}
        {activeTab === 'menu' && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                إدارة قائمة الطعام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* إضافة/تحرير عنصر */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">
                    {isEditingMenu ? 'تحرير الطبق' : 'إضافة طبق جديد'}
                  </h3>

                  <div>
                    <Label htmlFor="itemName" className="text-white">اسم الطبق</Label>
                    <Input
                      id="itemName"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                      placeholder="أدخل اسم الطبق"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="itemPrice" className="text-white">السعر (ريال)</Label>
                    <Input
                      id="itemPrice"
                      type="number"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({...newMenuItem, price: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="itemCategory" className="text-white">الفئة</Label>
                    <Select value={newMenuItem.category} onValueChange={(value) => setNewMenuItem({...newMenuItem, category: value})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">الحالة</Label>
                    <RadioGroup
                      value={newMenuItem.available ? 'available' : 'unavailable'}
                      onValueChange={(value) => setNewMenuItem({...newMenuItem, available: value === 'available'})}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="available" id="available" />
                        <Label htmlFor="available" className="text-white">متوفر</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unavailable" id="unavailable" />
                        <Label htmlFor="unavailable" className="text-white">غير متوفر</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="itemDescription" className="text-white">الوصف</Label>
                    <Input
                      id="itemDescription"
                      value={newMenuItem.description}
                      onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                      placeholder="وصف الطبق"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveMenuItem} className="flex-1">
                      {isEditingMenu ? 'تحديث' : 'إضافة'}
                    </Button>
                    {isEditingMenu && (
                      <Button variant="outline" onClick={() => {
                        setIsEditingMenu(false)
                        setEditingItem(null)
                        setNewMenuItem({
                          name: '',
                          category: 'مقبلات',
                          price: 0,
                          description: '',
                          available: true
                        })
                      }}>
                        إلغاء
                      </Button>
                    )}
                  </div>
                </div>

                {/* قائمة العناصر */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">قائمة الأطباق</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {menuItems.map(item => (
                      <div key={item.id} className="p-3 bg-white/5 rounded-lg border border-white/20">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{item.name}</h4>
                            <p className="text-sm text-gray-300">{item.description}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary">{item.category}</Badge>
                              <Badge variant={item.available ? 'secondary' : 'destructive'}>
                                {item.available ? 'متوفر' : 'غير متوفر'}
                              </Badge>
                            </div>
                            <p className="text-yellow-400 font-bold mt-1">{item.price} ريال</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => editMenuItem(item)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteMenuItem(item.id)} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* الإحصائيات */}
        {activeTab === 'statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium">إجمالي الإيرادات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalRevenue} ريال</div>
                <p className="text-xs text-gray-400">منذ البداية</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium">إيرادات اليوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{todayRevenue} ريال</div>
                <p className="text-xs text-gray-400">اليوم</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium">عدد الطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{orders.length}</div>
                <p className="text-xs text-gray-400">إجمالي الطلبات</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium">طلبات اليوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{todayOrders.length}</div>
                <p className="text-xs text-gray-400">اليوم</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* طلبات اليوم */}
        {activeTab === 'orders' && (
          <Card className="mt-8 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                طلبات اليوم ({todayOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayOrders.map(order => (
                  <div key={order.id} className="p-4 bg-white/5 rounded-lg border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{order.customerName}</h4>
                        <p className="text-sm text-gray-300">
                          {new Date(order.orderTime).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {order.roomNumber && (
                          <p className="text-sm text-blue-400">غرفة {order.roomNumber}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className={
                        order.status === 'pending' ? 'bg-yellow-500' :
                        order.status === 'preparing' ? 'bg-blue-500' :
                        order.status === 'ready' ? 'bg-green-500' :
                        'bg-gray-500'
                      }>
                        {order.status === 'pending' ? 'في الانتظار' :
                         order.status === 'preparing' ? 'قيد التحضير' :
                         order.status === 'ready' ? 'جاهز' :
                         order.status === 'delivered' ? 'تم التسليم' : order.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-300">
                          {item.menuItem.name} × {item.quantity}
                        </p>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-yellow-400">{order.totalAmount} ريال</span>
                      <div className="flex gap-1">
                        {order.status !== 'delivered' && (
                          <>
                            {order.status === 'pending' && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                بدء التحضير
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ready')}>
                                جاهز
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                تم التسليم
                              </Button>
                            )}
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => deleteOrder(order.id)} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
