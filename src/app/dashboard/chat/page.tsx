'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Search, Phone, Video, MoreVertical, Smile, Paperclip,
  CheckCheck, Check, Circle, Loader2, MessageSquare, Users, AlertCircle,
  Image as ImageIcon, Mic, MicOff, X, Play, Pause, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { 
  uploadChatImage, 
  uploadChatAudio, 
  AudioRecorder, 
  validateFile 
} from '@/lib/chat-file-manager';
import { setupPushNotifications } from '@/lib/push-notifications';

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
  text?: string;
  type: 'text' | 'image' | 'audio' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
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
  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const allChatsUnsubscribeRef = useRef<(() => void) | null>(null);
  const audioRecorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        console.log('📥 Loading employees...');
        const employeesRef = collection(db, 'employees');
        const employeesSnap = await getDocs(employeesRef);
        
        const employeesList: Employee[] = [];
        employeesSnap.forEach((doc) => {
          const data = doc.data();
          const employeeUsername = data.username || doc.id;
          const employeeEmail = data.email;
          
          // استخدام username أو email كـ ID للمحادثة
          const employeeId = employeeUsername || employeeEmail || doc.id;
          
          console.log('👤 Employee loaded:', {
            docId: doc.id,
            username: employeeUsername,
            email: employeeEmail,
            willUseAsId: employeeId
          });
          
          if (employeeId !== user?.username && employeeId !== user?.email) {
            employeesList.push({
              id: employeeId, // ✅ استخدام username/email كـ ID
              username: employeeUsername,
              name: data.name || employeeUsername || doc.id,
              email: employeeEmail,
              avatar: data.avatar,
              role: data.role,
              department: data.department,
              isOnline: true,
            });
          }
        });

        console.log('✅ Loaded employees:', employeesList.length);
        console.log('📋 Employees list:', employeesList);
        setEmployees(employeesList);
      } catch (error) {
        console.error('❌ Error loading employees:', error);
      }
    };

    if (user) {
      loadEmployees();
    }
  }, [user]);

  // تهيئة Push Notifications
  useEffect(() => {
    if (user) {
      const userId = user.username || user.email;
      if (userId) {
        console.log('🔔 Initializing push notifications for:', userId);
        setupPushNotifications(userId).catch(err => {
          console.error('❌ Failed to setup push notifications:', err);
        });
      }
    }
  }, [user]);

  // مراقبة جميع المحادثات للمستخدم (للإشعارات)
  useEffect(() => {
    if (!user) return;

    const setupAllChatsListener = async () => {
      try {
        const currentUserId = user.username || user.email;
        if (!currentUserId) return;

        console.log('👂 Setting up ALL chats listener for:', currentUserId);

        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          where('participants', 'array-contains', currentUserId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
              const chatData = change.doc.data();
              const chatId = change.doc.id;
              
              console.log('🔄 Chat modified:', chatId, chatData.lastMessage);
              
              // إذا كانت المحادثة ليست المفتوحة حالياً، أضفها للـ unread
              if (chatId !== currentChatId && chatData.lastMessage) {
                console.log('💬 New message in background chat:', chatId);
                setUnreadChats(prev => new Set(prev).add(chatId));
              }
            }
          });
        });

        allChatsUnsubscribeRef.current = unsubscribe;
      } catch (error) {
        console.error('❌ Error setting up all chats listener:', error);
      }
    };

    setupAllChatsListener();

    return () => {
      if (allChatsUnsubscribeRef.current) {
        console.log('🧹 Cleaning up all chats listener');
        allChatsUnsubscribeRef.current();
      }
    };
  }, [user, currentChatId]);

  const getOrCreateChat = async (employeeId: string) => {
    try {
      const currentUserId = user?.username || user?.email;
      if (!currentUserId) {
        console.error('❌ No current user ID');
        return null;
      }

      console.log('🔍 Looking for chat between:', currentUserId, 'and', employeeId);
      console.log('📋 Current user:', user);

      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', currentUserId));
      const querySnapshot = await getDocs(q);
      
      console.log('📊 Found', querySnapshot.size, 'chats for current user');
      
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        console.log('🔎 Checking chat:', docSnap.id, 'participants:', data.participants);
        
        if (data.participants.includes(employeeId)) {
          console.log('✅ Found existing chat:', docSnap.id);
          return docSnap.id;
        }
      }

      console.log('🆕 Creating new chat...');
      console.log('👥 Participants will be:', [currentUserId, employeeId]);
      
      const newChatRef = await addDoc(collection(db, 'chats'), {
        participants: [currentUserId, employeeId],
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        lastMessage: '',
      });

      console.log('✅ Chat created:', newChatRef.id);
      return newChatRef.id;
    } catch (error) {
      console.error('❌ Error in getOrCreateChat:', error);
      return null;
    }
  };

  const selectEmployee = async (employee: Employee) => {
    console.log('🎯 Selecting employee:', employee.name, 'ID:', employee.id);
    
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

      let isFirstLoad = true;
      let previousCount = 0;

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('📨 Messages snapshot received:', snapshot.size, 'messages for chat:', chatId);
        
        const messagesList: Message[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          messagesList.push({
            id: doc.id,
            chatId: data.chatId,
            senderId: data.senderId,
            text: data.text,
            type: data.type || 'text',
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
            duration: data.duration,
            timestamp: data.timestamp?.toDate() || new Date(),
            read: data.read || false,
          });
        });
        
        console.log('💬 Setting messages state:', messagesList.length);
        console.log('📋 Messages:', messagesList.map(m => ({ sender: m.senderId, text: m.text })));
        
        setMessages(messagesList);
        
        // تشغيل صوت إذا كانت هناك رسائل جديدة من شخص آخر
        if (!isFirstLoad && messagesList.length > previousCount) {
          const lastMessage = messagesList[messagesList.length - 1];
          const currentUserId = user?.username || user?.email;
          
          console.log('🆕 New message detected!', {
            from: lastMessage.senderId,
            currentUser: currentUserId,
            isFromOther: lastMessage.senderId !== currentUserId
          });
          
          if (lastMessage.senderId !== currentUserId) {
            console.log('🔔 Playing notification sound...');
            try {
              const audio = new Audio('/sounds/notification.mp3');
              audio.volume = 0.5;
              audio.play().catch(err => console.log('🔇 Sound play failed:', err));
            } catch (error) {
              console.log('🔇 Sound error:', error);
            }
          }
        }
        
        isFirstLoad = false;
        previousCount = messagesList.length;
        
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
        type: 'text',
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

  // رفع صورة
  const handleImageUpload = async (file: File) => {
    if (!currentChatId || !selectedEmployee) {
      setErrorMessage('الرجاء اختيار محادثة أولاً');
      return;
    }

    try {
      const validation = validateFile(file, 'image');
      if (!validation.valid) {
        setErrorMessage(validation.error || 'ملف غير صالح');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setErrorMessage('');

      console.log('📤 Uploading image...');
      const imageUrl = await uploadChatImage(
        file,
        currentChatId,
        (progress) => {
          setUploadProgress(progress);
          console.log(`📊 Upload progress: ${progress}%`);
        }
      );

      console.log('✅ Image uploaded, sending message...');
      const currentUserId = user?.username || user?.email;

      await addDoc(collection(db, 'messages'), {
        chatId: currentChatId,
        senderId: currentUserId,
        type: 'image',
        fileUrl: imageUrl,
        fileName: file.name,
        fileSize: file.size,
        timestamp: serverTimestamp(),
        read: false,
      });

      const chatRef = doc(db, 'chats', currentChatId);
      await updateDoc(chatRef, {
        lastMessage: '📷 صورة',
        lastMessageTime: serverTimestamp(),
      });

      console.log('✅ Image message sent successfully');
    } catch (error: any) {
      console.error('❌ Error uploading image:', error);
      setErrorMessage('فشل رفع الصورة: ' + (error?.message || 'خطأ غير معروف'));
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // بدء تسجيل الصوت
  const startRecording = async () => {
    try {
      console.log('🎤 Starting audio recording...');
      await audioRecorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingDuration(0);

      // عداد الوقت
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error starting recording:', error);
      setErrorMessage('فشل بدء التسجيل. تأكد من السماح بالوصول للميكروفون');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // إيقاف وحفظ التسجيل
  const stopRecording = async () => {
    if (!currentChatId || !selectedEmployee) {
      setErrorMessage('الرجاء اختيار محادثة أولاً');
      return;
    }

    try {
      console.log('🎤 Stopping recording...');
      
      // إيقاف العداد
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      const { blob, duration } = await audioRecorderRef.current.stopRecording();
      setIsRecording(false);
      setIsUploading(true);
      setUploadProgress(0);

      console.log('📤 Uploading audio...', { duration, size: blob.size });
      
      const audioUrl = await uploadChatAudio(
        blob,
        currentChatId,
        duration,
        (progress) => {
          setUploadProgress(progress);
          console.log(`📊 Audio upload progress: ${progress}%`);
        }
      );

      console.log('✅ Audio uploaded, sending message...');
      const currentUserId = user?.username || user?.email;

      await addDoc(collection(db, 'messages'), {
        chatId: currentChatId,
        senderId: currentUserId,
        type: 'audio',
        fileUrl: audioUrl,
        duration,
        timestamp: serverTimestamp(),
        read: false,
      });

      const chatRef = doc(db, 'chats', currentChatId);
      await updateDoc(chatRef, {
        lastMessage: '🎤 رسالة صوتية',
        lastMessageTime: serverTimestamp(),
      });

      console.log('✅ Audio message sent successfully');
      setRecordingDuration(0);
    } catch (error: any) {
      console.error('❌ Error saving recording:', error);
      setErrorMessage('فشل حفظ التسجيل: ' + (error?.message || 'خطأ غير معروف'));
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setIsRecording(false);
    }
  };

  // إلغاء التسجيل
  const cancelRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    audioRecorderRef.current.cancelRecording();
    setIsRecording(false);
    setRecordingDuration(0);
    console.log('🎤 Recording cancelled');
  };

  // تنسيق مدة التسجيل
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                          
                          {/* رسالة نصية */}
                          {message.type === 'text' && message.text && (
                            <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>{message.text}</p>
                          )}
                          
                          {/* صورة */}
                          {message.type === 'image' && message.fileUrl && (
                            <div className='space-y-2'>
                              <img
                                src={message.fileUrl}
                                alt={message.fileName || 'صورة'}
                                className='max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity'
                                onClick={() => window.open(message.fileUrl, '_blank')}
                                loading='lazy'
                              />
                              {message.fileName && (
                                <p className='text-xs opacity-70'>{message.fileName}</p>
                              )}
                            </div>
                          )}
                          
                          {/* رسالة صوتية */}
                          {message.type === 'audio' && message.fileUrl && (
                            <div className='space-y-2'>
                              <audio controls className='w-64' preload='metadata'>
                                <source src={message.fileUrl} type='audio/webm' />
                                <source src={message.fileUrl} type='audio/mpeg' />
                                متصفحك لا يدعم تشغيل الصوت
                              </audio>
                              {message.duration && (
                                <p className='text-xs opacity-70'>🎤 {formatDuration(Math.floor(message.duration))}</p>
                              )}
                            </div>
                          )}
                          
                          {/* ملف */}
                          {message.type === 'file' && message.fileUrl && (
                            <a
                              href={message.fileUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='flex items-center gap-2 hover:opacity-80 transition-opacity'
                            >
                              <Paperclip className='w-4 h-4' />
                              <div>
                                <p className='text-sm font-medium'>{message.fileName || 'ملف'}</p>
                                {message.fileSize && (
                                  <p className='text-xs opacity-70'>{(message.fileSize / 1024).toFixed(0)} KB</p>
                                )}
                              </div>
                              <Download className='w-4 h-4 ml-auto' />
                            </a>
                          )}
                          
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
                
                {/* شريط التقدم عند الرفع */}
                {isUploading && (
                  <div className='mb-3 p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm text-purple-200'>جاري الرفع...</span>
                      <span className='text-sm text-purple-200 font-bold'>{uploadProgress.toFixed(0)}%</span>
                    </div>
                    <div className='bg-slate-700 rounded-full h-2 overflow-hidden'>
                      <div
                        className='bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* واجهة التسجيل */}
                {isRecording && (
                  <div className='mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center justify-between animate-pulse'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse' />
                      <span className='text-sm text-red-200 font-medium'>جاري التسجيل...</span>
                      <span className='text-sm text-red-200'>{formatDuration(recordingDuration)}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        size='sm'
                        onClick={stopRecording}
                        className='bg-green-600 hover:bg-green-700 text-white rounded-full'
                        disabled={isUploading}
                      >
                        <Check className='w-4 h-4 ml-1' />
                        حفظ
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={cancelRecording}
                        className='border-red-500 text-red-200 hover:bg-red-500/20 rounded-full'
                      >
                        <X className='w-4 h-4 ml-1' />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className='flex items-center gap-2'>
                  {/* زر Emoji (معطل مؤقتاً) */}
                  <Button 
                    variant='ghost' 
                    size='sm' 
                    className='text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-full w-9 h-9 p-0'
                    disabled={isUploading || isRecording}
                    title='Emoji (قريباً)'
                  >
                    <Smile className='w-5 h-5' />
                  </Button>
                  
                  {/* زر رفع الصور */}
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(e.target.files[0]);
                        e.target.value = ''; // إعادة تعيين
                      }
                    }}
                    className='hidden'
                    id='image-upload-input'
                  />
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => fileInputRef.current?.click()}
                    className='text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-full w-9 h-9 p-0'
                    disabled={isUploading || isRecording}
                    title='رفع صورة'
                  >
                    <ImageIcon className='w-5 h-5' />
                  </Button>
                  
                  {/* زر تسجيل الصوت */}
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                      'text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-full w-9 h-9 p-0 transition-all',
                      isRecording && 'bg-red-500 text-white animate-pulse'
                    )}
                    disabled={isUploading}
                    title={isRecording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
                  >
                    {isRecording ? <MicOff className='w-5 h-5' /> : <Mic className='w-5 h-5' />}
                  </Button>
                  
                  {/* حقل النص */}
                  <Input
                    placeholder={isRecording ? 'جاري التسجيل...' : 'اكتب رسالتك...'}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => { 
                      if (e.key === 'Enter' && !e.shiftKey && !isRecording && !isUploading) { 
                        e.preventDefault(); 
                        sendMessage(); 
                      } 
                    }}
                    className='flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 rounded-full px-4'
                    disabled={isRecording || isUploading}
                  />
                  
                  {/* زر الإرسال */}
                  <Button 
                    onClick={sendMessage} 
                    disabled={!messageText.trim() || isSending || isRecording || isUploading} 
                    className='bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full w-11 h-11 p-0 shadow-lg disabled:opacity-50 transition-all'
                    title='إرسال'
                  >
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
