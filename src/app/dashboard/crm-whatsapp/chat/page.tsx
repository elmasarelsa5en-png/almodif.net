'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile,
  ArrowLeft,
  Check,
  CheckCheck,
  User,
  Clock,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'customer';
  status: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

export default function WhatsAppChatPage() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chats from backend
    loadChats();
    
    // Reload chats every 5 seconds
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      
      // Reload messages every 3 seconds when chat is selected
      const interval = setInterval(() => {
        loadMessages(selectedChat.id);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      console.log('Loading chats from backend...');
      const response = await fetch('http://localhost:3002/api/chats');
      
      if (!response.ok) {
        console.error('Failed to load chats, status:', response.status);
        loadMockChats();
        return;
      }
      
      const data = await response.json();
      console.log('Chats data received:', data);
      
      if (data.chats && data.chats.length > 0) {
        // Convert backend format to frontend format
        const formattedChats: Chat[] = data.chats.map((chat: any) => ({
          id: chat.id,
          name: chat.name,
          avatar: chat.profilePicUrl,
          lastMessage: chat.lastMessage?.body || 'لا توجد رسائل',
          timestamp: formatTimestamp(chat.timestamp),
          unread: chat.unreadCount || 0,
          online: false // WhatsApp Web doesn't provide online status
        }));
        
        console.log('Formatted chats:', formattedChats.length);
        setChats(formattedChats);
        
        // Auto-select first chat if none selected
        if (!selectedChat && formattedChats.length > 0) {
          setSelectedChat(formattedChats[0]);
        }
      } else {
        console.log('No chats found, loading mock data');
        loadMockChats();
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      // Keep using mock data if backend fails
      loadMockChats();
    }
  };
  
  const loadMockChats = () => {
    // Mock data - fallback when backend is not available
    const mockChats: Chat[] = [
      {
        id: '1',
        name: 'أحمد محمد',
        lastMessage: 'شكراً جزيلاً، تم الحجز بنجاح',
        timestamp: '10:30',
        unread: 2,
        online: true
      },
      {
        id: '2',
        name: 'سارة علي',
        lastMessage: 'هل يمكن تغيير موعد الحجز؟',
        timestamp: '09:15',
        unread: 0,
        online: false
      },
      {
        id: '3',
        name: 'محمود حسن',
        lastMessage: 'ما هي الأسعار المتاحة؟',
        timestamp: 'أمس',
        unread: 1,
        online: true
      }
    ];
    setChats(mockChats);
    if (mockChats.length > 0) {
      setSelectedChat(mockChats[0]);
    }
  };
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'أمس';
    } else if (days < 7) {
      return `${days} أيام`;
    } else {
      return date.toLocaleDateString('ar-EG');
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/messages/${chatId}`);
      
      if (!response.ok) {
        console.error('Failed to load messages');
        return;
      }
      
      const data = await response.json();
      
      if (data.messages) {
        // Convert backend format to frontend format
        const formattedMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.body,
          timestamp: new Date(msg.timestamp * 1000),
          sender: msg.fromMe ? 'user' : 'customer',
          status: msg.ack === 3 ? 'read' : msg.ack === 2 ? 'delivered' : 'sent'
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Load mock messages if backend fails
      loadMockMessages();
    }
  };
  
  const loadMockMessages = () => {
    // Mock messages - fallback
    const mockMessages: Message[] = [
      {
        id: '1',
        text: 'مرحباً، أريد حجز غرفة',
        timestamp: new Date(Date.now() - 3600000),
        sender: 'customer',
        status: 'read'
      },
      {
        id: '2',
        text: 'أهلاً بك! بالتأكيد، ما هي التواريخ المطلوبة؟',
        timestamp: new Date(Date.now() - 3500000),
        sender: 'user',
        status: 'read'
      },
      {
        id: '3',
        text: 'من 15 إلى 20 نوفمبر',
        timestamp: new Date(Date.now() - 3400000),
        sender: 'customer',
        status: 'read'
      },
      {
        id: '4',
        text: 'ممتاز! لدينا عدة غرف متاحة. هل تفضل غرفة مفردة أم مزدوجة؟',
        timestamp: new Date(Date.now() - 3300000),
        sender: 'user',
        status: 'read'
      },
      {
        id: '5',
        text: 'غرفة مزدوجة من فضلك',
        timestamp: new Date(Date.now() - 3200000),
        sender: 'customer',
        status: 'read'
      },
      {
        id: '6',
        text: 'شكراً جزيلاً، تم الحجز بنجاح',
        timestamp: new Date(Date.now() - 100000),
        sender: 'customer',
        status: 'delivered'
      }
    ];
    setMessages(mockMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date(),
      sender: 'user',
      status: 'sent'
    };

    // Add message to UI immediately
    setMessages(prev => [...prev, tempMessage]);
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      // Send to backend
      const response = await fetch('http://localhost:3002/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          message: messageToSend
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Update message with real ID
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, id: data.messageId, status: 'delivered' }
            : msg
        )
      );
      
      // Reload messages to get the latest
      setTimeout(() => loadMessages(selectedChat.id), 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      // Update message status to show error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('🔴 Logging out from chat page...');
      
      const response = await fetch('http://localhost:3002/api/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Logout successful, redirecting...');
        // الرجوع لصفحة الاتصال
        router.push('/dashboard/crm-whatsapp/connect');
      } else {
        console.error('❌ Logout failed');
        setIsLoggingOut(false);
      }
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-gray-900 flex" dir="rtl">
      {/* Sidebar - Chats List */}
      <div className="w-full md:w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/crm-whatsapp')}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold">المحادثات</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-white hover:bg-white/20 text-sm disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                    جاري الخروج...
                  </>
                ) : (
                  'خروج'
                )}
              </Button>
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="ابحث عن محادثة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد محادثات</h3>
              <p className="text-sm text-gray-500">
                {searchQuery 
                  ? 'لم يتم العثور على نتائج للبحث'
                  : 'جاري تحميل المحادثات من WhatsApp...'
                }
              </p>
              <Button
                onClick={() => loadChats()}
                className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                تحديث
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                        {chat.name[0]}
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                        <span className="text-xs text-gray-500">{chat.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    </div>
                    
                    {chat.unread > 0 && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-semibold">{chat.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {selectedChat.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedChat.online ? 'متصل الآن' : 'غير متصل'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-white border border-gray-200 text-gray-900'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    } shadow-sm`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      message.sender === 'user' ? 'text-gray-500' : 'text-white/80'
                    }`}>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {message.sender === 'user' && (
                        <>
                          {message.status === 'sent' && <Check className="w-3 h-3" />}
                          {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                          {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Paperclip className="w-5 h-5" />
              </Button>
              
              <Input
                type="text"
                placeholder="اكتب رسالة..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                disabled={!newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <MessageSquare className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp للأعمال</h3>
            <p className="text-gray-600">اختر محادثة لبدء المراسلة</p>
          </div>
        </div>
      )}
    </div>
  );
}
