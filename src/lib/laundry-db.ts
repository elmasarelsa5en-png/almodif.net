export interface LaundryService {
  id: string;
  name: string;
  price: number;
  category: 'clothing' | 'bedding' | 'other';
}

export interface LaundryRequest {
  id: string;
  roomNumber: string;
  guestName: string;
  items: {
    service: LaundryService;
    quantity: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'ready' | 'delivered';
  requestTime: Date;
  notes?: string;
}

// In-memory database
const defaultServices: LaundryService[] = [
  { id: 'l1', name: 'غسيل وكي قميص', price: 10, category: 'clothing' },
  { id: 'l2', name: 'غسيل وكي بنطلون', price: 12, category: 'clothing' },
  { id: 'l3', name: 'غسيل وكي بدلة', price: 30, category: 'clothing' },
  { id: 'l4', name: 'غسيل ملاءة سرير', price: 15, category: 'bedding' },
  { id: 'l5', name: 'غسيل منشفة', price: 5, category: 'bedding' },
];

let laundryServices: LaundryService[] = [...defaultServices];
let laundryRequests: LaundryRequest[] = [];

// --- Services API ---

export const getLaundryServices = () => laundryServices;

export const findLaundryServiceById = (id: string) => laundryServices.find(service => service.id === id);

// --- Requests API ---

export const getLaundryRequests = () => laundryRequests.sort((a, b) => b.requestTime.getTime() - a.requestTime.getTime());

export const addLaundryRequest = (requestData: Omit<LaundryRequest, 'id' | 'requestTime'>) => {
  const newRequest: LaundryRequest = {
    id: `LR-${Date.now()}`,
    requestTime: new Date(),
    ...requestData,
  };
  laundryRequests.unshift(newRequest);
  return newRequest;
};

export const updateLaundryRequestStatus = (id: string, status: LaundryRequest['status']) => {
  const requestIndex = laundryRequests.findIndex(req => req.id === id);
  if (requestIndex === -1) return null;

  laundryRequests[requestIndex].status = status;
  return laundryRequests[requestIndex];
};

export const deleteLaundryRequest = (id: string) => {
  const initialLength = laundryRequests.length;
  laundryRequests = laundryRequests.filter(req => req.id !== id);
  return laundryRequests.length < initialLength;
};