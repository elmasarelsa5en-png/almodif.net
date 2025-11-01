'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, 
  Send, 
  Home, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Wifi,
  Coffee,
  Utensils,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'أين يقع فندق سيفن سون؟',
      answer: 'يقع فندق سيفن سون في العنوان الجديد - مدينة أبها، المملكة العربية السعودية. نحن في موقع استراتيجي يسهل الوصول إليه من جميع أنحاء المدينة.',
      category: 'الموقع'
    },
    {
      id: '2',
      question: 'ما هي أوقات تسجيل الدخول والخروج؟',
      answer: 'تسجيل الدخول: من الساعة 2:00 ظهراً\nتسجيل الخروج: حتى الساعة 12:00 ظهراً\nفي حالة التأخير عن موعد الخروج، سيتم احتساب يوم إضافي.',
      category: 'الحجز'
    },
    {
      id: '3',
      question: 'كيف يمكنني الحجز؟',
      answer: 'يمكنك الحجز بسهولة من خلال:\n1. الضغط على زر "احجز الآن" في الموقع\n2. تسجيل حساب جديد أو تسجيل الدخول\n3. اختيار نوع الغرفة والتواريخ\n4. دفع يوم واحد على الأقل كتأمين\n5. استلام العقد الإلكتروني للتوقيع',
      category: 'الحجز'
    },
    {
      id: '4',
      question: 'ما هي أسعار الغرف؟',
      answer: 'لدينا مجموعة متنوعة من الغرف بأسعار مختلفة:\n- غرف عادية: تبدأ من 200 ريال/ليلة\n- أجنحة: تبدأ من 350 ريال/ليلة\n- شقق: تبدأ من 500 ريال/ليلة\n\nيمكنك مشاهدة جميع الأسعار التفصيلية في قسم "الغرف والأجنحة".',
      category: 'الأسعار'
    },
    {
      id: '5',
      question: 'هل يوجد خصومات للإقامة الطويلة؟',
      answer: 'نعم! نوفر خصومات خاصة:\n- الإقامة الأسبوعية: خصم 10%\n- الإقامة الشهرية: خصم 20%\n\nتواصل معنا للحصول على عروض خاصة.',
      category: 'الأسعار'
    },
    {
      id: '6',
      question: 'ما هي الخدمات المتاحة في الفندق؟',
      answer: 'نوفر مجموعة كاملة من الخدمات:\n- إنترنت فائق السرعة (WiFi مجاني)\n- كافيه ومطعم\n- خدمة الغرف 24/7\n- مواقف سيارات مجانية\n- صالة رياضية\n- حمام سباحة\n- أمن وحراسة\n- استقبال 24 ساعة',
      category: 'الخدمات'
    },
    {
      id: '7',
      question: 'هل يوجد موقف سيارات؟',
      answer: 'نعم، نوفر موقف سيارات مجاني وآمن لجميع النزلاء مع حراسة على مدار الساعة.',
      category: 'الخدمات'
    },
    {
      id: '8',
      question: 'هل يمكنني إلغاء الحجز؟',
      answer: 'سياسة الإلغاء:\n- الإلغاء قبل 48 ساعة: استرداد كامل\n- الإلغاء قبل 24 ساعة: استرداد 50%\n- الإلغاء بعد ذلك: لا يوجد استرداد\n\nيرجى قراءة شروط الحجز بعناية.',
      category: 'الحجز'
    },
    {
      id: '9',
      question: 'كم مبلغ التأمين المطلوب؟',
      answer: 'مبلغ التأمين: 500 ريال\nهذا المبلغ قابل للاسترداد عند المغادرة إذا لم تكن هناك أي أضرار في الغرفة.',
      category: 'الأسعار'
    },
    {
      id: '10',
      question: 'كيف يمكنني التواصل مع الفندق؟',
      answer: 'يمكنك التواصل معنا عبر:\n📞 الهاتف: +966 50 475 5400\n📧 البريد: info@almodif.net\n📍 العنوان: العنوان الجديد - أبها\n\nفريقنا متاح 24/7 للرد على استفساراتك.',
      category: 'التواصل'
    }
  ];

  // Knowledge base للشات بوت
  const knowledgeBase: Record<string, string> = {
    'مرحبا|أهلا|السلام': 'مرحباً بك في فندق سيفن سون! 🌟\nكيف يمكنني مساعدتك اليوم؟',
    'موقع|مكان|عنوان|أين': 'يقع فندق سيفن سون في العنوان الجديد - مدينة أبها 📍\nنحن في موقع استراتيجي يسهل الوصول إليه من جميع أنحاء المدينة.',
    'حجز|احجز|الحجز': 'يمكنك الحجز بسهولة! 🎯\n\n1️⃣ اضغط على زر "احجز الآن"\n2️⃣ سجّل حساب جديد\n3️⃣ اختر نوع الغرفة والتواريخ\n4️⃣ ادفع يوم واحد كتأمين\n5️⃣ وقّع العقد الإلكتروني\n\nهل تريد البدء بالحجز الآن؟',
    'سعر|أسعار|تكلفة|كم': 'أسعارنا تبدأ من: 💰\n\n🛏️ غرف عادية: من 200 ريال/ليلة\n🏨 أجنحة: من 350 ريال/ليلة\n🏠 شقق: من 500 ريال/ليلة\n\n✨ خصومات خاصة للإقامات الطويلة!',
    'خدمات|مرافق|خدمة': 'خدماتنا المتميزة: ⭐\n\n📶 إنترنت مجاني\n☕ كافيه ومطعم\n🍽️ خدمة غرف 24/7\n🚗 مواقف مجانية\n💪 صالة رياضية\n🏊 حمام سباحة\n🛡️ أمن وحراسة\n\nهل تريد معرفة المزيد؟',
    'دخول|خروج|وقت|ساعة': '⏰ أوقات العمل:\n\n✅ تسجيل الدخول: 2:00 ظهراً\n❌ تسجيل الخروج: 12:00 ظهراً\n\nفي حالة التأخير، يتم احتساب يوم إضافي.',
    'هاتف|تواصل|اتصال|رقم': '📞 تواصل معنا:\n\nهاتف: +966 50 475 5400\nبريد: info@almodif.net\n\nفريقنا متاح 24/7! 🌟',
    'إلغاء|الغاء': '📋 سياسة الإلغاء:\n\n✅ قبل 48 ساعة: استرداد كامل\n⚠️ قبل 24 ساعة: استرداد 50%\n❌ بعد ذلك: لا يوجد استرداد',
    'تأمين|ضمان': '💵 مبلغ التأمين: 500 ريال\n\nقابل للاسترداد عند المغادرة إذا لم تكن هناك أضرار.',
    'واي فاي|wifi|انترنت': '📶 نعم! نوفر إنترنت فائق السرعة (WiFi) مجاناً في جميع الغرف والمرافق.',
    'مطعم|طعام|فطور': '🍽️ لدينا:\n\n☕ كافيه راقي\n🍴 مطعم متكامل\n🛎️ خدمة غرف 24/7\n\nنوفر وجبات محلية وعالمية.',
    'سيارة|موقف|باركنج': '🚗 نعم! موقف سيارات مجاني وآمن مع حراسة 24 ساعة.',
    'شكرا|شكراً|thanks': 'العفو! سعداء بخدمتك 🌟\nلا تتردد في السؤال عن أي شيء آخر!'
  };

  useEffect(() => {
    // رسالة ترحيبية عند فتح الصفحة
    setMessages([{
      id: '1',
      text: 'مرحباً بك في فندق سيفن سون! 🏨✨\n\nأنا مساعدك الافتراضي، كيف يمكنني مساعدتك اليوم؟\n\nيمكنك سؤالي عن:\n• الموقع والعنوان\n• أسعار الغرف\n• خدمات الفندق\n• الحجز والإلغاء\n• أوقات الدخول والخروج',
      sender: 'bot',
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();

    // البحث في قاعدة المعرفة
    for (const [keywords, response] of Object.entries(knowledgeBase)) {
      const keywordList = keywords.split('|');
      if (keywordList.some(keyword => lowerMessage.includes(keyword))) {
        return response;
      }
    }

    // رد افتراضي
    return 'عذراً، لم أفهم سؤالك بشكل كامل. 🤔\n\nيمكنك:\n\n1️⃣ تصفح الأسئلة الشائعة أدناه\n2️⃣ التواصل مع الاستقبال: +966 50 475 5400\n3️⃣ إرسال بريد: info@almodif.net\n\nهل تريد الحجز مباشرة؟';
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // إضافة رسالة المستخدم
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // محاكاة وقت الاستجابة
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/public/landing" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Home className="h-5 w-5" />
            <span className="font-semibold">العودة للرئيسية</span>
          </Link>
          <Link href="/guest-app/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Calendar className="h-4 w-4 ml-2" />
              احجز الآن
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            الاستفسارات العامة
          </h1>
          <p className="text-xl text-gray-600">
            اسأل مساعدنا الافتراضي أو تصفح الأسئلة الشائعة
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chatbot Section */}
          <Card className="bg-white shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">المساعد الذكي</h2>
                  <p className="text-blue-100">متاح 24/7 للرد على أسئلتك</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    message.sender === 'bot' 
                      ? 'bg-blue-100' 
                      : 'bg-purple-100'
                  }`}>
                    {message.sender === 'bot' ? (
                      <Bot className="h-5 w-5 text-blue-600" />
                    ) : (
                      <User className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.sender === 'bot'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.text}</p>
                    <span className={`text-xs mt-2 block ${
                      message.sender === 'bot' ? 'text-gray-500' : 'text-blue-100'
                    }`}>
                      {message.timestamp.toLocaleTimeString('ar-SA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 text-lg"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                  disabled={!inputMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                اضغط Enter للإرسال
              </p>
            </div>
          </Card>

          {/* FAQs Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              الأسئلة الشائعة
            </h2>

            {categories.map((category) => (
              <div key={category} className="mb-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">
                  {category}
                </h3>
                <div className="space-y-3">
                  {faqs
                    .filter(faq => faq.category === category)
                    .map((faq) => (
                      <Card
                        key={faq.id}
                        className="bg-white hover:shadow-lg transition cursor-pointer"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 flex-1">
                              {faq.question}
                            </h4>
                            {expandedFAQ === faq.id ? (
                              <ChevronUp className="h-5 w-5 text-blue-600" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          {expandedFAQ === faq.id && (
                            <p className="mt-3 text-gray-600 whitespace-pre-line border-t pt-3">
                              {faq.answer}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">
            تواصل معنا مباشرة
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">الهاتف</h3>
              <a href="tel:+966504755400" className="hover:underline">
                +966 50 475 5400
              </a>
            </div>
            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">البريد الإلكتروني</h3>
              <a href="mailto:info@almodif.net" className="hover:underline">
                info@almodif.net
              </a>
            </div>
            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">الموقع</h3>
              <p>العنوان الجديد - أبها</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
