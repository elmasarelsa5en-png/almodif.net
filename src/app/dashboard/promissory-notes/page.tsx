'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  RefreshCw,
  Scale,
  Bell
} from 'lucide-react';
import {
  getAllPromissoryNotes,
  getNotesByStatus,
  getNotesByType,
  getOverdueNotes,
  getNotesDueBetween,
  getNotesStatistics,
  createPromissoryNote,
  updatePromissoryNote,
  recordPayment,
  cancelNote,
  renewNote,
  convertToLegalNote,
  getNoteHistory,
  getNotePayments,
  subscribeToPromissoryNotes,
  type PromissoryNote,
  type NoteStatus,
  type PromissoryNoteType,
  type NotesStatistics
} from '@/lib/promissory-notes-system';
import { useAuth } from '@/contexts/auth-context';

export default function PromissoryNotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<PromissoryNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<PromissoryNote[]>([]);
  const [statistics, setStatistics] = useState<NotesStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'receivable' | 'payable'>('all');
  const [selectedStatus, setSelectedStatus] = useState<NoteStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<PromissoryNote | null>(null);

  // Load data
  useEffect(() => {
    loadData();
    
    // Real-time subscription
    const unsubscribe = subscribeToPromissoryNotes((updatedNotes) => {
      setNotes(updatedNotes);
    });
    
    return () => unsubscribe();
  }, []);

  // Load statistics
  useEffect(() => {
    loadStatistics();
  }, [notes]);

  // Filter notes
  useEffect(() => {
    filterNotes();
  }, [notes, selectedTab, selectedStatus, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllPromissoryNotes();
      setNotes(data);
    } catch (error) {
      console.error('Error loading promissory notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getNotesStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    // Filter by type
    if (selectedTab !== 'all') {
      filtered = filtered.filter(note => note.type === selectedTab);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(note => note.status === selectedStatus);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.noteNumber.toLowerCase().includes(query) ||
        note.issuerName.toLowerCase().includes(query) ||
        note.beneficiaryName.toLowerCase().includes(query) ||
        note.amount.toString().includes(query)
      );
    }

    setFilteredNotes(filtered);
  };

  const getStatusBadge = (status: NoteStatus) => {
    const styles = {
      active: 'bg-blue-100 text-blue-800',
      due: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      partially_paid: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-gray-100 text-gray-800',
      bounced: 'bg-red-200 text-red-900',
      renewed: 'bg-purple-100 text-purple-800',
      converted_to_legal: 'bg-indigo-100 text-indigo-800'
    };

    const labels = {
      active: 'نشط',
      due: 'مستحق',
      overdue: 'متأخر',
      paid: 'مدفوع',
      partially_paid: 'مدفوع جزئياً',
      cancelled: 'ملغي',
      bounced: 'مرتد',
      renewed: 'مجدد',
      converted_to_legal: 'سند قضائي'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getDaysUntilDue = (dueDate: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">سندات الكمبيالات</h1>
        <p className="text-gray-600">إدارة سندات الكمبيالات والأوراق التجارية</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Notes */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">إجمالي السندات</p>
                <p className="text-3xl font-bold">{statistics.total}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {statistics.byType.receivable} مدين
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    {statistics.byType.payable} دائن
                  </span>
                </div>
              </div>
              <FileText className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">إجمالي المبلغ</p>
                <p className="text-3xl font-bold">{statistics.totalAmount.toLocaleString()}</p>
                <p className="text-green-100 text-sm mt-2">ريال سعودي</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-200" />
            </div>
          </div>

          {/* Overdue Amount */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">المبلغ المتأخر</p>
                <p className="text-3xl font-bold">{statistics.overdueAmount.toLocaleString()}</p>
                <p className="text-red-100 text-sm mt-2">
                  {statistics.byStatus.overdue} سند متأخر
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-200" />
            </div>
          </div>

          {/* Due This Month */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">مستحق هذا الشهر</p>
                <p className="text-3xl font-bold">{statistics.dueThisMonth.toLocaleString()}</p>
                <p className="text-yellow-100 text-sm mt-2">ريال سعودي</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-200" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              الكل ({notes.length})
            </button>
            <button
              onClick={() => setSelectedTab('receivable')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedTab === 'receivable'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              مدين ({statistics?.byType.receivable || 0})
            </button>
            <button
              onClick={() => setSelectedTab('payable')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedTab === 'payable'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              دائن ({statistics?.byType.payable || 0})
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
          >
            <Plus className="w-5 h-5" />
            سند جديد
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث برقم السند، المصدر، المستفيد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as NoteStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="due">مستحق</option>
            <option value="overdue">متأخر</option>
            <option value="paid">مدفوع</option>
            <option value="partially_paid">مدفوع جزئياً</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">لا توجد سندات</p>
            <p className="text-gray-500">ابدأ بإنشاء سند كمبيالة جديد</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const daysUntilDue = getDaysUntilDue(note.dueDate);
            const isUrgent = daysUntilDue <= 7 && daysUntilDue >= 0 && note.status !== 'paid';
            const isOverdue = daysUntilDue < 0 && note.status !== 'paid';

            return (
              <div
                key={note.id}
                className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-r-4 ${
                  note.type === 'receivable' ? 'border-r-green-500' : 'border-r-red-500'
                } ${isOverdue ? 'ring-2 ring-red-500' : isUrgent ? 'ring-2 ring-yellow-500' : ''}`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{note.noteNumber}</h3>
                      {getStatusBadge(note.status)}
                      {note.type === 'receivable' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          مدين
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                          دائن
                        </span>
                      )}
                      {isUrgent && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          عاجل
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>المُصدر: {note.issuerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>المستفيد: {note.beneficiaryName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>تاريخ الاستحقاق: {new Date(note.dueDate).toLocaleDateString('ar')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {isOverdue
                            ? `متأخر ${Math.abs(daysUntilDue)} يوم`
                            : daysUntilDue === 0
                            ? 'مستحق اليوم'
                            : `متبقي ${daysUntilDue} يوم`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount Info */}
                  <div className="text-left border-r pr-6">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {note.amount.toLocaleString()} {note.currency}
                    </div>
                    {note.paidAmount > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="text-green-600 font-medium">
                          مدفوع: {note.paidAmount.toLocaleString()}
                        </span>
                        <br />
                        <span className="text-orange-600 font-medium">
                          متبقي: {note.remainingAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="mt-2">
                      {/* Progress Bar */}
                      {note.paidAmount > 0 && (
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${(note.paidAmount / note.amount) * 100}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(note.bank || note.checkNumber) && (
                  <div className="mt-4 pt-4 border-t flex gap-4 text-sm text-gray-600">
                    {note.bank && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>البنك: {note.bank}</span>
                      </div>
                    )}
                    {note.checkNumber && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>شيك رقم: {note.checkNumber}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
