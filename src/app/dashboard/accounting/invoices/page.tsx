'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  ArrowLeft,
  CheckCircle,
  Clock,
  Printer,
  AlertCircle,
  Upload,
  Scan
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter, useSearchParams } from 'next/navigation';
import ExcelDropzone from '@/components/ExcelDropzone';
import ExcelImportInstructions from '@/components/ExcelImportInstructions';
import InvoiceScanner from '@/components/InvoiceScanner';
import InvoiceScannerGuide from '@/components/InvoiceScannerGuide';
import InvoicePrintTemplate from '@/components/InvoicePrintTemplate';
import {
  logInvoiceCreated,
  logInvoiceUpdated,
  logInvoiceDeleted,
  logInvoicePrinted
} from '@/lib/activity-log';

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  const [showImportZone, setShowImportZone] = useState(false);
  const [isInvoiceScannerOpen, setIsInvoiceScannerOpen] = useState(false);
  const [showScannerGuide, setShowScannerGuide] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  
  // Advanced Search States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('الكل');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [groupByCustomer, setGroupByCustomer] = useState(false);

  const [invoices, setInvoices] = useState([
    {
      id: 1,
      number: 'INV-2025-001',
      customerName: 'أحمد محمد',
      room: '205',
      amount: 1500,
      amountBeforeTax: 1250,
      amountAfterTax: 1500,
      taxNumber: '123-456-789',
      paymentType: 'نقدي',
      status: 'مدفوع',
      date: '2025-10-09',
      dueDate: '2025-10-15',
      description: 'إقامة 3 ليالي - غرفة مزدوجة'
    },
    {
      id: 2,
      number: 'INV-2025-002',
      customerName: 'فاطمة أحمد',
      room: '307',
      amount: 2200,
      amountBeforeTax: 1833.33,
      amountAfterTax: 2200,
      taxNumber: '234-567-890',
      paymentType: 'بطاقة ائتمان',
      status: 'معلق',
      date: '2025-10-08',
      dueDate: '2025-10-14',
      description: 'إقامة 5 ليالي - جناح ملكي'
    },
    {
      id: 3,
      number: 'INV-2025-003',
      customerName: 'محمد علي',
      room: '156',
      amount: 800,
      amountBeforeTax: 666.67,
      amountAfterTax: 800,
      taxNumber: '345-678-901',
      paymentType: 'تحويل بنكي',
      status: 'متأخر',
      date: '2025-10-05',
      dueDate: '2025-10-11',
      description: 'إقامة ليلتين - غرفة فردية'
    },
    {
      id: 4,
      number: 'INV-2025-004',
      customerName: 'سارة محمود',
      room: '401',
      amount: 3500,
      amountBeforeTax: 2916.67,
      amountAfterTax: 3500,
      taxNumber: '456-789-012',
      paymentType: 'نقدي',
      status: 'مدفوع',
      date: '2025-10-07',
      dueDate: '2025-10-13',
      description: 'إقامة أسبوع - جناح رئاسي'
    }
  ]);

  // فحص البيانات المستوردة
  useEffect(() => {
    const isImport = searchParams.get('import');
    if (isImport === 'true') {
      const importedData = localStorage.getItem('importedInvoices');
      if (importedData) {
        const data = JSON.parse(importedData);
        const newInvoices = data.map((item: any, index: number) => ({
          ...item,
          id: invoices.length + index + 1,
          amountBeforeTax: item.amountBeforeTax || item.amount / 1.2,
          amountAfterTax: item.amountAfterTax || item.amount,
          taxNumber: item.taxNumber || 'غير محدد',
          paymentType: item.paymentType || 'نقدي'
        }));
        setInvoices(prev => [...newInvoices, ...prev]);
        localStorage.removeItem('importedInvoices');
        alert(`تم استيراد ${data.length} فاتورة بنجاح!`);
      }
    }
  }, [searchParams]);

  const [newInvoice, setNewInvoice] = useState({
    customerName: '',
    room: '',
    amount: 0,
    amountBeforeTax: 0,
    amountAfterTax: 0,
    taxNumber: '',
    paymentType: 'نقدي',
    description: '',
    dueDate: ''
  });

  const statusConfig = {
    'مدفوع': { color: 'bg-green-500/20 text-green-400 border-green-500/40', icon: CheckCircle },
    'معلق': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', icon: Clock },
    'متأخر': { color: 'bg-red-500/20 text-red-400 border-red-500/40', icon: AlertCircle }
  };

  // Advanced Filtering
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.room.includes(searchTerm);
    const matchesStatus = selectedStatus === 'الكل' || invoice.status === selectedStatus;
    const matchesCustomer = selectedCustomer === 'الكل' || invoice.customerName === selectedCustomer;
    
    // Date filtering
    let matchesDateRange = true;
    if (startDate && endDate) {
      const invoiceDate = new Date(invoice.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      matchesDateRange = invoiceDate >= start && invoiceDate <= end;
    }
    
    return matchesSearch && matchesStatus && matchesCustomer && matchesDateRange;
  });

  // Group invoices by customer
  const groupedInvoices = groupByCustomer ? 
    filteredInvoices.reduce((groups: any, invoice) => {
      const customer = invoice.customerName;
      if (!groups[customer]) {
        groups[customer] = {
          customerName: customer,
          invoices: [],
          totalAmount: 0,
          count: 0
        };
      }
      groups[customer].invoices.push(invoice);
      groups[customer].totalAmount += invoice.amount;
      groups[customer].count += 1;
      return groups;
    }, {})
    : null;

  // Get unique customers for filter
  const uniqueCustomers = ['الكل', ...Array.from(new Set(invoices.map(inv => inv.customerName)))];
  
  // Calculate totals for date range
  const rangeTotals = {
    totalInvoices: filteredInvoices.length,
    totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    paidAmount: filteredInvoices.filter(inv => inv.status === 'مدفوع').reduce((sum, inv) => sum + inv.amount, 0),
    pendingAmount: filteredInvoices.filter(inv => inv.status === 'معلق').reduce((sum, inv) => sum + inv.amount, 0)
  };

  const handleCreateInvoice = () => {
    if (newInvoice.customerName && newInvoice.room && newInvoice.amount && newInvoice.description) {
      const invoice = {
        id: invoices.length + 1,
        number: `INV-2025-${String(invoices.length + 1).padStart(3, '0')}`,
        customerName: newInvoice.customerName,
        room: newInvoice.room,
        amount: newInvoice.amount,
        amountBeforeTax: newInvoice.amountBeforeTax || newInvoice.amount / 1.2,
        amountAfterTax: newInvoice.amountAfterTax || newInvoice.amount,
        taxNumber: newInvoice.taxNumber,
        paymentType: newInvoice.paymentType,
        status: 'معلق',
        date: new Date().toISOString().split('T')[0],
        dueDate: newInvoice.dueDate,
        description: newInvoice.description
      };

      setInvoices([invoice, ...invoices]);
      
      // تسجيل النشاط
      logInvoiceCreated('current-user', 'المستخدم الحالي', invoice);
      
      setNewInvoice({
        customerName: '',
        room: '',
        amount: 0,
        amountBeforeTax: 0,
        amountAfterTax: 0,
        taxNumber: '',
        paymentType: 'نقدي',
        description: '',
        dueDate: ''
      });
      setIsNewInvoiceOpen(false);
      alert('تم إنشاء الفاتورة بنجاح!');
    } else {
      alert('يرجى ملء جميع الحقول المطلوبة');
    }
  };

  // معالج استيراد البيانات من Excel
  const handleDataImport = (data: any[], type: 'transactions' | 'invoices' | 'expenses') => {
    if (type === 'invoices') {
      const newInvoices = data.map((item, index) => ({
        ...item,
        id: invoices.length + index + 1,
        amountBeforeTax: item.amountBeforeTax || item.amount / 1.2,
        amountAfterTax: item.amountAfterTax || item.amount,
        taxNumber: item.taxNumber || 'غير محدد',
        paymentType: item.paymentType || 'نقدي'
      }));
      setInvoices(prev => [...newInvoices, ...prev]);
      
      // عرض رسالة مع خيار طباعة كل الفواتير
      const printAll = confirm(`تم استيراد ${data.length} فاتورة بنجاح!\n\nهل تريد طباعة جميع الفواتير الآن؟`);
      if (printAll) {
        setTimeout(() => {
          printAllInvoices(newInvoices);
        }, 500);
      }
    }
  };

  // طباعة جميع الفواتير دفعة واحدة
  const printAllInvoices = (invoicesToPrint: any[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة الفواتير');
      return;
    }

    const allInvoicesHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>جميع الفواتير</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #ffffff;
            padding: 0;
            margin: 0;
          }
          
          .invoice-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 15mm;
            position: relative;
            page-break-after: always;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .invoice-container {
              box-shadow: none;
              margin: 0;
              padding: 10mm;
            }
            .no-print {
              display: none;
            }
            @page {
              margin: 10mm;
            }
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: bold;
            opacity: 0.05;
            pointer-events: none;
            z-index: 0;
            color: #64748b;
          }
          
          .print-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 15px 30px;
            background: linear-gradient(135deg, #3b5a72 0%, #1e293b 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(30, 41, 59, 0.4);
            z-index: 1000;
          }
          
          .print-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(30, 41, 59, 0.6);
          }
        </style>
      </head>
      <body>
        ${invoicesToPrint.map(invoice => `
          <div class="invoice-container">
            ${generateInvoiceContent(invoice)}
          </div>
        `).join('')}
        
        <button class="print-button no-print" onclick="window.print()">
          🖨️ طباعة جميع الفواتير (${invoicesToPrint.length})
        </button>
      </body>
      </html>
    `;

    printWindow.document.write(allInvoicesHTML);
    printWindow.document.close();
  };

  // معالج البيانات المستخرجة من مسح الفاتورة
  const handleInvoiceExtracted = (extractedData: any) => {
    const amount = extractedData.totalAmount || extractedData.amount || 0;
    const newInvoice = {
      id: invoices.length + 1,
      number: extractedData.invoiceNumber || `INV-${Date.now()}`,
      customerName: extractedData.customerName || 'غير محدد',
      room: extractedData.room || '-',
      amount: amount,
      amountBeforeTax: extractedData.amountBeforeTax || amount / 1.2,
      amountAfterTax: extractedData.amountAfterTax || amount,
      taxNumber: extractedData.taxNumber || 'غير محدد',
      paymentType: extractedData.paymentType || 'نقدي',
      status: 'معلق',
      date: extractedData.date || new Date().toISOString().split('T')[0],
      dueDate: extractedData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: extractedData.description || 'فاتورة مستخرجة من المسح'
    };

    setInvoices(prev => [newInvoice, ...prev]);
    alert('تم إضافة الفاتورة المستخرجة بنجاح!');
  };

  // وظائف أزرار الإجراءات
  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice({...invoice});
    setIsEditDialogOpen(true);
  };

  const handleDownloadInvoice = (invoice: any) => {
    // طباعة الفاتورة الاحترافية
    printInvoice(invoice);
  };

  const printInvoice = (invoice: any) => {
    // إنشاء نافذة جديدة للطباعة
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة');
      return;
    }

    // إنشاء محتوى HTML للفاتورة
    const invoiceHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>فاتورة - ${invoice.number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
          }
          
          .invoice-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 20mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          
          @media print {
            @page {
              size: A4;
              margin: 10mm 8mm;
            }
            
            body {
              background: white;
              padding: 0;
              margin: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .invoice-container {
              width: 100%;
              max-width: 100%;
              min-height: auto;
              margin: 0;
              padding: 5mm 8mm;
              box-shadow: none;
              page-break-after: always;
            }
            
            .no-print {
              display: none;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          
          .header {
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
            text-align: right;
          }
          
          .invoice-title h2 {
            font-size: 36px;
            font-weight: bold;
            color: #4F46E5;
            margin: 0 0 5px 0;
          }
          
          .invoice-title p {
            font-size: 16px;
            color: #6B7280;
            margin: 0;
          }
          
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
          }
          
          .info-box {
            padding: 20px;
            border-radius: 12px;
            border: 1px solid;
          }
          
          .from-box {
            background: #F9FAFB;
            border-color: #E5E7EB;
          }
          
          .to-box {
            background: #F0F9FF;
            border-color: #BAE6FD;
          }
          
          .info-box h3 {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          
          .info-box p {
            font-size: 14px;
            margin: 8px 0;
            color: #4B5563;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 40px;
          }
          
          .detail-card {
            padding: 15px;
            border-radius: 10px;
            color: white;
            text-align: center;
          }
          
          .detail-card.purple {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .detail-card.pink {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          
          .detail-card.blue {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          
          .detail-card.green {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          }
          
          .detail-card.yellow {
            background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
          }
          
          .detail-card.red {
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
          }
          
          .detail-card p:first-child {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 5px;
          }
          
          .detail-card p:last-child {
            font-size: 15px;
            font-weight: bold;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
            border: 1px solid #E5E7EB;
            border-radius: 10px;
            overflow: hidden;
          }
          
          thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          th {
            padding: 15px;
            font-size: 14px;
            font-weight: bold;
            text-align: right;
          }
          
          td {
            padding: 15px;
            font-size: 14px;
            color: #374151;
            border-bottom: 1px solid #E5E7EB;
          }
          
          .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
          }
          
          .summary-box {
            width: 400px;
            padding: 20px;
            background: #F9FAFB;
            border-radius: 12px;
            border: 1px solid #E5E7EB;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #E5E7EB;
          }
          
          .summary-total {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            color: white;
            margin-top: 15px;
          }
          
          .payment-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
          }
          
          .payment-card {
            padding: 10px;
            border-radius: 8px;
            border: 1px solid;
          }
          
          .payment-card.yellow {
            background: #FEF3C7;
            border-color: #FDE68A;
          }
          
          .payment-card.blue {
            background: #DBEAFE;
            border-color: #BFDBFE;
          }
          
          .qr-section {
            flex: 0 0 auto;
          }
          
          .footer {
            border-top: 2px solid #E5E7EB;
            padding-top: 10px;
            margin-top: 10px;
          }
          
          .footer-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 12px;
            border-radius: 8px;
            color: white;
            text-align: center;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: bold;
            opacity: 0.1;
            pointer-events: none;
            z-index: -1;
          }
          
          .print-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            z-index: 1000;
          }
          
          .print-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          ${generateInvoiceContent(invoice)}
        </div>
        
        <button class="print-button no-print" onclick="window.print()">
          🖨️ طباعة الفاتورة
        </button>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // تسجيل عملية الطباعة
    logInvoicePrinted('current-user', 'المستخدم الحالي', invoice.number);
  };

  const generateInvoiceContent = (invoice: any) => {
    const taxAmount = invoice.amountAfterTax - invoice.amountBeforeTax;
    const taxRate = invoice.amountBeforeTax > 0 ? (taxAmount / invoice.amountBeforeTax * 100).toFixed(1) : '0.0';
    
    // استخدام URL كامل للشعار
    const logoUrl = window.location.origin + '/app-logo.png';
    
    // توليد QR Code
    const qrData = `INV:${invoice.number}|AMT:${invoice.amountAfterTax}|DATE:${invoice.date}|CLIENT:${invoice.customerName}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
    
    return `
      <!-- Header Section: Logo in Center + Company Info on Sides -->
      <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-bottom: 10px; gap: 15px;">
        <!-- Arabic Info - Right Side -->
        <div style="text-align: right; direction: rtl;">
          <h1 style="margin: 0; font-size: 13px; font-weight: bold; color: #667eea;">المضيف سمارت لإدارة الفنادق والمنتجعات</h1>
          <p style="margin: 2px 0; font-size: 9px; color: #6B7280;">أبها، شارع العرين</p>
        </div>
        
        <!-- Logo - Center -->
        <div style="text-align: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #3b82f6 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); border: 2px solid rgba(255, 255, 255, 0.3);">
            <img src="${logoUrl}" alt="Logo" style="width: 62px; height: 62px; object-fit: contain; border-radius: 50%;" onerror="this.style.display='none'" />
          </div>
        </div>
        
        <!-- English Info - Left Side -->
        <div style="text-align: left; direction: ltr;">
          <h1 style="margin: 0; font-size: 13px; font-weight: bold; color: #667eea;">Smart Host Hotel Management</h1>
          <p style="margin: 2px 0; font-size: 9px; color: #6B7280;">Abha, Al-Areen St</p>
        </div>
      </div>

      <!-- VAT & CR Number Bar -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 10px; margin-bottom: 10px; border-radius: 6px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        <div style="text-align: right; font-size: 9px; direction: rtl;">
          <strong>الرقم الضريبي</strong> ${invoice.taxNumber || '300092095780003'} | <strong>السجل التجاري</strong> 7017845756
        </div>
        <div style="text-align: left; font-size: 9px; direction: ltr;">
          <strong>VAT No</strong> ${invoice.taxNumber || '300092095780003'} | <strong>CR No</strong> 7017845756
        </div>
      </div>

      <!-- Invoice Title -->
      <div style="text-align: center; margin-bottom: 10px;">
        <h2 style="margin: 0; font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">فاتورة ضريبية مبسطة</h2>
      </div>

      <!-- QR Code + Invoice Details Grid -->
      <div style="display: flex; gap: 15px; margin-bottom: 10px;">
        <!-- QR Code -->
        <div style="flex: 0 0 120px; text-align: center;">
          <div style="border: 2px solid transparent; background: linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box; padding: 5px; border-radius: 8px; box-shadow: 0 2px 10px rgba(102, 126, 234, 0.15);">
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 120px; height: 120px; display: block;" />
          </div>
        </div>

        <!-- Invoice Details Grid -->
        <div style="flex: 1;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #667eea; border-radius: 6px; overflow: hidden;">
            <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
              <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; width: 50%; color: #4F46E5;">رقم الفاتورة</td>
              <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; width: 50%; color: #4F46E5;">Invoice No</td>
            </tr>
            <tr style="background: white;">
              <td colspan="2" style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px; font-weight: 600;">${invoice.number}</td>
            </tr>
            
            <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
              <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5;">تاريخ الفاتورة</td>
              <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5;">Invoice Date</td>
            </tr>
            <tr style="background: white;">
              <td colspan="2" style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.date}</td>
            </tr>
            
            <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
              <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5;">رقم الخدمة</td>
              <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5;">Service No</td>
            </tr>
            <tr style="background: white;">
              <td colspan="2" style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.bookingId || 'SRV-' + invoice.number.split('-')[1]}</td>
            </tr>
            
            <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
              <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5;">طريقة الدفع</td>
              <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5;">Payment Method</td>
            </tr>
            <tr style="background: white;">
              <td colspan="2" style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.paymentType}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Bill To Section -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 10px; margin-bottom: 8px; text-align: center; font-size: 11px; font-weight: bold; border-radius: 6px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        فاتورة إلى (Bill To)
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #667eea; border-radius: 6px; overflow: hidden;">
        <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; width: 25%; color: #4F46E5; direction: rtl;">اسم الشركة</td>
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px; font-weight: 600; width: 50%;">${invoice.customerName}</td>
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; width: 25%; color: #4F46E5; direction: ltr;">Company Name</td>
        </tr>
        <tr style="background: white;">
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5; direction: rtl;">اسم المسؤول</td>
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.customerName}</td>
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5; direction: ltr;">Contact Person</td>
        </tr>
        <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5; direction: rtl;">الفندق المستضيف</td>
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.room || 'غير محدد'}</td>
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5; direction: ltr;">Host Hotel</td>
        </tr>
        <tr style="background: white;">
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5; direction: rtl;">رقم هاتف المسؤول</td>
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px; direction: ltr;">${invoice.phone || 'غير محدد'}</td>
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5; direction: ltr;">Contact Phone</td>
        </tr>
        <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px; font-weight: bold; color: #4F46E5; direction: rtl;">الرقم الضريبي</td>
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${invoice.taxNumber || 'غير محدد'}</td>
          <td style="padding: 5px; border: 1px solid #c7d2fe; text-align: left; font-size: 9px; font-weight: bold; color: #4F46E5; direction: ltr;">VAT Number</td>
        </tr>
      </table>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #667eea; border-radius: 6px; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        <thead>
          <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
            <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: right; font-size: 8px; direction: rtl;">الوصف<br/><span style="font-size: 7px; opacity: 0.9;">Description</span></th>
            <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: center; font-size: 8px; width: 8%;">عدد<br/>الأيام<br/><span style="font-size: 6px; opacity: 0.9;">Days</span></th>
            <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: center; font-size: 8px; width: 12%;">سعر<br/>الفرد<br/><span style="font-size: 6px; opacity: 0.9;">Unit Price</span></th>
            <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: center; font-size: 8px; width: 13%;">المبلغ قبل<br/>الضريبة<br/><span style="font-size: 6px; opacity: 0.9;">Before Tax</span></th>
            <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: center; font-size: 8px; width: 10%;">الضريبة<br/>(${taxRate}%)<br/><span style="font-size: 6px; opacity: 0.9;">Tax</span></th>
            <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); text-align: center; font-size: 8px; width: 12%;">الإجمالي<br/><span style="font-size: 6px; opacity: 0.9;">Total</span></th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);">
            <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: right; font-size: 9px;">
              ${invoice.description}
              ${invoice.bookingId ? `<br/><span style="font-size: 8px; color: #6B7280;">رقم الحجز: ${invoice.bookingId}</span>` : ''}
            </td>
            <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px; font-weight: bold;">${invoice.roomNights || 1}</td>
            <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${(invoice.amountBeforeTax / (invoice.roomNights || 1)).toFixed(2)}</td>
            <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px; font-weight: bold;">${invoice.amountBeforeTax.toFixed(2)}</td>
            <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: center; font-size: 9px;">${taxAmount.toFixed(2)}</td>
            <td style="padding: 6px; border: 1px solid #c7d2fe; text-align: center; font-size: 10px; font-weight: bold; color: #667eea;">${invoice.amountAfterTax.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Summary Section -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
        <!-- Totals -->
        <div style="width: 100%; max-width: 320px;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #667eea; border-radius: 6px; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
            <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
              <td style="padding: 5px 8px; text-align: right; font-size: 9px; border: 1px solid #c7d2fe; font-weight: bold; color: #4F46E5; direction: rtl; width: 35%;">المبلغ الخاضع للضريبة</td>
              <td style="padding: 5px 8px; text-align: center; font-size: 9px; font-weight: bold; border: 1px solid #c7d2fe; width: 25%;">${invoice.amountBeforeTax.toFixed(2)}</td>
              <td style="padding: 5px 8px; text-align: left; font-size: 8px; border: 1px solid #c7d2fe; color: #6B7280; direction: ltr; width: 40%;">Taxable Amount</td>
            </tr>
            
            <tr style="background: white;">
              <td style="padding: 5px 8px; text-align: right; font-size: 9px; border: 1px solid #c7d2fe; font-weight: bold; color: #4F46E5; direction: rtl;">ضريبة القيمة المضافة (${taxRate}%)</td>
              <td style="padding: 5px 8px; text-align: center; font-size: 9px; font-weight: bold; border: 1px solid #c7d2fe;">${taxAmount.toFixed(2)}</td>
              <td style="padding: 5px 8px; text-align: left; font-size: 8px; border: 1px solid #c7d2fe; color: #6B7280; direction: ltr;">VAT (${taxRate}%)</td>
            </tr>
            
            <tr style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">
              <td style="padding: 6px 8px; text-align: right; font-size: 10px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: 1px solid #667eea; -webkit-print-color-adjust: exact; print-color-adjust: exact; direction: rtl;">الإجمالي الكلي</td>
              <td style="padding: 6px 8px; text-align: center; font-size: 11px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: 1px solid #667eea; -webkit-print-color-adjust: exact; print-color-adjust: exact;">${invoice.amountAfterTax.toFixed(2)}</td>
              <td style="padding: 6px 8px; text-align: left; font-size: 10px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: 1px solid #667eea; -webkit-print-color-adjust: exact; print-color-adjust: exact; direction: ltr;">Grand Total</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 8px; border-top: 2px solid #667eea; margin-top: 8px;">
        <p style="margin: 2px 0; font-size: 10px; font-weight: bold; color: #667eea;">المضيف سمارت لإدارة الفنادق والمنتجعات | Smart Host Hotel Management</p>
        <p style="margin: 2px 0; font-size: 8px; color: #6B7280; direction: ltr;">📞 +966559902557 | 📧 akramabdelaziz1992@gmail.com</p>
      </div>

      ${invoice.status !== 'مدفوع' ? `<div class="watermark" style="color: ${invoice.status === 'معلق' ? 'rgba(251, 191, 36, 0.08)' : 'rgba(239, 68, 68, 0.08)'}">${invoice.status}</div>` : ''}
    `;
  };

  const handleUpdateInvoice = () => {
    if (editingInvoice && editingInvoice.customerName && editingInvoice.amount > 0) {
      setInvoices(prev => prev.map(inv => 
        inv.id === editingInvoice.id ? editingInvoice : inv
      ));
      setIsEditDialogOpen(false);
      setEditingInvoice(null);
      alert('تم تحديث الفاتورة بنجاح!');
    } else {
      alert('يرجى ملء جميع الحقول المطلوبة');
    }
  };

  const handleDeleteInvoice = (invoice: any) => {
    setInvoiceToDelete(invoice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteInvoice = () => {
    if (invoiceToDelete) {
      // تسجيل النشاط قبل الحذف
      logInvoiceDeleted('current-user', 'المستخدم الحالي', invoiceToDelete);
      
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      alert('تم حذف الفاتورة بنجاح!');
    }
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'مدفوع').length,
    pending: invoices.filter(inv => inv.status === 'معلق').length,
    overdue: invoices.filter(inv => inv.status === 'متأخر').length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0)
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* العنوان وشريط الأزرار */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {/* زر العودة تم حذفه بناءً على طلب المستخدم */}
              </div>
              {/* شريط الأزرار العملياتي */}
              <div className="flex flex-row gap-3 w-full overflow-x-auto pb-2" style={{WebkitOverflowScrolling:'touch'}}>
                <Button
                  onClick={() => setIsNewInvoiceOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg px-1 sm:text-base sm:py-2 sm:h-11 text-[11px] py-0 h-6 min-w-0"
                >
                  <Plus className="ml-0.5 w-2.5 h-2.5" />
                  فاتورة جديدة
                </Button>
                
                {invoices.length > 0 && (
                  <Button
                    onClick={() => printAllInvoices(invoices)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg px-1 sm:text-base sm:py-2 sm:h-11 text-[11px] py-0 h-6 min-w-0"
                  >
                    <Printer className="ml-0.5 w-2.5 h-2.5" />
                    طباعة الكل ({invoices.length})
                  </Button>
                )}
                
                <Button
                  onClick={() => setIsInvoiceScannerOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg px-1 sm:text-base sm:py-2 sm:h-11 text-[11px] py-0 h-6 min-w-0"
                >
                  <Scan className="ml-0.5 w-2.5 h-2.5" />
                  مسح الفاتورة
                </Button>
                <Button
                  onClick={() => setShowScannerGuide(!showScannerGuide)}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 px-1 sm:text-base sm:py-2 sm:h-11 text-[11px] py-0 h-6 min-w-0"
                >
                  <Eye className="ml-0.5 w-2.5 h-2.5" />
                  دليل المسح
                </Button>
                <Button
                  onClick={() => setShowImportZone(!showImportZone)}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 px-1 sm:text-base sm:py-2 sm:h-11 text-[11px] py-0 h-6 min-w-0"
                >
                  <Upload className="ml-0.5 w-2.5 h-2.5" />
                  استيراد Excel
                </Button>
              </div>
            </div>
          </div>

          {/* إحصائيات الفواتير */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">إجمالي الفواتير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <p className="text-xs text-blue-200/80">فاتورة</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">مدفوعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.paid}</div>
                <p className="text-xs text-green-200/80">فاتورة مدفوعة</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">معلقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                <p className="text-xs text-yellow-200/80">بانتظار الدفع</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">متأخرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
                <p className="text-xs text-red-200/80">تحتاج متابعة</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">إجمالي المبلغ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.totalAmount.toLocaleString()}</div>
                <p className="text-xs text-blue-200/80">ر.س</p>
              </CardContent>
            </Card>
          </div>

          {/* شريط البحث والتصفية */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200/60 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث في الفواتير..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع الحالات</SelectItem>
                  <SelectItem value="مدفوع">مدفوع</SelectItem>
                  <SelectItem value="معلق">معلق</SelectItem>
                  <SelectItem value="متأخر">متأخر</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
              >
                <Filter className="ml-2 w-4 h-4" />
                {showAdvancedSearch ? 'إخفاء البحث المتقدم' : 'بحث متقدم'}
              </Button>
            </div>
          </div>

          {/* Advanced Search Panel */}
          {showAdvancedSearch && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-t-lg">
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  البحث المتقدم والتجميع
                </CardTitle>
                <CardDescription className="text-gray-300">
                  ابحث عن الفواتير حسب التاريخ والعميل واعرضها مجمعة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label className="text-white">من تاريخ</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">إلى تاريخ</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  
                  {/* Customer Filter */}
                  <div className="space-y-2">
                    <Label className="text-white">اسم العميل</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCustomers.map(customer => (
                          <SelectItem key={customer} value={customer}>{customer}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Summary Stats */}
                {(startDate && endDate) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 p-4 bg-gradient-to-r from-slate-900/50 to-purple-900/50 rounded-lg border border-white/10">
                    <div className="text-center">
                      <p className="text-white/70 text-sm">إجمالي الفواتير</p>
                      <p className="text-2xl font-bold text-white">{rangeTotals.totalInvoices}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 text-sm">المبلغ الإجمالي</p>
                      <p className="text-2xl font-bold text-cyan-400">{rangeTotals.totalAmount.toLocaleString()} ريال</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 text-sm">المدفوع</p>
                      <p className="text-2xl font-bold text-green-400">{rangeTotals.paidAmount.toLocaleString()} ريال</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 text-sm">المعلق</p>
                      <p className="text-2xl font-bold text-yellow-400">{rangeTotals.pendingAmount.toLocaleString()} ريال</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-white/10">
                  <Button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setSelectedCustomer('الكل');
                      setGroupByCustomer(false);
                    }}
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    مسح الفلاتر
                  </Button>
                  <Button
                    onClick={() => setGroupByCustomer(!groupByCustomer)}
                    className={`${
                      groupByCustomer 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
                    } text-white`}
                  >
                    {groupByCustomer ? '✓ مجمعة حسب العميل' : 'تجميع حسب العميل'}
                  </Button>
                  {filteredInvoices.length > 0 && (
                    <Button
                      onClick={() => printAllInvoices(filteredInvoices)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    >
                      <Printer className="ml-2 w-4 h-4" />
                      طباعة النتائج ({filteredInvoices.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* دليل مسح الفواتير */}
          {showScannerGuide && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">دليل مسح الفواتير</h2>
                <Button
                  onClick={() => setShowScannerGuide(false)}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  إخفاء الدليل
                </Button>
              </div>
              <InvoiceScannerGuide />
            </div>
          )}

          {/* مكون استيراد ملفات Excel */}
          {showImportZone && (
            <div className="space-y-4">
              <ExcelImportInstructions type="invoices" />
              <ExcelDropzone 
                onDataImport={handleDataImport}
                acceptedTypes={['invoices']}
              />
            </div>
          )}

          {/* عرض الفواتير المجمعة حسب العميل */}
          {groupByCustomer && groupedInvoices ? (
            <div className="space-y-4">
              {Object.values(groupedInvoices).map((group: any) => (
                <Card key={group.customerName} className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl font-bold text-white">{group.customerName}</CardTitle>
                        <CardDescription className="text-gray-300 mt-1">
                          {group.count} فاتورة • إجمالي المبلغ: {group.totalAmount.toLocaleString()} ريال
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => printAllInvoices(group.invoices)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      >
                        <Printer className="ml-2 w-4 h-4" />
                        طباعة الكل
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-right py-3 px-4 text-white font-semibold">رقم الفاتورة</th>
                            <th className="text-right py-3 px-4 text-white font-semibold">التاريخ</th>
                            <th className="text-right py-3 px-4 text-white font-semibold">الغرفة</th>
                            <th className="text-right py-3 px-4 text-white font-semibold">المبلغ</th>
                            <th className="text-right py-3 px-4 text-white font-semibold">الحالة</th>
                            <th className="text-right py-3 px-4 text-white font-semibold">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.invoices.map((invoice: any) => {
                            const StatusIcon = statusConfig[invoice.status as keyof typeof statusConfig].icon;
                            return (
                              <tr key={invoice.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 text-blue-400 font-medium">{invoice.number}</td>
                                <td className="py-3 px-4 text-white">{invoice.date}</td>
                                <td className="py-3 px-4 text-white">{invoice.room}</td>
                                <td className="py-3 px-4 text-green-400 font-semibold">{invoice.amount.toLocaleString()} ريال</td>
                                <td className="py-3 px-4">
                                  <Badge className={statusConfig[invoice.status as keyof typeof statusConfig].color}>
                                    <StatusIcon className="w-3 h-3 ml-1" />
                                    {invoice.status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => { setSelectedInvoice(invoice); setIsViewDialogOpen(true); }}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => printInvoice(invoice)}
                                      className="bg-purple-600 hover:bg-purple-700"
                                    >
                                      <Printer className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* جدول الفواتير */
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-slate-800/50 to-green-900/50 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-white">
                  قائمة الفواتير ({filteredInvoices.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-right py-3 px-4 text-white font-semibold">رقم الفاتورة</th>
                        <th className="text-right py-3 px-4 text-white font-semibold">العميل</th>
                        <th className="text-right py-3 px-4 text-white font-semibold">الغرفة</th>
                        <th className="text-right py-3 px-4 text-white font-semibold">المبلغ</th>
                        <th className="text-right py-3 px-4 text-white font-semibold">الحالة</th>
                        <th className="text-right py-3 px-4 text-white font-semibold">تاريخ الاستحقاق</th>
                        <th className="text-right py-3 px-4 text-white font-semibold">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                    {filteredInvoices.map((invoice) => {
                      const StatusIcon = statusConfig[invoice.status as keyof typeof statusConfig].icon;
                      return (
                        <tr key={invoice.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-blue-400 font-medium">{invoice.number}</td>
                          <td className="py-3 px-4 text-white">{invoice.customerName}</td>
                          <td className="py-3 px-4 text-white">{invoice.room}</td>
                          <td className="py-3 px-4 text-green-400 font-semibold">{invoice.amount.toLocaleString()} ر.س</td>
                          <td className="py-3 px-4">
                            <Badge className={statusConfig[invoice.status as keyof typeof statusConfig].color}>
                              <StatusIcon className="w-3 h-3 ml-1" />
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-blue-200/80">{invoice.dueDate}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                                onClick={() => handleViewInvoice(invoice)}
                                title="عرض الفاتورة"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                                onClick={() => handleEditInvoice(invoice)}
                                title="تعديل الفاتورة"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                                onClick={() => handleDownloadInvoice(invoice)}
                                title="تحميل الفاتورة"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-400/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                onClick={() => handleDeleteInvoice(invoice)}
                                title="حذف الفاتورة"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        {/* نافذة إنشاء فاتورة جديدة */}
        <Dialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-green-900/50 rounded-lg p-4 -m-6 mb-6">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                إنشاء فاتورة جديدة
              </DialogTitle>
              <DialogDescription className="text-green-200/80 font-medium">
                أدخل تفاصيل الفاتورة الجديدة
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-white font-medium">اسم العميل</Label>
                <Input
                  type="text"
                  placeholder="اسم العميل"
                  value={newInvoice.customerName}
                  onChange={(e) => setNewInvoice({...newInvoice, customerName: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">رقم الغرفة</Label>
                <Input
                  type="text"
                  placeholder="رقم الغرفة"
                  value={newInvoice.room}
                  onChange={(e) => setNewInvoice({...newInvoice, room: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">المبلغ (ر.س)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: Number(e.target.value)})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">الوصف</Label>
                <Input
                  type="text"
                  placeholder="وصف الخدمة"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">تاريخ الاستحقاق</Label>
                <Input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                onClick={() => setIsNewInvoiceOpen(false)}
                variant="outline" 
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleCreateInvoice}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <CheckCircle className="ml-2 w-4 h-4" />
                إنشاء الفاتورة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة عرض الفاتورة */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg p-4 -m-6 mb-6">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                تفاصيل الفاتورة
              </DialogTitle>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80 text-sm">رقم الفاتورة</Label>
                    <div className="text-white font-semibold">{selectedInvoice.number}</div>
                  </div>
                  <div>
                    <Label className="text-white/80 text-sm">التاريخ</Label>
                    <div className="text-white font-semibold">{selectedInvoice.date}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-white/80 text-sm">اسم العميل</Label>
                  <div className="text-white font-semibold">{selectedInvoice.customerName}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80 text-sm">الغرفة</Label>
                    <div className="text-white font-semibold">{selectedInvoice.room}</div>
                  </div>
                  <div>
                    <Label className="text-white/80 text-sm">المبلغ</Label>
                    <div className="text-green-400 font-bold text-lg">{selectedInvoice.amount} ر.س</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80 text-sm">الحالة</Label>
                    <Badge className={selectedInvoice.status === 'مدفوع' ? 'bg-green-500/20 text-green-400' : 
                                     selectedInvoice.status === 'معلق' ? 'bg-yellow-500/20 text-yellow-400' : 
                                     'bg-red-500/20 text-red-400'}>
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-white/80 text-sm">تاريخ الاستحقاق</Label>
                    <div className="text-white font-semibold">{selectedInvoice.dueDate}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-white/80 text-sm">الوصف</Label>
                  <div className="text-white bg-white/10 p-3 rounded-lg">{selectedInvoice.description}</div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                onClick={() => setIsViewDialogOpen(false)}
                variant="outline" 
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إغلاق
              </Button>
              {selectedInvoice && (
                <Button 
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  <Download className="ml-2 w-4 h-4" />
                  تحميل الفاتورة
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة تعديل الفاتورة */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-orange-900/50 rounded-lg p-4 -m-6 mb-6">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                تعديل الفاتورة
              </DialogTitle>
            </DialogHeader>

            {editingInvoice && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white font-medium">اسم العميل</Label>
                  <Input
                    value={editingInvoice.customerName}
                    onChange={(e) => setEditingInvoice({...editingInvoice, customerName: e.target.value})}
                    className="bg-white/10 border-white/20 text-white mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium">الغرفة</Label>
                    <Input
                      value={editingInvoice.room}
                      onChange={(e) => setEditingInvoice({...editingInvoice, room: e.target.value})}
                      className="bg-white/10 border-white/20 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium">المبلغ</Label>
                    <Input
                      type="number"
                      value={editingInvoice.amount}
                      onChange={(e) => setEditingInvoice({...editingInvoice, amount: parseFloat(e.target.value) || 0})}
                      className="bg-white/10 border-white/20 text-white mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium">الحالة</Label>
                    <Select 
                      value={editingInvoice.status} 
                      onValueChange={(value) => setEditingInvoice({...editingInvoice, status: value})}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مدفوع">مدفوع</SelectItem>
                        <SelectItem value="معلق">معلق</SelectItem>
                        <SelectItem value="متأخر">متأخر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white font-medium">تاريخ الاستحقاق</Label>
                    <Input
                      type="date"
                      value={editingInvoice.dueDate}
                      onChange={(e) => setEditingInvoice({...editingInvoice, dueDate: e.target.value})}
                      className="bg-white/10 border-white/20 text-white mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white font-medium">الوصف</Label>
                  <Textarea
                    value={editingInvoice.description}
                    onChange={(e) => setEditingInvoice({...editingInvoice, description: e.target.value})}
                    className="bg-white/10 border-white/20 text-white mt-1"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingInvoice(null);
                }}
                variant="outline" 
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleUpdateInvoice}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              >
                <CheckCircle className="ml-2 w-4 h-4" />
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة تأكيد حذف الفاتورة */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-950 backdrop-blur-md border-white/20 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-red-900/50 to-red-800/50 rounded-lg p-4 -m-6 mb-6">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                تأكيد حذف الفاتورة
              </DialogTitle>
              <DialogDescription className="text-red-200 mt-2">
                هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            </DialogHeader>

            {invoiceToDelete && (
              <div className="space-y-4 py-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                  {/* اسم العميل */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium">اسم العميل:</span>
                    <span className="text-white font-bold text-lg">{invoiceToDelete.customerName}</span>
                  </div>

                  {/* رقم الفاتورة */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium">رقم الفاتورة:</span>
                    <span className="text-blue-400 font-bold">{invoiceToDelete.number}</span>
                  </div>

                  {/* المبلغ قبل الضريبة */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium">المبلغ قبل الضريبة:</span>
                    <span className="text-emerald-400 font-bold text-lg">
                      {invoiceToDelete.amountBeforeTax?.toFixed(2) || '0.00'} ر.س
                    </span>
                  </div>

                  {/* المبلغ بعد الضريبة */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium">المبلغ بعد الضريبة:</span>
                    <span className="text-green-400 font-bold text-lg">
                      {invoiceToDelete.amountAfterTax?.toFixed(2) || '0.00'} ر.س
                    </span>
                  </div>

                  {/* الرقم الضريبي */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium">الرقم الضريبي:</span>
                    <span className="text-yellow-400 font-bold">{invoiceToDelete.taxNumber || 'غير محدد'}</span>
                  </div>

                  {/* تاريخ الفاتورة */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium">تاريخ الفاتورة:</span>
                    <span className="text-purple-400 font-bold">{invoiceToDelete.date}</span>
                  </div>

                  {/* نوع الدفع */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium">نوع الدفع:</span>
                    <span className="text-cyan-400 font-bold">{invoiceToDelete.paymentType || 'غير محدد'}</span>
                  </div>

                  {/* الغرفة */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium">الغرفة:</span>
                    <span className="text-white font-bold">{invoiceToDelete.room}</span>
                  </div>

                  {/* الحالة */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium">الحالة:</span>
                    <Badge className={statusConfig[invoiceToDelete.status as keyof typeof statusConfig].color}>
                      {invoiceToDelete.status}
                    </Badge>
                  </div>

                  {/* تاريخ الاستحقاق */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium">تاريخ الاستحقاق:</span>
                    <span className="text-orange-400 font-bold">{invoiceToDelete.dueDate}</span>
                  </div>

                  {/* الوصف */}
                  <div className="border-b border-white/10 pb-2">
                    <span className="text-gray-400 font-medium block mb-2">الوصف:</span>
                    <span className="text-white">{invoiceToDelete.description}</span>
                  </div>
                </div>

                {/* تحذير */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-red-200 text-sm">
                    <p className="font-bold mb-1">تحذير:</p>
                    <p>سيتم حذف جميع بيانات هذه الفاتورة نهائياً ولا يمكن استرجاعها.</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setInvoiceToDelete(null);
                }}
                variant="outline" 
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button 
                onClick={confirmDeleteInvoice}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                <Trash2 className="ml-2 w-4 h-4" />
                تأكيد الحذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مكون مسح الفواتير */}
        <InvoiceScanner
          isOpen={isInvoiceScannerOpen}
          onClose={() => setIsInvoiceScannerOpen(false)}
          onInvoiceExtracted={handleInvoiceExtracted}
        />
      </div>
    </ProtectedRoute>
  );
}
