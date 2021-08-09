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

router.get('/', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'user'){
        Course.findById(req.query.courseID, (err, course) => {
            res.render('./class/user-class', {
                user: req.user,
                course,
                link: req.query.link,

            });
        })
    }
    else if(req.user.role == 'teacher'){
        Course.findById(req.query.courseID, (err, course) => {
            res.render('./class/teacher-class', {
                user: req.user,
                course,
                link: req.query.link,

            });
        })
    }
});


module.exports = router;