var mongoose = require('mongoose');

var WorkshopSchema = new mongoose.Schema({
    data: [Object],
    senario: Number,
    title: String,
    questionNum: Number,
    
});

var Workshop = mongoose.model('Workshop', WorkshopSchema);

module.exports = Workshop;