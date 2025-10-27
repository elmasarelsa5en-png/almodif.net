'use client';

import { type ComponentType, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogoUploader } from '@/components/settings/logo-uploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SoundSettings } from '@/components/settings/sound-settings';
import {
  Activity,
  BadgeCheck,
  Bell,
  BellRing,
  Building2,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  CloudDownload,
  Database,
  Globe,
  Link2,
  Lock,
  Mail,
  MessageSquare,
  Palette,
  Phone,
  RefreshCcw,
  Search,
  ServerCog,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';

type IconType = ComponentType<{ className?: string }>;

interface GeneralSettings {
  companyName: string;
  companyTagline: string;
  industry: string;
  branchCount: number;
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  systemMode: string;
}

interface NotificationSettings {
  enableEmail: boolean;
  enableSMS: boolean;
  enablePush: boolean;
  soundEnabled: boolean;
  dailyDigest: boolean;
  attendanceAlerts: boolean;
  financeAlerts: boolean;
  disableQuietHours: boolean;
}

interface SecuritySettings {
  twoFactor: boolean;
  autoLogoutMinutes: number;
  allowGuestLogin: boolean;
  passwordRotationDays: number;
  biometricSupport: boolean;
  loginAlerts: boolean;
  ipRestriction: boolean;
  maintenanceMode: boolean;
}

interface IntegrationSettings {
  whatsapp: boolean;
  accounting: boolean;
  inventory: boolean;
  crm: boolean;
  googleCalendar: boolean;
  slack: boolean;
  customWebhooks: boolean;
}

interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: string;
  lastBackup: string;
  retentionDays: number;
  offsiteReplication: boolean;
  compressBackups: boolean;
}

interface AppearanceSettings {
  accentColor: string;
  layoutDensity: string;
  bubbleBackground: boolean;
  animatedTransitions: boolean;
  showTips: boolean;
}

interface AdvancedSettings {
  autoUpdates: boolean;
  betaFeatures: boolean;
  cacheSize: number;
  monitorPerformance: boolean;
  purgeLogs: boolean;
}

interface WebsiteSettings {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  metaTitle: string;
  metaKeywords: string;
  contactEmail: string;
  contactPhone: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  enableBookingWidget: boolean;
  enableLiveChat: boolean;
  maintenanceMode: boolean;
}

interface StoredSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
  backups: BackupSettings;
  appearance: AppearanceSettings;
  advanced: AdvancedSettings;
  website: WebsiteSettings;
}

type BooleanKeys<T> = {
  [K in keyof T]-?: T[K] extends boolean ? K : never;
}[keyof T];

interface ToggleConfig<K> {
  key: K;
  label: string;
  description: string;
  icon?: IconType;
}

const STORAGE_KEY = 'system:settings:v1';

const defaultSettings: StoredSettings = {
  general: {
    companyName: 'نظام المضيف الذكي',
    companyTagline: 'حلول متكاملة لإدارة الضيافة والعمليات التشغيلية',
    industry: 'الضيافة والفندقة',
    branchCount: 3,
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    currency: 'SAR',
    systemMode: 'dark'
  },
  notifications: {
    enableEmail: true,
    enableSMS: false,
    enablePush: true,
    soundEnabled: true,
    dailyDigest: true,
    attendanceAlerts: true,
    financeAlerts: true,
    disableQuietHours: false
  },
  security: {
    twoFactor: true,
    autoLogoutMinutes: 30,
    allowGuestLogin: false,
    passwordRotationDays: 90,
    biometricSupport: false,
    loginAlerts: true,
    ipRestriction: false,
    maintenanceMode: false
  },
  integrations: {
    whatsapp: true,
    accounting: true,
    inventory: true,
    crm: true,
    googleCalendar: false,
    slack: false,
    customWebhooks: true
  },
  backups: {
    autoBackup: true,
    backupFrequency: 'daily',
    lastBackup: '2025-10-10 04:30',
    retentionDays: 30,
    offsiteReplication: true,
    compressBackups: true
  },
  appearance: {
    accentColor: 'indigo',
    layoutDensity: 'comfortable',
    bubbleBackground: true,
    animatedTransitions: true,
    showTips: false
  },
  advanced: {
    autoUpdates: true,
    betaFeatures: false,
    cacheSize: 512,
    monitorPerformance: true,
    purgeLogs: false
  },
  website: {
    siteName: 'نظام المضيف الذكي',
    siteUrl: 'https://almodif.com',
    siteDescription: 'نظام شامل لإدارة الضيافة والعمليات التشغيلية بكفاءة عالية',
    metaTitle: 'المضيف الذكي - نظام إدارة الضيافة',
    metaKeywords: 'إدارة الفنادق، حجوزات، شقق مفروشة، إدارة الضيافة',
    contactEmail: 'info@almodif.com',
    contactPhone: '+966 50 123 4567',
    socialFacebook: 'https://facebook.com/almodif',
    socialInstagram: 'https://instagram.com/almodif',
    socialTwitter: 'https://twitter.com/almodif',
    enableBookingWidget: true,
    enableLiveChat: true,
    maintenanceMode: false
  }
};

