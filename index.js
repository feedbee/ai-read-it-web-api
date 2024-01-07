const express = require('express');
const { Readable } = require('stream');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

app.use(bodyParser.json()); // for parsing application/json

// CORS middleware
const allowCrossDomain = function(req, res, next) {
  const allowedOrigins = ['http://localhost:3000'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
       res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}
app.use(allowCrossDomain);

const aiReadIt = require('ai-read-it');
aiReadIt.init(process.env.OPENAI_API_KEY);

app.post('/tts-large', (req, res) => {
  const textToConvert = req.body.text;

  if (textToConvert === undefined) {
    res.status(400).json({ error: "Text was not provided. Please, send POST body in JSON with 'text' filed that contains text to read." });
    return;
  }

  try {
    const readable = Readable.from(aiReadIt.largeTextToSpeech(textToConvert, {chunkSize: 2000}));
    res.type('audio/mpeg');
    readable.pipe(res);
  } catch (error) {
    console.error(error);
    res.type('text/json');
    res.status(500).json({ "error": error.message });
  }
});

app.post('/tts-small', (req, res) => {
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

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
