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
  Filter
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAllReceipts, getReceiptsSummary, type Receipt } from '@/lib/receipts-system';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');

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
    <ProtectedRoute requiredPermission="view_receipts">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📋 سندات القبض</h1>
          <p className="text-blue-200">إدارة وعرض جميع سندات القبض</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border-green-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-200">إجمالي المحصلات</p>
                    <p className="text-2xl font-bold text-white">{summary.totalAmount} ر.س</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border-blue-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-200">عدد السندات</p>
                    <p className="text-2xl font-bold text-white">{summary.totalReceipts}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-yellow-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-200">نقدي</p>
                    <p className="text-2xl font-bold text-white">{summary.byPaymentMethod.cash} ر.س</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-200">بطاقات</p>
                    <p className="text-2xl font-bold text-white">{summary.byPaymentMethod.card} ر.س</p>
                  </div>
                  <CreditCard className="w-10 h-10 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث برقم السند، الشقة، أو النزيل..."
                  className="pr-10 bg-white/10 border-white/30 text-white placeholder:text-white/50"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
              >
                <option value="all">جميع الأنواع</option>
                <option value="room_payment">دفعات الشقق</option>
                <option value="service_payment">دفعات الخدمات</option>
                <option value="booking_deposit">عربون حجز</option>
                <option value="other">أخرى</option>
              </select>

              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
              >
                <option value="all">جميع طرق الدفع</option>
                <option value="cash">💵 نقدي</option>
                <option value="card">💳 بطاقة</option>
                <option value="transfer">🏦 تحويل</option>
              </select>

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterPaymentMethod('all');
                }}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
              >
                <Filter className="w-4 h-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receipts List */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-6 h-6" />
              السندات ({filteredReceipts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-white">جاري التحميل...</div>
            ) : filteredReceipts.length === 0 ? (
              <div className="text-center py-8 text-white/70">لا توجد سندات</div>
            ) : (
              <div className="space-y-3">
                {filteredReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-white">{receipt.receiptNumber}</span>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">
                            {getPaymentMethodLabel(receipt.paymentMethod)}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                            {getCategoryLabel(receipt.category)}
                          </span>
                        </div>
                        <div className="text-sm text-white/70 space-y-1">
                          {receipt.roomNumber && <p>🏠 شقة: {receipt.roomNumber}</p>}
                          {receipt.guestName && <p>👤 {receipt.guestName}</p>}
                          <p>📝 {receipt.description}</p>
                          <p>📅 {new Date(receipt.createdAt).toLocaleDateString('ar-SA')} - {new Date(receipt.createdAt).toLocaleTimeString('ar-SA')}</p>
                          <p>👨‍💼 المستلم: {receipt.paidBy}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3">
                        <div>
                          <p className="text-xs text-white/50">المبلغ</p>
                          <p className="text-2xl font-bold text-green-400">{receipt.amount} ر.س</p>
                        </div>
                        <Button
                          onClick={() => printReceipt(receipt)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Printer className="w-4 h-4 ml-2" />
                          طباعة
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
