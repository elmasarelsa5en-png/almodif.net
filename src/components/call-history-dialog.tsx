'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { webrtcService, CallHistory } from '@/lib/webrtc-service';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CallHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
  otherUserId?: string; // If provided, show history between two users
}

export function CallHistoryDialog({
  open,
  onOpenChange,
  userId,
  userName,
  otherUserId
}: CallHistoryDialogProps) {
  const [calls, setCalls] = useState<CallHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'audio' | 'video'>('all');

  useEffect(() => {
    if (open) {
      loadCallHistory();
    }
  }, [open, userId, otherUserId]);

  const loadCallHistory = async () => {
    try {
      setLoading(true);
      let history: CallHistory[];
      
      if (otherUserId) {
        // Get history between two users
        history = await webrtcService.getCallHistoryBetween(userId, otherUserId);
      } else {
        // Get all user's history
        history = await webrtcService.getCallHistory(userId, 100);
      }
      
      setCalls(history);
    } catch (error) {
      console.error('Failed to load call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCallIcon = (call: CallHistory) => {
    const isOutgoing = call.from === userId;
    const isMissed = call.status === 'missed' || call.status === 'rejected';
    
    if (isMissed) {
      return <PhoneMissed className="w-5 h-5 text-red-500" />;
    }
    
    if (call.type === 'video') {
      return <Video className="w-5 h-5 text-blue-500" />;
    }
    
    return isOutgoing ? 
      <PhoneOutgoing className="w-5 h-5 text-green-500" /> : 
      <PhoneIncoming className="w-5 h-5 text-blue-500" />;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}ث`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}د ${secs}ث`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}س ${mins}د`;
  };

  const getCallStatus = (call: CallHistory) => {
    switch (call.status) {
      case 'accepted':
        return 'تمت الإجابة';
      case 'rejected':
        return 'تم الرفض';
      case 'missed':
        return 'فائتة';
      case 'ended':
        return 'انتهت';
      default:
        return call.status;
    }
  };

  const filteredCalls = calls.filter(call => {
    if (filter === 'all') return true;
    return call.type === filter;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {otherUserId ? `سجل المكالمات مع ${userName || 'المستخدم'}` : 'سجل المكالمات'}
          </DialogTitle>
        </DialogHeader>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            الكل ({calls.length})
          </button>
          <button
            onClick={() => setFilter('audio')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'audio' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            صوتية ({calls.filter(c => c.type === 'audio').length})
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'video' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Video className="w-4 h-4" />
            فيديو ({calls.filter(c => c.type === 'video').length})
          </button>
        </div>

        {/* Call List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">جاري التحميل...</p>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد مكالمات</p>
            </div>
          ) : (
            filteredCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Call Icon */}
                <div className="flex-shrink-0">
                  {getCallIcon(call)}
                </div>

                {/* Call Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">
                      {call.from === userId ? 
                        (otherUserId ? userName : 'مكالمة صادرة') : 
                        call.fromName || 'مكالمة واردة'}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {getCallStatus(call)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(call.startedAt, { 
                        addSuffix: true, 
                        locale: ar 
                      })}
                    </span>
                    
                    {call.status === 'accepted' && call.duration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(call.duration)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Call Type Badge */}
                <div className="flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    call.type === 'video' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {call.type === 'video' ? 'فيديو' : 'صوت'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
