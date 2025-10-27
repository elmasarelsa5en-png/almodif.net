import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Eye
} from 'lucide-react';

interface ExcelDropzoneProps {
  onDataImport: (data: any[], type: 'transactions' | 'invoices' | 'expenses') => void;
  acceptedTypes: ('transactions' | 'invoices' | 'expenses')[];
  className?: string;
}

interface ImportedData {
  data: any[];
  type: 'transactions' | 'invoices' | 'expenses';
  fileName: string;
  totalRows: number;
}

export default function ExcelDropzone({ onDataImport, acceptedTypes, className }: ExcelDropzoneProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processExcelFile = useCallback((file: File) => {
    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // تحديد نوع البيانات بناءً على الأعمدة
        let dataType: 'transactions' | 'invoices' | 'expenses' = 'transactions';
        
        if (jsonData.length > 0) {
          const firstRow = jsonData[0] as any;
          const columns = Object.keys(firstRow).map(key => key.toLowerCase());
          
          // التحقق من وجود أعمدة Booking Report
          if (columns.includes('booking id') || columns.includes('guest name') || columns.includes('total_amount')) {
            dataType = 'invoices';
          } else if (columns.includes('invoice') || columns.includes('فاتورة') || columns.includes('customer') || columns.includes('عميل')) {
            dataType = 'invoices';
          } else if (columns.includes('expense') || columns.includes('مصروف') || columns.includes('category') || columns.includes('فئة')) {
            dataType = 'expenses';
          }
        }

        // دالة مساعدة لتحويل تاريخ Excel إلى تاريخ عادي
        const convertExcelDate = (excelDate: any): string => {
          if (!excelDate) return new Date().toISOString().split('T')[0];
          
          // إذا كان رقم (Excel serial date)
          if (typeof excelDate === 'number') {
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
          }
          
          // إذا كان نص
          if (typeof excelDate === 'string') {
            const date = new Date(excelDate);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
          }
          
          return new Date().toISOString().split('T')[0];
        };

        const processedData = jsonData.map((row: any, index) => {
          const processedRow: any = { id: index + 1 };
          
          // معالجة البيانات حسب النوع
          if (dataType === 'transactions') {
            processedRow.type = row['النوع'] || row['Type'] || row['نوع'] || 'دخل';
            processedRow.description = row['الوصف'] || row['Description'] || row['وصف'] || `معاملة ${index + 1}`;
            processedRow.amount = parseFloat(row['المبلغ'] || row['Amount'] || row['مبلغ'] || 0);
            processedRow.date = row['التاريخ'] || row['Date'] || row['تاريخ'] || new Date().toISOString().split('T')[0];
            processedRow.status = row['الحالة'] || row['Status'] || row['حالة'] || 'مكتمل';
            processedRow.category = row['الفئة'] || row['Category'] || row['فئة'] || 'عام';
          } else if (dataType === 'invoices') {
            // التعامل مع Booking Report من Bloom Hotel
            const bookingId = row['Booking ID'] || row['booking_id'];
            const guestName = row['Guest Name'] || row['guest_name'];
            const totalAmount = parseFloat(row['total_amount'] || row['Total Amount'] || row['المبلغ'] || row['Amount'] || row['مبلغ'] || 0);
            const checkInDate = row['check_in_date'] || row['Check In Date'];
            const checkOutDate = row['check_out_date'] || row['Check Out Date'];
            const status = row['status'] || row['Status'];
            const roomNights = row['room_nights'] || row['Room Nights'] || 1;
            const mobile = row['mobile'] || row['Mobile'] || '';
            const email = row['email'] || row['Email'] || '';
            const dialCode = row['dial_code'] || row['Dial Code'] || '';
            
            // معالجة رقم الفاتورة
            processedRow.number = row['رقم الفاتورة'] || row['Invoice Number'] || 
                                  (bookingId ? `INV-${bookingId}` : `INV-${Date.now()}-${index + 1}`);
            
            // اسم العميل
            processedRow.customerName = row['اسم العميل'] || row['Customer Name'] || guestName || `عميل ${index + 1}`;
            
            // رقم الغرفة
            processedRow.room = row['الغرفة'] || row['Room'] || row['غرفة'] || row['room_number'] || '---';
            
            // المبلغ الإجمالي
            processedRow.amount = totalAmount;
            
            // حساب المبلغ قبل وبعد الضريبة (نسبة الضريبة 20%)
            const taxRate = 0.20;
            processedRow.amountBeforeTax = row['المبلغ قبل الضريبة'] || row['Amount Before Tax'] || 
                                           (totalAmount / (1 + taxRate));
            processedRow.amountAfterTax = row['المبلغ بعد الضريبة'] || row['Amount After Tax'] || totalAmount;
            
            // الرقم الضريبي
            processedRow.taxNumber = row['الرقم الضريبي'] || row['Tax Number'] || row['tax_id'] || 
                                     (bookingId ? `TAX-${bookingId}` : 'غير محدد');
            
            // نوع الدفع
            processedRow.paymentType = row['نوع الدفع'] || row['Payment Type'] || row['payment_method'] || 'نقدي';
            
            // الحالة
            if (status) {
              if (status.toLowerCase() === 'completed') {
                processedRow.status = 'مدفوع';
              } else if (status.toLowerCase() === 'pending') {
                processedRow.status = 'معلق';
              } else if (status.toLowerCase() === 'cancelled') {
                processedRow.status = 'ملغي';
              } else {
                processedRow.status = row['الحالة'] || 'معلق';
              }
            } else {
              processedRow.status = row['الحالة'] || 'معلق';
            }
            
            // التواريخ
            processedRow.date = row['التاريخ'] || row['Date'] || 
                               (checkInDate ? convertExcelDate(checkInDate) : new Date().toISOString().split('T')[0]);
            
            processedRow.dueDate = row['تاريخ الاستحقاق'] || row['Due Date'] || 
                                  (checkOutDate ? convertExcelDate(checkOutDate) : new Date().toISOString().split('T')[0]);
            
            // الوصف
            const nightsText = roomNights > 1 ? `${roomNights} ليالي` : 'ليلة واحدة';
            processedRow.description = row['الوصف'] || row['Description'] || 
                                      `حجز فندقي - ${nightsText}${bookingId ? ` (${bookingId})` : ''}`;
            
            // بيانات إضافية
            processedRow.phone = dialCode && mobile ? `+${dialCode}${mobile}` : mobile;
            processedRow.email = email;
            processedRow.bookingId = bookingId;
            processedRow.roomNights = roomNights;
            
          } else if (dataType === 'expenses') {
            processedRow.description = row['الوصف'] || row['Description'] || row['وصف'] || `مصروف ${index + 1}`;
            processedRow.amount = parseFloat(row['المبلغ'] || row['Amount'] || row['مبلغ'] || 0);
            processedRow.category = row['الفئة'] || row['Category'] || row['فئة'] || 'عام';
            processedRow.date = row['التاريخ'] || row['Date'] || row['تاريخ'] || new Date().toISOString().split('T')[0];
            processedRow.paymentMethod = row['طريقة الدفع'] || row['Payment Method'] || row['دفع'] || 'نقدي';
            processedRow.receipt = row['الإيصال'] || row['Receipt'] || row['إيصال'] || `REC-${String(index + 1).padStart(3, '0')}`;
            processedRow.notes = row['الملاحظات'] || row['Notes'] || row['ملاحظات'] || '';
          }
          
          return processedRow;
        });

        setImportedData({
          data: processedData,
          type: dataType,
          fileName: file.name,
          totalRows: processedData.length
        });
        
        setIsPreviewOpen(true);
        setIsProcessing(false);
      } catch (err) {
        setError('حدث خطأ في قراءة ملف Excel. يرجى التأكد من صحة تنسيق الملف.');
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        processExcelFile(file);
      } else {
        setError('يرجى اختيار ملف Excel صحيح (.xlsx أو .xls)');
      }
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleConfirmImport = () => {
    if (importedData && acceptedTypes.includes(importedData.type)) {
      onDataImport(importedData.data, importedData.type);
      setIsPreviewOpen(false);
      setImportedData(null);
    }
  };

  const downloadTemplate = (type: 'transactions' | 'invoices' | 'expenses') => {
    let templateData: any[] = [];
    
    if (type === 'transactions') {
      templateData = [
        {
          'النوع': 'دخل',
          'الوصف': 'دفع فاتورة غرفة 205',
          'المبلغ': 1500,
          'التاريخ': '2025-10-09',
          'الحالة': 'مكتمل',
          'الفئة': 'إيرادات الغرف'
        },
        {
          'النوع': 'مصروف',
          'الوصف': 'شراء مستلزمات تنظيف',
          'المبلغ': 350,
          'التاريخ': '2025-10-09',
          'الحالة': 'مكتمل',
          'الفئة': 'التنظيف'
        }
      ];
    } else if (type === 'invoices') {
      templateData = [
        {
          'رقم الفاتورة': 'INV-2025-001',
          'اسم العميل': 'أحمد محمد',
          'الغرفة': '205',
          'المبلغ': 1500,
          'المبلغ قبل الضريبة': 1250,
          'المبلغ بعد الضريبة': 1500,
          'الرقم الضريبي': '123-456-789',
          'نوع الدفع': 'نقدي',
          'الحالة': 'معلق',
          'التاريخ': '2025-10-09',
          'تاريخ الاستحقاق': '2025-10-15',
          'الوصف': 'إقامة 3 ليالي - غرفة مزدوجة'
        },
        {
          'رقم الفاتورة': 'INV-2025-002',
          'اسم العميل': 'فاطمة أحمد',
          'الغرفة': '307',
          'المبلغ': 2200,
          'المبلغ قبل الضريبة': 1833.33,
          'المبلغ بعد الضريبة': 2200,
          'الرقم الضريبي': '234-567-890',
          'نوع الدفع': 'بطاقة ائتمان',
          'الحالة': 'مدفوع',
          'التاريخ': '2025-10-08',
          'تاريخ الاستحقاق': '2025-10-14',
          'الوصف': 'إقامة 5 ليالي - جناح ملكي'
        }
      ];
    } else if (type === 'expenses') {
      templateData = [
        {
          'الوصف': 'فاتورة كهرباء شهر أكتوبر',
          'المبلغ': 1200,
          'الفئة': 'المرافق',
          'التاريخ': '2025-10-09',
          'طريقة الدفع': 'تحويل بنكي',
          'الإيصال': 'REC-001',
          'الملاحظات': 'فاتورة شهرية للكهرباء'
        },
        {
          'الوصف': 'شراء مستلزمات تنظيف',
          'المبلغ': 350,
          'الفئة': 'التنظيف',
          'التاريخ': '2025-10-08',
          'طريقة الدفع': 'نقدي',
          'الإيصال': 'REC-002',
          'الملاحظات': 'مواد تنظيف للغرف'
        }
      ];
    }

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'قالب البيانات');
    
    const fileName = `قالب_${type === 'transactions' ? 'المعاملات' : type === 'invoices' ? 'الفواتير' : 'المصروفات'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <>
      <Card className={`bg-white/10 backdrop-blur-md border-white/20 shadow-2xl ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6" />
            استيراد ملف Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'border-blue-400 bg-blue-500/10' 
                : 'border-white/30 hover:border-white/50 hover:bg-white/5'
            }`}
          >
            <input {...getInputProps()} />
            
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                <p className="text-white">جاري معالجة الملف...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Upload className="w-16 h-16 text-blue-400" />
                <div>
                  <p className="text-white font-medium text-lg">
                    {isDragActive ? 'اسحب الملف هنا...' : 'اسحب ملف Excel هنا أو انقر للاختيار'}
                  </p>
                  <p className="text-blue-200/70 text-sm mt-2">
                    يدعم ملفات .xlsx و .xls
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <p className="text-white font-medium">تحميل قوالب Excel:</p>
            <div className="flex flex-wrap gap-2">
              {acceptedTypes.includes('transactions') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadTemplate('transactions')}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 ml-2" />
                  قالب المعاملات
                </Button>
              )}
              {acceptedTypes.includes('invoices') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadTemplate('invoices')}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 ml-2" />
                  قالب الفواتير
                </Button>
              )}
              {acceptedTypes.includes('expenses') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadTemplate('expenses')}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 ml-2" />
                  قالب المصروفات
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نافذة معاينة البيانات */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-green-900/50 rounded-lg p-4 -m-6 mb-6">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              معاينة البيانات المستوردة
            </DialogTitle>
            <DialogDescription className="text-green-200/80 font-medium">
              {importedData && (
                <>
                  الملف: {importedData.fileName} | 
                  النوع: {importedData.type === 'transactions' ? 'المعاملات' : importedData.type === 'invoices' ? 'الفواتير' : 'المصروفات'} | 
                  عدد الصفوف: {importedData.totalRows}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {importedData && (
            <div className="space-y-4">
              {!acceptedTypes.includes(importedData.type) && (
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">تحذير</span>
                  </div>
                  <p className="text-yellow-200/80 mt-2">
                    نوع البيانات ({importedData.type === 'transactions' ? 'المعاملات' : importedData.type === 'invoices' ? 'الفواتير' : 'المصروفات'}) 
                    غير مدعوم في هذه الصفحة.
                  </p>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-4 border border-white/10 max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      {importedData.data.length > 0 && Object.keys(importedData.data[0]).filter(key => key !== 'id').map(key => (
                        <th key={key} className="text-right py-2 px-3 text-white font-semibold">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importedData.data.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b border-white/10">
                        {Object.entries(row).filter(([key]) => key !== 'id').map(([key, value]) => (
                          <td key={key} className="py-2 px-3 text-blue-200/80">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {importedData.data.length > 10 && (
                  <p className="text-center text-gray-400 mt-4">
                    ... و {importedData.data.length - 10} صف إضافي
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button 
              onClick={() => setIsPreviewOpen(false)}
              variant="outline" 
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleConfirmImport}
              disabled={!importedData || !acceptedTypes.includes(importedData.type)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <CheckCircle className="ml-2 w-4 h-4" />
              تأكيد الاستيراد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}