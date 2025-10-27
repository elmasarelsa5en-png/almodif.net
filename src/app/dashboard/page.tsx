'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Calendar,
  Users,
  DollarSign,
  Bed,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowRight,
  BarChart3,
  PieChart,
  Zap,
  Hotel,
  CreditCard,
  Calculator,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Phone,
  Mail,
  MapPin,
  Award,
  Target,
  Globe,
  Sparkles,
  Crown,
  Shield,
  Rocket,
  Heart,
  Sun,
  Moon,
  Wifi,
  Coffee,
  Car,
  Camera,
  Music,
  Gamepad2,
  Briefcase,
  Home,
  Building,
  Plane,
  Ship,
  Train,
  Bus,
  Bike,
  Footprints,
  Wind,
  Cloud,
  Droplets,
  Flame,
  Snowflake,
  Leaf,
  Flower,
  TreePine,
  Mountain,
  Waves,
  Sunrise,
  Sunset,
  Stars,
  Moon as MoonIcon,
  Sun as SunIcon,
  CloudRain,
  CloudSnow,
  Zap as Lightning,
  Flame as Fire,
  Snowflake as Snow,
  Leaf as Leaves,
  Flower as Flowers,
  TreePine as Pine,
  Mountain as Mountains,
  Waves as Ocean,
  Sunrise as Dawn,
  Sunset as Dusk,
  Stars as NightSky,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  UserCheck,
  UserX,
  CalendarCheck,
  CalendarX,
  DollarSign as Money,
  TrendingUp as Up,
  TrendingDown as Down,
  AlertTriangle,
  Check,
  X,
  Info,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import * as NotificationService from '@/lib/notification-service';

interface DashboardStats {
  totalGuests: number;
  totalRevenue: number;
  occupancyRate: number;
  pendingRequests: number;
  monthlyGrowth: number;
  weeklyGrowth: number;
  dailyGrowth: number;
  avgStayDuration: number;
  customerSatisfaction: number;
  totalRooms: number;
  availableRooms: number;
  maintenanceRequests: number;
  staffOnDuty: number;
}

interface ActivityItem {
  id: string;
  type: 'booking' | 'payment' | 'request' | 'maintenance' | 'checkin' | 'checkout';
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'pending' | 'in-progress';
  amount?: number;
  guestName?: string;
  roomNumber?: string;
}

