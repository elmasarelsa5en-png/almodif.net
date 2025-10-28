/**
 * خدمة الإشعارات الصوتية المتقدمة
 * تعمل في كل الصفحات مع نغمات طويلة قابلة للتخصيص
 */

let audioContext: AudioContext | null = null;
let isInitialized = false;
let isMonitoring = false;
let previousRequestCount = 0;

// تهيئة نظام الصوت
export const initializeAdvancedNotifications = () => {
  if (typeof window === 'undefined' || isInitialized) return;
  
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    isInitialized = true;
    console.log('✅ Advanced notification system initialized');
  } catch (error) {
    console.error('❌ Error initializing audio:', error);
  }
};

// تشغيل نغمة طويلة حسب النوع المحفوظ
export const playLongNotificationSound = () => {
  try {
    const soundType = localStorage.getItem('notification_sound_type') || 'alarm';
    
    // إذا كان هناك ملف مرفوع
    if (soundType === 'upload') {
      const uploadedSoundUrl = localStorage.getItem('uploaded_notification_sound');
      if (uploadedSoundUrl) {
        const audio = new Audio(uploadedSoundUrl);
        audio.volume = 0.9;
        audio.loop = false;
        audio.play().catch(e => console.log('Could not play uploaded sound:', e));
        return;
      }
    }
    
    // النغمات المدمجة الطويلة
    playBuiltInLongSound(soundType);
    
  } catch (error) {
    console.error('❌ Error playing sound:', error);
  }
};

// تشغيل النغمات المدمجة الطويلة (6-8 ثواني)
const playBuiltInLongSound = (soundType: string) => {
  if (!audioContext) {
    initializeAdvancedNotifications();
  }
  
  if (!audioContext) return;
  
  const now = audioContext.currentTime;
  
  switch (soundType) {
    case 'alarm':
      // إنذار طويل متكرر (8 ثواني)
      playAlarmSound(now);
      break;
      
    case 'bell':
      // جرس طويل (7 ثواني)
      playBellSound(now);
      break;
      
    case 'chime':
      // نغمة موسيقية (6 ثواني)
      playChimeSound(now);
      break;
      
    case 'urgent':
      // عاجل ومتكرر (8 ثواني)
      playUrgentSound(now);
      break;
      
    case 'phone':
      // رنين تليفون (7 ثواني)
      playPhoneRingSound(now);
      break;
      
    default:
      playAlarmSound(now);
  }
};

// إنذار طويل متكرر (8 ثواني)
const playAlarmSound = (startTime: number) => {
  if (!audioContext) return;
  
  // 16 نغمة متكررة (عالي-منخفض)
  for (let i = 0; i < 16; i++) {
    const freq = i % 2 === 0 ? 900 : 1300;
    const time = startTime + i * 0.5;
    createTone(freq, 0.4, time, 0.45);
  }
};

// جرس طويل (7 ثواني)
const playBellSound = (startTime: number) => {
  if (!audioContext) return;
  
  // جرس متكرر
  const pattern = [800, 1000, 1200, 1000, 800, 1000, 1200, 1400, 1200, 1000];
  pattern.forEach((freq, index) => {
    const time = startTime + index * 0.7;
    createTone(freq, 0.6, time, 0.35);
  });
};

// نغمة موسيقية (6 ثواني)
const playChimeSound = (startTime: number) => {
  if (!audioContext) return;
  
  // لحن جميل
  const melody = [
    523, 659, 784, 1047,  // صاعد
    784, 659, 523,         // هابط
    523, 659, 784,         // صاعد مرة أخرى
    1047, 1319, 1047       // خاتمة
  ];
  
  melody.forEach((freq, index) => {
    const time = startTime + index * 0.45;
    const duration = index >= melody.length - 2 ? 0.8 : 0.4;
    createTone(freq, duration, time, 0.3);
  });
};

// عاجل ومتكرر (8 ثواني)
const playUrgentSound = (startTime: number) => {
  if (!audioContext) return;
  
  // أربع دفعات سريعة
  for (let batch = 0; batch < 4; batch++) {
    const batchStart = startTime + batch * 2;
    for (let i = 0; i < 6; i++) {
      const time = batchStart + i * 0.12;
      createTone(1500, 0.1, time, 0.5);
    }
  }
};

// رنين تليفون (7 ثواني)
const playPhoneRingSound = (startTime: number) => {
  if (!audioContext) return;
  
  // رنين كلاسيكي
  for (let ring = 0; ring < 3; ring++) {
    const ringStart = startTime + ring * 2.3;
    
    // كل رنة عبارة عن نغمتين سريعتين
    for (let tone = 0; tone < 6; tone++) {
      const time = ringStart + tone * 0.15;
      const freq = tone % 2 === 0 ? 850 : 1100;
      createTone(freq, 0.12, time, 0.4);
    }
  }
};

