'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoIntroProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function VideoIntro({ onComplete, onSkip }: VideoIntroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressTimeoutRef = useRef<NodeJS.Timeout>();

  // محاكاة شريط التقدم
  useEffect(() => {
    if (isPlaying) {
      progressTimeoutRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            onComplete();
            return 0;
          }
          return prev + (100 / 600); // 60 ثانية كاملة
        });
      }, 100);
    }
    return () => {
      if (progressTimeoutRef.current) clearInterval(progressTimeoutRef.current);
    };
  }, [isPlaying, onComplete]);

  // إخفاء التحكمات بعد 3 ثوان
  useEffect(() => {
    const hideControls = () => {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    hideControls();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // إذا لم يستطع تشغيل الفيديو، ابدأ بالمحاكاة
        setIsPlaying(true);
      });
      setIsPlaying(true);
    } else {
      // إذا لم يكن هناك فيديو، ابدأ بالمحاكاة
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    onComplete();
  };

  const handleVideoError = () => {
    setVideoError(true);
    // ابدأ المحاكاة بدلاً من الفيديو
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* الفيديو */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${videoError ? 'hidden' : ''}`}
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={() => setVideoLoaded(true)}
        muted={isMuted}
        playsInline
      >
        <source src="/intro-video.mp4" type="video/mp4" />
        <source src="/intro-video.webm" type="video/webm" />
        متصفحك لا يدعم تشغيل الفيديو.
      </video>

      {/* خلفية بديلة إذا فشل الفيديو */}
      {videoError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-3xl font-bold text-white mb-2">مرحباً بك</h2>
            <p className="text-white/80 text-lg">نظام إدارة الفنادق المتطور</p>
          </div>
        </div>
      )}

      {/* طبقة التدرج */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* التحكمات */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <Button
              onClick={handlePlay}
              size="lg"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/30 text-white rounded-full w-20 h-20"
            >
              <Play className="w-8 h-8 ml-1" />
            </Button>
          )}

          {/* أزرار التحكم العلوية */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <Button
              onClick={onSkip}
              variant="outline"
              size="sm"
              className="bg-black/50 hover:bg-black/70 border-white/30 text-white backdrop-blur-md text-xs"
            >
              <X className="w-3 h-3 ml-1" />
              تخطي
            </Button>

            <Button
              onClick={toggleMute}
              variant="outline"
              size="sm"
              className="bg-black/50 hover:bg-black/70 border-white/30 text-white backdrop-blur-md"
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      )}

      {/* شريط التقدم */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
}