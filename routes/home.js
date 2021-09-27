var express = require('express');
var router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');

router.get('/', (req, res, next) => {
    console.log(req.url);
    res.redirect('/users/login');
});

router.get('/doit', (req, res, next) => {
    Course.find({}, (err, courses) => {
        User.find({}, (err, users) => {
            for (let i = 0; i < courses.length; i++) {
                var course = courses[i];
                students = [];
                for (let j = 0; j < users.length; j++) {
                    const user = users[j];
                    for (let k = 0; k < user.course.length; k++) {
                        const userCourse = user.course[k];
                        console.log(userCourse)
                        if(userCourse.course._id.toString() == course._id.toString() && userCourse.payed){
                            students.push(user._id);
                        }
                    }
                }
                Course.updateMany({_id: course._id}, {$set: {students}}, (err) => {
                    if(err) throw err;
                })
            }
            res.send('done');
        });
    });
});


module.exports = router;
