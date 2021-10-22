var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');


router.get('/', (req, res, next) => {
    Payment.findOne({}, (err, payment) => {
        res.render(`success-pay`, { payment });
    });
})

router.get('/pay', function(req, res, next) {
    var courseList = req.user.course;
    var notPayedCourses = [];
    var priceSum = 0;
    for (var i = 0; i < courseList.length; i++) {
        if (!courseList[i].payed) {
            if(courseList[i].yearPayment)
                priceSum += courseList[i].course.yearPrice;
            else
                priceSum += courseList[i].course.price;
            notPayedCourses.push(courseList[i])
        }
    }
    // mines the discount amount 
    priceSum -= req.query.discount;

    // create new payment
    var newPayment = new Payment({
        userID: req.user._id,
        fullname: req.user.fullname,
        idNumber: req.user.idNumber,
        phone: req.user.phone,
        amount: priceSum,
        description: 'هزینه دوره های ثبت نام شده',
        date: Date.now(),
        payed: false,
        courseList: notPayedCourses,
        discount: req.query.discount,
    });
    newPayment.save().then(payment => {
        // console.log(payment);
        if (newPayment.amount == 0) {
            res.send('error: you cant pay ziro amount');
            return;
        }
        var options = {
            method: 'POST',
            url: 'https://api.idpay.ir/v1.1/payment',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': 'dec2b2aa-2cb5-47f4-8584-963dc313f363',
                // 'X-API-KEY': 'fe6a4553-cd95-4dff-af2e-80594c1c18c5',
                'X-SANDBOX': 0,
            },
            body: {
                'order_id': payment._id,
                'amount': payment.amount,
                'name': payment.fullname,
                'idNumber': payment.idNumber,
                'phone': payment.phone,
                'desc': payment.description,
                'callback': 'https://cafcoreg.ir/payment/pay',
                'reseller': null,
            },
            json: true,
        };
        request(options, function(error, response, body) {
            if (error) console.log(error);
            console.log(body);
            res.redirect(body.link);
        });
    }).catch(err => {
        if (err) console.log(err);
    });
});

router.post('/pay', function(req, res, next) {
    console.log(req.body);
    Payment.findOne({ _id: req.body.order_id }, (err, payment) => {
        if (payment) {
            var options2 = {
                method: 'POST',
                url: 'https://api.idpay.ir/v1.1/payment/verify',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'dec2b2aa-2cb5-47f4-8584-963dc313f363',
                    // 'X-API-KEY': 'fe6a4553-cd95-4dff-af2e-80594c1c18c5',
                    'X-SANDBOX': 0,
                },
                body: {
                    'id': req.body.id,
                    'order_id': req.body.order_id,
                },
                json: true,
            };
            request(options2, function(error, response, body) {
                if (error) console.log(error);
                console.log(body);
                if (body.status == 100) {
                    Payment.updateMany({ _id: payment._id }, { $set: { payed: true, track_id: body.payment.track_id } }, (err, doc) => {
                        if (err) console.log(err);
                        Payment.findById(payment._id, (err, payment) => {
                            User.findOne({ idNumber: payment.idNumber }, (err, user) => {
                                if (err) console.log(err);
                                var courseList = user.course;
                                for (let i = 0; i < courseList.length; i++) {
                                    courseList[i].payed = true;
                                    Course.find({_id: courseList[i].course._id}, (err, course) => {
                                        var students = course[i].students;
                                        students.push(user._id);
                                        Course.updateMany({_id: req.query.courseID}, {$set: {students: students}}, (err, doc) => {});
                                    })
                                }
                                User.updateMany({ idNumber: payment.idNumber }, { $set: { 
                                    course: courseList, 
                                    // card: user.card + payment.discount,
                                }}, (err, doc) => {
                                    if (err) console.log(err);
                                });
                            });
                            res.render(`success-pay`, {
                                payment
                            });
                        });
                        
                    });
                } else {
                    res.send('Error!!!!!!!!!!!');
                }
            });
        } else res.send('Error!!!!!!!!!!!');
    });
});

module.exports = router;

