var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Course = require('../models/Course');
var Payment = require('../models/Payment');
var Workshop = require('../models/Workshop');
const mail = require('../config/mail');
const dot = require('../config/dot');
const shamsi = require('../config/shamsi');
const bcrypt = require('bcryptjs');

var timeToString = (time) => {
    return(`${time.hour < 10 ? '0'+ time.hour : time.hour}:${time.minute < 10 ? '0' + time.minute : time.minute}:${time.second < 10 ? '0' + time.second : time.second}`)
}

var isAnarestani = (phone) => {
    if(phone.slice(0, 5) == '09944' || phone.slice(0, 5) == '09945' || phone.slice(0, 5) == '09933' || phone.slice(0, 5) == '09932' || phone.slice(0, 5) == '09908' || phone.slice(0, 5) == '09940'){
        return true;
    }
    return false;
}
var educationStages = [
    'پیش دبستانی',
    'اول ابتدایی',
    'دوم ابتدایی',
    'سوم ابتدایی',
    'چهارم ابتدایی',
    'پنجم ابتدایی',
    'ششم ابتدایی',
    'هفتم دوره اول دبیرستان',
    'هشتم دوره اول دبیرستان',
    'نهم دوره اول دبیرستان',
    'دهم دوره دوم دبیرستان',
    'یازدهم دوره دوم دبیرستان',
    'دوازدهم دوره دوم دبیرستان',
    'بزرگسال',
];

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

var sortAlgorythm = (a, b) => {
    if(a.startDate.year == b.startDate.year){
        if(a.startDate.month == b.startDate.month){
            if(a.startDate.day == b.startDate.day){
                return a.price - b.price;
            }
            return a.startDate.day - b.startDate.day;
        }
        return a.startDate.month - b.startDate.month;    
    }
    return a.startDate.year - b.startDate.year;
};

router.get('/', ensureAuthenticated, (req, res, next) => {
    if (req.user.role == 'user') {
        // age = getAge(req.user.birthday.year);
        // Course.find({ minAge: {$lt : age}, maxAge: { $gt :  age}, }, (err, courses) => {
        age = req.user.educationNum;
        Course.find({ minAge: {$lt : age+1}, maxAge: { $gt :  age-1}, }, (err, courses) => {
            var anarestani = false;
            if(req.user.phone.slice(0, 5) == '09944' || req.user.phone.slice(0, 5) == '09945' || req.user.phone.slice(0, 5) == '09933' || req.user.phone.slice(0, 5) == '09932' || req.user.phone.slice(0, 5) == '09908' || req.user.phone.slice(0, 5) == '09940')
                anarestani = true;
            var notPayedCoursesNum = 0;
            var registeredCourse = [];
            for (var i = 0; i < req.user.course.length; i++) {
                if (!req.user.course[i].payed) notPayedCoursesNum++;
                registeredCourse.push(req.user.course[i].courseID)
            }

            courses = courses.sort(sortAlgorythm);
            res.render('./dashboard/user-dashboard', {
                user: req.user,
                login: req.query.login,
                courses,
                notPayedCoursesNum,
                dot,
                anarestani,
                registeredCourse,
                educationStages,
            });
        });
    } else if (req.user.role == 'admin') {
        Course.find({}, (err, courses) => {
            User.find({}, (err, users) => {
                var studentsNum = 0;
                for (let i = 0; i < users.length; i++) {
                    users[i].course.forEach(userCourse => {
                        if (userCourse.payed) studentsNum++;
                    });
                }
                courses = courses.sort(sortAlgorythm);
                res.render('./dashboard/admin-dashboard', {
                    user: req.user,
                    users,
                    login: req.query.login,
                    courses,
                    studentsNum,
                    dot,
                    anarestani: false,
                    registeredCourse: [],
                    educationStages,
                });
            });
        });
    }
    else {
        Course.find({}, (err, courses) => {
            courses = courses.sort(sortAlgorythm);
            res.render('./dashboard/teacher-dashboard', {
                user: req.user,
                login: req.query.login,
                courses,
                dot,
                anarestani: false,
                registeredCourse: [],
                educationStages,
            });
        });
    }
});

router.get('/users-view', ensureAuthenticated, (req, res, next) => {
    if (req.user.role == 'admin') {
        Course.find({}, (err, courses) => {
            User.find({}, (err, users) => {
                var userID = false;
                if(req.query.userID) userID = req.query.userID;
                res.render('./dashboard/admin-users-view', {
                    user: req.user,
                    users,
                    isAnarestani,
                    courses,
                    userID,
                });
            });
        })
    } else  res.send('permission denied');
});

