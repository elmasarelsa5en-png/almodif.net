'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Power, 
  Settings, 
  Bot, 
  Wifi, 
  WifiOff,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Smartphone,
  QrCode,
  MessageSquare,
  Users,
  TrendingUp
} from 'lucide-react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'qr_required';

export default function WhatsAppBotPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [botEnabled, setBotEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [botName, setBotName] = useState('المُضيف الذكي');
  const [welcomeMessage, setWelcomeMessage] = useState('مرحباً! أنا المساعد الذكي للفندق. كيف يمكنني مساعدتك اليوم؟');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  
  // Stats
  const [stats] = useState({
    activeChats: 12,
    messagesReceived: 145,
    messagesReplied: 127,
    responseRate: 87.6
  });

  const handleConnect = () => {
    setConnectionStatus('connecting');
    
    // محاكاة عملية الاتصال
    setTimeout(() => {
      setConnectionStatus('qr_required');
      // إنشاء QR code وهمي للعرض
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WhatsAppBotConnection');
    }, 2000);
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setBotEnabled(false);
    setQrCode('');
    setPhoneNumber('');
  };

  const handleScanComplete = () => {
    setConnectionStatus('connected');
    setPhoneNumber('+966 50 123 4567'); // رقم وهمي
    setBotEnabled(true);
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> متصل</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> جاري الاتصال...</Badge>;
      case 'qr_required':
        return <Badge className="bg-blue-500"><QrCode className="h-3 w-3 mr-1" /> امسح رمز QR</Badge>;
      default:
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> غير متصل</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="h-8 w-8 text-green-400" />
                سيرفر WhatsApp
              </h1>
              <p className="text-green-200 mt-1">
                إدارة الاتصال بـ WhatsApp وإعدادات البوت
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-500/30 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">المحادثات النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-white">{stats.activeChats}</p>
                <MessageSquare className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">الرسائل المستلمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-white">{stats.messagesReceived}</p>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">الردود المرسلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-white">{stats.messagesReplied}</p>
                <Bot className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">معدل الاستجابة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-white">{stats.responseRate}%</p>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Card */}
          <Card className="border-green-500/30 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-400" />
                حالة الاتصال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionStatus === 'disconnected' && (
                <div className="text-center space-y-4 py-8">
                  <div className="flex justify-center">
                    <div className="p-4 bg-red-500/10 rounded-full">
                      <WifiOff className="h-16 w-16 text-red-400" />
                    </div>
                  </div>
                  <p className="text-slate-300">البوت غير متصل حالياً</p>
                  <Button 
                    onClick={handleConnect}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Power className="h-4 w-4 mr-2" />
                    الاتصال بـ WhatsApp
                  </Button>
                </div>
              )}

              {connectionStatus === 'connecting' && (
                <div className="text-center space-y-4 py-8">
                  <div className="flex justify-center">
                    <Loader2 className="h-16 w-16 text-yellow-400 animate-spin" />
                  </div>
                  <p className="text-slate-300">جاري الاتصال...</p>
                </div>
              )}

              {connectionStatus === 'qr_required' && (
                <div className="text-center space-y-4">
                  <p className="text-slate-300 font-semibold">امسح رمز QR من تطبيق WhatsApp</p>
                  <p className="text-xs text-slate-400">
                    1. افتح WhatsApp على هاتفك<br/>
                    2. انتقل إلى الإعدادات → الأجهزة المرتبطة<br/>
                    3. اضغط على "ربط جهاز"<br/>
                    4. وجه الكاميرا نحو رمز QR أدناه
                  </p>
                  
                  {qrCode && (
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleScanComplete}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      تم المسح (للتجربة)
                    </Button>
                    <Button 
                      onClick={handleDisconnect}
                      variant="outline"
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}

              {connectionStatus === 'connected' && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-green-500/10 rounded-full">
                        <Wifi className="h-16 w-16 text-green-400" />
                      </div>
                    </div>
                    <p className="text-green-400 font-semibold text-lg">متصل بنجاح!</p>
                    <p className="text-slate-400 text-sm mt-1">الرقم: {phoneNumber}</p>
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-slate-300">تفعيل البوت</Label>
                      <Switch 
                        checked={botEnabled}
                        onCheckedChange={setBotEnabled}
                      />
                    </div>

                    <Button 
                      onClick={handleDisconnect}
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Power className="h-4 w-4 mr-2" />
                      قطع الاتصال
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bot Settings */}
          <Card className="border-green-500/30 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-400" />
                إعدادات البوت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">اسم البوت</Label>
                <Input 
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                  placeholder="اسم البوت"
                />
              </div>

              <div>
                <Label className="text-slate-300">رسالة الترحيب</Label>
                <Textarea 
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="mt-1 bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  placeholder="رسالة الترحيب..."
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <Label className="text-slate-300">الرد التلقائي</Label>
                  <p className="text-xs text-slate-400 mt-1">
                    الرد على الرسائل تلقائياً عند الاتصال
                  </p>
                </div>
                <Switch 
                  checked={autoReplyEnabled}
                  onCheckedChange={setAutoReplyEnabled}
                />
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={connectionStatus !== 'connected'}
              >
                <Settings className="h-4 w-4 mr-2" />
                حفظ الإعدادات
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                onClick={() => router.push('/crm/whatsapp')}
              >
                <Bot className="h-4 w-4 mr-2" />
                إعدادات الذكاء الاصطناعي
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-green-500/30 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => router.push('/crm/whatsapp')}
              >
                <div className="text-center">
                  <Bot className="h-6 w-6 mx-auto mb-1 text-purple-400" />
                  <p className="text-sm">إدارة الذكاء الاصطناعي</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => router.push('/crm/whatsapp/auto-reply')}
              >
                <div className="text-center">
                  <MessageSquare className="h-6 w-6 mx-auto mb-1 text-green-400" />
                  <p className="text-sm">الردود التلقائية</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => router.push('/dashboard/chat')}
              >
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-1 text-blue-400" />
                  <p className="text-sm">المحادثات النشطة</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-blue-500/30 bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Bot className="h-4 w-4" />
              تعليمات الإعداد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-300 space-y-2">
              <p>• قم بتوصيل رقم WhatsApp Business الخاص بالفندق</p>
              <p>• امسح رمز QR باستخدام تطبيق WhatsApp على هاتفك</p>
              <p>• فعّل البوت لبدء الرد التلقائي على رسائل النزلاء</p>
              <p>• يمكنك تخصيص الردود من خلال صفحة إدارة الذكاء الاصطناعي</p>
              <p>• تأكد من بقاء الاتصال نشطاً للحصول على أفضل تجربة</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
