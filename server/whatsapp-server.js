/**
 * 🤖 WhatsApp Auto-Reply Server
 * استخدام whatsapp-web.js للرد التلقائي
 * 
 * المتطلبات:
 * - Node.js v16 أو أحدث
 * - whatsapp-web.js
 * - qrcode-terminal
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// ========================================
// إعدادات النظام
// ========================================

// تحميل الإعدادات من ملف config.json إذا كان موجوداً
let config = {
  // معلومات الفندق
  hotelName: 'فندق المضيف',
  location: 'المملكة العربية السعودية',
  phone: '',
  
  // إعدادات الرد التلقائي
  autoReply: {
    enabled: true,
    workingHours: {
      start: 8,  // 8 صباحاً
      end: 23,   // 11 مساءً
    },
    excludedNumbers: [
      // أضف أرقام لا تريد الرد عليها تلقائياً
      // '966501234567@c.us'
    ]
  },
  
  // الغرف والأسعار
  rooms: [
    {
      type: 'standard',
      name: 'غرفة عادية',
      price: 500,
      capacity: 2,
      features: ['WiFi', 'تكييف', 'تلفاز']
    },
    {
      type: 'deluxe',
      name: 'غرفة ديلوكس',
      price: 750,
      capacity: 4,
      features: ['WiFi', 'تكييف', 'تلفاز', 'بلكونة']
    },
    {
      type: 'suite',
      name: 'سويت عائلية',
      price: 1200,
      capacity: 6,
      features: ['غرفتين', 'صالة', 'مطبخ صغير', 'WiFi']
    }
  ],
  
  // الخدمات
  services: [
    { name: 'خدمة الغرف 24/7', description: 'خدمة متاحة على مدار الساعة' },
    { name: 'WiFi مجاني', description: 'إنترنت عالي السرعة' },
    { name: 'مطعم ومقهى', description: 'أطباق متنوعة' },
    { name: 'موقف سيارات', description: 'موقف مجاني وآمن' },
    { name: 'صالة رياضية', description: 'أجهزة حديثة' },
  ],
  
  // ردود مخصصة
  customReplies: [],
  
  // OpenAI (اختياري)
  openai: {
    enabled: false,  // غيّر إلى true إذا أردت استخدام OpenAI
    apiKey: '',      // ضع API Key هنا
    model: 'gpt-4o-mini'
  }
};

// تحميل config من ملف JSON إذا كان موجوداً
const configFile = path.join(__dirname, 'config.json');
if (fs.existsSync(configFile)) {
  try {
    const savedConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    config = { ...config, ...savedConfig };
    console.log('✅ تم تحميل الإعدادات من config.json');
  } catch (error) {
    console.log('⚠️  فشل تحميل config.json، استخدام الإعدادات الافتراضية');
  }
}

// دالة لحفظ الإعدادات
function saveConfig() {
  try {
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    console.log('✅ تم حفظ الإعدادات في config.json');
  } catch (error) {
    console.error('❌ فشل حفظ الإعدادات:', error);
  }
}

// ========================================
// إنشاء WhatsApp Client
// ========================================

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'almodif-crm'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

// ========================================
// Event Handlers
// ========================================

// عند توليد QR Code
client.on('qr', (qr) => {
  console.log('\n'.repeat(3));
  console.log('═'.repeat(60));
  console.log('🤖  WhatsApp Auto-Reply Server - فندق المضيف');
  console.log('═'.repeat(60));
  console.log('\n📱 امسح هذا الـ QR Code من تطبيق WhatsApp في هاتفك:\n');
  console.log('   WhatsApp → الإعدادات → الأجهزة المرتبطة → ربط جهاز\n');
  
  qrcode.generate(qr, { small: true });
  
  console.log('\n' + '═'.repeat(60));
  console.log('⏳ في انتظار المسح...\n');
});

// عند بدء المصادقة
client.on('authenticated', () => {
  console.log('✅ تم المصادقة بنجاح!');
});

// عند فشل المصادقة
client.on('auth_failure', (msg) => {
  console.error('❌ فشلت المصادقة:', msg);
  console.log('💡 حاول حذف مجلد .wwebjs_auth وإعادة المحاولة');
});

// عند الاتصال بنجاح
client.on('ready', () => {
  console.log('\n' + '═'.repeat(60));
  console.log('✅  WhatsApp متصل وجاهز!');
  console.log('═'.repeat(60));
  console.log(`📱 الحساب: ${client.info.pushname}`);
  console.log(`📞 الرقم: ${client.info.wid.user}`);
  console.log(`🤖 الرد التلقائي: ${config.autoReply.enabled ? '✅ مُفعّل' : '❌ مُعطّل'}`);
  console.log(`⏰ ساعات العمل: ${config.autoReply.workingHours.start}:00 - ${config.autoReply.workingHours.end}:00`);
  console.log('═'.repeat(60));
  console.log('\n🎯 النظام جاهز لاستقبال الرسائل...\n');
  
  // حفظ معلومات الاتصال
  saveConnectionInfo({
    connected: true,
    timestamp: new Date().toISOString(),
    number: client.info.wid.user,
    name: client.info.pushname
  });
});

// عند قطع الاتصال
client.on('disconnected', (reason) => {
  console.log('\n⚠️  تم قطع الاتصال:', reason);
  console.log('🔄 حاول إعادة تشغيل السيرفر...\n');
  
  saveConnectionInfo({
    connected: false,
    timestamp: new Date().toISOString(),
    reason: reason
  });
});

// ========================================
// استقبال الرسائل والرد التلقائي
// ========================================

client.on('message', async (msg) => {
  try {
    // معلومات المرسل
    const contact = await msg.getContact();
    const chat = await msg.getChat();
    const senderNumber = msg.from;
    const senderName = contact.pushname || contact.name || senderNumber;
    const messageText = msg.body;
    const timestamp = new Date(msg.timestamp * 1000);
    
    console.log('\n' + '─'.repeat(60));
    console.log(`📩 رسالة جديدة`);
    console.log(`👤 من: ${senderName} (${senderNumber})`);
    console.log(`📝 النص: "${messageText}"`);
    console.log(`🕐 الوقت: ${timestamp.toLocaleString('ar-SA')}`);
    
    // حفظ الرسالة
    saveMessage({
      id: msg.id.id,
      from: senderNumber,
      fromName: senderName,
      message: messageText,
      timestamp: timestamp.toISOString(),
      direction: 'incoming'
    });
    
    // تحقق من شروط الرد التلقائي
    if (!shouldAutoReply(msg, senderNumber)) {
      console.log('⏭️  تم تخطي الرد التلقائي');
      console.log('─'.repeat(60));
      return;
    }
    
    // عرض مؤشر الكتابة
    await chat.sendStateTyping();
    
    // توليد الرد
    const reply = await generateReply(messageText, senderNumber);
    
    // إرسال الرد
    await msg.reply(reply);
    
    console.log(`🤖 تم الرد: "${reply.substring(0, 100)}${reply.length > 100 ? '...' : ''}"`);
    console.log('─'.repeat(60));
    
    // حفظ الرد
    saveMessage({
      id: Date.now().toString(),
      from: 'bot',
      fromName: 'الرد التلقائي',
      message: reply,
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
      isBot: true,
      replyTo: msg.id.id
    });
    
  } catch (error) {
    console.error('❌ خطأ في معالجة الرسالة:', error);
  }
});

// ========================================
// منطق الرد التلقائي
// ========================================

/**
 * تحقق من شروط الرد التلقائي
 */
