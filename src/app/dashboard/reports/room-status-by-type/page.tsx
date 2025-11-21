'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building, Download, Printer, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface RoomStatus {
  type: string;
  available: number;
  occupied: number;
  maintenance: number;
  total: number;
}

export default function RoomStatusByTypeReport() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const [summary, setSummary] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    occupancyRate: 0
  });

  const COLORS = {
    available: '#10b981',
    occupied: '#ef4444',
    maintenance: '#f59e0b'
  };

  useEffect(() => {
    loadRoomStatus();
  }, []);

  const loadRoomStatus = async () => {
    setLoading(true);
    try {
      const roomsRef = collection(db, 'rooms');
      const roomsSnap = await getDocs(roomsRef);

      const statusMap = new Map<string, { available: number; occupied: number; maintenance: number }>();
      let totalAvailable = 0;
      let totalOccupied = 0;
      let totalMaintenance = 0;

      roomsSnap.docs.forEach(doc => {
        const data = doc.data();
        const roomType = data.type || 'غير محدد';
        const status = data.status || 'available';

        const current = statusMap.get(roomType) || { available: 0, occupied: 0, maintenance: 0 };
        
        if (status === 'available') {
          current.available++;
          totalAvailable++;
        } else if (status === 'occupied') {
          current.occupied++;
          totalOccupied++;
        } else if (status === 'maintenance') {
          current.maintenance++;
          totalMaintenance++;
        }

        statusMap.set(roomType, current);
      });

      const statuses: RoomStatus[] = Array.from(statusMap.entries()).map(([type, counts]) => ({
        type,
        available: counts.available,
        occupied: counts.occupied,
        maintenance: counts.maintenance,
        total: counts.available + counts.occupied + counts.maintenance
      })).sort((a, b) => b.total - a.total);

      const total = roomsSnap.docs.length;
      
      setRoomStatuses(statuses);
      setSummary({
        totalRooms: total,
        availableRooms: totalAvailable,
        occupiedRooms: totalOccupied,
        maintenanceRooms: totalMaintenance,
        occupancyRate: total > 0 ? (totalOccupied / total) * 100 : 0
      });
    } catch (error) {
      console.error('Error loading room status:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csvContent = [
      ['نوع الغرفة', 'متاحة', 'مشغولة', 'صيانة', 'الإجمالي'],
      ...roomStatuses.map(s => [
        s.type,
        s.available,
        s.occupied,
        s.maintenance,
        s.total
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `room_status_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const overallData = [
    { name: 'متاحة', value: summary.availableRooms, color: COLORS.available },
    { name: 'مشغولة', value: summary.occupiedRooms, color: COLORS.occupied },
    { name: 'صيانة', value: summary.maintenanceRooms, color: COLORS.maintenance }
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => router.back()} variant="ghost" size="sm" className="text-orange-300 hover:bg-orange-500/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-gray-300">
                  🏨 حالة الغرف حسب النوع
                </h1>
                <p className="text-slate-400">توزيع حالة الغرف حسب الأنواع</p>
              </div>
            </div>

            <div className="flex gap-2 print:hidden">
              <Button onClick={handleExport} variant="outline" className="bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
              <Button onClick={handlePrint} variant="outline" className="bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30">
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
              <Button onClick={loadRoomStatus} variant="outline" className="bg-purple-500/20 border-purple-400/30 text-purple-300 hover:bg-purple-500/30">
                <RefreshCw className="w-4 h-4 ml-2" />
                تحديث
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-slate-600/20 to-gray-800/20 border-slate-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm mb-1">إجمالي الغرف</p>
                    <p className="text-3xl font-bold text-white">{summary.totalRooms}</p>
                  </div>
                  <Building className="w-12 h-12 text-slate-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm mb-1">غرف متاحة</p>
                    <p className="text-3xl font-bold text-white">{summary.availableRooms}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-red-600/20 to-rose-800/20 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm mb-1">غرف مشغولة</p>
                    <p className="text-3xl font-bold text-white">{summary.occupiedRooms}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-amber-600/20 to-orange-800/20 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm mb-1">قيد الصيانة</p>
                    <p className="text-3xl font-bold text-white">{summary.maintenanceRooms}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span className="text-2xl">🔧</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Occupancy Rate */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-2">نسبة الإشغال الحالية</p>
                  <p className="text-4xl font-bold text-white">{summary.occupancyRate.toFixed(1)}%</p>
                </div>
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { value: summary.occupiedRooms },
                          { value: summary.totalRooms - summary.occupiedRooms }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#334155" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart - Overall Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">التوزيع الإجمالي</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={overallData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {overallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar Chart - By Type */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">التوزيع حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roomStatuses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="type" stroke="#94a3b8" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Bar dataKey="available" name="متاحة" fill={COLORS.available} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="occupied" name="مشغولة" fill={COLORS.occupied} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="maintenance" name="صيانة" fill={COLORS.maintenance} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">تفاصيل حالة الغرف</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                  <p className="text-white mt-4">جاري التحميل...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-right p-3 text-slate-300">نوع الغرفة</th>
                        <th className="text-center p-3 text-slate-300">متاحة</th>
                        <th className="text-center p-3 text-slate-300">مشغولة</th>
                        <th className="text-center p-3 text-slate-300">صيانة</th>
                        <th className="text-center p-3 text-slate-300">الإجمالي</th>
                        <th className="text-center p-3 text-slate-300">نسبة الإشغال</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomStatuses.map((status, index) => {
                        const occupancyRate = status.total > 0 ? (status.occupied / status.total) * 100 : 0;
                        return (
                          <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                            <td className="p-3 font-semibold">{status.type}</td>
                            <td className="p-3 text-center">
                              <span className="px-3 py-1 rounded bg-green-500/20 text-green-300 font-bold">
                                {status.available}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-3 py-1 rounded bg-red-500/20 text-red-300 font-bold">
                                {status.occupied}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                                {status.maintenance}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold">{status.total}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                                occupancyRate >= 80 
                                  ? 'bg-red-500/20 text-red-300'
                                  : occupancyRate >= 60
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-green-500/20 text-green-300'
                              }`}>
                                {occupancyRate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
