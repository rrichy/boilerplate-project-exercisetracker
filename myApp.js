require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const exerciseSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: {type: Date, default: Date.now}
});

const exerciseTrackerSchema = new mongoose.Schema({
  username: {type: String, required: true}
});

const User = mongoose.model('et_user', exerciseTrackerSchema);
const ExerciseModel = mongoose.model('exercise', exerciseSchema);

const createUser = (username, done) => {
  User.exists({username: username}, (err, data) => {
    if(err) return console.log(err);
    if(data) return done(null, data);
    
    let user = new User({ username: username });
    user.save((err, data) => {
      if(err) return console.log(err);
      done(null, data);
    });
  });
};

const getList = (done) => {
  User.find({}, (err, list) => {
    done(null, list);
  });
};

const addExercise = (formData, done) => {
  User.findById(formData.userId, (err, person) => {
    if(err) return done(err);
    if(!person) return done(null, person);
    else{
      const { _id, username } = person;
      let exercise = new ExerciseModel(formData);

      exercise.save((err, data) => {
        if(err) return console.log(err);
        
        const { description, duration, date } = data;
        let retObj = { _id, username, description, duration, date: date.toDateString() };

        done(null, retObj);
      });
    }
  });
}

const getLog = (query, done) => {
  console.log(query);
  const { userId, to, limit } = query;
  const start = query.from;
  console.log(userId, start, to, limit);

  User.findById(userId, (err, person) => {
    if(err) return done(err);
    if(!person) return done(null, person);
    else{
      const { _id, username } = person;
      ExerciseModel.find({userId, date: {$gte: start || '1900-01-01', $lte: to || '2030-01-01'}})
        .limit(Number(limit))
        .then(data => {
          let retObj = { _id, username, count: data.length, log: data };
          done(null, retObj);
        })
    }
  });
  
}

exports.createUser = createUser;
exports.addExercise = addExercise;
exports.getList = getList;
exports.getLog = getLog;