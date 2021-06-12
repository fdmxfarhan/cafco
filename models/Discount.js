var mongoose = require('mongoose');

var DiscountSchema = new mongoose.Schema({
    maxPrice: Number,
    percentage: Number,
    users: [Object],
    code: String,
    
});

var Discount = mongoose.model('Discount', DiscountSchema);

module.exports = Discount;