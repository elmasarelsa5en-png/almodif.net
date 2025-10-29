'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logAction } from '@/lib/audit-log';
import { 
  getEmployees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee,
  subscribeToEmployees,
  Employee 
} from '@/lib/firebase-data';
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Shield,
  Search,
  Filter,
  Loader2,
  Copy
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

// استيراد الصلاحيات من الملف المخصص
import { ALL_PERMISSIONS, getAllPermissions } from '@/lib/permissions';

const STATUS_CONFIG = {
  available: { label: 'متاح', color: 'bg-green-500' },
  busy: { label: 'مشغول', color: 'bg-yellow-500' },
  offline: { label: 'غير متصل', color: 'bg-gray-500' },
};

export default function HRSettingsPage() {
  const PERMISSIONS = getAllPermissions();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopyPermissionsDialogOpen, setIsCopyPermissionsDialogOpen] = useState(false);
  const [targetEmployeeForCopy, setTargetEmployeeForCopy] = useState<Employee | null>(null);
  const [sourceEmployeeId, setSourceEmployeeId] = useState<string>('');
  
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    status: 'available' | 'busy' | 'offline';
    permissions: string[];
  }>({
    username: '',
    password: '',
    name: '',
    role: 'reception',
    department: 'استقبال',
    email: '',
    phone: '',
    status: 'available',
    permissions: [],
  });

  // Load employees from Firebase with real-time updates
  useEffect(() => {
    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToEmployees((employeesData) => {
      setEmployees(employeesData);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
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
        password: employee.password,
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
        password: '',
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

  const handleSave = async () => {
    if (!formData.username || !formData.name || !formData.password) {
      alert('الرجاء إدخال اسم المستخدم والاسم الكامل وكلمة المرور');
      return;
    }

    try {
      if (editingEmployee) {
        // Update existing employee in Firebase
        const oldData = editingEmployee;
        const updatedData = { ...formData };
        await updateEmployee(editingEmployee.id, updatedData);
        
        // تسجيل التعديل في Audit Log
        const changes = [];
        if (oldData.name !== formData.name) changes.push({ field: 'name', fieldLabel: 'الاسم', oldValue: oldData.name, newValue: formData.name });
        if (oldData.role !== formData.role) changes.push({ field: 'role', fieldLabel: 'الدور', oldValue: oldData.role, newValue: formData.role });
        if (oldData.department !== formData.department) changes.push({ field: 'department', fieldLabel: 'القسم', oldValue: oldData.department, newValue: formData.department });
        
        logAction.updateEmployee(formData.name, editingEmployee.id, changes);

        // تحديث صلاحيات المستخدم الحالي إذا كان هو نفسه
        const currentUser = localStorage.getItem('hotel_user');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          if (userData.employeeId === editingEmployee.id || userData.username === editingEmployee.username) {
            // تحديث الصلاحيات في localStorage
            userData.permissions = formData.permissions;
            userData.role = formData.role;
            userData.department = formData.department;
            localStorage.setItem('hotel_user', JSON.stringify(userData));
            
            // إعادة تحميل الصفحة لتحديث الصلاحيات
            alert('✅ تم تحديث بياناتك بنجاح! سيتم تحديث الصفحة...');
            window.location.reload();
          }
        }
      } else {
        // Add new employee to Firebase
        const newEmployee: Omit<Employee, 'id'> = {
          ...formData,
          createdAt: new Date().toISOString(),
        };
        const docId = await addEmployee(newEmployee);
        
        // تسجيل الإضافة في Audit Log
        logAction.addEmployee(formData.name, docId);
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        const employee = employees.find(emp => emp.id === id);
        await deleteEmployee(id);
        
        // تسجيل الحذف في Audit Log
        if (employee) {
          logAction.deleteEmployee(employee.name, id);
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const handleStatusChange = async (id: string, status: Employee['status']) => {
    try {
      await updateEmployee(id, { status });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const handleOpenCopyPermissionsDialog = (employee: Employee) => {
    setTargetEmployeeForCopy(employee);
    setSourceEmployeeId('');
    setIsCopyPermissionsDialogOpen(true);
  };

  const handleCopyPermissions = async () => {
    if (!sourceEmployeeId || !targetEmployeeForCopy) {
      alert('الرجاء اختيار الموظف المصدر');
      return;
    }

    const sourceEmployee = employees.find(emp => emp.id === sourceEmployeeId);
    if (!sourceEmployee) {
      alert('الموظف المصدر غير موجود');
      return;
    }

    if (sourceEmployee.id === targetEmployeeForCopy.id) {
      alert('لا يمكن نسخ الصلاحيات من نفس الموظف');
      return;
    }

    try {
      const copiedPermissions = sourceEmployee.permissions || [];
      await updateEmployee(targetEmployeeForCopy.id, { 
        permissions: copiedPermissions 
      });

      // تسجيل في Audit Log
      logAction.updateEmployee(
        targetEmployeeForCopy.name,
        targetEmployeeForCopy.id,
        [{ 
          field: 'permissions',
          fieldLabel: 'الصلاحيات', 
          oldValue: `${targetEmployeeForCopy.permissions?.length || 0} صلاحية`, 
          newValue: `${copiedPermissions.length} صلاحية (منسوخة من ${sourceEmployee.name})` 
        }]
      );

      alert(`✅ تم نسخ ${copiedPermissions.length} صلاحية من ${sourceEmployee.name} إلى ${targetEmployeeForCopy.name}`);
      setIsCopyPermissionsDialogOpen(false);
    } catch (error) {
      console.error('Error copying permissions:', error);
      alert('حدث خطأ أثناء نسخ الصلاحيات');
    }
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
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              ) : (
                <p className="text-3xl font-bold text-white">{employees.length}</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">متاح</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-green-400" />
              ) : (
                <p className="text-3xl font-bold text-green-400">
                  {employees.filter(e => e.status === 'available').length}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">مشغول</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              ) : (
                <p className="text-3xl font-bold text-yellow-400">
                  {employees.filter(e => e.status === 'busy').length}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">غير متصل</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <p className="text-3xl font-bold text-gray-400">
                  {employees.filter(e => e.status === 'offline').length}
                </p>
              )}
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
                  const statusInfo = STATUS_CONFIG[employee.status] || STATUS_CONFIG.available;
                  
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
                            title="تعديل الموظف"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenCopyPermissionsDialog(employee)}
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            title="نسخ الصلاحيات من موظف آخر"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="حذف الموظف"
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
                  <Label className="text-purple-200 text-sm">كلمة المرور *</Label>
                  <Input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="كلمة المرور"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
                <div className="col-span-2">
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

      {/* Copy Permissions Dialog */}
      <Dialog open={isCopyPermissionsDialogOpen} onOpenChange={setIsCopyPermissionsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Copy className="h-6 w-6 text-green-400" />
              نسخ الصلاحيات
            </DialogTitle>
            <DialogDescription className="text-purple-200">
              {targetEmployeeForCopy && (
                <>نسخ الصلاحيات من موظف آخر إلى <span className="font-bold text-white">{targetEmployeeForCopy.name}</span></>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {targetEmployeeForCopy && (
              <>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="text-sm text-purple-200 mb-1">الموظف المستهدف:</div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {targetEmployeeForCopy.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{targetEmployeeForCopy.name}</div>
                      <div className="text-sm text-gray-400">@{targetEmployeeForCopy.username}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-300">
                    الصلاحيات الحالية: {targetEmployeeForCopy.permissions?.length || 0}
                  </div>
                </div>

                <div>
                  <Label className="text-purple-200 text-sm mb-2 block">اختر الموظف المصدر (لنسخ صلاحياته):</Label>
                  <Select value={sourceEmployeeId} onValueChange={setSourceEmployeeId}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="اختر موظف..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {employees
                        .filter(emp => emp.id !== targetEmployeeForCopy.id)
                        .map(emp => (
                          <SelectItem 
                            key={emp.id} 
                            value={emp.id}
                            className="text-white hover:bg-slate-700"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{emp.name} (@{emp.username})</span>
                              <Badge 
                                variant="secondary" 
                                className="mr-2 text-xs"
                              >
                                {emp.permissions?.length || 0} صلاحية
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {sourceEmployeeId && (() => {
                  const sourceEmp = employees.find(e => e.id === sourceEmployeeId);
                  return sourceEmp ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="text-sm text-green-300">
                        ✅ سيتم نسخ <span className="font-bold">{sourceEmp.permissions?.length || 0} صلاحية</span> من {sourceEmp.name}
                      </div>
                    </div>
                  ) : null;
                })()}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCopyPermissionsDialogOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-slate-800"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCopyPermissions}
              disabled={!sourceEmployeeId}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Copy className="h-4 w-4 ml-2" />
              نسخ الصلاحيات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
