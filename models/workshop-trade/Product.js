var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
    title: String,
    materialsList: {type: [Object], default: []},
    maxPrice: Number,
    lastTradePrice: Number,
    lastTrades: {type: [Object], default: []},
    sellInPeriod: Number,
    period: Number,
});

var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;