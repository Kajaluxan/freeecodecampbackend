// index.js
// where your node app starts

// init project
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/:date?", function (req, res) {
  let num = Number(req.params.date);
  if (!isNaN(num)) {
    const date = new Date(num);
    const unix = date.getTime();
    const utc = date.toUTCString();
    res.json({ unix, utc });
  } else if (!req.params.date) {
    const date = new Date();
    const unix = date.getTime();
    const utc = date.toUTCString();
    res.json({ unix, utc });
  } else {
    const date = new Date(req.params.date);
    if (!isNaN(date)) {
      const unix = date.getTime();
      const utc = date.toUTCString();
      res.json({ unix, utc });
    } else {
      res.json({ error: "Invalid Date" });
    }
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 5000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
