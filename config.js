require('dotenv').config();

const requiredVars = ['MONGO_DB_URI', 'GOOGLE_CLIENT_ID', 'GOOGLE_GEMINI_API_KEY'];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
}

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

if (rawPort && Number.isNaN(port)) {
  throw new Error(`Invalid PORT value: ${rawPort}`);
}

module.exports = {
  port,
  mongoDbUri: process.env.MONGO_DB_URI,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleGeminiApiKey: process.env.GOOGLE_GEMINI_API_KEY,
};
