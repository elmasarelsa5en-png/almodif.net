'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search,
  Send,
  ArrowLeft,
  CheckCheck,
  Check,
  Image as ImageIcon,
  Paperclip,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, setDoc, doc } from 'firebase/firestore';
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

// أيقونات SVG للمنصات الحقيقية
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const MessengerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.11C24 4.975 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.166 3c.7 0 3.498.084 4.88 2.434.46.78.612 2.226.55 3.542-.054 1.147-.117 2.28-.116 2.288.031.02.076.03.144.03.295 0 .658-1.02.985-1.863.118-.304.516-.92.91-1.092.182-.08.411-.12.655-.12.29 0 .58.062.823.177.418.198.674.546.738.996.062.437-.05.882-.315 1.27-.425.624-1.178 1.05-1.945 1.32-.394.138-.81.245-1.206.34-1.064.253-1.383.623-1.428.908-.047.3.003.58.157.86.194.354.544.625.984.758.477.144.963.157 1.42.037.485-.128.93-.367 1.328-.648.385-.272.735-.574 1.07-.87.44-.387.847-.746 1.285-.94.258-.113.556-.175.863-.175.417 0 .814.104 1.155.307.33.197.596.477.766.803.163.312.244.654.241.997-.01.777-.468 1.49-1.19 1.85-.453.226-.953.338-1.446.338-.405 0-.81-.073-1.194-.212-.436-.158-.848-.382-1.24-.62-.258-.157-.51-.32-.76-.48-.613-.393-1.204-.772-1.846-.937-.656-.17-1.333-.25-2.003-.238-.654.012-1.307.112-1.944.293-.628.178-1.239.434-1.828.72-.455.22-.895.463-1.328.71-.415.236-.83.475-1.27.66-.39.164-.81.258-1.234.258-.49 0-.98-.112-1.43-.33-.724-.348-1.186-1.06-1.207-1.84-.006-.34.073-.675.23-.98.164-.316.425-.587.75-.78.338-.2.73-.302 1.145-.302.308 0 .607.062.867.176.44.193.85.55 1.292.935.337.294.688.594 1.074.864.4.28.847.518 1.334.645.458.12.945.107 1.423-.037.44-.133.79-.404.984-.758.154-.28.204-.56.157-.86-.045-.285-.364-.655-1.428-.908-.396-.095-.812-.202-1.206-.34-.767-.27-1.52-.696-1.945-1.32-.265-.388-.377-.833-.315-1.27.064-.45.32-.798.738-.996.243-.115.533-.177.823-.177.244 0 .473.04.655.12.394.172.792.788.91 1.092.327.843.69 1.863.985 1.863.068 0 .113-.01.144-.03 0-.008-.062-1.14-.116-2.288-.062-1.316.09-2.762.55-3.542C8.668 3.084 11.466 3 12.166 3z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const platformConfig = {
  whatsapp: {
    name: 'واتساب',
    icon: WhatsAppIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    hoverColor: 'hover:bg-green-500/30',
    realColor: '#25D366'
  },
  messenger: {
    name: 'ماسنجر',
    icon: MessengerIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    hoverColor: 'hover:bg-blue-500/30',
    realColor: '#0084FF'
  },
  snapchat: {
    name: 'سناب شات',
    icon: SnapchatIcon,
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/20',
    hoverColor: 'hover:bg-yellow-500/30',
    realColor: '#FFFC00'
  },
  instagram: {
    name: 'انستجرام',
    icon: InstagramIcon,
    color: 'text-pink-400',
    bgColor: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20',
    hoverColor: 'hover:from-pink-500/30 hover:to-purple-500/30',
    realColor: '#E4405F'
  },
  tiktok: {
    name: 'تيك توك',
    icon: TikTokIcon,
    color: 'text-cyan-400',
    bgColor: 'bg-gray-900/50',
    hoverColor: 'hover:bg-cyan-500/30',
    realColor: '#00F2EA'
  },
  telegram: {
    name: 'تيليجرام',
    icon: TelegramIcon,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
    hoverColor: 'hover:bg-sky-500/30',
    realColor: '#0088CC'
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

  // 🎯 إضافة بيانات تجريبية
  const addSampleData = async () => {
    try {
      const sampleContacts = [
        { id: 'c1', name: 'أحمد محمد', platform: 'whatsapp' as Platform, lastMessage: 'مرحباً، أريد حجز غرفة', lastMessageTime: new Date(), unreadCount: 2 },
        { id: 'c2', name: 'سارة علي', platform: 'instagram' as Platform, lastMessage: 'هل يوجد غرف متاحة؟', lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), unreadCount: 1 },
        { id: 'c3', name: 'محمود حسن', platform: 'messenger' as Platform, lastMessage: 'شكراً لكم على الخدمة الممتازة', lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), unreadCount: 0 },
        { id: 'c4', name: 'فاطمة أحمد', platform: 'telegram' as Platform, lastMessage: 'كم سعر الغرفة المزدوجة؟', lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), unreadCount: 3 },
        { id: 'c5', name: 'علي السعيد', platform: 'tiktok' as Platform, lastMessage: 'رائع! سأحجز اليوم', lastMessageTime: new Date(Date.now() - 1000 * 60 * 120), unreadCount: 0 },
        { id: 'c6', name: 'نور الدين', platform: 'snapchat' as Platform, lastMessage: 'هل تقبلون الحجز الآن؟', lastMessageTime: new Date(Date.now() - 1000 * 60 * 180), unreadCount: 1 },
      ];

      const sampleMessages = [
        { contactId: 'c1', platform: 'whatsapp', senderId: 'c1', senderName: 'أحمد محمد', content: 'مرحباً، أريد حجز غرفة لليلتين', timestamp: new Date(Date.now() - 1000 * 60 * 10), isRead: false, type: 'text' as const },
        { contactId: 'c1', platform: 'whatsapp', senderId: 'staff', senderName: 'موظف', content: 'أهلاً وسهلاً! بكل سرور، متى تريد الحجز؟', timestamp: new Date(Date.now() - 1000 * 60 * 9), isRead: true, type: 'text' as const, isFromStaff: true },
        { contactId: 'c1', platform: 'whatsapp', senderId: 'c1', senderName: 'أحمد محمد', content: 'من يوم الجمعة القادم', timestamp: new Date(Date.now() - 1000 * 60 * 8), isRead: false, type: 'text' as const },
        
        { contactId: 'c2', platform: 'instagram', senderId: 'c2', senderName: 'سارة علي', content: 'هل يوجد غرف متاحة؟', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false, type: 'text' as const },
        
        { contactId: 'c3', platform: 'messenger', senderId: 'c3', senderName: 'محمود حسن', content: 'شكراً لكم على الخدمة الممتازة', timestamp: new Date(Date.now() - 1000 * 60 * 30), isRead: true, type: 'text' as const },
        { contactId: 'c3', platform: 'messenger', senderId: 'staff', senderName: 'موظف', content: 'شكراً لك! نتمنى رؤيتك قريباً', timestamp: new Date(Date.now() - 1000 * 60 * 29), isRead: true, type: 'text' as const, isFromStaff: true },
        
        { contactId: 'c4', platform: 'telegram', senderId: 'c4', senderName: 'فاطمة أحمد', content: 'السلام عليكم', timestamp: new Date(Date.now() - 1000 * 60 * 65), isRead: true, type: 'text' as const },
        { contactId: 'c4', platform: 'telegram', senderId: 'staff', senderName: 'موظف', content: 'وعليكم السلام ورحمة الله', timestamp: new Date(Date.now() - 1000 * 60 * 64), isRead: true, type: 'text' as const, isFromStaff: true },
        { contactId: 'c4', platform: 'telegram', senderId: 'c4', senderName: 'فاطمة أحمد', content: 'كم سعر الغرفة المزدوجة؟', timestamp: new Date(Date.now() - 1000 * 60 * 60), isRead: false, type: 'text' as const },
      ];

      // إضافة جهات الاتصال
      for (const contact of sampleContacts) {
        await setDoc(doc(db, 'unified_contacts', contact.id), contact);
      }

      // إضافة الرسائل
      for (const msg of sampleMessages) {
        await addDoc(collection(db, 'unified_messages'), {
          ...msg,
          timestamp: msg.timestamp
        });
      }

      alert('✅ تم إضافة البيانات التجريبية بنجاح!');
    } catch (error) {
      console.error('Error adding sample data:', error);
      alert('❌ حدث خطأ أثناء إضافة البيانات');
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
            <Button
              onClick={addSampleData}
              variant="outline"
              size="sm"
              className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
            >
              ➕ بيانات تجريبية
            </Button>
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
