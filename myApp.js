require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const exerciseSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: Date
});

const exerciseTrackerSchema = new mongoose.Schema({
  username: {type: String, required: true},
  exercise: [exerciseSchema]
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

const addExercise = (formData, done) => {
  User.findById(formData.userId, (err, user) => {
    if(err) return done(err);
    if(!user) return done(null, user);
    else{
      let exercise = new ExerciseModel(formData);

      exercise.save((err, data) => {
        if(err) return console.log(err);
        user.exercise.push(exercise);

        user.save((e, d) => {
          if(e) return console.log(e);
          let retObj = {}
          retObj._id = d._id;
          retObj.username = d.username;
          retObj.date = data.date;
          retObj.duration = data.duration;
          retObj.description = data.description;
          done(null, retObj);
        });
      })
    }
  });
}

exports.createUser = createUser;
exports.addExercise = addExercise;