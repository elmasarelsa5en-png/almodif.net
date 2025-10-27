'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ChevronDown,
  Home,
  Mail,
  Search,
  BookOpen,
  Play,
  Image,
  Video,
  FileText,
  Settings,
  Users,
  Calendar,
  BarChart3,
  CreditCard,
  Phone,
  MessageSquare,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  Download,
  Share,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Mic,
  MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'image' | 'video' | 'document' | 'interactive';
  attachments?: any[];
  quickReplies?: string[];
}

interface SystemSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  content: {
    overview: string;
    features: string[];
    screenshots: string[];
    tutorials: { title: string; steps: string[] }[];
    faq: { question: string; answer: string }[];
  };
}

export default function SmartAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '🎯 **مرحباً بك في المساعد الذكي المتقدم!**\n\nأنا هنا لمساعدتك في استكشاف جميع إمكانيات نظام إدارة الفندق الذكي.\n\n✨ **ما يمكنني مساعدتك فيه:**\n• شرح تفصيلي لكل قسم من أقسام النظام\n• عرض صور توضيحية حية\n• فيديوهات تعليمية تفاعلية\n• إجابة أسئلتك الفورية\n• دليل شامل للمبتدئين\n\nاختر من القائمة أدناه أو اسألني مباشرة! 🤖',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'interactive',
      quickReplies: ['البدء من البداية', 'الحجوزات', 'إدارة الغرف', 'التقارير المالية']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // قاعدة بيانات شاملة للنظام
  const systemDatabase: Record<string, SystemSection> = {
    'dashboard': {
      id: 'dashboard',
      title: 'لوحة التحكم الرئيسية',
      description: 'نظرة شاملة على أداء الفندق',
      icon: '📊',
      color: 'bg-blue-500',
      category: 'الأساسيات',
      content: {
        overview: 'لوحة التحكم هي قلب النظام حيث تحصل على نظرة شاملة ومباشرة على جميع أنشطة الفندق.',
        features: [
          'إحصائيات حية تتحدث كل 5 ثواني',
          'رسوم بيانية تفاعلية',
          'إشعارات فورية للطلبات الجديدة',
          'شريط أخبار متحرك',
          'تقارير سريعة',
          'أزرار سريعة للوصول للأقسام المهمة'
        ],
        screenshots: [
          '/images/dashboard-main.png',
          '/images/dashboard-stats.png',
          '/images/dashboard-notifications.png'
        ],
        tutorials: [{
          title: 'كيفية قراءة الإحصائيات',
          steps: [
            'انظر إلى البطاقات الملونة في الأعلى',
            'كل بطاقة تمثل مؤشر مهم (الغرف المتاحة، الحجوزات، الإيرادات)',
            'اضغط على أي بطاقة للانتقال للتفاصيل',
            'الأرقام تتحدث تلقائياً كل 5 ثواني'
          ]
        }],
        faq: [
          {
            question: 'لماذا تتحدث الإحصائيات؟',
            answer: 'لضمان حصولك على أحدث البيانات دائماً دون الحاجة لتحديث الصفحة'
          },
          {
            question: 'ماذا يعني الشريط الأحمر في الأسفل؟',
            answer: 'هذا شريط الأخبار الذي يعرض آخر الطلبات والإشعارات المهمة'
          }
        ]
      }
    },
    'bookings': {
      id: 'bookings',
      title: 'نظام إدارة الحجوزات',
      description: 'إدارة شاملة لحجوزات النزلاء',
      icon: '📅',
      color: 'bg-green-500',
      category: 'الحجوزات',
      content: {
        overview: 'نظام متكامل لإدارة جميع جوانب الحجوزات من الاستقبال حتى المغادرة.',
        features: [
          'إنشاء حجز جديد بخطوات بسيطة',
          'نظام بحث متقدم',
          'حالات ملونة للحجوزات',
          'تتبع المدفوعات',
          'إشعارات تلقائية',
          'تقارير شاملة'
        ],
        screenshots: [
          '/images/bookings-list.png',
          '/images/booking-form.png',
          '/images/booking-details.png'
        ],
        tutorials: [{
          title: 'إنشاء حجز جديد',
          steps: [
            'اضغط على "حجز جديد"',
            'أدخل بيانات النزيل الأساسية',
            'اختر الغرفة المناسبة',
            'حدد تاريخ الوصول والمغادرة',
            'أضف الخدمات الإضافية',
            'أكمل عملية الدفع'
          ]
        }],
        faq: [
          {
            question: 'كيف أعرف إذا كانت الغرفة متاحة؟',
            answer: 'الغرف المتاحة تظهر بلون أخضر في قائمة الغرف'
          },
          {
            question: 'هل يمكن تعديل الحجز بعد الإنشاء؟',
            answer: 'نعم، يمكن تعديل معظم تفاصيل الحجز من صفحة تفاصيل الحجز'
          }
        ]
      }
    },
    'rooms': {
      id: 'rooms',
      title: 'إدارة الغرف والوحدات',
      description: 'نظام متكامل لإدارة الغرف',
      icon: '🏠',
      color: 'bg-purple-500',
      category: 'الغرف',
      content: {
        overview: 'إدارة شاملة لجميع الغرف والوحدات السكنية في الفندق.',
        features: [
          'حالات ملونة للغرف',
          'نظام بحث وفلترة متقدم',
          'معلومات تفصيلية لكل غرفة',
          'إدارة الصيانة',
          'تتبع النظافة',
          'تقارير الإشغال'
        ],
        screenshots: [
          '/images/rooms-grid.png',
          '/images/room-details.png',
          '/images/room-maintenance.png'
        ],
        tutorials: [{
          title: 'فهم حالات الغرف',
          steps: [
            '🟢 أخضر: متاحة للحجز',
            '🔵 أزرق: مشغولة',
            '🟡 أصفر: تحت التنظيف',
            '🟠 برتقالي: قيد التنظيف',
            '⚪ أبيض: تحت الصيانة',
            '🔴 أحمر: محجوزة مسبقاً'
          ]
        }],
        faq: [
          {
            question: 'كيف أغير حالة الغرفة؟',
            answer: 'اضغط على الغرفة واختر الحالة الجديدة من القائمة المنسدلة'
          },
          {
            question: 'متى يتم تحديث حالة الغرفة تلقائياً؟',
            answer: 'عند إنشاء أو إلغاء الحجز، وعند تغيير حالة التنظيف'
          }
        ]
      }
    },
    'whatsapp': {
      id: 'whatsapp',
      title: 'CRM WhatsApp المتقدم',
      description: 'إدارة العملاء عبر واتساب',
      icon: '💬',
      color: 'bg-pink-500',
      category: 'التواصل',
      content: {
        overview: 'نظام متكامل لإدارة التواصل مع العملاء عبر WhatsApp.',
        features: [
          'ذكاء اصطناعي متقدم',
          'ردود تلقائية ذكية',
          'إدارة المحادثات',
          'قوالب الرسائل',
          'تكامل مع نظام الحجوزات',
          'إحصائيات شاملة'
        ],
        screenshots: [
          '/images/whatsapp-dashboard.png',
          '/images/whatsapp-chat.png',
          '/images/whatsapp-templates.png'
        ],
        tutorials: [{
          title: 'إعداد البوت الذكي',
          steps: [
            'اذهب لإعدادات WhatsApp',
            'فعل وضع الذكاء الاصطناعي',
            'اختر مستوى الذكاء المطلوب',
            'أضف ردود مخصصة',
            'اختبر البوت'
          ]
        }],
        faq: [
          {
            question: 'ما هو الفرق بين الأوضاع الثلاثة للذكاء الاصطناعي؟',
            answer: 'المحلي: ردود سريعة مجانية، GPT: ذكاء متقدم يحتاج API، معطل: رد يدوي فقط'
          },
          {
            question: 'هل يمكن تخصيص ردود البوت؟',
            answer: 'نعم، يمكن إضافة ردود مخصصة وتخصيص سلوك البوت'
          }
        ]
      }
    },
    'payments': {
      id: 'payments',
      title: 'روابط الدفع الإلكتروني',
      description: 'إنشاء وإدارة روابط الدفع',
      icon: '🔗',
      color: 'bg-cyan-500',
      category: 'المالية',
      content: {
        overview: 'إنشاء روابط دفع آمنة وسهلة المشاركة.',
        features: [
          'دعم جميع طرق الدفع',
          'روابط آمنة مشفرة',
          'تتبع حالة الدفع',
          'إشعارات فورية',
          'تقارير المدفوعات',
          'تكامل مع المحاسبة'
        ],
        screenshots: [
          '/images/payment-link-create.png',
          '/images/payment-methods.png',
          '/images/payment-tracking.png'
        ],
        tutorials: [{
          title: 'إنشاء رابط دفع',
          steps: [
            'اضغط على "رابط دفع جديد"',
            'أدخل المبلغ والوصف',
            'اختر طرق الدفع المسموحة',
            'اضبط تاريخ انتهاء الصلاحية',
            'انسخ الرابط أو أرسله مباشرة'
          ]
        }],
        faq: [
          {
            question: 'ما هي طرق الدفع المدعومة؟',
            answer: 'Apple Pay، Samsung Pay، Visa/MasterCard، مدى، والتحويل البنكي'
          },
          {
            question: 'هل الروابط آمنة؟',
            answer: 'نعم، جميع الروابط مشفرة وآمنة 100%'
          }
        ]
      }
    },
    'accounting': {
      id: 'accounting',
      title: 'النظام المحاسبي الشامل',
      description: 'إدارة مالية متقدمة',
      icon: '💰',
      color: 'bg-emerald-500',
      category: 'المالية',
      content: {
        overview: 'نظام محاسبي متكامل لإدارة جميع الأمور المالية.',
        features: [
          'إنشاء وإدارة الفواتير',
          'تتبع المصروفات',
          'تقارير مالية شاملة',
          'إدارة المدفوعات',
          'حركة النقدية',
          'التكامل مع البنوك'
        ],
        screenshots: [
          '/images/invoice-create.png',
          '/images/financial-reports.png',
          '/images/expense-tracking.png'
        ],
        tutorials: [{
          title: 'إنشاء فاتورة',
          steps: [
            'اختر نوع الفاتورة',
            'أضف الأصناف والخدمات',
            'أدخل الأسعار والكميات',
            'أضف الخصومات والضرائب',
            'احفظ واطبع الفاتورة'
          ]
        }],
        faq: [
          {
            question: 'هل يدعم النظام الفواتير الإلكترونية؟',
            answer: 'نعم، يمكن إرسال الفواتير بالبريد الإلكتروني وWhatsApp'
          },
          {
            question: 'كيف أتتبع المدفوعات؟',
            answer: 'من قسم "حركة النقدية" يمكنك رؤية جميع المدفوعات والمصروفات'
          }
        ]
      }
    }
  };

  // الردود الذكية
  const getSmartResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase().trim();

    // تحقق من الأقسام المباشرة
    for (const [key, section] of Object.entries(systemDatabase)) {
      if (input.includes(key) || input.includes(section.title.toLowerCase())) {
        return {
          id: Date.now().toString(),
          text: `📖 **${section.title}**\n\n${section.content.overview}\n\n🎯 **المميزات الرئيسية:**\n${section.content.features.map(f => `• ${f}`).join('\n')}\n\n💡 هل تريد رؤية صور توضيحية أو فيديو تعليمي؟`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'interactive',
          quickReplies: ['عرض الصور', 'فيديو تعليمي', 'الأسئلة الشائعة', 'العودة للقائمة']
        };
      }
    }

    // ردود عامة
    if (input.includes('مساعدة') || input.includes('help') || input.includes('؟')) {
      return {
        id: Date.now().toString(),
        text: '🤖 **كيف يمكنني مساعدتك؟**\n\nيمكنني:\n• شرح أي قسم من أقسام النظام 📚\n• عرض صور توضيحية 🖼️\n• تشغيل فيديوهات تعليمية 🎥\n• الإجابة على أسئلتك ❓\n\nاختر من الأقسام أدناه أو اسألني مباشرة!',
        sender: 'assistant',
        timestamp: new Date(),
        type: 'interactive',
        quickReplies: ['البدء من البداية', 'الحجوزات', 'إدارة الغرف', 'التقارير المالية']
      };
    }

    if (input.includes('صور') || input.includes('صورة') || input.includes('screenshots')) {
      return {
        id: Date.now().toString(),
        text: '🖼️ **صور توضيحية للنظام**\n\nإليك مجموعة من الصور التي توضح كيفية عمل النظام:\n\n1. 📊 لوحة التحكم الرئيسية\n2. 📅 نموذج إنشاء الحجز\n3. 🏠 شبكة الغرف والوحدات\n4. 💬 واجهة WhatsApp CRM\n5. 💰 تقارير المحاسبة\n\nاضغط على أي صورة لرؤيتها بحجم أكبر!',
        sender: 'assistant',
        timestamp: new Date(),
        type: 'image',
        attachments: [
          { type: 'image', url: '/images/dashboard-main.png', title: 'لوحة التحكم' },
          { type: 'image', url: '/images/booking-form.png', title: 'نموذج الحجز' },
          { type: 'image', url: '/images/rooms-grid.png', title: 'شبكة الغرف' }
        ]
      };
    }

    // رد افتراضي
    return {
      id: Date.now().toString(),
      text: '🤔 لم أفهم سؤالك تماماً. يمكنني مساعدتك في:\n\n📊 **لوحة التحكم** - إحصائيات ونظرة عامة\n📅 **الحجوزات** - إدارة حجوزات النزلاء\n🏠 **الغرف** - إدارة الوحدات السكنية\n💬 **WhatsApp CRM** - إدارة العملاء\n💰 **المحاسبة** - التقارير المالية\n🔗 **روابط الدفع** - المدفوعات الإلكترونية\n\nما الذي تريد معرفته بالضبط؟ 😊',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'interactive',
      quickReplies: ['البدء من البداية', 'الحجوزات', 'إدارة الغرف', 'التقارير المالية']
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getSmartResponse(inputValue);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (reply: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: reply,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const response = getSmartResponse(reply);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSectionClick = (sectionId: string) => {
    const section = systemDatabase[sectionId];
    if (!section) return;

    const response: Message = {
      id: Date.now().toString(),
      text: `📖 **${section.title}**\n\n${section.content.overview}\n\n🎯 **المميزات الرئيسية:**\n${section.content.features.map(f => `• ${f}`).join('\n')}\n\n💡 هل تريد رؤية صور توضيحية أو فيديو تعليمي؟`,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'interactive',
      quickReplies: ['عرض الصور', 'فيديو تعليمي', 'الأسئلة الشائعة', 'العودة للقائمة']
    };

    setMessages(prev => [...prev, response]);
    setShowMenu(false);
    setCurrentSection(sectionId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const categories = {
    'الأساسيات': ['dashboard'],
    'الحجوزات': ['bookings'],
    'الغرف': ['rooms'],
    'التواصل': ['whatsapp'],
    'المالية': ['payments', 'accounting']
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[9999] flex flex-col items-start gap-2">
        {/* زر المساعد الرئيسي - أصغر على الجوال */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 border-4 border-white/40 hover:border-white/60 group relative transition-all duration-300 hover:scale-110 active:scale-95"
          title="المساعد الذكي المتقدم"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          <div className="relative z-10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          {/* Badge للرسائل الجديدة */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
            <span className="text-[10px] text-white font-bold">1</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[9999] flex flex-col items-start gap-2">
      {/* نافذة المساعد الرئيسية */}
      <div className={cn(
        "bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
        isMinimized ? "w-72 md:w-80 h-14" : "w-[95vw] md:w-[480px] h-[90vh] md:h-[600px]"
      )} style={{
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      }}>
        {/* الهيدر المتقدم */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-0.5">👋 مرحباً {user?.name?.split(' ')[0] || 'akram'}</h3>
                  <p className="text-sm text-white/90 font-medium">المساعد الذكي المتقدم</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-all hover:rotate-12 duration-300"
                >
                  {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-all hover:scale-110 duration-300"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex gap-2 mt-3">
                <button className="flex-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:scale-105">
                  الرسالة الأخيرة
                </button>
                <button className="flex-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:scale-105">
                  أرسل لنا رسالة
                </button>
              </div>
            )}
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* قسم البحث والأدوات */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="البحث في المساعدة..."
                    className="pr-10 pl-4 py-2 rounded-full border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                    dir="rtl"
                  />
                </div>
                <button
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className={cn(
                    "p-2 rounded-full transition-all hover:scale-110",
                    isVoiceMode ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  )}
                >
                  {isVoiceMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={cn(
                    "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    showMenu ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                  دليل النظام
                </button>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className={cn(
                    "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    showHelp ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <HelpCircle className="w-4 h-4" />
                  المساعدة
                </button>
              </div>
            </div>

            {/* منطقة المحتوى الرئيسية */}
            <div className="flex-1 flex flex-col min-h-0">
              {showMenu ? (
                /* قائمة الأقسام */
                <div className="flex-1 overflow-y-auto p-4">
                  {Object.entries(categories).map(([categoryName, sectionIds]) => (
                    <div key={categoryName} className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                        {categoryName}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {sectionIds.map((sectionId) => {
                          const section = systemDatabase[sectionId];
                          return (
                            <button
                              key={sectionId}
                              onClick={() => handleSectionClick(sectionId)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 transition-all group text-right"
                            >
                              <div className="text-2xl">{section.icon}</div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">
                                  {section.title}
                                </h5>
                                <p className="text-xs text-gray-600 truncate">{section.description}</p>
                              </div>
                              <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* منطقة المحادثة */
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.sender === 'assistant' && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="max-w-[75%] space-y-2">
                          <div
                            className={cn(
                              "rounded-2xl p-4 shadow-sm border",
                              message.sender === 'user'
                                ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-indigo-500 rounded-tr-md"
                                : "bg-white border-gray-200 text-gray-800 rounded-tl-md"
                            )}
                          >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.text}
                            </div>
                            <p className={cn(
                              "text-[10px] mt-2 opacity-75",
                              message.sender === 'user' ? "text-indigo-100" : "text-gray-500"
                            )}>
                              {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {/* الردود السريعة */}
                          {message.quickReplies && message.quickReplies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {message.quickReplies.map((reply, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleQuickReply(reply)}
                                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-all hover:scale-105"
                                >
                                  {reply}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* المرفقات */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={attachment.url}
                                    alt={attachment.title}
                                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-white" />
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 text-center">{attachment.title}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {message.sender === 'user' && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
                            <span className="text-white font-semibold text-sm">
                              {user?.name?.charAt(0)?.toUpperCase() || 'أ'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-4 shadow-sm">
                          <div className="flex gap-1 mb-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <p className="text-xs text-gray-500">المساعد يكتب...</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* منطقة الإدخال */}
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-3">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="اكتب رسالة... (أو اسأل المساعد الذكي)"
                        className="flex-1 rounded-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-900 placeholder:text-gray-400 px-4 py-3"
                        dir="rtl"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="rounded-full w-12 h-12 p-0 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-gray-500">نرد عادة في غضون ثوانٍ</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="border-t border-gray-200 bg-white">
              <div className="flex items-center justify-around p-3">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex flex-col items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                >
                  <Home className="w-5 h-5" />
                  <span className="text-[10px] font-medium">الرئيسية</span>
                </button>
                <button
                  onClick={() => {
                    setMessages([{
                      id: '1',
                      text: '👋 مرحباً! كيف يمكنني مساعدتك اليوم؟',
                      sender: 'assistant',
                      timestamp: new Date()
                    }]);
                    setShowMenu(true);
                  }}
                  className="flex flex-col items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-[10px] font-medium">الرسائل</span>
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-colors p-2 rounded-lg",
                    showMenu ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                  )}
                >
                  <Search className="w-5 h-5" />
                  <span className="text-[10px] font-medium">المساعدة</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};