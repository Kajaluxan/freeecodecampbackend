require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const bodyParser = require('body-parser');
const urlParser = require('url');

// Middleware
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;

// Serve the frontend
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Hello endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage
let urls = {};
let shorturls = {};
let count = 1;

// POST endpoint to shorten URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Parse hostname for DNS check
  let hostname;
  try {
    const parsedUrl = new URL(originalUrl);
    hostname = parsedUrl.hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Check if already exists
    if (urls[originalUrl]) {
      res.json({ original_url: originalUrl, short_url: urls[originalUrl] });
    } else {
      urls[originalUrl] = count;
      shorturls[count] = originalUrl;
      res.json({ original_url: originalUrl, short_url: count });
      count++;
    }
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const short = parseInt(req.params.short_url);
  const originalUrl = shorturls[short];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
