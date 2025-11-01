let audioContext: AudioContext | null = null;
let ringtoneOsc: OscillatorNode | null = null;
let ringtoneGain: GainNode | null = null;
let ringtoneInterval: number | null = null;

let ringbackOsc: OscillatorNode | null = null;
let ringbackGain: GainNode | null = null;

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function playRingtone() {
  try {
    const ctx = ensureAudioContext();
    stopRingtone();

    ringtoneOsc = ctx.createOscillator();
    ringtoneGain = ctx.createGain();

    ringtoneOsc.type = 'sine';
    ringtoneOsc.frequency.value = 800;
    ringtoneGain.gain.value = 0.0;

    ringtoneOsc.connect(ringtoneGain);
    ringtoneGain.connect(ctx.destination);

    ringtoneOsc.start();

    // ring pattern: 1s on, 1s off
    let on = true;
    ringtoneInterval = window.setInterval(() => {
      ringtoneGain!.gain.setTargetAtTime(on ? 0.25 : 0.0, ctx.currentTime, 0.02);
      on = !on;
    }, 1000) as unknown as number;
  } catch (e) {
    console.error('sound-manager: playRingtone failed', e);
  }
}

export function stopRingtone() {
  try {
    if (ringtoneInterval) {
      clearInterval(ringtoneInterval);
      ringtoneInterval = null;
    }
    if (ringtoneOsc) {
      try { ringtoneOsc.stop(); } catch (e) {}
      ringtoneOsc.disconnect();
      ringtoneOsc = null;
    }
    if (ringtoneGain) {
      try { ringtoneGain.disconnect(); } catch (e) {}
      ringtoneGain = null;
    }
  } catch (e) {
    console.error('sound-manager: stopRingtone failed', e);
  }
}

export function playRingback() {
  try {
    const ctx = ensureAudioContext();
    stopRingback();

    ringbackOsc = ctx.createOscillator();
    ringbackGain = ctx.createGain();

    ringbackOsc.type = 'sine';
    ringbackOsc.frequency.value = 400;
    ringbackGain.gain.value = 0.18;

    ringbackOsc.connect(ringbackGain);
    ringbackGain.connect(ctx.destination);
    ringbackOsc.start();
  } catch (e) {
    console.error('sound-manager: playRingback failed', e);
  }
}

export function stopRingback() {
  try {
    if (ringbackOsc) {
      try { ringbackOsc.stop(); } catch (e) {}
      ringbackOsc.disconnect();
      ringbackOsc = null;
    }
    if (ringbackGain) {
      try { ringbackGain.disconnect(); } catch (e) {}
      ringbackGain = null;
    }
  } catch (e) {
    console.error('sound-manager: stopRingback failed', e);
  }
}

export function playEndTone() {
  try {
    const ctx = ensureAudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 600;
    g.gain.value = 0.3;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => { try { o.stop(); } catch (e) {} }, 300);
  } catch (e) {
    console.error('sound-manager: playEndTone failed', e);
  }
}

export function playMuteTone() {
  try {
    const ctx = ensureAudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 200;
    g.gain.value = 0.12;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => { try { o.stop(); } catch (e) {} }, 120);
  } catch (e) {
    console.error('sound-manager: playMuteTone failed', e);
  }
}

export default {
  playRingtone,
  stopRingtone,
  playRingback,
  stopRingback,
  playEndTone,
  playMuteTone
};
// نظام إدارة الأصوات للمضيف مع حماية SSR
export interface SoundConfig {
  id: string;
  name: string;
  filename: string;
  volume: number;
  enabled: boolean;
  category: 'notification' | 'alert' | 'success' | 'warning' | 'error';
}

