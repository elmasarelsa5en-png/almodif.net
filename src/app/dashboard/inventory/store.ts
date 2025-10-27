import { create } from "zustand";
import { Warehouse, Product, ConsumptionLog, Material, TransferRequest } from "./types";

type StoreState = {
  warehouses: Warehouse[];
  products: Product[];
  logs: ConsumptionLog[];
  transferRequests: TransferRequest[];
  addWarehouse: (warehouse: Warehouse) => void;
  addProduct: (product: Product) => void;
  addMaterialToWarehouse: (warehouseId: string, material: Material) => void;
  consumeProduct: (productId: string, warehouseId: string, section: string, quantity: number, floor?: number) => void;
  transferMaterials: (fromWarehouseId: string, toWarehouseId: string, items: { materialId: string; quantity: number }[], notes?: string) => void;
  approveTransfer: (transferId: string, approvedBy: string) => void;
  rejectTransfer: (transferId: string, approvedBy: string) => void;
  getLowStockMaterials: () => Material[];
};

export const useStore = create<StoreState>((set, get) => ({
  warehouses: [],
  products: [],
  logs: [],
  transferRequests: [],
  addWarehouse: (warehouse) =>
    set((state) => ({ warehouses: [...state.warehouses, warehouse] })),
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  addMaterialToWarehouse: (warehouseId, material) =>
    set((state) => ({
      warehouses: state.warehouses.map(w =>
        w.id === warehouseId
          ? { ...w, materials: [...w.materials, material] }
          : w
      )
    })),
  consumeProduct: (productId, warehouseId, section, quantity, floor) => {
    const state = get();
    const product = state.products.find((p) => p.id === productId);
    const warehouse = state.warehouses.find((w) => w.id === warehouseId);
    if (!product || !warehouse) return;

    const materialsUsed: ConsumptionLog["materialsUsed"] = product.materials.map((m) => {
      const material = warehouse.materials.find((mat) => mat.id === m.materialId);
      if (!material) return { materialId: m.materialId, quantity: 0, unit: "" };
      material.quantity -= m.quantityUsed * quantity;
      return { materialId: m.materialId, quantity: m.quantityUsed * quantity, unit: material.unit };
    });

    const log: ConsumptionLog = {
      id: crypto.randomUUID(),
      warehouseId,
      productId,
      quantity,
      materialsUsed,
      section: section as any,
      floor,
      timestamp: new Date().toISOString(),
      type: "consumption",
    };

    set((state) => ({ logs: [...state.logs, log] }));
  },
  transferMaterials: (fromWarehouseId, toWarehouseId, items, notes) => {
    const state = get();
    const fromWarehouse = state.warehouses.find(w => w.id === fromWarehouseId);
    const toWarehouse = state.warehouses.find(w => w.id === toWarehouseId);

    if (!fromWarehouse || !toWarehouse) return;

    // خصم من المخزن المرسل
    items.forEach(item => {
      const material = fromWarehouse.materials.find(m => m.id === item.materialId);
      if (material && material.quantity >= item.quantity) {
        material.quantity -= item.quantity;
      }
    });

    // إضافة للمخزن المستلم
    items.forEach(item => {
      const material = toWarehouse.materials.find(m => m.id === item.materialId);
      if (material) {
        material.quantity += item.quantity;
      } else {
        // إذا لم يكن المادة موجودة، أضفها
        const sourceMaterial = fromWarehouse.materials.find(m => m.id === item.materialId);
        if (sourceMaterial) {
          toWarehouse.materials.push({
            ...sourceMaterial,
            quantity: item.quantity
          });
        }
      }
    });

    // إضافة سجل التحويل
    const materialsUsed = items.map(item => {
      const material = fromWarehouse.materials.find(m => m.id === item.materialId);
      return {
        materialId: item.materialId,
        quantity: item.quantity,
        unit: material?.unit || ''
      };
    });

    const transferLog: ConsumptionLog = {
      id: crypto.randomUUID(),
      warehouseId: toWarehouseId,
      productId: "transfer",
      quantity: 1,
      materialsUsed,
      section: "transfer" as any,
      timestamp: new Date().toISOString(),
      type: "transfer",
      fromWarehouse: fromWarehouseId,
      toWarehouse: toWarehouseId,
    };

    set((state) => ({ logs: [...state.logs, transferLog] }));
  },
  approveTransfer: (transferId, approvedBy) =>
    set((state) => ({
      transferRequests: state.transferRequests.map(t =>
        t.id === transferId
          ? { ...t, status: "approved", approvedBy }
          : t
      )
    })),
  rejectTransfer: (transferId, approvedBy) =>
    set((state) => ({
      transferRequests: state.transferRequests.map(t =>
        t.id === transferId
          ? { ...t, status: "rejected", approvedBy }
          : t
      )
    })),
  getLowStockMaterials: () => {
    const state = get();
    const allMaterials: Material[] = [];
    state.warehouses.forEach(warehouse => {
      warehouse.materials.forEach(material => {
        if (material.quantity <= material.minQuantity) {
          allMaterials.push(material);
        }
      });
    });
    return allMaterials;
  },
}));
