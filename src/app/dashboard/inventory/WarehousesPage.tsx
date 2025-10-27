import React, { useState } from "react";
import { useStore } from "./store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Warehouse, Building2, Package } from "lucide-react";

export default function WarehousesPage() {
  const { warehouses, addWarehouse } = useStore();
  const [name, setName] = useState("");
  const [type, setType] = useState<"main" | "branch">("main");

  const handleAdd = () => {
    if (!name.trim()) return;
    addWarehouse({
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      materials: []
    });
    setName("");
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl text-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Warehouse className="w-5 h-5 text-white" />
          </div>
          إدارة المخازن
        </CardTitle>
        <CardDescription className="text-gray-200">
          إضافة وإدارة المخازن الرئيسية والفرعية
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* نموذج إضافة مخزن جديد */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إضافة مخزن جديد
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">اسم المخزن</label>
              <Input
                placeholder="أدخل اسم المخزن"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-gray-100 placeholder:text-gray-400 focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">نوع المخزن</label>
              <Select value={type} onValueChange={(value: "main" | "branch") => setType(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-gray-100 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="main" className="text-gray-100 hover:bg-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      رئيسي
                    </div>
                  </SelectItem>
                  <SelectItem value="branch" className="text-gray-100 hover:bg-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4" />
                      فرعي
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة المخزن
              </Button>
            </div>
          </div>
        </div>

        {/* قائمة المخازن */}
        <div>
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            المخازن المسجلة ({warehouses.length})
          </h3>

          {warehouses.length === 0 ? (
            <div className="text-center py-12">
              <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">لا توجد مخازن مسجلة بعد</p>
              <p className="text-gray-400 text-sm mt-2">ابدأ بإضافة مخزن رئيسي أو فرعي</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouses.map((warehouse) => (
                <Card key={warehouse.id} className="bg-white/90 backdrop-blur-md border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {warehouse.type === "main" ? (
                          <Building2 className="w-8 h-8 text-blue-400" />
                        ) : (
                          <Warehouse className="w-8 h-8 text-purple-400" />
                        )}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{warehouse.name}</h4>
                          <Badge
                            variant={warehouse.type === "main" ? "default" : "secondary"}
                            className={`mt-1 ${
                              warehouse.type === "main"
                                ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                : "bg-purple-500/20 text-purple-300 border-purple-400/30"
                            }`}
                          >
                            {warehouse.type === "main" ? "رئيسي" : "فرعي"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">عدد المواد:</span>
                        <span className="text-gray-900 font-medium">{warehouse.materials.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">الحالة:</span>
                        <Badge variant="outline" className="border-green-400/30 text-green-600 bg-green-50">
                          نشط
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
