'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, X, Mic, MicOff, VideoOff, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { webrtcService } from '@/lib/webrtc-service';
import { useAuth } from '@/contexts/auth-context';

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  employeeId: string;
  callType: 'audio' | 'video';
}

export function CallDialog({ isOpen, onClose, employeeName, employeeId, callType }: CallDialogProps) {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'initializing' | 'connecting' | 'ringing' | 'connected' | 'ended'>('initializing');
  const [callDuration, setCallDuration] = useState(0);
  const [currentSignalId, setCurrentSignalId] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isInitialized = false;
    
    if (isOpen && user && !isInitialized) {
      isInitialized = true;
      startCall();
    }
    
    // Don't cleanup automatically - only cleanup when user explicitly ends call
    // This prevents destroying the peer connection during initialization
    return () => {
      // Cleanup will be called manually by endCall() when user clicks end button
    };
  }, [isOpen]); // Remove 'user' from dependencies to prevent re-initialization

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
      setCallStatus('initializing');
      console.log('📞 Starting WebRTC call...');

      // Check if browser supports WebRTC
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('متصفحك لا يدعم المكالمات (WebRTC غير مدعوم)');
      }

      const currentUserId = user?.username || user?.email;
      const currentUserName = user?.name || currentUserId;

      if (!currentUserId) {
        throw new Error('User not found');
      }

      console.log('🔑 User ID:', currentUserId);
      console.log('👤 User Name:', currentUserName);
      console.log('📞 Calling:', employeeId);

      // Initialize peer connection
      console.log('⏳ Initializing peer connection...');
      await webrtcService.initializePeer(currentUserId);
      console.log('✅ Peer connection initialized');
      
      setCallStatus('connecting');

      // Start call and create signal
      console.log('📤 Creating call signal...');
      const signalId = await webrtcService.startCall(
        employeeId,
        currentUserId,
        currentUserName || 'مستخدم',
        callType
      );
      console.log('✅ Call signal created:', signalId);

      setCurrentSignalId(signalId);
      setCallStatus('ringing');

      // Get local stream and display it
      const localStream = webrtcService.getLocalStream();
      console.log('📹 Local stream:', localStream ? 'Available' : 'Not available');
      
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        console.log('✅ Local video displayed');
      }

      // Wait for call to be answered (listen to signal status changes)
      // In production, you'd listen to Firestore signal updates
      // For now, simulate after 3 seconds
      setTimeout(async () => {
        try {
          // Connect to peer
          const call = await webrtcService.connectToPeer(employeeId, localStream!);
          
          // Get remote stream
          call.on('stream', (remoteStream) => {
            console.log('✅ Received remote stream');
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setCallStatus('connected');
          });

        } catch (error) {
          console.error('❌ Failed to connect:', error);
          setCallStatus('ended');
        }
      }, 3000);

    } catch (error: any) {
      console.error('❌ Error starting call:', error);
      
      let errorMessage = 'فشل بدء المكالمة';
      
      if (error?.message?.includes('timeout') || error?.message?.includes('المهلة')) {
        errorMessage = 'فشل الاتصال بالخادم: انتهت المهلة الزمنية.\nتأكد من اتصال الإنترنت.';
      } else if (error?.message?.includes('server') || error?.message?.includes('Lost connection')) {
        errorMessage = 'فشل الاتصال بخادم المكالمات.\nجاري المحاولة مرة أخرى...';
      } else if (error?.message?.includes('permission') || error?.message?.includes('denied')) {
        errorMessage = 'تم رفض الوصول للكاميرا/الميكروفون.\nيرجى السماح بالوصول من إعدادات المتصفح.';
      } else if (error?.message) {
        errorMessage = `خطأ: ${error.message}`;
      }
      
      // Show error but don't close dialog - let user see what happened and try again
      setCallStatus('ended');
      alert(errorMessage);
      // Don't call onClose() here - it triggers cleanup which destroys the peer
    }
  };

  const cleanup = () => {
    console.log('🧹 Cleanup called, status:', callStatus);
    if (currentSignalId) {
      webrtcService.endCall(currentSignalId);
    }
    // Don't call webrtcService.cleanup() here - keep peer alive for reconnection
    setCallStatus('ended');
    setCallDuration(0);
    setCurrentSignalId(null);
  };

  const toggleMute = () => {
    const muted = webrtcService.toggleMute();
    setIsMuted(muted);
  };

  const toggleVideo = () => {
    const videoOff = webrtcService.toggleVideo();
    setIsVideoOff(videoOff);
  };

  const endCall = () => {
    cleanup();
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 text-white border-0 p-0 overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10"></div>
          {callStatus === 'ringing' && (
            <div className="absolute inset-0 bg-purple-500/5 animate-pulse"></div>
          )}
        </div>

        <div className="relative z-10">
          {/* Header with Status */}
          <div className="px-6 py-4 border-b border-white/10 backdrop-blur-md bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {callType === 'video' ? (
                  <Video className="w-6 h-6 text-purple-400" />
                ) : (
                  <Phone className="w-6 h-6 text-cyan-400" />
                )}
                <span className="text-lg font-semibold">
                  {callType === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية'}
                </span>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                {callStatus === 'initializing' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                    <span className="text-sm text-yellow-400">جاري التهيئة</span>
                  </>
                )}
                {callStatus === 'connecting' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-sm text-blue-400">جاري الاتصال</span>
                  </>
                )}
                {callStatus === 'ringing' && (
                  <>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
                    <Phone className="w-4 h-4 text-purple-400 animate-bounce" />
                    <span className="text-sm text-purple-400">يرن...</span>
                  </>
                )}
                {callStatus === 'connected' && (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400 font-mono">{formatDuration(callDuration)}</span>
                  </>
                )}
                {callStatus === 'ended' && (
                  <>
                    <X className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">انتهت</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Caller Info - Only show if not video call or video is off */}
            {(callType === 'audio' || (callType === 'video' && callStatus !== 'connected')) && (
              <div className="text-center py-8">
                {/* Animated Avatar */}
                <div className="relative inline-block mb-6">
                  {/* Pulsing rings */}
                  {callStatus === 'ringing' && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping" style={{ animationDuration: '2s' }}></div>
                      <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                    </>
                  )}
                  
                  {/* Avatar */}
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl font-bold">
                      {employeeName.charAt(0)}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {employeeName}
                </h3>
              </div>
            )}

            {/* عرض الفيديو */}
            {callType === 'video' && (
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10" style={{ height: '500px' }}>
                {/* Remote video (full screen) */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Connection overlay when not connected */}
                {callStatus !== 'connected' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/90 to-purple-900/90 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-4xl font-bold animate-pulse">
                        {employeeName.charAt(0)}
                      </div>
                      <p className="text-xl text-white/80">
                        {callStatus === 'ringing' ? 'في انتظار الرد...' : 'جاري الاتصال...'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Local video (picture-in-picture) */}
                <div className="absolute bottom-6 right-6 w-48 h-36 bg-slate-900 rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-2xl transform transition-all hover:scale-105">
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

                {/* User name badge on video */}
                {callStatus === 'connected' && (
                  <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                    <p className="text-sm font-semibold">{employeeName}</p>
                  </div>
                )}
              </div>
            )}

            {/* أزرار التحكم */}
            <div className="flex items-center justify-center gap-4 py-6">
            {/* كتم الصوت */}
            <button
              onClick={toggleMute}
              className={`group relative w-16 h-16 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-slate-700/80 hover:bg-slate-600 backdrop-blur-md'
              }`}
              title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
            >
              {isMuted ? <MicOff className="w-7 h-7 text-white absolute inset-0 m-auto" /> : <Mic className="w-7 h-7 text-white absolute inset-0 m-auto" />}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {isMuted ? 'إلغاء الكتم' : 'كتم'}
              </span>
            </button>

            {/* إيقاف الفيديو */}
            {callType === 'video' && (
              <button
                onClick={toggleVideo}
                className={`group relative w-16 h-16 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 ${
                  isVideoOff 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-slate-700/80 hover:bg-slate-600 backdrop-blur-md'
                }`}
                title={isVideoOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}
              >
                {isVideoOff ? <VideoOff className="w-7 h-7 text-white absolute inset-0 m-auto" /> : <Video className="w-7 h-7 text-white absolute inset-0 m-auto" />}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {isVideoOff ? 'تشغيل' : 'إيقاف'}
                </span>
              </button>
            )}

            {/* إنهاء المكالمة */}
            <button
              onClick={endCall}
              className="group relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95"
              title="إنهاء المكالمة"
            >
              <X className="w-9 h-9 text-white absolute inset-0 m-auto" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                إنهاء
              </span>
            </button>
          </div>

          {/* Info message */}
          <p className="text-center text-sm text-white/50 pb-4">
            ✅ مكالمة حقيقية عبر WebRTC + PeerJS
          </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
