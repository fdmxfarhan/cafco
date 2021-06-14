var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Course = require('../models/Course');
var Payment = require('../models/Payment');
const mail = require('../config/mail');
const dot = require('../config/dot');
const shamsi = require('../config/shamsi');

getAge = (year) => {
    _greg = new Date(Date.now());
    _day = _greg.getDate();
    _month = _greg.getMonth() + 1;
    _year = _greg.getFullYear();
    _jalali = gregorian_to_jalali(_year, _month, _day)
    now = { year: _jalali[0], month: _jalali[1], day: _jalali[2] };

    return(now.year - year);
}

function div(a, b) {
    return parseInt((a / b));
}

function gregorian_to_jalali(g_y, g_m, g_d) {
    var g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    var jalali = [];
    var gy = g_y - 1600;
    var gm = g_m - 1;
    var gd = g_d - 1;

    var g_day_no = 365 * gy + div(gy + 3, 4) - div(gy + 99, 100) + div(gy + 399, 400);

    for (var i = 0; i < gm; ++i)
        g_day_no += g_days_in_month[i];
    if (gm > 1 && ((gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0)))
    /* leap and after Feb */
        g_day_no++;
    g_day_no += gd;

    var j_day_no = g_day_no - 79;

    var j_np = div(j_day_no, 12053);
    /* 12053 = 365*33 + 32/4 */
    j_day_no = j_day_no % 12053;

    var jy = 979 + 33 * j_np + 4 * div(j_day_no, 1461);
    /* 1461 = 365*4 + 4/4 */

    j_day_no %= 1461;

    if (j_day_no >= 366) {
        jy += div(j_day_no - 1, 365);
        j_day_no = (j_day_no - 1) % 365;
    }
    for (var i = 0; i < 11 && j_day_no >= j_days_in_month[i]; ++i)
        j_day_no -= j_days_in_month[i];
    var jm = i + 1;
    var jd = j_day_no + 1;
    jalali[0] = jy;
    jalali[1] = jm;
    jalali[2] = jd;
    return jalali;
    //return jalali[0] + "_" + jalali[1] + "_" + jalali[2];
    //return jy + "/" + jm + "/" + jd;
}

function get_year_month_day(date) {
    var convertDate;
    var y = date.substr(0, 4);
    var m = date.substr(5, 2);
    var d = date.substr(8, 2);
    convertDate = gregorian_to_jalali(y, m, d);
    return convertDate;
}

function get_hour_minute_second(time) {
    var convertTime = [];
    convertTime[0] = time.substr(0, 2);
    convertTime[1] = time.substr(3, 2);
    convertTime[2] = time.substr(6, 2);
    return convertTime;
}

function convertDate(date) {
    var convertDateTime = get_year_month_day(date.substr(0, 10));
    convertDateTime = convertDateTime[0] + "/" + convertDateTime[1] + "/" + convertDateTime[2] + " " + date.substr(10);
    return convertDateTime;
}

function get_persian_month(month) {
    switch (month) {
        case 1:
            return "فروردین";
            break;
        case 2:
            return "اردیبهشت";
            break;
        case 3:
            return "خرداد";
            break;
        case 4:
            return "تیر";
            break;
        case 5:
            return "مرداد";
            break;
        case 6:
            return "شهریور";
            break;
        case 7:
            return "مهر";
            break;
        case 8:
            return "آبان";
            break;
        case 9:
            return "آذر";
            break;
        case 10:
            return "دی";
            break;
        case 11:
            return "بهمن";
            break;
        case 12:
            return "اسفند";
            break;
    }
}
setInterval(() => {
    greg = new Date(Date.now());
    day = greg.getDate();
    month = greg.getMonth() + 1;
    year = greg.getFullYear();
    jalali = gregorian_to_jalali(year, month, day)
    now = { year: jalali[0], month: jalali[1], day: jalali[2] };
    // console.log({ year, month, day });
    // console.log(now);
    Course.find({}, (err, courses) => {
        courses.forEach(course => {
            // console.log(course.endDate, now);
            if (parseInt(course.startDate.day) <= now.day && parseInt(course.startDate.month) <= now.month && parseInt(course.startDate.year) <= now.year && course.status == 'شروع نشده') {
                Course.updateMany({ _id: course._id }, { $set: { status: 'در حال برگزاری' } }, (err, doc) => {
                    if (err) console.log(err);
                });
            }
            if (parseInt(course.endDate.day) <= now.day && parseInt(course.endDate.month) <= now.month && parseInt(course.endDate.year) <= now.year && course.status == 'در حال برگزاری') {
                Course.updateMany({ _id: course._id }, { $set: { status: 'پایان یافته' } }, (err, doc) => {
                    if (err) console.log(err);
                });
            }
        });
    });

    User.find({}, (err, users) => {
        Course.find({}, (err, courses) => {
            users.forEach(user => {
                for(var i=0; i<user.course.length; i++){
                    for(var j=0; j<courses.length; j++){
                        if(user.course[i].courseID == courses[j]._id)
                            user.course[i].course = courses[j];
                    }
                }
                User.updateMany({_id: user._id}, {$set: {course: user.course}}, (err, doc) => {
                    if(err) console.log(err);
                });
            });
        });
    });
}, 30 * 1000);

