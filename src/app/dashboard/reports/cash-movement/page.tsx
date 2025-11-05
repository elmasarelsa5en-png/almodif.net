'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CashMovementReport() {
  const router = useRouter();
  
  // State for filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromTime, setFromTime] = useState('00:00');
  const [toTime, setToTime] = useState('23:59');
  const [userName, setUserName] = useState('');
  const [includeServices, setIncludeServices] = useState(true);
  const [showPaymentTypes, setShowPaymentTypes] = useState(false);
  
  // State for data
  const [receipts, setReceipts] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Initialize dates to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
  }, []);
  
  // Load data function
  const loadData = async () => {
    if (!fromDate || !toDate) {
      alert('الرجاء تحديد التاريخ');
      return;
    }
    
    setLoading(true);
    try {
      // Create date range
      const fromDateTime = new Date(`${fromDate}T${fromTime}`);
      const toDateTime = new Date(`${toDate}T${toTime}`);
      
      // Load receipts
      const receiptsRef = collection(db, 'receipts');
      const receiptsQuery = query(
        receiptsRef,
        where('createdAt', '>=', Timestamp.fromDate(fromDateTime)),
        where('createdAt', '<=', Timestamp.fromDate(toDateTime)),
        orderBy('createdAt', 'desc')
      );
      const receiptsSnap = await getDocs(receiptsQuery);
      const receiptsData = receiptsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Load payment vouchers
      const vouchersRef = collection(db, 'payment-vouchers');
      const vouchersQuery = query(
        vouchersRef,
        where('createdAt', '>=', Timestamp.fromDate(fromDateTime)),
        where('createdAt', '<=', Timestamp.fromDate(toDateTime)),
        orderBy('createdAt', 'desc')
      );
      const vouchersSnap = await getDocs(vouchersQuery);
      const vouchersData = vouchersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Filter by user if specified
      const filteredReceipts = userName 
        ? receiptsData.filter(r => r.paidBy?.includes(userName) || r.createdBy?.includes(userName))
        : receiptsData;
        
      const filteredVouchers = userName
        ? vouchersData.filter(v => v.paidTo?.includes(userName) || v.createdBy?.includes(userName))
        : vouchersData;
      
      setReceipts(filteredReceipts);
      setVouchers(filteredVouchers);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const totalReceipts = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalVouchers = vouchers.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
    
    const cashReceipts = receipts
      .filter(r => r.paymentMethod === 'cash')
      .reduce((sum, r) => sum + (r.amount || 0), 0);
      
    const cardReceipts = receipts
      .filter(r => r.paymentMethod === 'card')
      .reduce((sum, r) => sum + (r.amount || 0), 0);
      
    const transferReceipts = receipts
      .filter(r => r.paymentMethod === 'transfer')
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const cashVouchers = vouchers
      .filter(v => v.paidFrom === 'cash_register')
      .reduce((sum, v) => sum + (v.totalAmount || 0), 0);
      
    const bankVouchers = vouchers
      .filter(v => v.paidFrom === 'bank')
      .reduce((sum, v) => sum + (v.totalAmount || 0), 0);
    
    return {
      totalReceipts,
      totalVouchers,
      cashReceipts,
      cardReceipts,
      transferReceipts,
      cashVouchers,
      bankVouchers,
      netCash: cashReceipts - cashVouchers,
      netBank: (cardReceipts + transferReceipts) - bankVouchers,
      netTotal: totalReceipts - totalVouchers
    };
  };
  
  const totals = calculateTotals();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };
  
  // Format date time
  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6" dir="rtl">
      <div className="max-w-[1400px] mx-auto">
        {/* Header - Filter Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-6 mb-6 print:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">📊 تقرير حركة الصندوق</h1>
            <div className="text-sm text-white/70">
              {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} -- {new Date().toLocaleTimeString('ar-SA')}
            </div>
          </div>
          
          {/* First Row - Date and Time Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* From Date */}
            <div>
              <label className="block text-sm text-white/80 mb-2">من</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            
            {/* To Date */}
            <div>
              <label className="block text-sm text-white/80 mb-2">إلى</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            
            {/* From Time */}
            <div>
              <label className="block text-sm text-white/80 mb-2">من الساعة</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={fromTime.split(':')[0]}
                  onChange={(e) => {
                    const val = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                    setFromTime(`${val.toString().padStart(2, '0')}:${fromTime.split(':')[1]}`);
                  }}
                  className="w-16 px-2 py-2 bg-white/10 border border-white/30 rounded text-white text-center"
                />
                <span className="text-white">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={fromTime.split(':')[1]}
                  onChange={(e) => {
                    const val = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                    setFromTime(`${fromTime.split(':')[0]}:${val.toString().padStart(2, '0')}`);
                  }}
                  className="w-16 px-2 py-2 bg-white/10 border border-white/30 rounded text-white text-center"
                />
                <select className="px-2 py-2 bg-white/10 border border-white/30 rounded text-white">
                  <option className="bg-slate-800">ص</option>
                  <option className="bg-slate-800">م</option>
                </select>
              </div>
            </div>
            
            {/* To Time */}
            <div>
              <label className="block text-sm text-white/80 mb-2">إلى الساعة</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={toTime.split(':')[0]}
                  onChange={(e) => {
                    const val = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                    setToTime(`${val.toString().padStart(2, '0')}:${toTime.split(':')[1]}`);
                  }}
                  className="w-16 px-2 py-2 bg-white/10 border border-white/30 rounded text-white text-center"
                />
                <span className="text-white">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={toTime.split(':')[1]}
                  onChange={(e) => {
                    const val = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                    setToTime(`${toTime.split(':')[0]}:${val.toString().padStart(2, '0')}`);
                  }}
                  className="w-16 px-2 py-2 bg-white/10 border border-white/30 rounded text-white text-center"
                />
                <select className="px-2 py-2 bg-white/10 border border-white/30 rounded text-white">
                  <option className="bg-slate-800">ص</option>
                  <option className="bg-slate-800">م</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="-- اسم المستخدم --"
              className="px-3 py-2 bg-white/10 border border-white/30 rounded text-white placeholder:text-white/50"
            />
            
            <select className="px-3 py-2 bg-white/10 border border-white/30 rounded text-white">
              <option className="bg-slate-800">حركة الصندوق للمحجوزات المغلقة</option>
            </select>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeServices}
                onChange={(e) => setIncludeServices(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-white/90">تضمين سندات الخدمات المقدمة نقداً</span>
            </label>
          </div>
          
          {/* Third Row */}
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPaymentTypes}
                onChange={(e) => setShowPaymentTypes(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-white/90">مجاميع انواع طرق الدفع مع التأمين</span>
            </label>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 print:hidden">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-600 shadow-lg transition-all"
            >
              {loading ? 'جاري التحميل...' : 'طباعة'}
            </button>
            <button
              onClick={() => router.back()}
              className="px-8 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 transition-all"
            >
              عرض
            </button>
          </div>
        </div>
        
        {/* Report Content */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-8">
          {/* Report Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-white/30">
            <h2 className="text-2xl font-bold mb-2 text-white">تقرير حركة الصندوق</h2>
            <p className="text-white/70">من {fromDate} {fromTime} إلى {toDate} {toTime}</p>
          </div>
          
          {/* Summary Table - نفس التصميم من الصورة */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr className="bg-white/5">
                  <td colSpan={6} className="px-3 py-2 text-center font-bold border border-white/20 text-white">إجمالي الكمبياليات :</td>
                  <td className="px-3 py-2 text-center font-bold border border-white/20 text-white">0.00</td>
                </tr>
                
                <tr className="bg-blue-500/20">
                  <td className="px-3 py-2 text-center font-bold border border-white/20 text-white">سندات القبض</td>
                  <td className="px-3 py-2 text-center font-bold border border-white/20 text-white">إجمالي القبض</td>
                  <td className="px-3 py-2 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-2 text-center font-bold border border-white/20 text-white">سندات الصرف</td>
                  <td className="px-3 py-2 text-center font-bold border border-white/20 text-white">إجمالي الصرف</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-2 border border-white/20 text-white/90">المقبوضات نقدي ({receipts.filter(r => r.paymentMethod === 'cash').length})</td>
                  <td className="px-3 py-2 text-right font-semibold border border-white/20 text-white">{formatCurrency(totals.cashReceipts)}</td>
                  <td className="px-3 py-2 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-2 border border-white/20 text-white/90">الدفع الرقمي ({vouchers.filter(v => v.paidFrom === 'cash_register').length})</td>
                  <td className="px-3 py-2 text-right font-semibold border border-white/20 text-white">{formatCurrency(totals.cashVouchers)}</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-2 border border-white/20">شبكة ({receipts.filter(r => r.paymentMethod === 'card').length})</td>
                  <td className="px-3 py-2 text-right font-semibold border border-white/20">{formatCurrency(totals.cardReceipts)}</td>
                  <td className="px-3 py-2 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-2 border border-white/20">شيك (0)</td>
                  <td className="px-3 py-2 text-right font-semibold border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-2 border border-white/20">تحويل بنكي ({receipts.filter(r => r.paymentMethod === 'transfer').length})</td>
                  <td className="px-3 py-2 text-right font-semibold border border-white/20">{formatCurrency(totals.transferReceipts)}</td>
                  <td className="px-3 py-2 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-2 border border-white/20">تحويل بنكي ({vouchers.filter(v => v.paidFrom === 'bank').length})</td>
                  <td className="px-3 py-2 text-right font-semibold border border-white/20">{formatCurrency(totals.bankVouchers)}</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-2 border border-white/20">الدفع الرقمي (0)</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-2 border border-white/20">وكلاء السفر (0)</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-2 border border-white/20">وكلاء السفر (0)</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-2 border border-white/20">مقبوضات التأمين (0)</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-2 border border-white/20">شبكة / مدى (0)</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-2 border border-white/20">مصروفات التأمين (0)</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr className="bg-white/5">
                  <td colSpan={7} className="py-1 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-2 border border-white/20">المبالغ المحولة من البنك :</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-2 border border-white/20">المبالغ المحولة إلى البنك :</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-2 border border-white/20">المبالغ المحولة من البنك :</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 font-semibold border border-white/20">صافي البنك :</td>
                  <td className="px-3 py-2 text-right font-bold bg-yellow-500/30 border border-white/20">{formatCurrency(totals.netBank)}</td>
                  <td className="px-3 py-2 border border-white/20">صافي التأمين :</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr className="bg-white/5">
                  <td colSpan={7} className="py-1 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-2 border border-white/20">المبالغ السابقة</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-2 border border-white/20">التأثيرات السابقة :</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-2 border border-white/20">القيمة المضافة على القبض :</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-2 border border-white/20">القيمة المضافة على الصرف :</td>
                  <td className="px-3 py-2 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-2 border border-white/20"></td>
                </tr>
                
                <tr className="bg-blue-500/20">
                  <td className="px-3 py-3 font-bold border border-white/20">إجمالي القبض</td>
                  <td className="px-3 py-3 text-right font-bold text-lg text-green-300 border border-white/20">{formatCurrency(totals.totalReceipts)}</td>
                  <td className="px-3 py-3 border border-white/20" colSpan={2}></td>
                  <td className="px-3 py-3 font-bold border border-white/20">إجمالي الصرف</td>
                  <td className="px-3 py-3 text-right font-bold text-lg text-red-300 border border-white/20">{formatCurrency(totals.totalVouchers)}</td>
                  <td className="px-3 py-3 border border-white/20"></td>
                </tr>
                
                <tr className="bg-white/5">
                  <td colSpan={7} className="py-1 border border-white/20"></td>
                </tr>
                
                <tr>
                  <td className="px-3 py-3 font-bold border border-white/20">المبالغ المحولة إلى البنك :</td>
                  <td className="px-3 py-3 text-right font-bold border border-white/20">{formatCurrency(totals.netBank)}</td>
                  <td className="px-3 py-3 font-semibold border border-white/20">إجمالي الصندوق :</td>
                  <td className="px-3 py-3 text-right font-bold text-green-300 bg-green-100 border border-white/20">{formatCurrency(totals.netCash)}</td>
                  <td className="px-3 py-3 border border-white/20">إجمالي المصندوق :</td>
                  <td className="px-3 py-3 text-right border border-white/20">0.00</td>
                  <td className="px-3 py-3 border border-white/20"></td>
                </tr>
                
                <tr className="bg-green-100">
                  <td className="px-3 py-4 font-bold border border-white/20">رصيد البنك ( للفترة المحددة):</td>
                  <td className="px-3 py-4 text-right font-bold text-xl text-green-300 border border-white/20">{formatCurrency(totals.netBank)}</td>
                  <td className="px-3 py-4 border border-white/20" colSpan={5}></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Detailed Transactions */}
          <div className="border-t-2 border-white/20 pt-6">
            <h3 className="text-xl font-bold mb-4">سندات القبض</h3>
            <table className="w-full border-collapse text-sm mb-8">
              <thead className="bg-blue-500/20">
                <tr>
                  <th className="px-3 py-2 border border-white/20">رقم السند</th>
                  <th className="px-3 py-2 border border-white/20">التاريخ</th>
                  <th className="px-3 py-2 border border-white/20">طريقة الدفع</th>
                  <th className="px-3 py-2 border border-white/20">من أجل</th>
                  <th className="px-3 py-2 border border-white/20">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {receipts.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-500 border border-white/20">لا توجد سندات قبض</td></tr>
                ) : (
                  receipts.map(r => (
                    <tr key={r.id} className="hover:bg-white/5">
                      <td className="px-3 py-2 text-center border border-white/20">{r.receiptNumber || r.id}</td>
                      <td className="px-3 py-2 text-center border border-white/20">{formatDateTime(r.createdAt)}</td>
                      <td className="px-3 py-2 text-center border border-white/20">
                        {r.paymentMethod === 'cash' && 'نقدي'}
                        {r.paymentMethod === 'card' && 'شبكة / مدى'}
                        {r.paymentMethod === 'transfer' && 'تحويل بنكي'}
                      </td>
                      <td className="px-3 py-2 border border-white/20">{r.description}</td>
                      <td className="px-3 py-2 text-right font-semibold border border-white/20">{formatCurrency(r.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            <h3 className="text-xl font-bold mb-4 mt-8">سندات الصرف</h3>
            <table className="w-full border-collapse text-sm">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-3 py-2 border border-white/20">رقم السند</th>
                  <th className="px-3 py-2 border border-white/20">التاريخ</th>
                  <th className="px-3 py-2 border border-white/20">من أجل</th>
                  <th className="px-3 py-2 border border-white/20">دفع من</th>
                  <th className="px-3 py-2 border border-white/20">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-500 border border-white/20">لا توجد سندات صرف</td></tr>
                ) : (
                  vouchers.map(v => (
                    <tr key={v.id} className="hover:bg-white/5">
                      <td className="px-3 py-2 text-center border border-white/20">{v.voucherNumber || v.id}</td>
                      <td className="px-3 py-2 text-center border border-white/20">{formatDateTime(v.createdAt)}</td>
                      <td className="px-3 py-2 border border-white/20">{v.description}</td>
                      <td className="px-3 py-2 text-center border border-white/20">{v.paidFrom === 'cash_register' ? 'الصندوق' : 'البنك'}</td>
                      <td className="px-3 py-2 text-right font-semibold border border-white/20">{formatCurrency(v.totalAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-white/70 border-t-2 border-white/20 pt-4">
            اخر تحويل للبنك في تاريخ '05/11/2025' الساعة '11:32 PM' بقيمة '$453.5' برقم سند رقم '00834'
          </div>
          
          {/* Bottom Summary */}
          <div className="mt-6 grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="flex justify-between py-1"><span>( المقبوضات نقدي :</span><span>{formatCurrency(totals.cashReceipts)}</span></div>
              <div className="flex justify-between py-1"><span>شبكة :</span><span>{formatCurrency(totals.cardReceipts)}</span></div>
              <div className="flex justify-between py-1"><span>تحويل بنكي :</span><span>{formatCurrency(totals.transferReceipts)}</span></div>
              <div className="flex justify-between py-1"><span>الدفع الرقمي :</span><span>0.00</span></div>
              <div className="flex justify-between py-1"><span>وكلاء السفر :</span><span>0.00</span></div>
              <div className="flex justify-between py-1 border-t mt-2 pt-2 font-bold"><span>إجمالي الكمبياليات :</span><span>0.00</span></div>
            </div>
            <div>
              <div className="flex justify-between py-1"><span>الدفع الرقمي :</span><span>{formatCurrency(totals.cashVouchers)}</span></div>
              <div className="flex justify-between py-1"><span>شيك :</span><span>0.00</span></div>
              <div className="flex justify-between py-1"><span>تحويل بنكي :</span><span>{formatCurrency(totals.bankVouchers)}</span></div>
              <div className="flex justify-between py-1"><span>وكلاء السفر :</span><span>0.00</span></div>
              <div className="flex justify-between py-1"><span>مقبوضات التأمين :</span><span>0.00</span></div>
              <div className="flex justify-between py-1"><span>مصروفات التأمين :</span><span>0.00</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
