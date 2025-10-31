'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  Settings,
  Eye,
  EyeOff,
  Save,
  Zap,
  Globe,
  Link as LinkIcon
} from 'lucide-react';
import {
  NotificationChannel,
  WhatsAppConfig,
  SMSConfig,
  EmailConfig,
  getChannelConfig,
  saveWhatsAppConfig,
  saveSMSConfig,
  saveEmailConfig,
} from '@/lib/notifications/notification-service';

export default function NotificationConfigPage() {
  const [activeTab, setActiveTab] = useState<NotificationChannel>('whatsapp');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  // Configs
  const [whatsappConfig, setWhatsappConfig] = useState<Partial<WhatsAppConfig>>({
    isActive: false,
    provider: 'whatsapp_business_api',
    webhookUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/whatsapp`
  });
  
  const [smsConfig, setSmsConfig] = useState<Partial<SMSConfig>>({
    isActive: false,
    provider: 'twilio',
    maxLength: 160,
    arabicSupport: true,
    unicodeEnabled: true
  });
  
  const [emailConfig, setEmailConfig] = useState<Partial<EmailConfig>>({
    isActive: false,
    provider: 'sendgrid',
    fromEmail: '',
    fromName: 'المضيف سمارت'
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const [whatsapp, sms, email] = await Promise.all([
        getChannelConfig('whatsapp'),
        getChannelConfig('sms'),
        getChannelConfig('email')
      ]);
      
      if (whatsapp) setWhatsappConfig(whatsapp);
      if (sms) setSmsConfig(sms);
      if (email) setEmailConfig(email);
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWhatsApp = async () => {
    try {
      setSaving(true);
      await saveWhatsAppConfig(whatsappConfig as WhatsAppConfig);
      alert('✅ تم حفظ إعدادات WhatsApp بنجاح');
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      alert('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSMS = async () => {
    try {
      setSaving(true);
      await saveSMSConfig(smsConfig as SMSConfig);
      alert('✅ تم حفظ إعدادات SMS بنجاح');
    } catch (error) {
      console.error('Error saving SMS config:', error);
      alert('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      setSaving(true);
      await saveEmailConfig(emailConfig as EmailConfig);
      alert('✅ تم حفظ إعدادات Email بنجاح');
    } catch (error) {
      console.error('Error saving Email config:', error);
      alert('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          إعدادات الإشعارات
        </h1>
        <p className="text-gray-600 mt-1">
          إدارة قنوات الإشعارات: WhatsApp, SMS, Email
        </p>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات القنوات</CardTitle>
          <CardDescription>
            قم بتفعيل وإعداد قنوات الإشعارات المختلفة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NotificationChannel)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="whatsapp" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                WhatsApp
                {whatsappConfig.isActive && (
                  <Badge variant="default" className="bg-green-600 mr-1">مفعّل</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sms" className="gap-2">
                <Smartphone className="w-4 h-4" />
                SMS
                {smsConfig.isActive && (
                  <Badge variant="default" className="bg-green-600 mr-1">مفعّل</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="w-4 h-4" />
                Email
                {emailConfig.isActive && (
                  <Badge variant="default" className="bg-green-600 mr-1">مفعّل</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* WhatsApp Tab */}
            <TabsContent value="whatsapp" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <Label className="text-base font-semibold text-green-900">تفعيل WhatsApp</Label>
                  <p className="text-sm text-green-700">إرسال الإشعارات عبر WhatsApp Business API</p>
                </div>
                <Switch
                  checked={whatsappConfig.isActive}
                  onCheckedChange={(checked) =>
                    setWhatsappConfig({ ...whatsappConfig, isActive: checked })
                  }
                />
              </div>

              <div>
                <Label>المزود (Provider)</Label>
                <select
                  value={whatsappConfig.provider}
                  onChange={(e) =>
                    setWhatsappConfig({ ...whatsappConfig, provider: e.target.value as any })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="whatsapp_business_api">WhatsApp Business API</option>
                  <option value="twilio">Twilio WhatsApp</option>
                  <option value="custom">مخصص (Custom)</option>
                </select>
              </div>

              {whatsappConfig.provider === 'whatsapp_business_api' && (
                <>
                  <div>
                    <Label>Access Token</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets['wa_token'] ? 'text' : 'password'}
                        value={whatsappConfig.accessToken || ''}
                        onChange={(e) =>
                          setWhatsappConfig({ ...whatsappConfig, accessToken: e.target.value })
                        }
                        placeholder="EAAxxxxxxxx..."
                        className="pl-10"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('wa_token')}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                      >
                        {showSecrets['wa_token'] ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone Number ID</Label>
                      <Input
                        value={whatsappConfig.phoneNumberId || ''}
                        onChange={(e) =>
                          setWhatsappConfig({ ...whatsappConfig, phoneNumberId: e.target.value })
                        }
                        placeholder="1234567890"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label>Business Account ID</Label>
                      <Input
                        value={whatsappConfig.businessAccountId || ''}
                        onChange={(e) =>
                          setWhatsappConfig({ ...whatsappConfig, businessAccountId: e.target.value })
                        }
                        placeholder="9876543210"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  رابط Webhook
                </Label>
                <Input
                  value={whatsappConfig.webhookUrl || ''}
                  onChange={(e) =>
                    setWhatsappConfig({ ...whatsappConfig, webhookUrl: e.target.value })
                  }
                  placeholder="https://yourdomain.com/api/webhooks/whatsapp"
                  className="font-mono text-sm"
                  dir="ltr"
                />
              </div>

              <Button onClick={handleSaveWhatsApp} disabled={saving} className="w-full gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'جاري الحفظ...' : 'حفظ إعدادات WhatsApp'}
              </Button>
            </TabsContent>

            {/* SMS Tab */}
            <TabsContent value="sms" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <Label className="text-base font-semibold text-blue-900">تفعيل SMS</Label>
                  <p className="text-sm text-blue-700">إرسال الرسائل النصية القصيرة</p>
                </div>
                <Switch
                  checked={smsConfig.isActive}
                  onCheckedChange={(checked) =>
                    setSmsConfig({ ...smsConfig, isActive: checked })
                  }
                />
              </div>

              <div>
                <Label>المزود (Provider)</Label>
                <select
                  value={smsConfig.provider}
                  onChange={(e) =>
                    setSmsConfig({ ...smsConfig, provider: e.target.value as any })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="twilio">Twilio SMS</option>
                  <option value="unifonic">Unifonic (يونيفونك)</option>
                  <option value="custom">مخصص (Custom)</option>
                </select>
              </div>

              {smsConfig.provider === 'twilio' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Account SID</Label>
                      <Input
                        type={showSecrets['sms_sid'] ? 'text' : 'password'}
                        value={smsConfig.accountSid || ''}
                        onChange={(e) =>
                          setSmsConfig({ ...smsConfig, accountSid: e.target.value })
                        }
                        placeholder="ACxxxxxxxx..."
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label>Auth Token</Label>
                      <Input
                        type="password"
                        value={smsConfig.authToken || ''}
                        onChange={(e) =>
                          setSmsConfig({ ...smsConfig, authToken: e.target.value })
                        }
                        placeholder="xxxxxxxx"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>رقم المرسل (From Number)</Label>
                    <Input
                      value={smsConfig.fromNumber || ''}
                      onChange={(e) =>
                        setSmsConfig({ ...smsConfig, fromNumber: e.target.value })
                      }
                      placeholder="+14155238886"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              {smsConfig.provider === 'unifonic' && (
                <>
                  <div>
                    <Label>App SID</Label>
                    <Input
                      type={showSecrets['unifonic_sid'] ? 'text' : 'password'}
                      value={smsConfig.appSid || ''}
                      onChange={(e) =>
                        setSmsConfig({ ...smsConfig, appSid: e.target.value })
                      }
                      placeholder="xxxxxxxx"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <Label>اسم المرسل (Sender Name)</Label>
                    <Input
                      value={smsConfig.senderName || ''}
                      onChange={(e) =>
                        setSmsConfig({ ...smsConfig, senderName: e.target.value })
                      }
                      placeholder="المضيف"
                      maxLength={11}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      الحد الأقصى 11 حرف (عربي أو إنجليزي)
                    </p>
                  </div>
                </>
              )}

              <Button onClick={handleSaveSMS} disabled={saving} className="w-full gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'جاري الحفظ...' : 'حفظ إعدادات SMS'}
              </Button>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <Label className="text-base font-semibold text-purple-900">تفعيل Email</Label>
                  <p className="text-sm text-purple-700">إرسال البريد الإلكتروني</p>
                </div>
                <Switch
                  checked={emailConfig.isActive}
                  onCheckedChange={(checked) =>
                    setEmailConfig({ ...emailConfig, isActive: checked })
                  }
                />
              </div>

              <div>
                <Label>المزود (Provider)</Label>
                <select
                  value={emailConfig.provider}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, provider: e.target.value as any })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="sendgrid">SendGrid</option>
                  <option value="aws_ses">AWS SES</option>
                  <option value="smtp">SMTP</option>
                  <option value="custom">مخصص (Custom)</option>
                </select>
              </div>

              {emailConfig.provider === 'sendgrid' && (
                <div>
                  <Label>API Key</Label>
                  <Input
                    type={showSecrets['sendgrid_key'] ? 'text' : 'password'}
                    value={emailConfig.apiKey || ''}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, apiKey: e.target.value })
                    }
                    placeholder="SG.xxxxxxxx..."
                    dir="ltr"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>بريد المرسل (From Email)</Label>
                  <Input
                    type="email"
                    value={emailConfig.fromEmail || ''}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, fromEmail: e.target.value })
                    }
                    placeholder="noreply@yourdomain.com"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label>اسم المرسل (From Name)</Label>
                  <Input
                    value={emailConfig.fromName || ''}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, fromName: e.target.value })
                    }
                    placeholder="المضيف سمارت"
                  />
                </div>
              </div>

              <Button onClick={handleSaveEmail} disabled={saving} className="w-full gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'جاري الحفظ...' : 'حفظ إعدادات Email'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Setup Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            دليل الإعداد السريع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <MessageSquare className="w-5 h-5" />
                WhatsApp
              </div>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. إنشاء حساب WhatsApp Business</li>
                <li>2. الحصول على Access Token</li>
                <li>3. إعداد Phone Number ID</li>
                <li>4. تفعيل Webhooks</li>
              </ol>
              <a
                href="https://developers.facebook.com/docs/whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                <Globe className="w-4 h-4" />
                توثيق WhatsApp
              </a>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <Smartphone className="w-5 h-5" />
                SMS
              </div>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. إنشاء حساب Twilio/Unifonic</li>
                <li>2. الحصول على API Keys</li>
                <li>3. تسجيل رقم المرسل</li>
                <li>4. اختبار الإرسال</li>
              </ol>
              <a
                href="https://www.twilio.com/docs/sms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                <Globe className="w-4 h-4" />
                توثيق Twilio
              </a>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-600 font-semibold">
                <Mail className="w-5 h-5" />
                Email
              </div>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. إنشاء حساب SendGrid/AWS</li>
                <li>2. التحقق من Domain</li>
                <li>3. الحصول على API Key</li>
                <li>4. إعداد SPF/DKIM</li>
              </ol>
              <a
                href="https://docs.sendgrid.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                <Globe className="w-4 h-4" />
                توثيق SendGrid
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
