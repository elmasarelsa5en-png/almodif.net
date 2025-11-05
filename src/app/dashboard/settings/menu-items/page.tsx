'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Coffee,
  Utensils,
  Shirt,
  Loader2,
  Search,
  ImageIcon,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
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
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    price: '',
    category: 'coffee',
    subCategory: '',
    description: '',
    image: '',
    available: true,
  });

  useEffect(() => {
    loadItems();
    const unsubscribe = subscribeToMenuItems((updatedItems) => {
      setItems(updatedItems);
    });
    return () => unsubscribe();
  }, []);

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
      const itemData = {
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
        await updateMenuItem(editingItem.id, itemData);
        alert(' تم تحديث الصنف بنجاح');
      } else {
        await addMenuItem(itemData);
        alert(' تم إضافة الصنف بنجاح');
      }

      await loadItems();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
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

  const handleDelete = async (item) => {
    if (!confirm(`هل تريد حذف "${item.nameAr}"؟`)) return;
    
    setLoading(true);
    try {
      await deleteMenuItem(item.id);
      await loadItems();
      alert(' تم حذف الصنف بنجاح');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setLoading(false);
    }
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

  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    const Icon = cat?.icon || Coffee;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat?.color || 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 rounded-full transition-all hover:scale-110"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                إدارة الأصناف والقوائم
              </h1>
              <p className="text-purple-200 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                إدارة مركزية لجميع أصناف الكوفي والمطعم والمغسلة والخدمات
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 shadow-xl shadow-purple-500/50 transition-all hover:scale-105 text-white font-bold"
          >
            <Plus className="h-5 w-5 mr-2" />
            إضافة صنف جديد
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-purple-600/40 to-pink-600/40 border-purple-400/50 backdrop-blur-sm hover:scale-105 transition-all shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white flex items-center gap-2 font-bold">
                <div className="p-2 bg-purple-600/50 rounded-lg shadow-lg">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                إجمالي الأصناف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-white drop-shadow-lg">{items.length}</p>
              <p className="text-sm text-white/90 mt-1 font-bold">جميع الفئات</p>
            </CardContent>
          </Card>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = items.filter((i) => i.category === cat.value).length;
            const colorClasses = {
              amber: 'from-amber-600/40 to-yellow-600/40 border-amber-400/50',
              orange: 'from-orange-600/40 to-red-600/40 border-orange-400/50',
              blue: 'from-blue-600/40 to-cyan-600/40 border-blue-400/50',
              purple: 'from-purple-600/40 to-indigo-600/40 border-purple-400/50',
              green: 'from-green-600/40 to-emerald-600/40 border-green-400/50',
            };
            return (
              <Card
                key={cat.value}
                className={`bg-gradient-to-br ${colorClasses[cat.color]} backdrop-blur-sm hover:scale-105 transition-all shadow-lg`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2 font-bold">
                    <div className="p-2 bg-white/10 rounded-lg shadow-lg">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {cat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-black text-white drop-shadow-lg">{count}</p>
                  <p className="text-sm text-white/90 mt-1 font-bold">صنف متاح</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
                  <Input
                    placeholder="بحث عن صنف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-purple-400 focus:ring-purple-400/50 font-bold text-base"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-white/20 border-white/30 text-white font-bold">
                  <SelectValue placeholder="التصنيف..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-purple-500/30">
                  <SelectItem value="all" className="text-white font-bold">
                    كل الفئات
                  </SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white font-bold">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const categoryColor = getCategoryColor(item.category);
            const gradients = {
              amber: 'from-amber-700/30 to-yellow-700/30',
              orange: 'from-orange-700/30 to-red-700/30',
              blue: 'from-blue-700/30 to-cyan-700/30',
              purple: 'from-purple-700/30 to-indigo-700/30',
              green: 'from-green-700/30 to-emerald-700/30',
            };
            return (
              <Card
                key={item.id}
                className={`bg-gradient-to-br ${gradients[categoryColor]} border-white/20 backdrop-blur-sm hover:scale-105 transition-all shadow-lg overflow-hidden`}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    {item.image && (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-700/40 to-pink-700/40 flex items-center justify-center">
                        <span className="text-7xl drop-shadow-2xl">{item.image}</span>
                      </div>
                    )}
                    {!item.image && (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-700/30 to-pink-700/30 flex items-center justify-center">
                        <ImageIcon className="h-20 w-20 text-white/60" />
                      </div>
                    )}
                    {!item.available && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-red-600/95 text-white font-bold">غير متاح</Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3 bg-slate-900/60">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/20 text-white flex items-center gap-1 font-bold">
                        {getCategoryIcon(item.category)}
                        <span className="text-xs">{CATEGORIES.find((c) => c.value === item.category)?.label}</span>
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-white font-black text-lg">{item.nameAr}</h3>
                      {item.subCategory && (
                        <p className="text-white/95 text-sm mt-1 font-bold">{item.subCategory}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/20">
                      <span className="text-2xl font-black text-green-400 flex items-center gap-1">
                        <span className="text-lg">ر.س</span>
                        {item.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        className="flex-1 border-blue-400/60 bg-blue-600/30 text-white hover:bg-blue-600/50 font-bold"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item)}
                        className="border-red-400/60 bg-red-600/30 text-white hover:bg-red-600/50 font-bold"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/50 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {editingItem ? 'تعديل صنف' : 'إضافة صنف جديد'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white font-semibold">التصنيف *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value, subCategory: '' })}
                >
                  <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                    <SelectValue placeholder="اختر التصنيف..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-purple-500/30">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-white">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-semibold">التصنيف الفرعي (اختياري)</Label>
                <Select
                  value={formData.subCategory}
                  onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                >
                  <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                    <SelectValue placeholder="اختر التصنيف..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-purple-500/30">
                    {SUB_CATEGORIES[formData.category].map((sub) => (
                      <SelectItem key={sub} value={sub} className="text-white">
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-semibold">اسم الصنف (عربي) *</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: شاي، غسيل ثوب، برجر..."
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-semibold">اسم الصنف (إنجليزي) - اختياري</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tea, Laundry, Burger..."
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-semibold">السعر (ر.س) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="25.00"
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-semibold">الرمز التعبيري (Emoji)</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="   "
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300/50 text-3xl"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-purple-500/30">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-5 h-5 rounded border-purple-500/50"
                />
                <Label htmlFor="available" className="text-white font-medium cursor-pointer">
                  الصنف متاح للطلب
                </Label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || !formData.nameAr || !formData.price}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingItem ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
