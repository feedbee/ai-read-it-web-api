require('dotenv').config();

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];
const mongoDbUri = process.env.MONGODB_URI;
const mongoDbDatabase = process.env.MONGODB_DATABASE;
const googleAuthClientId = process.env.GOOGLE_AUTH_CLIENT_ID;
const googleAuthClientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET;
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const encryptionKey = process.env.ENCRYPTION_KEY;
const authMode = process.env.AUTH_MODE | 'disabled';
const chunkSize = process.env.CHUNK_SIZE | 2000;
module.exports = { allowedOrigins, mongoDbUri, mongoDbDatabase, googleAuthClientId, googleAuthClientSecret, jwtSecretKey, encryptionKey,
    authMode, chunkSize };
