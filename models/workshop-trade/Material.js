var mongoose = require('mongoose');

var MaterialSchema = new mongoose.Schema({
    title: String,
    minPrice: Number,
    lastTradePrice: Number,
    lastTrades: {typ: [Object], default: []},
    extendInPeriod: Number,
    period: Number,
    number: Number,
});

var Material = mongoose.model('Material', MaterialSchema);

module.exports = Material;