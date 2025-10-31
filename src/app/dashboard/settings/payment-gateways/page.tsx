'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  DollarSign,
  Settings,
  Check,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Save,
  TestTube,
  Shield,
  Zap,
  TrendingUp,
  Percent,
  Link as LinkIcon
} from 'lucide-react';
import {
  PaymentProvider,
  PaymentConfig,
  Currency,
  getActiveProviders,
  savePaymentConfig,
  updatePaymentConfig
} from '@/lib/payment/payment-gateway-service';

export default function PaymentGatewaysPage() {
  const [configs, setConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<Partial<PaymentConfig> | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testMode, setTestMode] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await getActiveProviders();
      setConfigs(data);
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingConfig) return;

    try {
      if (editingConfig.id) {
        await updatePaymentConfig(editingConfig.id, editingConfig);
      } else {
        await savePaymentConfig(editingConfig as any);
      }
      await loadConfigs();
      setEditingConfig(null);
    } catch (error) {
      console.error('Error saving config:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const toggleSecret = (configId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  const getProviderIcon = (provider: PaymentProvider) => {
    switch (provider) {
      case 'stripe':
        return '💳';
      case 'paypal':
        return '🅿️';
      case 'stcpay':
        return '📱';
      case 'mada':
      case 'hyperpay':
        return '🏦';
      default:
        return '💰';
    }
  };

  const getProviderColor = (provider: PaymentProvider) => {
    switch (provider) {
      case 'stripe':
        return 'bg-purple-500';
      case 'paypal':
        return 'bg-blue-500';
      case 'stcpay':
        return 'bg-purple-700';
      case 'mada':
      case 'hyperpay':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  const providerTemplates: Record<PaymentProvider, Partial<PaymentConfig>> = {
    stripe: {
      provider: 'stripe',
      displayName: 'Stripe',
      displayNameAr: 'سترايب',
      logo: 'https://stripe.com/img/v3/home/social.png',
      currency: 'SAR',
      minAmount: 1,
      maxAmount: 100000,
      feePercentage: 2.9,
      feeFixed: 0,
      isActive: false,
      isTestMode: true,
      publicKey: '',
      secretKey: '',
      webhookUrl: `${window.location.origin}/api/webhooks/stripe`,
      description: 'بطاقات ائتمان عالمية - Visa, Mastercard, Amex'
    },
    paypal: {
      provider: 'paypal',
      displayName: 'PayPal',
      displayNameAr: 'باي بال',
      logo: 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg',
      currency: 'USD',
      minAmount: 1,
      maxAmount: 10000,
      feePercentage: 3.4,
      feeFixed: 0.3,
      isActive: false,
      isTestMode: true,
      publicKey: '',
      secretKey: '',
      webhookUrl: `${window.location.origin}/api/webhooks/paypal`,
      description: 'محفظة PayPal والبطاقات الائتمانية'
    },
    stcpay: {
      provider: 'stcpay',
      displayName: 'STC Pay',
      displayNameAr: 'STC باي',
      logo: 'https://www.stcpay.com.sa/sites/default/files/logo.png',
      currency: 'SAR',
      minAmount: 1,
      maxAmount: 50000,
      feePercentage: 1.5,
      feeFixed: 0,
      isActive: false,
      isTestMode: true,
      publicKey: '',
      secretKey: '',
      merchantId: '',
      webhookUrl: `${window.location.origin}/api/webhooks/stcpay`,
      description: 'محفظة STC Pay الإلكترونية'
    },
    mada: {
      provider: 'mada',
      displayName: 'Mada',
      displayNameAr: 'مدى',
      logo: 'https://www.mada.com.sa/assets/images/mada-logo.svg',
      currency: 'SAR',
      minAmount: 1,
      maxAmount: 100000,
      feePercentage: 1.75,
      feeFixed: 0,
      isActive: false,
      isTestMode: true,
      publicKey: '',
      secretKey: '',
      webhookUrl: `${window.location.origin}/api/webhooks/hyperpay`,
      description: 'بطاقات مدى السعودية (عبر HyperPay)'
    },
    hyperpay: {
      provider: 'hyperpay',
      displayName: 'HyperPay',
      displayNameAr: 'هايبر باي',
      logo: 'https://www.hyperpay.com/wp-content/uploads/2019/09/hyperpay-logo.png',
      currency: 'SAR',
      minAmount: 1,
      maxAmount: 100000,
      feePercentage: 2.5,
      feeFixed: 0,
      isActive: false,
      isTestMode: true,
      publicKey: '',
      secretKey: '',
      webhookUrl: `${window.location.origin}/api/webhooks/hyperpay`,
      description: 'بوابة دفع شاملة - مدى، Visa، Mastercard'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
              بوابات الدفع
            </h1>
            <p className="text-gray-600 mt-1">
              إدارة وإعداد بوابات الدفع الإلكتروني
            </p>
          </div>
          <Button
            onClick={() => setTestMode(!testMode)}
            variant={testMode ? 'outline' : 'default'}
            className="gap-2"
          >
            <TestTube className="w-4 h-4" />
            {testMode ? 'وضع الاختبار' : 'الوضع الحقيقي'}
          </Button>
        </div>

        {/* Alert */}
        {testMode && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900">أنت في وضع الاختبار</p>
              <p className="text-yellow-700">
                جميع المعاملات في وضع الاختبار ولن يتم خصم أموال حقيقية. استخدم بطاقات الاختبار المتوفرة.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">البوابات المفعلة</p>
                <p className="text-2xl font-bold text-green-600">
                  {configs.filter(c => c.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي البوابات</p>
                <p className="text-2xl font-bold text-blue-600">{configs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط الرسوم</p>
                <p className="text-2xl font-bold text-purple-600">
                  {configs.length > 0
                    ? (configs.reduce((sum, c) => sum + c.feePercentage, 0) / configs.length).toFixed(2)
                    : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">البوابات الآمنة</p>
                <p className="text-2xl font-bold text-green-600">
                  {configs.filter(c => c.webhookSecret).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {Object.entries(providerTemplates).map(([key, template]) => {
          const existingConfig = configs.find(c => c.provider === key);
          const config = existingConfig || template;
          const isActive = existingConfig?.isActive || false;

          return (
            <Card key={key} className={`${isActive ? 'border-green-500 border-2' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${getProviderColor(key as PaymentProvider)} rounded-lg flex items-center justify-center text-2xl`}>
                      {getProviderIcon(key as PaymentProvider)}
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {config.displayNameAr}
                        {isActive && (
                          <Badge variant="default" className="bg-green-600">
                            <Check className="w-3 h-3 ml-1" />
                            مفعّل
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => setEditingConfig(existingConfig || { ...template, id: undefined })}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 ml-1" />
                    إعداد
                  </Button>
                </div>
              </CardHeader>

              {existingConfig && (
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">العملة</p>
                      <p className="font-semibold">{config.currency}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">الرسوم</p>
                      <p className="font-semibold">{config.feePercentage}% + {config.feeFixed} {config.currency}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">الحد الأدنى</p>
                      <p className="font-semibold">{config.minAmount} {config.currency}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">الحد الأقصى</p>
                      <p className="font-semibold">{config.maxAmount.toLocaleString('ar-SA')} {config.currency}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">وضع الاختبار</span>
                      <Badge variant={config.isTestMode ? 'outline' : 'default'}>
                        {config.isTestMode ? 'مفعّل' : 'معطّل'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Setup Guide */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            دليل الإعداد السريع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">1️⃣</div>
              <h3 className="font-semibold mb-1">إنشاء حساب</h3>
              <p className="text-sm text-gray-600">سجّل في البوابة المطلوبة</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">2️⃣</div>
              <h3 className="font-semibold mb-1">الحصول على API Keys</h3>
              <p className="text-sm text-gray-600">احصل على المفاتيح من لوحة التحكم</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">3️⃣</div>
              <h3 className="font-semibold mb-1">إدخال البيانات</h3>
              <p className="text-sm text-gray-600">أدخل المفاتيح في صفحة الإعداد</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-2">4️⃣</div>
              <h3 className="font-semibold mb-1">اختبار وتفعيل</h3>
              <p className="text-sm text-gray-600">اختبر البوابة ثم فعّلها</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingConfig && (
        <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                إعداد {editingConfig.displayNameAr}
              </DialogTitle>
              <DialogDescription>
                قم بإدخال معلومات البوابة والمفاتيح السرية
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base font-semibold">تفعيل البوابة</Label>
                  <p className="text-sm text-gray-600">السماح للعملاء باستخدام هذه البوابة</p>
                </div>
                <Switch
                  checked={editingConfig.isActive}
                  onCheckedChange={(checked) =>
                    setEditingConfig({ ...editingConfig, isActive: checked })
                  }
                />
              </div>

              {/* Test Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <Label className="text-base font-semibold">وضع الاختبار</Label>
                  <p className="text-sm text-gray-600">استخدام بيئة الاختبار (Sandbox)</p>
                </div>
                <Switch
                  checked={editingConfig.isTestMode}
                  onCheckedChange={(checked) =>
                    setEditingConfig({ ...editingConfig, isTestMode: checked })
                  }
                />
              </div>

              {/* Public Key */}
              <div>
                <Label>المفتاح العام (Public Key)</Label>
                <div className="relative mt-1">
                  <Input
                    type={showSecrets[editingConfig.provider || ''] ? 'text' : 'password'}
                    value={editingConfig.publicKey || ''}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, publicKey: e.target.value })
                    }
                    placeholder="pk_test_..."
                    className="pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret(editingConfig.provider || '')}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                  >
                    {showSecrets[editingConfig.provider || ''] ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Secret Key */}
              <div>
                <Label>المفتاح السري (Secret Key)</Label>
                <div className="relative mt-1">
                  <Input
                    type={showSecrets[`${editingConfig.provider}_secret`] ? 'text' : 'password'}
                    value={editingConfig.secretKey || ''}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, secretKey: e.target.value })
                    }
                    placeholder="sk_test_..."
                    className="pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret(`${editingConfig.provider}_secret`)}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                  >
                    {showSecrets[`${editingConfig.provider}_secret`] ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Merchant ID (optional) */}
              {(editingConfig.provider === 'stcpay' || editingConfig.provider === 'hyperpay') && (
                <div>
                  <Label>معرف التاجر (Merchant ID)</Label>
                  <Input
                    value={editingConfig.merchantId || ''}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, merchantId: e.target.value })
                    }
                    placeholder="MERCHANT_ID"
                  />
                </div>
              )}

              {/* Currency */}
              <div>
                <Label>العملة</Label>
                <select
                  value={editingConfig.currency || 'SAR'}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, currency: e.target.value as Currency })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                </select>
              </div>

              {/* Amount Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الحد الأدنى للمبلغ</Label>
                  <Input
                    type="number"
                    value={editingConfig.minAmount || 1}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, minAmount: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>الحد الأقصى للمبلغ</Label>
                  <Input
                    type="number"
                    value={editingConfig.maxAmount || 100000}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, maxAmount: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Fees */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نسبة الرسوم (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingConfig.feePercentage || 0}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, feePercentage: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>رسوم ثابتة</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingConfig.feeFixed || 0}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, feeFixed: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Webhook URL */}
              <div>
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  رابط Webhook
                </Label>
                <Input
                  value={editingConfig.webhookUrl || ''}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, webhookUrl: e.target.value })
                  }
                  placeholder="https://yourdomain.com/api/webhooks/..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  استخدم هذا الرابط في إعدادات البوابة لاستقبال الإشعارات
                </p>
              </div>

              {/* Webhook Secret */}
              <div>
                <Label>Webhook Secret (اختياري)</Label>
                <Input
                  type="password"
                  value={editingConfig.webhookSecret || ''}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, webhookSecret: e.target.value })
                  }
                  placeholder="whsec_..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingConfig(null)}>
                إلغاء
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                حفظ الإعدادات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
