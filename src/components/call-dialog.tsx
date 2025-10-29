'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, X, Mic, MicOff, VideoOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  callType: 'audio' | 'video';
}

export function CallDialog({ isOpen, onClose, employeeName, callType }: CallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCall();
    }
    return () => {
      stopCall();
    };
  }, [isOpen]);

  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const startCall = async () => {
    try {
      const constraints = {
        audio: true,
        video: callType === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // محاكاة الاتصال (في الإنتاج يتم استخدام WebRTC signaling server)
      setTimeout(() => {
        setCallStatus('connected');
      }, 2000);
    } catch (error) {
      console.error('خطأ في بدء المكالمة:', error);
      alert('فشل الوصول إلى الكاميرا/الميكروفون');
      onClose();
    }
  };

  const stopCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCallStatus('ended');
    setCallDuration(0);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current && callType === 'video') {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    stopCall();
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400">
            {callType === 'video' ? '📹 مكالمة فيديو' : '📞 مكالمة صوتية'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* اسم المتصل والحالة */}
          <div className="text-center py-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold">
              {employeeName.charAt(0)}
            </div>
            <h3 className="text-2xl font-bold mb-2">{employeeName}</h3>
            <p className="text-cyan-300">
              {callStatus === 'connecting' && '🔄 جاري الاتصال...'}
              {callStatus === 'connected' && `⏱️ ${formatDuration(callDuration)}`}
              {callStatus === 'ended' && '❌ انتهت المكالمة'}
            </p>
          </div>

          {/* عرض الفيديو */}
          {callType === 'video' && (
            <div className="relative bg-black rounded-xl overflow-hidden" style={{ height: '400px' }}>
              {/* Remote video (full screen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Local video (picture-in-picture) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-cyan-500/50 shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex items-center justify-center gap-4 py-4">
            {/* كتم الصوت */}
            <Button
              size="lg"
              onClick={toggleMute}
              className={`w-16 h-16 rounded-full ${
                isMuted 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            {/* إيقاف الفيديو */}
            {callType === 'video' && (
              <Button
                size="lg"
                onClick={toggleVideo}
                className={`w-16 h-16 rounded-full ${
                  isVideoOff 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </Button>
            )}

            {/* إنهاء المكالمة */}
            <Button
              size="lg"
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <p className="text-center text-sm text-gray-400">
            💡 هذه نسخة تجريبية. في الإنتاج يتم استخدام WebRTC server للاتصال الحقيقي.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
