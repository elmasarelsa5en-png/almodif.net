'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Building2, FileText, Key, Save, CheckCircle2,
  AlertTriangle, Copy, Eye, EyeOff, Loader2, ExternalLink,
  Award, Landmark, Receipt, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LegalComplianceSettings {
  // معلومات المنشأة
  hotelNameAr: string;
  hotelNameEn: string;
  commercialRegistration: string;
  
  // الرخص والتراخيص
  tourismLicense: string;
  tourismLicenseExpiry: string;
  municipalityLicense: string;
  
  // الضرائب
  vatNumber: string;
  vatRegistrationDate: string;
  
  // شموس
  shumusRegistrationNumber: string;
  shumusApiKey: string;
  shumusApiSecret: string;
  shumusEnvironment: 'sandbox' | 'production';
  
  // ZATCA (الزكاة والضريبة)
  zatcaApiKey: string;
  zatcaApiSecret: string;
  zatcaCsid: string; // Cryptographic Stamp Identifier
  zatcaEnvironment: 'sandbox' | 'production';
  
  // معلومات التواصل
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  postalCode: string;
  
  // حالة التفعيل
  shumusEnabled: boolean;
  zatcaEnabled: boolean;
  autoReporting: boolean;
  
  updatedAt?: string;
}

export default function LegalCompliancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [showShumusSecret, setShowShumusSecret] = useState(false);
  const [showZatcaSecret, setShowZatcaSecret] = useState(false);
  
  const [settings, setSettings] = useState<LegalComplianceSettings>({
    hotelNameAr: '',
    hotelNameEn: '',
    commercialRegistration: '',
    tourismLicense: '',
    tourismLicenseExpiry: '',
    municipalityLicense: '',
    vatNumber: '',
    vatRegistrationDate: '',
    shumusRegistrationNumber: '',
    shumusApiKey: '',
    shumusApiSecret: '',
    shumusEnvironment: 'sandbox',
    zatcaApiKey: '',
    zatcaApiSecret: '',
    zatcaCsid: '',
    zatcaEnvironment: 'sandbox',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    postalCode: '',
    shumusEnabled: false,
    zatcaEnabled: false,
    autoReporting: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'legal_compliance');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings({ ...settings, ...docSnap.data() });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // Validation
      if (!settings.commercialRegistration || !settings.vatNumber) {
        setMessage({ type: 'error', text: 'السجل التجاري والرقم الضريبي مطلوبان' });
        setSaving(false);
        return;
      }

      const docRef = doc(db, 'settings', 'legal_compliance');
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      });

      setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'تم النسخ!' });
    setTimeout(() => setMessage(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">الامتثال القانوني والتكاملات الحكومية</h1>
            <p className="text-slate-400">إعدادات الربط مع منصة شموس والزكاة والضريبة</p>
          </div>
        </div>
      </motion.div>

      {/* Success/Error Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/50 text-green-300'
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* معلومات المنشأة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                معلومات المنشأة
              </CardTitle>
              <CardDescription className="text-slate-400">
                البيانات الأساسية للفندق أو المنتجع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">اسم المنشأة (عربي) *</Label>
                <Input
                  value={settings.hotelNameAr}
                  onChange={(e) => setSettings({ ...settings, hotelNameAr: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="فندق المدينة الفاخر"
                />
              </div>

              <div>
                <Label className="text-slate-300">اسم المنشأة (إنجليزي) *</Label>
                <Input
                  value={settings.hotelNameEn}
                  onChange={(e) => setSettings({ ...settings, hotelNameEn: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="Luxury City Hotel"
                  dir="ltr"
                />
              </div>

              <div>
                <Label className="text-slate-300">رقم السجل التجاري *</Label>
                <Input
                  value={settings.commercialRegistration}
                  onChange={(e) => setSettings({ ...settings, commercialRegistration: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="1010123456"
                  dir="ltr"
                />
              </div>

              <div>
                <Label className="text-slate-300">رقم الرخصة السياحية</Label>
                <Input
                  value={settings.tourismLicense}
                  onChange={(e) => setSettings({ ...settings, tourismLicense: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="TL-2024-001234"
                  dir="ltr"
                />
              </div>

              <div>
                <Label className="text-slate-300">تاريخ انتهاء الرخصة السياحية</Label>
                <Input
                  type="date"
                  value={settings.tourismLicenseExpiry}
                  onChange={(e) => setSettings({ ...settings, tourismLicenseExpiry: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  dir="ltr"
                />
              </div>

              <div>
                <Label className="text-slate-300">رقم الترخيص البلدي</Label>
                <Input
                  value={settings.municipalityLicense}
                  onChange={(e) => setSettings({ ...settings, municipalityLicense: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="ML-123456"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* الضرائب */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-400" />
                الزكاة والضريبة
              </CardTitle>
              <CardDescription className="text-slate-400">
                معلومات ضريبة القيمة المضافة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">الرقم الضريبي (VAT) *</Label>
                <div className="flex gap-2">
                  <Input
                    value={settings.vatNumber}
                    onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white flex-1"
                    placeholder="300123456789003"
                    dir="ltr"
                  />
                  {settings.vatNumber && (
                    <Button
                      onClick={() => copyToClipboard(settings.vatNumber)}
                      variant="outline"
                      size="icon"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">15 رقم، يبدأ بـ 3 وينتهي بـ 3</p>
              </div>

              <div>
                <Label className="text-slate-300">تاريخ التسجيل في ضريبة القيمة المضافة</Label>
                <Input
                  type="date"
                  value={settings.vatRegistrationDate}
                  onChange={(e) => setSettings({ ...settings, vatRegistrationDate: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  dir="ltr"
                />
              </div>

              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  ZATCA API (فاتورة)
                </h4>

                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300">Environment</Label>
                    <select
                      value={settings.zatcaEnvironment}
                      onChange={(e) => setSettings({ ...settings, zatcaEnvironment: e.target.value as 'sandbox' | 'production' })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="sandbox">Sandbox (تجريبي)</option>
                      <option value="production">Production (إنتاج)</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-slate-300">API Key</Label>
                    <Input
                      value={settings.zatcaApiKey}
                      onChange={(e) => setSettings({ ...settings, zatcaApiKey: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="ZATCA-API-KEY"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">API Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showZatcaSecret ? 'text' : 'password'}
                        value={settings.zatcaApiSecret}
                        onChange={(e) => setSettings({ ...settings, zatcaApiSecret: e.target.value })}
                        className="bg-slate-900/50 border-slate-700 text-white flex-1"
                        placeholder="••••••••••••"
                        dir="ltr"
                      />
                      <Button
                        onClick={() => setShowZatcaSecret(!showZatcaSecret)}
                        variant="outline"
                        size="icon"
                        className="border-slate-700 text-slate-400"
                      >
                        {showZatcaSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">CSID (معرف التوقيع)</Label>
                    <Textarea
                      value={settings.zatcaCsid}
                      onChange={(e) => setSettings({ ...settings, zatcaCsid: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white h-20"
                      placeholder="Base64 Cryptographic Stamp Identifier"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.zatcaEnabled}
                      onChange={(e) => setSettings({ ...settings, zatcaEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700"
                    />
                    <Label className="text-slate-300">تفعيل الربط مع ZATCA</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* شموس */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                منصة شموس
              </CardTitle>
              <CardDescription className="text-slate-400">
                وزارة السياحة - نظام التسجيل الإلكتروني
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">رقم التسجيل في شموس</Label>
                <Input
                  value={settings.shumusRegistrationNumber}
                  onChange={(e) => setSettings({ ...settings, shumusRegistrationNumber: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="SHUMUS-2024-123456"
                  dir="ltr"
                />
              </div>

              <div>
                <Label className="text-slate-300">Environment</Label>
                <select
                  value={settings.shumusEnvironment}
                  onChange={(e) => setSettings({ ...settings, shumusEnvironment: e.target.value as 'sandbox' | 'production' })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="sandbox">Sandbox (تجريبي)</option>
                  <option value="production">Production (إنتاج)</option>
                </select>
              </div>

              <div>
                <Label className="text-slate-300">API Key</Label>
                <Input
                  value={settings.shumusApiKey}
                  onChange={(e) => setSettings({ ...settings, shumusApiKey: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="SHUMUS-API-KEY"
                  dir="ltr"
                />
              </div>

              <div>
                <Label className="text-slate-300">API Secret</Label>
                <div className="flex gap-2">
                  <Input
                    type={showShumusSecret ? 'text' : 'password'}
                    value={settings.shumusApiSecret}
                    onChange={(e) => setSettings({ ...settings, shumusApiSecret: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white flex-1"
                    placeholder="••••••••••••"
                    dir="ltr"
                  />
                  <Button
                    onClick={() => setShowShumusSecret(!showShumusSecret)}
                    variant="outline"
                    size="icon"
                    className="border-slate-700 text-slate-400"
                  >
                    {showShumusSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.shumusEnabled}
                  onChange={(e) => setSettings({ ...settings, shumusEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700"
                />
                <Label className="text-slate-300">تفعيل الربط مع شموس</Label>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                  onClick={() => window.open('https://shumus.sa', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 ml-2" />
                  زيارة منصة شموس
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* معلومات التواصل والموقع */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                معلومات التواصل والموقع
              </CardTitle>
              <CardDescription className="text-slate-400">
                عنوان المنشأة وبيانات التواصل الرسمية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="info@hotel.com"
                  dir="ltr"
                />
              </div>

              <div>
                <Label className="text-slate-300">رقم الهاتف</Label>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="+966501234567"
                  dir="ltr"
                />
              </div>

              <div>
                <Label className="text-slate-300">العنوان الكامل</Label>
                <Textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white h-20"
                  placeholder="شارع الملك فهد، حي النزهة"
                />
              </div>

              <div>
                <Label className="text-slate-300">المدينة</Label>
                <Input
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="الرياض"
                />
              </div>

              <div>
                <Label className="text-slate-300">الرمز البريدي</Label>
                <Input
                  value={settings.postalCode}
                  onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="12345"
                  dir="ltr"
                />
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoReporting}
                    onChange={(e) => setSettings({ ...settings, autoReporting: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700"
                  />
                  <Label className="text-slate-300">تفعيل الإبلاغ التلقائي للجهات الحكومية</Label>
                </div>
                <p className="text-xs text-slate-500 mt-2 mr-6">
                  سيتم إرسال تقارير النزلاء والإشغال والإيرادات تلقائياً للجهات المختصة
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 ml-2" />
              حفظ جميع الإعدادات
            </>
          )}
        </Button>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div className="text-sm text-blue-300 space-y-2">
                <p className="font-semibold">ملاحظات هامة:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-200">
                  <li>تأكد من صحة جميع البيانات المدخلة قبل التفعيل</li>
                  <li>استخدم بيئة Sandbox للتجربة قبل الانتقال للإنتاج</li>
                  <li>احتفظ بنسخة احتياطية من API Keys في مكان آمن</li>
                  <li>تواصل مع الدعم الفني للمنصات للحصول على البيانات المطلوبة</li>
                  <li>يجب تجديد الرخص والتراخيص قبل انتهائها</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
