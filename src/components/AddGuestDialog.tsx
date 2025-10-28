'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, UserPlus, Image as ImageIcon, Edit, Download, Clipboard } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { getGuestDataFromClipboard, clearGuestClipboard, saveGuestDataToClipboard } from './GuestDataClipboard';

interface GuestData {
  fullName: string;
  nationality: string;
  idType: string;
  idNumber: string;
  expiryDate: string;
  mobile: string;
  workPhone: string;
  email: string;
  address: string;
  notes: string;
  privateNotes: string;
}

interface AddGuestDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (guestData: GuestData & { roomNumber: string }) => void;
  availableRooms: string[];
}

export default function AddGuestDialog({ open, onClose, onSubmit, availableRooms }: AddGuestDialogProps) {
  const [activeTab, setActiveTab] = useState('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [roomNumber, setRoomNumber] = useState('');
  const [hasClipboardData, setHasClipboardData] = useState(false);
  const [showClipboardPrompt, setShowClipboardPrompt] = useState(false);
  const [guestData, setGuestData] = useState<GuestData>({
    fullName: '',
    nationality: '',
    idType: '',
    idNumber: '',
    expiryDate: '',
    mobile: '',
    workPhone: '',
    email: '',
    address: '',
    notes: '',
    privateNotes: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // التحقق من وجود بيانات محفوظة عند فتح النافذة
  useEffect(() => {
    if (open) {
      const clipboardData = getGuestDataFromClipboard();
      if (clipboardData) {
        setHasClipboardData(true);
        setShowClipboardPrompt(true);
      }
    }
  }, [open]);

  // تحميل البيانات من الحافظة
  const loadFromClipboard = () => {
    const clipboardData = getGuestDataFromClipboard();
    if (clipboardData) {
      setGuestData({
        fullName: clipboardData.fullName || '',
        nationality: clipboardData.nationality || '',
        idType: clipboardData.idType || '',
        idNumber: clipboardData.idNumber || '',
        expiryDate: clipboardData.expiryDate || '',
        mobile: clipboardData.mobile || '',
        workPhone: clipboardData.workPhone || '',
        email: clipboardData.email || '',
        address: clipboardData.address || '',
        notes: clipboardData.notes || '',
        privateNotes: ''
      });
      setShowClipboardPrompt(false);
      setActiveTab('manual');
    }
  };

  // حفظ البيانات الحالية في الحافظة
  const saveToClipboard = () => {
    saveGuestDataToClipboard({
      fullName: guestData.fullName,
      nationality: guestData.nationality,
      idType: guestData.idType,
      idNumber: guestData.idNumber,
      expiryDate: guestData.expiryDate,
      mobile: guestData.mobile,
      workPhone: guestData.workPhone,
      email: guestData.email,
      address: guestData.address,
      notes: guestData.notes
    });
    alert('تم حفظ البيانات مؤقتاً! يمكنك استخدامها لاحقاً.');
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

    try {
      const result = await Tesseract.recognize(
        file,
        'ara+eng', // Arabic and English
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
      
      // استخراج البيانات من النص
      const extractedData = extractDataFromText(text);
      setGuestData(extractedData);
      
    } catch (error) {
      console.error('OCR Error:', error);
      alert('حدث خطأ أثناء قراءة الصورة. يرجى المحاولة مرة أخرى أو الإدخال اليدوي.');
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const extractDataFromText = (text: string): GuestData => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const data: GuestData = {
      fullName: '',
      nationality: '',
      idType: '',
      idNumber: '',
      expiryDate: '',
      mobile: '',
      workPhone: '',
      email: '',
      address: '',
      notes: '',
      privateNotes: ''
    };

    // البحث عن الاسم الكامل - جمع الخانات الأربع المجاورة
    const nameIndex = lines.findIndex(line => 
      line.includes('الاسم') || line.includes('Name') || line.includes('الكامل')
    );
    if (nameIndex !== -1) {
      // جمع الأسطر الأربعة التالية (الخانات الأربع)
      const nameParts: string[] = [];
      for (let i = 1; i <= 4; i++) {
        if (nameIndex + i < lines.length) {
          const part = lines[nameIndex + i].trim();
          // تجاهل الأسطر التي تحتوي على كلمات مفتاحية أخرى
          if (part && 
              !part.includes('نوع العميل') && 
              !part.includes('نوع الإثبات') &&
              !part.includes('رقم الإثبات') &&
              !part.includes('الجنسية') &&
              part.length > 1) {
            nameParts.push(part);
          }
        }
      }
      data.fullName = nameParts.join(' ').trim();
    }

    // البحث عن نوع العميل/الجنسية
    const nationalityIndex = lines.findIndex(line => 
      line.includes('نوع العميل') || line.includes('Nationality') || line.includes('الجنسية')
    );
    if (nationalityIndex !== -1 && nationalityIndex + 1 < lines.length) {
      data.nationality = lines[nationalityIndex + 1] || '';
    }

    // البحث عن نوع الإثبات
    const idTypeIndex = lines.findIndex(line => 
      line.includes('نوع الإثبات') || line.includes('ID Type') || line.includes('البطاقة')
    );
    if (idTypeIndex !== -1 && idTypeIndex + 1 < lines.length) {
      data.idType = lines[idTypeIndex + 1] || '';
    }

    // البحث عن رقم الإثبات (الأرقام الطويلة)
    const idNumberMatch = text.match(/\d{10,}/);
    if (idNumberMatch) {
      data.idNumber = idNumberMatch[0];
    }

    // البحث عن رقم الجوال
    const mobileMatch = text.match(/05\d{8}|5\d{8}/);
    if (mobileMatch) {
      const mobile = mobileMatch[0];
      data.mobile = mobile.startsWith('0') ? mobile : '0' + mobile;
    }

    // البحث عن البريد الإلكتروني
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      data.email = emailMatch[0];
    }

    // البحث عن تاريخ الانتهاء
    const dateMatch = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    if (dateMatch) {
      data.expiryDate = dateMatch[0];
    }

    return data;
  };

  const handleInputChange = (field: keyof GuestData, value: string) => {
    setGuestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!roomNumber.trim()) {
      alert('يرجى إدخال رقم الغرفة');
      return;
    }

    if (!guestData.fullName.trim()) {
      alert('يرجى إدخال اسم النزيل');
      return;
    }

    onSubmit({ ...guestData, roomNumber });
    
    // إعادة تعيين النموذج
    setGuestData({
      fullName: '',
      nationality: '',
      idType: '',
      idNumber: '',
      expiryDate: '',
      mobile: '',
      workPhone: '',
      email: '',
      address: '',
      notes: '',
      privateNotes: ''
    });
    setRoomNumber('');
    setImagePreview(null);
    setActiveTab('manual');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-400" />
            إضافة نزيل جديد
          </DialogTitle>
          <DialogDescription className="text-blue-200/80 text-center">
            أدخل بيانات النزيل يدوياً أو ارفع صورة من نموذج نزيل
          </DialogDescription>
        </DialogHeader>

        {/* رسالة البيانات المحفوظة */}
        {showClipboardPrompt && hasClipboardData && (
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-400/40 rounded-xl p-4 animate-in slide-in-from-top">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clipboard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  توجد بيانات نزيل محفوظة مسبقاً
                </h3>
                <p className="text-blue-200 text-sm mb-3">
                  هل تريد استخدام البيانات المحفوظة أم ستقوم بالإدخال يدوياً؟
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={loadFromClipboard}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    size="sm"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    استخدم البيانات المحفوظة
                  </Button>
                  <Button
                    onClick={() => setShowClipboardPrompt(false)}
                    variant="outline"
                    className="border-blue-400/30 text-blue-200 hover:bg-white/10"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    أدخل يدوياً
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="manual" className="data-[state=active]:bg-blue-600">
              <Edit className="w-4 h-4 ml-2" />
              إدخال يدوي
            </TabsTrigger>
            <TabsTrigger value="ocr" className="data-[state=active]:bg-blue-600">
              <ImageIcon className="w-4 h-4 ml-2" />
              رفع صورة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="roomNumber" className="text-blue-200">رقم الغرفة *</Label>
                <Select value={roomNumber} onValueChange={setRoomNumber}>
                  <SelectTrigger className="bg-white/10 border-blue-400/30 text-white">
                    <SelectValue placeholder="اختر رقم الغرفة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {availableRooms.map((room) => (
                      <SelectItem key={room} value={room} className="text-white hover:bg-slate-700/50">
                        غرفة {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="fullName" className="text-blue-200">الاسم الكامل *</Label>
                <Input
                  id="fullName"
                  value={guestData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="الاسم الكامل"
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="nationality" className="text-blue-200">الجنسية</Label>
                <Input
                  id="nationality"
                  value={guestData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="مثال: مواطن"
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="idType" className="text-blue-200">نوع الإثبات</Label>
                <Input
                  id="idType"
                  value={guestData.idType}
                  onChange={(e) => handleInputChange('idType', e.target.value)}
                  placeholder="مثال: بطاقة هوية مدنية"
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="idNumber" className="text-blue-200">رقم الإثبات</Label>
                <Input
                  id="idNumber"
                  value={guestData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  placeholder="رقم الهوية/الإقامة"
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="expiryDate" className="text-blue-200">تاريخ الانتهاء</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={guestData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="mobile" className="text-blue-200">رقم الجوال</Label>
                <Input
                  id="mobile"
                  value={guestData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="workPhone" className="text-blue-200">هاتف العمل</Label>
                <Input
                  id="workPhone"
                  value={guestData.workPhone}
                  onChange={(e) => handleInputChange('workPhone', e.target.value)}
                  placeholder="رقم هاتف العمل"
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="email" className="text-blue-200">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                  className="bg-white/10 border-blue-400/30 text-white"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address" className="text-blue-200">العنوان</Label>
                <Textarea
                  id="address"
                  value={guestData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="عنوان السكن"
                  className="bg-white/10 border-blue-400/30 text-white"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-blue-200">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={guestData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="ملاحظات عامة"
                  className="bg-white/10 border-blue-400/30 text-white"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="privateNotes" className="text-blue-200">ملاحظات خاصة</Label>
                <Textarea
                  id="privateNotes"
                  value={guestData.privateNotes}
                  onChange={(e) => handleInputChange('privateNotes', e.target.value)}
                  placeholder="ملاحظات خاصة (للإدارة فقط)"
                  className="bg-white/10 border-blue-400/30 text-white"
                  rows={2}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ocr" className="space-y-4 mt-4">
            <div className="col-span-2">
              <Label htmlFor="roomNumberOcr" className="text-blue-200">رقم الغرفة *</Label>
              <Input
                id="roomNumberOcr"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="مثال: 201"
                className="bg-white/10 border-blue-400/30 text-white mb-4"
                required
              />
            </div>

            <div className="border-2 border-dashed border-blue-400/50 rounded-xl p-8 text-center bg-white/5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!imagePreview ? (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-blue-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-blue-200">
                      ارفع صورة من نموذج نزيل
                    </p>
                    <p className="text-sm text-blue-300/70 mt-2">
                      اضغط لاختيار صورة أو اسحبها هنا
                    </p>
                    <p className="text-xs text-blue-300/50 mt-1">
                      الصيغ المدعومة: JPG, PNG, PDF
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isProcessing}
                  >
                    اختر صورة
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    variant="outline"
                    className="border-blue-400/30"
                  >
                    اختر صورة أخرى
                  </Button>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <span className="text-blue-200">جاري قراءة البيانات من الصورة...</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-blue-300">{ocrProgress}%</p>
                </div>
              )}
            </div>

            {/* عرض البيانات المستخرجة */}
            {!isProcessing && imagePreview && (guestData.fullName || guestData.mobile) && (
              <div className="bg-white/10 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-blue-200">البيانات المستخرجة:</p>
                {guestData.fullName && <p className="text-sm text-white">• الاسم: {guestData.fullName}</p>}
                {guestData.nationality && <p className="text-sm text-white">• الجنسية: {guestData.nationality}</p>}
                {guestData.idType && <p className="text-sm text-white">• نوع الإثبات: {guestData.idType}</p>}
                {guestData.idNumber && <p className="text-sm text-white">• رقم الإثبات: {guestData.idNumber}</p>}
                {guestData.mobile && <p className="text-sm text-white">• الجوال: {guestData.mobile}</p>}
                {guestData.email && <p className="text-sm text-white">• البريد: {guestData.email}</p>}
                <p className="text-xs text-blue-300/70 mt-2">يمكنك تعديل البيانات في تبويب "إدخال يدوي"</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <div className="flex gap-2 flex-1">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="border-blue-400/30 flex-1 sm:flex-initial"
            >
              إلغاء
            </Button>
            
            {/* زر حفظ البيانات للاستخدام لاحقاً */}
            <Button
              onClick={saveToClipboard}
              variant="outline"
              className="border-purple-400/30 text-purple-200 hover:bg-purple-600/20 flex-1 sm:flex-initial"
              disabled={!guestData.fullName.trim()}
              title="حفظ البيانات مؤقتاً للاستخدام في وقت آخر"
            >
              <Clipboard className="w-4 h-4 ml-2" />
              حفظ مؤقتاً
            </Button>
          </div>
          
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto"
            disabled={isProcessing}
          >
            <UserPlus className="w-4 h-4 ml-2" />
            إضافة النزيل
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
