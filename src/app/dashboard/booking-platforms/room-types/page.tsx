'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Users,
  Bed,
  Sofa,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cn } from '@/lib/utils';

interface RoomType {
  id: string;
  name: string;
  nameEn: string;
  defaultPrice: number;
  capacity: number;
  bedrooms: number;
  hasLounge: boolean;
  description: string;
  createdAt: string;
}

export default function RoomTypesPage() {
  const router = useRouter();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    {
      id: 'room1',
      name: 'غرفة',
      nameEn: 'Room',
      defaultPrice: 300,
      capacity: 2,
      bedrooms: 1,
      hasLounge: false,
      description: 'غرفة نوم واحدة',
      createdAt: '2025-01-01'
    },
    {
      id: 'room-lounge',
      name: 'غرفة وصالة',
      nameEn: 'Room & Lounge',
      defaultPrice: 450,
      capacity: 3,
      bedrooms: 1,
      hasLounge: true,
      description: 'غرفة نوم واحدة مع صالة',
      createdAt: '2025-01-01'
    },
    {
      id: 'room2',
      name: 'غرفتين',
      nameEn: '2 Rooms',
      defaultPrice: 500,
      capacity: 4,
      bedrooms: 2,
      hasLounge: false,
      description: 'غرفتين نوم',
      createdAt: '2025-01-01'
    },
    {
      id: 'room2-lounge',
      name: 'غرفتين وصالة',
      nameEn: '2 Rooms & Lounge',
      defaultPrice: 650,
      capacity: 5,
      bedrooms: 2,
      hasLounge: true,
      description: 'غرفتين نوم مع صالة',
      createdAt: '2025-01-01'
    },
    {
      id: 'room3',
      name: '3 غرف',
      nameEn: '3 Rooms',
      defaultPrice: 800,
      capacity: 6,
      bedrooms: 3,
      hasLounge: false,
      description: 'ثلاث غرف نوم',
      createdAt: '2025-01-01'
    }
  ]);

  const [editDialog, setEditDialog] = useState<{ open: boolean; roomType: RoomType | null }>({
    open: false,
    roomType: null
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAdd = () => {
    setEditDialog({
      open: true,
      roomType: {
        id: `room-${Date.now()}`,
        name: '',
        nameEn: '',
        defaultPrice: 0,
        capacity: 2,
        bedrooms: 1,
        hasLounge: false,
        description: '',
        createdAt: new Date().toISOString().split('T')[0]
      }
    });
  };

  const handleEdit = (roomType: RoomType) => {
    setEditDialog({ open: true, roomType: { ...roomType } });
  };

  const handleSave = () => {
    if (!editDialog.roomType) return;

    const exists = roomTypes.find(rt => rt.id === editDialog.roomType!.id);
    
    if (exists) {
      // تحديث
      setRoomTypes(prev => prev.map(rt => 
        rt.id === editDialog.roomType!.id ? editDialog.roomType! : rt
      ));
      setSuccessMessage('✅ تم تحديث نوع الوحدة بنجاح!');
    } else {
      // إضافة جديد
      setRoomTypes(prev => [...prev, editDialog.roomType!]);
      setSuccessMessage('✅ تم إضافة نوع وحدة جديد! سيظهر في التقويم تلقائياً');
    }

    setTimeout(() => setSuccessMessage(null), 3000);
    setEditDialog({ open: false, roomType: null });
  };

  const handleDelete = () => {
    if (!deleteDialog.id) return;
    
    setRoomTypes(prev => prev.filter(rt => rt.id !== deleteDialog.id));
    setSuccessMessage('✅ تم حذف نوع الوحدة بنجاح!');
    setTimeout(() => setSuccessMessage(null), 3000);
    setDeleteDialog({ open: false, id: null });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6" dir="rtl">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3">
              <Check className="w-5 h-5" />
              <span className="font-bold">{successMessage}</span>
            </div>
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4 ml-2" />
                  رجوع
                </Button>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Home className="w-8 h-8 text-blue-400" />
                  إعدادات أنواع الوحدات
                </h1>
              </div>
              <p className="text-white/60 mt-1">إدارة أنواع الوحدات السكنية والأسعار الافتراضية</p>
            </div>

            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة نوع جديد
            </Button>
          </div>

          {/* Room Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.map((roomType) => (
              <Card key={roomType.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-blue-400" />
                      <span className="text-white">{roomType.name}</span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {roomType.nameEn}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-white/70 text-sm">السعر الافتراضي</span>
                    </div>
                    <span className="text-white font-bold">{roomType.defaultPrice} ر.س</span>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-white/70 text-sm">السعة</span>
                    </div>
                    <span className="text-white font-bold">{roomType.capacity} أشخاص</span>
                  </div>

                  {/* Bedrooms */}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-orange-400" />
                      <span className="text-white/70 text-sm">غرف النوم</span>
                    </div>
                    <span className="text-white font-bold">{roomType.bedrooms} غرفة</span>
                  </div>

                  {/* Lounge */}
                  {roomType.hasLounge && (
                    <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <Sofa className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 text-sm">يحتوي على صالة</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-white/60 text-sm">{roomType.description}</p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleEdit(roomType)}
                      size="sm"
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
                    >
                      <Edit className="w-3 h-3 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      onClick={() => setDeleteDialog({ open: true, id: roomType.id })}
                      size="sm"
                      variant="outline"
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Home className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-2">💡 ملاحظة مهمة</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    أي تعديل أو إضافة لأنواع الوحدات هنا سيظهر تلقائياً في صفحة التقويم. 
                    يمكنك تحديد السعر الافتراضي لكل نوع وحدة، وسيتم استخدامه كقيمة ابتدائية في التقويم.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit/Add Dialog */}
        <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, roomType: null })}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {editDialog.roomType?.name ? 'تعديل نوع الوحدة' : 'إضافة نوع وحدة جديد'}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                قم بتحديد معلومات نوع الوحدة والسعر الافتراضي
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/70 font-medium">الاسم بالعربي</label>
                  <Input
                    value={editDialog.roomType?.name || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      roomType: prev.roomType ? { ...prev.roomType, name: e.target.value } : null
                    }))}
                    placeholder="مثال: غرفة وصالة"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70 font-medium">الاسم بالإنجليزي</label>
                  <Input
                    value={editDialog.roomType?.nameEn || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      roomType: prev.roomType ? { ...prev.roomType, nameEn: e.target.value } : null
                    }))}
                    placeholder="Room & Lounge"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/70 font-medium">السعر الافتراضي (ريال)</label>
                  <Input
                    type="number"
                    value={editDialog.roomType?.defaultPrice || 0}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      roomType: prev.roomType ? { ...prev.roomType, defaultPrice: Number(e.target.value) } : null
                    }))}
                    placeholder="450"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70 font-medium">عدد غرف النوم</label>
                  <Input
                    type="number"
                    value={editDialog.roomType?.bedrooms || 1}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      roomType: prev.roomType ? { ...prev.roomType, bedrooms: Number(e.target.value) } : null
                    }))}
                    min="1"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70 font-medium">السعة (أشخاص)</label>
                  <Input
                    type="number"
                    value={editDialog.roomType?.capacity || 2}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      roomType: prev.roomType ? { ...prev.roomType, capacity: Number(e.target.value) } : null
                    }))}
                    min="1"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editDialog.roomType?.hasLounge || false}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      roomType: prev.roomType ? { ...prev.roomType, hasLounge: e.target.checked } : null
                    }))}
                    className="w-4 h-4"
                  />
                  <Sofa className="w-4 h-4 text-blue-400" />
                  <span className="text-white/70 text-sm">يحتوي على صالة</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70 font-medium">الوصف</label>
                <Input
                  value={editDialog.roomType?.description || ''}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    roomType: prev.roomType ? { ...prev.roomType, description: e.target.value } : null
                  }))}
                  placeholder="وصف مختصر لنوع الوحدة"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setEditDialog({ open: false, roomType: null })}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-400">تأكيد الحذف</DialogTitle>
              <DialogDescription className="text-white/70">
                هل أنت متأكد من حذف هذا النوع؟ سيتم إزالته من التقويم أيضاً.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                onClick={() => setDeleteDialog({ open: false, id: null })}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
