'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, MessageCircle, Send, Camera, Music, Plane, ArrowRight, CheckCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Platform = 'whatsapp' | 'messenger' | 'snapchat' | 'instagram' | 'tiktok' | 'telegram' | null;

export default function SocialMediaPlatformsPage() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);

  const platforms = [
    {
      id: 'whatsapp' as Platform,
      name: 'WhatsApp',
      nameAr: 'واتساب',
      icon: MessageSquare,
      color: 'from-green-500 to-green-600',
      description: 'تواصل مع العملاء عبر WhatsApp',
      status: 'متاح',
      connected: false
    },
    {
      id: 'messenger' as Platform,
      name: 'Messenger',
      nameAr: 'ماسنجر',
      icon: MessageCircle,
      color: 'from-blue-500 to-blue-600',
      description: 'محادثات فيسبوك ماسنجر',
      status: 'قريباً',
      connected: false
    },
    {
      id: 'snapchat' as Platform,
      name: 'Snapchat',
      nameAr: 'سناب شات',
      icon: Camera,
      color: 'from-yellow-400 to-yellow-500',
      description: 'رسائل سناب شات',
      status: 'قريباً',
      connected: false
    },
    {
      id: 'instagram' as Platform,
      name: 'Instagram',
      nameAr: 'انستجرام',
      icon: Camera,
      color: 'from-pink-500 to-purple-600',
      description: 'رسائل انستجرام المباشرة',
      status: 'قريباً',
      connected: false
    },
    {
      id: 'tiktok' as Platform,
      name: 'TikTok',
      nameAr: 'تيك توك',
      icon: Music,
      color: 'from-black to-gray-800',
      description: 'رسائل تيك توك',
      status: 'قريباً',
      connected: false
    },
    {
      id: 'telegram' as Platform,
      name: 'Telegram',
      nameAr: 'تيليجرام',
      icon: Plane,
      color: 'from-blue-400 to-blue-500',
      description: 'محادثات تيليجرام',
      status: 'قريباً',
      connected: false
    }
  ];

  const handlePlatformClick = (platformId: Platform) => {
    if (platformId === 'whatsapp') {
      router.push('/dashboard/crm-whatsapp/connect');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">منصات التواصل الاجتماعي</h1>
          <p className="text-gray-400 text-lg">
            إدارة جميع محادثاتك من مكان واحد
          </p>
          
          {/* Unified Inbox Button */}
          <div className="mt-6">
            <Button
              onClick={() => router.push('/dashboard/crm-whatsapp/unified-inbox')}
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white font-bold px-8 py-6 text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
            >
              <Inbox className="w-6 h-6 ml-3" />
              صندوق الوارد الموحد
              <span className="mr-3 text-xs bg-white/20 px-2 py-1 rounded-full">جديد</span>
            </Button>
            <p className="text-gray-500 text-sm mt-2">جميع رسائلك من كل المنصات في مكان واحد</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <Card
                key={platform.id}
                className="bg-gray-800 border-2 border-gray-700 hover:shadow-2xl hover:border-cyan-500 transition-all duration-300 cursor-pointer group"
                onClick={() => handlePlatformClick(platform.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${platform.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {platform.status === 'متاح' ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                        {platform.status}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-700 text-gray-400 text-xs font-semibold rounded-full border border-gray-600">
                        {platform.status}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{platform.nameAr}</h3>
                  <p className="text-gray-400 text-sm mb-1">{platform.name}</p>
                  <p className="text-gray-500 text-sm mb-4">{platform.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <span className="text-gray-500 text-sm">غير متصل</span>
                    
                    <Button
                      size="sm"
                      className={`bg-gradient-to-r ${platform.color} text-white`}
                      disabled={platform.status === 'قريباً'}
                    >
                      {platform.status === 'متاح' ? 'اتصل الآن' : 'قريباً'}
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
