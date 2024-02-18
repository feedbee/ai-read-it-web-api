// App
const express = require('express');
const { connectToDB } = require('./src/util/db.js');

// Middleware
const { userAuthMiddleware } = require('./src/middleware/auth.js');
const corsMiddleware = require('./src/middleware/cors.js');

// Routes
const userRoutes = require('./src/routes/userRoutes.js');
const ttsRoutes = require('./src/routes/ttsRoute.js');

// Configuration
const { authMode } = require('./config.js');

// Initialization
function createApp() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(corsMiddleware);
  app.use(userAuthMiddleware);

  // User authentication routes if only user authentication is enabled
  if (authMode !== "disabled") {
    app.use('/users', userRoutes);
  }

  // TTS routes
  app.use('/tts', ttsRoutes);

  return app;
}

// Start
async function run() {
  const app = createApp();

  // Open database connection if only user authentication is enabled
  if (authMode !== "disabled") {
    try {
      await connectToDB();
    } catch (error) {
      console.error("Failed to connect to MongoDB or start the server", error);
      process.exit(1);
    }
  }

  // Start the server
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    console.log("Auth mode is", authMode);
  });
}

// Start the server if not imported as a module (for tests)
if (require.main === module) {
  run().catch(console.error);
}

// Export for tests
module.exports = createApp;
