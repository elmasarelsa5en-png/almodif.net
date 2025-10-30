'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  MessageCircle, 
  Camera, 
  Music, 
  Plane, 
  Filter,
  Search,
  Send,
  ArrowLeft,
  CheckCheck,
  Check,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Platform = 'whatsapp' | 'messenger' | 'snapchat' | 'instagram' | 'tiktok' | 'telegram';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  platform: Platform;
  content: string;
  timestamp: any;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
}

interface Contact {
  id: string;
  name: string;
  platform: Platform;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  avatar?: string;
}

const platformConfig = {
  whatsapp: {
    name: 'واتساب',
    icon: MessageSquare,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  messenger: {
    name: 'ماسنجر',
    icon: MessageCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  snapchat: {
    name: 'سناب شات',
    icon: Camera,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30'
  },
  instagram: {
    name: 'انستجرام',
    icon: Camera,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30'
  },
  tiktok: {
    name: 'تيك توك',
    icon: Music,
    color: 'text-gray-900 dark:text-white',
    bgColor: 'bg-gray-900/10 dark:bg-white/10',
    borderColor: 'border-gray-900/30 dark:border-white/30'
  },
  telegram: {
    name: 'تيليجرام',
    icon: Plane,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30'
  }
};

export default function UnifiedInboxPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // جلب الرسائل من Firebase
  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, 'unified_messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        messagesData.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });
      setMessages(messagesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // فلترة الرسائل حسب المنصة والبحث
  useEffect(() => {
    let filtered = messages;

    // فلتر حسب المنصة
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(msg => msg.platform === selectedPlatform);
    }

    // فلتر حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  }, [messages, selectedPlatform, searchTerm]);

  // إحصائيات المنصات
  const platformStats = Object.keys(platformConfig).map(platform => ({
    platform: platform as Platform,
    count: messages.filter(msg => msg.platform === platform).length,
    unread: messages.filter(msg => msg.platform === platform && !msg.isRead).length
  }));

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString('ar-SA');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'unified_messages'), {
        senderId: user.username || user.email,
        senderName: user.name || 'موظف',
        platform: selectedPlatform === 'all' ? 'whatsapp' : selectedPlatform,
        content: newMessage,
        timestamp: serverTimestamp(),
        isRead: true,
        type: 'text',
        isStaff: true
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'unified_messages', messageId), {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 ml-2" />
              رجوع
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">صندوق الوارد الموحد</h1>
              <p className="text-gray-400 text-sm">جميع رسائلك من كل المنصات</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/5 text-white border-white/20">
              {messages.length} رسالة
            </Badge>
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
              {messages.filter(m => !m.isRead).length} غير مقروءة
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Platform Filters */}
        <div className="w-80 bg-gray-800/30 backdrop-blur-xl border-l border-gray-700/50 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث في الرسائل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white pr-10 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Filter: All */}
          <div className="p-4 border-b border-gray-700/50">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                selectedPlatform === 'all'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50'
                  : 'bg-gray-900/30 hover:bg-gray-900/50 border border-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">كل المنصات</div>
                  <div className="text-gray-400 text-xs">جميع الرسائل</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-0">
                  {messages.length}
                </Badge>
                {messages.filter(m => !m.isRead).length > 0 && (
                  <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                    {messages.filter(m => !m.isRead).length} جديد
                  </Badge>
                )}
              </div>
            </button>
          </div>

          {/* Platform Filters */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {platformStats.map(({ platform, count, unread }) => {
              const config = platformConfig[platform];
              const Icon = config.icon;
              
              return (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    selectedPlatform === platform
                      ? `${config.bgColor} border-2 ${config.borderColor}`
                      : 'bg-gray-900/30 hover:bg-gray-900/50 border border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center border ${config.borderColor}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{config.name}</div>
                      <div className="text-gray-400 text-xs">{count} رسالة</div>
                    </div>
                  </div>
                  {unread > 0 && (
                    <Badge className="bg-red-500/20 text-red-400 border-0">
                      {unread}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p>جاري تحميل الرسائل...</p>
                </div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-xl font-semibold mb-2">لا توجد رسائل</p>
                  <p className="text-sm">
                    {selectedPlatform === 'all'
                      ? 'لم يتم استقبال أي رسائل بعد'
                      : `لا توجد رسائل من ${platformConfig[selectedPlatform as Platform].name}`}
                  </p>
                </div>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const config = platformConfig[message.platform];
                const Icon = config.icon;

                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                      message.isRead
                        ? 'bg-gray-800/30 hover:bg-gray-800/50'
                        : 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-500/50'
                    }`}
                    onClick={() => !message.isRead && markAsRead(message.id)}
                  >
                    {/* Avatar with Platform Icon */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                        {message.senderName.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-1 -left-1 w-6 h-6 ${config.bgColor} rounded-full flex items-center justify-center border-2 border-gray-900`}>
                        <Icon className={`w-3 h-3 ${config.color}`} />
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">{message.senderName}</span>
                        <span className={`text-xs ${config.color}`}>• {config.name}</span>
                        <span className="text-gray-500 text-xs">{formatTime(message.timestamp)}</span>
                        {!message.isRead && (
                          <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">جديد</Badge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{message.content}</p>
                    </div>

                    {/* Read Status */}
                    <div>
                      {message.isRead ? (
                        <CheckCheck className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Check className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div className="bg-gray-800/50 backdrop-blur-xl border-t border-gray-700/50 p-4">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Input
                placeholder="اكتب رسالتك هنا..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                <Send className="w-5 h-5 ml-2" />
                إرسال
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
