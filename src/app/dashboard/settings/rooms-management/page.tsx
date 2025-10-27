'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Bed, Plus, Pencil, Trash2, Search, Home, Building2, ArrowRight } from 'lucide-react';
import { Room, getRoomsFromStorage, saveRoomsToStorage } from '@/lib/rooms-data';

export default function RoomsManagementPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    floor: 1,
    type: 'standard',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    let loadedRooms = getRoomsFromStorage();
    if (loadedRooms.length === 0) {
      loadedRooms = generateInitialRooms();
      saveRoomsToStorage(loadedRooms);
    }
    setRooms(loadedRooms);
  };

  const generateInitialRooms = (): Room[] => {
    const generatedRooms: Room[] = [];
    for (let i = 1; i <= 35; i++) {
      const floor = Math.ceil(i / 10);
      generatedRooms.push({
        id: `room-${i}`,
        number: i.toString(),
        type: 'standard',
        floor,
        status: 'Available',
        balance: 0,
        events: [],
        lastUpdated: new Date().toISOString()
      });
    }
    return generatedRooms;
  };

  const filteredRooms = rooms.filter(room =>
    room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.guestName && room.guestName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      number: room.number,
      floor: room.floor,
      type: room.type,
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
        ? { ...room, number: formData.number, floor: formData.floor, type: formData.type, lastUpdated: new Date().toISOString() }
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
    const newRoomNumber = rooms.length + 1;
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      number: newRoomNumber.toString(),
      type: 'standard',
      floor: Math.ceil(newRoomNumber / 10),
      status: 'Available',
      balance: 0,
      events: [],
      lastUpdated: new Date().toISOString()
    };
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    saveRoomsToStorage(updatedRooms);
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'Available').length,
    occupied: rooms.filter(r => r.status === 'Occupied').length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الغرف</h1>
          <p className="text-muted-foreground mt-2">إدارة وتعديل معلومات الغرف والشقق</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/settings')}>
          <ArrowRight className="h-4 w-4 ml-2" />رجوع للإعدادات
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الغرف</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">غرف متاحة</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">غرف مشغولة</CardTitle>
            <Bed className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="ابحث عن غرفة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
        </div>
        <Button onClick={handleAddRoom}>
          <Plus className="h-4 w-4 ml-2" />إضافة غرفة
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">غرفة {room.number}</CardTitle>
                </div>
                <Badge variant="outline">الطابق {room.floor}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">النوع:</span>
                  <span className="font-medium">{room.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الحالة:</span>
                  <Badge variant={room.status === 'Available' ? 'default' : 'secondary'}>
                    {room.status === 'Available' ? 'متاحة' : room.status === 'Occupied' ? 'مشغولة' : room.status}
                  </Badge>
                </div>
                {room.guestName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النزيل:</span>
                    <span className="font-medium text-xs">{room.guestName}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(room)} className="flex-1">
                  <Pencil className="h-3 w-3 ml-2" />تعديل
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteClick(room)} className="text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الغرفة</DialogTitle>
            <DialogDescription>قم بتعديل معلومات الغرفة</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="number">رقم الغرفة</Label>
              <Input id="number" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">الطابق</Label>
              <Input id="floor" type="number" min="1" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">النوع</Label>
              <Input id="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الغرفة</DialogTitle>
            <DialogDescription>هل أنت متأكد من حذف غرفة {selectedRoom?.number}؟ هذا الإجراء لا يمكن التراجع عنه.</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>إلغاء</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
