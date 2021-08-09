var mongoose = require('mongoose');

var AnswerSchema = new mongoose.Schema({
    answer: String,
    answerNum: Number,
    courseID: String,
    courseTitle: String,
    userName: String,
    isRight: Boolean,
    score: Number,
    
});

var Answer = mongoose.model('Answer', AnswerSchema);

module.exports = Answer;