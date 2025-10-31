'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Printer,
  Eye
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/auth-context';
import {
  getAllExpenseVouchers,
  getExpenseStats,
  createExpenseVoucher,
  approveExpenseVoucher,
  rejectExpenseVoucher,
  markVoucherAsPaid,
  cancelExpenseVoucher,
  type ExpenseVoucher,
  type ExpenseStats,
  type ExpenseCategory,
  type PaymentMethod,
  getStatusLabel,
  getCategoryLabel,
  getPaymentMethodLabel,
  formatAmount
} from '@/lib/expense-vouchers-system';

const STATUS_CONFIG = {
  'draft': { label: 'مسودة', color: 'bg-gray-500/20 text-gray-300', icon: '📝' },
  'pending': { label: 'قيد الانتظار', color: 'bg-yellow-500/20 text-yellow-300', icon: '⏳' },
  'approved': { label: 'معتمد', color: 'bg-blue-500/20 text-blue-300', icon: '✔️' },
  'paid': { label: 'مدفوع', color: 'bg-green-500/20 text-green-300', icon: '💰' },
  'rejected': { label: 'مرفوض', color: 'bg-red-500/20 text-red-300', icon: '❌' },
  'cancelled': { label: 'ملغي', color: 'bg-gray-500/20 text-gray-400', icon: '🚫' },
};

