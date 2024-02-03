const jwt = require('jsonwebtoken');
const { jwtSecretKey, authMode } = require('../../config.js');
const userModel = require('../models/user.js');

// Middleware to validate JWT
const userAuthMiddleware = async (req, res, next) => {
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

    // Get user from DB
    try {
      const user = await userModel.getUserByEmail(req.userToken.user.email);
      if (!user) {
        res.status(401).send('User not found by token.');
      } else {
        req.user = user; 
      }
    } catch (error) {
      res.status(401).send('User not found by token.');
    }
  } else {
    res.status(400).send('Invalid token format.');
  }

  next();
};

const authRequiredMiddleware = (req, res, next) => {
  if (authMode === 'required') {
    if (!req.userToken) {
      return res.status(401).send(JSON.stringify({error: 'This operation requires authentication'}));
    }
  }
  next();
};

module.exports = { userAuthMiddleware, authRequiredMiddleware };
