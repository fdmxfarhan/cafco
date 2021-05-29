var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
  price: Number, // Rial
  discount: Number, //percent
  haveDiscount: Boolean,
  title: String, 
  description: String,
  teacher: String,
  startDate: Object,
  session: Number,
  requiredCourse: [Object],
  requiredTools: [Object],
  minAge: Number,
  maxAge: Number,
  status: {
    type: String,
    default: 'شروع نشده'
  },
  capacity: Number,
  cover: String,
});

var Course = mongoose.model('Course', CourseSchema);

module.exports = Course;


