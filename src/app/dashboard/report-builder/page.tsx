/**
 * @file page.tsx - Custom Report Builder
 * @description منشئ التقارير المخصصة
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Save,
  Download,
  Play,
  Filter,
  SortAsc,
  Trash2,
  Copy,
  Eye,
  Settings,
  Calendar,
  BarChart3,
  Table,
  PieChart,
  LineChart,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import {
  getAvailableFields,
  generateReport,
  saveReportTemplate,
  getReportTemplates,
  deleteReportTemplate,
  exportToCSV,
  PREDEFINED_TEMPLATES,
  type ReportField,
  type ReportFilter,
  type ReportSort,
  type ReportTemplate,
  type ReportData
} from '@/lib/report-builder-service';

export default function ReportBuilderPage() {
  const { user, locale } = useAuth();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedFields, setSelectedFields] = useState<ReportField[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [sorts, setSorts] = useState<ReportSort[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'doughnut' | 'table' | 'none'>('table');
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportCategory, setReportCategory] = useState<'financial' | 'operations' | 'marketing' | 'custom'>('custom');
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const propertyId = user?.propertyId || 'default';
    const data = await getReportTemplates(propertyId);
    setTemplates(data);
  };

  const handleAddField = (field: ReportField) => {
    if (!selectedFields.find(f => f.id === field.id)) {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const handleRemoveField = (fieldId: string) => {
    setSelectedFields(selectedFields.filter(f => f.id !== fieldId));
  };

  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const handleUpdateFilter = (index: number, filter: ReportFilter) => {
    const newFilters = [...filters];
    newFilters[index] = filter;
    setFilters(newFilters);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleAddSort = () => {
    setSorts([...sorts, { field: '', direction: 'asc' }]);
  };

  const handleGenerateReport = async () => {
    if (selectedFields.length === 0) {
      alert(locale === 'ar' ? 'الرجاء اختيار حقل واحد على الأقل' : 'Please select at least one field');
      return;
    }

    setLoading(true);
    try {
      const propertyId = user?.propertyId || 'default';
      const template: ReportTemplate = {
        id: '',
        name: reportName || 'تقرير مؤقت',
        description: reportDescription,
        category: reportCategory,
        fields: selectedFields,
        filters,
        sorts,
        groupBy,
        chartType,
        createdBy: user?.uid || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        propertyId
      };

      const data = await generateReport(propertyId, template, dateRange);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(locale === 'ar' ? 'حدث خطأ في إنشاء التقرير' : 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!reportName) {
      alert(locale === 'ar' ? 'الرجاء إدخال اسم التقرير' : 'Please enter report name');
      return;
    }

    if (selectedFields.length === 0) {
      alert(locale === 'ar' ? 'الرجاء اختيار حقل واحد على الأقل' : 'Please select at least one field');
      return;
    }

    setLoading(true);
    try {
      const propertyId = user?.propertyId || 'default';
      await saveReportTemplate({
        name: reportName,
        description: reportDescription,
        category: reportCategory,
        fields: selectedFields,
        filters,
        sorts,
        groupBy,
        chartType,
        createdBy: user?.uid || '',
        isPublic: false,
        propertyId
      });

      alert(locale === 'ar' ? '✅ تم حفظ القالب بنجاح' : '✅ Template saved successfully');
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert(locale === 'ar' ? 'حدث خطأ في حفظ القالب' : 'Error saving template');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTemplate = (template: ReportTemplate) => {
    setReportName(template.name);
    setReportDescription(template.description);
    setReportCategory(template.category);
    setSelectedFields(template.fields);
    setFilters(template.filters);
    setSorts(template.sorts);
    setGroupBy(template.groupBy || []);
    setChartType(template.chartType || 'table');
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    const csv = exportToCSV(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportName || 'report'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            {locale === 'ar' ? 'منشئ التقارير المخصصة' : 'Custom Report Builder'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'ar' ? 'أنشئ تقارير مخصصة بسهولة مع فلاتر وتجميعات متقدمة' : 'Create custom reports easily with advanced filters and grouping'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              {locale === 'ar' ? 'معلومات التقرير' : 'Report Info'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'اسم التقرير' : 'Report Name'}
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={locale === 'ar' ? 'مثال: تقرير الإيرادات اليومي' : 'Example: Daily Revenue Report'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder={locale === 'ar' ? 'وصف مختصر للتقرير' : 'Brief description'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'التصنيف' : 'Category'}
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="financial">{locale === 'ar' ? 'مالي' : 'Financial'}</option>
                    <option value="operations">{locale === 'ar' ? 'تشغيلي' : 'Operations'}</option>
                    <option value="marketing">{locale === 'ar' ? 'تسويقي' : 'Marketing'}</option>
                    <option value="custom">{locale === 'ar' ? 'مخصص' : 'Custom'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'نوع المخطط' : 'Chart Type'}
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="table">{locale === 'ar' ? 'جدول' : 'Table'}</option>
                    <option value="bar">{locale === 'ar' ? 'أعمدة' : 'Bar'}</option>
                    <option value="line">{locale === 'ar' ? 'خطي' : 'Line'}</option>
                    <option value="pie">{locale === 'ar' ? 'دائري' : 'Pie'}</option>
                    <option value="doughnut">{locale === 'ar' ? 'حلقي' : 'Doughnut'}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              {locale === 'ar' ? 'النطاق الزمني' : 'Date Range'}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'من تاريخ' : 'From Date'}
                </label>
                <input
                  type="date"
                  value={dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'إلى تاريخ' : 'To Date'}
                </label>
                <input
                  type="date"
                  value={dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Selected Fields */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Table className="w-5 h-5 text-purple-600" />
                {locale === 'ar' ? 'الحقول المختارة' : 'Selected Fields'}
                <span className="text-sm font-normal text-gray-500">({selectedFields.length})</span>
              </h2>

              <button
                onClick={() => setShowFieldSelector(!showFieldSelector)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {locale === 'ar' ? 'إضافة حقل' : 'Add Field'}
              </button>
            </div>

            {selectedFields.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {locale === 'ar' ? '🔍 لم يتم اختيار أي حقول بعد' : '🔍 No fields selected yet'}
              </p>
            ) : (
              <div className="space-y-2">
                {selectedFields.map((field, idx) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium">{field.label}</p>
                        <p className="text-xs text-gray-500">
                          {field.source} • {field.type}
                          {field.aggregation && ` • ${field.aggregation}`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveField(field.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-600" />
                {locale === 'ar' ? 'الفلاتر' : 'Filters'}
                <span className="text-sm font-normal text-gray-500">({filters.length})</span>
              </h2>

              <button
                onClick={handleAddFilter}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {locale === 'ar' ? 'إضافة فلتر' : 'Add Filter'}
              </button>
            </div>

            {filters.length > 0 && (
              <div className="space-y-3">
                {filters.map((filter, idx) => (
                  <FilterRow
                    key={idx}
                    filter={filter}
                    availableFields={selectedFields}
                    onChange={(f) => handleUpdateFilter(idx, f)}
                    onRemove={() => handleRemoveFilter(idx)}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleGenerateReport}
              disabled={loading || selectedFields.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              <Play className="w-5 h-5" />
              {loading ? (locale === 'ar' ? 'جاري الإنشاء...' : 'Generating...') : (locale === 'ar' ? 'إنشاء التقرير' : 'Generate Report')}
            </button>

            <button
              onClick={handleSaveTemplate}
              disabled={loading || selectedFields.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {locale === 'ar' ? 'حفظ القالب' : 'Save Template'}
            </button>
          </div>
        </div>

        {/* Right Panel - Templates */}
        <div className="space-y-6">
          {/* Predefined Templates */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              {locale === 'ar' ? 'قوالب جاهزة' : 'Quick Templates'}
            </h2>

            <div className="space-y-2">
              {PREDEFINED_TEMPLATES.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadTemplate(template as any)}
                  className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                >
                  <p className="font-medium text-indigo-900">{template.name}</p>
                  <p className="text-xs text-indigo-600 mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Templates */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Save className="w-5 h-5 text-green-600" />
              {locale === 'ar' ? 'القوالب المحفوظة' : 'Saved Templates'}
            </h2>

            {templates.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                {locale === 'ar' ? 'لا توجد قوالب محفوظة' : 'No saved templates'}
              </p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.category}</p>
                      </div>
                      <button
                        onClick={() => deleteReportTemplate(template.id).then(loadTemplates)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="w-full px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      {locale === 'ar' ? 'تحميل' : 'Load'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              {locale === 'ar' ? 'نتائج التقرير' : 'Report Results'}
            </h2>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {locale === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  {reportData.headers.map((header, idx) => (
                    <th key={idx} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-3 text-sm text-gray-900">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {reportData.summary && (
                <tfoot className="bg-blue-50 font-semibold">
                  <tr>
                    <td colSpan={reportData.headers.length} className="px-4 py-3 text-sm">
                      {locale === 'ar' ? 'الإجمالي:' : 'Total:'} {Object.values(reportData.summary).join(' | ')}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {locale === 'ar' ? 'إجمالي الصفوف:' : 'Total Rows:'} {reportData.metadata.totalRows} • 
            {locale === 'ar' ? ' تم الإنشاء:' : ' Generated:'} {reportData.metadata.generatedAt.toLocaleString('ar-SA')}
          </div>
        </motion.div>
      )}

      {/* Field Selector Modal */}
      <AnimatePresence>
        {showFieldSelector && (
          <FieldSelectorModal
            onClose={() => setShowFieldSelector(false)}
            onSelect={handleAddField}
            selectedFields={selectedFields}
            locale={locale}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ====================================
// Filter Row Component
// ====================================

function FilterRow({
  filter,
  availableFields,
  onChange,
  onRemove,
  locale
}: {
  filter: ReportFilter;
  availableFields: ReportField[];
  onChange: (filter: ReportFilter) => void;
  onRemove: () => void;
  locale: string;
}) {
  return (
    <div className="flex gap-2">
      <select
        value={filter.field}
        onChange={(e) => onChange({ ...filter, field: e.target.value })}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">{locale === 'ar' ? 'اختر الحقل' : 'Select Field'}</option>
        {availableFields.map((field) => (
          <option key={field.id} value={field.id}>{field.label}</option>
        ))}
      </select>

      <select
        value={filter.operator}
        onChange={(e) => onChange({ ...filter, operator: e.target.value as any })}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="equals">=</option>
        <option value="not_equals">≠</option>
        <option value="greater_than">&gt;</option>
        <option value="less_than">&lt;</option>
        <option value="contains">{locale === 'ar' ? 'يحتوي' : 'Contains'}</option>
      </select>

      <input
        type="text"
        value={filter.value}
        onChange={(e) => onChange({ ...filter, value: e.target.value })}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        placeholder={locale === 'ar' ? 'القيمة' : 'Value'}
      />

      <button
        onClick={onRemove}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ====================================
// Field Selector Modal
// ====================================

function FieldSelectorModal({
  onClose,
  onSelect,
  selectedFields,
  locale
}: {
  onClose: () => void;
  onSelect: (field: ReportField) => void;
  selectedFields: ReportField[];
  locale: string;
}) {
  const [selectedSource, setSelectedSource] = useState('bookings');
  const availableFields = getAvailableFields(selectedSource);

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
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {locale === 'ar' ? 'اختر الحقول' : 'Select Fields'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
          >
            <option value="bookings">{locale === 'ar' ? 'الحجوزات' : 'Bookings'}</option>
            <option value="expense_vouchers">{locale === 'ar' ? 'سندات الصرف' : 'Expense Vouchers'}</option>
            <option value="promissory_notes">{locale === 'ar' ? 'الكمبيالات' : 'Promissory Notes'}</option>
            <option value="ratings">{locale === 'ar' ? 'التقييمات' : 'Ratings'}</option>
          </select>

          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {availableFields.map((field) => {
              const isSelected = selectedFields.find(f => f.id === field.id);
              return (
                <button
                  key={field.id}
                  onClick={() => {
                    onSelect(field);
                    onClose();
                  }}
                  disabled={!!isSelected}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50 cursor-not-allowed opacity-50'
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <p className="font-medium">{field.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {field.type} {field.aggregation && `• ${field.aggregation}`}
                  </p>
                  {isSelected && (
                    <p className="text-xs text-green-600 mt-1">✓ {locale === 'ar' ? 'مضاف' : 'Added'}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
