const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/user.js');
const { googleAuthClientId, googleAuthClientSecret, jwtSecretKey, encryptionKey } = require('../../config.js');
const Encryption = require('../util/encryption.js');

const router = express.Router();

const oAuth2Client = new OAuth2Client(googleAuthClientId, googleAuthClientSecret, 'postmessage');

router.post('/auth/google', async (req, res) => {
  const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens

  const dataFromToken = jwt.decode(tokens.id_token);
  if (!dataFromToken) {
    throw new Error('Invalid token');
  }

  const user = await userModel.getUserByEmail(dataFromToken.email);

  if (!user) {
    userModel.addUser({
      email: dataFromToken.email,
      avatar: dataFromToken.picture,
    });
  }

  let expireDate = new Date();
  expireDate.setMonth(expireDate.getMonth() + 1);

  let encryption = new Encryption(encryptionKey);
  let paylod = encryption.encrypt(tokens.refresh_token);

  let appToken = {
    version: 1,
    authId: uuidv4(),
    user: {
      name: dataFromToken.name,
      email: dataFromToken.email,
      avatar: dataFromToken.picture,
    },
    payload: paylod, // encrypted access_token
    expire: expireDate
  };

  let appTokenString = jwt.sign(appToken, jwtSecretKey);

  res.json({token: appTokenString});
});

router.post('/auth/logout', async (req, res) => {
  if (req.userToken) {
    let encryption = new Encryption(encryptionKey);
    let accessToken = encryption.decrypt(req.userToken.payload);
    try {
      await oAuth2Client.revokeToken(accessToken);
      res.json({result: "success"});
      return;
    } catch (error) {
      console.log('Error logging out on Google side: ', error);
      res.json({result: "failure"});
      return;
    }
  }

  res.json({result: "not logged in"});
});

module.exports = router;
