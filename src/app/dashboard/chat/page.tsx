'use client';'use client';



import React, { useState, useEffect, useRef } from 'react';import React, { useState, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';import {

import {  Send,

  ArrowLeft,  Search,

  Search,  Plus,

  Send,  Settings,

  Phone,  Phone,

  Video,  Video,

  MoreVertical,  MoreVertical,

  Paperclip,  Smile,

  Image as ImageIcon,  Paperclip,

  Smile,  ArrowLeft,

  Check,  Users,

  CheckCheck,  Clock,

  Clock,  CheckCheck,

  Users,  Check,

  UserCircle2,  Bell,

  MessageSquare,  Trash2,

  Info,  Image as ImageIcon,

  X,  File,

  Camera,  X,

  Mic,  Info,

  File,} from 'lucide-react';

} from 'lucide-react';import { Button } from '@/components/ui/button';

import { Button } from '@/components/ui/button';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { Input } from '@/components/ui/input';

import { Input } from '@/components/ui/input';import { Badge } from '@/components/ui/badge';

import { Badge } from '@/components/ui/badge';import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';import { useAuth } from '@/contexts/auth-context';

import { subscribeToEmployees } from '@/lib/firebase-employees';import { subscribeToEmployees } from '@/lib/firebase-employees';

import ProtectedRoute from '@/components/ProtectedRoute';import ProtectedRoute from '@/components/ProtectedRoute';



interface Employee {interface Employee {

  id: string;  id: string;

  name: string;  name: string;

  username: string;  username: string;

  position: string;  position: string;

  department: string;  department: string;

  phone: string;  phone: string;

  email: string;  email: string;

  profileImage?: string;  profileImage?: string;

  status: 'active' | 'inactive' | 'on-leave';  status: 'active' | 'inactive' | 'on-leave';

  permissions: string[];  permissions: string[];

  createdAt: string;  createdAt: string;

  salary?: number;}

}

interface Message {

interface Message {  id: string;

  id: string;  senderId: string;

  senderId: string;  receiverId: string;

  receiverId: string;  content: string;

  content: string;  type: 'text' | 'image' | 'file' | 'voice';

  type: 'text' | 'image' | 'file' | 'voice';  timestamp: string;

  timestamp: string;  read: boolean;

  read: boolean;  fileUrl?: string;

  fileUrl?: string;  fileName?: string;

  fileName?: string;}

}

interface Chat {

interface Chat {  employeeId: string;

  employeeId: string;  lastMessage?: Message;

  lastMessage?: Message;  unreadCount: number;

  unreadCount: number;}

}

