var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var Question = require('../models/Question');

router.get('/', (req, res, next) => {
    res.redirect('/users/login');
    // res.render('home');
});

router.get('/api', (req, res, next) => {
    Question.findOne({number: 1}, (err, question) => {
        if(question)
            res.send(question);
    })
});

module.exports = router;
