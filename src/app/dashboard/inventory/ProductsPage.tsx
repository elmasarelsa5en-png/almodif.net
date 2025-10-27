import React, { useState } from "react";
import { useStore } from "./store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package, Settings, AlertTriangle, CheckCircle } from "lucide-react";
import { Product, Material } from "./types";

export default function ProductsPage() {
  const { products, warehouses, addProduct, addMaterialToWarehouse } = useStore();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  // بيانات المنتج الجديد
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    section: "coffee" as "coffee" | "restaurant" | "laundry" | "rooms",
    price: 0,
    materials: [] as { materialId: string; quantityUsed: number }[]
  });

  // بيانات المادة الجديدة
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    unit: "",
    packages: 0, // عدد الوحدات الكبيرة المضافة
    unitsPerPackage: 0, // عدد الوحدات الصغيرة في الوحدة الكبيرة
    packagingUnit: "", // وحدة التغليف الكبيرة
    minQuantity: 0,
    category: ""
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category) return;

    const product: Product = {
      id: crypto.randomUUID(),
      name: newProduct.name,
      category: newProduct.category,
      section: newProduct.section,
      materials: newProduct.materials,
      price: newProduct.price,
      available: true
    };

    addProduct(product);
    setNewProduct({
      name: "",
      category: "",
      section: "coffee",
      price: 0,
      materials: []
    });
    setShowAddProduct(false);
  };

  const handleAddMaterial = () => {
    if (!newMaterial.name || !selectedWarehouse) return;

    const material: Material = {
      id: crypto.randomUUID(),
      name: newMaterial.name,
      quantity: newMaterial.packages * newMaterial.unitsPerPackage, // حساب الكمية بالوحدة الأساسية
      unit: newMaterial.unit,
      minQuantity: newMaterial.minQuantity,
      category: newMaterial.category,
      packagingUnit: newMaterial.packagingUnit,
      unitsPerPackage: newMaterial.unitsPerPackage
    };

    addMaterialToWarehouse(selectedWarehouse, material);
    setNewMaterial({
      name: "",
      unit: "",
      packages: 0,
      unitsPerPackage: 0,
      packagingUnit: "",
      minQuantity: 0,
      category: ""
    });
    setShowAddMaterial(false);
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "coffee": return "☕";
      case "restaurant": return "🍽️";
      case "laundry": return "👔";
      case "rooms": return "🏨";
      default: return "📦";
    }
  };

  const getSectionName = (section: string) => {
    switch (section) {
      case "coffee": return "الكوفي شوب";
      case "restaurant": return "المطعم";
      case "laundry": return "المغسلة";
      case "rooms": return "إدارة الغرف";
      default: return section;
    }
  };

  return (
    <div className="space-y-6">
      {/* إدارة المنتجات */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            إدارة المنتجات والخامات
          </CardTitle>
          <CardDescription className="text-white/70">
            ربط المنتجات بالخامات وتحديد الكميات المطلوبة
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* أزرار الإضافة */}
          <div className="flex gap-4">
            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة منتج جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">إضافة منتج جديد</DialogTitle>
                  <DialogDescription className="text-white/70">
                    أدخل بيانات المنتج وربطه بالخامات المطلوبة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-100">اسم المنتج</Label>
                      <Input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        className="bg-white/10 border-white/20 text-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-100">الفئة</Label>
                      <Input
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        className="bg-white/10 border-white/20 text-gray-100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-100">القسم</Label>
                      <Select value={newProduct.section} onValueChange={(value: any) => setNewProduct({...newProduct, section: value})}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-gray-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <SelectItem value="coffee" className="text-gray-100">الكوفي شوب</SelectItem>
                          <SelectItem value="restaurant" className="text-gray-100">المطعم</SelectItem>
                          <SelectItem value="laundry" className="text-gray-100">المغسلة</SelectItem>
                          <SelectItem value="rooms" className="text-gray-100">إدارة الغرف</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-100">السعر</Label>
                      <Input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                        className="bg-white/10 border-white/20 text-gray-100"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddProduct} className="bg-green-600 text-white">
                    إضافة المنتج
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddMaterial} onOpenChange={setShowAddMaterial}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/20 text-white hover:bg-slate-700/50">
                  <Settings className="w-4 h-4 mr-2" />
                  إضافة خامة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">إضافة خامة جديدة</DialogTitle>
                  <DialogDescription className="text-white/70">
                    أدخل بيانات الخامة وحدد المخزن المطلوب
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">المخزن</Label>
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="اختر المخزن" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        {warehouses.map(warehouse => (
                          <SelectItem key={warehouse.id} value={warehouse.id} className="text-white">
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">اسم الخامة</Label>
                      <Input
                        value={newMaterial.name}
                        onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">الوحدة الأساسية</Label>
                      <Input
                        value={newMaterial.unit}
                        onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="عبوة، كجم، لتر..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">وحدة التغليف</Label>
                      <Input
                        value={newMaterial.packagingUnit}
                        onChange={(e) => setNewMaterial({...newMaterial, packagingUnit: e.target.value})}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="كرتونة، صندوق..."
                      />
                    </div>
                    <div>
                      <Label className="text-gray-100">عدد الوحدات في التغليف</Label>
                      <Input
                        type="number"
                        value={newMaterial.unitsPerPackage}
                        onChange={(e) => setNewMaterial({...newMaterial, unitsPerPackage: Number(e.target.value)})}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="مثال: 40"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-100">عدد {newMaterial.packagingUnit || 'الوحدات الكبيرة'}</Label>
                      <Input
                        type="number"
                        value={newMaterial.packages}
                        onChange={(e) => setNewMaterial({...newMaterial, packages: Number(e.target.value)})}
                        className="bg-white/10 border-white/20 text-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-100">الحد الأدنى ({newMaterial.unit})</Label>
                      <Input
                        type="number"
                        value={newMaterial.minQuantity}
                        onChange={(e) => setNewMaterial({...newMaterial, minQuantity: Number(e.target.value)})}
                        className="bg-white/10 border-white/20 text-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-100">الفئة</Label>
                      <Input
                        value={newMaterial.category}
                        onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                        className="bg-white/10 border-white/20 text-gray-100"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMaterial} className="bg-blue-600 text-white">
                    إضافة الخامة
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* قائمة المنتجات */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">المنتجات المسجلة</h3>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">لا توجد منتجات مسجلة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="bg-white/90 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getSectionIcon(product.section)}</span>
                          <div>
                            <h4 className="text-gray-900 font-medium">{product.name}</h4>
                            <p className="text-gray-600 text-sm">{product.category}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-green-400/30 text-green-600 bg-green-50">
                          {product.price} ر.س
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">القسم:</span>
                          <span className="text-gray-900">{getSectionName(product.section)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">الخامات:</span>
                          <span className="text-gray-900">{product.materials.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">الحالة:</span>
                          <Badge variant={product.available ? "default" : "secondary"} className="text-xs">
                            {product.available ? "متاح" : "غير متاح"}
                          </Badge>
                        </div>
                      </div>

                      {product.materials.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-gray-600 text-sm mb-2">الخامات المطلوبة:</p>
                          <div className="space-y-1">
                            {product.materials.slice(0, 2).map((material, index) => (
                              <div key={index} className="flex justify-between text-xs text-gray-500">
                                <span>{material.materialId}</span>
                                <span>{material.quantityUsed} وحدة</span>
                              </div>
                            ))}
                            {product.materials.length > 2 && (
                              <p className="text-gray-400 text-xs">+{product.materials.length - 2} خامة أخرى</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}