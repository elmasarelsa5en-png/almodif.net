'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Receipt, 
  Plus, 
  Calendar,
  DollarSign,
  User,
  FileText,
  Search,
  Filter,
  Download,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Voucher {
  id: string;
  number: string;
  type: 'receipt' | 'payment';
  amount: number;
  from: string;
  to: string;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export default function VouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'receipt' | 'payment'>('all');

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = () => {
    // Load from localStorage or Firebase
    const stored = localStorage.getItem('vouchers');
    if (stored) {
      setVouchers(JSON.parse(stored));
    }
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = 
      voucher.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || voucher.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Receipt className="w-8 h-8 text-purple-400" />
                سندات القبض والصرف
              </h1>
              <p className="text-white/60 mt-1">إدارة السندات المالية</p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/dashboard/vouchers/new')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            سند جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">إجمالي السندات</p>
                  <p className="text-3xl font-bold text-white">{vouchers.length}</p>
                </div>
                <Receipt className="w-12 h-12 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">سندات قبض</p>
                  <p className="text-3xl font-bold text-green-400">
                    {vouchers.filter(v => v.type === 'receipt').length}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">سندات صرف</p>
                  <p className="text-3xl font-bold text-red-400">
                    {vouchers.filter(v => v.type === 'payment').length}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-red-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="بحث برقم السند، المستلم، أو الوصف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                  className={filterType === 'all' ? 'bg-purple-600' : 'border-white/20 text-white'}
                >
                  الكل
                </Button>
                <Button
                  variant={filterType === 'receipt' ? 'default' : 'outline'}
                  onClick={() => setFilterType('receipt')}
                  className={filterType === 'receipt' ? 'bg-green-600' : 'border-white/20 text-white'}
                >
                  قبض
                </Button>
                <Button
                  variant={filterType === 'payment' ? 'default' : 'outline'}
                  onClick={() => setFilterType('payment')}
                  className={filterType === 'payment' ? 'bg-red-600' : 'border-white/20 text-white'}
                >
                  صرف
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vouchers List */}
        {filteredVouchers.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-12 text-center">
              <Receipt className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">
                {searchTerm || filterType !== 'all' 
                  ? 'لا توجد سندات مطابقة للبحث' 
                  : 'لا توجد سندات حتى الآن'}
              </p>
              <Button
                onClick={() => router.push('/dashboard/vouchers/new')}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                إنشاء سند جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredVouchers.map((voucher) => (
              <Card 
                key={voucher.id} 
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          voucher.type === 'receipt' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {voucher.type === 'receipt' ? '📥 قبض' : '📤 صرف'}
                        </span>
                        <span className="text-white font-bold text-lg">
                          سند رقم {voucher.number}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-white/50 text-xs mb-1">المبلغ</p>
                          <p className="text-white font-bold text-xl">{voucher.amount} ر.س</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs mb-1">
                            {voucher.type === 'receipt' ? 'المستلم من' : 'المدفوع إلى'}
                          </p>
                          <p className="text-white">{voucher.from}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs mb-1">التاريخ</p>
                          <p className="text-white">
                            {new Date(voucher.date).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs mb-1">الوصف</p>
                          <p className="text-white truncate">{voucher.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mr-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Printer className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
