'use client';

import React, { useEffect, useState } from 'react';

export const BubblesBackground = () => {
  const [bubbles, setBubbles] = useState<Array<{size: string; duration: string; delay: string; left: string; color: string}>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const colors = ['bg-blue-400/20', 'bg-purple-400/20', 'bg-indigo-400/20', 'bg-cyan-400/20'];
    const generatedBubbles = Array.from({ length: 15 }).map(() => ({
      size: `${Math.random() * 10 + 5}rem`,
      duration: `${Math.random() * 20 + 15}s`,
      delay: `${Math.random() * 10}s`,
      left: `${Math.random() * 100}%`,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setBubbles(generatedBubbles);
  }, []);

  if (!isClient) {
    return <div className="fixed inset-0 -z-10 overflow-hidden"><div className="relative w-full h-full"></div></div>;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="relative w-full h-full">
        {bubbles.map((bubble, index) => (
          <div
            key={index}
            className={`absolute bottom-[-15rem] ${bubble.color} rounded-full animate-float blur-2xl`}
            style={{
              width: bubble.size,
              height: bubble.size,
              left: bubble.left,
              animationDuration: bubble.duration,
              animationDelay: bubble.delay
            }}
          />
        ))}
      </div>
    </div>
  );
};