#!/bin/bash

# 🚀 سكريبت سريع لإعداد VPS جديد

echo "================================"
echo "🚀 إعداد WhatsApp Server على VPS"
echo "================================"
echo ""

# التحقق من الصلاحيات
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  يرجى تشغيل السكريبت كـ root:"
    echo "sudo bash setup-vps.sh"
    exit
fi

# تحديث النظام
echo "📦 تحديث النظام..."
apt update && apt upgrade -y

# تثبيت Node.js
echo "📦 تثبيت Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# تثبيت PM2
echo "📦 تثبيت PM2..."
npm install -g pm2

# تثبيت مكتبات Puppeteer
echo "📦 تثبيت مكتبات Puppeteer..."
apt install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget

# إنشاء مجلد المشروع
echo "📁 إنشاء مجلد المشروع..."
mkdir -p /var/www/whatsapp-server
cd /var/www/whatsapp-server

# إعداد Firewall
echo "🔐 إعداد Firewall..."
ufw allow 22/tcp
ufw allow 3001/tcp
ufw --force enable

# إضافة Swap (2GB)
echo "💾 إضافة Swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# التحقق من التثبيت
echo ""
echo "✅ تم الإعداد بنجاح!"
echo ""
echo "📋 معلومات النظام:"
echo "   - Node.js: $(node --version)"
echo "   - npm: $(npm --version)"
echo "   - PM2: $(pm2 --version)"
echo ""
echo "📁 المجلد: /var/www/whatsapp-server"
echo ""
echo "🚀 الخطوات التالية:"
echo "   1. انقل ملفات المشروع إلى /var/www/whatsapp-server/server"
echo "   2. cd /var/www/whatsapp-server/server"
echo "   3. npm install"
echo "   4. pm2 start ecosystem.config.js"
echo "   5. pm2 save"
echo "   6. pm2 startup"
echo ""
