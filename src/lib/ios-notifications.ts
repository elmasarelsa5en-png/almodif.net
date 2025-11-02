/**
 * iOS Detection and Notification Enhancement
 * Handles iOS-specific notification limitations
 */

// Check if device is iOS
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// Check if running as PWA
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    ('standalone' in (window.navigator as any) && (window.navigator as any).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

// Play notification sound with iOS fallback
export async function playIOSNotificationSound(): Promise<void> {
  try {
    // Try Web Audio API first
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Generate a simple beep tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    console.log('✅ iOS: Played notification sound via Web Audio API');
  } catch (error) {
    console.error('❌ iOS: Failed to play notification sound:', error);
    
    // Fallback: Try HTML Audio
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      await audio.play();
      console.log('✅ iOS: Played notification sound via Audio element');
    } catch (audioError) {
      console.error('❌ iOS: Audio fallback also failed:', audioError);
    }
  }
}

// Request iOS notification permissions with proper handling
export async function requestIOSNotificationPermission(): Promise<boolean> {
  try {
    if (!('Notification' in window)) {
      console.warn('⚠️ iOS: Notifications not supported');
      return false;
    }

    // Check current permission
    if (Notification.permission === 'granted') {
      console.log('✅ iOS: Notification permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('⚠️ iOS: Notification permission denied');
      alert('يرجى السماح بالإشعارات من إعدادات Safari:\nالإعدادات > Safari > الإشعارات > السماح للموقع');
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ iOS: Notification permission granted');
      // Show a test notification
      new Notification('تم تفعيل الإشعارات', {
        body: 'ستصلك الإشعارات الآن حتى مع إغلاق التطبيق',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
      return true;
    }

    console.warn('⚠️ iOS: Notification permission not granted');
    return false;
  } catch (error) {
    console.error('❌ iOS: Error requesting notification permission:', error);
    return false;
  }
}

// Vibrate with iOS fallback
export function vibrateIOS(pattern: number[] = [200, 100, 200]): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
      console.log('✅ iOS: Vibration triggered');
    } else {
      console.warn('⚠️ iOS: Vibration not supported');
    }
  } catch (error) {
    console.error('❌ iOS: Vibration error:', error);
  }
}

// Show iOS-optimized notification
export async function showIOSNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    // Play sound first (before showing notification)
    await playIOSNotificationSound();
    
    // Vibrate
    vibrateIOS();
    
    // Show notification
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: data?.tag || 'default',
        requireInteraction: true,
        data,
        // iOS specific
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        if (data?.url) {
          window.location.href = data.url;
        }
      };

      console.log('✅ iOS: Notification shown');
    } else {
      console.warn('⚠️ iOS: No permission to show notification');
    }
  } catch (error) {
    console.error('❌ iOS: Error showing notification:', error);
  }
}

// Guide user to add app to home screen (iOS PWA)
export function promptAddToHomeScreen(): void {
  if (!isIOS()) return;
  if (isStandalone()) return; // Already added

  const message = `
📱 للحصول على أفضل تجربة:
1. اضغط على زر المشاركة أسفل الشاشة
2. اختر "إضافة إلى الشاشة الرئيسية"
3. افتح التطبيق من الشاشة الرئيسية

✨ سيعمل التطبيق مثل تطبيق حقيقي مع إشعارات أفضل!
  `.trim();

  alert(message);
}

// Check if user should see iOS setup instructions
export function shouldShowIOSInstructions(): boolean {
  if (!isIOS()) return false;
  
  const shown = localStorage.getItem('ios_instructions_shown');
  if (shown) return false;
  
  localStorage.setItem('ios_instructions_shown', 'true');
  return true;
}
