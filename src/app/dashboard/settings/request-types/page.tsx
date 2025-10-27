'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  getRequestTypes,
  addRequestType,
  updateRequestType,
  deleteRequestType,
  type RequestType,
} from '@/lib/requests-management';

export default function RequestTypesSettingsPage() {
  const router = useRouter();
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<RequestType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadRequestTypes();

    const handleStorageChange = () => {
      loadRequestTypes();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadRequestTypes = () => {
    const types = getRequestTypes();
    setRequestTypes(types);
  };

  const handleAdd = () => {
    setEditingType(null);
    setFormData({ name: '', description: '', icon: '' });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleEdit = (type: RequestType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      icon: type.icon || '',
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا النوع؟ سيؤثر ذلك على الطلبات المرتبطة به.')) {
      deleteRequestType(id);
      loadRequestTypes();
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم النوع مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingType) {
      // Update existing type
      updateRequestType(editingType.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon.trim() || undefined,
      });
    } else {
      // Add new type
      const newType: RequestType = {
        id: `type-${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      addRequestType(newType);
    }

    setIsDialogOpen(false);
    loadRequestTypes();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 relative overflow-hidden" dir="rtl">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/dashboard/settings')}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة
                </Button>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    أنواع طلبات النزلاء
                  </h1>
                  <p className="text-blue-200/80">
                    إدارة الأنواع المتاحة لطلبات النزلاء
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة نوع جديد
              </Button>
            </div>
          </div>

          {/* Request Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requestTypes.map((type) => (
              <Card
                key={type.id}
                className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/15 transition-all"
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {type.icon && <span className="text-2xl">{type.icon}</span>}
                    {type.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {type.description && (
                    <p className="text-white/70 text-sm mb-4">{type.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(type)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/20"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                    <Button
                      onClick={() => handleDelete(type.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {requestTypes.length === 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  لا توجد أنواع طلبات
                </h3>
                <p className="text-white/70 mb-4">
                  ابدأ بإضافة أنواع الطلبات التي يمكن للنزلاء اختيارها
                </p>
                <Button
                  onClick={handleAdd}
                  className="bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة نوع جديد
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Info Box */}
          <Card className="bg-blue-500/20 backdrop-blur-md border-blue-500/30 shadow-2xl mt-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-200 text-sm">
                  <p className="font-semibold mb-1">💡 ملاحظات مهمة:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>الأنواع المضافة هنا ستظهر في قائمة إنشاء طلب جديد</li>
                    <li>يمكنك إضافة أيقونة emoji لكل نوع لسهولة التمييز</li>
                    <li>حذف نوع قد يؤثر على الطلبات القديمة المرتبطة به</li>
                    <li>الأنواع الافتراضية يتم إنشاؤها تلقائياً عند أول استخدام</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingType ? 'تعديل نوع الطلب' : 'إضافة نوع طلب جديد'}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                {editingType
                  ? 'عدّل بيانات نوع الطلب'
                  : 'أضف نوع طلب جديد للنزلاء'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  اسم النوع <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="مثال: تنظيف الغرفة"
                  className="bg-white/10 border-white/20 text-white"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon" className="text-white">
                  أيقونة (emoji)
                </Label>
                <Input
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="مثال: 🧹"
                  className="bg-white/10 border-white/20 text-white"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  وصف (اختياري)
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="وصف مختصر للنوع"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {editingType ? 'حفظ التعديلات' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
