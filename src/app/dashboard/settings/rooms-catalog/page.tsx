'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon,
  Bed, Home, Ruler, DollarSign, Users, Star, Check, AlertCircle, Cloud, CloudOff
} from 'lucide-react';
import { syncRoomsToFirebase } from '@/lib/rooms-manager';

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

  useEffect(() => {
    // Load from localStorage
    const savedRooms = localStorage.getItem('hotelRooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }
  }, []);

  const saveRooms = (updatedRooms: Room[]) => {
    localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
    setRooms(updatedRooms);
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

  const handleSave = () => {
    if (!editingRoom) return;

    if (isAddingNew) {
      saveRooms([...rooms, editingRoom]);
    } else {
      saveRooms(rooms.map(r => r.id === editingRoom.id ? editingRoom : r));
    }

    setEditingRoom(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الغرفة؟')) {
      saveRooms(rooms.filter(r => r.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingRoom) return;
    
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: RoomImage = {
          id: Date.now().toString() + Math.random(),
          url: event.target?.result as string,
        };
        setEditingRoom({
          ...editingRoom,
          images: [...editingRoom.images, newImage]
        });
      };
      reader.readAsDataURL(file);
    });
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-600" />
            كتالوج الغرف والشقق
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة الغرف والشقق المتاحة في الفندق
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!editingRoom && (
            <>
              <Button 
                onClick={handleSyncToFirebase}
                disabled={isSyncing || rooms.length === 0}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                {isSyncing ? (
                  <CloudOff className="h-4 w-4 ml-2 animate-pulse" />
                ) : (
                  <Cloud className="h-4 w-4 ml-2" />
                )}
                {isSyncing ? 'جاري المزامنة...' : 'مزامنة مع تطبيق النزلاء'}
              </Button>
              
              <Button onClick={handleAddNew} size="lg">
                <Plus className="h-4 w-4 ml-2" />
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الغرف</p>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </div>
              <Home className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الغرف المتاحة</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter(r => r.available).length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط المساحة</p>
                <p className="text-2xl font-bold">
                  {rooms.length > 0 
                    ? Math.round(rooms.reduce((sum, r) => sum + r.area, 0) / rooms.length)
                    : 0
                  } م²
                </p>
              </div>
              <Ruler className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط السعر</p>
                <p className="text-2xl font-bold">
                  {rooms.length > 0
                    ? Math.round(rooms.reduce((sum, r) => sum + r.price.daily, 0) / rooms.length)
                    : 0
                  } ر.س
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600 opacity-20" />
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
          <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              {room.images.length > 0 ? (
                <img 
                  src={room.images[0].url} 
                  alt={room.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                {room.type}
              </div>
              {!room.available && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  غير متاحة
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <h3 className="text-xl font-bold mb-2">{room.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {room.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span>{room.area} م²</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>حتى {room.maxGuests} نزلاء</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {room.beds.double > 0 && `${room.beds.double} مزدوج`}
                    {room.beds.single > 0 && ` ${room.beds.single} مفرد`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
                  <DollarSign className="h-5 w-5" />
                  <span>{room.price.daily} ر.س / ليلة</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
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
                  className="text-red-600 hover:bg-red-50"
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
