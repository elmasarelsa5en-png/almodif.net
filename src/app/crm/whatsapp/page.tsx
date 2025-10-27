'use client';

import { useState } from 'react';
import { MessageSquare, MessageCircle, Send, Camera, Music, Plane, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Platform = 'whatsapp' | 'messenger' | 'snapchat' | 'instagram' | 'tiktok' | 'telegram' | null;

export default function SocialMediaPlatformsPage() {
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
      window.location.href = '/crm/whatsapp/connect';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">منصات التواصل الاجتماعي</h1>
          <p className="text-gray-600 text-lg">
            إدارة جميع محادثاتك من مكان واحد
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <Card
                key={platform.id}
                className="bg-white border-2 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => handlePlatformClick(platform.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${platform.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {platform.status === 'متاح' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full">
                        {platform.status}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                        {platform.status}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{platform.nameAr}</h3>
                  <p className="text-gray-600 text-sm mb-1">{platform.name}</p>
                  <p className="text-gray-500 text-sm mb-4">{platform.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-gray-400 text-sm">غير متصل</span>
                    
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
