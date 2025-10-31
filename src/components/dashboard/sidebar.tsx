'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  LayoutDashboard,
  BedDouble,
  ConciergeBell,
  BookOpen,
  Shirt,
  Coffee,
  Utensils,
  Warehouse,
  Calculator,
  Bot,
  Zap,
  FileText,
  MessageSquare,
  Eye,
  AreaChart,
  TrendingDown,
  TrendingUp,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  MessagesSquare, // أيقونة جديدة للمحادثات الداخلية
  Calendar, // أيقونة الحجوزات
  Globe, // أيقونة منصات الحجز
  Link2, // أيقونة روابط الدفع
  CreditCard, // أيقونة بطاقات الدفع
  List, // أيقونة قوائم الأصناف
  BarChart3, // تقرير شهري
  Receipt, // أيقونة سندات القبض
  DollarSign, // خزنة النقد
  Package, // العمولات
  FileText as ExpenseVoucher, // سندات الصرف
  UserCheck, // إحصائيات الموظفين
  Lock, // الحجوزات المفتوحة
  Wrench, // تغيير الشقق
  PieChart, // الضرائب والرسوم
  Building, // حالة الغرف
  X, // التناقض
  Building2, // البنك
  Star, // أيقونة التقييمات
  Award, // أيقونة برنامج الولاء
  Brain, // أيقونة الذكاء الاصطناعي
  AlertTriangle, // أيقونة كشف الشذوذات
  Clock, // أيقونة التقارير المجدولة
  Bell // أيقونة الإشعارات
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NavigationItem {
  icon: React.ComponentType<any>;
  labelKey: string; // مفتاح الترجمة
  descKey: string;  // مفتاح الوصف
  href: string;
  permission?: string;
  subItems?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    icon: LayoutDashboard,
    labelKey: 'dashboard',
    descKey: 'dashboardDesc',
    href: '/dashboard',
    permission: 'view_dashboard',
  },
  {
    icon: BedDouble,
    labelKey: 'roomsManagement',
    descKey: 'roomsManagementDesc',
    href: '/dashboard/rooms',
    permission: 'view_rooms',
  },
  {
    icon: Calendar,
    labelKey: 'bookings',
    descKey: 'bookingsDesc',
    href: '/dashboard/bookings',
    permission: 'view_bookings',
    subItems: [
      {
        icon: Globe,
        labelKey: 'bookingPlatforms',
        descKey: 'bookingPlatformsDesc',
        href: '/dashboard/booking-platforms',
        permission: 'view_bookings',
      }
    ]
  },
  {
    icon: Users,
    labelKey: 'guests',
    descKey: 'guestsDesc',
    href: '/dashboard/guests',
    permission: 'view_guests',
  },
  {
    icon: ConciergeBell,
    labelKey: 'guestRequests',
    descKey: 'guestRequestsDesc',
    href: '/dashboard/requests',
    permission: 'view_requests',
  },
  {
    icon: Shirt,
    labelKey: 'laundry',
    descKey: 'laundryDesc',
    href: '/dashboard/laundry',
    permission: 'view_laundry',
  },
  {
    icon: Coffee,
    labelKey: 'coffeeShop',
    descKey: 'coffeeShopDesc',
    href: '/dashboard/coffee-shop',
    permission: 'view_coffee',
  },
  {
    icon: Utensils,
    labelKey: 'restaurant',
    descKey: 'restaurantDesc',
    href: '/dashboard/restaurant',
    permission: 'view_restaurant',
  },
  {
    icon: Warehouse,
    labelKey: 'inventory',
    descKey: 'inventoryDesc',
    href: '/dashboard/inventory',
    permission: 'view_dashboard',
  },
  {
    icon: Link2,
    labelKey: 'paymentLinks',
    descKey: 'paymentLinksDesc',
    href: '/dashboard/payment-links',
    permission: 'view_payments',
  },
  {
    icon: Calculator,
    labelKey: 'accounting',
    descKey: 'accountingDesc',
    href: '/dashboard/accounting',
    permission: 'view_payments',
    subItems: [
      {
        icon: AreaChart,
        labelKey: 'financialDashboard',
        descKey: 'financialDashboardDesc',
        href: '/dashboard/accounting/dashboard',
        permission: 'view_payments',
      },
      {
        icon: FileText,
        labelKey: 'invoiceManagement',
        descKey: 'invoiceManagementDesc',
        href: '/dashboard/accounting/invoices',
        permission: 'view_invoices',
      },
      {
        icon: TrendingDown,
        labelKey: 'expensesAndCosts',
        descKey: 'expensesAndCostsDesc',
        href: '/dashboard/accounting/expenses',
        permission: 'view_payments',
      },
      {
        icon: Eye,
        labelKey: 'financialReports',
        descKey: 'financialReportsDesc',
        href: '/dashboard/accounting/reports',
        permission: 'view_financial_reports',
      },
      {
        icon: TrendingUp,
        labelKey: 'cashFlow',
        descKey: 'cashFlowDesc',
        href: '/dashboard/accounting/cash-flow',
        permission: 'view_financial_reports',
      },
      {
        icon: Upload,
        labelKey: 'importSummary',
        descKey: 'importSummaryDesc',
        href: '/dashboard/accounting/import-summary',
        permission: 'view_financial_reports',
      }
    ]
  },
  {
    icon: Receipt,
    labelKey: 'vouchers',
    descKey: 'vouchersDesc',
    href: '/dashboard/vouchers',
    permission: 'view_dashboard',
    subItems: [
      {
        icon: Receipt,
        labelKey: 'receipts',
        descKey: 'receiptsDesc',
        href: '/dashboard/accounting/receipts',
        permission: 'view_receipts',
      },
      {
        icon: DollarSign,
        labelKey: 'expenseVouchers',
        descKey: 'expenseVouchersDesc',
        href: '/dashboard/expenses',
        permission: 'view_expense_vouchers',
      },
      {
        icon: FileText,
        labelKey: 'promissoryNotes',
        descKey: 'promissoryNotesDesc',
        href: '/dashboard/promissory-notes',
        permission: 'view_promissory_notes',
      },
      {
        icon: CreditCard,
        labelKey: 'bankVouchers',
        descKey: 'bankVouchersDesc',
        href: '/dashboard/bank-vouchers',
        permission: 'view_bank_vouchers',
      },
    ]
  },
  {
    icon: MessagesSquare,
    labelKey: 'internalChat',
    descKey: 'internalChatDesc',
    href: '/dashboard/chat',
    permission: 'access_chat',
  },
  {
    icon: MessageSquare,
    labelKey: 'socialMedia',
    descKey: 'socialMediaDesc',
    href: '/dashboard/crm-whatsapp',
    permission: 'view_dashboard',
  },
  {
    icon: FileText,
    labelKey: 'reports',
    descKey: 'reportsDesc',
    href: '/dashboard/reports',
    permission: 'view_dashboard',
    subItems: [
      {
        icon: TrendingUp,
        labelKey: 'cashMovementReport',
        descKey: 'cashMovementReportDesc',
        href: '/dashboard/reports/cash-movement',
        permission: 'view_financial_reports',
      },
      {
        icon: BarChart3,
        labelKey: 'monthlyTotalReport',
        descKey: 'monthlyTotalReportDesc',
        href: '/dashboard/reports/monthly-total',
        permission: 'view_financial_reports',
      },
      {
        icon: Calendar,
        labelKey: 'dailyMovementReport',
        descKey: 'dailyMovementReportDesc',
        href: '/dashboard/reports/daily-movement',
        permission: 'view_financial_reports',
      },
      {
        icon: TrendingDown,
        labelKey: 'occupancyRateReport',
        descKey: 'occupancyRateReportDesc',
        href: '/dashboard/reports/occupancy-rate',
        permission: 'view_dashboard',
      },
      {
        icon: DollarSign,
        labelKey: 'cashVaultReport',
        descKey: 'cashVaultReportDesc',
        href: '/dashboard/reports/cash-vault',
        permission: 'view_financial_reports',
      },
      {
        icon: Package,
        labelKey: 'commissionsReport',
        descKey: 'commissionsReportDesc',
        href: '/dashboard/reports/commissions',
        permission: 'view_financial_reports',
      },
      {
        icon: Receipt,
        labelKey: 'receiptsReport',
        descKey: 'receiptsReportDesc',
        href: '/dashboard/reports/receipts',
        permission: 'view_financial_reports',
      },
      {
        icon: Users,
        labelKey: 'employeeReservationsReport',
        descKey: 'employeeReservationsReportDesc',
        href: '/dashboard/reports/employee-reservations',
        permission: 'view_dashboard',
      },
      {
        icon: UserCheck,
        labelKey: 'employeeStatisticsReport',
        descKey: 'employeeStatisticsReportDesc',
        href: '/dashboard/reports/employee-statistics',
        permission: 'manage_permissions',
      },
      {
        icon: CreditCard,
        labelKey: 'servicesReport',
        descKey: 'servicesReportDesc',
        href: '/dashboard/reports/services',
        permission: 'view_financial_reports',
      },
      {
        icon: Lock,
        labelKey: 'openReservationsReport',
        descKey: 'openReservationsReportDesc',
        href: '/dashboard/reports/open-reservations',
        permission: 'view_dashboard',
      },
      {
        icon: MessageSquare,
        labelKey: 'messagesSummaryReport',
        descKey: 'messagesSummaryReportDesc',
        href: '/dashboard/reports/messages-summary',
        permission: 'access_chat',
      },
      {
        icon: Wrench,
        labelKey: 'apartmentChangeReport',
        descKey: 'apartmentChangeReportDesc',
        href: '/dashboard/reports/apartment-change',
        permission: 'view_dashboard',
      },
      {
        icon: BarChart3,
        labelKey: 'monthlyReportByMonth',
        descKey: 'monthlyReportByMonthDesc',
        href: '/dashboard/reports/monthly-by-month',
        permission: 'view_financial_reports',
      },
      {
        icon: PieChart,
        labelKey: 'taxesAndFeesReport',
        descKey: 'taxesAndFeesReportDesc',
        href: '/dashboard/reports/taxes-and-fees',
        permission: 'view_financial_reports',
      },
      {
        icon: Settings,
        labelKey: 'evaluations',
        descKey: 'evaluationsDesc',
        href: '/dashboard/reports/evaluations',
        permission: 'view_dashboard',
      },
      {
        icon: UserCheck,
        labelKey: 'tourismAuthorityReport',
        descKey: 'tourismAuthorityReportDesc',
        href: '/dashboard/reports/tourism-authority',
        permission: 'view_dashboard',
      },
      {
        icon: Building,
        labelKey: 'roomStatusByType',
        descKey: 'roomStatusByTypeDesc',
        href: '/dashboard/reports/room-status-by-type',
        permission: 'view_dashboard',
      },
      {
        icon: X,
        labelKey: 'roomDiscrepancy',
        descKey: 'roomDiscrepancyDesc',
        href: '/dashboard/reports/room-discrepancy',
        permission: 'view_dashboard',
      },
      {
        icon: FileText,
        labelKey: 'customReport',
        descKey: 'customReportDesc',
        href: '/dashboard/reports/custom',
        permission: 'view_financial_reports',
      },
      {
        icon: Receipt,
        labelKey: 'invoicesReport',
        descKey: 'invoicesReportDesc',
        href: '/dashboard/reports/invoices',
        permission: 'view_invoices',
      },
      {
        icon: Building2,
        labelKey: 'bankReport',
        descKey: 'bankReportDesc',
        href: '/dashboard/reports/bank',
        permission: 'view_financial_reports',
      },
      {
        icon: Users,
        labelKey: 'guestsReport',
        descKey: 'guestsReportDesc',
        href: '/dashboard/reports/guests',
        permission: 'view_dashboard',
      },
    ]
  },
  {
    icon: TrendingUp,
    labelKey: 'executiveDashboards',
    descKey: 'executiveDashboardsDesc',
    href: '/dashboard/executive',
    permission: 'view_executive_reports',
    subItems: [
      {
        icon: BarChart3,
        labelKey: 'gmDashboard',
        descKey: 'gmDashboardDesc',
        href: '/dashboard/executive/gm',
        permission: 'view_executive_reports',
      },
      {
        icon: DollarSign,
        labelKey: 'cfoDashboard',
        descKey: 'cfoDashboardDesc',
        href: '/dashboard/executive/cfo',
        permission: 'view_financial_reports',
      },
      {
        icon: TrendingUp,
        labelKey: 'salesDashboard',
        descKey: 'salesDashboardDesc',
        href: '/dashboard/executive/sales',
        permission: 'view_reports',
      },
      {
        icon: Brain,
        labelKey: 'aiForecasting',
        descKey: 'aiForecastingDesc',
        href: '/dashboard/ai-forecasting',
        permission: 'view_reports',
      },
      {
        icon: AlertTriangle,
        labelKey: 'anomalyDetection',
        descKey: 'anomalyDetectionDesc',
        href: '/dashboard/anomaly-detection',
        permission: 'view_reports',
      },
      {
        icon: Users,
        labelKey: 'guestSegmentation',
        descKey: 'guestSegmentationDesc',
        href: '/dashboard/guest-segmentation',
        permission: 'view_reports',
      },
      {
        icon: FileText,
        labelKey: 'reportBuilder',
        descKey: 'reportBuilderDesc',
        href: '/dashboard/report-builder',
        permission: 'view_reports',
      },
      {
        icon: BarChart3,
        labelKey: 'advancedReports',
        descKey: 'advancedReportsDesc',
        href: '/dashboard/advanced-reports',
        permission: 'view_reports',
      },
      {
        icon: Clock,
        labelKey: 'scheduledReports',
        descKey: 'scheduledReportsDesc',
        href: '/dashboard/scheduled-reports',
        permission: 'view_reports',
      }
    ]
  },
  {
    icon: Wrench,
    labelKey: 'maintenance',
    descKey: 'maintenanceDesc',
    href: '/dashboard/maintenance',
    permission: 'view_maintenance',
  },
  {
    icon: Award,
    labelKey: 'loyaltyProgram',
    descKey: 'loyaltyProgramDesc',
    href: '/dashboard/loyalty',
    permission: 'view_loyalty',
  },
  {
    icon: Star,
    labelKey: 'ratings',
    descKey: 'ratingsDesc',
    href: '/dashboard/ratings',
    permission: 'view_ratings',
  },
  {
    icon: Settings,
    labelKey: 'settings',
    descKey: 'settingsDesc',
    href: '/dashboard/settings',
    permission: 'view_settings',
    subItems: [
      {
        icon: List,
        labelKey: 'menuItems',
        descKey: 'menuItemsDesc',
        href: '/dashboard/settings/menu-items',
        permission: 'manage_menu_items',
      },
      {
        icon: Users,
        labelKey: 'hrManagement',
        descKey: 'hrManagementDesc',
        href: '/dashboard/settings/hr',
        permission: 'manage_permissions',
      },
      {
        icon: DollarSign,
        labelKey: 'accountingSettings',
        descKey: 'accountingSettingsDesc',
        href: '/dashboard/settings/accounting',
        permission: 'manage_general_settings',
      },
      {
        icon: CreditCard,
        labelKey: 'paymentGateways',
        descKey: 'paymentGatewaysDesc',
        href: '/dashboard/settings/payment-gateways',
        permission: 'manage_general_settings',
      },
      {
        icon: Bot,
        labelKey: 'aiChatbotConfig',
        descKey: 'aiChatbotConfigDesc',
        href: '/dashboard/settings/ai-chatbot-config',
        permission: 'manage_general_settings',
      },
      {
        icon: Bell,
        labelKey: 'notificationsConfig',
        descKey: 'notificationsConfigDesc',
        href: '/dashboard/settings/notifications-config',
        permission: 'manage_general_settings',
      }
    ]
  },
];

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ className, isCollapsed: externalCollapsed, onToggle }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false); // القائمة مفتوحة بشكل افتراضي
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { t } = useLanguage();
  const [logo, setLogo] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  
  // القائمة الجانبية دائماً مفتوحة بشكل افتراضي على جميع الأحجام
  const [isDesktop, setIsDesktop] = useState(true);
  
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  // استخدام الحالة الخارجية أو الداخلية - القائمة مفتوحة افتراضياً
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  
  const handleMenuClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };
  
  const toggleCollapse = onToggle || (() => setInternalCollapsed(!internalCollapsed));
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // تحميل إعدادات القائمة الجانبية من Firebase
  useEffect(() => {
    const loadSidebarSettings = async () => {
      try {
        // عرض جميع الأقسام بشكل افتراضي (تم تعطيل التحكم من Firebase)
        // المستخدم يمكنه إخفاء ما يريد من صفحة الإعدادات
        const allItems = new Set<string>(navigationItems.map(item => {
          const pathParts = item.href.split('/').filter(p => p);
          return pathParts.length > 1 ? pathParts.slice(1).join('-') : (pathParts[0] === 'dashboard' ? 'dashboard' : pathParts[0]);
        }));
        setVisibleItems(allItems);
        
        /* 
        // الكود القديم - معطل مؤقتاً لعرض كل الأقسام
        const settingsDoc = await getDoc(doc(db, 'developerSettings', 'sidebarVisibility'));
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          const hotels = data.hotels || [];
          
          const currentHotelId = 'hotel1';
          const hotelSettings = hotels.find((h: any) => h.hotelId === currentHotelId);
          
          if (hotelSettings) {
            const enabledItems = new Set<string>(
              hotelSettings.items
                .filter((item: any) => item.enabled)
                .map((item: any) => String(item.id))
            );
            setVisibleItems(enabledItems);
          } else {
            setVisibleItems(allItems);
          }
        } else {
          setVisibleItems(allItems);
        }
        */
      } catch (error) {
        console.error('Error loading sidebar settings:', error);
        // في حالة الخطأ: عرض كل شيء
        const allItems = new Set<string>(navigationItems.map(item => {
          const pathParts = item.href.split('/').filter(p => p);
          return pathParts.length > 1 ? pathParts.slice(1).join('-') : (pathParts[0] === 'dashboard' ? 'dashboard' : pathParts[0]);
        }));
        setVisibleItems(allItems);
      } finally {
        setLoadingSettings(false);
      }
    };

    if (user) {
      loadSidebarSettings();
    }
  }, [user]);

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

  // حساب إجمالي الرسائل غير المقروءة
  useEffect(() => {
    if (!user) return;

    const countUnreadMessages = async () => {
      try {
        const currentUserId = user.username || user.email;
        if (!currentUserId) return;

        const { collection, query, where, getDocs } = await import('firebase/firestore');
        
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', currentUserId));
        const chatsSnapshot = await getDocs(q);
        
        let totalUnread = 0;
        
        for (const chatDoc of chatsSnapshot.docs) {
          const messagesRef = collection(db, 'messages');
          const messagesQuery = query(
            messagesRef,
            where('chatId', '==', chatDoc.id),
            where('read', '==', false)
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          
          messagesSnapshot.forEach((msgDoc) => {
            const msgData = msgDoc.data();
            if (msgData.senderId !== currentUserId) {
              totalUnread++;
            }
          });
        }
        
        setTotalUnreadMessages(totalUnread);
      } catch (error) {
        console.error('Error counting unread messages:', error);
      }
    };

    countUnreadMessages();
    const interval = setInterval(countUnreadMessages, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // دالة للتحقق من الصلاحيات
  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    
    // المدير لديه كل الصلاحيات
    if (user?.role === 'admin') return true;
    
    // التحقق من صلاحيات المستخدم
    const userPermissions = user?.permissions || [];
    return userPermissions.includes(permission);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // فلترة العناصر حسب الصلاحيات والإعدادات
  const filteredItems = navigationItems.filter(item => {
    if (!hasPermission(item.permission)) return false;
    
    // استخراج ID من href - نأخذ الجزء الأخير بعد /dashboard/
    const pathParts = item.href.split('/').filter(p => p);
    // للـ /dashboard/crm-whatsapp يجب أن يكون crm-whatsapp وليس whatsapp فقط
    const itemId = pathParts.length > 1 ? pathParts.slice(1).join('-') : (pathParts[0] === 'dashboard' ? 'dashboard' : pathParts[0]);
    
    // إذا لم يتم تحميل الإعدادات بعد، عرض كل شيء
    if (loadingSettings) return true;
    
    // التحقق من أن القسم مفعل
    return visibleItems.has(itemId);
  });

  // Toggle section expansion
  const toggleSection = (href: string) => {
    setExpandedSection(expandedSection === href ? null : href);
  };

  // Auto-expand section if current path matches
  useEffect(() => {
    const currentSection = filteredItems.find(item => 
      item.subItems && (pathname === item.href || item.subItems.some(sub => pathname.startsWith(sub.href)))
    );
    if (currentSection) {
      setExpandedSection(currentSection.href);
    }
  }, [pathname]);

  return (
    <>
      {/* Overlay للموبايل فقط - عند فتح القائمة */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={handleMenuClick}
        />
      )}
      
      <Card className={cn(
        "flex flex-col h-full border-0 rounded-none shadow-2xl transition-all duration-300",
        "bg-black/30 backdrop-blur-xl border-r border-white/10",
        "dark:bg-black/30 dark:border-white/10",
        // عرض القائمة: أضيق بكثير ليناسب النص فقط
        isCollapsed ? "w-16" : "w-56",
        // للجوال: sidebar يكون fixed من اليمين (RTL)
        "fixed right-0 top-0 md:relative h-screen z-30",
        // على الجوال: يخفى الـ sidebar عند الإغلاق (يطلع لليمين في RTL)
        "transition-transform duration-300",
        isCollapsed ? "translate-x-full md:translate-x-0" : "translate-x-0",
        className
      )}>
      {/* Logo Section */}
      {logo && !isCollapsed && (
        <div className="p-3 pb-3 border-b border-white/10 dark:border-white/10 light:border-purple-200">
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[120px]">
              {/* Logo - Clean, No Background */}
              <div className="relative w-full aspect-square">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  style={{ 
                    backgroundColor: 'transparent',
                    mixBlendMode: 'normal'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Logo */}
      {logo && isCollapsed && (
        <div className="p-3 border-b border-white/10 flex items-center justify-center">
          <div className="relative w-10 h-10">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-full h-full object-contain"
              style={{ 
                backgroundColor: 'transparent',
                mixBlendMode: 'normal'
              }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-0.5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedSection === item.href;
            
            return (
              <div key={item.href}>
                {/* Main Item - Always clickable */}
                <Link href={item.href} onClick={handleMenuClick}>
                  <div 
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative",
                      isActive 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/50 scale-105" 
                        : "text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 hover:shadow-lg hover:scale-105",
                      isCollapsed && "justify-center px-3"
                    )}
                    title={isCollapsed ? t(item.labelKey as any) : undefined}
                  >
                    <div className={cn(
                      "flex items-center justify-center rounded-lg transition-all duration-300",
                      isActive ? "bg-white/20 p-2" : "group-hover:bg-white/10 p-2",
                      isCollapsed && "p-2.5"
                    )}>
                      <Icon className={cn(
                        "flex-shrink-0 transition-all duration-300",
                        isCollapsed ? "w-6 h-6" : "w-5 h-5",
                        isActive && "drop-shadow-lg"
                      )} />
                    </div>
                    
                    {/* Badge للرسائل غير المقروءة */}
                    {item.href === '/dashboard/chat' && totalUnreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                        {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                      </span>
                    )}
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base truncate tracking-wide">{t(item.labelKey as any)}</p>
                        {item.descKey && (
                          <p className="text-xs opacity-80 truncate mt-0.5 font-medium">{t(item.descKey as any)}</p>
                        )}
                      </div>
                    )}

                    {!isCollapsed && hasSubItems && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSection(item.href);
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <ChevronLeft 
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isExpanded && "rotate-[-90deg]"
                          )} 
                        />
                      </button>
                    )}

                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-l-full" />
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap border border-white/10 backdrop-blur-sm">
                        <div className="font-bold text-base mb-1">{t(item.labelKey as any)}</div>
                        {item.descKey && (
                          <div className="text-xs text-slate-300">{t(item.descKey as any)}</div>
                        )}
                        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-slate-800 rotate-45 border-l border-t border-white/10" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Sub Items */}
                {hasSubItems && !isCollapsed && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems!.filter(sub => hasPermission(sub.permission)).map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href);

                      return (
                        <Link key={subItem.href} href={subItem.href} onClick={handleMenuClick}>
                          <div className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative text-sm",
                            isSubActive 
                              ? "bg-gradient-to-r from-blue-500/15 to-indigo-500/15 text-white border border-blue-400/20" 
                              : "text-blue-200/70 hover:text-blue-200 hover:bg-slate-700/30",
                          )}>
                            <SubIcon className="w-4 h-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{t(subItem.labelKey as any)}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

    </Card>
    </>
  );
}