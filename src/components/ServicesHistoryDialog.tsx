'use client';

import React, { useState, useEffect } from 'react';
import { Room } from '@/lib/rooms-data';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface ServicesHistoryDialogProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  getRoomServicesHistory: (room: Room) => Promise<any>;
}

export default function ServicesHistoryDialog({
  room,
  isOpen,
  onClose,
  getRoomServicesHistory
}: ServicesHistoryDialogProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && room) {
      setLoading(true);
      getRoomServicesHistory(room).then(data => {
        setServices(data.services || []);
        setLoading(false);
      });
    }
  }, [isOpen, room, getRoomServicesHistory]);

  const handlePrint = () => {
    window.print();
  };

  if (!room) return null;

  const totalAmount = services.reduce((sum, service) => sum + (service.amount || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            سجل خدمات غرفة {room.number}
          </DialogTitle>
          <DialogDescription>
            {room.guestName && `النزيل: ${room.guestName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">لا توجد خدمات مسجلة</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold">التاريخ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">النوع</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">التفاصيل</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {service.date ? new Date(service.date).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            service.category === 'coffee' ? 'default' :
                            service.category === 'laundry' ? 'secondary' :
                            'outline'
                          }>
                            {service.category === 'coffee' ? 'قهوة' :
                             service.category === 'laundry' ? 'مغسلة' :
                             service.category === 'restaurant' ? 'مطعم' :
                             service.type || 'خدمة'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {service.details || service.items?.map((item: any) => item.name).join(', ') || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            service.status === 'completed' ? 'default' :
                            service.status === 'pending' ? 'secondary' :
                            'outline'
                          }>
                            {service.status === 'completed' ? 'مكتمل' :
                             service.status === 'pending' ? 'قيد التنفيذ' :
                             service.status === 'accepted' ? 'مقبول' :
                             service.status || 'غير محدد'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {service.amount ? `${service.amount.toFixed(2)} ر.س` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-700">
                        الإجمالي:
                      </td>
                      <td className="px-4 py-3 text-lg font-bold text-blue-600">
                        {totalAmount.toFixed(2)} ر.س
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
          <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
            <FileText className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}