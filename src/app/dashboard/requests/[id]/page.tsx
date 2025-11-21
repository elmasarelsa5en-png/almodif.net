'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit2,
  Send,
  Loader2,
  MessageCircle,
  Tag,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

interface GuestRequest {
  id: string;
  guestName: string;
  guestPhone: string;
  roomNumber: string;
  requestType: string;
  category: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  notes?: string;
  attachments?: string[];
}

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  timestamp: string;
}

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const requestId = params.id as string;

  const [request, setRequest] = useState<GuestRequest | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [editPriority, setEditPriority] = useState<string | null>(null);

  useEffect(() => {
    loadRequestDetails();
    loadComments();
  }, [requestId]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'guest-requests', requestId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setRequest({
          id: docSnap.id,
          ...docSnap.data()
        } as GuestRequest);
        setEditStatus(docSnap.data().status);
        setEditPriority(docSnap.data().priority);
      } else {
        console.error('Request not found');
      }
    } catch (error) {
      console.error('Error loading request:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const commentsRef = collection(db, 'guest-requests', requestId, 'comments');
      const q = query(commentsRef);
      const querySnapshot = await getDocs(q);

      const commentsData: Comment[] = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({
          id: doc.id,
          ...doc.data()
        } as Comment);
      });

      setComments(commentsData.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      setSaving(true);
      const commentsRef = collection(db, 'guest-requests', requestId, 'comments');
      
      await addDoc(commentsRef, {
        author: user.displayName || user.email,
        authorRole: 'staff',
        text: newComment,
        timestamp: new Date().toISOString(),
      });

      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!request) return;

    try {
      setSaving(true);
      const docRef = doc(db, 'guest-requests', requestId);
      
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      setRequest({
        ...request,
        status: newStatus as any,
      });
      
      setEditStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePriorityUpdate = async (newPriority: string) => {
    if (!request) return;

    try {
      setSaving(true);
      const docRef = doc(db, 'guest-requests', requestId);
      
      await updateDoc(docRef, {
        priority: newPriority,
        updatedAt: new Date().toISOString(),
      });

      setRequest({
        ...request,
        priority: newPriority as any,
      });
      
      setEditPriority(newPriority);
    } catch (error) {
      console.error('Error updating priority:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      'in-progress': 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      'completed': 'bg-green-500/20 text-green-300 border-green-400/30',
      'rejected': 'bg-red-500/20 text-red-300 border-red-400/30'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-300';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': 'bg-blue-500/20 text-blue-300',
      'medium': 'bg-yellow-500/20 text-yellow-300',
      'high': 'bg-red-500/20 text-red-300'
    };
    return colors[priority] || 'bg-slate-500/20 text-slate-300';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-400 rounded-full"
          />
        </div>
      </ProtectedRoute>
    );
  }

  if (!request) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">الطلب غير موجود</h1>
            <p className="text-slate-400 mb-6">لم يتم العثور على الطلب المطلوب</p>
            <Button
              onClick={() => router.back()}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8" dir="rtl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="text-orange-200 hover:bg-orange-500/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-purple-300">
                  تفاصيل الطلب
                </h1>
                <p className="text-slate-400">#{request.id}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(request.status)} border`}>
              {request.status === 'pending' && 'قيد الانتظار'}
              {request.status === 'in-progress' && 'قيد المعالجة'}
              {request.status === 'completed' && 'مكتمل'}
              {request.status === 'rejected' && 'مرفوض'}
            </Badge>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Details - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-300">
                    <User className="w-5 h-5" />
                    معلومات النزيل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">الاسم</p>
                      <p className="text-lg font-semibold text-white">{request.guestName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">رقم الغرفة</p>
                      <p className="text-lg font-semibold text-white">{request.roomNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">رقم الهاتف</p>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-400" />
                        <p className="text-sm text-white">{request.guestPhone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">نوع الطلب</p>
                      <p className="text-sm text-orange-300">{request.requestType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Request Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-300">
                    <FileText className="w-5 h-5" />
                    تفاصيل الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">الوصف</p>
                    <p className="text-white bg-slate-900/50 p-3 rounded-lg">{request.description}</p>
                  </div>
                  {request.notes && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">ملاحظات</p>
                      <p className="text-slate-300 bg-slate-900/50 p-3 rounded-lg">{request.notes}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/30">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">تاريخ الإنشاء</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <p className="text-sm text-white">
                          {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">آخر تحديث</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <p className="text-sm text-white">
                          {new Date(request.updatedAt).toLocaleTimeString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-300">
                    <MessageCircle className="w-5 h-5" />
                    التعليقات ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Comment */}
                  <div className="space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="أضف تعليقاً..."
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || saving}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          إرسال التعليق
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {comments.length === 0 ? (
                      <p className="text-center text-slate-400 py-4">لا توجد تعليقات حتى الآن</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-orange-300">{comment.author}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(comment.timestamp).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <p className="text-slate-300 text-sm">{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Status Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-orange-300">الحالة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['pending', 'in-progress', 'completed', 'rejected'].map((status) => (
                    <Button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={saving}
                      variant={editStatus === status ? 'default' : 'outline'}
                      className={`w-full justify-start ${
                        editStatus === status
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      {status === 'pending' && 'قيد الانتظار'}
                      {status === 'in-progress' && 'قيد المعالجة'}
                      {status === 'completed' && 'مكتمل'}
                      {status === 'rejected' && 'مرفوض'}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Priority Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-300">
                    <Zap className="w-5 h-5" />
                    الأولوية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <Button
                      key={priority}
                      onClick={() => handlePriorityUpdate(priority)}
                      disabled={saving}
                      variant={editPriority === priority ? 'default' : 'outline'}
                      className={`w-full justify-start ${
                        editPriority === priority
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      {priority === 'low' && '⬇️ منخفضة'}
                      {priority === 'medium' && '⬅️ متوسطة'}
                      {priority === 'high' && '⬆️ عالية'}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Request Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-sm text-slate-400">معلومات إضافية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">الفئة</p>
                    <Badge className="bg-purple-500/20 text-purple-300">
                      {request.category}
                    </Badge>
                  </div>
                  {request.assignedTo && (
                    <div>
                      <p className="text-slate-400 mb-1">مسند إلى</p>
                      <p className="text-white">{request.assignedTo}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
