'use client';

import React from 'react';
import { Room } from '@/lib/rooms-data';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';
import { ROOM_STATUS_CONFIG, ROOM_TYPE_CONFIG } from '@/lib/rooms-data';
import { isLateCheckout } from '@/lib/rooms-data';
import { 
  BedDouble, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Hammer,
  Trash2,
} from 'lucide-react';

import { RoomsContext, RoomsContextType } from '@/contexts/rooms-context';

interface RoomCardProps {
  room: Room;
  onOpenDetails: (room: Room) => void;
  onContextMenu: (e: React.MouseEvent, room: Room) => void;
}

const ICON_MAP = {
  CheckCircle2,
  BedDouble,
  Hammer,
  Trash2,
  Clock,
  AlertTriangle
};

export function RoomCard({ room, onOpenDetails, onContextMenu }: RoomCardProps) {
  const { t } = useLanguage();
  const { roomPrices, roomTypes } = React.useContext<RoomsContextType>(RoomsContext);
  const config = ROOM_STATUS_CONFIG[room.status];
  const typeConfig = ROOM_TYPE_CONFIG[room.type as keyof typeof ROOM_TYPE_CONFIG] || {
    color: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
    borderColor: 'border-gray-500',
    icon: 'Home'
  };
  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP];
  const roomPrice = roomPrices[room.type];
  const catalogRoomType = roomTypes.find(rt => rt.name === room.type);
  const imageUrl = catalogRoomType?.images?.[0];
  const isOccupied = room.status === 'Occupied' || room.status === 'CheckoutToday';
  const isCheckoutToday = room.status === 'CheckoutToday';
  const isLate = isCheckoutToday && room.bookingDetails?.checkOut?.date && isLateCheckout(room.bookingDetails.checkOut.date);

  return (
    <div
      className={`relative group cursor-pointer transition-transform duration-200 will-change-transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20 rounded-2xl overflow-hidden min-h-[220px] z-0 ${
        imageUrl ? '' : config.bgColor
      } active:scale-95 ${isLate ? 'animate-pulse ring-4 ring-red-500' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenDetails(room);
      }}
      onContextMenu={(e) => onContextMenu(e, room)}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {/* تنبيه متأخر عن checkout */}
      {isLate && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold py-1 px-2 text-center z-20 animate-pulse">
          ⚠️ متأخر عن checkout
        </div>
      )}

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine transition-opacity pointer-events-none"></div>
      
      {imageUrl && <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors pointer-events-none"></div>}
      <div className={`p-3 flex flex-col justify-between h-full min-h-[140px] relative z-10 ${isLate ? 'pt-8' : ''}`}>
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ${
              imageUrl 
                ? config.bgColor 
                : 'bg-black/20'
            } shadow-lg`}>
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white drop-shadow-md">{config.label}</p>
              {isCheckoutToday && (
                <p className="text-[10px] text-yellow-300 font-bold">{t('checkoutToday')}</p>
              )}
            </div>
          </div>
          <span className="text-xl font-bold drop-shadow-md group-hover:scale-110 transition-transform duration-300 text-white">{room.number}</span>
        </div>

        <div className="flex-grow flex flex-col justify-end mt-2 z-10">
          <div className="text-center mb-2">
            <p className="text-sm font-semibold opacity-90 truncate text-white drop-shadow-md">{room.type}</p>
          </div>
          
          {/* اسم العميل - بشكل بارز للغرف المشغولة */}
          {room.guestName && room.guestName.trim() !== '' && (
            <div className={`text-center ${
              isCheckoutToday 
                ? 'bg-gradient-to-r from-red-600/90 to-blue-600/90' 
                : 'bg-gradient-to-r from-red-600/90 to-red-700/90'
            } backdrop-blur-sm p-2 rounded-lg border-2 border-white/30 shadow-xl mb-2`}>
              <p className="text-sm font-bold text-white truncate drop-shadow-md">👤 {room.guestName}</p>
              {room.guestPhone && (
                <p className="text-xs text-white/90 truncate mt-0.5">📱 {room.guestPhone}</p>
              )}
              {/* عرض الديون إذا كانت موجودة */}
              {(room.currentDebt || 0) > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <p className="text-xs text-yellow-300 font-bold">{t('currentDebt')}</p>
                  <p className="text-lg font-bold text-white mt-1">{room.currentDebt} ر.س</p>
                  {(room.roomDebt || 0) > 0 && (
                    <p className="text-[10px] text-white/70">{t('accommodationDebt', { amount: room.roomDebt })}</p>
                  )}
                  {(room.servicesDebt || 0) > 0 && (
                    <p className="text-[10px] text-white/70">{t('servicesDebt', { amount: room.servicesDebt })}</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {room.balance !== 0 && (
            <div className="text-center mt-1">
              <Badge className={`shadow-md px-2 py-1 text-xs font-bold border ${
                room.balance > 0 
                  ? 'bg-red-500/80 text-white border-red-400/40' 
                  : 'bg-green-500/80 text-white border-green-400/40'
              }`}>
                {room.balance > 0 ? '+' : ''}{room.balance} ر.س
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}