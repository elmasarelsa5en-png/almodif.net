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
    companyName: '‰Ÿ«„ «·„÷Ì› «·–ﬂÌ',
    companyTagline: 'Õ·Ê· „ ﬂ«„·… ·≈œ«—… «·÷Ì«›… Ê«·⁄„·Ì«  «· ‘€Ì·Ì…',
    industry: '«·÷Ì«›… Ê«·›‰œﬁ…',
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
    siteName: '‰Ÿ«„ «·„÷Ì› «·–ﬂÌ',
    siteUrl: 'https://almodif.com',
    siteDescription: '‰Ÿ«„ ‘«„· ·≈œ«—… «·÷Ì«›… Ê«·⁄„·Ì«  «· ‘€Ì·Ì… »ﬂ›«¡… ⁄«·Ì…',
    metaTitle: '«·„÷Ì› «·–ﬂÌ - ‰Ÿ«„ ≈œ«—… «·÷Ì«›…',
    metaKeywords: '≈œ«—… «·›‰«œﬁ° ÕÃÊ“« ° ‘ﬁﬁ „›—Ê‘…° ≈œ«—… «·÷Ì«›…',
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
    label: ' ‰»ÌÂ«  «·»—Ìœ «·≈·ﬂ —Ê‰Ì',
    description: '≈—”«· ≈‘⁄«—«  „›’·… Ê„·Œ’ ÌÊ„Ì ⁄»— «·»—Ìœ.',
    icon: Bell
  },
  {
    key: 'enableSMS',
    label: '—”«∆· SMS «·›Ê—Ì…',
    description: ' ‰»ÌÂ«  ⁄«Ã·… ··Õ«·«  «·Õ—Ã… „»«‘—… ≈·Ï «·ÃÊ«·.',
    icon: BellRing
  },
  {
    key: 'enablePush',
    label: '≈‘⁄«—«  œ«Œ· «·‰Ÿ«„',
    description: '⁄—÷  ‰»ÌÂ«  ·ÕŸÌ… ⁄·Ï ·ÊÕ… «· Õﬂ„ Ê«· ÿ»Ìﬁ« .',
    icon: Activity
  },
  {
    key: 'soundEnabled',
    label: ' ‘€Ì· «·„ƒÀ—«  «·’Ê Ì…',
    description: '≈÷«›… „ƒÀ—«  Œ«’… ·ﬂ· ÕœÀ „Â„ œ«Œ· «·‰Ÿ«„.',
    icon: Sparkles
  },
  {
    key: 'dailyDigest',
    label: '«· ﬁ—Ì— «·ÌÊ„Ì «·„Ã„⁄',
    description: 'Ê’Ê·  ﬁ—Ì— ’»«ÕÌ »√Â„ «·„ƒ‘—«  «· ‘€Ì·Ì….',
    icon: RefreshCcw
  },
  {
    key: 'attendanceAlerts',
    label: ' ‰»ÌÂ«  «·Õ÷Ê— Ê«·«‰’—«›',
    description: '„—«ﬁ»… «· √ŒÌ—° «·€Ì«»° √Ê  ”ÃÌ· «·Œ—ÊÃ «·„»ﬂ—.',
    icon: Users
  },
  {
    key: 'financeAlerts',
    label: ' ‰»ÌÂ«  «·⁄„·Ì«  «·„«·Ì…',
    description: '„—«ﬁ»… «·›Ê« Ì— Ê«·„’«—Ì› €Ì— «·„⁄ «œ… ›Ê— ÕœÊÀÂ«.',
    icon: Database
  }
];

const SECURITY_TOGGLES: ToggleConfig<BooleanKeys<SecuritySettings>>[] = [
  {
    key: 'twoFactor',
    label: ' ›⁄Ì· «·„’«œﬁ… «·À‰«∆Ì…',
    description: '≈÷«›… ÿ»ﬁ… Õ„«Ì… ≈÷«›Ì… ⁄‰œ  ”ÃÌ· «·œŒÊ·.',
    icon: ShieldCheck
  },
  {
    key: 'allowGuestLogin',
    label: 'œŒÊ· «·÷ÌÊ› «·„ƒﬁ ',
    description: '„‰Õ ’·«ÕÌ«  „ÕœÊœ… ··„Ê—œÌ‰ √Ê «·÷ÌÊ›.',
    icon: Users
  },
  {
    key: 'biometricSupport',
    label: '«· ÊÀÌﬁ «·ÕÌÊÌ',
    description: ' ›⁄Ì· «·œŒÊ· »»’„… «·≈’»⁄ √Ê «·ÊÃÂ ›Ì «· ÿ»Ìﬁ« .',
    icon: Sparkles
  },
  {
    key: 'loginAlerts',
    label: ' ‰»ÌÂ«   ”ÃÌ· «·œŒÊ· «·ÃœÌœ…',
    description: '≈‘⁄«— ›Ê—Ì ⁄‰œ «·œŒÊ· „‰ ÃÂ«“ √Ê „Êﬁ⁄ ÃœÌœ.',
    icon: Shield
  },
  {
    key: 'ipRestriction',
    label: ' ﬁÌÌœ «·œŒÊ· »Õ”» IP',
    description: '«·”„«Õ »«·Ê’Ê· ›ﬁÿ „‰ «·‘»ﬂ«  «·„⁄ „œ….',
    icon: Lock
  },
  {
    key: 'maintenanceMode',
    label: 'Ê÷⁄ «·’Ì«‰… «·⁄«„',
    description: '⁄—÷ —”«·… ’Ì«‰… Ê≈Ìﬁ«› «·⁄„·Ì«  «·Õ—Ã… „ƒﬁ «.',
    icon: ShieldAlert
  }
];

