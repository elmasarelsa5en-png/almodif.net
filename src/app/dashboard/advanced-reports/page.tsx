'use client';

/**
 * Advanced Report Builder
 * منشئ التقارير المتقدم
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  PieChart,
  Filter,
  Download,
  Play,
  Save,
  Plus,
  X,
  Calendar,
  TrendingUp,
  Settings,
  Eye,
  FileSpreadsheet,
  FileText,
  Database,
  Sparkles,
} from 'lucide-react';
import {
  advancedReportsService,
  type ReportDefinition,
  type ReportColumn,
  type ReportFilter,
  type ReportChart,
  type ReportData,
  type ExportFormat,
  type ChartType,
} from '@/lib/reports/advanced-reports-service';

export default function AdvancedReportBuilder() {
  const [reportName, setReportName] = useState('');
  const [dataSource, setDataSource] = useState('bookings');
  const [columns, setColumns] = useState<ReportColumn[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [charts, setCharts] = useState<ReportChart[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Available data sources
  const dataSources = [
    { value: 'bookings', label: 'الحجوزات', icon: '📅' },
    { value: 'guests', label: 'النزلاء', icon: '👥' },
    { value: 'rooms', label: 'الغرف', icon: '🏨' },
    { value: 'inventory', label: 'المخزون', icon: '📦' },
    { value: 'expenses', label: 'المصروفات', icon: '💰' },
    { value: 'staff', label: 'الموظفين', icon: '👨‍💼' },
  ];

  // Available columns per data source
  const availableColumns: Record<string, ReportColumn[]> = {
    bookings: [
      { id: 'guestName', field: 'guestName', label: 'اسم النزيل', type: 'string', sortable: true, filterable: true },
      { id: 'roomNumber', field: 'roomNumber', label: 'رقم الغرفة', type: 'string', sortable: true, filterable: true },
      { id: 'checkIn', field: 'checkIn', label: 'تاريخ الوصول', type: 'date', sortable: true, filterable: true },
      { id: 'checkOut', field: 'checkOut', label: 'تاريخ المغادرة', type: 'date', sortable: true, filterable: true },
      { id: 'totalPrice', field: 'totalPrice', label: 'السعر الإجمالي', type: 'currency', aggregation: 'sum', sortable: true },
      { id: 'status', field: 'status', label: 'الحالة', type: 'string', filterable: true },
      { id: 'nights', field: 'nights', label: 'عدد الليالي', type: 'number', aggregation: 'sum', sortable: true },
    ],
    guests: [
      { id: 'name', field: 'name', label: 'الاسم', type: 'string', sortable: true, filterable: true },
      { id: 'email', field: 'email', label: 'البريد الإلكتروني', type: 'string', filterable: true },
      { id: 'phone', field: 'phone', label: 'رقم الهاتف', type: 'string', filterable: true },
      { id: 'totalBookings', field: 'totalBookings', label: 'عدد الحجوزات', type: 'number', aggregation: 'sum' },
      { id: 'totalSpent', field: 'totalSpent', label: 'إجمالي الإنفاق', type: 'currency', aggregation: 'sum' },
      { id: 'rating', field: 'rating', label: 'التقييم', type: 'number', aggregation: 'avg' },
    ],
  };

  // Chart types
  const chartTypes: { value: ChartType; label: string; icon: any }[] = [
    { value: 'bar', label: 'عمودي', icon: BarChart3 },
    { value: 'line', label: 'خطي', icon: LineChart },
    { value: 'pie', label: 'دائري', icon: PieChart },
    { value: 'area', label: 'مساحي', icon: TrendingUp },
  ];

  // Add column
  const addColumn = (column: ReportColumn) => {
    if (!columns.find(c => c.id === column.id)) {
      setColumns([...columns, column]);
    }
  };

  // Remove column
  const removeColumn = (columnId: string) => {
    setColumns(columns.filter(c => c.id !== columnId));
  };

  // Add filter
  const addFilter = () => {
    setFilters([
      ...filters,
      {
        field: '',
        operator: '==',
        value: '',
      },
    ]);
  };

  // Update filter
  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  // Remove filter
  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  // Add chart
  const addChart = () => {
    setCharts([
      ...charts,
      {
        id: `chart-${Date.now()}`,
        type: 'bar',
        title: 'رسم بياني جديد',
        xAxis: '',
        yAxis: [],
        aggregation: 'sum',
        showLegend: true,
        showDataLabels: false,
      },
    ]);
  };

  // Update chart
  const updateChart = (index: number, updates: Partial<ReportChart>) => {
    const newCharts = [...charts];
    newCharts[index] = { ...newCharts[index], ...updates };
    setCharts(newCharts);
  };

  // Remove chart
  const removeChart = (index: number) => {
    setCharts(charts.filter((_, i) => i !== index));
  };

  // Generate report
  const generateReport = async () => {
    if (!reportName || columns.length === 0) {
      alert('الرجاء إدخال اسم التقرير واختيار الأعمدة');
      return;
    }

    setIsGenerating(true);
    try {
      const definition: Omit<ReportDefinition, 'id' | 'createdAt' | 'updatedAt'> = {
        name: reportName,
        type: 'custom',
        dataSource,
        columns,
        filters,
        charts,
        createdBy: 'current-user', // Replace with actual user ID
      };

      const data = await advancedReportsService.generateReport(definition as ReportDefinition);
      setReportData(data);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('حدث خطأ أثناء إنشاء التقرير');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export report
  const exportReport = async (format: ExportFormat) => {
    if (!reportData) return;

    try {
      const blob = await advancedReportsService.exportReport(reportData, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName || 'report'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('حدث خطأ أثناء تصدير التقرير');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-blue-600" />
          منشئ التقارير المتقدم
        </h1>
        <p className="text-gray-600 mt-2">
          أنشئ تقارير مخصصة مع فلاتر متقدمة ورسوم بيانية تفاعلية
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Report Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              المعلومات الأساسية
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم التقرير
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="مثال: تقرير الحجوزات الشهري"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مصدر البيانات
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {dataSources.map((source) => (
                    <button
                      key={source.value}
                      onClick={() => setDataSource(source.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        dataSource === source.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{source.icon}</div>
                      <div className="text-sm font-medium">{source.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Columns Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-green-600" />
              الأعمدة
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">الأعمدة المتاحة:</p>
              <div className="flex flex-wrap gap-2">
                {availableColumns[dataSource]?.map((column) => (
                  <button
                    key={column.id}
                    onClick={() => addColumn(column)}
                    disabled={columns.some(c => c.id === column.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      columns.some(c => c.id === column.id)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    + {column.label}
                  </button>
                ))}
              </div>
            </div>

            {columns.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-3">الأعمدة المختارة:</p>
                <div className="space-y-2">
                  {columns.map((column) => (
                    <div
                      key={column.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-blue-900">{column.label}</span>
                        {column.aggregation && (
                          <span className="text-xs text-blue-600 mr-2">
                            ({column.aggregation})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeColumn(column.id)}
                        className="p-1 hover:bg-blue-100 rounded"
                      >
                        <X className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-6 h-6 text-purple-600" />
                الفلاتر
              </h2>
              <button
                onClick={addFilter}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة فلتر
              </button>
            </div>

            {filters.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد فلاتر. انقر "إضافة فلتر" للبدء</p>
            ) : (
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 bg-purple-50 rounded-lg">
                    <select
                      value={filter.field}
                      onChange={(e) => updateFilter(index, { field: e.target.value })}
                      className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">اختر الحقل</option>
                      {columns.map((col) => (
                        <option key={col.id} value={col.field}>
                          {col.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                      className="px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="==">يساوي</option>
                      <option value="!=">لا يساوي</option>
                      <option value=">">أكبر من</option>
                      <option value=">=">أكبر من أو يساوي</option>
                      <option value="<">أصغر من</option>
                      <option value="<=">أصغر من أو يساوي</option>
                    </select>

                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, { value: e.target.value })}
                      placeholder="القيمة"
                      className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <button
                      onClick={() => removeFilter(index)}
                      className="p-2 hover:bg-purple-100 rounded-lg"
                    >
                      <X className="w-5 h-5 text-purple-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <LineChart className="w-6 h-6 text-orange-600" />
                الرسوم البيانية
              </h2>
              <button
                onClick={addChart}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة رسم بياني
              </button>
            </div>

            {charts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد رسوم بيانية</p>
            ) : (
              <div className="space-y-4">
                {charts.map((chart, index) => (
                  <div key={chart.id} className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={chart.title}
                        onChange={(e) => updateChart(index, { title: e.target.value })}
                        className="flex-1 px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="عنوان الرسم البياني"
                      />
                      <button
                        onClick={() => removeChart(index)}
                        className="mr-2 p-2 hover:bg-orange-100 rounded-lg"
                      >
                        <X className="w-5 h-5 text-orange-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={chart.type}
                        onChange={(e) => updateChart(index, { type: e.target.value as ChartType })}
                        className="px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {chartTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={chart.xAxis}
                        onChange={(e) => updateChart(index, { xAxis: e.target.value })}
                        className="px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">المحور X</option>
                        {columns.map((col) => (
                          <option key={col.id} value={col.field}>
                            {col.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Panel - Actions */}
        <div className="space-y-6">
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8"
          >
            <h3 className="font-bold text-gray-900 mb-4">إجراءات</h3>

            <div className="space-y-3">
              <button
                onClick={generateReport}
                disabled={isGenerating || !reportName || columns.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    إنشاء التقرير
                  </>
                )}
              </button>

              {reportData && (
                <>
                  <button
                    onClick={() => exportReport('excel')}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    تصدير Excel
                  </button>

                  <button
                    onClick={() => exportReport('pdf')}
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <FileText className="w-5 h-5" />
                    تصدير PDF
                  </button>

                  <button
                    onClick={() => exportReport('csv')}
                    className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <Download className="w-5 h-5" />
                    تصدير CSV
                  </button>
                </>
              )}
            </div>

            {/* Report Summary */}
            {reportData && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">ملخص التقرير</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد السجلات:</span>
                    <span className="font-medium">{reportData.metadata.totalRows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الأعمدة:</span>
                    <span className="font-medium">{columns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الفلاتر:</span>
                    <span className="font-medium">{filters.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الرسوم البيانية:</span>
                    <span className="font-medium">{charts.length}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && reportData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-blue-600" />
                  معاينة التقرير: {reportName}
                </h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-600">
                    إجمالي السجلات: <strong>{reportData.metadata.totalRows}</strong>
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        {columns.map((col) => (
                          <th key={col.id} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.rows.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                          {columns.map((col) => (
                            <td key={col.id} className="px-4 py-3 text-sm text-gray-700">
                              {row[col.field]?.toString() || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {reportData.rows.length > 10 && (
                  <p className="text-center text-gray-500 mt-4">
                    عرض 10 من أصل {reportData.rows.length} سجل
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
