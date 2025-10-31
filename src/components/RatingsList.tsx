'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Clock, CheckCircle2, Sparkles, Award, MessageSquare, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getRatingsByTarget, getRatingSummary, type Rating, type RatingSummary } from '@/lib/rating-system';

interface RatingsListProps {
  targetId: string;
  targetType: 'service' | 'food' | 'room' | 'employee';
  showSummary?: boolean;
}

export function RatingsList({ targetId, targetType, showSummary = true }: RatingsListProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, [targetId]);

  const loadRatings = async () => {
    setLoading(true);
    try {
      const ratingsData = await getRatingsByTarget(targetId);
      setRatings(ratingsData);

      if (showSummary) {
        const summaryData = await getRatingSummary(targetId);
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
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

  if (loading) {
    return (
      <div className="text-center py-8 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4">جاري التحميل...</p>
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-8 text-center">
          <Star className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
          <p className="text-white/70">لا توجد تقييمات بعد</p>
          <p className="text-white/50 text-sm mt-2">كن أول من يضيف تقييماً!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {showSummary && summary && (
        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              ملخص التقييمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-400 mb-2">
                  {summary.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(summary.averageRating))}
                </div>
                <p className="text-white/70 text-sm">
                  بناءً على {summary.totalRatings} تقييم
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary.distribution[star] || 0;
                  const percentage = summary.totalRatings > 0 
                    ? (count / summary.totalRatings) * 100 
                    : 0;
                  
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-white text-sm w-8">{star} ⭐</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-white/70 text-sm w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Ratings */}
            {(summary.averageSpeed || summary.averageQuality || summary.averageCleanliness || summary.averageTaste || summary.averagePresentation) && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {summary.averageSpeed && (
                    <div className="text-center">
                      <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">{summary.averageSpeed.toFixed(1)}</div>
                      <p className="text-white/60 text-xs">السرعة</p>
                    </div>
                  )}
                  {summary.averageQuality && (
                    <div className="text-center">
                      <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">{summary.averageQuality.toFixed(1)}</div>
                      <p className="text-white/60 text-xs">الجودة</p>
                    </div>
                  )}
                  {summary.averageCleanliness && (
                    <div className="text-center">
                      <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">{summary.averageCleanliness.toFixed(1)}</div>
                      <p className="text-white/60 text-xs">النظافة</p>
                    </div>
                  )}
                  {summary.averageTaste && (
                    <div className="text-center">
                      <ThumbsUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">{summary.averageTaste.toFixed(1)}</div>
                      <p className="text-white/60 text-xs">الطعم</p>
                    </div>
                  )}
                  {summary.averagePresentation && (
                    <div className="text-center">
                      <Award className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">{summary.averagePresentation.toFixed(1)}</div>
                      <p className="text-white/60 text-xs">العرض</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ratings List */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            التقييمات ({ratings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {rating.guestName?.[0] || '؟'}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{rating.guestName || 'نزيل'}</p>
                      {rating.roomNumber && (
                        <p className="text-white/60 text-sm">شقة {rating.roomNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(rating.rating, 'sm')}
                    <p className="text-white/50 text-xs mt-1">
                      {new Date(rating.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>

                {/* Additional Ratings */}
                {(rating.speed || rating.quality || rating.cleanliness || rating.taste || rating.presentation) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {rating.speed && (
                      <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-400/30 text-blue-300">
                        <Clock className="w-3 h-3 ml-1" />
                        السرعة: {rating.speed}/5
                      </Badge>
                    )}
                    {rating.quality && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 border-green-400/30 text-green-300">
                        <CheckCircle2 className="w-3 h-3 ml-1" />
                        الجودة: {rating.quality}/5
                      </Badge>
                    )}
                    {rating.cleanliness && (
                      <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-400/30 text-purple-300">
                        <Sparkles className="w-3 h-3 ml-1" />
                        النظافة: {rating.cleanliness}/5
                      </Badge>
                    )}
                    {rating.taste && (
                      <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-400/30 text-yellow-300">
                        <ThumbsUp className="w-3 h-3 ml-1" />
                        الطعم: {rating.taste}/5
                      </Badge>
                    )}
                    {rating.presentation && (
                      <Badge variant="outline" className="text-xs bg-pink-500/10 border-pink-400/30 text-pink-300">
                        <Award className="w-3 h-3 ml-1" />
                        العرض: {rating.presentation}/5
                      </Badge>
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
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <User className="w-3 h-3" />
                    <span>تم التنفيذ بواسطة: {rating.employeeName}</span>
                  </div>
                )}

                {/* Management Response */}
                {rating.response && (
                  <div className="mt-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border-r-4 border-blue-500">
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
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
