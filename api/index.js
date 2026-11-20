// Root Vercel Serverless Entry Point
// Bridges root deployments directly to the backend server
const app = require('../backend/server');
module.exports = app;
