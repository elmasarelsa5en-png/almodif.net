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
  Settings,
  Tag,
  X,
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
  subscribeToMenuItems,
  type MenuItem 
} from '@/lib/firebase-data';

const CATEGORIES = [
  { value: 'coffee', label: 'Coffee Shop', labelAr: 'كوفي شوب', icon: Coffee, color: 'amber' },
  { value: 'restaurant', label: 'Restaurant', labelAr: 'مطعم', icon: Utensils, color: 'orange' },
  { value: 'laundry', label: 'Laundry', labelAr: 'مغسلة', icon: Shirt, color: 'blue' },
  { value: 'room-services', label: 'Room Services', labelAr: 'خدمات الغرف', icon: BedDouble, color: 'purple' },
  { value: 'reception', label: 'Reception', labelAr: 'خدمات الاستقبال', icon: HelpCircle, color: 'green' },
];

const DEFAULT_SUB_CATEGORIES = {
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
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // إدارة الفئات والفئات الفرعية
  const [categories, setCategories] = useState(CATEGORIES);
  const [subCategories, setSubCategories] = useState(DEFAULT_SUB_CATEGORIES);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    value: '',
    label: '',
    labelAr: '',
    icon: 'Coffee',
    color: 'amber',
  });
  const [newSubCategory, setNewSubCategory] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    price: '',
    category: '', // ⚠️ MUST select category explicitly
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
      console.log('📋 Total Menu Items:', allItems.length);
      console.log('📋 Categories:', [...new Set(allItems.map(item => item.category))]);
      setItems(allItems);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nameAr || !formData.price || !formData.category) {
      alert('⚠️ الرجاء إدخال: اسم الصنف، السعر، والتصنيف');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: formData.name || formData.nameAr,
        nameAr: formData.nameAr,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
        createdAt: editingItem?.createdAt || new Date().toISOString(),
      };

      // Add optional fields only if they have values
      if (formData.subCategory) itemData.subCategory = formData.subCategory;
      if (formData.description) itemData.description = formData.description;
      if (formData.image) itemData.image = formData.image;

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData);
        console.log('✅ Item updated:', itemData);
        alert('✅ تم تحديث الصنف بنجاح');
      } else {
        await addMenuItem(itemData);
        console.log('✅ Item added:', itemData);
        alert('✅ تم إضافة الصنف بنجاح');
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
      category: '', // Reset to empty - force selection
      subCategory: '',
      description: '',
      image: '',
      available: true,
    });
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.value === category);
    const Icon = cat?.icon || Coffee;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.color || 'gray';
  };

  // Category Management Functions
  const handleAddCategory = () => {
    setCategoryFormData({ value: '', label: '', labelAr: '', icon: 'Coffee', color: 'blue' });
    setEditingCategory(null);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({
      value: category.value,
      label: category.label,
      labelAr: category.labelAr,
      icon: category.icon?.name || 'Coffee',
      color: category.color,
    });
    setEditingCategory(category.value);
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryFormData.value || !categoryFormData.label || !categoryFormData.labelAr) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const iconComponents = { Coffee, Utensils, Shirt, BedDouble, HelpCircle };
    const IconComponent = iconComponents[categoryFormData.icon] || Coffee;

    const newCategory = {
      value: categoryFormData.value,
      label: categoryFormData.label,
      labelAr: categoryFormData.labelAr,
      icon: IconComponent,
      color: categoryFormData.color,
    };

    if (editingCategory) {
      // Edit existing category
      setCategories(categories.map(cat => 
        cat.value === editingCategory ? newCategory : cat
      ));
    } else {
      // Add new category
      if (categories.find(cat => cat.value === categoryFormData.value)) {
        alert('هذه الفئة موجودة بالفعل');
        return;
      }
      setCategories([...categories, newCategory]);
      setSubCategories({ ...subCategories, [categoryFormData.value]: [] });
    }

    setIsCategoryDialogOpen(false);
    setCategoryFormData({ value: '', label: '', labelAr: '', icon: 'Coffee', color: 'blue' });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryValue) => {
    // Check if there are items in this category
    const itemsInCategory = items.filter(item => item.category === categoryValue);
    if (itemsInCategory.length > 0) {
      alert(`لا يمكن حذف هذه الفئة لأنها تحتوي على ${itemsInCategory.length} صنف`);
      return;
    }

    if (!confirm('هل تريد حذف هذه الفئة؟')) return;

    setCategories(categories.filter(cat => cat.value !== categoryValue));
    const newSubCategories = { ...subCategories };
    delete newSubCategories[categoryValue];
    setSubCategories(newSubCategories);
  };

  const handleAddSubCategory = () => {
    if (!newSubCategory.trim() || !selectedCategoryForSub) {
      alert('يرجى إدخال اسم الفئة الفرعية واختيار الفئة');
      return;
    }

    const categorySubCategories = subCategories[selectedCategoryForSub] || [];
    if (categorySubCategories.includes(newSubCategory.trim())) {
      alert('هذه الفئة الفرعية موجودة بالفعل');
      return;
    }

    setSubCategories({
      ...subCategories,
      [selectedCategoryForSub]: [...categorySubCategories, newSubCategory.trim()],
    });
    setNewSubCategory('');
  };

  const handleRemoveSubCategory = (category, subCategory) => {
    if (!confirm(`هل تريد حذف "${subCategory}"؟`)) return;

    setSubCategories({
      ...subCategories,
      [category]: subCategories[category].filter(sub => sub !== subCategory),
    });
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
          <div className="flex gap-2">
            <Button
              onClick={handleAddCategory}
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all hover:scale-105"
            >
              <Settings className="h-4 w-4 mr-2" />
              إعدادات الفئات
            </Button>
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
          {categories.map((cat) => {
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
                    {cat.labelAr}
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
                  {categories.map((cat) => (
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
          <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {editingItem ? 'تعديل صنف' : 'إضافة صنف جديد'}
              </DialogTitle>
              <DialogDescription className="text-purple-200">
                املأ البيانات لإضافة صنف جديد
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Category */}
              <div>
                <label className="text-white font-semibold block mb-2">التصنيف *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                  className="w-full h-10 rounded-md border border-purple-500/30 bg-slate-800 text-white px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">اختر التصنيف...</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.labelAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              {formData.category && subCategories[formData.category]?.length > 0 && (
                <div>
                  <label className="text-white font-semibold block mb-2">التصنيف الفرعي (اختياري)</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full h-10 rounded-md border border-purple-500/30 bg-slate-800 text-white px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">اختر التصنيف الفرعي...</option>
                    {subCategories[formData.category].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name Arabic */}
              <div>
                <label className="text-white font-semibold block mb-2">اسم الصنف (عربي) *</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: شاي، غسيل ثوب، برجر..."
                  className="w-full h-10 rounded-md border border-purple-500/30 bg-slate-800 text-white px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Name English */}
              <div>
                <label className="text-white font-semibold block mb-2">اسم الصنف (إنجليزي) - اختياري</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tea, Laundry, Burger..."
                  className="w-full h-10 rounded-md border border-purple-500/30 bg-slate-800 text-white px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-white font-semibold block mb-2">السعر (ر.س) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="25.00"
                  className="w-full h-10 rounded-md border border-purple-500/30 bg-slate-800 text-white px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Image/Emoji */}
              <div>
                <label className="text-white font-semibold block mb-2">الصورة / الرمز التعبيري</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="مثال: ☕ 🍔 🍕 👔 🧺"
                    className="flex-1 h-10 rounded-md border border-purple-500/30 bg-slate-800 text-white px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('📸 File selected:', file.name, 'Size:', file.size, 'bytes');
                        
                        // Check file size (max 800KB before compression)
                        if (file.size > 800000) {
                          alert('⚠️ الصورة كبيرة جداً! الحد الأقصى 800 KB قبل الضغط.\nحجم الصورة: ' + Math.round(file.size / 1024) + ' KB');
                          e.target.value = '';
                          return;
                        }
                        
                        console.log('✅ File size OK, starting compression...');
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          console.log('📖 File read complete');
                          // Compress image
                          const img = new Image();
                          img.onload = () => {
                            console.log('🖼️ Image loaded:', img.width, 'x', img.height);
                            const canvas = document.createElement('canvas');
                            // Reasonable size - 150x150
                            const MAX_WIDTH = 150;
                            const MAX_HEIGHT = 150;
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
                            
                            // Balanced compression (quality 0.6)
                            const compressedImage = canvas.toDataURL('image/jpeg', 0.6);
                            console.log('✅ Compressed to:', Math.round(compressedImage.length / 1024), 'KB');
                            
                            // Final check - Firebase limit is ~1MB
                            if (compressedImage.length > 900000) {
                              alert('⚠️ الصورة ما زالت كبيرة بعد الضغط! جرب صورة أصغر.\nالحجم بعد الضغط: ' + Math.round(compressedImage.length / 1024) + ' KB');
                              e.target.value = '';
                              return;
                            }
                            
                            console.log('✅ Image compression successful!');
                            setFormData({ ...formData, image: compressedImage });
                          };
                          img.onerror = () => {
                            console.error('❌ Failed to load image');
                            alert('❌ فشل تحميل الصورة! تأكد أنها صورة صحيحة.');
                          };
                          img.src = reader.result as string;
                        };
                        reader.onerror = () => {
                          console.error('❌ Failed to read file');
                          alert('❌ فشل قراءة الملف!');
                        };
                        reader.readAsDataURL(file);
                      } else {
                        console.log('⚠️ No file selected');
                      }
                    }}
                    className="bg-purple-600 text-white px-4 rounded-md cursor-pointer hover:bg-purple-700"
                  />
                </div>
                <p className="text-xs text-purple-300 mt-1">💡 يمكنك رفع صور (حد أقصى 800 KB) أو استخدام إيموجي ☕ 🍔 👔</p>
                {formData.image && (
                  <div className="mt-2 p-2 bg-white/5 rounded-lg flex items-center gap-2">
                    <span className="text-white text-sm">معاينة:</span>
                    {formData.image.startsWith('data:image') ? (
                      <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded-lg border-2 border-purple-500" />
                    ) : (
                      <span className="text-5xl">{formData.image}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Available */}
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="available" className="text-white font-medium cursor-pointer">
                  الصنف متاح للطلب
                </label>
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
                disabled={loading || !formData.nameAr || !formData.price || !formData.category}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingItem ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Management Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-purple-500/50 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <Settings className="h-6 w-6 text-purple-400" />
                إدارة الفئات والتصنيفات
              </DialogTitle>
              <DialogDescription className="text-purple-200">
                إضافة وتعديل وحذف الفئات والفئات الفرعية
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Existing Categories */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-400" />
                  الفئات الحالية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <div
                      key={cat.value}
                      className="bg-white/10 border border-white/20 rounded-lg p-4 flex items-center justify-between hover:bg-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(cat.value)}
                        <div>
                          <div className="text-white font-medium">{cat.labelAr}</div>
                          <div className="text-purple-300 text-sm">{cat.label}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCategory(cat)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                        >
                          تعديل
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(cat.value)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add/Edit Category Form */}
              <div className="space-y-4 bg-white/5 rounded-lg p-4 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-white">
                  {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white font-semibold">رمز الفئة (value) *</Label>
                    <Input
                      value={categoryFormData.value}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, value: e.target.value })
                      }
                      placeholder="coffee, restaurant, laundry..."
                      disabled={editingCategory !== null}
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-semibold">الاسم (إنجليزي) *</Label>
                    <Input
                      value={categoryFormData.label}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, label: e.target.value })
                      }
                      placeholder="Coffee Shop"
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-semibold">الاسم (عربي) *</Label>
                    <Input
                      value={categoryFormData.labelAr}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, labelAr: e.target.value })
                      }
                      placeholder="كوفي شوب"
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-semibold">الأيقونة *</Label>
                    <Select
                      value={categoryFormData.icon}
                      onValueChange={(value) =>
                        setCategoryFormData({ ...categoryFormData, icon: value })
                      }
                    >
                      <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-purple-500/30">
                        <SelectItem value="Coffee" className="text-white">☕ Coffee</SelectItem>
                        <SelectItem value="Utensils" className="text-white">🍴 Utensils</SelectItem>
                        <SelectItem value="Shirt" className="text-white">👔 Shirt</SelectItem>
                        <SelectItem value="BedDouble" className="text-white">🛏️ Bed</SelectItem>
                        <SelectItem value="HelpCircle" className="text-white">❓ Help</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-semibold">اللون *</Label>
                    <Select
                      value={categoryFormData.color}
                      onValueChange={(value) =>
                        setCategoryFormData({ ...categoryFormData, color: value })
                      }
                    >
                      <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-purple-500/30">
                        <SelectItem value="amber" className="text-white">🟡 Amber</SelectItem>
                        <SelectItem value="orange" className="text-white">🟠 Orange</SelectItem>
                        <SelectItem value="blue" className="text-white">🔵 Blue</SelectItem>
                        <SelectItem value="purple" className="text-white">🟣 Purple</SelectItem>
                        <SelectItem value="green" className="text-white">🟢 Green</SelectItem>
                        <SelectItem value="red" className="text-white">🔴 Red</SelectItem>
                        <SelectItem value="pink" className="text-white">🩷 Pink</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSaveCategory}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full"
                >
                  {editingCategory ? 'تحديث الفئة' : 'إضافة الفئة'}
                </Button>
              </div>

              {/* Subcategories Management */}
              <div className="space-y-4 bg-white/5 rounded-lg p-4 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-400" />
                  إدارة الفئات الفرعية
                </h3>

                {/* Add Subcategory */}
                <div className="flex gap-2">
                  <Select value={selectedCategoryForSub} onValueChange={setSelectedCategoryForSub}>
                    <SelectTrigger className="bg-white/10 border-purple-500/30 text-white flex-1">
                      <SelectValue placeholder="اختر الفئة الرئيسية..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-500/30">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white">
                          {cat.labelAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    placeholder="اسم الفئة الفرعية..."
                    className="bg-white/10 border-purple-500/30 text-white flex-1"
                  />
                  <Button
                    onClick={handleAddSubCategory}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة
                  </Button>
                </div>

                {/* Display Subcategories */}
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.value}>
                      {subCategories[cat.value] && subCategories[cat.value].length > 0 && (
                        <div className="space-y-2">
                          <div className="text-white font-medium flex items-center gap-2">
                            {getCategoryIcon(cat.value)}
                            {cat.labelAr}
                          </div>
                          <div className="flex flex-wrap gap-2 pr-7">
                            {subCategories[cat.value].map((sub) => (
                              <Badge
                                key={sub}
                                variant="secondary"
                                className="bg-purple-500/20 text-purple-200 border border-purple-500/30 flex items-center gap-1 px-3 py-1"
                              >
                                {sub}
                                <button
                                  onClick={() => handleRemoveSubCategory(cat.value, sub)}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
                className="border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
              >
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
