"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Package, Star, ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  section: "coffee" | "restaurant" | "laundry" | "rooms";
  price: number;
  available: boolean;
  rating?: number;
  image?: string;
}

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // بيانات تجريبية للمنتجات
  const products: Product[] = [
    {
      id: "1",
      name: "قهوة عربية",
      category: "مشروبات ساخنة",
      section: "coffee",
      price: 15,
      available: true,
      rating: 4.5
    },
    {
      id: "2",
      name: "شاورما دجاج",
      category: "وجبات رئيسية",
      section: "restaurant",
      price: 45,
      available: true,
      rating: 4.8
    },
    {
      id: "3",
      name: "غسيل ملابس",
      category: "خدمات",
      section: "laundry",
      price: 25,
      available: true,
      rating: 4.2
    },
    {
      id: "4",
      name: "ماء معدني",
      category: "مشروبات",
      section: "rooms",
      price: 5,
      available: true,
      rating: 4.0
    }
  ];

  const sections = [
    { id: "all", label: "جميع الأقسام", icon: "" },
    { id: "coffee", label: "الكوفي شوب", icon: "" },
    { id: "restaurant", label: "المطعم", icon: "" },
    { id: "laundry", label: "المغسلة", icon: "" },
    { id: "rooms", label: "إدارة الغرف", icon: "" }
  ];

  const categories = [
    "جميع الفئات",
    "مشروبات ساخنة",
    "مشروبات باردة",
    "وجبات رئيسية",
    "وجبات خفيفة",
    "خدمات",
    "مشروبات"
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === "all" || product.section === selectedSection;
    const matchesCategory = selectedCategory === "جميع الفئات" || product.category === selectedCategory;

    return matchesSearch && matchesSection && matchesCategory;
  });

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "coffee": return "";
      case "restaurant": return "";
      case "laundry": return "";
      case "rooms": return "";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
      {/* خلفية تزيينية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* عنوان الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            كتالوج المنتجات والخدمات
          </h1>
          <p className="text-white/70 text-lg">استعرض جميع المنتجات والخدمات المتاحة</p>
        </div>

        {/* شريط البحث والفلترة */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* البحث */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في المنتجات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-gray-100 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* فلتر القسم */}
              <div className="w-full md:w-48">
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-gray-100">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    {sections.map(section => (
                      <SelectItem key={section.id} value={section.id} className="text-gray-100">
                        <div className="flex items-center gap-2">
                          <span>{section.icon}</span>
                          {section.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* فلتر الفئة */}
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-gray-100">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="text-gray-100">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{products.length}</div>
                <div className="text-gray-300 text-sm">إجمالي المنتجات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{products.filter(p => p.available).length}</div>
                <div className="text-gray-300 text-sm">متاح الآن</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{sections.length - 1}</div>
                <div className="text-gray-300 text-sm">الأقسام</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{categories.length - 1}</div>
                <div className="text-gray-300 text-sm">الفئات</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة المنتجات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-white/5 border-white/10 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl">
                      {getSectionIcon(product.section)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">{product.name}</h3>
                      <p className="text-gray-300 text-sm">{product.category}</p>
                    </div>
                  </div>
                  {product.available && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                      متاح
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">السعر:</span>
                    <span className="text-white font-bold">{product.price} ر.س</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">القسم:</span>
                    <Badge variant="outline" className="border-blue-400/30 text-blue-300">
                      {sections.find(s => s.id === product.section)?.label}
                    </Badge>
                  </div>

                  {product.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">التقييم:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-100">{product.rating}</span>
                      </div>
                    </div>
                  )}

                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    طلب الآن
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">لا توجد منتجات تطابق البحث</p>
            <p className="text-gray-400 text-sm mt-2">جرب تغيير معايير البحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
