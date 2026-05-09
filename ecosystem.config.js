module.exports = {
  apps: [
    {
      name: 'gastro-api',
      script: './server.js',
      instances: 1,           // 1 sola instancia — SQLite no soporta múltiples writers
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
