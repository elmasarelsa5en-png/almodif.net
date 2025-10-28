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
  Loader2,
  Edit2,
  FileText,
  Image as ImageIcon,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PermissionGuard } from '@/components/PermissionGuard';
import {
  Chat,
  ChatMessage,
  OnlineStatus,
  getOrCreateChat,
  sendMessage as sendFirebaseMessage,
  markMessagesAsRead,
  setTypingStatus,
  updateOnlineStatus,
  subscribeToChats,
  subscribeToMessages,
  subscribeToOnlineStatus,
  subscribeToTyping,
  editMessage,
  deleteMessage,
} from '@/lib/chat';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';

interface Employee {
  id: string;
  name: string;
  email: string;
  position?: string;
  department?: string;
  avatar?: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  
  // State
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [onlineStatuses, setOnlineStatuses] = useState<{ [key: string]: OnlineStatus }>({});
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load employees from Firebase
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeesRef = collection(db, 'employees');
        const q = query(employeesRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const employeesList: Employee[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          employeesList.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            position: data.position,
            department: data.department,
            avatar: data.avatar,
          });
        });
        
        setEmployees(employeesList);
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    };

    loadEmployees();
  }, []);

  // Subscribe to user's chats
  useEffect(() => {
    if (!user?.username) return;

    console.log('🔵 Subscribing to chats for user:', user.username);
    const unsubscribe = subscribeToChats(user.username, (updatedChats) => {
      console.log('✅ Received chats update:', updatedChats.length);
      setChats(updatedChats);
    });

    return () => {
      console.log('🔴 Unsubscribing from chats');
      unsubscribe();
    };
  }, [user?.username]);

  // Subscribe to messages in selected chat
  useEffect(() => {
    if (!selectedChat) return;

    console.log('🔵 Subscribing to messages for chat:', selectedChat.id);
    const unsubscribe = subscribeToMessages(selectedChat.id, (updatedMessages) => {
      console.log('✅ Received messages update:', updatedMessages.length);
      setMessages(updatedMessages);
      
      // Mark messages as read
      if (user?.username) {
        markMessagesAsRead(selectedChat.id, user.username);
      }
    });

    return () => {
      console.log('🔴 Unsubscribing from messages');
      unsubscribe();
    };
  }, [selectedChat, user?.username]);

  // Subscribe to typing status
  useEffect(() => {
    if (!selectedChat) return;

    const unsubscribe = subscribeToTyping(selectedChat.id, (typing) => {
      setTypingUsers(typing);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  // Subscribe to online statuses
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    chats.forEach((chat) => {
      chat.participants.forEach((participantId) => {
        if (participantId !== user?.username) {
          const unsubscribe = subscribeToOnlineStatus(participantId, (status) => {
            setOnlineStatuses((prev) => ({
              ...prev,
              [participantId]: status,
            }));
          });
          unsubscribers.push(unsubscribe);
        }
      });
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [chats, user?.username]);

  // Update online status
  useEffect(() => {
    if (!user?.username) return;

    // Set online
    updateOnlineStatus(user.username, true);

    // Set offline on unmount
    return () => {
      updateOnlineStatus(user.username, false);
    };
  }, [user?.username]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedChat || !user?.username) return;

    setTypingStatus(selectedChat.id, user.username, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(selectedChat.id, user.username, false);
    }, 2000);
  };

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setShowNewChat(false);
  };

  const sendMessageHandler = async () => {
    if (!messageInput.trim() || !selectedChat || !user) return;

    try {
      setLoading(true);
      await sendFirebaseMessage(
        selectedChat.id,
        user.username,
        user.name,
        messageInput,
        'text',
        undefined,
        undefined,
        undefined // avatar - not available in User type
      );
      
      setMessageInput('');
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTypingStatus(selectedChat.id, user.username, false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('فشل إرسال الرسالة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async (employee: Employee) => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🟢 بدء محادثة جديدة:', {
        currentUser: user.username,
        currentUserName: user.name,
        otherEmployee: employee.id,
        otherEmployeeName: employee.name
      });
      
      const chatId = await getOrCreateChat(
        user.username,
        user.name,
        employee.id,
        employee.name,
        undefined, // user avatar
        employee.avatar
      );

      console.log('✅ تم إنشاء/الحصول على المحادثة:', chatId);

      // Wait a bit for subscription to update, then select the chat
      setTimeout(() => {
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          console.log('✅ تم العثور على المحادثة في القائمة');
          selectChat(chat);
        } else {
          console.log('⚠️ المحادثة غير موجودة في القائمة، انتظر التحديث...');
          // Force reload chats
          window.location.reload();
        }
      }, 500);
      
      setShowNewChat(false);
    } catch (error) {
      console.error('❌ خطأ في إنشاء المحادثة:', error);
      alert('فشل إنشاء المحادثة. حاول مرة أخرى.\n\nالخطأ: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return;

    try {
      await editMessage(messageId, editingContent);
      setEditingMessageId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Error editing message:', error);
      alert('فشل تعديل الرسالة. حاول مرة أخرى.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChat) return;
    
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      await deleteMessage(messageId, selectedChat.id);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('فشل حذف الرسالة. حاول مرة أخرى.');
    }
  };

  const filteredChats = chats.filter((chat) => {
    const otherParticipantId = chat.participants.find((id) => id !== user?.username);
    if (!otherParticipantId) return false;
    
    const otherParticipantName = chat.participantNames[otherParticipantId] || '';
    return otherParticipantName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  const getOtherParticipant = (chat: Chat) => {
    const otherParticipantId = chat.participants.find((id) => id !== user?.username);
    if (!otherParticipantId) return null;

    return {
      id: otherParticipantId,
      name: chat.participantNames[otherParticipantId] || 'Unknown',
      avatar: chat.participantAvatars?.[otherParticipantId],
    };
  };

  const isUserOnline = (userId: string) => {
    return onlineStatuses[userId]?.online || false;
  };

  const isOtherUserTyping = () => {
    if (!selectedChat || !user) return false;
    
    const otherParticipant = getOtherParticipant(selectedChat);
    if (!otherParticipant) return false;

    return typingUsers[otherParticipant.id] || false;
  };

  const otherParticipant = selectedChat ? getOtherParticipant(selectedChat) : null;

  return (
    <ProtectedRoute>
      <PermissionGuard permission="access_chat" fallback="page">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6" dir="rtl">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between relative z-20">
            <div>
              <h1 className="text-4xl font-bold text-white">محادثات الموظفين</h1>
              <p className="text-purple-200 mt-1">التواصل المباشر والاحترافي مع فريق العمل</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] relative z-10">
            {/* Conversations List */}
            <Card className="bg-slate-800/50 border-slate-700 flex flex-col">
              <CardHeader className="border-b border-slate-700">
                <div className="space-y-4">
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>المحادثات</span>
                    {chats.length > 0 && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                        {chats.length}
                      </span>
                    )}
                  </CardTitle>
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
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 ml-2" />
                    )}
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
                          disabled={loading}
                          className="w-full text-right p-3 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-3"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                              {emp.name.charAt(0)}
                            </div>
                            {isUserOnline(emp.id) && (
                              <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-green-500 border-2 border-slate-800" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{emp.name}</p>
                            <p className="text-gray-400 text-xs">{emp.position || emp.department || 'موظف'}</p>
                          </div>
                        </button>
                      ))}
                  </div>
                )}

                <div className="divide-y divide-slate-700">
                  {filteredChats.map((chat) => {
                    const other = getOtherParticipant(chat);
                    if (!other) return null;

                    const isSelected = selectedChat?.id === chat.id;
                    const unreadCount = chat.unreadCount?.[user?.username || ''] || 0;

                    return (
                      <button
                        key={chat.id}
                        onClick={() => selectChat(chat)}
                        className={`w-full text-right p-4 transition-colors ${
                          isSelected
                            ? 'bg-blue-500/20 border-l-4 border-blue-500'
                            : 'hover:bg-slate-700/50 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                {other.name.charAt(0)}
                              </div>
                              {isUserOnline(other.id) && (
                                <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-green-500 border-2 border-slate-800" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-semibold text-sm">{other.name}</p>
                                {isUserOnline(other.id) && (
                                  <span className="text-xs text-green-400">نشط الآن</span>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs truncate">
                                {chat.lastMessage || 'لا توجد رسائل بعد'}
                              </p>
                            </div>
                          </div>
                          <div className="text-left flex flex-col items-end gap-1">
                            <p className="text-gray-400 text-xs">{formatTime(chat.lastMessageTime)}</p>
                            {unreadCount > 0 && (
                              <span className="inline-block bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {filteredChats.length === 0 && !showNewChat && (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-400 text-sm">لا توجد محادثات</p>
                    <p className="text-gray-500 text-xs mt-1">ابدأ محادثة جديدة مع أحد الموظفين</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Area */}
            {selectedChat && otherParticipant ? (
              <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b border-slate-700 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {otherParticipant.name.charAt(0)}
                        </div>
                        {isUserOnline(otherParticipant.id) && (
                          <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-green-500 border-2 border-slate-800" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{otherParticipant.name}</h3>
                        <p className="text-gray-400 text-xs">
                          {isUserOnline(otherParticipant.id) ? (
                            <span className="text-green-400 flex items-center gap-1">
                              <Circle className="w-2 h-2 fill-green-400" />
                              نشط الآن
                            </span>
                          ) : (
                            onlineStatuses[otherParticipant.id]?.lastSeen && (
                              <span>
                                آخر ظهور:{' '}
                                {formatTime(onlineStatuses[otherParticipant.id].lastSeen)}
                              </span>
                            )
                          )}
                        </p>
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
                        const isOwn = msg.senderId === user?.username;
                        const isRead = msg.readBy.length > 1; // More than just sender
                        const isEditing = editingMessageId === msg.id;

                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs ${isOwn ? 'text-left' : 'text-right'}`}>
                              {isEditing ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleEditMessage(msg.id);
                                      }
                                    }}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleEditMessage(msg.id)}
                                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                                    >
                                      حفظ
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingMessageId(null);
                                        setEditingContent('');
                                      }}
                                      className="flex-1"
                                    >
                                      إلغاء
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div
                                    className={`group px-4 py-2 rounded-lg ${
                                      isOwn
                                        ? 'bg-blue-500/80 text-white rounded-bl-lg'
                                        : 'bg-slate-700/50 text-gray-200 rounded-br-lg'
                                    }`}
                                  >
                                    <p className="text-sm break-words">{msg.content}</p>
                                    <div
                                      className={`flex items-center gap-1 mt-1 text-xs ${
                                        isOwn ? 'justify-end' : 'justify-start'
                                      } ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}
                                    >
                                      <span>{formatTime(msg.timestamp)}</span>
                                      {msg.edited && <span className="mx-1">• تم التعديل</span>}
                                      {isOwn && isRead && <CheckCheck className="w-3 h-3" />}
                                      {isOwn && !isRead && <Check className="w-3 h-3" />}
                                    </div>
                                    {isOwn && (
                                      <div className="hidden group-hover:flex gap-1 mt-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setEditingMessageId(msg.id);
                                            setEditingContent(msg.content);
                                          }}
                                          className="h-6 px-2 text-xs text-blue-100 hover:bg-blue-600"
                                        >
                                          <Edit2 className="w-3 h-3 ml-1" />
                                          تعديل
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteMessage(msg.id)}
                                          className="h-6 px-2 text-xs text-red-300 hover:bg-red-500/20"
                                        >
                                          <Trash2 className="w-3 h-3 ml-1" />
                                          حذف
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                  
                  {/* Typing Indicator */}
                  {isOtherUserTyping() && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700/50 text-gray-300 px-4 py-2 rounded-lg rounded-br-lg">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-slate-700 p-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="اكتب رسالة..."
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) {
                          sendMessageHandler();
                        }
                      }}
                      disabled={loading}
                      className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    />
                    <Button
                      onClick={sendMessageHandler}
                      disabled={!messageInput.trim() || loading}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-30 animate-pulse-glow" />
                  <p className="text-gray-400 text-lg">اختر محادثة أو ابدأ محادثة جديدة</p>
                  <p className="text-gray-500 text-sm mt-1">تواصل مع فريق العمل بشكل احترافي</p>
                </div>
              </Card>
            )}
          </div>
          </div>

          {/* Animation Keyframes */}
          <style jsx global>{`
            @keyframes pulse-glow {
              0%, 100% {
                opacity: 0.3;
              }
              50% {
                opacity: 0.6;
              }
            }

            @keyframes shine {
              from {
                transform: translateX(-100%) translateY(-100%) rotate(45deg);
              }
              to {
                transform: translateX(100%) translateY(100%) rotate(45deg);
              }
            }

            @keyframes bounce-slow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }

            .animate-pulse-glow {
              animation: pulse-glow 2s ease-in-out infinite;
            }

            .animate-shine {
              animation: shine 3s ease-in-out infinite;
            }

            .animate-bounce-slow {
              animation: bounce-slow 2s ease-in-out infinite;
            }
          `}</style>
        </div>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
