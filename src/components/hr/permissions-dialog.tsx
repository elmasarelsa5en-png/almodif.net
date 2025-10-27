'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Check, Search } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface PermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  allPermissions: Permission[];
  onTogglePermission: (permissionId: string) => void;
}

export function PermissionsDialog({
  isOpen,
  onClose,
  employee,
  allPermissions,
  onTogglePermission
}: PermissionsDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPermissions = useMemo(() => {
    if (!searchTerm) return allPermissions;

    return allPermissions.filter(permission =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPermissions, searchTerm]);

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            إدارة صلاحيات الموظف: {employee?.name}
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث في الصلاحيات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
            />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, permissions]) => {
            const selectedCount = permissions.filter(p => employee?.permissions?.includes(p.id)).length;
            // The return statement was missing parentheses, and the wrapping div was not being closed correctly.
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
                    {category}
                  </h3>
                  <Badge variant="secondary" className="bg-slate-600 text-gray-300">
                    {selectedCount}/{permissions.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.map((permission) => {
                    const isSelected = employee?.permissions?.includes(permission.id);
                    return (
                      <div
                        key={permission.id}
                        onClick={() => onTogglePermission(permission.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                            : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{permission.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex gap-3 justify-end pt-4 border-t border-slate-600">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            إلغاء
          </Button>
          <Button 
            onClick={onClose} 
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 font-semibold"
          >
            ✓ حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}