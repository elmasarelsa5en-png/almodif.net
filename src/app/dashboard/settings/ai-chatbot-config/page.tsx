'use client';

/**
 * AI Chatbot Configuration Page
 * صفحة إعدادات الشات بوت الذكي
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Settings,
  MessageSquare,
  Zap,
  Globe,
  Shield,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { chatbotService, type AIProvider, type ChatbotConfig } from '@/lib/ai/chatbot-service';
import { Timestamp } from 'firebase/firestore';

export default function AIChatbotConfig() {
  const [config, setConfig] = useState<Partial<ChatbotConfig>>({
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 500,
    isActive: true,
    autoReply: true,
    handoffToHuman: true,
    handoffKeywords: ['موظف', 'إنسان', 'مدير', 'شخص', 'human', 'staff', 'manager', 'person'],
    supportedLanguages: ['ar', 'en'],
    confidenceThreshold: 0.7,
    contextWindow: 10,
    enableSentiment: true,
    enableIntentDetection: true,
    enableEntityExtraction: true,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const existingConfig = await chatbotService.getConfig();
      if (existingConfig) {
        setConfig(existingConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await chatbotService.saveConfig(config);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const providers = [
    {
      value: 'openai' as AIProvider,
      label: 'OpenAI',
      icon: '🤖',
      models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
      docs: 'https://platform.openai.com/docs',
    },
    {
      value: 'anthropic' as AIProvider,
      label: 'Anthropic Claude',
      icon: '🧠',
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      docs: 'https://docs.anthropic.com',
    },
    {
      value: 'google' as AIProvider,
      label: 'Google Gemini',
      icon: '✨',
      models: ['gemini-pro', 'gemini-pro-vision'],
      docs: 'https://ai.google.dev/docs',
    },
  ];

  const selectedProvider = providers.find(p => p.value === config.provider);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
          <Bot className="w-10 h-10 text-blue-600" />
          إعدادات الشات بوت الذكي
        </h1>
        <p className="text-gray-600 mt-2">
          قم بتكوين الذكاء الاصطناعي وخصص سلوك الشات بوت
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Provider Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              اختر مزود الذكاء الاصطناعي
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {providers.map((provider) => (
                <button
                  key={provider.value}
                  onClick={() => setConfig({ ...config, provider: provider.value, model: provider.models[0] })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    config.provider === provider.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{provider.icon}</div>
                  <h3 className="font-semibold text-gray-900">{provider.label}</h3>
                </button>
              ))}
            </div>

            {/* API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مفتاح API
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <a
                href={selectedProvider?.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1"
              >
                احصل على مفتاح API
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Model Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النموذج
              </label>
              <select
                value={config.model || ''}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedProvider?.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                درجة الإبداع (Temperature): {config.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature || 0.7}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>دقيق</span>
                <span>متوازن</span>
                <span>إبداعي</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                أقصى عدد من الكلمات (Max Tokens)
              </label>
              <input
                type="number"
                value={config.maxTokens || 500}
                onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                min="100"
                max="2000"
                step="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </motion.div>

          {/* Behavior Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              إعدادات السلوك
            </h2>

            {/* Toggle Switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">تفعيل الشات بوت</h3>
                    <p className="text-sm text-gray-600">تشغيل/إيقاف الردود التلقائية</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, isActive: !config.isActive })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    config.isActive ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      config.isActive ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">الرد التلقائي</h3>
                    <p className="text-sm text-gray-600">إرسال ردود فورية للرسائل</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, autoReply: !config.autoReply })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    config.autoReply ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      config.autoReply ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">التحويل للموظف</h3>
                    <p className="text-sm text-gray-600">التحويل التلقائي عند الحاجة</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, handoffToHuman: !config.handoffToHuman })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    config.handoffToHuman ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      config.handoffToHuman ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">اكتشاف النية</h3>
                    <p className="text-sm text-gray-600">تحليل هدف الرسالة</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, enableIntentDetection: !config.enableIntentDetection })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    config.enableIntentDetection ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      config.enableIntentDetection ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">تحليل المشاعر</h3>
                    <p className="text-sm text-gray-600">كشف مشاعر العميل</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, enableSentiment: !config.enableSentiment })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    config.enableSentiment ? 'bg-pink-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      config.enableSentiment ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Confidence Threshold */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عتبة الثقة (Confidence): {config.confidenceThreshold}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.confidenceThreshold || 0.7}
                onChange={(e) => setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                الحد الأدنى من الثقة للرد. إذا كان أقل، سيتم التحويل لموظف.
              </p>
            </div>

            {/* Context Window */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نافذة السياق: {config.contextWindow} رسائل
              </label>
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={config.contextWindow || 10}
                onChange={(e) => setConfig({ ...config, contextWindow: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                عدد الرسائل السابقة التي يتذكرها الشات بوت.
              </p>
            </div>
          </motion.div>

          {/* Custom Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-green-600" />
              تعليمات مخصصة
            </h2>
            <textarea
              value={config.customInstructions || ''}
              onChange={(e) => setConfig({ ...config, customInstructions: e.target.value })}
              placeholder="أضف تعليمات إضافية لتخصيص سلوك الشات بوت..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ الإعدادات
                </>
              )}
            </button>

            {/* Save Status */}
            {saveStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">تم الحفظ بنجاح!</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">حدث خطأ أثناء الحفظ</span>
              </div>
            )}
          </motion.div>

          {/* Quick Guide */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-100"
          >
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              دليل سريع
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <p className="text-gray-700">اختر مزود الذكاء الاصطناعي (OpenAI، Claude، Gemini)</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <p className="text-gray-700">أدخل مفتاح API من حساب المزود</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <p className="text-gray-700">اختر النموذج المناسب لاحتياجاتك</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <p className="text-gray-700">اضبط درجة الإبداع والسلوك</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">5.</span>
                <p className="text-gray-700">فعّل الميزات المطلوبة</p>
              </div>
            </div>
          </motion.div>

          {/* Documentation Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="font-bold text-gray-900 mb-4">روابط مفيدة</h3>
            <div className="space-y-2">
              {providers.map((provider) => (
                <a
                  key={provider.value}
                  href={provider.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <span>{provider.icon}</span>
                    {provider.label} Docs
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
