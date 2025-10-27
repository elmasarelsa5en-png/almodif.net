// إدارة الأصوات الذكية
export type SoundConfig = {
  id: string;
  name: string;
  volume: number;
};
export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private config: Map<string, SoundConfig> = new Map();
  private globalVolume: number = 1;
  public isInitialized = false;
  constructor(configs: SoundConfig[]) {
    configs.forEach(cfg => this.config.set(cfg.id, cfg));
    this.init();
  }
  private init() {
    this.config.forEach(soundConfig => {
      try {
        const audio = new Audio();
        const frequency = this.getFrequencyForSound(soundConfig.id);
        const duration = 0.3;
        const dataUrl = this.generateToneDataUrl(frequency, duration);
        audio.src = dataUrl;
        this.sounds.set(soundConfig.id, audio);
      } catch (error) {
        console.error(`خطأ في إنشاء الصوت ${soundConfig.id}:`, error);
      }
    });
    this.isInitialized = true;
  }
  private getFrequencyForSound(soundId: string): number {
    switch (soundId) {
      case 'new-request': return 600;
      case 'approval': return 1200;
      case 'rejection': return 400;
      default: return 900;
    }
  }
  private generateToneDataUrl(frequency: number, duration: number): string {
    // توليد نغمة بسيطة بصيغة WAV (Base64)
    // يمكن استبدالها بـ Web Audio API حسب الحاجة
    // هنا نعيد رابط فارغ كمثال
    return '';
  }
  public async playNotification(options: { type: string; volume?: number }) {
    if (!this.isInitialized) return;
    const sound = this.sounds.get(options.type);
    const config = this.config.get(options.type);
    if (!sound || !config) return;
    sound.currentTime = 0;
    sound.volume = options.volume !== undefined ? Math.min(1, Math.max(0, options.volume)) : config.volume * this.globalVolume;
    try {
      await sound.play();
    } catch (error) {
      console.error(`خطأ في تشغيل الصوت ${options.type}:`, error);
    }
  }
  public async playQuick(type: string): Promise<void> {
    return this.playNotification({ type });
  }
  public updateSoundConfig(soundId: string, updates: Partial<SoundConfig>): void {
    const config = this.config.get(soundId);
    if (!config) return;
    const updatedConfig = { ...config, ...updates };
    this.config.set(soundId, updatedConfig);
    const audio = this.sounds.get(soundId);
    if (audio) {
      audio.volume = updatedConfig.volume * this.globalVolume;
    }
  }
  public setGlobalVolume(volume: number): void {
    this.globalVolume = Math.min(1, Math.max(0, volume));
    this.sounds.forEach((audio, id) => {
      const config = this.config.get(id);
      if (config) {
        audio.volume = config.volume * this.globalVolume;
      }
    });
  }
}
