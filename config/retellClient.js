// config/retellClient.js
const Retell = require('retell-sdk');

// Initialize Retell client with API key from environment variables
const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY,
});

module.exports = retellClient;