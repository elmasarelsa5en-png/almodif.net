'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Plus } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAllPaymentVouchers, getPaymentVouchersSummary, type PaymentVoucher } from '@/lib/payment-vouchers-system';
import PaymentVoucherDialog from '@/components/PaymentVoucherDialog';

export default function PaymentVouchersPage() {
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadVouchers();
    loadSummary();
  }, []);

  const loadVouchers = async () => {
    try {
      const data = await getAllPaymentVouchers();
      setVouchers(data);
    } catch (error) {
      console.error('Error loading vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);

      const data = await getPaymentVouchersSummary(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleVoucherCreated = () => {
    loadVouchers();
    loadSummary();
    setIsDialogOpen(false);
  };

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto" dir="rtl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">سندات الصرف</h1>
            <p className="text-gray-600 mt-2">إدارة سندات صرف الشيفت اليومي</p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
          >
            <Plus className="ml-2 w-5 h-5" />
            إضافة سند صرف جديد
          </Button>
        </div>

        {/* الملخص */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">إجمالي المصروفات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary.totalAmount.toFixed(2)} ر.س</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">الضريبة المضافة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{summary.totalVAT.toFixed(2)} ر.س</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">المبلغ بدون ضريبة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{summary.totalWithoutVat.toFixed(2)} ر.س</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">عدد السندات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{summary.count}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* جدول السندات */}
        <Card>
          <CardHeader>
            <CardTitle>سندات الصرف</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>لا توجد سندات صرف</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3">رقم السند</th>
                      <th className="text-right p-3">التاريخ</th>
                      <th className="text-right p-3">المستلم</th>
                      <th className="text-right p-3">المبلغ</th>
                      <th className="text-right p-3">البند</th>
                      <th className="text-right p-3">طريقة الدفع</th>
                      <th className="text-center p-3">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((voucher) => (
                      <tr key={voucher.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono">{voucher.voucherNumber}</td>
                        <td className="p-3">{new Date(voucher.createdAt).toLocaleDateString('ar-SA')}</td>
                        <td className="p-3">{voucher.paidTo}</td>
                        <td className="p-3 font-bold text-red-600">{voucher.amount.toFixed(2)} ر.س</td>
                        <td className="p-3">{voucher.category}</td>
                        <td className="p-3">
                          {voucher.paymentMethod === 'cash' ? '💵 نقدي' : 
                           voucher.paymentMethod === 'bank_transfer' ? '🏦 تحويل بنكي' : '📝 شيك'}
                        </td>
                        <td className="p-3 text-center">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog إضافة سند صرف */}
        <PaymentVoucherDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={handleVoucherCreated}
        />
      </div>
    </ProtectedRoute>
  );
}