function shouldAutoReply(msg, senderNumber) {
  // تحقق من تفعيل الرد التلقائي
  if (!config.autoReply.enabled) {
    console.log('ℹ️  الرد التلقائي مُعطّل');
    return false;
  }
  
  // لا ترد على رسائل المجموعات
  if (msg.from.includes('@g.us')) {
    console.log('ℹ️  رسالة مجموعة - لا رد تلقائي');
    return false;
  }
  
  // لا ترد على الرسائل المرسلة منك
  if (msg.fromMe) {
    console.log('ℹ️  رسالة مُرسلة - لا رد تلقائي');
    return false;
  }
  
  // تحقق من الأرقام المستثناة
  if (config.autoReply.excludedNumbers.includes(senderNumber)) {
    console.log('ℹ️  رقم مستثنى - لا رد تلقائي');
    return false;
  }
  
  // تحقق من ساعات العمل
  const currentHour = new Date().getHours();
  const { start, end } = config.autoReply.workingHours;
  
  if (currentHour < start || currentHour >= end) {
    console.log(`ℹ️  خارج ساعات العمل (${start}:00 - ${end}:00)`);
    return false;
  }
  
  return true;
}

/**
 * توليد رد ذكي على الرسالة
 */
async function generateReply(messageText, senderNumber) {
  const text = messageText.toLowerCase().trim();
  
  // إذا كان OpenAI مفعّل
  if (config.openai.enabled && config.openai.apiKey) {
    try {
      return await generateOpenAIReply(messageText, senderNumber);
    } catch (error) {
      console.log('⚠️  فشل OpenAI، استخدام الردود المحلية:', error.message);
      // سنستمر للردود المحلية
    }
  }
  
  // الردود المحلية (Local Rules)
  
  // تحقق من الردود المخصصة أولاً
  if (config.customReplies && config.customReplies.length > 0) {
    for (const reply of config.customReplies) {
      if (text.includes(reply.keyword.toLowerCase())) {
        return reply.response;
      }
    }
  }
  
  // 1. التحية
  if (text.match(/مرحب|سلام|هلا|أهلا|هاي|السلام عليكم/)) {
    return `أهلاً وسهلاً بك في ${config.hotelName}! 🏨

كيف يمكنني مساعدتك اليوم؟

يمكنني مساعدتك في:
• حجز غرفة 🛏️
• الاستفسار عن الأسعار 💰
• معرفة الخدمات المتوفرة ✨
• أي استفسار آخر 💬`;
  }
  
  // 2. الحجز
  if (text.match(/حجز|احجز|أريد غرفة|غرفة|booking/)) {
    let roomsList = '🏨 أنواع الغرف المتاحة:\n\n';
    
    config.rooms.forEach((room, index) => {
      roomsList += `📍 ${room.name}\n`;
      roomsList += `   • سعة: ${room.capacity} ${room.capacity <= 2 ? 'شخصين' : 'أشخاص'}\n`;
      roomsList += `   • السعر: ${room.price} ريال/ليلة\n`;
      roomsList += `   • المرافق: ${room.features.join('، ')}\n`;
      if (index < config.rooms.length - 1) roomsList += '\n';
    });
    
    return `يسعدنا حجز غرفة لك! 🛏️

${roomsList}

أي نوع يناسبك؟ وكم ليلة تحتاج؟ 😊`;
  }
  
  // 3. الأسعار
  if (text.match(/سعر|كم|تكلفة|price|cost/)) {
    let pricesList = '💰 أسعار الغرف:\n\n';
    
    config.rooms.forEach(room => {
      pricesList += `• ${room.name}: ${room.price} ريال/ليلة\n`;
    });
    
    return `${pricesList}
📌 العروض الخاصة:
• 3 ليالي أو أكثر: خصم 10%
• أسبوع كامل: خصم 15%

هل تريد إتمام الحجز؟ 😊`;
  }
  
  // 4. الخدمات
  if (text.match(/خدمات|خدمة|مرافق|facilities|services/)) {
    let servicesList = '✨ خدماتنا المتوفرة:\n\n';
    
    config.services.forEach(service => {
      servicesList += `🔹 ${service.name}\n`;
      servicesList += `   ${service.description}\n\n`;
    });
    
    return `${servicesList}كل هذا من أجل راحتك! 🌟`;
  }
  
  // 5. الموقع
  if (text.match(/موقع|عنوان|وين|مكان|location|address/)) {
    return `📍 موقعنا:

${config.hotelName}
${config.location}

📞 للتواصل:
• واتساب: هذا الرقم
• الهاتف: [رقم الهاتف]

🚗 سهل الوصول من جميع المناطق
🅿️ موقف سيارات مجاني

هل تحتاج مساعدة في الوصول؟ 🗺️`;
  }
  
  // 6. الإلغاء
  if (text.match(/إلغاء|cancel|الغي/)) {
    return `📋 سياسة الإلغاء:

• الإلغاء قبل 24 ساعة: مجاني 100%
• الإلغاء قبل 12 ساعة: رسوم 50%
• الإلغاء بعد ذلك: رسوم كاملة

لإلغاء حجزك، يرجى إرسال:
• رقم الحجز
• اسم العميل

سنساعدك فوراً! 😊`;
  }
  
  // 7. شكر
  if (text.match(/شكر|thanks|thank you|مشكور/)) {
    return `العفو! 😊

سعداء بخدمتك في ${config.hotelName} 🏨

إذا احتجت أي مساعدة أخرى، لا تتردد في التواصل معنا!

نتمنى لك يوماً سعيداً ✨`;
  }
  
  // 8. الرد الافتراضي
  return `مرحباً بك في ${config.hotelName}! 🏨

شكراً لتواصلك معنا. فريقنا سيرد عليك في أقرب وقت ممكن.

في الوقت الحالي، يمكنك:
• الاستفسار عن الحجز
• معرفة الأسعار
• السؤال عن الخدمات

كيف يمكنني مساعدتك؟ 😊`;
}

