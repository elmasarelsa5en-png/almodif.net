'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Upload,
  FileImage,
  Scan,
  CheckCircle,
  AlertTriangle,
  X,
  Eye,
  Download,
  Loader2
} from 'lucide-react';

interface ExtractedInvoiceData {
  invoiceNumber?: string;
  date?: string;
  customerName?: string;
  amount?: number;
  taxAmount?: number;
  totalAmount?: number;
  description?: string;
  vendor?: string;
}

interface InvoiceScannerProps {
  onInvoiceExtracted: (data: ExtractedInvoiceData) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function InvoiceScanner({ onInvoiceExtracted, onClose, isOpen }: InvoiceScannerProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // استخراج النصوص من الصورة باستخدام Tesseract.js
  const performOCRExtraction = async (file: File): Promise<ExtractedInvoiceData> => {
    return new Promise(async (resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const imageSrc = event.target?.result as string;
            
            // تشغيل Tesseract للاستخراج
            const { data: { text } } = await Tesseract.recognize(imageSrc, 'ara+eng', {
              logger: (m: any) => {
                // تحديث نسبة التقدم
                if (m.status === 'recognizing') {
                  setScanProgress(Math.round(m.progress * 100));
                }
              }
            });

            // معالجة النص المستخرج لاستخراج البيانات المهمة
            const extractedData = parseInvoiceText(text);
            
            resolve(extractedData);
          } catch (error) {
            console.error('OCR Error:', error);
            reject(error);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  // دالة تحليل النص المستخرج
  const parseInvoiceText = (text: string): ExtractedInvoiceData => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // البحث عن أرقام الفاتورة
    const invoiceNumberMatch = text.match(/(?:فاتورة|invoice|رقم)[\s#]*[:=]?\s*([A-Z0-9\-]{3,15})/i);
    
    // البحث عن التواريخ
    const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
    
    // البحث عن الأرقام والمبالغ
    const amounts = text.match(/(\d+[\.,]\d{2})/g) || [];
    const amountsNumeric = amounts.map(a => parseFloat(a.replace(/,/g, '.')));
    
    // البحث عن الأسماء والعناوين
    const customerNames = lines.slice(0, 5).join(' ');
    
    // استخراج البيانات
    const extractedData: ExtractedInvoiceData = {
      invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1].trim() : `INV-${Date.now()}`,
      date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
      customerName: customerNames.substring(0, 50),
      amount: amountsNumeric.length > 0 ? amountsNumeric[0] : 0,
      taxAmount: amountsNumeric.length > 1 ? amountsNumeric[1] : 0,
      totalAmount: amountsNumeric.length > 0 ? amountsNumeric[amountsNumeric.length - 1] : (amountsNumeric[0] || 0),
      description: text.substring(0, 100),
      vendor: customerNames.split(' ').slice(0, 2).join(' ')
    };

    return extractedData;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.pdf']
    },
    maxFiles: 1
  });

  const handleScanInvoice = async () => {
    if (uploadedFiles.length === 0) return;

    setIsScanning(true);
    setScanProgress(0);
    
    try {
      const extractedData = await performOCRExtraction(uploadedFiles[0]);
      setExtractedData(extractedData);
    } catch (error) {
      console.error('Error scanning invoice:', error);
      alert('حدث خطأ أثناء مسح الفاتورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmExtraction = () => {
    if (extractedData) {
      onInvoiceExtracted(extractedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setUploadedFiles([]);
    setExtractedData(null);
    setScanProgress(0);
    setPreviewUrl('');
    setIsScanning(false);
    onClose();
  };

  const handleEditField = (field: keyof ExtractedInvoiceData, value: string | number) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg p-4 -m-6 mb-6">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Scan className="w-6 h-6 text-white" />
            </div>
            مسح الفواتير بالذكاء الاصطناعي
          </DialogTitle>
          <DialogDescription className="text-blue-200/80 font-medium">
            ارفع صورة الفاتورة لاستخراج البيانات تلقائياً باستخدام تقنية OCR
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* منطقة رفع الملفات */}
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-white/30 bg-white/5 hover:border-emerald-400/60 hover:bg-emerald-400/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  {uploadedFiles.length > 0 ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <Upload className="w-8 h-8 text-white" />
                  )}
                </div>
                
                {uploadedFiles.length > 0 ? (
                  <div className="text-center">
                    <p className="text-emerald-400 font-semibold text-lg">تم رفع الملف بنجاح!</p>
                    <p className="text-white/80">{uploadedFiles[0].name}</p>
                    <p className="text-white/60 text-sm">
                      {(uploadedFiles[0].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white text-lg font-semibold mb-2">
                      {isDragActive ? 'اسحب الملف هنا...' : 'اسحب الفاتورة هنا أو انقر للاختيار'}
                    </p>
                    <p className="text-white/60 text-sm">
                      يدعم: JPG, PNG, PDF (حتى 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {previewUrl && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    معاينة الصورة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={previewUrl} 
                    alt="Invoice Preview" 
                    className="w-full h-64 object-cover rounded-lg border border-white/20"
                  />
                </CardContent>
              </Card>
            )}

            {uploadedFiles.length > 0 && !extractedData && (
              <Button
                onClick={handleScanInvoice}
                disabled={isScanning}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="ml-2 w-4 h-4 animate-spin" />
                    جاري المسح... {scanProgress}%
                  </>
                ) : (
                  <>
                    <Scan className="ml-2 w-4 h-4" />
                    بدء مسح الفاتورة
                  </>
                )}
              </Button>
            )}

            {isScanning && (
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* البيانات المستخرجة */}
          <div className="space-y-4">
            {extractedData ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    البيانات المستخرجة
                  </CardTitle>
                  <p className="text-green-200/80 text-sm">
                    تم استخراج البيانات بنجاح! يمكنك تعديلها قبل الحفظ
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-white font-medium">رقم الفاتورة</Label>
                      <Input
                        value={extractedData.invoiceNumber || ''}
                        onChange={(e) => handleEditField('invoiceNumber', e.target.value)}
                        className="bg-white/10 border-white/20 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">التاريخ</Label>
                      <Input
                        type="date"
                        value={extractedData.date || ''}
                        onChange={(e) => handleEditField('date', e.target.value)}
                        className="bg-white/10 border-white/20 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">اسم العميل/المورد</Label>
                      <Input
                        value={extractedData.customerName || ''}
                        onChange={(e) => handleEditField('customerName', e.target.value)}
                        className="bg-white/10 border-white/20 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">المبلغ الأساسي</Label>
                      <Input
                        type="number"
                        value={extractedData.amount || ''}
                        onChange={(e) => handleEditField('amount', parseFloat(e.target.value) || 0)}
                        className="bg-white/10 border-white/20 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">الضريبة</Label>
                      <Input
                        type="number"
                        value={extractedData.taxAmount || ''}
                        onChange={(e) => handleEditField('taxAmount', parseFloat(e.target.value) || 0)}
                        className="bg-white/10 border-white/20 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">المبلغ الإجمالي</Label>
                      <Input
                        type="number"
                        value={extractedData.totalAmount || ''}
                        onChange={(e) => handleEditField('totalAmount', parseFloat(e.target.value) || 0)}
                        className="bg-white/10 border-white/20 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">الوصف</Label>
                      <Textarea
                        value={extractedData.description || ''}
                        onChange={(e) => handleEditField('description', e.target.value)}
                        className="bg-white/10 border-white/20 text-white mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">تم المسح بنجاح</span>
                    </div>
                    <p className="text-green-200/80 text-sm">
                      تم استخراج البيانات من الصورة باستخدام تقنية OCR | يرجى مراجعة البيانات والتأكد من صحتها
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileImage className="w-8 h-8 text-white/50" />
                  </div>
                  <p className="text-white/60">
                    قم برفع صورة الفاتورة أولاً لبدء استخراج البيانات
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <X className="ml-2 w-4 h-4" />
            إلغاء
          </Button>
          
          {extractedData && (
            <Button
              onClick={handleConfirmExtraction}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
            >
              <CheckCircle className="ml-2 w-4 h-4" />
              إضافة الفاتورة
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}