const jwt = require('jsonwebtoken');
const { jwtSecretKey, authMode } = require('../../config.js');

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
    } catch (ex) {
      res.status(400).send('Invalid token.');
    }
  } else {
    res.status(400).send('Invalid token format.');
  }

  next();
};

const authRequiredMiddleware = (req, res, next) => {
  if (authMode === 'required') {
    if (!req.userToken) {
      return res.status(403).send('This resaource requires authentication');
    }
  }
  next();
};

module.exports = { userAuthMiddleware, authRequiredMiddleware };
