const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(express.static('public'))

let personSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  exercises: {
    type: [
      {
        description: {
          type: String,
          required: true
        },
        duration: {
          type: Number,
          required: true
        },
        date: {
          type: String,
        }
      }
    ],
    default: []
  }
}
)
let Person = mongoose.model("Person", personSchema)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', async function(req, res) {
  const { username } = req.body;
  let person = Person({ username })
  const response = await person.save()
  res.json({ username, _id: response._id })
})

app.get('/api/users', async function(req, res) {
  const response = await Person.find().select({ _id: 1, username: 1 });
  res.json(response);
})


app.post('/api/users/:_id/exercises', async function(req, res) {
  const { _id } = req.params;
  var { description, duration, date } = req.body;
  duration = Number(duration);
  if (!date) date = new Date().toDateString();
  else date = new Date(date).toDateString();
  const person = await Person.findById(_id);
  person.exercises.push({ date, duration, description });
  const response = await person.save();
  const { username } = response;
  res.json({ _id: _id, username: username, date: date, duration: duration, description: description });
}
)

app.get('/api/users/:_id/logs', async function(req, res) {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const person = await Person.findById(_id).lean();
  var { username, exercises } = person;
  const count = exercises.length;
  if (from && to) {
    exercises = exercises.filter((exercise) => {
      const { date } = exercise;
      console.log(new Date(date) <= new Date(to));
      if (new Date(from) <= new Date(date) && new Date(date) <= new Date(to)) {
        delete exercise._id;
        return exercise;
      }
    })
  };
  if (limit) {
    exercises = exercises.slice(0, limit);
  };
  res.json({ _id: _id, username: username, count: count, log: exercises });
}
)

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
