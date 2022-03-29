var mongoose = require('mongoose');

var DiscountSchema = new mongoose.Schema({
    maxPrice: Number,
    percentage: Number,
    users: [Object],
    code: String,
    startDate: {type: Date, default: new Date()},
    endDate: Date,
    endDateJ: Object,
    type: String,
    expired: {type: Boolean, default: false},

});

var Discount = mongoose.model('Discount', DiscountSchema);

module.exports = Discount;