export interface NotificationSoundOptions {
  type: 'whatsapp_message' | 'new_booking' | 'complaint' | 'payment' | 'urgent' | 'success' | 'warning' | 'error';
  volume?: number;
  override?: boolean;
}

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private config: Map<string, SoundConfig> = new Map();
  private globalVolume: number = 0.7;
  private globalEnabled: boolean = true;
  private isInitialized: boolean = false;

  // الأصوات الافتراضية للنظام
  private defaultSounds: SoundConfig[] = [
    {
      id: 'whatsapp_message',
      name: 'رسالة WhatsApp جديدة',
      filename: 'whatsapp-notification.mp3',
      volume: 0.8,
      enabled: true,
      category: 'notification'
    },
    {
      id: 'new_booking',
      name: 'حجز جديد',
      filename: 'new-booking.mp3',
      volume: 0.9,
      enabled: true,
      category: 'notification'
    },
    {
      id: 'complaint',
      name: 'شكوى جديدة',
      filename: 'complaint-alert.mp3',
      volume: 1.0,
      enabled: true,
      category: 'alert'
    },
    {
      id: 'payment',
      name: 'دفعة جديدة',
      filename: 'payment-success.mp3',
      volume: 0.7,
      enabled: true,
      category: 'success'
    },
    {
      id: 'urgent',
      name: 'تنبيه عاجل',
      filename: 'urgent-alert.mp3',
      volume: 1.0,
      enabled: true,
      category: 'alert'
    },
    {
      id: 'success',
      name: 'نجح العملية',
      filename: 'success.mp3',
      volume: 0.6,
      enabled: true,
      category: 'success'
    },
    {
      id: 'warning',
      name: 'تحذير',
      filename: 'warning.mp3',
      volume: 0.8,
      enabled: true,
      category: 'warning'
    },
    {
      id: 'error',
      name: 'خطأ',
      filename: 'error.mp3',
      volume: 0.9,
      enabled: true,
      category: 'error'
    }
  ];

  constructor() {
    // فقط في المتصفح
    if (typeof window !== 'undefined') {
      this.initializeSounds();
      this.loadSettings();
    }
  }

  // تهيئة الأصوات
  private initializeSounds(): void {
    // التحقق من البيئة
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      console.warn('نظام الأصوات غير متاح في بيئة الخادم');
      return;
    }

    this.defaultSounds.forEach(soundConfig => {
      this.config.set(soundConfig.id, { ...soundConfig });
      
      try {
        // إنشاء نغمة مولدة تلقائياً بدلاً من ملف خارجي
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = soundConfig.volume * this.globalVolume;
        
        // إنشاء نغمة فورية
        const frequency = this.getFrequencyForSound(soundConfig.id);
        const duration = 0.3;
        const dataUrl = this.generateToneDataUrl(frequency, duration);
        
        audio.src = dataUrl;
        this.sounds.set(soundConfig.id, audio);
        
        console.log(`تم إنشاء الصوت: ${soundConfig.name}`);
      } catch (error) {
        console.error(`خطأ في إنشاء الصوت ${soundConfig.id}:`, error);
      }
    });

    this.isInitialized = true;
    console.log('تم تهيئة نظام الأصوات بنجاح ✅');
  }

  // إنشاء صوت بديل باستخدام Web Audio API
  private createFallbackSound(soundId: string): void {
    try {
      if (typeof window === 'undefined') return;
      
      // إنشاء نغمة بسيطة بدلاً من ملف صوتي
      const audio = new Audio();
      
      // إنشاء Data URL لنغمة بسيطة
      const duration = 0.3;
      const frequency = this.getFrequencyForSound(soundId);
      const dataUrl = this.generateToneDataUrl(frequency, duration);
      
      audio.src = dataUrl;
      audio.volume = (this.config.get(soundId)?.volume || 0.5) * this.globalVolume;
      
      this.sounds.set(soundId, audio);
    } catch (error) {
      console.error(`فشل في إنشاء الصوت البديل لـ ${soundId}:`, error);
    }
  }

  // الحصول على تردد مختلف لكل نوع صوت
  private getFrequencyForSound(soundId: string): number {
    const frequencies: Record<string, number> = {
      'whatsapp_message': 800,
      'new_booking': 1000,
      'complaint': 400,
      'payment': 1200,
      'urgent': 600,
      'success': 900,
      'warning': 700,
      'error': 300
    };
    return frequencies[soundId] || 800;
  }

  // إنشاء Data URL لنغمة
  private generateToneDataUrl(frequency: number, duration: number): string {
    const sampleRate = 44100;
    const samples = duration * sampleRate;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate tone
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3 * 32767;
      view.setInt16(44 + i * 2, sample, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // تشغيل صوت إشعار
  public async playNotification(options: NotificationSoundOptions): Promise<void> {
    // التحقق من البيئة
    if (typeof window === 'undefined') {
      return;
    }

    if (!this.isInitialized) {
      this.initializeSounds();
    }

    if (!this.globalEnabled && !options.override) {
      return;
    }

    const sound = this.sounds.get(options.type);
    const config = this.config.get(options.type);

    if (!sound || !config) {
      console.warn(`الصوت غير موجود: ${options.type}`);
      return;
    }

    if (!config.enabled && !options.override) {
      return;
    }

    try {
      // إيقاف الصوت إذا كان يعمل بالفعل
      sound.pause();
      sound.currentTime = 0;

      // تعديل مستوى الصوت إذا تم تحديده
      if (options.volume !== undefined) {
        sound.volume = Math.min(1, Math.max(0, options.volume));
      } else {
        sound.volume = config.volume * this.globalVolume;
      }

      // تشغيل الصوت
      await sound.play();
    } catch (error) {
      console.error(`خطأ في تشغيل الصوت ${options.type}:`, error);
    }
  }

  // تشغيل صوت سريع بدون خيارات
  public async playQuick(type: NotificationSoundOptions['type']): Promise<void> {
    return this.playNotification({ type });
  }

  // تعديل إعدادات صوت معين
  public updateSoundConfig(soundId: string, updates: Partial<SoundConfig>): void {
    const config = this.config.get(soundId);
    if (!config) return;

    const updatedConfig = { ...config, ...updates };
    this.config.set(soundId, updatedConfig);

    // تحديث عنصر الصوت
    const audio = this.sounds.get(soundId);
    if (audio) {
      audio.volume = updatedConfig.volume * this.globalVolume;
    }

    this.saveSettings();
  }

  // تعديل مستوى الصوت العام
  public setGlobalVolume(volume: number): void {
    this.globalVolume = Math.min(1, Math.max(0, volume));
    
    // تحديث جميع الأصوات
    this.sounds.forEach((audio, soundId) => {
      const config = this.config.get(soundId);
      if (config) {
        audio.volume = config.volume * this.globalVolume;
      }
    });

    this.saveSettings();
  }

  // تفعيل/إلغاء تفعيل الأصوات عموماً
  public setGlobalEnabled(enabled: boolean): void {
    this.globalEnabled = enabled;
    this.saveSettings();
  }

  // الحصول على إعدادات الأصوات
  public getSoundConfigs(): SoundConfig[] {
    return Array.from(this.config.values());
  }

  public getGlobalVolume(): number {
    return this.globalVolume;
  }

  public isGlobalEnabled(): boolean {
    return this.globalEnabled;
  }

  // حفظ الإعدادات في localStorage
  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const settings = {
        globalVolume: this.globalVolume,
        globalEnabled: this.globalEnabled,
        soundConfigs: Array.from(this.config.entries())
      };

      localStorage.setItem('almudif_sound_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('خطأ في حفظ إعدادات الأصوات:', error);
    }
  }

  // تحميل الإعدادات من localStorage
  private loadSettings(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('almudif_sound_settings');
      if (!saved) return;

      const settings = JSON.parse(saved);
      
      if (settings.globalVolume !== undefined) {
        this.globalVolume = settings.globalVolume;
      }
      
      if (settings.globalEnabled !== undefined) {
        this.globalEnabled = settings.globalEnabled;
      }

      if (settings.soundConfigs) {
        settings.soundConfigs.forEach(([id, config]: [string, SoundConfig]) => {
          this.config.set(id, config);
        });
      }
    } catch (error) {
      console.error('خطأ في تحميل إعدادات الأصوات:', error);
    }
  }

  // اختبار صوت معين
  public async testSound(soundId: string): Promise<void> {
    return this.playNotification({ type: soundId as any, override: true });
  }
}

// إنشاء instance وحيد للنظام
export const soundManager = new SoundManager();

// Hook للاستخدام في React Components
export function useSoundManager() {
  return {
    playNotification: soundManager.playNotification.bind(soundManager),
    playQuick: soundManager.playQuick.bind(soundManager),
    updateSoundConfig: soundManager.updateSoundConfig.bind(soundManager),
    setGlobalVolume: soundManager.setGlobalVolume.bind(soundManager),
    setGlobalEnabled: soundManager.setGlobalEnabled.bind(soundManager),
    getSoundConfigs: soundManager.getSoundConfigs.bind(soundManager),
    getGlobalVolume: soundManager.getGlobalVolume.bind(soundManager),
    isGlobalEnabled: soundManager.isGlobalEnabled.bind(soundManager),
    testSound: soundManager.testSound.bind(soundManager)
  };
}