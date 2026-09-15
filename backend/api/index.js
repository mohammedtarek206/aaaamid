// Vercel Serverless Entry Point
// This file re-exports the Express app so Vercel can invoke it as a serverless function.
const app = require('../server');
module.exports = app;
