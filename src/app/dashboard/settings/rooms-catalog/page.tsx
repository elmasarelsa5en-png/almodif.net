'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon,
  Bed, Home, Ruler, DollarSign, Users, Star, Check, AlertCircle, Cloud, CloudOff,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { syncRoomsToFirebase } from '@/lib/rooms-manager';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface RoomImage {
  id: string;
  url: string;
  caption?: string;
}

interface Room {
  id: string;
  name: string;
  nameEn?: string;
  type: 'غرفة' | 'جناح' | 'شقة' | 'فيلا';
  description: string;
  area: number; // بالمتر المربع
  maxGuests: number;
  beds: {
    single: number;
    double: number;
    sofa: number;
  };
  price: {
    daily: number;
    weekly?: number;
    monthly?: number;
  };
  amenities: string[];
  images: RoomImage[];
  features: {
    bathroom: boolean;
    kitchen: boolean;
    balcony: boolean;
    view: string;
  };
  available: boolean;
}

export default function RoomsCatalogPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomImageIndex, setRoomImageIndex] = useState<{ [key: string]: number }>({});

  // جلب الغرف من Firebase مباشرة
  useEffect(() => {
    const loadRoomsFromFirebase = async () => {
      if (!db) {
        console.warn('⚠️ Firebase غير متصل');
        setLoading(false);
        return;
      }

      try {
        const roomsCollection = collection(db, 'rooms_catalog');
        const querySnapshot = await getDocs(roomsCollection);
        
        const loadedRooms: Room[] = [];
        querySnapshot.forEach((doc) => {
          loadedRooms.push({ id: doc.id, ...doc.data() } as Room);
        });

        setRooms(loadedRooms);
        console.log('✅ تم تحميل', loadedRooms.length, 'غرفة من Firebase');
      } catch (error) {
        console.error('❌ خطأ في تحميل الغرف:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoomsFromFirebase();
  }, []);

  // حفظ/تحديث غرفة في Firebase
  const saveRoomToFirebase = async (room: Room) => {
    if (!db) {
      alert('❌ Firebase غير متصل. لا يمكن حفظ الغرفة.');
      return false;
    }

    try {
      const roomRef = doc(db, 'rooms_catalog', room.id);
      await setDoc(roomRef, room);
      console.log('✅ تم حفظ الغرفة في Firebase');
      return true;
    } catch (error) {
      console.error('❌ خطأ في حفظ الغرفة:', error);
      alert('❌ حدث خطأ في حفظ الغرفة');
      return false;
    }
  };

  // حذف غرفة من Firebase
  const deleteRoomFromFirebase = async (roomId: string) => {
    if (!db) {
      alert('❌ Firebase غير متصل');
      return false;
    }

    try {
      const roomRef = doc(db, 'rooms_catalog', roomId);
      await deleteDoc(roomRef);
      console.log('✅ تم حذف الغرفة من Firebase');
      return true;
    } catch (error) {
      console.error('❌ خطأ في حذف الغرفة:', error);
      return false;
    }
  };

  const handleAddNew = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: '',
      type: 'غرفة',
      description: '',
      area: 0,
      maxGuests: 2,
      beds: { single: 0, double: 1, sofa: 0 },
      price: { daily: 0 },
      amenities: [],
      images: [],
      features: {
        bathroom: true,
        kitchen: false,
        balcony: false,
        view: ''
      },
      available: true
    };
    setEditingRoom(newRoom);
    setIsAddingNew(true);
  };

  const handleSave = async () => {
    if (!editingRoom) return;

    const success = await saveRoomToFirebase(editingRoom);
    
    if (success) {
      if (isAddingNew) {
        setRooms([...rooms, editingRoom]);
      } else {
        setRooms(rooms.map(r => r.id === editingRoom.id ? editingRoom : r));
      }

      setEditingRoom(null);
      setIsAddingNew(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الغرفة؟')) {
      const success = await deleteRoomFromFirebase(id);
      
      if (success) {
        setRooms(rooms.filter(r => r.id !== id));
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingRoom) return;
    
    const files = Array.from(e.target.files || []);
    
    // إذا Firebase غير متاح، استخدم base64 مضغوط
    if (!storage) {
      console.warn('⚠️ Firebase غير متاح - استخدام base64 مضغوط');
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            // ضغط الصورة
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            const newImage: RoomImage = {
              id: Date.now().toString() + Math.random(),
              url: compressedBase64,
            };
            setEditingRoom({
              ...editingRoom,
              images: [...editingRoom.images, newImage]
            });
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    // رفع على Firebase Storage
    try {
      for (const file of files) {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const fileName = `rooms/${editingRoom.id || 'temp'}_${timestamp}_${randomId}.jpg`;
        const storageRef = ref(storage, fileName);

        // رفع الصورة
        await uploadBytes(storageRef, file);
        
        // الحصول على URL
        const downloadURL = await getDownloadURL(storageRef);
        
        const newImage: RoomImage = {
          id: timestamp.toString() + randomId,
          url: downloadURL,
        };

        setEditingRoom({
          ...editingRoom,
          images: [...editingRoom.images, newImage]
        });
      }

      console.log('✅ تم رفع الصور بنجاح على Firebase Storage');
    } catch (error) {
      console.error('❌ خطأ في رفع الصور:', error);
      alert('حدث خطأ في رفع الصور. جرب مرة أخرى.');
    }
  };

  const commonAmenities = [
    'واي فاي مجاني', 'تلفزيون', 'مكيف', 'ثلاجة', 'ميكروويف',
    'غلاية كهربائية', 'خزنة', 'مجفف شعر', 'حمام خاص', 'مستلزمات استحمام',
    'مناشف', 'بياضات', 'خدمة التنظيف', 'خدمة الغرف', 'موقف سيارات'
  ];

  const handleSyncToFirebase = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    
    try {
      const success = await syncRoomsToFirebase();
      if (success) {
        setSyncMessage('✅ تم المزامنة بنجاح! الغرف متاحة الآن للحجز في تطبيق النزلاء');
      } else {
        setSyncMessage('❌ فشلت المزامنة. يرجى المحاولة مرة أخرى');
      }
    } catch (error) {
      setSyncMessage('❌ حدث خطأ أثناء المزامنة');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">جاري تحميل الغرف من Firebase...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3 text-gray-900">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/50">
              <Home className="h-7 w-7 text-white" />
            </div>
            كتالوج الغرف والشقق
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            إدارة الغرف والشقق المتاحة في الفندق (محفوظة في Firebase)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!editingRoom && (
            <>
              <Button 
                onClick={handleSyncToFirebase}
                disabled={isSyncing || rooms.length === 0}
                variant="outline"
                className="border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-semibold"
              >
                {isSyncing ? (
                  <CloudOff className="h-5 w-5 ml-2 animate-pulse" />
                ) : (
                  <Cloud className="h-5 w-5 ml-2" />
                )}
                {isSyncing ? 'جاري المزامنة...' : 'مزامنة مع تطبيق النزلاء'}
              </Button>
              
              <Button 
                onClick={handleAddNew} 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-lg"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة غرفة جديدة
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`mb-6 p-4 rounded-lg border ${
          syncMessage.includes('✅') 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {syncMessage}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-amber-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">إجمالي الغرف</p>
                <p className="text-3xl font-bold text-gray-900">{rooms.length}</p>
              </div>
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <Home className="h-7 w-7 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">الغرف المتاحة</p>
                <p className="text-3xl font-bold text-green-700">
                  {rooms.filter(r => r.available).length}
                </p>
              </div>
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <Check className="h-7 w-7 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">متوسط المساحة</p>
                <p className="text-3xl font-bold text-purple-700">
                  {rooms.length > 0 
                    ? Math.round(rooms.reduce((sum, r) => sum + r.area, 0) / rooms.length)
                    : 0
                  } م²
                </p>
              </div>
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <Ruler className="h-7 w-7 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">متوسط السعر</p>
                <p className="text-3xl font-bold text-blue-700">
                  {rooms.length > 0
                    ? Math.round(rooms.reduce((sum, r) => sum + r.price.daily, 0) / rooms.length)
                    : 0
                  } ر.س
                </p>
              </div>
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit/Add Form */}
      {editingRoom && (
        <Card className="mb-6 border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{isAddingNew ? 'إضافة غرفة جديدة' : 'تعديل الغرفة'}</span>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!editingRoom.name}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingRoom(null);
                    setIsAddingNew(false);
                  }}
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الغرفة *</Label>
                <Input
                  id="name"
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  placeholder="غرفة ديلوكس 101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="nameEn"
                  value={editingRoom.nameEn || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, nameEn: e.target.value })}
                  placeholder="Deluxe Room 101"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">النوع</Label>
                <select
                  id="type"
                  value={editingRoom.type}
                  onChange={(e) => setEditingRoom({ 
                    ...editingRoom, 
                    type: e.target.value as Room['type']
                  })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="غرفة">غرفة</option>
                  <option value="جناح">جناح</option>
                  <option value="شقة">شقة</option>
                  <option value="فيلا">فيلا</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">المساحة (م²) *</Label>
                <Input
                  id="area"
                  type="number"
                  value={editingRoom.area}
                  onChange={(e) => setEditingRoom({ 
                    ...editingRoom, 
                    area: parseInt(e.target.value) || 0 
                  })}
                  placeholder="35"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxGuests">الحد الأقصى للنزلاء</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  value={editingRoom.maxGuests}
                  onChange={(e) => setEditingRoom({ 
                    ...editingRoom, 
                    maxGuests: parseInt(e.target.value) || 0 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="view">الإطلالة</Label>
                <Input
                  id="view"
                  value={editingRoom.features.view}
                  onChange={(e) => setEditingRoom({ 
                    ...editingRoom, 
                    features: { ...editingRoom.features, view: e.target.value }
                  })}
                  placeholder="إطلالة على البحر"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">وصف الغرفة *</Label>
              <Textarea
                id="description"
                value={editingRoom.description}
                onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                placeholder="وصف تفصيلي للغرفة ومميزاتها..."
                rows={4}
              />
            </div>

            {/* Beds */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Bed className="h-5 w-5" />
                الأسرّة
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>أسرة مفردة</Label>
                  <Input
                    type="number"
                    value={editingRoom.beds.single}
                    onChange={(e) => setEditingRoom({
                      ...editingRoom,
                      beds: { ...editingRoom.beds, single: parseInt(e.target.value) || 0 }
                    })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>أسرة مزدوجة</Label>
                  <Input
                    type="number"
                    value={editingRoom.beds.double}
                    onChange={(e) => setEditingRoom({
                      ...editingRoom,
                      beds: { ...editingRoom.beds, double: parseInt(e.target.value) || 0 }
                    })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>سرير أريكة</Label>
                  <Input
                    type="number"
                    value={editingRoom.beds.sofa}
                    onChange={(e) => setEditingRoom({
                      ...editingRoom,
                      beds: { ...editingRoom.beds, sofa: parseInt(e.target.value) || 0 }
                    })}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                الأسعار (ر.س)
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>السعر اليومي *</Label>
                  <Input
                    type="number"
                    value={editingRoom.price.daily}
                    onChange={(e) => setEditingRoom({
                      ...editingRoom,
                      price: { ...editingRoom.price, daily: parseInt(e.target.value) || 0 }
                    })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>السعر الأسبوعي</Label>
                  <Input
                    type="number"
                    value={editingRoom.price.weekly || ''}
                    onChange={(e) => setEditingRoom({
                      ...editingRoom,
                      price: { ...editingRoom.price, weekly: parseInt(e.target.value) || undefined }
                    })}
                    min="0"
                    placeholder="اختياري"
                  />
                </div>
                <div className="space-y-2">
                  <Label>السعر الشهري</Label>
                  <Input
                    type="number"
                    value={editingRoom.price.monthly || ''}
                    onChange={(e) => setEditingRoom({
                      ...editingRoom,
                      price: { ...editingRoom.price, monthly: parseInt(e.target.value) || undefined }
                    })}
                    min="0"
                    placeholder="اختياري"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">المرافق</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRoom.features.bathroom}
                    onChange={(e) => setEditingRoom({
                      ...editingRoom,
                      features: { ...editingRoom.features, bathroom: e.target.checked }
                    })}
                    className="w-4 h-4"
                  />
                  <span>حمام خاص</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRoom.features.kitchen}
                    onChange={(e) => setEditingRoom({
                      ...editingRoom,
                      features: { ...editingRoom.features, kitchen: e.target.checked }
                    })}
                    className="w-4 h-4"
                  />
                  <span>مطبخ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRoom.features.balcony}
                    onChange={(e) => setEditingRoom({
                      ...editingRoom,
                      features: { ...editingRoom.features, balcony: e.target.checked }
                    })}
                    className="w-4 h-4"
                  />
                  <span>شرفة</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRoom.available}
                    onChange={(e) => setEditingRoom({
                      ...editingRoom,
                      available: e.target.checked
                    })}
                    className="w-4 h-4"
                  />
                  <span>متاحة للحجز</span>
                </label>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">وسائل الراحة والخدمات</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonAmenities.map(amenity => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRoom.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingRoom({
                            ...editingRoom,
                            amenities: [...editingRoom.amenities, amenity]
                          });
                        } else {
                          setEditingRoom({
                            ...editingRoom,
                            amenities: editingRoom.amenities.filter(a => a !== amenity)
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                صور الغرفة
              </Label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {editingRoom.images.map((img, idx) => (
                  <div key={img.id} className="relative group">
                    <img 
                      src={img.url} 
                      alt={`صورة ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => setEditingRoom({
                        ...editingRoom,
                        images: editingRoom.images.filter(i => i.id !== img.id)
                      })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                <label className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">إضافة صور</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rooms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <Card key={room.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-amber-200 group">
            <div className="relative overflow-hidden">
              {room.images.length > 0 ? (
                <div className="relative h-56">
                  {/* Current Image */}
                  <img 
                    src={room.images[roomImageIndex[room.id] || 0].url} 
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Navigation Arrows - Only if more than 1 image */}
                  {room.images.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoomImageIndex(prev => ({
                            ...prev,
                            [room.id]: ((prev[room.id] || 0) - 1 + room.images.length) % room.images.length
                          }));
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      
                      {/* Next Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoomImageIndex(prev => ({
                            ...prev,
                            [room.id]: ((prev[room.id] || 0) + 1) % room.images.length
                          }));
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Image Counter */}
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                        {(roomImageIndex[room.id] || 0) + 1} / {room.images.length}
                      </div>

                      {/* Dots Indicator */}
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                        {room.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRoomImageIndex(prev => ({ ...prev, [room.id]: i }));
                            }}
                            className={`transition-all ${
                              i === (roomImageIndex[room.id] || 0)
                                ? 'w-6 h-1.5 bg-white'
                                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/70'
                            } rounded-full backdrop-blur-sm`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                {room.type}
              </div>
              {!room.available && (
                <div className="absolute top-3 left-3 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  غير متاحة
                </div>
              )}
            </div>
            
            <CardContent className="p-5">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-amber-600 transition-colors">{room.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                {room.description}
              </p>
              
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 text-sm bg-gray-50 p-2 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Ruler className="h-4 w-4 text-purple-700" />
                  </div>
                  <span className="font-semibold text-gray-900">{room.area} م²</span>
                </div>
                <div className="flex items-center gap-3 text-sm bg-gray-50 p-2 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-700" />
                  </div>
                  <span className="font-semibold text-gray-900">حتى {room.maxGuests} نزلاء</span>
                </div>
                <div className="flex items-center gap-3 text-sm bg-gray-50 p-2 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Bed className="h-4 w-4 text-blue-700" />
                  </div>
                  <span className="font-semibold text-gray-900">
                    {room.beds.double > 0 && `${room.beds.double} مزدوج`}
                    {room.beds.single > 0 && ` ${room.beds.single} مفرد`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-5 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200">
                <DollarSign className="h-6 w-6 text-amber-700" />
                <span className="text-2xl font-bold text-amber-900">{room.price.daily}</span>
                <span className="text-amber-700 font-semibold">ر.س / ليلة</span>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold"
                  onClick={() => {
                    setEditingRoom(room);
                    setIsAddingNew(false);
                  }}
                >
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                  onClick={() => handleDelete(room.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && !editingRoom && (
        <Card className="p-12">
          <div className="text-center">
            <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد غرف مضافة بعد</h3>
            <p className="text-muted-foreground mb-6">
              ابدأ بإضافة الغرف والشقق المتاحة في الفندق
            </p>
            <Button onClick={handleAddNew} size="lg">
              <Plus className="h-4 w-4 ml-2" />
              إضافة أول غرفة
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
