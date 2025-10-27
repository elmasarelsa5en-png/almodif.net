'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, QrCode, Smartphone, CheckCircle, Loader2, RefreshCw, ArrowLeft, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ConnectionStep = 'scanning' | 'connecting' | 'connected' | 'error';

export default function WhatsAppConnectPage() {
  const router = useRouter();
  const [step, setStep] = useState<ConnectionStep>('scanning');
  const [qrCode, setQrCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);

  useEffect(() => {
    // Check connection first
    checkConnectionStatus();
    
    // Generate QR code
    generateQRCode();
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          generateQRCode(); // Regenerate QR
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/status');
      
      if (!response.ok) {
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }
      
      const data = await response.json();
      
      // If already connected, redirect to chat
      if (data.connected) {
        setStep('connected');
        setTimeout(() => {
          router.push('/crm/whatsapp/chat');
        }, 1500);
      }
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  const generateQRCode = async () => {
    try {
      setStep('scanning');
      setError('');
      
      // Call backend API to generate QR code
      const response = await fetch('http://localhost:3002/api/qr');
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error('Backend not available');
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend returned non-JSON response');
      }
      
      const data = await response.json();
      
      if (data.connected) {
        // Already connected
        setStep('connected');
        setTimeout(() => {
          router.push('/crm/whatsapp/chat');
        }, 1500);
      } else if (data.qr) {
        // QR code available
        setQrCode(data.qr);
        setStep('scanning');
      } else if (data.error) {
        // Show error message
        setError(data.error === 'QR not ready yet' 
          ? 'جاري تحضير رمز QR، يرجى الانتظار...' 
          : 'حدث خطأ في الاتصال');
      }
    } catch (err) {
      console.error('QR generation error:', err);
      setError('خادم WhatsApp غير متاح حالياً. يرجى التأكد من تشغيل الخادم.');
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/status');
      
      // Check if response is ok
      if (!response.ok) {
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }
      
      const data = await response.json();
      
      if (data.connected) {
        setStep('connected');
        setTimeout(() => {
          router.push('/crm/whatsapp/chat');
        }, 2000);
      }
    } catch (err) {
      console.error('Connection check error:', err);
      // Silently fail - backend not available
    }
  };

  useEffect(() => {
    if (step === 'scanning' && qrCode) {
      const checkInterval = setInterval(checkConnection, 2000);
      return () => clearInterval(checkInterval);
    }
  }, [step, qrCode]);

  const handleRefresh = () => {
    setCountdown(60);
    generateQRCode();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/crm/whatsapp')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للمنصات
          </Button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                ربط حساب واتساب
              </h1>
              <p className="text-gray-600 text-lg">اتصل بحسابك للبدء في إدارة المحادثات</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <Card className="bg-white border-2 border-gray-100 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center">
                {/* Status Badge */}
                <div className="flex justify-center mb-6">
                  {step === 'scanning' && (
                    <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      جاهز للمسح
                    </div>
                  )}
                  {step === 'connecting' && (
                    <div className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الاتصال...
                    </div>
                  )}
                  {step === 'connected' && (
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      تم الاتصال بنجاح
                    </div>
                  )}
                </div>

                {/* QR Code Display */}
                <div className="mb-6">
                  {error ? (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertDescription className="text-red-700 text-right">
                        {error}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="relative">
                      <div className="w-72 h-72 mx-auto bg-white rounded-3xl shadow-inner p-4 border-4 border-gradient-to-br from-blue-400 to-purple-400">
                        {qrCode ? (
                          <img 
                            src={qrCode} 
                            alt="WhatsApp QR Code" 
                            className="w-full h-full rounded-2xl"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                          </div>
                        )}
                      </div>
                      
                      {/* Countdown Timer */}
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-gray-100">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-gray-600 font-semibold">
                            ينتهي خلال {countdown}ث
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Refresh Button */}
                <Button
                  onClick={handleRefresh}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  disabled={step === 'connecting'}
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث الرمز
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Section */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 border-0 shadow-2xl text-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">كيفية الربط</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">افتح واتساب</h3>
                      <p className="text-white/90 text-sm">افتح تطبيق واتساب على هاتفك</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">اذهب إلى الإعدادات</h3>
                      <p className="text-white/90 text-sm">اضغط على النقاط الثلاث في أعلى اليمين</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">اختر الأجهزة المرتبطة</h3>
                      <p className="text-white/90 text-sm">ثم اضغط على "ربط جهاز"</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">امسح الرمز</h3>
                      <p className="text-white/90 text-sm">وجه كاميرا هاتفك نحو الرمز الموجود على الشاشة</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Cards */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-white border-2 border-gray-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">اتصال سريع</h3>
                      <p className="text-sm text-gray-600">يتم الاتصال خلال ثوانٍ معدودة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">آمن ومشفر</h3>
                      <p className="text-sm text-gray-600">جميع المحادثات محمية بالتشفير من طرف إلى طرف</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">الوصول من أي مكان</h3>
                      <p className="text-sm text-gray-600">تواصل مع عملائك من أي جهاز</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            💡 ملاحظة: تأكد من اتصال هاتفك بالإنترنت وأن تطبيق واتساب محدث لأحدث إصدار
          </p>
        </div>
      </div>
    </div>
  );
}
