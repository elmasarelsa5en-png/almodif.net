'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Edit, Trash2, Shield, Plus } from 'lucide-react';

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
}

interface EmployeeListProps {
  employees: Employee[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onPermissionsDialog: (employee: Employee) => void;
}

export function EmployeeList({
  employees,
  searchTerm,
  onSearchChange,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onPermissionsDialog
}: EmployeeListProps) {
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-xl">الموظفين</CardTitle>
          <Button
            onClick={onAddEmployee}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            إضافة موظف
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث في الموظفين..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {employee.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{employee.name}</h3>
                    <p className="text-gray-300 text-sm">{employee.position}</p>
                    <p className="text-gray-400 text-xs">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 hover:border-purple-400"
                      onClick={() => onPermissionsDialog(employee)}
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      إدارة الصلاحيات
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 hover:border-blue-400"
                      onClick={() => onEditEmployee(employee)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:border-red-400"
                      onClick={() => onDeleteEmployee(employee.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              لا توجد موظفين مطابقين للبحث
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}