'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  MessageCircle, 
  Camera, 
  Music, 
  Plane, 
  Search,
  Send,
  ArrowLeft,
  CheckCheck,
  Check,
  Image as ImageIcon,
  Paperclip,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Platform = 'whatsapp' | 'messenger' | 'snapchat' | 'instagram' | 'tiktok' | 'telegram';

interface Message {
  id: string;
  contactId: string;
  senderId: string;
  senderName: string;
  platform: Platform;
  content: string;
  timestamp: any;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  isFromStaff?: boolean;
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
    bgColor: 'bg-green-500/20',
    hoverColor: 'hover:bg-green-500/30'
  },
  messenger: {
    name: 'ماسنجر',
    icon: MessageCircle,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    hoverColor: 'hover:bg-blue-500/30'
  },
  snapchat: {
    name: 'سناب شات',
    icon: Camera,
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/20',
    hoverColor: 'hover:bg-yellow-500/30'
  },
  instagram: {
    name: 'انستجرام',
    icon: Camera,
    color: 'text-pink-400',
    bgColor: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20',
    hoverColor: 'hover:from-pink-500/30 hover:to-purple-500/30'
  },
  tiktok: {
    name: 'تيك توك',
    icon: Music,
    color: 'text-cyan-400',
    bgColor: 'bg-gray-900/50',
    hoverColor: 'hover:bg-cyan-500/30'
  },
  telegram: {
    name: 'تيليجرام',
    icon: Plane,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
    hoverColor: 'hover:bg-sky-500/30'
  }
};

export default function UnifiedInboxPage() {
  const router = useRouter();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // جلب جهات الاتصال من Firebase
  useEffect(() => {
    if (!user) return;

    const contactsRef = collection(db, 'unified_contacts');
    const q = query(contactsRef, orderBy('lastMessageTime', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactsData: Contact[] = [];
      snapshot.forEach((doc) => {
        contactsData.push({
          id: doc.id,
          ...doc.data()
        } as Contact);
      });
      setContacts(contactsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // جلب الرسائل للمحادثة المحددة
  useEffect(() => {
    if (!selectedContact) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'unified_messages');
    const q = query(
      messagesRef,
      where('contactId', '==', selectedContact.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        messagesData.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });
      setMessages(messagesData);
      
      // Scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [selectedContact]);

  // فلترة جهات الاتصال حسب المنصة والبحث
  useEffect(() => {
    let filtered = contacts;

    // فلتر حسب المنصة
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(contact => contact.platform === selectedPlatform);
    }

    // فلتر حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  }, [contacts, selectedPlatform, searchTerm]);

  // إحصائيات المنصات
  const platformStats = Object.keys(platformConfig).map(platform => ({
    platform: platform as Platform,
    unread: contacts.filter(contact => contact.platform === platform && contact.unreadCount > 0).reduce((sum, c) => sum + c.unreadCount, 0)
  }));

  const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} د`;
    if (hours < 24) return `منذ ${hours} س`;
    if (days < 7) return `منذ ${days} ي`;
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedContact) return;

    try {
      const messageData: Message = {
        id: '',
        contactId: selectedContact.id,
        senderId: user.username || user.email || '',
        senderName: user.name || 'موظف',
        platform: selectedContact.platform,
        content: newMessage,
        timestamp: serverTimestamp(),
        isRead: true,
        type: 'text',
        isFromStaff: true
      };

      await addDoc(collection(db, 'unified_messages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col overflow-hidden" dir="rtl">
      {/* Header with Platform Icons */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 ml-2" />
              رجوع
            </Button>
            <h1 className="text-2xl font-bold text-white">صندوق الوارد الموحد</h1>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/5 text-white border-white/20">
              {contacts.length}
            </Badge>
            {totalUnread > 0 && (
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                {totalUnread} جديد
              </Badge>
            )}
          </div>
        </div>

        {/* Platform Filter Icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {/* All Platforms */}
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`relative flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              selectedPlatform === 'all'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-500/50'
                : 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/50'
            }`}
          >
            <div className="text-white font-semibold">الكل</div>
            {totalUnread > 0 && (
              <Badge className="bg-red-500 text-white border-0 text-xs px-2">
                {totalUnread}
              </Badge>
            )}
          </button>

          {/* Platform Icons */}
          {platformStats.map(({ platform, unread }) => {
            const config = platformConfig[platform];
            const Icon = config.icon;
            
            return (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`relative flex-shrink-0 w-12 h-12 rounded-xl transition-all ${
                  selectedPlatform === platform
                    ? `${config.bgColor} border-2 border-${config.color.replace('text-', '')}`
                    : `bg-gray-700/30 ${config.hoverColor} border border-gray-600/50`
                }`}
                title={config.name}
              >
                <Icon className={`w-6 h-6 ${config.color} mx-auto`} />
                {unread > 0 && (
                  <Badge className="absolute -top-2 -left-2 bg-red-500 text-white border-0 text-xs min-w-[20px] h-5 flex items-center justify-center px-1">
                    {unread}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-96 bg-gray-800/30 backdrop-blur-xl border-l border-gray-700/50 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث في جهات الاتصال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white pr-10 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                  <p className="text-sm">جاري التحميل...</p>
                </div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-center p-4">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد محادثات</p>
                </div>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const config = platformConfig[contact.platform];
                const Icon = config.icon;
                
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full flex items-center gap-3 p-4 border-b border-gray-700/50 transition-all ${
                      selectedContact?.id === contact.id
                        ? 'bg-gray-700/50'
                        : 'hover:bg-gray-700/30'
                    }`}
                  >
                    {/* Avatar with Platform Badge */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-1 -left-1 w-6 h-6 ${config.bgColor} rounded-full flex items-center justify-center border-2 border-gray-900`}>
                        <Icon className={`w-3 h-3 ${config.color}`} />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold truncate">{contact.name}</span>
                        <span className="text-gray-400 text-xs flex-shrink-0 mr-2">{formatTime(contact.lastMessageTime)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-sm truncate">{contact.lastMessage}</p>
                        {contact.unreadCount > 0 && (
                          <Badge className="bg-green-500 text-white border-0 text-xs flex-shrink-0 mr-2">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!selectedContact ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-center">
                <MessageSquare className="w-24 h-24 mx-auto mb-4 opacity-20" />
                <p className="text-2xl font-semibold mb-2">اختر محادثة</p>
                <p>اختر محادثة من القائمة لبدء المراسلة</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                    {(() => {
                      const config = platformConfig[selectedContact.platform];
                      const Icon = config.icon;
                      return (
                        <div className={`absolute -bottom-1 -left-1 w-5 h-5 ${config.bgColor} rounded-full flex items-center justify-center border-2 border-gray-900`}>
                          <Icon className={`w-3 h-3 ${config.color}`} />
                        </div>
                      );
                    })()}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedContact.name}</h3>
                    <p className="text-gray-400 text-xs">{platformConfig[selectedContact.platform].name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {messages.map((message) => {
                  const isFromStaff = message.isFromStaff || message.senderId === (user?.username || user?.email);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromStaff ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[70%] ${isFromStaff ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isFromStaff
                              ? 'bg-gray-700/50 text-white rounded-tr-none'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-tl-none'
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isFromStaff ? 'justify-start' : 'justify-end'}`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {!isFromStaff && (
                            message.isRead ? (
                              <CheckCheck className="w-3 h-3 text-blue-400" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
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
                    placeholder="اكتب رسالتك..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
