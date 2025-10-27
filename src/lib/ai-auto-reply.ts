// خدمة الرد التلقائي بالذكاء الاصطناعي المتقدم
// يدعم: OpenAI API, Local Rules Fallback, إعدادات متقدمة
// يعمل تلقائياً في الخلفية ويرسل ردود ذكية على رسائل WhatsApp

// Minimal message type used by the auto-reply service (keeps it local to avoid cross-import issues)
interface WhatsAppMessage {
  id: string;
  contactId: string;
  message: string;
  status?: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
  employeeId?: string;
  employeeName?: string;
  aiGenerated?: boolean;
  [key: string]: any;
}

// AI Configuration Interface
export interface AIConfig {
  mode: 'off' | 'local' | 'openai'; // وضع التشغيل
  openaiApiKey?: string;
  openaiModel?: string; // مثل gpt-4, gpt-3.5-turbo
  temperature?: number; // 0-1
  maxTokens?: number;
  systemPrompt?: string;
  enabledHours?: { start: number; end: number }; // ساعات العمل
  excludedContacts?: string[]; // جهات اتصال مستثناة
  autoApprove?: boolean; // موافقة تلقائية على الطلبات
}

const STORAGE_MESSAGES_KEY = 'whatsapp_messages';
const STORAGE_ENABLED_KEY = 'ai_auto_reply_enabled';
const STORAGE_LAST_KEY = 'ai_last_processed';
const STORAGE_CONFIG_KEY = 'ai_config';
const STORAGE_MODE_KEY = 'ai_mode'; // off, local, openai

type LastProcessedMap = Record<string, number>; // contactId -> timestamp

// Default configuration
const DEFAULT_CONFIG: AIConfig = {
  mode: 'local',
  openaiModel: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 500,
  systemPrompt: `أنت مساعد ذكي لفندق Smart Host. مهمتك:
- الرد على استفسارات العملاء بلطف واحترافية
- تقديم معلومات عن الحجوزات والأسعار والخدمات
- حل المشاكل والشكاوى بفعالية
- استخدام الإيموجي بشكل مناسب
- الرد بالعربية دائماً

الأسعار:
- غرفة ستاندرد: 500 ريال/ليلة
- غرفة ديلوكس: 750 ريال/ليلة  
- سويت: 1200 ريال/ليلة

خدماتنا: واي فاي مجاني، كوفي شوب، مطعم، خدمة الغرف 24/7، مغسلة`,
  enabledHours: { start: 0, end: 24 }, // 24/7
  excludedContacts: [],
  autoApprove: false
};

// Get AI Configuration
export function getAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

// Save AI Configuration
export function saveAIConfig(config: Partial<AIConfig>) {
  try {
    const current = getAIConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(updated));
    console.log('✅ AI Config saved:', updated);
  } catch (e) {
    console.error('❌ Failed to save AI config:', e);
  }
}

// Get current AI mode
export function getAIMode(): 'off' | 'local' | 'openai' {
  const config = getAIConfig();
  return config.mode || 'off';
}

// Set AI mode
export function setAIMode(mode: 'off' | 'local' | 'openai') {
  saveAIConfig({ mode });
  if (mode === 'off') {
    stopProcessing();
  } else {
    startProcessing();
  }
}

function readMessages(): WhatsAppMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('AI AutoReply: failed to read messages', e);
    return [];
  }
}

function writeMessages(messages: WhatsAppMessage[]) {
  try {
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
    // notify other tabs
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('AI AutoReply: failed to write messages', e);
  }
}

