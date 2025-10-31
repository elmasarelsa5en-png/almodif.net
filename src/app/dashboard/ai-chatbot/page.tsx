'use client';

/**
 * AI Chatbot Dashboard
 * لوحة تحكم الشات بوت الذكي
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { chatbotService, type Conversation } from '@/lib/ai/chatbot-service';
import Link from 'next/link';

export default function AIChatbotDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'waiting' | 'resolved'>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [convs, statistics] = await Promise.all([
        chatbotService.getActiveConversations(),
        chatbotService.getChatbotStats(),
      ]);

      setConversations(convs);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    return conv.status === filter;
  });

  const statCards = [
    {
      title: 'إجمالي المحادثات',
      value: conversations.length,
      icon: MessageSquare,
      color: 'from-blue-600 to-blue-700',
      change: '+12%',
    },
    {
      title: 'معدل الثقة',
      value: stats ? `${stats.confidenceRate.toFixed(1)}%` : '0%',
      icon: CheckCircle2,
      color: 'from-green-600 to-green-700',
      change: '+5%',
    },
    {
      title: 'محادثات نشطة',
      value: conversations.filter(c => c.status === 'active').length,
      icon: Users,
      color: 'from-purple-600 to-purple-700',
      change: '+8%',
    },
    {
      title: 'متوسط وقت الرد',
      value: '< 1 ثانية',
      icon: Clock,
      color: 'from-orange-600 to-orange-700',
      change: '-15%',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Bot className="w-10 h-10 text-blue-600" />
              لوحة تحكم الشات بوت الذكي
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة ومراقبة المحادثات الذكية مع الذكاء الاصطناعي
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <Link
              href="/dashboard/settings/ai-chatbot-config"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              الإعدادات
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {card.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Intent Distribution */}
      {stats?.intentDistribution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              توزيع الاستفسارات
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.intentDistribution).map(([intent, count]: [string, any]) => (
              <div key={intent} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1 capitalize">{intent.replace(/_/g, ' ')}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sentiment Analysis */}
      {stats?.sentimentDistribution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">تحليل المشاعر</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-4xl mb-2">😊</p>
              <p className="text-sm text-gray-600 mb-1">إيجابي</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.sentimentDistribution.positive || 0}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-4xl mb-2">😐</p>
              <p className="text-sm text-gray-600 mb-1">محايد</p>
              <p className="text-2xl font-bold text-gray-600">
                {stats.sentimentDistribution.neutral || 0}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl text-center">
              <p className="text-4xl mb-2">😞</p>
              <p className="text-sm text-gray-600 mb-1">سلبي</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.sentimentDistribution.negative || 0}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Conversations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">المحادثات الأخيرة</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">الكل</option>
              <option value="active">نشط</option>
              <option value="waiting">في الانتظار</option>
              <option value="resolved">تم الحل</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد محادثات</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {conv.guestName?.charAt(0) || 'N'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {conv.guestName || 'نزيل غير معروف'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {conv.channel} • {conv.language === 'ar' ? 'عربي' : 'English'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        conv.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : conv.status === 'waiting'
                          ? 'bg-yellow-100 text-yellow-700'
                          : conv.status === 'resolved'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {conv.status === 'active'
                        ? 'نشط'
                        : conv.status === 'waiting'
                        ? 'في الانتظار'
                        : conv.status === 'resolved'
                        ? 'تم الحل'
                        : 'تم التصعيد'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {conv.lastMessageAt.toDate().toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
                {conv.summary && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{conv.summary}</p>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
