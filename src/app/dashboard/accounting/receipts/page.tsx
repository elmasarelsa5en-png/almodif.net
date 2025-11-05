'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar,
  DollarSign,
  CreditCard,
  Printer,
  Filter,
  Plus
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAllReceipts, getReceiptsSummary, type Receipt } from '@/lib/receipts-system';
import ReceiptDialog from '@/components/ReceiptDialog';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadReceipts();
    loadSummary();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, receipts, filterType, filterPaymentMethod]);

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

    // تصفية بالنوع
    if (filterType !== 'all') {
      filtered = filtered.filter(receipt => receipt.type === filterType);
    }

    // تصفية بطريقة الدفع
    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter(receipt => receipt.paymentMethod === filterPaymentMethod);
    }

    setFilteredReceipts(filtered);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: '💵 نقدي',
      card: '💳 بطاقة',
      transfer: '🏦 تحويل بنكي'
    };
    return labels[method] || method;
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
                    <p className="text-3xl font-bold text-white">{summary.totalAmount}</p>
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
                    <p className="text-3xl font-bold text-white">{summary.byPaymentMethod.cash}</p>
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
                    <p className="text-3xl font-bold text-white">{summary.byPaymentMethod.card}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
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

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-slate-800">جميع الأنواع</option>
                <option value="room_payment" className="bg-slate-800">دفعات الشقق</option>
                <option value="service_payment" className="bg-slate-800">دفعات الخدمات</option>
                <option value="booking_deposit" className="bg-slate-800">عربون حجز</option>
                <option value="other" className="bg-slate-800">أخرى</option>
              </select>

              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-slate-800">جميع طرق الدفع</option>
                <option value="cash" className="bg-slate-800">💵 نقدي</option>
                <option value="card" className="bg-slate-800">💳 بطاقة</option>
                <option value="transfer" className="bg-slate-800">🏦 تحويل</option>
              </select>

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterPaymentMethod('all');
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Filter className="w-4 h-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receipts List */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-3 text-2xl">
              <FileText className="w-7 h-7" />
              السندات ({filteredReceipts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <div className="text-white text-xl">جاري التحميل...</div>
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-xl">لا توجد سندات</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl font-bold text-white">{receipt.receiptNumber}</span>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/30 text-green-200 border border-green-400/30">
                            {getPaymentMethodLabel(receipt.paymentMethod)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                            {getCategoryLabel(receipt.category)}
                          </span>
                        </div>
                        <div className="text-sm text-white/80 space-y-2">
                          {receipt.roomNumber && (
                            <p className="flex items-center gap-2">
                              <span className="text-white/60">🏠 شقة:</span>
                              <span className="font-semibold">{receipt.roomNumber}</span>
                            </p>
                          )}
                          {receipt.guestName && (
                            <p className="flex items-center gap-2">
                              <span className="text-white/60">👤 النزيل:</span>
                              <span className="font-semibold">{receipt.guestName}</span>
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <span className="text-white/60">📝 التفاصيل:</span>
                            <span>{receipt.description}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-white/60">📅 التاريخ:</span>
                            <span>{new Date(receipt.createdAt).toLocaleDateString('ar-SA')} - {new Date(receipt.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-white/60">👨‍💼 المستلم:</span>
                            <span className="font-semibold">{receipt.paidBy}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-4">
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl p-4 border border-green-400/30">
                          <p className="text-xs text-white/70 mb-1">المبلغ المحصل</p>
                          <p className="text-3xl font-bold text-white">{receipt.amount}</p>
                          <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                        </div>
                        <Button
                          onClick={() => printReceipt(receipt)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg w-full"
                        >
                          <Printer className="w-4 h-4 ml-2" />
                          طباعة السند
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog إضافة سند قبض */}
        <ReceiptDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={() => {
            setIsDialogOpen(false);
            loadReceipts();
            loadSummary();
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