/**
 * توليد رد باستخدام OpenAI
 */
async function generateOpenAIReply(messageText, senderNumber) {
  // تحميل سجل المحادثة
  const history = loadConversationHistory(senderNumber);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.openai.apiKey}`
    },
    body: JSON.stringify({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: `أنت مساعد ذكي لـ${config.hotelName} في ${config.location}.

دورك:
- الرد بلطف واحترافية
- مساعدة العملاء في الحجوزات
- الإجابة عن الأسعار والخدمات
- التحدث بالعربية الفصحى الواضحة

معلومات الفندق:
- الاسم: ${config.hotelName}
- الموقع: ${config.location}
- أنواع الغرف:
  • غرفة عادية: 500 ريال/ليلة (2 أشخاص)
  • غرفة ديلوكس: 750 ريال/ليلة (4 أشخاص)
  • سويت: 1200 ريال/ليلة (6 أشخاص)
- الخدمات: WiFi، مطعم، مغسلة، موقف، خدمة 24/7

قواعد:
- كن مختصراً (3-5 أسطر)
- استخدم emojis بشكل معتدل
- اختم بسؤال أو عرض مساعدة`
        },
        ...history,
        { role: 'user', content: messageText }
      ],
      temperature: 0.7,
      max_tokens: 300
    })
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API Error: ${response.status}`);
  }
  
  const data = await response.json();
  const reply = data.choices[0].message.content.trim();
  
  // حفظ في سجل المحادثة
  saveConversationHistory(senderNumber, messageText, reply);
  
  return reply;
}

