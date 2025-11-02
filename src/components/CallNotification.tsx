/**
 * Call Notification System
 * Handles incoming video call notifications
 * Works similarly to Messenger/WhatsApp
 */

'use client';

import { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playIOSNotificationSound, vibrateIOS, isIOS } from '@/lib/ios-notifications';

interface IncomingCall {
  callId: string;
  callerName: string;
  callerAvatar?: string;
  roomNumber?: string;
  type: 'video' | 'audio';
  timestamp: number;
}

interface CallNotificationProps {
  employeeId: string;
}

export default function CallNotification({ employeeId }: CallNotificationProps) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [ringtoneInterval, setRingtoneInterval] = useState<NodeJS.Timeout | null>(null);

  // Listen for incoming calls from Firestore
  useEffect(() => {
    if (!employeeId) return;

    // TODO: Replace with your actual Firestore subscription
    const unsubscribe = subscribeToIncomingCalls(employeeId, (call) => {
      if (call) {
        handleIncomingCall(call);
      } else {
        handleCallEnded();
      }
    });

    return () => {
      unsubscribe();
      if (ringtoneInterval) {
        clearInterval(ringtoneInterval);
      }
    };
  }, [employeeId]);

  const handleIncomingCall = (call: IncomingCall) => {
    console.log('📞 Incoming call from:', call.callerName);
    
    setIncomingCall(call);

    // Play ringtone continuously
    const playRingtone = async () => {
      await playIOSNotificationSound();
      vibrateIOS([400, 200, 400, 200, 400]);
    };

    playRingtone();
    const interval = setInterval(playRingtone, 3000);
    setRingtoneInterval(interval);

    // Show full-screen notification for iOS
    if (isIOS() && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`📞 مكالمة من ${call.callerName}`, {
        body: call.roomNumber ? `غرفة ${call.roomNumber}` : 'مكالمة جديدة',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        requireInteraction: true,
        tag: `call-${call.callId}`,
        actions: [
          { action: 'answer', title: '✅ رد' },
          { action: 'reject', title: '❌ رفض' }
        ]
      });
    }

    // Wake lock to keep screen on (if supported)
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').catch((err: any) => {
        console.warn('Wake lock failed:', err);
      });
    }
  };

  const handleCallEnded = () => {
    setIncomingCall(null);
    if (ringtoneInterval) {
      clearInterval(ringtoneInterval);
      setRingtoneInterval(null);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    console.log('✅ Accepting call:', incomingCall.callId);
    
    // Stop ringtone
    handleCallEnded();

    // Navigate to call page
    window.location.href = `/dashboard/chat?call=${incomingCall.callId}`;
  };

  const rejectCall = async () => {
    if (!incomingCall) return;

    console.log('❌ Rejecting call:', incomingCall.callId);
    
    // Stop ringtone
    handleCallEnded();

    // TODO: Notify caller that call was rejected
    // await rejectCallInFirestore(incomingCall.callId);
  };

  if (!incomingCall) return null;

  return (
    <>
      {/* Full-screen call notification overlay */}
      <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center animate-pulse">
        <div className="text-center space-y-8 p-8">
          {/* Caller Avatar */}
          <div className="relative mx-auto">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl border-4 border-white/30 shadow-2xl animate-bounce">
              {incomingCall.callerAvatar ? (
                <img 
                  src={incomingCall.callerAvatar} 
                  alt={incomingCall.callerName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Video className="w-16 h-16 text-white" />
              )}
            </div>
            <div className="absolute -inset-4 bg-white/10 rounded-full animate-ping" />
          </div>

          {/* Caller Name */}
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">
              {incomingCall.callerName}
            </h2>
            <p className="text-xl text-white/80">
              {incomingCall.type === 'video' ? '📹 مكالمة فيديو' : '📞 مكالمة صوتية'}
            </p>
            {incomingCall.roomNumber && (
              <p className="text-lg text-white/60 mt-2">
                غرفة {incomingCall.roomNumber}
              </p>
            )}
          </div>

          {/* Call Actions */}
          <div className="flex items-center justify-center gap-8 mt-12">
            {/* Reject Button */}
            <button
              onClick={rejectCall}
              className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
            >
              <PhoneOff className="w-10 h-10 text-white" />
            </button>

            {/* Accept Button */}
            <button
              onClick={acceptCall}
              className="w-24 h-24 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 animate-pulse"
            >
              <Phone className="w-12 h-12 text-white" />
            </button>
          </div>

          {/* Hint text */}
          <p className="text-white/50 text-sm mt-8">
            اسحب للأعلى لقبول المكالمة
          </p>
        </div>
      </div>

      {/* Background audio element for iOS */}
      <audio 
        id="ringtone-audio" 
        loop 
        autoPlay
        className="hidden"
      >
        <source src="/sounds/ringtone.mp3" type="audio/mpeg" />
      </audio>
    </>
  );
}

// Dummy subscription function - replace with your Firestore implementation
function subscribeToIncomingCalls(
  employeeId: string,
  callback: (call: IncomingCall | null) => void
): () => void {
  // TODO: Implement Firestore subscription
  // Example:
  /*
  const unsubscribe = onSnapshot(
    doc(db, 'incomingCalls', employeeId),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as IncomingCall);
      } else {
        callback(null);
      }
    }
  );
  return unsubscribe;
  */

  // Dummy implementation
  return () => {
    console.log('Unsubscribed from incoming calls');
  };
}
