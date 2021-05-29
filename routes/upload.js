var express = require('express');
var path = require('path');
var router = express.Router();
var bodyparser = require('body-parser');
const multer = require('multer');
const mail = require('../config/mail');
const {ensureAuthenticated} = require('../config/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const mkdirp = require('mkdirp');

router.use(bodyparser.urlencoded({extended: true}));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/files/' + Date.now().toString();
        mkdirp(dir, err => cb(err, dir));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

var upload = multer({ storage: storage });

router.post('/blue-code', ensureAuthenticated, upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    if (!file) {
        res.send('no file to upload');
    }
    else{
        var newFile = {
            date: Date.now(),
            path: file.destination.slice(6),
            name: file.originalname
        };
        Team.updateOne({_id: req.user.teamID}, {$set: {blueFile: newFile}}, (err, doc) => {
            if(err) console.log(err);
            res.redirect(req.body.page);
        });
        Team.findOne({_id: req.user.teamID}, (err, team) => {
            var lastBlueFile = team.lastBlueFile;
            lastBlueFile.push(newFile);
            Team.updateOne({_id: req.user.teamID}, {$set: {lastBlueFile: lastBlueFile}}, (err, doc) => {
                if(err) console.log(err);
            });
        });
    }
});

router.post('/course', ensureAuthenticated, upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    const {title, description, teacher, session, minAge, maxAge, day, month, year, capacity, price} = req.body;

    if (!file) {
        res.send('no file to upload');
    }
    else{
        var cover = file.destination.slice(6) + '/' + file.originalname;
        var startDate = {day, month, year};
        const newCourse = new Course({title, description, teacher, session, minAge, maxAge, startDate, capacity, price, cover});
        newCourse.save()
            .then(course => {
                res.redirect(req.body.redirect);
            }).catch(err => {
                if(err) console.log(err);
            });
    }
});

module.exports = router;