const INTEGRATION_OPTIONS: ToggleConfig<BooleanKeys<IntegrationSettings>>[] = [
  {
    key: 'whatsapp',
    label: ' ﬂ«„· Ê« ”«» ··√⁄„«·',
    description: '„“«„‰… «·„Õ«œÀ«  Ê«·—œÊœ „⁄ ›—Ìﬁ Œœ„… «·⁄„·«¡.',
    icon: BellRing
  },
  {
    key: 'accounting',
    label: '«·√‰Ÿ„… «·„Õ«”»Ì…',
    description: '«” Ì—«œ «·ﬁÌÊœ Ê ÕœÌÀ «·Õ—ﬂ«  «·„«·Ì…  ·ﬁ«∆Ì«.',
    icon: Database
  },
  {
    key: 'inventory',
    label: '≈œ«—… «·„Œ“Ê‰',
    description: ' »«œ· »Ì«‰«  «·√’‰«› Ê«·„” Êœ⁄«  ›Ì «·Êﬁ  «·›⁄·Ì.',
    icon: CloudDownload
  },
  {
    key: 'crm',
    label: '≈œ«—… ⁄·«ﬁ«  «·⁄„·«¡',
    description: 'œ„Ã »Ì«‰«  «·⁄„·«¡ Ê”Ã· «· ›«⁄· ›Ì „ﬂ«‰ Ê«Õœ.',
    icon: Users
  },
  {
    key: 'googleCalendar',
    label: ' ﬁÊÌ„ Google',
    description: '„“«„‰… «·„Ê«⁄Ìœ Ê«·«Ã „«⁄«  „⁄ ›—Ìﬁ «·⁄„·.',
    icon: RefreshCcw
  },
  {
    key: 'customWebhooks',
    label: ' ﬂ«„·«  „Œ’¯’… (Webhook)',
    description: '—»ÿ «·‰Ÿ«„ „⁄ √Ì „‰’… Œ«—ÃÌ… »«” Œœ«„ Webhook.',
    icon: Link2
  }
];

const BACKUP_TOGGLES: ToggleConfig<BooleanKeys<BackupSettings>>[] = [
  {
    key: 'autoBackup',
    label: ' ‘€Ì· «·‰”Œ «· ·ﬁ«∆Ì',
    description: '≈‰‘«¡ ‰”Œ… «Õ Ì«ÿÌ… Ê›ﬁ« ··ÃœÊ· «·„Õœœ.',
    icon: RefreshCcw
  },
  {
    key: 'offsiteReplication',
    label: '‰”Œ Œ«—Ã «·„Êﬁ⁄',
    description: 'Õ›Ÿ ‰”Œ… „‘›—… ›Ì „—ﬂ“ »Ì«‰«  „‰›’·.',
    icon: CloudDownload
  },
  {
    key: 'compressBackups',
    label: '÷€ÿ «·‰”Œ «·«Õ Ì«ÿÌ…',
    description: ' ﬁ·Ì· ÕÃ„ «·„·›«  „⁄ «·Õ›«Ÿ ⁄·Ï «·œﬁ….',
    icon: Activity
  }
];

const APPEARANCE_TOGGLES: ToggleConfig<BooleanKeys<AppearanceSettings>>[] = [
  {
    key: 'bubbleBackground',
    label: 'Œ·›Ì… «·›ﬁ«⁄«  «· ›«⁄·Ì…',
    description: '≈÷«›…  √ÀÌ— »’—Ì œÌ‰«„ÌﬂÌ ›Ì «·Ê«ÃÂ….',
    icon: Sparkles
  },
  {
    key: 'animatedTransitions',
    label: '«·«‰ ﬁ«·«  «·„ Õ—ﬂ…',
    description: ' ‰ﬁ· œÌ‰«„ÌﬂÌ Ê”·” »Ì‰ «·’›Õ« .',
    icon: Activity
  },
  {
    key: 'showTips',
    label: ' ·„ÌÕ«  «·«” Œœ«„ «·–ﬂÌ…',
    description: '⁄—÷ ≈—‘«œ«  „ÊÃÂ… ··„” Œœ„Ì‰ «·Ãœœ.',
    icon: BadgeCheck
  }
];

