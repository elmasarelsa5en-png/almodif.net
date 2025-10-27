'use client';'use client';



import { useState } from 'react';import { useRouter } from 'next/navigation';

import { useRouter } from 'next/navigation';import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import {

import { Button } from '@/components/ui/button';  MessageSquare,

import { Badge } from '@/components/ui/badge';  MessageCircle,

import { Input } from '@/components/ui/input';  Plus,

import { Label } from '@/components/ui/label';  Bot,

import { Textarea } from '@/components/ui/textarea';  ClipboardList,

import { Switch } from '@/components/ui/switch';  Send,

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';  X,

import {   ArrowRight,

  Bot,   Phone,

  Upload,   Clock,

  FileText,   User,

  Settings,   FileText,

  MessageSquare,  CheckCircle,

  ArrowLeft,  AlertCircle,

  Sparkles,  TrendingUp,

  Brain,  Users,

  Database,  Briefcase,

  Zap,  LogOut,

  CheckCircle,  LogIn,

  XCircle,  BarChart3,

  Loader2,  Trash2,

  Plus,  Settings,

  Trash2,  Filter,

  Eye,  Download,

  Edit2,  Upload,

  Save,  Search,

  BarChart3,  Eye,

  Users,  Star,

  Clock,  Award,

  TrendingUp  Activity,

} from 'lucide-react';  Calendar,

  MapPin,

interface TrainingFile {  Mail,

  id: string;  Zap,

  name: string;  Target,

  type: string;  PieChart,

  size: number;  LineChart,

  uploadedAt: string;  PlayCircle,

  status: 'processing' | 'ready' | 'error';  Headphones,

}  Shield,

  ChevronDown,

interface AutoReply {  ChevronUp,

  id: string;  MoreVertical,

  trigger: string;  RefreshCw,

  response: string;  Archive,

  enabled: boolean;  Tag,

  category: string;  Sparkles,

}  Smile,

  Paperclip,

export default function AIAssistantPage() {  Mic,

  const router = useRouter();  Video,

    Check,

  // Training Files State  CheckCheck,

  const [trainingFiles, setTrainingFiles] = useState<TrainingFile[]>([  Image,

    {  FileIcon

      id: '1',} from 'lucide-react';

      name: 'hotel_info.pdf',import { Badge } from '@/components/ui/badge';

      type: 'PDF',import { Button } from '@/components/ui/button';

      size: 245000,import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

      uploadedAt: '2025-01-15',import { Input } from '@/components/ui/input';

      status: 'ready'import { Textarea } from '@/components/ui/textarea';

    },import {

    {  Select,

      id: '2',  SelectContent,

      name: 'services_guide.docx',  SelectItem,

      type: 'DOCX',  SelectTrigger,

      size: 180000,  SelectValue,

      uploadedAt: '2025-01-14',} from '@/components/ui/select';

      status: 'ready'import {

    }  Dialog,

  ]);  DialogContent,

  DialogDescription,

  // Auto Replies State  DialogFooter,

  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([  DialogHeader,

    {  DialogTitle,

      id: '1',} from '@/components/ui/dialog';

      trigger: 'السلام عليكم',import ChatBotSimulator from '@/components/ChatBotSimulator';

      response: 'وعليكم السلام ورحمة الله وبركاته! مرحباً بك في فندقنا. كيف يمكنني مساعدتك؟',

      enabled: true,type ContactStatus = 'active' | 'inactive' | 'blocked' | 'pending' | 'waiting' | 'archived';

      category: 'تحية'type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

    },type RequestType = 'booking' | 'complaint' | 'cleaning' | 'coffee' | 'laundry';

    {type EmployeeStatus = 'available' | 'busy' | 'offline' | 'on-break';

      id: '2',type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

      trigger: 'حجز',type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

      response: 'بالتأكيد! يسعدني مساعدتك في الحجز. ما هو تاريخ الوصول المطلوب؟',type Department = 'sales' | 'accounting' | 'reservations' | 'technical-support' | 'complaints' | 'all';

      enabled: true,type EmployeeRole = 'admin' | 'manager' | 'agent' | 'supervisor';

      category: 'حجوزات'

    },interface DepartmentInfo {

    {  id: Department;

      id: '3',  name: string;

      trigger: 'الأسعار',  icon: string;

      response: 'أسعارنا تبدأ من 300 ريال لليلة الواحدة. للحصول على عرض خاص، يرجى التواصل مع قسم الحجوزات.',  color: string;

      enabled: true,}

      category: 'تسعير'

    }const DEPARTMENTS: DepartmentInfo[] = [

  ]);  { id: 'sales', name: 'المبيعات', icon: '💼', color: 'bg-blue-600' },

  { id: 'accounting', name: 'الحسابات', icon: '💰', color: 'bg-green-600' },

  // Settings State  { id: 'reservations', name: 'الحجوزات', icon: '📅', color: 'bg-purple-600' },

  const [aiSettings, setAiSettings] = useState({  { id: 'technical-support', name: 'الدعم الفني', icon: '🔧', color: 'bg-orange-600' },

    enabled: true,  { id: 'complaints', name: 'الشكاوى والاقتراحات', icon: '📝', color: 'bg-red-600' },

    temperature: 0.7,];

    maxTokens: 500,

    language: 'ar',// الردود السريعة الجاهزة

    autoLearn: true,interface QuickReply {

    responseDelay: 2,  id: string;

    useKnowledgeBase: true  category: string;

  });  title: string;

  message: string;

  // Stats  icon: string;

  const [stats] = useState({}

    totalConversations: 1247,

    successRate: 94.5,const QUICK_REPLIES: QuickReply[] = [

    avgResponseTime: 3.2,  {

    knowledgeBaseSize: 250    id: 'welcome',

  });    category: 'ترحيب',

    title: 'ترحيب عام',

  // New Reply Form    message: 'مرحباً بك! 👋 كيف يمكنني مساعدتك اليوم؟',

  const [showNewReplyForm, setShowNewReplyForm] = useState(false);    icon: '👋'

  const [newReply, setNewReply] = useState({  },

    trigger: '',  {

    response: '',    id: 'booking_inquiry',

    category: ''    category: 'حجوزات',

  });    title: 'استفسار حجز',

    message: 'شكراً لاهتمامك بالحجز لدينا! 🏨 لدينا غرف متاحة. ما التاريخ المطلوب؟',

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {    icon: '📅'

    const files = event.target.files;  },

    if (!files) return;  {

    id: 'prices',

    Array.from(files).forEach(file => {    category: 'أسعار',

      const newFile: TrainingFile = {    title: 'قائمة الأسعار',

        id: Date.now().toString(),    message: '💰 أسعارنا:\n• غرفة ستاندرد: 500 ريال\n• غرفة ديلوكس: 750 ريال\n• سويت: 1200 ريال',

        name: file.name,    icon: '💰'

        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',  },

        size: file.size,  {

        uploadedAt: new Date().toISOString().split('T')[0],    id: 'thanks',

        status: 'processing'    category: 'شكر',

      };    title: 'شكر العميل',

    message: 'شكراً لك! 🙏 نتطلع لخدمتك دائماً',

      setTrainingFiles(prev => [...prev, newFile]);    icon: '🙏'

  },

      // Simulate processing  {

      setTimeout(() => {    id: 'apology',

        setTrainingFiles(prev =>     category: 'اعتذار',

          prev.map(f => f.id === newFile.id ? { ...f, status: 'ready' } : f)    title: 'اعتذار',

        );    message: 'نعتذر عن أي إزعاج! 😔 سنعمل على حل المشكلة فوراً',

      }, 3000);    icon: '😔'

    });  },

  };  {

    id: 'hotel_info',

  const handleDeleteFile = (id: string) => {    category: 'معلومات',

    setTrainingFiles(prev => prev.filter(f => f.id !== id));    title: 'معلومات الفندق',

  };    message: '🏨 فندق المضيف\n📍 الموقع: الرياض\n📞 هاتف: 920000000\n⏰ تسجيل دخول: 2 ظهراً',

    icon: 'ℹ️'

  const handleAddReply = () => {  },

    if (!newReply.trigger || !newReply.response) {  {

      alert('يرجى إدخال الكلمة المفتاحية والرد');    id: 'working_hours',

      return;    category: 'معلومات',

    }    title: 'ساعات العمل',

    message: '⏰ ساعات العمل:\nالاستقبال: 24/7\nالمطعم: 6 ص - 11 م',

    const reply: AutoReply = {    icon: '⏰'

      id: Date.now().toString(),  },

      trigger: newReply.trigger,  {

      response: newReply.response,    id: 'wifi',

      enabled: true,    category: 'معلومات',

      category: newReply.category || 'عام'    title: 'معلومات الواي فاي',

    };    message: '📶 معلومات الواي فاي:\nاسم الشبكة: Hotel_Guest\nكلمة المرور: Welcome2024',

    icon: '📶'

    setAutoReplies(prev => [...prev, reply]);  }

    setNewReply({ trigger: '', response: '', category: '' });];

    setShowNewReplyForm(false);

  };interface WhatsAppContact {

  id: string;

  const handleToggleReply = (id: string) => {  name: string;

    setAutoReplies(prev =>   phone: string;

      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)  status: ContactStatus;

    );  lastMessage: string;

  };  lastMessageTime: string;

  messageCount: number;

  const handleDeleteReply = (id: string) => {  notes: string;

    setAutoReplies(prev => prev.filter(r => r.id !== id));  createdAt: string;

  };  assignedEmployeeId?: string;

  assignedDepartment?: Department;

  const handleSaveSettings = () => {  sharedWith?: string[]; // معرفات الموظفين المشارك معهم

    localStorage.setItem('ai_settings', JSON.stringify(aiSettings));  tags: string[];

    alert('✅ تم حفظ الإعدادات بنجاح!');  priority: IssuePriority;

  };  customerStage: 'trial' | 'follow-up' | 'purchase' | 'rejected';

  satisfactionScore?: number;

  const formatFileSize = (bytes: number) => {}

    if (bytes < 1024) return bytes + ' B';

    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';interface WhatsAppMessage {

    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';  id: string;

  };  contactId: string;

  message: string;

  return (  status: MessageStatus;

    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6" dir="rtl">  timestamp: string;

      <div className="max-w-7xl mx-auto space-y-6">  direction: 'incoming' | 'outgoing';

        {/* Header */}  isBot?: boolean;

        <div className="flex items-center justify-between">  employeeId?: string;

          <div className="flex items-center gap-4">  employeeName?: string;

            <Button  department?: Department;

              variant="ghost"  aiGenerated?: boolean;

              size="icon"  attachments?: Array<{ type: string; url: string; name: string }>;

              onClick={() => router.back()}}

              className="text-white hover:bg-white/10"

            >interface BotRequest {

              <ArrowLeft className="h-5 w-5" />  id: string;

            </Button>  contactId: string;

            <div>  contactName: string;

              <h1 className="text-3xl font-bold text-white flex items-center gap-2">  contactPhone: string;

                <Brain className="h-8 w-8 text-purple-400" />  type: RequestType;

                مساعد الذكاء الاصطناعي  details: Record<string, any>;

              </h1>  status: 'pending' | 'processing' | 'completed';

              <p className="text-purple-200 mt-1">  createdAt: string;

                إدارة الذكاء الاصطناعي والردود التلقائية  completedAt?: string;

              </p>  assignedEmployeeId?: string;

            </div>}

          </div>

          <Badge className={aiSettings.enabled ? 'bg-green-500' : 'bg-red-500'}>interface Employee {

            {aiSettings.enabled ? (  id: string;

              <>  name: string;

                <CheckCircle className="h-3 w-3 mr-1" />  email: string;

                مفعّل  phone: string;

              </>  status: EmployeeStatus;

            ) : (  role: EmployeeRole;

              <>  department: Department;

                <XCircle className="h-3 w-3 mr-1" />  canAccessAllDepartments?: boolean; // للمدير

                معطّل  avatar?: string;

              </>  stats: {

            )}    totalChats: number;

          </Badge>    totalMessages: number;

        </div>    avgResponseTime: number;

    satisfactionScore: number;

        {/* Stats Cards */}    activeChats: number;

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">    resolvedIssues: number;

          <Card className="border-purple-500/30 bg-slate-900/50">  };

            <CardHeader className="pb-2">  workingHours: {

              <CardTitle className="text-sm text-slate-300">إجمالي المحادثات</CardTitle>    start: string;

            </CardHeader>    end: string;

            <CardContent>    totalHoursToday: number;

              <div className="flex items-center justify-between">  };

                <p className="text-3xl font-bold text-white">{stats.totalConversations}</p>  lastActive: string;

                <MessageSquare className="h-8 w-8 text-purple-400" />}

              </div>

            </CardContent>interface Issue {

          </Card>  id: string;

  contactId: string;

          <Card className="border-purple-500/30 bg-slate-900/50">  title: string;

            <CardHeader className="pb-2">  description: string;

              <CardTitle className="text-sm text-slate-300">معدل النجاح</CardTitle>  status: IssueStatus;

            </CardHeader>  priority: IssuePriority;

            <CardContent>  category: string;

              <div className="flex items-center justify-between">  assignedEmployeeId?: string;

                <p className="text-3xl font-bold text-white">{stats.successRate}%</p>  createdAt: string;

                <TrendingUp className="h-8 w-8 text-green-400" />  resolvedAt?: string;

              </div>  solutionSteps: string[];

            </CardContent>  solutionVideoUrl?: string;

          </Card>  relatedChatIds: string[];

  frequency: number;

          <Card className="border-purple-500/30 bg-slate-900/50">}

            <CardHeader className="pb-2">

              <CardTitle className="text-sm text-slate-300">متوسط وقت الرد</CardTitle>interface AnalyticsData {

            </CardHeader>  totalContacts: number;

            <CardContent>  activeChats: number;

              <div className="flex items-center justify-between">  totalMessages: number;

                <p className="text-3xl font-bold text-white">{stats.avgResponseTime}s</p>  avgResponseTime: number;

                <Clock className="h-8 w-8 text-blue-400" />  satisfactionScore: number;

              </div>  resolvedIssues: number;

            </CardContent>  pendingRequests: number;

          </Card>  dailyStats: Array<{ date: string; messages: number; chats: number }>;

  employeePerformance: Array<{ employeeId: string; name: string; score: number; chats: number }>;

          <Card className="border-purple-500/30 bg-slate-900/50">}

            <CardHeader className="pb-2">

              <CardTitle className="text-sm text-slate-300">قاعدة المعرفة</CardTitle>const STORAGE_CONTACTS_KEY = 'whatsapp_contacts';

            </CardHeader>const STORAGE_MESSAGES_KEY = 'whatsapp_messages';

            <CardContent>const STORAGE_BOT_REQUESTS_KEY = 'bot_requests';

              <div className="flex items-center justify-between">const STORAGE_EMPLOYEES_KEY = 'crm_employees';

                <p className="text-3xl font-bold text-white">{stats.knowledgeBaseSize}</p>const STORAGE_ISSUES_KEY = 'crm_issues';

                <Database className="h-8 w-8 text-yellow-400" />

              </div>// بيانات الموظفين الافتراضية

            </CardContent>const DEFAULT_EMPLOYEES: Employee[] = [

          </Card>  {

        </div>    id: 'emp_001',

    name: 'أحمد محمد',

        {/* Main Content Tabs */}    email: 'ahmed@hotel.com',

        <Tabs defaultValue="training" className="space-y-4">    phone: '+201012345678',

          <TabsList className="bg-slate-900/50 border border-purple-500/30">    status: 'available',

            <TabsTrigger value="training" className="data-[state=active]:bg-purple-600">    role: 'admin',

              <FileText className="h-4 w-4 mr-2" />    department: 'all',

              التدريب والملفات    canAccessAllDepartments: true,

            </TabsTrigger>    avatar: '👨‍💼',

            <TabsTrigger value="replies" className="data-[state=active]:bg-purple-600">    stats: {

              <MessageSquare className="h-4 w-4 mr-2" />      totalChats: 145,

              الردود التلقائية      totalMessages: 892,

            </TabsTrigger>      avgResponseTime: 2.3,

            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">      satisfactionScore: 4.8,

              <Settings className="h-4 w-4 mr-2" />      activeChats: 8,

              الإعدادات      resolvedIssues: 67

            </TabsTrigger>    },

            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">    workingHours: {

              <BarChart3 className="h-4 w-4 mr-2" />      start: '08:00',

              التحليلات      end: '17:00',

            </TabsTrigger>      totalHoursToday: 6.5

          </TabsList>    },

    lastActive: new Date().toISOString()

          {/* Training Tab */}  },

          <TabsContent value="training" className="space-y-4">  {

            <Card className="border-purple-500/30 bg-slate-900/50">    id: 'emp_002',

              <CardHeader>    name: 'فاطمة أحمد',

                <CardTitle className="text-white flex items-center gap-2">    email: 'fatima@hotel.com',

                  <Upload className="h-5 w-5 text-purple-400" />    phone: '+201098765432',

                  رفع ملفات التدريب    status: 'busy',

                </CardTitle>    role: 'agent',

                <p className="text-sm text-slate-400">    department: 'sales',

                  قم برفع ملفات PDF أو DOCX لتدريب الذكاء الاصطناعي على معلومات الفندق    avatar: '👩‍💼',

                </p>    stats: {

              </CardHeader>      totalChats: 98,

              <CardContent className="space-y-4">      totalMessages: 567,

                <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">      avgResponseTime: 3.1,

                  <input      satisfactionScore: 4.5,

                    type="file"      activeChats: 12,

                    id="file-upload"      resolvedIssues: 45

                    className="hidden"    },

                    multiple    workingHours: {

                    accept=".pdf,.docx,.doc,.txt"      start: '09:00',

                    onChange={handleFileUpload}      end: '18:00',

                  />      totalHoursToday: 5.2

                  <label htmlFor="file-upload" className="cursor-pointer">    },

                    <Upload className="h-12 w-12 mx-auto mb-4 text-purple-400" />    lastActive: new Date(Date.now() - 300000).toISOString()

                    <p className="text-white font-semibold mb-1">اضغط لرفع الملفات</p>  },

                    <p className="text-sm text-slate-400">  {

                      PDF, DOCX, TXT (الحد الأقصى: 10 MB)    id: 'emp_003',

                    </p>    name: 'محمود علي',

                  </label>    email: 'mahmoud@hotel.com',

                </div>    phone: '+201156789012',

    status: 'available',

                {/* Uploaded Files List */}    role: 'agent',

                <div className="space-y-2">    department: 'reservations',

                  <h3 className="text-white font-semibold mb-3">الملفات المرفوعة ({trainingFiles.length})</h3>    avatar: '👨‍💻',

                  {trainingFiles.map(file => (    stats: {

                    <div       totalChats: 123,

                      key={file.id}      totalMessages: 734,

                      className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700"      avgResponseTime: 2.8,

                    >      satisfactionScore: 4.7,

                      <div className="flex items-center gap-3 flex-1">      activeChats: 5,

                        <FileText className="h-8 w-8 text-purple-400" />      resolvedIssues: 58

                        <div className="flex-1 min-w-0">    },

                          <p className="text-white font-medium truncate">{file.name}</p>    workingHours: {

                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">      start: '08:30',

                            <span>{file.type}</span>      end: '17:30',

                            <span>•</span>      totalHoursToday: 7.0

                            <span>{formatFileSize(file.size)}</span>    },

                            <span>•</span>    lastActive: new Date(Date.now() - 120000).toISOString()

                            <span>{file.uploadedAt}</span>  }

                          </div>];

                        </div>

                      </div>// بيانات العملاء التجريبية

                      <div className="flex items-center gap-2">const DEFAULT_CONTACTS: WhatsAppContact[] = [

                        {file.status === 'processing' && (  {

                          <Badge className="bg-yellow-500">    id: 'contact_001',

                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />    name: 'خالد العتيبي',

                            معالجة    phone: '+966501234567',

                          </Badge>    status: 'active',

                        )}    lastMessage: 'شكراً جزيلاً على الخدمة الممتازة 🙏',

                        {file.status === 'ready' && (    lastMessageTime: new Date(Date.now() - 300000).toISOString(),

                          <Badge className="bg-green-500">    messageCount: 28,

                            <CheckCircle className="h-3 w-3 mr-1" />    notes: 'عميل VIP - يفضل الغرف في الطابق العلوي',

                            جاهز    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),

                          </Badge>    assignedEmployeeId: 'emp_001',

                        )}    assignedDepartment: 'sales',

                        {file.status === 'error' && (    tags: ['VIP', 'عميل دائم', 'أعمال'],

                          <Badge className="bg-red-500">    priority: 'high',

                            <XCircle className="h-3 w-3 mr-1" />    customerStage: 'purchase',

                            خطأ    satisfactionScore: 5

                          </Badge>  },

                        )}  {

                        <Button    id: 'contact_002',

                          size="sm"    name: 'نورة المطيري',

                          variant="ghost"    phone: '+966502345678',

                          onClick={() => handleDeleteFile(file.id)}    status: 'active',

                          className="text-red-400 hover:bg-red-500/10"    lastMessage: 'هل يمكن حجز غرفة لعائلة من 4 أفراد؟',

                        >    lastMessageTime: new Date(Date.now() - 600000).toISOString(),

                          <Trash2 className="h-4 w-4" />    messageCount: 15,

                        </Button>    notes: 'تهتم بالعروض والخصومات',

                      </div>    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),

                    </div>    assignedEmployeeId: 'emp_003',

                  ))}    assignedDepartment: 'reservations',

                </div>    tags: ['عائلة', 'خصومات'],

              </CardContent>    priority: 'medium',

            </Card>    customerStage: 'follow-up',

          </TabsContent>    satisfactionScore: 4.5

  },

          {/* Auto Replies Tab */}  {

          <TabsContent value="replies" className="space-y-4">    id: 'contact_003',

            <Card className="border-purple-500/30 bg-slate-900/50">    name: 'عبدالله السعيد',

              <CardHeader>    phone: '+966503456789',

                <div className="flex items-center justify-between">    status: 'waiting',

                  <div>    lastMessage: 'ما هي أسعار السويت لمدة أسبوع؟',

                    <CardTitle className="text-white flex items-center gap-2">    lastMessageTime: new Date(Date.now() - 1800000).toISOString(),

                      <Zap className="h-5 w-5 text-yellow-400" />    messageCount: 7,

                      الردود التلقائية    notes: 'مهتم بالإقامات الطويلة',

                    </CardTitle>    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),

                    <p className="text-sm text-slate-400 mt-1">    assignedEmployeeId: 'emp_002',

                      قم بإضافة ردود تلقائية للكلمات المفتاحية الشائعة    assignedDepartment: 'sales',

                    </p>    tags: ['إقامة طويلة'],

                  </div>    priority: 'medium',

                  <Button    customerStage: 'trial',

                    onClick={() => setShowNewReplyForm(true)}    satisfactionScore: 4

                    className="bg-gradient-to-r from-purple-600 to-blue-600"  },

                  >  {

                    <Plus className="h-4 w-4 mr-2" />    id: 'contact_004',

                    رد جديد    name: 'سارة القحطاني',

                  </Button>    phone: '+966504567890',

                </div>    status: 'active',

              </CardHeader>    lastMessage: 'تمام، سأقوم بالحجز اليوم',

              <CardContent className="space-y-3">    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),

                {autoReplies.map(reply => (    messageCount: 22,

                  <div    notes: 'سريعة القرار - تفضل الغرف الهادئة',

                    key={reply.id}    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),

                    className="p-4 bg-slate-800 rounded-lg border border-slate-700"    assignedEmployeeId: 'emp_003',

                  >    assignedDepartment: 'reservations',

                    <div className="flex items-start justify-between mb-3">    tags: ['سريع', 'قرار'],

                      <div className="flex-1">    priority: 'high',

                        <div className="flex items-center gap-2 mb-2">    customerStage: 'purchase',

                          <Badge className="bg-purple-600">{reply.category}</Badge>    satisfactionScore: 4.8

                          <Switch  },

                            checked={reply.enabled}  {

                            onCheckedChange={() => handleToggleReply(reply.id)}    id: 'contact_005',

                          />    name: 'محمد الدوسري',

                        </div>    phone: '+966505678901',

                        <p className="text-white font-semibold mb-1">    status: 'blocked',

                          الكلمة المفتاحية: <span className="text-purple-400">{reply.trigger}</span>    lastMessage: 'هذا غير مقبول! أريد استرجاع أموالي!',

                        </p>    lastMessageTime: new Date(Date.now() - 7200000).toISOString(),

                        <p className="text-slate-300 text-sm">{reply.response}</p>    messageCount: 45,

                      </div>    notes: '⚠️ عميل صعب - يكثر الشكاوى',

                      <Button    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),

                        size="sm"    assignedEmployeeId: 'emp_001',

                        variant="ghost"    assignedDepartment: 'complaints',

                        onClick={() => handleDeleteReply(reply.id)}    tags: ['شكاوى', 'انتباه'],

                        className="text-red-400 hover:bg-red-500/10"    priority: 'urgent',

                      >    customerStage: 'rejected',

                        <Trash2 className="h-4 w-4" />    satisfactionScore: 2

                      </Button>  },

                    </div>  {

                  </div>    id: 'contact_006',

                ))}    name: 'ريم الشمري',

    phone: '+966506789012',

                {/* New Reply Form */}    status: 'active',

                {showNewReplyForm && (    lastMessage: 'مساء الخير، أريد الاستفسار عن أسعار الحجز',

                  <div className="p-4 bg-slate-800 rounded-lg border-2 border-purple-500/50 space-y-3">    lastMessageTime: new Date(Date.now() - 10800000).toISOString(),

                    <h4 className="text-white font-semibold mb-3">إضافة رد جديد</h4>    messageCount: 3,

                    <div>    notes: 'عميل جديد - أول اتصال',

                      <Label className="text-slate-300">التصنيف</Label>    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),

                      <Input    assignedEmployeeId: 'emp_002',

                        value={newReply.category}    assignedDepartment: 'sales',

                        onChange={(e) => setNewReply({ ...newReply, category: e.target.value })}    tags: ['جديد'],

                        className="mt-1 bg-slate-900 border-slate-700 text-white"    priority: 'medium',

                        placeholder="مثال: حجوزات، خدمات، استفسارات"    customerStage: 'trial'

                      />  },

                    </div>  {

                    <div>    id: 'contact_007',

                      <Label className="text-slate-300">الكلمة المفتاحية</Label>    name: 'فهد العنزي',

                      <Input    phone: '+966507890123',

                        value={newReply.trigger}    status: 'active',

                        onChange={(e) => setNewReply({ ...newReply, trigger: e.target.value })}    lastMessage: 'الغرفة نظيفة جداً، شكراً 🌟',

                        className="mt-1 bg-slate-900 border-slate-700 text-white"    lastMessageTime: new Date(Date.now() - 14400000).toISOString(),

                        placeholder="مثال: حجز، أسعار، خدمات"    messageCount: 19,

                      />    notes: 'يحب التواصل - راضٍ عن الخدمة',

                    </div>    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),

                    <div>    assignedEmployeeId: 'emp_003',

                      <Label className="text-slate-300">الرد التلقائي</Label>    assignedDepartment: 'reservations',

                      <Textarea    tags: ['راضي', 'تواصل جيد'],

                        value={newReply.response}    priority: 'low',

                        onChange={(e) => setNewReply({ ...newReply, response: e.target.value })}    customerStage: 'purchase',

                        className="mt-1 bg-slate-900 border-slate-700 text-white min-h-[80px]"    satisfactionScore: 4.9

                        placeholder="اكتب الرد التلقائي هنا..."  },

                      />  {

                    </div>    id: 'contact_008',

                    <div className="flex gap-2">    name: 'لطيفة الحربي',

                      <Button    phone: '+966508901234',

                        onClick={handleAddReply}    status: 'waiting',

                        className="flex-1 bg-green-600 hover:bg-green-700"    lastMessage: 'هل تتوفر خدمة التوصيل من المطار؟',

                      >    lastMessageTime: new Date(Date.now() - 18000000).toISOString(),

                        <Save className="h-4 w-4 mr-2" />    messageCount: 11,

                        حفظ    notes: 'تسأل عن خدمات إضافية',

                      </Button>    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),

                      <Button    assignedEmployeeId: 'emp_002',

                        onClick={() => {    assignedDepartment: 'sales',

                          setShowNewReplyForm(false);    tags: ['خدمات إضافية'],

                          setNewReply({ trigger: '', response: '', category: '' });    priority: 'medium',

                        }}    customerStage: 'follow-up',

                        variant="outline"    satisfactionScore: 4.2

                        className="flex-1"  },

                      >  {

                        إلغاء    id: 'contact_009',

                      </Button>    name: 'بندر الغامدي',

                    </div>    phone: '+966509012345',

                  </div>    status: 'active',

                )}    lastMessage: 'حجزت 3 غرف للشهر القادم',

              </CardContent>    lastMessageTime: new Date(Date.now() - 21600000).toISOString(),

            </Card>    messageCount: 34,

          </TabsContent>    notes: 'يحجز لمجموعات كبيرة - شركة',

    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),

          {/* Settings Tab */}    assignedEmployeeId: 'emp_001',

          <TabsContent value="settings" className="space-y-4">    assignedDepartment: 'sales',

            <Card className="border-purple-500/30 bg-slate-900/50">    sharedWith: ['emp_002', 'emp_003'],

              <CardHeader>    tags: ['VIP', 'شركة', 'مجموعات'],

                <CardTitle className="text-white flex items-center gap-2">    priority: 'high',

                  <Settings className="h-5 w-5 text-purple-400" />    customerStage: 'purchase',

                  إعدادات الذكاء الاصطناعي    satisfactionScore: 4.7

                </CardTitle>  },

              </CardHeader>  {

              <CardContent className="space-y-6">    id: 'contact_010',

                {/* Enable AI */}    name: 'هند الزهراني',

                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">    phone: '+966500123456',

                  <div>    status: 'archived',

                    <Label className="text-white font-semibold">تفعيل الذكاء الاصطناعي</Label>    lastMessage: 'شكراً، قضينا وقتاً رائعاً',

                    <p className="text-xs text-slate-400 mt-1">    lastMessageTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),

                      تمكين الردود التلقائية والذكية    messageCount: 8,

                    </p>    notes: 'زيارة سابقة - لم يعد منذ شهر',

                  </div>    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),

                  <Switch    assignedEmployeeId: 'emp_003',

                    checked={aiSettings.enabled}    assignedDepartment: 'reservations',

                    onCheckedChange={(checked) => setAiSettings({ ...aiSettings, enabled: checked })}    tags: ['زيارة سابقة'],

                  />    priority: 'low',

                </div>    customerStage: 'purchase',

    satisfactionScore: 4.5

                {/* Temperature */}  }

                <div>];

                  <Label className="text-slate-300">درجة الحرارة (الإبداعية)</Label>

                  <p className="text-xs text-slate-400 mb-2">// رسائل تجريبية للعملاء

                    قيمة أعلى = ردود أكثر إبداعاً، قيمة أقل = ردود أكثر دقةconst DEFAULT_MESSAGES: WhatsAppMessage[] = [

                  </p>  // محادثة خالد العتيبي

                  <Input  {

                    type="number"    id: 'msg_001',

                    min="0"    contactId: 'contact_001',

                    max="1"    message: 'السلام عليكم، أريد حجز غرفة سويت لمدة 3 أيام',

                    step="0.1"    status: 'read',

                    value={aiSettings.temperature}    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),

                    onChange={(e) => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}    direction: 'incoming'

                    className="bg-slate-800 border-slate-700 text-white"  },

                  />  {

                </div>    id: 'msg_002',

    contactId: 'contact_001',

                {/* Max Tokens */}    message: 'وعليكم السلام ورحمة الله 👋 أهلاً بك أستاذ خالد! يسعدنا خدمتك',

                <div>    status: 'read',

                  <Label className="text-slate-300">الحد الأقصى للكلمات</Label>    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 120000).toISOString(),

                  <p className="text-xs text-slate-400 mb-2">    direction: 'outgoing',

                    أقصى عدد كلمات في الرد الواحد    employeeId: 'emp_001',

                  </p>    employeeName: 'أحمد محمد',

                  <Input    department: 'sales'

                    type="number"  },

                    min="100"  {

                    max="2000"    id: 'msg_003',

                    step="50"    contactId: 'contact_001',

                    value={aiSettings.maxTokens}    message: '💰 أسعارنا:\n• غرفة ستاندرد: 500 ريال/ليلة\n• غرفة ديلوكس: 750 ريال/ليلة\n• سويت: 1200 ريال/ليلة\n\nالسويت لـ 3 أيام = 3600 ريال',

                    onChange={(e) => setAiSettings({ ...aiSettings, maxTokens: parseInt(e.target.value) })}    status: 'read',

                    className="bg-slate-800 border-slate-700 text-white"    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 180000).toISOString(),

                  />    direction: 'outgoing',

                </div>    employeeId: 'emp_001',

    employeeName: 'أحمد محمد',

                {/* Language */}    department: 'sales'

                <div>  },

                  <Label className="text-slate-300">اللغة الافتراضية</Label>  {

                  <select    id: 'msg_004',

                    value={aiSettings.language}    contactId: 'contact_001',

                    onChange={(e) => setAiSettings({ ...aiSettings, language: e.target.value })}    message: 'ممتاز، احجز لي من تاريخ 25/10',

                    className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"    status: 'read',

                  >    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),

                    <option value="ar">العربية</option>    direction: 'incoming'

                    <option value="en">الإنجليزية</option>  },

                    <option value="both">كلاهما</option>  {

                  </select>    id: 'msg_005',

                </div>    contactId: 'contact_001',

    message: 'تم التأكيد! ✅ حجز رقم #12345\nالسويت جاهزة لك من 25/10\nنتطلع لاستقبالك 🏨',

                {/* Response Delay */}    status: 'read',

                <div>    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 60000).toISOString(),

                  <Label className="text-slate-300">تأخير الرد (ثانية)</Label>    direction: 'outgoing',

                  <p className="text-xs text-slate-400 mb-2">    employeeId: 'emp_001',

                    وقت الانتظار قبل إرسال الرد التلقائي    employeeName: 'أحمد محمد',

                  </p>    department: 'sales'

                  <Input  },

                    type="number"  {

                    min="0"    id: 'msg_006',

                    max="10"    contactId: 'contact_001',

                    step="0.5"    message: 'شكراً جزيلاً على الخدمة الممتازة 🙏',

                    value={aiSettings.responseDelay}    status: 'delivered',

                    onChange={(e) => setAiSettings({ ...aiSettings, responseDelay: parseFloat(e.target.value) })}    timestamp: new Date(Date.now() - 300000).toISOString(),

                    className="bg-slate-800 border-slate-700 text-white"    direction: 'incoming'

                  />  },

                </div>  

  // محادثة نورة المطيري

                {/* Auto Learn */}  {

                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">    id: 'msg_007',

                  <div>    contactId: 'contact_002',

                    <Label className="text-white font-semibold">التعلم التلقائي</Label>    message: 'مرحباً، هل عندكم عروض للعائلات؟',

                    <p className="text-xs text-slate-400 mt-1">    status: 'read',

                      تحسين الردود بناءً على المحادثات السابقة    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),

                    </p>    direction: 'incoming'

                  </div>  },

                  <Switch  {

                    checked={aiSettings.autoLearn}    id: 'msg_008',

                    onCheckedChange={(checked) => setAiSettings({ ...aiSettings, autoLearn: checked })}    contactId: 'contact_002',

                  />    message: 'مرحباً بك! 👋 نعم، لدينا عرض العائلات:\n• 2 غرفة متجاورة\n• خصم 20%\n• إفطار مجاني للأطفال',

                </div>    status: 'read',

    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 90000).toISOString(),

                {/* Use Knowledge Base */}    direction: 'outgoing',

                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">    employeeId: 'emp_003',

                  <div>    employeeName: 'محمود علي - الحجوزات',

                    <Label className="text-white font-semibold">استخدام قاعدة المعرفة</Label>    department: 'reservations'

                    <p className="text-xs text-slate-400 mt-1">  },

                      الرجوع للملفات المرفوعة عند الرد  {

                    </p>    id: 'msg_009',

                  </div>    contactId: 'contact_002',

                  <Switch    message: 'رائع! وما السعر بعد الخصم؟',

                    checked={aiSettings.useKnowledgeBase}    status: 'read',

                    onCheckedChange={(checked) => setAiSettings({ ...aiSettings, useKnowledgeBase: checked })}    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),

                  />    direction: 'incoming'

                </div>  },

  {

                <Button    id: 'msg_010',

                  onClick={handleSaveSettings}    contactId: 'contact_002',

                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"    message: 'بعد الخصم: 800 ريال/ليلة للغرفتين 💰',

                >    status: 'read',

                  <Save className="h-4 w-4 mr-2" />    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 120000).toISOString(),

                  حفظ الإعدادات    direction: 'outgoing',

                </Button>    employeeId: 'emp_003',

              </CardContent>    employeeName: 'محمود علي - الحجوزات',

            </Card>    department: 'reservations'

          </TabsContent>  },

  {

          {/* Analytics Tab */}    id: 'msg_011',

          <TabsContent value="analytics" className="space-y-4">    contactId: 'contact_002',

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">    message: 'هل يمكن حجز غرفة لعائلة من 4 أفراد؟',

              <Card className="border-purple-500/30 bg-slate-900/50">    status: 'delivered',

                <CardHeader>    timestamp: new Date(Date.now() - 600000).toISOString(),

                  <CardTitle className="text-white text-sm">أداء الردود</CardTitle>    direction: 'incoming'

                </CardHeader>  },

                <CardContent>  

                  <div className="space-y-3">  // محادثة عبدالله السعيد

                    <div className="flex items-center justify-between">  {

                      <span className="text-slate-400 text-sm">ردود ناجحة</span>    id: 'msg_012',

                      <span className="text-green-400 font-bold">1,178</span>    contactId: 'contact_003',

                    </div>    message: 'السلام عليكم، أريد معلومات عن الإقامة الطويلة',

                    <div className="flex items-center justify-between">    status: 'read',

                      <span className="text-slate-400 text-sm">ردود فاشلة</span>    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),

                      <span className="text-red-400 font-bold">69</span>    direction: 'incoming'

                    </div>  },

                    <div className="flex items-center justify-between">  {

                      <span className="text-slate-400 text-sm">تحتاج تدخل بشري</span>    id: 'msg_013',

                      <span className="text-yellow-400 font-bold">142</span>    contactId: 'contact_003',

                    </div>    message: 'وعليكم السلام! 👋 لدينا عروض خاصة للإقامات الطويلة:\n• أسبوع: خصم 15%\n• شهر: خصم 25%',

                  </div>    status: 'read',

                </CardContent>    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 180000).toISOString(),

              </Card>    direction: 'outgoing',

    employeeId: 'emp_002',

              <Card className="border-purple-500/30 bg-slate-900/50">    employeeName: 'فاطمة أحمد - المبيعات',

                <CardHeader>    department: 'sales'

                  <CardTitle className="text-white text-sm">التصنيفات الأكثر استخداماً</CardTitle>  },

                </CardHeader>  {

                <CardContent>    id: 'msg_014',

                  <div className="space-y-3">    contactId: 'contact_003',

                    <div className="flex items-center justify-between">    message: 'ما هي أسعار السويت لمدة أسبوع؟',

                      <span className="text-slate-400 text-sm">حجوزات</span>    status: 'sent',

                      <Badge className="bg-blue-600">487</Badge>    timestamp: new Date(Date.now() - 1800000).toISOString(),

                    </div>    direction: 'incoming'

                    <div className="flex items-center justify-between">  },

                      <span className="text-slate-400 text-sm">استفسارات</span>  

                      <Badge className="bg-purple-600">325</Badge>  // محادثة محمد الدوسري (المشاكل)

                    </div>  {

                    <div className="flex items-center justify-between">    id: 'msg_015',

                      <span className="text-slate-400 text-sm">خدمات</span>    contactId: 'contact_005',

                      <Badge className="bg-green-600">211</Badge>    message: 'الغرفة غير نظيفة! أريد تغيير فوراً!',

                    </div>    status: 'read',

                  </div>    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),

                </CardContent>    direction: 'incoming'

              </Card>  },

  {

              <Card className="border-purple-500/30 bg-slate-900/50 md:col-span-2">    id: 'msg_016',

                <CardHeader>    contactId: 'contact_005',

                  <CardTitle className="text-white text-sm">أوقات الذروة</CardTitle>    message: 'نعتذر بشدة عن هذا التقصير 😔 سنرسل فريق التنظيف فوراً وسنغير الغرفة',

                </CardHeader>    status: 'read',

                <CardContent>    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000).toISOString(),

                  <div className="grid grid-cols-4 gap-2">    direction: 'outgoing',

                    {['9-12 ص', '12-3 م', '3-6 م', '6-9 م', '9-12 م'].map((time, idx) => (    employeeId: 'emp_001',

                      <div key={time} className="text-center p-3 bg-slate-800 rounded-lg">    employeeName: 'أحمد محمد - المدير',

                        <p className="text-xs text-slate-400 mb-1">{time}</p>    department: 'complaints'

                        <p className="text-lg font-bold text-white">{Math.floor(Math.random() * 200) + 50}</p>  },

                      </div>  {

                    ))}    id: 'msg_017',

                  </div>    contactId: 'contact_005',

                </CardContent>    message: 'هذا غير مقبول! أريد استرجاع أموالي!',

              </Card>    status: 'read',

            </div>    timestamp: new Date(Date.now() - 7200000).toISOString(),

          </TabsContent>    direction: 'incoming'

        </Tabs>  }

];

        {/* Quick Actions */}

        <Card className="border-purple-500/30 bg-slate-900/50">// الأسئلة الشائعة والحلول

          <CardHeader>const COMMON_ISSUES = [

            <CardTitle className="text-white">إجراءات سريعة</CardTitle>  {

          </CardHeader>    category: 'فنية',

          <CardContent>    title: 'مشكلة في تسجيل الدخول',

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">    solution: 'امسح الكاش وحاول مرة أخرى',

              <Button     videoUrl: 'https://youtube.com/watch?v=example1'

                variant="outline"   },

                className="h-20"  {

                onClick={() => router.push('/whatsapp-bot')}    category: 'خدمة الغرف',

              >    title: 'تأخر التنظيف',

                <div className="text-center">    solution: 'سيتم إرسال الفريق خلال 15 دقيقة',

                  <Bot className="h-6 w-6 mx-auto mb-1 text-green-400" />    videoUrl: ''

                  <p className="text-sm">إعدادات WhatsApp</p>  },

                </div>  {

              </Button>    category: 'الفواتير',

                  title: 'خطأ في الفاتورة',

              <Button     solution: 'سيتم مراجعة الفاتورة وتصحيحها',

                variant="outline"     videoUrl: 'https://youtube.com/watch?v=example3'

                className="h-20"  }

                onClick={() => router.push('/dashboard/chat')}];

              >

                <div className="text-center">// قائمة الإيموجي الشائعة

                  <Users className="h-6 w-6 mx-auto mb-1 text-blue-400" />const EMOJI_LIST = [

                  <p className="text-sm">المحادثات النشطة</p>  { category: 'وجوه', emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'] },

                </div>  { category: 'إيماءات', emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'] },

              </Button>  { category: 'قلوب', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },

                { category: 'حيوانات', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗'] },

              <Button   { category: 'طعام', emojis: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧋', '🧃', '🧉', '🧊'] },

                variant="outline"   { category: 'رياضة', emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'] },

                className="h-20"  { category: 'سفر', emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋'] }

                onClick={() => router.push('/dashboard/requests')}];

              >

                <div className="text-center">const REQUEST_TYPES: Array<{ value: RequestType; label: string; icon: string }> = [

                  <MessageSquare className="h-6 w-6 mx-auto mb-1 text-purple-400" />  { value: 'booking', label: 'حجز غرفة', icon: '🏨' },

                  <p className="text-sm">طلبات النزلاء</p>  { value: 'complaint', label: 'شكوى', icon: '⚠️' },

                </div>  { value: 'cleaning', label: 'تنظيف الغرفة', icon: '🧹' },

              </Button>  { value: 'coffee', label: 'طلب كوفي', icon: '☕' },

            </div>  { value: 'laundry', label: 'غسيل الملابس', icon: '👕' }

          </CardContent>];

        </Card>

      </div>const BOT_CONVERSATIONS: Record<RequestType, string[]> = {

    </div>  booking: [

  );    'شكراً لتواصلك معنا! 🏨 نود توفير أفضل خدماتنا لك',

}    'كم عدد الأشخاص الذين ستقيمون؟',

    'ما هو نوع الغرفة المفضل لديك؟ (ستاندرد/ديلوكس/سويت)',
    'ما تاريخ دخول وخروج الإقامة؟',
    'تم تسجيل طلب الحجز بنجاح! سيتم التواصل معك قريباً ✅'
  ],
  complaint: [
    'نأسف لسماع شكواك! 😔 نحن هنا لمساعدتك',
    'يرجى تفصيل الشكوى بالتفاصيل',
    'هل تريد زيارة فريق الصيانة للغرفة؟',
    'شكراً لتعاونك! سيتم معالجة شكواك فوراً ✅'
  ],
  cleaning: [
    'خدمة التنظيف! 🧹 سعيد بطلبك',
    'ما رقم الغرفة؟',
    'ما المدة المتوقعة للانتهاء؟ (طارئ/عادي)',
    'تم تسجيل طلب التنظيف! سيصل الفريق خلال 15-30 دقيقة ✅'
  ],
  coffee: [
    'مرحباً بطلبك من الكوفي شوب! ☕',
    'ما الذي تود طلبه؟',
    'ما رقم الغرفة لتوصيل الطلب؟',
    'شكراً! سيصل طلبك خلال 15-20 دقيقة ✅'
  ],
  laundry: [
    'خدمة الغسيل المتميزة! 👕',
    'كم قطعة ملابس تريد غسلها؟',
    'هل تريد خدمة الغسيل السريع؟ (إضافي مقابل رسوم)',
    'تم استقبال طلبك! سيتم توصيل الملابس خلال 24 ساعة ✅'
  ]
};

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setState(JSON.parse(stored));
    } catch (e) {
      console.error(`Storage error: ${key}`, e);
    }
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(`Storage error: ${key}`, e);
    }
  }, [key, state]);
  return [state, setState] as const;
}

