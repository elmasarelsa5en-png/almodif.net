// lib/page-transition.tsx
'use client';

import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="animate-fade-in-up">
      {children}
    </div>
  );
}

// These animations are now handled by CSS classes in animations.css
// Use these class names in your components:
// - animate-fade-in-up
// - animate-fade-in-down
// - animate-scale-in
// - animate-slide-in-right
// - animate-float
// - animate-pulse-glow
// - hover-lift
// - hover-scale
// - hover-glow
// - button-ripple
// - card-shine
