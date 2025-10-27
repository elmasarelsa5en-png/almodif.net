'use client';

import React, { useEffect, useState } from 'react';

export const TwinklingStars = ({ starCount = 70 }) => {
  const [stars, setStars] = useState<Array<{size: string; top: string; left: string; duration: string; delay: string}>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const generatedStars = Array.from({ length: starCount }).map(() => ({
      size: `${Math.random() * 2 + 1}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`,
    }));
    setStars(generatedStars);
  }, [starCount]);

  if (!isClient) {
    return <div className="fixed inset-0 -z-30 overflow-hidden"><div className="relative w-full h-full"></div></div>;
  }

  return (
    <div className="fixed inset-0 -z-30 overflow-hidden">
      <div className="relative w-full h-full">
        {stars.map((star, index) => (
          <div
            key={index}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              width: star.size,
              height: star.size,
              top: star.top,
              left: star.left,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
};