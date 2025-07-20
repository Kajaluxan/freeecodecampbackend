require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

var urls = {};
var shorturls = {};
var count = 0;
app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;
  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?(\?[\w-]+=[\w%&]*)*(#.*)?$/;
  const isValidURL = urlPattern.test(url);
  if (isValidURL) {
    if (urls[`${url}`]) {
      res.json({ "original_url": url, "short_url": urls[`${url}`] });

    } else {
      count += 1;
      urls[`${url}`] = count;
      shorturls[count] = url;
      res.json({ "original_url": url, "short_url": count });
    }
  } else {
    res.json({ error: 'invalid url' });
  }

})

app.get('/api/shorturl/:url?', function(req, res) {
  const { url } = req.params;
  console.log(url);
  res.redirect(shorturls[url]);
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
