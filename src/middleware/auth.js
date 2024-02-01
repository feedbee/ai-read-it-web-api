const jwt = require('jsonwebtoken');
const { jwtSecretKey } = require('../../config.js');

// Middleware to validate JWT
const userAuthMiddleware = (req, res, next) => {
  req.userToken = null;

  // Get the token from the request header
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    next();
    return;
  }

  // Split the header to remove 'Bearer'
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    const token = parts[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, jwtSecretKey);
      // Set user context
      req.userToken = decoded;
      next(); // Go to the next middleware/route
    } catch (ex) {
      res.status(400).send('Invalid token.');
    }
  } else {
    res.status(400).send('Invalid token format.');
  }
};

module.exports = userAuthMiddleware;
