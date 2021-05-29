var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Course = require('../models/Course');
const mail = require('../config/mail');


router.get('/', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'user')
    {
        Course.find({}, (err, courses) => {
            res.render('./dashboard/user-dashboard', {
                user: req.user,
                login: req.query.login,
                courses
            });
        });
    }
    else if(req.user.role = 'admin')
    {
        Course.find({}, (err, courses) => {
            res.render('./dashboard/admin-dashboard', {
                user: req.user,
                login: req.query.login,
                courses,
            });
        });
    }
});

router.get('/register-course', ensureAuthenticated, (req, res, next) => {
    Course.findById(req.query.courseID, (err, course) => {
        if(err) console.log(err);
        var courseList = req.user.course;
        var registered = false;
        courseList.forEach(course2 => {
            if(course2.courseID == req.query.courseID) registered = true;
        });
        if(!registered){
            courseList.push({courseID: req.query.courseID, course, payed: false});
            User.updateMany({idNumber: req.user.idNumber}, {$set: {course: courseList}}, (err, doc) => {
                res.redirect('/dashboard');
            });
        }else{
            res.send('این دوره قبلا ثبت شده');
        }
    })
});

module.exports = router;
