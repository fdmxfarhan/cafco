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
            var notPayedCoursesNum = 0;
            for(var i=0; i<req.user.course.length; i++)
            {
                if(!req.user.course[i].payed) notPayedCoursesNum++;
            }
            res.render('./dashboard/user-dashboard', {
                user: req.user,
                login: req.query.login,
                courses,
                notPayedCoursesNum,
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

router.get('/remove-user-course', ensureAuthenticated, (req, res, next) => {
    var courseList = req.user.course;
    courseList.splice(req.query.index, 1);
    User.updateMany({idNumber: req.user.idNumber}, {$set: {course: courseList}}, (err, doc) => {
        res.redirect('/dashboard');
    });
});
router.get('/remove-user-course-pay', ensureAuthenticated, (req, res, next) => {
    var courseList = req.user.course;
    courseList.splice(req.query.index, 1);
    User.updateMany({idNumber: req.user.idNumber}, {$set: {course: courseList}}, (err, doc) => {
        res.redirect('/dashboard/pay');
    });
});

router.get('/pay', ensureAuthenticated, (req, res, next) => {
    var courseList = req.user.course;
    var priceSum = 0;
    for(var i=0; i<courseList.length; i++)
    {
        if(!courseList[i].payed)
            priceSum += courseList[i].course.price;
    }
    res.render('./dashboard/user-pay', {
        user: req.user,
        priceSum,
        discount: 0,

    });
});

module.exports = router;
