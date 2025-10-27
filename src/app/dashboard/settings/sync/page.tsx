'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Cloud, HardDrive, RefreshCw, Database, CheckCircle, AlertCircle, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  migrateLocalStorageToFirebase, 
  syncFirebaseToLocalStorage,
  getEmployees,
  getRequests 
} from '@/lib/firebase-data';

export default function SyncSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    localEmployees: 0,
    localRequests: 0,
    firebaseEmployees: 0,
    firebaseRequests: 0,
  });

  // Check current data
  const checkData = async () => {
    try {
      // Check localStorage
      const localEmp = localStorage.getItem('employees');
      const localReq = localStorage.getItem('guest-requests');
      
      const localEmployees = localEmp ? JSON.parse(localEmp).length : 0;
      const localRequests = localReq ? JSON.parse(localReq).length : 0;

      // Check Firebase
      const firebaseEmployees = await getEmployees();
      const firebaseRequests = await getRequests();

      setStats({
        localEmployees,
        localRequests,
        firebaseEmployees: firebaseEmployees.length,
        firebaseRequests: firebaseRequests.length,
      });
    } catch (error) {
      console.error('Error checking data:', error);
    }
  };

  React.useEffect(() => {
    checkData();
  }, []);

  const handleMigrateToFirebase = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const success = await migrateLocalStorageToFirebase();
      if (success) {
        setStatus('success');
        setMessage('تم نقل البيانات إلى Firebase بنجاح! 🎉');
        await checkData();
      } else {
        setStatus('error');
        setMessage('حدث خطأ أثناء نقل البيانات');
      }
    } catch (error) {
      setStatus('error');
      setMessage('فشل الاتصال بـ Firebase. تأكد من إعدادات .env.local');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromFirebase = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const success = await syncFirebaseToLocalStorage();
      if (success) {
        setStatus('success');
        setMessage('تم تحديث البيانات المحلية من Firebase! ✅');
        await checkData();
      } else {
        setStatus('error');
        setMessage('حدث خطأ أثناء المزامنة');
      }
    } catch (error) {
      setStatus('error');
      setMessage('فشل الاتصال بـ Firebase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-purple-200 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              رجوع
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">مزامنة البيانات</h1>
                <p className="text-purple-200 text-sm">المزامنة بين الأجهزة عبر Firebase</p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={checkData}
          variant="outline"
          className="border-purple-400 text-purple-200 hover:bg-purple-500/10"
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث الإحصائيات
        </Button>
      </div>

      {/* Status Message */}
      {status !== 'idle' && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          status === 'success' 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="h-6 w-6 text-green-400" />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-400" />
          )}
          <p className={status === 'success' ? 'text-green-200' : 'text-red-200'}>
            {message}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Local Storage Stats */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-purple-400" />
              التخزين المحلي (localStorage)
            </CardTitle>
            <CardDescription className="text-purple-200">
              البيانات المحفوظة على هذا الجهاز فقط
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-purple-200">الموظفون</span>
              <Badge className="bg-blue-500 text-white">
                {stats.localEmployees} موظف
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-purple-200">الطلبات</span>
              <Badge className="bg-green-500 text-white">
                {stats.localRequests} طلب
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Firebase Stats */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Cloud className="h-5 w-5 text-cyan-400" />
              Firebase (السحابة)
            </CardTitle>
            <CardDescription className="text-purple-200">
              البيانات المتزامنة عبر جميع الأجهزة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-purple-200">الموظفون</span>
              <Badge className="bg-blue-500 text-white">
                {stats.firebaseEmployees} موظف
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-purple-200">الطلبات</span>
              <Badge className="bg-green-500 text-white">
                {stats.firebaseRequests} طلب
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload to Firebase */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Upload className="h-5 w-5" />
              رفع البيانات إلى Firebase
            </CardTitle>
            <CardDescription className="text-white font-medium">
              انقل البيانات المحلية إلى السحابة للمزامنة بين الأجهزة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4 space-y-2 text-sm text-white">
              <p className="font-semibold">📤 سيتم رفع:</p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>جميع الموظفين ({stats.localEmployees})</li>
                <li>جميع الطلبات ({stats.localRequests})</li>
                <li>الإعدادات والصلاحيات</li>
              </ul>
            </div>
            <Button
              onClick={handleMigrateToFirebase}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 ml-2" />
                  رفع إلى Firebase
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Download from Firebase */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Download className="h-5 w-5" />
              تحميل البيانات من Firebase
            </CardTitle>
            <CardDescription className="text-white font-medium">
              حدّث البيانات المحلية من السحابة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4 space-y-2 text-sm text-white">
              <p className="font-semibold">📥 سيتم تحميل:</p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>جميع الموظفين من Firebase ({stats.firebaseEmployees})</li>
                <li>جميع الطلبات من Firebase ({stats.firebaseRequests})</li>
                <li>آخر التحديثات</li>
              </ul>
            </div>
            <Button
              onClick={handleSyncFromFirebase}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 ml-2" />
                  تحميل من Firebase
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="mt-6 bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Database className="h-5 w-5 text-yellow-400" />
            معلومات مهمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-purple-200 text-sm">
          <p>✅ <strong>المزامنة التلقائية:</strong> بعد الإعداد الأولي، ستتم المزامنة تلقائياً</p>
          <p>🔄 <strong>التحديثات الفورية:</strong> أي تغيير يظهر فوراً على جميع الأجهزة</p>
          <p>💾 <strong>نسخ احتياطي:</strong> البيانات محفوظة في السحابة بشكل دائم</p>
          <p>📱 <strong>دعم متعدد الأجهزة:</strong> لابتوب، موبايل، تابلت - كلها متزامنة</p>
          <p>🔒 <strong>الأمان:</strong> بيانات مشفرة ومحمية بقواعد Firebase</p>
        </CardContent>
      </Card>
    </div>
  );
}
