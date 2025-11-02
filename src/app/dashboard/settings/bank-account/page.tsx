'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Landmark, 
  ArrowRight, 
  Save, 
  Copy, 
  CheckCircle2,
  Building2,
  CreditCard,
  User,
  Hash,
  Phone,
  MapPin
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BankAccountSettings {
  bankName: string;
  accountNumber: string;
  iban: string;
  beneficiaryName: string;
  swiftCode: string;
  branchName: string;
  branchCode: string;
  phoneNumber: string;
  address: string;
}

export default function BankAccountSettingsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [settings, setSettings] = useState<BankAccountSettings>({
    bankName: '',
    accountNumber: '',
    iban: '',
    beneficiaryName: '',
    swiftCode: '',
    branchName: '',
    branchCode: '',
    phoneNumber: '',
    address: ''
  });

  // تحميل الإعدادات من Firebase
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'bank_account');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(docSnap.data() as BankAccountSettings);
      }
    } catch (error) {
      console.error('Error loading bank account settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'bank_account'), settings);
      alert('✅ تم حفظ بيانات الحساب البنكي بنجاح!');
    } catch (error) {
      console.error('Error saving bank account settings:', error);
      alert('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => {
    const isCopied = copiedField === fieldName;
    
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleCopy(text, fieldName)}
        className={`transition-all ${
          isCopied 
            ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
            : 'hover:bg-blue-50'
        }`}
      >
        {isCopied ? (
          <>
            <CheckCircle2 className="h-4 w-4 ml-1" />
            تم النسخ
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 ml-1" />
            نسخ
          </>
        )}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500">
                  <Landmark className="w-8 h-8" />
                </div>
                إعدادات الحساب البنكي
              </h1>
              <p className="text-white/70 mt-2">
                إدارة بيانات الحساب البنكي للتحويلات المالية
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/settings')}
              className="text-white hover:bg-white/10"
            >
              <ArrowRight className="h-5 w-5 ml-2" />
              رجوع
            </Button>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Building2 className="h-6 w-6 text-amber-400" />
              بيانات البنك
            </CardTitle>
            <CardDescription className="text-white/70">
              املأ بيانات الحساب البنكي الخاص بالفندق. هذه البيانات ستظهر للضيوف عند اختيار التحويل البنكي.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* اسم البنك */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-400" />
                اسم البنك
              </Label>
              <div className="flex gap-2">
                <Input
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  placeholder="مثال: البنك الأهلي السعودي"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                {settings.bankName && (
                  <CopyButton text={settings.bankName} fieldName="bankName" />
                )}
              </div>
            </div>

            {/* رقم الحساب */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Hash className="h-4 w-4 text-amber-400" />
                رقم الحساب
              </Label>
              <div className="flex gap-2">
                <Input
                  value={settings.accountNumber}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                  placeholder="مثال: 123456789"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 font-mono"
                />
                {settings.accountNumber && (
                  <CopyButton text={settings.accountNumber} fieldName="accountNumber" />
                )}
              </div>
            </div>

            {/* رقم الآيبان */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-400" />
                رقم الآيبان (IBAN)
              </Label>
              <div className="flex gap-2">
                <Input
                  value={settings.iban}
                  onChange={(e) => setSettings({ ...settings, iban: e.target.value.toUpperCase() })}
                  placeholder="مثال: SA0380000000608010167519"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 font-mono"
                />
                {settings.iban && (
                  <CopyButton text={settings.iban} fieldName="iban" />
                )}
              </div>
            </div>

            {/* اسم المستفيد */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <User className="h-4 w-4 text-amber-400" />
                اسم المستفيد
              </Label>
              <div className="flex gap-2">
                <Input
                  value={settings.beneficiaryName}
                  onChange={(e) => setSettings({ ...settings, beneficiaryName: e.target.value })}
                  placeholder="مثال: شركة الفنادق السياحية"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                {settings.beneficiaryName && (
                  <CopyButton text={settings.beneficiaryName} fieldName="beneficiaryName" />
                )}
              </div>
            </div>

            {/* كود سويفت */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Hash className="h-4 w-4 text-amber-400" />
                كود السويفت (SWIFT Code)
                <Badge variant="outline" className="text-xs text-white/70 border-white/20">
                  اختياري
                </Badge>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={settings.swiftCode}
                  onChange={(e) => setSettings({ ...settings, swiftCode: e.target.value.toUpperCase() })}
                  placeholder="مثال: NCBKSAJE"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 font-mono"
                />
                {settings.swiftCode && (
                  <CopyButton text={settings.swiftCode} fieldName="swiftCode" />
                )}
              </div>
            </div>

            {/* اسم الفرع */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-400" />
                اسم الفرع
                <Badge variant="outline" className="text-xs text-white/70 border-white/20">
                  اختياري
                </Badge>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={settings.branchName}
                  onChange={(e) => setSettings({ ...settings, branchName: e.target.value })}
                  placeholder="مثال: فرع الرياض الرئيسي"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                {settings.branchName && (
                  <CopyButton text={settings.branchName} fieldName="branchName" />
                )}
              </div>
            </div>

            {/* كود الفرع */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Hash className="h-4 w-4 text-amber-400" />
                كود الفرع
                <Badge variant="outline" className="text-xs text-white/70 border-white/20">
                  اختياري
                </Badge>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={settings.branchCode}
                  onChange={(e) => setSettings({ ...settings, branchCode: e.target.value })}
                  placeholder="مثال: 0380"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 font-mono"
                />
                {settings.branchCode && (
                  <CopyButton text={settings.branchCode} fieldName="branchCode" />
                )}
              </div>
            </div>

            {/* رقم الهاتف */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-400" />
                رقم الهاتف
                <Badge variant="outline" className="text-xs text-white/70 border-white/20">
                  اختياري
                </Badge>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={settings.phoneNumber}
                  onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                  placeholder="مثال: +966 11 2345678"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                {settings.phoneNumber && (
                  <CopyButton text={settings.phoneNumber} fieldName="phoneNumber" />
                )}
              </div>
            </div>

            {/* العنوان */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-400" />
                عنوان البنك
                <Badge variant="outline" className="text-xs text-white/70 border-white/20">
                  اختياري
                </Badge>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="مثال: طريق الملك فهد، الرياض"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                {settings.address && (
                  <CopyButton text={settings.address} fieldName="address" />
                )}
              </div>
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
              >
                <Save className="h-5 w-5 ml-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/settings')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* معاينة البيانات */}
        {(settings.accountNumber || settings.iban || settings.beneficiaryName) && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                معاينة البيانات
              </CardTitle>
              <CardDescription className="text-white/70">
                هذه هي البيانات التي ستظهر للضيوف عند اختيار التحويل البنكي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-white/5 rounded-lg p-4 space-y-3 border border-white/10">
                {settings.bankName && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">اسم البنك:</span>
                    <span className="text-white font-semibold">{settings.bankName}</span>
                  </div>
                )}
                {settings.accountNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">رقم الحساب:</span>
                    <span className="text-white font-mono font-semibold">{settings.accountNumber}</span>
                  </div>
                )}
                {settings.iban && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">الآيبان:</span>
                    <span className="text-white font-mono text-sm font-semibold">{settings.iban}</span>
                  </div>
                )}
                {settings.beneficiaryName && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">اسم المستفيد:</span>
                    <span className="text-white font-semibold">{settings.beneficiaryName}</span>
                  </div>
                )}
                {settings.swiftCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">كود سويفت:</span>
                    <span className="text-white font-mono font-semibold">{settings.swiftCode}</span>
                  </div>
                )}
                {settings.branchName && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">الفرع:</span>
                    <span className="text-white font-semibold">{settings.branchName}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* تعليمات */}
        <Card className="bg-blue-500/10 backdrop-blur-md border-blue-500/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Landmark className="h-5 w-5 text-blue-400" />
              ملاحظات هامة
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-2 text-sm">
            <p>• البيانات الإلزامية: اسم البنك، رقم الحساب أو IBAN، واسم المستفيد</p>
            <p>• سيظهر زر "نسخ" بجانب كل حقل ممتلئ لتسهيل عملية النسخ</p>
            <p>• يمكن للضيوف نسخ البيانات مباشرة من صفحة الدفع</p>
            <p>• تأكد من صحة البيانات قبل الحفظ</p>
            <p>• يتم حفظ الإعدادات في Firebase وستظهر فوراً في صفحة الحجز</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
