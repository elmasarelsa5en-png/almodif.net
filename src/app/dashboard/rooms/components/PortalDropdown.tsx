'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RoomStatus } from '@/types';

interface PortalDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  stats: {
    reserved: number;
    maintenance: number;
    needsCleaning: number;
    occupiedAll: number;
    checkoutToday: number;
    occupied: number;
    available: number;
  };
  onFilterChange: (filter: RoomStatus | 'All' | 'OccupiedAll') => void;
  t: (key: string) => string;
}

export function PortalDropdown({ isOpen, onClose, triggerRef, stats, onFilterChange, t }: PortalDropdownProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleScroll = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[99999] min-w-[200px]"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="bg-slate-900/98 backdrop-blur-xl rounded-xl border-2 border-white/20 shadow-2xl p-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
        {/* محجوزة */}
        <button
          onClick={() => { onFilterChange('Reserved'); onClose(); }}
          className="w-full px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all flex items-center gap-3"
        >
          <span className="text-xl">📅</span>
          <div className="flex-1 text-right">
            <div>محجوزة</div>
            <div className="text-xs text-purple-200">({stats.reserved})</div>
          </div>
        </button>
        
        {/* تحت الصيانة */}
        <button
          onClick={() => { onFilterChange('Maintenance'); onClose(); }}
          className="w-full px-4 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-bold text-sm transition-all flex items-center gap-3"
        >
          <span className="text-xl">🔧</span>
          <div className="flex-1 text-right">
            <div>تحت الصيانة</div>
            <div className="text-xs text-gray-200">({stats.maintenance})</div>
          </div>
        </button>
        
        {/* تحتاج تنظيف */}
        <button
          onClick={() => { onFilterChange('NeedsCleaning'); onClose(); }}
          className="w-full px-4 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all flex items-center gap-3"
        >
          <span className="text-xl">🧹</span>
          <div className="flex-1 text-right">
            <div>تحتاج تنظيف</div>
            <div className="text-xs text-orange-200">({stats.needsCleaning})</div>
          </div>
        </button>
        
        {/* مشغولة (جديد) */}
        <button
          onClick={() => { onFilterChange('OccupiedAll'); onClose(); }}
          className="w-full px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition-all flex items-center gap-3"
        >
          <span className="text-xl">🛏️</span>
          <div className="flex-1 text-right">
            <div>مشغولة</div>
            <div className="text-xs text-cyan-200">({stats.occupiedAll})</div>
          </div>
        </button>
        
        {/* خروج اليوم */}
        <button
          onClick={() => { onFilterChange('CheckoutToday'); onClose(); }}
          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-bold text-sm transition-all flex items-center gap-3"
        >
          <span className="text-xl">⏰</span>
          <div className="flex-1 text-right">
            <div>{t('roomStatusCheckoutToday')}</div>
            <div className="text-xs text-white/80">({stats.checkoutToday})</div>
          </div>
        </button>
        
        {/* مشغولة */}
        <button
          onClick={() => { onFilterChange('Occupied'); onClose(); }}
          className="w-full px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition-all flex items-center gap-3"
        >
          <span className="text-xl">🛏️</span>
          <div className="flex-1 text-right">
            <div>{t('roomStatusOccupied')}</div>
            <div className="text-xs text-cyan-200">({stats.occupied})</div>
          </div>
        </button>
        
        {/* متاحة */}
        <button
          onClick={() => { onFilterChange('Available'); onClose(); }}
          className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all flex items-center gap-3"
        >
          <span className="text-xl">✅</span>
          <div className="flex-1 text-right">
            <div>{t('roomStatusAvailable')}</div>
            <div className="text-xs text-green-200">({stats.available})</div>
          </div>
        </button>
      </div>
    </div>,
    document.body
  );
}