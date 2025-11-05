'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Printer,
  Search,
  Filter,
  Calendar,
  DollarSign
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAllReceipts, getReceiptsSummary, type Receipt } from '@/lib/receipts-system';
import ReceiptDialog from '@/components/ReceiptDialog';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReceipts();
    loadSummary();
    
    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, receipts, filterCategory, filterPaymentMethod, startDate, endDate]);

  const loadReceipts = async () => {
    try {
      const data = await getAllReceipts();
      setReceipts(data);
      setFilteredReceipts(data);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const data = await getReceiptsSummary(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const filterData = () => {
    let filtered = [...receipts];

    // تصفية بالبحث
    if (searchTerm) {
      filtered = filtered.filter(receipt =>
        receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية بالبند
    if (filterCategory !== 'all') {
      filtered = filtered.filter(receipt => receipt.category === filterCategory);
    }

    // تصفية بطريقة الدفع
    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter(receipt => receipt.paymentMethod === filterPaymentMethod);
    }

    // تصفية بالتاريخ
    if (startDate) {
      filtered = filtered.filter(receipt => 
        new Date(receipt.createdAt) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(receipt => 
        new Date(receipt.createdAt) <= new Date(endDate + 'T23:59:59')
      );
    }

    setFilteredReceipts(filtered);
  };

  const handleReceiptCreated = () => {
    loadReceipts();
    loadSummary();
    setIsDialogOpen(false);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      room_rent: '🏠 إيجار شقة',
      services: '🛎️ خدمات',
      laundry: '👔 مغسلة',
      restaurant: '🍽️ مطعم',
      coffee: '☕ كافيه',
      other: '📋 أخرى'
    };
    return labels[category] || category;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: '💵 نقدي',
      card: '💳 بطاقة',
      transfer: '🏦 تحويل بنكي'
    };
    return labels[method] || method;
  };

  const printReceipt = (receipt: Receipt) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سند قبض - ${receipt.receiptNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20mm; }
          .receipt { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { font-size: 28px; margin-bottom: 5px; }
          .header h2 { font-size: 20px; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .info-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .info-item label { font-weight: bold; display: block; margin-bottom: 5px; color: #333; }
          .info-item value { font-size: 16px; }
          .amount-section { text-align: center; background: #e8f5e9; padding: 20px; margin: 20px 0; border: 2px dashed #4caf50; border-radius: 10px; }
          .amount-section .label { font-size: 18px; color: #666; }
          .amount-section .value { font-size: 36px; font-weight: bold; color: #2e7d32; margin: 10px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
          .signature { text-align: center; }
          .signature-line { border-top: 2px solid #000; margin-top: 60px; padding-top: 10px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>🏨 فندق المضيف</h1>
            <h2>سند قبض</h2>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>رقم السند:</label>
              <value>${receipt.receiptNumber}</value>
            </div>
            <div class="info-item">
              <label>التاريخ:</label>
              <value>${new Date(receipt.createdAt).toLocaleDateString('ar-SA')}</value>
            </div>
            ${receipt.roomNumber ? `
            <div class="info-item">
              <label>رقم الشقة:</label>
              <value>${receipt.roomNumber}</value>
            </div>
            ` : ''}
            ${receipt.guestName ? `
            <div class="info-item">
              <label>اسم النزيل:</label>
              <value>${receipt.guestName}</value>
            </div>
            ` : ''}
            <div class="info-item">
              <label>طريقة الدفع:</label>
              <value>${getPaymentMethodLabel(receipt.paymentMethod)}</value>
            </div>
            <div class="info-item">
              <label>التصنيف:</label>
              <value>${getCategoryLabel(receipt.category)}</value>
            </div>
          </div>

          <div class="amount-section">
            <div class="label">المبلغ المستلم</div>
            <div class="value">${receipt.amount} ريال سعودي</div>
            <div style="font-size: 14px; color: #666; margin-top: 10px;">${receipt.description}</div>
          </div>

          ${receipt.notes ? `
          <div class="info-item" style="margin: 20px 0;">
            <label>ملاحظات:</label>
            <value>${receipt.notes}</value>
          </div>
          ` : ''}

          <div class="footer">
            <div class="signatures">
              <div class="signature">
                <div class="signature-line">
                  <strong>المستلم: ${receipt.paidBy}</strong>
                </div>
              </div>
              <div class="signature">
                <div class="signature-line">
                  <strong>الدافع</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <FileText className="w-8 h-8" />
                </div>
                سندات القبض
              </h1>
              <p className="text-white/80 text-lg">إدارة وعرض جميع سندات القبض والإيصالات</p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-white text-green-600 hover:bg-green-50 border-2 border-white/30 shadow-lg px-8 py-6 text-lg font-bold transition-all hover:scale-105"
            >
              <Plus className="ml-2 w-6 h-6" />
              إضافة سند قبض جديد
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">إجمالي المحصلات</p>
                    <p className="text-3xl font-bold text-white">{summary.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">عدد السندات</p>
                    <p className="text-3xl font-bold text-white">{summary.totalReceipts}</p>
                    <p className="text-xs text-white/60 mt-1">سند قبض</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">المدفوعات النقدية</p>
                    <p className="text-3xl font-bold text-white">{summary.byPaymentMethod.cash.toFixed(2)}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">البطاقات البنكية</p>
                    <p className="text-3xl font-bold text-white">{summary.byPaymentMethod.card.toFixed(2)}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="all">جميع البنود</option>
                  <option value="room_rent">إيجار شقة</option>
                  <option value="services">خدمات</option>
                  <option value="laundry">مغسلة</option>
                  <option value="restaurant">مطعم</option>
                  <option value="coffee">كافيه</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <select
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="all">جميع طرق الدفع</option>
                  <option value="cash">نقدي</option>
                  <option value="card">بطاقة</option>
                  <option value="transfer">تحويل بنكي</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              {/* End Date */}
              <div>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipts Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث برقم السند، الشقة، أو النزيل..."
                  className="pr-10 bg-white/10 border-white/30 text-white placeholder:text-white/60"
                />
              </div>


            </div>
          </CardContent>
        </Card>

        {/* Receipts Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-3 text-2xl">
                <FileText className="w-7 h-7" />
                سندات القبض ({filteredReceipts.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
                <div className="text-white/80 text-xl">جاري تحميل السندات...</div>
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-20 h-20 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-xl mb-2">لا توجد سندات قبض</p>
                <p className="text-white/40 text-sm">قم بإضافة سند قبض جديد باستخدام الزر أعلاه</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-right py-4 px-6 text-white/90 font-semibold text-sm">رقم السند</th>
                      <th className="text-right py-4 px-6 text-white/90 font-semibold text-sm">التاريخ</th>
                      <th className="text-right py-4 px-6 text-white/90 font-semibold text-sm">التصنيف</th>
                      <th className="text-right py-4 px-6 text-white/90 font-semibold text-sm">الشقة</th>
                      <th className="text-right py-4 px-6 text-white/90 font-semibold text-sm">اسم النزيل</th>
                      <th className="text-right py-4 px-6 text-white/90 font-semibold text-sm">التفاصيل</th>
                      <th className="text-right py-4 px-6 text-white/90 font-semibold text-sm">المستلم من</th>
                      <th className="text-right py-4 px-6 text-white/90 font-semibold text-sm">طريقة الدفع</th>
                      <th className="text-right py-4 px-6 text-white/90 font-semibold text-sm">المبلغ</th>
                      <th className="text-center py-4 px-6 text-white/90 font-semibold text-sm">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredReceipts.map((receipt) => (
                      <tr key={receipt.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6">
                          <span className="text-white font-mono font-semibold">{receipt.receiptNumber}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-white/80 text-sm">
                            <div>{new Date(receipt.createdAt).toLocaleDateString('ar-SA')}</div>
                            <div className="text-white/50 text-xs">
                              {new Date(receipt.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            {getCategoryLabel(receipt.category)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white/90">{receipt.roomNumber || '-'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white/90">{receipt.guestName || '-'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white/70 text-sm">{receipt.description}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white/90">{receipt.paidBy}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-400/30">
                            {getPaymentMethodLabel(receipt.paymentMethod)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col items-end">
                            <span className="text-white font-bold text-lg">{Number(receipt.amount).toFixed(2)}</span>
                            <span className="text-white/50 text-xs">ريال</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => printReceipt(receipt)}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                            >
                              <Printer className="w-4 h-4 ml-1" />
                              طباعة
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-white/5 border-t-2 border-white/20">
                    <tr>
                      <td colSpan={8} className="py-4 px-6 text-right">
                        <span className="text-white font-bold text-lg">الإجمالي:</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-end">
                          <span className="text-white font-bold text-xl">
                            {filteredReceipts.reduce((sum, r) => sum + Number(r.amount), 0).toFixed(2)}
                          </span>
                          <span className="text-white/60 text-sm">ريال سعودي</span>
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog إضافة سند قبض */}
        <ReceiptDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={handleReceiptCreated}
        />
      </div>
    </ProtectedRoute>
  );
}
