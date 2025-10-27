'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  MessageSquare,
  Plus,
  Bot,
  ClipboardList,
  Send,
  X,
  ArrowRight,
  Phone,
  Clock,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Briefcase,
  LogOut,
  LogIn,
  BarChart3,
  Send as TransferIcon,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ChatStage = 'trial' | 'follow-up' | 'purchase' | 'post-sale' | 'rejected';
type ChatStatus = 'open' | 'closed' | 'pending' | 'on-hold';
type ChatPriority = 'low' | 'medium' | 'high' | 'urgent';
type AgentStatus = 'available' | 'busy' | 'offline';

interface Employee {
  id: string;
  name: string;
  email: string;
  status: AgentStatus;
  totalChats: number;
  avgResponseTime: number;
  performanceScore: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsappNumber: string;
  stage: ChatStage;
  createdAt: string;
  totalChats: number;
  issuesCount: number;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'agent' | 'customer';
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Chat {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  currentAgentId?: string;
  currentAgentName?: string;
  status: ChatStatus;
  priority: ChatPriority;
  stage: ChatStage;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  unreadCount: number;
  isAssigned: boolean;
  previousAgents: Array<{
    agentId: string;
    agentName: string;
    transferredAt: string;
  }>;
  notes: string;
}

// ============================================
// MOCK DATA - سيتم استبداله بـ Firestore لاحقاً
// ============================================

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    status: 'available',
    totalChats: 24,
    avgResponseTime: 120,
    performanceScore: 95
  },
  {
    id: '2',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    status: 'busy',
    totalChats: 18,
    avgResponseTime: 90,
    performanceScore: 92
  },
  {
    id: '3',
    name: 'محمود حسن',
    email: 'mahmoud@example.com',
    status: 'offline',
    totalChats: 15,
    avgResponseTime: 150,
    performanceScore: 88
  }
];

