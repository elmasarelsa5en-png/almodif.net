'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot,
  Plus,
  Search,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  ArrowLeft,
  MessageSquare,
  Zap,
  Brain,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  BarChart3,
  Target,
  Users,
  MessageCircle,
  Cpu,
  Globe,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BotsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedBot, setSelectedBot] = useState(null);
  const [isNewBotOpen, setIsNewBotOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const botStats = [
    {
      title: 'إجمالي البوتات',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: Bot,
      color: 'from-blue-500 to-indigo-600',
      description: 'بوتات مسجلة'
    },
    {
      title: 'بوتات نشطة',
      value: '8',
      change: '+1',
      changeType: 'increase',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      description: 'تعمل حالياً'
    },
    {
      title: 'إجمالي الردود',
      value: '15,247',
      change: '+1,234',
      changeType: 'increase',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-600',
      description: 'هذا الشهر'
    },
    {
      title: 'معدل النجاح',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'increase',
      icon: Target,
      color: 'from-orange-500 to-red-600',
      description: 'دقة الردود'
    }
  ];

  const bots = [
    {
      id: 'BOT001',
      name: 'مساعد الحجوزات',
      description: 'بوت متخصص في التعامل مع استفسارات وطلبات الحجوزات',
      type: 'reservation',
      status: 'active',
      language: 'ar',
      model: 'GPT-4',
      responses: 3247,
      accuracy: 96.8,
      avgResponseTime: 1.2,
      lastActive: '2025-01-15T14:30:00',
      createdDate: '2024-06-15',
      features: ['حجز الغرف', 'التحقق من التوفر', 'تعديل الحجوزات', 'الإلغاء'],
      triggers: ['حجز', 'غرفة', 'متاح', 'سعر', 'تاريخ'],
      apiEndpoint: 'https://api.hotel.com/bots/reservation',
      webhookUrl: 'https://webhook.hotel.com/reservation',
      maxTokens: 2048,
      temperature: 0.7,
      isTrainable: true,
      trainingData: 'reservations_dataset_v2.json'
    },
    {
      id: 'BOT002',
      name: 'خدمة العملاء العامة',
      description: 'بوت للاستفسارات العامة وخدمة العملاء الأساسية',
      type: 'customer_service',
      status: 'active',
      language: 'ar',
      model: 'GPT-3.5',
      responses: 8945,
      accuracy: 92.4,
      avgResponseTime: 0.8,
      lastActive: '2025-01-15T15:45:00',
      createdDate: '2024-03-10',
      features: ['استفسارات عامة', 'معلومات الفندق', 'الخدمات', 'الشكاوى'],
      triggers: ['مساعدة', 'معلومات', 'خدمة', 'مشكلة', 'شكوى'],
      apiEndpoint: 'https://api.hotel.com/bots/customer-service',
      webhookUrl: 'https://webhook.hotel.com/customer-service',
      maxTokens: 1024,
      temperature: 0.5,
      isTrainable: true,
      trainingData: 'customer_service_dataset_v1.json'
    },
    {
      id: 'BOT003',
      name: 'مساعد المطعم',
      description: 'بوت متخصص في طلبات المطعم وخدمة الغرف',
      type: 'restaurant',
      status: 'paused',
      language: 'ar',
      model: 'GPT-4',
      responses: 1856,
      accuracy: 89.3,
      avgResponseTime: 1.5,
      lastActive: '2025-01-14T20:15:00',
      createdDate: '2024-08-20',
      features: ['قائمة الطعام', 'طلب خدمة الغرف', 'حجز طاولة', 'تفضيلات الطعام'],
      triggers: ['طعام', 'مطعم', 'قائمة', 'طلب', 'جوعان'],
      apiEndpoint: 'https://api.hotel.com/bots/restaurant',
      webhookUrl: 'https://webhook.hotel.com/restaurant',
      maxTokens: 1536,
      temperature: 0.6,
      isTrainable: true,
      trainingData: 'restaurant_dataset_v1.json'
    },
    {
      id: 'BOT004',
      name: 'بوت الصيانة والتقنية',
      description: 'بوت للتعامل مع طلبات الصيانة والدعم التقني',
      type: 'maintenance',
      status: 'inactive',
      language: 'ar',
      model: 'GPT-3.5',
      responses: 432,
      accuracy: 85.7,
      avgResponseTime: 2.1,
      lastActive: '2025-01-12T09:30:00',
      createdDate: '2024-11-05',
      features: ['طلبات الصيانة', 'مشاكل تقنية', 'إرشادات الاستخدام', 'بلاغات العطل'],
      triggers: ['صيانة', 'عطل', 'مشكلة تقنية', 'إصلاح', 'لا يعمل'],
      apiEndpoint: 'https://api.hotel.com/bots/maintenance',
      webhookUrl: 'https://webhook.hotel.com/maintenance',
      maxTokens: 1024,
      temperature: 0.3,
      isTrainable: false,
      trainingData: null
    }
  ];

  const getStatusBadge = (status) => {
    const statuses = {
      'active': { label: 'نشط', class: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      'paused': { label: 'متوقف مؤقتاً', class: 'bg-yellow-500/20 text-yellow-400', icon: Pause },
      'inactive': { label: 'غير نشط', class: 'bg-gray-500/20 text-gray-400', icon: AlertTriangle },
      'error': { label: 'خطأ', class: 'bg-red-500/20 text-red-400', icon: AlertTriangle }
    };
    return statuses[status] || statuses.inactive;
  };

  const getTypeBadge = (type) => {
    const types = {
      'reservation': { label: 'حجوزات', class: 'bg-blue-500/20 text-blue-400' },
      'customer_service': { label: 'خدمة عملاء', class: 'bg-purple-500/20 text-purple-400' },
      'restaurant': { label: 'مطعم', class: 'bg-orange-500/20 text-orange-400' },
      'maintenance': { label: 'صيانة', class: 'bg-red-500/20 text-red-400' },
      'general': { label: 'عام', class: 'bg-gray-500/20 text-gray-400' }
    };
    return types[type] || types.general;
  };

  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && bot.status === selectedFilter;
  });

  const toggleBotStatus = (botId, currentStatus) => {
    console.log(`تغيير حالة البوت ${botId} من ${currentStatus}`);
    // هنا يمكن إضافة منطق تغيير حالة البوت
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 lg:p-6 relative overflow-hidden" dir="rtl">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة
                </Button>
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                    إدارة البوتات
                  </h1>
                  <p className="text-indigo-200/80 text-sm lg:text-base">
                    إدارة وتكوين بوتات الذكاء الاصطناعي
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsNewBotOpen(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  بوت جديد
                </Button>
                
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  استيراد
                </Button>
                
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Settings className="w-4 h-4 ml-2" />
                  إعدادات
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {botStats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 group hover:scale-105">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      stat.changeType === 'increase' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {stat.changeType === 'increase' ? <TrendingUp className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-white/80 text-sm font-medium">{stat.title}</h3>
                    <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                    <p className="text-white/60 text-xs">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search & Filter */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <Input
                      placeholder="البحث في البوتات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { key: 'all', label: 'الكل', count: bots.length },
                    { key: 'active', label: 'نشط', count: bots.filter(b => b.status === 'active').length },
                    { key: 'paused', label: 'متوقف', count: bots.filter(b => b.status === 'paused').length },
                    { key: 'inactive', label: 'غير نشط', count: bots.filter(b => b.status === 'inactive').length }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      onClick={() => setSelectedFilter(filter.key)}
                      variant={selectedFilter === filter.key ? "default" : "outline"}
                      className={`whitespace-nowrap ${
                        selectedFilter === filter.key 
                          ? 'bg-indigo-500 text-white' 
                          : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBots.map((bot) => {
              const statusBadge = getStatusBadge(bot.status);
              const typeBadge = getTypeBadge(bot.type);
              
              return (
                <Card key={bot.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 group hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{bot.name}</h3>
                          <p className="text-white/60 text-sm">{bot.id}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={statusBadge.class}>
                          <statusBadge.icon className="w-3 h-3 ml-1" />
                          {statusBadge.label}
                        </Badge>
                        <Badge className={typeBadge.class}>
                          {typeBadge.label}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-white/70 text-sm mb-4 line-clamp-2">{bot.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Brain className="w-4 h-4 text-blue-400" />
                          <span className="text-white/80">{bot.model}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4 text-green-400" />
                          <span className="text-white/80">{bot.language}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="text-white/80">{bot.avgResponseTime}s</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-center">
                          <div className="text-white font-bold text-lg">{bot.responses.toLocaleString()}</div>
                          <div className="text-white/60 text-xs">ردود</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold text-lg">{bot.accuracy}%</div>
                          <div className="text-white/60 text-xs">دقة</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <h4 className="text-white/80 text-sm font-medium mb-2">المميزات:</h4>
                        <div className="flex flex-wrap gap-1">
                          {bot.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} className="bg-indigo-500/20 text-indigo-400 text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {bot.features.length > 3 && (
                            <Badge className="bg-gray-500/20 text-gray-400 text-xs">
                              +{bot.features.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white/80 text-sm font-medium mb-2">الكلمات المحفزة:</h4>
                        <div className="flex flex-wrap gap-1">
                          {bot.triggers.slice(0, 3).map((trigger, index) => (
                            <Badge key={index} className="bg-purple-500/20 text-purple-400 text-xs">
                              {trigger}
                            </Badge>
                          ))}
                          {bot.triggers.length > 3 && (
                            <Badge className="bg-gray-500/20 text-gray-400 text-xs">
                              +{bot.triggers.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-white/60 text-xs mb-4">
                      آخر نشاط: {new Date(bot.lastActive).toLocaleDateString('ar-SA')} {new Date(bot.lastActive).toLocaleTimeString('ar-SA', {hour: '2-digit', minute: '2-digit'})}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => toggleBotStatus(bot.id, bot.status)}
                        className={`flex-1 ${
                          bot.status === 'active' 
                            ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30' 
                            : 'bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30'
                        }`}
                      >
                        {bot.status === 'active' ? <Pause className="w-4 h-4 ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                        {bot.status === 'active' ? 'إيقاف' : 'تشغيل'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedBot(bot)}
                        variant="outline"
                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                        onClick={() => {
                          setSelectedBot(bot);
                          setIsEditMode(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredBots.length === 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="text-center py-12">
                <Bot className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">لا توجد بوتات</h3>
                <p className="text-white/60">لم يتم العثور على بوتات تطابق البحث</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-3">
                <Activity className="w-6 h-6 text-indigo-400" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setIsNewBotOpen(true)}
                  className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 h-20 flex flex-col gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">إنشاء بوت</span>
                </Button>
                
                <Button 
                  className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 h-20 flex flex-col gap-2"
                >
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">الإحصائيات</span>
                </Button>
                
                <Button 
                  className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 h-20 flex flex-col gap-2"
                >
                  <Brain className="w-6 h-6" />
                  <span className="text-sm">التدريب</span>
                </Button>
                
                <Button 
                  className="bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 h-20 flex flex-col gap-2"
                >
                  <Settings className="w-6 h-6" />
                  <span className="text-sm">الإعدادات العامة</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bot Details Dialog */}
        {selectedBot && !isEditMode && (
          <Dialog open={!!selectedBot} onOpenChange={() => setSelectedBot(null)}>
            <DialogContent className="bg-slate-900 border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">تفاصيل البوت - {selectedBot.name}</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">المعلومات الأساسية</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>الاسم:</strong> {selectedBot.name}</div>
                    <div><strong>المعرف:</strong> {selectedBot.id}</div>
                    <div><strong>النوع:</strong> {getTypeBadge(selectedBot.type).label}</div>
                    <div><strong>الحالة:</strong> {getStatusBadge(selectedBot.status).label}</div>
                    <div><strong>النموذج:</strong> {selectedBot.model}</div>
                    <div><strong>اللغة:</strong> {selectedBot.language}</div>
                    <div><strong>تاريخ الإنشاء:</strong> {new Date(selectedBot.createdDate).toLocaleDateString('ar-SA')}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">إحصائيات الأداء</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>عدد الردود:</strong> {selectedBot.responses.toLocaleString()}</div>
                    <div><strong>معدل الدقة:</strong> {selectedBot.accuracy}%</div>
                    <div><strong>متوسط وقت الاستجابة:</strong> {selectedBot.avgResponseTime} ثانية</div>
                    <div><strong>آخر نشاط:</strong> {new Date(selectedBot.lastActive).toLocaleDateString('ar-SA')}</div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-white font-semibold">الوصف</h4>
                  <p className="text-white/80">{selectedBot.description}</p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">المميزات</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBot.features.map((feature, index) => (
                      <Badge key={index} className="bg-indigo-500/20 text-indigo-400">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">الكلمات المحفزة</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBot.triggers.map((trigger, index) => (
                      <Badge key={index} className="bg-purple-500/20 text-purple-400">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-white font-semibold">الإعدادات التقنية</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>API Endpoint:</strong> {selectedBot.apiEndpoint}</div>
                    <div><strong>Webhook URL:</strong> {selectedBot.webhookUrl}</div>
                    <div><strong>Max Tokens:</strong> {selectedBot.maxTokens}</div>
                    <div><strong>Temperature:</strong> {selectedBot.temperature}</div>
                    <div><strong>قابل للتدريب:</strong> {selectedBot.isTrainable ? 'نعم' : 'لا'}</div>
                    <div><strong>بيانات التدريب:</strong> {selectedBot.trainingData || 'غير متوفر'}</div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={() => setSelectedBot(null)}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  إغلاق
                </Button>
                <Button 
                  onClick={() => setIsEditMode(true)}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  تعديل
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* New Bot Dialog */}
        <Dialog open={isNewBotOpen} onOpenChange={setIsNewBotOpen}>
          <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">إنشاء بوت جديد</DialogTitle>
              <DialogDescription className="text-white/70">
                قم بتكوين بوت ذكاء اصطناعي جديد
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="botName">اسم البوت</Label>
                <Input id="botName" className="bg-white/10 border-white/20 text-white" />
              </div>
              <div>
                <Label htmlFor="botType">نوع البوت</Label>
                <Select>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="reservation" className="text-white focus:bg-white/10 focus:text-white">حجوزات</SelectItem>
                    <SelectItem value="customer_service" className="text-white focus:bg-white/10 focus:text-white">خدمة عملاء</SelectItem>
                    <SelectItem value="restaurant" className="text-white focus:bg-white/10 focus:text-white">مطعم</SelectItem>
                    <SelectItem value="maintenance" className="text-white focus:bg-white/10 focus:text-white">صيانة</SelectItem>
                    <SelectItem value="general" className="text-white focus:bg-white/10 focus:text-white">عام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="botModel">نموذج الذكاء الاصطناعي</Label>
                <Select>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="اختر النموذج" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="gpt-4" className="text-white focus:bg-white/10 focus:text-white">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5" className="text-white focus:bg-white/10 focus:text-white">GPT-3.5</SelectItem>
                    <SelectItem value="claude" className="text-white focus:bg-white/10 focus:text-white">Claude</SelectItem>
                    <SelectItem value="palm" className="text-white focus:bg-white/10 focus:text-white">PaLM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="botLanguage">اللغة</Label>
                <Select>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="اختر اللغة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="ar" className="text-white focus:bg-white/10 focus:text-white">العربية</SelectItem>
                    <SelectItem value="en" className="text-white focus:bg-white/10 focus:text-white">الإنجليزية</SelectItem>
                    <SelectItem value="fr" className="text-white focus:bg-white/10 focus:text-white">الفرنسية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="botDescription">الوصف</Label>
                <Textarea id="botDescription" className="bg-white/10 border-white/20 text-white" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="botTriggers">الكلمات المحفزة (مفصولة بفواصل)</Label>
                <Input id="botTriggers" placeholder="حجز، غرفة، متاح..." className="bg-white/10 border-white/20 text-white" />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setIsNewBotOpen(false)}
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button className="bg-indigo-500 hover:bg-indigo-600">
                إنشاء البوت
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}