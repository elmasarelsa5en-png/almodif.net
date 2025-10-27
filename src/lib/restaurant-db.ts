// قائمة المطعم الافتراضية
const defaultMenuItems: MenuItem[] = [
  // المقبلات
  { id: '1', name: 'حمص بالطحينة', category: 'مقبلات', price: 15, description: 'حمص طازج مع طحينة وزيت زيتون', available: true },
  { id: '2', name: 'متبل باذنجان', category: 'مقبلات', price: 18, description: 'باذنجان مشوي مع طحينة وثوم', available: true },
  { id: '3', name: 'فتوش', category: 'مقبلات', price: 20, description: 'سلطة خضار مشكلة مع خبز محمص', available: true },
  { id: '4', name: 'تبولة', category: 'مقبلات', price: 16, description: 'سلطة بقدونس وطماطم وبرغل', available: true },
  // الأطباق الرئيسية
  { id: '5', name: 'كباب مشوي', category: 'أطباق رئيسية', price: 45, description: 'كباب لحم مشوي مع أرز وسلطة', available: true },
  { id: '6', name: 'فراخ مشوية', category: 'أطباق رئيسية', price: 40, description: 'دجاج مشوي بالأعشاب مع بطاطس', available: true },
  { id: '7', name: 'سمك مقلي', category: 'أطباق رئيسية', price: 50, description: 'سمك طازج مقلي مع أرز أبيض', available: true },
  { id: '8', name: 'مندي لحم', category: 'أطباق رئيسية', price: 55, description: 'لحم مندي مع أرز بسمتي وسلطة', available: true },
  { id: '9', name: 'كبسة دجاج', category: 'أطباق رئيسية', price: 35, description: 'دجاج كبسة مع أرز وخضار', available: true },
  // المشروبات
  { id: '10', name: 'عصير برتقال طازج', category: 'مشروبات', price: 12, description: 'عصير برتقال طبيعي 100%', available: true },
  { id: '11', name: 'عصير مانجو', category: 'مشروبات', price: 14, description: 'عصير مانجو طازج', available: true },
  // الحلويات
  { id: '15', name: 'كنافة', category: 'حلويات', price: 22, description: 'كنافة بالجبن والقطر', available: true },
  { id: '16', name: 'بقلاوة', category: 'حلويات', price: 18, description: 'بقلاوة بالفستق والعسل', available: true },
];
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
}

export interface Order {
  id: string;
  items: {
    menuItem: MenuItem;
    quantity: number;
  }[];
  customerName: string;
  roomNumber?: string;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  paymentMethod: 'cash' | 'card' | 'room';
  orderTime: Date;
  notes?: string;
}

// In-memory database
let menuItems: MenuItem[] = [...defaultMenuItems];
let orders: Order[] = [];

// --- Menu API ---

export const getMenuItems = () => menuItems;

export const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
  const newItem: MenuItem = {
    id: Date.now().toString(),
    ...itemData,
  };
  menuItems.push(newItem);
  return newItem;
};

export const updateMenuItem = (id: string, updateData: Partial<MenuItem>) => {
  const itemIndex = menuItems.findIndex(item => item.id === id);
  if (itemIndex === -1) return null;
  
  menuItems[itemIndex] = { ...menuItems[itemIndex], ...updateData };
  return menuItems[itemIndex];
};

export const deleteMenuItem = (id: string) => {
  const initialLength = menuItems.length;
  menuItems = menuItems.filter(item => item.id !== id);
  return menuItems.length < initialLength;
};

export const findMenuItemById = (id: string) => menuItems.find(item => item.id === id);

// --- Orders API ---

export const getOrders = () => orders.sort((a, b) => b.orderTime.getTime() - a.orderTime.getTime());

export const addOrder = (orderData: Omit<Order, 'id' | 'orderTime'>) => {
  const newOrder: Order = {
    id: Date.now().toString(),
    orderTime: new Date(),
    ...orderData,
  };
  orders.unshift(newOrder); // Add to the beginning of the array
  return newOrder;
};

export const updateOrderStatus = (id: string, status: Order['status']) => {
  const orderIndex = orders.findIndex(order => order.id === id);
  if (orderIndex === -1) return null;

  orders[orderIndex].status = status;
  return orders[orderIndex];
};

export const deleteOrder = (id: string) => {
  const initialLength = orders.length;
  orders = orders.filter(order => order.id !== id);
  return orders.length < initialLength;
};