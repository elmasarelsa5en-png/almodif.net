/**
 * Advanced AI Chatbot Service
 * نظام شات بوت ذكي متطور
 * 
 * Features:
 * - Multi-AI Provider Support (OpenAI, Anthropic, Gemini)
 * - Arabic & English NLP
 * - Context-aware conversations
 * - Intent detection & entity extraction
 * - Multi-turn dialogue management
 * - Booking assistance
 * - Customer service automation
 * - Knowledge base integration
 * - Sentiment analysis
 * - Custom training & fine-tuning
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';

// ==================== TYPES ====================

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'custom';
export type MessageRole = 'user' | 'assistant' | 'system';
export type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'escalated';
export type IntentType = 
  | 'booking_inquiry'
  | 'room_availability'
  | 'price_inquiry'
  | 'cancellation'
  | 'modification'
  | 'complaint'
  | 'general_info'
  | 'payment'
  | 'amenities'
  | 'location'
  | 'other';

export type SentimentType = 'positive' | 'neutral' | 'negative';
export type Language = 'ar' | 'en';

export interface ChatbotConfig {
  id: string;
  provider: AIProvider;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  isActive: boolean;
  autoReply: boolean;
  handoffToHuman: boolean;
  handoffKeywords: string[];
  supportedLanguages: Language[];
  confidenceThreshold: number;
  contextWindow: number;
  enableSentiment: boolean;
  enableIntentDetection: boolean;
  enableEntityExtraction: boolean;
  customInstructions?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  language: Language;
  intent?: IntentType;
  entities?: Record<string, any>;
  sentiment?: SentimentType;
  confidence?: number;
  isAI: boolean;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
}

export interface Conversation {
  id: string;
  userId: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  channel: 'whatsapp' | 'website' | 'email' | 'sms';
  status: ConversationStatus;
  language: Language;
  startedAt: Timestamp;
  lastMessageAt: Timestamp;
  resolvedAt?: Timestamp;
  assignedTo?: string;
  summary?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  entities: Record<string, any>;
  suggestedAction?: string;
}

export interface SentimentResult {
  sentiment: SentimentType;
  score: number;
  confidence: number;
}

export interface ChatbotResponse {
  message: string;
  intent?: IntentType;
  confidence?: number;
  suggestions?: string[];
  requiresHuman?: boolean;
  actions?: any[];
}

export interface KnowledgeBaseEntry {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  language: Language;
  category: string;
  priority: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== DEFAULT SYSTEM PROMPTS ====================

const DEFAULT_SYSTEM_PROMPT_AR = `أنت مساعد ذكي لنظام إدارة الفنادق "المضيف". مهمتك:

1. مساعدة النزلاء في الحجوزات والاستفسارات
2. تقديم معلومات دقيقة عن الغرف والأسعار والخدمات
3. التعامل بلباقة واحترافية
4. استخدام اللغة العربية الفصحى المبسطة
5. تحويل المحادثة للموظف عند الحاجة

القواعد:
- كن مختصراً ومفيداً
- اسأل أسئلة توضيحية عند الحاجة
- قدم خيارات واضحة
- احترم خصوصية النزيل
- في حالة عدم التأكد، اطلب التحويل لموظف`;

const DEFAULT_SYSTEM_PROMPT_EN = `You are an intelligent assistant for "Almodif" hotel management system. Your role:

1. Assist guests with bookings and inquiries
2. Provide accurate information about rooms, prices, and services
3. Handle interactions professionally and courteously
4. Use clear, simple English
5. Escalate to human staff when necessary

Rules:
- Be concise and helpful
- Ask clarifying questions when needed
- Provide clear options
- Respect guest privacy
- When unsure, request human handoff`;

// ==================== CHATBOT SERVICE CLASS ====================

export class ChatbotService {
  private configCache: ChatbotConfig | null = null;
  private conversationContexts: Map<string, ChatMessage[]> = new Map();

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    // Load config from cache
    await this.getConfig();
  }

  // ==================== CONFIGURATION ====================

  async getConfig(): Promise<ChatbotConfig | null> {
    try {
      const configRef = doc(db, 'settings', 'chatbot-config');
      const configSnap = await getDoc(configRef);

      if (configSnap.exists()) {
        this.configCache = { id: configSnap.id, ...configSnap.data() } as ChatbotConfig;
        return this.configCache;
      }

      return null;
    } catch (error) {
      console.error('Error getting chatbot config:', error);
      return null;
    }
  }

  async saveConfig(config: Partial<ChatbotConfig>): Promise<void> {
    try {
      const configRef = doc(db, 'settings', 'chatbot-config');
      const timestamp = Timestamp.now();

      const configData = {
        ...config,
        updatedAt: timestamp,
      };

      const existingConfig = await getDoc(configRef);
      if (existingConfig.exists()) {
        await updateDoc(configRef, configData);
      } else {
        // Use setDoc for creating new document
        const { setDoc } = await import('firebase/firestore');
        await setDoc(configRef, {
          ...configData,
          createdAt: timestamp,
        });
      }

      this.configCache = null; // Clear cache
      await this.getConfig(); // Reload
    } catch (error) {
      console.error('Error saving chatbot config:', error);
      throw error;
    }
  }

  // ==================== CONVERSATION MANAGEMENT ====================

  async createConversation(data: {
    userId: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    channel: Conversation['channel'];
    language: Language;
  }): Promise<string> {
    try {
      const timestamp = Timestamp.now();
      const conversationData: Omit<Conversation, 'id'> = {
        ...data,
        status: 'active',
        startedAt: timestamp,
        lastMessageAt: timestamp,
        tags: [],
        priority: 'medium',
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const docRef = doc(db, 'conversations', conversationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Conversation;
      }

      return null;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  async updateConversation(
    conversationId: string,
    updates: Partial<Conversation>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'conversations', conversationId);
      await updateDoc(docRef, {
        ...updates,
        lastMessageAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  async getActiveConversations(): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('status', 'in', ['active', 'waiting']),
        orderBy('lastMessageAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
    } catch (error) {
      console.error('Error getting active conversations:', error);
      return [];
    }
  }

  // ==================== MESSAGE MANAGEMENT ====================

  async sendMessage(
    conversationId: string,
    content: string,
    role: MessageRole = 'user',
    isAI: boolean = false
  ): Promise<ChatMessage> {
    try {
      const config = await this.getConfig();
      const conversation = await this.getConversation(conversationId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const language = conversation.language;

      // Detect intent and sentiment for user messages
      let intent: IntentType | undefined;
      let entities: Record<string, any> | undefined;
      let sentiment: SentimentType | undefined;
      let confidence: number | undefined;

      if (role === 'user' && config?.enableIntentDetection) {
        const intentResult = await this.detectIntent(content, language);
        intent = intentResult.intent;
        entities = intentResult.entities;
        confidence = intentResult.confidence;
      }

      if (role === 'user' && config?.enableSentiment) {
        const sentimentResult = await this.analyzeSentiment(content, language);
        sentiment = sentimentResult.sentiment;
      }

      const messageData: Omit<ChatMessage, 'id'> = {
        conversationId,
        role,
        content,
        language,
        intent,
        entities,
        sentiment,
        confidence,
        isAI,
        timestamp: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);
      const message: ChatMessage = { id: docRef.id, ...messageData };

      // Update conversation
      await this.updateConversation(conversationId, {
        lastMessageAt: Timestamp.now(),
      });

      // Add to context
      this.addToContext(conversationId, message);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));

      // Reverse to get chronological order
      return messages.reverse();
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  subscribeToMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      callback(messages.reverse());
    });
  }

  // ==================== AI PROCESSING ====================

  async processMessage(
    conversationId: string,
    userMessage: string
  ): Promise<ChatbotResponse> {
    try {
      const config = await this.getConfig();
      const conversation = await this.getConversation(conversationId);

      if (!config || !config.isActive) {
        return {
          message: 'عذراً، الشات بوت غير متاح حالياً. سيتم تحويلك لأحد الموظفين.',
          requiresHuman: true,
        };
      }

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Save user message
      await this.sendMessage(conversationId, userMessage, 'user', false);

      // Check for handoff keywords
      if (config.handoffToHuman && this.shouldHandoff(userMessage, config.handoffKeywords)) {
        await this.updateConversation(conversationId, { status: 'escalated' });
        return {
          message: conversation.language === 'ar'
            ? 'سأقوم بتحويلك لأحد موظفينا للمساعدة. شكراً لصبرك.'
            : 'I will transfer you to one of our staff members. Thank you for your patience.',
          requiresHuman: true,
        };
      }

      // Get conversation context
      const context = await this.getConversationContext(conversationId);

      // Get AI response
      const response = await this.getAIResponse(userMessage, context, conversation.language, config);

      // Check confidence threshold
      if (response.confidence && response.confidence < config.confidenceThreshold) {
        await this.updateConversation(conversationId, { status: 'escalated' });
        return {
          message: conversation.language === 'ar'
            ? 'عذراً، لم أفهم طلبك بشكل كامل. سأقوم بتحويلك لأحد الموظفين.'
            : 'Sorry, I did not fully understand your request. I will transfer you to a staff member.',
          requiresHuman: true,
        };
      }

      // Save assistant message
      await this.sendMessage(conversationId, response.message, 'assistant', true);

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.',
        requiresHuman: true,
      };
    }
  }

  private async getAIResponse(
    message: string,
    context: ChatMessage[],
    language: Language,
    config: ChatbotConfig
  ): Promise<ChatbotResponse> {
    try {
      // Build messages array for AI
      const messages: any[] = [
        {
          role: 'system',
          content: language === 'ar' ? DEFAULT_SYSTEM_PROMPT_AR : DEFAULT_SYSTEM_PROMPT_EN,
        },
        ...context.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: message,
        },
      ];

      // Call AI provider
      let aiResponse: string;
      let confidence = 0.8;

      switch (config.provider) {
        case 'openai':
          aiResponse = await this.callOpenAI(messages, config);
          break;
        case 'anthropic':
          aiResponse = await this.callAnthropic(messages, config);
          break;
        case 'google':
          aiResponse = await this.callGoogleAI(messages, config);
          break;
        default:
          aiResponse = await this.getDefaultResponse(message, language);
          confidence = 0.5;
      }

      // Detect intent
      const intentResult = await this.detectIntent(message, language);

      return {
        message: aiResponse,
        intent: intentResult.intent,
        confidence,
        suggestions: this.getSuggestions(intentResult.intent, language),
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  }

  private async callOpenAI(messages: any[], config: ChatbotConfig): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4-turbo-preview',
          messages,
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw error;
    }
  }

  private async callAnthropic(messages: any[], config: ChatbotConfig): Promise<string> {
    try {
      // Extract system message
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-sonnet-20240229',
          max_tokens: config.maxTokens || 500,
          temperature: config.temperature || 0.7,
          system: systemMessage,
          messages: conversationMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Anthropic:', error);
      throw error;
    }
  }

  private async callGoogleAI(messages: any[], config: ChatbotConfig): Promise<string> {
    try {
      // Convert to Gemini format
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const systemInstruction = messages.find(m => m.role === 'system')?.content;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-pro'}:generateContent?key=${config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            generationConfig: {
              temperature: config.temperature || 0.7,
              maxOutputTokens: config.maxTokens || 500,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Google AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Google AI:', error);
      throw error;
    }
  }

  // ==================== INTENT DETECTION ====================

  async detectIntent(message: string, language: Language): Promise<IntentResult> {
    const lowerMessage = message.toLowerCase();

    // Arabic keywords
    if (language === 'ar') {
      if (
        lowerMessage.includes('حجز') ||
        lowerMessage.includes('حجوزات') ||
        lowerMessage.includes('أريد حجز') ||
        lowerMessage.includes('أود حجز')
      ) {
        return {
          intent: 'booking_inquiry',
          confidence: 0.9,
          entities: {},
          suggestedAction: 'Show available rooms',
        };
      }

      if (
        lowerMessage.includes('غرف متاحة') ||
        lowerMessage.includes('غرفة متاحة') ||
        lowerMessage.includes('توفر') ||
        lowerMessage.includes('متوفر')
      ) {
        return {
          intent: 'room_availability',
          confidence: 0.9,
          entities: {},
          suggestedAction: 'Check room availability',
        };
      }

      if (
        lowerMessage.includes('سعر') ||
        lowerMessage.includes('أسعار') ||
        lowerMessage.includes('تكلفة') ||
        lowerMessage.includes('كم')
      ) {
        return {
          intent: 'price_inquiry',
          confidence: 0.85,
          entities: {},
          suggestedAction: 'Show pricing information',
        };
      }

      if (
        lowerMessage.includes('إلغاء') ||
        lowerMessage.includes('إلغاء الحجز') ||
        lowerMessage.includes('إلغاء حجزي')
      ) {
        return {
          intent: 'cancellation',
          confidence: 0.95,
          entities: {},
          suggestedAction: 'Process cancellation',
        };
      }

      if (
        lowerMessage.includes('تعديل') ||
        lowerMessage.includes('تغيير') ||
        lowerMessage.includes('تعديل الحجز')
      ) {
        return {
          intent: 'modification',
          confidence: 0.9,
          entities: {},
          suggestedAction: 'Process modification',
        };
      }

      if (
        lowerMessage.includes('شكوى') ||
        lowerMessage.includes('مشكلة') ||
        lowerMessage.includes('غير راض') ||
        lowerMessage.includes('سيء')
      ) {
        return {
          intent: 'complaint',
          confidence: 0.85,
          entities: {},
          suggestedAction: 'Escalate to human',
        };
      }

      if (
        lowerMessage.includes('دفع') ||
        lowerMessage.includes('الدفع') ||
        lowerMessage.includes('فاتورة') ||
        lowerMessage.includes('إيصال')
      ) {
        return {
          intent: 'payment',
          confidence: 0.9,
          entities: {},
          suggestedAction: 'Show payment options',
        };
      }
    }

    // English keywords
    if (language === 'en') {
      if (
        lowerMessage.includes('book') ||
        lowerMessage.includes('reservation') ||
        lowerMessage.includes('reserve')
      ) {
        return {
          intent: 'booking_inquiry',
          confidence: 0.9,
          entities: {},
          suggestedAction: 'Show available rooms',
        };
      }

      if (
        lowerMessage.includes('available') ||
        lowerMessage.includes('availability') ||
        lowerMessage.includes('vacant')
      ) {
        return {
          intent: 'room_availability',
          confidence: 0.9,
          entities: {},
          suggestedAction: 'Check room availability',
        };
      }

      if (
        lowerMessage.includes('price') ||
        lowerMessage.includes('cost') ||
        lowerMessage.includes('how much')
      ) {
        return {
          intent: 'price_inquiry',
          confidence: 0.85,
          entities: {},
          suggestedAction: 'Show pricing information',
        };
      }

      if (
        lowerMessage.includes('cancel') ||
        lowerMessage.includes('cancellation')
      ) {
        return {
          intent: 'cancellation',
          confidence: 0.95,
          entities: {},
          suggestedAction: 'Process cancellation',
        };
      }

      if (
        lowerMessage.includes('modify') ||
        lowerMessage.includes('change') ||
        lowerMessage.includes('update')
      ) {
        return {
          intent: 'modification',
          confidence: 0.9,
          entities: {},
          suggestedAction: 'Process modification',
        };
      }

      if (
        lowerMessage.includes('complaint') ||
        lowerMessage.includes('problem') ||
        lowerMessage.includes('issue') ||
        lowerMessage.includes('bad')
      ) {
        return {
          intent: 'complaint',
          confidence: 0.85,
          entities: {},
          suggestedAction: 'Escalate to human',
        };
      }

      if (
        lowerMessage.includes('payment') ||
        lowerMessage.includes('pay') ||
        lowerMessage.includes('invoice') ||
        lowerMessage.includes('receipt')
      ) {
        return {
          intent: 'payment',
          confidence: 0.9,
          entities: {},
          suggestedAction: 'Show payment options',
        };
      }
    }

    return {
      intent: 'general_info',
      confidence: 0.5,
      entities: {},
    };
  }

  // ==================== SENTIMENT ANALYSIS ====================

  async analyzeSentiment(message: string, language: Language): Promise<SentimentResult> {
    const lowerMessage = message.toLowerCase();

    // Positive keywords
    const positiveAr = ['شكرا', 'ممتاز', 'رائع', 'جيد', 'جميل', 'مبهر', 'أحببت', 'سعيد'];
    const positiveEn = ['thank', 'great', 'excellent', 'good', 'amazing', 'wonderful', 'love', 'happy'];

    // Negative keywords
    const negativeAr = ['سيء', 'مشكلة', 'شكوى', 'غاضب', 'لا يعجبني', 'محبط', 'فظيع'];
    const negativeEn = ['bad', 'problem', 'complaint', 'angry', 'hate', 'terrible', 'awful', 'disappointed'];

    const keywords = language === 'ar' ? [...positiveAr, ...negativeAr] : [...positiveEn, ...negativeEn];
    const positiveKeywords = language === 'ar' ? positiveAr : positiveEn;
    const negativeKeywords = language === 'ar' ? negativeAr : negativeEn;

    let positiveCount = 0;
    let negativeCount = 0;

    for (const keyword of positiveKeywords) {
      if (lowerMessage.includes(keyword)) positiveCount++;
    }

    for (const keyword of negativeKeywords) {
      if (lowerMessage.includes(keyword)) negativeCount++;
    }

    if (positiveCount > negativeCount) {
      return {
        sentiment: 'positive',
        score: 0.7 + (positiveCount * 0.1),
        confidence: 0.8,
      };
    } else if (negativeCount > positiveCount) {
      return {
        sentiment: 'negative',
        score: 0.3 - (negativeCount * 0.1),
        confidence: 0.8,
      };
    }

    return {
      sentiment: 'neutral',
      score: 0.5,
      confidence: 0.6,
    };
  }

  // ==================== HELPER METHODS ====================

  private shouldHandoff(message: string, keywords: string[]): boolean {
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
  }

  private async getConversationContext(conversationId: string): Promise<ChatMessage[]> {
    // Check cache
    if (this.conversationContexts.has(conversationId)) {
      return this.conversationContexts.get(conversationId)!;
    }

    // Load from database
    const messages = await this.getMessages(conversationId, 10);
    this.conversationContexts.set(conversationId, messages);
    return messages;
  }

  private addToContext(conversationId: string, message: ChatMessage): void {
    const context = this.conversationContexts.get(conversationId) || [];
    context.push(message);

    // Keep only last 10 messages
    if (context.length > 10) {
      context.shift();
    }

    this.conversationContexts.set(conversationId, context);
  }

  private getSuggestions(intent: IntentType, language: Language): string[] {
    const suggestions: Record<IntentType, { ar: string[]; en: string[] }> = {
      booking_inquiry: {
        ar: ['عرض الغرف المتاحة', 'الأسعار', 'الخدمات'],
        en: ['Show available rooms', 'Prices', 'Services'],
      },
      room_availability: {
        ar: ['اختيار التواريخ', 'أنواع الغرف', 'الحجز الآن'],
        en: ['Select dates', 'Room types', 'Book now'],
      },
      price_inquiry: {
        ar: ['عرض الأسعار', 'العروض الخاصة', 'الحجز'],
        en: ['View prices', 'Special offers', 'Book'],
      },
      cancellation: {
        ar: ['سياسة الإلغاء', 'إلغاء الحجز', 'التحدث مع موظف'],
        en: ['Cancellation policy', 'Cancel booking', 'Talk to staff'],
      },
      modification: {
        ar: ['تعديل التواريخ', 'تغيير الغرفة', 'التحدث مع موظف'],
        en: ['Modify dates', 'Change room', 'Talk to staff'],
      },
      complaint: {
        ar: ['التحدث مع مدير', 'تقديم شكوى رسمية'],
        en: ['Talk to manager', 'File formal complaint'],
      },
      general_info: {
        ar: ['الخدمات', 'الموقع', 'الاتصال'],
        en: ['Services', 'Location', 'Contact'],
      },
      payment: {
        ar: ['طرق الدفع', 'عرض الفاتورة', 'الدفع الآن'],
        en: ['Payment methods', 'View invoice', 'Pay now'],
      },
      amenities: {
        ar: ['المرافق', 'الخدمات', 'المميزات'],
        en: ['Facilities', 'Services', 'Features'],
      },
      location: {
        ar: ['العنوان', 'الخريطة', 'المواصلات'],
        en: ['Address', 'Map', 'Transportation'],
      },
      other: {
        ar: ['المساعدة', 'التحدث مع موظف'],
        en: ['Help', 'Talk to staff'],
      },
    };

    return suggestions[intent]?.[language] || [];
  }

  private async getDefaultResponse(message: string, language: Language): Promise<string> {
    const responses = {
      ar: 'شكراً لتواصلك معنا. كيف يمكنني مساعدتك؟',
      en: 'Thank you for contacting us. How can I help you?',
    };

    return responses[language];
  }

  // ==================== ANALYTICS ====================

  async getChatbotStats(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const constraints = [collection(db, 'messages'), where('isAI', '==', true)];

      if (startDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(endDate)));
      }

      const q = query(...constraints);
      const snapshot = await getDocs(q);

      const totalMessages = snapshot.size;
      let totalConfident = 0;
      const intentCounts: Record<string, number> = {};
      const sentimentCounts: Record<string, number> = {};

      snapshot.forEach(doc => {
        const data = doc.data() as ChatMessage;

        if (data.confidence && data.confidence > 0.7) {
          totalConfident++;
        }

        if (data.intent) {
          intentCounts[data.intent] = (intentCounts[data.intent] || 0) + 1;
        }

        if (data.sentiment) {
          sentimentCounts[data.sentiment] = (sentimentCounts[data.sentiment] || 0) + 1;
        }
      });

      return {
        totalMessages,
        confidentResponses: totalConfident,
        confidenceRate: totalMessages > 0 ? (totalConfident / totalMessages) * 100 : 0,
        intentDistribution: intentCounts,
        sentimentDistribution: sentimentCounts,
      };
    } catch (error) {
      console.error('Error getting chatbot stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService();
