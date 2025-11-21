'use client';

import React, { createContext, useState, ReactNode } from 'react';

export interface RoomsContextType {
  roomPrices: Record<string, { pricePerDay: number; pricePerMonth: number }>;
  setRoomPrices: React.Dispatch<React.SetStateAction<Record<string, { pricePerDay: number; pricePerMonth: number }>>>;
  roomTypes: any[];
  setRoomTypes: React.Dispatch<React.SetStateAction<any[]>>;
}

export const RoomsContext = createContext<RoomsContextType>({
  roomPrices: {},
  setRoomPrices: () => {},
  roomTypes: [],
  setRoomTypes: () => {},
});

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [roomPrices, setRoomPrices] = useState<Record<string, { pricePerDay: number; pricePerMonth: number }>>({});
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  const value = {
    roomPrices,
    setRoomPrices,
    roomTypes,
    setRoomTypes,
  };

  return (
    <RoomsContext.Provider value={value}>
      {children}
    </RoomsContext.Provider>
  );
}