'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  CreditCard,
  Building2,
  Smartphone,
  Users,
  Calendar,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Transaction {
  id: string;
  type: 'cash' | 'network' | 'bank' | 'digital' | 'agent';
  amount: number;
  description: string;
  date: string;
  reference?: string;
}

const paymentMethods = [
  {
    id: 'cash',
    name: 'المقبوضات النقدية',
    icon: DollarSign,
    color: 'text-emerald-400',
    bgColor: 'from-emerald-600/30 to-green-600/30',
    borderColor: 'border-emerald-500/50'
  },
  {
    id: 'network',
    name: 'الشبكة (مدى/فيزا)',
    icon: CreditCard,
    color: 'text-blue-400',
    bgColor: 'from-blue-600/30 to-indigo-600/30',
    borderColor: 'border-blue-500/50'
  },
  {
    id: 'bank',
    name: 'التحويل البنكي',
    icon: Building2,
    color: 'text-purple-400',
    bgColor: 'from-purple-600/30 to-fuchsia-600/30',
    borderColor: 'border-purple-500/50'
  },
  {
    id: 'digital',
    name: 'الدفع الرقمي',
    icon: Smartphone,
    color: 'text-cyan-400',
    bgColor: 'from-cyan-600/30 to-sky-600/30',
    borderColor: 'border-cyan-500/50'
  },
  {
    id: 'agent',
    name: 'وكلاء السفر',
    icon: Users,
    color: 'text-amber-400',
    bgColor: 'from-amber-600/30 to-orange-600/30',
    borderColor: 'border-amber-500/50'
  }
];

export default function CashMovementReport() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  
  // بيانات تجريبية
  const [transactions] = useState<Transaction[]>([
    { id: '1', type: 'cash', amount: 5000, description: 'حجز غرفة 101', date: '2025-10-31 10:30', reference: 'INV-001' },
    { id: '2', type: 'network', amount: 3500, description: 'دفع بطاقة مدى - غرفة 205', date: '2025-10-31 11:15', reference: 'POS-445' },
    { id: '3', type: 'bank', amount: 12000, description: 'تحويل بنكي - حجز مجموعة', date: '2025-10-31 09:00', reference: 'BANK-789' },
    { id: '4', type: 'digital', amount: 2500, description: 'دفع أبل باي - غرفة 310', date: '2025-10-31 14:20', reference: 'DIG-223' },
    { id: '5', type: 'agent', amount: 8000, description: 'عمولة وكيل سفر - بوكينج', date: '2025-10-31 13:45', reference: 'AGT-112' },
    { id: '6', type: 'cash', amount: 4200, description: 'حجز غرفة 402', date: '2025-10-31 15:30', reference: 'INV-002' },
    { id: '7', type: 'network', amount: 6800, description: 'فيزا - جناح رئاسي', date: '2025-10-31 16:10', reference: 'POS-446' },
    { id: '8', type: 'bank', amount: 15000, description: 'تحويل - حجز شركة', date: '2025-10-31 08:30', reference: 'BANK-790' }
  ]);

  const filteredTransactions = transactions.filter(t => {
    if (selectedMethod !== 'all' && t.type !== selectedMethod) return false;
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const calculateTotal = (type?: string) => {
    return transactions
      .filter(t => !type || t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMethodConfig = (type: string) => {
    return paymentMethods.find(m => m.id === type) || paymentMethods[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-300 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          رجوع
        </Button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2"
            >
              💰 تقرير حركة الصندوق
            </motion.h1>
            <p className="text-slate-400">متابعة جميع المقبوضات والمدفوعات</p>
          </div>

          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
              <Download className="w-4 h-4 ml-2" />
              تصدير PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {paymentMethods.map((method) => {
          const total = calculateTotal(method.id);
          const Icon = method.icon;
          
          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className={`bg-gradient-to-br ${method.bgColor} border-2 ${method.borderColor} backdrop-blur-sm cursor-pointer hover:scale-105 transition-all duration-300 ${selectedMethod === method.id ? 'ring-2 ring-white shadow-2xl' : ''}`}
                onClick={() => setSelectedMethod(selectedMethod === method.id ? 'all' : method.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.bgColor} border ${method.borderColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${method.color}`} />
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm text-slate-300 mb-1">{method.name}</h3>
                  <p className={`text-2xl font-bold ${method.color}`}>
                    {total.toLocaleString()} ر.س
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Total Summary */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-2 border-purple-500/50 backdrop-blur-sm mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg text-slate-300 mb-1">إجمالي المقبوضات اليوم</h3>
              <p className="text-4xl font-bold text-white">
                {calculateTotal().toLocaleString()} <span className="text-2xl text-slate-400">ر.س</span>
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-2xl">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="بحث في المعاملات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-slate-900/50 border-slate-700"
                />
              </div>
            </div>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
            >
              <option value="today">اليوم</option>
              <option value="yesterday">أمس</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            المعاملات ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => {
              const config = getMethodConfig(transaction.type);
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${config.bgColor} border ${config.borderColor} hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.bgColor} border ${config.borderColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold mb-1">{transaction.description}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${config.bgColor} ${config.color} border ${config.borderColor} text-xs`}>
                        {config.name}
                      </Badge>
                      <span className="text-xs text-slate-400">{transaction.date}</span>
                      {transaction.reference && (
                        <span className="text-xs text-slate-500">#{transaction.reference}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <p className={`text-2xl font-bold ${config.color}`}>
                      {transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">ر.س</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
