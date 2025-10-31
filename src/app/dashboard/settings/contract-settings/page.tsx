'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileCheck,
  Upload,
  Save,
  Eye
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Image from 'next/image';

interface ContractSettings {
  // بيانات الفندق
  hotelName: string;
  hotelNameEn: string;
  address: string;
  addressEn: string;
  city: string;
  phone: string;
  email: string;
  commercialRegister: string;
  taxNumber: string;
  
  // الشعار
  logoUrl: string;
  stampUrl: string;
  
  // بنود العقد (14 بند)
  terms: string[];
  
  // معلومات إضافية
  checkInTime: string;
  checkOutTime: string;
  securityDeposit: number;
  penaltyAmount: number;
}

const DEFAULT_TERMS = [
  'على المستأجر دفع مبلغ 500 ريال كتأمين مستردج و سيخصم منه في حالة حدوث أى تلفيات فى محتويات الشقة من قبل المستأجر أو مرافقينه.',
  'على المستأجر مراعاة السلوك والآداب الاسلامية داخل الشقة نافذة في الشقة. و عدم السماح بدخول أية أشخاص آخرين من غير المرافقين له مع الالتزام بالهدوء و عدم إزعاج الآخرين درجاً على الراحة العامة.',
  'المستأجر مسؤول عن كامل ممتلكات الشقة و يجب عليه المحافظة عليها، و في حالة تلف شىء من الممتلكات فعليه عليه دفع التعويض المناسب الذي تقرره الإدارة و لا يحق للمستأجر تحويل العند إلى شخص آخر.',
  'التأكد من إغلاق التكييف، و الإضاءة و الأجهزة الكهربائية عند مغادرة العميل للشقةممنعاً لحدوث أخطار -لا سمح الله- و سوف يكون مسؤولاً عنها.',
  'يتم دفع قيمة المكالمة بعد الإنتهاء منها مباشرة على ألا يستعمل هاتف الشقق في أغراض مخالفة للسلوك والأدياب، و إلا سوف يتحمل المسؤولية في حالة مخالفته.',
  'يختلف الإيجار خلال أيام العطل والإجازات الرسمية المواسم عن إيجار الأيام العادية و يتم الاتفاق عليه مع الإدارة.',
  'موعد الخروج في تمام الساعة (12) الثانية عشر ظهراً، و إذا تأخر عن ذلك تحسب عليه أجرة يوم كامل.',
  'يتم دفع قيم الإيجار مقدماً.',
  'في حالة نقيب المستأجر بعد إنتهاء العقد بثلاثة أيام، يحق للإدارة فتح الشقة و التصرف فيها و رفع ممتلكات المستأجر إلى المستودع دوان أدنى مسؤولية على الإدارة و يُعتبَر العقد لاغياً.',
  'الإدارة غير مسؤولة عن فقدان الأشياء الثمينة الخاصة بالمستأجر داخل الشقة.',
  'ليس للمستأجر الحق في إسترداد قيمة الإيجار في حالة المغادرة قبل إنتهاء المدة المتعاقد عليها.',
  'في حالة رغبة المستأجر في تجديد المدة أو إخلاء الشقة عليه إشعار الإدارة بذلك قبل إنتهاء المدة بفترة مناسبة.',
  'يعتبر العقد لاغياً في حالة الإخلال بأحد الشروط المذكورة و للمسؤول الحق في إلغاء العقد دون إبداء الأسباب.',
  'يعطل نظام الكهرباء للشقة اوتوماتيك من النظام عند الساعة 2 ظهراً في حال لم يتم التجديد او الخروج'
];

