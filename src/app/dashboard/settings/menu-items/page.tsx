'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Coffee,
  Utensils,
  Shirt,
  FileSpreadsheet,
  Check,
  X,
  Loader2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  ImageIcon,
  Camera,
  BedDouble,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  bulkAddMenuItems,
  subscribeToMenuItems,
  type MenuItem 
} from '@/lib/firebase-data';

const CATEGORIES = [
  { value: 'coffee', label: 'كوفي شوب', icon: Coffee, color: 'amber' },
  { value: 'restaurant', label: 'مطعم', icon: Utensils, color: 'orange' },
  { value: 'laundry', label: 'مغسلة', icon: Shirt, color: 'blue' },
  { value: 'room-services', label: 'خدمات الغرف', icon: BedDouble, color: 'purple' },
  { value: 'reception', label: 'خدمات الاستقبال', icon: HelpCircle, color: 'green' },
];

const SUB_CATEGORIES = {
  coffee: ['مشروبات ساخنة', 'مشروبات باردة', 'حلويات', 'وجبات خفيفة'],
  restaurant: ['مقبلات', 'أطباق رئيسية', 'حلويات', 'مشروبات', 'سلطات'],
  laundry: ['ملابس', 'مفروشات', 'خدمات خاصة'],
  'room-services': ['تنظيف الغرف', 'صيانة', 'مستلزمات', 'خدمة الغرف'],
  reception: ['استعلامات', 'حجوزات', 'تسجيل وصول', 'تسجيل مغادرة', 'خدمات عامة'],
};

