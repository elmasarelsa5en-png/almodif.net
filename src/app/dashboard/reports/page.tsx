'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  TrendingUp, BarChart3, Calendar, TrendingDown, DollarSign, Package,
  Receipt, Users, UserCheck, CreditCard, Lock, MessageSquare, Wrench,
  PieChart, Settings, Building, X, FileText, Building2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';

interface ReportCard {
  icon: React.ComponentType<any>;
  titleKey: string;
  descKey: string;
  href: string;
  color: string;
  gradient: string;
}

const reportCards: ReportCard[] = [
  {
    icon: TrendingUp,
    titleKey: 'cashMovementReport',
    descKey: 'cashMovementReportDesc',
    href: '/dashboard/reports/cash-movement',
    color: 'text-emerald-400',
    gradient: 'from-emerald-600/30 to-green-600/30'
  },
  {
    icon: BarChart3,
    titleKey: 'monthlyTotalReport',
    descKey: 'monthlyTotalReportDesc',
    href: '/dashboard/reports/monthly-total',
    color: 'text-blue-400',
    gradient: 'from-blue-600/30 to-indigo-600/30'
  },
  {
    icon: Calendar,
    titleKey: 'dailyMovementReport',
    descKey: 'dailyMovementReportDesc',
    href: '/dashboard/reports/daily-movement',
    color: 'text-purple-400',
    gradient: 'from-purple-600/30 to-fuchsia-600/30'
  },
  {
    icon: TrendingDown,
    titleKey: 'occupancyRateReport',
    descKey: 'occupancyRateReportDesc',
    href: '/dashboard/reports/occupancy-rate',
    color: 'text-orange-400',
    gradient: 'from-orange-600/30 to-red-600/30'
  },
  {
    icon: DollarSign,
    titleKey: 'cashVaultReport',
    descKey: 'cashVaultReportDesc',
    href: '/dashboard/reports/cash-vault',
    color: 'text-amber-400',
    gradient: 'from-amber-600/30 to-yellow-600/30'
  },
  {
    icon: Package,
    titleKey: 'commissionsReport',
    descKey: 'commissionsReportDesc',
    href: '/dashboard/reports/commissions',
    color: 'text-indigo-400',
    gradient: 'from-indigo-600/30 to-violet-600/30'
  },
  {
    icon: Receipt,
    titleKey: 'receiptsReport',
    descKey: 'receiptsReportDesc',
    href: '/dashboard/reports/receipts',
    color: 'text-rose-400',
    gradient: 'from-rose-600/30 to-pink-600/30'
  },
  {
    icon: Users,
    titleKey: 'employeeReservationsReport',
    descKey: 'employeeReservationsReportDesc',
    href: '/dashboard/reports/employee-reservations',
    color: 'text-teal-400',
    gradient: 'from-teal-600/30 to-cyan-600/30'
  },
  {
    icon: UserCheck,
    titleKey: 'employeeStatisticsReport',
    descKey: 'employeeStatisticsReportDesc',
    href: '/dashboard/reports/employee-statistics',
    color: 'text-lime-400',
    gradient: 'from-lime-600/30 to-green-600/30'
  },
  {
    icon: CreditCard,
    titleKey: 'servicesReport',
    descKey: 'servicesReportDesc',
    href: '/dashboard/reports/services',
    color: 'text-sky-400',
    gradient: 'from-sky-600/30 to-blue-600/30'
  },
  {
    icon: Lock,
    titleKey: 'openReservationsReport',
    descKey: 'openReservationsReportDesc',
    href: '/dashboard/reports/open-reservations',
    color: 'text-red-400',
    gradient: 'from-red-600/30 to-orange-600/30'
  },
  {
    icon: MessageSquare,
    titleKey: 'messagesSummaryReport',
    descKey: 'messagesSummaryReportDesc',
    href: '/dashboard/reports/messages-summary',
    color: 'text-violet-400',
    gradient: 'from-violet-600/30 to-purple-600/30'
  },
  {
    icon: Wrench,
    titleKey: 'apartmentChangeReport',
    descKey: 'apartmentChangeReportDesc',
    href: '/dashboard/reports/apartment-change',
    color: 'text-amber-400',
    gradient: 'from-amber-600/30 to-orange-600/30'
  },
  {
    icon: BarChart3,
    titleKey: 'monthlyReportByMonth',
    descKey: 'monthlyReportByMonthDesc',
    href: '/dashboard/reports/monthly-by-month',
    color: 'text-emerald-400',
    gradient: 'from-emerald-600/30 to-teal-600/30'
  },
  {
    icon: PieChart,
    titleKey: 'taxesAndFeesReport',
    descKey: 'taxesAndFeesReportDesc',
    href: '/dashboard/reports/taxes-and-fees',
    color: 'text-fuchsia-400',
    gradient: 'from-fuchsia-600/30 to-pink-600/30'
  },
  {
    icon: Settings,
    titleKey: 'evaluations',
    descKey: 'evaluationsDesc',
    href: '/dashboard/reports/evaluations',
    color: 'text-cyan-400',
    gradient: 'from-cyan-600/30 to-sky-600/30'
  },
  {
    icon: UserCheck,
    titleKey: 'tourismAuthorityReport',
    descKey: 'tourismAuthorityReportDesc',
    href: '/dashboard/reports/tourism-authority',
    color: 'text-purple-400',
    gradient: 'from-purple-600/30 to-indigo-600/30'
  },
  {
    icon: Building,
    titleKey: 'roomStatusByType',
    descKey: 'roomStatusByTypeDesc',
    href: '/dashboard/reports/room-status-by-type',
    color: 'text-slate-400',
    gradient: 'from-slate-600/30 to-gray-600/30'
  },
  {
    icon: X,
    titleKey: 'roomDiscrepancy',
    descKey: 'roomDiscrepancyDesc',
    href: '/dashboard/reports/room-discrepancy',
    color: 'text-orange-400',
    gradient: 'from-orange-600/30 to-red-600/30'
  },
  {
    icon: FileText,
    titleKey: 'customReport',
    descKey: 'customReportDesc',
    href: '/dashboard/reports/custom',
    color: 'text-blue-400',
    gradient: 'from-blue-600/30 to-cyan-600/30'
  },
  {
    icon: Receipt,
    titleKey: 'invoicesReport',
    descKey: 'invoicesReportDesc',
    href: '/dashboard/reports/invoices',
    color: 'text-purple-400',
    gradient: 'from-purple-600/30 to-pink-600/30'
  },
  {
    icon: Building2,
    titleKey: 'bankReport',
    descKey: 'bankReportDesc',
    href: '/dashboard/reports/bank',
    color: 'text-green-400',
    gradient: 'from-green-600/30 to-emerald-600/30'
  },
  {
    icon: Users,
    titleKey: 'guestsReport',
    descKey: 'guestsReportDesc',
    href: '/dashboard/reports/guests',
    color: 'text-teal-400',
    gradient: 'from-teal-600/30 to-cyan-600/30'
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-white mb-2"
        >
          📊 {t('reports')}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-lg"
        >
          {t('reportsDesc')}
        </motion.p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {reportCards.map((report, index) => (
          <motion.div
            key={report.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              onClick={() => router.push(report.href)}
              className="group cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-600/50 hover:border-purple-500/70 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <CardContent className="p-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${report.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <report.icon className={`w-8 h-8 ${report.color} drop-shadow-lg`} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {t(report.titleKey as any)}
                </h3>
                
                <p className="text-sm text-slate-300">
                  {t(report.descKey as any)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
