var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  school: String,
  username: String,
  email: String,
  idNumber: String,
  ipAddress: String,
  phone: String,
  education: String,
  educationNum: Number,
  fullname: String,
  password: String,
  role: String,
  card: {
    type: Number,
    default: 0,
  },
  sex: String,
  file: {
    type: [Object],
    default: [],
  },
  avatar: Number,
  course: [Object],
  birthday: 
  {
    type: Object,
    default: {day: 0, month: 0, year: 0},
  },
  kashfolasrar: {
    type: Boolean,
    default: false,
  },
  teacherCourseID: {
    type: [String],
    default: [],
  },
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
