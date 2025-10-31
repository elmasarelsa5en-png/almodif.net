'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, 
  X, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ThumbsUp, 
  Award,
  Send,
  Image as ImageIcon
} from 'lucide-react';
import { addRating } from '@/lib/rating-system';

interface RatingDialogProps {
  type: 'service' | 'food' | 'room' | 'employee';
  targetId: string;
  targetName: string;
  guestName: string;
  roomNumber?: string;
  employeeId?: string;
  employeeName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RatingDialog({
  type,
  targetId,
  targetName,
  guestName,
  roomNumber,
  employeeId,
  employeeName,
  onClose,
  onSuccess
}: RatingDialogProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [speed, setSpeed] = useState<number | undefined>();
  const [quality, setQuality] = useState<number | undefined>();
  const [cleanliness, setCleanliness] = useState<number | undefined>();
  const [taste, setTaste] = useState<number | undefined>();
  const [presentation, setPresentation] = useState<number | undefined>();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const ratingData = {
        type,
        targetId,
        targetName,
        rating,
        guestName,
        roomNumber,
        employeeId,
        employeeName,
        comment: comment.trim() || undefined,
        speed,
        quality,
        cleanliness,
        taste,
        presentation
      };

      const ratingId = await addRating(ratingData);
      if (ratingId) {
        onSuccess?.();
        onClose();
        alert('✅ شكراً لك! تم إضافة تقييمك بنجاح');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('❌ حدث خطأ أثناء إضافة التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarSelector = (label: string, value: number | undefined, onChange: (value: number) => void, icon: React.ReactNode) => {
    const [hovered, setHovered] = useState(0);
    
    return (
      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <span className="text-white font-semibold">{label}</span>
          {value && <span className="text-blue-300 text-sm">({value}/5)</span>}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hovered || value || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-500'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const getTypeInfo = () => {
    switch (type) {
      case 'service':
        return {
          title: '🛎️ تقييم الخدمة',
          gradient: 'from-blue-500 to-cyan-500',
          showSpeed: true,
          showQuality: true
        };
      case 'food':
        return {
          title: '🍽️ تقييم الطعام',
          gradient: 'from-orange-500 to-red-500',
          showQuality: true,
          showTaste: true,
          showPresentation: true
        };
      case 'room':
        return {
          title: '🏠 تقييم الشقة',
          gradient: 'from-purple-500 to-pink-500',
          showQuality: true,
          showCleanliness: true
        };
      case 'employee':
        return {
          title: '👨‍💼 تقييم الموظف',
          gradient: 'from-green-500 to-emerald-500',
          showSpeed: true,
          showQuality: true
        };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
        {/* Header */}
        <div className={`bg-gradient-to-r ${typeInfo.gradient} p-6 rounded-t-2xl relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{typeInfo.title}</h2>
            <p className="text-white/90 text-lg font-semibold">{targetName}</p>
            {roomNumber && <p className="text-white/70 text-sm">شقة رقم {roomNumber}</p>}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Main Rating */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-5 border border-yellow-400/30">
            <div className="text-center mb-4">
              <p className="text-white font-bold text-lg mb-2">التقييم الإجمالي</p>
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-2 text-sm text-white/70">
                <span>ضعيف</span>
                <span>•</span>
                <span>متوسط</span>
                <span>•</span>
                <span>ممتاز</span>
              </div>
            </div>
          </div>

          {/* Additional Ratings */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg mb-3">📊 تقييم تفصيلي (اختياري)</h3>
            
            {typeInfo.showSpeed && renderStarSelector(
              'السرعة',
              speed,
              setSpeed,
              <Clock className="w-5 h-5 text-blue-400" />
            )}
            
            {typeInfo.showQuality && renderStarSelector(
              'الجودة',
              quality,
              setQuality,
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            )}
            
            {typeInfo.showCleanliness && renderStarSelector(
              'النظافة',
              cleanliness,
              setCleanliness,
              <Sparkles className="w-5 h-5 text-purple-400" />
            )}
            
            {typeInfo.showTaste && renderStarSelector(
              'الطعم',
              taste,
              setTaste,
              <ThumbsUp className="w-5 h-5 text-yellow-400" />
            )}
            
            {typeInfo.showPresentation && renderStarSelector(
              'العرض والتقديم',
              presentation,
              setPresentation,
              <Award className="w-5 h-5 text-pink-400" />
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-white font-semibold mb-2">
              💭 تعليقك (اختياري)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="شاركنا رأيك وملاحظاتك..."
              rows={4}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 resize-none"
            />
          </div>

          {/* Guest Info */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {guestName[0]}
              </div>
              <div>
                <p className="text-white font-semibold">{guestName}</p>
                {roomNumber && <p className="text-white/60 text-sm">شقة {roomNumber}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 text-lg"
            >
              <Send className="w-5 h-5 ml-2" />
              {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={submitting}
              className="border-white/30 text-white hover:bg-white/10"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
