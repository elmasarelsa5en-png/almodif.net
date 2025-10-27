'use client';

import React, { Fragment } from 'react';
import { Megaphone } from 'lucide-react';

interface NewsTickerProps {
  items: string[];
  speed?: number; // duration in seconds for one full scroll
  className?: string;
}

const NewsTicker: React.FC<NewsTickerProps> = ({ items, speed = 60, className = '' }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden flex items-center news-ticker ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 flex-shrink-0">
        <Megaphone className="w-5 h-5 text-white" />
      </div>
      <div className="py-2 flex-1 overflow-hidden">
        <div
          className="flex whitespace-nowrap animate-ticker ticker-text-glow font-semibold"
          style={{ animationDuration: `${speed}s` }}
        >
          {[...items, ...items].map((item, index) => (
            <Fragment key={index}>
              <span className="text-white text-sm mx-4">{item}</span>
              {index < (items.length * 2) - 1 && (
                <span className="text-purple-400/50 text-xl font-light">
                  ◆
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;