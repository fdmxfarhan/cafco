var express = require('express');
var path = require('path');
var router = express.Router();
var bodyparser = require('body-parser');
const multer = require('multer');
const mail = require('../config/mail');
const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const mkdirp = require('mkdirp');
const Workshop = require('../models/Workshop');

router.use(bodyparser.urlencoded({ extended: true }));

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = 'public/files/' + Date.now().toString();
        mkdirp(dir, err => cb(err, dir));
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});

var upload = multer({ storage: storage });

router.post('/course', ensureAuthenticated, upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    const { video, title, undertitle, description, teacher, session, minAge, maxAge, day, month, year, endDay, endMonth, endYear, capacity, price, link } = req.body;

    if (!file) {
        res.send('no file to upload');
    } else {
        var cover = file.destination.slice(6) + '/' + file.originalname;
        var startDate = { day, month, year };
        var endDate = { day: endDay, month: endMonth, year: endYear };
        splited = video.split('/');
        video = splited[splited.length - 1];
        if(video == '') video = splited[splited.length - 2];
        const newCourse = new Course({ title, undertitle, description, teacher, session, minAge, maxAge, startDate, capacity, price, cover, endDate, link });
        newCourse.save()
            .then(course => {
                res.redirect(req.body.redirect);
            }).catch(err => {
                if (err) console.log(err);
            });
    }
});

router.post('/course-cover', ensureAuthenticated, upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    const { courseID } = req.body;
    if (!file) {
        res.send('no file to upload');
    } else {
        var cover = file.destination.slice(6) + '/' + file.originalname;
        Course.updateMany({_id: courseID}, {$set: {cover}}, (err, doc) => {
            req.flash('success_msg', 'کاور با موفقیت آپلود و ذخیره شد.');
            res.redirect(`/dashboard/admin-edit-course?courseID=${courseID}`);
        });
    }
});

router.post('/api-Workshop', ensureAuthenticated, upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    const { workshopID, title, answer } = req.body;
    if (!file) {
        res.send('no file to upload');
    } else {
        var picture = file.destination.slice(6) + '/' + file.originalname;
        Workshop.findById(workshopID, (err, workshop) => {
            var data = workshop.data;
            var type = file.mimetype.split('/')[0];
            data.push({workshopID, title, answer, file: picture, type});
            Workshop.updateMany({_id: workshopID}, {$set: {data}}, (err, doc) => {
                res.redirect(`/dashboard/api-senario?id=${workshopID}`);
            });
        });
    }
});


module.exports = router;