var mongoose = require('mongoose');

var TradeUserSchema = new mongoose.Schema({
    name: String,
    card: Number,
    username: String,
    password: String,
    materials: {type: [Object], default: []},
    products: {type: [Object], default: []},
});

var TradeUser = mongoose.model('TradeUser', TradeUserSchema);

module.exports = TradeUser;