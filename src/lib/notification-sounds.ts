// نظام الأصوات الاحترافي للإشعارات - يستخدم Web Audio API
// بدون الحاجة لملفات صوتية خارجية

export type NotificationSoundType = 'new-request' | 'approval' | 'rejection' | 'general';

/**
 * تشغيل صوت إشعار بناءً على النوع
 */
export function playNotificationSound(type: NotificationSoundType = 'general') {
  try {
    console.log(`🔊 Playing ${type} sound...`);
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    switch (type) {
      case 'new-request':
        playNewRequestSound(audioContext);
        break;
      case 'approval':
        playApprovalSound(audioContext);
        break;
      case 'rejection':
        playRejectionSound(audioContext);
        break;
      case 'general':
      default:
        playGeneralSound(audioContext);
        break;
    }
    
    console.log(`✅ ${type} sound played successfully!`);
  } catch (error) {
    console.error('❌ Failed to play sound:', error);
  }
}

/**
 * صوت طلب جديد - نغمة صاعدة لافتة للانتباه 🔔
 * 3 نغمات متصاعدة: 600Hz → 800Hz → 1000Hz
 * للموظف الذي سينفذ الطلب
 */
function playNewRequestSound(audioContext: AudioContext) {
  const now = audioContext.currentTime;
  const duration = 0.15; // كل نغمة 150ms
  
  // النغمة 1: 600Hz
  createTone(audioContext, 600, now, duration, 0.3);
  
  // النغمة 2: 800Hz
  createTone(audioContext, 800, now + duration + 0.05, duration, 0.35);
  
  // النغمة 3: 1000Hz (أعلى وأقوى)
  createTone(audioContext, 1000, now + (duration + 0.05) * 2, duration, 0.4);
}

/**
 * صوت الموافقة - نغمة مبهجة صاعدة ✅
 * نغمتين سريعتين: 800Hz → 1200Hz
 */
function playApprovalSound(audioContext: AudioContext) {
  const now = audioContext.currentTime;
  const duration = 0.12;
  
  // نغمة منخفضة ثم عالية (يعبر عن النجاح)
  createTone(audioContext, 800, now, duration, 0.35);
  createTone(audioContext, 1200, now + duration + 0.03, duration * 1.5, 0.4);
}

/**
 * صوت الرفض - نغمة هابطة ❌
 * نغمتين: 700Hz → 400Hz
 */
function playRejectionSound(audioContext: AudioContext) {
  const now = audioContext.currentTime;
  const duration = 0.2;
  
  // نغمة عالية ثم منخفضة (يعبر عن الرفض)
  createTone(audioContext, 700, now, duration, 0.3);
  createTone(audioContext, 400, now + duration + 0.05, duration * 1.2, 0.25);
}

/**
 * صوت عام - نغمة بسيطة مزدوجة ℹ️
 * للإشعارات العادية
 */
function playGeneralSound(audioContext: AudioContext) {
  const now = audioContext.currentTime;
  const duration = 0.15;
  
  // نغمتين متماثلتين
  createTone(audioContext, 900, now, duration, 0.3);
  createTone(audioContext, 900, now + duration + 0.1, duration, 0.3);
}

/**
 * دالة مساعدة لإنشاء نغمة واحدة
 */
function createTone(
  audioContext: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number
) {
  // Oscillator للتردد
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine'; // موجة سلسة
  
  // Envelope: fade in/out سريع للحصول على صوت احترافي
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02); // fade in
  gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + duration * 0.5); // sustain
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration); // fade out
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

/**
 * اختبار جميع الأصوات بالترتيب (للتطوير فقط)
 */
export function testAllSounds() {
  console.log('🎵 Testing all notification sounds...');
  
  setTimeout(() => {
    console.log('1️⃣ New Request Sound (طلب جديد)');
    playNotificationSound('new-request');
  }, 0);
  
  setTimeout(() => {
    console.log('2️⃣ Approval Sound (موافقة)');
    playNotificationSound('approval');
  }, 1500);
  
  setTimeout(() => {
    console.log('3️⃣ Rejection Sound (رفض)');
    playNotificationSound('rejection');
  }, 3000);
  
  setTimeout(() => {
    console.log('4️⃣ General Sound (إشعار عام)');
    playNotificationSound('general');
  }, 4500);
  
  console.log('✅ All sounds will play in sequence (every 1.5 seconds)');
}
