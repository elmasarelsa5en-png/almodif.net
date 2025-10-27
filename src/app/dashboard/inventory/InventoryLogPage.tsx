import React from "react";
import { useStore } from "./store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Package, ArrowRight, Building2, Warehouse } from "lucide-react";

export default function InventoryLogPage() {
  const { logs } = useStore();

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
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl text-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          سجل التحويلات والتخصيمات
        </CardTitle>
        <CardDescription className="text-gray-200">
          متابعة جميع عمليات التحويل والاستهلاك في النظام
        </CardDescription>
      </CardHeader>

      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">لا توجد عمليات مسجلة بعد</p>
            <p className="text-gray-400 text-sm mt-2">ستظهر هنا جميع عمليات التحويل والتخصيم</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-white/60" />
                <span className="text-white/80">إجمالي العمليات: {logs.length}</span>
              </div>
              <Badge variant="outline" className="border-blue-400/30 text-blue-300">
                نشط
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-right p-4 text-gray-200 font-medium">القسم</th>
                    <th className="text-right p-4 text-gray-200 font-medium">المخزن</th>
                    <th className="text-right p-4 text-gray-200 font-medium">المنتج</th>
                    <th className="text-right p-4 text-gray-200 font-medium">الكمية</th>
                    <th className="text-right p-4 text-gray-200 font-medium">الخامات المخصومة</th>
                    <th className="text-right p-4 text-gray-200 font-medium">الوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm">
                            {getSectionIcon(log.section)}
                          </div>
                          <div>
                            <div className="text-gray-900 font-medium">{getSectionName(log.section)}</div>
                            <div className="text-gray-600 text-sm">{log.section}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {log.warehouseId.includes("main") ? (
                            <Building2 className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Warehouse className="w-4 h-4 text-purple-400" />
                          )}
                          <span className="text-gray-900">{log.warehouseId}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="border-green-400/30 text-green-600 bg-green-50">
                          {log.productId}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-900 font-medium">{log.quantity}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {log.materialsUsed.map((material, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-700">{material.materialId}:</span>
                              <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-400/30">
                                -{material.quantity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(log.timestamp).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
