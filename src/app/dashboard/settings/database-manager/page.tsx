'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  Search,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  Plus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Filter,
  Table,
  FileJson
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/auth-context';

interface Collection {
  name: string;
  count: number;
  icon: string;
}

export default function DatabaseManagerPage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalDocuments: 0,
    storageSize: '0 MB'
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      // القوائم الرئيسية في Firebase
      const collectionsList = [
        { name: 'rooms', icon: '🏠' },
        { name: 'bookings', icon: '📅' },
        { name: 'guests', icon: '👥' },
        { name: 'requests', icon: '🛎️' },
        { name: 'invoices', icon: '📄' },
        { name: 'expenses', icon: '💸' },
        { name: 'receipts', icon: '🧾' },
        { name: 'users', icon: '👤' },
        { name: 'settings', icon: '⚙️' },
        { name: 'conversations', icon: '💬' },
        { name: 'messages', icon: '✉️' },
        { name: 'menuItems', icon: '🍽️' },
        { name: 'orders', icon: '🛒' },
        { name: 'loyaltyMembers', icon: '🎁' },
        { name: 'ratings', icon: '⭐' },
        { name: 'maintenanceTasks', icon: '🔧' }
      ];

      const collectionsData: Collection[] = [];
      let totalDocs = 0;

      for (const col of collectionsList) {
        try {
          const snapshot = await getDocs(collection(db, col.name));
          const count = snapshot.size;
          collectionsData.push({
            name: col.name,
            count,
            icon: col.icon
          });
          totalDocs += count;
        } catch (error) {
          console.log(`Collection ${col.name} not found or empty`);
        }
      }

      setCollections(collectionsData);
      setStats({
        totalCollections: collectionsData.length,
        totalDocuments: totalDocs,
        storageSize: `${(totalDocs * 0.5).toFixed(2)} MB` // تقدير
      });
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (collectionName: string) => {
    setLoading(true);
    setSelectedCollection(collectionName);
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (collectionName: string, docId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) return;
    
    try {
      await deleteDoc(doc(db, collectionName, docId));
      await loadDocuments(collectionName);
      alert('تم الحذف بنجاح');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('فشل الحذف');
    }
  };

  const filteredDocuments = documents.filter(doc => 
    JSON.stringify(doc).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">إدارة قاعدة البيانات</h1>
              <p className="text-white/70">استعراض وإدارة بيانات Firebase Firestore</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">إجمالي المجموعات</p>
                  <p className="text-3xl font-bold text-white">{stats.totalCollections}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Table className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">إجمالي المستندات</p>
                  <p className="text-3xl font-bold text-white">{stats.totalDocuments}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <FileJson className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">حجم التخزين التقديري</p>
                  <p className="text-3xl font-bold text-white">{stats.storageSize}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Collections List */}
          <Card className="lg:col-span-1 bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Table className="w-5 h-5" />
                المجموعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-white/70 text-center py-4">جاري التحميل...</div>
                ) : (
                  collections.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => loadDocuments(col.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        selectedCollection === col.name
                          ? 'bg-purple-500/30 border border-purple-400/50'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{col.icon}</span>
                        <span className="text-white font-medium">{col.name}</span>
                      </div>
                      <Badge className="bg-white/20 text-white">{col.count}</Badge>
                    </button>
                  ))
                )}
              </div>
              
              <Button 
                onClick={loadCollections}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                تحديث
              </Button>
            </CardContent>
          </Card>

          {/* Documents View */}
          <Card className="lg:col-span-3 bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileJson className="w-5 h-5" />
                  {selectedCollection || 'المستندات'}
                  {selectedCollection && (
                    <Badge className="bg-purple-500/20 text-purple-300">
                      {filteredDocuments.length} مستند
                    </Badge>
                  )}
                </div>
                {selectedCollection && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Download className="w-4 h-4 mr-1" />
                      تصدير JSON
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCollection ? (
                <>
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="بحث في المستندات..."
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {loading ? (
                      <div className="text-white/70 text-center py-8">جاري التحميل...</div>
                    ) : filteredDocuments.length === 0 ? (
                      <div className="text-white/70 text-center py-8">لا توجد مستندات</div>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-blue-500/20 text-blue-300 font-mono text-xs">
                                  {doc.id}
                                </Badge>
                              </div>
                              <pre className="text-xs text-white/70 bg-black/20 p-3 rounded overflow-x-auto">
                                {JSON.stringify(doc, null, 2)}
                              </pre>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                              <Eye className="w-4 h-4 mr-1" />
                              عرض
                            </Button>
                            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                              <Edit className="w-4 h-4 mr-1" />
                              تعديل
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDeleteDocument(selectedCollection, doc.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <Database className="w-20 h-20 text-white/20 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">اختر مجموعة لعرض المستندات</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
