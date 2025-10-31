'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface PaymentLink {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'active' | 'paid' | 'expired' | 'cancelled';
  paymentMethods: ('apple-pay' | 'samsung-pay' | 'bank-transfer' | 'credit-card')[];
  link: string;
  qrCode: string;
  createdAt: string;
  expiresAt?: string;
  paidAt?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  bookingId?: string;
  notes?: string;
}

export default function PaymentPage() {
  const params = useParams();
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  useEffect(() => {
    loadPaymentLink();
  }, [params.id]);

  const loadPaymentLink = () => {
    try {
      const saved = localStorage.getItem('payment-links');
      if (saved) {
        const links: PaymentLink[] = JSON.parse(saved);
        const link = links.find(l => l.id === params.id);
        if (link) {
          setPaymentLink(link);
          if (link.customerName) setFormData(prev => ({ ...prev, customerName: link.customerName || '' }));
          if (link.customerPhone) setFormData(prev => ({ ...prev, customerPhone: link.customerPhone || '' }));
          if (link.customerEmail) setFormData(prev => ({ ...prev, customerEmail: link.customerEmail || '' }));
        }
      }
    } catch (error) {
      console.error('Error loading payment link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('الرجاء اختيار طريقة الدفع');
      return;
    }

    if (!formData.customerName || !formData.customerPhone) {
      alert('الرجاء إدخال الاسم ورقم الهاتف');
      return;
    }

    if (selectedMethod === 'credit-card' && (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv)) {
      alert('الرجاء إدخال بيانات البطاقة');
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);

      // Update payment link status
      try {
        const saved = localStorage.getItem('payment-links');
        if (saved && paymentLink) {
          const links: PaymentLink[] = JSON.parse(saved);
          const updatedLinks = links.map(l => 
            l.id === paymentLink.id 
              ? { ...l, status: 'paid' as const, paidAt: new Date().toISOString() }
              : l
          );
          localStorage.setItem('payment-links', JSON.stringify(updatedLinks));
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    }, 3000);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'apple-pay': return <Smartphone className="w-6 h-6" />;
      case 'samsung-pay': return <Smartphone className="w-6 h-6" />;
      case 'credit-card': return <CreditCard className="w-6 h-6" />;
      case 'bank-transfer': return <Building2 className="w-6 h-6" />;
      default: return <CreditCard className="w-6 h-6" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'apple-pay': return 'Apple Pay';
      case 'samsung-pay': return 'Samsung Pay';
      case 'credit-card': return 'بطاقة ائتمان';
      case 'bank-transfer': return 'تحويل بنكي';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl max-w-md w-full">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">رابط غير صالح</h2>
            <p className="text-blue-200">الرابط الذي تحاول الوصول إليه غير موجود أو منتهي الصلاحية</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentLink.status === 'paid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl max-w-md w-full">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">تم الدفع مسبقاً</h2>
            <p className="text-blue-200">هذا الرابط تم استخدامه من قبل</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentLink.status === 'expired' || (paymentLink.expiresAt && new Date(paymentLink.expiresAt) < new Date())) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Clock className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">انتهت صلاحية الرابط</h2>
            <p className="text-blue-200">الرجاء التواصل معنا للحصول على رابط جديد</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">تم الدفع بنجاح!</h2>
            <p className="text-blue-200 mb-6">شكراً لك، تم استلام الدفعة بنجاح</p>
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-blue-200">المبلغ:</span>
                <span className="text-white font-bold">{paymentLink.amount} {paymentLink.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">طريقة الدفع:</span>
                <span className="text-white">{getMethodLabel(selectedMethod)}</span>
              </div>
            </div>
            <p className="text-sm text-blue-300">سيتم إرسال إشعار التأكيد إلى رقم الهاتف المسجل</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
      {/* خلفية تزيينية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-2xl">صفحة الدفع الآمنة</h1>
          <div className="flex items-center justify-center gap-2 text-blue-200">
            <Lock className="w-4 h-4" />
            <p>محمي بتشفير SSL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Info Card */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-2xl">{paymentLink.title}</CardTitle>
                {paymentLink.description && (
                  <CardDescription className="text-blue-200">{paymentLink.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                  <DollarSign className="w-8 h-8 text-green-300" />
                  <div>
                    <p className="text-sm text-green-200">المبلغ المطلوب</p>
                    <p className="text-3xl font-bold text-white">{paymentLink.amount} {paymentLink.currency}</p>
                  </div>
                </div>

                {paymentLink.expiresAt && (
                  <div className="mt-4 flex items-center gap-2 text-blue-200">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">صالح حتى: {new Date(paymentLink.expiresAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">اختر طريقة الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-3">
                  {paymentLink.paymentMethods.map(method => (
                    <div key={method}>
                      <label
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          selectedMethod === method
                            ? "border-blue-400 bg-blue-500/20"
                            : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                        )}
                      >
                        <RadioGroupItem value={method} className="border-white text-white" />
                        <div className="flex items-center gap-3 flex-1">
                          {getMethodIcon(method)}
                          <span className="text-white font-medium">{getMethodLabel(method)}</span>
                        </div>
                      </label>

                      {/* Credit Card Form */}
                      {selectedMethod === method && method === 'credit-card' && (
                        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg space-y-4">
                          <div>
                            <Label className="text-blue-200">رقم البطاقة</Label>
                            <Input
                              value={formData.cardNumber}
                              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                              placeholder="1234 5678 9012 3456"
                              className="border-2 border-white/30 bg-white/10 text-white"
                              maxLength={19}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-blue-200">تاريخ الانتهاء</Label>
                              <Input
                                value={formData.cardExpiry}
                                onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                                placeholder="MM/YY"
                                className="border-2 border-white/30 bg-white/10 text-white"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <Label className="text-blue-200">CVV</Label>
                              <Input
                                value={formData.cardCvv}
                                onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                                placeholder="123"
                                type="password"
                                className="border-2 border-white/30 bg-white/10 text-white"
                                maxLength={3}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-blue-200">الاسم الكامل *</Label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="أدخل اسمك الكامل"
                    dir="rtl"
                    className="border-2 border-white/30 bg-white/10 text-white placeholder:text-white/60"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">رقم الهاتف *</Label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="966xxxxxxxxx"
                    dir="ltr"
                    className="border-2 border-white/30 bg-white/10 text-white placeholder:text-white/60"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="example@email.com"
                    dir="ltr"
                    className="border-2 border-white/30 bg-white/10 text-white placeholder:text-white/60"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl sticky top-6">
              <CardHeader>
                <CardTitle className="text-white">ملخص الدفع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-blue-200">
                    <span>المبلغ الأساسي:</span>
                    <span className="font-bold text-white">{paymentLink.amount} {paymentLink.currency}</span>
                  </div>
                  <div className="flex justify-between text-blue-200">
                    <span>رسوم المعالجة:</span>
                    <span className="font-bold text-white">0.00 {paymentLink.currency}</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 flex justify-between">
                    <span className="text-white font-bold text-lg">الإجمالي:</span>
                    <span className="text-white font-bold text-2xl">{paymentLink.amount} {paymentLink.currency}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing || !selectedMethod}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 text-lg shadow-lg disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5 ml-2" />
                      تأكيد الدفع
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-blue-200 text-sm mt-4">
                  <Shield className="w-4 h-4" />
                  <span>جميع المعاملات مؤمنة ومشفرة</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
