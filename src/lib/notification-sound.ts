// lib/notification-sound.ts
export class NotificationSound {
  private audio: HTMLAudioElement | null = null;
  private enabled: boolean = true;

  constructor(soundPath: string = '/sounds/notification.mp3') {
    if (typeof window !== 'undefined') {
      this.audio = new Audio(soundPath);
      this.audio.volume = 0.7;
      
      // Load from localStorage
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.enabled = settings.enabled !== false;
        this.audio.volume = settings.volume || 0.7;
      }
    }
  }

  play() {
    if (this.enabled && this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(err => {
        console.log('Failed to play notification sound:', err);
      });
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.saveSettings();
  }

  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
      this.saveSettings();
    }
  }

  private saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSettings', JSON.stringify({
        enabled: this.enabled,
        volume: this.audio?.volume || 0.7
      }));
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.audio?.volume || 0.7;
  }
}

// Create singleton instances for different types
export const requestNotificationSound = new NotificationSound('/sounds/request.mp3');
export const coffeeNotificationSound = new NotificationSound('/sounds/coffee.mp3');
export const laundryNotificationSound = new NotificationSound('/sounds/laundry.mp3');
export const restaurantNotificationSound = new NotificationSound('/sounds/restaurant.mp3');
