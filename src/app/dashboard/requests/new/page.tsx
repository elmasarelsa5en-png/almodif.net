'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Send,
  X,
  User,
  Phone,
  FileText,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getRequestTypes, type RequestType } from '@/lib/requests-management';
import { playNotificationSound } from '@/lib/notification-sounds';
import { addSmartNotification } from '@/lib/notification-service';
import { logAction } from '@/lib/audit-log';
import { addRequest, getEmployees, sendNotificationToEmployee } from '@/lib/firebase-data';
import { useLanguage } from '@/contexts/language-context';

interface GuestRequest {
  id: string;
  room: string;
  guest: string;
  phone?: string;
  type: string;
  description: string;
  notes: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'awaiting_employee_approval';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  assignedEmployee?: string;
  employeeApprovalStatus?: 'pending' | 'approved' | 'rejected';
  employeeApprovedAt?: string;
  managerNotified?: boolean;
}

interface Room {
  id: string;
  number: string;
  guestName?: string;
  phone?: string;
  status: string;
}

interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  position?: string;
  status?: string;
  department?: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [selectedSubItems, setSelectedSubItems] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // حالات جديدة لأقسام المنيو
  const [menuCategories] = useState([
    { value: 'coffee', label: t('coffeeShop'), icon: '☕' },
    { value: 'restaurant', label: t('restaurant'), icon: '🍽️' },
    { value: 'laundry', label: t('laundry'), icon: '👔' },
    { value: 'room-services', label: t('roomServices'), icon: '🛏️' },
    { value: 'reception', label: t('receptionServices'), icon: '🔔' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    room: '',
    guest: '',
    phone: '',
    type: '',
    notes: '',
    description: '', // الحقل الخاص بالملاحظات (سيتم إعادة تسميته)
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedEmployee: '',
    addToDebt: false, // إضافة للدين أم لا
    totalAmount: 0, // المبلغ الإجمالي للطلب
    paymentMethod: 'debt' as 'debt' | 'cash' | 'card', // طريقة الدفع
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // تحميل بيانات المستخدم من localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // تحميل أصناف المنيو عند اختيار قسم
  useEffect(() => {
    if (selectedCategory) {
      loadMenuItems(selectedCategory);
    } else {
      setMenuItems([]);
    }
  }, [selectedCategory]);

  // حساب المبلغ الإجمالي عند تغيير الأصناف المختارة
  useEffect(() => {
    if (selectedSubItems.length > 0 && menuItems.length > 0) {
      const total = selectedSubItems.reduce((sum, itemId) => {
        const item = menuItems.find(mi => mi.id === itemId);
        return sum + (item?.price || 0);
      }, 0);
      setFormData(prev => ({ ...prev, totalAmount: total }));
    } else {
      setFormData(prev => ({ ...prev, totalAmount: 0 }));
    }
  }, [selectedSubItems, menuItems]);

  const loadMenuItems = async (category: string) => {
    try {
      // محاولة التحميل من Firebase أولاً
      const { getMenuItems } = await import('@/lib/firebase-data');
      const allItems = await getMenuItems();
      
      // فلترة الأصناف حسب القسم
      const categoryItems = allItems.filter((item: any) => 
        item.category === category && item.available
      );
      
      console.log(`📦 Loaded ${categoryItems.length} items for category: ${category}`);
      console.log('📸 Sample item with image field:', categoryItems[0]);
      setMenuItems(categoryItems);
      
      // مسح الأصناف المختارة عند تغيير القسم
      setSelectedSubItems([]);
    } catch (error) {
      console.error('Error loading menu items:', error);
      setMenuItems([]);
    }
  };

  // تحميل الشقق والموظفين عند بدء الصفحة
  useEffect(() => {
    loadRoomsAndEmployees();

    // الاستماع لتحديثات البيانات
    const handleStorageChange = () => {
      loadRoomsAndEmployees();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // تحميل الأصناف الفرعية من الأقسام المرتبطة
  useEffect(() => {
    if (selectedType?.linkedSection) {
      loadLinkedSectionItems(selectedType.linkedSection);
    }
  }, [selectedType]);

  const loadLinkedSectionItems = (section: 'coffee' | 'restaurant' | 'laundry') => {
    try {
      if (section === 'coffee') {
        // تحميل منتجات الكوفي
        const coffeeMenu = JSON.parse(localStorage.getItem('coffee_menu') || '[]');
        const subItems = coffeeMenu
          .filter((item: any) => item.available)
          .map((item: any) => ({
            id: item.id,
            name: item.nameAr || item.name,
            available: item.available,
            icon: '☕',
          }));
        
        if (selectedType && subItems.length > 0) {
          setRequestTypes(prev =>
            prev.map(type =>
              type.id === selectedType.id
                ? { ...type, subItems }
                : type
            )
          );
          setSelectedType(prev => prev ? { ...prev, subItems } : null);
        }
      } else if (section === 'restaurant') {
        // تحميل أطباق المطعم
        const restaurantMenu = JSON.parse(localStorage.getItem('restaurant_menu') || '[]');
        const subItems = restaurantMenu
          .filter((item: any) => item.available)
          .map((item: any) => ({
            id: item.id,
            name: item.nameAr || item.name,
            available: item.available,
            icon: '🍽️',
          }));
        
        if (selectedType && subItems.length > 0) {
          setRequestTypes(prev =>
            prev.map(type =>
              type.id === selectedType.id
                ? { ...type, subItems }
                : type
            )
          );
          setSelectedType(prev => prev ? { ...prev, subItems } : null);
        }
      } else if (section === 'laundry') {
        // تحميل خدمات المغسلة
        const laundryServices = JSON.parse(localStorage.getItem('laundry_services') || '[]');
        const subItems = laundryServices
          .filter((item: any) => item.available)
          .map((item: any) => ({
            id: item.id,
            name: item.nameAr || item.name,
            available: item.available,
            icon: '👔',
          }));
        
        if (selectedType && subItems.length > 0) {
          setRequestTypes(prev =>
            prev.map(type =>
              type.id === selectedType.id
                ? { ...type, subItems }
                : type
            )
          );
          setSelectedType(prev => prev ? { ...prev, subItems } : null);
        }
      }
    } catch (error) {
      console.error('Error loading linked section items:', error);
    }
  };

  const loadRoomsAndEmployees = async () => {
    try {
      // تحميل الشقق من Firebase
      const { getRoomsFromFirebase } = await import('@/lib/firebase-sync');
      const roomsData = await getRoomsFromFirebase();
      
      // فلترة الغرف المشغولة فقط (التي فيها نزلاء) - لأن الطلب يكون من غرفة مشغولة
      const occupiedRooms = roomsData
        .filter((room: any) => 
          room.status === 'Occupied' || 
          room.status === 'CheckoutToday' ||
          (room.guestName && room.guestName.trim() !== '')
        )
        .map((room: any) => ({
          id: room.id,
          number: room.number,
          guestName: room.guestName || '',
          phone: room.phone || room.guestPhone || '',
          status: room.status
        }));
      
      console.log('📦 Loaded rooms:', occupiedRooms.length, 'occupied rooms with guests');
      setRooms(occupiedRooms);

      // تحميل الموظفين من Firebase
      const employeesData = await getEmployees();
      setEmployees(employeesData);

      // تحميل أنواع الطلبات من الإعدادات
      const types = getRequestTypes();
      setRequestTypes(types);
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Fallback: محاولة التحميل من localStorage
      try {
        const roomsData = JSON.parse(localStorage.getItem('hotel_rooms_data') || '[]');
        const occupiedRooms = roomsData
          .filter((room: any) => 
            room.status === 'Occupied' || 
            room.status === 'CheckoutToday' ||
            (room.guestName && room.guestName.trim() !== '')
          )
          .map((room: any) => ({
            id: room.id,
            number: room.number,
            guestName: room.guestName || '',
            phone: room.phone || room.guestPhone || '',
            status: room.status
          }));
        console.log('📦 Fallback: Loaded rooms from localStorage:', occupiedRooms.length);
        setRooms(occupiedRooms);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  };

  // عند اختيار غرفة، تحديث بيانات النزيل والهاتف تلقائياً
  const handleRoomChange = (roomNumber: string) => {
    setFormData((prev) => ({ ...prev, room: roomNumber }));
    
    const selectedRoom = rooms.find((r) => r.number === roomNumber);
    if (selectedRoom) {
      setFormData((prev) => ({
        ...prev,
        guest: selectedRoom.guestName || '',
        phone: selectedRoom.phone || '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.room.trim()) newErrors.room = 'رقم الغرفة مطلوب';
    if (!formData.guest.trim()) newErrors.guest = 'اسم النزيل مطلوب';
    if (!formData.type) newErrors.type = 'نوع الطلب مطلوب';
    
    // التحقق من اختيار صنف واحد على الأقل إذا كان هناك قسم محدد
    if (selectedCategory && menuItems.length > 0 && selectedSubItems.length === 0) {
      newErrors.subItems = 'يجب اختيار صنف واحد على الأقل';
    }
    
    if (!formData.assignedEmployee) newErrors.assignedEmployee = 'يجب تحديد موظف';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Build description with sub-items if any
      let fullDescription = formData.notes;
      
      // إذا كان هناك أصناف محددة من المنيو
      if (selectedCategory && selectedSubItems.length > 0) {
        const subItemNames = selectedSubItems
          .map(itemId => {
            const item = menuItems.find(mi => mi.id === itemId);
            return item ? (item.nameAr || item.name) : itemId;
          })
          .join(' + ');
        fullDescription = `${formData.type}: ${subItemNames}${formData.notes ? '\n' + formData.notes : ''}`;
      } else if (selectedType?.hasSubItems && selectedSubItems.length > 0) {
        const subItemNames = selectedSubItems
          .map(itemId => {
            const item = selectedType.subItems?.find(si => si.id === itemId);
            return item ? item.name : itemId;
          })
          .join(' + ');
        fullDescription = `${formData.type}: ${subItemNames}${formData.notes ? '\n' + formData.notes : ''}`;
      }

      // Find the assigned employee details
      const assignedEmp = employees.find(emp => emp.id === formData.assignedEmployee);
      
      // Create request object for Firebase
      const newRequest: any = {
        room: formData.room,
        guest: formData.guest,
        phone: formData.phone || undefined,
        type: formData.type,
        description: fullDescription,
        notes: formData.notes,
        status: 'awaiting_employee_approval',
        createdAt: new Date().toISOString(),
        createdBy: user?.name || user?.username || 'الإدارة',
        priority: formData.priority,
        assignedEmployee: assignedEmp ? assignedEmp.name : formData.assignedEmployee,
        assignedEmployeeId: formData.assignedEmployee, // حفظ الـ ID للرجوع إليه
        employeeApprovalStatus: 'pending',
        selectedSubItems: selectedSubItems.length > 0 ? selectedSubItems : undefined,
        linkedSection: selectedCategory || selectedType?.linkedSection,
        menuCategory: selectedCategory || undefined,
      };

      // Save to Firebase
      const docId = await addRequest(newRequest);
      console.log('✅ تم حفظ الطلب في Firebase:', docId);

      if (!docId) {
        throw new Error('فشل حفظ الطلب في Firebase');
      }

      // ✅ إنشاء SmartNotification لتشغيل الصوت في جميع الأجهزة
      addSmartNotification({
        title: '📋 طلب جديد',
        message: `غرفة ${formData.room}: ${formData.type} - ${formData.guest}`,
        time: new Date().toISOString(),
        unread: true,
        type: 'guest_request',
        priority: formData.priority === 'high' ? 'high' : 'medium',
        category: 'guests',
        requestId: docId,
        actionRequired: true,
        actionUrl: `/dashboard/requests`
      });

      // تشغيل الصوت محلياً أيضاً
      playNotificationSound('new-request');

      // إضافة المبلغ لدين الشقة إذا اختار المستخدم ذلك
      if (formData.paymentMethod === 'debt' && formData.totalAmount > 0 && formData.room) {
        try {
          const { getRoomsFromFirebase, saveRoomToFirebase } = await import('@/lib/firebase-sync');
          const rooms = await getRoomsFromFirebase();
          const roomToUpdate = rooms.find(r => r.number === formData.room);
          
          if (roomToUpdate) {
            const updatedRoom = {
              ...roomToUpdate,
              servicesDebt: (roomToUpdate.servicesDebt || 0) + formData.totalAmount,
              currentDebt: (roomToUpdate.currentDebt || 0) + formData.totalAmount,
              lastDebtUpdate: new Date().toISOString(),
              events: [
                ...roomToUpdate.events,
                {
                  id: Date.now().toString(),
                  type: 'service_request' as const,
                  description: `طلب خدمة: ${formData.type} - المبلغ: ${formData.totalAmount} ر.س`,
                  timestamp: new Date().toISOString(),
                  user: formData.guest || 'نزيل',
                  amount: formData.totalAmount
                }
              ]
            };
            
            await saveRoomToFirebase(updatedRoom);
            console.log(`💰 تم إضافة ${formData.totalAmount} ر.س لدين الشقة ${formData.room}`);
          }
        } catch (error) {
          console.error('خطأ في إضافة المبلغ لدين الشقة:', error);
          // لا نوقف العملية إذا فشل تحديث الدين
        }
      }

      // إرسال إشعار للموظف المحدد
      if (formData.assignedEmployee && assignedEmp) {
        console.log('📤 محاولة إرسال إشعار للموظف:', assignedEmp);
        if (assignedEmp) {
          const notificationId = await sendNotificationToEmployee({
            employeeId: assignedEmp.id,
            employeeName: assignedEmp.name,
            type: 'new_request',
            title: '📋 طلب جديد',
            message: `لديك طلب جديد من غرفة ${formData.room} - ${formData.guest}`,
            requestId: docId,
            roomNumber: formData.room,
            priority: formData.priority,
            read: false,
            createdAt: new Date().toISOString(),
          });
          console.log(`✅ تم إرسال إشعار للموظف ${assignedEmp.name}، ID: ${notificationId}`);
        } else {
          console.warn('⚠️ لم يتم العثور على الموظف المحدد');
        }
      } else {
        console.warn('⚠️ لم يتم تحديد موظف للطلب');
      }

      // تسجيل في Audit Log
      logAction.createRequest(formData.room, formData.type, docId);
      if (assignedEmp) {
        logAction.assignRequest(formData.room, formData.type, assignedEmp.name, docId);
      }

      // If linked to a section, save there too (still using localStorage for compatibility)
      if (selectedType?.linkedSection) {
        saveToLinkedSection({ ...newRequest, id: docId }, selectedType.linkedSection);
      }

      // Show success message
      setSuccessMessage('✅ تم إنشاء الطلب بنجاح! سيتم إخطار الموظف والمدير.');

      // Reset form
      setFormData({
        room: '',
        guest: '',
        phone: '',
        type: '',
        notes: '',
        description: '',
        priority: 'medium',
        assignedEmployee: '',
        addToDebt: false,
        totalAmount: 0,
        paymentMethod: 'debt',
      });
      setSelectedSubItems([]);
      setSelectedType(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/requests');
      }, 2000);
    } catch (error) {
      console.error('Error creating request:', error);
      setErrors({ submit: 'حدث خطأ أثناء إنشاء الطلب' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle request type change
    if (name === 'type') {
      const type = requestTypes.find(t => t.name === value);
      setSelectedType(type || null);
      setSelectedSubItems([]);
      
      // إذا كان القسم يجب تحديده من القائمة المنسدلة الجديدة
      setSelectedCategory('');
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // معالجة تغيير القسم
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFormData((prev) => ({
      ...prev,
      type: menuCategories.find(c => c.value === category)?.label || '',
    }));
    setSelectedType(null);
    setSelectedSubItems([]);
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: '' }));
    }
  };

  const toggleSubItem = (itemId: string) => {
    setSelectedSubItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
    // Clear sub-items error if any
    if (errors.subItems) {
      setErrors(prev => ({ ...prev, subItems: '' }));
    }
  };

  const saveToLinkedSection = (request: any, section: 'coffee' | 'restaurant' | 'laundry') => {
    try {
      if (section === 'coffee') {
        // حفظ كطلب في الكوفي
        const coffeeOrders = JSON.parse(localStorage.getItem('coffee_orders') || '[]');
        const coffeeOrder = {
          id: request.id,
          roomNumber: request.room,
          guestName: request.guest,
          items: (request.selectedSubItems || []).map((itemId: string) => {
            const coffeeMenu = JSON.parse(localStorage.getItem('coffee_menu') || '[]');
            const item = coffeeMenu.find((m: any) => m.id === itemId);
            return {
              menuItemId: itemId,
              menuItemName: item?.nameAr || item?.name || itemId,
              quantity: 1,
              price: item?.price || 0,
            };
          }),
          totalAmount: 0, // سيتم حسابه
          status: 'pending',
          orderDate: request.createdAt,
          paymentMethod: 'room_charge',
          requestId: request.id, // ربط مع الطلب الأصلي
        };
        coffeeOrders.unshift(coffeeOrder);
        localStorage.setItem('coffee_orders', JSON.stringify(coffeeOrders));
      } else if (section === 'restaurant') {
        // حفظ كطلب في المطعم
        const restaurantOrders = JSON.parse(localStorage.getItem('restaurant_orders') || '[]');
        const restaurantOrder = {
          id: request.id,
          roomNumber: request.room,
          guestName: request.guest,
          items: (request.selectedSubItems || []).map((itemId: string) => {
            const restaurantMenu = JSON.parse(localStorage.getItem('restaurant_menu') || '[]');
            const item = restaurantMenu.find((m: any) => m.id === itemId);
            return {
              menuItemId: itemId,
              menuItemName: item?.nameAr || item?.name || itemId,
              quantity: 1,
              price: item?.price || 0,
            };
          }),
          totalAmount: 0,
          status: 'pending',
          orderDate: request.createdAt,
          paymentMethod: 'room_charge',
          requestId: request.id,
        };
        restaurantOrders.unshift(restaurantOrder);
        localStorage.setItem('restaurant_orders', JSON.stringify(restaurantOrders));
      } else if (section === 'laundry') {
        // حفظ كطلب في المغسلة
        const laundryOrders = JSON.parse(localStorage.getItem('laundry_orders') || '[]');
        const laundryOrder = {
          id: request.id,
          roomNumber: request.room,
          guestName: request.guest,
          items: (request.selectedSubItems || []).map((itemId: string) => {
            const laundryServices = JSON.parse(localStorage.getItem('laundry_services') || '[]');
            const item = laundryServices.find((s: any) => s.id === itemId);
            return {
              serviceId: itemId,
              serviceName: item?.nameAr || item?.name || itemId,
              quantity: 1,
              price: item?.price || 0,
            };
          }),
          totalAmount: 0,
          status: 'pending',
          orderDate: request.createdAt,
          requestId: request.id,
        };
        laundryOrders.unshift(laundryOrder);
        localStorage.setItem('laundry_orders', JSON.stringify(laundryOrders));
      }
    } catch (error) {
      console.error('Error saving to linked section:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 relative overflow-hidden" dir="rtl">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                {t('back')}
              </Button>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                  {t('createNewRequest')}
                </h1>
                <p className="text-green-200/80">
                  {t('createNewRequestDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <Card className="bg-green-500/20 backdrop-blur-md border-green-500/30 shadow-2xl mb-6">
              <CardContent className="p-4 text-green-300 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span>{successMessage}</span>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">{t('requestInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grid for form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Room Number - Dropdown */}
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      {t('roomNumber')}
                      <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="room"
                      value={formData.room}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className={`w-full bg-white/10 border-2 text-white p-2 rounded-lg appearance-none cursor-pointer ${
                        errors.room ? 'border-red-500' : 'border-white/20 focus:border-green-500'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'left 8px center',
                        paddingLeft: '28px',
                      }}
                    >
                      <option value="" className="bg-slate-900">{t('selectRoom')}</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.number} className="bg-slate-900">
                          الغرفة {room.number} - {room.guestName || 'بدون نزيل'}
                        </option>
                      ))}
                    </select>
                    {errors.room && <p className="text-red-400 text-xs">{errors.room}</p>}
                  </div>

                  {/* Guest Name - Auto-filled */}
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      {t('guestName')}
                      <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      name="guest"
                      value={formData.guest}
                      onChange={handleInputChange}
                      placeholder={t('autoFilled')}
                      readOnly
                      className={`bg-white/10 border-2 text-white placeholder:text-white/50 cursor-not-allowed ${
                        errors.guest ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.guest && <p className="text-red-400 text-xs">{errors.guest}</p>}
                  </div>

                  {/* Phone - Auto-filled */}
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-400" />
                      {t('phoneNumber')}
                      <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t('autoFilled')}
                      readOnly
                      className="bg-white/10 border-2 border-white/20 focus:border-green-500 text-white placeholder:text-white/50 cursor-not-allowed"
                    />
                  </div>

                  {/* Request Type - Menu Categories */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      {t('requestTypeLabel')}
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {menuCategories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => handleCategoryChange(category.value)}
                          className={`p-4 rounded-lg border-2 transition-all text-sm font-semibold flex flex-col items-center gap-2 ${
                            selectedCategory === category.value
                              ? 'bg-purple-500/30 border-purple-400 text-purple-200 shadow-lg scale-105'
                              : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/30'
                          }`}
                        >
                          <span className="text-3xl">{category.icon}</span>
                          <span>{category.label}</span>
                          {selectedCategory === category.value && <span className="text-xs">✓ محدد</span>}
                        </button>
                      ))}
                    </div>
                    {errors.type && <p className="text-red-400 text-xs">{errors.type}</p>}
                    
                    {/* إظهار الأنواع التقليدية إذا لم يتم اختيار قسم */}
                    {!selectedCategory && (
                      <div className="mt-3">
                        <p className="text-white/60 text-xs mb-2">أو اختر من الأنواع التقليدية:</p>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full bg-white/10 border-2 border-white/20 focus:border-green-500 text-white p-2 rounded-lg appearance-none cursor-pointer"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'left 8px center',
                            paddingLeft: '28px',
                          }}
                        >
                          <option value="" className="bg-slate-900">-- اختر نوع الطلب --</option>
                          {requestTypes.map((type) => (
                            <option key={type.id} value={type.name} className="bg-slate-900">
                              {type.icon && `${type.icon} `}{type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Menu Items Selection - Shows if category selected */}
                  {selectedCategory && (menuItems.length > 0 ? (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        اختر الأصناف المطلوبة
                        <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2 bg-white/5 rounded-lg">
                        {menuItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleSubItem(item.id)}
                            className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold flex flex-col items-start gap-1 ${
                              selectedSubItems.includes(item.id)
                                ? 'bg-green-500/30 border-green-400 text-green-200'
                                : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-2xl">{item.image || '📦'}</span>
                              <span className="flex-1 text-right">{item.nameAr || item.name}</span>
                              {selectedSubItems.includes(item.id) && <span className="text-green-400">✓</span>}
                            </div>
                            {item.price > 0 && (
                              <span className="text-xs text-white/50">{item.price} ر.س</span>
                            )}
                            {item.description && (
                              <span className="text-xs text-white/40 line-clamp-2">{item.description}</span>
                            )}
                          </button>
                        ))}
                      </div>
                      {errors.subItems && <p className="text-red-400 text-xs mt-2">{errors.subItems}</p>}
                      
                      {/* Selected items summary */}
                      {selectedSubItems.length > 0 && (
                        <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                          <p className="text-green-200 text-sm font-semibold mb-2">
                            ✓ تم اختيار {selectedSubItems.length} صنف:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedSubItems.map(id => {
                              const item = menuItems.find(mi => mi.id === id);
                              return item ? (
                                <span key={id} className="bg-green-500/30 px-2 py-1 rounded text-xs">
                                  {item.image || '📦'} {item.nameAr || item.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="md:col-span-2 bg-yellow-500/20 border-2 border-yellow-400/50 rounded-lg p-6 text-center">
                      <p className="text-yellow-200 text-lg font-bold mb-2">⚠️ لا توجد أصناف متاحة</p>
                      <p className="text-yellow-200/80 text-sm">لم يتم العثور على أصناف في قسم {menuCategories.find(c => c.value === selectedCategory)?.label}</p>
                      <p className="text-yellow-200/60 text-xs mt-2">يرجى التأكد من إضافة الأصناف إلى Firebase أولاً</p>
                    </div>
                  ))}

                  {/* Old Sub-Items Selection - Shows if type has sub-items */}
                  {selectedType?.hasSubItems && selectedType.subItems && selectedType.subItems.length > 0 && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        اختر الأصناف المطلوبة
                        <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedType.subItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleSubItem(item.id)}
                            className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold flex items-center gap-2 ${
                              selectedSubItems.includes(item.id)
                                ? 'bg-green-500/30 border-green-400 text-green-200'
                                : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {item.icon && <span className="text-xl">{item.icon}</span>}
                            <span>{item.name}</span>
                            {selectedSubItems.includes(item.id) && <span className="mr-auto">✓</span>}
                          </button>
                        ))}
                      </div>
                      {errors.subItems && <p className="text-red-400 text-xs">{errors.subItems}</p>}
                      
                      {/* Selected items summary */}
                      {selectedSubItems.length > 0 && (
                        <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                          <p className="text-green-200 text-sm font-semibold">
                            ✓ تم اختيار: {selectedSubItems.map(id => {
                              const item = selectedType.subItems?.find(si => si.id === id);
                              return item?.name;
                            }).join(' + ')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assigned Employee */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      {t('assignEmployee')}
                      <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="assignedEmployee"
                      value={formData.assignedEmployee}
                      onChange={handleInputChange}
                      className={`w-full bg-white/10 border-2 text-white p-2 rounded-lg appearance-none cursor-pointer ${
                        errors.assignedEmployee ? 'border-red-500' : 'border-white/20 focus:border-green-500'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'left 8px center',
                        paddingLeft: '28px',
                      }}
                    >
                      <option value="" className="bg-slate-900">{t('selectEmployee')}</option>
                      {employees.map((emp) => {
                        const designation = emp.position || emp.role || emp.department || '';
                        return (
                          <option key={emp.id} value={emp.id} className="bg-slate-900">
                            {emp.name} {designation ? `- ${designation}` : ''}
                          </option>
                        );
                      })}
                    </select>
                    {errors.assignedEmployee && <p className="text-red-400 text-xs">{errors.assignedEmployee}</p>}
                  </div>

                  {/* Priority */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-white/80 text-sm font-semibold">{t('priority')}</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, priority }))}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                            formData.priority === priority
                              ? priority === 'low'
                                ? 'bg-blue-500/40 border-2 border-blue-400 text-blue-300'
                                : priority === 'medium'
                                  ? 'bg-yellow-500/40 border-2 border-yellow-400 text-yellow-300'
                                  : 'bg-red-500/40 border-2 border-red-400 text-red-300'
                              : 'bg-white/10 border-2 border-white/20 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {priority === 'low' ? t('low') : priority === 'medium' ? t('medium') : t('high')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Section - يظهر فقط لو فيه أصناف محددة */}
                {formData.totalAmount > 0 && selectedSubItems.length > 0 && (
                  <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md border-green-400/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        💰 {t('paymentDetails')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* إجمالي المبلغ */}
                      <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400/40 rounded-xl p-5 text-center shadow-lg">
                        <p className="text-sm text-emerald-200/80 mb-2 font-medium">💰 {t('totalAmountLabel')}</p>
                        <p className="text-4xl font-bold text-white drop-shadow-lg">{formData.totalAmount} <span className="text-2xl text-emerald-200">ر.س</span></p>
                      </div>

                      {/* طريقة الدفع */}
                      <div className="space-y-3">
                        <label className="text-white text-base font-bold flex items-center gap-2">
                          💳 {t('paymentMethodLabel')}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'debt' }))}
                            className={`py-4 px-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                              formData.paymentMethod === 'debt'
                                ? 'bg-gradient-to-br from-orange-500 to-red-600 border-2 border-orange-300 text-white shadow-xl shadow-red-500/50'
                                : 'bg-slate-700/50 border-2 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500'
                            }`}
                          >
                            📋 {t('addToRoomDebt')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                            className={`py-4 px-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                              formData.paymentMethod === 'cash'
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-green-300 text-white shadow-xl shadow-green-500/50'
                                : 'bg-slate-700/50 border-2 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500'
                            }`}
                          >
                            💵 {t('cash')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                            className={`py-4 px-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                              formData.paymentMethod === 'card'
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-blue-300 text-white shadow-xl shadow-blue-500/50'
                                : 'bg-slate-700/50 border-2 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500'
                            }`}
                          >
                            💳 {t('card')}
                          </button>
                        </div>
                        {formData.paymentMethod === 'debt' && (
                          <div className="bg-orange-500/20 border-2 border-orange-400/50 rounded-lg p-3 mt-3">
                            <p className="text-sm text-orange-200 font-medium">⚠️ سيتم إضافة المبلغ لدين الشقة ويمكن تسديده لاحقاً</p>
                          </div>
                        )}
                        {(formData.paymentMethod === 'cash' || formData.paymentMethod === 'card') && (
                          <div className="bg-green-500/20 border-2 border-green-400/50 rounded-lg p-3 mt-3">
                            <p className="text-sm text-green-200 font-medium">✅ تم الدفع فوراً - لن يضاف للدين</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes/Description */}
                <div className="space-y-2">
                  <label className="text-white/80 text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    {t('notes')}
                    <span className="text-white/50 text-xs">({t('optional')})</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder={t('notesPlaceholder')}
                    rows={5}
                    className={`w-full bg-white/10 border-2 text-white placeholder:text-white/50 p-3 rounded-lg focus:outline-none resize-none ${
                      errors.notes ? 'border-red-500' : 'border-white/20 focus:border-green-500'
                    }`}
                  />
                  {errors.notes && <p className="text-red-400 text-xs">{errors.notes}</p>}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <Card className="bg-red-500/20 backdrop-blur-md border-red-500/30">
                    <CardContent className="p-4 text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>{errors.submit}</span>
                    </CardContent>
                  </Card>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                  >
                    <Send className="w-4 h-4 ml-2" />
                    {isSubmitting ? t('submitting') : t('submitRequest')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20 flex-1"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="bg-blue-500/20 backdrop-blur-md border-blue-500/30 shadow-2xl mt-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-200 text-sm">
                  <p className="font-semibold mb-1">💡 ملاحظة مهمة:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>عند اختيار الغرفة: سيتم تعبئة اسم النزيل ورقم الهاتف تلقائياً</li>
                    <li>تحديد الموظف: سيتم إخطاره بالطلب فوراً مع نغمة صوتية</li>
                    <li>قبول الموظف: عند قبوله للطلب، سيتم إخطار المدير فوراً</li>
                    <li>الملاحظات: حقل اختياري يمكن تركه فارغاً</li>
                    <li>جميع الحقول المشار إليها بـ * مطلوبة</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
