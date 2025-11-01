'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface IncomingCallDialogProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallDialog({
  isOpen,
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onReject
}: IncomingCallDialogProps) {
  const [ringCount, setRingCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Play ringtone
      playRingtone();
      
      // Auto reject after 30 seconds
      const timeout = setTimeout(() => {
        onReject();
      }, 30000);

      return () => {
        clearTimeout(timeout);
        stopRingtone();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Animate ring icon
      const interval = setInterval(() => {
        setRingCount(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const playRingtone = () => {
    try {
      // Create a simple ringtone using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;

      oscillator.start();

      // Play ring pattern (ring for 1s, pause 1s, repeat)
      const ringPattern = setInterval(() => {
        if (gainNode.gain.value === 0) {
          gainNode.gain.value = 0.3;
        } else {
          gainNode.gain.value = 0;
        }
      }, 1000);

      audioRef.current = { stop: () => {
        clearInterval(ringPattern);
        oscillator.stop();
        audioContext.close();
      }} as any;

    } catch (error) {
      console.error('Failed to play ringtone:', error);
    }
  };

  const stopRingtone = () => {
    if (audioRef.current && (audioRef.current as any).stop) {
      (audioRef.current as any).stop();
    }
  };

  const handleAccept = () => {
    stopRingtone();
    onAccept();
  };

  const handleReject = () => {
    stopRingtone();
    onReject();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReject}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-600 to-purple-600 border-0 text-white p-0 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse"></div>
        </div>

        <div className="relative z-10 p-8">
          {/* Caller Info */}
          <div className="text-center mb-8">
            {/* Avatar with pulsing ring */}
            <div className="relative inline-block mb-4">
              <div className={`absolute inset-0 rounded-full bg-white/30 ${ringCount % 2 === 0 ? 'scale-100' : 'scale-110'} transition-transform duration-1000`}></div>
              <div className={`absolute inset-0 rounded-full bg-white/20 ${ringCount % 2 === 0 ? 'scale-110' : 'scale-125'} transition-transform duration-1000`}></div>
              
              <div className="relative w-32 h-32 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border-4 border-white/30">
                {callerAvatar ? (
                  <img src={callerAvatar} alt={callerName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
            </div>

            {/* Caller Name */}
            <h3 className="text-2xl font-bold mb-2">{callerName}</h3>
            
            {/* Call Type */}
            <div className="flex items-center justify-center gap-2 text-white/80">
              {callType === 'video' ? (
                <>
                  <Video className="w-5 h-5" />
                  <span>مكالمة فيديو واردة...</span>
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  <span>مكالمة صوتية واردة...</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            {/* Reject Button */}
            <button
              onClick={handleReject}
              className="group relative w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
            >
              <PhoneOff className="absolute inset-0 m-auto w-8 h-8 text-white rotate-135" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                رفض
              </span>
            </button>

            {/* Accept Button */}
            <button
              onClick={handleAccept}
              className="group relative w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 animate-pulse"
            >
              <Phone className="absolute inset-0 m-auto w-8 h-8 text-white" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                رد
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-24 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
              fill="white"
              className="animate-wave"
            />
          </svg>
        </div>
      </DialogContent>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
        }
        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  );
}
