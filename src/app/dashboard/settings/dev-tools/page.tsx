'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Wrench,
  Code2,
  Terminal,
  Bug,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Database,
  Server,
  Cloud,
  Key,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  Settings,
  FileJson,
  Link
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DevToolsPage() {
  const [copied, setCopied] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tools = [
    {
      icon: '🔑',
      title: 'مفاتيح API',
      description: 'إدارة مفاتيح الوصول للخدمات الخارجية',
      category: 'security',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🧪',
      title: 'بيئة الاختبار',
      description: 'تجربة الميزات في بيئة آمنة',
      category: 'testing',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '📊',
      title: 'مراقبة الأداء',
      description: 'قياس سرعة التطبيق واستهلاك الموارد',
      category: 'monitoring',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🐛',
      title: 'تصحيح الأخطاء',
      description: 'أدوات debugging متقدمة',
      category: 'debugging',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: '⚡',
      title: 'Cache Manager',
      description: 'إدارة وتنظيف ذاكرة التخزين المؤقت',
      category: 'performance',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '🔄',
      title: 'WebHooks Tester',
      description: 'اختبار نقاط الاتصال الخارجية',
      category: 'integration',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const apiEndpoints = [
    { method: 'GET', path: '/api/rooms', description: 'قائمة الشقق' },
    { method: 'POST', path: '/api/bookings', description: 'إنشاء حجز' },
    { method: 'GET', path: '/api/guests', description: 'قائمة الضيوف' },
    { method: 'PUT', path: '/api/requests/:id', description: 'تحديث طلب' },
    { method: 'DELETE', path: '/api/bookings/:id', description: 'حذف حجز' }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">أدوات التطوير</h1>
              <p className="text-white/70">أدوات متقدمة للمطورين وفريق الدعم الفني</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">حالة النظام</p>
                  <p className="text-lg font-bold text-white">عامل</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Uptime</p>
                  <p className="text-lg font-bold text-white">99.9%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Response Time</p>
                  <p className="text-lg font-bold text-white">120ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">DB Size</p>
                  <p className="text-lg font-bold text-white">24.5 MB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Grid */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              الأدوات المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">{tool.icon}</div>
                    <h3 className="text-white font-bold text-lg mb-2">{tool.title}</h3>
                    <p className="text-white/70 text-sm mb-3">{tool.description}</p>
                    <Badge className="bg-white/20 text-white">{tool.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              نقاط النهاية API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apiEndpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Badge className={`${
                      endpoint.method === 'GET' ? 'bg-green-500/20 text-green-300' :
                      endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-300' :
                      endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    } font-mono`}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-white font-mono">{endpoint.path}</code>
                    <span className="text-white/60 text-sm">{endpoint.description}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => copyToClipboard(endpoint.path)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                متغيرات البيئة
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => setShowApiKeys(!showApiKeys)}
              >
                {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', value: 'AIzaSy...' },
                { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', value: 'almodif-...' },
                { key: 'OPENAI_API_KEY', value: 'sk-...' },
                { key: 'WHATSAPP_TOKEN', value: 'EAABsd...' }
              ].map((env, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex-1">
                    <p className="text-white font-mono text-sm mb-1">{env.key}</p>
                    <p className="text-white/60 font-mono text-xs">
                      {showApiKeys ? env.value : '••••••••••••••'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => copyToClipboard(env.value)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
