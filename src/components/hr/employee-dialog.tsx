'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
  permissions: string[];
  address?: string;
  birthDate?: string;
  hireDate?: string;
  notes?: string;
}

interface EmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (employee: Omit<Employee, 'id'>) => void;
  mode: 'add' | 'edit';
}

export function EmployeeDialog({ isOpen, onClose, employee, onSave, mode }: EmployeeDialogProps) {
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: 0,
    status: 'active',
    permissions: [],
    address: '',
    birthDate: '',
    hireDate: '',
    notes: ''
  });

  useEffect(() => {
    if (employee && mode === 'edit') {
      setFormData(employee);
    } else if (mode === 'add') {
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        salary: 0,
        status: 'active',
        permissions: [],
        address: '',
        birthDate: '',
        hireDate: '',
        notes: ''
      });
    }
  }, [employee, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">
            {mode === 'add' ? 'إضافة موظف جديد' : 'تعديل بيانات الموظف'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* المعلومات الأساسية */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">الاسم الكامل *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-white">المسمى الوظيفي *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-white">القسم *</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="إدارة" className="text-white">إدارة</SelectItem>
                    <SelectItem value="مبيعات" className="text-white">مبيعات</SelectItem>
                    <SelectItem value="تسويق" className="text-white">تسويق</SelectItem>
                    <SelectItem value="تقنية" className="text-white">تقنية</SelectItem>
                    <SelectItem value="مالية" className="text-white">مالية</SelectItem>
                    <SelectItem value="موارد بشرية" className="text-white">موارد بشرية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">الحالة</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}>
                  <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="active" className="text-white">نشط</SelectItem>
                    <SelectItem value="inactive" className="text-white">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* المعلومات المالية والتواريخ */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">المعلومات المالية والتواريخ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-white">الراتب الأساسي (ريال) *</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', Number(e.target.value))}
                  className="bg-slate-600 border-slate-500 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate" className="text-white">تاريخ التوظيف</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-white">تاريخ الميلاد</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                />
              </div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">معلومات إضافية</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-white">العنوان</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" onClick={onClose} variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
              <X className="w-4 h-4 mr-2" />
              إلغاء
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              {mode === 'add' ? 'إضافة الموظف' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}