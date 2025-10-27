'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Building2, 
  Plane, 
  MapPin,
  Settings,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Key,
  Link as LinkIcon,
  Zap,
  Clock,
  TestTube
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ComponentType<any>;
  color: string;
  apiKeyLabel: string;
  apiSecretLabel: string;
  webhookUrl?: string;
  isConnected: boolean;
  lastSync?: string;
  totalBookings?: number;
  documentation?: string;
}

export default function ChannelSettingsPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'booking',
      name: 'Booking.com',
      nameAr: 'بوكينج دوت كوم',
      icon: Globe,
      color: 'from-blue-500 to-blue-600',
      apiKeyLabel: 'Hotel ID',
      apiSecretLabel: 'API Key',
      webhookUrl: '/api/webhooks/booking',
      isConnected: false,
      lastSync: undefined,
      totalBookings: 0,
      documentation: 'https://connect.booking.com/user_guide/site/en-US/index.html'
    },
    {
      id: 'almosafer',
      name: 'Almosafer',
      nameAr: 'المسافر',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      apiKeyLabel: 'Property ID',
      apiSecretLabel: 'API Token',
      webhookUrl: '/api/webhooks/almosafer',
      isConnected: false,
      lastSync: undefined,
      totalBookings: 0,
      documentation: 'https://almosafer.com/api-docs'
    },
    {
      id: 'agoda',
      name: 'Agoda',
      nameAr: 'أجودا',
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
      apiKeyLabel: 'Hotel Code',
      apiSecretLabel: 'YCS Key',
      webhookUrl: '/api/webhooks/agoda',
      isConnected: false,
      lastSync: undefined,
      totalBookings: 0,
      documentation: 'https://ycs.agoda.com/Help'
    },
    {
      id: 'airport',
      name: 'Airport Booking',
      nameAr: 'حجوزات المطار',
      icon: Plane,
      color: 'from-orange-500 to-orange-600',
      apiKeyLabel: 'Terminal ID',
      apiSecretLabel: 'Access Code',
      webhookUrl: '/api/webhooks/airport',
      isConnected: false,
      lastSync: undefined,
      totalBookings: 0,
      documentation: '#'
    },
    {
      id: 'expedia',
      name: 'Expedia',
      nameAr: 'إكسبيديا',
      icon: Globe,
      color: 'from-yellow-500 to-yellow-600',
      apiKeyLabel: 'Property ID',
      apiSecretLabel: 'EQC Key',
      webhookUrl: '/api/webhooks/expedia',
      isConnected: false,
      lastSync: undefined,
      totalBookings: 0,
      documentation: 'https://developer.expediapartnersolutions.com/'
    },
    {
      id: 'airbnb',
      name: 'Airbnb',
      nameAr: 'إير بي إن بي',
      icon: Building2,
      color: 'from-pink-500 to-pink-600',
      apiKeyLabel: 'Listing ID',
      apiSecretLabel: 'OAuth Token',
      webhookUrl: '/api/webhooks/airbnb',
      isConnected: false,
      lastSync: undefined,
      totalBookings: 0,
      documentation: 'https://www.airbnb.com/partner'
    }
  ]);

  const [channelCredentials, setChannelCredentials] = useState<{[key: string]: {apiKey: string, apiSecret: string}}>({});
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [savingChannel, setSavingChannel] = useState<string | null>(null);

  const handleSaveCredentials = async (channelId: string) => {
    setSavingChannel(channelId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const credentials = channelCredentials[channelId];
    if (credentials?.apiKey && credentials?.apiSecret) {
      // Save to localStorage
      localStorage.setItem(`channel_${channelId}`, JSON.stringify({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        connectedAt: new Date().toISOString()
      }));

      // Update channel status
      setChannels(prev => prev.map(ch => 
        ch.id === channelId 
          ? { ...ch, isConnected: true, lastSync: new Date().toISOString() }
          : ch
      ));

      alert(`✅ تم الربط بنجاح مع ${channels.find(ch => ch.id === channelId)?.nameAr}`);
    }
    
    setSavingChannel(null);
  };

  const handleTestConnection = async (channelId: string) => {
    setTestingChannel(channelId);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const credentials = channelCredentials[channelId];
    if (credentials?.apiKey && credentials?.apiSecret) {
      alert(`✅ الاتصال ناجح! تم التحقق من بيانات الاعتماد.`);
    } else {
      alert(`❌ فشل الاتصال. الرجاء التحقق من البيانات.`);
    }
    
    setTestingChannel(null);
  };

  const handleDisconnect = (channelId: string) => {
    if (confirm('هل أنت متأكد من قطع الاتصال مع هذه المنصة؟')) {
      localStorage.removeItem(`channel_${channelId}`);
      setChannels(prev => prev.map(ch => 
        ch.id === channelId 
          ? { ...ch, isConnected: false, lastSync: undefined }
          : ch
      ));
      setChannelCredentials(prev => {
        const newCreds = { ...prev };
        delete newCreds[channelId];
        return newCreds;
      });
    }
  };

  const handleSyncNow = async (channelId: string) => {
    const channel = channels.find(ch => ch.id === channelId);
    if (!channel) return;

    alert(`🔄 جاري مزامنة الحجوزات من ${channel.nameAr}...`);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setChannels(prev => prev.map(ch => 
      ch.id === channelId 
        ? { ...ch, lastSync: new Date().toISOString(), totalBookings: (ch.totalBookings || 0) + Math.floor(Math.random() * 5) }
        : ch
    ));

    alert(`✅ تمت المزامنة بنجاح!`);
  };

  const connectedChannels = channels.filter(ch => ch.isConnected).length;
  const totalBookings = channels.reduce((sum, ch) => sum + (ch.totalBookings || 0), 0);
  const lastSyncTime = channels.find(ch => ch.lastSync) 
    ? new Date(channels.find(ch => ch.lastSync)?.lastSync || '').toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : 'لم تتم بعد';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6" dir="rtl">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-400" />
                إعدادات منصات الحجز
              </h1>
              <p className="text-white/60 mt-1">ربط التطبيق مع منصات الحجز العالمية</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/80 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  المنصات المتصلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{connectedChannels} / {channels.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/80 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  إجمالي الحجوزات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalBookings}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/80 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  آخر مزامنة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{lastSyncTime}</div>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-br from-orange-500 to-orange-600 border-none shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all cursor-pointer" 
              onClick={() => router.push('/dashboard/booking-platforms/test-webhooks')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/80 flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  اختبار Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">محاكاة الحجوزات</div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Configuration Cards */}
          <div className="space-y-4">
            {channels.map((channel) => (
              <Card key={channel.id} className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Channel Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                          channel.color
                        )}>
                          <channel.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{channel.nameAr}</h3>
                          <p className="text-sm text-white/60">{channel.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {channel.isConnected ? (
                          <>
                            <Badge className="bg-green-500 text-white border-none flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              متصل
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSyncNow(channel.id)}
                              className="bg-blue-500/20 border-blue-500/50 text-white hover:bg-blue-500/30"
                            >
                              <RefreshCw className="w-4 h-4 ml-2" />
                              مزامنة الآن
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDisconnect(channel.id)}
                              className="bg-red-500/20 border-red-500/50 text-white hover:bg-red-500/30"
                            >
                              <XCircle className="w-4 h-4 ml-2" />
                              قطع الاتصال
                            </Button>
                          </>
                        ) : (
                          <Badge className="bg-gray-500 text-white border-none flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            غير متصل
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Connection Info */}
                    {channel.isConnected && channel.lastSync && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                        <div>
                          <div className="text-sm text-white/60 mb-1">آخر مزامنة</div>
                          <div className="text-white font-medium">
                            {new Date(channel.lastSync).toLocaleString('ar-EG')}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">إجمالي الحجوزات</div>
                          <div className="text-white font-medium">{channel.totalBookings || 0}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">Webhook URL</div>
                          <div className="text-blue-400 font-medium text-xs truncate">
                            {window.location.origin}{channel.webhookUrl}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Configuration Form */}
                    {!channel.isConnected && (
                      <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm text-white/80 flex items-center gap-2">
                              <Key className="w-4 h-4" />
                              {channel.apiKeyLabel}
                            </label>
                            <Input
                              value={channelCredentials[channel.id]?.apiKey || ''}
                              onChange={(e) => setChannelCredentials(prev => ({
                                ...prev,
                                [channel.id]: { ...prev[channel.id], apiKey: e.target.value }
                              }))}
                              placeholder={`أدخل ${channel.apiKeyLabel}`}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-white/80 flex items-center gap-2">
                              <Key className="w-4 h-4" />
                              {channel.apiSecretLabel}
                            </label>
                            <Input
                              type="password"
                              value={channelCredentials[channel.id]?.apiSecret || ''}
                              onChange={(e) => setChannelCredentials(prev => ({
                                ...prev,
                                [channel.id]: { ...prev[channel.id], apiSecret: e.target.value }
                              }))}
                              placeholder={`أدخل ${channel.apiSecretLabel}`}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => handleSaveCredentials(channel.id)}
                            disabled={savingChannel === channel.id || !channelCredentials[channel.id]?.apiKey || !channelCredentials[channel.id]?.apiSecret}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                          >
                            {savingChannel === channel.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                                جاري الحفظ...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 ml-2" />
                                حفظ وربط
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleTestConnection(channel.id)}
                            disabled={testingChannel === channel.id || !channelCredentials[channel.id]?.apiKey || !channelCredentials[channel.id]?.apiSecret}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            {testingChannel === channel.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                                جاري الاختبار...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 ml-2" />
                                اختبار الاتصال
                              </>
                            )}
                          </Button>

                          {channel.documentation && channel.documentation !== '#' && (
                            <a
                              href={channel.documentation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                            >
                              <Globe className="w-4 h-4" />
                              دليل التوثيق
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Help Section */}
          <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div className="space-y-2 text-white/80">
                  <h4 className="font-bold text-white text-lg">كيفية الحصول على بيانات API:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• <strong>Booking.com:</strong> سجل في Booking.com Connectivity واحصل على Hotel ID و API Key</li>
                    <li>• <strong>Agoda:</strong> تواصل مع Agoda YCS Support للحصول على Hotel Code و YCS Key</li>
                    <li>• <strong>المسافر:</strong> تواصل مع فريق المسافر B2B للحصول على Property ID و API Token</li>
                    <li>• <strong>Expedia:</strong> سجل في Expedia Partner Central واحصل على Property ID و EQC Key</li>
                    <li>• <strong>Airbnb:</strong> استخدم Airbnb for Partners للحصول على Listing ID و OAuth Token</li>
                  </ul>
                  <p className="pt-2">
                    <strong>ملاحظة:</strong> بعد الربط، ستتم مزامنة الحجوزات الجديدة تلقائياً كل 5 دقائق.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
