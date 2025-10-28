# 💬 نظام المحادثات الاحترافي بين الموظفين

## 📋 نظرة عامة

تم ترقية نظام المحادثات من **localStorage** إلى **Firebase Firestore** مع إضافة ميزات احترافية شاملة:

- ✅ **Real-time Updates** - تحديثات فورية
- ✅ **Online Status** - حالة الاتصال (نشط الآن / آخر ظهور)
- ✅ **Typing Indicators** - مؤشر الكتابة (... يكتب)
- ✅ **Read Receipts** - إشعارات القراءة (✓ / ✓✓)
- ✅ **Edit Messages** - تعديل الرسائل
- ✅ **Delete Messages** - حذف الرسائل
- ✅ **Message History** - سجل دائم للرسائل
- ✅ **Cross-Device Sync** - مزامنة بين الأجهزة
- ✅ **Permissions System** - نظام صلاحيات متكامل

---

## 🗂️ البنية التقنية

### 1. Firebase Collections

#### **chats** - المحادثات
```typescript
{
  id: string,                          // معرف المحادثة
  participants: string[],              // [userId1, userId2]
  participantNames: {                  // أسماء المشاركين
    [userId]: string
  },
  participantAvatars?: {               // صور المشاركين (اختياري)
    [userId]: string
  },
  lastMessage: string,                 // آخر رسالة
  lastMessageTime: Timestamp,          // وقت آخر رسالة
  lastMessageSenderId: string,         // مرسل آخر رسالة
  unreadCount: {                       // عدد الرسائل غير المقروءة
    [userId]: number
  },
  typing: {                            // حالة الكتابة
    [userId]: boolean
  },
  createdAt: Timestamp,                // تاريخ الإنشاء
  updatedAt: Timestamp                 // تاريخ آخر تحديث
}
```

#### **messages** - الرسائل
```typescript
{
  id: string,                          // معرف الرسالة
  chatId: string,                      // معرف المحادثة
  senderId: string,                    // معرف المرسل
  senderName: string,                  // اسم المرسل
  senderAvatar?: string,               // صورة المرسل (اختياري)
  content: string,                     // محتوى الرسالة
  timestamp: Timestamp,                // وقت الإرسال
  type: 'text' | 'file' | 'image',    // نوع الرسالة
  fileUrl?: string,                    // رابط الملف (اختياري)
  fileName?: string,                   // اسم الملف (اختياري)
  readBy: string[],                    // قائمة من قرأ الرسالة
  edited?: boolean,                    // هل تم التعديل
  editedAt?: Timestamp                 // وقت التعديل
}
```

#### **online_status** - حالة الاتصال
```typescript
{
  userId: string,                      // معرف المستخدم
  online: boolean,                     // متصل أم لا
  lastSeen: Timestamp                  // آخر ظهور
}
```

---

## 🔐 نظام الصلاحيات

### صلاحيات المحادثات (Chat Permissions)

| الصلاحية | المعرف | الوصف |
|---------|--------|-------|
| الوصول للمحادثات | `access_chat` | الوصول إلى صفحة المحادثات |
| إرسال رسائل | `send_message` | إرسال رسائل للموظفين |
| بدء محادثة جديدة | `start_new_chat` | بدء محادثة مع موظف آخر |
| تعديل رسائله | `edit_own_message` | تعديل الرسائل المرسلة |
| حذف رسائله | `delete_own_message` | حذف الرسائل المرسلة |
| رؤية حالة الاتصال | `view_online_status` | رؤية من هو متصل الآن |
| رفع الملفات | `upload_files` | إرسال ملفات ومرفقات |
| عرض كل المحادثات | `view_all_chats` | رؤية جميع محادثات الموظفين (إداري) |
| حذف أي رسالة | `delete_any_message` | حذف رسائل الآخرين (إداري) |

### صلاحيات التنقل