function readLastProcessed(): LastProcessedMap {
  try {
    const raw = localStorage.getItem(STORAGE_LAST_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLastProcessed(map: LastProcessedMap) {
  try {
    localStorage.setItem(STORAGE_LAST_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('AI AutoReply: failed to write last processed', e);
  }
}

function simpleGenerateResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('حجز') || lower.includes('غرفة')) return '🏨 يسعدنا مساعدتك بالحجز. ما تواريخ الإقامة المطلوبة؟';
  if (lower.includes('سعر') || lower.includes('كم')) return '💰 الأسعار تبدأ من 500 ريال للستاندرد. هل تريد عرض الأقسام المتاحة؟';
  if (lower.includes('شكوى') || lower.includes('مشكلة')) return '😔 نأسف لحدوث ذلك، هل يمكنك تزويدنا بتفاصيل المشكلة والوقت؟';
  if (lower.includes('واي') || lower.includes('wifi') || lower.includes('انترنت')) return '📶 الشبكة: SmartHost_Guest \nكلمة المرور: Welcome2024';
  if (lower.includes('شكرا') || lower.includes('تسلم')) return '🙏 العفو! نحن دائماً في الخدمة.';
  return '👋 أهلاً! كيف أستطيع مساعدتك اليوم؟ يمكنك طلب الحجز، الأسعار أو الدعم.';
}

// OpenAI API Call with error handling
async function generateOpenAIResponse(userMessage: string, conversationHistory: WhatsAppMessage[] = []): Promise<string> {
  const config = getAIConfig();
  
  if (!config.openaiApiKey) {
    console.warn('⚠️ OpenAI API key not configured, falling back to local');
    return simpleGenerateResponse(userMessage);
  }

  try {
    // Build conversation context (last 5 messages for context)
    const recentMessages = conversationHistory.slice(-5).map(msg => ({
      role: msg.direction === 'incoming' ? 'user' : 'assistant',
      content: msg.message
    }));

    const messages = [
      { role: 'system', content: config.systemPrompt || DEFAULT_CONFIG.systemPrompt },
      ...recentMessages,
      { role: 'user', content: userMessage }
    ];

    console.log('🤖 Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiApiKey}`
      },
      body: JSON.stringify({
        model: config.openaiModel || 'gpt-4o-mini',
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ OpenAI API error:', response.status, errorData);
      
      // Handle specific errors
      if (response.status === 401) {
        console.error('❌ Invalid API Key');
        return '⚠️ خطأ في مفتاح OpenAI. يرجى التحقق من الإعدادات.';
      }
      if (response.status === 429) {
        console.warn('⚠️ Rate limit exceeded, falling back to local');
        return simpleGenerateResponse(userMessage);
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    if (!aiResponse) {
      console.warn('⚠️ Empty response from OpenAI, falling back to local');
      return simpleGenerateResponse(userMessage);
    }

    console.log('✅ OpenAI response received');
    return aiResponse;

  } catch (error) {
    console.error('❌ OpenAI generation failed:', error);
    console.log('⤵️ Falling back to local rules');
    return simpleGenerateResponse(userMessage);
  }
}

// Check if within working hours
function isWithinWorkingHours(): boolean {
  const config = getAIConfig();
  if (!config.enabledHours) return true;
  
  const now = new Date();
  const currentHour = now.getHours();
  const { start, end } = config.enabledHours;
  
  if (start <= end) {
    return currentHour >= start && currentHour < end;
  } else {
    // Handles overnight shifts (e.g., 22-6)
    return currentHour >= start || currentHour < end;
  }
}

// Check if contact is excluded
function isContactExcluded(contactId: string): boolean {
  const config = getAIConfig();
  return config.excludedContacts?.includes(contactId) || false;
}

let intervalId: number | null = null;

export function enableAutoReply() {
  localStorage.setItem(STORAGE_ENABLED_KEY, '1');
  startProcessing();
}

export function disableAutoReply() {
  localStorage.removeItem(STORAGE_ENABLED_KEY);
  stopProcessing();
}

export function isAutoReplyEnabled(): boolean {
  return !!localStorage.getItem(STORAGE_ENABLED_KEY);
}

function startProcessing() {
  if (intervalId) return;

  intervalId = window.setInterval(async () => {
    try {
      const config = getAIConfig();
      const mode = config.mode;
      
      // Skip if mode is off
      if (mode === 'off') {
        stopProcessing();
        return;
      }

      // Check working hours
      if (!isWithinWorkingHours()) {
        console.log('⏰ Outside working hours, skipping AI replies');
        return;
      }

      const messages = readMessages();
      const lastMap = readLastProcessed();

      // Find incoming messages per contact after last processed
      const incoming = messages.filter(m => m.direction === 'incoming');
      const contactsToProcess = new Map<string, WhatsAppMessage>();

      // Get the latest incoming message per contact
      incoming.forEach(msg => {
        const lastTs = lastMap[msg.contactId] || 0;
        const msgTs = new Date(msg.timestamp).getTime();
        
        if (msgTs > lastTs && !isContactExcluded(msg.contactId)) {
          const existing = contactsToProcess.get(msg.contactId);
          if (!existing || msgTs > new Date(existing.timestamp).getTime()) {
            contactsToProcess.set(msg.contactId, msg);
          }
        }
      });

      if (contactsToProcess.size === 0) return;

      console.log(`🔄 Processing ${contactsToProcess.size} new messages...`);
      const replies: WhatsAppMessage[] = [];

      // Process each contact's latest message
      for (const [contactId, msg] of contactsToProcess) {
        try {
          // Get conversation history for context
          const conversationHistory = messages
            .filter(m => m.contactId === contactId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          let replyText: string;

          // Generate reply based on mode
          if (mode === 'openai') {
            console.log(`🤖 Using OpenAI for contact ${contactId}`);
            replyText = await generateOpenAIResponse(msg.message, conversationHistory);
          } else {
            console.log(`📝 Using local rules for contact ${contactId}`);
            replyText = simpleGenerateResponse(msg.message);
          }

          const reply: WhatsAppMessage = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            contactId: msg.contactId,
            message: replyText,
            status: 'sent',
            timestamp: new Date().toISOString(),
            direction: 'outgoing',
            employeeId: 'ai_bot',
            employeeName: mode === 'openai' ? 'AI Assistant (GPT)' : 'المساعد الذكي',
            aiGenerated: true
          };
          
          replies.push(reply);
          lastMap[msg.contactId] = new Date(msg.timestamp).getTime();
          
          // Small delay between OpenAI calls to avoid rate limits
          if (mode === 'openai') {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`❌ Error processing message for ${contactId}:`, error);
        }
      }

      if (replies.length > 0) {
        const newMessages = [...messages, ...replies];
        writeMessages(newMessages);
        writeLastProcessed(lastMap);
        console.log(`✅ Sent ${replies.length} AI replies (mode: ${mode})`);
      }
    } catch (e) {
      console.error('❌ AI AutoReply interval error:', e);
    }
  }, 3000); // Check every 3 seconds
}

function stopProcessing() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Start automatically if enabled
if (typeof window !== 'undefined' && isAutoReplyEnabled()) {
  startProcessing();
}

export default {
  enableAutoReply,
  disableAutoReply,
  isAutoReplyEnabled,
  getAIConfig,
  saveAIConfig,
  getAIMode,
  setAIMode,
  startProcessing,
  stopProcessing
};
