'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  category: 'coffee' | 'restaurant' | 'laundry' | 'room-services' | 'reception';
  subCategory?: string;
  description?: string;
  image?: string;
  available: boolean;
  createdAt: string;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsImported: (items: MenuItem[]) => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onItemsImported
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
    items: MenuItem[];
  } | null>(null);
  const [currentTab, setCurrentTab] = useState('excel');

  // معالجة ملفات Excel
  const handleExcelUpload = async (file: File) => {
    setIsProcessing(true);
    setImportResults(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      const items: MenuItem[] = [];
      const errors: string[] = [];

      jsonData.forEach((row: any, index) => {
        try {
          if (!row['الاسم العربي'] || !row['الاسم الإنجليزي'] || !row['الفئة'] || !row['السعر']) {
            errors.push(`الصف ${index + 2}: بيانات مطلوبة مفقودة`);
            return;
          }

          const item: MenuItem = {
            id: Date.now() + Math.random().toString(36),
            name: row['الاسم الإنجليزي']?.toString() || row['الاسم العربي']?.toString() || '',
            nameAr: row['الاسم العربي']?.toString() || '',
            category: row['الفئة']?.toString() as 'coffee' | 'restaurant' | 'laundry' | 'room-services' | 'reception' || 'restaurant',
            subCategory: row['التصنيف الفرعي']?.toString() || '',
            price: parseFloat(row['السعر']) || 0,
            description: row['الوصف']?.toString() || '',
            image: row['رابط الصورة']?.toString() || '',
            available: row['متاح']?.toString().toLowerCase() !== 'لا',
            createdAt: new Date().toISOString()
          };

          items.push(item);
        } catch (error) {
          errors.push(`الصف ${index + 2}: خطأ في معالجة البيانات`);
        }
      });

      setImportResults({
        success: items.length,
        errors,
        items
      });

    } catch (error) {
      setImportResults({
        success: 0,
        errors: ['خطأ في قراءة ملف Excel'],
        items: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // معالجة ملفات Word (مستخرج النص فقط)
  const handleWordUpload = async (file: File) => {
    setIsProcessing(true);
    setImportResults(null);

    try {
      // استيراد mammoth بشكل ديناميكي
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      const text = result.value;
      const lines = text.split('\n').filter(line => line.trim());
      
      const items: MenuItem[] = [];
      const errors: string[] = [];

      lines.forEach((line, index) => {
        try {
          // توقع أن يكون التنسيق: اسم عربي | اسم إنجليزي | فئة | سعر
          const parts = line.split('|').map(p => p.trim());
          
          if (parts.length >= 4) {
            const item: MenuItem = {
              id: Date.now() + Math.random().toString(36),
              name: parts[1] || parts[0] || '',
              nameAr: parts[0] || '',
              category: parts[2] as 'coffee' | 'restaurant' | 'laundry' | 'room-services' | 'reception' || 'restaurant',
              price: parseFloat(parts[3]) || 0,
              subCategory: parts[4] || '',
              description: parts[5] || '',
              available: true,
              createdAt: new Date().toISOString()
            };
            
            items.push(item);
          } else if (line.trim()) {
            errors.push(`السطر ${index + 1}: تنسيق غير صحيح`);
          }
        } catch (error) {
          errors.push(`السطر ${index + 1}: خطأ في معالجة البيانات`);
        }
      });

      setImportResults({
        success: items.length,
        errors,
        items
      });

    } catch (error) {
      setImportResults({
        success: 0,
        errors: ['خطأ في قراءة ملف Word'],
        items: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // معالجة الصور (OCR)
  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    setImportResults(null);

    try {
      // استيراد Tesseract بشكل ديناميكي
      const Tesseract = await import('tesseract.js');
      
      const { data: { text } } = await Tesseract.recognize(file, 'ara+eng');
      
      const lines = text.split('\n').filter(line => line.trim());
      const items: MenuItem[] = [];
      const errors: string[] = [];

      lines.forEach((line, index) => {
        try {
          // البحث عن أنماط النصوص التي تحتوي على أسعار
          const priceMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:ر\.س|SAR|₹)/i);
          
          if (priceMatch && line.length > 10) {
            const price = parseFloat(priceMatch[1]);
            const nameText = line.replace(priceMatch[0], '').trim();
            
            if (nameText) {
              const item: MenuItem = {
                id: Date.now() + Math.random().toString(36),
                name: nameText,
                nameAr: nameText,
                category: 'restaurant', // افتراضي
                price: price,
                available: true,
                createdAt: new Date().toISOString()
              };
              
              items.push(item);
            }
          }
        } catch (error) {
          errors.push(`السطر ${index + 1}: خطأ في معالجة النص`);
        }
      });

      setImportResults({
        success: items.length,
        errors,
        items
      });

    } catch (error) {
      setImportResults({
        success: 0,
        errors: ['خطأ في معالجة الصورة أو قراءة النص'],
        items: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // معالجة رفع الملف
  const handleFileUpload = (file: File, type: 'excel' | 'word' | 'image') => {
    switch (type) {
      case 'excel':
        handleExcelUpload(file);
        break;
      case 'word':
        handleWordUpload(file);
        break;
      case 'image':
        handleImageUpload(file);
        break;
    }
  };

  // تنزيل قالب Excel
  const downloadTemplate = () => {
    const templateData = [
      {
        'الاسم العربي': 'شاي أحمر',
        'الاسم الإنجليزي': 'Black Tea',
        'الفئة': 'coffee',
        'التصنيف الفرعي': 'مشروبات ساخنة',
        'السعر': 15,
        'الوصف': 'شاي أحمر طازج',
        'رابط الصورة': '',
        'متاح': 'نعم'
      },
      {
        'الاسم العربي': 'برجر لحم',
        'الاسم الإنجليزي': 'Beef Burger',
        'الفئة': 'restaurant',
        'التصنيف الفرعي': 'برجر',
        'السعر': 45,
        'الوصف': 'برجر لحم طازج مع الخضار',
        'رابط الصورة': '',
        'متاح': 'نعم'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قالب الأصناف');
    XLSX.writeFile(wb, 'قالب-استيراد-الأصناف.xlsx');
  };

  // تأكيد الاستيراد
  const confirmImport = () => {
    if (importResults?.items) {
      onItemsImported(importResults.items);
      onClose();
      setImportResults(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">استيراد الأصناف مجمعة</DialogTitle>
          <DialogDescription className="text-gray-400">
            يمكنك استيراد عدة أصناف مرة واحدة من خلال ملفات Excel أو Word أو الصور
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="excel" className="data-[state=active]:bg-gray-700">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </TabsTrigger>
            <TabsTrigger value="word" className="data-[state=active]:bg-gray-700">
              <FileText className="h-4 w-4 mr-2" />
              Word
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-gray-700">
              <ImageIcon className="h-4 w-4 mr-2" />
              صورة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="excel" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">استيراد من Excel</h3>
                <Button onClick={downloadTemplate} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  تنزيل القالب
                </Button>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  يجب أن يحتوي ملف Excel على الأعمدة التالية: الاسم العربي، الاسم الإنجليزي، الفئة، السعر
                </AlertDescription>
              </Alert>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'excel');
                  }}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-green-400" />
                  <p className="text-lg mb-2">اسحب ملف Excel هنا أو اضغط للاختيار</p>
                  <p className="text-sm text-gray-400">.xlsx, .xls</p>
                </div>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="word" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">استيراد من Word</h3>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  تنسيق كل سطر: اسم عربي | اسم إنجليزي | فئة | سعر | تصنيف فرعي | وصف
                </AlertDescription>
              </Alert>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".docx,.doc"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'word');
                  }}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                  <p className="text-lg mb-2">اسحب ملف Word هنا أو اضغط للاختيار</p>
                  <p className="text-sm text-gray-400">.docx, .doc</p>
                </div>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">استيراد من صورة (OCR)</h3>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  سيتم استخراج النصوص من الصورة تلقائياً. تأكد من وضوح النص والأسعار في الصورة.
                </AlertDescription>
              </Alert>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'image');
                  }}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                  <p className="text-lg mb-2">اسحب صورة هنا أو اضغط للاختيار</p>
                  <p className="text-sm text-gray-400">PNG, JPG, GIF</p>
                </div>
              </label>
            </div>
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>جارٍ معالجة الملف...</span>
          </div>
        )}

        {importResults && (
          <div className="space-y-4 border-t border-white/20 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span>{importResults.success} صنف تم استيراده بنجاح</span>
              </div>
              {importResults.errors.length > 0 && (
                <div className="flex items-center gap-2 text-red-400">
                  <X className="h-5 w-5" />
                  <span>{importResults.errors.length} خطأ</span>
                </div>
              )}
            </div>

            {importResults.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-h-32 overflow-y-auto">
                <h4 className="font-semibold mb-2 text-red-400">الأخطاء:</h4>
                <ul className="text-sm space-y-1">
                  {importResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {importResults.success > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 max-h-32 overflow-y-auto">
                <h4 className="font-semibold mb-2 text-green-400">الأصناف المستوردة:</h4>
                <ul className="text-sm space-y-1">
                  {importResults.items.slice(0, 10).map((item, index) => (
                    <li key={index}>• {item.nameAr} - {item.price} ر.س</li>
                  ))}
                  {importResults.items.length > 10 && (
                    <li>... و {importResults.items.length - 10} صنف آخر</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              {importResults.success > 0 && (
                <Button onClick={confirmImport} className="bg-green-600 hover:bg-green-700">
                  تأكيد الاستيراد ({importResults.success} صنف)
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;