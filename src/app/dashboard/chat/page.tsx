'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Search,
  Plus,
  Settings,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  ArrowLeft,
  Users,
  Clock,
  CheckCheck,
  Check,
  Bell,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'file' | 'image';
}

interface Conversation {
  id: string;
  participants: Array<{ id: string; name: string; avatar?: string }>;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  name?: string;
}

interface Notification {
  id: string;
  conversationId: string;
  fromUserId: string;
  fromUserName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations and employees
  useEffect(() => {
    loadConversations();
    loadEmployees();
    loadNotifications();
    // تحديث الإشعارات كل 2 ثانية
    const interval = setInterval(() => {
      loadNotifications();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = () => {
    try {
      const saved = localStorage.getItem('chat_conversations');
      if (saved) {
        const data = JSON.parse(saved);
        setConversations(data);
        if (data.length > 0) {
          selectConversation(data[0]);
        }
      } else {
        // بدء بدون محادثات - المستخدم يضيف محادثات جديدة
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadEmployees = () => {
    try {
      const saved = localStorage.getItem('hr_employees');
      if (saved) {
        const employeesData = JSON.parse(saved);
        setEmployees(employeesData);
      } else {
        // بدء بدون موظفين - المستخدم يضيف موظفين من صفحة الموارد البشرية
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadNotifications = () => {
    try {
      const saved = localStorage.getItem(`chat_notifications_${user?.username}`);
      if (saved) {
        const data = JSON.parse(saved);
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const addNotification = (conversationId: string, fromUserId: string, fromUserName: string, message: string) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      conversationId,
      fromUserId,
      fromUserName,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    localStorage.setItem(`chat_notifications_${user?.username}`, JSON.stringify(updated));
    // تشغيل صوت إشعار إن أمكن
    playNotificationSound();
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
      audio.play().catch(() => {});
    } catch (e) {
      // صامت إذا فشل
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`chat_notifications_${user?.username}`, JSON.stringify(updated));
  };

  const deleteNotification = (notificationId: string) => {
    const updated = notifications.filter((n) => n.id !== notificationId);
    setNotifications(updated);
    localStorage.setItem(`chat_notifications_${user?.username}`, JSON.stringify(updated));
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    // Mark as read
    const updated = conversations.map((c) =>
      c.id === conversation.id ? { ...c, unreadCount: 0 } : c
    );
    setConversations(updated);
    localStorage.setItem('chat_conversations', JSON.stringify(updated));

    // وضع علامة على رسائل المحادثة كمقروءة
    markMessagesAsRead(conversation.id);
  };

  const markMessagesAsRead = (conversationId: string) => {
    try {
      const saved = localStorage.getItem(`chat_messages_${conversationId}`);
      if (saved) {
        const msgs: Message[] = JSON.parse(saved);
        const updated = msgs.map((m) =>
          m.sender.id !== user?.username ? { ...m, read: true } : m
        );
        localStorage.setItem(`chat_messages_${conversationId}`, JSON.stringify(updated));
        setMessages(updated);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const loadMessages = (conversationId: string) => {
    try {
      const saved = localStorage.getItem(`chat_messages_${conversationId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConversation || !user) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: {
        id: user.username,
        name: user.name,
      },
      content: messageInput,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_messages_${selectedConversation.id}`, JSON.stringify(updatedMessages));

    // Update conversation last message
    const updatedConversations = conversations.map((c) =>
      c.id === selectedConversation.id
        ? {
            ...c,
            lastMessage: messageInput,
            lastMessageTime: new Date().toISOString(),
          }
        : c
    );
    setConversations(updatedConversations);
    localStorage.setItem('chat_conversations', JSON.stringify(updatedConversations));

    // إرسال إشعار للموظف الآخر
    const otherParticipant = selectedConversation.participants.find((p) => p.id !== user?.username);
    if (otherParticipant) {
      const notificationsKey = `chat_notifications_${otherParticipant.id}`;
      try {
        const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          conversationId: selectedConversation.id,
          fromUserId: user.username,
          fromUserName: user.name,
          message: messageInput,
          timestamp: new Date().toISOString(),
          read: false,
        };
        const updatedNotifications = [newNotification, ...existingNotifications];
        localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }

    setMessageInput('');
  };

  const startNewChat = (employee: any) => {
    const conversationId = `conv-${Date.now()}`;
    const newConversation: Conversation = {
      id: conversationId,
      participants: [
        { id: user?.username || '', name: user?.name || '' },
        { id: employee.id, name: employee.name, avatar: employee.avatar },
      ],
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    };

    const updated = [newConversation, ...conversations];
    setConversations(updated);
    localStorage.setItem('chat_conversations', JSON.stringify(updated));
    selectConversation(newConversation);
    setShowNewChat(false);
  };

  const filteredConversations = conversations.filter((c) => {
    const otherParticipant = c.participants.find((p) => p.id !== user?.username);
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  const otherParticipant = selectedConversation
    ? selectedConversation.participants.find((p) => p.id !== user?.username)
    : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between relative z-20">
            <div>
              <h1 className="text-4xl font-bold text-white">محادثات داخلية</h1>
              <p className="text-purple-200 mt-1">التواصل المباشر مع فريق العمل</p>
            </div>
            {/* زر الإشعارات */}
            <div className="relative z-[200]">
              <Button
                onClick={() => setShowNotifications(!showNotifications)}
                variant="outline"
                className="relative border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </Button>

              {/* قائمة الإشعارات */}
              {showNotifications && (
                <div className="absolute top-full mt-2 -right-20 w-96 bg-slate-800 border-2 border-blue-500/50 rounded-lg shadow-2xl z-[300] max-h-96 overflow-y-auto backdrop-blur-sm">
                  <div className="sticky top-0 bg-slate-800/95 border-b border-slate-700 p-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">الإشعارات</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowNotifications(false)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm">لا توجد إشعارات</div>
                  ) : (
                    <div className="divide-y divide-slate-700">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                            notif.read ? 'hover:bg-slate-700/30 bg-slate-800' : 'bg-blue-500/15 hover:bg-blue-500/25'
                          }`}
                        >
                          <div
                            onClick={() => {
                              const conv = conversations.find((c) => c.id === notif.conversationId);
                              if (conv) {
                                selectConversation(conv);
                                markNotificationAsRead(notif.id);
                                setShowNotifications(false);
                              }
                            }}
                            className="flex-1 min-w-0"
                          >
                            <p className="text-sm font-semibold text-white">{notif.fromUserName}</p>
                            <p className="text-xs text-slate-300 truncate">{notif.message}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(notif.timestamp).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="text-red-400 hover:bg-red-500/20 h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] relative z-10">
            {/* Conversations List */}
            <Card className="bg-slate-800/50 border-slate-700 flex flex-col">
              <CardHeader className="border-b border-slate-700">
                <div className="space-y-4">
                  <CardTitle className="text-white">المحادثات</CardTitle>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="ابحث عن محادثة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <Button
                    onClick={() => setShowNewChat(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    محادثة جديدة
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-0">
                {showNewChat && (
                  <div className="p-4 border-b border-slate-700 space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowNewChat(false)}
                      className="w-full justify-start text-gray-300 hover:bg-slate-700"
                    >
                      <ArrowLeft className="w-4 h-4 ml-2" />
                      رجوع
                    </Button>
                    <div className="text-sm text-gray-400 font-semibold px-2 py-1">اختر موظف:</div>
                    {employees
                      .filter((e) => e.id !== user?.username)
                      .map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => startNewChat(emp)}
                          className="w-full text-right p-3 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <p className="text-white font-semibold text-sm">{emp.name}</p>
                          <p className="text-gray-400 text-xs">{emp.position || emp.department || ''}</p>
                        </button>
                      ))}
                  </div>
                )}

                <div className="divide-y divide-slate-700">
                  {filteredConversations.map((conv) => {
                    const other = conv.participants.find((p) => p.id !== user?.username);
                    const isSelected = selectedConversation?.id === conv.id;

                    return (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className={`w-full text-right p-4 transition-colors ${
                          isSelected
                            ? 'bg-blue-500/20 border-l-4 border-blue-500'
                            : 'hover:bg-slate-700/50 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{other?.name}</p>
                            <p className="text-gray-400 text-xs truncate">{conv.lastMessage || 'لا توجد رسائل بعد'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs">{formatTime(conv.lastMessageTime)}</p>
                            {conv.unreadCount > 0 && (
                              <span className="inline-block bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {filteredConversations.length === 0 && !showNewChat && (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-400 text-sm">لا توجد محادثات</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Area */}
            {selectedConversation && otherParticipant ? (
              <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b border-slate-700 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {otherParticipant.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{otherParticipant.name}</h3>
                        <p className="text-gray-400 text-xs">نشط الآن</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-gray-300 hover:bg-slate-700">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-300 hover:bg-slate-700">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-300 hover:bg-slate-700">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-800/30 to-slate-900/50">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <Smile className="w-12 h-12 text-gray-500 opacity-30 mb-3" />
                      <p className="text-gray-500 text-sm">ابدأ المحادثة</p>
                      <p className="text-gray-600 text-xs mt-1">
                        أرسل رسالة أولى إلى {otherParticipant.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const isOwn = msg.sender.id === user?.username;
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-blue-500/80 text-white rounded-bl-lg'
                                  : 'bg-slate-700/50 text-gray-200 rounded-br-lg'
                              }`}
                            >
                              <p className="text-sm break-words">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'justify-end' : 'justify-start'} ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                                <span>{formatTime(msg.timestamp)}</span>
                                {isOwn && msg.read && <CheckCheck className="w-3 h-3" />}
                                {isOwn && !msg.read && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-slate-700 p-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="اكتب رسالة..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:bg-slate-700">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:bg-slate-700">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-30" />
                  <p className="text-gray-400 text-lg">اختر محادثة أو ابدأ محادثة جديدة</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
