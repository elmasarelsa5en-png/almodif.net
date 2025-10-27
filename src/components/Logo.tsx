'use client';

import { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
}

export default function Logo({ className = '', size = 'md', showFallback = true }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState('/app-logo.png');

  // أحجام الشعار
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  useEffect(() => {
    // إضافة timestamp لتجنب الكاش
    setImageSrc(`/app-logo.png?v=${Date.now()}`);
  }, []);

  // شعار احتياطي SVG
  const fallbackLogo = (
    <svg 
      viewBox="0 0 200 200" 
      className={`${sizes[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect fill="url(#logoGradient)" width="200" height="200" rx="40" />
      <text 
        x="100" 
        y="125" 
        fontSize="80" 
        textAnchor="middle" 
        fill="white" 
        fontFamily="Arial Black, sans-serif"
        fontWeight="bold"
      >
        AM
      </text>
      <text 
        x="100" 
        y="175" 
        fontSize="20" 
        textAnchor="middle" 
        fill="white" 
        fontFamily="Arial, sans-serif"
        opacity="0.9"
      >
        AL MODIF
      </text>
    </svg>
  );

  // إذا كان هناك خطأ في التحميل وshowFallback = true
  if (imageError && showFallback) {
    return fallbackLogo;
  }

  return (
    <img
      src={imageSrc}
      alt="AL Modif Logo"
      className={`${sizes[size]} ${className} object-contain`}
      onError={() => {
        console.error('⚠️ فشل تحميل الشعار من:', imageSrc);
        setImageError(true);
      }}
      onLoad={() => {
        console.log('✅ تم تحميل الشعار بنجاح');
      }}
    />
  );
}
