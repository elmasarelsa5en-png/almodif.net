import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Home, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { Room, RoomStatus } from '@/lib/rooms-data';

interface AddRoomsFromImageDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rooms: Partial<Room>[]) => void;
}

interface ExtractedRoom {
  number: string;
  type: string;
  status: 'success' | 'warning' | 'error';
  message?: string;
}

export default function AddRoomsFromImageDialog({ open, onClose, onSubmit }: AddRoomsFromImageDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedRooms, setExtractedRooms] = useState<ExtractedRoom[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeRoomType = (text: string): string => {
    const normalized = text.trim().toLowerCase();
    
    // خريطة الأنواع
    const typeMap: Record<string, string> = {
      'شقة': 'شقة',
      'غرفة وصالة': 'غرفة وصالة',
      'غرفه وصاله': 'غرفة وصالة',
      'غرفة': 'غرفة',
      'غرفه': 'غرفة',
      'غرفتين': 'غرفتين',
      'غرفتين وصالة': 'غرفتين وصالة',
      'جناح': 'جناح',
      'جنا': 'جناح',
      'vip': 'VIP',
      'ڤی پی': 'VIP',
      'فيب': 'VIP',
      'استوديو': 'استوديو',
      'أسرة': 'غرفة'
    };

    // البحث عن تطابق
    for (const [key, value] of Object.entries(typeMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    // إذا لم يوجد تطابق، إرجاع النص الأصلي
    return text;
  };

  const extractRoomsFromText = (text: string): ExtractedRoom[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const rooms: ExtractedRoom[] = [];
    
    console.log('All lines:', lines);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // البحث عن رقم الغرفة - يبحث عن أرقام مع احتمالية وجود كلمات مثل "vip" أو أنواع
      const roomNumberMatch = line.match(/(\d{3,4})/);
      
      if (roomNumberMatch) {
        const roomNumber = roomNumberMatch[1];
        
        // البحث عن النوع في نفس السطر أو السطر التالي
        let roomType = 'غرفة'; // افتراضي
        
        // تحقق من وجود نوع في نفس السطر
        const sameLineType = line.replace(roomNumber, '').trim();
        if (sameLineType.length > 0) {
          roomType = normalizeRoomType(sameLineType);
        }
        // إذا كان السطر التالي يحتوي على نوع
        else if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          // تحقق من أن السطر التالي لا يحتوي على رقم غرفة
          if (!nextLine.match(/\d{3,4}/)) {
            roomType = normalizeRoomType(nextLine);
          }
        }

        // التحقق من أن رقم الغرفة معقول
        const roomNum = parseInt(roomNumber);
        if (roomNum >= 101 && roomNum <= 999) {
          rooms.push({
            number: roomNumber,
            type: roomType,
            status: 'success',
            message: `تم استخراج: غرفة ${roomNumber} - ${roomType}`
          });
        }
      }
    }

    // إزالة التكرارات
    const uniqueRooms = rooms.filter((room, index, self) =>
      index === self.findIndex((r) => r.number === room.number)
    );

    return uniqueRooms;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // عرض معاينة الصورة
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);
    setOcrProgress(0);
    setExtractedRooms([]);

    try {
      const result = await Tesseract.recognize(
        file,
        'ara+eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text;
      console.log('Extracted text:', text);
      
      const rooms = extractRoomsFromText(text);
      
      if (rooms.length === 0) {
        setExtractedRooms([{
          number: '0',
          type: '',
          status: 'error',
          message: 'لم يتم العثور على غرف في الصورة. تأكد من وضوح النص.'
        }]);
      } else {
        setExtractedRooms(rooms);
      }
      
    } catch (error) {
      console.error('OCR Error:', error);
      setExtractedRooms([{
        number: '0',
        type: '',
        status: 'error',
        message: 'حدث خطأ أثناء قراءة الصورة. يرجى المحاولة مرة أخرى.'
      }]);
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const handleSubmit = () => {
    const successfulRooms = extractedRooms.filter(r => r.status === 'success');
    
    if (successfulRooms.length === 0) {
      alert('لا توجد غرف صالحة للإضافة');
      return;
    }

    const roomsToAdd: Partial<Room>[] = successfulRooms.map((room, index) => ({
      id: `room_${Date.now()}_${index}`,
      number: room.number,
      type: room.type,
      status: 'Available' as RoomStatus,
      floor: Math.floor(parseInt(room.number) / 100),
      balance: 0,
      events: [{
        id: Date.now().toString(),
        type: 'status_change',
        description: 'تم إنشاء الغرفة',
        timestamp: new Date().toISOString(),
        user: 'System',
        newValue: 'Available'
      }],
      lastUpdated: new Date().toISOString()
    }));

    onSubmit(roomsToAdd);
    
    // إعادة تعيين النموذج
    setImagePreview(null);
    setExtractedRooms([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-400" />
            إضافة غرف من صورة
          </DialogTitle>
          <DialogDescription className="text-blue-200/80">
            ارفع صورة تحتوي على قائمة الغرف وسيتم استخراج أرقامها وأنواعها تلقائياً
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* منطقة رفع الصورة */}
          {!imagePreview && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-400/30 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400/50 hover:bg-white/5 transition-all"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <p className="text-blue-200 font-medium mb-2">اضغط لرفع صورة الغرف</p>
              <p className="text-sm text-blue-300/70">
                يدعم: JPG, PNG, JPEG
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* معاينة الصورة */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-lg border border-blue-400/30"
              />
              <Button
                onClick={() => {
                  setImagePreview(null);
                  setExtractedRooms([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                variant="outline"
                className="mt-2 border-blue-400/30"
                size="sm"
              >
                اختر صورة أخرى
              </Button>
            </div>
          )}

          {/* شريط التقدم */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span className="text-blue-200">جاري قراءة الغرف من الصورة...</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <p className="text-sm text-blue-300 text-center">{ocrProgress}%</p>
            </div>
          )}

          {/* عرض الغرف المستخرجة */}
          {!isProcessing && extractedRooms.length > 0 && (
            <div className="bg-white/10 rounded-xl p-4 space-y-3 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-blue-200">
                  تم استخراج {extractedRooms.filter(r => r.status === 'success').length} غرفة
                </p>
                {extractedRooms.some(r => r.status === 'success') && (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                )}
              </div>
              
              <div className="space-y-2">
                {extractedRooms.map((room, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      room.status === 'success' 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    {room.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      {room.status === 'success' ? (
                        <>
                          <p className="text-white font-medium">
                            غرفة رقم {room.number}
                          </p>
                          <p className="text-sm text-blue-200">النوع: {room.type}</p>
                        </>
                      ) : (
                        <p className="text-sm text-red-200">{room.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-blue-300/70 mt-3">
                💡 نصيحة: تأكد من وضوح أرقام الغرف في الصورة للحصول على أفضل النتائج
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-blue-400/30">
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={isProcessing || extractedRooms.filter(r => r.status === 'success').length === 0}
          >
            <Home className="w-4 h-4 ml-2" />
            إضافة {extractedRooms.filter(r => r.status === 'success').length} غرفة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
