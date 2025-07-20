// index.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});
// Define the route for /api/whoami
app.get('/api/whoami', function (req, res) {
  // Get the client's IP address from the request object
  const ipaddress = req.ip;

  // Get the preferred language from the request headers
  const language = req.headers['accept-language'];

  // Get the user agent from the request headers
  const software = req.headers['user-agent'];

  // Create a JSON response with the collected information
  const responseObject = {
    ipaddress,
    language,
    software,
  };

  // Send the JSON response
  res.json(responseObject);
});
// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
