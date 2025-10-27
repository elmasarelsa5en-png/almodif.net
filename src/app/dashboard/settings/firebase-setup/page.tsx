'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Copy, 
  ExternalLink,
  AlertCircle,
  Loader2,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const steps = [
  {
    id: 1,
    title: 'إنشاء مشروع Firebase',
    description: 'إنشاء مشروع جديد في Firebase Console'
  },
  {
    id: 2,
    title: 'تفعيل Firestore Database',
    description: 'تفعيل قاعدة البيانات السحابية'
  },
  {
    id: 3,
    title: 'الحصول على المفاتيح',
    description: 'نسخ إعدادات Firebase'
  },
  {
    id: 4,
    title: 'إعداد المشروع',
    description: 'وضع المفاتيح في .env.local'
  },
  {
    id: 5,
    title: 'اختبار الاتصال',
    description: 'التأكد من عمل Firebase بشكل صحيح'
  }
];

export default function FirebaseSetupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < 5) {
      setCurrentStep(stepId + 1);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Test if Firebase is configured
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      
      // Try to access Firestore
      await getDocs(collection(db, 'employees'));
      
      setConnectionStatus('success');
      completeStep(5);
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const generateEnvContent = () => {
    return `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${firebaseConfig.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${firebaseConfig.appId}`;
  };

  const isStepComplete = (stepId: number) => completedSteps.includes(stepId);
  const allStepsComplete = completedSteps.length === 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-purple-200 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          رجوع
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">معالج إعداد Firebase</h1>
          <p className="text-purple-200 text-sm">إعداد احترافي خطوة بخطوة</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-purple-200">
            الخطوة {currentStep} من {steps.length}
          </span>
          <span className="text-sm text-purple-200">
            {completedSteps.length} / {steps.length} مكتملة
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`w-full text-right p-4 rounded-lg border transition-all ${
                currentStep === step.id
                  ? 'bg-purple-500/20 border-purple-400'
                  : isStepComplete(step.id)
                  ? 'bg-green-500/10 border-green-400/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                {isStepComplete(step.id) ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    currentStep === step.id ? 'text-purple-400' : 'text-gray-500'
                  }`} />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    currentStep === step.id ? 'text-white' : 'text-purple-200'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-purple-300 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">
                    {steps[currentStep - 1].title}
                  </CardTitle>
                  <CardDescription className="text-purple-200 text-base mt-2">
                    {steps[currentStep - 1].description}
                  </CardDescription>
                </div>
                {isStepComplete(currentStep) && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCheck className="h-4 w-4 ml-1" />
                    مكتملة
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Create Firebase Project */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                      افتح Firebase Console
                    </h3>
                    <Button
                      onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <ExternalLink className="h-4 w-4 ml-2" />
                      فتح Firebase Console
                    </Button>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4 space-y-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      اتبع هذه الخطوات:
                    </h3>
                    <ol className="text-purple-100 space-y-2 mr-8 list-decimal">
                      <li>سجّل دخول بحساب Google الخاص بك</li>
                      <li>اضغط على <strong>"Add project"</strong> أو <strong>"إضافة مشروع"</strong></li>
                      <li>أدخل اسم المشروع: <code className="bg-black/30 px-2 py-1 rounded">almodif-hotel</code></li>
                      <li>(اختياري) فعّل Google Analytics</li>
                      <li>اضغط <strong>"Create project"</strong></li>
                      <li>انتظر حتى يكتمل الإنشاء</li>
                    </ol>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => completeStep(1)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      أكملت هذه الخطوة
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Enable Firestore */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 space-y-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                      من القائمة الجانبية
                    </h3>
                    <ul className="text-green-100 space-y-2 mr-8 list-disc">
                      <li>اضغط على <strong>"Build"</strong> أو <strong>"إنشاء"</strong></li>
                      <li>ثم اختر <strong>"Firestore Database"</strong></li>
                    </ul>
                  </div>

                  <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4 space-y-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      إنشاء قاعدة البيانات
                    </h3>
                    <ol className="text-cyan-100 space-y-2 mr-8 list-decimal">
                      <li>اضغط <strong>"Create database"</strong></li>
                      <li>اختر <strong>"Start in test mode"</strong> (للتجربة)</li>
                      <li>اختر الموقع: <code className="bg-black/30 px-2 py-1 rounded">europe-west</code> (الأقرب)</li>
                      <li>اضغط <strong>"Enable"</strong></li>
                      <li>انتظر التفعيل (قد يستغرق دقيقة)</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-yellow-100 text-sm">
                      <strong>ملاحظة:</strong> وضع الاختبار يسمح لأي شخص بالقراءة/الكتابة. 
                      سنقوم بتأمين القواعد لاحقاً.
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => completeStep(2)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      أكملت التفعيل
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Get Firebase Keys */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-4 space-y-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                      الوصول لإعدادات المشروع
                    </h3>
                    <ol className="text-orange-100 space-y-2 mr-8 list-decimal">
                      <li>اضغط على أيقونة ⚙️ (الترس) في القائمة</li>
                      <li>اختر <strong>"Project settings"</strong></li>
                      <li>انزل للأسفل حتى قسم <strong>"Your apps"</strong></li>
                    </ol>
                  </div>

                  <div className="bg-pink-500/10 border border-pink-400/30 rounded-lg p-4 space-y-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      إضافة تطبيق ويب
                    </h3>
                    <ol className="text-pink-100 space-y-2 mr-8 list-decimal">
                      <li>اضغط على أيقونة <code className="bg-black/30 px-2 py-1 rounded">&lt;/&gt;</code> (Web)</li>
                      <li>أدخل اسم التطبيق: <code className="bg-black/30 px-2 py-1 rounded">Almodif CRM Web</code></li>
                      <li><strong>لا تفعّل</strong> Firebase Hosting</li>
                      <li>اضغط <strong>"Register app"</strong></li>
                    </ol>
                  </div>

                  <div className="bg-indigo-500/10 border border-indigo-400/30 rounded-lg p-4 space-y-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                      نسخ الإعدادات
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      ستظهر لك صفحة بها كود JavaScript. انسخ القيم التالية:
                    </p>
                    <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-green-300 overflow-x-auto">
                      <pre>{`const firebaseConfig = {
  apiKey: "AIzaSyC_xxxxxxxxxxxxx",
  authDomain: "almodif-hotel.firebaseapp.com",
  projectId: "almodif-hotel",
  storageBucket: "almodif-hotel.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123"
};`}</pre>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => completeStep(3)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      نسخت المفاتيح
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Configure Project */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">أدخل مفاتيح Firebase</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-purple-200">API Key</Label>
                        <Input
                          value={firebaseConfig.apiKey}
                          onChange={(e) => setFirebaseConfig({...firebaseConfig, apiKey: e.target.value})}
                          placeholder="AIzaSyC_xxxxxxxxxxxxx"
                          className="bg-black/30 border-purple-400/30 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">Auth Domain</Label>
                        <Input
                          value={firebaseConfig.authDomain}
                          onChange={(e) => setFirebaseConfig({...firebaseConfig, authDomain: e.target.value})}
                          placeholder="your-project.firebaseapp.com"
                          className="bg-black/30 border-purple-400/30 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">Project ID</Label>
                        <Input
                          value={firebaseConfig.projectId}
                          onChange={(e) => setFirebaseConfig({...firebaseConfig, projectId: e.target.value})}
                          placeholder="your-project-id"
                          className="bg-black/30 border-purple-400/30 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">Storage Bucket</Label>
                        <Input
                          value={firebaseConfig.storageBucket}
                          onChange={(e) => setFirebaseConfig({...firebaseConfig, storageBucket: e.target.value})}
                          placeholder="your-project.appspot.com"
                          className="bg-black/30 border-purple-400/30 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">Messaging Sender ID</Label>
                        <Input
                          value={firebaseConfig.messagingSenderId}
                          onChange={(e) => setFirebaseConfig({...firebaseConfig, messagingSenderId: e.target.value})}
                          placeholder="123456789"
                          className="bg-black/30 border-purple-400/30 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">App ID</Label>
                        <Input
                          value={firebaseConfig.appId}
                          onChange={(e) => setFirebaseConfig({...firebaseConfig, appId: e.target.value})}
                          placeholder="1:123456789:web:abcdef123"
                          className="bg-black/30 border-purple-400/30 text-white mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold">محتوى ملف .env.local</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(generateEnvContent(), 'env')}
                        className="border-green-400/30 text-green-300 hover:bg-green-500/10"
                      >
                        {copiedField === 'env' ? (
                          <>
                            <CheckCheck className="h-4 w-4 ml-1" />
                            تم النسخ!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 ml-1" />
                            نسخ الكود
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-green-300 overflow-x-auto">
                      <pre>{generateEnvContent()}</pre>
                    </div>
                    <p className="text-green-200 text-sm mt-3">
                      📝 انسخ هذا الكود وضعه في ملف <code className="bg-black/30 px-2 py-1 rounded">d:\almodifcrm\.env.local</code>
                    </p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-yellow-100 text-sm space-y-2">
                      <p><strong>خطوات مهمة:</strong></p>
                      <ol className="list-decimal mr-4 space-y-1">
                        <li>افتح ملف <code className="bg-black/30 px-1 rounded">d:\almodifcrm\.env.local</code></li>
                        <li>الصق المحتوى في نهاية الملف</li>
                        <li>احفظ الملف (Ctrl+S)</li>
                        <li>أعد تشغيل السيرفر</li>
                      </ol>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => completeStep(4)}
                      disabled={!firebaseConfig.apiKey || !firebaseConfig.projectId}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      حفظت الإعدادات
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Test Connection */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">اختبار الاتصال بـ Firebase</h3>
                    <p className="text-blue-100 text-sm mb-4">
                      تأكد من إعادة تشغيل السيرفر قبل الاختبار
                    </p>
                    <Button
                      onClick={testConnection}
                      disabled={isTestingConnection}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isTestingConnection ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جاري الاختبار...
                        </>
                      ) : (
                        <>
                          اختبار الاتصال
                        </>
                      )}
                    </Button>
                  </div>

                  {connectionStatus === 'success' && (
                    <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
                      <div>
                        <h4 className="text-white font-semibold">نجح الاتصال! 🎉</h4>
                        <p className="text-green-200 text-sm mt-1">
                          Firebase متصل بنجاح. يمكنك الآن استخدام نظام المزامنة.
                        </p>
                        <Button
                          onClick={() => router.push('/dashboard/settings/sync')}
                          className="mt-3 bg-green-500 hover:bg-green-600 text-white"
                        >
                          الذهاب لصفحة المزامنة
                        </Button>
                      </div>
                    </div>
                  )}

                  {connectionStatus === 'error' && (
                    <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                        <div>
                          <h4 className="text-white font-semibold">فشل الاتصال</h4>
                          <p className="text-red-200 text-sm mt-1">
                            تأكد من الخطوات التالية:
                          </p>
                        </div>
                      </div>
                      <ul className="text-red-100 text-sm space-y-2 mr-8 list-disc">
                        <li>المفاتيح في <code className="bg-black/30 px-2 py-1 rounded">.env.local</code> صحيحة</li>
                        <li>أعدت تشغيل السيرفر (Ctrl+C ثم npm run dev)</li>
                        <li>Firestore Database مفعّل في Firebase Console</li>
                        <li>قواعد Firestore تسمح بالقراءة/الكتابة</li>
                      </ul>
                    </div>
                  )}

                  {allStepsComplete && (
                    <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30">
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <div className="bg-green-500 rounded-full p-4">
                              <CheckCircle2 className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-white">
                            تهانينا! 🎉
                          </h3>
                          <p className="text-green-100">
                            تم إعداد Firebase بنجاح. الآن يمكنك البدء في المزامنة عبر الأجهزة!
                          </p>
                          <div className="flex gap-3 justify-center">
                            <Button
                              onClick={() => router.push('/dashboard/settings/sync')}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                            >
                              مزامنة البيانات الآن
                            </Button>
                            <Button
                              onClick={() => router.push('/dashboard/settings')}
                              variant="outline"
                              className="border-green-400/30 text-green-300 hover:bg-green-500/10"
                            >
                              الرجوع للإعدادات
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
