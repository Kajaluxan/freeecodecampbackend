var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var multer = require('multer');
require('dotenv').config()

var upload = multer({ dest: 'uploads/' });
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', upload.single('upfile'), function(req, res) {
  console.log(req.file);
  const { originalname: name, mimetype: type, size } = req.file;
  res.json({ name, type, size });
})


const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Your app is listening on port ' + port)
});
