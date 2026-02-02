module.exports = {
  apps: [
    {
      name: 'blooket-server',
      script: 'server-playwright.js',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production',
        PORT: 4500
      }
    },
    {
      name: 'blooket-tunnel',
      script: 'start-tunnel.js',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 4500,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        GITHUB_OWNER: process.env.GITHUB_OWNER,
        GITHUB_REPO: process.env.GITHUB_REPO
      }
    }
  ]
};