const mergeSettings = (base: StoredSettings, incoming: Partial<StoredSettings>): StoredSettings => ({
  general: { ...base.general, ...(incoming.general ?? {}) },
  notifications: { ...base.notifications, ...(incoming.notifications ?? {}) },
  security: { ...base.security, ...(incoming.security ?? {}) },
  integrations: { ...base.integrations, ...(incoming.integrations ?? {}) },
  backups: { ...base.backups, ...(incoming.backups ?? {}) },
  appearance: { ...base.appearance, ...(incoming.appearance ?? {}) },
  advanced: { ...base.advanced, ...(incoming.advanced ?? {}) },
  website: { ...base.website, ...(incoming.website ?? {}) }
});

const NOTIFICATION_TOGGLES: ToggleConfig<BooleanKeys<NotificationSettings>>[] = [
  {
    key: 'enableEmail',
    label: 'تنبيهات البريد الإلكتروني',
    description: 'إرسال إشعارات مفصلة وملخص يومي عبر البريد.',
    icon: Bell
  },
  {
    key: 'enableSMS',
    label: 'رسائل SMS الفورية',
    description: 'تنبيهات عاجلة للحالات الحرجة مباشرة إلى الجوال.',
    icon: BellRing
  },
  {
    key: 'enablePush',
    label: 'إشعارات داخل النظام',
    description: 'عرض تنبيهات لحظية على لوحة التحكم والتطبيقات.',
    icon: Activity
  },
  {
    key: 'soundEnabled',
    label: 'تشغيل المؤثرات الصوتية',
    description: 'إضافة مؤثرات خاصة لكل حدث مهم داخل النظام.',
    icon: Sparkles
  },
  {
    key: 'dailyDigest',
    label: 'التقرير اليومي المجمع',
    description: 'وصول تقرير صباحي بأهم المؤشرات التشغيلية.',
    icon: RefreshCcw
  },
  {
    key: 'attendanceAlerts',
    label: 'تنبيهات الحضور والانصراف',
    description: 'مراقبة التأخير، الغياب، أو تسجيل الخروج المبكر.',
    icon: Users
  },
  {
    key: 'financeAlerts',
    label: 'تنبيهات العمليات المالية',
    description: 'مراقبة الفواتير والمصاريف غير المعتادة فور حدوثها.',
    icon: Database
  }
];

const SECURITY_TOGGLES: ToggleConfig<BooleanKeys<SecuritySettings>>[] = [
  {
    key: 'twoFactor',
    label: 'تفعيل المصادقة الثنائية',
    description: 'إضافة طبقة حماية إضافية عند تسجيل الدخول.',
    icon: ShieldCheck
  },
  {
    key: 'allowGuestLogin',
    label: 'دخول الضيوف المؤقت',
    description: 'منح صلاحيات محدودة للموردين أو الضيوف.',
    icon: Users
  },
  {
    key: 'biometricSupport',
    label: 'التوثيق الحيوي',
    description: 'تفعيل الدخول ببصمة الإصبع أو الوجه في التطبيقات.',
    icon: Sparkles
  },
  {
    key: 'loginAlerts',
    label: 'تنبيهات تسجيل الدخول الجديدة',
    description: 'إشعار فوري عند الدخول من جهاز أو موقع جديد.',
    icon: Shield
  },
  {
    key: 'ipRestriction',
    label: 'تقييد الدخول بحسب IP',
    description: 'السماح بالوصول فقط من الشبكات المعتمدة.',
    icon: Lock
  },
  {
    key: 'maintenanceMode',
    label: 'وضع الصيانة العام',
    description: 'عرض رسالة صيانة وإيقاف العمليات الحرجة مؤقتًا.',
    icon: ShieldAlert
  }
];

const INTEGRATION_OPTIONS: ToggleConfig<BooleanKeys<IntegrationSettings>>[] = [
  {
    key: 'whatsapp',
    label: 'تكامل واتساب للأعمال',
    description: 'مزامنة المحادثات والردود مع فريق خدمة العملاء.',
    icon: BellRing
  },
  {
    key: 'accounting',
    label: 'الأنظمة المحاسبية',
    description: 'استيراد القيود وتحديث الحركات المالية تلقائيًا.',
    icon: Database
  },
  {
    key: 'inventory',
    label: 'إدارة المخزون',
    description: 'تبادل بيانات الأصناف والمستودعات في الوقت الفعلي.',
    icon: CloudDownload
  },
  {
    key: 'crm',
    label: 'إدارة علاقات العملاء',
    description: 'دمج بيانات العملاء وسجل التفاعل في مكان واحد.',
    icon: Users
  },
  {
    key: 'googleCalendar',
    label: 'تقويم Google',
    description: 'مزامنة المواعيد والاجتماعات مع فريق العمل.',
    icon: RefreshCcw
  },
  {
    key: 'customWebhooks',
    label: 'تكاملات مخصّصة (Webhook)',
    description: 'ربط النظام مع أي منصة خارجية باستخدام Webhook.',
    icon: Link2
  }
];