const ADVANCED_TOGGLES: ToggleConfig<BooleanKeys<AdvancedSettings>>[] = [
  {
    key: 'autoUpdates',
    label: '«· ÕœÌÀ«  «· ·ﬁ«∆Ì…',
    description: ' À»Ì  √ÕœÀ «· Õ”Ì‰«  ›Ê—  Ê›—Â«.',
    icon: RefreshCcw
  },
  {
    key: 'betaFeatures',
    label: ' Ã—»… «·„Ì“«  «· Ã—Ì»Ì…',
    description: '«Œ »«— «·„Ì“«  ﬁ»· ≈’œ«—Â« «·—”„Ì.',
    icon: Sparkles
  },
  {
    key: 'monitorPerformance',
    label: '„—«ﬁ»… «·√œ«¡ «··ÕŸÌ',
    description: 'Ã„⁄ „ƒ‘—«  «·√œ«¡ Ê≈—”«·  ‰»ÌÂ«  ›Ê—Ì….',
    icon: Activity
  },
  {
    key: 'purgeLogs',
    label: ' ‰ŸÌ› «·”Ã·«  «·ﬁœÌ„…',
    description: 'Õ–› «·”Ã·«  »⁄œ «‰ Â«¡ ’·«ÕÌ Â«  ·ﬁ«∆Ì«.',
    icon: Zap
  }
];

const BACKUP_FREQUENCIES = [
  { value: 'hourly', label: 'ﬂ· ”«⁄…' },
  { value: 'daily', label: 'ÌÊ„Ì«' },
  { value: 'weekly', label: '√”»Ê⁄Ì«' },
  { value: 'monthly', label: '‘Â—Ì«' }
];

const ACCENT_OPTIONS = [
  { value: 'indigo', label: '√“—ﬁ »‰›”ÃÌ' },
  { value: 'emerald', label: '√Œ÷— “„—œÌ' },
  { value: 'amber', label: '–Â»Ì ›«Œ—' },
  { value: 'rose', label: 'Ê—œÌ œ«›∆' },
  { value: 'slate', label: '—„«œÌ «Õ —«›Ì' }
];

