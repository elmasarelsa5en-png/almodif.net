'use client';

/**
 * AI Chatbot Widget Component
 * ويدجت الشات بوت الذكي
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Languages,
  AlertCircle,
} from 'lucide-react';
import { chatbotService, type ChatMessage, type Language } from '@/lib/ai/chatbot-service';

interface ChatWidgetProps {
  userId: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  channel?: 'whatsapp' | 'website' | 'email' | 'sms';
  initialLanguage?: Language;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
}

export default function ChatWidget({
  userId,
  guestName,
  guestEmail,
  guestPhone,
  channel = 'website',
  initialLanguage = 'ar',
  position = 'bottom-right',
  theme = 'light',
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation
  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen]);

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = chatbotService.subscribeToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeConversation = async () => {
    try {
      const convId = await chatbotService.createConversation({
        userId,
        guestName,
        guestEmail,
        guestPhone,
        channel,
        language,
      });
      setConversationId(convId);

      // Send welcome message
      const welcomeMessage = language === 'ar'
        ? `مرحباً ${guestName || 'بك'}! 👋\n\nأنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟`
        : `Welcome ${guestName || ''}! 👋\n\nI'm your AI assistant. How can I help you today?`;

      await chatbotService.sendMessage(convId, welcomeMessage, 'assistant', true);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setError(language === 'ar' ? 'عذراً، حدث خطأ' : 'Sorry, an error occurred');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatbotService.processMessage(conversationId, userMessage);

      if (response.requiresHuman) {
        setError(language === 'ar' ? 'جاري التحويل لموظف...' : 'Transferring to staff...');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(language === 'ar' ? 'عذراً، حدث خطأ' : 'Sorry, an error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const themeClasses = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200',
      input: 'bg-gray-50',
      userBubble: 'bg-blue-600 text-white',
      botBubble: 'bg-gray-100 text-gray-900',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-gray-700',
      input: 'bg-gray-800',
      userBubble: 'bg-blue-600 text-white',
      botBubble: 'bg-gray-800 text-white',
    },
  };

  const t = themeClasses[theme];

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${positionClasses[position]} z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center group`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${positionClasses[position]} ${position === 'bottom-right' ? 'mr-20' : 'ml-20'} z-40 w-96 h-[600px] ${t.bg} ${t.border} border rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
                  </h3>
                  <p className="text-xs opacity-90">
                    {language === 'ar' ? 'متصل الآن' : 'Online now'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleLanguage}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
              >
                <Languages className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' ? t.userBubble : 'bg-gradient-to-br from-blue-500 to-purple-500'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.role === 'user' ? t.userBubble : t.botBubble
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      
                      {/* Intent Badge */}
                      {message.intent && message.role === 'user' && (
                        <div className="mt-2 text-xs opacity-75">
                          {language === 'ar' ? 'النية: ' : 'Intent: '}
                          <span className="font-medium">{message.intent}</span>
                          {message.confidence && (
                            <span className="ml-1">
                              ({Math.round(message.confidence * 100)}%)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Sentiment Badge */}
                      {message.sentiment && message.role === 'user' && (
                        <div className="mt-1 flex items-center gap-1 text-xs opacity-75">
                          {message.sentiment === 'positive' && '😊'}
                          {message.sentiment === 'neutral' && '😐'}
                          {message.sentiment === 'negative' && '😞'}
                          <span className="capitalize">{message.sentiment}</span>
                        </div>
                      )}

                      <p className="text-xs opacity-75 mt-1">
                        {message.timestamp.toDate().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${t.botBubble}`}>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-yellow-100 text-yellow-800 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${t.border}`}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                  className={`flex-1 ${t.input} ${t.text} rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isLoading || !conversationId}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || !conversationId}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Powered by */}
              <div className="text-center mt-2">
                <p className="text-xs opacity-50">
                  {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'} ✨
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
