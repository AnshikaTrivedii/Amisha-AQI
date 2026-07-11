// PM2 process config for the AQI signage server.
// Usage on EC2:  pm2 start ecosystem.config.cjs  &&  pm2 save
module.exports = {
  apps: [
    {
      name: 'aqi',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
