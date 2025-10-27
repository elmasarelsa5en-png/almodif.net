#!/bin/bash
# تعليمات إنشاء فيديو MP4 بسيط باستخدام FFmpeg

# إذا كان لديك FFmpeg مثبت، استخدم هذا الأمر:
# ffmpeg -f lavfi -i color=c=blue:s=1280x720:d=15 -f lavfi -i anullsrc=r=44100:cl=mono -pix_fmt yuv420p -c:v libx264 -preset ultrafast -y intro-video.mp4

# أو باستخدام الرسوم المتحركة البسيطة:
# ffmpeg -f lavfi -i color=c=0x1a1a2e:s=1280x720:d=15 \
#   -f lavfi -i "drawtext=text='Al-Mudif CRM':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" \
#   -c:v libx264 -pix_fmt yuv420p -preset ultrafast -y intro-video.mp4

echo "يرجى تثبيت FFmpeg أولاً ثم تشغيل أحد الأوامر أعلاه"
