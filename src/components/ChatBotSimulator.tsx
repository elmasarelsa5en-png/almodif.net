'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Plus, 
  Camera, 
  Edit2, 
  MessageSquare, 
  Bot, 
  Send,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  Users,
  Info
} from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}


interface RoomAvailability {
  [key: string]: {
    [date: string]: boolean; // true = available, false = booked
  };
}

interface ChatBotProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatBotSimulator({ isOpen, onOpenChange }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'مرحباً! أنا مساعدك الذكي لفندق المضيف. يمكنني مساعدتك في معرفة أسعار الغرف والمكونات والتواريخ المتاحة. كيف يمكنني مساعدتك؟',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [availability] = useState<RoomAvailability>({
    '1': {
      '2025-10-05': true,
      '2025-10-06': false,
      '2025-10-07': true,
      '2025-10-08': true,
      '2025-10-09': false
    },
    '2': {
      '2025-10-05': true,
      '2025-10-06': true,
      '2025-10-07': false,
      '2025-10-08': true,
      '2025-10-09': true
    }
  });

  // منطق الردود (يمكنك تطويره لاحقاً)
  const processUserMessage = (message: string): string => {
    const msg = message.toLowerCase();
    if (msg.includes('سعر') || msg.includes('تكلفة') || msg.includes('كم') || msg.includes('أسعار')) {
      return 'إليك أسعار الغرف المتاحة:\n\nغرفة مفردة: 200 ريال\nغرفة مزدوجة: 350 ريال\nجناح: 600 ريال';
    }
    if (msg.includes('مكونات') || msg.includes('مرافق')) {
      return 'مكونات الغرف:\n- سرير مريح\n- تكييف\n- حمام خاص\n- واي فاي مجاني\n- تلفاز ذكي';
    }
    if (msg.includes('متاح') || msg.includes('توافر') || msg.includes('توفر')) {
      return 'يرجى تحديد تاريخ التحقق من التوفر.';
    }
    if (msg.includes('حجز')) {
      return 'لإتمام الحجز، يرجى التواصل مع فريق الاستقبال:\n\n📞 الهاتف: [رقم الهاتف]\n📧 البريد الإلكتروني: [البريد الإلكتروني]';
    }
    return 'يمكنني مساعدتك في:\n💰 أسعار الغرف\n🏨 مكونات ومرافق الغرف\n📅 التحقق من التوفر\n📞 معلومات الحجز';
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    const botResponse = processUserMessage(inputMessage);
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      message: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage, botMessage]);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // التصميم الاحترافي النهائي
  return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl shadow-2xl border-0">
          <DialogHeader className="bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-800 p-6">
            <DialogTitle className="flex items-center gap-2 text-white text-xl font-bold">
              <Bot className="w-6 h-6 text-yellow-300" />
              مساعد المضيف سمارت
            </DialogTitle>
          </DialogHeader>
          <div className="h-[400px] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-lg text-sm transition-all duration-200
                    ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-700 text-white border-2 border-blue-300/30'
                        : 'bg-white/90 text-slate-900 border-2 border-indigo-100/40'
                    }`}
                  style={{
                    boxShadow: message.sender === 'user'
                      ? '0 4px 24px 0 rgba(59,130,246,0.15)'
                      : '0 2px 12px 0 rgba(80,80,120,0.08)'
                  }}
                >
                  <p className="text-sm whitespace-pre-line font-medium">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('ar-SA', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Input Area */}
          <div className="p-4 border-t bg-gradient-to-r from-white via-blue-50 to-indigo-100">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 bg-white/80 border-blue-200 focus:ring-2 focus:ring-blue-400"
              />
              <Button onClick={sendMessage} size="sm" className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage('كم سعر الغرف؟')}
                className="text-xs border-blue-300/40 bg-blue-50/40 hover:bg-blue-100/60"
              >
                الأسعار
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage('ما مكونات الغرف؟')}
                className="text-xs border-indigo-300/40 bg-indigo-50/40 hover:bg-indigo-100/60"
              >
                المكونات
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage('هل متاح يوم 2025-10-07؟')}
                className="text-xs border-purple-300/40 bg-purple-50/40 hover:bg-purple-100/60"
              >
                التوفر
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
