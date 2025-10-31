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
    color: 'text-green-400',
    bgColor: 'from-green-900/30 to-green-800/20',
    borderColor: 'border-green-500/40',
    badge: 'bg-green-500/20 text-green-300 border-green-500/30'
  },
  messenger: {
    name: 'ماسنجر',
    icon: MessageCircle,
    color: 'text-blue-400',
    bgColor: 'from-blue-900/30 to-blue-800/20',
    borderColor: 'border-blue-500/40',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  snapchat: {
    name: 'سناب شات',
    icon: Camera,
    color: 'text-yellow-300',
    bgColor: 'from-yellow-900/30 to-yellow-800/20',
    borderColor: 'border-yellow-500/40',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  },
  instagram: {
    name: 'انستجرام',
    icon: Camera,
    color: 'text-pink-400',
    bgColor: 'from-pink-900/30 via-purple-900/20 to-orange-900/20',
    borderColor: 'border-pink-500/40',
    badge: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30'
  },
  tiktok: {
    name: 'تيك توك',
    icon: Music,
    color: 'text-cyan-400',
    bgColor: 'from-gray-900/50 to-cyan-900/20',
    borderColor: 'border-cyan-500/40',
    badge: 'bg-gray-900/50 text-cyan-300 border-cyan-500/30'
  },
  telegram: {
    name: 'تيليجرام',
    icon: Plane,
    color: 'text-sky-400',
    bgColor: 'from-sky-900/30 to-blue-900/20',
    borderColor: 'border-sky-500/40',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
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
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

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
      const messageData: any = {
        senderId: user.username || user.email,
        senderName: user.name || 'موظف',
        platform: selectedPlatform === 'all' ? 'whatsapp' : selectedPlatform,
        content: newMessage,
        timestamp: serverTimestamp(),
        isRead: true,
        type: 'text',
        isStaff: true
      };

      // إذا كان رد على رسالة
      if (replyingTo) {
        messageData.replyTo = {
          id: replyingTo.id,
          senderName: replyingTo.senderName,
          content: replyingTo.content,
          platform: replyingTo.platform
        };
      }

      await addDoc(collection(db, 'unified_messages'), messageData);

      setNewMessage('');
      setReplyingTo(null);
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
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 px-3 md:px-6 py-3 md:py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
              <span className="hidden sm:inline">رجوع</span>
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-white truncate">صندوق الوارد الموحد</h1>
              <p className="text-gray-400 text-xs md:text-sm hidden md:block">جميع رسائلك من كل المنصات</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Badge variant="outline" className="bg-white/5 text-white border-white/20 text-xs">
              {messages.length}
            </Badge>
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              {messages.filter(m => !m.isRead).length}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Platform Filters */}
        <div className="w-20 md:w-64 lg:w-80 bg-gray-800/30 backdrop-blur-xl border-l border-gray-700/50 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-2 md:p-4 border-b border-gray-700/50 flex-shrink-0">
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white pr-10 placeholder:text-gray-500 text-sm"
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="md:hidden w-full text-white"
            >
              <Search className="w-4 h-4" />
            </Button>
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
                    className={`flex items-start gap-3 md:gap-4 p-4 md:p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] border-2 ${
                      message.isRead
                        ? `bg-gradient-to-br ${config.bgColor} hover:${config.bgColor} ${config.borderColor}`
                        : `bg-gradient-to-br ${config.bgColor} border-2 ${config.borderColor} shadow-lg`
                    }`}
                  >
                    {/* Avatar with Platform Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${config.bgColor} border-2 ${config.borderColor} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl`}>
                        {message.senderName.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-2 -left-2 w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br ${config.bgColor} rounded-xl flex items-center justify-center border-3 border-gray-900 shadow-lg`}>
                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${config.color}`} />
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-white font-bold text-base md:text-lg truncate">{message.senderName}</span>
                        <Badge className={`${config.badge} border text-xs font-semibold px-2 py-1`}>
                          {config.name}
                        </Badge>
                        <span className="text-gray-400 text-xs hidden sm:inline">{formatTime(message.timestamp)}</span>
                        {!message.isRead && (
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-xs font-bold animate-pulse">
                            جديد
                          </Badge>
                        )}
                      </div>
                      
                      {/* Reply To */}
                      {(message as any).replyTo && (
                        <div className="bg-gray-700/30 border-r-2 border-cyan-500 pr-2 mb-2 py-1">
                          <p className="text-xs text-gray-400">رداً على {(message as any).replyTo.senderName}</p>
                          <p className="text-xs text-gray-500 truncate">{(message as any).replyTo.content}</p>
                        </div>
                      )}
                      
                      <p className="text-gray-300 text-xs md:text-sm break-words">{message.content}</p>
                      
                      {/* Reply Button */}
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyingTo(message)}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7 text-xs"
                        >
                          <Send className="w-3 h-3 ml-1" />
                          رد
                        </Button>
                        {!message.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(message.id)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-7 text-xs"
                          >
                            <CheckCheck className="w-3 h-3 ml-1" />
                            تحديد كمقروء
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Read Status */}
                    <div className="flex-shrink-0 self-start pt-1">
                      {message.isRead ? (
                        <CheckCheck className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                      ) : (
                        <Check className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div className="bg-gray-800/50 backdrop-blur-xl border-t border-gray-700/50 p-2 md:p-4 flex-shrink-0">
            {/* Reply Preview */}
            {replyingTo && (
              <div className="mb-2 bg-gray-700/30 border-r-2 border-cyan-500 pr-3 py-2 rounded flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-cyan-400">رد على {replyingTo.senderName}</p>
                  <p className="text-xs text-gray-400 truncate">{replyingTo.content}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-400 hover:text-white h-7 w-7 p-0"
                >
                  ×
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-700 hidden md:flex h-8 w-8 md:h-10 md:w-10"
              >
                <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-700 hidden md:flex h-8 w-8 md:h-10 md:w-10"
              >
                <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Input
                placeholder="اكتب رسالتك..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 text-sm md:text-base"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white h-8 md:h-10 px-3 md:px-4"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                <span className="hidden sm:inline">إرسال</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
