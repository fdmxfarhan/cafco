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
    const { title, description, teacher, session, minAge, maxAge, day, month, year, endDay, endMonth, endYear, capacity, price } = req.body;

    if (!file) {
        res.send('no file to upload');
    } else {
        var cover = file.destination.slice(6) + '/' + file.originalname;
        var startDate = { day, month, year };
        var endDate = { day: endDay, month: endMonth, year: endYear };
        const newCourse = new Course({ title, description, teacher, session, minAge, maxAge, startDate, capacity, price, cover, endDate });
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

module.exports = router;