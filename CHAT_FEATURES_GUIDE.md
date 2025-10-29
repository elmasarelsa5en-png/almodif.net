# 🚀 دليل إضافة ميزات المحادثات المتقدمة

## ✅ ما تم تنفيذه:

### 1. **Push Notifications System** 🔔
- ✅ Firebase Cloud Messaging (FCM)
- ✅ Service Worker للإشعارات الخلفية
- ✅ نظام Token management
- ✅ إشعارات حتى لو التطبيق مغلق

**الملفات المضافة:**
- `/public/firebase-messaging-sw.js` - Service Worker
- `/src/lib/push-notifications.ts` - مدير الإشعارات

### 2. **File Upload System** 📤
- ✅ رفع الصور مع ضغط تلقائي
- ✅ تسجيل ورفع الصوت
- ✅ رفع ملفات عامة
- ✅ شريط تقدم للرفع
- ✅ التحقق من نوع وحجم الملف

**الملف المضاف:**
- `/src/lib/chat-file-manager.ts` - مدير الملفات

---

## 🔧 خطوات التفعيل:

### المرحلة 1: تفعيل Push Notifications

#### 1.1 - الحصول على VAPID Key من Firebase:
```bash
# في Firebase Console:
1. Project Settings > Cloud Messaging
2. Web Push certificates
3. Generate key pair
4. انسخ الـ Key
```

#### 1.2 - تحديث الـ VAPID Key:
في ملف `/src/lib/push-notifications.ts` سطر 51:
```typescript
const vapidKey = 'YOUR_VAPID_KEY_HERE'; // 🔴 غيّر هذا!
```

#### 1.3 - إضافة التهيئة في صفحة المحادثات:
في `/src/app/dashboard/chat/page.tsx`:
```typescript
import { setupPushNotifications } from '@/lib/push-notifications';

// داخل useEffect:
useEffect(() => {
  if (user) {
    const userId = user.username || user.email;
    setupPushNotifications(userId);
  }
}, [user]);
```

#### 1.4 - إضافة إرسال Push عند الرسالة الجديدة:
في دالة `sendMessage`:
```typescript
import { sendPushNotification } from '@/lib/push-notifications';

// بعد إرسال الرسالة:
await sendPushNotification(
  selectedEmployee.id,
  `رسالة جديدة من ${user?.name}`,
  messageText.trim()
);
```

#### 1.5 - إنشاء API Route لإرسال الإشعارات:
**ملف:** `/src/app/api/send-notification/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// تهيئة Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { tokens, notification, data } = await request.json();

    const message = {
      notification,
      data,
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    
    return NextResponse.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
```

#### 1.6 - إضافة متغيرات البيئة:
**ملف:** `.env.local`
```env
FIREBASE_PROJECT_ID=almodif-49af5
FIREBASE_CLIENT_EMAIL=your-service-account@almodif-49af5.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

### المرحلة 2: إضافة رفع الصور والصوت

#### 2.1 - تحديث واجهة الرسالة:
في `/src/app/dashboard/chat/page.tsx`:
```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;  // اجعلها اختيارية
  type: 'text' | 'image' | 'audio' | 'file';  // أضف نوع
  fileUrl?: string;  // رابط الملف
  fileName?: string;  // اسم الملف
  fileSize?: number;  // حجم الملف
  duration?: number;  // مدة الصوت
  timestamp: Date;
  read: boolean;
}
```

#### 2.2 - إضافة states للملفات:
```typescript
const [isUploading, setIsUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [isRecording, setIsRecording] = useState(false);
const audioRecorderRef = useRef<AudioRecorder>(new AudioRecorder());
```

#### 2.3 - دالة رفع صورة:
```typescript
const handleImageUpload = async (file: File) => {
  try {
    const validation = validateFile(file, 'image');
    if (!validation.valid) {
      setErrorMessage(validation.error || 'ملف غير صالح');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const imageUrl = await uploadChatImage(
      file,
      currentChatId!,
      (progress) => setUploadProgress(progress)
    );

    // إرسال رسالة بالصورة
    await addDoc(collection(db, 'messages'), {
      chatId: currentChatId,
      senderId: user?.username || user?.email,
      type: 'image',
      fileUrl: imageUrl,
      fileName: file.name,
      fileSize: file.size,
      timestamp: serverTimestamp(),
      read: false,
    });

    setIsUploading(false);
  } catch (error) {
    console.error('Error uploading image:', error);
    setErrorMessage('فشل رفع الصورة');
    setIsUploading(false);
  }
};
```

#### 2.4 - دالة تسجيل صوت:
```typescript
const startRecording = async () => {
  try {
    await audioRecorderRef.current.startRecording();
    setIsRecording(true);
  } catch (error) {
    console.error('Error starting recording:', error);
    setErrorMessage('فشل بدء التسجيل');
  }
};

const stopRecording = async () => {
  try {
    const { blob, duration } = await audioRecorderRef.current.stopRecording();
    setIsRecording(false);
    setIsUploading(true);

    const audioUrl = await uploadChatAudio(
      blob,
      currentChatId!,
      duration,
      (progress) => setUploadProgress(progress)
    );

    await addDoc(collection(db, 'messages'), {
      chatId: currentChatId,
      senderId: user?.username || user?.email,
      type: 'audio',
      fileUrl: audioUrl,
      duration,
      timestamp: serverTimestamp(),
      read: false,
    });

    setIsUploading(false);
  } catch (error) {
    console.error('Error recording audio:', error);
    setErrorMessage('فشل حفظ التسجيل');
    setIsUploading(false);
  }
};
```

#### 2.5 - تحديث UI الأزرار:
```tsx
{/* زر رفع الصور */}
<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    if (e.target.files?.[0]) {
      handleImageUpload(e.target.files[0]);
    }
  }}
  className="hidden"
  id="image-upload"
