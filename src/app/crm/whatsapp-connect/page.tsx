'use client';

import { useState, useEffect } from 'react';
import { QrCode, Check, Loader2, Smartphone, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';

type ConnectionStatus = 'disconnected' | 'qr-ready' | 'connecting' | 'connected';

const WHATSAPP_SERVICE_URL = process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_URL || 'http://localhost:3001';

export default function WhatsAppConnectPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // الاتصال بـ Socket.IO للتحديثات الفورية
    const newSocket = io(WHATSAPP_SERVICE_URL);
    setSocket(newSocket);

    newSocket.on('status', (data: any) => {
      if (data.connected) {
        setStatus('connected');
        setPhoneNumber(data.phoneNumber);
        setQrCode(null);
      } else if (data.qr) {
        setStatus('qr-ready');
        setQrCode(data.qr);
      }
    });

    newSocket.on('qr', (data: any) => {
      setStatus('qr-ready');
      setQrCode(data.qr);
    });

    newSocket.on('authenticated', () => {
      setStatus('connecting');
      setQrCode(null);
    });

    newSocket.on('ready', (data: any) => {
      setStatus('connected');
      setPhoneNumber(data.phoneNumber);
      // الانتقال لصفحة المحادثات بعد 2 ثانية
      setTimeout(() => {
        router.push('/crm/whatsapp?fullscreen=true');
      }, 2000);
    });

    newSocket.on('disconnected', () => {
      setStatus('disconnected');
      setPhoneNumber('');
      setQrCode(null);
    });

    // التحقق من الحالة الحالية
    checkStatus();

    return () => {
      newSocket.close();
    };
  }, [router]);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/status`);
      const data = await response.json();
      
      if (data.connected) {
        setStatus('connected');
        setPhoneNumber(data.phoneNumber);
      } else if (data.needsQR) {
        setStatus('qr-ready');
        fetchQR();
      }
    } catch (err) {
      console.error('Error checking status:', err);
      setError('تعذر الاتصال بخدمة الواتساب. تأكد من تشغيل السيرفر.');
    }
  };

  const fetchQR = async () => {
    try {
      const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/qr`);
      const data = await response.json();
      
      if (data.qr) {
        setQrCode(data.qr);
      }
    } catch (err) {
      console.error('Error fetching QR:', err);
    }
  };

  const initiateConnection = async () => {
    setStatus('qr-ready');
    setError(null);
    
    // سيتم توليد QR Code تلقائياً من السيرفر
    setTimeout(() => {
      fetchQR();
    }, 1000);
  };

  const disconnect = async () => {
    try {
      const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/disconnect`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setStatus('disconnected');
        setQrCode(null);
        setPhoneNumber('');
      }
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
