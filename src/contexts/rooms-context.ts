import { createContext } from 'react';

// RoomsContext type
export interface RoomsContextType {
  roomPrices: Record<string, { pricePerDay: number; pricePerMonth: number }>;
  roomTypes: any[];
}

export const RoomsContext = createContext<RoomsContextType>({
  roomPrices: {},
  roomTypes: []
});