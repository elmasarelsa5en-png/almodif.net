import React, { useState } from "react";
import { useStore } from "./store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Plus, CheckCircle, XCircle, Clock, Building2, Warehouse } from "lucide-react";

export default function TransferPage() {
  const { warehouses, transferMaterials } = useStore();
  const [transferData, setTransferData] = useState({
    fromWarehouse: "",
    toWarehouse: "",
    items: [] as { materialId: string; quantity: number; unit: string }[],
    notes: ""
  });

  const mainWarehouse = warehouses.find(w => w.type === "main");
  const branchWarehouses = warehouses.filter(w => w.type === "branch");

  const handleAddItem = () => {
    setTransferData({
      ...transferData,
      items: [...transferData.items, { materialId: "", quantity: 0, unit: "" }]
    });
  };

  const handleUpdateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...transferData.items];
    if (field === 'materialId') {
      // عند اختيار المادة، احصل على الوحدة تلقائياً
      const material = getAvailableMaterials(transferData.fromWarehouse).find(m => m.id === value);
      newItems[index] = { ...newItems[index], materialId: value as string, unit: material?.unit || "" };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setTransferData({ ...transferData, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    setTransferData({
      ...transferData,
      items: transferData.items.filter((_, i) => i !== index)
    });
  };

  const handleTransfer = () => {
    if (!transferData.fromWarehouse || !transferData.toWarehouse || transferData.items.length === 0) return;

    transferMaterials(transferData.fromWarehouse, transferData.toWarehouse, transferData.items, transferData.notes);

    // إعادة تعيين البيانات
    setTransferData({
      fromWarehouse: "",
      toWarehouse: "",
      items: [],
      notes: ""
    });
  };

  const getAvailableMaterials = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.materials : [];
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            إذن صرف من المخزن الرئيسي
          </CardTitle>
          <CardDescription className="text-white/70">
            نقل المواد من المخزن الرئيسي إلى المخازن الفرعية
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* اختيار المخازن */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-100 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                من المخزن الرئيسي
              </Label>
              <Select value={transferData.fromWarehouse} onValueChange={(value) => setTransferData({...transferData, fromWarehouse: value})}>
                <SelectTrigger className="bg-white/10 border-white/20 text-gray-100">
                  <SelectValue placeholder="اختر المخزن الرئيسي" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {mainWarehouse && (
                    <SelectItem value={mainWarehouse.id} className="text-gray-100">
                      {mainWarehouse.name}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Warehouse className="w-4 h-4" />
                إلى المخزن الفرعي
              </Label>
              <Select value={transferData.toWarehouse} onValueChange={(value) => setTransferData({...transferData, toWarehouse: value})}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="اختر المخزن الفرعي" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {branchWarehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id} className="text-gray-100">
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* قائمة المواد المراد نقلها */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-100 text-lg">المواد المراد نقلها</Label>
              <Button onClick={handleAddItem} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                إضافة مادة
              </Button>
            </div>

            {transferData.items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-lg">
                <ArrowRight className="w-8 h-8 text-white/30 mx-auto mb-2" />
                <p className="text-gray-300">لم يتم اختيار أي مواد للنقل</p>
                <p className="text-gray-400 text-sm">اضغط على &quot;إضافة مادة&quot; لبدء إذن الصرف</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transferData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white/90 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <Select value={item.materialId} onValueChange={(value) => handleUpdateItem(index, 'materialId', value)}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {getAvailableMaterials(transferData.fromWarehouse).map(material => (
                            <SelectItem key={material.id} value={material.id} className="text-gray-900">
                              {material.name} (متاح: {material.quantity} {material.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="الكمية"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', Number(e.target.value))}
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div className="w-20 text-gray-600 text-sm">
                      {item.unit}
                    </div>

                    <Button
                      onClick={() => handleRemoveItem(index)}
                      variant="outline"
                      size="sm"
                      className="border-red-400/30 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* الملاحظات */}
          <div className="space-y-2">
            <Label className="text-gray-100">ملاحظات (اختياري)</Label>
            <Textarea
              value={transferData.notes}
              onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
              placeholder="أدخل أي ملاحظات إضافية..."
              className="bg-white/10 border-white/20 text-gray-100 placeholder:text-gray-400"
              rows={3}
            />
          </div>

          {/* زر تنفيذ النقل */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleTransfer}
              disabled={!transferData.fromWarehouse || !transferData.toWarehouse || transferData.items.length === 0}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 text-lg"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              تنفيذ إذن الصرف
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ملخص المخازن */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map(warehouse => (
          <Card key={warehouse.id} className="bg-white/90 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {warehouse.type === "main" ? (
                  <Building2 className="w-6 h-6 text-blue-400" />
                ) : (
                  <Warehouse className="w-6 h-6 text-purple-400" />
                )}
                <div>
                  <h4 className="text-gray-900 font-medium text-sm">{warehouse.name}</h4>
                  <Badge variant="outline" className="text-xs mt-1">
                    {warehouse.type === "main" ? "رئيسي" : "فرعي"}
                  </Badge>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{warehouse.materials.length}</div>
                <div className="text-gray-600 text-xs">نوع من المواد</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}