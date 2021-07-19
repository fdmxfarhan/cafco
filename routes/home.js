var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    res.redirect('/users/login');
    // res.render('home');
});

module.exports = router;
