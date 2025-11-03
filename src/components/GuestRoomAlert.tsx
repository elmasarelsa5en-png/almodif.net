'use client';

import React from 'react';
import { AlertCircle, Home, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface GuestRoomAlertProps {
  guestName?: string;
}

export function GuestRoomAlert({ guestName }: GuestRoomAlertProps) {
  const router = useRouter();

  return (
    <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 shadow-2xl mb-6 animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-500/30 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-300" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                مرحباً {guestName}! 👋
              </h3>
              <p className="text-amber-100 leading-relaxed">
                حسابك تم إنشاؤه بنجاح، ولكن لم يتم تخصيص وحدة لك حتى الآن.
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="flex items-start gap-3 mb-3">
                <Home className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold mb-1">حالة التسجيل:</p>
                  <p className="text-white/80 text-sm">
                    تم استلام طلبك وهو قيد المراجعة من قبل موظف الاستقبال. سيتم تخصيص غرفة لك قريباً.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold mb-1">ما يمكنك فعله الآن:</p>
                  <p className="text-white/80 text-sm">
                    يمكنك التواصل مع الاستقبال مباشرة من خلال الشات الذكي لتسريع عملية التسجيل أو للاستفسار عن أي شيء.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/guest-app/contact')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
              >
                <MessageCircle className="w-4 h-4 ml-2" />
                تواصل مع الاستقبال
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ServiceBlockedAlert({ serviceName }: { serviceName?: string }) {
  const router = useRouter();

  return (
    <Card className="bg-gradient-to-br from-red-500/20 to-rose-500/20 border-2 border-red-500/50 shadow-2xl">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-300" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-3">
          الخدمة غير متاحة
        </h3>
        
        <p className="text-red-100 mb-2 leading-relaxed max-w-md mx-auto">
          {serviceName ? `خدمة ${serviceName} ` : 'هذه الخدمة '}
          غير متاحة حالياً لأنه لم يتم تسجيل دخولك إلى وحدة في الفندق بعد.
        </p>
        
        <p className="text-white/70 text-sm mb-6">
          يرجى التواصل مع موظف الاستقبال لتخصيص غرفة لك وتفعيل جميع الخدمات.
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => router.push('/guest-app/contact')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
          >
            <MessageCircle className="w-4 h-4 ml-2" />
            تواصل مع الاستقبال
          </Button>
          
          <Button
            onClick={() => router.push('/guest-app')}
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            العودة للرئيسية
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
