var mongoose = require('mongoose');

var WorkshopSchema = new mongoose.Schema({
    data: [Object],
    senario: Number,
    title: String,
    questionNum: Number,
    time: {
        type: Object,
        default: {hour: 0, minute: 30, second: 0},
    },
});

var Workshop = mongoose.model('Workshop', WorkshopSchema);

module.exports = Workshop;