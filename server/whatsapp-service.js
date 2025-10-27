const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

let client;
let qrCodeData = null;
let isReady = false;
let currentPhoneNumber = null;

// تهيئة عميل WhatsApp
function initializeWhatsAppClient() {
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'almodif-whatsapp',
      dataPath: './whatsapp-data'
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

  // عند توليد QR Code
  client.on('qr', async (qr) => {
    console.log('📱 QR Code Generated');
    try {
      qrCodeData = await qrcode.toDataURL(qr);
      io.emit('qr', { qr: qrCodeData });
    } catch (err) {
      console.error('خطأ في توليد QR:', err);
    }
  });

  // عند نجاح المصادقة
  client.on('authenticated', () => {
    console.log('✅ Authenticated');
    qrCodeData = null;
    io.emit('authenticated');
  });

  // عند الجاهزية
  client.on('ready', async () => {
    console.log('🚀 WhatsApp Client is ready!');
    isReady = true;
    
    const info = client.info;
    currentPhoneNumber = info.wid.user;
    
    io.emit('ready', { 
      phoneNumber: currentPhoneNumber,
      name: info.pushname 
    });
  });

  // عند استلام رسالة
  client.on('message', async (message) => {
    console.log('📨 Message received:', message.from);
    
    const chat = await message.getChat();
    const contact = await message.getContact();
    
    io.emit('message', {
      id: message.id.id,
      from: message.from,
      to: message.to,
      body: message.body,
      timestamp: message.timestamp,
      hasMedia: message.hasMedia,
      type: message.type,
      chatName: chat.name,
      contactName: contact.name || contact.pushname,
      isGroup: chat.isGroup
    });
  });

  // عند قطع الاتصال
  client.on('disconnected', (reason) => {
    console.log('❌ Client was logged out:', reason);
    isReady = false;
    currentPhoneNumber = null;
    io.emit('disconnected', { reason });
  });

  // بدء العميل
  client.initialize();
}

// API Endpoints

// الحصول على حالة الاتصال
app.get('/api/status', (req, res) => {
  res.json({
    connected: isReady,
    phoneNumber: currentPhoneNumber,
    needsQR: !isReady && qrCodeData !== null
  });
});

// الحصول على QR Code
app.get('/api/qr', (req, res) => {
  if (qrCodeData) {
    res.json({ qr: qrCodeData });
  } else if (isReady) {
    res.json({ error: 'Already connected', connected: true });
  } else {
    res.json({ error: 'QR not ready yet', qr: null });
  }
});

// الحصول على جميع المحادثات
app.get('/api/chats', async (req, res) => {
  if (!isReady) {
    return res.status(503).json({ error: 'WhatsApp not connected' });
  }

  try {
    const chats = await client.getChats();
    const chatList = await Promise.all(
      chats.map(async (chat) => {
        const contact = await chat.getContact();
        const lastMessage = chat.lastMessage;
        
        return {
          id: chat.id._serialized,
          name: chat.name || contact.name || contact.pushname || chat.id.user,
          isGroup: chat.isGroup,
          unreadCount: chat.unreadCount,
          timestamp: chat.timestamp,
          lastMessage: lastMessage ? {
            body: lastMessage.body,
            timestamp: lastMessage.timestamp,
            fromMe: lastMessage.fromMe
          } : null,
          profilePicUrl: await contact.getProfilePicUrl().catch(() => null)
        };
      })
    );

    // ترتيب حسب آخر رسالة
    chatList.sort((a, b) => b.timestamp - a.timestamp);
    
    res.json({ chats: chatList });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// الحصول على رسائل محادثة معينة
app.get('/api/messages/:chatId', async (req, res) => {
  if (!isReady) {
    return res.status(503).json({ error: 'WhatsApp not connected' });
  }

  try {
    const chat = await client.getChatById(req.params.chatId);
    const messages = await chat.fetchMessages({ limit: 50 });
    
    const messageList = messages.map(msg => ({
      id: msg.id.id,
      body: msg.body,
      timestamp: msg.timestamp,
      fromMe: msg.fromMe,
      hasMedia: msg.hasMedia,
      type: msg.type,
      ack: msg.ack
    }));
    
    res.json({ messages: messageList });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// إرسال رسالة (فقط للمحادثات التي راسلتك أولاً)
app.post('/api/send', async (req, res) => {
  if (!isReady) {
    return res.status(503).json({ error: 'WhatsApp not connected' });
  }

  const { chatId, message } = req.body;

  if (!chatId || !message) {
    return res.status(400).json({ error: 'Missing chatId or message' });
  }

  try {
    // التحقق من أن المحادثة موجودة (أي العميل راسل أولاً)
    const chat = await client.getChatById(chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // إرسال الرسالة
    const sentMessage = await chat.sendMessage(message);
    
    res.json({ 
      success: true, 
      messageId: sentMessage.id.id,
      timestamp: sentMessage.timestamp
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// قطع الاتصال
app.post('/api/disconnect', async (req, res) => {
  if (!client) {
    return res.json({ success: true, message: 'Already disconnected' });
  }

  try {
    await client.logout();
    isReady = false;
    currentPhoneNumber = null;
    qrCodeData = null;
    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

// Socket.IO للتحديثات الفورية
io.on('connection', (socket) => {
  console.log('👤 Client connected:', socket.id);
  
  // إرسال الحالة الحالية
  socket.emit('status', {
    connected: isReady,
    phoneNumber: currentPhoneNumber,
    qr: qrCodeData
  });

  socket.on('disconnect', () => {
    console.log('👤 Client disconnected:', socket.id);
  });
});

// بدء الخادم
const PORT = process.env.WHATSAPP_PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 WhatsApp Service running on port ${PORT}`);
  initializeWhatsAppClient();
});
