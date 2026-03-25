module.exports = {
  apps: [
    {
      name: 'cardcompare',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/ec2-user/app',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
    },
  ],
};
