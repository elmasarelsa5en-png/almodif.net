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
import { getAllPaymentVouchers, getPaymentVouchersSummary, type PaymentVoucher } from '@/lib/payment-vouchers-system';
import PaymentVoucherDialog from '@/components/PaymentVoucherDialog';

export default function PaymentVouchersPage() {
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<PaymentVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadVouchers();
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
  }, [searchTerm, vouchers, filterCategory, filterPaymentMethod, startDate, endDate]);

  const loadVouchers = async () => {
    try {
      const data = await getAllPaymentVouchers();
      setVouchers(data);
      setFilteredVouchers(data);
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

  const filterData = () => {
    let filtered = [...vouchers];

    // تصفية بالبحث
    if (searchTerm) {
      filtered = filtered.filter(voucher =>
        voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية بالبند
    if (filterCategory !== 'all') {
      filtered = filtered.filter(voucher => voucher.category === filterCategory);
    }

    // تصفية بطريقة الدفع
    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter(voucher => voucher.paymentMethod === filterPaymentMethod);
    }

    // تصفية بالتاريخ
    if (startDate) {
      filtered = filtered.filter(voucher => 
        new Date(voucher.createdAt) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(voucher => 
        new Date(voucher.createdAt) <= new Date(endDate + 'T23:59:59')
      );
    }

    setFilteredVouchers(filtered);
  };

  const handleVoucherCreated = () => {
    loadVouchers();
    loadSummary();
    setIsDialogOpen(false);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      utilities: '⚡ مرافق وخدمات',
      maintenance: '🔧 صيانة',
      salaries: '💰 رواتب',
      supplies: '📦 مستلزمات',
      cleaning: '🧹 نظافة',
      food: '🍽️ مواد غذائية',
      marketing: '📢 تسويق',
      other: '📋 أخرى'
    };
    return labels[category] || category;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: '💵 نقدي',
      bank_transfer: '🏦 تحويل بنكي',
      check: '📝 شيك'
    };
    return labels[method] || method;
  };

  const printVoucher = (voucher: PaymentVoucher) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سند صرف - ${voucher.voucherNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20mm; }
          .voucher { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { font-size: 28px; margin-bottom: 5px; }
          .header h2 { font-size: 20px; color: #d32f2f; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .info-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .info-item label { font-weight: bold; display: block; margin-bottom: 5px; color: #333; }
          .info-item value { font-size: 16px; }
          .amount-section { text-align: center; background: #ffebee; padding: 20px; margin: 20px 0; border: 2px dashed #d32f2f; border-radius: 10px; }
          .amount-section .label { font-size: 18px; color: #666; }
          .amount-section .value { font-size: 36px; font-weight: bold; color: #d32f2f; margin: 10px 0; }
          .tax-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
          .tax-item { background: #fff3e0; padding: 10px; border-radius: 5px; text-align: center; }
          .tax-item .label { font-size: 12px; color: #666; }
          .tax-item .value { font-size: 20px; font-weight: bold; color: #f57c00; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
          .signature { text-align: center; }
          .signature-line { border-top: 2px solid #000; margin-top: 60px; padding-top: 10px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="voucher">
          <div class="header">
            <h1>🏨 فندق المضيف</h1>
            <h2>سند صرف</h2>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>رقم السند:</label>
              <value>${voucher.voucherNumber}</value>
            </div>
            <div class="info-item">
              <label>التاريخ:</label>
              <value>${voucher.gregorianDate || new Date(voucher.createdAt).toLocaleDateString('ar-SA')}</value>
            </div>
            ${voucher.hijriDate ? `
            <div class="info-item">
              <label>التاريخ الهجري:</label>
              <value>${voucher.hijriDate}</value>
            </div>
            ` : ''}
            ${voucher.time ? `
            <div class="info-item">
              <label>الوقت:</label>
              <value>${voucher.time}</value>
            </div>
            ` : ''}
            <div class="info-item">
              <label>المستلم:</label>
              <value>${voucher.paidTo}</value>
            </div>
            ${voucher.cashier ? `
            <div class="info-item">
              <label>أمين الصندوق:</label>
              <value>${voucher.cashier}</value>
            </div>
            ` : ''}
            <div class="info-item">
              <label>طريقة الدفع:</label>
              <value>${getPaymentMethodLabel(voucher.paymentMethod)}</value>
            </div>
            <div class="info-item">
              <label>بند الصرف:</label>
              <value>${getCategoryLabel(voucher.category)}</value>
            </div>
          </div>

          <div class="amount-section">
            <div class="label">المبلغ المدفوع</div>
            <div class="value">${voucher.amount.toFixed(2)} ريال سعودي</div>
            <div class="tax-info">
              <div class="tax-item">
                <div class="label">المبلغ بدون ضريبة</div>
                <div class="value">${voucher.totalWithoutVat.toFixed(2)} ر.س</div>
              </div>
              <div class="tax-item">
                <div class="label">قيمة الضريبة (${voucher.vatRate}%)</div>
                <div class="value">${voucher.vatAmount.toFixed(2)} ر.س</div>
              </div>
            </div>
            <div style="font-size: 14px; color: #666; margin-top: 15px;">من أجل: ${voucher.purpose}</div>
          </div>

          ${voucher.supplierTaxNumber ? `
          <div class="info-grid">
            <div class="info-item">
              <label>الرقم الضريبي للمورد:</label>
              <value>${voucher.supplierTaxNumber}</value>
            </div>
            ${voucher.supplierInvoiceNumber ? `
            <div class="info-item">
              <label>رقم فاتورة المورد:</label>
              <value>${voucher.supplierInvoiceNumber}</value>
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${voucher.notes ? `
          <div class="info-item" style="margin: 20px 0;">
            <label>ملاحظات:</label>
            <value>${voucher.notes}</value>
          </div>
          ` : ''}

          <div class="footer">
            <div class="signatures">
              <div class="signature">
                <div class="signature-line">
                  <strong>المستلم: ${voucher.paidTo}</strong>
                </div>
              </div>
              <div class="signature">
                <div class="signature-line">
                  <strong>المصرح: ${voucher.cashier || '___________'}</strong>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                  <FileText className="w-8 h-8" />
                </div>
                إدارة سندات الصرف
              </h1>
              <p className="text-white/80 text-lg">إدارة وعرض جميع سندات الصرف اليومية</p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg px-8 py-6 text-lg"
            >
              <Plus className="ml-2 w-6 h-6" />
              إضافة سند صرف جديد
            </Button>
          </div>
        </div>

        {/* الملخص */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">إجمالي المصروفات</p>
                    <p className="text-3xl font-bold text-white">{summary.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">الضريبة المضافة</p>
                    <p className="text-3xl font-bold text-white">{summary.totalVAT.toFixed(2)}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-600 shadow-lg">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">المبلغ بدون ضريبة</p>
                    <p className="text-3xl font-bold text-white">{summary.totalWithoutVat.toFixed(2)}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
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
                    <p className="text-3xl font-bold text-white">{summary.count}</p>
                    <p className="text-xs text-white/60 mt-1">سند صرف</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* الفلاتر */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث برقم السند، المستلم، أو الغرض..."
                  className="pr-10 bg-white/10 border-white/30 text-white placeholder:text-white/60"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5 pointer-events-none" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pr-10 bg-white/10 border-white/30 text-white"
                  placeholder="من تاريخ"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5 pointer-events-none" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pr-10 bg-white/10 border-white/30 text-white"
                  placeholder="إلى تاريخ"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="all" className="bg-slate-800">جميع البنود</option>
                <option value="utilities" className="bg-slate-800">⚡ مرافق</option>
                <option value="maintenance" className="bg-slate-800">🔧 صيانة</option>
                <option value="salaries" className="bg-slate-800">💰 رواتب</option>
                <option value="supplies" className="bg-slate-800">📦 مستلزمات</option>
                <option value="cleaning" className="bg-slate-800">🧹 نظافة</option>
                <option value="food" className="bg-slate-800">🍽️ مواد غذائية</option>
                <option value="marketing" className="bg-slate-800">📢 تسويق</option>
                <option value="other" className="bg-slate-800">📋 أخرى</option>
              </select>

              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="all" className="bg-slate-800">جميع طرق الدفع</option>
                <option value="cash" className="bg-slate-800">💵 نقدي</option>
                <option value="bank_transfer" className="bg-slate-800">🏦 تحويل بنكي</option>
                <option value="check" className="bg-slate-800">📝 شيك</option>
              </select>
            </div>
            
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterPaymentMethod('all');
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                  setStartDate(firstDay.toISOString().split('T')[0]);
                  setEndDate(lastDay.toISOString().split('T')[0]);
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Filter className="w-4 h-4 ml-2" />
                مسح الفلاتر
              </Button>
              <div className="text-white/70 flex items-center gap-2 mr-auto">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">عدد النتائج: {filteredVouchers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الجدول الاحترافي */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-3 text-2xl">
              <FileText className="w-7 h-7" />
              سندات الصرف
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <div className="text-white text-xl">جاري التحميل...</div>
              </div>
            ) : filteredVouchers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-xl">لا توجد سندات صرف</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-right p-4 text-white/90 font-bold text-sm">رقم السند</th>
                      <th className="text-right p-4 text-white/90 font-bold text-sm">التاريخ</th>
                      <th className="text-right p-4 text-white/90 font-bold text-sm">من</th>
                      <th className="text-right p-4 text-white/90 font-bold text-sm">المبلغ</th>
                      <th className="text-right p-4 text-white/90 font-bold text-sm">من أجل</th>
                      <th className="text-right p-4 text-white/90 font-bold text-sm">طريقة الدفع</th>
                      <th className="text-center p-4 text-white/90 font-bold text-sm">العمليات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVouchers.map((voucher, index) => (
                      <tr 
                        key={voucher.id} 
                        className={`border-b border-white/5 hover:bg-white/10 transition-all ${
                          index % 2 === 0 ? 'bg-white/5' : ''
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-white font-mono font-bold">{voucher.voucherNumber}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-white/90 text-sm">
                            {new Date(voucher.createdAt).toLocaleDateString('ar-SA')}
                          </div>
                          <div className="text-white/60 text-xs mt-1">
                            {new Date(voucher.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-white/90 font-semibold">{voucher.paidTo}</div>
                          <div className="text-white/60 text-xs mt-1">
                            {getCategoryLabel(voucher.category)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="bg-red-500/20 rounded-lg px-3 py-2 inline-block border border-red-400/30">
                            <div className="text-white font-bold text-lg">{voucher.amount.toFixed(2)}</div>
                            <div className="text-white/70 text-xs">ريال سعودي</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-white/90 text-sm max-w-xs truncate">
                            {voucher.purpose}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 inline-flex items-center gap-1">
                            {getPaymentMethodLabel(voucher.paymentMethod)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => printVoucher(voucher)}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
                              title="طباعة"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-400/30"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
