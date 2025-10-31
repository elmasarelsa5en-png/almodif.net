'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { hasPermission } from '@/lib/permissions';
import {
  AccountingConfig,
  AccountingProvider,
  SyncFrequency,
  createAccountingConfig,
  getActiveAccountingConfig,
  updateAccountingConfig,
  testAccountingConnection,
  getSyncStatistics,
  getSyncLog,
  type SyncLogEntry
} from '@/lib/accounting-config';
import {
  Settings,
  Link2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  TestTube,
  Clock,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  PlayCircle,
  PauseCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AccountingSettingsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AccountingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'connection' | 'mapping' | 'sync' | 'logs'>('connection');

  useEffect(() => {
    if (!user) return;
    loadConfig();
  }, [user]);

  const loadConfig = async () => {
    try {
      const activeConfig = await getActiveAccountingConfig();
      if (activeConfig) {
        setConfig(activeConfig);
        const stats = await getSyncStatistics(activeConfig.id!);
        setSyncStats(stats);
        const logs = await getSyncLog(activeConfig.id!, 20);
        setSyncLogs(logs);
      } else {
        // إنشاء إعداد افتراضي
        setConfig({
          provider: 'qoyod',
          providerName: 'قيود',
          isActive: false,
          status: 'disconnected',
          credentials: {},
          syncSettings: {
            frequency: 'hourly',
            autoSync: false,
            syncVouchers: true,
            syncPromissoryNotes: true,
            syncInvoices: false,
            syncPayments: true
          },
          accountMapping: {
            defaultBankAccount: '',
            bankAccounts: {},
            revenueAccount: '',
            customerPaymentAccount: '',
            expenseAccount: '',
            supplierPaymentAccount: '',
            salaryAccount: '',
            loanPaymentAccount: '',
            bankChargesAccount: '',
            taxPaymentAccount: '',
            receivableAccount: '',
            payableAccount: '',
            promissoryRevenueAccount: '',
            capitalAccount: '',
            dividendAccount: '',
            otherAccount: ''
          },
          taxSettings: {
            enabled: true,
            defaultTaxRate: 15,
            taxAccountCode: '',
            includeTaxInAmount: true
          },
          currencySettings: {
            baseCurrency: 'SAR',
            supportedCurrencies: ['SAR', 'USD', 'EUR'],
            autoConvert: true
          },
          syncLog: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: user!.id
        } as AccountingConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config || !user) return;

    setSaving(true);
    try {
      if (config.id) {
        await updateAccountingConfig(config.id, config, user.id);
      } else {
        const id = await createAccountingConfig(config);
        setConfig({ ...config, id });
      }
      alert('✅ تم حفظ الإعدادات بنجاح');
    } catch (error: any) {
      alert('❌ خطأ في الحفظ: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!config?.id) {
      alert('يرجى حفظ الإعدادات أولاً');
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const result = await testAccountingConnection(config.id);
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'فشل الاتصال'
      });
    } finally {
      setTesting(false);
    }
  };

  const canManage = hasPermission(user?.permissions || [], 'manage_general_settings');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل إعدادات المحاسبة...</p>
        </div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
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
              <Settings className="text-blue-600" size={40} />
              إعدادات النظام المحاسبي
            </h1>
            <p className="text-gray-600 mt-2">
              الربط مع الأنظمة المحاسبية الخارجية (قيود، دفترة، زوهو)
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleTest}
              disabled={testing || !config?.credentials.apiKey}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <TestTube size={20} />
              )}
              اختبار الاتصال
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              حفظ الإعدادات
            </button>
          </div>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`mb-6 p-4 rounded-xl border-2 ${
          testResult.success 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-center gap-3">
            {testResult.success ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : (
              <XCircle className="text-red-600" size={24} />
            )}
            <div>
              <p className={`font-semibold ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {syncStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-100 rounded-xl">
                <RefreshCw className="text-blue-600" size={24} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-800">{syncStats.totalSynced}</p>
                <p className="text-sm text-gray-600">إجمالي المزامنة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-800">{syncStats.successCount}</p>
                <p className="text-sm text-gray-600">ناجحة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-red-500">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="text-red-600" size={24} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-800">{syncStats.errorCount}</p>
                <p className="text-sm text-gray-600">فاشلة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-800">{syncStats.pendingCount}</p>
                <p className="text-sm text-gray-600">معلقة</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('connection')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'connection'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Link2 className="inline-block ml-2" size={20} />
            الاتصال
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'mapping'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText className="inline-block ml-2" size={20} />
            خريطة الحسابات
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'sync'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <RefreshCw className="inline-block ml-2" size={20} />
            إعدادات المزامنة
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'logs'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="inline-block ml-2" size={20} />
            سجل المزامنة
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'connection' && config && (
            <ConnectionSettings config={config} setConfig={setConfig} showApiKey={showApiKey} setShowApiKey={setShowApiKey} />
          )}
          {activeTab === 'mapping' && config && (
            <AccountMappingSettings config={config} setConfig={setConfig} />
          )}
          {activeTab === 'sync' && config && (
            <SyncSettings config={config} setConfig={setConfig} />
          )}
          {activeTab === 'logs' && (
            <SyncLogsView logs={syncLogs} />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Connection Settings Component
// ============================================
function ConnectionSettings({ 
  config, 
  setConfig, 
  showApiKey, 
  setShowApiKey 
}: { 
  config: AccountingConfig; 
  setConfig: (c: AccountingConfig) => void;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          النظام المحاسبي
        </label>
        <select
          value={config.provider}
          onChange={(e) => setConfig({ 
            ...config, 
            provider: e.target.value as AccountingProvider,
            providerName: e.target.options[e.target.selectedIndex].text
          })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        >
          <option value="qoyod">قيود (Qoyod)</option>
          <option value="daftra">دفترة (Daftra)</option>
          <option value="zoho">زوهو بوكس (Zoho Books)</option>
          <option value="manual">يدوي (Manual)</option>
        </select>
      </div>

      {/* API Key */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          مفتاح API
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={config.credentials.apiKey || ''}
            onChange={(e) => setConfig({
              ...config,
              credentials: { ...config.credentials, apiKey: e.target.value }
            })}
            placeholder="أدخل مفتاح API..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Base URL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          رابط API الأساسي
        </label>
        <input
          type="url"
          value={config.credentials.baseUrl || ''}
          onChange={(e) => setConfig({
            ...config,
            credentials: { ...config.credentials, baseUrl: e.target.value }
          })}
          placeholder="https://api.qoyod.com/v1"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          الحالة
        </label>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
          config.status === 'active' ? 'bg-green-100 text-green-800' :
          config.status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {config.status === 'active' && <CheckCircle size={20} />}
          {config.status === 'error' && <XCircle size={20} />}
          {config.status === 'disconnected' && <AlertCircle size={20} />}
          <span className="font-semibold">
            {config.status === 'active' ? 'نشط' :
             config.status === 'error' ? 'خطأ' :
             config.status === 'paused' ? 'متوقف مؤقتاً' :
             'غير متصل'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Account Mapping Component
// ============================================
function AccountMappingSettings({ config, setConfig }: { config: AccountingConfig; setConfig: (c: AccountingConfig) => void }) {
  const updateMapping = (key: string, value: string) => {
    setConfig({
      ...config,
      accountMapping: {
        ...config.accountMapping,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            الحساب البنكي الافتراضي
          </label>
          <input
            type="text"
            value={config.accountMapping.defaultBankAccount}
            onChange={(e) => updateMapping('defaultBankAccount', e.target.value)}
            placeholder="1010"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            حساب الإيرادات
          </label>
          <input
            type="text"
            value={config.accountMapping.revenueAccount}
            onChange={(e) => updateMapping('revenueAccount', e.target.value)}
            placeholder="4010"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            حساب دفعات العملاء
          </label>
          <input
            type="text"
            value={config.accountMapping.customerPaymentAccount}
            onChange={(e) => updateMapping('customerPaymentAccount', e.target.value)}
            placeholder="1210"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            حساب المصروفات
          </label>
          <input
            type="text"
            value={config.accountMapping.expenseAccount}
            onChange={(e) => updateMapping('expenseAccount', e.target.value)}
            placeholder="5010"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            حساب المدينون (كمبيالات مدينة)
          </label>
          <input
            type="text"
            value={config.accountMapping.receivableAccount}
            onChange={(e) => updateMapping('receivableAccount', e.target.value)}
            placeholder="1220"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            حساب الدائنون (كمبيالات دائنة)
          </label>
          <input
            type="text"
            value={config.accountMapping.payableAccount}
            onChange={(e) => updateMapping('payableAccount', e.target.value)}
            placeholder="2210"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sync Settings Component
// ============================================
function SyncSettings({ config, setConfig }: { config: AccountingConfig; setConfig: (c: AccountingConfig) => void }) {
  const updateSync = (key: string, value: any) => {
    setConfig({
      ...config,
      syncSettings: {
        ...config.syncSettings,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            تكرار المزامنة
          </label>
          <select
            value={config.syncSettings.frequency}
            onChange={(e) => updateSync('frequency', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="realtime">فوري (Realtime)</option>
            <option value="hourly">كل ساعة</option>
            <option value="daily">يومياً</option>
            <option value="weekly">أسبوعياً</option>
            <option value="manual">يدوي</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.syncSettings.autoSync}
              onChange={(e) => updateSync('autoSync', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">
              مزامنة تلقائية
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">ما الذي تريد مزامنته؟</p>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.syncSettings.syncVouchers}
            onChange={(e) => updateSync('syncVouchers', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">سندات البنك</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.syncSettings.syncPromissoryNotes}
            onChange={(e) => updateSync('syncPromissoryNotes', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">سندات الكمبيالات</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.syncSettings.syncPayments}
            onChange={(e) => updateSync('syncPayments', e.target.checked)}
            className="w-full h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">المدفوعات</span>
        </label>
      </div>
    </div>
  );
}

// ============================================
// Sync Logs Component
// ============================================
function SyncLogsView({ logs }: { logs: SyncLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto text-gray-400 mb-4" size={64} />
        <p className="text-gray-600">لا توجد سجلات مزامنة بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl border-2 ${
            log.status === 'success' ? 'bg-green-50 border-green-200' :
            log.status === 'error' ? 'bg-red-50 border-red-200' :
            'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {log.status === 'success' && <CheckCircle className="text-green-600" size={20} />}
              {log.status === 'error' && <XCircle className="text-red-600" size={20} />}
              {log.status === 'pending' && <Clock className="text-yellow-600" size={20} />}
              
              <div>
                <p className="font-semibold text-gray-800">
                  {log.type === 'voucher' ? 'سند بنك' :
                   log.type === 'promissory_note' ? 'كمبيالة' :
                   log.type === 'invoice' ? 'فاتورة' :
                   'دفعة'}
                  {' - '}
                  {log.action === 'create' ? 'إنشاء' :
                   log.action === 'update' ? 'تحديث' :
                   'حذف'}
                </p>
                <p className="text-sm text-gray-600">
                  {log.internalId}
                  {log.externalId && ` → ${log.externalId}`}
                </p>
              </div>
            </div>
            
            <div className="text-left">
              <p className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-gray-500">
                محاولة {log.attempts}
              </p>
            </div>
          </div>
          
          {log.error && (
            <p className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded">
              {log.error}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