var searchUser = (user, word) => {
    if(user.fullname)
        if(user.fullname.search(word) != -1) return true;
    if(user.firstName)
        if(user.firstName.search(word) != -1) return true;
    if(user.lastName)
        if(user.lastName.search(word) != -1) return true;
    if(user.phone)
        if(user.phone.search(word) != -1) return true;
    if(user.idNumber)
        if(user.idNumber.search(word) != -1) return true;
    if(user.role)
        if(user.role.search(word) != -1) return true;
    if(user.address)
        if(user.address.search(word) != -1) return true;
    if(user.education)
        if(user.education.search(word) != -1) return true;
    for (let i = 0; i < user.course.length; i++) {
        if(user.course[i].course.title.search(word) != -1) return true;
        if(user.course[i].course.description.search(word) != -1) return true;
        if(user.course[i].course.teacher.search(word) != -1) return true;
        if(user.course[i].course.status.search(word) != -1) return true;
        if(user.course[i].course.cover.search(word) != -1) return true;
    }
    return false;
}

router.post('/users-view', ensureAuthenticated, (req, res, next) => {
    var {search} = req.body;
    if (req.user.role == 'admin') {
        Course.find({}, (err, courses) => {
            User.find({}, (err, allUsers) => {
                var userID = false;
                if(req.body.userID) userID = req.body.userID;
                users = [];
                allUsers.forEach(user => {
                    if(searchUser(user, search))
                        users.push(user);
                });
                res.render('./dashboard/admin-users-view', {
                    user: req.user,
                    courses,
                    users,
                    isAnarestani,
                    userID,
                    search,
                });
            });
        });
    } else  res.send('permission denied');
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
            var payState = false;
            if(course.price == 0) payState = true;
            courseList.push({ courseID: req.query.courseID, course, payed: payState });
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
    var anarestani = false;
    if(req.user.phone.slice(0, 5) == '09944' || req.user.phone.slice(0, 5) == '09945' || req.user.phone.slice(0, 5) == '09933' || req.user.phone.slice(0, 5) == '09932' || req.user.phone.slice(0, 5) == '09908' || req.user.phone.slice(0, 5) == '09940'){
        anarestani = true;
    }
    var courseList = req.user.course;
    var priceSum = 0, discount = 0, sessionNum = 0;
    var discount72 = false;
    for (var i = 0; i < courseList.length; i++) {
        if (!courseList[i].payed)
        priceSum += courseList[i].course.price;
        sessionNum += courseList[i].course.session;
    }
    if(sessionNum > 72 && !anarestani) {
        discount72 = true;
        discount += Math.floor((priceSum * 20) / 100)
    }
    if(anarestani){
        discount += Math.floor((priceSum * 40) / 100)
    }
    res.render('./dashboard/user-pay', {
        user: req.user,
        priceSum,
        discount,
        dot,
        discount72,
        anarestani,
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
            anarestani: false,
            registeredCourse: [],
            educationStages,
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
            anarestani: false,
            registeredCourse: [],
            educationStages,
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
        Course.find({}, (err, courses) => {
            User.find({}, (err, users) => {
                var usersList = [];
                var usersForThisCourse = [];
                users.forEach(usr => {
                    registered = false;
                    usr.course.forEach(crs => {
                        if (crs.courseID == req.query.courseID){
                            usersList.push(usr);
                            registered = true;
                        }
                    });
                    if(!registered && course.minAge < usr.educationNum+1 && course.maxAge > usr.educationNum-1) 
                        usersForThisCourse.push(usr);
                });
                res.render('./dashboard/admin-users-view', {
                    user: req.user,
                    users: usersList,
                    course,
                    courses,
                    isAnarestani,
                    courseID: req.query.courseID,
                    usersForThisCourse,
                });
            });
        })
    });
});

