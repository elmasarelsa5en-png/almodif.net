'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { Bell, Search, Menu, Globe, Hotel, Settings, MessageSquare, Sparkles, Check, X, Power, Zap, LogOut, AlertTriangle, Clock, Users, DollarSign, Bed, Calendar, User, MessagesSquare } from 'lucide-react';
import * as AIAutoReply from '@/lib/ai-auto-reply';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import * as NotificationService from '@/lib/notification-service';
import type { SmartNotification, NotificationType, NotificationPriority } from '@/lib/notification-service';
import { playNotificationSound as playSound, NotificationSoundType } from '@/lib/notification-sounds';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: NotificationType;
  priority: NotificationPriority;
  category: string;
  requestId?: string;
  requiresApproval?: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
  timestamp: number;
}

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

export default function Header({ onMenuClick, className }: HeaderProps) {
  const { user } = useAuth();
  const { language, setLanguage: setLang, t } = useLanguage();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // التحقق من صلاحية الوصول للإعدادات (المطور akram لديه صلاحية دائماً)
  const canAccessSettings = () => {
    // المطور akram لديه صلاحية دائماً
    if (user?.username === 'akram' || user?.email === 'akram@almodif.net') {
      return true;
    }
    // التحقق من الصلاحية
    return user?.permissions?.includes('view_settings') || user?.role === 'admin' || user?.role === 'مدير';
  };
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    unread: 0,
    urgent: 0,
    actionRequired: 0
  });
  const [totalUnreadChats, setTotalUnreadChats] = useState(0);
  const [totalUnreadSocialMedia, setTotalUnreadSocialMedia] = useState(0);
  const [logo, setLogo] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousNotificationCount = useRef(0);
  
  // AI Settings Modal State
  const [showAISettings, setShowAISettings] = useState(false);
  const [aiMode, setAiMode] = useState<'off' | 'local' | 'openai'>('off');
  const [aiConfig, setAiConfig] = useState<AIAutoReply.AIConfig | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  
  // Load AI config on mount
  useEffect(() => {
    const config = AIAutoReply.getAIConfig();
    setAiConfig(config);
    setAiMode(config.mode || 'off');
    setApiKey(config.openaiApiKey || '');
    setOpenaiModel(config.openaiModel || 'gpt-4o-mini');
    setTemperature(config.temperature || 0.7);
  }, []);

  // Auto-hide/show header based on mouse position
  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;
    
    const handleMouseMove = (e: MouseEvent) => {
      const headerHeight = headerRef.current?.offsetHeight || 70;
      
      // إظهار الهيدر إذا كان الماوس في أعلى 100px من الشاشة
      if (e.clientY < 100) {
        setIsHeaderVisible(true);
        clearTimeout(hideTimeout);
      } else {
        // إخفاء الهيدر بعد 2 ثانية من خروج الماوس
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          setIsHeaderVisible(false);
        }, 2000);
      }
    };

    const handleMouseEnter = () => {
      setIsHeaderVisible(true);
      clearTimeout(hideTimeout);
    };

    window.addEventListener('mousemove', handleMouseMove);
    headerRef.current?.addEventListener('mouseenter', handleMouseEnter);

    // إظهار الهيدر في البداية لمدة 3 ثواني
    hideTimeout = setTimeout(() => {
      setIsHeaderVisible(false);
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      headerRef.current?.removeEventListener('mouseenter', handleMouseEnter);
      clearTimeout(hideTimeout);
    };
  }, []);

  // تحميل اللوجو من localStorage
  useEffect(() => {
    const loadLogo = () => {
      const savedLogo = localStorage.getItem('app-logo');
      setLogo(savedLogo);
    };

    loadLogo();

    // الاستماع لتحديثات اللوجو
    const handleLogoUpdate = () => {
      loadLogo();
    };

    window.addEventListener('logo-updated', handleLogoUpdate);
    return () => window.removeEventListener('logo-updated', handleLogoUpdate);
  }, []);

  // تحميل صورة المستخدم من Firebase
  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!user) {
        console.log('❌ No user found for avatar loading');
        return;
      }
      
      const employeeId = user.username || user.email;
      console.log('👤 Loading avatar for user:', employeeId, user);
      
      if (!employeeId) {
        console.log('❌ No employee ID found');
        return;
      }

      try {
        const { db } = await import('@/lib/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        
        const employeeRef = doc(db, 'employees', employeeId);
        const employeeSnap = await getDoc(employeeRef);

        console.log('📦 Employee snapshot exists:', employeeSnap.exists());

        if (employeeSnap.exists()) {
          const data = employeeSnap.data();
          console.log('📄 Employee data:', data);
          
          if (data.avatar) {
            console.log('✅ Avatar found, setting it:', data.avatar.substring(0, 50) + '...');
            setUserAvatar(data.avatar);
          } else {
            console.log('⚠️ No avatar field in employee data');
          }
        } else {
          console.log('❌ Employee document does not exist');
        }
      } catch (error) {
        console.error('❌ Error loading user avatar:', error);
      }
    };

    loadUserAvatar();
    
    // إعادة تحميل الصورة عند تحديث الملف الشخصي
    const handleProfileUpdate = () => {
      console.log('🔄 Profile updated, reloading avatar...');
      loadUserAvatar();
    };
    
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [user]);

  // حساب عدد الرسائل غير المقروءة في المحادثات
  useEffect(() => {
    if (!user) return;

    const countUnreadChats = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        
        const currentUserId = user.username || user.email;
        if (!currentUserId) return;

        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', currentUserId));
        const querySnapshot = await getDocs(q);

        let totalUnread = 0;
        for (const chatDoc of querySnapshot.docs) {
          const messagesRef = collection(db, 'chats', chatDoc.id, 'messages');
          const unreadQuery = query(
            messagesRef,
            where('senderId', '!=', currentUserId),
            where('read', '==', false)
          );
          const unreadMessages = await getDocs(unreadQuery);
          totalUnread += unreadMessages.size;
        }

        setTotalUnreadChats(totalUnread);
      } catch (error) {
        console.error('Error counting unread chats:', error);
      }
    };

    countUnreadChats();

    // تحديث كل 10 ثواني
    const interval = setInterval(countUnreadChats, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // حساب عدد الرسائل غير المقروءة في منصات التواصل الاجتماعي
  useEffect(() => {
    if (!user) return;

    const countUnreadSocialMedia = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        
        const messagesRef = collection(db, 'socialMediaMessages');
        const unreadQuery = query(messagesRef, where('read', '==', false));
        const unreadMessages = await getDocs(unreadQuery);

        setTotalUnreadSocialMedia(unreadMessages.size);
      } catch (error) {
        console.error('Error counting unread social media:', error);
      }
    };

    countUnreadSocialMedia();

    // تحديث كل 10 ثواني
    const interval = setInterval(countUnreadSocialMedia, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // التحقق من صلاحية الموافقة (مدير أو استقبال)
  const canApproveRequests = () => {
    return user?.role === 'مدير' || user?.role === 'موظف استقبال' || user?.role === 'admin';
  };

  // تحميل الإشعارات الذكية من localStorage والـ API
  useEffect(() => {
    const loadNotifications = () => {
      const smartNotifications = NotificationService.getSmartNotifications();
      setNotifications(smartNotifications);
      setNotificationStats(NotificationService.getNotificationStats());

      // تحديث العدد السابق
      if (smartNotifications.length > previousNotificationCount.current && previousNotificationCount.current > 0) {
        // تشغيل صوت بناءً على آخر إشعار
        const latestNotification = smartNotifications[smartNotifications.length - 1];
        playNotificationSound('general', latestNotification);
      }
      previousNotificationCount.current = smartNotifications.length;
    };

    // تحميل الإشعارات عند التحميل الأولي
    loadNotifications();

    // بدء المراقبة التلقائية مع الأجهزة الأخرى
    const stopSync = NotificationService.startSmartNotificationSync((newNotifications) => {
      console.log('🔔 New smart notifications received from other devices:', newNotifications.length);

      // تحديث الإشعارات
      loadNotifications();

      // تشغيل الصوت للإشعارات الجديدة
      if (newNotifications.length > 0) {
        // تشغيل صوت بناءً على أول إشعار جديد
        playNotificationSound('general', newNotifications[0]);
      }
    });

    // بدء إنشاء الإشعارات التلقائية
    const autoNotificationInterval = setInterval(() => {
      NotificationService.createAutomaticNotifications();
    }, 60000); // كل دقيقة

    // الاستماع لحدث الإشعارات الجديدة
    const handleNewNotification = () => {
      loadNotifications();
    };

    const handleSmartNotificationAdded = (event: CustomEvent<SmartNotification>) => {
      loadNotifications();
      // تشغيل الصوت للإشعار الجديد
      playNotificationSound('general', event.detail);
    };

    window.addEventListener('new-notification', handleNewNotification);
    window.addEventListener('notifications-updated', handleNewNotification);
    window.addEventListener('smart-notification-added', handleSmartNotificationAdded);
    window.addEventListener('smart-notifications-updated', handleNewNotification);

    return () => {
      stopSync();
      clearInterval(autoNotificationInterval);
      window.removeEventListener('new-notification', handleNewNotification);
      window.removeEventListener('notifications-updated', handleNewNotification);
      window.removeEventListener('smart-notification-added', handleSmartNotificationAdded);
      window.removeEventListener('smart-notifications-updated', handleNewNotification);
    };
  }, []);
  
  // مراقبة الرسائل الجديدة من Firebase للمستخدم الحالي
  useEffect(() => {
    if (!user) return;

    const setupChatNotifications = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, query, where, onSnapshot, orderBy } = await import('firebase/firestore');
        
        const currentUserId = user.username || user.email;
        if (!currentUserId) return;

        console.log('👂 Setting up chat notifications for:', currentUserId);

        // مراقبة المحادثات التي يشارك فيها المستخدم
        const chatsRef = collection(db, 'chats');
        const chatsQuery = query(
          chatsRef, 
          where('participants', 'array-contains', currentUserId)
        );

        const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
              const chatData = change.doc.data();
              const chatId = change.doc.id;
              
              console.log('💬 Chat updated:', chatId, chatData);

              // التحقق من وجود رسالة جديدة
              if (chatData.lastMessage && chatData.lastMessageTime) {
                // الحصول على المرسل (الشخص الآخر في المحادثة)
                const senderId = chatData.participants.find((p: string) => p !== currentUserId);
                
                // إنشاء إشعار
                NotificationService.addSmartNotification({
                  title: `💬 رسالة جديدة من ${senderId}`,
                  message: chatData.lastMessage,
                  time: 'الآن',
                  unread: true,
                  type: 'system_alert',
                  priority: 'medium',
                  category: 'staff',
                  actionRequired: false,
                  requiresApproval: false,
                  actionUrl: '/dashboard/chat'
                });

                // تشغيل صوت الإشعار
                playNotificationSound('general');
                
                console.log('✅ Chat notification created');
              }
            }
          });
        });

        return () => {
          console.log('🧹 Cleaning up chat notifications');
          unsubscribeChats();
        };
      } catch (error) {
        console.error('❌ Error setting up chat notifications:', error);
      }
    };

    setupChatNotifications();
  }, [user]);  // تشغيل صوت الإشعار - يدعم أنواع مختلفة
  const playNotificationSound = (type: NotificationSoundType = 'general', notification?: SmartNotification) => {
    try {
      // إذا كان الإشعار يحتاج موافقة (طلب جديد)
      if (notification?.requiresApproval || notification?.type === 'guest_request') {
        playSound('new-request');
      } else if (notification?.priority === 'urgent') {
        playSound('new-request');
      } else if (notification?.type === 'payment_overdue') {
        playSound('general');
      } else {
        // استخدام النوع المحدد أو general
        playSound(type);
      }
    } catch (error) {
      console.error('❌ Sound failed in Header:', error);
      // في الـ header، لا نعرض alert حتى لا نزعج المستخدم
      // الصوت اختياري هنا
    }
  };

  // دالة مساعدة للحصول على أيقونة الفئة
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bookings': return <Calendar className="h-3 w-3 text-blue-500" />;
      case 'payments': return <DollarSign className="h-3 w-3 text-green-500" />;
      case 'rooms': return <Bed className="h-3 w-3 text-purple-500" />;
      case 'guests': return <Users className="h-3 w-3 text-orange-500" />;
      case 'system': return <Settings className="h-3 w-3 text-gray-500" />;
      case 'staff': return <Users className="h-3 w-3 text-indigo-500" />;
      default: return <Bell className="h-3 w-3 text-gray-500" />;
    }
  };

  // دالة مساعدة للحصول على لون الأولوية
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // دالة مساعدة للحصول على تسمية الأولوية
  const getPriorityLabel = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent': return 'طارئ';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return 'عادي';
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // تطبيق الوضع على body
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // تحميل الثيم من localStorage عند البدء
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLang(newLanguage);
  };

  // الموافقة على طلب
  const approveRequest = async (notificationId: string, requestId?: string) => {
    if (!canApproveRequests()) {
      alert('ليس لديك صلاحية الموافقة على الطلبات');
      return;
    }

    // تحديث حالة الطلب في localStorage (guest-requests هو المصدر الأساسي)
    let requestDetails: any = null;
    if (requestId) {
      const requests = JSON.parse(localStorage.getItem('guest-requests') || '[]');
      
      // العثور على الطلب للحصول على تفاصيله
      requestDetails = requests.find((req: any) => req.id === requestId);
      
      const updatedRequests = requests.map((req: any) => 
        req.id === requestId ? { ...req, status: 'قيد التنفيذ', approvedBy: user?.name, approvedAt: new Date().toISOString() } : req
      );
      localStorage.setItem('guest-requests', JSON.stringify(updatedRequests));
      
      // إطلاق حدث التحديث
      window.dispatchEvent(new Event('storage'));
      
      // إرسال إشعار للمُرسل (الشخص الذي أنشأ الطلب)
      if (requestDetails) {
        const approvalNotification = NotificationService.addSmartNotification({
          title: '✅ تمت الموافقة على طلبك',
          message: `تم قبول ${requestDetails.type}: ${requestDetails.description} - جارٍ التنفيذ الآن`,
          time: 'الآن',
          unread: true,
          type: 'system_alert',
          priority: 'medium',
          category: 'system',
          requiresApproval: false,
          actionRequired: false
        });
        
        // إرسال الإشعار للـ API ليصل لجميع الأجهزة
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(approvalNotification)
          });
          console.log('✅ Approval notification sent to API');
        } catch (error) {
          console.error('❌ Failed to send approval notification:', error);
        }
      }
    }

    // حذف الإشعار باستخدام NotificationService
    NotificationService.deleteSmartNotification(notificationId);

    alert('تم الموافقة على الطلب بنجاح! سيتم إخطار المُرسل.');
  };

  // رفض طلب
  const rejectRequest = async (notificationId: string, requestId?: string) => {
    if (!canApproveRequests()) {
      alert('ليس لديك صلاحية رفض الطلبات');
      return;
    }

    // تحديث حالة الطلب في localStorage
    let requestDetails: any = null;
    if (requestId) {
      const requests = JSON.parse(localStorage.getItem('guest-requests') || '[]');
      
      // العثور على الطلب للحصول على تفاصيله
      requestDetails = requests.find((req: any) => req.id === requestId);
      
      const updatedRequests = requests.map((req: any) => 
        req.id === requestId ? { ...req, status: 'مرفوض', rejectedBy: user?.name, rejectedAt: new Date().toISOString() } : req
      );
      localStorage.setItem('guest-requests', JSON.stringify(updatedRequests));
      
      // إطلاق حدث التحديث
      window.dispatchEvent(new Event('storage'));
      
      // إرسال إشعار للمُرسل
      if (requestDetails) {
        const rejectionNotification = NotificationService.addSmartNotification({
          title: '❌ تم رفض طلبك',
          message: `تم رفض ${requestDetails.type}: ${requestDetails.description}`,
          time: 'الآن',
          unread: true,
          type: 'system_alert',
          priority: 'low',
          category: 'system',
          requiresApproval: false,
          actionRequired: false
        });
        
        // إرسال الإشعار للـ API
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rejectionNotification)
          });
          console.log('✅ Rejection notification sent to API');
        } catch (error) {
          console.error('❌ Failed to send rejection notification:', error);
        }
      }
    }

    // حذف الإشعار باستخدام NotificationService
    NotificationService.deleteSmartNotification(notificationId);

    alert('تم رفض الطلب. سيتم إخطار المُرسل.');
  };

  // الذهاب إلى صفحة الطلبات
  const goToRequests = () => {
    router.push('/dashboard/requests');
  };

  return (
    <header 
      ref={headerRef}
      className={cn(
        "border-b shadow-lg transition-all duration-500 fixed top-0 left-0 right-0",
        "bg-black/30 backdrop-blur-xl border-b border-white/10",
        "dark:bg-black/30 dark:border-white/10",
        "z-50",
        isHeaderVisible ? "translate-y-0" : "-translate-y-full",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
        {/* Left Section - Menu Button & Large Brand */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Menu Button (always visible) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="text-white hover:text-blue-200 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200 px-3 py-2"
          >
            ☰
          </Button>

          {/* Large Brand Name with Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl ring-2 ring-white/30">
              <img src="/app-logo.png" alt={t('appName')} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover" style={{objectFit:'contain'}} />
            </div>
            <div>
              <h1 className="text-base sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
                {t('appName')}
              </h1>
              <p className="text-[10px] sm:text-xs text-purple-200/80 leading-none mt-0.5 hidden sm:block">{t('appSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Center Section - Current Time */}
        <div className="hidden xl:block">
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-purple-200">
              {new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Search Button - Icon Only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="hidden md:flex text-white hover:text-blue-200 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200 p-2 w-9 h-9"
            title="البحث"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Conversations - Icon Only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/chat')}
            className="hidden lg:flex text-white hover:text-blue-200 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200 p-2 w-9 h-9 relative"
            title="المحادثات الداخلية"
          >
            <MessageSquare className="w-4 h-4" />
            {totalUnreadChats > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {totalUnreadChats > 99 ? '99+' : totalUnreadChats}
              </span>
            )}
          </Button>

          {/* Social Media Platforms - Icon Only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/crm-whatsapp/unified-inbox')}
            className="hidden lg:flex text-white hover:text-purple-200 hover:bg-purple-500/20 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-200 p-2 w-9 h-9 relative group"
            title="منصات التواصل الاجتماعي"
          >
            <MessagesSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {totalUnreadSocialMedia > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                {totalUnreadSocialMedia > 99 ? '99+' : totalUnreadSocialMedia}
              </span>
            )}
          </Button>

          {/* Language Toggle - Icon Only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-white hover:text-blue-200 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200 p-2 w-9 h-9"
            title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          >
            <Globe className="w-4 h-4" />
          </Button>

          {/* Settings - Icon Only */}
          {canAccessSettings() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/settings')}
              className="text-white hover:text-blue-200 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200 p-2 w-9 h-9 hover:scale-110 transition-transform"
              title="مركز الإعدادات"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}

          {/* Notifications - Icon Only with Badge */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative text-white hover:text-blue-200 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200 p-2 w-9 h-9"
                title="الإشعارات"
              >
                <Bell className="w-4 h-4" />
                {notificationStats.unread > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    {notificationStats.unread}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-gray-800 shadow-xl z-50">
              <DropdownMenuLabel className="flex items-center justify-between text-gray-900">
                <span className="font-semibold">الإشعارات الذكية</span>
                <div className="flex gap-2">
                  {notificationStats.urgent > 0 && (
                    <Badge variant="destructive" className="bg-red-500 text-white text-xs">
                      {notificationStats.urgent} طارئ
                    </Badge>
                  )}
                  {notificationStats.actionRequired > 0 && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                      {notificationStats.actionRequired} إجراء مطلوب
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">{notificationStats.unread} جديد</Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">لا توجد إشعارات</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer",
                        notification.unread && 'bg-blue-50',
                        notification.priority === 'urgent' && 'bg-red-50',
                        notification.priority === 'high' && 'bg-orange-50'
                      )}
                      onClick={() => {
                        if (notification.actionUrl) {
                          router.push(notification.actionUrl);
                        }
                        NotificationService.markSmartNotificationAsRead(notification.id);
                      }}
                    >
                      <div className="flex items-start justify-between w-full mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={cn(
                              "text-sm truncate font-medium",
                              notification.unread ? 'text-gray-900' : 'text-gray-700'
                            )}>
                              {notification.title}
                            </p>
                            {notification.priority === 'urgent' && (
                              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            {notification.actionRequired && (
                              <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400">{notification.time}</p>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(notification.category)}
                              <Badge
                                variant="outline"
                                className={cn("text-xs", getPriorityColor(notification.priority))}
                              >
                                {getPriorityLabel(notification.priority)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2 flex-shrink-0" />
                        )}
                      </div>

                      {/* أزرار الإجراءات السريعة */}
                      {notification.requiresApproval && canApproveRequests() && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              approveRequest(notification.id, notification.requestId);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                          >
                            {t('approve')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              rejectRequest(notification.id, notification.requestId);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                          >
                            {t('reject')}
                          </Button>
                        </div>
                      )}

                      {notification.actionRequired && !notification.requiresApproval && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (notification.actionUrl) {
                              router.push(notification.actionUrl);
                            }
                          }}
                          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        >
                          اتخاذ إجراء
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => NotificationService.markAllSmartNotificationsAsRead()}
                  className="w-full text-blue-600 hover:bg-blue-50 font-medium"
                >
                  تحديد الكل كمقروء
                </Button>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-center text-blue-600 cursor-pointer hover:bg-blue-50 font-medium"
                onClick={goToRequests}
              >
                عرض جميع الإشعارات
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile - Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative z-50 flex items-center gap-2 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-200 px-2 py-1.5 rounded-lg"
                title="الملف الشخصي"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden ring-2 ring-white/30">
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={user?.name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-base">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-white truncate max-w-[100px] leading-tight">{user?.name || user?.username}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white shadow-xl border border-gray-200 z-[100]">
              <DropdownMenuLabel className="text-gray-900 font-semibold">
                <div className="font-semibold">{user?.name || user?.username}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/profile')} 
                className="cursor-pointer hover:bg-gray-100 text-gray-900"
              >
                <User className="h-4 w-4 ml-2" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/settings/notifications')} 
                className="cursor-pointer hover:bg-gray-100 text-gray-900"
              >
                <Bell className="h-4 w-4 ml-2" />
                <span>إعدادات الإشعارات</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  localStorage.clear();
                  router.push('/login');
                }}
                className="cursor-pointer text-red-600 hover:bg-red-50 font-medium"
              >
                <LogOut className="h-4 w-4 ml-2" />
                <span className="font-medium">تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Bar - Toggle */}
      {showSearch && (
        <div className="px-6 py-3 border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-purple-900/50 relative z-30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
            <Input
              type="search"
              placeholder={t('search')}
              className="pl-10 pr-4 bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:bg-white/20"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      <Dialog open={showAISettings} onOpenChange={setShowAISettings}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5 text-green-400" />
              إعدادات الذكاء الاصطناعي
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              قم بتكوين OpenAI API للحصول على ردود ذكية متقدمة
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                مفتاح OpenAI API
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">
                احصل على مفتاحك من{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                نموذج GPT
              </label>
              <select
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (أسرع وأرخص)</option>
                <option value="gpt-4o">GPT-4o (متوازن)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo (قوي)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (اقتصادي)</option>
              </select>
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                الإبداع (Temperature): {temperature.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>دقيق (0.0)</span>
                <span>متوازن (0.7)</span>
                <span>إبداعي (1.0)</span>
              </div>
            </div>

            {/* Current Status Info */}
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <div className="flex items-start gap-2 text-xs">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1",
                  apiKey ? 'bg-green-500' : 'bg-red-500'
                )}></div>
                <div className="flex-1">
                  <div className="font-medium">
                    {apiKey ? '✅ API Key مُعدّ' : '⚠️ لم يتم إدخال API Key'}
                  </div>
                  <div className="text-slate-400 mt-1">
                    {aiMode === 'off' && 'AI متوقف حالياً'}
                    {aiMode === 'local' && 'يعمل بالقواعد المحلية'}
                    {aiMode === 'openai' && apiKey && 'يعمل بـ OpenAI GPT ✨'}
                    {aiMode === 'openai' && !apiKey && 'لن يعمل OpenAI بدون API Key'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAISettings(false)}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                AIAutoReply.saveAIConfig({
                  openaiApiKey: apiKey,
                  openaiModel,
                  temperature
                });
                setShowAISettings(false);
                alert('✅ تم حفظ الإعدادات بنجاح!');
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}