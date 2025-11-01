'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Check,
  X,
  Loader2,
  Eye,
  Save,
  RefreshCw,
  Film,
  Sparkles,
  Edit3,
  CheckCircle
} from 'lucide-react';

interface HeroImage {
  id: string;
  url: string;
  title: string;
}

interface ServiceImage {
  id: string;
  url: string;
  title: string;
  icon: string;
}

export default function HotelImagesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [services, setServices] = useState<ServiceImage[]>([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingService, setUploadingService] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const docRef = doc(db, 'settings', 'website-images');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setHeroImages(data.heroImages || getDefaultHeroImages());
        setServices(data.services || getDefaultServices());
      } else {
        setHeroImages(getDefaultHeroImages());
        setServices(getDefaultServices());
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setHeroImages(getDefaultHeroImages());
      setServices(getDefaultServices());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultHeroImages = (): HeroImage[] => [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      title: 'صورة الغلاف الأولى'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
      title: 'صورة الغلاف الثانية'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
      title: 'صورة الغلاف الثالثة'
    }
  ];

  const getDefaultServices = (): ServiceImage[] => [
    { id: '1', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945', title: 'واي فاي مجاني', icon: 'Wifi' },
    { id: '2', url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7', title: 'خدمة الغرف 24/7', icon: 'Clock' },
    { id: '3', url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461', title: 'مسبح خاص', icon: 'Waves' },
    { id: '4', url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6', title: 'مطعم فاخر', icon: 'Utensils' },
    { id: '5', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d', title: 'موقف سيارات', icon: 'Car' },
    { id: '6', url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa', title: 'صالة رياضية', icon: 'Dumbbell' },
    { id: '7', url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e', title: 'سبا وساونا', icon: 'Sparkles' },
    { id: '8', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', title: 'قاعة اجتماعات', icon: 'Users' }
  ];

  const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert('❌ يرجى اختيار صورة فقط');
      return;
    }

    // التحقق من حجم الملف (أقل من 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5MB');
      return;
    }

    setUploadingHero(true);
    try {
      console.log('📤 بدء رفع الصورة:', file.name, 'الحجم:', (file.size / 1024).toFixed(2), 'KB');
      
      // رفع الصورة إلى Firebase Storage
      const fileName = `${imageId}-${Date.now()}.${file.type.split('/')[1]}`;
      const storageRef = ref(storage, `website-images/hero/${fileName}`);
      
      console.log('📁 مسار التخزين:', `website-images/hero/${fileName}`);
      
      await uploadBytes(storageRef, file);
      console.log('✅ تم رفع الصورة بنجاح');
      
      const url = await getDownloadURL(storageRef);
      console.log('🔗 URL الصورة:', url);

      // تحديث الصورة في القائمة
      const updatedImages = heroImages.map(img =>
        img.id === imageId ? { ...img, url } : img
      );
      setHeroImages(updatedImages);

      // حفظ تلقائي في Firebase
      await setDoc(doc(db, 'settings', 'website-images'), {
        heroImages: updatedImages,
        services,
        updatedAt: Timestamp.now()
      });

      alert('✅ تم رفع الصورة وحفظها بنجاح!');
    } catch (error: any) {
      console.error('❌ خطأ في رفع الصورة:', error);
      console.error('تفاصيل الخطأ:', error.message);
      alert(`❌ حدث خطأ في رفع الصورة: ${error.message || 'خطأ غير معروف'}`);
    } finally {
      setUploadingHero(false);
      // إعادة تعيين input
      event.target.value = '';
    }
  };

  const handleHeroTitleChange = async (imageId: string, newTitle: string) => {
    const updatedImages = heroImages.map(img =>
      img.id === imageId ? { ...img, title: newTitle } : img
    );
    setHeroImages(updatedImages);
    
    // حفظ تلقائي
    try {
      await setDoc(doc(db, 'settings', 'website-images'), {
        heroImages: updatedImages,
        services,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error saving hero title:', error);
    }
  };

  const handleServiceImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, serviceId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert('❌ يرجى اختيار صورة فقط');
      return;
    }

    // التحقق من حجم الملف (أقل من 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5MB');
      return;
    }

    setUploadingService(serviceId);
    try {
      console.log('📤 بدء رفع صورة الخدمة:', file.name);
      
      const fileName = `${serviceId}-${Date.now()}.${file.type.split('/')[1]}`;
      const storageRef = ref(storage, `website-images/services/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const updatedServices = services.map(service =>
        service.id === serviceId ? { ...service, url } : service
      );
      setServices(updatedServices);

      // حفظ تلقائي في Firebase
      await setDoc(doc(db, 'settings', 'website-images'), {
        heroImages,
        services: updatedServices,
        updatedAt: Timestamp.now()
      });

      alert('✅ تم رفع صورة الخدمة وحفظها بنجاح!');
    } catch (error: any) {
      console.error('❌ خطأ في رفع صورة الخدمة:', error);
      alert(`❌ حدث خطأ في رفع الصورة: ${error.message || 'خطأ غير معروف'}`);
    } finally {
      setUploadingService(null);
      event.target.value = '';
    }
  };

  const handleServiceTitleChange = async (serviceId: string, newTitle: string) => {
    const updatedServices = services.map(service =>
      service.id === serviceId ? { ...service, title: newTitle } : service
    );
    setServices(updatedServices);
    
    // حفظ تلقائي بعد ثانية واحدة (debounce)
    setTimeout(async () => {
      try {
        await setDoc(doc(db, 'settings', 'website-images'), {
          heroImages,
          services: updatedServices,
          updatedAt: Timestamp.now()
        });
      } catch (error) {
        console.error('Error saving service title:', error);
      }
    }, 1000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'website-images'), {
        heroImages,
        services,
        updatedAt: Timestamp.now()
      });

      alert('✅ تم حفظ جميع التعديلات بنجاح!');
    } catch (error) {
      console.error('Error saving images:', error);
      alert('❌ حدث خطأ في حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('هل أنت متأكد من استعادة الصور الافتراضية؟ سيتم حذف جميع التعديلات.')) {
      return;
    }

    setHeroImages(getDefaultHeroImages());
    setServices(getDefaultServices());
    alert('✅ تم استعادة الصور الافتراضية');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg font-medium">جاري تحميل الصور...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  إدارة صور الموقع
                </h1>
                <p className="text-blue-200 text-lg">
                  رفع وتعديل صور صفحة الزائرين (Landing Page)
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={resetToDefaults}
                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 transition-all"
              >
                <RefreshCw className="ml-2 h-5 w-5" />
                استعادة الافتراضي
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/50 font-bold"
              >
                {saving ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-5 w-5" />
                    حفظ جميع التعديلات
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 p-[2px]">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">إرشادات الاستخدام:</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-blue-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>اضغط "رفع صورة" لتغيير أي صورة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>الصور المثالية: 1920x1080 بكسل (نسبة 16:9)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>يمكنك تعديل العنوان مباشرة بالضغط على أيقونة القلم</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>لا تنسَ الضغط على "حفظ" بعد التعديلات</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Images Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Film className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">صور الشريحة المتحركة (Hero Slider)</h2>
          </div>

          <div className="space-y-4">
            {heroImages.map((image, index) => (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-[2px] group"
              >
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                    {/* Image Preview */}
                    <div className="relative w-full lg:w-80 h-48 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-bold text-lg drop-shadow-lg">
                          {image.title}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 w-full space-y-4">
                      {/* Title Editor */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <label className="block text-blue-300 text-sm font-bold mb-2">
                          عنوان الصورة:
                        </label>
                        <div className="flex items-center gap-2">
                          {editingTitle === image.id ? (
                            <>
                              <Input
                                value={image.title}
                                onChange={(e) => handleHeroTitleChange(image.id, e.target.value)}
                                className="flex-1 bg-white/10 border-white/20 text-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                                placeholder="أدخل عنوان الصورة"
                                autoFocus
                              />
                              <Button
                                onClick={() => setEditingTitle(null)}
                                size="sm"
                                className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border-green-500/50"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1 text-white font-medium bg-white/5 px-4 py-2 rounded-lg">
                                {image.title}
                              </div>
                              <Button
                                onClick={() => setEditingTitle(image.id)}
                                size="sm"
                                className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border-blue-500/50"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Upload Button */}
                      <label className="block cursor-pointer">
                        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center hover:from-blue-700 hover:to-purple-700 transition-all group/upload">
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/upload:opacity-100 transition-opacity"></div>
                          <div className="relative flex items-center justify-center gap-3">
                            {uploadingHero ? (
                              <>
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                <span className="text-white font-bold text-lg">جاري رفع الصورة...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-white" />
                                <span className="text-white font-bold text-lg">رفع صورة جديدة</span>
                              </>
                            )}
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleHeroImageUpload(e, image.id)}
                          disabled={uploadingHero}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Images Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">صور الخدمات</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 p-[2px] group"
              >
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4">
                  <div className="flex items-center gap-4">
                    {/* Image Preview */}
                    <div className="relative w-32 h-24 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                      <img
                        src={service.url}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-3">
                      {/* Title Editor */}
                      <Input
                        value={service.title}
                        onChange={(e) => handleServiceTitleChange(service.id, e.target.value)}
                        className="bg-white/10 border-white/20 text-white font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                        placeholder="اسم الخدمة"
                      />

                      {/* Upload Button */}
                      <label className="block cursor-pointer">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg px-4 py-2 text-center hover:from-purple-700 hover:to-pink-700 transition-all">
                          <div className="flex items-center justify-center gap-2">
                            {uploadingService === service.id ? (
                              <>
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                                <span className="text-white font-bold text-sm">جاري الرفع...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-white" />
                                <span className="text-white font-bold text-sm">رفع صورة</span>
                              </>
                            )}
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleServiceImageUpload(e, service.id)}
                          disabled={uploadingService === service.id}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 p-[2px]">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">معاينة التغييرات</h3>
                  <p className="text-indigo-200 mt-1">
                    لمشاهدة التغييرات مباشرة، احفظ أولاً ثم افتح صفحة الزائرين
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open('/public/landing', '_blank')}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/50 font-bold"
              >
                <Eye className="ml-2 h-5 w-5" />
                معاينة الصفحة
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