router.post('/course-list', ensureAuthenticated, (req, res, next) => {
    var {search} = req.body;
    Course.findById(req.body.courseID, (err, course) => {
        Course.find({}, (err, courses) => {
            User.find({}, (err, users) => {
                var usersList = [];
                var usersForThisCourse = [];
                users.forEach(usr => {
                    registered = false;
                    usr.course.forEach(crs => {
                        if (crs.courseID == req.body.courseID && searchUser(usr, search)){
                            usersList.push(usr);
                            registered = true;
                        }
                    });
                    if(!registered && course.minAge < usr.educationNum+1 && course.maxAge > usr.educationNum+1) 
                        usersForThisCourse.push(usr);
                });
                
                res.render('./dashboard/admin-users-view', {
                    user: req.user,
                    users: usersList,
                    course,
                    courses,
                    isAnarestani,
                    usersForThisCourse,
                });
            });
        })
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
    const { title, undertitle, description, teacher, session, minAge, maxAge, day, month, year, endDay, endMonth, endYear, capacity, price, courseID, link } = req.body;
    if(req.user.role == 'admin'){
        Course.updateMany({_id: courseID}, {$set: {title, undertitle, description, teacher, session, minAge, maxAge, day, month, year, endDay, endMonth, endYear, capacity, price, courseID, link}}, (err, doc) => {
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

router.get('/change-role', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        User.updateMany({_id: req.query.userID}, {$set: {role: req.query.role}}, (err, doc) => {
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

router.get('/remove-user', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        User.deleteMany({_id: req.query.userID}, (err, doc) => {
            res.redirect('/dashboard/users-view')
        })
    }
});

router.post('/admin-add-course-to-user', ensureAuthenticated, (req, res, next) => {
    console.log(req.body);
    if(req.user.role == 'admin'){
        User.findById(req.body.userID, (err, user) => {
            Course.findById(req.body.courseID, (err, course) => {
                var students = course.students;
                var courseList = user.course;
                var registered = false;
                courseList.forEach(course2 => {
                    if (course2.courseID == req.body.courseID) registered = true;
                });
                if (!registered) {
                    var payState = false;
                    if(req.body.payed) payState = true;
                    if(course.price == 0) payState = true;
                    courseList.push({ courseID: req.body.courseID, course, payed: payState });

                    User.updateMany({ _id: req.body.userID }, { $set: { course: courseList } }, (err, doc) => {
                        students.push(req.user._id);
                        Course.updateMany({_id: req.query.courseID}, {$set: {students: students}}, (err, doc) => {
                            res.redirect('/dashboard/users-view');
                        });
                    });
                } else {
                    res.send('این دوره قبلا ثبت شده');
                }
            });
            
        });
    }
});

router.get('/admin-edit-user', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        User.findById(req.query.userID, (err, editingUser) => {
            res.render('./dashboard/admin-edit-user', {
                user: req.user,
                editingUser,
            });
        });
    }
});

router.post('/admin-edit-user', ensureAuthenticated, (req, res, next) => {
    const { userID, firstName, lastName, address, school, idNumber, phone, educationNum } = req.body;
    if(req.user.role == 'admin'){
        User.updateMany({_id: userID}, {$set: {firstName, lastName, address, school, idNumber, phone, educationNum}}, (err, doc) => {
            req.flash('success_msg', 'تغییرات با موفقیت ثبت شد');
            res.redirect(`/dashboard/admin-edit-user?userID=${userID}`);
        });
    }
});

router.post('/admin-password-user', ensureAuthenticated, (req, res, next) => {
    const { userID, password, confirmpassword } = req.body;
    if(password != confirmpassword) 
        res.send('تایید رمز عبور صحیح نمی‌باشد');
    else if(req.user.role == 'admin'){
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(password, salt, (err, hash) => {
            if(err) throw err;
            User.updateMany({_id: userID}, {$set: {password: hash}}, (err, doc) => {
                req.flash('success_msg', 'تغییرات با موفقیت ثبت شد');
                res.redirect(`/dashboard/admin-edit-user?userID=${userID}`);
            });
        }));
    }
});

router.post('/admin-adduser', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        const  {firstName, lastName, address, phone, school, birthDay, birthMonth, birthYear, education, idNumber, password, configpassword, courseList} = req.body;
        User.findOne({idNumber: idNumber}, (err, user) => {
            if(user) res.send('کد ملی قبلا ثبت شده');
            else if(password != configpassword) res.send('تایید رمز عبور صحیح نمی‌باشد');
            else{
                const role = 'user', card = 0;
                const fullname = firstName + ' ' + lastName;
                var educatinoNum = 0;
                     if(education == 'پیش دبستانی')                     educationNum = 0;
                else if(education == 'اول ابتدایی')                     educationNum = 1;
                else if(education == 'دوم ابتدایی')                     educationNum = 2;
                else if(education == 'سوم ابتدایی')                     educationNum = 3;
                else if(education == 'چهارم ابتدایی')                   educationNum = 4;
                else if(education == 'پنجم ابتدایی')                    educationNum = 5;
                else if(education == 'ششم ابتدایی')                     educationNum = 6;
                else if(education == 'هفتم دوره اول دبیرستان')         educationNum = 7;
                else if(education == 'هشتم دوره اول دبیرستان')         educationNum = 8;
                else if(education == 'نهم دوره اول دبیرستان')          educationNum = 9;
                else if(education == 'دهم دوره دوم دبیرستان')          educationNum = 10;
                else if(education == 'یازدهم دوره دوم دبیرستان')       educationNum = 11;
                else if(education == 'دوازدهم دوره دوم دبیرستان')      educationNum = 12;
                else                                                     educationNum = 13;
                Course.find({}, (err, courses) => {
                    var registeredCourseList = [];
                    if(courseList){
                        for (let i = 0; i < courses.length; i++) {
                            for (let j = 0; j < courseList.length; j++) {
                                if(courseList[j] == courses[i]._id)
                                    registeredCourseList.push({ courseID: courses[i]._id, course: courses[i], payed: true });
                            }
                        }
                    }
                    var newUser = new User({fullname, firstName, lastName, address, phone, school, idNumber, password, role, card, birthday: {day: birthDay, month: birthMonth, year: birthYear}, education, educationNum, course: registeredCourseList});
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                res.redirect('/dashboard/users-view');        
                            }).catch(err => console.log(err));
                        }) 
                    );
                });
            }
        })
    }
});

