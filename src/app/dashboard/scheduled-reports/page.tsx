/**
 * @file page.tsx - Scheduled Reports Management
 * @description إدارة التقارير المجدولة
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Settings,
  Users,
  TrendingUp
} from 'lucide-react';
import {
  getScheduledReports,
  createScheduledReport,
  updateScheduledReport,
  deleteScheduledReport,
  toggleReportStatus,
  executeScheduledReport,
  calculateNextRun,
  type ScheduledReport
} from '@/lib/scheduled-reports-service';
import { getReportTemplates, type ReportTemplate } from '@/lib/report-builder-service';

export default function ScheduledReportsPage() {
  const { user, locale } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const propertyId = user?.propertyId || 'default';
      const [reportsData, templatesData] = await Promise.all([
        getScheduledReports(propertyId),
        getReportTemplates(propertyId)
      ]);
      setReports(reportsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (reportId: string, currentStatus: boolean) => {
    try {
      await toggleReportStatus(reportId, !currentStatus);
      await loadData();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(locale === 'ar' ? 'حدث خطأ' : 'Error occurred');
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      return;
    }

    try {
      await deleteScheduledReport(reportId);
      await loadData();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert(locale === 'ar' ? 'حدث خطأ في الحذف' : 'Error deleting report');
    }
  };

  const handleRunNow = async (reportId: string) => {
    try {
      await executeScheduledReport(reportId);
      alert(locale === 'ar' ? '✅ تم تنفيذ التقرير بنجاح' : '✅ Report executed successfully');
      await loadData();
    } catch (error) {
      console.error('Error executing report:', error);
      alert(locale === 'ar' ? '❌ فشل تنفيذ التقرير' : '❌ Failed to execute report');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-600 animate-pulse">
          {locale === 'ar' ? '⏱️ جاري التحميل...' : '⏱️ Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <Clock className="w-10 h-10 text-blue-600" />
            {locale === 'ar' ? 'التقارير المجدولة' : 'Scheduled Reports'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'ar' ? 'جدولة التقارير التلقائية وإرسالها بالبريد الإلكتروني' : 'Schedule automatic reports and email delivery'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 font-semibold shadow-lg"
        >
          <Plus className="w-5 h-5" />
          {locale === 'ar' ? 'إنشاء جدولة' : 'Create Schedule'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={locale === 'ar' ? 'إجمالي الجداول' : 'Total Schedules'}
          value={reports.length}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title={locale === 'ar' ? 'نشط' : 'Active'}
          value={reports.filter(r => r.enabled).length}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title={locale === 'ar' ? 'معطل' : 'Disabled'}
          value={reports.filter(r => !r.enabled).length}
          icon={<Pause className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title={locale === 'ar' ? 'فشل اليوم' : 'Failed Today'}
          value={reports.filter(r => r.runHistory.some(run => 
            run.status === 'failed' && 
            run.executedAt.toDateString() === new Date().toDateString()
          )).length}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Clock className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            {locale === 'ar' ? 'لا توجد تقارير مجدولة' : 'No Scheduled Reports'}
          </h3>
          <p className="text-gray-500 mb-6">
            {locale === 'ar' ? 'ابدأ بإنشاء جدولة جديدة للتقارير التلقائية' : 'Start by creating a new schedule for automatic reports'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {locale === 'ar' ? 'إنشاء أول جدولة' : 'Create First Schedule'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              locale={locale}
              onToggle={handleToggleStatus}
              onDelete={handleDelete}
              onRunNow={handleRunNow}
              onEdit={(r) => {
                setSelectedReport(r);
                setShowCreateModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateScheduleModal
            report={selectedReport}
            templates={templates}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedReport(null);
            }}
            onSave={async () => {
              setShowCreateModal(false);
              setSelectedReport(null);
              await loadData();
            }}
            locale={locale}
            propertyId={user?.propertyId || 'default'}
            userId={user?.uid || ''}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ====================================
// Stat Card Component
// ====================================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-pink-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white mb-4`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}

// ====================================
// Report Card Component
// ====================================

interface ReportCardProps {
  report: ScheduledReport;
  locale: string;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
  onRunNow: (id: string) => void;
  onEdit: (report: ScheduledReport) => void;
}

function ReportCard({ report, locale, onToggle, onDelete, onRunNow, onEdit }: ReportCardProps) {
  const lastRun = report.runHistory[report.runHistory.length - 1];
  
  const frequencyLabels = {
    daily: locale === 'ar' ? 'يومي' : 'Daily',
    weekly: locale === 'ar' ? 'أسبوعي' : 'Weekly',
    monthly: locale === 'ar' ? 'شهري' : 'Monthly',
    quarterly: locale === 'ar' ? 'ربع سنوي' : 'Quarterly',
    yearly: locale === 'ar' ? 'سنوي' : 'Yearly'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-800">{report.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              report.enabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {report.enabled ? (locale === 'ar' ? '✓ نشط' : '✓ Active') : (locale === 'ar' ? '⏸ معطل' : '⏸ Disabled')}
            </span>
          </div>
          <p className="text-gray-600">{report.description}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onToggle(report.id, report.enabled)}
            className={`p-2 rounded-lg ${
              report.enabled
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={report.enabled ? (locale === 'ar' ? 'إيقاف' : 'Pause') : (locale === 'ar' ? 'تفعيل' : 'Activate')}
          >
            {report.enabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => onRunNow(report.id)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
            title={locale === 'ar' ? 'تنفيذ الآن' : 'Run Now'}
          >
            <Play className="w-5 h-5" />
          </button>

          <button
            onClick={() => onEdit(report)}
            className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
            title={locale === 'ar' ? 'تعديل' : 'Edit'}
          >
            <Edit className="w-5 h-5" />
          </button>

          <button
            onClick={() => onDelete(report.id)}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            title={locale === 'ar' ? 'حذف' : 'Delete'}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 mb-1">{locale === 'ar' ? 'التكرار' : 'Frequency'}</p>
          <p className="font-semibold text-gray-700">{frequencyLabels[report.frequency]}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">{locale === 'ar' ? 'الوقت' : 'Time'}</p>
          <p className="font-semibold text-gray-700">{report.time}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">{locale === 'ar' ? 'الصيغة' : 'Format'}</p>
          <p className="font-semibold text-gray-700 uppercase">{report.format}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">{locale === 'ar' ? 'المستلمون' : 'Recipients'}</p>
          <p className="font-semibold text-gray-700">{report.recipients.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-blue-600 mb-1">{locale === 'ar' ? 'التنفيذ القادم' : 'Next Run'}</p>
            <p className="font-semibold text-blue-800">
              {report.nextRun.toLocaleDateString('ar-SA')} {report.nextRun.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {report.lastRun && (
            <div>
              <p className="text-xs text-gray-500 mb-1">{locale === 'ar' ? 'آخر تنفيذ' : 'Last Run'}</p>
              <p className="font-semibold text-gray-700">
                {report.lastRun.toLocaleDateString('ar-SA')}
              </p>
            </div>
          )}
        </div>

        {lastRun && (
          <div className="flex items-center gap-2">
            {lastRun.status === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">{locale === 'ar' ? 'نجح' : 'Success'}</span>
              </div>
            )}
            {lastRun.status === 'failed' && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">{locale === 'ar' ? 'فشل' : 'Failed'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {report.recipients.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{locale === 'ar' ? 'يُرسل إلى:' : 'Sent to:'}</span>
          <span className="font-medium">{report.recipients.slice(0, 2).join(', ')}</span>
          {report.recipients.length > 2 && (
            <span className="text-blue-600">+{report.recipients.length - 2} {locale === 'ar' ? 'آخرين' : 'more'}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ====================================
// Create Schedule Modal
// ====================================

interface CreateScheduleModalProps {
  report: ScheduledReport | null;
  templates: ReportTemplate[];
  onClose: () => void;
  onSave: () => void;
  locale: string;
  propertyId: string;
  userId: string;
}

function CreateScheduleModal({ report, templates, onClose, onSave, locale, propertyId, userId }: CreateScheduleModalProps) {
  const [formData, setFormData] = useState({
    templateId: report?.templateId || '',
    name: report?.name || '',
    description: report?.description || '',
    frequency: report?.frequency || 'daily' as const,
    dayOfWeek: report?.dayOfWeek || 0,
    dayOfMonth: report?.dayOfMonth || 1,
    time: report?.time || '08:00',
    recipients: report?.recipients.join(', ') || '',
    format: report?.format || 'csv' as const,
    dateRangeType: report?.dateRangeType || 'last_day' as const,
    includeCharts: report?.includeCharts ?? true,
    includeSummary: report?.includeSummary ?? true,
    notifyOnError: report?.notifyOnError ?? true,
    enabled: report?.enabled ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.templateId || !formData.name) {
      alert(locale === 'ar' ? 'الرجاء ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }

    try {
      const selectedTemplate = templates.find(t => t.id === formData.templateId);
      
      const scheduleData = {
        ...formData,
        templateName: selectedTemplate?.name || '',
        recipients: formData.recipients.split(',').map(e => e.trim()).filter(e => e),
        propertyId,
        createdBy: userId
      };

      if (report) {
        await updateScheduledReport(report.id, scheduleData);
      } else {
        await createScheduledReport(scheduleData);
      }

      alert(locale === 'ar' ? '✅ تم الحفظ بنجاح' : '✅ Saved successfully');
      onSave();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(locale === 'ar' ? '❌ حدث خطأ' : '❌ Error occurred');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">
            {report 
              ? (locale === 'ar' ? 'تعديل الجدولة' : 'Edit Schedule')
              : (locale === 'ar' ? 'إنشاء جدولة جديدة' : 'Create New Schedule')
            }
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'قالب التقرير *' : 'Report Template *'}
            </label>
            <select
              required
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{locale === 'ar' ? 'اختر القالب' : 'Select Template'}</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'اسم الجدولة *' : 'Schedule Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الوصف' : 'Description'}
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Frequency & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'التكرار' : 'Frequency'}
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">{locale === 'ar' ? 'يومي' : 'Daily'}</option>
                <option value="weekly">{locale === 'ar' ? 'أسبوعي' : 'Weekly'}</option>
                <option value="monthly">{locale === 'ar' ? 'شهري' : 'Monthly'}</option>
                <option value="quarterly">{locale === 'ar' ? 'ربع سنوي' : 'Quarterly'}</option>
                <option value="yearly">{locale === 'ar' ? 'سنوي' : 'Yearly'}</option>
              </select>
            </div>

            {formData.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'يوم الأسبوع' : 'Day of Week'}
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>{locale === 'ar' ? 'الأحد' : 'Sunday'}</option>
                  <option value={1}>{locale === 'ar' ? 'الإثنين' : 'Monday'}</option>
                  <option value={2}>{locale === 'ar' ? 'الثلاثاء' : 'Tuesday'}</option>
                  <option value={3}>{locale === 'ar' ? 'الأربعاء' : 'Wednesday'}</option>
                  <option value={4}>{locale === 'ar' ? 'الخميس' : 'Thursday'}</option>
                  <option value={5}>{locale === 'ar' ? 'الجمعة' : 'Friday'}</option>
                  <option value={6}>{locale === 'ar' ? 'السبت' : 'Saturday'}</option>
                </select>
              </div>
            )}

            {(formData.frequency === 'monthly' || formData.frequency === 'quarterly') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'يوم الشهر' : 'Day of Month'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الوقت' : 'Time'}
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Recipients & Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'المستلمون (emails مفصولة بفاصلة)' : 'Recipients (comma-separated emails)'}
              </label>
              <textarea
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="email1@example.com, email2@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'صيغة التصدير' : 'Export Format'}
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          {/* Date Range Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'نوع النطاق الزمني' : 'Date Range Type'}
            </label>
            <select
              value={formData.dateRangeType}
              onChange={(e) => setFormData({ ...formData, dateRangeType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="last_day">{locale === 'ar' ? 'آخر يوم' : 'Last Day'}</option>
              <option value="last_week">{locale === 'ar' ? 'آخر أسبوع' : 'Last Week'}</option>
              <option value="last_month">{locale === 'ar' ? 'آخر شهر' : 'Last Month'}</option>
              <option value="last_quarter">{locale === 'ar' ? 'آخر ربع' : 'Last Quarter'}</option>
              <option value="last_year">{locale === 'ar' ? 'آخر سنة' : 'Last Year'}</option>
            </select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {locale === 'ar' ? 'تفعيل الجدولة' : 'Enable Schedule'}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnError}
                onChange={(e) => setFormData({ ...formData, notifyOnError: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {locale === 'ar' ? 'إشعار في حالة الفشل' : 'Notify on Error'}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold"
            >
              {report 
                ? (locale === 'ar' ? 'تحديث' : 'Update')
                : (locale === 'ar' ? 'إنشاء' : 'Create')
              }
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