const DENSITY_OPTIONS = [
  { value: 'compact', label: '„÷€Êÿ' },
  { value: 'comfortable', label: '„—ÌÕ' },
  { value: 'spacious', label: 'Ê«”⁄' }
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
        title: '«·›—Ê⁄ «·‰‘ÿ…',
        value: settings.general.branchCount,
        badge: '‰„Ê +2 Â–« «·‘Â—'
      },
      {
        icon: Bell,
        title: 'ﬁ‰Ê«  «· ‰»ÌÂ «·›⁄«·…',
        value: `${activeNotificationChannels}/4`,
        badge: settings.notifications.dailyDigest ? '«· ﬁ—Ì— «·ÌÊ„Ì „›⁄·' : '«· ﬁ—Ì— «·ÌÊ„Ì „ Êﬁ›'
      },
      {
        icon: ShieldCheck,
        title: '„” ÊÏ «·√„«‰',
        value: settings.security.twoFactor ? '„— ›⁄' : '„ Ê”ÿ',
        badge: settings.security.twoFactor ? '«·„’«œﬁ… «·À‰«∆Ì… „›⁄¯·…' : 'Ì‰’Õ » ›⁄Ì· 2FA'
      },
      {
        icon: Database,
        title: 'Õ«·… «·‰”Œ «·«Õ Ì«ÿÌ',
        value: settings.backups.autoBackup ? settings.backups.backupFrequency : 'ÌœÊÌ',
        badge: `¬Œ— ‰”Œ…: ${settings.backups.lastBackup}`
      }
    ], [settings, activeNotificationChannels]
  );

  const quickActions = useMemo(
    () => [
      {
        icon: Globe,
        title: '≈⁄œ«œ«  «·„Êﬁ⁄ «·≈·ﬂ —Ê‰Ì',
        description: ' ÕœÌÀ „⁄·Ê„«  «·„Êﬁ⁄ Ê«· Ê«’· Ê„Õ—ﬂ«  «·»ÕÀ.',
        action: 'website'
      },
      {
        icon: Users,
        title: '≈œ«—… «·’·«ÕÌ« ',
        description: ' ⁄ÌÌ‰ «·√œÊ«— Ê«·Ê’Ê· ·ﬂ· ›—Ìﬁ ⁄„·.',
        href: '/settings/hr'
      },
      {
        icon: BookOpen,
        title: 'ﬂ «·ÊÃ «·‘ﬁﬁ',
        description: '≈œ«—… √‰Ê«⁄ «·‘ﬁﬁ Ê«·€—› Ê√”⁄«—Â«.',
        href: '/settings/rooms-catalog'
      },
      {
        icon: Building2,
        title: '≈œ«—… «·„Ê«—œ «·»‘—Ì…',
        description: '≈÷«›… Ê ⁄œÌ· «·„ÊŸ›Ì‰ Ê«·’·«ÕÌ« .',
        href: '/settings/hr'
      },
      {
        icon: BellRing,
        title: '≈⁄œ«œ«  «·√’Ê« ',
        description: ' Œ’Ì’ ‰€„«  «· ‰»ÌÂ ·ﬂ· ÕœÀ „Â„.',
        href: '/settings/sound-settings'
      },
      {
        icon: ServerCog,
        title: 'ÃœÊ·… «·‰”Œ «·«Õ Ì«ÿÌ',
        description: '„—«Ã⁄…  ÊﬁÌ  «·‰”Œ «·«Õ Ì«ÿÌ… «·ﬁ«œ„….',
        href: '/dashboard/accounting/reports'
      }
    ], []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-purple-400 animate-spin" />
          <p className="text-sm text-slate-300">Ã«—  Õ„Ì· ≈⁄œ«œ«  «·‰Ÿ«„...</p>
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
                  ‰Ÿ«„ „ ﬂ«„·
                </Badge>
                <BadgeCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <h1 className="text-4xl font-bold text-white">·ÊÕ… ≈⁄œ«œ«  «·‰Ÿ«„</h1>
              <p className="text-slate-300 text-sm leading-6 max-w-2xl">
                 Õﬂ„ ﬂ«„· ›Ì «·ÂÊÌ…° «· ‰»ÌÂ« ° «·√„«‰° «· ﬂ«„·« ° «·‰”Œ «·«Õ Ì«ÿÌ° «·„ŸÂ—° Ê«·ŒÌ«—«  «·„ ﬁœ„… „‰ „ﬂ«‰ Ê«Õœ.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={resetSettings}
              variant="outline"
              className="border-red-400/40 text-red-200 bg-red-500/10 hover:bg-red-500/20"
            >
              ≈⁄«œ…  ⁄ÌÌ‰ «·≈⁄œ«œ« 
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-white/20 bg-gray-700/30 text-white hover:bg-gray-800/50"
            >
              <ChevronRight className="ml-2 w-5 h-5" />
              «·⁄Êœ… ··ÊÕ… «· Õﬂ„
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
                    <Badge className="bg-gray-800/50 border-white/20 text-white text-[11px]" variant="outline">
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
                // «· „—Ì— ≈·Ï ﬁ”„ «· »ÊÌ»«  Ê ›⁄Ì·  »ÊÌ» «·„Êﬁ⁄ «·≈·ﬂ —Ê‰Ì
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
                ≈œ«—… ≈⁄œ«œ«  «·‰Ÿ«„
              </CardTitle>
              <CardDescription className="text-slate-300">
                «Œ — «· »ÊÌ» «·„‰«”» Êﬁ„ » ÕœÌÀ «·≈⁄œ«œ« ° Ê”Ì „ Õ›Ÿ  €ÌÌ—« ﬂ  ·ﬁ«∆Ì«.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="flex flex-wrap gap-2 bg-slate-900/80 border border-slate-700/60 p-2 rounded-2xl text-slate-200">
                <TabsTrigger value="general" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  «·⁄«„
                </TabsTrigger>
                <TabsTrigger value="website" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  «·„Êﬁ⁄ «·≈·ﬂ —Ê‰Ì
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  «· ‰»ÌÂ« 
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  «·√„«‰
                </TabsTrigger>
                <TabsTrigger value="integrations" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  «· ﬂ«„·« 
                </TabsTrigger>
                <TabsTrigger value="backups" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  «·‰”Œ «·«Õ Ì«ÿÌ
                </TabsTrigger>
                <TabsTrigger value="appearance" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  «·„ŸÂ—
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                  „ ﬁœ„
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-300" />
                        ÂÊÌ… «·„‰‘√…
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                         ⁄œÌ· «·ÂÊÌ… «·„⁄—Ê÷… ›Ì «·›Ê« Ì— Ê«· ﬁ«—Ì— «·—”„Ì….
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">«”„ «·„‰‘√…</label>
                        <Input
                          value={settings.general.companyName}
                          onChange={(event) => updateSetting('general', 'companyName', event.target.value)}
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <LogoUploader />
                        <label className="text-sm text-slate-200">«·‘⁄«— «·„Œ ’—</label>
                        <Textarea
                          rows={3}
                          value={settings.general.companyTagline}
                          onChange={(event) => updateSetting('general', 'companyTagline', event.target.value)}
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">«·ﬁÿ«⁄</label>
                          <Input
                            value={settings.general.industry}
                            onChange={(event) => updateSetting('general', 'industry', event.target.value)}
                            className="bg-slate-950 border-slate-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">⁄œœ «·›—Ê⁄</label>
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
                          <label className="text-sm text-slate-200">«··€… «·—∆Ì”Ì…</label>
                          <Select
                            value={settings.general.language}
                            onValueChange={(value) => updateSetting('general', 'language', value)}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="«Œ — «··€…" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-700 text-white">
                              <SelectItem value="ar">«·⁄—»Ì…</SelectItem>
                              <SelectItem value="en">«·≈‰Ã·Ì“Ì…</SelectItem>
                              <SelectItem value="fr">«·›—‰”Ì…</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">«· ÊﬁÌ </label>
                          <Select
                            value={settings.general.timezone}
                            onValueChange={(value) => updateSetting('general', 'timezone', value)}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="«Œ — «· ÊﬁÌ " />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-700 text-white">
                              <SelectItem value="Asia/Riyadh">GMT+3 | «·—Ì«÷</SelectItem>
                              <SelectItem value="Asia/Dubai">GMT+4 | œ»Ì</SelectItem>
                              <SelectItem value="Europe/London">GMT | ·‰œ‰</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">’Ì€… «· «—ÌŒ</label>
                          <Select
                            value={settings.general.dateFormat}
                            onValueChange={(value) => updateSetting('general', 'dateFormat', value)}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="«Œ — «·’Ì€…" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-700 text-white">
                              <SelectItem value="DD/MM/YYYY">31/12/2025</SelectItem>
                              <SelectItem value="MM/DD/YYYY">12/31/2025</SelectItem>
                              <SelectItem value="YYYY-MM-DD">2025-12-31</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200">«·⁄„·… «·—∆Ì”Ì…</label>
                          <Select
                            value={settings.general.currency}
                            onValueChange={(value) => updateSetting('general', 'currency', value)}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="«Œ — «·⁄„·…" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-700 text-white">
                              <SelectItem value="SAR">—Ì«· ”⁄ÊœÌ (SAR)</SelectItem>
                              <SelectItem value="AED">œ—Â„ ≈„«—« Ì (AED)</SelectItem>
                              <SelectItem value="USD">œÊ·«— √„—ÌﬂÌ (USD)</SelectItem>
                              <SelectItem value="EUR">ÌÊ—Ê (EUR)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">Ê÷⁄ «·Ê«ÃÂ…</label>
                        <Select
                          value={settings.general.systemMode}
                          onValueChange={(value) => updateSetting('general', 'systemMode', value)}
                        >
                          <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder="«Œ — «·Ê÷⁄" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-700 text-white">
                            <SelectItem value="dark">«·Ê÷⁄ «·œ«ﬂ‰</SelectItem>
                            <SelectItem value="light">«·Ê÷⁄ «·›« Õ</SelectItem>
                            <SelectItem value="system">Õ”» ≈⁄œ«œ«  «·ÃÂ«“</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-300" />
                        „ÊÃ“ «·Õ«·… «·Õ«·Ì…
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        ‰Ÿ—… ”—Ì⁄… ⁄·Ï √œ«¡ «·„‰ŸÊ„… Ê›ﬁ ≈⁄œ«œ« ﬂ «·Õ«·Ì….
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <Shield className="w-4 h-4 text-purple-300" />
                          „” ÊÏ «·Õ„«Ì…
                        </div>
                        <p className="text-white text-xl font-semibold">
                          {settings.security.twoFactor ? '„Õ„Ì »«·ﬂ«„·' : 'Õ„«Ì… √”«”Ì…'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {settings.security.loginAlerts
                            ? '«·„—«ﬁ»… «··ÕŸÌ… · ”ÃÌ· «·œŒÊ· ›⁄¯«·….'
                            : '‰‰’Õ » ›⁄Ì·  ‰»ÌÂ«  «·œŒÊ· · Õ”Ì‰ «·Õ„«Ì….'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <Link2 className="w-4 h-4 text-purple-300" />
                          «· ﬂ«„·«  «·„ ’·…
                        </div>
                        <p className="text-white text-xl font-semibold">{activeIntegrations}  ﬂ«„·«  ‰‘ÿ…</p>
                        <p className="text-xs text-slate-400">
                          Ì‘„· Ê« ”«»° «·√‰Ÿ„… «·„Õ«”»Ì…° «·„Œ“Ê‰° Êﬁ‰Ê«  «·œ⁄„.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <RefreshCcw className="w-4 h-4 text-purple-300" />
                          Õ«·… «·‰”Œ «·«Õ Ì«ÿÌ
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <p className="text-white text-lg font-semibold">
                            {settings.backups.autoBackup ? '‰”Œ «Õ Ì«ÿÌ  ·ﬁ«∆Ì' : '«·‰”Œ «·«Õ Ì«ÿÌ ÌœÊÌ'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            ¬Œ— ‰”Œ… ⁄‰œ {settings.backups.lastBackup}
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
                        „⁄·Ê„«  «·„Êﬁ⁄
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                         ÕœÌÀ „⁄·Ê„«  «·„Êﬁ⁄ «·≈·ﬂ —Ê‰Ì «·√”«”Ì… Ê«·»Ì«‰«  «·Ê’›Ì….
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">«”„ «·„Êﬁ⁄</label>
                        <Input
                          value={settings.website.siteName}
                          onChange={(event) => updateSetting('website', 'siteName', event.target.value)}
                          placeholder="«”„ „Êﬁ⁄ﬂ «·≈·ﬂ —Ê‰Ì"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">—«»ÿ «·„Êﬁ⁄ (URL)</label>
                        <Input
                          value={settings.website.siteUrl}
                          onChange={(event) => updateSetting('website', 'siteUrl', event.target.value)}
                          placeholder="https://example.com"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">Ê’› «·„Êﬁ⁄</label>
                        <Textarea
                          rows={3}
                          value={settings.website.siteDescription}
                          onChange={(event) => updateSetting('website', 'siteDescription', event.target.value)}
                          placeholder="Ê’› „ÊÃ“ ·„Êﬁ⁄ﬂ ÌŸÂ— ›Ì „Õ—ﬂ«  «·»ÕÀ"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200 flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          ⁄‰Ê«‰ «· Õ”Ì‰ ·„Õ—ﬂ«  «·»ÕÀ (Meta Title)
                        </label>
                        <Input
                          value={settings.website.metaTitle}
                          onChange={(event) => updateSetting('website', 'metaTitle', event.target.value)}
                          placeholder="«·⁄‰Ê«‰ «·–Ì ÌŸÂ— ›Ì ‰ «∆Ã «·»ÕÀ"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">«·ﬂ·„«  «·„› «ÕÌ… (Meta Keywords)</label>
                        <Textarea
                          rows={2}
                          value={settings.website.metaKeywords}
                          onChange={(event) => updateSetting('website', 'metaKeywords', event.target.value)}
                          placeholder="÷⁄ «·ﬂ·„«  «·„› «ÕÌ… „›’Ê·… »›«’·…"
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Mail className="w-5 h-5 text-purple-300" />
                        „⁄·Ê„«  «·« ’«·
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        »Ì«‰«  «· Ê«’· «· Ì  ŸÂ— ··“Ê«— Ê«·⁄„·«¡.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          «·»—Ìœ «·≈·ﬂ —Ê‰Ì
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
                          —ﬁ„ «·Â« ›
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
                          —Ê«»ÿ „Ê«ﬁ⁄ «· Ê«’· «·«Ã „«⁄Ì
                        </p>
                        <div className="space-y-3">
                          <Input
                            value={settings.website.socialFacebook}
                            onChange={(event) => updateSetting('website', 'socialFacebook', event.target.value)}
                            placeholder="—«»ÿ Facebook"
                            className="bg-slate-950 border-slate-700 text-white text-sm"
                          />
                          <Input
                            value={settings.website.socialInstagram}
                            onChange={(event) => updateSetting('website', 'socialInstagram', event.target.value)}
                            placeholder="—«»ÿ Instagram"
                            className="bg-slate-950 border-slate-700 text-white text-sm"
                          />
                          <Input
                            value={settings.website.socialTwitter}
                            onChange={(event) => updateSetting('website', 'socialTwitter', event.target.value)}
                            placeholder="—«»ÿ Twitter/X"
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
                        ŒÌ«—«  «·„Êﬁ⁄ «·„ ﬁœ„…
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                         ›⁄Ì· √Ê ≈Ìﬁ«› „Ì“«  «·„Êﬁ⁄ «·≈·ﬂ —Ê‰Ì.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ToggleRow
                          icon={BookOpen}
                          label=" ›⁄Ì· ‰Ÿ«„ «·ÕÃ“ «·„»«‘—"
                          description="«·”„«Õ ··⁄„·«¡ »«·ÕÃ“ „»«‘—… „‰ «·„Êﬁ⁄ «·≈·ﬂ —Ê‰Ì."
                          checked={settings.website.enableBookingWidget}
                          onCheckedChange={(value) => updateSetting('website', 'enableBookingWidget', value)}
                        />
                        <ToggleRow
                          icon={MessageSquare}
                          label=" ›⁄Ì· «·œ—œ‘… «·„»«‘—…"
                          description=" ﬁœÌ„ œ⁄„ ›Ê—Ì ··“Ê«— ⁄»— ‰«›–… «·œ—œ‘… «·„»«‘—…."
                          checked={settings.website.enableLiveChat}
                          onCheckedChange={(value) => updateSetting('website', 'enableLiveChat', value)}
                        />
                      </div>
                      <ToggleRow
                        icon={ShieldAlert}
                        label="Ê÷⁄ «·’Ì«‰… ··„Êﬁ⁄"
                        description="⁄—÷ ’›Õ… ’Ì«‰… ··“Ê«— „⁄ ≈Œ›«¡ «·„Õ ÊÏ „ƒﬁ «."
                        checked={settings.website.maintenanceMode}
                        onCheckedChange={(value) => updateSetting('website', 'maintenanceMode', value)}
                      />
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 text-xs text-slate-400 leading-5">
                        ?? ‰’ÌÕ…:  √ﬂœ „‰  ÕœÌÀ „⁄·Ê„«  «·„Êﬁ⁄ »«‰ Ÿ«„ · Õ”Ì‰ ŸÂÊ—ﬂ ›Ì „Õ—ﬂ«  «·»ÕÀ Ê“Ì«œ… Àﬁ… «·⁄„·«¡.
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
                        ﬁ‰Ê«  «· ‰»ÌÂ
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        «Œ — «·ﬁ‰Ê«  «·„‰«”»… · ‰»ÌÂ «·›—ﬁ «· ‘€Ì·Ì… ›Ì «·Êﬁ  «·„‰«”».
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
                         Œ’Ì’ «·√’Ê«  Ê«· ”·Ì„
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Õœ¯œ ‰€„… ·ﬂ· ÕœÀ Ê—«Ã⁄ √Êﬁ«  «· ”·Ì„ «·„ÃœÊ·….
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <SoundSettings />
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 space-y-3">
                        <p className="text-sm font-semibold text-slate-200"> ÊﬁÌ  «· ﬁ—Ì— «·ÌÊ„Ì</p>
                        <Select
                          value={settings.notifications.dailyDigest ? '08:00' : 'none'}
                          onValueChange={(value) => updateSetting('notifications', 'dailyDigest', value !== 'none')}
                        >
                          <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder="«Œ — «·Êﬁ " />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-700 text-white">
                            <SelectItem value="08:00">08:00 ’»«Õ«</SelectItem>
                            <SelectItem value="12:00">12:00 ŸÂ—«</SelectItem>
                            <SelectItem value="18:00">06:00 „”«¡</SelectItem>
                            <SelectItem value="none">≈Ìﬁ«› «· ﬁ—Ì— «·ÌÊ„Ì</SelectItem>
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
                        ”Ì«”«  «·Õ„«Ì…
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        ›⁄¯· «·”Ì«”«  «· Ì  ÷„‰ Õ„«Ì… »Ì«‰«  «·„‰‘√… Ê«·„” Œœ„Ì‰.
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
                        ÷Ê«»ÿ «·Ã·”« 
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        ≈œ«—… „œ… «·Ã·”… Ê”Ì«”…  €ÌÌ— ﬂ·„… «·„—Ê—.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">«‰ Â«¡ «·Ã·”… (œﬁ«∆ﬁ)</label>
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
                        <label className="text-sm text-slate-200"> €ÌÌ— ﬂ·„… «·„—Ê— (√Ì«„)</label>
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
                        ﬁ„ »„—«Ã⁄… ”Ã·«  «·œŒÊ· √”»Ê⁄Ì«° Ê √ﬂœ „‰ ≈Ìﬁ«› Õ”«»«  «·„ÊŸ›Ì‰ «·”«»ﬁÌ‰ ›Ê— „€«œ— Â„.
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
                        «· ﬂ«„·«  «·„ «Õ…
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        ›⁄¯· «· ﬂ«„·«  «· Ì  œ⁄„ ⁄„·Ì« ﬂ «·ÌÊ„Ì… ÊŒ’’ ’·«ÕÌ« Â«.
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
                        „—«ﬁ»… „›« ÌÕ «·—»ÿ
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        —«Ã⁄ Õ«·… „›« ÌÕ API Ê √ﬂœ „‰ ’·«ÕÌ Â« Ê Ê“Ì⁄Â« «·¬„‰.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 text-xs text-slate-400 leading-5">
                        {activeIntegrations}  ﬂ«„·«  ‰‘ÿ… Õ«·Ì«. ‰‰’Õ » ÃœÌœ —„Ê“ «·Ê’Ê· ﬂ· 90 ÌÊ„« Ê ÊÀÌﬁ »Ì«‰«  «·«⁄ „«œ ›Ì Œ“‰… ¬„‰….
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-purple-400/40 text-purple-200 bg-purple-500/10 hover:bg-purple-500/20"
                        onClick={() => router.push('/dashboard/settings/keys')}
                      >
                        ≈œ«—… „›« ÌÕ API Ê«· ﬂ«„·« 
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
                        ”Ì«”… «·‰”Œ «·«Õ Ì«ÿÌ
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Õœœ  ﬂ—«— «·‰”Œ° „œ… «·«Õ ›«Ÿ° ÊŒÌ«—«  «· Œ“Ì‰ «·„ ﬁœ„….
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-slate-200"> ﬂ—«— «·‰”Œ «·«Õ Ì«ÿÌ</label>
                          <Select
                            value={settings.backups.backupFrequency}
                            onValueChange={(value) => updateSetting('backups', 'backupFrequency', value)}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="«Œ — «· ﬂ—«—" />
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
                          <label className="text-sm text-slate-200">„œ… «·«Õ ›«Ÿ (√Ì«„)</label>
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
                        Ì „ Õ›Ÿ «·‰”Œ «·«Õ Ì«ÿÌ… ›Ì ”Õ«»… „‘›—…. Ì„ﬂ‰ﬂ  ‰“Ì· ‰”Œ… ÌœÊÌ… √Ê «” ⁄«œ Â« „‰ Œ·«· ·ÊÕ… «· ﬁ«—Ì— «·„«·Ì….
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700/60 bg-slate-900/60">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <CloudDownload className="w-5 h-5 text-purple-300" />
                        ¬Œ— ‰”Œ… «Õ Ì«ÿÌ…
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                         ÕœÌÀ Êﬁ  ¬Œ— ‰”Œ… Ê«· √ﬂœ „‰ Ã«Â“Ì… Œÿ… «·«” Ã«»… ··ÿÊ«—∆.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200"> «—ÌŒ ÊÊﬁ  ¬Œ— ‰”Œ…</label>
                        <Input
                          value={settings.backups.lastBackup}
                          onChange={(event) => updateSetting('backups', 'lastBackup', event.target.value)}
                          className="bg-slate-950 border-slate-700 text-white"
                        />
                        <p className="text-xs text-slate-400">
                          Ì „ «” Œœ«„ Â–Â «·ﬁÌ„… ·≈—”«·  –ﬂÌ—  ·ﬁ«∆Ì ﬁ»· «·Õ«Ã… ≈·Ï «·‰”Œ… «· «·Ì….
                        </p>
                      </div>
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => router.push('/dashboard/accounting/cash-flow')}
                      >
                         ‰“Ì· ”Ã· «·‰”Œ «·«Õ Ì«ÿÌ…
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
                        ≈⁄œ«œ«  «·„ŸÂ—
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        «÷»ÿ «·√·Ê«‰ ÊﬂÀ«›… «·Ê«ÃÂ… »„« Ì ‰«”» „⁄ ÂÊÌ… „‰‘√ ﬂ.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">·Ê‰ «· „ÌÌ“</label>
                        <Select
                          value={settings.appearance.accentColor}
                          onValueChange={(value) => updateSetting('appearance', 'accentColor', value)}
                        >
                          <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder="«Œ — «··Ê‰" />
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
                        <label className="text-sm text-slate-200">ﬂÀ«›… «·Ê«ÃÂ…</label>
                        <Select
                          value={settings.appearance.layoutDensity}
                          onValueChange={(value) => updateSetting('appearance', 'layoutDensity', value)}
                        >
                          <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder="«Œ — «·ﬂÀ«›…" />
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
                        „⁄«Ì‰… «·Ê«ÃÂ…
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                         √ﬂœ „‰  ÿ«»ﬁ «·„ŸÂ— «·‰Â«∆Ì „⁄ ÂÊÌ… „‰‘√ ﬂ ﬁ»· «·«⁄ „«œ.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-400">„⁄«Ì‰…</p>
                            <p className="text-white font-semibold">{settings.general.companyName}</p>
                          </div>
                          <Badge className="bg-gray-800/50 border-white/20 text-white text-[11px]" variant="outline">
                            {settings.appearance.accentColor.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4 space-y-2">
                          <p className="text-sm text-slate-200">{settings.general.companyTagline}</p>
                          <p className="text-xs text-slate-400">
                            ﬂÀ«›… «·Ê«ÃÂ…: {settings.appearance.layoutDensity === 'compact'
                              ? '„÷€Êÿ'
                              : settings.appearance.layoutDensity === 'comfortable'
                                ? '„—ÌÕ'
                                : 'Ê«”⁄'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="px-3 py-1 rounded-full border border-purple-400/40 bg-purple-500/10 text-purple-200">
                            Ê÷⁄ «·‰Ÿ«„: {settings.general.systemMode === 'dark' ? 'œ«ﬂ‰' : settings.general.systemMode === 'light' ? '›« Õ' : 'Õ”» «·ÃÂ«“'}
                          </span>
                          {settings.appearance.bubbleBackground ? (
                            <span className="px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
                               √ÀÌ— «·›ﬁ«⁄«  „›⁄·
                            </span>
                          ) : null}
                          {settings.appearance.animatedTransitions ? (
                            <span className="px-3 py-1 rounded-full border border-purple-400/30 bg-purple-500/10 text-purple-200">
                              «‰ ﬁ«·«  œÌ‰«„ÌﬂÌ…
                            </span>
                          ) : null}
                          {settings.appearance.showTips ? (
                            <span className="px-3 py-1 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-200">
                               ·„ÌÕ«  „›⁄·…
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
                        ŒÌ«—«  „ ﬁœ„…
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        ÷»ÿ ”·Êﬂ «·‰Ÿ«„ «· ﬁ‰Ì Ê√œÊ«  «·„—«ﬁ»… «·„ ﬁœ„….
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
                        ≈œ«—… «·√œ«¡ Ê«· Œ“Ì‰ «·„ƒﬁ 
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        ÷»ÿ ÕÃ„ «·ﬂ«‘ Ê„ «»⁄… ⁄„·Ì«  «·’Ì«‰… «·„” „—….
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">”⁄… «· Œ“Ì‰ «·„ƒﬁ  („ÌÃ«»«Ì )</label>
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
                        ›⁄¯· „—«ﬁ»… «·√œ«¡ ··Õ’Ê· ⁄·Ï ≈‘⁄«—«  ›Ê—Ì… ⁄‰œ «— ›«⁄ «” Â·«ﬂ «·„⁄«·Ã √Ê «·–«ﬂ—…° „⁄  ﬁ«—Ì— √”»Ê⁄Ì… ·√»—“ «·„ƒ‘—« .
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-purple-400/40 text-purple-200 bg-purple-500/10 hover:bg-purple-500/20"
                        onClick={() => router.push('/dashboard/analytics')}
                      >
                        ⁄—÷ ·ÊÕ… „—«ﬁ»… «·√œ«¡
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
             „  ÿÊÌ— Â–« «·‰Ÿ«„ »Ê«”ÿ… <span className="font-semibold text-purple-300/80">Eng/Akram elmasry</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
