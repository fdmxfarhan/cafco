var mongoose = require('mongoose');

var PaymentSchema = new mongoose.Schema({
    userID: String,
    fullname: String,
    idNumber: String,
    phone: Number,
    amount: Number,
    description: String,
    date: Date,
    payDate: Date,
    payed: {
      type: Boolean,
      default: false
    },
    track_id: String,
    courseList: [Object],
  });

var Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;