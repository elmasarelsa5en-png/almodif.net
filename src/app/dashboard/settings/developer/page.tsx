'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { 
  Code2, 
  Image as ImageIcon, 
  Layout, 
  Settings2, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  Plus,
  GripVertical,
  AlertCircle,
  Wand2,
  Cloud,
  Globe,
  ServerCog,
  Sparkles,
  Volume2,
  Bell,
  FileText,
  ChevronRight
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SliderImage {
  id: string;
  url: string;
  order: number;
  uploadedAt: Date;
}

interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

interface HotelSidebarSettings {
  hotelId: string;
  hotelName: string;
  items: SidebarItem[];
}

export default function DeveloperSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hotelSettings, setHotelSettings] = useState<HotelSidebarSettings[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // قائمة جميع أقسام Dashboard
  const allDashboardItems: SidebarItem[] = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: '📊', enabled: true },
    { id: 'rooms', name: 'الشقق', icon: '🏠', enabled: true },
    { id: 'bookings', name: 'الحجوزات', icon: '📅', enabled: true },
    { id: 'requests', name: 'الطلبات', icon: '🔔', enabled: true },
    { id: 'chat', name: 'المحادثات', icon: '💬', enabled: true },
    { id: 'guests', name: 'النزلاء', icon: '👥', enabled: true },
    { id: 'crm-whatsapp', name: 'منصات التواصل', icon: '📱', enabled: true },
    { id: 'restaurant', name: 'المطعم', icon: '🍽️', enabled: true },
    { id: 'coffee-shop', name: 'الكافيه', icon: '☕', enabled: true },
    { id: 'laundry', name: 'المغسلة', icon: '👔', enabled: true },
    { id: 'accounting', name: 'المحاسبة', icon: '💰', enabled: true },
    { id: 'analytics', name: 'التقارير', icon: '📈', enabled: true },
    { id: 'inventory', name: 'المخزون', icon: '📦', enabled: true },
    { id: 'hr', name: 'الموظفين', icon: '👨‍💼', enabled: true },
    { id: 'settings', name: 'الإعدادات', icon: '⚙️', enabled: true },
  ];

  useEffect(() => {
    // التحقق من أن المستخدم هو akram فقط
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.email !== 'akram@almodif.net' && user.username !== 'akram') {
      router.push('/dashboard');
      return;
    }

    loadSliderImages();
    loadHotelSettings();
  }, [user, router]);

  const loadSliderImages = async () => {
    try {
      const imagesRef = ref(storage, 'slider-images');
      const imagesList = await listAll(imagesRef);
      
      const images: SliderImage[] = [];
      for (const item of imagesList.items) {
        const url = await getDownloadURL(item);
        const metadata = await getMetadata(item);
        images.push({
          id: item.name,
          url,
          order: parseInt(metadata.customMetadata?.order || '0'),
          uploadedAt: new Date(metadata.timeCreated)
        });
      }

      images.sort((a, b) => a.order - b.order);
      setSliderImages(images);
    } catch (error) {
      console.error('Error loading slider images:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHotelSettings = async () => {
    try {
      // قراءة إعدادات جميع الفنادق من Firestore
      const settingsDoc = await getDoc(doc(db, 'developerSettings', 'sidebarVisibility'));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setHotelSettings(data.hotels || []);
      } else {
        // إنشاء إعدادات افتراضية
        const defaultSettings: HotelSidebarSettings[] = [
          {
            hotelId: 'hotel1',
            hotelName: 'فندق المضيف الذكي',
            items: [...allDashboardItems]
          }
        ];
        setHotelSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading hotel settings:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // التحقق من تسجيل الدخول
    if (!user) {
      alert('⚠️ يجب تسجيل الدخول أولاً');
      return;
    }

    console.log('🔐 User authenticated:', user.email || user.username);
    console.log('📤 Starting upload process...');

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        console.log('📁 Uploading file:', file.name, 'Size:', file.size, 'bytes');
        
        // رفع الصورة
        const timestamp = Date.now();
        const fileName = `slider-${timestamp}-${file.name}`;
        const imageRef = ref(storage, `slider-images/${fileName}`);
        
        console.log('📍 Storage path:', `slider-images/${fileName}`);
        
        const metadata = {
          customMetadata: {
            order: String(sliderImages.length),
            uploadedBy: user.email || user.username || 'unknown'
          }
        };

        console.log('⏳ Uploading to Firebase Storage...');
        await uploadBytes(imageRef, file, metadata);
        console.log('✅ Upload successful!');
        
        const url = await getDownloadURL(imageRef);
        console.log('🔗 Download URL:', url);

        setSliderImages(prev => [...prev, {
          id: fileName,
          url,
          order: prev.length,
          uploadedAt: new Date()
        }]);
      }
      alert('✅ تم رفع الصور بنجاح!');
    } catch (error: any) {
      console.error('❌ Error uploading images:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'storage/unauthorized') {
        alert('❌ خطأ في الصلاحيات!\n\nالرجاء التأكد من:\n1. تسجيل الدخول بحساب akram\n2. قواعد Firebase Storage صحيحة\n3. إعادة تحميل الصفحة');
      } else {
        alert('حدث خطأ أثناء رفع الصور: ' + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (image: SliderImage) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      const imageRef = ref(storage, `slider-images/${image.id}`);
      await deleteObject(imageRef);
      setSliderImages(prev => prev.filter(img => img.id !== image.id));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('حدث خطأ أثناء حذف الصورة');
    }
  };

  const handleReorderImages = (dragIndex: number, hoverIndex: number) => {
    const newImages = [...sliderImages];
    const draggedImage = newImages[dragIndex];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    
    // تحديث الترتيب
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      order: index
    }));
    
    setSliderImages(updatedImages);
  };

  const handleToggleSidebarItem = (itemId: string) => {
    if (!selectedHotel) return;

    setHotelSettings(prev => prev.map(hotel => {
      if (hotel.hotelId === selectedHotel) {
        return {
          ...hotel,
          items: hotel.items.map(item => 
            item.id === itemId ? { ...item, enabled: !item.enabled } : item
          )
        };
      }
      return hotel;
    }));
  };

  const handleSaveHotelSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'developerSettings', 'sidebarVisibility'), {
        hotels: hotelSettings,
        updatedAt: new Date(),
        updatedBy: user?.email
      });
      alert('✅ تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving hotel settings:', error);
      alert('❌ حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentHotelSettings = hotelSettings.find(h => h.hotelId === selectedHotel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">إعدادات المطور</h1>
              <p className="text-gray-300 mt-1">Developer Settings - Exclusive Access</p>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-200 font-medium">⚠️ تحذير: هذه الصفحة مخصصة للمطور فقط</p>
              <p className="text-yellow-300/80 text-sm mt-1">
                التغييرات هنا تؤثر على جميع الفنادق والمستخدمين. يرجى الحذر عند التعديل.
              </p>
            </div>
          </div>
        </div>

        {/* قائمة الإعدادات التقنية - بطاقات سريعة */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            الإعدادات التقنية والأدوات
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* معالج Firebase */}
            <div 
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 p-[2px] hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/dashboard/settings/firebase-setup')}
            >
              <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                      <Wand2 className="w-7 h-7 text-white" />
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">✨ معالج</Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    معالج إعداد Firebase
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    إعداد احترافي خطوة بخطوة مع اختبار الاتصال
                  </p>
                  
                  <div className="mt-4 flex items-center text-purple-400 text-sm font-medium">
                    <span>فتح المعالج</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* مزامنة البيانات */}
            <div 
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 p-[2px] hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/dashboard/settings/sync')}
            >
              <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                      <Cloud className="w-7 h-7 text-white" />
                    </div>
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">⭐ مهم</Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    مزامنة البيانات
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    المزامنة بين الأجهزة عبر Firebase
                  </p>
                  
                  <div className="mt-4 flex items-center text-cyan-400 text-sm font-medium">
                    <span>إدارة المزامنة</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* الموقع الإلكتروني */}
            <div 
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-[2px] hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/dashboard/settings/website')}
            >
              <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                      <Globe className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    الموقع الإلكتروني
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    إنشاء وإدارة موقع الفندق للحجز أونلاين
                  </p>
                  
                  <div className="mt-4 flex items-center text-indigo-400 text-sm font-medium">
                    <span>إعدادات الموقع</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* سيرفر WhatsApp */}
            <div 
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-green-600 p-[2px] hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/whatsapp-bot')}
            >
              <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/50">
                      <ServerCog className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">
                    سيرفر WhatsApp
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    إدارة الاتصال بـ WhatsApp وإعدادات البوت
                  </p>
                  
                  <div className="mt-4 flex items-center text-teal-400 text-sm font-medium">
                    <span>إعدادات السيرفر</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* مساعد الذكاء الاصطناعي */}
            <div 
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-600 to-amber-600 p-[2px] hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/crm/whatsapp')}
            >
              <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/50">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">AI</Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                    مساعد الذكاء الاصطناعي
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    إعدادات وتدريب مساعد الشات بوت
                  </p>
                  
                  <div className="mt-4 flex items-center text-yellow-400 text-sm font-medium">
                    <span>تكوين AI</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* إعدادات الأصوات */}
            <div 
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 p-[2px] hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/dashboard/settings/sound-settings')}
            >
              <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50">
                      <Volume2 className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                    إعدادات الأصوات
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    تخصيص التنبيهات الصوتية للنظام
                  </p>
                  
                  <div className="mt-4 flex items-center text-orange-400 text-sm font-medium">
                    <span>تخصيص الأصوات</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* نغمات الإشعارات */}
            <div 
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 p-[2px] hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/dashboard/settings/notification-sound')}
            >
              <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-pink-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/50">
                      <Bell className="w-7 h-7 text-white" />
                    </div>
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">🔔</Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-300 transition-colors">
                    نغمات الإشعارات
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    نغمة طويلة للطلبات الجديدة
                  </p>
                  
                  <div className="mt-4 flex items-center text-red-400 text-sm font-medium">
                    <span>إدارة النغمات</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* إعدادات الإشعارات */}
            <div 
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 p-[2px] hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/dashboard/settings/notifications')}
            >
              <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/50">
                      <Bell className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    إعدادات الإشعارات
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    تخصيص الإشعارات الذكية وأذونات التنبيهات
                  </p>
                  
                  <div className="mt-4 flex items-center text-amber-400 text-sm font-medium">
                    <span>تكوين الإشعارات</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* سجل التدقيق */}
            <div 
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-gray-600 to-slate-600 p-[2px] hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/dashboard/audit-logs')}
            >
              <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-slate-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/50">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-300 transition-colors">
                    سجل التدقيق
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    جميع العمليات المسجلة في النظام
                  </p>
                  
                  <div className="mt-4 flex items-center text-gray-400 text-sm font-medium">
                    <span>عرض السجلات</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قسم إدارة المحتوى */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>
          إدارة المحتوى والواجهة
        </h2>

        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* قسم إدارة صور السلايدر */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-[2px]">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">إدارة صور الصفحة الرئيسية</h2>
              </div>

              {/* Upload Section */}
              <div className="mb-6">
                <label className="block mb-2">
                  <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all group">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Upload className="w-10 h-10 text-white mx-auto mb-3" />
                    <p className="text-white font-bold text-lg">اضغط لرفع صور جديدة</p>
                    <p className="text-blue-100 text-sm mt-2">يمكنك رفع عدة صور في نفس الوقت</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="text-center mt-3">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="text-blue-300 mt-2 font-medium">جاري الرفع...</p>
                  </div>
                )}
              </div>

              {/* Images Grid */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {sliderImages.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">لا توجد صور حالياً</p>
                    <p className="text-gray-500 text-sm mt-1">ابدأ برفع أول صورة</p>
                  </div>
                ) : (
                  sliderImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="group bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <GripVertical className="w-5 h-5 text-gray-500 cursor-move group-hover:text-gray-300 transition-colors" />
                      <img
                        src={image.url}
                        alt={`Slide ${index + 1}`}
                        className="w-28 h-20 object-cover rounded-lg shadow-lg"
                      />
                      <div className="flex-1">
                        <p className="text-white font-bold">صورة رقم {index + 1}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {new Date(image.uploadedAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteImage(image)}
                        className="p-2.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* قسم التحكم في القائمة الجانبية */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-[2px]">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Layout className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">التحكم في القائمة الجانبية</h2>
              </div>

              {/* Hotel Selector */}
              <div className="mb-6">
                <label className="block text-white mb-3 font-bold text-sm">اختر الفندق:</label>
                <select
                  value={selectedHotel}
                  onChange={(e) => setSelectedHotel(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                >
                  <option value="" className="bg-slate-800">-- اختر فندق --</option>
                  {hotelSettings.map(hotel => (
                    <option key={hotel.hotelId} value={hotel.hotelId} className="bg-slate-800">
                      {hotel.hotelName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sidebar Items */}
              {currentHotelSettings && (
                <div className="space-y-3 max-h-96 overflow-y-auto mb-6 pr-2">
                  {currentHotelSettings.items.map(item => (
                    <div
                      key={item.id}
                      className="group bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.icon}</span>
                        <span className="text-white font-bold">{item.name}</span>
                      </div>
                      <button
                        onClick={() => handleToggleSidebarItem(item.id)}
                        className={`p-2.5 rounded-lg transition-all ${
                          item.enabled
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {item.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Save Button */}
              {selectedHotel && (
                <button
                  onClick={handleSaveHotelSettings}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Settings Section */}
        <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-[2px]">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">إعدادات إضافية للمطور</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => router.push('/dashboard/settings/database-manager')}
                className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-3">🗄️</div>
                  <h3 className="text-white font-bold text-lg mb-2">إدارة قاعدة البيانات</h3>
                  <p className="text-gray-400 text-sm mb-3">استعراض وإدارة البيانات مباشرة</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">متاح</Badge>
                </div>
              </div>

              <div 
                onClick={() => router.push('/dashboard/audit-logs')}
                className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-3">📊</div>
                  <h3 className="text-white font-bold text-lg mb-2">سجلات النظام</h3>
                  <p className="text-gray-400 text-sm mb-3">تتبع جميع عمليات النظام</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">متاح</Badge>
                </div>
              </div>

              <div 
                onClick={() => router.push('/dashboard/settings/dev-tools')}
                className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-3">🔧</div>
                  <h3 className="text-white font-bold text-lg mb-2">أدوات التطوير</h3>
                  <p className="text-gray-400 text-sm mb-3">أدوات مساعدة للمطورين</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">متاح</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