export default function WhatsAppCRMPage() {
  const router = useRouter();
  const [contacts, setContacts] = useLocalStorage<WhatsAppContact[]>(STORAGE_CONTACTS_KEY, DEFAULT_CONTACTS);
  const [messages, setMessages] = useLocalStorage<WhatsAppMessage[]>(STORAGE_MESSAGES_KEY, DEFAULT_MESSAGES);
  const [botRequests, setBotRequests] = useLocalStorage<BotRequest[]>(STORAGE_BOT_REQUESTS_KEY, []);
  const [employees, setEmployees] = useLocalStorage<Employee[]>(STORAGE_EMPLOYEES_KEY, DEFAULT_EMPLOYEES);
  const [issues, setIssues] = useLocalStorage<Issue[]>(STORAGE_ISSUES_KEY, []);

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'requests' | 'employees' | 'analytics' | 'issues'>('messages');
  const [botMode, setBotMode] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [botRequestType, setBotRequestType] = useState<RequestType>('booking');
  const [botStep, setBotStep] = useState(0);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', category: '', priority: 'medium' as IssuePriority });
  
  // نظام الصلاحيات والأقسام
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('emp_001'); // افتراضياً المدير
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('all');
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [showShareContactDialog, setShowShareContactDialog] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedContactsForBroadcast, setSelectedContactsForBroadcast] = useState<string[]>([]);
  
  // نظام الردود السريعة والأزرار
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // حالة المساعد الذكي
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // حالة نموذج إضافة جهة اتصال
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    customerType: 'عادي' as 'VIP' | 'عادي' | 'مشاغب',
    stage: 'trial' as 'trial' | 'follow-up' | 'purchase' | 'rejected',
    notes: '',
    priority: 'medium' as IssuePriority
  });

  // حفظ واستعادة آخر محادثة محددة
  useEffect(() => {
    const savedContactId = localStorage.getItem('lastSelectedContact');
    if (savedContactId && contacts.find(c => c.id === savedContactId)) {
      setSelectedContactId(savedContactId);
    } else if (contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedContactId) {
      localStorage.setItem('lastSelectedContact', selectedContactId);
    }
  }, [selectedContactId]);

  // إعادة تحميل الرسائل عند حدوث تغيير في localStorage (مثلاً بواسطة AI auto-reply أو تبويب آخر)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'whatsapp_messages' || e.key.startsWith('broadcast_')) {
        try {
          const stored = localStorage.getItem(STORAGE_MESSAGES_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as WhatsAppMessage[];
            setMessages(parsed);
          }
        } catch (err) {
          console.error('Failed to parse messages from storage event', err);
        }
      }
    };

    window.addEventListener('storage', handleStorage as any);
    return () => window.removeEventListener('storage', handleStorage as any);
  }, []);

  const stats = useMemo(() => ({
    totalContacts: contacts.length,
    activeContacts: contacts.filter((c) => c.status === 'active').length,
    totalMessages: messages.length,
    botRequests: botRequests.length,
    pendingRequests: botRequests.filter((r) => r.status === 'pending').length,
    totalEmployees: employees.length,
    availableEmployees: employees.filter((e) => e.status === 'available').length,
    totalIssues: issues.length,
    openIssues: issues.filter((i) => i.status === 'open' || i.status === 'in-progress').length,
    avgSatisfaction: contacts.reduce((sum, c) => sum + (c.satisfactionScore || 0), 0) / contacts.filter(c => c.satisfactionScore).length || 0,
    avgResponseTime: employees.reduce((sum, e) => sum + e.stats.avgResponseTime, 0) / employees.length || 0
  }), [contacts, messages, botRequests, employees, issues]);

  // الموظف الحالي
  const currentEmployee = useMemo(() => 
    employees.find(e => e.id === currentEmployeeId), 
    [employees, currentEmployeeId]
  );

  // فلترة جهات الاتصال حسب الصلاحيات والقسم
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // فلترة البحث
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           contact.phone.includes(searchTerm);
      if (!matchesSearch) return false;

      // إذا كان مدير (يرى الكل)
      if (currentEmployee?.role === 'admin' || currentEmployee?.canAccessAllDepartments) {
        // فلترة حسب القسم المختار
        if (selectedDepartment === 'all') return true;
        return contact.assignedDepartment === selectedDepartment;
      }

      // موظف عادي: يرى محادثاته فقط + المشاركة معه
      const isAssignedToMe = contact.assignedEmployeeId === currentEmployeeId;
      const isSharedWithMe = contact.sharedWith?.includes(currentEmployeeId);
      const isInMyDepartment = contact.assignedDepartment === currentEmployee?.department;

      return (isAssignedToMe || isSharedWithMe) && 
             (selectedDepartment === 'all' || contact.assignedDepartment === selectedDepartment);
    });
  }, [contacts, searchTerm, currentEmployee, selectedDepartment, currentEmployeeId]);

  const selectedContact = selectedContactId ? contacts.find((c) => c.id === selectedContactId) : null;
  const contactMessages = selectedContactId ? messages.filter((m) => m.contactId === selectedContactId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : [];

  const handleAddContact = () => {
    setShowAddContactDialog(true);
  };

  const handleSaveNewContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      alert('الرجاء إدخال الاسم ورقم الهاتف على الأقل');
      return;
    }

    const contactToAdd: WhatsAppContact = {
      id: uid(),
      name: newContact.name,
      phone: newContact.phone,
      status: 'active',
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      messageCount: 0,
      notes: newContact.notes,
      createdAt: new Date().toISOString(),
      tags: [newContact.customerType],
      priority: newContact.priority,
      customerStage: newContact.stage,
      satisfactionScore: undefined,
      assignedEmployeeId: currentEmployeeId,
      assignedDepartment: currentEmployee?.department || 'sales',
      sharedWith: []
    };
    
    setContacts((prev) => [...prev, contactToAdd]);
    setShowAddContactDialog(false);
    
    // إعادة تعيين النموذج
    setNewContact({
      name: '',
      phone: '',
      email: '',
      company: '',
      customerType: 'عادي',
      stage: 'trial',
      notes: '',
      priority: 'medium'
    });
    
    // اختيار جهة الاتصال الجديدة
    setSelectedContactId(contactToAdd.id);
  };

  const handleSendMessage = () => {
    if (!selectedContact || !messageText.trim()) return;

    const newMessage: WhatsAppMessage = {
      id: uid(),
      contactId: selectedContact.id,
      message: messageText,
      status: 'sent',
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
      isBot: false,
      employeeId: currentEmployeeId,
      employeeName: currentEmployee?.name,
      department: currentEmployee?.department
    };

    setMessages((prev) => [...prev, newMessage]);
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? { ...c, lastMessage: messageText, lastMessageTime: new Date().toISOString(), messageCount: c.messageCount + 1 }
          : c
      )
    );
    setMessageText('');
  };

  // إرسال رد سريع
  const handleQuickReply = (reply: QuickReply) => {
    setMessageText(reply.message);
    setShowQuickReplies(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageText((prev) => prev + emoji);
  };

  const handleAttachment = (type: string) => {
    // محاكاة إرفاق ملف
    const attachmentTypes: Record<string, string> = {
      image: '🖼️ صورة',
      video: '🎥 فيديو',
      document: '📄 مستند',
      location: '📍 موقع',
      contact: '👤 جهة اتصال',
      file: '📎 ملف'
    };
    
    const attachmentMessage = `تم إرفاق: ${attachmentTypes[type] || 'ملف'}`;
    setMessageText((prev) => prev + ' ' + attachmentMessage);
    setShowAttachmentMenu(false);
  };

  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');

  const handleStartCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setCallStatus('ringing');
    setShowCallDialog(true);
    setCallDuration(0);
    
    // محاكاة الرنين ثم الاتصال
    setTimeout(() => {
      setCallStatus('connected');
      // بدء العداد
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      // حفظ المؤقت للتنظيف
      (window as any).callTimer = timer;
    }, 3000);
  };

  const handleEndCall = () => {
    if ((window as any).callTimer) {
      clearInterval((window as any).callTimer);
      (window as any).callTimer = null;
    }
    setCallStatus('ended');
    setTimeout(() => {
      setShowCallDialog(false);
      setCallDuration(0);
    }, 1500);
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // التسجيل الصوتي
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    // بدء العداد
    const timer = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    
    (window as any).recordingTimer = timer;
  };

  const handleStopRecording = () => {
    if ((window as any).recordingTimer) {
      clearInterval((window as any).recordingTimer);
      (window as any).recordingTimer = null;
    }
    
    if (!selectedContact) return;
    
    const duration = formatCallDuration(recordingDuration);
    const voiceMessage: WhatsAppMessage = {
      id: uid(),
      contactId: selectedContact.id,
      message: `🎤 رسالة صوتية ${duration}`,
      status: 'sent',
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
      employeeId: currentEmployeeId,
      employeeName: currentEmployee?.name,
      department: currentEmployee?.department
    };

    setMessages((prev) => [...prev, voiceMessage]);
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? { ...c, lastMessage: `🎤 رسالة صوتية ${duration}`, lastMessageTime: new Date().toISOString(), messageCount: c.messageCount + 1 }
          : c
      )
    );
    
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const handleCancelRecording = () => {
    if ((window as any).recordingTimer) {
      clearInterval((window as any).recordingTimer);
      (window as any).recordingTimer = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
  };

  // إرفاق ملف حقيقي
  const handleAttachFile = async (type: string) => {
    if (!selectedContact) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    
    // تحديد أنواع الملفات حسب النوع
    switch(type) {
      case 'image':
        input.accept = 'image/*';
        break;
      case 'video':
        input.accept = 'video/*';
        break;
      case 'document':
        input.accept = '.pdf,.doc,.docx,.txt';
        break;
      case 'file':
        input.accept = '*/*';
        break;
    }
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const attachmentTypes: Record<string, string> = {
        image: '🖼️',
        video: '🎥',
        document: '📄',
        file: '📎'
      };
      
      const icon = attachmentTypes[type] || '📎';
      const fileMessage: WhatsAppMessage = {
        id: uid(),
        contactId: selectedContact.id,
        message: `${icon} ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        status: 'sent',
        timestamp: new Date().toISOString(),
        direction: 'outgoing',
        employeeId: currentEmployeeId,
        employeeName: currentEmployee?.name,
        department: currentEmployee?.department,
        attachments: [{
          type: file.type,
          url: URL.createObjectURL(file),
          name: file.name
        }]
      };

      setMessages((prev) => [...prev, fileMessage]);
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContact.id
            ? { ...c, lastMessage: `${icon} ${file.name}`, lastMessageTime: new Date().toISOString(), messageCount: c.messageCount + 1 }
            : c
        )
      );
      
      setShowAttachmentMenu(false);
    };
    
    input.click();
  };

  // مشاركة الموقع
  const handleShareLocation = () => {
    if (!selectedContact) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const locationMessage: WhatsAppMessage = {
          id: uid(),
          contactId: selectedContact.id,
          message: `📍 الموقع الجغرافي\nخط العرض: ${position.coords.latitude.toFixed(6)}\nخط الطول: ${position.coords.longitude.toFixed(6)}`,
          status: 'sent',
          timestamp: new Date().toISOString(),
          direction: 'outgoing',
          employeeId: currentEmployeeId,
          employeeName: currentEmployee?.name,
          department: currentEmployee?.department
        };

        setMessages((prev) => [...prev, locationMessage]);
        setContacts((prev) =>
          prev.map((c) =>
            c.id === selectedContact.id
              ? { ...c, lastMessage: '📍 موقع جغرافي', lastMessageTime: new Date().toISOString(), messageCount: c.messageCount + 1 }
              : c
          )
        );
      });
    } else {
      alert('المتصفح لا يدعم خدمة تحديد الموقع');
    }
    
    setShowAttachmentMenu(false);
  };

  // مشاركة جهة اتصال كبطاقة
  const handleShareContactCard = () => {
    if (!selectedContact) return;
    
    const contactMessage: WhatsAppMessage = {
      id: uid(),
      contactId: selectedContact.id,
      message: `👤 بطاقة جهة اتصال\nالاسم: ${currentEmployee?.name}\nالهاتف: ${currentEmployee?.phone}\nالبريد: ${currentEmployee?.email}`,
      status: 'sent',
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
      employeeId: currentEmployeeId,
      employeeName: currentEmployee?.name,
      department: currentEmployee?.department
    };

    setMessages((prev) => [...prev, contactMessage]);
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? { ...c, lastMessage: '👤 بطاقة جهة اتصال', lastMessageTime: new Date().toISOString(), messageCount: c.messageCount + 1 }
          : c
      )
    );
    
    setShowAttachmentMenu(false);
  };

  // إرسال رسالة جماعية
  const handleBroadcastMessage = () => {
    if (!broadcastMessage.trim() || selectedContactsForBroadcast.length === 0) {
      alert('الرجاء اختيار جهات اتصال وكتابة الرسالة');
      return;
    }

    selectedContactsForBroadcast.forEach(contactId => {
      const newMessage: WhatsAppMessage = {
        id: uid(),
        contactId,
        message: `📢 رسالة جماعية:\n${broadcastMessage}`,
        status: 'sent',
        timestamp: new Date().toISOString(),
        direction: 'outgoing',
        isBot: false,
        employeeId: currentEmployeeId,
        employeeName: currentEmployee?.name,
        department: currentEmployee?.department
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    setContacts((prev) =>
      prev.map((c) =>
        selectedContactsForBroadcast.includes(c.id)
          ? { ...c, lastMessage: broadcastMessage, lastMessageTime: new Date().toISOString(), messageCount: c.messageCount + 1 }
          : c
      )
    );

    setBroadcastMessage('');
    setSelectedContactsForBroadcast([]);
    setShowBroadcastDialog(false);
    alert(`تم إرسال الرسالة إلى ${selectedContactsForBroadcast.length} عميل`);
  };

  // مشاركة محادثة مع موظف
  const handleShareContact = (employeeId: string) => {
    if (!selectedContact) return;
    
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? { ...c, sharedWith: [...(c.sharedWith || []), employeeId] }
          : c
      )
    );
    
    const sharedEmployee = employees.find(e => e.id === employeeId);
    alert(`تم مشاركة المحادثة مع ${sharedEmployee?.name}`);
    setShowShareContactDialog(false);
  };

  const handleBotMode = (type: RequestType) => {
    setBotRequestType(type);
    setBotStep(0);
    setBotMode(true);
  };

  const handleBotResponse = () => {
    if (!selectedContact) return;
    const conversations = BOT_CONVERSATIONS[botRequestType];
    if (botStep < conversations.length) {
      const botMessage: WhatsAppMessage = {
        id: uid(),
        contactId: selectedContact.id,
        message: conversations[botStep],
        status: 'delivered',
        timestamp: new Date().toISOString(),
        direction: 'incoming',
        isBot: true
      };
      setMessages((prev) => [...prev, botMessage]);
      setBotStep((prev) => prev + 1);

      if (botStep === conversations.length - 1) {
        setTimeout(() => {
          const newRequest: BotRequest = {
            id: uid(),
            contactId: selectedContact.id,
            contactName: selectedContact.name,
            contactPhone: selectedContact.phone,
            type: botRequestType,
            details: {},
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          setBotRequests((prev) => [...prev, newRequest]);
          setBotMode(false);
        }, 500);
      }
    }
  };

  const handleCloseBotMode = () => {
    setBotMode(false);
    setBotStep(0);
  };

  // دالة الذكاء الاصطناعي للردود التلقائية
  const generateAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    // كشف نوع الاستفسار
    if (lowerMsg.includes('حجز') || lowerMsg.includes('غرفة') || lowerMsg.includes('حجوزات')) {
      return '🏨 يسعدني مساعدتك في الحجز! لدينا غرف متاحة بأنواع مختلفة. ما هو نوع الغرفة المفضل لديك؟ (ستاندرد، ديلوكس، سويت)';
    }
    
    if (lowerMsg.includes('سعر') || lowerMsg.includes('كم') || lowerMsg.includes('تكلفة')) {
      return '💰 أسعارنا تبدأ من:\n• غرفة ستاندرد: 500 ريال\n• غرفة ديلوكس: 750 ريال\n• سويت: 1200 ريال\n\nهل تريد معرفة التفاصيل عن أي نوع معين؟';
    }
    
    if (lowerMsg.includes('تنظيف') || lowerMsg.includes('نظافة') || lowerMsg.includes('ترتيب')) {
      return '🧹 سيتم إرسال فريق التنظيف فوراً! ما رقم غرفتك من فضلك؟';
    }
    
    if (lowerMsg.includes('شكوى') || lowerMsg.includes('مشكلة') || lowerMsg.includes('عطل')) {
      return '😔 نأسف لحدوث ذلك! سنعمل على حل المشكلة فوراً. يرجى تفصيل المشكلة لنتمكن من مساعدتك بشكل أفضل.';
    }
    
    if (lowerMsg.includes('كوفي') || lowerMsg.includes('قهوة') || lowerMsg.includes('طعام')) {
      return '☕ مرحباً بك في الكوفي شوب! قائمتنا تشمل:\n• قهوة عربية\n• قهوة إسبريسو\n• كابتشينو\n• وجبات خفيفة\n\nماذا تود أن تطلب؟';
    }
    
    if (lowerMsg.includes('واي فاي') || lowerMsg.includes('wifi') || lowerMsg.includes('انترنت')) {
      return '📶 كلمة مرور الواي فاي:\nاسم الشبكة: SmartHost_Guest\nكلمة المرور: Welcome2024\n\nإذا واجهت أي مشكلة في الاتصال، يرجى إخبارنا!';
    }
    
    if (lowerMsg.includes('شكرا') || lowerMsg.includes('تسلم') || lowerMsg.includes('ممتاز')) {
      return '🙏 العفو! نحن سعداء بخدمتك دائماً. لا تتردد في التواصل معنا في أي وقت!';
    }
    
    // رد عام
    return '👋 أهلاً بك! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟\n\n🔹 حجز غرفة\n🔹 الأسعار والعروض\n🔹 خدمة الغرف\n🔹 الكوفي شوب\n🔹 شكاوى واستفسارات';
  };

  // إرسال رسالة AI
  const handleAIResponse = () => {
    if (!selectedContact) return;
    
    const lastMessage = contactMessages[contactMessages.length - 1];
    if (!lastMessage || lastMessage.direction === 'outgoing') return;
    
    const aiResponse = generateAIResponse(lastMessage.message);
    
    const aiMessage: WhatsAppMessage = {
      id: uid(),
      contactId: selectedContact.id,
      message: aiResponse,
      status: 'sent',
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
      isBot: false,
      aiGenerated: true,
      employeeId: 'ai_bot',
      employeeName: 'المساعد الذكي'
    };
    
    setMessages((prev) => [...prev, aiMessage]);
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? { ...c, lastMessage: aiResponse, lastMessageTime: new Date().toISOString(), messageCount: c.messageCount + 1 }
          : c
      )
    );
  };

  // إنشاء مشكلة جديدة
  const handleCreateIssue = () => {
    if (!newIssue.title || !newIssue.description || !selectedContact) return;
    
    const issue: Issue = {
      id: uid(),
      contactId: selectedContact.id,
      title: newIssue.title,
      description: newIssue.description,
      status: 'open',
      priority: newIssue.priority,
      category: newIssue.category,
      assignedEmployeeId: selectedEmployeeId || undefined,
      createdAt: new Date().toISOString(),
      solutionSteps: [],
      relatedChatIds: [selectedContactId || ''],
      frequency: 1
    };
    
    setIssues((prev) => [...prev, issue]);
    setShowIssueDialog(false);
    setNewIssue({ title: '', description: '', category: '', priority: 'medium' });
  };

  // تحديث حالة الموظف
  const handleEmployeeStatusChange = (employeeId: string, newStatus: EmployeeStatus) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? { ...e, status: newStatus, lastActive: new Date().toISOString() }
          : e
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-2 sm:p-6" dir="rtl">
      <div className="mx-auto max-w-[1800px] space-y-4">
        {/* الهيدر المحسّن */}
        <header className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-md border border-purple-700/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => router.back()} 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <MessageSquare className="h-10 w-10 text-green-400" />
                    <Sparkles className="h-5 w-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      نظام CRM المتقدم
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400">إدارة ذكية للعملاء والدعم الفني مع AI</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleAddContact} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" /> عميل جديد
              </Button>
              <Button onClick={() => setShowIssueDialog(true)} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg">
                <AlertCircle className="h-4 w-4 mr-2" /> إبلاغ عن مشكلة
              </Button>
            </div>
          </div>
        </header>

        {/* الإحصائيات المتقدمة */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <Card 
            onClick={() => router.push('/crm/customers')}
            className="border-green-600 bg-gradient-to-r from-green-600/80 to-emerald-600/70 hover:from-green-600/90 hover:to-emerald-600/80 transition-all shadow-lg hover:shadow-xl cursor-pointer hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <Users className="h-4 w-4" /> العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.totalContacts}</p>
              <p className="text-xs font-semibold text-green-100">نشط: {stats.activeContacts}</p>
            </CardContent>
          </Card>
          
          <Card 
            onClick={() => setActiveTab('messages')}
            className="border-blue-600 bg-gradient-to-r from-blue-600/80 to-cyan-600/70 hover:from-blue-600/90 hover:to-cyan-600/80 transition-all shadow-lg hover:shadow-xl cursor-pointer hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <MessageSquare className="h-4 w-4" /> الرسائل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.totalMessages}</p>
              <p className="text-xs font-semibold text-blue-100">اليوم</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveTab('employees')}
            className="border-purple-600 bg-gradient-to-r from-purple-600/80 to-pink-600/70 hover:from-purple-600/90 hover:to-pink-600/80 transition-all shadow-lg hover:shadow-xl cursor-pointer hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <Briefcase className="h-4 w-4" /> الموظفين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.totalEmployees}</p>
              <p className="text-xs font-semibold text-purple-100">متاح: {stats.availableEmployees}</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveTab('issues')}
            className="border-amber-600 bg-gradient-to-r from-amber-600/80 to-orange-600/70 hover:from-amber-600/90 hover:to-orange-600/80 transition-all shadow-lg hover:shadow-xl cursor-pointer hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> المشاكل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.totalIssues}</p>
              <p className="text-xs font-semibold text-amber-100">مفتوح: {stats.openIssues}</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveTab('requests')}
            className="border-red-600 bg-gradient-to-r from-red-600/80 to-pink-600/70 hover:from-red-600/90 hover:to-pink-600/80 transition-all shadow-lg hover:shadow-xl cursor-pointer hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <ClipboardList className="h-4 w-4" /> الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.botRequests}</p>
              <p className="text-xs font-semibold text-red-100">انتظار: {stats.pendingRequests}</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveTab('analytics')}
            className="border-yellow-600 bg-gradient-to-r from-yellow-600/80 to-amber-600/70 hover:from-yellow-600/90 hover:to-amber-600/80 transition-all shadow-lg hover:shadow-xl cursor-pointer hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <Star className="h-4 w-4" /> التقييم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.avgSatisfaction.toFixed(1)}</p>
              <p className="text-xs font-semibold text-yellow-100">من 5.0</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveTab('analytics')}
            className="border-teal-600 bg-gradient-to-r from-teal-600/80 to-cyan-600/70 hover:from-teal-600/90 hover:to-cyan-600/80 transition-all shadow-lg hover:shadow-xl cursor-pointer hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <Clock className="h-4 w-4" /> وقت الرد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">{stats.avgResponseTime.toFixed(1)}</p>
              <p className="text-xs font-semibold text-teal-100">دقيقة</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveTab('analytics')}
            className="border-indigo-600 bg-gradient-to-r from-indigo-600/80 to-blue-600/70 hover:from-indigo-600/90 hover:to-blue-600/80 transition-all shadow-lg hover:shadow-xl cursor-pointer hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-1">
                <Activity className="h-4 w-4" /> النشاط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-white">98%</p>
              <p className="text-xs font-semibold text-indigo-100">معدل الحل</p>
            </CardContent>
          </Card>
        </div>

        {/* التابات المحسّنة */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-purple-800/30">
          <Button 
            variant={activeTab === 'messages' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('messages')} 
            className={activeTab === 'messages' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}
          >
            <MessageSquare className="h-4 w-4 mr-2" /> المحادثات
          </Button>
          <Button 
            variant={activeTab === 'employees' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('employees')} 
            className={activeTab === 'employees' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}
          >
            <Users className="h-4 w-4 mr-2" /> الموظفين
          </Button>
          <Button 
            variant={activeTab === 'analytics' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('analytics')} 
            className={activeTab === 'analytics' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}
          >
            <BarChart3 className="h-4 w-4 mr-2" /> التقارير
          </Button>
          <Button 
            variant={activeTab === 'issues' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('issues')} 
            className={activeTab === 'issues' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}
          >
            <AlertCircle className="h-4 w-4 mr-2" /> المشاكل
          </Button>
          <Button 
            variant={activeTab === 'requests' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('requests')} 
            className={activeTab === 'requests' ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}
          >
            <ClipboardList className="h-4 w-4 mr-2" /> طلبات البوت
          </Button>
        </div>

        {/* محتوى الصفحات */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Card className="border-0 bg-[#111b21] shadow-none overflow-hidden">
                <CardHeader className="bg-[#202c33] border-b border-[#2a3942] py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base font-normal">الدردشات</CardTitle>
                    <Button
                      onClick={() => setShowBroadcastDialog(true)}
                      size="sm"
                      variant="ghost"
                      className="text-[#8696a0] hover:text-white hover:bg-[#2a3942] h-8 w-8 p-0 rounded-full"
                      title="رسالة جماعية"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* شريط فلترة الأقسام (للمدير فقط) */}
                  {(currentEmployee?.role === 'admin' || currentEmployee?.canAccessAllDepartments) && (
                    <div className="px-4 py-2 bg-[#202c33] border-b border-[#2a3942]">
                      <Select value={selectedDepartment} onValueChange={(value: Department) => setSelectedDepartment(value)}>
                        <SelectTrigger className="bg-[#111b21] border-[#2a3942] text-white h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#202c33] border-[#2a3942]">
                          <SelectItem value="all" className="text-white">🌐 جميع الأقسام</SelectItem>
                          {DEPARTMENTS.map(dept => (
                            <SelectItem key={dept.id} value={dept.id} className="text-white">
                              {dept.icon} {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* شريط معلومات الموظف الحالي */}
                  <div className="bg-[#202c33] px-4 py-3 border-b border-[#2a3942]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center text-sm font-semibold text-white">
                        {currentEmployee?.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-normal text-white">{currentEmployee?.name}</p>
                        <p className="text-sm font-normal text-white">{currentEmployee?.name}</p>
                        <p className="text-xs text-[#8696a0]">
                          {currentEmployee?.role === 'admin' ? '👑 مدير' : 
                           DEPARTMENTS.find(d => d.id === currentEmployee?.department)?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* شريط البحث */}
                  <div className="px-3 py-2 bg-[#202c33]">
                    <Input 
                      placeholder="ابحث أو ابدأ محادثة جديدة" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="h-9 text-sm border-0 bg-[#2a3942] text-white placeholder:text-[#8696a0] rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0" 
                    />
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {filteredContacts.length === 0 ? (
                      <p className="text-[#8696a0] text-center py-8 text-sm">لا توجد جهات اتصال</p>
                    ) : (
                      filteredContacts.map((contact) => {
                        // حساب الرسائل غير المقروءة
                        const unreadCount = messages.filter(m => 
                          m.contactId === contact.id && 
                          m.direction === 'incoming' && 
                          m.status !== 'read'
                        ).length;
                        
                        return (
                          <div 
                            key={contact.id} 
                            onClick={() => setSelectedContactId(contact.id)} 
                            className={`px-4 py-3 cursor-pointer transition-all border-b border-[#2a3942] ${
                              selectedContactId === contact.id 
                                ? 'bg-[#2a3942]' 
                                : 'hover:bg-[#202c33]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* الصورة الدائرية */}
                              <div className="relative flex-shrink-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                  contact.tags.includes('VIP') ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                                  contact.tags.includes('مشاغب') ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                                  'bg-[#6b7c85]'
                                }`}>
                                  {contact.tags.includes('VIP') ? '⭐' :
                                   contact.tags.includes('مشاغب') ? '⚠️' :
                                   <span className="text-white">{contact.name.charAt(0)}</span>}
                                </div>
                                {/* مؤشر الحالة */}
                                {contact.status === 'active' && (
                                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111b21]"></div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                {/* الاسم والوقت */}
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <p className="text-[15px] font-normal text-white truncate">{contact.name}</p>
                                    {/* Badge VIP */}
                                    {contact.tags.includes('VIP') && (
                                      <span className="text-xs">⭐</span>
                                    )}
                                  </div>
                                  {contact.lastMessageTime && (
                                    <span className={`text-xs flex-shrink-0 ${
                                      unreadCount > 0 ? 'text-[#00a884]' : 'text-[#8696a0]'
                                    }`}>
                                      {new Date(contact.lastMessageTime).toLocaleTimeString('ar-EG', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  )}
                                </div>
                                
                                {/* آخر رسالة وعداد غير مقروء */}
                                <div className="flex items-center justify-between gap-2">
                                  {contact.lastMessage && (
                                    <p className="text-[13px] text-[#8696a0] truncate flex-1">{contact.lastMessage}</p>
                                  )}
                                  
                                  {/* عداد الرسائل غير المقروءة */}
                                  {unreadCount > 0 && (
                                    <div className="flex-shrink-0 bg-[#00a884] text-[#111b21] text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                      {unreadCount}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {selectedContact ? (
                <Card className="border-0 bg-[#0b141a] h-[700px] flex flex-col shadow-none">
                  {/* Header بتصميم WhatsApp */}
                  <CardHeader className="border-b border-[#2a3942] bg-[#202c33] py-2 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* صورة جهة الاتصال */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold shadow-sm flex-shrink-0 ${
                          selectedContact.tags.includes('VIP') ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                          selectedContact.tags.includes('مشاغب') ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                          'bg-[#6b7c85]'
                        }`}>
                          {selectedContact.tags.includes('VIP') ? '⭐' :
                           selectedContact.tags.includes('مشاغب') ? '⚠️' :
                           <span className="text-white">{selectedContact.name.charAt(0)}</span>}
                        </div>
                        
                        <div>
                          <CardTitle className="text-white text-base font-normal">{selectedContact.name}</CardTitle>
                          <CardDescription className="text-[#8696a0] text-xs">
                            {selectedContact.status === 'active' ? 'متصل الآن' : `آخر ظهور ${new Date(selectedContact.lastMessageTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`}
                          </CardDescription>
                        </div>
                      </div>
                      
                      {/* أزرار Header */}
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowShareContactDialog(true)}
                          className="text-[#8696a0] hover:text-white hover:bg-[#2a3942] rounded-full w-10 h-10 p-0"
                          title="مشاركة المحادثة"
                        >
                          <Users className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStartCall('video')}
                          className="text-[#8696a0] hover:text-white hover:bg-[#2a3942] rounded-full w-10 h-10 p-0"
                          title="مكالمة فيديو"
                        >
                          <Video className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStartCall('voice')}
                          className="text-[#8696a0] hover:text-white hover:bg-[#2a3942] rounded-full w-10 h-10 p-0"
                          title="مكالمة صوتية"
                        >
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[#8696a0] hover:text-white hover:bg-[#2a3942] rounded-full w-10 h-10 p-0"
                          title="بحث"
                        >
                          <Search className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[#8696a0] hover:text-white hover:bg-[#2a3942] rounded-full w-10 h-10 p-0"
                          title="المزيد"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {/* منطقة المحادثة مع خلفية WhatsApp */}
                  <CardContent className="flex-1 overflow-y-auto p-4 bg-[#0b141a] relative space-y-3" 
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '60px 60px'
                    }}
                  >
                    {/* شعار التطبيق في الخلفية */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                      <div className="text-center">
                        <MessageSquare className="h-64 w-64 text-white mx-auto mb-4" />
                        <p className="text-white text-4xl font-bold">Al-Modif CRM</p>
                      </div>
                    </div>
                    
                    <div className="relative z-10">{contactMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-24 h-24 bg-[#202c33] rounded-full flex items-center justify-center mb-4">
                          <MessageSquare className="h-12 w-12 text-[#8696a0]" />
                        </div>
                        <p className="text-[#8696a0] text-lg font-semibold">لا توجد رسائل بعد</p>
                        <p className="text-[#667781] text-sm mt-2">ابدأ المحادثة بإرسال رسالة</p>
                      </div>
                    ) : (
                      <>
                        {/* تجميع الرسائل حسب التاريخ */}
                        {contactMessages.map((msg, index) => {
                          const currentDate = new Date(msg.timestamp).toLocaleDateString('ar-EG');
                          const prevDate = index > 0 ? new Date(contactMessages[index - 1].timestamp).toLocaleDateString('ar-EG') : null;
                          const showDateSeparator = currentDate !== prevDate;
                          
                          return (
                            <div key={msg.id}>
                              {/* فاصل التاريخ */}
                              {showDateSeparator && (
                                <div className="flex justify-center my-4">
                                  <div className="bg-[#202c33] px-3 py-1 rounded-md shadow-sm">
                                    <span className="text-[#8696a0] text-xs font-medium">
                                      {new Date(msg.timestamp).toLocaleDateString('ar-EG', { 
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {/* فقاعة الرسالة */}
                              <div className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[65%] rounded-lg shadow-md ${
                                  msg.direction === 'outgoing' 
                                    ? 'bg-[#005c4b] text-white' 
                                    : msg.isBot
                                    ? 'bg-[#056162] text-white'
                                    : 'bg-[#202c33] text-white'
                                }`}>
                                  {/* محتوى الرسالة */}
                                  <div className="px-3 pt-2 pb-1">
                                    <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                                    
                                    {/* الوقت وحالة التسليم */}
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                      <span className="text-[10px] text-[#8696a0]">
                                        {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </span>
                                      
                                      {/* علامات التسليم للرسائل الصادرة */}
                                      {msg.direction === 'outgoing' && (
                                        <span className="text-[#53bdeb]">
                                          {msg.status === 'read' ? (
                                            <CheckCheck className="h-4 w-4" />
                                          ) : msg.status === 'delivered' ? (
                                            <CheckCheck className="h-4 w-4 text-[#8696a0]" />
                                          ) : (
                                            <Check className="h-4 w-4 text-[#8696a0]" />
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                    </div>
                  </CardContent>
                  
                  {/* شريط الإرسال بتصميم WhatsApp */}
                  <div className="border-t border-slate-700 bg-[#202c33] p-2">
                    {botMode ? (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-blue-200 mb-2">
                          البوت: {REQUEST_TYPES.find((t) => t.value === botRequestType)?.label} ({botStep}/{BOT_CONVERSATIONS[botRequestType].length})
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleBotResponse} 
                            size="sm" 
                            className="flex-1 bg-[#005c4b] hover:bg-[#004a3d] text-white"
                          >
                            الرد التالي
                          </Button>
                          <Button 
                            onClick={handleCloseBotMode} 
                            size="sm" 
                            variant="outline" 
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* صف الردود السريعة */}
                        {showQuickReplies && (
                          <div className="bg-[#2a3942] rounded-lg p-3 max-h-64 overflow-y-auto">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-white flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-400" />
                                الردود السريعة
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowQuickReplies(false)}
                                className="text-[#8696a0] hover:text-white h-6 w-6 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {QUICK_REPLIES.map(reply => (
                                <button
                                  key={reply.id}
                                  onClick={() => handleQuickReply(reply)}
                                  className="text-left p-2 bg-[#202c33] hover:bg-[#374045] rounded-lg transition-all"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">{reply.icon}</span>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-white">{reply.title}</p>
                                      <p className="text-xs text-[#8696a0] line-clamp-2">{reply.message}</p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* قائمة الإيموجي */}
                        {showEmojiPicker && (
                          <div className="bg-[#2a3942] rounded-lg p-3 max-h-80 overflow-y-auto">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-white flex items-center gap-2">
                                <Smile className="h-4 w-4 text-yellow-400" />
                                الإيموجي
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowEmojiPicker(false)}
                                className="text-[#8696a0] hover:text-white h-6 w-6 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {EMOJI_LIST.map((category) => (
                                <div key={category.category}>
                                  <p className="text-xs font-semibold text-[#8696a0] mb-2">{category.category}</p>
                                  <div className="grid grid-cols-10 gap-1">
                                    {category.emojis.map((emoji, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="text-2xl hover:bg-[#374045] rounded p-1 transition-all"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* قائمة المرفقات */}
                        {showAttachmentMenu && (
                          <div className="bg-[#2a3942] rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-white">إرفاق</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAttachmentMenu(false)}
                                className="text-[#8696a0] hover:text-white h-6 w-6 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => handleAttachFile('image')}
                                className="flex flex-col items-center gap-2 p-3 bg-[#202c33] hover:bg-[#374045] rounded-lg transition-all"
                              >
                                <div className="text-3xl">🖼️</div>
                                <span className="text-xs text-white">صورة</span>
                              </button>
                              <button
                                onClick={() => handleAttachFile('video')}
                                className="flex flex-col items-center gap-2 p-3 bg-[#202c33] hover:bg-[#374045] rounded-lg transition-all"
                              >
                                <div className="text-3xl">🎥</div>
                                <span className="text-xs text-white">فيديو</span>
                              </button>
                              <button
                                onClick={() => handleAttachFile('document')}
                                className="flex flex-col items-center gap-2 p-3 bg-[#202c33] hover:bg-[#374045] rounded-lg transition-all"
                              >
                                <div className="text-3xl">📄</div>
                                <span className="text-xs text-white">مستند</span>
                              </button>
                              <button
                                onClick={() => handleAttachFile('file')}
                                className="flex flex-col items-center gap-2 p-3 bg-[#202c33] hover:bg-[#374045] rounded-lg transition-all"
                              >
                                <div className="text-3xl">📎</div>
                                <span className="text-xs text-white">ملف</span>
                              </button>
                              <button
                                onClick={handleShareLocation}
                                className="flex flex-col items-center gap-2 p-3 bg-[#202c33] hover:bg-[#374045] rounded-lg transition-all"
                              >
                                <div className="text-3xl">📍</div>
                                <span className="text-xs text-white">موقع</span>
                              </button>
                              <button
                                onClick={handleShareContactCard}
                                className="flex flex-col items-center gap-2 p-3 bg-[#202c33] hover:bg-[#374045] rounded-lg transition-all"
                              >
                                <div className="text-3xl">👤</div>
                                <span className="text-xs text-white">جهة اتصال</span>
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {/* زر الردود السريعة */}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowQuickReplies(!showQuickReplies)}
                            className={`${showQuickReplies ? 'text-yellow-400' : 'text-[#8696a0]'} hover:text-white hover:bg-[#2a3942] rounded-full w-10 h-10 p-0`}
                            title="ردود سريعة"
                          >
                            <Zap className="h-5 w-5" />
                          </Button>
                          
                          {/* زر الإيموجي */}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`${showEmojiPicker ? 'text-yellow-400' : 'text-[#8696a0]'} hover:text-white hover:bg-[#2a3942] rounded-full w-10 h-10 p-0`}
                            title="إيموجي"
                          >
                            <Smile className="h-5 w-5" />
                          </Button>
                          
                          {/* زر المرفقات */}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                            className={`${showAttachmentMenu ? 'text-yellow-400' : 'text-[#8696a0]'} hover:text-white hover:bg-[#2a3942] rounded-full w-10 h-10 p-0`}
                            title="إرفاق ملف"
                          >
                            <Paperclip className="h-5 w-5" />
                          </Button>
                          
                          {/* حقل النص */}
                          <div className="flex-1">
                            <Input 
                              value={messageText} 
                              onChange={(e) => setMessageText(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              placeholder="اكتب رسالة" 
                              className="bg-[#2a3942] border-0 text-white placeholder:text-[#8696a0] h-10 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0" 
                            />
                          </div>
                          
                          {/* زر الإرسال أو التسجيل الصوتي */}
                          {isRecording ? (
                            <div className="flex items-center gap-2 bg-[#2a3942] rounded-full px-4 py-2">
                              <Button
                                onClick={handleCancelRecording}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 h-8 w-8 p-0 rounded-full"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-white text-sm font-mono">{formatCallDuration(recordingDuration)}</span>
                              </div>
                              <Button
                                onClick={handleStopRecording}
                                size="sm"
                                className="bg-[#00a884] hover:bg-[#06cf9c] text-white rounded-full h-8 w-8 p-0"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : messageText.trim() ? (
                            <Button 
                              onClick={handleSendMessage}
                              size="sm"
                              className="bg-[#00a884] hover:bg-[#06cf9c] text-white rounded-full w-10 h-10 p-0 shadow-lg"
                            >
                              <Send className="h-5 w-5" />
                            </Button>
                          ) : (
                            <Button 
                              onMouseDown={handleStartRecording}
                              variant="ghost" 
                              size="sm"
                              className="text-[#8696a0] hover:text-white hover:bg-[#2a3942] rounded-full w-10 h-10 p-0"
                              title="اضغط مع الاستمرار للتسجيل"
                            >
                              <Mic className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="border-0 bg-[#222e35] h-[700px] flex items-center justify-center shadow-none">
                  <div className="text-center">
                    <div className="relative mb-8">
                      <div className="w-64 h-64 mx-auto rounded-full bg-[#2a3942] flex items-center justify-center">
                        <MessageSquare className="h-32 w-32 text-[#8696a0]" />
                      </div>
                      <div className="absolute top-0 right-1/2 transform translate-x-1/2 bg-[#00a884] rounded-full p-3">
                        <MessageSquare className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-white text-2xl font-light mb-2">WhatsApp CRM</h3>
                    <p className="text-[#8696a0] text-base">أرسل واستقبل الرسائل بدون الحاجة لإبقاء هاتفك متصلاً</p>
                    <p className="text-[#8696a0] text-sm mt-6">اختر محادثة من القائمة لبدء المحادثة</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* 👥 صفحة الموظفين */}
        {activeTab === 'employees' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <Card key={emp.id} className="border-purple-600 bg-gradient-to-r from-purple-600/80 to-indigo-600/70 hover:from-purple-600/90 hover:to-indigo-600/80 transition-all shadow-xl hover:shadow-2xl">
                <CardHeader className="border-b border-purple-300/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-5xl">{emp.avatar}</div>
                      <div>
                        <CardTitle className="text-white text-lg font-bold">{emp.name}</CardTitle>
                        <CardDescription className="text-purple-100 text-xs font-semibold">{emp.email}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${
                      emp.status === 'available' ? 'bg-green-600 text-white' :
                      emp.status === 'busy' ? 'bg-yellow-600 text-white' :
                      emp.status === 'on-break' ? 'bg-blue-600 text-white' :
                      'bg-slate-600 text-white'
                    } font-bold shadow-lg`}>
                      {emp.status === 'available' ? '🟢 متاح' :
                       emp.status === 'busy' ? '🟡 مشغول' :
                       emp.status === 'on-break' ? '🔵 استراحة' : '⚫ غير متصل'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {/* الإحصائيات */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-r from-green-600/85 to-emerald-600/75 p-3 rounded-lg shadow-lg">
                      <p className="text-xs font-bold text-white">المحادثات</p>
                      <p className="text-3xl font-extrabold text-white">{emp.stats.totalChats}</p>
                      <p className="text-xs font-semibold text-green-100">نشط: {emp.stats.activeChats}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600/85 to-cyan-600/75 p-3 rounded-lg shadow-lg">
                      <p className="text-xs font-bold text-white">الرسائل</p>
                      <p className="text-3xl font-extrabold text-white">{emp.stats.totalMessages}</p>
                    </div>
                    <div className="bg-gradient-to-r from-amber-600/85 to-orange-600/75 p-3 rounded-lg shadow-lg">
                      <p className="text-xs font-bold text-white">وقت الرد</p>
                      <p className="text-2xl font-extrabold text-white">{emp.stats.avgResponseTime.toFixed(1)}</p>
                      <p className="text-xs font-semibold text-amber-100">دقيقة</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-600/85 to-amber-600/75 p-3 rounded-lg shadow-lg">
                      <p className="text-xs font-bold text-white">التقييم</p>
                      <p className="text-2xl font-extrabold text-white">⭐ {emp.stats.satisfactionScore.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* ساعات العمل */}
                  <div className="bg-gradient-to-r from-purple-600/85 to-indigo-600/75 p-3 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-white flex items-center gap-1">
                        <Clock className="h-4 w-4" /> ساعات العمل اليوم
                      </p>
                      <p className="text-2xl font-extrabold text-white">{emp.workingHours.totalHoursToday.toFixed(1)} ساعة</p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-purple-100">
                      <span>من {emp.workingHours.start}</span>
                      <span>إلى {emp.workingHours.end}</span>
                    </div>
                  </div>

                  {/* المشاكل المحلولة */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-green-600/85 to-emerald-600/75 p-3 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-white" />
                      <span className="text-sm font-bold text-white">مشاكل محلولة</span>
                    </div>
                    <span className="text-2xl font-extrabold text-white">{emp.stats.resolvedIssues}</span>
                  </div>

                  {/* أزرار التحكم */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEmployeeStatusChange(emp.id, emp.status === 'available' ? 'busy' : 'available')}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      تغيير الحالة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEmployeeId(emp.id);
                        setShowEmployeeDetails(true);
                      }}
                      className="border-purple-700 text-purple-300 hover:bg-purple-900/30"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      التفاصيل
                    </Button>
                  </div>

                  {/* آخر نشاط */}
                  <p className="text-xs text-center text-slate-500">
                    آخر نشاط: {new Date(emp.lastActive).toLocaleString('ar-EG')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ⚠️ صفحة المشاكل */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            {/* الفلاتر */}
            <Card className="border-amber-600 bg-gradient-to-r from-amber-600/80 to-orange-600/70 hover:from-amber-600/90 hover:to-orange-600/80 transition-all shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2 font-bold">
                    <AlertCircle className="h-6 w-6" />
                    المشاكل والحلول
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/20 font-bold">
                      <Filter className="h-4 w-4 mr-1" /> تصفية
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-lg">
                      <Download className="h-4 w-4 mr-1" /> تصدير
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* قائمة المشاكل */}
            <div className="grid grid-cols-1 gap-4">
              {issues.length === 0 ? (
                <Card className="border-green-600 bg-gradient-to-r from-green-600/80 to-emerald-600/70 shadow-xl">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
                    <p className="text-xl font-bold text-white mb-2">رائع! لا توجد مشاكل مفتوحة</p>
                    <p className="text-sm font-semibold text-green-100">جميع المشاكل تم حلها بنجاح</p>
                  </CardContent>
                </Card>
              ) : (
                issues.map((issue) => (
                  <Card key={issue.id} className={`border-l-4 shadow-xl ${
                    issue.priority === 'urgent' ? 'border-l-red-600 bg-gradient-to-r from-red-600/80 to-red-700/70' :
                    issue.priority === 'high' ? 'border-l-orange-600 bg-gradient-to-r from-orange-600/80 to-orange-700/70' :
                    issue.priority === 'medium' ? 'border-l-yellow-600 bg-gradient-to-r from-yellow-600/80 to-yellow-700/70' :
                    'border-l-blue-600 bg-gradient-to-r from-blue-600/80 to-blue-700/70'
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-white text-lg font-bold">{issue.title}</CardTitle>
                            <Badge className={`${
                              issue.status === 'open' ? 'bg-red-700 text-white' :
                              issue.status === 'in-progress' ? 'bg-blue-700 text-white' :
                              issue.status === 'resolved' ? 'bg-green-700 text-white' :
                              'bg-slate-700 text-white'
                            } font-bold shadow-lg`}>
                              {issue.status === 'open' ? '🔴 مفتوح' :
                               issue.status === 'in-progress' ? '🔵 قيد الحل' :
                               issue.status === 'resolved' ? '🟢 محلول' : '⚫ مغلق'}
                            </Badge>
                            <Badge className={`${
                              issue.priority === 'urgent' ? 'bg-red-800 text-white' :
                              issue.priority === 'high' ? 'bg-orange-800 text-white' :
                              issue.priority === 'medium' ? 'bg-yellow-600/50 text-yellow-100 border-2 border-yellow-400/60' :
                              'bg-blue-600/50 text-blue-100 border-2 border-blue-400/60'
                            } font-bold`}>
                              {issue.priority === 'urgent' ? '🔥 عاجل جداً' :
                               issue.priority === 'high' ? '⚠️ عالي' :
                               issue.priority === 'medium' ? '⚡ متوسط' : '💧 منخفض'}
                            </Badge>
                          </div>
                          <CardDescription className="text-slate-200 mb-2 font-semibold">{issue.description}</CardDescription>
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                            <span className="flex items-center gap-1">
                              <Tag className="h-4 w-4" /> {issue.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" /> {new Date(issue.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" /> تكرار: {issue.frequency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* خطوات الحل */}
                      {issue.solutionSteps.length > 0 && (
                        <div className="bg-gradient-to-br from-green-600/40 to-emerald-600/30 p-3 rounded-lg border-2 border-green-500/50 shadow-lg">
                          <p className="text-sm font-bold text-green-100 mb-2 flex items-center gap-2 drop-shadow-sm">
                            <CheckCircle className="h-5 w-5" /> خطوات الحل:
                          </p>
                          <ul className="space-y-1">
                            {issue.solutionSteps.map((step, idx) => (
                              <li key={idx} className="text-xs font-semibold text-white flex items-start gap-2">
                                <span className="text-green-200 font-extrabold">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* فيديو الحل */}
                      {issue.solutionVideoUrl && (
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-xl hover:shadow-2xl transition-shadow"
                          onClick={() => window.open(issue.solutionVideoUrl, '_blank')}
                        >
                          <PlayCircle className="h-5 w-5 mr-2" />
                          شاهد فيديو الحل
                        </Button>
                      )}

                      {/* الموظف المسؤول */}
                      {issue.assignedEmployeeId && (
                        <div className="flex items-center justify-between bg-gradient-to-r from-purple-600/40 to-indigo-600/30 p-2 rounded border-2 border-purple-500/50 shadow-lg">
                          <span className="text-xs font-bold text-purple-200">المسؤول:</span>
                          <span className="text-sm font-bold text-white drop-shadow-sm">
                            {employees.find(e => e.id === issue.assignedEmployeeId)?.name || 'غير معين'}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* 📊 صفحة التحليلات والتقارير */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* إحصائيات عامة */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-blue-600 bg-gradient-to-r from-blue-600/80 to-cyan-600/70 hover:from-blue-600/90 hover:to-cyan-600/80 transition-all shadow-lg hover:shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    معدل النمو
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-extrabold text-white mb-1">+23%</p>
                  <p className="text-xs font-semibold text-blue-100">مقارنة بالشهر الماضي</p>
                </CardContent>
              </Card>

              <Card className="border-green-600 bg-gradient-to-r from-green-600/80 to-emerald-600/70 hover:from-green-600/90 hover:to-emerald-600/80 transition-all shadow-lg hover:shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    معدل الإنجاز
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-extrabold text-white mb-1">94%</p>
                  <p className="text-xs font-semibold text-green-100">من إجمالي المهام</p>
                </CardContent>
              </Card>

              <Card className="border-purple-600 bg-gradient-to-r from-purple-600/80 to-pink-600/70 hover:from-purple-600/90 hover:to-pink-600/80 transition-all shadow-lg hover:shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    رضا العملاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-extrabold text-white mb-1">{stats.avgSatisfaction.toFixed(1)}/5</p>
                  <p className="text-xs font-semibold text-purple-100">⭐⭐⭐⭐⭐</p>
                </CardContent>
              </Card>

              <Card className="border-amber-600 bg-gradient-to-r from-amber-600/80 to-orange-600/70 hover:from-amber-600/90 hover:to-orange-600/80 transition-all shadow-lg hover:shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    سرعة الاستجابة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-extrabold text-white mb-1">{stats.avgResponseTime.toFixed(1)}</p>
                  <p className="text-xs font-semibold text-amber-100">دقيقة متوسط</p>
                </CardContent>
              </Card>
            </div>

            {/* أفضل الموظفين */}
            <Card className="border-purple-600 bg-gradient-to-r from-purple-600/80 to-indigo-600/70 hover:from-purple-600/90 hover:to-indigo-600/80 transition-all shadow-xl">
              <CardHeader className="border-b border-purple-300/20">
                <CardTitle className="text-white flex items-center gap-2 font-bold">
                  <Award className="h-6 w-6 text-yellow-300" />
                  أفضل أداء الموظفين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees
                    .sort((a, b) => b.stats.satisfactionScore - a.stats.satisfactionScore)
                    .slice(0, 5)
                    .map((emp, index) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600/85 to-indigo-600/75 rounded-lg shadow-lg hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`text-3xl drop-shadow-lg ${
                            index === 0 ? 'animate-bounce' : ''
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : emp.avatar}
                          </div>
                          <div>
                            <p className="text-white font-bold drop-shadow-sm">{emp.name}</p>
                            <p className="text-xs font-semibold text-purple-200">{emp.role === 'admin' ? 'مدير' : emp.role === 'supervisor' ? 'مشرف' : 'موظف'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-xl font-extrabold text-yellow-300 drop-shadow-lg">⭐ {emp.stats.satisfactionScore.toFixed(1)}</p>
                              <p className="text-xs font-semibold text-purple-200">{emp.stats.totalChats} محادثة</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge className="bg-green-600/40 text-green-100 text-xs font-bold border border-green-500/50">
                                {emp.stats.resolvedIssues} حل
                              </Badge>
                              <Badge className="bg-blue-600/40 text-blue-100 text-xs font-bold border border-blue-500/50">
                                {emp.stats.avgResponseTime.toFixed(1)} دق
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* نشاط الأسبوع */}
            <Card className="border-cyan-600 bg-gradient-to-r from-cyan-600/80 to-blue-600/70 hover:from-cyan-600/90 hover:to-blue-600/80 transition-all shadow-xl">
              <CardHeader className="border-b border-cyan-300/20">
                <CardTitle className="text-white flex items-center gap-2 font-bold">
                  <Activity className="h-6 w-6" />
                  نشاط الأسبوع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day, idx) => (
                    <div key={day} className="text-center">
                      <p className="text-xs font-bold text-white mb-2">{day}</p>
                      <div className="bg-gradient-to-r from-cyan-600/85 to-blue-600/75 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all">
                        <p className="text-2xl font-extrabold text-white">{Math.floor(Math.random() * 50) + 20}</p>
                        <p className="text-xs font-semibold text-cyan-100">محادثة</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 📋 صفحة طلبات البوت */}
        {activeTab === 'requests' && (
          <Card className="border-slate-800/30 bg-slate-900/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-400" />
                    طلبات البوت المسجلة
                  </CardTitle>
                  <CardDescription className="text-slate-400">جميع الطلبات التي تم جمعها بواسطة البوت الذكي</CardDescription>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                  <Download className="h-4 w-4 mr-1" /> تصدير
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-300 font-semibold">الاسم</th>
                      <th className="text-right p-3 text-slate-300 font-semibold">الهاتف</th>
                      <th className="text-right p-3 text-slate-300 font-semibold">نوع الطلب</th>
                      <th className="text-right p-3 text-slate-300 font-semibold">الحالة</th>
                      <th className="text-right p-3 text-slate-300 font-semibold">التاريخ</th>
                      <th className="text-right p-3 text-slate-300 font-semibold">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {botRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center">
                          <Bot className="h-16 w-16 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400">لا توجد طلبات مسجلة حتى الآن</p>
                          <p className="text-xs text-slate-500 mt-1">ستظهر الطلبات هنا عند استخدام البوت</p>
                        </td>
                      </tr>
                    ) : (
                      botRequests.map((req) => (
                        <tr key={req.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-all">
                          <td className="p-3">
                            <p className="text-slate-200 font-medium">{req.contactName}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {req.contactPhone}
                            </p>
                          </td>
                          <td className="p-3">
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 border">
                              {REQUEST_TYPES.find((t) => t.value === req.type)?.icon}
                              {' '}
                              {REQUEST_TYPES.find((t) => t.value === req.type)?.label}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={`${
                              req.status === 'pending' 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                : req.status === 'processing' 
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            } border`}>
                              {req.status === 'pending' ? '⏳ انتظار' : req.status === 'processing' ? '⚙️ معالجة' : '✅ مكتمل'}
                            </Badge>
                          </td>
                          <td className="p-3 text-slate-400 text-xs">
                            {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="p-3">
                            <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog: تفاصيل الموظف */}
        <Dialog open={showEmployeeDetails} onOpenChange={setShowEmployeeDetails}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <User className="h-6 w-6 text-purple-400" />
                تفاصيل الموظف
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                معلومات شاملة عن أداء وإحصائيات الموظف
              </DialogDescription>
            </DialogHeader>
            {selectedEmployeeId && (() => {
              const employee = employees.find(emp => emp.id === selectedEmployeeId);
              if (!employee) return null;
              
              return (
                <div className="space-y-4 py-4">
                  {/* معلومات الموظف الأساسية */}
                  <div className="bg-gradient-to-r from-purple-600/80 to-indigo-600/70 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{employee.name}</h3>
                          <p className="text-sm text-purple-200">{employee.role}</p>
                        </div>
                      </div>
                      <Badge className={
                        employee.status === 'available'
                          ? 'bg-green-600 text-white'
                          : employee.status === 'busy'
                          ? 'bg-yellow-600 text-white'
                          : employee.status === 'on-break'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                      }>
                        {employee.status === 'available' && '🟢 متاح'}
                        {employee.status === 'busy' && '🟡 مشغول'}
                        {employee.status === 'on-break' && '🔵 استراحة'}
                        {employee.status === 'offline' && '⚫ غير متصل'}
                      </Badge>
                    </div>
                  </div>

                  {/* الإحصائيات الرئيسية */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-r from-blue-600/85 to-cyan-600/75 p-4 rounded-lg text-center">
                      <MessageSquare className="h-6 w-6 text-white mx-auto mb-2" />
                      <p className="text-xs font-semibold text-blue-100">الرسائل</p>
                      <p className="text-2xl font-extrabold text-white">{employee.stats.totalMessages}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-600/85 to-emerald-600/75 p-4 rounded-lg text-center">
                      <CheckCircle className="h-6 w-6 text-white mx-auto mb-2" />
                      <p className="text-xs font-semibold text-green-100">المحلولة</p>
                      <p className="text-2xl font-extrabold text-white">{employee.stats.resolvedIssues}</p>
                    </div>
                    <div className="bg-gradient-to-r from-amber-600/85 to-orange-600/75 p-4 rounded-lg text-center">
                      <Clock className="h-6 w-6 text-white mx-auto mb-2" />
                      <p className="text-xs font-semibold text-amber-100">وقت الرد</p>
                      <p className="text-2xl font-extrabold text-white">{employee.stats.avgResponseTime.toFixed(1)}</p>
                      <p className="text-xs font-semibold text-amber-100">دقيقة</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-600/85 to-amber-600/75 p-4 rounded-lg text-center">
                      <Star className="h-6 w-6 text-white mx-auto mb-2" />
                      <p className="text-xs font-semibold text-yellow-100">التقييم</p>
                      <p className="text-2xl font-extrabold text-white">{employee.stats.satisfactionScore.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* ساعات العمل */}
                  <div className="bg-gradient-to-r from-purple-600/85 to-indigo-600/75 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      ساعات العمل
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-100">اليوم</span>
                        <span className="text-lg font-bold text-white">{employee.workingHours.totalHoursToday.toFixed(1)} ساعة</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-200">من {employee.workingHours.start}</span>
                        <span className="text-purple-200">إلى {employee.workingHours.end}</span>
                      </div>
                      <div className="bg-purple-900/40 rounded-full h-2 mt-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all"
                          style={{ width: `${(employee.workingHours.totalHoursToday / 12) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* المشاكل النشطة */}
                  <div className="bg-gradient-to-r from-red-600/85 to-pink-600/75 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      المشاكل الحالية
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-red-100">مفتوحة</p>
                        <p className="text-xl font-bold text-white">
                          {issues.filter(i => i.assignedEmployeeId === employee.id && i.status === 'open').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-red-100">قيد المعالجة</p>
                        <p className="text-xl font-bold text-white">
                          {issues.filter(i => i.assignedEmployeeId === employee.id && i.status === 'in-progress').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-red-100">محلولة</p>
                        <p className="text-xl font-bold text-white">
                          {issues.filter(i => i.assignedEmployeeId === employee.id && i.status === 'resolved').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* العملاء المعينين */}
                  <div className="bg-gradient-to-r from-cyan-600/85 to-blue-600/75 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      العملاء المعينين ({contacts.filter(c => c.assignedEmployeeId === employee.id).length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {contacts
                        .filter(c => c.assignedEmployeeId === employee.id)
                        .slice(0, 5)
                        .map(contact => (
                          <div key={contact.id} className="flex items-center justify-between bg-cyan-900/40 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-cyan-200" />
                              <span className="text-sm text-white">{contact.name}</span>
                            </div>
                            <Badge className="bg-cyan-700 text-white text-xs">
                              {contact.messageCount} رسالة
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              );
            })()}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEmployeeDetails(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4 mr-2" />
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: إنشاء مشكلة جديدة */}
        <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <AlertCircle className="h-6 w-6 text-red-400" />
                إبلاغ عن مشكلة جديدة
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                قم بتفصيل المشكلة لمساعدتنا في حلها بسرعة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">عنوان المشكلة</label>
                <Input
                  placeholder="مثال: مشكلة في النظام..."
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">وصف المشكلة</label>
                <Textarea
                  placeholder="اشرح المشكلة بالتفصيل..."
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  rows={4}
                  className="bg-slate-800 border-slate-700 text-white resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">التصنيف</label>
                  <Input
                    placeholder="مثال: فني، خدمة عملاء..."
                    value={newIssue.category}
                    onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">الأولوية</label>
                  <Select
                    value={newIssue.priority}
                    onValueChange={(value: IssuePriority) => setNewIssue({ ...newIssue, priority: value })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="low" className="text-white">💧 منخفض</SelectItem>
                      <SelectItem value="medium" className="text-white">⚡ متوسط</SelectItem>
                      <SelectItem value="high" className="text-white">⚠️ عالي</SelectItem>
                      <SelectItem value="urgent" className="text-white">🔥 عاجل جداً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedContact && (
                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-700/30">
                  <p className="text-xs text-slate-400 mb-1">سيتم ربط المشكلة مع:</p>
                  <p className="text-sm text-blue-300">📱 {selectedContact.name} - {selectedContact.phone}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowIssueDialog(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4 mr-2" />
                إلغاء
              </Button>
              <Button
                onClick={handleCreateIssue}
                disabled={!newIssue.title || !newIssue.description}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                إنشاء المشكلة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: إضافة جهة اتصال جديدة */}
        <Dialog open={showAddContactDialog} onOpenChange={setShowAddContactDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <User className="h-6 w-6 text-green-400" />
                إضافة جهة اتصال جديدة
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                أدخل معلومات العميل الجديد بشكل كامل لتسهيل المتابعة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* الاسم */}
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-1">
                  <User className="h-4 w-4" />
                  الاسم الكامل <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="مثال: أحمد محمد العلي"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* رقم الهاتف والبريد */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    رقم الهاتف <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="+966XXXXXXXXX"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    البريد الإلكتروني
                  </label>
                  <Input
                    placeholder="example@email.com"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* الشركة */}
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  اسم الشركة (اختياري)
                </label>
                <Input
                  placeholder="مثال: شركة التقنية المتقدمة"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* التصنيف والمرحلة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    تصنيف العميل
                  </label>
                  <Select
                    value={newContact.customerType}
                    onValueChange={(value: 'VIP' | 'عادي' | 'مشاغب') => setNewContact({ ...newContact, customerType: value })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="VIP" className="text-white">⭐ VIP - عميل مميز</SelectItem>
                      <SelectItem value="عادي" className="text-white">👤 عادي - عميل عادي</SelectItem>
                      <SelectItem value="مشاغب" className="text-white">⚠️ مشاغب - يحتاج متابعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    مرحلة العميل
                  </label>
                  <Select
                    value={newContact.stage}
                    onValueChange={(value: 'trial' | 'follow-up' | 'purchase' | 'rejected') => setNewContact({ ...newContact, stage: value })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="trial" className="text-white">🔍 تجربة</SelectItem>
                      <SelectItem value="follow-up" className="text-white">📞 متابعة</SelectItem>
                      <SelectItem value="purchase" className="text-white">✅ تم الشراء</SelectItem>
                      <SelectItem value="rejected" className="text-white">❌ مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* الأولوية */}
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  أولوية المتابعة
                </label>
                <Select
                  value={newContact.priority}
                  onValueChange={(value: IssuePriority) => setNewContact({ ...newContact, priority: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="low" className="text-white">💧 منخفض</SelectItem>
                    <SelectItem value="medium" className="text-white">⚡ متوسط</SelectItem>
                    <SelectItem value="high" className="text-white">⚠️ عالي</SelectItem>
                    <SelectItem value="urgent" className="text-white">🔥 عاجل جداً</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* الملاحظات */}
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  ملاحظات إضافية
                </label>
                <Textarea
                  placeholder="أضف أي ملاحظات أو معلومات إضافية عن العميل..."
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  rows={3}
                  className="bg-slate-800 border-slate-700 text-white resize-none"
                />
              </div>

              {/* معاينة التصنيف */}
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-4 rounded-lg border border-green-700/30">
                <p className="text-xs text-slate-400 mb-2">معاينة:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${
                    newContact.customerType === 'VIP' ? 'bg-yellow-600' : 
                    newContact.customerType === 'مشاغب' ? 'bg-red-600' : 
                    'bg-blue-600'
                  } text-white font-bold`}>
                    {newContact.customerType === 'VIP' && '⭐'} 
                    {newContact.customerType === 'مشاغب' && '⚠️'} 
                    {newContact.customerType === 'عادي' && '👤'} 
                    {newContact.customerType}
                  </Badge>
                  <Badge className="bg-purple-600 text-white">
                    {newContact.stage === 'trial' && '🔍'} 
                    {newContact.stage === 'follow-up' && '📞'} 
                    {newContact.stage === 'purchase' && '✅'} 
                    {newContact.stage === 'rejected' && '❌'}
                    {' '}
                    {newContact.stage === 'trial' ? 'تجربة' : 
                     newContact.stage === 'follow-up' ? 'متابعة' : 
                     newContact.stage === 'purchase' ? 'شراء' : 'مرفوض'}
                  </Badge>
                  <Badge className={`${
                    newContact.priority === 'urgent' ? 'bg-red-600' : 
                    newContact.priority === 'high' ? 'bg-orange-600' : 
                    newContact.priority === 'medium' ? 'bg-yellow-600' : 
                    'bg-green-600'
                  } text-white`}>
                    {newContact.priority === 'urgent' ? '🔥 عاجل' : 
                     newContact.priority === 'high' ? '⚠️ عالي' : 
                     newContact.priority === 'medium' ? '⚡ متوسط' : '💧 منخفض'}
                  </Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddContactDialog(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4 mr-2" />
                إلغاء
              </Button>
              <Button
                onClick={handleSaveNewContact}
                disabled={!newContact.name.trim() || !newContact.phone.trim()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                حفظ جهة الاتصال
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: الرسائل الجماعية */}
        <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-orange-400" />
                إرسال رسالة جماعية
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                اختر جهات الاتصال واكتب رسالتك
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* قائمة جهات الاتصال */}
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">
                  اختر جهات الاتصال ({selectedContactsForBroadcast.length} محدد)
                </label>
                <div className="max-h-64 overflow-y-auto bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-2">
                  {filteredContacts.map(contact => (
                    <label key={contact.id} className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedContactsForBroadcast.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContactsForBroadcast([...selectedContactsForBroadcast, contact.id]);
                          } else {
                            setSelectedContactsForBroadcast(selectedContactsForBroadcast.filter(id => id !== contact.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{contact.name}</p>
                        <p className="text-xs text-slate-400">{contact.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* الرسالة */}
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">الرسالة</label>
                <Textarea
                  placeholder="اكتب رسالتك هنا..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={5}
                  className="bg-slate-800 border-slate-700 text-white resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBroadcastDialog(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4 mr-2" />
                إلغاء
              </Button>
              <Button
                onClick={handleBroadcastMessage}
                disabled={!broadcastMessage.trim() || selectedContactsForBroadcast.length === 0}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                إرسال لـ {selectedContactsForBroadcast.length} عميل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: المكالمات */}
        <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              {/* Avatar العميل */}
              <div className="relative">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl ${
                  callStatus === 'ringing' ? 'animate-pulse' : ''
                } ${
                  selectedContact?.tags.includes('VIP') ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                  selectedContact?.tags.includes('مشاغب') ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                  'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}>
                  {selectedContact?.tags.includes('VIP') ? '⭐' :
                   selectedContact?.tags.includes('مشاغب') ? '⚠️' :
                   selectedContact?.name.charAt(0)}
                </div>
                {callType === 'video' && callStatus === 'connected' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 p-2 rounded-full">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              {/* اسم العميل */}
              <div className="text-center">
                <h3 className="text-2xl font-bold">{selectedContact?.name}</h3>
                <p className="text-[#8696a0] text-sm mt-1">{selectedContact?.phone}</p>
              </div>

              {/* حالة المكالمة */}
              <div className="text-center">
                {callStatus === 'ringing' && (
                  <div className="flex items-center gap-2 text-lg">
                    <Phone className="h-5 w-5 animate-bounce" />
                    <span>جاري الاتصال...</span>
                  </div>
                )}
                {callStatus === 'connected' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-400 justify-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>متصل</span>
                    </div>
                    <p className="text-3xl font-mono">{formatCallDuration(callDuration)}</p>
                  </div>
                )}
                {callStatus === 'ended' && (
                  <div className="text-lg text-red-400">
                    انتهت المكالمة
                  </div>
                )}
              </div>

              {/* أزرار التحكم */}
              {callStatus !== 'ended' && (
                <div className="flex gap-4 mt-4">
                  {callStatus === 'connected' && (
                    <>
                      <Button
                        variant="ghost"
                        size="lg"
                        className="rounded-full w-14 h-14 bg-slate-800 hover:bg-slate-700"
                        title="كتم الصوت"
                      >
                        <Mic className="h-6 w-6" />
                      </Button>
                      {callType === 'video' && (
                        <Button
                          variant="ghost"
                          size="lg"
                          className="rounded-full w-14 h-14 bg-slate-800 hover:bg-slate-700"
                          title="إيقاف الكاميرا"
                        >
                          <Video className="h-6 w-6" />
                        </Button>
                      )}
                    </>
                  )}
                  <Button
                    onClick={handleEndCall}
                    size="lg"
                    className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600"
                    title="إنهاء المكالمة"
                  >
                    <Phone className="h-6 w-6 rotate-135" />
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog: مشاركة المحادثة */}
        <Dialog open={showShareContactDialog} onOpenChange={setShowShareContactDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-blue-400" />
                مشاركة المحادثة مع موظف
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                اختر الموظف الذي تريد مشاركة هذه المحادثة معه
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {employees
                .filter(e => e.id !== currentEmployeeId && e.id !== selectedContact?.assignedEmployeeId)
                .map(employee => (
                  <div
                    key={employee.id}
                    onClick={() => handleShareContact(employee.id)}
                    className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-lg font-bold">
                        {employee.avatar || employee.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{employee.name}</p>
                        <p className="text-xs text-slate-400">
                          {DEPARTMENTS.find(d => d.id === employee.department)?.name || employee.department}
                        </p>
                      </div>
                      <Badge className={`${
                        employee.status === 'available' ? 'bg-green-600' :
                        employee.status === 'busy' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      } text-white text-xs`}>
                        {employee.status === 'available' ? '✅ متاح' :
                         employee.status === 'busy' ? '⏳ مشغول' : '⚫ غير متصل'}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowShareContactDialog(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4 mr-2" />
                إلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* زر عائم للمساعد الذكي */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl rounded-full w-16 h-16 flex items-center justify-center border-4 border-white/30 hover:scale-110 transition-all duration-200"
        title="مساعد المضيف الذكي"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        <MessageCircle className="w-8 h-8 text-white" />
        <span className="sr-only">المساعد الذكي</span>
      </button>

      {/* ChatBot Component */}
      <ChatBotSimulator isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}
