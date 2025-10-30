'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, MessageSquare, User, Phone, Hotel, 
  Calendar, ThumbsUp, ThumbsDown, CheckCircle, Clock,
  Filter, Search, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';

interface GuestReview {
  id: string;
  guestName: string;
  guestPhone: string;
  nationalId: string;
  roomNumber: string;
  rating: number;
  reviewType: 'positive' | 'negative';
  comment: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'responded';
}

export default function GuestReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<GuestReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<GuestReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('all');

  useEffect(() => {
    // Subscribe to reviews in real-time
    const reviewsRef = collection(db, 'guest-reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as GuestReview));
      
      setReviews(reviewsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter reviews
  useEffect(() => {
    let filtered = reviews;

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.reviewType === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.roomNumber.includes(searchTerm) ||
        r.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  }, [reviews, filterType, filterStatus, searchTerm]);

  const handleMarkAsReviewed = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, 'guest-reviews', reviewId), {
        status: 'reviewed'
      });
      alert('✅ تم وضع علامة "تمت المراجعة"');
    } catch (error) {
      console.error('Error updating review:', error);
      alert('حدث خطأ');
    }
  };

  const handleDelete = async (reviewId: string, guestName: string) => {
    if (!confirm(`هل تريد حذف تقييم ${guestName}؟`)) return;

    try {
      await deleteDoc(doc(db, 'guest-reviews', reviewId));
      alert('✅ تم الحذف');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('حدث خطأ');
    }
  };

  const stats = {
    total: reviews.length,
    positive: reviews.filter(r => r.reviewType === 'positive').length,
    negative: reviews.filter(r => r.reviewType === 'negative').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">تقييمات النزلاء</h1>
              <p className="text-purple-200 mt-1">متابعة آراء وملاحظات الضيوف</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gray-800/50 border-gray-600/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">إجمالي التقييمات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-600/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">متوسط التقييم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-yellow-400">{stats.averageRating}</p>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-600/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-200 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                إيجابية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">{stats.positive}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-600/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-200 flex items-center gap-2">
                <ThumbsDown className="w-4 h-4" />
                ملاحظات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-400">{stats.negative}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-600/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-200 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                بانتظار المراجعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-400">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-600/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="بحث عن تقييم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-full md:w-[180px] bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="نوع التقييم" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">الكل</SelectItem>
                  <SelectItem value="positive" className="text-white hover:bg-gray-700">إيجابية</SelectItem>
                  <SelectItem value="negative" className="text-white hover:bg-gray-700">ملاحظات</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-full md:w-[180px] bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">الكل</SelectItem>
                  <SelectItem value="pending" className="text-white hover:bg-gray-700">بانتظار المراجعة</SelectItem>
                  <SelectItem value="reviewed" className="text-white hover:bg-gray-700">تمت المراجعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-white py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>جاري التحميل...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-600/50">
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-white/60 text-lg">لا توجد تقييمات</p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50 transition-all ${
                  review.reviewType === 'positive' ? 'border-r-4 border-r-green-500' : 'border-r-4 border-r-red-500'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          review.reviewType === 'positive' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {review.reviewType === 'positive' ? (
                            <ThumbsUp className="w-6 h-6 text-green-400" />
                          ) : (
                            <ThumbsDown className="w-6 h-6 text-red-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white">{review.guestName}</h3>
                            <Badge className={`${
                              review.status === 'pending' ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'
                            }`}>
                              {review.status === 'pending' ? 'جديد' : 'تمت المراجعة'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Hotel className="w-4 h-4" />
                              <span>غرفة {review.roomNumber}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{review.guestPhone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(review.createdAt).toLocaleDateString('ar-SA')}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                                }`}
                              />
                            ))}
                            <span className="text-white mr-2 font-bold">{review.rating}/5</span>
                          </div>
                          
                          <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                            <p className="text-white leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {review.status === 'pending' && (
                          <Button
                            onClick={() => handleMarkAsReviewed(review.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            تمت المراجعة
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(review.id, review.guestName)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