const BACKUP_TOGGLES: ToggleConfig<BooleanKeys<BackupSettings>>[] = [
  {
    key: 'autoBackup',
    label: 'تشغيل النسخ التلقائي',
    description: 'إنشاء نسخة احتياطية وفقًا للجدول المحدد.',
    icon: RefreshCcw
  },
  {
    key: 'offsiteReplication',
    label: 'نسخ خارج الموقع',
    description: 'حفظ نسخة مشفرة في مركز بيانات منفصل.',
    icon: CloudDownload
  },
  {
    key: 'compressBackups',
    label: 'ضغط النسخ الاحتياطية',
    description: 'تقليل حجم الملفات مع الحفاظ على الدقة.',
    icon: Activity
  }
];

const APPEARANCE_TOGGLES: ToggleConfig<BooleanKeys<AppearanceSettings>>[] = [
  {
    key: 'bubbleBackground',
    label: 'خلفية الفقاعات التفاعلية',
    description: 'إضافة تأثير بصري ديناميكي في الواجهة.',
    icon: Sparkles
  },
  {
    key: 'animatedTransitions',
    label: 'الانتقالات المتحركة',
    description: 'تنقل ديناميكي وسلس بين الصفحات.',
    icon: Activity
  },
  {
    key: 'showTips',
    label: 'تلميحات الاستخدام الذكية',
    description: 'عرض إرشادات موجهة للمستخدمين الجدد.',
    icon: BadgeCheck
  }
];

const ADVANCED_TOGGLES: ToggleConfig<BooleanKeys<AdvancedSettings>>[] = [
  {
    key: 'autoUpdates',
    label: 'التحديثات التلقائية',
    description: 'تثبيت أحدث التحسينات فور توفرها.',
    icon: RefreshCcw
  },
  {
    key: 'betaFeatures',
    label: 'تجربة الميزات التجريبية',
    description: 'اختبار الميزات قبل إصدارها الرسمي.',
    icon: Sparkles
  },
  {
    key: 'monitorPerformance',
    label: 'مراقبة الأداء اللحظي',
    description: 'جمع مؤشرات الأداء وإرسال تنبيهات فورية.',
    icon: Activity
  },
  {
    key: 'purgeLogs',
    label: 'تنظيف السجلات القديمة',
    description: 'حذف السجلات بعد انتهاء صلاحيتها تلقائيًا.',
    icon: Zap
  }
];

const BACKUP_FREQUENCIES = [
  { value: 'hourly', label: 'كل ساعة' },
  { value: 'daily', label: 'يوميًا' },
  { value: 'weekly', label: 'أسبوعيًا' },
  { value: 'monthly', label: 'شهريًا' }
];

const ACCENT_OPTIONS = [
  { value: 'indigo', label: 'أزرق بنفسجي' },
  { value: 'emerald', label: 'أخضر زمردي' },
  { value: 'amber', label: 'ذهبي فاخر' },
  { value: 'rose', label: 'وردي دافئ' },
  { value: 'slate', label: 'رمادي احترافي' }
];

const DENSITY_OPTIONS = [
  { value: 'compact', label: 'مضغوط' },
  { value: 'comfortable', label: 'مريح' },
  { value: 'spacious', label: 'واسع' }
];

