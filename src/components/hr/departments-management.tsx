'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Building } from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

interface DepartmentsManagementProps {
  departments: Department[];
  onAddDepartment: (name: string) => void;
  onDeleteDepartment: (id: string) => void;
}

export function DepartmentsManagement({ departments, onAddDepartment, onDeleteDepartment }: DepartmentsManagementProps) {
  const [newDepartmentName, setNewDepartmentName] = useState('');

  const handleAdd = () => {
    if (newDepartmentName.trim()) {
      onAddDepartment(newDepartmentName.trim());
      setNewDepartmentName('');
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center gap-2">
          <Building className="w-5 h-5 text-purple-300" />
          إدارة الأقسام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="اسم القسم الجديد"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <Button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            إضافة
          </Button>
        </div>

        <div className="space-y-3">
          {departments.map((dept) => (
            <div key={dept.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
              <span className="text-white">{dept.name}</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => onDeleteDepartment(dept.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}