| الصلاحية | المعرف | الوصف |
|---------|--------|-------|
| رابط المحادثات | `view_chat_link` | عرض رابط المحادثات في القائمة |

---

## 🚀 استخدام النظام

### 1. إضافة الصلاحيات لجميع الموظفين

افتح الملف التالي في المتصفح:
```
scripts/add-chat-permissions.html
```

سيضيف الصلاحيات التالية تلقائياً:
- `access_chat`
- `send_message`
- `start_new_chat`
- `edit_own_message`
- `delete_own_message`
- `view_online_status`
- `upload_files`
- `view_chat_link`

### 2. الوصول إلى المحادثات

```
/dashboard/chat
```

---

## 📝 واجهة البرمجة (API)

### في `src/lib/chat.ts`:

#### إنشاء أو الحصول على محادثة
```typescript
const chatId = await getOrCreateChat(
  currentUserId: string,
  currentUserName: string,
  otherUserId: string,
  otherUserName: string,
  currentUserAvatar?: string,
  otherUserAvatar?: string
): Promise<string>
```

#### إرسال رسالة
```typescript
const messageId = await sendMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  content: string,
  type?: 'text' | 'file' | 'image',
  fileUrl?: string,
  fileName?: string,
  senderAvatar?: string
): Promise<string>
```

#### وضع علامة مقروء
```typescript
await markMessagesAsRead(
  chatId: string,
  userId: string
): Promise<void>
```

#### تعيين حالة الكتابة
```typescript
await setTypingStatus(
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void>
```

#### تحديث حالة الاتصال
```typescript
await updateOnlineStatus(
  userId: string,
  online: boolean
): Promise<void>
```

#### تعديل رسالة
```typescript
await editMessage(
  messageId: string,
  newContent: string
): Promise<void>
```

#### حذف رسالة
```typescript
await deleteMessage(
  messageId: string,
  chatId: string
): Promise<void>
```

### اشتراكات الوقت الفعلي (Real-time Subscriptions)

#### الاشتراك في المحادثات
```typescript
const unsubscribe = subscribeToChats(
  userId: string,
  callback: (chats: Chat[]) => void
): () => void
```

#### الاشتراك في الرسائل
```typescript
const unsubscribe = subscribeToMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): () => void
```

#### الاشتراك في حالة الاتصال
```typescript
const unsubscribe = subscribeToOnlineStatus(
  userId: string,
  callback: (status: OnlineStatus) => void
): () => void
```

#### الاشتراك في حالة الكتابة
```typescript
const unsubscribe = subscribeToTyping(
  chatId: string,
  callback: (typing: { [key: string]: boolean }) => void
): () => void
```

---

## 🎨 الميزات التفاعلية

### 1. حالة الاتصال (Online Status)

- **نقطة خضراء** بجانب الموظفين المتصلين
- **نشط الآن** يظهر أسفل الاسم
- **آخر ظهور** للموظفين غير المتصلين

### 2. مؤشر الكتابة (Typing Indicator)

- يظهر تلقائياً عند كتابة الموظف الآخر
- 3 نقاط متحركة بتأثير Bounce
- يختفي بعد 2 ثانية من التوقف عن الكتابة

### 3. إشعارات القراءة (Read Receipts)

- **✓ واحد** - الرسالة مرسلة ولم تُقرأ بعد
- **✓✓ اثنان** - الرسالة مقروءة

### 4. تعديل الرسائل

- **زر تعديل** يظهر عند تمرير الماوس على الرسالة
- **علامة "تم التعديل"** تظهر على الرسائل المعدلة

### 5. حذف الرسائل

- **زر حذف** أحمر بجانب زر التعديل
- **تأكيد قبل الحذف** لتجنب الحذف العرضي

---

## 📊 إحصائيات المحادثات

في قائمة المحادثات:
- **عدد المحادثات** يظهر في شريط العنوان
- **عدد الرسائل غير المقروءة** (badge أحمر)
- **آخر رسالة** مع الوقت