export default function ChatPage() {

function ChatPageContent() {  const { user } = useAuth();

  const router = useRouter();  const [employees, setEmployees] = useState<Employee[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([]);  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);  const [messages, setMessages] = useState<Message[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);  const [messageInput, setMessageInput] = useState('');

  const [messageInput, setMessageInput] = useState('');  const [searchTerm, setSearchTerm] = useState('');

  const [searchTerm, setSearchTerm] = useState('');  const [chats, setChats] = useState<Chat[]>([]);

  const [chats, setChats] = useState<Chat[]>([]);  const [showInfo, setShowInfo] = useState(false);

  const [showInfo, setShowInfo] = useState(false);  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);  const imageInputRef = useRef<HTMLInputElement>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load employees from Firebase

  // Load employees from Firebase  useEffect(() => {

  useEffect(() => {    const unsubscribe = subscribeToEmployees((employeesData) => {

    const unsubscribe = subscribeToEmployees((employeesData) => {      setEmployees(employeesData.filter(emp => emp.status === 'active'));

      const activeEmployees = employeesData.filter(emp => emp.status === 'active');      

      setEmployees(activeEmployees);      // Initialize chats for all employees

            const initialChats = employeesData

      // Initialize chats for all employees        .filter(emp => emp.status === 'active')

      const initialChats = activeEmployees.map(emp => ({        .map(emp => ({

        employeeId: emp.id,          employeeId: emp.id,

        unreadCount: 0          unreadCount: 0

      }));        }));

      setChats(initialChats);      setChats(initialChats);

    });    });



    return () => unsubscribe();    return () => unsubscribe();

  }, []);  }, []);



  // Load messages for selected employee  // Load messages for selected employee

  useEffect(() => {  useEffect(() => {

    if (selectedEmployee) {    if (selectedEmployee) {

      loadMessages(selectedEmployee.id);      loadMessages(selectedEmployee.id);

    }    }

  }, [selectedEmployee]);  }, [selectedEmployee]);



  // Auto scroll to bottom  // Auto scroll to bottom

  useEffect(() => {  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  }, [messages]);  }, [messages]);



  const loadMessages = (employeeId: string) => {  const loadConversations = () => {

    const chatKey = `chat_${employeeId}`;    try {

    const saved = localStorage.getItem(chatKey);      const saved = localStorage.getItem('chat_conversations');

    const data = saved ? JSON.parse(saved) : [];      if (saved) {

    setMessages(data);        const data = JSON.parse(saved);

            setConversations(data);

    // Mark messages as read        if (data.length > 0) {

    const updatedMessages = data.map((msg: Message) => ({          selectConversation(data[0]);

      ...msg,        }

      read: true      } else {

    }));        // بدء بدون محادثات - المستخدم يضيف محادثات جديدة

    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));        setConversations([]);

          }

    // Update unread count    } catch (error) {

    setChats(prev => prev.map(chat =>       console.error('Error loading conversations:', error);

      chat.employeeId === employeeId     }

        ? { ...chat, unreadCount: 0 }  };

        : chat

    ));  const loadEmployees = () => {

  };    try {

      const saved = localStorage.getItem('hr_employees');

  const sendMessage = (type: 'text' | 'image' | 'file' = 'text', fileUrl?: string, fileName?: string) => {      if (saved) {

    if (!selectedEmployee) return;        const employeesData = JSON.parse(saved);

    if (type === 'text' && !messageInput.trim()) return;        setEmployees(employeesData);

      } else {

    const newMessage: Message = {        // بدء بدون موظفين - المستخدم يضيف موظفين من صفحة الموارد البشرية

      id: `msg-${Date.now()}`,        setEmployees([]);

      senderId: 'admin', // Current user ID      }

      receiverId: selectedEmployee.id,    } catch (error) {

      content: type === 'text' ? messageInput : fileName || 'ملف مرفق',      console.error('Error loading employees:', error);

      type,    }

      timestamp: new Date().toISOString(),  };

      read: false,

      fileUrl,  const loadNotifications = () => {

      fileName    try {

    };      const saved = localStorage.getItem(`chat_notifications_${user?.username}`);

      if (saved) {

    const chatKey = `chat_${selectedEmployee.id}`;        const data = JSON.parse(saved);

    const existingMessages = [...messages, newMessage];        setNotifications(data);

    setMessages(existingMessages);      }

    localStorage.setItem(chatKey, JSON.stringify(existingMessages));    } catch (error) {

      console.error('Error loading notifications:', error);

    // Update chat list    }

    setChats(prev => prev.map(chat =>   };

      chat.employeeId === selectedEmployee.id 

        ? { ...chat, lastMessage: newMessage }  const addNotification = (conversationId: string, fromUserId: string, fromUserName: string, message: string) => {

        : chat    const newNotification: Notification = {

    ));      id: `notif-${Date.now()}`,

      conversationId,

    setMessageInput('');      fromUserId,

  };      fromUserName,

      message,

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {      timestamp: new Date().toISOString(),

    const file = event.target.files?.[0];      read: false,

    if (!file) return;    };

    const updated = [newNotification, ...notifications];

    // In production, upload to Firebase Storage    setNotifications(updated);

    const reader = new FileReader();    localStorage.setItem(`chat_notifications_${user?.username}`, JSON.stringify(updated));

    reader.onload = (e) => {    // تشغيل صوت إشعار إن أمكن

      const fileUrl = e.target?.result as string;    playNotificationSound();

      sendMessage(type, fileUrl, file.name);  };

    };

    reader.readAsDataURL(file);  const playNotificationSound = () => {

  };    try {

      const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');

  const initiateCall = (type: 'voice' | 'video') => {      audio.play().catch(() => {});

    if (!selectedEmployee) return;    } catch (e) {

    alert(`${type === 'voice' ? 'مكالمة صوتية' : 'مكالمة فيديو'} مع ${selectedEmployee.name}\nهذه الميزة قيد التطوير...`);      // صامت إذا فشل

  };    }

  };

  const getEmployeeInitials = (name: string) => {

    const words = name.split(' ');  const markNotificationAsRead = (notificationId: string) => {

    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();    const updated = notifications.map((n) =>

  };      n.id === notificationId ? { ...n, read: true } : n

    );

  const formatTime = (timestamp: string) => {    setNotifications(updated);

    const date = new Date(timestamp);    localStorage.setItem(`chat_notifications_${user?.username}`, JSON.stringify(updated));

    const now = new Date();  };

    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);  const deleteNotification = (notificationId: string) => {

    const hours = Math.floor(diff / 3600000);    const updated = notifications.filter((n) => n.id !== notificationId);

    const days = Math.floor(diff / 86400000);    setNotifications(updated);

    localStorage.setItem(`chat_notifications_${user?.username}`, JSON.stringify(updated));

    if (minutes < 1) return 'الآن';  };

    if (minutes < 60) return `${minutes} د`;

    if (hours < 24) return `${hours} س`;  const selectConversation = (conversation: Conversation) => {

    if (days < 7) return `${days} يوم`;    setSelectedConversation(conversation);

    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });    loadMessages(conversation.id);

  };    // Mark as read

    const updated = conversations.map((c) =>

  const filteredEmployees = employees.filter(emp =>      c.id === conversation.id ? { ...c, unreadCount: 0 } : c

    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||    );

    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||    setConversations(updated);

    emp.department.toLowerCase().includes(searchTerm.toLowerCase())    localStorage.setItem('chat_conversations', JSON.stringify(updated));

  );

    // وضع علامة على رسائل المحادثة كمقروءة

  return (    markMessagesAsRead(conversation.id);

    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">  };

      {/* Header */}

      <div className="bg-slate-800/50 backdrop-blur-lg border-b border-white/10 p-4">  const markMessagesAsRead = (conversationId: string) => {

        <div className="flex items-center justify-between">    try {

          <div className="flex items-center gap-4">      const saved = localStorage.getItem(`chat_messages_${conversationId}`);

            <Button      if (saved) {

              variant="ghost"        const msgs: Message[] = JSON.parse(saved);

              size="icon"        const updated = msgs.map((m) =>

              onClick={() => router.back()}          m.sender.id !== user?.username ? { ...m, read: true } : m

              className="text-white hover:bg-white/10"        );

            >        localStorage.setItem(`chat_messages_${conversationId}`, JSON.stringify(updated));

              <ArrowLeft className="h-5 w-5" />        setMessages(updated);

            </Button>      }

            <div>    } catch (error) {

              <h1 className="text-2xl font-bold text-white">المحادثات الداخلية</h1>      console.error('Error marking messages as read:', error);

              <p className="text-gray-400 text-sm">تواصل مع فريق العمل</p>    }

            </div>  };

          </div>

          <Badge variant="secondary" className="bg-green-500/20 text-green-400">  const loadMessages = (conversationId: string) => {

            <Users className="h-4 w-4 mr-1" />    try {

            {employees.length} موظف متاح      const saved = localStorage.getItem(`chat_messages_${conversationId}`);

          </Badge>      if (saved) {

        </div>        setMessages(JSON.parse(saved));

      </div>      } else {

        setMessages([]);

      <div className="flex-1 flex overflow-hidden">      }

        {/* Employees List */}    } catch (error) {

        <div className="w-80 bg-slate-800/30 backdrop-blur-lg border-r border-white/10 flex flex-col">      console.error('Error loading messages:', error);

          {/* Search */}    }

          <div className="p-4 border-b border-white/10">  };

            <div className="relative">

              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />  const sendMessage = () => {

              <Input    if (!messageInput.trim() || !selectedConversation || !user) return;

                value={searchTerm}

                onChange={(e) => setSearchTerm(e.target.value)}    const newMessage: Message = {

                placeholder="ابحث عن موظف..."      id: `msg-${Date.now()}`,

                className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"      sender: {

              />        id: user.username,

            </div>        name: user.name,

          </div>      },

      content: messageInput,

          {/* Employees List */}      timestamp: new Date().toISOString(),

          <div className="flex-1 overflow-y-auto">      read: false,

            {filteredEmployees.length === 0 ? (      type: 'text',

              <div className="p-8 text-center">    };

                <Users className="h-16 w-16 mx-auto text-gray-600 mb-4" />

                <p className="text-gray-400">لا يوجد موظفين</p>    const updatedMessages = [...messages, newMessage];

                <p className="text-gray-500 text-sm mt-2">قم بإضافة موظفين من الإعدادات</p>    setMessages(updatedMessages);

              </div>    localStorage.setItem(`chat_messages_${selectedConversation.id}`, JSON.stringify(updatedMessages));

            ) : (

              <div className="space-y-1 p-2">    // Update conversation last message

                {filteredEmployees.map((employee) => {    const updatedConversations = conversations.map((c) =>

                  const chat = chats.find(c => c.employeeId === employee.id);      c.id === selectedConversation.id

                  const isSelected = selectedEmployee?.id === employee.id;        ? {

                              ...c,

                  return (            lastMessage: messageInput,

                    <div            lastMessageTime: new Date().toISOString(),

                      key={employee.id}          }

                      onClick={() => setSelectedEmployee(employee)}        : c

                      className={`p-3 rounded-lg cursor-pointer transition-all ${    );

                        isSelected    setConversations(updatedConversations);

                          ? 'bg-purple-600/30 border border-purple-500/50'    localStorage.setItem('chat_conversations', JSON.stringify(updatedConversations));

                          : 'hover:bg-white/5 border border-transparent'

                      }`}    // إرسال إشعار للموظف الآخر

                    >    const otherParticipant = selectedConversation.participants.find((p) => p.id !== user?.username);

                      <div className="flex items-center gap-3">    if (otherParticipant) {

                        <div className="relative">      const notificationsKey = `chat_notifications_${otherParticipant.id}`;

                          <Avatar className="h-12 w-12">      try {

                            <AvatarImage src={employee.profileImage} />        const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');

                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">        const newNotification: Notification = {

                              {getEmployeeInitials(employee.name)}          id: `notif-${Date.now()}`,

                            </AvatarFallback>          conversationId: selectedConversation.id,

                          </Avatar>          fromUserId: user.username,

                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>          fromUserName: user.name,

                        </div>          message: messageInput,

                                  timestamp: new Date().toISOString(),

                        <div className="flex-1 min-w-0">          read: false,

                          <div className="flex items-center justify-between mb-1">        };

                            <h3 className="font-semibold text-white truncate">{employee.name}</h3>        const updatedNotifications = [newNotification, ...existingNotifications];

                            {chat?.lastMessage && (        localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));

                              <span className="text-xs text-gray-400">      } catch (error) {

                                {formatTime(chat.lastMessage.timestamp)}        console.error('Error sending notification:', error);

                              </span>      }

                            )}    }

                          </div>

                          <div className="flex items-center justify-between">    setMessageInput('');

                            <p className="text-sm text-gray-400 truncate">{employee.position}</p>  };

                            {chat && chat.unreadCount > 0 && (

                              <Badge className="bg-purple-600 text-white text-xs h-5 min-w-[20px] flex items-center justify-center">  const startNewChat = (employee: any) => {

                                {chat.unreadCount}    const conversationId = `conv-${Date.now()}`;

                              </Badge>    const newConversation: Conversation = {

                            )}      id: conversationId,

                          </div>      participants: [

                        </div>        { id: user?.username || '', name: user?.name || '' },

                      </div>        { id: employee.id, name: employee.name, avatar: employee.avatar },

                    </div>      ],

                  );      lastMessage: '',

                })}      lastMessageTime: new Date().toISOString(),

              </div>      unreadCount: 0,

            )}    };

          </div>

        </div>    const updated = [newConversation, ...conversations];

    setConversations(updated);

        {/* Chat Area */}    localStorage.setItem('chat_conversations', JSON.stringify(updated));

        <div className="flex-1 flex flex-col">    selectConversation(newConversation);

          {!selectedEmployee ? (    setShowNewChat(false);

            <div className="flex-1 flex items-center justify-center">  };

              <div className="text-center">

                <MessageSquare className="h-24 w-24 mx-auto text-gray-600 mb-4" />  const filteredConversations = conversations.filter((c) => {

                <h3 className="text-2xl font-bold text-white mb-2">اختر موظف للمحادثة</h3>    const otherParticipant = c.participants.find((p) => p.id !== user?.username);

                <p className="text-gray-400">اختر موظف من القائمة لبدء المحادثة</p>    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());

              </div>  });

            </div>

          ) : (  const formatTime = (dateString: string) => {

            <>    const date = new Date(dateString);

              {/* Chat Header */}    const now = new Date();

              <div className="bg-slate-800/50 backdrop-blur-lg border-b border-white/10 p-4">    const isToday = date.toDateString() === now.toDateString();

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">    if (isToday) {

                    <Avatar className="h-12 w-12">      return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

                      <AvatarImage src={selectedEmployee.profileImage} />    }

                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });

                        {getEmployeeInitials(selectedEmployee.name)}  };

                      </AvatarFallback>

                    </Avatar>  const otherParticipant = selectedConversation

                    <div>    ? selectedConversation.participants.find((p) => p.id !== user?.username)

                      <h3 className="font-bold text-white">{selectedEmployee.name}</h3>    : null;

                      <p className="text-sm text-gray-400">{selectedEmployee.position}</p>

                    </div>  return (

                  </div>    <ProtectedRoute>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6" dir="rtl">

                  <div className="flex items-center gap-2">        <div className="max-w-7xl mx-auto">

                    <Button          {/* Header */}

                      variant="ghost"          <div className="mb-8 flex items-center justify-between relative z-20">

                      size="icon"            <div>

                      onClick={() => initiateCall('voice')}              <h1 className="text-4xl font-bold text-white">محادثات داخلية</h1>

                      className="text-white hover:bg-white/10"              <p className="text-purple-200 mt-1">التواصل المباشر مع فريق العمل</p>

                    >            </div>

                      <Phone className="h-5 w-5" />            {/* زر الإشعارات */}

                    </Button>            <div className="relative z-[200]">

                    <Button              <Button

                      variant="ghost"                onClick={() => setShowNotifications(!showNotifications)}

                      size="icon"                variant="outline"

                      onClick={() => initiateCall('video')}                className="relative border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"

                      className="text-white hover:bg-white/10"              >

                    >                <Bell className="w-5 h-5" />

                      <Video className="h-5 w-5" />                {notifications.filter((n) => !n.read).length > 0 && (

                    </Button>                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">

                    <Button                    {notifications.filter((n) => !n.read).length}

                      variant="ghost"                  </span>

                      size="icon"                )}

                      onClick={() => setShowInfo(!showInfo)}              </Button>

                      className="text-white hover:bg-white/10"

                    >              {/* قائمة الإشعارات */}

                      <Info className="h-5 w-5" />              {showNotifications && (

                    </Button>                <div className="absolute top-full mt-2 -right-20 w-96 bg-slate-800 border-2 border-blue-500/50 rounded-lg shadow-2xl z-[300] max-h-96 overflow-y-auto backdrop-blur-sm">

                  </div>                  <div className="sticky top-0 bg-slate-800/95 border-b border-slate-700 p-3 flex items-center justify-between">

                </div>                    <p className="text-sm font-semibold text-white">الإشعارات</p>

              </div>                    <Button

                      size="sm"

              {/* Messages */}                      variant="ghost"

              <div className="flex-1 overflow-y-auto p-4 space-y-4">                      onClick={() => setShowNotifications(false)}

                {messages.length === 0 ? (                      className="h-6 w-6 p-0"

                  <div className="text-center py-12">                    >

                    <MessageSquare className="h-16 w-16 mx-auto text-gray-600 mb-4" />                      ×

                    <p className="text-gray-400">لا توجد رسائل بعد</p>                    </Button>

                    <p className="text-gray-500 text-sm mt-2">ابدأ المحادثة الآن!</p>                  </div>

                  </div>                  {notifications.length === 0 ? (

                ) : (                    <div className="p-4 text-center text-slate-400 text-sm">لا توجد إشعارات</div>

                  messages.map((message) => {                  ) : (

                    const isSent = message.senderId === 'admin';                    <div className="divide-y divide-slate-700">

                                          {notifications.map((notif) => (

                    return (                        <div

                      <div                          key={notif.id}

                        key={message.id}                          className={`p-3 cursor-pointer transition-colors flex items-start justify-between gap-2 ${

                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}                            notif.read ? 'hover:bg-slate-700/30 bg-slate-800' : 'bg-blue-500/15 hover:bg-blue-500/25'

                      >                          }`}

                        <div                        >

                          className={`max-w-[70%] rounded-2xl p-3 ${                          <div

                            isSent                            onClick={() => {

                              ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'                              const conv = conversations.find((c) => c.id === notif.conversationId);

                              : 'bg-white/10 backdrop-blur-lg text-white border border-white/10'                              if (conv) {

                          }`}                                selectConversation(conv);

                        >                                markNotificationAsRead(notif.id);

                          {message.type === 'text' && (                                setShowNotifications(false);

                            <p className="text-sm">{message.content}</p>                              }

                          )}                            }}

                                                      className="flex-1 min-w-0"

                          {message.type === 'image' && (                          >

                            <div className="space-y-2">                            <p className="text-sm font-semibold text-white">{notif.fromUserName}</p>

                              <img                            <p className="text-xs text-slate-300 truncate">{notif.message}</p>

                                src={message.fileUrl}                            <p className="text-xs text-slate-500 mt-1">

                                alt="صورة"                              {new Date(notif.timestamp).toLocaleTimeString('ar-EG', {

                                className="rounded-lg max-w-full h-auto"                                hour: '2-digit',

                              />                                minute: '2-digit',

                              {message.content !== 'ملف مرفق' && (                              })}

                                <p className="text-sm">{message.content}</p>                            </p>

                              )}                          </div>

                            </div>                          <Button

                          )}                            size="sm"

                                                      variant="ghost"

                          {message.type === 'file' && (                            onClick={(e) => {

                            <div className="flex items-center gap-2">                              e.stopPropagation();

                              <File className="h-5 w-5" />                              deleteNotification(notif.id);

                              <div className="flex-1">                            }}

                                <p className="text-sm font-medium">{message.fileName}</p>                            className="text-red-400 hover:bg-red-500/20 h-6 w-6 p-0 flex-shrink-0"

                              </div>                          >

                            </div>                            <Trash2 className="w-3 h-3" />

                          )}                          </Button>

                                                  </div>

                          <div className="flex items-center justify-between gap-2 mt-1">                      ))}

                            <span className="text-xs opacity-70">                    </div>

                              {new Date(message.timestamp).toLocaleTimeString('ar-SA', {                  )}

                                hour: '2-digit',                </div>

                                minute: '2-digit'              )}

                              })}            </div>

                            </span>          </div>

                            {isSent && (

                              <div className="flex items-center">          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] relative z-10">

                                {message.read ? (            {/* Conversations List */}

                                  <CheckCheck className="h-3 w-3 text-blue-300" />            <Card className="bg-slate-800/50 border-slate-700 flex flex-col">

                                ) : (              <CardHeader className="border-b border-slate-700">

                                  <Check className="h-3 w-3 opacity-70" />                <div className="space-y-4">

                                )}                  <CardTitle className="text-white">المحادثات</CardTitle>

                              </div>                  <div className="relative">

                            )}                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

                          </div>                    <Input

                        </div>                      placeholder="ابحث عن محادثة..."

                      </div>                      value={searchTerm}

                    );                      onChange={(e) => setSearchTerm(e.target.value)}

                  })                      className="pr-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"

                )}                    />

                <div ref={messagesEndRef} />                  </div>

              </div>                  <Button

                    onClick={() => setShowNewChat(true)}

              {/* Message Input */}                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"

              <div className="bg-slate-800/50 backdrop-blur-lg border-t border-white/10 p-4">                  >

                <div className="flex items-center gap-2">                    <Plus className="w-4 h-4 ml-2" />

                  <input                    محادثة جديدة

                    ref={imageInputRef}                  </Button>

                    type="file"                </div>

                    accept="image/*"              </CardHeader>

                    className="hidden"

                    onChange={(e) => handleFileUpload(e, 'image')}              <CardContent className="flex-1 overflow-y-auto p-0">

                  />                {showNewChat && (

                  <input                  <div className="p-4 border-b border-slate-700 space-y-2">

                    ref={fileInputRef}                    <Button

                    type="file"                      variant="ghost"

                    className="hidden"                      onClick={() => setShowNewChat(false)}

                    onChange={(e) => handleFileUpload(e, 'file')}                      className="w-full justify-start text-gray-300 hover:bg-slate-700"

                  />                    >

                                        <ArrowLeft className="w-4 h-4 ml-2" />

                  <Button                      رجوع

                    variant="ghost"                    </Button>

                    size="icon"                    <div className="text-sm text-gray-400 font-semibold px-2 py-1">اختر موظف:</div>

                    onClick={() => imageInputRef.current?.click()}                    {employees

                    className="text-gray-400 hover:text-white hover:bg-white/10"                      .filter((e) => e.id !== user?.username)

                  >                      .map((emp) => (

                    <ImageIcon className="h-5 w-5" />                        <button

                  </Button>                          key={emp.id}

                                            onClick={() => startNewChat(emp)}

                  <Button                          className="w-full text-right p-3 rounded-lg hover:bg-slate-700 transition-colors"

                    variant="ghost"                        >

                    size="icon"                          <p className="text-white font-semibold text-sm">{emp.name}</p>

                    onClick={() => fileInputRef.current?.click()}                          <p className="text-gray-400 text-xs">{emp.position || emp.department || ''}</p>

                    className="text-gray-400 hover:text-white hover:bg-white/10"                        </button>

                  >                      ))}

                    <Paperclip className="h-5 w-5" />                  </div>

                  </Button>                )}

                  

                  <Input                <div className="divide-y divide-slate-700">

                    value={messageInput}                  {filteredConversations.map((conv) => {

                    onChange={(e) => setMessageInput(e.target.value)}                    const other = conv.participants.find((p) => p.id !== user?.username);

                    onKeyPress={(e) => e.key === 'Enter' && sendMessage('text')}                    const isSelected = selectedConversation?.id === conv.id;

                    placeholder="اكتب رسالتك..."

                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"                    return (

                  />                      <button

                                          key={conv.id}

                  <Button                        onClick={() => selectConversation(conv)}

                    onClick={() => sendMessage('text')}                        className={`w-full text-right p-4 transition-colors ${

                    disabled={!messageInput.trim()}                          isSelected

                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"                            ? 'bg-blue-500/20 border-l-4 border-blue-500'

                  >                            : 'hover:bg-slate-700/50 border-l-4 border-transparent'

                    <Send className="h-5 w-5" />                        }`}

                  </Button>                      >

                </div>                        <div className="flex items-start justify-between gap-3">

              </div>                          <div className="flex-1">

            </>                            <p className="text-white font-semibold text-sm">{other?.name}</p>

          )}                            <p className="text-gray-400 text-xs truncate">{conv.lastMessage || 'لا توجد رسائل بعد'}</p>

        </div>                          </div>

                          <div className="text-right">

        {/* Employee Info Sidebar */}                            <p className="text-gray-400 text-xs">{formatTime(conv.lastMessageTime)}</p>

        {showInfo && selectedEmployee && (                            {conv.unreadCount > 0 && (

          <div className="w-80 bg-slate-800/30 backdrop-blur-lg border-l border-white/10 p-6 overflow-y-auto">                              <span className="inline-block bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">

            <div className="flex items-center justify-between mb-6">                                {conv.unreadCount}

              <h3 className="text-xl font-bold text-white">معلومات الموظف</h3>                              </span>

              <Button                            )}

                variant="ghost"                          </div>

                size="icon"                        </div>

                onClick={() => setShowInfo(false)}                      </button>

                className="text-white hover:bg-white/10"                    );

              >                  })}

                <X className="h-5 w-5" />                </div>

              </Button>

            </div>                {filteredConversations.length === 0 && !showNewChat && (

                  <div className="p-8 text-center">

            <div className="space-y-6">                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />

              <div className="text-center">                    <p className="text-gray-400 text-sm">لا توجد محادثات</p>

                <Avatar className="h-24 w-24 mx-auto mb-4">                  </div>

                  <AvatarImage src={selectedEmployee.profileImage} />                )}

                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">              </CardContent>

                    {getEmployeeInitials(selectedEmployee.name)}            </Card>

                  </AvatarFallback>

                </Avatar>            {/* Chat Area */}

                <h4 className="text-xl font-bold text-white mb-1">{selectedEmployee.name}</h4>            {selectedConversation && otherParticipant ? (

                <p className="text-gray-400">{selectedEmployee.position}</p>              <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 flex flex-col">

                <Badge className="mt-2 bg-green-500/20 text-green-400">                {/* Chat Header */}

                  متصل الآن                <CardHeader className="border-b border-slate-700 pb-4">

                </Badge>                  <div className="flex items-center justify-between">

              </div>                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">

              <div className="space-y-4">                        {otherParticipant.name.charAt(0)}

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">                      </div>

                  <p className="text-sm text-gray-400 mb-1">القسم</p>                      <div>

                  <p className="text-white font-medium">{selectedEmployee.department}</p>                        <h3 className="text-white font-semibold">{otherParticipant.name}</h3>

                </div>                        <p className="text-gray-400 text-xs">نشط الآن</p>

                      </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">                    </div>

                  <p className="text-sm text-gray-400 mb-1">رقم الهاتف</p>                    <div className="flex gap-2">

                  <p className="text-white font-medium direction-ltr text-right">{selectedEmployee.phone}</p>                      <Button size="sm" variant="ghost" className="text-gray-300 hover:bg-slate-700">

                </div>                        <Phone className="w-4 h-4" />

                      </Button>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">                      <Button size="sm" variant="ghost" className="text-gray-300 hover:bg-slate-700">

                  <p className="text-sm text-gray-400 mb-1">البريد الإلكتروني</p>                        <Video className="w-4 h-4" />

                  <p className="text-white font-medium text-sm break-all">{selectedEmployee.email}</p>                      </Button>

                </div>                      <Button size="sm" variant="ghost" className="text-gray-300 hover:bg-slate-700">

                        <MoreVertical className="w-4 h-4" />

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">                      </Button>

                  <p className="text-sm text-gray-400 mb-1">اسم المستخدم</p>                    </div>

                  <p className="text-white font-medium">@{selectedEmployee.username}</p>                  </div>

                </div>                </CardHeader>

              </div>

                {/* Messages */}

              <div className="space-y-2">                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-800/30 to-slate-900/50">

                <Button                  {messages.length === 0 ? (

                  onClick={() => initiateCall('voice')}                    <div className="h-full flex flex-col items-center justify-center text-center">

                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"                      <Smile className="w-12 h-12 text-gray-500 opacity-30 mb-3" />

                >                      <p className="text-gray-500 text-sm">ابدأ المحادثة</p>

                  <Phone className="h-5 w-5 mr-2" />                      <p className="text-gray-600 text-xs mt-1">

                  مكالمة صوتية                        أرسل رسالة أولى إلى {otherParticipant.name}

                </Button>                      </p>

                                    </div>

                <Button                  ) : (

                  onClick={() => initiateCall('video')}                    <>

                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"                      {messages.map((msg) => {

                >                        const isOwn = msg.sender.id === user?.username;

                  <Video className="h-5 w-5 mr-2" />                        return (

                  مكالمة فيديو                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>

                </Button>                            <div

              </div>                              className={`max-w-xs px-4 py-2 rounded-lg ${

            </div>                                isOwn

          </div>                                  ? 'bg-blue-500/80 text-white rounded-bl-lg'

        )}                                  : 'bg-slate-700/50 text-gray-200 rounded-br-lg'

      </div>                              }`}

    </div>                            >

  );                              <p className="text-sm break-words">{msg.content}</p>

}                              <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'justify-end' : 'justify-start'} ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>

                                <span>{formatTime(msg.timestamp)}</span>

export default function ChatPage() {                                {isOwn && msg.read && <CheckCheck className="w-3 h-3" />}

  return (                                {isOwn && !msg.read && <Check className="w-3 h-3" />}

    <ProtectedRoute>                              </div>

      <ChatPageContent />                            </div>

    </ProtectedRoute>                          </div>

  );                        );

}                      })}

                      <div ref={messagesEndRef} />
                    </>
                  )}
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-slate-700 p-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="اكتب رسالة..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:bg-slate-700">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:bg-slate-700">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-30" />
                  <p className="text-gray-400 text-lg">اختر محادثة أو ابدأ محادثة جديدة</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
