'use client';

import { useState, useEffect } from 'react';
import { QrCode, Check, Loader2, Smartphone, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

type ConnectionStatus = 'disconnected' | 'qr-ready' | 'connecting' | 'connected';

export default function WhatsAppConnectPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  // محاكاة QR Code (سيتم استبداله بـ API حقيقي)
  const generateDummyQR = () => {
    // QR Code مؤقت - سيتم استبداله بـ WhatsApp Web QR حقيقي
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiMzMzMiPldoYXRzQXBwIFFSIENvZGU8L3RleHQ+Cjwvc3ZnPg==';
  };

  const initiateConnection = async () => {
    setStatus('qr-ready');
    setError(null);
    
    try {
      // TODO: استدعاء API للحصول على QR Code حقيقي
      // const response = await fetch('/api/whatsapp?action=qr');
      // const data = await response.json();
      
      // مؤقتاً: QR Code تجريبي
      setTimeout(() => {
        setQrCode(generateDummyQR());
      }, 500);

      // محاكاة عملية المسح والربط
      setTimeout(() => {
        setStatus('connecting');
      }, 3000);

      setTimeout(() => {
        setStatus('connected');
        setPhoneNumber('+966 50 123 4567');
        // بعد الاتصال، الانتقال لصفحة المحادثات
        setTimeout(() => {
          router.push('/crm/whatsapp?fullscreen=true');
        }, 2000);
      }, 5000);

    } catch (err) {
      setError('فشل الاتصال بالواتساب. يرجى المحاولة مرة أخرى.');
      setStatus('disconnected');
    }
  };

  const disconnect = async () => {
    try {
      // TODO: استدعاء API لقطع الاتصال
      setStatus('disconnected');
      setQrCode(null);
      setPhoneNumber('');
    } catch (err) {
      setError('فشل قطع الاتصال.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-green-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur shadow-2xl">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">
            ربط WhatsApp Business
          </CardTitle>
          <CardDescription className="text-lg">
            قم بمسح رمز QR لربط حسابك على واتساب
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          {/* حالة الاتصال */}
          <div className="mb-6">
            {status === 'disconnected' && (
              <Alert className="bg-gray-50 border-gray-200">
                <AlertCircle className="h-5 w-5 text-gray-500" />
                <AlertDescription className="text-gray-700">
                  لم يتم الربط بعد. اضغط على الزر أدناه لبدء الربط.
                </AlertDescription>
              </Alert>
            )}

            {status === 'qr-ready' && (
              <Alert className="bg-blue-50 border-blue-200">
                <QrCode className="h-5 w-5 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  امسح رمز QR باستخدام تطبيق واتساب على هاتفك.
                </AlertDescription>
              </Alert>
            )}

            {status === 'connecting' && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                <AlertDescription className="text-yellow-700">
                  جارٍ الربط... يرجى الانتظار.
                </AlertDescription>
              </Alert>
            )}

            {status === 'connected' && (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-5 w-5 text-green-500" />
                <AlertDescription className="text-green-700">
                  تم الربط بنجاح! {phoneNumber}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-red-50 border-red-200 mt-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* QR Code */}
          {(status === 'qr-ready' || status === 'connecting') && qrCode && (
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-green-500">
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64"
                  />
                </div>
                {status === 'connecting' && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  كيفية المسح:
                </h3>
                <ol className="text-right text-gray-600 space-y-2 max-w-md">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-green-600">1.</span>
                    <span>افتح تطبيق واتساب على هاتفك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-green-600">2.</span>
                    <span>اضغط على القائمة (⋮) ثم "الأجهزة المرتبطة"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-green-600">3.</span>
                    <span>اضغط على "ربط جهاز"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-green-600">4.</span>
                    <span>وجّه كاميرا هاتفك نحو هذا الرمز</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Success Animation */}
          {status === 'connected' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <Check className="w-16 h-16 text-white" strokeWidth={3} />
              </div>
              <p className="text-2xl font-bold text-green-600">
                تم الربط بنجاح! 🎉
              </p>
              <p className="text-gray-600">
                جارٍ تحميل المحادثات...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            {status === 'disconnected' && (
              <Button
                onClick={initiateConnection}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              >
                <QrCode className="w-5 h-5 mr-2" />
                بدء الربط مع واتساب
              </Button>
            )}

            {status === 'qr-ready' && (
              <Button
                onClick={initiateConnection}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                تحديث الرمز
              </Button>
            )}

            {status === 'connected' && (
              <>
                <Button
                  onClick={() => router.push('/crm/whatsapp?fullscreen=true')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  فتح المحادثات
                </Button>
                <Button
                  onClick={disconnect}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  قطع الاتصال
                </Button>
              </>
            )}
          </div>

          {/* Important Notes */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              ملاحظات هامة:
            </h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>تأكد من اتصال هاتفك بالإنترنت</li>
              <li>سيتم عرض جميع محادثاتك الحالية</li>
              <li>لن تتمكن من إرسال رسائل إلا للعملاء الذين راسلوك أولاً</li>
              <li>يمكنك قطع الاتصال في أي وقت</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
