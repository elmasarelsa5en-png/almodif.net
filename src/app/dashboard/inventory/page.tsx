"use client";
import { useState } from "react";
import WarehousesPage from "./WarehousesPage";
import InventoryLogPage from "./InventoryLogPage";
import ProductsPage from "./ProductsPage";
import TransferPage from "./TransferPage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Warehouse, Package, FileText, ArrowRight, BarChart3 } from "lucide-react";

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState("warehouses");

  const tabs = [
    { id: "warehouses", label: "المخازن", icon: Warehouse, color: "blue" },
    { id: "products", label: "المنتجات", icon: Package, color: "green" },
    { id: "transfer", label: "إذن الصرف", icon: ArrowRight, color: "purple" },
    { id: "logs", label: "الجرد", icon: FileText, color: "orange" }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "warehouses":
        return <WarehousesPage />;
      case "products":
        return <ProductsPage />;
      case "transfer":
        return <TransferPage />;
      case "logs":
        return <InventoryLogPage />;
      default:
        return <WarehousesPage />;
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
        {/* عنوان الصفحة مع أيقونة */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            نظام إدارة المخزون المتكامل
          </h1>
          <p className="text-white/70 text-lg">إدارة شاملة للمخازن والمنتجات والتحويلات</p>
        </div>

        {/* التنقل بين الأقسام */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    variant={isActive ? "default" : "outline"}
                    className={`flex items-center gap-2 ${
                      isActive
                        ? `bg-${tab.color}-500 hover:bg-${tab.color}-600 text-white`
                        : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-500/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* المحتوى */}
            <div className="min-h-[600px]">
              {renderContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}