'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, Upload, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoute';

const SOUND_OPTIONS = [
  {
    id: 'alarm',
    name: 'إنذار متكرر',
    description: 'نغمة تنبيه قوية ومتكررة (8 ثواني)',
    icon: '🚨',
    duration: '8 ثواني'
  },
  {
    id: 'bell',
    name: 'جرس طويل',
    description: 'نغمة جرس كلاسيكية متكررة (7 ثواني)',
    icon: '🔔',
    duration: '7 ثواني'
  },
  {
    id: 'chime',
    name: 'نغمة موسيقية',
    description: 'لحن موسيقي جميل وواضح (6 ثواني)',
    icon: '🎵',
    duration: '6 ثواني'
  },
  {
    id: 'urgent',
    name: 'عاجل',
    description: 'نغمة سريعة ومتكررة للأمور العاجلة (8 ثواني)',
    icon: '⚠️',
    duration: '8 ثواني'
  },
  {
    id: 'phone',
    name: 'رنين تليفون',
    description: 'رنين تليفون كلاسيكي (7 ثواني)',
    icon: '📞',
    duration: '7 ثواني'
  }
];

export default function NotificationSoundPage() {
  const router = useRouter();
  const [selectedSound, setSelectedSound] = useState('alarm');
  const [uploadedSoundUrl, setUploadedSoundUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // تحميل النغمة المحفوظة
    const savedSound = localStorage.getItem('notification_sound_type');
    if (savedSound) {
      setSelectedSound(savedSound);
    }

    const uploadedSound = localStorage.getItem('uploaded_notification_sound');
    if (uploadedSound) {
      setUploadedSoundUrl(uploadedSound);
    }
  }, []);

  // حفظ النغمة
  const handleSaveSound = () => {
    localStorage.setItem('notification_sound_type', selectedSound);
    alert('✅ تم حفظ نغمة الإشعار بنجاح!');
  };

  // تجربة النغمة
  const handlePlaySound = async (soundId: string) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      const { playLongNotificationSound } = await import('@/lib/advanced-notifications');
      
      // حفظ مؤقت للاختبار
      const currentSound = localStorage.getItem('notification_sound_type');
      localStorage.setItem('notification_sound_type', soundId);
      
      // تشغيل النغمة
      playLongNotificationSound();
      
      // إرجاع النغمة الأصلية
      if (currentSound) {
        setTimeout(() => {
          localStorage.setItem('notification_sound_type', currentSound);
        }, 100);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
    
    setTimeout(() => setIsPlaying(false), 8000);
  };

  // رفع ملف صوت
  const handleUploadSound = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('audio/')) {
      alert('⚠️ يرجى اختيار ملف صوتي فقط');
      return;
    }

    // التحقق من الحجم (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('⚠️ حجم الملف كبير جداً! الحد الأقصى 5 ميجابايت');
      return;
    }

    // قراءة الملف كـ base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedSoundUrl(dataUrl);
      localStorage.setItem('uploaded_notification_sound', dataUrl);
      setSelectedSound('upload');
      alert('✅ تم رفع الملف الصوتي بنجاح!');
    };
    reader.readAsDataURL(file);
  };

  // تجربة الملف المرفوع
  const handlePlayUploadedSound = () => {
    if (!uploadedSoundUrl || isPlaying) return;
    
    setIsPlaying(true);
    const audio = new Audio(uploadedSoundUrl);
    audio.volume = 0.9;
    audio.play()
      .then(() => {
        audio.onended = () => setIsPlaying(false);
      })
      .catch(error => {
        console.error('Error playing uploaded sound:', error);
        setIsPlaying(false);
      });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="ml-2 h-5 w-5" />
              رجوع
            </Button>

            <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-2xl">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  نغمات الإشعارات
                </CardTitle>
                <p className="text-gray-300 text-sm mt-2">
                  اختر نغمة طويلة تسمعها حتى لو كان التليفون في الجيب
                </p>
              </CardHeader>
            </Card>
          </div>

          {/* النغمات المدمجة */}
          <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">النغمات المدمجة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SOUND_OPTIONS.map((sound) => (
                <div
                  key={sound.id}
                  onClick={() => setSelectedSound(sound.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedSound === sound.id
                      ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-blue-500'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-4xl">{sound.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{sound.name}</h3>
                        <p className="text-gray-400 text-sm">{sound.description}</p>
                        <span className="text-blue-400 text-xs">{sound.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedSound === sound.id && (
                        <div className="bg-green-500 text-white rounded-full p-2">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySound(sound.id);
                        }}
                        disabled={isPlaying}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Play className="w-4 h-4 ml-1" />
                        تجربة
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* رفع ملف صوت */}
          <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع ملف صوت مخصص
              </CardTitle>
              <p className="text-gray-400 text-sm">
                يمكنك رفع ملف MP3 أو WAV (حتى 5 ميجابايت)
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="block">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleUploadSound}
                    className="hidden"
                    id="sound-upload"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('sound-upload')?.click()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Upload className="w-5 h-5 ml-2" />
                    اختر ملف صوتي
                  </Button>
                </label>

                {uploadedSoundUrl && (
                  <div className="p-4 bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🎵</div>
                        <div>
                          <p className="text-white font-medium">ملف صوت مرفوع</p>
                          <p className="text-gray-400 text-sm">جاهز للاستخدام</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedSound === 'upload' && (
                          <div className="bg-green-500 text-white rounded-full p-2">
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                        <Button
                          size="sm"
                          onClick={handlePlayUploadedSound}
                          disabled={isPlaying}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <Play className="w-4 h-4 ml-1" />
                          تجربة
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* زر الحفظ */}
          <Button
            onClick={handleSaveSound}
            className="w-full py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl"
          >
            <Check className="w-6 h-6 ml-2" />
            حفظ النغمة المختارة
          </Button>

          {/* معلومة */}
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
            <p className="text-blue-200 text-sm text-center">
              💡 <strong>ملاحظة:</strong> النغمة المحفوظة ستعمل في كل صفحات النظام، حتى لو كانت صفحة طلبات النزلاء مغلقة!
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