router.post('/user-course-list-edit', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        var {userID, courseList} = req.body;
        Course.find({}, (err, courses) => {
            var registeredCourseList = [];
            if(courseList){
                for (let i = 0; i < courses.length; i++) {
                    for (let j = 1; j < courseList.length; j++) {
                        if(courseList[j] == courses[i]._id)
                            registeredCourseList.push({ courseID: courses[i]._id, course: courses[i], payed: true });
                    }
                }
            }
            User.updateMany({_id: userID}, {$set: {course: registeredCourseList}}, (err, doc) => {
                res.redirect(`/dashboard/users-view?userID=${userID}`);
            });
        });
    }
});

router.post('/add-user-to-course', ensureAuthenticated, (req, res, next) => {
    var {courseID, userID} = req.body;
    Course.findById(courseID, (err, course) => {
        User.findById(userID, (err, user) => {
            var students = course.students;
            if (err) console.log(err);
            var courseList = user.course;
            var registered = false;
            courseList.forEach(course2 => {
                if (course2.courseID == courseID) registered = true;
            });
            if (!registered) {
                courseList.push({ courseID: courseID, course, payed: true });
                User.updateMany({ idNumber: user.idNumber }, { $set: { course: courseList } }, (err, doc) => {
                    students.push(user._id);
                    Course.updateMany({_id: courseID}, {$set: {students: students}}, (err, doc) => {
                        res.redirect(`/dashboard/course-list?courseID=${courseID}`);
                    });
                });
            } else {
                res.send('این دوره قبلا ثبت شده');
            }
        })
    })
});

router.get('/api', ensureAuthenticated, (req, res, next) => {
    Workshop.find({}, (err, workshop) => {
        User.find({role: 'admin'}, (err, users) => {
            res.render('./dashboard/admin-api', {
                user: req.user,
                workshop,
                timeToString,
                users,
            });
        })
    })
});

router.post('/api-add-senario', ensureAuthenticated, (req, res, next) => {
    const {senarioNum, title} = req.body;
    if(req.user.role == 'admin'){
        var newSenario = new Workshop({senarioNum, title, questionNum: 0, data: []});
        newSenario.save().then(doc => {
            // res.redirect(`/dashboard/api-senario?id=${newSenario._id}`);
            res.redirect(`/dashboard/api`);
        }).catch(err => {if(err) console.log(err);});
    }
});

router.get('/api-senario', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Workshop.findById(req.query.id, (err, workshop) => {
            res.render('./dashboard/admin-api-senario', {
                user: req.user,
                workshop
            });
        });
    }
});

router.get('/api-remove-question', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Workshop.findById(req.query.workshopID, (err, workshop) => {
            var data = workshop.data;
            data.splice(parseInt(req.query.index), 1);

            Workshop.updateMany({_id: req.query.workshopID}, {$set: {data}}, (err, doc) => {
                res.redirect(`/dashboard/api-senario?id=${req.query.workshopID}`);
            });
        });
    }
});

router.get('/api-remove-senario', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Workshop.deleteOne({_id: req.query.id}, (err) => {
            res.redirect(`/dashboard/api`);
        });
    }
});

router.post('/admin-edit-senario', ensureAuthenticated, (req, res, next) => {
    const {workshopID, title, second, minute, hour} = req.body;
    if(req.user.role == 'admin'){
        Workshop.updateMany({_id: workshopID}, {$set: {title, time: {hour, minute, second}}}, (err, doc) => {
            res.redirect('/dashboard/api');
        });
    }
})

router.post('/api-edit-admins', ensureAuthenticated, (req, res, next) => {
    var admins = req.body.admins;
    if(req.user.role == 'admin'){
        for(var i=0; i<admins.length; i++){
            User.updateMany({_id: admins[i]}, {$set: {kashfolasrar: true}}, (err, doc) => {if(err) console.log(err)})
        }
        res.redirect('/dashboard/api')
    }
});

module.exports = router;