export default function ExpenseVouchersPage() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<ExpenseVoucher[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<ExpenseVoucher | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'supplies' as ExpenseCategory,
    amount: 0,
    taxPercentage: 15,
    paymentMethod: 'cash' as PaymentMethod,
    beneficiaryName: '',
    beneficiaryType: 'individual' as 'employee' | 'supplier' | 'vendor' | 'individual',
    beneficiaryPhone: '',
    voucherDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vouchersData, statsData] = await Promise.all([
        getAllExpenseVouchers(),
        getExpenseStats()
      ]);
      setVouchers(vouchersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading expense data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesStatus = filterStatus === 'all' || voucher.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || voucher.category === filterCategory;
    const matchesSearch = voucher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleCreateVoucher = async () => {
    if (!user) return;
    
    try {
      await createExpenseVoucher({
        ...formData,
        currency: 'SAR',
        status: 'pending',
        createdBy: user.id || user.username,
        createdByName: user.name || user.username,
        requestedBy: user.id || user.username,
        requestedByName: user.name || user.username
      });
      
      setShowAddDialog(false);
      loadData();
      alert('✅ تم إنشاء سند الصرف بنجاح!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'supplies',
        amount: 0,
        taxPercentage: 15,
        paymentMethod: 'cash',
        beneficiaryName: '',
        beneficiaryType: 'individual',
        beneficiaryPhone: '',
        voucherDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      console.error('Error creating voucher:', error);
      alert('❌ حدث خطأ أثناء إنشاء السند');
    }
  };

  const handleApprove = async (voucherId: string) => {
    if (!user) return;
    const notes = prompt('ملاحظات الاعتماد (اختياري):');
    await approveExpenseVoucher(voucherId, user.id || user.username, user.name || user.username, notes || undefined);
    loadData();
  };

  const handleReject = async (voucherId: string) => {
    if (!user) return;
    const reason = prompt('سبب الرفض:');
    if (!reason) return;
    await rejectExpenseVoucher(voucherId, user.id || user.username, user.name || user.username, reason);
    loadData();
  };

  const handleMarkAsPaid = async (voucherId: string) => {
    if (!user) return;
    const notes = prompt('ملاحظات الدفع (اختياري):');
    await markVoucherAsPaid(voucherId, user.id || user.username, user.name || user.username, undefined, notes || undefined);
    loadData();
  };

  const handlePrint = (voucher: ExpenseVoucher) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const taxAmount = voucher.taxAmount || 0;
    const netAmount = voucher.amount;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سند صرف - ${voucher.voucherNumber}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            direction: rtl;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .voucher-number {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin: 10px 0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
          }
          .info-item {
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .info-label {
            font-weight: bold;
            color: #6b7280;
            font-size: 14px;
          }
          .info-value {
            font-size: 16px;
            margin-top: 5px;
          }
          .amount-box {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
          }
          .amount-label {
            font-size: 16px;
            opacity: 0.9;
          }
          .amount-value {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
          }
          .breakdown {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .breakdown-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .breakdown-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
          }
          .signature-section {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
          }
          .signature-box {
            text-align: center;
            border-top: 2px solid #333;
            padding-top: 10px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏨 المضيف للشقق الفندقية</h1>
          <h2>سند صرف</h2>
          <div class="voucher-number">${voucher.voucherNumber}</div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">التاريخ</div>
            <div class="info-value">${new Date(voucher.voucherDate).toLocaleDateString('ar-SA')}</div>
          </div>
          <div class="info-item">
            <div class="info-label">الحالة</div>
            <div class="info-value">${getStatusLabel(voucher.status)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">المستفيد</div>
            <div class="info-value">${voucher.beneficiaryName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">نوع المصروف</div>
            <div class="info-value">${getCategoryLabel(voucher.category)}</div>
          </div>
        </div>

        <div class="info-item" style="margin: 20px 0;">
          <div class="info-label">البيان</div>
          <div class="info-value">${voucher.title}</div>
          <div style="margin-top: 10px; color: #6b7280;">${voucher.description}</div>
        </div>

        <div class="breakdown">
          <div class="breakdown-row">
            <span>المبلغ الأساسي</span>
            <span>${formatAmount(netAmount)}</span>
          </div>
          <div class="breakdown-row">
            <span>ضريبة القيمة المضافة (${voucher.taxPercentage || 15}%)</span>
            <span>${formatAmount(taxAmount)}</span>
          </div>
          <div class="breakdown-row">
            <span>الإجمالي</span>
            <span>${formatAmount(voucher.totalAmount)}</span>
          </div>
        </div>

        <div class="amount-box">
          <div class="amount-label">المبلغ الإجمالي</div>
          <div class="amount-value">${formatAmount(voucher.totalAmount)}</div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">طريقة الدفع</div>
            <div class="info-value">${getPaymentMethodLabel(voucher.paymentMethod)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">طالب الصرف</div>
            <div class="info-value">${voucher.requestedByName}</div>
          </div>
        </div>

        ${voucher.notes ? `
          <div class="info-item" style="margin: 20px 0;">
            <div class="info-label">ملاحظات</div>
            <div class="info-value">${voucher.notes}</div>
          </div>
        ` : ''}

        <div class="signature-section">
          <div class="signature-box">
            <div>المستفيد</div>
            <div style="margin-top: 40px;">${voucher.beneficiaryName}</div>
          </div>
          <div class="signature-box">
            <div>المعتمد</div>
            <div style="margin-top: 40px;">${voucher.approvedByName || '___________'}</div>
          </div>
          <div class="signature-box">
            <div>المحاسب</div>
            <div style="margin-top: 40px;">___________</div>
          </div>
        </div>

        <div class="footer">
          <p>تم الإنشاء بواسطة: ${voucher.createdByName}</p>
          <p>تاريخ الإنشاء: ${new Date(voucher.createdAt).toLocaleString('ar-SA')}</p>
          <p>almodif.net - نظام إدارة الشقق الفندقية</p>
        </div>

        <button class="no-print" onclick="window.print()" style="
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
          🖨️ طباعة
        </button>
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
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">سندات الصرف</h1>
              <p className="text-white/80 text-lg">إدارة وتتبع جميع المصروفات والمدفوعات</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">إجمالي السندات</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-white/60 mt-1">سند صرف</p>
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
                    <p className="text-sm text-white/70 mb-1">إجمالي المصروفات</p>
                    <p className="text-2xl font-bold text-white">{formatAmount(stats.totalAmount)}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">قيد الانتظار</p>
                    <p className="text-2xl font-bold text-white">{formatAmount(stats.pendingAmount)}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">المدفوع</p>
                    <p className="text-2xl font-bold text-white">{formatAmount(stats.paidAmount)}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">متوسط السند</p>
                    <p className="text-2xl font-bold text-white">{formatAmount(stats.avgVoucherAmount)}</p>
                    <p className="text-xs text-white/60 mt-1">ريال سعودي</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters & Actions */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-5 h-5 text-white" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث في السندات..."
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
              >
                <option value="all">جميع الحالات</option>
                <option value="draft">مسودة</option>
                <option value="pending">قيد الانتظار</option>
                <option value="approved">معتمد</option>
                <option value="paid">مدفوع</option>
                <option value="rejected">مرفوض</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
              >
                <option value="all">جميع الفئات</option>
                <option value="salaries">رواتب</option>
                <option value="utilities">مرافق</option>
                <option value="maintenance">صيانة</option>
                <option value="supplies">مستلزمات</option>
                <option value="food">مواد غذائية</option>
                <option value="cleaning">تنظيف</option>
                <option value="marketing">تسويق</option>
                <option value="other">أخرى</option>
              </select>

              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                سند جديد
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vouchers List */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              سندات الصرف ({filteredVouchers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-white">جاري التحميل...</div>
            ) : filteredVouchers.length === 0 ? (
              <div className="text-center py-8 text-white/70">لا توجد سندات</div>
            ) : (
              <div className="space-y-4">
                {filteredVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-bold text-lg">{voucher.title}</h3>
                          <Badge className={STATUS_CONFIG[voucher.status].color}>
                            {STATUS_CONFIG[voucher.status].icon} {STATUS_CONFIG[voucher.status].label}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-300">
                            {getCategoryLabel(voucher.category)}
                          </Badge>
                        </div>
                        <p className="text-white/70 text-sm mb-2">{voucher.description}</p>
                        
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1 text-blue-300">
                            <FileText className="w-4 h-4" />
                            {voucher.voucherNumber}
                          </div>
                          <div className="flex items-center gap-1 text-green-300">
                            <DollarSign className="w-4 h-4" />
                            {formatAmount(voucher.totalAmount)}
                          </div>
                          <div className="flex items-center gap-1 text-yellow-300">
                            <User className="w-4 h-4" />
                            {voucher.beneficiaryName}
                          </div>
                          <div className="flex items-center gap-1 text-purple-300">
                            <Calendar className="w-4 h-4" />
                            {new Date(voucher.voucherDate).toLocaleDateString('ar-SA')}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedVoucher(voucher);
                            setShowDetailsDialog(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="border-blue-400/30 text-blue-300 hover:bg-blue-500/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handlePrint(voucher)}
                          size="sm"
                          variant="outline"
                          className="border-green-400/30 text-green-300 hover:bg-green-500/10"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {voucher.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleApprove(voucher.id!)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleReject(voucher.id!)}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {voucher.status === 'approved' && (
                          <Button
                            onClick={() => handleMarkAsPaid(voucher.id!)}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            💰 دفع
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Dialog */}
        {showAddDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 to-green-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">➕ سند صرف جديد</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">العنوان *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="مثال: شراء مستلزمات تنظيف"
                    className="bg-white/10 border-white/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">الوصف *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="تفاصيل المصروف..."
                    rows={3}
                    className="bg-white/10 border-white/30 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">الفئة *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as ExpenseCategory})}
                      className="w-full bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
                    >
                      <option value="supplies">مستلزمات</option>
                      <option value="maintenance">صيانة</option>
                      <option value="food">مواد غذائية</option>
                      <option value="cleaning">تنظيف</option>
                      <option value="utilities">مرافق</option>
                      <option value="salaries">رواتب</option>
                      <option value="marketing">تسويق</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">المبلغ *</label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                      placeholder="0.00"
                      className="bg-white/10 border-white/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">طريقة الدفع *</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                      className="w-full bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
                    >
                      <option value="cash">نقدي</option>
                      <option value="bank_transfer">تحويل بنكي</option>
                      <option value="check">شيك</option>
                      <option value="credit_card">بطاقة ائتمانية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">التاريخ *</label>
                    <Input
                      type="date"
                      value={formData.voucherDate}
                      onChange={(e) => setFormData({...formData, voucherDate: e.target.value})}
                      className="bg-white/10 border-white/30 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">المستفيد *</label>
                  <Input
                    value={formData.beneficiaryName}
                    onChange={(e) => setFormData({...formData, beneficiaryName: e.target.value})}
                    placeholder="اسم المستفيد"
                    className="bg-white/10 border-white/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">ملاحظات</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="ملاحظات إضافية..."
                    rows={2}
                    className="bg-white/10 border-white/30 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleCreateVoucher}
                  disabled={!formData.title || !formData.amount || !formData.beneficiaryName}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء السند
                </Button>
                <Button
                  onClick={() => setShowAddDialog(false)}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