interface ChartData {
  name: string;
  value: number;
  revenue?: number;
  bookings?: number;
  occupancy?: number;
  [key: string]: any;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalGuests: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    pendingRequests: 0,
    monthlyGrowth: 0,
    weeklyGrowth: 0,
    dailyGrowth: 0,
    avgStayDuration: 0,
    customerSatisfaction: 0,
    totalRooms: 0,
    availableRooms: 0,
    maintenanceRequests: 0,
    staffOnDuty: 0
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28,
    condition: 'Sunny',
    humidity: 65,
    windSpeed: 12
  });

  // Chart data
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [occupancyData, setOccupancyData] = useState<ChartData[]>([]);
  const [bookingData, setBookingData] = useState<ChartData[]>([]);
  const [roomTypeData, setRoomTypeData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Load dashboard data
    loadDashboardData();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual API calls
      const mockStats: DashboardStats = {
        totalGuests: 1247,
        totalRevenue: 89250,
        occupancyRate: 87,
        pendingRequests: 23,
        monthlyGrowth: 12.5,
        weeklyGrowth: 8.3,
        dailyGrowth: 2.1,
        avgStayDuration: 3.2,
        customerSatisfaction: 4.8,
        totalRooms: 156,
        availableRooms: 23,
        maintenanceRequests: 8,
        staffOnDuty: 42
      };

      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'booking',
          title: 'تم تأكيد حجز جديد',
          description: 'قام أحمد محمد بحجز جناح ديلوكس (غرفة 205) لمدة 3 ليالي',
          time: 'منذ دقيقتين',
          priority: 'high',
          status: 'completed',
          amount: 675,
          guestName: 'أحمد محمد',
          roomNumber: '205'
        },
        {
          id: '2',
          type: 'payment',
          title: 'تم استلام دفعة',
          description: 'تم استلام دفعة 450 ر.س من غرفة 312 - سارة أحمد',
          time: 'منذ 15 دقيقة',
          priority: 'medium',
          status: 'completed',
          amount: 450,
          guestName: 'سارة أحمد',
          roomNumber: '312'
        },
        {
          id: '3',
          type: 'checkin',
          title: 'تسجيل دخول نزيل',
          description: 'قام محمد علي بتسجيل الدخول إلى الجناح التنفيذي (غرفة 401)',
          time: 'منذ 32 دقيقة',
          priority: 'high',
          status: 'completed',
          guestName: 'محمد علي',
          roomNumber: '401'
        },
        {
          id: '4',
          type: 'request',
          title: 'طلب خدمة الغرف',
          description: 'تم طلب مناشف إضافية ومستلزمات نظافة للغرفة 108',
          time: 'منذ ساعة',
          priority: 'low',
          status: 'pending',
          guestName: 'فاطمة حسن',
          roomNumber: '108'
        },
        {
          id: '5',
          type: 'maintenance',
          title: 'تنبيه صيانة',
          description: 'وحدة التكييف في الغرفة 215 تحتاج صيانة فورية',
          time: 'منذ ساعتين',
          priority: 'high',
          status: 'in-progress',
          roomNumber: '215'
        },
        {
          id: '6',
          type: 'checkout',
          title: 'مغادرة نزيل',
          description: 'قام خالد عبدالله بتسجيل المغادرة من الغرفة العادية (غرفة 103)',
          time: 'منذ 3 ساعات',
          priority: 'medium',
          status: 'completed',
          guestName: 'خالد عبدالله',
          roomNumber: '103'
        }
      ];

      // Generate chart data
      const revenueChartData = [
        { name: 'يناير', value: 65000, revenue: 65000 },
        { name: 'فبراير', value: 72000, revenue: 72000 },
        { name: 'مارس', value: 68000, revenue: 68000 },
        { name: 'أبريل', value: 78000, revenue: 78000 },
        { name: 'مايو', value: 82000, revenue: 82000 },
        { name: 'يونيو', value: 89000, revenue: 89000 },
        { name: 'يوليو', value: 95000, revenue: 95000 }
      ];

      const occupancyChartData = [
        { name: 'الإثنين', value: 85, occupancy: 85 },
        { name: 'الثلاثاء', value: 92, occupancy: 92 },
        { name: 'الأربعاء', value: 88, occupancy: 88 },
        { name: 'الخميس', value: 95, occupancy: 95 },
        { name: 'الجمعة', value: 98, occupancy: 98 },
        { name: 'السبت', value: 100, occupancy: 100 },
        { name: 'الأحد', value: 78, occupancy: 78 }
      ];

      const bookingChartData = [
        { name: 'الأسبوع 1', value: 45, bookings: 45 },
        { name: 'الأسبوع 2', value: 52, bookings: 52 },
        { name: 'الأسبوع 3', value: 48, bookings: 48 },
        { name: 'الأسبوع 4', value: 61, bookings: 61 }
      ];

      const roomTypeChartData = [
        { name: 'عادية', value: 45 },
        { name: 'ديلوكس', value: 30 },
        { name: 'جناح', value: 15 },
        { name: 'تنفيذية', value: 10 }
      ];

      setStats(mockStats);
      setActivities(mockActivities);
      setRevenueData(revenueChartData);
      setOccupancyData(occupancyChartData);
      setBookingData(bookingChartData);
      setRoomTypeData(roomTypeChartData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <CalendarCheck className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'request': return <MessageSquare className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'checkin': return <UserCheck className="w-4 h-4" />;
      case 'checkout': return <UserX className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400/20 bg-red-400/10';
      case 'medium': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
      case 'low': return 'text-green-400 border-green-400/20 bg-green-400/10';
      default: return 'text-gray-400 border-gray-400/20 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'in-progress': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <RefreshCw className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Chart colors
  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-400" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'snowy': return <CloudSnow className="w-6 h-6 text-blue-200" />;
      default: return <Sun className="w-6 h-6 text-yellow-400" />;
    }
  };

  const testNotification = () => {
    NotificationService.addSmartNotification({
      title: '🔔 اختبار نظام الإشعارات',
      message: 'تم اختبار النظام بنجاح! جميع الإشعارات تعمل بشكل صحيح.',
      time: 'الآن',
      unread: true,
      type: 'system_alert',
      priority: 'medium',
      category: 'system',
      requiresApproval: false,
      actionRequired: false
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">جاري تحميل لوحة التحكم...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-6000"></div>
        </div>

        {/* Enhanced Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-10"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 10
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 p-6">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <motion.div
                  className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-xl"
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    لوحة التحكم
                  </motion.h1>
                  <motion.p
                    className="text-gray-300 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {currentTime.toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Weather Widget */}
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-center space-x-2">
                    {getWeatherIcon(weather.condition)}
                    <div className="text-white text-sm">
                      <div className="font-medium">{weather.temperature}°C</div>
                      <div className="text-xs text-gray-300">{weather.condition}</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-white" />
                    <span className="text-white font-medium">
                      {currentTime.toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>

                <motion.button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={testNotification}
                >
                  <Bell className="w-4 h-4 inline mr-2" />
                  اختبار الإشعارات
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Total Guests */}
            <motion.div
              className="group relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">+{stats.dailyGrowth}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">إجمالي النزلاء</p>
                  <p className="text-3xl font-bold text-white">{stats.totalGuests.toLocaleString()}</p>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: 0.8 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Revenue */}
            <motion.div
              className="group relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">+{stats.monthlyGrowth}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">الإيرادات الشهرية</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1, delay: 0.9 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Occupancy Rate */}
            <motion.div
              className="group relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-lg">
                    <Bed className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">+{stats.weeklyGrowth}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">معدل الإشغال</p>
                  <p className="text-3xl font-bold text-white">{stats.occupancyRate}%</p>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.occupancyRate}%` }}
                      transition={{ duration: 1, delay: 1.0 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pending Requests */}
            <motion.div
              className="group relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-sm font-medium">{stats.pendingRequests}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">الطلبات المعلقة</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingRequests}</p>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 1, delay: 1.1 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-xl border border-white/20">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  التحليلات
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">
                  <Activity className="w-4 h-4 mr-2" />
                  النشاط
                </TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">
                  <Target className="w-4 h-4 mr-2" />
                  الأداء
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Charts Section */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Revenue Chart */}
                    <motion.div
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.4 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">اتجاه الإيرادات</h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300 text-sm">شهري</span>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: 'white'
                            }}
                            formatter={(value) => [formatCurrency(value as number), 'الإيرادات']}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8B5CF6"
                            fillOpacity={1}
                            fill="url(#revenueGradient)"
                            strokeWidth={3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* Occupancy & Bookings Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.6 }}
                      >
                        <h3 className="text-lg font-bold text-white mb-4">الإشغال الأسبوعي</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={occupancyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: 'white'
                              }}
                              formatter={(value) => [`${value}%`, 'الإشغال']}
                            />
                            <Bar dataKey="value" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </motion.div>

                      <motion.div
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.8 }}
                      >
                        <h3 className="text-lg font-bold text-white mb-4">الحجوزات الشهرية</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={bookingData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: 'white'
                              }}
                              formatter={(value) => [value, 'الحجوزات']}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#10B981"
                              strokeWidth={3}
                              dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                              activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </motion.div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Room Types Distribution */}
                    <motion.div
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 2.0 }}
                    >
                      <h3 className="text-lg font-bold text-white mb-4">أنواع الغرف</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPieChart>
                          <Pie
                            data={roomTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {roomTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: 'white'
                            }}
                          />
                          <Legend
                            wrapperStyle={{ color: '#9CA3AF' }}
                            iconType="circle"
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 2.2 }}
                    >
                      <h3 className="text-lg font-bold text-white mb-4">إحصائيات سريعة</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">الغرف المتاحة</span>
                          <span className="text-green-400 font-bold">{stats.availableRooms}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">الموظفون المناوبون</span>
                          <span className="text-blue-400 font-bold">{stats.staffOnDuty}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">متوسط مدة الإقامة</span>
                          <span className="text-purple-400 font-bold">{stats.avgStayDuration} أيام</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">طلبات الصيانة</span>
                          <span className="text-orange-400 font-bold">{stats.maintenanceRequests}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-6">تحليلات الإيرادات</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-gray-300 text-sm">هذا الشهر</p>
                          <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 text-sm">+{stats.monthlyGrowth}%</p>
                          <p className="text-gray-400 text-xs">مقارنة بالشهر الماضي</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-gray-300 text-sm">المتوسط لكل نزيل</p>
                          <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue / stats.totalGuests)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-400 text-sm">+8.2%</p>
                          <p className="text-gray-400 text-xs">مقارنة بالشهر الماضي</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-6">تحليلات الإشغال</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-gray-300 text-sm">المعدل الحالي</p>
                          <p className="text-2xl font-bold text-white">{stats.occupancyRate}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 text-sm">+{stats.weeklyGrowth}%</p>
                          <p className="text-gray-400 text-xs">مقارنة بالأسبوع الماضي</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-gray-300 text-sm">إجمالي الغرف</p>
                          <p className="text-2xl font-bold text-white">{stats.totalRooms}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 text-sm">{stats.availableRooms} متاحة</p>
                          <p className="text-gray-400 text-xs">جاهزة للحجز</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-6">
                <motion.div
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">النشاط الأخير</h2>
                    <div className="flex items-center space-x-2">
                      <button className="text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>تصفية</span>
                      </button>
                      <button className="text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>تصدير</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {activities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="group flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
                        >
                          <div className={`p-2 rounded-lg ${getPriorityColor(activity.priority)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-white font-medium truncate">{activity.title}</h3>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(activity.status)}
                                <span className="text-gray-400 text-sm">{activity.time}</span>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{activity.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                                  {activity.priority.toUpperCase()}
                                </span>
                                <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                                  {activity.status.replace('-', ' ').toUpperCase()}
                                </span>
                              </div>
                              {activity.amount && (
                                <span className="text-green-400 font-medium text-sm">
                                  {formatCurrency(activity.amount)}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-yellow-400 text-2xl font-bold">{stats.customerSatisfaction}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">رضا العملاء</h3>
                    <p className="text-gray-300 text-sm mb-4">بناءً على تقييمات وملاحظات النزلاء</p>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(stats.customerSatisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-green-400 text-2xl font-bold">99.9%</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">وقت تشغيل النظام</h3>
                    <p className="text-gray-300 text-sm mb-4">توفر الخادم هذا الشهر</p>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-full"></div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-blue-400 text-2xl font-bold">2.3m</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">وقت الاستجابة</h3>
                    <p className="text-gray-300 text-sm mb-4">متوسط الاستجابة لطلبات النزلاء</p>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-4/5"></div>
                    </div>
                  </motion.div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Enhanced Custom CSS */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          .animate-float {
            animation: float 10s ease-in-out infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animation-delay-6000 {
            animation-delay: 6s;
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;