'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import {
  BankVoucher,
  BankAccount,
  BankStatistics,
  subscribeToBankVouchers,
  getAllBankAccounts,
  getBankStatistics,
  createBankVoucher,
  updateBankVoucher,
  deleteBankVoucher,
  BankVoucherType,
  BankCategory,
  VoucherStatus
} from '@/lib/bank-vouchers-system';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  ChevronDown,
  FileText,
  Upload,
  Download,
  Edit,
  Trash2
} from 'lucide-react';

export default function BankVouchersPage() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<BankVoucher[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [statistics, setStatistics] = useState<BankStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<BankVoucherType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<VoucherStatus | 'all'>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (!user) return;

    // تحميل البيانات الأولية
    const loadInitialData = async () => {
      try {
        const [accountsData, statsData] = await Promise.all([
          getAllBankAccounts(),
          getBankStatistics()
        ]);
        setAccounts(accountsData);
        setStatistics(statsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // الاشتراك في التحديثات المباشرة
    const unsubscribe = subscribeToBankVouchers((updatedVouchers) => {
      setVouchers(updatedVouchers);
    });

    return () => unsubscribe();
  }, [user]);

  // التصفية والبحث
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(voucher => {
      // فلترة النوع
      if (selectedType !== 'all' && voucher.type !== selectedType) {
        return false;
      }

      // فلترة الحالة
      if (selectedStatus !== 'all' && voucher.status !== selectedStatus) {
        return false;
      }

      // فلترة الحساب
      if (selectedAccount !== 'all' && voucher.accountNumber !== selectedAccount) {
        return false;
      }

      // البحث
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          voucher.voucherNumber.toLowerCase().includes(term) ||
          voucher.bankName.toLowerCase().includes(term) ||
          voucher.counterparty.toLowerCase().includes(term) ||
          voucher.reference.toLowerCase().includes(term) ||
          voucher.description?.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [vouchers, selectedType, selectedStatus, selectedAccount, searchTerm]);

  const canCreate = hasPermission(user, 'create_bank_voucher');
  const canEdit = hasPermission(user, 'edit_bank_voucher');
  const canDelete = hasPermission(user, 'delete_bank_voucher');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل سندات البنك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Building2 className="text-blue-600" size={40} />
              سندات البنك
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة شاملة للمعاملات البنكية والمطابقة التلقائية
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Upload size={20} />
              رفع كشف حساب
            </button>
            {canCreate && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                سند جديد
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* إجمالي المعاملات */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 className="text-blue-600" size={24} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-800">
                  {statistics.totalVouchers}
                </p>
                <p className="text-sm text-gray-600">إجمالي المعاملات</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp size={14} />
                {statistics.byType.deposit} إيداع
              </span>
              <span className="text-red-600 flex items-center gap-1">
                <TrendingDown size={14} />
                {statistics.byType.withdrawal} سحب
              </span>
            </div>
          </div>

          {/* صافي التدفق النقدي */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-800">
                  {statistics.netCashFlow.toLocaleString('ar-SA')}
                </p>
                <p className="text-sm text-gray-600">صافي التدفق النقدي</p>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              <div className="flex justify-between">
                <span>إيداعات:</span>
                <span className="text-green-600 font-semibold">
                  {statistics.totalDeposits.toLocaleString('ar-SA')} ر.س
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>سحوبات:</span>
                <span className="text-red-600 font-semibold">
                  {statistics.totalWithdrawals.toLocaleString('ar-SA')} ر.س
                </span>
              </div>
            </div>
          </div>

          {/* المعاملات المعلقة */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-800">
                  {statistics.pendingAmount.toLocaleString('ar-SA')}
                </p>
                <p className="text-sm text-gray-600">معاملات معلقة</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                {statistics.byStatus.pending} سند
              </span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                قيد المراجعة
              </span>
            </div>
          </div>

          {/* المطابقة */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Check className="text-purple-600" size={24} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-800">
                  {statistics.byStatus.reconciled}
                </p>
                <p className="text-sm text-gray-600">سندات مطابقة</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${(statistics.byStatus.reconciled / statistics.totalVouchers * 100).toFixed(0)}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-center mt-2 text-gray-600">
              {((statistics.byStatus.reconciled / statistics.totalVouchers) * 100).toFixed(1)}% مطابقة
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث برقم السند، البنك، الطرف المقابل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* نوع المعاملة */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">جميع الأنواع</option>
              <option value="deposit">إيداع</option>
              <option value="withdrawal">سحب</option>
              <option value="transfer">تحويل</option>
              <option value="check">شيك</option>
              <option value="fee">رسوم</option>
              <option value="interest">فائدة</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          {/* الحالة */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">معلق</option>
              <option value="cleared">مقاصة</option>
              <option value="bounced">مرتجع</option>
              <option value="cancelled">ملغي</option>
              <option value="reconciled">مطابق</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          {/* الحساب البنكي */}
          <div className="relative">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">جميع الحسابات</option>
              {accounts.map(account => (
                <option key={account.id} value={account.accountNumber}>
                  {account.bankName} - {account.accountNumber}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* نتائج البحث */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            عرض {filteredVouchers.length} من {vouchers.length} سند
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <X size={16} />
              إلغاء البحث
            </button>
          )}
        </div>
      </div>

      {/* Vouchers List */}
      <div className="space-y-4">
        {filteredVouchers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              لا توجد سندات بنكية
            </h3>
            <p className="text-gray-600 mb-6">
              ابدأ بإضافة سند بنكي جديد أو رفع كشف حساب
            </p>
            {canCreate && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
              >
                <Plus size={20} />
                إضافة سند جديد
              </button>
            )}
          </div>
        ) : (
          filteredVouchers.map(voucher => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// Voucher Card Component
// ============================================

interface VoucherCardProps {
  voucher: BankVoucher;
  canEdit: boolean;
  canDelete: boolean;
}

function VoucherCard({ voucher, canEdit, canDelete }: VoucherCardProps) {
  const [expanded, setExpanded] = useState(false);

  // تحديد لون الحد حسب النوع
  const borderColor = voucher.type === 'deposit' || voucher.type === 'interest'
    ? 'border-r-green-500'
    : 'border-r-red-500';

  // تحديد أيقونة النوع
  const TypeIcon = voucher.type === 'deposit' || voucher.type === 'interest'
    ? ArrowUpRight
    : ArrowDownRight;

  // تحديد لون وأيقونة الحالة
  const getStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'معلق' };
      case 'cleared':
        return { color: 'bg-blue-100 text-blue-800', icon: Check, label: 'مقاصة' };
      case 'bounced':
        return { color: 'bg-red-100 text-red-800', icon: X, label: 'مرتجع' };
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-800', icon: X, label: 'ملغي' };
      case 'reconciled':
        return { color: 'bg-green-100 text-green-800', icon: Check, label: 'مطابق' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: status };
    }
  };

  const statusBadge = getStatusBadge(voucher.status);
  const StatusIcon = statusBadge.icon;

  // تحديد التصنيف
  const getCategoryLabel = (category: BankCategory): string => {
    const labels: Record<BankCategory, string> = {
      customer_payment: 'دفعة عميل',
      supplier_payment: 'دفعة مورد',
      salary_payment: 'رواتب',
      loan_payment: 'قسط قرض',
      bank_charges: 'رسوم بنكية',
      interest_income: 'فائدة دائنة',
      interest_expense: 'فائدة مدينة',
      tax_payment: 'ضرائب',
      capital_injection: 'رأس مال',
      dividend: 'أرباح',
      refund: 'استرجاع',
      other: 'أخرى'
    };
    return labels[category];
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-r-4 ${borderColor} overflow-hidden`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* أيقونة النوع */}
            <div className={`p-3 rounded-xl ${
              voucher.type === 'deposit' || voucher.type === 'interest'
                ? 'bg-green-100'
                : 'bg-red-100'
            }`}>
              <TypeIcon 
                size={24}
                className={voucher.type === 'deposit' || voucher.type === 'interest'
                  ? 'text-green-600'
                  : 'text-red-600'
                }
              />
            </div>

            {/* معلومات السند */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-800">
                  {voucher.voucherNumber}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                  <StatusIcon size={14} />
                  {statusBadge.label}
                </span>
                {voucher.reconciled && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                    <Check size={14} />
                    مطابق
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {voucher.bankName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(voucher.transactionDate).toLocaleDateString('ar-SA')}
                </span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                  {getCategoryLabel(voucher.category)}
                </span>
              </div>
            </div>
          </div>

          {/* المبلغ */}
          <div className="text-left">
            <p className={`text-2xl font-bold ${
              voucher.type === 'deposit' || voucher.type === 'interest'
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {voucher.type === 'deposit' || voucher.type === 'interest' ? '+' : '-'}
              {voucher.amount.toLocaleString('ar-SA')} {voucher.currency}
            </p>
            {voucher.currency !== 'SAR' && voucher.amountInSAR && (
              <p className="text-sm text-gray-600 mt-1">
                ({voucher.amountInSAR.toLocaleString('ar-SA')} ر.س)
              </p>
            )}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">رقم الحساب</p>
            <p className="font-semibold text-gray-800">{voucher.accountNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">الطرف المقابل</p>
            <p className="font-semibold text-gray-800">{voucher.counterparty}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">المرجع</p>
            <p className="font-semibold text-gray-800">{voucher.reference}</p>
          </div>
        </div>

        {/* الوصف */}
        {voucher.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">{voucher.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {expanded ? 'إخفاء' : 'عرض'} التفاصيل
            <ChevronDown 
              size={16} 
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>

          <div className="flex gap-2">
            {canEdit && (
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <Edit size={18} />
              </button>
            )}
            {canDelete && (
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">تاريخ القيمة</p>
                <p className="font-semibold text-gray-800">
                  {new Date(voucher.valueDate).toLocaleDateString('ar-SA')}
                </p>
              </div>
              {voucher.checkNumber && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">رقم الشيك</p>
                  <p className="font-semibold text-gray-800">{voucher.checkNumber}</p>
                </div>
              )}
              {voucher.counterpartyAccount && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">حساب الطرف المقابل</p>
                  <p className="font-semibold text-gray-800">{voucher.counterpartyAccount}</p>
                </div>
              )}
              {voucher.counterpartyBank && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">بنك الطرف المقابل</p>
                  <p className="font-semibold text-gray-800">{voucher.counterpartyBank}</p>
                </div>
              )}
            </div>

            {voucher.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">ملاحظات</p>
                <p className="text-sm text-gray-700">{voucher.notes}</p>
              </div>
            )}

            {voucher.reconciledDate && (
              <div className="p-3 bg-green-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">تاريخ المطابقة</p>
                  <p className="text-sm font-semibold text-green-700">
                    {new Date(voucher.reconciledDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                {voucher.reconciledBy && (
                  <p className="text-xs text-gray-600">
                    بواسطة: {voucher.reconciledBy}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
