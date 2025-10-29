'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Search, Phone, Video, MoreVertical, Smile, Paperclip,
  CheckCheck, Check, Circle, Loader2, MessageSquare, Users, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  username: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  department?: string;
  isOnline?: boolean;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        console.log(' Loading employees...');
        const employeesRef = collection(db, 'employees');
        const employeesSnap = await getDocs(employeesRef);
        
        const employeesList: Employee[] = [];
        employeesSnap.forEach((doc) => {
          const data = doc.data();
          if (doc.id !== user?.username && doc.id !== user?.email) {
            employeesList.push({
              id: doc.id,
              username: data.username || doc.id,
              name: data.name || data.username || doc.id,
              email: data.email,
              avatar: data.avatar,
              role: data.role,
              department: data.department,
              isOnline: true,
            });
          }
        });

        console.log(' Loaded employees:', employeesList.length);
        setEmployees(employeesList);
      } catch (error) {
        console.error(' Error loading employees:', error);
      }
    };

    if (user) {
      loadEmployees();
    }
  }, [user]);

  const getOrCreateChat = async (employeeId: string) => {
    try {
      const currentUserId = user?.username || user?.email;
      if (!currentUserId) return null;

      console.log(' Looking for chat between:', currentUserId, 'and', employeeId);

      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', currentUserId));
      const querySnapshot = await getDocs(q);
      
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        if (data.participants.includes(employeeId)) {
          console.log(' Found existing chat:', docSnap.id);
          return docSnap.id;
        }
      }

      console.log(' Creating new chat...');
      const newChatRef = await addDoc(collection(db, 'chats'), {
        participants: [currentUserId, employeeId],
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        lastMessage: '',
      });

      console.log(' Chat created:', newChatRef.id);
      return newChatRef.id;
    } catch (error) {
      console.error(' Error in getOrCreateChat:', error);
      return null;
    }
  };

  const selectEmployee = async (employee: Employee) => {
    console.log('🎯 Selecting employee:', employee.name);
    
    // إلغاء الـ listener القديم إذا كان موجود
    if (unsubscribeRef.current) {
      console.log('🔕 Unsubscribing from old chat');
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    setSelectedEmployee(employee);
    setMessages([]);
    
    const chatId = await getOrCreateChat(employee.id);
    if (chatId) {
      setCurrentChatId(chatId);
      
      console.log('👂 Setting up message listener for chat:', chatId);
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('chatId', '==', chatId), orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('📨 Messages snapshot received:', snapshot.size, 'messages');
        const messagesList: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messagesList.push({
            id: doc.id,
            chatId: data.chatId,
            senderId: data.senderId,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
            read: data.read || false,
          });
        });
        console.log('💬 Setting messages state:', messagesList.length);
        setMessages(messagesList);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }, (error) => {
        console.error('❌ Error in messages listener:', error);
      });

      // حفظ الـ unsubscribe function
      unsubscribeRef.current = unsubscribe;
    }
  };
  
  // تنظيف الـ listener عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 Cleaning up message listener');
        unsubscribeRef.current();
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!messageText.trim() || !currentChatId || !selectedEmployee) {
      console.warn('⚠️ Cannot send message:', { 
        hasText: !!messageText.trim(), 
        hasChatId: !!currentChatId, 
        hasEmployee: !!selectedEmployee 
      });
      return;
    }

    setIsSending(true);
    setErrorMessage('');
    console.log('📤 Sending message...', {
      chatId: currentChatId,
      text: messageText.trim(),
      sender: user?.username || user?.email
    });

    try {
      const currentUserId = user?.username || user?.email;
      
      if (!currentUserId) {
        throw new Error('User ID not found');
      }

      console.log('💾 Adding message to Firestore...');
      const messageRef = await addDoc(collection(db, 'messages'), {
        chatId: currentChatId,
        senderId: currentUserId,
        text: messageText.trim(),
        timestamp: serverTimestamp(),
        read: false,
      });
      console.log('✅ Message added with ID:', messageRef.id);

      console.log('📝 Updating chat document...');
      const chatRef = doc(db, 'chats', currentChatId);
      await updateDoc(chatRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
      });
      console.log('✅ Chat updated successfully');

      setMessageText('');
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        name: error?.name,
      });
      
      const errorMsg = `فشل إرسال الرسالة: ${error?.message || 'خطأ غير معروف'}`;
      setErrorMessage(errorMsg);
      
      // إزالة رسالة الخطأ بعد 5 ثواني
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSending(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className='h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden' dir='rtl'>
        
        <div className='w-80 bg-slate-800/50 backdrop-blur-xl border-l border-white/10 flex flex-col'>
          <div className='p-4 border-b border-white/10'>
            <h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
              <MessageSquare className='w-6 h-6' />
              المحادثات
            </h2>
            
            <div className='relative'>
              <Search className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                placeholder='ابحث عن موظف...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500'
              />
            </div>
          </div>

          <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent'>
            {filteredEmployees.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-gray-400 p-4'>
                <Users className='w-12 h-12 mb-2 opacity-50' />
                <p className='text-center'>لا يوجد موظفين</p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => selectEmployee(employee)}
                  className={cn(
                    'w-full p-4 flex items-center gap-3 hover:bg-slate-700/50 transition-all border-b border-white/5',
                    selectedEmployee?.id === employee.id && 'bg-gradient-to-l from-purple-500/20 to-transparent border-r-2 border-purple-500'
                  )}
                >
                  <div className='relative flex-shrink-0'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden ring-2 ring-white/20 shadow-lg'>
                      {employee.avatar ? (
                        <img src={employee.avatar} alt={employee.name} className='w-full h-full object-cover' />
                      ) : (
                        <span className='text-white font-bold text-lg'>{employee.name.charAt(0)}</span>
                      )}
                    </div>
                    {employee.isOnline && (
                      <div className='absolute bottom-0 left-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-800 shadow-lg' />
                    )}
                  </div>

                  <div className='flex-1 text-right overflow-hidden'>
                    <p className='font-semibold text-white truncate text-sm'>{employee.name}</p>
                    <p className='text-xs text-gray-400 truncate'>{employee.role || employee.department || 'موظف'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className='flex-1 flex flex-col'>
          {selectedEmployee ? (
            <>
              <div className='bg-slate-800/70 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between shadow-lg'>
                <div className='flex items-center gap-3'>
                  <div className='w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden ring-2 ring-white/30 shadow-lg'>
                    {selectedEmployee.avatar ? (
                      <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className='w-full h-full object-cover' />
                    ) : (
                      <span className='text-white font-bold text-lg'>{selectedEmployee.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className='font-bold text-white text-lg'>{selectedEmployee.name}</h3>
                    <p className='text-sm text-green-400 flex items-center gap-1.5'>
                      <Circle className='w-2 h-2 fill-current animate-pulse' />
                      متصل الآن
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-1'>
                  <Button variant='ghost' size='sm' className='text-white hover:bg-slate-700/50 rounded-full w-9 h-9 p-0'>
                    <Phone className='w-5 h-5' />
                  </Button>
                  <Button variant='ghost' size='sm' className='text-white hover:bg-slate-700/50 rounded-full w-9 h-9 p-0'>
                    <Video className='w-5 h-5' />
                  </Button>
                  <Button variant='ghost' size='sm' className='text-white hover:bg-slate-700/50 rounded-full w-9 h-9 p-0'>
                    <MoreVertical className='w-5 h-5' />
                  </Button>
                </div>
              </div>

              <div className='flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/30 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent'>
                {messages.length === 0 ? (
                  <div className='flex flex-col items-center justify-center h-full text-gray-400'>
                    <div className='bg-slate-800/50 rounded-full p-6 mb-4'>
                      <MessageSquare className='w-16 h-16 opacity-50' />
                    </div>
                    <p className='text-lg font-semibold text-white'>ابدأ محادثة مع {selectedEmployee.name}</p>
                    <p className='text-sm'>أرسل رسالتك الأولى الآن</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = message.senderId === (user?.username || user?.email);
                    
                    return (
                      <div key={message.id} className={cn('flex animate-in fade-in slide-in-from-bottom-2 duration-300', isCurrentUser ? 'justify-start' : 'justify-end')}>
                        <div className={cn('max-w-[70%] rounded-2xl px-4 py-3 shadow-xl', isCurrentUser ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm' : 'bg-slate-700/90 backdrop-blur-sm text-white rounded-bl-sm')}>
                          <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>{message.text}</p>
                          <div className='flex items-center gap-1.5 mt-2 justify-end'>
                            <span className='text-xs opacity-70'>{message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                            {isCurrentUser && (message.read ? <CheckCheck className='w-3.5 h-3.5 text-blue-200' /> : <Check className='w-3.5 h-3.5 opacity-70' />)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className='bg-slate-800/70 backdrop-blur-xl border-t border-white/10 p-4 shadow-lg'>
                {errorMessage && (
                  <div className='mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200 animate-in fade-in slide-in-from-bottom-2'>
                    <AlertCircle className='w-5 h-5 flex-shrink-0' />
                    <p className='text-sm'>{errorMessage}</p>
                  </div>
                )}
                
                <div className='flex items-center gap-2'>
                  <Button variant='ghost' size='sm' className='text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-full w-9 h-9 p-0'>
                    <Smile className='w-5 h-5' />
                  </Button>
                  <Button variant='ghost' size='sm' className='text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-full w-9 h-9 p-0'>
                    <Paperclip className='w-5 h-5' />
                  </Button>
                  
                  <Input
                    placeholder='اكتب رسالتك...'
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    className='flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 rounded-full px-4'
                  />
                  
                  <Button onClick={sendMessage} disabled={!messageText.trim() || isSending} className='bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full w-11 h-11 p-0 shadow-lg disabled:opacity-50'>
                    {isSending ? <Loader2 className='w-5 h-5 animate-spin' /> : <Send className='w-5 h-5' />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className='flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-900/20'>
              <div className='bg-slate-800/50 rounded-full p-8 mb-6'>
                <MessageSquare className='w-24 h-24 opacity-30' />
              </div>
              <h3 className='text-3xl font-bold text-white mb-3'>مرحباً بك في المحادثات</h3>
              <p className='text-center max-w-md text-lg'>اختر موظفاً من القائمة على اليمين لبدء محادثة معه</p>
              <div className='mt-6 flex items-center gap-2 text-purple-400'>
                <Circle className='w-2 h-2 fill-current animate-pulse' />
                <span className='text-sm'>{employees.length} موظف متصل</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
