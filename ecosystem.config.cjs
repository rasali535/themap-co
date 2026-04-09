module.exports = {
  apps: [
    {
      name: 'themap-backend',
      script: 'server.js',
      env: {
        NODE_ENV: 'development',
        PORT: 3004
      }
    },
    {
      name: 'themap-frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: '--port 3000 --host 0.0.0.0',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
