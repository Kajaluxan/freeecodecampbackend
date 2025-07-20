const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schema
const personSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  exercises: {
    type: [
      {
        description: { type: String, required: true },
        duration: { type: Number, required: true },
        date: { type: String }
      }
    ],
    default: []
  }
});

const Person = mongoose.model('Person', personSchema);

// Home Page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// ✅ Create New User
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  try {
    const user = new Person({ username });
    const savedUser = await user.save();
    res.json({ username: savedUser.username, _id: savedUser._id.toString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ✅ Get All Users
app.get('/api/users', async function(req, res) {
  try {
    const users = await Person.find({ username: { $exists: true } }, '_id username').lean();

    const sanitized = users.map(user => ({
      _id: user._id.toString(),
      username: user.username
    }));

    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ Add Exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  let { description, duration, date } = req.body;

  try {
    const user = await Person.findById(_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!date) {
      date = new Date().toDateString();
    } else {
      date = new Date(date).toDateString();
    }

    const exercise = {
      description,
      duration: parseInt(duration),
      date
    };

    user.exercises.push(exercise);
    await user.save();

    res.json({
      _id: user._id.toString(),
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add exercise' });
  }
});

// ✅ Get User Logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await Person.findById(_id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    let exercises = user.exercises;

    if (from) {
      const fromDate = new Date(from);
      exercises = exercises.filter(e => new Date(e.date) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      exercises = exercises.filter(e => new Date(e.date) <= toDate);
    }

    if (limit) {
      exercises = exercises.slice(0, parseInt(limit));
    }

    const log = exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date
    }));

    res.json({
      _id: user._id.toString(),
      username: user.username,
      count: log.length,
      log
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
