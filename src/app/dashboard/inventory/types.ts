export type Material = {
  id: string;
  name: string;
  quantity: number; // الكمية الحالية بالوحدة الأساسية (مثل العبوة)
  unit: string; // الوحدة الأساسية (عبوة، كيلو، لتر، إلخ)
  minQuantity: number; // الحد الأدنى للتنبيه
  category: string;
  packagingUnit?: string; // وحدة التغليف الكبيرة (كرتونة، صندوق، إلخ)
  unitsPerPackage?: number; // عدد الوحدات الأساسية في وحدة التغليف (مثل 40 عبوة في الكرتونة)
};

export type Product = {
  id: string;
  name: string;
  category: string;
  section: "coffee" | "restaurant" | "laundry" | "rooms";
  materials: {
    materialId: string;
    quantityUsed: number;
  }[];
  price: number;
  available: boolean;
};

export type Warehouse = {
  id: string;
  name: string;
  type: "main" | "branch";
  section?: "coffee" | "restaurant" | "laundry" | "rooms";
  floor?: number; // لمخازن الغرف (1-4)
  materials: Material[];
};

export type ConsumptionLog = {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number; // عدد المنتجات المطلوبة
  materialsUsed: {
    materialId: string;
    quantity: number; // الكمية المخصومة بالوحدة الأساسية
    unit: string; // الوحدة المستخدمة
  }[];
  section: "coffee" | "restaurant" | "laundry" | "rooms";
  floor?: number;
  timestamp: string;
  type: "consumption" | "transfer";
  fromWarehouse?: string;
  toWarehouse?: string;
};

export type TransferRequest = {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  items: {
    materialId: string;
    quantity: number; // الكمية بالوحدة الأساسية
    unit: string;
  }[];
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  approvedBy?: string;
  timestamp: string;
  notes?: string;
};
