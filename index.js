const express = require('express');
const { connectToDB } = require('./src/util/db.js');

// Middleware
const { userAuthMiddleware } = require('./src/middleware/auth.js');
const corsMiddleware = require('./src/middleware/cors.js');

// Routes
const userRoutes = require('./src/routes/userRoutes.js');
const ttsRoutes = require('./src/routes/ttsRoute.js');

// Configuration
const port = process.env.PORT || 3001;
const { authMode } = require('./config.js');

const app = express();

// -- Middleware ---

app.use(express.json());
app.use(corsMiddleware);
app.use(userAuthMiddleware);

// -- App Routes ---

// User authentication routes
if (authMode !== "disabled") {
  app.use('/users', userRoutes);
}

// Text-To-Speach routes
app.use('/tts', ttsRoutes);

// -- App Initialization ---

// Async function to encapsulate the connection and server start logic
async function run() {
  // Open database connection if only user authentication is enabled
  if (authMode !== "disabled") {
    try {
      await connectToDB();
    } catch (error) {
      console.error("Failed to connect to MongoDB or start the server", error);
      process.exit(1);
    }
  }

  // Start the Express server
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    console.log("Auth mode is", authMode);
  });
}

run().catch(console.error);
