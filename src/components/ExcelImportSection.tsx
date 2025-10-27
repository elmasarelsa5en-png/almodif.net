'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, Upload, ArrowRight } from 'lucide-react';

interface ExcelImportSectionProps {
  onNavigateToSection: (path: string) => void;
}

export default function ExcelImportSection({ onNavigateToSection }: ExcelImportSectionProps) {
  const importSections = [
    {
      title: 'استيراد المعاملات المالية',
      description: 'استيراد المعاملات المالية (الإيرادات والمصروفات) من ملف Excel',
      icon: FileSpreadsheet,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      path: '/dashboard/accounting',
      templateType: 'transactions'
    },
    {
      title: 'استيراد الفواتير',
      description: 'استيراد بيانات الفواتير وحالات الدفع من ملف Excel',
      icon: FileSpreadsheet,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      path: '/dashboard/accounting/invoices',
      templateType: 'invoices'
    },
    {
      title: 'استيراد المصروفات',
      description: 'استيراد تفاصيل المصروفات والتكاليف التشغيلية من ملف Excel',
      icon: FileSpreadsheet,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      path: '/dashboard/accounting/expenses',
      templateType: 'expenses'
    }
  ];

  const downloadTemplate = (templateType: string) => {
    // تحميل القالب - سيتم التعامل مع هذا في مكون ExcelDropzone
    const event = new CustomEvent('downloadTemplate', { detail: { templateType } });
    window.dispatchEvent(event);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-slate-800/50 to-purple-900/50 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <Upload className="w-5 h-5 text-white" />
          </div>
          استيراد البيانات من Excel
        </CardTitle>
        <p className="text-purple-200/80 font-medium mt-2">
          استيراد البيانات المالية بسهولة من ملفات Excel المنظمة
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {importSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className={`${section.bgColor} ${section.borderColor} border rounded-lg p-4 hover:scale-105 transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{section.title}</h3>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {section.description}
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => onNavigateToSection(section.path)}
                    className={`w-full bg-gradient-to-r ${section.color} hover:opacity-90 text-white group-hover:shadow-lg transition-all duration-300`}
                  >
                    <Upload className="ml-2 w-4 h-4" />
                    بدء الاستيراد
                    <ArrowRight className="mr-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                  
                  <Button
                    onClick={() => downloadTemplate(section.templateType)}
                    variant="outline"
                    className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Download className="ml-2 w-4 h-4" />
                    تحميل القالب
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">تعليمات الاستيراد:</h4>
              <ul className="text-blue-200/80 text-sm space-y-1">
                <li>• تأكد من استخدام القوالب المقدمة لضمان التوافق</li>
                <li>• تحقق من صحة البيانات قبل الاستيراد</li>
                <li>• يمكن استيراد ملفات .xlsx و .xls</li>
                <li>• سيتم عرض معاينة للبيانات قبل التأكيد</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}