// إنشاء نغمة واحدة
const createTone = (frequency: number, duration: number, startTime: number, volume: number = 0.3) => {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(volume, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

// مراقبة الطلبات الجديدة في كل الصفحات
export const startGlobalRequestMonitoring = () => {
  if (typeof window === 'undefined' || isMonitoring) {
    console.log('⚠️ Already monitoring or not in browser');
    return;
  }
  
  isMonitoring = true;
  console.log('🔔 Starting GLOBAL request monitoring (works on ALL pages)...');
  
  // تهيئة الصوت
  initializeAdvancedNotifications();
  
  // مراقبة Firebase في الخلفية
  import('@/lib/firebase-data').then(({ subscribeToRequests }) => {
    subscribeToRequests((requests) => {
      console.log('📊 Firebase requests update:', requests.length);
      
      if (previousRequestCount > 0 && requests.length > previousRequestCount) {
        console.log('🚨 NEW REQUEST DETECTED! Playing LONG sound...');
        
        // تشغيل النغمة الطويلة
        playLongNotificationSound();
        
        // إشعار المتصفح
        if ('Notification' in window && Notification.permission === 'granted') {
          const newRequest = requests[0];
          new Notification('🔔 طلب جديد من نزيل', {
            body: `غرفة ${newRequest.room} - ${newRequest.type}\n${newRequest.guest}`,
            icon: '/images/logo.png',
            tag: 'new-request',
            requireInteraction: true,
            vibrate: [300, 100, 300, 100, 300]
          });
        }
        
        // تنبيه بصري كبير
        showBigVisualAlert(requests[0]);
      }
      
      previousRequestCount = requests.length;
    });
  }).catch(error => {
    console.error('Error setting up Firebase monitoring:', error);
  });
  
  // طلب إذن الإشعارات
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('📢 Notification permission:', permission);
    });
  }
};

// عرض تنبيه بصري كبير وملفت
const showBigVisualAlert = (request: any) => {
  if (typeof window === 'undefined') return;
  
  // إزالة أي تنبيه قديم
  const oldAlert = document.getElementById('big-visual-alert');
  if (oldAlert) oldAlert.remove();
  
  // إنشاء التنبيه الكبير
  const alertDiv = document.createElement('div');
  alertDiv.id = 'big-visual-alert';
  alertDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    z-index: 999999;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px 60px;
    border-radius: 25px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    animation: popIn 0.5s ease-out forwards, pulse 1.5s infinite;
    font-family: system-ui, -apple-system, sans-serif;
    text-align: center;
    min-width: 400px;
    max-width: 90vw;
  `;
  
  alertDiv.innerHTML = `
    <div style="font-size: 80px; margin-bottom: 20px; animation: bounce 1s infinite;">
      🔔
    </div>
    <div style="font-size: 32px; font-weight: bold; margin-bottom: 15px;">
      طلب جديد من نزيل!
    </div>
    <div style="font-size: 22px; opacity: 0.95; margin-bottom: 10px;">
      غرفة <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 10px; font-weight: bold;">${request.room}</span>
    </div>
    <div style="font-size: 20px; opacity: 0.9; margin-bottom: 10px;">
      ${request.guest}
    </div>
    <div style="font-size: 18px; opacity: 0.85; background: rgba(255,255,255,0.15); padding: 10px 20px; border-radius: 12px; margin-top: 15px;">
      ${request.type}
    </div>
    <div style="font-size: 14px; opacity: 0.7; margin-top: 20px;">
      انقر في أي مكان للإغلاق
    </div>
  `;
  
  // إضافة الأنيميشن
  const style = document.createElement('style');
  style.textContent = `
    @keyframes popIn {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
      50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
      50% { box-shadow: 0 20px 80px rgba(102,126,234,0.8); }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
  `;
  document.head.appendChild(style);
  
  // overlay شفاف
  const overlay = document.createElement('div');
  overlay.id = 'big-visual-alert-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(5px);
    z-index: 999998;
    animation: fadeIn 0.3s ease-out;
  `;
  
  const overlayStyle = document.createElement('style');
  overlayStyle.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(overlayStyle);
  
  // إضافة للصفحة
  document.body.appendChild(overlay);
  document.body.appendChild(alertDiv);
  
  // إزالة عند النقر في أي مكان
  const removeAlert = () => {
    alertDiv.style.animation = 'popIn 0.3s ease-out reverse';
    overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
    setTimeout(() => {
      alertDiv.remove();
      overlay.remove();
      style.remove();
      overlayStyle.remove();
    }, 300);
  };
  
  overlay.onclick = removeAlert;
  alertDiv.onclick = removeAlert;
  
  // إزالة تلقائية بعد 10 ثواني
  setTimeout(removeAlert, 10000);
};

// تهيئة تلقائية عند تحميل أي صفحة
if (typeof window !== 'undefined') {
  // التهيئة عند أول تفاعل
  const initOnFirstInteraction = () => {
    console.log('👆 User interaction detected, initializing...');
    initializeAdvancedNotifications();
    startGlobalRequestMonitoring();
    
    // إزالة المستمعات بعد التهيئة
    document.removeEventListener('click', initOnFirstInteraction);
    document.removeEventListener('keydown', initOnFirstInteraction);
    document.removeEventListener('touchstart', initOnFirstInteraction);
  };
  
  document.addEventListener('click', initOnFirstInteraction, { once: true });
  document.addEventListener('keydown', initOnFirstInteraction, { once: true });
  document.addEventListener('touchstart', initOnFirstInteraction, { once: true });
  
  // أو تهيئة بعد ثانيتين
  setTimeout(() => {
    initializeAdvancedNotifications();
    startGlobalRequestMonitoring();
  }, 2000);
}