export default function MenuItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    price: '',
    category: 'coffee' as 'coffee' | 'restaurant' | 'laundry' | 'room-services' | 'reception',
    subCategory: '',
    description: '',
    image: '',
    available: true,
  });

  // Load items from Firebase
  useEffect(() => {
    loadItems();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToMenuItems((updatedItems) => {
      setItems(updatedItems);
    });
    
    return () => unsubscribe();
  }, []);

  // Filter items
  useEffect(() => {
    let filtered = items;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [items, categoryFilter, searchTerm]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const allItems = await getMenuItems();
      setItems(allItems);
      console.log('✅ تم تحميل الأصناف:', allItems.length);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nameAr || !formData.price) {
      alert('الرجاء إدخال اسم الصنف والسعر');
      return;
    }

    setLoading(true);

    try {
      const itemData: Omit<MenuItem, 'id'> = {
        name: formData.name || formData.nameAr,
        nameAr: formData.nameAr,
        price: parseFloat(formData.price),
        category: formData.category,
        subCategory: formData.subCategory || undefined,
        description: formData.description || undefined,
        image: formData.image || undefined,
        available: formData.available,
        createdAt: editingItem?.createdAt || new Date().toISOString(),
      };

      if (editingItem) {
        // تحديث
        await updateMenuItem(editingItem.id, itemData);
        alert('✅ تم تحديث الصنف بنجاح');
      } else {
        // إضافة جديد
        await addMenuItem(itemData);
        alert('✅ تم إضافة الصنف بنجاح');
      }

      // إعادة تحميل القائمة
      await loadItems();

      // إغلاق النافذة
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`هل أنت متأكد من حذف "${item.nameAr}"؟`)) return;

    setLoading(true);
    try {
      await deleteMenuItem(item.id);
      alert('✅ تم حذف الصنف بنجاح');
      await loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      nameAr: item.nameAr,
      price: item.price.toString(),
      category: item.category,
      subCategory: item.subCategory || '',
      description: item.description || '',
      image: item.image || '',
      available: item.available,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      nameAr: '',
      price: '',
      category: 'coffee',
      subCategory: '',
      description: '',
      image: '',
      available: true,
    });
  };

  // معالجة الاستيراد المجمع
  const handleBulkImport = (importedItems: MenuItem[]) => {
    importedItems.forEach(item => {
      const storageKey = {
        coffee: 'coffee_menu',
        restaurant: 'restaurant_menu',
        laundry: 'laundry_services',
        'room-services': 'room_services_menu',
        reception: 'reception_services_menu',
      }[item.category];

      const existingItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existingItems.push(item);
      localStorage.setItem(storageKey, JSON.stringify(existingItems));
    });

    loadItems();
    setIsBulkImportOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    const Icon = cat?.icon || Coffee;
    return <Icon className="h-5 w-5" />;
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat?.color || 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">إدارة الأصناف والقوائم</h1>
              <p className="text-purple-200 mt-1">
                إدارة مركزية لجميع أصناف الكوفي والمطعم والمغسلة
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsBulkImportOpen(true)}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700/50"
            >
              <Upload className="h-4 w-4 mr-2" />
              استيراد مجمع
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة صنف
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800/50 border-gray-600/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">إجمالي الأصناف</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{items.length}</p>
            </CardContent>
          </Card>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = items.filter((i) => i.category === cat.value).length;
            return (
              <Card key={cat.value} className="bg-gray-800/50 border-gray-600/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {cat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-600/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="بحث عن صنف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">جميع الفئات</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-gray-700">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50 transition-all">
              <CardContent className="p-4">
                {/* Image */}
                {item.image && (
                  <div className="w-full h-32 bg-gray-700/30 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.nameAr}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!item.image && (
                  <div className="w-full h-32 bg-gray-700/30 rounded-lg mb-3 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`bg-${getCategoryColor(item.category)}-500/20 text-${getCategoryColor(item.category)}-300`}>
                    {getCategoryIcon(item.category)}
                    <span className="mr-1">{CATEGORIES.find(c => c.value === item.category)?.label}</span>
                  </Badge>
                  {!item.available && (
                    <Badge className="bg-red-500/20 text-red-300">
                      غير متاح
                    </Badge>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-white font-semibold text-lg mb-1">{item.nameAr}</h3>
                {item.subCategory && (
                  <p className="text-purple-200 text-sm mb-2">{item.subCategory}</p>
                )}

                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-400">
                    {item.price.toFixed(2)} ر.س
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700/50"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item)}
                    className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="bg-gray-800/50 border-gray-600/50">
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-white/60 text-lg">لا توجد أصناف</p>
              <p className="text-white/40 text-sm mt-2">ابدأ بإضافة أصناف جديدة</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 text-white border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingItem ? 'تعديل صنف' : 'إضافة صنف جديد'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              أدخل تفاصيل الصنف وسيتم إضافته تلقائياً للقسم المناسب
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category */}
            <div>
              <Label className="text-white mb-2 block">القسم</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, category: value, subCategory: '' })
                }
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Category */}
            <div>
              <Label className="text-white mb-2 block">التصنيف الفرعي (اختياري)</Label>
              <Select
                value={formData.subCategory}
                onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="اختر التصنيف..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600">
                  {SUB_CATEGORIES[formData.category].map((sub) => (
                    <SelectItem key={sub} value={sub} className="text-white hover:bg-gray-700">
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name Arabic */}
            <div>
              <Label className="text-white mb-2 block">اسم الصنف (عربي)</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="مثال: شاي، غسيل ثوب، برجر..."
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>

            {/* Name English */}
            <div>
              <Label className="text-white mb-2 block">اسم الصنف (إنجليزي) - اختياري</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tea, Laundry, Burger..."
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>

            {/* Price */}
            <div>
              <Label className="text-white mb-2 block">السعر (ر.س)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="25.00"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-white mb-2 block">الوصف (اختياري)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف مختصر للصنف..."
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label className="text-white mb-2 block">صورة الصنف (اختياري)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setFormData({ ...formData, image: e.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md hover:bg-gray-600/50 transition-colors">
                      <Camera className="h-4 w-4 text-blue-400" />
                      <span className="text-white">اختر صورة</span>
                    </div>
                  </label>
                </div>
                {formData.image && (
                  <div className="relative">
                    <img 
                      src={formData.image} 
                      alt="معاينة الصورة"
                      className="w-20 h-20 object-cover rounded-md border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Available */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="available" className="text-white">
                الصنف متاح للطلب
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-700/50"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  حفظ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}