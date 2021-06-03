var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Course = require('../models/Course');
var Payment = require('../models/Payment');
const mail = require('../config/mail');
const dot = require('../config/dot');
const shamsi = require('../config/shamsi');


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
                dot,
            });
        });
    }
    else if(req.user.role = 'admin')
    {
        Course.find({}, (err, courses) => {
            User.find({}, (err, users) => {
                var studentsNum = 0;
                for (let i = 0; i < users.length; i++) {
                    users[i].course.forEach(userCourse => {
                        if(userCourse.payed) studentsNum++;
                    });
                }
                res.render('./dashboard/admin-dashboard', {
                    user: req.user,
                    login: req.query.login,
                    courses,
                    studentsNum,
                    dot,
                });
            });
        });
    }
});

router.get('/users-view', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        User.find({}, (err, users) => {
            res.render('./dashboard/admin-users-view', {
                user: req.user,
                users,
            });
        });
    }
    else
        res.send('permission denied');
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

router.get('/remove-course', ensureAuthenticated, (req, res, next) => {
    Course.deleteOne({_id: req.query.courseID}, (err, doc) => {
        res.redirect('/dashboard');
    });
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
        dot,
    });
});

router.get('/set-course-status', ensureAuthenticated, (req, res, next) => {
    Course.updateMany({_id: req.query.courseID}, {$set: {status: req.query.status}}, (err, doc) => {
        if(err) console.log(err);
        res.redirect('/dashboard');
    });
});

router.get('/courses', ensureAuthenticated, (req, res, next) => {
    Course.find({}, (err, courses) => {
        res.render('./dashboard/admin-courses', {
            user: req.user,
            courses,
            dot,
        });
    });
});

router.get('/user-courses-view', ensureAuthenticated, (req, res, next) => {
    res.render('./dashboard/user-courses-view', {
        user: req.user,
        dot,
    });
});

router.get('/course-list', ensureAuthenticated, (req, res, next) => {
    Course.findById(req.query.courseID, (err, course) => {
        User.find({}, (err, users) => {
            var usersList = [];
            users.forEach(usr => {
                usr.course.forEach(crs => {
                    if(crs.courseID == req.query.courseID)
                        usersList.push(usr);
                });
            });
            res.render('./dashboard/admin-users-view', {
                user: req.user,
                users: usersList,
                course,
            });
        });
    });
});

router.get('/user-payments', ensureAuthenticated, (req, res, next) => {
    Payment.find({idNumber: req.user.idNumber}, (err, payments) => {
        res.render('./dashboard/user-payments', {
            payments,
            user: req.user,
            shamsi,
        });
    });
});

module.exports = router;
