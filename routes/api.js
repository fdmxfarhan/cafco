var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var Workshop = require('../models/Workshop');

router.get('/', (req, res, next) => {
    Workshop.find({}, (err, workshop) => {
        if(workshop)
            res.send(workshop);
        else
            res.send('null');
    });
});

module.exports = router;
