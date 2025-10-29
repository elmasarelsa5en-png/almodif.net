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
  AlertCircle
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';

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

        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* قسم إدارة صور السلايدر */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <ImageIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">إدارة صور الصفحة الرئيسية</h2>
            </div>

            {/* Upload Section */}
            <div className="mb-6">
              <label className="block mb-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all">
                  <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white font-medium">اضغط لرفع صور جديدة</p>
                  <p className="text-blue-100 text-sm mt-1">يمكنك رفع عدة صور في نفس الوقت</p>
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
                <p className="text-center text-blue-300 mt-2">جاري الرفع...</p>
              )}
            </div>

            {/* Images Grid */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sliderImages.length === 0 ? (
                <p className="text-center text-gray-400 py-8">لا توجد صور حالياً</p>
              ) : (
                sliderImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <img
                      src={image.url}
                      alt={`Slide ${index + 1}`}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">صورة رقم {index + 1}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(image.uploadedAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(image)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* قسم التحكم في القائمة الجانبية */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Layout className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">التحكم في القائمة الجانبية</h2>
            </div>

            {/* Hotel Selector */}
            <div className="mb-6">
              <label className="block text-white mb-2 font-medium">اختر الفندق:</label>
              <select
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
              >
                <option value="">-- اختر فندق --</option>
                {hotelSettings.map(hotel => (
                  <option key={hotel.hotelId} value={hotel.hotelId}>
                    {hotel.hotelName}
                  </option>
                ))}
              </select>
            </div>

            {/* Sidebar Items */}
            {currentHotelSettings && (
              <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                {currentHotelSettings.items.map(item => (
                  <div
                    key={item.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                    <button
                      onClick={() => handleToggleSidebarItem(item.id)}
                      className={`p-2 rounded-lg transition-all ${
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
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            )}
          </div>
        </div>

        {/* Additional Settings Section */}
        <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings2 className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">إعدادات إضافية للمطور</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all cursor-pointer">
              <div className="text-3xl mb-2">🗄️</div>
              <h3 className="text-white font-medium mb-1">إدارة قاعدة البيانات</h3>
              <p className="text-gray-400 text-sm">قريباً...</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all cursor-pointer">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-white font-medium mb-1">سجلات النظام</h3>
              <p className="text-gray-400 text-sm">قريباً...</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all cursor-pointer">
              <div className="text-3xl mb-2">🔧</div>
              <h3 className="text-white font-medium mb-1">أدوات التطوير</h3>
              <p className="text-gray-400 text-sm">قريباً...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
