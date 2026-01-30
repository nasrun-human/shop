module.exports = {
  apps: [
    {
      name: "void-backend",
      script: "./server/index.js",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3000
      }
    },
    {
      name: "void-frontend",
      script: "npm",
      args: "run dev",
      watch: false
    },
    {
      name: "void-tunnel",
      script: "npm",
      args: "run tunnel",
      watch: false
    }
  ]
};
