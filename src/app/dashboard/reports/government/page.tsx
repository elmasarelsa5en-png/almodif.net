'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Calendar, TrendingUp, Users,
  Building, DollarSign, Globe, Filter, Printer, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function GovernmentReportsPage() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [reportData, setReportData] = useState({
    totalGuests: 0,
    occupancyRate: 0,
    totalRevenue: 0,
    totalVAT: 0,
    guestsByNationality: [] as { nationality: string; count: number }[],
    averageStayDuration: 0
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      // محاكاة جلب البيانات
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setReportData({
        totalGuests: 247,
        occupancyRate: 78.5,
        totalRevenue: 456750,
        totalVAT: 68512.50,
        guestsByNationality: [
          { nationality: 'السعودية', count: 145 },
          { nationality: 'مصر', count: 32 },
          { nationality: 'الإمارات', count: 28 },
          { nationality: 'الكويت', count: 19 },
          { nationality: 'الأردن', count: 12 },
          { nationality: 'أخرى', count: 11 }
        ],
        averageStayDuration: 3.2
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    alert('سيتم تصدير التقرير إلى Excel');
  };

  const sendToEmail = () => {
    alert('سيتم إرسال التقرير عبر البريد الإلكتروني');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">التقارير الحكومية</h1>
        <p className="text-slate-400">تقارير جاهزة للإرسال لمنصة شموس والزكاة والضريبة</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-slate-300 text-sm mb-2 block">من تاريخ</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm mb-2 block">إلى تاريخ</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={generateReport}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Filter className="w-4 h-4 ml-2" />
                  {loading ? 'جاري الإعداد...' : 'إنشاء التقرير'}
                </Button>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/20"
                >
                  <Download className="w-4 h-4 ml-2" />
                  Excel
                </Button>
                <Button
                  onClick={sendToEmail}
                  variant="outline"
                  className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                >
                  <Mail className="w-4 h-4 ml-2" />
                  إرسال
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{reportData.totalGuests}</span>
              </div>
              <p className="text-slate-300 text-sm">إجمالي النزلاء</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{reportData.occupancyRate}%</span>
              </div>
              <p className="text-slate-300 text-sm">معدل الإشغال</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">{reportData.totalRevenue.toLocaleString()}</span>
              </div>
              <p className="text-slate-300 text-sm">الإيرادات (ر.س)</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-amber-400" />
                <span className="text-2xl font-bold text-white">{reportData.totalVAT.toLocaleString()}</span>
              </div>
              <p className="text-slate-300 text-sm">ضريبة القيمة المضافة (ر.س)</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Nationality Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-6"
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              توزيع النزلاء حسب الجنسية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.guestsByNationality.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-slate-300 min-w-[120px]">{item.nationality}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${(item.count / reportData.totalGuests) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-white font-semibold min-w-[60px] text-right">
                    {item.count} ({Math.round((item.count / reportData.totalGuests) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              معلومات إضافية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">متوسط مدة الإقامة</p>
                <p className="text-white text-2xl font-bold">{reportData.averageStayDuration} أيام</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">الفترة</p>
                <p className="text-white text-lg">{dateRange.startDate} - {dateRange.endDate}</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">حالة التقرير</p>
                <p className="text-green-400 text-lg font-semibold">✓ جاهز للإرسال</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 grid md:grid-cols-2 gap-4"
      >
        <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg">
          <Building className="w-5 h-5 ml-2" />
          إرسال إلى منصة شموس
        </Button>

        <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg">
          <FileText className="w-5 h-5 ml-2" />
          إرسال إلى الزكاة والضريبة
        </Button>
      </motion.div>
    </div>
  );
}


