/** @type {import('pm2').StartOptions[]} */
module.exports = {
  apps: [
    {
      name: "tradalyst-marketing",
      cwd: "/var/www/tradalyst/frontend/marketing",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      // Restart if process crashes; do not restart on successful exit.
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
    {
      name: "tradalyst-app",
      cwd: "/var/www/tradalyst/frontend/app",
      script: "node_modules/.bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
  ],
};