export default function ContractSettingsPage() {
  const [settings, setSettings] = useState<ContractSettings>({
    hotelName: 'فندق المضيف',
    hotelNameEn: 'Al Modif Hotel',
    address: 'العنوان الجديد - ابها',
    addressEn: 'New Address - Abha',
    city: 'ابها',
    phone: '+966504755400',
    email: 'info@almodif.net',
    commercialRegister: '30092765750003',
    taxNumber: '1090030246',
    logoUrl: '',
    stampUrl: '',
    terms: DEFAULT_TERMS,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    securityDeposit: 500,
    penaltyAmount: 350
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // تحميل الإعدادات من Firebase
  useEffect(() => {
    const loadSettings = async () => {
      if (!db) {
        console.warn('⚠️ Firebase غير متصل');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'settings', 'contract');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({ 
            ...settings, 
            ...data,
            terms: data.terms || DEFAULT_TERMS 
          });
          console.log('✅ تم تحميل إعدادات العقد');
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل الإعدادات:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // حفظ الإعدادات
  const handleSave = async () => {
    if (!db) {
      setMessage({ type: 'error', text: '❌ Firebase غير متصل. لا يمكن حفظ الإعدادات.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const docRef = doc(db, 'settings', 'contract');
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setMessage({ type: 'success', text: '✅ تم حفظ إعدادات العقد بنجاح!' });
      console.log('✅ تم حفظ إعدادات العقد');
    } catch (error) {
      console.error('❌ خطأ في حفظ الإعدادات:', error);
      setMessage({ type: 'error', text: '❌ حدث خطأ أثناء الحفظ. حاول مرة أخرى.' });
    } finally {
      setSaving(false);
    }
  };

  // تحديث بند محدد
  const updateTerm = (index: number, value: string) => {
    const newTerms = [...settings.terms];
    newTerms[index] = value;
    setSettings({ ...settings, terms: newTerms });
  };

  // إضافة بند جديد
  const addTerm = () => {
    setSettings({ ...settings, terms: [...settings.terms, ''] });
  };

  // حذف بند
  const removeTerm = (index: number) => {
    const newTerms = settings.terms.filter((_, i) => i !== index);
    setSettings({ ...settings, terms: newTerms });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          إعدادات العقد
        </h1>
        <p className="text-gray-600 mt-2">
          تخصيص بيانات الفندق وبنود العقد التي تظهر في عقد الإيجار
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </div>
      )}

      {/* بيانات الفندق */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            بيانات المنشأة
          </CardTitle>
          <CardDescription>
            المعلومات الأساسية التي تظهر في رأس العقد
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hotelName">اسم الفندق (عربي)</Label>
              <Input
                id="hotelName"
                value={settings.hotelName}
                onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
                placeholder="فندق المضيف"
              />
            </div>
            <div>
              <Label htmlFor="hotelNameEn">اسم الفندق (إنجليزي)</Label>
              <Input
                id="hotelNameEn"
                value={settings.hotelNameEn}
                onChange={(e) => setSettings({ ...settings, hotelNameEn: e.target.value })}
                placeholder="Al Modif Hotel"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address">العنوان (عربي)</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="العنوان الجديد - ابها"
              />
            </div>
            <div>
              <Label htmlFor="addressEn">العنوان (إنجليزي)</Label>
              <Input
                id="addressEn"
                value={settings.addressEn}
                onChange={(e) => setSettings({ ...settings, addressEn: e.target.value })}
                placeholder="New Address - Abha"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                الهاتف
              </Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+966504755400"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="info@almodif.net"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Input
                id="city"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                placeholder="ابها"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commercialRegister">رقم السجل التجاري</Label>
              <Input
                id="commercialRegister"
                value={settings.commercialRegister}
                onChange={(e) => setSettings({ ...settings, commercialRegister: e.target.value })}
                placeholder="30092765750003"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="taxNumber">الرقم الضريبي</Label>
              <Input
                id="taxNumber"
                value={settings.taxNumber}
                onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                placeholder="1090030246"
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أوقات الدخول والخروج */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>أوقات وبيانات الإيجار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="checkInTime">وقت الدخول</Label>
              <Input
                id="checkInTime"
                type="time"
                value={settings.checkInTime}
                onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="checkOutTime">وقت الخروج</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={settings.checkOutTime}
                onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="securityDeposit">التأمين المستَرد (ر.س)</Label>
              <Input
                id="securityDeposit"
                type="number"
                value={settings.securityDeposit}
                onChange={(e) => setSettings({ ...settings, securityDeposit: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="penaltyAmount">غرامة التأخير (ر.س)</Label>
              <Input
                id="penaltyAmount"
                type="number"
                value={settings.penaltyAmount}
                onChange={(e) => setSettings({ ...settings, penaltyAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بنود العقد */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            الشروط والأحكام
          </CardTitle>
          <CardDescription>
            البنود التي تظهر في عقد الإيجار (يمكنك التعديل عليها)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.terms.map((term, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                {index + 1}
              </div>
              <Textarea
                value={term}
                onChange={(e) => updateTerm(index, e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeTerm(index)}
                className="flex-shrink-0 border-red-500 text-red-600 hover:bg-red-50"
              >
                ×
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addTerm}
            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            + إضافة بند جديد
          </Button>
        </CardContent>
      </Card>

      {/* أزرار الحفظ */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-gray-300"
        >
          إعادة تعيين
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        >
          <Save className="h-4 w-4 ml-2" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
}
