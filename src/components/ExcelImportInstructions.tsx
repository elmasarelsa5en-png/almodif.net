import { Card, CardContent } from '@/components/ui/card';
import { Info, FileSpreadsheet, CheckCircle } from 'lucide-react';

interface ExcelImportInstructionsProps {
  type: 'transactions' | 'invoices' | 'expenses';
}

export default function ExcelImportInstructions({ type }: ExcelImportInstructionsProps) {
  const instructions = {
    transactions: {
      title: 'تعليمات استيراد المعاملات',
      fields: ['النوع', 'الوصف', 'المبلغ', 'التاريخ', 'الحالة', 'الفئة'],
      examples: [
        'النوع: دخل أو مصروف',
        'الوصف: وصف تفصيلي للمعاملة',
        'المبلغ: قيمة رقمية',
        'التاريخ: تنسيق YYYY-MM-DD'
      ]
    },
    invoices: {
      title: 'تعليمات استيراد الفواتير',
      fields: ['رقم الفاتورة', 'اسم العميل', 'الغرفة', 'المبلغ', 'الحالة', 'التاريخ', 'تاريخ الاستحقاق', 'الوصف'],
      examples: [
        'رقم الفاتورة: INV-2025-001',
        'الحالة: مدفوع، معلق، أو متأخر',
        'المبلغ: قيمة رقمية',
        'التاريخ: تنسيق YYYY-MM-DD'
      ]
    },
    expenses: {
      title: 'تعليمات استيراد المصروفات',
      fields: ['الوصف', 'المبلغ', 'الفئة', 'التاريخ', 'طريقة الدفع', 'الإيصال', 'الملاحظات'],
      examples: [
        'الفئة: المرافق، التنظيف، الصيانة، الرواتب',
        'طريقة الدفع: نقدي، بطاقة ائتمان، تحويل بنكي',
        'المبلغ: قيمة رقمية موجبة',
        'التاريخ: تنسيق YYYY-MM-DD'
      ]
    }
  };

  const currentInstructions = instructions[type];

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              {currentInstructions.title}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-blue-200 font-medium mb-2">الحقول المطلوبة:</h5>
                <ul className="text-blue-200/80 text-sm space-y-1">
                  {currentInstructions.fields.map((field, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-blue-200 font-medium mb-2">أمثلة على البيانات:</h5>
                <ul className="text-blue-200/80 text-sm space-y-1">
                  {currentInstructions.examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-400 text-xs mt-1">▸</span>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}