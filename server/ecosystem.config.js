module.exports = {
  apps: [{
    name: 'whatsapp-server',
    script: './whatsapp-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // إعادة التشغيل عند حدوث أخطاء
    max_restarts: 10,
    min_uptime: '10s',
    // تأخير إعادة التشغيل
    restart_delay: 4000,
    // إشعارات
    notification: true
  }]
};
