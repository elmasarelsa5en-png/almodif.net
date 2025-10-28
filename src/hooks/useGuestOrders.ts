'use client';

import { useState, useEffect } from 'react';

export interface GuestOrder {
  id: string;
  guestData: {
    name: string;
    phone: string;
    roomNumber: string;
    service: string;
    loginTime: string;
  };
  items: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  service: string;
  notes?: string;
}

export const useGuestOrders = () => {
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // تحميل الطلبات
  const loadOrders = () => {
    try {
      const savedOrders = localStorage.getItem('guest_orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders.sort((a: GuestOrder, b: GuestOrder) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // حفظ الطلبات
  const saveOrders = (updatedOrders: GuestOrder[]) => {
    localStorage.setItem('guest_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  // تحديث حالة الطلب
  const updateOrderStatus = (orderId: string, status: GuestOrder['status']) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );
    saveOrders(updatedOrders);
    
    // إرسال إشعار للضيف (يمكن تطويره لاحقاً)
    console.log(`Order ${orderId} status updated to ${status}`);
  };

  // إضافة طلب جديد
  const addOrder = (order: GuestOrder) => {
    const updatedOrders = [order, ...orders];
    saveOrders(updatedOrders);
    
    // إرسال إشعار للموظفين
    notifyStaff(order);
  };

  // إشعار الموظفين
  const notifyStaff = (order: GuestOrder) => {
    // إنشاء إشعار للموظفين
    const notification = {
      id: `notification-${Date.now()}`,
      type: 'new_order',
      title: 'طلب جديد من النزلاء',
      message: `طلب جديد من الغرفة ${order.guestData.roomNumber} - ${order.guestData.name}`,
      orderId: order.id,
      service: order.service,
      createdAt: new Date().toISOString(),
      read: false
    };

    // حفظ الإشعار
    const existingNotifications = JSON.parse(localStorage.getItem('staff_notifications') || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem('staff_notifications', JSON.stringify(existingNotifications));

    console.log('Staff notification created:', notification);
  };

  // الحصول على الطلبات حسب الخدمة
  const getOrdersByService = (service: string) => {
    return orders.filter(order => order.service === service);
  };

  // الحصول على الطلبات حسب الحالة
  const getOrdersByStatus = (status: GuestOrder['status']) => {
    return orders.filter(order => order.status === status);
  };

  // الحصول على الطلبات المعلقة
  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending');
  };

  // حذف طلب
  const deleteOrder = (orderId: string) => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    saveOrders(updatedOrders);
  };

  useEffect(() => {
    loadOrders();
    
    // تحديث دوري كل 30 ثانية
    const interval = setInterval(loadOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    orders,
    loading,
    loadOrders,
    updateOrderStatus,
    addOrder,
    getOrdersByService,
    getOrdersByStatus,
    getPendingOrders,
    deleteOrder,
    refreshOrders: loadOrders
  };
};

export default useGuestOrders;