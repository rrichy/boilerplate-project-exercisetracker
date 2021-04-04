const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const myApp = require('./myApp.js');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({extended: false}));

// POST New User
app.post('/api/exercise/new-user', (req, res) => {
  const { username } = req.body;
  myApp.createUser(username, (err, pers) => {
    if(err) console.log(err);
    if(pers === true) res.send('Username already taken');
    else res.json({username: pers.username, _id: pers._id});
  });
});

// GET List of users
app.get('/api/exercise/users', (req, res) => {
  myApp.getList((_, list) => {
    res.json(list);
  });
})

// POST Add exercise
app.post('/api/exercise/add', (req, res) => {
  if(req.body.date === '') Object.assign(req.body, {date: new Date()});

  myApp.addExercise(req.body, (err, user) => {
    if(err) res.send(`Cast to ${err.kind} failed for value "${err.value}" at path "${err.path}" for model "et_user"`);
    else if(user === null) res.send('Unknown userId');
    else res.json(user);
  });
})

// GET exercise log from Id
app.get('/api/exercise/log', (req, res) => {
  myApp.getLog(req.query, (err, log) => {
    if(err) console.log(err);
    res.json(log);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
