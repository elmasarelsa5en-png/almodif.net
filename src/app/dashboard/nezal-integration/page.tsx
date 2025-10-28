'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Download, RefreshCw, CheckCircle, ArrowRight, Monitor, Copy, AlertCircle, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Room {
  id: string;
  number: string;
  type: string;
  status: string;
  guestName?: string;
  guestPhone?: string;
  balance?: number;
}

export default function NezalIntegrationPage() {
  const router = useRouter();
  const [nazeelOpened, setNazeelOpened] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Manual import fields
  const [manualData, setManualData] = useState('');
  const [apiKey, setApiKey] = useState('');

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

  const copyScriptCode = () => {
    const script = `
// انسخ هذا الكود في Console المتصفح في صفحة الشقق في نزيل
(function() {
  const rooms = [];
  
  // محاولة استخراج البيانات من الجدول
  const rows = document.querySelectorAll('table tbody tr, .room-item, [class*="room"]');
  
  rows.forEach(row => {
    try {
      // محاولات مختلفة للحصول على رقم الغرفة
      const roomNumber = 
        row.querySelector('[class*="room-number"], [class*="roomNumber"], td:first-child')?.textContent?.trim() ||
        row.getAttribute('data-room') ||
        '';
      
      // اسم النزيل
      const guestName = 
        row.querySelector('[class*="guest"], [class*="customer"], td:nth-child(2)')?.textContent?.trim() ||
        '';
      
      // رقم الهاتف
      const phone = 
        row.querySelector('[class*="phone"], [class*="mobile"], td:nth-child(3)')?.textContent?.trim() ||
        '';
      
      // الحالة
      const status = 
        row.querySelector('[class*="status"], td:nth-child(4)')?.textContent?.trim() ||
        '';
      
      // الرصيد
      const balance = 
        row.querySelector('[class*="balance"], [class*="amount"], td:nth-child(5)')?.textContent?.trim() ||
        '0';
      
      if (roomNumber && guestName) {
        rooms.push({
          roomNumber: roomNumber,
          guestName: guestName,
          phone: phone,
          status: status.includes('مشغول') || status.includes('occupied') ? 'occupied' : 'available',
          balance: parseFloat(balance.replace(/[^0-9.-]/g, '')) || 0
        });
      }
    } catch (e) {
      console.error('Error parsing row:', e);
    }
  });
  
  console.log('تم استخراج البيانات:', rooms);
  console.log('انسخ هذا النص وضعه في صفحة المزامنة:');
  console.log(JSON.stringify(rooms, null, 2));
  
  // نسخ للحافظة
  navigator.clipboard.writeText(JSON.stringify(rooms, null, 2))
    .then(() => alert('تم نسخ البيانات! الصق في صفحة المزامنة'))
    .catch(() => alert('يرجى نسخ البيانات يدوياً من Console'));
})();
`;
    navigator.clipboard.writeText(script.trim());
    alert('✅ تم نسخ الكود! \n\n1. افتح نزيل\n2. افتح Console (F12 → Console)\n3. الصق الكود واضغط Enter\n4. انسخ النتيجة والصقها في التبويب "استيراد يدوي"');
  };

  const handleManualImport = () => {
    setIsImporting(true);
    setImportStatus('idle');
    setErrorMessage('');
    
    try {
      // Parse the JSON data
      const parsedData = JSON.parse(manualData);
      
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error('البيانات المدخلة غير صحيحة أو فارغة');
      }
      
      const extractedRooms: Room[] = parsedData.map((item: any, index: number) => ({
        id: `room-${item.roomNumber || index}`,
        number: item.roomNumber || item.number || '',
        type: item.type || 'غرفة',
        status: item.status === 'occupied' || item.status === 'Occupied' ? 'Occupied' : 'Available',
        guestName: item.guestName || item.guest || '',
        guestPhone: item.phone || item.mobile || '',
        balance: parseFloat(item.balance) || 0
      })).filter(room => room.number && room.guestName);
      
      if (extractedRooms.length === 0) {
        throw new Error('لم يتم العثور على غرف مشغولة في البيانات');
      }

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
          guestPhone: newRoom.guestPhone,
          balance: newRoom.balance || 0,
          events: [{
            id: `event-${Date.now()}`,
            type: 'check_in',
            description: `تم تسكين ${newRoom.guestName}${newRoom.guestPhone ? ' - هاتف: ' + newRoom.guestPhone : ''}`,
            timestamp: new Date().toISOString(),
            user: 'مزامنة نزيل'
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
    } catch (error: any) {
      console.error('Import error:', error);
      setErrorMessage(error.message || 'حدث خطأ أثناء الاستيراد');
      setImportStatus('error');
      setIsImporting(false);
    }
  };

  const handleApiImport = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('يرجى إدخال مفتاح API من نزيل');
      setImportStatus('error');
      return;
    }

    setIsImporting(true);
    setImportStatus('idle');
    setErrorMessage('');
    
    try {
      // TODO: Replace with actual Nazeel API endpoint
      const response = await fetch('https://pms.nazeel.net/api/rooms', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('فشل الاتصال بـ API نزيل. تحقق من المفتاح');
      }
      
      const data = await response.json();
      // Process the API response similar to manual import
      // ...
      
    } catch (error: any) {
      console.error('API Import error:', error);
      setErrorMessage('API غير متاح حالياً. استخدم الاستيراد اليدوي');
      setImportStatus('error');
      setIsImporting(false);
    }
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
            استورد بيانات الغرف والنزلاء الموجودين حالياً من نظام نزيل
          </p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">استيراد يدوي (مضمون)</TabsTrigger>
            <TabsTrigger value="api">API (قريباً)</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  طريقة الاستيراد اليدوي (موصى بها)
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-green-700 dark:text-green-300 mb-4">
                  <li>افتح نزيل في تبويب منفصل</li>
                  <li>اذهب لصفحة الشقق/التسكين التي تعرض النزلاء الموجودين حالياً</li>
                  <li>اضغط F12 لفتح Developer Tools</li>
                  <li>اذهب لتبويب Console</li>
                  <li>الصق الكود أدناه واضغط Enter</li>
                  <li>سيتم نسخ البيانات تلقائياً، الصقها في الحقل أدناه</li>
                </ol>
                
                <Button 
                  onClick={copyScriptCode}
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 mb-4"
                  size="lg"
                >
                  <Copy className="w-5 h-5" />
                  نسخ كود الاستخراج
                </Button>

                <Button 
                  onClick={handleOpenNazeel}
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  فتح نزيل
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="manualData" className="text-lg font-semibold">
                    بيانات الغرف (JSON)
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    الصق البيانات المنسوخة من Console هنا
                  </p>
                  <Textarea
                    id="manualData"
                    value={manualData}
                    onChange={(e) => setManualData(e.target.value)}
                    placeholder={`مثال:
[
  {
    "roomNumber": "201",
    "guestName": "مشعل الأحمري",
    "phone": "0501234567",
    "status": "occupied",
    "balance": 0
  },
  {
    "roomNumber": "203",
    "guestName": "أحمد محمد",
    "phone": "0509876543",
    "status": "occupied",
    "balance": 1500
  }
]`}
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleManualImport}
                  disabled={isImporting || !manualData.trim()}
                  className="w-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  size="lg"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      جاري الاستيراد...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      استيراد البيانات
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                      ملاحظة: API قيد التطوير
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      حالياً، يرجى استخدام الاستيراد اليدوي. سيتم توفير API مباشر قريباً من نزيل.
                      تواصل مع نزيل للحصول على مفتاح API الخاص بك.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="apiKey">مفتاح API من نزيل</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="أدخل مفتاح API"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleApiImport}
                  disabled={true} // Disabled until API is available
                  className="w-full gap-2"
                  size="lg"
                  variant="outline"
                >
                  <Download className="w-5 h-5" />
                  مزامنة عبر API (غير متاح)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {importStatus === 'success' && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-1">تمت المزامنة بنجاح! </h4>
                  <p className="text-green-700 dark:text-green-300 text-lg">
                    تم استيراد {importedCount} غرفة مشغولة مع بيانات النزلاء. جاري التوجيه لصفحة الغرف...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {importStatus === 'error' && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-bold text-red-800 dark:text-red-200 mb-1">خطأ في الاستيراد</h4>
                  <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
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
