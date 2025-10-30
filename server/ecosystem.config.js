module.exports = {
  apps: [
    {
      name: 'whatsapp-service',
      script: './whatsapp-service.js',
      cwd: './server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 4000
    }
  ]
};