---

## 🔧 الإعدادات التقنية

### في `src/app/dashboard/chat/page.tsx`:

#### الاشتراكات التلقائية:
```typescript
// اشتراك في المحادثات
useEffect(() => {
  const unsubscribe = subscribeToChats(user.username, setChats);
  return () => unsubscribe();
}, [user]);

// اشتراك في الرسائل
useEffect(() => {
  if (!selectedChat) return;
  const unsubscribe = subscribeToMessages(selectedChat.id, setMessages);
  return () => unsubscribe();
}, [selectedChat]);

// اشتراك في حالة الكتابة
useEffect(() => {
  if (!selectedChat) return;
  const unsubscribe = subscribeToTyping(selectedChat.id, setTypingUsers);
  return () => unsubscribe();
}, [selectedChat]);

// تحديث حالة الاتصال
useEffect(() => {
  if (!user) return;
  updateOnlineStatus(user.username, true);
  return () => updateOnlineStatus(user.username, false);
}, [user]);
```

---

## 🛡️ الحماية بالصلاحيات

### حماية الصفحة:
```tsx
<ProtectedRoute>
  <PermissionGuard permission="access_chat" fallback="page">
    {/* Chat UI */}
  </PermissionGuard>
</ProtectedRoute>
```

### حماية الأزرار (في المستقبل):
```tsx
<HasPermission permission="send_message">
  <Button onClick={sendMessage}>إرسال</Button>
</HasPermission>
```

---

## 📁 الملفات المضافة/المعدلة

### الملفات الجديدة:
1. **`src/lib/chat.ts`** - نظام المحادثات الكامل
2. **`scripts/add-chat-permissions.html`** - أداة إضافة الصلاحيات

### الملفات المعدلة:
1. **`src/app/dashboard/chat/page.tsx`** - صفحة المحادثات (ترقية كاملة)
2. **`src/lib/permissions.ts`** - إضافة فئة صلاحيات Chat

---

## 🎯 خطة التطوير المستقبلية

### ✅ تم الإنجاز:
- [x] Real-time messaging
- [x] Online status
- [x] Typing indicators
- [x] Read receipts
- [x] Edit messages
- [x] Delete messages
- [x] Permission system

### 🔜 قادم قريباً:
- [ ] رفع الملفات والصور
- [ ] Emoji picker
- [ ] رسائل صوتية
- [ ] محادثات جماعية (Group Chats)
- [ ] تثبيت الرسائل المهمة
- [ ] تفاعلات الرسائل (Reactions)
- [ ] بحث في الرسائل
- [ ] إشعارات سطح المكتب
- [ ] تصدير المحادثات

---

## 🐛 استكشاف الأخطاء

### المحادثات لا تظهر:
1. تأكد من تسجيل الدخول
2. تأكد من وجود صلاحية `access_chat`
3. افتح Console واختبر:
   ```javascript
   firebase.auth().currentUser
   ```

### الرسائل لا تصل فورياً:
1. تحقق من اتصال Firebase
2. انظر إلى Console للأخطاء
3. تأكد من صلاحية `send_message`

### حالة الاتصال لا تتحدث:
- تحقق من أن `updateOnlineStatus` يُستدعى عند تحميل الصفحة

---

## 📞 الدعم

للمساعدة أو البلاغات:
- افتح Console وابحث عن الأخطاء
- راجع `src/lib/chat.ts` للتفاصيل التقنية
- استخدم `scripts/add-chat-permissions.html` لإصلاح مشاكل الصلاحيات

---

## 📜 الترخيص

جزء من نظام Al-Modif CRM - جميع الحقوق محفوظة © 2024

---

**تم التطوير بواسطة:** نظام الذكاء الاصطناعي  
**التاريخ:** ديسمبر 2024  
**الإصدار:** 2.0 (Firebase-powered)
