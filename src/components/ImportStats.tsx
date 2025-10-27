import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react';

interface ImportStatsProps {
  totalImported: number;
  lastImportDate?: string;
  importHistory: Array<{
    date: string;
    count: number;
    type: string;
    status: 'success' | 'warning' | 'error';
  }>;
}

export default function ImportStats({ totalImported, lastImportDate, importHistory }: ImportStatsProps) {
  const statusIcons = {
    success: CheckCircle,
    warning: Clock,
    error: AlertTriangle
  };

  const statusColors = {
    success: 'bg-green-500/20 text-green-400 border-green-500/40',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    error: 'bg-red-500/20 text-red-400 border-red-500/40'
  };

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">إحصائيات الاستيراد</h4>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">
                {totalImported} عنصر مستورد
              </Badge>
            </div>
            
            {lastImportDate && (
              <p className="text-blue-200/80 text-sm mb-3">
                آخر استيراد: {lastImportDate}
              </p>
            )}

            {importHistory.length > 0 && (
              <div>
                <h5 className="text-blue-200 font-medium mb-2 text-sm">سجل الاستيراد الأخير:</h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {importHistory.slice(0, 5).map((item, index) => {
                    const StatusIcon = statusIcons[item.status];
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-300">{item.date}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-blue-200/80">{item.type}</span>
                        </div>
                        <Badge className={`${statusColors[item.status]} text-xs`}>
                          {item.count} عنصر
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {importHistory.length === 0 && (
              <p className="text-gray-400 text-sm italic">
                لم يتم استيراد أي بيانات بعد
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}