// ========================================
// إدارة البيانات
// ========================================

const DATA_DIR = path.join(__dirname, 'whatsapp-data');

// إنشاء مجلد البيانات
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * حفظ رسالة
 */
function saveMessage(message) {
  const messagesFile = path.join(DATA_DIR, 'messages.json');
  let messages = [];
  
  if (fs.existsSync(messagesFile)) {
    const data = fs.readFileSync(messagesFile, 'utf8');
    messages = JSON.parse(data);
  }
  
  messages.push(message);
  
  // احتفظ بآخر 1000 رسالة فقط
  if (messages.length > 1000) {
    messages = messages.slice(-1000);
  }
  
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

/**
 * حفظ معلومات الاتصال
 */
function saveConnectionInfo(info) {
  const infoFile = path.join(DATA_DIR, 'connection-info.json');
  fs.writeFileSync(infoFile, JSON.stringify(info, null, 2));
}

/**
 * تحميل سجل المحادثة لرقم معين
 */
function loadConversationHistory(senderNumber) {
  const messagesFile = path.join(DATA_DIR, 'messages.json');
  
  if (!fs.existsSync(messagesFile)) {
    return [];
  }
  
  const data = fs.readFileSync(messagesFile, 'utf8');
  const allMessages = JSON.parse(data);
  
  // استخراج آخر 5 رسائل من/إلى هذا الرقم
  const contactMessages = allMessages
    .filter(m => m.from === senderNumber || m.replyTo)
    .slice(-5);
  
  return contactMessages.map(m => ({
    role: m.direction === 'incoming' ? 'user' : 'assistant',
    content: m.message
  }));
}

/**
 * حفظ في سجل المحادثة
 */
function saveConversationHistory(senderNumber, userMessage, botReply) {
  // يتم حفظه تلقائياً في saveMessage
  // هذه الدالة للتوافق فقط
}

// ========================================
// بدء السيرفر
// ========================================

console.log('\n🚀 بدء تشغيل WhatsApp Server...\n');

client.initialize();

// معالجة إشارات التوقف
process.on('SIGINT', async () => {
  console.log('\n\n⏹️  إيقاف السيرفر...');
  await client.destroy();
  console.log('✅ تم الإيقاف بنجاح\n');
  process.exit(0);
});

// ========================================
// HTTP Server (اختياري) للمراقبة
// ========================================

const http = require('http');

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/status') {
    const status = {
      connected: client.info ? true : false,
      number: client.info?.wid?.user || null,
      name: client.info?.pushname || null,
      timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status, null, 2));
  } else if (req.url === '/config' && req.method === 'GET') {
    // إرجاع الإعدادات الحالية
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(config, null, 2));
  } else if (req.url === '/config' && req.method === 'POST') {
    // تحديث الإعدادات
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const newConfig = JSON.parse(body);
        config = { ...config, ...newConfig };
        saveConfig();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'تم تحديث الإعدادات بنجاح' }));
        
        console.log('✅ تم تحديث الإعدادات من Dashboard');
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>WhatsApp Auto-Reply Server</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }
          h1 { margin-top: 0; }
          .status {
            background: rgba(255, 255, 255, 0.2);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
          }
          .btn {
            background: white;
            color: #667eea;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 5px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🤖 WhatsApp Auto-Reply Server</h1>
          <h2>${config.hotelName}</h2>
          
          <div class="status" id="status">
            <p>⏳ جاري التحقق من الحالة...</p>
          </div>
          
          <button class="btn" onclick="checkStatus()">🔄 تحديث</button>
          <button class="btn" onclick="window.location.href='/status'">📊 JSON Status</button>
        </div>
        
        <script>
          async function checkStatus() {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = '<p>⏳ جاري التحقق...</p>';
            
            try {
              const res = await fetch('/status');
              const data = await res.json();
              
              if (data.connected) {
                statusDiv.innerHTML = \`
                  <p><strong>✅ متصل</strong></p>
                  <p>📞 الرقم: \${data.number}</p>
                  <p>👤 الاسم: \${data.name}</p>
                  <p>🕐 آخر تحديث: \${new Date(data.timestamp).toLocaleString('ar-SA')}</p>
                \`;
              } else {
                statusDiv.innerHTML = '<p><strong>❌ غير متصل</strong></p>';
              }
            } catch (error) {
              statusDiv.innerHTML = '<p><strong>⚠️ خطأ في التحقق</strong></p>';
            }
          }
          
          // تحديث تلقائي كل 5 ثواني
          setInterval(checkStatus, 5000);
          checkStatus();
        </script>
      </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🌐 HTTP Server running on http://localhost:${PORT}`);
  console.log(`📊 Status page: http://localhost:${PORT}/status\n`);
});