interface ToggleRowProps {
  icon?: IconType;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

const ToggleRow = ({ icon: Icon, label, description, checked, onCheckedChange }: ToggleRowProps) => (
  <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-slate-100">
        {Icon ? <Icon className="w-4 h-4 text-purple-300" /> : null}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="text-xs text-slate-400 leading-5">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<StoredSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<StoredSettings>;
      setSettings(mergeSettings(defaultSettings, parsed));
    } catch (error) {
      setSettings(defaultSettings);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, loading]);

  const updateSetting = <Section extends keyof StoredSettings, Key extends keyof StoredSettings[Section]>(
    section: Section,
    key: Key,
    value: StoredSettings[Section][Key]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  const activeIntegrations = useMemo(
    () => Object.values(settings.integrations).filter(Boolean).length,
    [settings.integrations]
  );

  const activeNotificationChannels = useMemo(
    () =>
      [
        settings.notifications.enableEmail,
        settings.notifications.enableSMS,
        settings.notifications.enablePush,
        settings.notifications.soundEnabled
      ].filter(Boolean).length,
    [settings.notifications]
  );

  const stats = useMemo(
    () => [
      {
        icon: Building2,
        title: 'الفروع النشطة',
        value: settings.general.branchCount,
        badge: 'نمو +2 هذا الشهر'
      },
      {
        icon: Bell,
        title: 'قنوات التنبيه الفعالة',
        value: `${activeNotificationChannels}/4`,
        badge: settings.notifications.dailyDigest ? 'التقرير اليومي مفعل' : 'التقرير اليومي متوقف'
      },
      {
        icon: ShieldCheck,
        title: 'مستوى الأمان',
        value: settings.security.twoFactor ? 'مرتفع' : 'متوسط',
        badge: settings.security.twoFactor ? 'المصادقة الثنائية مفعّلة' : 'ينصح بتفعيل 2FA'
      },
      {
        icon: Database,
        title: 'حالة النسخ الاحتياطي',
        value: settings.backups.autoBackup ? settings.backups.backupFrequency : 'يدوي',
        badge: `آخر نسخة: ${settings.backups.lastBackup}`
      }
    ], [settings, activeNotificationChannels]
  );

  const quickActions = useMemo(
    () => [
      {
        icon: Globe,
        title: 'إعدادات الموقع الإلكتروني',
        description: 'تحديث معلومات الموقع والتواصل ومحركات البحث.',
        action: 'website'
      },
      {
        icon: Users,
        title: 'إدارة الصلاحيات',
        description: 'تعيين الأدوار والوصول لكل فريق عمل.',
        href: '/settings/hr'
      },
      {
        icon: BookOpen,
        title: 'كتالوج الشقق',
        description: 'إدارة أنواع الشقق والغرف وأسعارها.',
        href: '/settings/rooms-catalog'
      },
      {
        icon: Building2,
        title: 'إدارة الموارد البشرية',
        description: 'إضافة وتعديل الموظفين والصلاحيات.',
        href: '/settings/hr'
      },
      {
        icon: BellRing,
        title: 'إعدادات الأصوات',
        description: 'تخصيص نغمات التنبيه لكل حدث مهم.',
        href: '/settings/sound-settings'
      },
      {
        icon: ServerCog,
        title: 'جدولة النسخ الاحتياطي',
        description: 'مراجعة توقيت النسخ الاحتياطية القادمة.',
        href: '/dashboard/accounting/reports'
      }
    ], []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-purple-400 animate-spin" />
          <p className="text-sm text-slate-300">جار تحميل إعدادات النظام...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30">
                  نظام متكامل
                </Badge>
                <BadgeCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <h1 className="text-4xl font-bold text-white">لوحة إعدادات النظام</h1>
              <p className="text-slate-300 text-sm leading-6 max-w-2xl">
                تحكم كامل في الهوية، التنبيهات، الأمان، التكاملات، النسخ الاحتياطي، المظهر، والخيارات المتقدمة من مكان واحد.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={resetSettings}
              variant="outline"
              className="border-red-400/40 text-red-200 bg-red-500/10 hover:bg-red-500/20"
            >
              إعادة تعيين الإعدادات
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <ChevronRight className="ml-2 w-5 h-5" />
              العودة للوحة التحكم
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-slate-700/60 bg-slate-900/60 backdrop-blur-md shadow-lg">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-slate-900/70 border border-white/10">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge className="bg-white/10 border-white/20 text-white text-[11px]" variant="outline">
                      {stat.badge}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-200/80">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const handleClick = () => {
              if ('action' in action && action.action === 'website') {
                // التمرير إلى قسم التبويبات وتفعيل تبويب الموقع الإلكتروني
                const tabsList = document.querySelector('[role="tablist"]');
                if (tabsList) {
                  tabsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setTimeout(() => {
                    const websiteTab = document.querySelector('[value="website"]') as HTMLButtonElement;
                    if (websiteTab) {
                      websiteTab.click();
                    }
                  }, 300);
                }
              } else if ('href' in action) {
                router.push(action.href);
              }
            };
            
            return (
              <Card
                key={action.title}
                onClick={handleClick}
                className="border-slate-700/60 bg-slate-900/60 hover:bg-slate-900/80 transition-colors cursor-pointer group"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 group-hover:bg-purple-500/30">
                      <Icon className="w-5 h-5 text-purple-200" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base">{action.title}</h3>
                      <p className="text-sm text-slate-300/80">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <Card className="border-slate-700/60 bg-slate-900/50 backdrop-blur-lg shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-white text-2xl flex items-center gap-3">
                <ServerCog className="w-6 h-6 text-purple-300" />
                إدارة إعدادات النظام
              </CardTitle>
              <CardDescription className="text-slate-300">
                اختر التبويب المناسب وقم بتحديث الإعدادات، وسيتم حفظ تغييراتك تلقائيًا.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="flex flex-wrap gap-2 bg-slate-900/80 border border-slate-700/60 p-2 rounded-2xl text-slate-200">
                <TabsTrigger value="general" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  العام
                </TabsTrigger>
                <TabsTrigger value="website" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  الموقع الإلكتروني
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  التنبيهات
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  الأمان
                </TabsTrigger>
                <TabsTrigger value="integrations" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  التكاملات
                </TabsTrigger>
                <TabsTrigger value="backups" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  النسخ الاحتياطي
                </TabsTrigger>
                <TabsTrigger value="appearance" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  المظهر
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  متقدم
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-300" />
                        هوية المنشأة
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        تعديل الهوية المعروضة في الفواتير والتقارير الرسمية.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">اسم المنشأة</label>
                        <Input
                          value={settings.general.companyName}
                          onChange={(event) => updateSetting('general', 'companyName', event.target.value)}
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <LogoUploader />
                        <label className="text-sm text-slate-200">الشعار المختصر</label>
                        <Textarea
                          rows={3}
                          value={settings.general.companyTagline}
                          onChange={(event) => updateSetting('general', 'companyTagline', event.target.value)}
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">القطاع</label>
                          <Input
                            value={settings.general.industry}
                            onChange={(event) => updateSetting('general', 'industry', event.target.value)}
                            className="bg-slate-950 border-slate-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">عدد الفروع</label>
                          <Input
                            type="number"
                            min={1}
                            value={settings.general.branchCount}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              updateSetting(
                                'general',
                                'branchCount',
                                Number.isNaN(value) || value < 1 ? 1 : value
                              );
                            }}
                            className="bg-slate-950 border-slate-700 text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">اللغة الرئيسية</label>
                          <Select
                            value={settings.general.language}
                            onValueChange={(value) => updateSetting('general', 'language', value)}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="اختر اللغة" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-700 text-white">
                              <SelectItem value="ar">العربية</SelectItem>
                              <SelectItem value="en">الإنجليزية</SelectItem>
                              <SelectItem value="fr">الفرنسية</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">التوقيت</label>
                          <Select
                            value={settings.general.timezone}
                            onValueChange={(value) => updateSetting('general', 'timezone', value)}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="اختر التوقيت" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-700 text-white">
                              <SelectItem value="Asia/Riyadh">GMT+3 | الرياض</SelectItem>
                              <SelectItem value="Asia/Dubai">GMT+4 | دبي</SelectItem>
                              <SelectItem value="Europe/London">GMT | لندن</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">صيغة التاريخ</label>
                          <Select
                            value={settings.general.dateFormat}
                            onValueChange={(value) => updateSetting('general', 'dateFormat', value)}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="اختر الصيغة" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-700 text-white">
                              <SelectItem value="DD/MM/YYYY">31/12/2025</SelectItem>
                              <SelectItem value="MM/DD/YYYY">12/31/2025</SelectItem>
                              <SelectItem value="YYYY-MM-DD">2025-12-31</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">العملة الرئيسية</label>
                          <Select
                            value={settings.general.currency}
                            onValueChange={(value) => updateSetting('general', 'currency', value)}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="اختر العملة" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-700 text-white">
                              <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                              <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                              <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                              <SelectItem value="EUR">يورو (EUR)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">وضع الواجهة</label>
                        <Select
                          value={settings.general.systemMode}
                          onValueChange={(value) => updateSetting('general', 'systemMode', value)}
                        >
                          <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder="اختر الوضع" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-700 text-white">
                            <SelectItem value="dark">الوضع الداكن</SelectItem>
                            <SelectItem value="light">الوضع الفاتح</SelectItem>
                            <SelectItem value="system">حسب إعدادات الجهاز</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-300" />
                        موجز الحالة الحالية
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        نظرة سريعة على أداء المنظومة وفق إعداداتك الحالية.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <Shield className="w-4 h-4 text-purple-300" />
                          مستوى الحماية
                        </div>
                        <p className="text-white text-xl font-semibold">
                          {settings.security.twoFactor ? 'محمي بالكامل' : 'حماية أساسية'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {settings.security.loginAlerts
                            ? 'المراقبة اللحظية لتسجيل الدخول فعّالة.'
                            : 'ننصح بتفعيل تنبيهات الدخول لتحسين الحماية.'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <Link2 className="w-4 h-4 text-purple-300" />
                          التكاملات المتصلة
                        </div>
                        <p className="text-white text-xl font-semibold">{activeIntegrations} تكاملات نشطة</p>
                        <p className="text-xs text-slate-400">
                          يشمل واتساب، الأنظمة المحاسبية، المخزون، وقنوات الدعم.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <RefreshCcw className="w-4 h-4 text-purple-300" />
                          حالة النسخ الاحتياطي
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <p className="text-white text-lg font-semibold">
                            {settings.backups.autoBackup ? 'نسخ احتياطي تلقائي' : 'النسخ الاحتياطي يدوي'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            آخر نسخة عند {settings.backups.lastBackup}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="website" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-300" />
                        معلومات الموقع
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        تحديث معلومات الموقع الإلكتروني الأساسية والبيانات الوصفية.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">اسم الموقع</label>
                        <Input
                          value={settings.website.siteName}
                          onChange={(event) => updateSetting('website', 'siteName', event.target.value)}
                          placeholder="اسم موقعك الإلكتروني"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">رابط الموقع (URL)</label>
                        <Input
                          value={settings.website.siteUrl}
                          onChange={(event) => updateSetting('website', 'siteUrl', event.target.value)}
                          placeholder="https://example.com"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">وصف الموقع</label>
                        <Textarea
                          rows={3}
                          value={settings.website.siteDescription}
                          onChange={(event) => updateSetting('website', 'siteDescription', event.target.value)}
                          placeholder="وصف موجز لموقعك يظهر في محركات البحث"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200 flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          عنوان التحسين لمحركات البحث (Meta Title)
                        </label>
                        <Input
                          value={settings.website.metaTitle}
                          onChange={(event) => updateSetting('website', 'metaTitle', event.target.value)}
                          placeholder="العنوان الذي يظهر في نتائج البحث"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">الكلمات المفتاحية (Meta Keywords)</label>
                        <Textarea
                          rows={2}
                          value={settings.website.metaKeywords}
                          onChange={(event) => updateSetting('website', 'metaKeywords', event.target.value)}
                          placeholder="ضع الكلمات المفتاحية مفصولة بفاصلة"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Mail className="w-5 h-5 text-purple-300" />
                        معلومات الاتصال
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        بيانات التواصل التي تظهر للزوار والعملاء.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          البريد الإلكتروني
                        </label>
                        <Input
                          type="email"
                          value={settings.website.contactEmail}
                          onChange={(event) => updateSetting('website', 'contactEmail', event.target.value)}
                          placeholder="info@example.com"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          رقم الهاتف
                        </label>
                        <Input
                          type="tel"
                          value={settings.website.contactPhone}
                          onChange={(event) => updateSetting('website', 'contactPhone', event.target.value)}
                          placeholder="+966 50 123 4567"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 space-y-3">
                        <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                          <Share2 className="w-4 h-4" />
                          روابط مواقع التواصل الاجتماعي
                        </p>
                        <div className="space-y-3">
                          <Input
                            value={settings.website.socialFacebook}
                            onChange={(event) => updateSetting('website', 'socialFacebook', event.target.value)}
                            placeholder="رابط Facebook"
                            className="bg-slate-950 border-slate-700 text-white text-sm"
                          />
                          <Input
                            value={settings.website.socialInstagram}
                            onChange={(event) => updateSetting('website', 'socialInstagram', event.target.value)}
                            placeholder="رابط Instagram"
                            className="bg-slate-950 border-slate-700 text-white text-sm"
                          />
                          <Input
                            value={settings.website.socialTwitter}
                            onChange={(event) => updateSetting('website', 'socialTwitter', event.target.value)}
                            placeholder="رابط Twitter/X"
                            className="bg-slate-950 border-slate-700 text-white text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Settings className="w-5 h-5 text-purple-300" />
                        خيارات الموقع المتقدمة
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        تفعيل أو إيقاف ميزات الموقع الإلكتروني.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ToggleRow
                          icon={BookOpen}
                          label="تفعيل نظام الحجز المباشر"
                          description="السماح للعملاء بالحجز مباشرة من الموقع الإلكتروني."
                          checked={settings.website.enableBookingWidget}
                          onCheckedChange={(value) => updateSetting('website', 'enableBookingWidget', value)}
                        />
                        <ToggleRow
                          icon={MessageSquare}
                          label="تفعيل الدردشة المباشرة"
                          description="تقديم دعم فوري للزوار عبر نافذة الدردشة المباشرة."
                          checked={settings.website.enableLiveChat}
                          onCheckedChange={(value) => updateSetting('website', 'enableLiveChat', value)}
                        />
                      </div>
                      <ToggleRow
                        icon={ShieldAlert}
                        label="وضع الصيانة للموقع"
                        description="عرض صفحة صيانة للزوار مع إخفاء المحتوى مؤقتاً."
                        checked={settings.website.maintenanceMode}
                        onCheckedChange={(value) => updateSetting('website', 'maintenanceMode', value)}
                      />
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 text-xs text-slate-400 leading-5">
                        💡 نصيحة: تأكد من تحديث معلومات الموقع بانتظام لتحسين ظهورك في محركات البحث وزيادة ثقة العملاء.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-300" />
                        قنوات التنبيه
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        اختر القنوات المناسبة لتنبيه الفرق التشغيلية في الوقت المناسب.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {NOTIFICATION_TOGGLES.map((toggle) => (
                        <ToggleRow
                          key={toggle.key}
                          icon={toggle.icon}
                          label={toggle.label}
                          description={toggle.description}
                          checked={settings.notifications[toggle.key]}
                          onCheckedChange={(value) => updateSetting('notifications', toggle.key, value)}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-300" />
                        تخصيص الأصوات والتسليم
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        حدّد نغمة لكل حدث وراجع أوقات التسليم المجدولة.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <SoundSettings />
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 space-y-3">
                        <p className="text-sm font-semibold text-slate-200">توقيت التقرير اليومي</p>
                        <Select
                          value={settings.notifications.dailyDigest ? '08:00' : 'none'}
                          onValueChange={(value) => updateSetting('notifications', 'dailyDigest', value !== 'none')}
                        >
                          <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder="اختر الوقت" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-700 text-white">
                            <SelectItem value="08:00">08:00 صباحًا</SelectItem>
                            <SelectItem value="12:00">12:00 ظهرًا</SelectItem>
                            <SelectItem value="18:00">06:00 مساءً</SelectItem>
                            <SelectItem value="none">إيقاف التقرير اليومي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-purple-300" />
                        سياسات الحماية
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        فعّل السياسات التي تضمن حماية بيانات المنشأة والمستخدمين.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {SECURITY_TOGGLES.map((toggle) => (
                        <ToggleRow
                          key={toggle.key}
                          icon={toggle.icon}
                          label={toggle.label}
                          description={toggle.description}
                          checked={Boolean(settings.security[toggle.key])}
                          onCheckedChange={(value) => updateSetting('security', toggle.key, value)}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Lock className="w-5 h-5 text-purple-300" />
                        ضوابط الجلسات
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        إدارة مدة الجلسة وسياسة تغيير كلمة المرور.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">انتهاء الجلسة (دقائق)</label>
                        <Input
                          type="number"
                          min={5}
                          value={settings.security.autoLogoutMinutes}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            updateSetting(
                              'security',
                              'autoLogoutMinutes',
                              Number.isNaN(value) || value < 5 ? 5 : value
                            );
                          }}
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">تغيير كلمة المرور (أيام)</label>
                        <Input
                          type="number"
                          min={30}
                          value={settings.security.passwordRotationDays}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            updateSetting(
                              'security',
                              'passwordRotationDays',
                              Number.isNaN(value) || value < 30 ? 30 : value
                            );
                          }}
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 text-xs text-slate-400 leading-5">
                        قم بمراجعة سجلات الدخول أسبوعيًا، وتأكد من إيقاف حسابات الموظفين السابقين فور مغادرتهم.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <ServerCog className="w-5 h-5 text-purple-300" />
                        التكاملات المتاحة
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        فعّل التكاملات التي تدعم عملياتك اليومية وخصص صلاحياتها.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {INTEGRATION_OPTIONS.map((option) => (
                        <ToggleRow
                          key={option.key}
                          icon={option.icon}
                          label={option.label}
                          description={option.description}
                          checked={settings.integrations[option.key]}
                          onCheckedChange={(value) => updateSetting('integrations', option.key, value)}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-purple-300" />
                        مراقبة مفاتيح الربط
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        راجع حالة مفاتيح API وتأكد من صلاحيتها وتوزيعها الآمن.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 text-xs text-slate-400 leading-5">
                        {activeIntegrations} تكاملات نشطة حاليًا. ننصح بتجديد رموز الوصول كل 90 يومًا وتوثيق بيانات الاعتماد في خزنة آمنة.
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-purple-400/40 text-purple-200 bg-purple-500/10 hover:bg-purple-500/20"
                        onClick={() => router.push('/dashboard/settings/keys')}
                      >
                        إدارة مفاتيح API والتكاملات
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="backups" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-300" />
                        سياسة النسخ الاحتياطي
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        حدد تكرار النسخ، مدة الاحتفاظ، وخيارات التخزين المتقدمة.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">تكرار النسخ الاحتياطي</label>
                          <Select
                            value={settings.backups.backupFrequency}
                            onValueChange={(value) => updateSetting('backups', 'backupFrequency', value)}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="اختر التكرار" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-700 text-white">
                              {BACKUP_FREQUENCIES.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">مدة الاحتفاظ (أيام)</label>
                          <Input
                            type="number"
                            min={7}
                            value={settings.backups.retentionDays}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              updateSetting(
                                'backups',
                                'retentionDays',
                                Number.isNaN(value) || value < 7 ? 7 : value
                              );
                            }}
                            className="bg-slate-950 border-slate-700 text-white"
                          />
                        </div>
                      </div>
                      {BACKUP_TOGGLES.map((toggle) => (
                        <ToggleRow
                          key={toggle.key}
                          icon={toggle.icon}
                          label={toggle.label}
                          description={toggle.description}
                          checked={settings.backups[toggle.key] as boolean}
                          onCheckedChange={(value) => updateSetting('backups', toggle.key, value)}
                        />
                      ))}
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 text-xs text-slate-400 leading-5">
                        يتم حفظ النسخ الاحتياطية في سحابة مشفرة. يمكنك تنزيل نسخة يدوية أو استعادتها من خلال لوحة التقارير المالية.
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <CloudDownload className="w-5 h-5 text-purple-300" />
                        آخر نسخة احتياطية
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        تحديث وقت آخر نسخة والتأكد من جاهزية خطة الاستجابة للطوارئ.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">تاريخ ووقت آخر نسخة</label>
                        <Input
                          value={settings.backups.lastBackup}
                          onChange={(event) => updateSetting('backups', 'lastBackup', event.target.value)}
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                        <p className="text-xs text-slate-400">
                          يتم استخدام هذه القيمة لإرسال تذكير تلقائي قبل الحاجة إلى النسخة التالية.
                        </p>
                      </div>
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => router.push('/dashboard/accounting/cash-flow')}
                      >
                        تنزيل سجل النسخ الاحتياطية
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-300" />
                        إعدادات المظهر
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        اضبط الألوان وكثافة الواجهة بما يتناسب مع هوية منشأتك.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">لون التمييز</label>
                        <Select
                          value={settings.appearance.accentColor}
                          onValueChange={(value) => updateSetting('appearance', 'accentColor', value)}
                        >
                          <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder="اختر اللون" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-700 text-white">
                            {ACCENT_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">كثافة الواجهة</label>
                        <Select
                          value={settings.appearance.layoutDensity}
                          onValueChange={(value) => updateSetting('appearance', 'layoutDensity', value)}
                        >
                          <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder="اختر الكثافة" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-700 text-white">
                            {DENSITY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {APPEARANCE_TOGGLES.map((toggle) => (
                        <ToggleRow
                          key={toggle.key}
                          icon={toggle.icon}
                          label={toggle.label}
                          description={toggle.description}
                          checked={Boolean(settings.appearance[toggle.key])}
                          onCheckedChange={(value) => updateSetting('appearance', toggle.key, value)}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-300" />
                        معاينة الواجهة
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        تأكد من تطابق المظهر النهائي مع هوية منشأتك قبل الاعتماد.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-400">معاينة</p>
                            <p className="text-white font-semibold">{settings.general.companyName}</p>
                          </div>
                          <Badge className="bg-white/10 border-white/20 text-white text-[11px]" variant="outline">
                            {settings.appearance.accentColor.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4 space-y-2">
                          <p className="text-sm text-slate-200">{settings.general.companyTagline}</p>
                          <p className="text-xs text-slate-400">
                            كثافة الواجهة: {settings.appearance.layoutDensity === 'compact'
                              ? 'مضغوط'
                              : settings.appearance.layoutDensity === 'comfortable'
                                ? 'مريح'
                                : 'واسع'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="px-3 py-1 rounded-full border border-purple-400/40 bg-purple-500/10 text-purple-200">
                            وضع النظام: {settings.general.systemMode === 'dark' ? 'داكن' : settings.general.systemMode === 'light' ? 'فاتح' : 'حسب الجهاز'}
                          </span>
                          {settings.appearance.bubbleBackground ? (
                            <span className="px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
                              تأثير الفقاعات مفعل
                            </span>
                          ) : null}
                          {settings.appearance.animatedTransitions ? (
                            <span className="px-3 py-1 rounded-full border border-purple-400/30 bg-purple-500/10 text-purple-200">
                              انتقالات ديناميكية
                            </span>
                          ) : null}
                          {settings.appearance.showTips ? (
                            <span className="px-3 py-1 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-200">
                              تلميحات مفعلة
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-300" />
                        خيارات متقدمة
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        ضبط سلوك النظام التقني وأدوات المراقبة المتقدمة.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {ADVANCED_TOGGLES.map((toggle) => (
                        <ToggleRow
                          key={toggle.key}
                          icon={toggle.icon}
                          label={toggle.label}
                          description={toggle.description}
                          checked={Boolean(settings.advanced[toggle.key])}
                          onCheckedChange={(value) => updateSetting('advanced', toggle.key, value)}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <ServerCog className="w-5 h-5 text-purple-300" />
                        إدارة الأداء والتخزين المؤقت
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        ضبط حجم الكاش ومتابعة عمليات الصيانة المستمرة.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">سعة التخزين المؤقت (ميجابايت)</label>
                        <Input
                          type="number"
                          min={128}
                          value={settings.advanced.cacheSize}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            updateSetting(
                              'advanced',
                              'cacheSize',
                              Number.isNaN(value) || value < 128 ? 128 : value
                            );
                          }}
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 text-xs text-slate-400 leading-5">
                        فعّل مراقبة الأداء للحصول على إشعارات فورية عند ارتفاع استهلاك المعالج أو الذاكرة، مع تقارير أسبوعية لأبرز المؤشرات.
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-purple-400/40 text-purple-200 bg-purple-500/10 hover:bg-purple-500/20"
                        onClick={() => router.push('/dashboard/analytics')}
                      >
                        عرض لوحة مراقبة الأداء
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-purple-300/50 py-4">
          <p>
            تم تطوير هذا النظام بواسطة <span className="font-semibold text-purple-300/80">Eng/Akram elmasry</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