router.get('/', ensureAuthenticated, (req, res, next) => {
    if (req.user.role == 'user') {
        // age = getAge(req.user.birthday.year);
        age = req.user.educationNum;
        // Course.find({ minAge: {$lt : age}, maxAge: { $gt :  age}, }, (err, courses) => {
        Course.find({ minAge: {$lt : age}, maxAge: { $gt :  age}, }, (err, courses) => {
            var notPayedCoursesNum = 0;
            for (var i = 0; i < req.user.course.length; i++) {
                if (!req.user.course[i].payed) notPayedCoursesNum++;
            }
            res.render('./dashboard/user-dashboard', {
                user: req.user,
                login: req.query.login,
                courses,
                notPayedCoursesNum,
                dot,
            });
        });
    } else if (req.user.role = 'admin') {
        Course.find({}, (err, courses) => {
            User.find({}, (err, users) => {
                var studentsNum = 0;
                for (let i = 0; i < users.length; i++) {
                    users[i].course.forEach(userCourse => {
                        if (userCourse.payed) studentsNum++;
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
    if (req.user.role == 'admin') {
        User.find({}, (err, users) => {
            res.render('./dashboard/admin-users-view', {
                user: req.user,
                users,
            });
        });
    } else
        res.send('permission denied');
});

router.get('/register-course', ensureAuthenticated, (req, res, next) => {
    Course.findById(req.query.courseID, (err, course) => {
        var students = course.students;
        if (err) console.log(err);
        var courseList = req.user.course;
        var registered = false;
        courseList.forEach(course2 => {
            if (course2.courseID == req.query.courseID) registered = true;
        });
        if (!registered) {
            courseList.push({ courseID: req.query.courseID, course, payed: false });
            User.updateMany({ idNumber: req.user.idNumber }, { $set: { course: courseList } }, (err, doc) => {
                students.push(req.user._id);
                Course.updateMany({_id: req.query.courseID}, {$set: {students: students}}, (err, doc) => {
                    res.redirect('/dashboard');
                });
            });
        } else {
            res.send('این دوره قبلا ثبت شده');
        }
    })
});

router.get('/remove-course', ensureAuthenticated, (req, res, next) => {
    Course.deleteOne({ _id: req.query.courseID }, (err, doc) => {
        res.redirect('/dashboard');
    });
});

router.get('/remove-user-course', ensureAuthenticated, (req, res, next) => {
    var courseList = req.user.course;
    courseList.splice(req.query.index, 1);
    User.updateMany({ idNumber: req.user.idNumber }, { $set: { course: courseList } }, (err, doc) => {
        res.redirect('/dashboard');
    });
});
router.get('/remove-user-course-pay', ensureAuthenticated, (req, res, next) => {
    var courseList = req.user.course;
    courseList.splice(req.query.index, 1);
    User.updateMany({ idNumber: req.user.idNumber }, { $set: { course: courseList } }, (err, doc) => {
        res.redirect('/dashboard/pay');
    });
});

router.get('/pay', ensureAuthenticated, (req, res, next) => {
    var courseList = req.user.course;
    var priceSum = 0, discount = 0, sessionNum = 0;
    var discount72 = false;
    for (var i = 0; i < courseList.length; i++) {
        if (!courseList[i].payed)
            priceSum += courseList[i].course.price;
        sessionNum += courseList[i].course.session;
    }
    if(sessionNum > 72) {
        discount72 = true;
        discount += Math.floor((priceSum * 20) / 100)
    }
    res.render('./dashboard/user-pay', {
        user: req.user,
        priceSum,
        discount,
        dot,
        discount72,
    });
});

router.get('/set-course-status', ensureAuthenticated, (req, res, next) => {
    Course.updateMany({ _id: req.query.courseID }, { $set: { status: req.query.status } }, (err, doc) => {
        if (err) console.log(err);
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

contain = (course, word) => {
    if(course.title.search(word) != -1) return true;
    if(course.description.search(word) != -1) return true;
    if(course.teacher.search(word) != -1) return true;
    if(course.status.search(word) != -1) return true;
    if(course.cover.search(word) != -1) return true;
    return false;
};
router.post('/courses', ensureAuthenticated, (req, res, next) => {
    Course.find({}, (err, courses) => {
        result = [];
        courses.forEach(course => {
            if(contain(course, req.body.search))
                result.push(course);
        });
        res.render('./dashboard/admin-courses', {
            user: req.user,
            courses: result,
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
                    if (crs.courseID == req.query.courseID)
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
    Payment.find({ idNumber: req.user.idNumber }, (err, payments) => {
        res.render('./dashboard/user-payments', {
            payments,
            user: req.user,
            shamsi,
        });
    });
});
router.get('/admin-payments', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Payment.find({}, (err, payments) => {
            res.render('./dashboard/admin-payments', {
                payments,
                user: req.user,
                shamsi,
            });
        });
    }
});

router.get('/discount', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        res.render('./dashboard/admin-discount', {
            user: req.user,
        });
    }
});


router.get('/admin-edit-course', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Course.findById(req.query.courseID, (err, course) => {
            res.render('./dashboard/admin-edit-course', {
                course,
                user: req.user,
                shamsi,
            });
        });
    }
});

router.post('/admin-edit-course', ensureAuthenticated, (req, res, next) => {
    const { title, description, teacher, session, minAge, maxAge, day, month, year, endDay, endMonth, endYear, capacity, price, courseID } = req.body;
    if(req.user.role == 'admin'){
        Course.updateMany({_id: courseID}, {$set: {title, description, teacher, session, minAge, maxAge, day, month, year, endDay, endMonth, endYear, capacity, price, courseID}}, (err, doc) => {
            req.flash('success_msg', 'تغییرات با موفقیت ثبت شد');
            res.redirect(`/dashboard/admin-edit-course?courseID=${courseID}`);
        });
    }
    
});

router.get('/make-admin', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        User.updateMany({_id: req.query.userID}, {$set: {role: 'admin'}}, (err, doc) => {
            res.redirect('/dashboard/users-view')
        })
    }
});

router.get('/make-user', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        User.updateMany({_id: req.query.userID}, {$set: {role: 'user'}}, (err, doc) => {
            res.redirect('/dashboard/users-view')
        })
    }
});

module.exports = router;