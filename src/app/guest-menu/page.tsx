'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Utensils, QrCode, Link, Copy, ExternalLink, Hotel, UtensilsCrossed, Shirt } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GuestMenuIndexPage() {
  const [guestLoginUrl, setGuestLoginUrl] = React.useState('/guest-login');
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setGuestLoginUrl(`${window.location.origin}/guest-login`);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(guestLoginUrl);
    alert('تم نسخ الرابط!');
  };

  const handleOpenLink = () => {
    window.open(guestLoginUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10 space-y-6">
        {/* العنوان الرئيسي */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl text-center">
          <CardHeader>
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <QrCode className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">المنيو الإلكتروني للنزلاء</CardTitle>
            <p className="text-gray-300">خدمة الطلب الإلكتروني من الغرفة</p>
          </CardHeader>
        </Card>

        {/* الخدمات المتاحة */}
        <div className="grid grid-cols-2 gap-4">
          {/* خدمة الغرف */}
          <Card 
            className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group"
            onClick={() => router.push('/dashboard/coffee-shop')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Hotel className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">خدمة الغرف</h3>
              <p className="text-gray-300 text-sm">طلب الطعام والمشروبات للغرفة</p>
            </CardContent>
          </Card>

          {/* الكافتيريا */}
          <Card 
            className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:border-green-500/50 transition-all duration-300 cursor-pointer group"
            onClick={() => router.push('/dashboard/coffee-shop')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Coffee className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">الكافتيريا</h3>
              <p className="text-gray-300 text-sm">قهوة ومشروبات ساخنة وباردة</p>
            </CardContent>
          </Card>

          {/* المطعم */}
          <Card 
            className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 cursor-pointer group"
            onClick={() => router.push('/dashboard/coffee-shop')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">المطعم</h3>
              <p className="text-gray-300 text-sm">وجبات رئيسية ومأكولات متنوعة</p>
            </CardContent>
          </Card>

          {/* خدمة الغسيل */}
          <Card 
            className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
            onClick={() => router.push('/dashboard/coffee-shop')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Shirt className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">خدمة الغسيل</h3>
              <p className="text-gray-300 text-sm">غسيل وكي الملابس</p>
            </CardContent>
          </Card>
        </div>

        {/* باقي المحتوى */}
        <div className="hidden">
          <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50 transition-colors">
            <CardContent className="p-6 text-center">
              <Coffee className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">كوفي شوب</h3>
              <p className="text-gray-400 text-sm">مشروبات ساخنة وباردة، حلويات ووجبات خفيفة</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:border-orange-500/50 transition-colors">
            <CardContent className="p-6 text-center">
              <Utensils className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">المطعم</h3>
              <p className="text-gray-400 text-sm">وجبات رئيسية، مقبلات، سلطات ومشروبات</p>
            </CardContent>
          </Card>
        </div>

        {/* رابط الدخول */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-white text-center">رابط المنيو</CardTitle>
            <p className="text-gray-300 text-sm text-center">يمكن للنزلاء استخدام هذا الرابط للوصول للمنيو الإلكتروني</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <Link className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">رابط المنيو:</span>
              </div>
              <p className="text-blue-300 text-sm break-all font-mono">{guestLoginUrl}</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                نسخ الرابط
              </Button>
              
              <Button
                onClick={handleOpenLink}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                فتح في تبويب جديد
              </Button>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="text-yellow-300 font-semibold text-sm mb-2">كيفية الاستخدام:</h4>
              <ol className="text-gray-300 text-sm space-y-1">
                <li>1. يدخل النزيل البيانات (الاسم، رقم الهاتف، رقم الغرفة)</li>
                <li>2. يختار نوع الخدمة (كوفي شوب أو مطعم)</li>
                <li>3. يتصفح المنيو ويضيف العناصر للسلة</li>
                <li>4. يرسل الطلب ويصل إشعار للموظفين</li>
                <li>5. يتم تحضير وتوصيل الطلب</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>نظام المنيو الإلكتروني</span>
              <span>متاح 24/7</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}