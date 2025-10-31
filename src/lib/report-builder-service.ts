/**
 * @file report-builder-service.ts - Custom Report Builder Service
 * @description خدمة إنشاء التقارير المخصصة
 * @version 1.0.0
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  limit,
  startAfter,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ====================================
// Types & Interfaces
// ====================================

export interface ReportField {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
  source: 'bookings' | 'expense_vouchers' | 'promissory_notes' | 'bank_vouchers' | 'ratings' | 'custom';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';
  format?: string;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  value2?: any; // للـ between
}

export interface ReportSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operations' | 'marketing' | 'custom';
  fields: ReportField[];
  filters: ReportFilter[];
  sorts: ReportSort[];
  groupBy?: string[];
  chartType?: 'bar' | 'line' | 'pie' | 'doughnut' | 'table' | 'none';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  propertyId: string;
}

export interface ReportData {
  headers: string[];
  rows: any[][];
  summary?: {
    [key: string]: number | string;
  };
  metadata: {
    totalRows: number;
    generatedAt: Date;
    filters: ReportFilter[];
    dateRange?: { start: Date; end: Date };
  };
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0-6 للأسبوعي
  dayOfMonth?: number; // 1-31 للشهري
  time: string; // HH:mm
  recipients: string[]; // emails
  format: 'pdf' | 'excel' | 'csv';
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  propertyId: string;
}

// ====================================
// Predefined Report Fields
// ====================================

const AVAILABLE_FIELDS: Record<string, ReportField[]> = {
  bookings: [
    { id: 'bookingNumber', name: 'bookingNumber', label: 'رقم الحجز', type: 'string', source: 'bookings' },
    { id: 'guestName', name: 'guestName', label: 'اسم النزيل', type: 'string', source: 'bookings' },
    { id: 'guestPhone', name: 'guestPhone', label: 'رقم الجوال', type: 'string', source: 'bookings' },
    { id: 'guestEmail', name: 'guestEmail', label: 'البريد الإلكتروني', type: 'string', source: 'bookings' },
    { id: 'roomNumber', name: 'roomNumber', label: 'رقم الغرفة', type: 'string', source: 'bookings' },
    { id: 'roomType', name: 'roomType', label: 'نوع الغرفة', type: 'string', source: 'bookings' },
    { id: 'checkInDate', name: 'checkInDate', label: 'تاريخ الدخول', type: 'date', source: 'bookings' },
    { id: 'checkOutDate', name: 'checkOutDate', label: 'تاريخ الخروج', type: 'date', source: 'bookings' },
    { id: 'totalAmount', name: 'totalAmount', label: 'إجمالي المبلغ', type: 'currency', source: 'bookings', aggregation: 'sum' },
    { id: 'paidAmount', name: 'paidAmount', label: 'المبلغ المدفوع', type: 'currency', source: 'bookings', aggregation: 'sum' },
    { id: 'remainingAmount', name: 'remainingAmount', label: 'المتبقي', type: 'currency', source: 'bookings', aggregation: 'sum' },
    { id: 'status', name: 'status', label: 'الحالة', type: 'string', source: 'bookings' },
    { id: 'source', name: 'source', label: 'المصدر', type: 'string', source: 'bookings' },
    { id: 'nights', name: 'nights', label: 'عدد الليالي', type: 'number', source: 'bookings', aggregation: 'sum' },
    { id: 'adults', name: 'adults', label: 'البالغين', type: 'number', source: 'bookings', aggregation: 'sum' },
    { id: 'children', name: 'children', label: 'الأطفال', type: 'number', source: 'bookings', aggregation: 'sum' }
  ],
  expense_vouchers: [
    { id: 'voucherNumber', name: 'voucherNumber', label: 'رقم السند', type: 'string', source: 'expense_vouchers' },
    { id: 'date', name: 'date', label: 'التاريخ', type: 'date', source: 'expense_vouchers' },
    { id: 'category', name: 'category', label: 'التصنيف', type: 'string', source: 'expense_vouchers' },
    { id: 'subcategory', name: 'subcategory', label: 'التصنيف الفرعي', type: 'string', source: 'expense_vouchers' },
    { id: 'amount', name: 'amount', label: 'المبلغ', type: 'currency', source: 'expense_vouchers', aggregation: 'sum' },
    { id: 'paymentMethod', name: 'paymentMethod', label: 'طريقة الدفع', type: 'string', source: 'expense_vouchers' },
    { id: 'recipient', name: 'recipient', label: 'المستفيد', type: 'string', source: 'expense_vouchers' },
    { id: 'description', name: 'description', label: 'الوصف', type: 'string', source: 'expense_vouchers' },
    { id: 'status', name: 'status', label: 'الحالة', type: 'string', source: 'expense_vouchers' }
  ],
  promissory_notes: [
    { id: 'noteNumber', name: 'noteNumber', label: 'رقم الكمبيالة', type: 'string', source: 'promissory_notes' },
    { id: 'issueDate', name: 'issueDate', label: 'تاريخ الإصدار', type: 'date', source: 'promissory_notes' },
    { id: 'dueDate', name: 'dueDate', label: 'تاريخ الاستحقاق', type: 'date', source: 'promissory_notes' },
    { id: 'amount', name: 'amount', label: 'المبلغ', type: 'currency', source: 'promissory_notes', aggregation: 'sum' },
    { id: 'payerName', name: 'payerName', label: 'اسم الدافع', type: 'string', source: 'promissory_notes' },
    { id: 'payerPhone', name: 'payerPhone', label: 'رقم الجوال', type: 'string', source: 'promissory_notes' },
    { id: 'status', name: 'status', label: 'الحالة', type: 'string', source: 'promissory_notes' },
    { id: 'type', name: 'type', label: 'النوع', type: 'string', source: 'promissory_notes' }
  ],
  ratings: [
    { id: 'guestName', name: 'guestName', label: 'اسم النزيل', type: 'string', source: 'ratings' },
    { id: 'roomNumber', name: 'roomNumber', label: 'رقم الغرفة', type: 'string', source: 'ratings' },
    { id: 'overallRating', name: 'overallRating', label: 'التقييم العام', type: 'number', source: 'ratings', aggregation: 'avg' },
    { id: 'cleanlinessRating', name: 'cleanlinessRating', label: 'النظافة', type: 'number', source: 'ratings', aggregation: 'avg' },
    { id: 'serviceRating', name: 'serviceRating', label: 'الخدمة', type: 'number', source: 'ratings', aggregation: 'avg' },
    { id: 'comfortRating', name: 'comfortRating', label: 'الراحة', type: 'number', source: 'ratings', aggregation: 'avg' },
    { id: 'comment', name: 'comment', label: 'التعليق', type: 'string', source: 'ratings' },
    { id: 'createdAt', name: 'createdAt', label: 'التاريخ', type: 'date', source: 'ratings' }
  ]
};

// ====================================
// Get Available Fields
// ====================================

export function getAvailableFields(source?: string): ReportField[] {
  if (source && AVAILABLE_FIELDS[source]) {
    return AVAILABLE_FIELDS[source];
  }
  // Return all fields
  return Object.values(AVAILABLE_FIELDS).flat();
}

// ====================================
// Generate Report Data
// ====================================

export async function generateReport(
  propertyId: string,
  template: ReportTemplate,
  dateRange?: { start: Date; end: Date }
): Promise<ReportData> {
  try {
    // Group fields by source
    const fieldsBySource = template.fields.reduce((acc, field) => {
      if (!acc[field.source]) {
        acc[field.source] = [];
      }
      acc[field.source].push(field);
      return acc;
    }, {} as Record<string, ReportField[]>);

    // Fetch data from each source
    const allData: any[] = [];

    for (const [source, fields] of Object.entries(fieldsBySource)) {
      const sourceData = await fetchSourceData(propertyId, source, template.filters, dateRange);
      
      // Map data to selected fields
      const mappedData = sourceData.map(item => {
        const row: any = {};
        fields.forEach(field => {
          row[field.id] = extractFieldValue(item, field);
        });
        return row;
      });

      allData.push(...mappedData);
    }

    // Apply sorting
    if (template.sorts.length > 0) {
      allData.sort((a, b) => {
        for (const sort of template.sorts) {
          const aVal = a[sort.field];
          const bVal = b[sort.field];
          if (aVal !== bVal) {
            if (sort.direction === 'asc') {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          }
        }
        return 0;
      });
    }

    // Apply grouping if specified
    let processedData = allData;
    if (template.groupBy && template.groupBy.length > 0) {
      processedData = applyGrouping(allData, template.groupBy, template.fields);
    }

    // Calculate summary
    const summary = calculateSummary(processedData, template.fields);

    // Format output
    const headers = template.fields.map(f => f.label);
    const rows = processedData.map(item => 
      template.fields.map(f => formatValue(item[f.id], f.type))
    );

    return {
      headers,
      rows,
      summary,
      metadata: {
        totalRows: rows.length,
        generatedAt: new Date(),
        filters: template.filters,
        dateRange
      }
    };
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

// ====================================
// Fetch Source Data
// ====================================

async function fetchSourceData(
  propertyId: string,
  source: string,
  filters: ReportFilter[],
  dateRange?: { start: Date; end: Date }
): Promise<any[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('propertyId', '==', propertyId)
    ];

    // Apply date range filter
    if (dateRange) {
      const dateField = getDateField(source);
      if (dateField) {
        constraints.push(
          where(dateField, '>=', Timestamp.fromDate(dateRange.start)),
          where(dateField, '<=', Timestamp.fromDate(dateRange.end))
        );
      }
    }

    // Apply custom filters
    filters.forEach(filter => {
      if (filter.field && filter.value !== undefined) {
        switch (filter.operator) {
          case 'equals':
            constraints.push(where(filter.field, '==', filter.value));
            break;
          case 'not_equals':
            constraints.push(where(filter.field, '!=', filter.value));
            break;
          case 'greater_than':
            constraints.push(where(filter.field, '>', filter.value));
            break;
          case 'less_than':
            constraints.push(where(filter.field, '<', filter.value));
            break;
          case 'in':
            constraints.push(where(filter.field, 'in', filter.value));
            break;
          // Note: 'contains', 'not_contains', 'between' require client-side filtering
        }
      }
    });

    const q = query(collection(db, source), ...constraints);
    const snapshot = await getDocs(q);
    
    let data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply client-side filters
    data = applyClientFilters(data, filters);

    return data;
  } catch (error) {
    console.error(`Error fetching data from ${source}:`, error);
    return [];
  }
}

// ====================================
// Helper Functions
// ====================================

function getDateField(source: string): string | null {
  const dateFields: Record<string, string> = {
    bookings: 'checkInDate',
    expense_vouchers: 'date',
    promissory_notes: 'issueDate',
    bank_vouchers: 'date',
    ratings: 'createdAt'
  };
  return dateFields[source] || null;
}

function extractFieldValue(item: any, field: ReportField): any {
  let value = item[field.name];
  
  // Convert Timestamp to Date
  if (value && typeof value === 'object' && 'toDate' in value) {
    value = value.toDate();
  }

  return value;
}

function formatValue(value: any, type: string): string {
  if (value === null || value === undefined) return '';

  switch (type) {
    case 'date':
      return value instanceof Date ? value.toLocaleDateString('ar-SA') : String(value);
    case 'currency':
      return typeof value === 'number' ? `${value.toLocaleString('ar-SA')} ر.س` : String(value);
    case 'percentage':
      return typeof value === 'number' ? `${value.toFixed(1)}%` : String(value);
    case 'number':
      return typeof value === 'number' ? value.toLocaleString('ar-SA') : String(value);
    default:
      return String(value);
  }
}

function applyClientFilters(data: any[], filters: ReportFilter[]): any[] {
  return data.filter(item => {
    return filters.every(filter => {
      const value = item[filter.field];
      
      switch (filter.operator) {
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'not_contains':
          return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'between':
          return value >= filter.value && value <= filter.value2;
        default:
          return true; // Already handled in Firestore query
      }
    });
  });
}

function applyGrouping(data: any[], groupByFields: string[], fields: ReportField[]): any[] {
  const groups: Record<string, any[]> = {};

  // Group data
  data.forEach(item => {
    const key = groupByFields.map(f => item[f]).join('|');
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });

  // Aggregate grouped data
  return Object.entries(groups).map(([key, items]) => {
    const result: any = {};
    
    // Copy group by fields
    groupByFields.forEach((field, idx) => {
      result[field] = items[0][field];
    });

    // Aggregate other fields
    fields.forEach(field => {
      if (!groupByFields.includes(field.id)) {
        if (field.aggregation === 'sum') {
          result[field.id] = items.reduce((sum, item) => sum + (Number(item[field.id]) || 0), 0);
        } else if (field.aggregation === 'avg') {
          const sum = items.reduce((sum, item) => sum + (Number(item[field.id]) || 0), 0);
          result[field.id] = sum / items.length;
        } else if (field.aggregation === 'count') {
          result[field.id] = items.length;
        } else if (field.aggregation === 'min') {
          result[field.id] = Math.min(...items.map(item => Number(item[field.id]) || 0));
        } else if (field.aggregation === 'max') {
          result[field.id] = Math.max(...items.map(item => Number(item[field.id]) || 0));
        } else {
          result[field.id] = items[0][field.id]; // First value
        }
      }
    });

    return result;
  });
}

function calculateSummary(data: any[], fields: ReportField[]): Record<string, number | string> {
  const summary: Record<string, number | string> = {};

  fields.forEach(field => {
    if (field.aggregation === 'sum') {
      summary[field.id] = data.reduce((sum, item) => sum + (Number(item[field.id]) || 0), 0);
    } else if (field.aggregation === 'avg') {
      const sum = data.reduce((sum, item) => sum + (Number(item[field.id]) || 0), 0);
      summary[field.id] = data.length > 0 ? sum / data.length : 0;
    } else if (field.aggregation === 'count') {
      summary[field.id] = data.length;
    } else if (field.aggregation === 'min') {
      summary[field.id] = Math.min(...data.map(item => Number(item[field.id]) || 0));
    } else if (field.aggregation === 'max') {
      summary[field.id] = Math.max(...data.map(item => Number(item[field.id]) || 0));
    }
  });

  return summary;
}

// ====================================
// Template Management
// ====================================

export async function saveReportTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const templateRef = doc(collection(db, 'report_templates'));
    const newTemplate: ReportTemplate = {
      ...template,
      id: templateRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(templateRef, {
      ...newTemplate,
      createdAt: Timestamp.fromDate(newTemplate.createdAt),
      updatedAt: Timestamp.fromDate(newTemplate.updatedAt)
    });

    return templateRef.id;
  } catch (error) {
    console.error('Error saving report template:', error);
    throw error;
  }
}

export async function updateReportTemplate(templateId: string, updates: Partial<ReportTemplate>): Promise<void> {
  try {
    const templateRef = doc(db, 'report_templates', templateId);
    await updateDoc(templateRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating report template:', error);
    throw error;
  }
}

export async function deleteReportTemplate(templateId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'report_templates', templateId));
  } catch (error) {
    console.error('Error deleting report template:', error);
    throw error;
  }
}

export async function getReportTemplates(propertyId: string): Promise<ReportTemplate[]> {
  try {
    const q = query(
      collection(db, 'report_templates'),
      where('propertyId', '==', propertyId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as ReportTemplate;
    });
  } catch (error) {
    console.error('Error fetching report templates:', error);
    return [];
  }
}

export async function getReportTemplate(templateId: string): Promise<ReportTemplate | null> {
  try {
    const docSnap = await getDoc(doc(db, 'report_templates', templateId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as ReportTemplate;
    }
    return null;
  } catch (error) {
    console.error('Error fetching report template:', error);
    return null;
  }
}

// ====================================
// Export Functions
// ====================================

export function exportToCSV(reportData: ReportData): string {
  const lines: string[] = [];
  
  // Headers
  lines.push(reportData.headers.join(','));
  
  // Data rows
  reportData.rows.forEach(row => {
    lines.push(row.map(cell => `"${cell}"`).join(','));
  });

  // Summary
  if (reportData.summary) {
    lines.push('');
    lines.push('الملخص');
    Object.entries(reportData.summary).forEach(([key, value]) => {
      lines.push(`"${key}","${value}"`);
    });
  }

  return lines.join('\n');
}

export function exportToJSON(reportData: ReportData): string {
  return JSON.stringify(reportData, null, 2);
}

// ====================================
// Predefined Report Templates
// ====================================

export const PREDEFINED_TEMPLATES = [
  {
    name: 'تقرير الحجوزات اليومي',
    description: 'تقرير يومي بجميع الحجوزات',
    category: 'operations' as const,
    fields: [
      AVAILABLE_FIELDS.bookings.find(f => f.id === 'bookingNumber')!,
      AVAILABLE_FIELDS.bookings.find(f => f.id === 'guestName')!,
      AVAILABLE_FIELDS.bookings.find(f => f.id === 'roomNumber')!,
      AVAILABLE_FIELDS.bookings.find(f => f.id === 'checkInDate')!,
      AVAILABLE_FIELDS.bookings.find(f => f.id === 'totalAmount')!,
      AVAILABLE_FIELDS.bookings.find(f => f.id === 'status')!
    ],
    filters: [],
    sorts: [{ field: 'checkInDate', direction: 'desc' as const }],
    chartType: 'table' as const
  },
  {
    name: 'تقرير الإيرادات الشهري',
    description: 'ملخص الإيرادات حسب المصدر',
    category: 'financial' as const,
    fields: [
      AVAILABLE_FIELDS.bookings.find(f => f.id === 'source')!,
      { ...AVAILABLE_FIELDS.bookings.find(f => f.id === 'totalAmount')!, aggregation: 'sum' as const },
      { ...AVAILABLE_FIELDS.bookings.find(f => f.id === 'bookingNumber')!, aggregation: 'count' as const }
    ],
    filters: [],
    sorts: [{ field: 'totalAmount', direction: 'desc' as const }],
    groupBy: ['source'],
    chartType: 'pie' as const
  },
  {
    name: 'تقرير المصروفات حسب التصنيف',
    description: 'تحليل المصروفات',
    category: 'financial' as const,
    fields: [
      AVAILABLE_FIELDS.expense_vouchers.find(f => f.id === 'category')!,
      { ...AVAILABLE_FIELDS.expense_vouchers.find(f => f.id === 'amount')!, aggregation: 'sum' as const },
      { ...AVAILABLE_FIELDS.expense_vouchers.find(f => f.id === 'voucherNumber')!, aggregation: 'count' as const }
    ],
    filters: [],
    sorts: [{ field: 'amount', direction: 'desc' as const }],
    groupBy: ['category'],
    chartType: 'bar' as const
  },
  {
    name: 'تقرير التقييمات',
    description: 'متوسط التقييمات',
    category: 'marketing' as const,
    fields: [
      AVAILABLE_FIELDS.ratings.find(f => f.id === 'guestName')!,
      AVAILABLE_FIELDS.ratings.find(f => f.id === 'roomNumber')!,
      AVAILABLE_FIELDS.ratings.find(f => f.id === 'overallRating')!,
      AVAILABLE_FIELDS.ratings.find(f => f.id === 'cleanlinessRating')!,
      AVAILABLE_FIELDS.ratings.find(f => f.id === 'serviceRating')!,
      AVAILABLE_FIELDS.ratings.find(f => f.id === 'createdAt')!
    ],
    filters: [],
    sorts: [{ field: 'createdAt', direction: 'desc' as const }],
    chartType: 'line' as const
  }
];
