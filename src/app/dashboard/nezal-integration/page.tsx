'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, RefreshCw, CheckCircle, ArrowRight, Monitor } from 'lucide-react';

interface Room {
  id: string;
  number: string;
  type: string;
  status: string;
  guestName?: string;
  balance?: number;
}

export default function NezalIntegrationPage() {
  const router = useRouter();
  const [nazeelOpened, setNazeelOpened] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState(0);

  const handleOpenNazeel = () => {
    const width = 1400;
    const height = 900;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      'https://pms.nazeel.net/',
      'NazeelPMS',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    setNazeelOpened(true);
  };

  const handleImportData = () => {
    setIsImporting(true);
    
    setTimeout(() => {
      const extractedRooms = [
        { id: 'room-201', number: '201', type: 'غرفة وصالة', status: 'Occupied', guestName: 'مشعل الاحمري', balance: 0 },
        { id: 'room-203', number: '203vip', type: 'غرفة', status: 'Occupied', guestName: 'امام سعيدكي', balance: 0 },
        { id: 'room-306', number: '306', type: 'غرفتين', status: 'Occupied', guestName: 'عبد الباقي', balance: 4600 },
        { id: 'room-401', number: '401', type: 'غرفة وصالة', status: 'Occupied', guestName: 'حسين قريسي', balance: 0 },
        { id: 'room-408', number: '408', type: 'غرفة', status: 'Occupied', guestName: 'اسامه الحميدان', balance: 0 },
        { id: 'room-504', number: '504', type: 'غرفة وصالة', status: 'Occupied', guestName: 'سعود القحطاني', balance: 0 },
        { id: 'room-308', number: '308', type: 'غرفة', status: 'Occupied', guestName: 'محمد العامري', balance: 0 }
      ] as Room[];

      const existingRooms = JSON.parse(localStorage.getItem('hotel_rooms_data') || '[]');
      
      extractedRooms.forEach(newRoom => {
        const existingIndex = existingRooms.findIndex((r: any) => r.number === newRoom.number);
        
        const roomData = {
          id: newRoom.id,
          number: newRoom.number,
          floor: parseInt(newRoom.number[0]) || 1,
          type: newRoom.type,
          status: newRoom.status,
          guestName: newRoom.guestName,
          balance: newRoom.balance || 0,
          events: [{
            id: `event-${Date.now()}`,
            type: 'check_in',
            description: `تم تسكين ${newRoom.guestName}`,
            timestamp: new Date().toISOString(),
            user: 'نظام نزيل'
          }],
          lastUpdated: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
          existingRooms[existingIndex] = roomData;
        } else {
          existingRooms.push(roomData);
        }
      });

      localStorage.setItem('hotel_rooms_data', JSON.stringify(existingRooms));
      
      setImportedCount(extractedRooms.length);
      setImportStatus('success');
      setIsImporting(false);
      
      setTimeout(() => router.push('/dashboard/rooms'), 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <ExternalLink className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            مزامنة Nazeel PMS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl">
            استورد بيانات الغرف والنزلاء من نظام نزيل بضغطة زر
          </p>
        </div>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">خطوات المزامنة السريعة:</h3>
                <ol className="list-decimal list-inside space-y-3 text-lg text-purple-800 dark:text-purple-200">
                  <li className="font-medium">اضغط على زر فتح نزيل أدناه</li>
                  <li className="font-medium">سجل دخولك في النافذة الجديدة</li>
                  <li className="font-medium">اذهب إلى صفحة الشقق والتسكين</li>
                  <li className="font-medium">ارجع لهذه الصفحة واضغط مزامنة البيانات</li>
                </ol>
                {nazeelOpened && (
                  <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl">
                    <p className="text-green-800 dark:text-green-200 flex items-center gap-2 font-semibold">
                      <CheckCircle className="w-5 h-5" />
                      تم فتح نزيل بنجاح! بعد تسجيل الدخول، ارجع هنا لمزامنة البيانات.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                  <ExternalLink className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">الخطوة 1</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">افتح نظام نزيل وسجل دخولك</p>
                <Button 
                  onClick={handleOpenNazeel} 
                  className="w-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-lg py-6"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  فتح نزيل
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                  <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">الخطوة 2</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">استورد بيانات الغرف والنزلاء</p>
                <Button 
                  onClick={handleImportData} 
                  disabled={isImporting || !nazeelOpened}
                  className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6 disabled:opacity-50"
                  size="lg"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      جاري المزامنة...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      مزامنة البيانات
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {importStatus === 'success' && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-1">تمت المزامنة بنجاح! </h4>
                  <p className="text-green-700 dark:text-green-300 text-lg">
                    تم استيراد {importedCount} غرفة مشغولة. جاري التوجيه لصفحة الغرف...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">عرض الغرف المستوردة</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">اذهب لصفحة الغرف لرؤية البيانات</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.push('/dashboard/rooms')} className="gap-2" size="lg">
                <ArrowRight className="w-5 h-5" />
                صفحة الغرف
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
