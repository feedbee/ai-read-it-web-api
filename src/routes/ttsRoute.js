const { Readable } = require('stream');

const express = require('express');
const router = express.Router();

const { chunkSize } = require('../../config.js');

const aiReadIt = require('ai-read-it');
aiReadIt.init(process.env.OPENAI_API_KEY);

const { authRequiredMiddleware } = require('../middleware/auth.js');

router.post('/large', authRequiredMiddleware, (req, res) => {
  const textToConvert = req.body.text;

  if (textToConvert === undefined) {
    res.status(400).json({ error: "Text was not provided. Please, send POST body in JSON with 'text' filed that contains text to read." });
    return;
  }

  try {
    const readable = Readable.from(aiReadIt.largeTextToSpeech(textToConvert, {chunkSize: chunkSize}));
    res.type('audio/mpeg');
    readable.pipe(res);
  } catch (error) {
    console.error(error);
    res.type('text/json');
    res.status(500).json({ "error": error.message });
  }
});

router.post('/small', authRequiredMiddleware, (req, res) => {
  const textToConvert = req.body.text;

  if (textToConvert === undefined) {
    res.status(400).json({ error: "Text was not provided. Please, send POST body in JSON with 'text' filed that contains text to read." });
    return;
  }

  aiReadIt.smallTextToSpeech(textToConvert)
    .then(audioBuffer => {
      res.type('audio/mpeg');
      res.send(audioBuffer);
    })
    .catch(error => {
      console.error("Error:", error);
      res.type('text/json');
      res.status(500).json({ error });
    });
});

module.exports = router;