const MOCK_CHATS: Chat[] = [
  {
    id: 'chat_1',
    customerId: 'cust_1',
    customerName: 'علي عبدالله',
    customerPhone: '+966501234567',
    currentAgentId: '1',
    currentAgentName: 'أحمد محمد',
    status: 'open',
    priority: 'high',
    stage: 'trial',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    messageCount: 12,
    unreadCount: 2,
    isAssigned: true,
    previousAgents: [],
    notes: 'عميل جديد يحتاج مساعدة في الإعدادات الأساسية'
  },
  {
    id: 'chat_2',
    customerId: 'cust_2',
    customerName: 'سارة محمود',
    customerPhone: '+966502345678',
    status: 'open',
    priority: 'medium',
    stage: 'follow-up',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messageCount: 8,
    unreadCount: 0,
    isAssigned: false,
    previousAgents: [],
    notes: 'متابعة عملية الشراء'
  },
  {
    id: 'chat_3',
    customerId: 'cust_3',
    customerName: 'محمد عمر',
    customerPhone: '+966503456789',
    currentAgentId: '2',
    currentAgentName: 'فاطمة علي',
    status: 'closed',
    priority: 'low',
    stage: 'purchase',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lastMessageAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    messageCount: 5,
    unreadCount: 0,
    isAssigned: true,
    previousAgents: [],
    notes: 'تم إتمام البيع بنجاح'
  }
];

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export default function WhatsAppCRMPage() {
  const router = useRouter();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(employees[0]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');

  // DIALOGS
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  // FORM STATES
  const [transferToAgentId, setTransferToAgentId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<ChatPriority>('medium');

  // ============================================
  // OPEN CHATS (لم يتم تحويلها)
  // ============================================

  const openUnassignedChats = useMemo(() => {
    return chats.filter(c => c.status === 'open' && !c.isAssigned);
  }, [chats]);

  const myChats = useMemo(() => {
    return chats.filter(c => c.currentAgentId === currentUser?.id && c.status === 'open');
  }, [chats, currentUser]);

  const allOpenChats = useMemo(() => {
    return chats.filter(c => c.status === 'open');
  }, [chats]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAssignChat = (chat: Chat) => {
    if (!currentUser) return;

    const updatedChat: Chat = {
      ...chat,
      currentAgentId: currentUser.id,
      currentAgentName: currentUser.name,
      isAssigned: true
    };

    setChats(prev =>
      prev.map(c => (c.id === chat.id ? updatedChat : c))
    );

    setSelectedChat(updatedChat);

    // تحديث إحصائيات الموظف
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === currentUser.id
          ? { ...emp, totalChats: emp.totalChats + 1 }
          : emp
      )
    );

    alert(`تم تحويل المحادثة إليك! 🎉`);
  };

  const handleTransferChat = () => {
    if (!selectedChat || !transferToAgentId) return;

    const targetAgent = employees.find(e => e.id === transferToAgentId);
    if (!targetAgent) return;

    const updatedChat: Chat = {
      ...selectedChat,
      currentAgentId: transferToAgentId,
      currentAgentName: targetAgent.name,
      previousAgents: [
        ...selectedChat.previousAgents,
        {
          agentId: selectedChat.currentAgentId || 'unknown',
          agentName: selectedChat.currentAgentName || 'System',
          transferredAt: new Date().toISOString()
        }
      ]
    };

    setChats(prev =>
      prev.map(c => (c.id === selectedChat.id ? updatedChat : c))
    );

    setSelectedChat(updatedChat);
    setShowTransferDialog(false);
    setTransferToAgentId('');
    setTransferReason('');

    alert(`تم تحويل المحادثة إلى ${targetAgent.name}`);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat || !currentUser) return;

    const newMessage: Message = {
      id: uid(),
      chatId: selectedChat.id,
      senderId: currentUser.id,
      senderType: 'agent',
      senderName: currentUser.name,
      content: messageInput,
      timestamp: new Date().toISOString(),
      isRead: true
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');

    // تحديث آخر رسالة
    setChats(prev =>
      prev.map(c =>
        c.id === selectedChat.id
          ? {
              ...c,
              lastMessageAt: newMessage.timestamp,
              messageCount: c.messageCount + 1
            }
          : c
      )
    );
  };

  const handleCloseChat = () => {
    if (!selectedChat) return;

    setChats(prev =>
      prev.map(c =>
        c.id === selectedChat.id
          ? { ...c, status: 'closed', isAssigned: false }
          : c
      )
    );

    setSelectedChat(null);
    alert('تم إغلاق المحادثة بنجاح');
  };

  const handleDeleteChat = (chatId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }
      alert('تم حذف المحادثة');
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400';
      case 'busy':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'offline':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority: ChatPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">نظام CRM الدعم الفني</h1>
            <p className="text-green-200/80 text-sm">إدارة محادثات WhatsApp المحترفة</p>
          </div>
        </div>

        <Button
          onClick={() => router.back()}
          variant="outline"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          <ArrowRight className="ml-2 w-4 h-4" />
          العودة
        </Button>
      </div>

      {/* Current Agent Info */}
      {currentUser && (
        <Card className="mb-6 bg-gradient-to-r from-slate-800/50 to-purple-800/50 border-white/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">الموظف الحالي</p>
                  <p className="text-white font-semibold">{currentUser.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={`${getStatusColor(currentUser.status)}`}>
                  {currentUser.status === 'available' && 'متاح'}
                  {currentUser.status === 'busy' && 'مشغول'}
                  {currentUser.status === 'offline' && 'غير متصل'}
                </Badge>
                <div>
                  <p className="text-white/60 text-xs">الحالة</p>
                  <p className="text-white font-semibold text-sm">
                    {currentUser.status === 'available' && '✓ جاهز للرد'}
                    {currentUser.status === 'busy' && '⏱️ قيد المحادثة'}
                    {currentUser.status === 'offline' && '✕ غير متصل'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-white/60 text-xs">إجمالي المحادثات</p>
                <p className="text-white font-semibold text-2xl">{currentUser.totalChats}</p>
              </div>

              <div>
                <p className="text-white/60 text-xs">درجة الأداء</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <p className="text-green-400 font-semibold">{currentUser.performanceScore}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Chats List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setShowNewChatDialog(true)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Plus className="ml-2 w-4 h-4" />
              محادثة جديدة
            </Button>

            <Button
              onClick={() => setShowStatsDialog(true)}
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Available Chats */}
          {openUnassignedChats.length > 0 && (
            <Card className="bg-white/5 border-white/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  محادثات بدون تحويل ({openUnassignedChats.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {openUnassignedChats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => handleAssignChat(chat)}
                    className="w-full p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{chat.customerName}</p>
                        <p className="text-yellow-200/80 text-xs truncate">{chat.customerPhone}</p>
                      </div>
                      <Badge className="bg-yellow-500 text-black">جديدة</Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* My Chats */}
          <Card className="bg-white/5 border-white/20">
            <CardHeader>
              <CardTitle className="text-lg text-white">محادثاتي ({myChats.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {myChats.length === 0 ? (
                <p className="text-white/60 text-sm text-center py-4">لا توجد محادثات مفتوحة</p>
              ) : (
                myChats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-3 rounded-lg transition-all text-left ${
                      selectedChat?.id === chat.id
                        ? 'bg-green-500/20 border-green-500/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    } border`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{chat.customerName}</p>
                        <p className="text-white/60 text-xs truncate">{chat.customerPhone}</p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white">{chat.unreadCount}</Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Chat Detail */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <Card className="bg-white/5 border-white/20 flex flex-col h-96">
              {/* Chat Header */}
              <CardHeader className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">
                      {selectedChat.customerName}
                    </CardTitle>
                    <CardDescription className="text-white/60 text-sm">
                      {selectedChat.customerPhone}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(selectedChat.priority)}>
                      {selectedChat.priority === 'urgent' && 'عاجل'}
                      {selectedChat.priority === 'high' && 'مرتفع'}
                      {selectedChat.priority === 'medium' && 'متوسط'}
                      {selectedChat.priority === 'low' && 'منخفض'}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {selectedChat.messageCount} رسالة
                    </Badge>
                  </div>
                </div>

                {/* Chat Actions */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Button
                    onClick={() => setShowTransferDialog(true)}
                    size="sm"
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <TransferIcon className="ml-1 w-3 h-3" />
                    تحويل
                  </Button>

                  <Button
                    onClick={() => setShowTaskDialog(true)}
                    size="sm"
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <ClipboardList className="ml-1 w-3 h-3" />
                    مهمة
                  </Button>

                  <Button
                    onClick={handleCloseChat}
                    size="sm"
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <CheckCircle className="ml-1 w-3 h-3" />
                    إغلاق
                  </Button>

                  <Button
                    onClick={() => handleDeleteChat(selectedChat.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="ml-1 w-3 h-3" />
                    حذف
                  </Button>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto py-4 space-y-3">
                <div className="text-white/60 text-xs text-center py-2">
                  ✓ بدء المحادثة: {new Date(selectedChat.createdAt).toLocaleString('ar')}
                </div>

                {messages
                  .filter(m => m.chatId === selectedChat.id)
                  .map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.senderType === 'agent'
                            ? 'bg-green-500/20 text-green-100'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        <p className="text-xs opacity-70 mb-1">{msg.senderName}</p>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-50 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString('ar')}
                        </p>
                      </div>
                    </div>
                  ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-white/10 p-4 flex gap-2">
                <Input
                  placeholder="اكتب رسالتك..."
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="bg-white/5 border-white/20 flex items-center justify-center h-96">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60 mb-2">لم تختر أي محادثة بعد</p>
                <p className="text-white/40 text-sm">اختر محادثة من القائمة لبدء الرد</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Transfer Dialog */}
      {showTransferDialog && selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-slate-900 to-purple-900 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">تحويل المحادثة</CardTitle>
              <CardDescription className="text-white/60">اختر الموظف الذي تريد تحويل المحادثة إليه</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">الموظف</label>
                <select
                  value={transferToAgentId}
                  onChange={e => setTransferToAgentId(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">-- اختر موظف --</option>
                  {employees
                    .filter(e => e.id !== currentUser?.id)
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.status})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">السبب</label>
                <Textarea
                  placeholder="اكتب سبب التحويل..."
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  rows={3}
                />
              </div>
            </CardContent>
            <div className="flex gap-2 p-4 border-t border-white/10">
              <Button
                onClick={() => {
                  setShowTransferDialog(false);
                  setTransferToAgentId('');
                  setTransferReason('');
                }}
                variant="outline"
                className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleTransferChat}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                تحويل
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Stats Dialog */}
      {showStatsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full bg-gradient-to-br from-slate-900 to-purple-900 border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">إحصائيات الأداء</CardTitle>
                <button onClick={() => setShowStatsDialog(false)} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {employees.map(emp => (
                  <div key={emp.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-white/60 text-xs mb-1">{emp.name}</p>
                    <p className="text-white font-bold text-lg">{emp.totalChats}</p>
                    <p className="text-white/40 text-xs">محادثات</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
