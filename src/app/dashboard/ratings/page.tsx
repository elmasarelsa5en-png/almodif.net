'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Award,
  Filter,
  Calendar,
  User,
  Sparkles,
  ThumbsUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  getRatingsByType, 
  getRatingsStats, 
  getTopRatedItems,
  respondToRating,
  type Rating 
} from '@/lib/rating-system';
import { useAuth } from '@/contexts/auth-context';

export default function RatingsPage() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'service' | 'food' | 'room' | 'employee'>('all');
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    loadData();
  }, [filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      // جلب الإحصائيات
      const statsData = await getRatingsStats();
      setStats(statsData);

      // جلب التقييمات
      let ratingsData: Rating[] = [];
      if (filterType === 'all') {
        // جلب جميع التقييمات
        const [service, food, room, employee] = await Promise.all([
          getRatingsByType('service'),
          getRatingsByType('food'),
          getRatingsByType('room'),
          getRatingsByType('employee')
        ]);
        ratingsData = [...service, ...food, ...room, ...employee]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        ratingsData = await getRatingsByType(filterType);
      }
      setRatings(ratingsData);

      // جلب الأفضل تقييماً
      const top = await getTopRatedItems(filterType === 'all' ? 'food' : filterType, 5);
      setTopItems(top);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRatings = ratings.filter(rating => {
    if (filterRating === 'all') return true;
    return rating.rating === parseInt(filterRating);
  });

  const handleRespond = async (ratingId: string) => {
    if (!responseText.trim() || !user) return;
    
    const success = await respondToRating(ratingId, responseText, user.name || user.username || 'الإدارة');
    if (success) {
      setResponseText('');
      setSelectedRating(null);
      loadData();
      alert('✅ تم إضافة الرد بنجاح!');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      service: '🛎️ خدمة',
      food: '🍽️ طعام',
      room: '🏠 شقة',
      employee: '👨‍💼 موظف'
    };
    return labels[type] || type;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-500';
    if (rating >= 3.5) return 'text-blue-500';
    if (rating >= 2.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">⭐ نظام التقييمات</h1>
              <p className="text-blue-200">قياس رضا النزلاء وجودة الخدمات</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">إجمالي التقييمات</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">تقييم الخدمات</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">{stats.service.average.toFixed(1)}</p>
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className="text-xs text-white/60">({stats.service.count} تقييم)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">تقييم الطعام</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">{stats.food.average.toFixed(1)}</p>
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className="text-xs text-white/60">({stats.food.count} تقييم)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">تقييم الشقق</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">{stats.room.average.toFixed(1)}</p>
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className="text-xs text-white/60">({stats.room.count} تقييم)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">تقييم الموظفين</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">{stats.employee.average.toFixed(1)}</p>
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className="text-xs text-white/60">({stats.employee.count} تقييم)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Rated Items */}
        {topItems.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                الأعلى تقييماً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {topItems.map((item, index) => (
                  <div
                    key={item.targetId}
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-400/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-white font-bold text-sm mb-1 truncate">{item.targetName}</p>
                    <div className="flex items-center gap-2">
                      {renderStars(item.averageRating, 'sm')}
                      <span className="text-yellow-400 font-bold">{item.averageRating}</span>
                    </div>
                    <p className="text-xs text-white/60 mt-1">({item.totalRatings} تقييم)</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">تصفية:</span>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
              >
                <option value="all">جميع الأنواع</option>
                <option value="service">🛎️ خدمات</option>
                <option value="food">🍽️ طعام</option>
                <option value="room">🏠 شقق</option>
                <option value="employee">👨‍💼 موظفين</option>
              </select>

              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value as any)}
                className="bg-white/10 border-white/30 text-white rounded-lg px-3 py-2"
              >
                <option value="all">جميع التقييمات</option>
                <option value="5">⭐ 5 نجوم</option>
                <option value="4">⭐ 4 نجوم</option>
                <option value="3">⭐ 3 نجوم</option>
                <option value="2">⭐ 2 نجوم</option>
                <option value="1">⭐ 1 نجمة</option>
              </select>

              <div className="flex-1" />

              <div className="text-white/70 text-sm">
                📊 عرض {filteredRatings.length} من {ratings.length} تقييم
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ratings List */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              جميع التقييمات ({filteredRatings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-white">جاري التحميل...</div>
            ) : filteredRatings.length === 0 ? (
              <div className="text-center py-8 text-white/70">لا توجد تقييمات</div>
            ) : (
              <div className="space-y-4">
                {filteredRatings.map((rating) => (
                  <div
                    key={rating.id}
                    className="bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {rating.guestName?.[0] || '؟'}
                      </div>

                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold">{rating.guestName || 'نزيل'}</h3>
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                                {getTypeLabel(rating.type)}
                              </span>
                            </div>
                            <p className="text-sm text-white/70">
                              {rating.targetName}
                              {rating.roomNumber && ` • شقة ${rating.roomNumber}`}
                            </p>
                          </div>
                          <div className="text-right">
                            {renderStars(rating.rating)}
                            <p className="text-xs text-white/50 mt-1">
                              {new Date(rating.createdAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>

                        {/* Additional Ratings */}
                        {(rating.speed || rating.quality || rating.cleanliness || rating.taste || rating.presentation) && (
                          <div className="flex flex-wrap gap-3 mb-3">
                            {rating.speed && (
                              <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-lg">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-white">السرعة: {rating.speed}/5</span>
                              </div>
                            )}
                            {rating.quality && (
                              <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-white">الجودة: {rating.quality}/5</span>
                              </div>
                            )}
                            {rating.cleanliness && (
                              <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1 rounded-lg">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-white">النظافة: {rating.cleanliness}/5</span>
                              </div>
                            )}
                            {rating.taste && (
                              <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-lg">
                                <ThumbsUp className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-white">الطعم: {rating.taste}/5</span>
                              </div>
                            )}
                            {rating.presentation && (
                              <div className="flex items-center gap-2 bg-pink-500/10 px-3 py-1 rounded-lg">
                                <Award className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-white">العرض: {rating.presentation}/5</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Comment */}
                        {rating.comment && (
                          <div className="bg-white/5 rounded-lg p-3 mb-3">
                            <p className="text-white/90 text-sm leading-relaxed">{rating.comment}</p>
                          </div>
                        )}

                        {/* Employee Info */}
                        {rating.employeeName && (
                          <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
                            <User className="w-4 h-4" />
                            <span>تم التنفيذ بواسطة: {rating.employeeName}</span>
                          </div>
                        )}

                        {/* Response */}
                        {rating.response ? (
                          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border-r-4 border-blue-500">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-blue-300">رد الإدارة:</span>
                            </div>
                            <p className="text-white/90 text-sm">{rating.response.text}</p>
                            <p className="text-xs text-white/50 mt-1">
                              {rating.response.respondedBy} • {new Date(rating.response.respondedAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setSelectedRating(rating)}
                            size="sm"
                            variant="outline"
                            className="border-blue-400/30 text-blue-300 hover:bg-blue-500/20"
                          >
                            <MessageSquare className="w-4 h-4 ml-2" />
                            إضافة رد
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Dialog */}
        {selectedRating && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 max-w-lg w-full border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                إضافة رد على التقييم
              </h3>
              
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedRating.guestName?.[0] || '؟'}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{selectedRating.guestName}</p>
                    <div className="flex items-center gap-1">
                      {renderStars(selectedRating.rating, 'sm')}
                    </div>
                  </div>
                </div>
                {selectedRating.comment && (
                  <p className="text-white/70 text-sm">{selectedRating.comment}</p>
                )}
              </div>

              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="اكتب ردك هنا..."
                rows={4}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50 mb-4"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => handleRespond(selectedRating.id!)}
                  disabled={!responseText.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <MessageSquare className="w-4 h-4 ml-2" />
                  إرسال الرد
                </Button>
                <Button
                  onClick={() => {
                    setSelectedRating(null);
                    setResponseText('');
                  }}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
