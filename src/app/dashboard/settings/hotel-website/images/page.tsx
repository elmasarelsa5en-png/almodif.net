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
  RefreshCw
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

    setUploadingHero(true);
    try {
      // رفع الصورة إلى Firebase Storage
      const storageRef = ref(storage, `website-images/hero/${imageId}-${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

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
    } catch (error) {
      console.error('Error uploading hero image:', error);
      alert('❌ حدث خطأ في رفع الصورة');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleServiceImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, serviceId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingService(serviceId);
    try {
      const storageRef = ref(storage, `website-images/services/${serviceId}-${Date.now()}.jpg`);
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
    } catch (error) {
      console.error('Error uploading service image:', error);
      alert('❌ حدث خطأ في رفع الصورة');
    } finally {
      setUploadingService(null);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الصور...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🖼️ إدارة صور الموقع
              </h1>
              <p className="text-gray-600 text-lg">
                رفع وتعديل صور صفحة الزائرين (Landing Page)
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={resetToDefaults}
                variant="outline"
                className="border-2"
              >
                <RefreshCw className="ml-2 h-4 w-4" />
                استعادة الافتراضي
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-4 w-4" />
                    حفظ جميع التعديلات
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">إرشادات:</h3>
              <ul className="space-y-1 text-blue-50">
                <li>• اضغط "رفع صورة" لتغيير أي صورة</li>
                <li>• الصور المثالية: 1920x1080 بكسل (أو نسبة 16:9)</li>
                <li>• احرص على صور واضحة وعالية الجودة</li>
                <li>• يمكنك تعديل عنوان كل خدمة</li>
                <li>• لا تنسَ الضغط على "حفظ" بعد التعديلات</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Hero Images Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎬 صور الشريحة المتحركة (Hero Slider)
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {heroImages.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleHeroImageUpload(e, image.id)}
                      />
                      <Button
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-gray-100 pointer-events-none"
                        type="button"
                        asChild
                      >
                        <span className="pointer-events-auto cursor-pointer">
                          {uploadingHero ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </span>
                      </Button>
                    </label>
                    <Button
                      size="sm"
                      onClick={() => window.open(image.url, '_blank')}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-700">{image.title}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate" dir="ltr">{image.url}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Services Images Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            ⭐ صور الخدمات
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden group">
                <div className="relative">
                  <img
                    src={service.url}
                    alt={service.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleServiceImageUpload(e, service.id)}
                      />
                      <Button
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-gray-100 pointer-events-none"
                        type="button"
                        asChild
                      >
                        <span className="pointer-events-auto cursor-pointer">
                          {uploadingService === service.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </span>
                      </Button>
                    </label>
                    <Button
                      size="sm"
                      onClick={() => window.open(service.url, '_blank')}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <Input
                    value={service.title}
                    onChange={(e) => handleServiceTitleChange(service.id, e.target.value)}
                    className="text-sm font-semibold border-gray-300 focus:border-blue-500"
                    placeholder="اسم الخدمة"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Preview Link */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 mt-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">معاينة التغييرات</h3>
              <p className="text-indigo-100">
                لمشاهدة التغييرات مباشرة، احفظ أولاً ثم افتح صفحة الزائرين
              </p>
            </div>
            <Button
              onClick={() => window.open('/public/landing', '_blank')}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              <Eye className="ml-2 h-4 w-4" />
              معاينة الصفحة
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
