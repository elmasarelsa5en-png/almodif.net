'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Smartphone, QrCode, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import io, { Socket } from 'socket.io-client';

const WHATSAPP_SERVICE_URL = process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_URL || 'http://localhost:3001';

type ConnectionStatus = 'disconnected' | 'qr-ready' | 'connecting' | 'connected';

export default function CRMPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [qrCode, setQrCode] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(WHATSAPP_SERVICE_URL);
    setSocket(newSocket);

    // Listen for connection status
    newSocket.on('status', (data: { status: string }) => {
      console.log('WhatsApp Status:', data.status);
      
      if (data.status === 'ready') {
        setStatus('connected');
        // Redirect to WhatsApp chat page after successful connection
        setTimeout(() => {
          router.push('/crm/whatsapp');
        }, 2000);
      } else if (data.status === 'qr') {
        setStatus('qr-ready');
      } else if (data.status === 'authenticated') {
        setStatus('connecting');
      } else if (data.status === 'disconnected') {
        setStatus('disconnected');
      }
    });

    // Listen for QR code
    newSocket.on('qr', (data: { qr: string }) => {
      console.log('QR Code received');
      setQrCode(data.qr);
      setStatus('qr-ready');
      setError('');
    });

    // Listen for authenticated event
    newSocket.on('authenticated', () => {
      console.log('WhatsApp Authenticated');
      setStatus('connecting');
    });

    // Listen for ready event
    newSocket.on('ready', () => {
      console.log('WhatsApp Ready');
      setStatus('connected');
      setTimeout(() => {
        router.push('/crm/whatsapp');
      }, 2000);
    });

    // Listen for disconnected event
    newSocket.on('disconnected', () => {
      console.log('WhatsApp Disconnected');
      setStatus('disconnected');
      setQrCode('');
      setError('تم قطع الاتصال. يرجى المحاولة مرة أخرى.');
    });

    // Request initial status
    fetch(`${WHATSAPP_SERVICE_URL}/api/status`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ready') {
          setStatus('connected');
          setTimeout(() => {
            router.push('/crm/whatsapp');
          }, 1000);
        }
      })
      .catch(err => {
        console.error('Failed to check WhatsApp status:', err);
        setError('فشل الاتصال بخدمة الواتساب. تأكد من تشغيل الخادم.');
      });

    return () => {
      newSocket.close();
    };
  }, [router]);

  const handleDisconnect = async () => {
    try {
      await fetch(`${WHATSAPP_SERVICE_URL}/api/disconnect`, {
        method: 'POST',
      });
      setStatus('disconnected');
      setQrCode('');
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardContent className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              WhatsApp
            </h1>
            <p className="text-gray-600">
              لاستخدام واتساب على حاسوبك:
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Status Messages */}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {status === 'connected' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 font-semibold">
                  تم الاتصال بنجاح! جاري التحويل إلى المحادثات...
                </AlertDescription>
              </Alert>
            )}

            {status === 'connecting' && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <AlertDescription className="text-blue-800">
                  جاري تسجيل الدخول...
                </AlertDescription>
              </Alert>
            )}

            {/* QR Code Section */}
            {status === 'qr-ready' && qrCode && (
              <div className="space-y-4">
                {/* QR Code Display */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 flex items-center justify-center">
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64 md:w-80 md:h-80"
                  />
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
                    خطوات تسجيل الدخول
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                        1
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-700">
                          افتح <span className="font-semibold text-green-600">واتساب</span> على هاتفك
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                        2
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-700">
                          اضغط على <span className="font-semibold">القائمة</span> 
                          <span className="mx-1">⋮</span> على جهاز 
                          <span className="font-semibold"> Android</span>، اضغط على 
                          <span className="font-semibold"> الإعدادات</span> 
                          <span className="mx-1">⚙️</span> على جهاز 
                          <span className="font-semibold"> iPhone</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                        3
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-700">
                          اضغط على <span className="font-semibold">الأجهزة المرتبطة</span>، ثم على 
                          <span className="font-semibold"> ربط جهاز</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                        4
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-700">
                          امسح رمز <span className="font-semibold">QR</span> ضوئيًا للتأكيد
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-center space-y-2 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    الاستمرار في تسجيل الدخول على هذا المتصفح؟
                  </p>
                  <p className="text-xs text-gray-500">
                    رسائلك الشخصية منشورة تمامًا بين الطرفين
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                    <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                    <span>الشروط وسياسة الخصوصية</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {status === 'disconnected' && !qrCode && !error && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">جاري تحميل رمز QR...</p>
                <p className="text-sm text-gray-500 mt-2">يرجى الانتظار لحظات</p>
              </div>
            )}

            {/* Disconnect Button (if connected) */}
            {status === 'connected' && (
              <div className="text-center pt-4">
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  قطع الاتصال
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2025 WhatsApp Integration - Almodif Hotel Management System
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
