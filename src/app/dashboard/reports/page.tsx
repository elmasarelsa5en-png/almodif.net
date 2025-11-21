'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  TrendingUp, BarChart3, Calendar, TrendingDown, DollarSign, Package,
  Receipt, Users, UserCheck, CreditCard, Lock, MessageSquare, Wrench,
  PieChart, Settings, Building, X, FileText, Building2, Search, Filter,
  Grid3x3, List, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ReportCard {
  icon: React.ComponentType<any>;
  titleKey: string;
  descKey: string;
  href: string;
  color: string;
  gradient: string;
  category: 'financial' | 'operations' | 'guests' | 'staff' | 'analytics' | 'custom';
  implemented: boolean;
}

const reportCards: ReportCard[] = [
  // Financial Reports
  {
    icon: TrendingUp,
    titleKey: 'cashMovementReport',
    descKey: 'cashMovementReportDesc',
    href: '/dashboard/reports/cash-movement',
    color: 'text-emerald-400',
    gradient: 'from-emerald-600/30 to-green-600/30',
    category: 'financial',
    implemented: true
  },
  {
    icon: BarChart3,
    titleKey: 'monthlyTotalReport',
    descKey: 'monthlyTotalReportDesc',
    href: '/dashboard/reports/monthly-total',
    color: 'text-blue-400',
    gradient: 'from-blue-600/30 to-indigo-600/30',
    category: 'financial',
    implemented: true
  },
  {
    icon: DollarSign,
    titleKey: 'cashVaultReport',
    descKey: 'cashVaultReportDesc',
    href: '/dashboard/reports/cash-vault',
    color: 'text-amber-400',
    gradient: 'from-amber-600/30 to-yellow-600/30',
    category: 'financial',
    implemented: true
  },
  {
    icon: Package,
    titleKey: 'commissionsReport',
    descKey: 'commissionsReportDesc',
    href: '/dashboard/reports/commissions',
    color: 'text-indigo-400',
    gradient: 'from-indigo-600/30 to-violet-600/30',
    category: 'financial',
    implemented: true
  },
  {
    icon: Receipt,
    titleKey: 'receiptsReport',
    descKey: 'receiptsReportDesc',
    href: '/dashboard/reports/receipts',
    color: 'text-rose-400',
    gradient: 'from-rose-600/30 to-pink-600/30',
    category: 'financial',
    implemented: true
  },
  {
    icon: Receipt,
    titleKey: 'invoicesReport',
    descKey: 'invoicesReportDesc',
    href: '/dashboard/reports/invoices',
    color: 'text-purple-400',
    gradient: 'from-purple-600/30 to-pink-600/30',
    category: 'financial',
    implemented: true
  },
  {
    icon: PieChart,
    titleKey: 'taxesAndFeesReport',
    descKey: 'taxesAndFeesReportDesc',
    href: '/dashboard/reports/taxes-and-fees',
    color: 'text-fuchsia-400',
    gradient: 'from-fuchsia-600/30 to-pink-600/30',
    category: 'financial',
    implemented: false
  },
  {
    icon: Building2,
    titleKey: 'bankReport',
    descKey: 'bankReportDesc',
    href: '/dashboard/reports/bank',
    color: 'text-green-400',
    gradient: 'from-green-600/30 to-emerald-600/30',
    category: 'financial',
    implemented: true
  },

  // Operations Reports
  {
    icon: Calendar,
    titleKey: 'dailyMovementReport',
    descKey: 'dailyMovementReportDesc',
    href: '/dashboard/reports/daily-movement',
    color: 'text-purple-400',
    gradient: 'from-purple-600/30 to-fuchsia-600/30',
    category: 'operations',
    implemented: true
  },
  {
    icon: TrendingDown,
    titleKey: 'occupancyRateReport',
    descKey: 'occupancyRateReportDesc',
    href: '/dashboard/reports/occupancy-rate',
    color: 'text-orange-400',
    gradient: 'from-orange-600/30 to-red-600/30',
    category: 'operations',
    implemented: true
  },
  {
    icon: Lock,
    titleKey: 'openReservationsReport',
    descKey: 'openReservationsReportDesc',
    href: '/dashboard/reports/open-reservations',
    color: 'text-red-400',
    gradient: 'from-red-600/30 to-orange-600/30',
    category: 'operations',
    implemented: true
  },
  {
    icon: Building,
    titleKey: 'roomStatusByType',
    descKey: 'roomStatusByTypeDesc',
    href: '/dashboard/reports/room-status-by-type',
    color: 'text-slate-400',
    gradient: 'from-slate-600/30 to-gray-600/30',
    category: 'operations',
    implemented: true
  },
  {
    icon: X,
    titleKey: 'roomDiscrepancy',
    descKey: 'roomDiscrepancyDesc',
    href: '/dashboard/reports/room-discrepancy',
    color: 'text-orange-400',
    gradient: 'from-orange-600/30 to-red-600/30',
    category: 'operations',
    implemented: false
  },
  {
    icon: Wrench,
    titleKey: 'apartmentChangeReport',
    descKey: 'apartmentChangeReportDesc',
    href: '/dashboard/reports/apartment-change',
    color: 'text-amber-400',
    gradient: 'from-amber-600/30 to-orange-600/30',
    category: 'operations',
    implemented: false
  },

  // Guest Reports
  {
    icon: Users,
    titleKey: 'guestsReport',
    descKey: 'guestsReportDesc',
    href: '/dashboard/reports/guests',
    color: 'text-teal-400',
    gradient: 'from-teal-600/30 to-cyan-600/30',
    category: 'guests',
    implemented: false
  },
  {
    icon: MessageSquare,
    titleKey: 'messagesSummaryReport',
    descKey: 'messagesSummaryReportDesc',
    href: '/dashboard/reports/messages-summary',
    color: 'text-violet-400',
    gradient: 'from-violet-600/30 to-purple-600/30',
    category: 'guests',
    implemented: false
  },
  {
    icon: CreditCard,
    titleKey: 'servicesReport',
    descKey: 'servicesReportDesc',
    href: '/dashboard/reports/services',
    color: 'text-sky-400',
    gradient: 'from-sky-600/30 to-blue-600/30',
    category: 'guests',
    implemented: false
  },
  {
    icon: Settings,
    titleKey: 'evaluations',
    descKey: 'evaluationsDesc',
    href: '/dashboard/reports/evaluations',
    color: 'text-cyan-400',
    gradient: 'from-cyan-600/30 to-sky-600/30',
    category: 'guests',
    implemented: false
  },

  // Staff Reports
  {
    icon: Users,
    titleKey: 'employeeReservationsReport',
    descKey: 'employeeReservationsReportDesc',
    href: '/dashboard/reports/employee-reservations',
    color: 'text-teal-400',
    gradient: 'from-teal-600/30 to-cyan-600/30',
    category: 'staff',
    implemented: false
  },
  {
    icon: UserCheck,
    titleKey: 'employeeStatisticsReport',
    descKey: 'employeeStatisticsReportDesc',
    href: '/dashboard/reports/employee-statistics',
    color: 'text-lime-400',
    gradient: 'from-lime-600/30 to-green-600/30',
    category: 'staff',
    implemented: false
  },

  // Analytics & Custom
  {
    icon: BarChart3,
    titleKey: 'monthlyReportByMonth',
    descKey: 'monthlyReportByMonthDesc',
    href: '/dashboard/reports/monthly-by-month',
    color: 'text-emerald-400',
    gradient: 'from-emerald-600/30 to-teal-600/30',
    category: 'analytics',
    implemented: false
  },
  {
    icon: UserCheck,
    titleKey: 'tourismAuthorityReport',
    descKey: 'tourismAuthorityReportDesc',
    href: '/dashboard/reports/tourism-authority',
    color: 'text-purple-400',
    gradient: 'from-purple-600/30 to-indigo-600/30',
    category: 'analytics',
    implemented: false
  },
  {
    icon: FileText,
    titleKey: 'customReport',
    descKey: 'customReportDesc',
    href: '/dashboard/reports/custom',
    color: 'text-blue-400',
    gradient: 'from-blue-600/30 to-cyan-600/30',
    category: 'custom',
    implemented: false
  },
];

