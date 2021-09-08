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
    var y = parseInt(date.substr(0, 4));
    var m = parseInt(date.substr(5, 2));
    var d = parseInt(date.substr(8, 2));
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
var isToday = (date) => {
    var now = new Date();
    if(now.getDate() == date.getDate() && now.getMonth() == date.getMonth() && now.getYear() == date.getYear()) return true;
    return false;
};

router.get('/', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'user'){
        User.find({}, (err, users) => {
            var todayCnt = 0, totalCnt = 0, todayAvg = 0, totalAvg = 0;
            for(var t=0; t<users.length; t++)
            {
                var usr = users[t];
                for (var i = 0; i < usr.course.length; i++) {
                    if(usr.course[i].courseID == req.query.courseID){
                        if(usr.course[i].answer){
                            var answer = usr.course[i].answer;
                            for (var j = 0; j < answer.length; j++) {
                                if(isToday(answer[j].date)){
                                    todayAvg += answer[j].score;
                                    todayCnt++;
                                }
                                totalAvg += answer[j].score;
                                totalCnt++;
                            }
                        }
                    }
                }
            }
            if(todayCnt != 0 && totalCnt != 0){
                todayAvg /= todayCnt;
                totalAvg /= totalCnt;
            }
            var todayScore = 0;
            var totalScore = 0;
            for (var i = 0; i < req.user.course.length; i++) {
                if(req.user.course[i].courseID == req.query.courseID){
                    if(req.user.course[i].answer){
                        var answer = req.user.course[i].answer;
                        for (var j = 0; j < answer.length; j++) {
                            if(isToday(answer[j].date)){
                                todayScore = answer[j].score;
                            }
                            totalScore += answer[j].score;
                        }
                    }
                }
            }
            Course.findById(req.query.courseID, (err, course) => {
                res.render('./class/user-class', {
                    user: req.user,
                    course,
                    link: req.query.link,
                    todayScore,
                    totalScore,
                    todayAvg,
                    totalAvg,
                });
            });
        });
    }
    else if(req.user.role == 'teacher'){
        Course.findById(req.query.courseID, (err, course) => {
            var sessionNum = course.sessionNum;
            if(Date.now() - course.lastTeacherLogin > 12 * 60 * 60 * 1000) sessionNum++;
            Course.updateMany({_id: course._id}, {$set: {sessionNum, lastTeacherLogin: Date.now()}}, (err) => {});
            res.render('./class/teacher-class', {
                user: req.user,
                course,
                link: req.query.link,

            });
        })
    }
});

router.get('/report', ensureAuthenticated, (req, res, next) => {
    var {courseID} = req.query;

    var getAvg = (users, sessionNum) => {
        var sum = 0, cnt = 0;
        for (let i = 0; i < users.length; i++) {
            const usr = users[i];
            var courseIndex = usr.course.map(e => e.courseID.toString()).indexOf(courseID.toString());
            if(courseIndex != -1){
                var answers = usr.course[courseIndex].answer;
                if(answers){
                    for(var j=0; j<answers.length; j++){
                        if(answers[j].session == sessionNum){
                            sum += answers[j].score;
                            cnt++;
                        }
                    }
                }
            }
        }
        if(cnt == 0) return 0;
        return Math.floor((sum/cnt)*100)/100;
    };
    var getMax = (users, date) => {
        var max = 0, cnt = 0;
        for (let i = 0; i < users.length; i++) {
            const usr = users[i];
            var courseIndex = usr.course.map(e => e.courseID.toString()).indexOf(courseID.toString());
            if(courseIndex != -1){
                var answers = usr.course[courseIndex].answer;
                if(answers){
                    for(var j=0; j<answers.length; j++){
                        if((date.getTime() - answers[j].date.getTime()) < 1000*60*60*24){
                            if(max < answers[j].score)
                                max = answers[j].score;
                        }
                    }
                }
            }
        }
        return max;
    }
    var getMin = (users, date) => {
        var min = 9999, cnt = 0;
        for (let i = 0; i < users.length; i++) {
            const usr = users[i];
            var courseIndex = usr.course.map(e => e.courseID.toString()).indexOf(courseID.toString());
            if(courseIndex != -1){
                var answers = usr.course[courseIndex].answer;
                if(answers){
                    for(var j=0; j<answers.length; j++){
                        if((date.getTime() - answers[j].date.getTime()) < 1000*60*60*24){
                            if(min > answers[j].score)
                                min = answers[j].score;
                        }
                    }
                }
            }
        }
        return min;
    }
    if(req.user.role == 'teacher' || req.user.role == 'admin'){
        Course.findById(courseID, (err, course) => {
            User.find({}, (err, allUsers) => {
                var users = [];
                allUsers.forEach(usr => {
                    if(usr.course.map(e => e.courseID.toString()).indexOf(courseID.toString()) != -1)
                        users.push(usr);
                })
                res.render('./class/report', {
                    user: req.user,
                    users,
                    course,
                    getAvg,
                    getMax,
                    getMin,
                    gregorian_to_jalali,
                    get_year_month_day
                })
            })
        });
    }
});

// router.get('/report-user', ensureAuthenticated, (req, res, next) => {
//     var {courseID, userID} = req.query;
//     if(req.user.role == 'teacher' || req.user.role == 'admin'){
//         Course.findById(courseID, (err, course) => {
//             User.findById(userID, (err, reportUser) => {
//                 res.render('./class/report-user', {
//                     user: req.user,
//                     reportUser,
//                     course,
//                 })
//             })
//         });
//     }
// });

module.exports = router;