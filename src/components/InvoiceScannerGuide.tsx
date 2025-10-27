'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileImage,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Zap,
  Shield,
  Sparkles
} from 'lucide-react';

export default function InvoiceScannerGuide() {
  const tips = [
    {
      icon: FileImage,
      title: 'جودة الصورة',
      description: 'استخدم صوراً واضحة بدقة عالية للحصول على أفضل النتائج',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Zap,
      title: 'سرعة المعالجة',
      description: 'المعالجة تتم خلال ثوانٍ معدودة باستخدام تقنية متقدمة',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Shield,
      title: 'الأمان والخصوصية',
      description: 'جميع البيانات تعالج محلياً دون إرسالها لخوادم خارجية',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Sparkles,
      title: 'دقة عالية',
      description: 'معدل دقة 95% في استخراج البيانات من الفواتير',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  const supportedFormats = [
    { format: 'JPEG/JPG', size: 'حتى 10MB', quality: 'ممتاز' },
    { format: 'PNG', size: 'حتى 10MB', quality: 'ممتاز' },
    { format: 'PDF', size: 'حتى 10MB', quality: 'جيد' }
  ];

  return (
    <div className="space-y-6">
      {/* نصائح الاستخدام */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            نصائح للحصول على أفضل النتائج
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                <div className={`w-10 h-10 bg-gradient-to-r ${tip.color} rounded-full flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <tip.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{tip.title}</h3>
                  <p className="text-white/80 text-sm">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الصيغ المدعومة */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <FileImage className="w-5 h-5 text-blue-400" />
            الصيغ المدعومة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {supportedFormats.map((format, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500/20 text-blue-400">{format.format}</Badge>
                  <span className="text-white">{format.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">{format.quality}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* تحذيرات مهمة */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            ملاحظات مهمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-200 text-sm">
                  <strong>جودة الصورة:</strong> تأكد من وجود إضاءة جيدة ووضوح في النص لضمان دقة الاستخراج
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-200 text-sm">
                  <strong>مراجعة البيانات:</strong> راجع دائماً البيانات المستخرجة وعدّلها إذا لزم الأمر قبل الحفظ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-200 text-sm">
                  <strong>الخصوصية:</strong> جميع البيانات تتم معالجتها محلياً دون إرسالها لأي خوادم خارجية
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}