var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
    picture: String,
    number: Number,

});

var Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;