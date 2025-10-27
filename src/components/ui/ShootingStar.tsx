'use client';

import React, { useEffect, useState } from 'react';

export const ShootingStars = ({ starCount = 7 }) => {
  const [stars, setStars] = useState<Array<{duration: string; delay: string; top: string; left: string}>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const generatedStars = Array.from({ length: starCount }).map(() => ({
      duration: `${Math.random() * 5 + 5}s`,
      delay: `${Math.random() * 10}s`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }));
    setStars(generatedStars);
  }, [starCount]);

  // لا نعرض النجوم حتى يتم التحميل على الكلاينت
  if (!isClient) {
    return <div className="fixed top-0 left-0 w-full h-full -z-20 overflow-hidden pointer-events-none"></div>;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-20 overflow-hidden pointer-events-none">
      {stars.map((star, index) => (
        <div
          key={index}
          className="shooting-star"
          style={{
            top: star.top,
            left: star.left,
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        ></div>
      ))}
    </div>
  );
};