"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import WarehousesPage from "./WarehousesPage";
import InventoryLogPage from "./InventoryLogPage";
import ProductsPage from "./ProductsPage";
import TransferPage from "./TransferPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Warehouse, Package, FileText, ArrowRight, BarChart3, 
  Coffee, Utensils, Shirt, TrendingDown, AlertTriangle,
  RefreshCw, ExternalLink, ShoppingCart, Boxes, Package2
} from "lucide-react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface InventoryStats {
  totalProducts: number;
  lowStockItems: number;
  outOfStock: number;
  totalValue: number;
  recentTransfers: number;
}

interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  gradient: string;
}

export default function CatalogPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("warehouses");
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStock: 0,
    totalValue: 0,
    recentTransfers: 0
  });
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "warehouses", label: "المخازن", icon: Warehouse, color: "blue" },
    { id: "products", label: "المنتجات", icon: Package, color: "green" },
    { id: "transfer", label: "إذن الصرف", icon: ArrowRight, color: "purple" },
    { id: "logs", label: "الجرد", icon: FileText, color: "orange" }
  ];

  const quickLinks: QuickLink[] = [
    {
      id: "coffee",
      title: "كوفي شوب",
      description: "إدارة مخزون المشروبات والحلويات",
      icon: Coffee,
      href: "/dashboard/coffee",
      color: "amber",
      gradient: "from-amber-500 to-yellow-500"
    },
    {
      id: "restaurant",
      title: "مطعم",
      description: "إدارة مخزون المواد الغذائية",
      icon: Utensils,
      href: "/dashboard/restaurant",
      color: "orange",
      gradient: "from-orange-500 to-red-500"
    },
    {
      id: "laundry",
      title: "مغسلة",
      description: "إدارة مخزون مواد التنظيف",
      icon: Shirt,
      href: "/dashboard/laundry",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "menu-items",
      title: "قائمة الخدمات",
      description: "إدارة خدمات الضيوف",
      icon: ShoppingCart,
      href: "/dashboard/settings/menu-items",
      color: "purple",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  useEffect(() => {
    loadInventoryStats();
  }, []);

  const loadInventoryStats = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const productsSnap = await getDocs(productsRef);
      
      let totalProducts = 0;
      let lowStock = 0;
      let outOfStock = 0;
      let totalValue = 0;

      productsSnap.docs.forEach(doc => {
        const data = doc.data();
        totalProducts++;
        const quantity = data.quantity || 0;
        const minStock = data.minStock || 10;
        const price = data.price || 0;
        
        totalValue += quantity * price;
        
        if (quantity === 0) {
          outOfStock++;
        } else if (quantity <= minStock) {
          lowStock++;
        }
      });

      setStats({
        totalProducts,
        lowStockItems: lowStock,
        outOfStock,
        totalValue,
        recentTransfers: 0
      });
    } catch (error) {
      console.error('Error loading inventory stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* خلفية تزيينية */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto space-y-6">
        {/* عنوان الصفحة */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Boxes className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
                  نظام إدارة المخزون المتكامل
                </h1>
                <p className="text-slate-400 text-sm mt-1">إدارة شاملة للمخازن والمنتجات والتحويلات والربط مع جميع الأقسام</p>
              </div>
            </div>
            <Button 
              onClick={loadInventoryStats}
              variant="outline"
              className="bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30"
            >
              <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </motion.div>

        {/* إحصائيات المخزون */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <Card className="bg-gradient-to-br from-blue-600/20 to-indigo-800/20 border-blue-500/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm mb-1">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
                </div>
                <Package2 className="w-12 h-12 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-600/20 to-orange-800/20 border-amber-500/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-300 text-sm mb-1">مخزون منخفض</p>
                  <p className="text-3xl font-bold text-white">{stats.lowStockItems}</p>
                </div>
                <TrendingDown className="w-12 h-12 text-amber-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600/20 to-rose-800/20 border-red-500/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm mb-1">نفذ من المخزون</p>
                  <p className="text-3xl font-bold text-white">{stats.outOfStock}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 border-green-500/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm mb-1">قيمة المخزون</p>
                  <p className="text-2xl font-bold text-white">{stats.totalValue.toFixed(0)} ر.س</p>
                </div>
                <BarChart3 className="w-12 h-12 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* روابط سريعة للأقسام */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-purple-400" />
                روابط سريعة - ربط المخزون مع الأقسام
              </CardTitle>
              <p className="text-slate-400 text-sm">انتقل سريعاً إلى الأقسام المرتبطة بالمخزون</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Card 
                        onClick={() => router.push(link.href)}
                        className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 group"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${link.gradient} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-bold mb-1 group-hover:text-purple-300 transition-colors">
                                {link.title}
                              </h3>
                              <p className="text-slate-400 text-xs">
                                {link.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* التنقل بين الأقسام */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-2xl">
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
                      className={`flex items-center gap-2 transition-all ${
                        isActive
                          ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg hover:shadow-xl`
                          : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:text-white hover:border-slate-500/50"
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
        </motion.div>
      </div>
    </div>
  );
}