/>
<label htmlFor="image-upload">
  <Button
    variant="ghost"
    size="sm"
    className="..."
    disabled={isUploading}
  >
    <Paperclip className="w-5 h-5" />
  </Button>
</label>

{/* زر تسجيل الصوت */}
<Button
  variant="ghost"
  size="sm"
  onClick={isRecording ? stopRecording : startRecording}
  className={cn(
    "...",
    isRecording && "bg-red-500 animate-pulse"
  )}
  disabled={isUploading}
>
  <Mic className="w-5 h-5" />
</Button>

{/* شريط التقدم */}
{isUploading && (
  <div className="absolute bottom-full left-0 right-0 p-2">
    <div className="bg-slate-700 rounded-full h-2">
      <div
        className="bg-purple-500 h-2 rounded-full transition-all"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
  </div>
)}
```

#### 2.6 - عرض الرسائل المختلفة:
```tsx
{messages.map((message) => {
  const isCurrentUser = message.senderId === (user?.username || user?.email);
  
  return (
    <div key={message.id} className={...}>
      <div className={...}>
        {/* رسالة نصية */}
        {message.type === 'text' && (
          <p className="...">{message.text}</p>
        )}
        
        {/* صورة */}
        {message.type === 'image' && (
          <img
            src={message.fileUrl}
            alt="صورة"
            className="max-w-xs rounded-lg cursor-pointer"
            onClick={() => window.open(message.fileUrl, '_blank')}
          />
        )}
        
        {/* صوت */}
        {message.type === 'audio' && (
          <audio controls className="max-w-xs">
            <source src={message.fileUrl} type="audio/webm" />
          </audio>
        )}
        
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isCurrentUser && (message.read ? <CheckCheck /> : <Check />)}
        </div>
      </div>
    </div>
  );
})}
```

---

### المرحلة 3: إضافة المكالمات (Voice/Video)

**ملاحظة:** المكالمات تحتاج **WebRTC** وهو معقد!

#### خيارات التنفيذ:

**Option 1: استخدام خدمة جاهزة (الأسهل)** ⭐ **مُوصى به**
- **Agora.io** - مجاني حتى 10,000 دقيقة/شهر
- **Twilio Video** - مدفوع
- **Daily.co** - مجاني حتى 10 غرف

**Option 2: WebRTC مباشر (صعب)**
- يحتاج STUN/TURN servers
- معقد جداً

#### تنفيذ سريع مع Agora:

```bash
npm install agora-rtc-sdk-ng
```

```typescript
import AgoraRTC from 'agora-rtc-sdk-ng';

const startCall = async (targetUserId: string, type: 'audio' | 'video') => {
  const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  
  await client.join(
    'YOUR_APP_ID',
    `chat-${currentChatId}`,
    'TOKEN',
    user?.username
  );

  if (type === 'video') {
    const videoTrack = await AgoraRTC.createCameraVideoTrack();
    await client.publish([videoTrack]);
  }

  const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([audioTrack]);
};
```

---

## 📋 Checklist للتفعيل الكامل:

### Push Notifications:
- [ ] الحصول على VAPID Key من Firebase
- [ ] تحديث vapidKey في الكود
- [ ] إضافة setupPushNotifications في chat page
- [ ] إنشاء API route لإرسال الإشعارات
- [ ] إضافة Firebase Admin SDK credentials
- [ ] اختبار الإشعارات

### File Upload:
- [ ] تحديث Message interface
- [ ] إضافة states للرفع
- [ ] إضافة دالة handleImageUpload
- [ ] إضافة دالة recording
- [ ] تحديث UI buttons
- [ ] تحديث عرض الرسائل
- [ ] اختبار رفع الصور
- [ ] اختبار تسجيل الصوت

### Voice/Video Calls:
- [ ] اختيار خدمة (Agora/Twilio/Daily)
- [ ] تسجيل حساب والحصول على API Key
- [ ] تثبيت SDK
- [ ] إنشاء مكون Call UI
- [ ] إضافة أزرار المكالمات
- [ ] اختبار المكالمات

---

## ⚠️ ملاحظات مهمة:

1. **Firebase Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chat-images/{chatId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /chat-audio/{chatId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /chat-files/{chatId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

2. **تكلفة الخدمات:**
- Firebase Storage: 5 GB مجاناً
- Firebase Cloud Messaging: مجاني
- Agora: 10,000 دقيقة مجاناً
- Twilio: مدفوع ($0.04/دقيقة)

3. **الأداء:**
- ضغط الصور قبل الرفع
- حد أقصى لحجم الملفات
- استخدام WebP للصور
- استخدام WebM للصوت

---

## 🚀 للبدء الآن:

```bash
# 1. تثبيت dependencies إضافية
npm install firebase-admin

# 2. تهيئة Firebase Storage rules
firebase deploy --only storage

# 3. اختبار Push Notifications
# افتح Console واطلب الإذن

# 4. اختبار رفع الصور
# اختر صورة وتأكد من الرفع

# 5. اختبار تسجيل الصوت
# اضغط على زر الميكروفون
```

---

## 📞 هل تريد المساعدة في:
1. ✅ تفعيل Push Notifications فوراً؟
2. ✅ إضافة رفع الصور والصوت؟
3. ✅ إعداد المكالمات مع Agora؟

أخبرني ما تريد البدء به أولاً! 🎯