const categories = [
  { id: 'all', labelAr: 'جميع التقارير', labelEn: 'All Reports', icon: Grid3x3 },
  { id: 'financial', labelAr: 'التقارير المالية', labelEn: 'Financial', icon: DollarSign },
  { id: 'operations', labelAr: 'العمليات', labelEn: 'Operations', icon: Building },
  { id: 'guests', labelAr: 'الضيوف', labelEn: 'Guests', icon: Users },
  { id: 'staff', labelAr: 'الموظفون', labelEn: 'Staff', icon: UserCheck },
  { id: 'analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: BarChart3 },
  { id: 'custom', labelAr: 'مخصص', labelEn: 'Custom', icon: Settings },
];

export default function ReportsPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyImplemented, setShowOnlyImplemented] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter reports based on search, category, and implementation status
  const filteredReports = useMemo(() => {
    return reportCards.filter(report => {
      // Search filter
      const titleText = t(report.titleKey as any).toLowerCase();
      const descText = t(report.descKey as any).toLowerCase();
      const matchesSearch = searchQuery === '' || 
        titleText.includes(searchQuery.toLowerCase()) || 
        descText.includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;

      // Implementation filter
      const matchesImplementation = !showOnlyImplemented || report.implemented;

      return matchesSearch && matchesCategory && matchesImplementation;
    });
  }, [searchQuery, selectedCategory, showOnlyImplemented, t]);

  const implementedCount = reportCards.filter(r => r.implemented).length;
  const totalCount = reportCards.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4 mb-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-purple-300 to-blue-300 mb-2">
              📊 {t('reports')}
            </h1>
            <p className="text-slate-400 text-lg">
              {t('reportsDesc')} - {filteredReports.length} {locale === 'ar' ? 'تقرير' : 'report'}
            </p>
          </div>

          {/* Stats Badge */}
          <div className="flex items-center gap-3">
            <Badge className="bg-green-600 text-white font-bold border-green-700 px-4 py-2 text-sm shadow-lg">
              ✅ {implementedCount} {locale === 'ar' ? 'مُفعّل' : 'Active'}
            </Badge>
            <Badge className="bg-yellow-500 text-white font-bold border-yellow-600 px-4 py-2 text-sm shadow-lg">
              🔄 {totalCount - implementedCount} {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
            </Badge>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث عن تقرير...' : 'Search for a report...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 h-12 text-base"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className={`whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <cat.icon className="w-4 h-4 ml-2" />
                {locale === 'ar' ? cat.labelAr : cat.labelEn}
              </Button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Button
              onClick={() => setShowOnlyImplemented(!showOnlyImplemented)}
              variant="outline"
              className="bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50"
            >
              <Filter className="w-4 h-4 ml-2" />
              {showOnlyImplemented 
                ? (locale === 'ar' ? 'إظهار الكل' : 'Show All')
                : (locale === 'ar' ? 'المُفعّلة فقط' : 'Active Only')
              }
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                className={viewMode === 'grid' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-800/50 border-slate-700/50'}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                className={viewMode === 'list' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-800/50 border-slate-700/50'}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reports Grid/List */}
      {filteredReports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <AlertCircle className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {locale === 'ar' ? 'لا توجد تقارير' : 'No Reports Found'}
          </h3>
          <p className="text-slate-400">
            {locale === 'ar' ? 'جرب تغيير معايير البحث' : 'Try changing your search criteria'}
          </p>
        </motion.div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
            : 'space-y-4'
        }>
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                onClick={() => {
                  if (report.implemented) {
                    router.push(report.href);
                  }
                }}
                className={`group ${report.implemented ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60'} transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-600/50 ${report.implemented ? 'hover:border-orange-500/70' : ''} backdrop-blur-sm shadow-xl ${report.implemented ? 'hover:shadow-2xl hover:shadow-orange-500/20' : ''} relative`}
              >
                {/* Implementation Badge */}
                <div className="absolute top-3 left-3 z-10">
                  {report.implemented ? (
                    <Badge className="bg-green-600 text-white font-bold border-green-700 text-xs shadow-lg">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      {locale === 'ar' ? 'مُفعّل' : 'Active'}
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500 text-white font-bold border-yellow-600 text-xs shadow-lg">
                      <AlertCircle className="w-3 h-3 ml-1" />
                      {locale === 'ar' ? 'قريباً' : 'Soon'}
                    </Badge>
                  )}
                </div>

                <CardContent className={viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center gap-4'}>
                  <div className={`${viewMode === 'grid' ? 'w-16 h-16 mb-4' : 'w-14 h-14 flex-shrink-0'} rounded-2xl bg-gradient-to-br ${report.gradient} flex items-center justify-center ${report.implemented ? 'group-hover:scale-110' : ''} transition-transform duration-300 shadow-lg`}>
                    <report.icon className={`${viewMode === 'grid' ? 'w-8 h-8' : 'w-7 h-7'} ${report.color} drop-shadow-lg`} />
                  </div>
                  
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className={`${viewMode === 'grid' ? 'text-xl mb-2' : 'text-lg mb-1'} font-bold text-white ${report.implemented ? 'group-hover:text-orange-100 font-semibold' : ''} transition-colors`}>
                      {t(report.titleKey as any)}
                    </h3>
                    
                    <p className={`${viewMode === 'grid' ? 'text-sm' : 'text-xs'} text-slate-300`}>
                      {t(report.descKey as any)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


