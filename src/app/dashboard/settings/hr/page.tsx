'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Shield,
  Search,
  Filter
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
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Employee {
  id: string;
  username: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  phone?: string;
  status: 'available' | 'busy' | 'offline';
  createdAt: string;
  permissions?: string[];
}

const ROLES = [
  { value: 'admin', label: 'مدير', color: 'bg-red-500' },
  { value: 'manager', label: 'مشرف', color: 'bg-orange-500' },
  { value: 'reception', label: 'استقبال', color: 'bg-blue-500' },
  { value: 'housekeeping', label: 'خدمات غرف', color: 'bg-green-500' },
  { value: 'maintenance', label: 'صيانة', color: 'bg-yellow-500' },
  { value: 'coffee_staff', label: 'كوفي', color: 'bg-amber-600' },
  { value: 'laundry_staff', label: 'مغسلة', color: 'bg-purple-500' },
  { value: 'restaurant_staff', label: 'مطعم', color: 'bg-pink-500' },
];

const DEPARTMENTS = [
  'استقبال',
  'خدمات الغرف',
  'صيانة',
  'كوفي شوب',
  'مطعم',
  'مغسلة',
  'إدارة'
];

const PERMISSIONS = [
  { id: 'view_dashboard', label: 'عرض لوحة التحكم', category: 'عام' },
  { id: 'manage_rooms', label: 'إدارة الغرف', category: 'غرف' },
  { id: 'view_rooms', label: 'عرض الغرف', category: 'غرف' },
  { id: 'manage_bookings', label: 'إدارة الحجوزات', category: 'حجوزات' },
  { id: 'view_bookings', label: 'عرض الحجوزات', category: 'حجوزات' },
  { id: 'manage_guests', label: 'إدارة النزلاء', category: 'نزلاء' },
  { id: 'view_guests', label: 'عرض النزلاء', category: 'نزلاء' },
  { id: 'manage_requests', label: 'إدارة طلبات النزلاء', category: 'طلبات' },
  { id: 'approve_requests', label: 'الموافقة على الطلبات', category: 'طلبات' },
  { id: 'view_requests', label: 'عرض الطلبات', category: 'طلبات' },
  { id: 'manage_coffee', label: 'إدارة الكوفي شوب', category: 'خدمات' },
  { id: 'manage_restaurant', label: 'إدارة المطعم', category: 'خدمات' },
  { id: 'manage_laundry', label: 'إدارة المغسلة', category: 'خدمات' },
  { id: 'manage_maintenance', label: 'إدارة الصيانة', category: 'خدمات' },
  { id: 'manage_employees', label: 'إدارة الموظفين', category: 'موارد بشرية' },
  { id: 'view_reports', label: 'عرض التقارير', category: 'تقارير' },
  { id: 'manage_settings', label: 'إدارة الإعدادات', category: 'إعدادات' },
];

const STATUS_CONFIG = {
  available: { label: 'متاح', color: 'bg-green-500' },
  busy: { label: 'مشغول', color: 'bg-yellow-500' },
  offline: { label: 'غير متصل', color: 'bg-gray-500' },
};

