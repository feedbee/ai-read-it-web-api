const { Readable } = require('stream');

const express = require('express');
const { check, body, validationResult } = require('express-validator');
const router = express.Router();

const { chunkSize, largeTtsMaxChars, allowedParams } = require('../../config.js');
const userModel = require('../models/user.js');

const aiReadIt = require('ai-read-it');
aiReadIt.init(process.env.OPENAI_API_KEY);

const { authRequiredMiddleware } = require('../middleware/auth.js');


const buildOptions = (reqBody) => {
  const o = { chunkSize };
  if (reqBody.model) {
    o.model = reqBody.model;
  }
  if (reqBody.voice) {
    o.voice = reqBody.voice;
  }
  if (reqBody.responseFormat) {
    o.response_format = reqBody.responseFormat;
  }
  if (reqBody.speed) {
    o.speed = reqBody.speed;
  }

  return o;
};

const outputFormats = {
  mp3: 'audio/mpeg',
  opus: 'audio/opus',
  aac: 'audio/aac',
  flac: 'audio/flac',
};

const [validatorJson, validatorTextLarge, validatorTextSmall, validatorModel, validatorVoice,
  validatorResponseFormat, validatorSpeed, validatorAllowedParams] = [
    check('Content-Type').custom((value, { req }) => {
      return req.headers['content-type'] === 'application/json';
    }).withMessage('Please, send POST body in JSON with at least "text" property that contains text to read. The request must be "application/json".'),
    body('text').isString().isLength({ min: 3, max: largeTtsMaxChars }).withMessage(`Text must be a string from 3 to ${largeTtsMaxChars} chars`),
    body('text').isString().isLength({ min: 3, max: 4096 }).withMessage('Text must be a string from 3 to 4096 chars'),
    body('model').optional().isIn(['tts-1', 'tts-1-hd']).withMessage(`Model must be within: tts-1, tts-1-hd`),
    body('voice').optional().isIn(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).withMessage(`Voice must be within: alloy, echo, fable, onyx, nova, shimmer`),
    body('responseFormat').optional().isIn(['mp3', 'opus', 'aac', 'flac']).withMessage(`Response format must be within: mp3, opus, aac, flac`),
    body('speed').optional().isFloat({ min: 0.25, max: 4.0 }).withMessage(`Speed must be within: mp3, opus, aac, flac`),
    body().custom((body) => {
      if (body.hasOwnProperty('model') && !allowedParams.includes('model')) {
        throw new Error('Model parameter is not allowed');
      }
      if (body.hasOwnProperty('voice') && !allowedParams.includes('voice')) {
        throw new Error('Model parameter is not allowed');
      }
      if (body.hasOwnProperty('responseFormat') && !allowedParams.includes('responseFormat')) {
        throw new Error('Model parameter is not allowed');
      }
      if (body.hasOwnProperty('speed') && !allowedParams.includes('speed')) {
        throw new Error('Model parameter is not allowed');
      }
      return true; // Validation passed
    }),
  ];

const middlewaresLarge = [
  authRequiredMiddleware, validatorJson, validatorTextLarge, validatorModel, validatorVoice, validatorResponseFormat,
  validatorSpeed, validatorAllowedParams
];

router.post('/large', ...middlewaresLarge, async (req, res) => {
  const textToConvert = req.body.text;
  const options = buildOptions(req.body);
  const outputFormat = req.body.responseFormat || 'mp3';

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!await tryDebitUser(textToConvert, req, res)) {
    return;
  }

  try {
    const readable = Readable.from(aiReadIt.largeTextToSpeech(textToConvert, options));
    res.type(outputFormats[outputFormat]);
    readable.pipe(res);
  } catch (error) {
    console.error(error);
    res.type('text/json');
    res.status(500).json({ "error": error.message });
  }
});

const middlewaresSmall = [
  authRequiredMiddleware, validatorJson, validatorTextSmall, validatorModel, validatorVoice, validatorResponseFormat,
  validatorSpeed, validatorAllowedParams
];

router.post('/small', ...middlewaresSmall, async (req, res) => {
  const textToConvert = req.body.text;
  const options = buildOptions(req.body);
  const outputFormat = req.body.responseFormat || 'mp3';

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!await tryDebitUser(textToConvert, req, res)) {
    return;
  }

  aiReadIt.smallTextToSpeech(textToConvert, options)
    .then(audioBuffer => {
      res.type(outputFormats[outputFormat]);
      res.send(audioBuffer);
    })
    .catch(error => {
      console.error("Error:", error);
      res.type('text/json');
      res.status(500).json({ error });
    });
});

const tryDebitUser = async (textToConvert, req, res) => {
  if (req.user) { // if user is authenticated, charge the balance
    const amount = textToConvert.length;
    const userDebited = await userModel.debitUserCharactersBalance(req.user, amount);
    if (!userDebited) {
      res.type('text/json');
      res.status(403).json({ "error": 'Not enough characters balance to perform the operation.' });
      return false;
    }
  }
  return true;
};

module.exports = router;
