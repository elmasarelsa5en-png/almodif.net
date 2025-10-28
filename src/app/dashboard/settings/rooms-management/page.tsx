'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bed, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Home, 
  Building2, 
  ArrowRight, 
  Image,
  CheckCircle2,
  AlertCircle,
  Settings
} from 'lucide-react';
import { 
  Room, 
  RoomStatus,
  getRoomsFromStorage, 
  saveRoomsToStorage,
  ROOM_STATUS_CONFIG,
  ROOM_TYPE_CONFIG
} from '@/lib/rooms-data';
import AddRoomsFromImageDialog from '@/components/AddRoomsFromImageDialog';

export default function RoomsManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<RoomStatus | 'All'>('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddFromImageOpen, setIsAddFromImageOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    floor: 1,
    type: 'غرفة',
    status: 'Available' as RoomStatus
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedRooms = getRoomsFromStorage();
    setRooms(loadedRooms);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.guestName && room.guestName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || room.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      number: room.number,
      floor: room.floor,
      type: room.type,
      status: room.status
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedRoom) return;
    
    const updatedRooms = rooms.map(room =>
      room.id === selectedRoom.id
        ? { 
            ...room, 
            number: formData.number, 
            floor: formData.floor, 
            type: formData.type,
            status: formData.status,
            lastUpdated: new Date().toISOString(),
            events: [
              ...room.events,
              {
                id: Date.now().toString(),
                type: 'status_change',
                description: 'تم تعديل معلومات الغرفة',
                timestamp: new Date().toISOString(),
                user: user?.name || user?.username || 'System',
                oldValue: `${room.number} - ${room.type}`,
                newValue: `${formData.number} - ${formData.type}`
              }
            ]
          }
        : room
    );
    setRooms(updatedRooms);
    saveRoomsToStorage(updatedRooms);
    setIsEditDialogOpen(false);
    setSelectedRoom(null);
  };

  const handleDelete = () => {
    if (!selectedRoom) return;
    const updatedRooms = rooms.filter(room => room.id !== selectedRoom.id);
    setRooms(updatedRooms);
    saveRoomsToStorage(updatedRooms);
    setIsDeleteDialogOpen(false);
    setSelectedRoom(null);
  };

  const handleAddRoom = () => {
    setFormData({
      number: '',
      floor: 1,
      type: 'غرفة',
      status: 'Available'
    });
    setIsAddDialogOpen(true);
  };

  const handleCreateRoom = () => {
    if (!formData.number.trim()) {
      alert('يرجى إدخال رقم الغرفة');
      return;
    }

    // تحقق من عدم التكرار
    if (rooms.some(r => r.number === formData.number)) {
      alert('رقم الغرفة موجود مسبقاً');
      return;
    }

    const newRoom: Room = {
      id: `room_${Date.now()}`,
      number: formData.number,
      type: formData.type,
      floor: formData.floor,
      status: formData.status,
      balance: 0,
      events: [{
        id: Date.now().toString(),
        type: 'status_change',
        description: 'تم إنشاء الغرفة',
        timestamp: new Date().toISOString(),
        user: user?.name || user?.username || 'System',
        newValue: 'Available'
      }],
      lastUpdated: new Date().toISOString()
    };
    
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    saveRoomsToStorage(updatedRooms);
    setIsAddDialogOpen(false);
  };

  const handleAddRoomsFromImage = (newRooms: Partial<Room>[]) => {
    // التحقق من عدم وجود غرف مكررة
    const existingNumbers = rooms.map(r => r.number);
    const uniqueRooms = newRooms.filter(room => 
      room.number && !existingNumbers.includes(room.number)
    );
    
    if (uniqueRooms.length === 0) {
      alert('جميع الغرف موجودة بالفعل في النظام');
      return;
    }
    
    const roomsToAdd: Room[] = uniqueRooms.map(room => ({
      id: room.id || `room_${Date.now()}_${Math.random()}`,
      number: room.number || '',
      floor: room.floor || Math.floor(parseInt(room.number || '0') / 100),
      type: room.type || 'غرفة',
      status: 'Available' as RoomStatus,
      balance: 0,
      events: [{
        id: Date.now().toString(),
        type: 'status_change',
        description: 'تم إنشاء الغرفة من الصورة',
        timestamp: new Date().toISOString(),
        user: user?.name || user?.username || 'System',
        newValue: 'Available'
      }],
      lastUpdated: new Date().toISOString()
    }));
    
    const updatedRooms = [...rooms, ...roomsToAdd];
    setRooms(updatedRooms);
    saveRoomsToStorage(updatedRooms);
    setIsAddFromImageOpen(false);
    
    alert(`تم إضافة ${roomsToAdd.length} غرفة بنجاح`);
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'Available').length,
    occupied: rooms.filter(r => r.status === 'Occupied').length,
    maintenance: rooms.filter(r => r.status === 'Maintenance').length,
    needsCleaning: rooms.filter(r => r.status === 'NeedsCleaning').length,
  };

  // أنواع الغرف المتاحة
  const roomTypes = ['غرفة', 'شقة', 'غرفة وصالة', 'غرفتين', 'غرفتين وصالة', 'جناح', 'VIP', 'استوديو'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* خلفية تزيينية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* الهيدر */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  إدارة الغرف والشقق
                </h1>
                <p className="text-blue-200/70 text-sm">إضافة، تعديل، وحذف الغرف من النظام</p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/settings')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            رجوع للإعدادات
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">إجمالي الغرف</CardTitle>
              <Home className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-200">غرف متاحة</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{stats.available}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-200">غرف مشغولة</CardTitle>
              <Bed className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{stats.occupied}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-200">تحتاج تنظيف</CardTitle>
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{stats.needsCleaning}</div>
            </CardContent>
          </Card>
        </div>

        {/* شريط الأدوات */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* البحث */}
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
                <Input 
                  placeholder="ابحث عن غرفة برقمها أو نوعها..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                />
              </div>

              {/* فلتر الحالة */}
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as RoomStatus | 'All')}>
                <SelectTrigger className="w-full lg:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="All" className="text-white hover:bg-slate-700/50">جميع الحالات</SelectItem>
                  {Object.entries(ROOM_STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status} className="text-white hover:bg-slate-700/50">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* أزرار الإضافة */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddRoom}
                  className="flex-1 lg:flex-initial bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة غرفة
                </Button>
                
                <Button 
                  onClick={() => setIsAddFromImageOpen(true)}
                  className="flex-1 lg:flex-initial bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                >
                  <Image className="h-4 w-4 ml-2" />
                  إضافة من صورة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة الغرف */}
        {filteredRooms.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-blue-400/50" />
              <h3 className="text-xl font-semibold text-white mb-2">لا توجد غرف</h3>
              <p className="text-blue-200/70 mb-4">
                {searchTerm || filterStatus !== 'All' 
                  ? 'لم يتم العثور على غرف تطابق البحث' 
                  : 'ابدأ بإضافة غرف إلى النظام'}
              </p>
              <Button 
                onClick={handleAddRoom}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة غرفة الآن
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRooms.map((room) => {
              const statusConfig = ROOM_STATUS_CONFIG[room.status];
              return (
                <Card key={room.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:shadow-2xl transition-all hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg ${statusConfig.bgColor} flex items-center justify-center`}>
                          <Bed className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">غرفة {room.number}</CardTitle>
                          <p className="text-xs text-blue-200/70">الطابق {room.floor}</p>
                        </div>
                      </div>
                      <Badge className={`${statusConfig.bgColor} text-white`}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                        <span className="text-blue-200/70">النوع:</span>
                        <span className="font-medium text-white">{room.type}</span>
                      </div>
                      
                      {room.guestName && (
                        <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                          <span className="text-blue-200/70">النزيل:</span>
                          <span className="font-medium text-white text-xs">{room.guestName}</span>
                        </div>
                      )}

                      {room.balance > 0 && (
                        <div className="flex justify-between items-center p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                          <span className="text-red-200">الرصيد:</span>
                          <span className="font-bold text-red-300">{room.balance} ر.س</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(room)} 
                        className="flex-1 bg-blue-600/20 border-blue-400/30 text-blue-200 hover:bg-blue-600/30"
                      >
                        <Pencil className="h-3 w-3 ml-2" />
                        تعديل
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteClick(room)} 
                        className="bg-red-600/20 border-red-400/30 text-red-200 hover:bg-red-600/30"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* نافذة إضافة غرفة جديدة */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-green-400" />
                إضافة غرفة جديدة
              </DialogTitle>
              <DialogDescription className="text-blue-200/80">
                أدخل معلومات الغرفة الجديدة
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-number" className="text-blue-200">رقم الغرفة *</Label>
                <Input 
                  id="add-number" 
                  value={formData.number} 
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="مثال: 101"
                  className="bg-white/10 border-blue-400/30 text-white placeholder:text-blue-300/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-floor" className="text-blue-200">الطابق</Label>
                <Input 
                  id="add-floor" 
                  type="number" 
                  min="1" 
                  value={formData.floor} 
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-type" className="text-blue-200">النوع</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-white/10 border-blue-400/30 text-white">
                    <SelectValue placeholder="اختر نوع الغرفة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-slate-700/50">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-status" className="text-blue-200">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as RoomStatus })}>
                  <SelectTrigger className="bg-white/10 border-blue-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {Object.entries(ROOM_STATUS_CONFIG).map(([status, config]) => (
                      <SelectItem key={status} value={status} className="text-white hover:bg-slate-700/50">
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-blue-400/30 text-blue-200">
                إلغاء
              </Button>
              <Button onClick={handleCreateRoom} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Plus className="w-4 h-4 ml-2" />
                إضافة الغرفة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة تعديل غرفة */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Pencil className="w-6 h-6 text-blue-400" />
                تعديل الغرفة {selectedRoom?.number}
              </DialogTitle>
              <DialogDescription className="text-blue-200/80">
                قم بتعديل معلومات الغرفة
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-number" className="text-blue-200">رقم الغرفة</Label>
                <Input 
                  id="edit-number" 
                  value={formData.number} 
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-floor" className="text-blue-200">الطابق</Label>
                <Input 
                  id="edit-floor" 
                  type="number" 
                  min="1" 
                  value={formData.floor} 
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type" className="text-blue-200">النوع</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-white/10 border-blue-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-slate-700/50">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-blue-200">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as RoomStatus })}>
                  <SelectTrigger className="bg-white/10 border-blue-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {Object.entries(ROOM_STATUS_CONFIG).map(([status, config]) => (
                      <SelectItem key={status} value={status} className="text-white hover:bg-slate-700/50">
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-blue-400/30 text-blue-200">
                إلغاء
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة حذف غرفة */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 backdrop-blur-md border-red-500/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-400" />
                حذف الغرفة
              </DialogTitle>
              <DialogDescription className="text-red-200/80">
                هل أنت متأكد من حذف غرفة {selectedRoom?.number}؟ 
                <br />
                <span className="font-semibold text-red-300">هذا الإجراء لا يمكن التراجع عنه.</span>
              </DialogDescription>
            </DialogHeader>

            {selectedRoom && (
              <div className="bg-white/10 rounded-lg p-4 space-y-2">
                <p className="text-sm text-blue-200">معلومات الغرفة:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200/70">الرقم:</span>
                    <span className="text-white font-medium">{selectedRoom.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200/70">النوع:</span>
                    <span className="text-white font-medium">{selectedRoom.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200/70">الحالة:</span>
                    <Badge className={`${ROOM_STATUS_CONFIG[selectedRoom.status].bgColor} text-white`}>
                      {ROOM_STATUS_CONFIG[selectedRoom.status].label}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-blue-400/30 text-blue-200">
                إلغاء
              </Button>
              <Button 
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white" 
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف نهائياً
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة إضافة غرف من صورة */}
        <AddRoomsFromImageDialog
          open={isAddFromImageOpen}
          onClose={() => setIsAddFromImageOpen(false)}
          onSubmit={handleAddRoomsFromImage}
        />
      </div>
    </div>
  );
}
