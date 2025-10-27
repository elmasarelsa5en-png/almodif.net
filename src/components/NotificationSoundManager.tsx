'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bell, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SoundSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  volume: number;
  testSound: () => void;
}

export function NotificationSoundManager() {
  const [settings, setSettings] = useState<SoundSetting[]>([
    {
      id: 'requests',
      title: 'طلبات الموظفين',
      description: 'صوت تنبيه عند وصول طلب جديد من الموظفين',
      enabled: true,
      volume: 70,
      testSound: () => playTestSound('/sounds/request.mp3')
    },
    {
      id: 'coffee',
      title: 'طلبات الكوفي شوب',
      description: 'صوت تنبيه عند وصول طلب كوفي جديد',
      enabled: true,
      volume: 70,
      testSound: () => playTestSound('/sounds/coffee.mp3')
    },
    {
      id: 'laundry',
      title: 'طلبات المغسلة',
      description: 'صوت تنبيه عند وصول طلب مغسلة جديد',
      enabled: true,
      volume: 70,
      testSound: () => playTestSound('/sounds/laundry.mp3')
    },
    {
      id: 'restaurant',
      title: 'طلبات المطعم',
      description: 'صوت تنبيه عند وصول طلب مطعم جديد',
      enabled: true,
      volume: 70,
      testSound: () => playTestSound('/sounds/restaurant.mp3')
    }
  ]);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('notificationSoundSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load sound settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('notificationSoundSettings', JSON.stringify(settings));
  }, [settings]);

  const playTestSound = (soundPath: string) => {
    const audio = new Audio(soundPath);
    audio.volume = 0.7;
    audio.play().catch(err => {
      console.log('Failed to play test sound:', err);
    });
  };

  const toggleEnabled = (id: string) => {
    setSettings(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const updateVolume = (id: string, volume: number) => {
    setSettings(prev => prev.map(s => 
      s.id === id ? { ...s, volume } : s
    ));
  };

  return (
    <div className="space-y-4">
      {settings.map((setting) => (
        <Card key={setting.id} className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  setting.enabled ? 'bg-green-500/20' : 'bg-gray-500/20'
                }`}>
                  {setting.enabled ? (
                    <Volume2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-white text-base">{setting.title}</CardTitle>
                  <CardDescription className="text-white/60 text-sm">
                    {setting.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={setting.enabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}>
                  {setting.enabled ? 'مفعّل' : 'متوقف'}
                </Badge>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={() => toggleEnabled(setting.id)}
                />
              </div>
            </div>
          </CardHeader>
          {setting.enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">مستوى الصوت</span>
                  <span className="text-white font-bold">{setting.volume}%</span>
                </div>
                <Slider
                  value={[setting.volume]}
                  onValueChange={([value]) => updateVolume(setting.id, value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <Button
                size="sm"
                onClick={setting.testSound}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
              >
                <Play className="w-4 h-4 ml-2" />
                تجربة الصوت
              </Button>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
