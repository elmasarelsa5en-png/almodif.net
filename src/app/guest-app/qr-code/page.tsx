'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, Share2, QrCode as QrCodeIcon, ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import QRCode from 'react-qr-code';

export default function QRCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const url = searchParams.get('url') || (typeof window !== 'undefined' ? window.location.origin + '/guest-app' : '');

  const handleDownload = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = 300;
        canvas.height = 300;
        
        img.onload = () => {
          ctx?.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = 'hotel-guest-app-qr.png';
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && qrRef.current) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>رمز QR - تطبيق النزلاء</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 40px;
              text-align: center;
            }
            .qr-container {
              border: 4px solid #4f46e5;
              padding: 30px;
              border-radius: 20px;
              margin: 20px 0;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            h1 {
              color: #1e293b;
              font-size: 32px;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #64748b;
              font-size: 18px;
              margin-bottom: 30px;
            }
            .url {
              color: #4f46e5;
              font-size: 14px;
              margin-top: 20px;
              font-weight: bold;
            }
            .instructions {
              margin-top: 30px;
              padding: 20px;
              background: #f1f5f9;
              border-radius: 10px;
              max-width: 600px;
            }
            .instructions h2 {
              color: #334155;
              font-size: 20px;
              margin-bottom: 15px;
            }
            .instructions ol {
              text-align: right;
              color: #475569;
              line-height: 2;
            }
          </style>
        </head>
        <body>
          <h1>🏨 تطبيق النزلاء</h1>
          <p class="subtitle">امسح الكود للوصول لجميع خدمات الفندق</p>
          <div class="qr-container">
            ${qrRef.current.innerHTML}
          </div>
          <p class="url">${url}</p>
          <div class="instructions">
            <h2>📱 كيفية الاستخدام:</h2>
            <ol>
              <li>افتح تطبيق الكاميرا على هاتفك</li>
              <li>وجه الكاميرا نحو الكود</li>
              <li>اضغط على الرابط الذي سيظهر</li>
              <li>استمتع بجميع خدمات الفندق!</li>
            </ol>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تطبيق النزلاء',
          text: 'استمتع بجميع خدمات الفندق من خلال تطبيقنا',
          url: url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: نسخ الرابط
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <QrCodeIcon className="w-8 h-8" />
              رمز QR للتطبيق
            </h1>
            <p className="text-blue-200">شارك هذا الرمز مع نزلائك</p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* QR Code Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-8">
                  <div className="bg-white rounded-2xl p-6 flex items-center justify-center mb-6">
                    <div ref={qrRef} className="flex items-center justify-center">
                      <QRCode 
                        value={url}
                        size={256}
                        level="H"
                        bgColor="#ffffff"
                        fgColor="#4f46e5"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleDownload}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      تحميل الصورة
                    </Button>

                    <Button
                      onClick={handlePrint}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Printer className="w-5 h-5 mr-2" />
                      طباعة
                    </Button>

                    <Button
                      onClick={handleShare}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      مشاركة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    📱 كيفية الاستخدام
                  </h3>
                  <ol className="space-y-3 text-blue-200">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                      <span>افتح تطبيق الكاميرا على هاتفك</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                      <span>وجه الكاميرا نحو رمز QR</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                      <span>اضغط على الإشعار الذي سيظهر</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">4</span>
                      <span>استمتع بجميع خدمات الفندق!</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    🔗 رابط التطبيق
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={url}
                      readOnly
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-blue-200 text-sm"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className={`${copied ? 'bg-green-600' : 'bg-blue-600'} hover:bg-blue-700 text-white`}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-green-400 text-sm mt-2">تم النسخ بنجاح!</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border-amber-500/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-amber-200 mb-3">
                    💡 نصائح للاستخدام الأمثل
                  </h3>
                  <ul className="space-y-2 text-amber-100/90 text-sm">
                    <li>• اطبع الكود وضعه في كل غرفة</li>
                    <li>• ضع نسخة في الاستقبال</li>
                    <li>• أرسل الرابط عبر الواتساب للنزلاء</li>
                    <li>• أضف الكود في بطاقات الترحيب</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