export default function HRSettingsPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    role: 'reception',
    department: 'استقبال',
    email: '',
    phone: '',
    status: 'available' as const,
    permissions: [] as string[],
  });

  // Load employees from localStorage
  useEffect(() => {
    const loadEmployees = () => {
      const saved = localStorage.getItem('employees');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setEmployees(parsed);
        } catch (e) {
          console.error('Error loading employees', e);
        }
      } else {
        // Initialize with default employees
        const defaultEmployees: Employee[] = [
          {
            id: '1',
            username: 'reception_staff',
            name: 'موظف الاستقبال',
            role: 'reception',
            department: 'استقبال',
            email: 'reception@hotel.com',
            phone: '0500000001',
            status: 'available',
            createdAt: new Date().toISOString(),
            permissions: ['view_dashboard', 'manage_requests', 'approve_requests', 'view_rooms', 'view_bookings'],
          }
        ];
        setEmployees(defaultEmployees);
        localStorage.setItem('employees', JSON.stringify(defaultEmployees));
      }
    };
    
    loadEmployees();
  }, []);

  // Filter employees
  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(emp => emp.role === filterRole);
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, filterRole, filterDepartment]);

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        username: employee.username,
        name: employee.name,
        role: employee.role,
        department: employee.department,
        email: employee.email || '',
        phone: employee.phone || '',
        status: employee.status,
        permissions: employee.permissions || [],
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        username: '',
        name: '',
        role: 'reception',
        department: 'استقبال',
        email: '',
        phone: '',
        status: 'available',
        permissions: [],
      });
    }
    setIsDialogOpen(true);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => {
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions };
    });
  };

  const getPermissionsByCategory = () => {
    const categories: Record<string, typeof PERMISSIONS> = {};
    PERMISSIONS.forEach(perm => {
      if (!categories[perm.category]) {
        categories[perm.category] = [];
      }
      categories[perm.category].push(perm);
    });
    return categories;
  };

  const handleSave = () => {
    if (!formData.username || !formData.name) {
      alert('الرجاء إدخال اسم المستخدم والاسم الكامل');
      return;
    }

    if (editingEmployee) {
      // Update existing employee
      const updated = employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...formData }
          : emp
      );
      setEmployees(updated);
      localStorage.setItem('employees', JSON.stringify(updated));
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      const updated = [...employees, newEmployee];
      setEmployees(updated);
      localStorage.setItem('employees', JSON.stringify(updated));
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      const updated = employees.filter(emp => emp.id !== id);
      setEmployees(updated);
      localStorage.setItem('employees', JSON.stringify(updated));
    }
  };

  const handleStatusChange = (id: string, status: Employee['status']) => {
    const updated = employees.map(emp => 
      emp.id === id ? { ...emp, status } : emp
    );
    setEmployees(updated);
    localStorage.setItem('employees', JSON.stringify(updated));
  };

  const getRoleInfo = (role: string) => {
    return ROLES.find(r => r.value === role) || ROLES[0];
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
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Users className="h-8 w-8" />
                إدارة الموظفين والصلاحيات
              </h1>
              <p className="text-purple-200 mt-1">
                إدارة فريق العمل والأدوار والصلاحيات
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            إضافة موظف
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">إجمالي الموظفين</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{employees.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">متاح</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">
                {employees.filter(e => e.status === 'available').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">مشغول</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-400">
                {employees.filter(e => e.status === 'busy').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">غير متصل</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-400">
                {employees.filter(e => e.status === 'offline').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-purple-200">بحث</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="اسم، اسم مستخدم، بريد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-purple-200">الدور الوظيفي</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-purple-200">القسم</Label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="all">جميع الأقسام</SelectItem>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees List */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">قائمة الموظفين ({filteredEmployees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEmployees.length === 0 ? (
                <p className="text-center text-purple-200 py-8">لا يوجد موظفين</p>
              ) : (
                filteredEmployees.map(employee => {
                  const roleInfo = getRoleInfo(employee.role);
                  const statusInfo = STATUS_CONFIG[employee.status];
                  
                  return (
                    <div
                      key={employee.id}
                      className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-purple-500 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-3 rounded-full ${roleInfo.color} text-white`}>
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-semibold">{employee.name}</h3>
                              <Badge className={`${roleInfo.color} text-white border-0 text-xs`}>
                                {roleInfo.label}
                              </Badge>
                              <Badge className={`${statusInfo.color} text-white border-0 text-xs`}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-purple-200">
                              <span>@{employee.username}</span>
                              <span>•</span>
                              <span>{employee.department}</span>
                              {employee.email && (
                                <>
                                  <span>•</span>
                                  <span>{employee.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={employee.status}
                            onValueChange={(value) => handleStatusChange(employee.id, value as Employee['status'])}
                          >
                            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700">
                              <SelectItem value="available">متاح</SelectItem>
                              <SelectItem value="busy">مشغول</SelectItem>
                              <SelectItem value="offline">غير متصل</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(employee)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingEmployee ? 'تعديل موظف' : 'إضافة موظف جديد'}
            </DialogTitle>
            <DialogDescription className="text-purple-200">
              {editingEmployee ? 'تعديل معلومات الموظف والصلاحيات' : 'إضافة موظف جديد للنظام مع تحديد الصلاحيات'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-purple-300 mb-3">المعلومات الأساسية</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-200 text-sm">اسم المستخدم *</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="username"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-purple-200 text-sm">الاسم الكامل *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="الاسم بالكامل"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-purple-200 text-sm">الدور الوظيفي</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${role.color}`}></div>
                            {role.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-purple-200 text-sm">القسم</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-purple-200 text-sm">البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-purple-200 text-sm">رقم الهاتف</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-purple-200 text-sm">الحالة</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Employee['status'] })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="available">متاح</SelectItem>
                      <SelectItem value="busy">مشغول</SelectItem>
                      <SelectItem value="offline">غير متصل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-sm font-semibold text-purple-300 mb-3">الصلاحيات</h3>
              <div className="space-y-4">
                {Object.entries(getPermissionsByCategory()).map(([category, perms]) => (
                  <div key={category} className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-200 mb-3">{category}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {perms.map(perm => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900"
                          />
                          <span className="text-sm text-slate-200">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                تم تحديد {formData.permissions.length} صلاحية من أصل {PERMISSIONS.length}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="text-white hover:bg-white/10"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {editingEmployee ? 'حفظ التعديلات' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
