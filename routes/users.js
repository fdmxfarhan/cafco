var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');
const TradeUser = require('../models/workshop-trade/TradeUser');
const bcrypt = require('bcryptjs');
const mail = require('../config/mail');
const passport = require('passport');
const generateCode = require('../config/generateCode');
const sms = require('../config/sms');

router.get('/register', (req, res, next) => {
    if(req.user)
        res.redirect('/dashboard');
    else
        res.render('register');
});

router.get('/register2', (req, res, next) => {
    if(req.user)
        res.redirect('/dashboard');
    else
        res.render('register');
});

router.get('/login', (req, res, next) => {
    if(req.user)
        res.redirect('/dashboard');
    else
        res.render('login');
});
router.get('/pass-recover', (req, res, next) => {
    if(req.user)
        res.redirect('/dashboard');
    else
        res.render('pass-recover');
});
  
router.post('/pass-recover', (req, res, next) => {
    var {idNumber} = req.body;
    let errors = [];
    code = generateCode(4);
    User.findOne({idNumber: idNumber}, (err, user) => {
        if(user){
            sms(user.phone, `رمز یک بار مصرف شما: ${code} \nکلبه آفرینش فکر`);
            User.updateMany({idNumber: idNumber}, {$set: {recoveryCode: code}}, (err) => {
                res.render('enter-code', {idNumber})
            });
        }
        else{
            errors.push({msg: 'کد ملی یافت نشد'});
            res.render('pass-recover', {idNumber, errors});
        }
    })
});

router.post('/enter-code', (req, res, next) => {
    var {idNumber, enterCode} = req.body;
    let errors = [];
    User.findOne({idNumber: idNumber}, (err, user) => {
        if(err) console.log(err);
        else if(enterCode == user.recoveryCode){
            res.render('change-pass', {idNumber});
        }
        else{
            errors.push({msg: 'رمز یک بار مصرف اشتباه می‌باشد.'});
            res.render('enter-code', {idNumber, errors});
        }
    });
});

router.post('/change-pass', (req, res, next) => {
    var {idNumber, password, confirmPassword} = req.body;
    let errors = [];
    if(password !== confirmPassword){
        errors.push({msg: 'تایید رمز عبور صحیح نمیباشد!'});
    }
    if(password.length < 4){
        errors.push({msg: 'رمز عبور شما بسیار ضعیف میباشد!'});
    }
    if(errors.length > 0 ){
        res.render('change-pass', {idNumber, password, confirmPassword, errors});
    }
    else{
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(password, salt, (err, hash) => {
            if(err) throw err;
            User.updateMany({idNumber: idNumber}, {$set: {password: hash}}, (err) => {
                res.render('login');
            })
        }));
    }
    
});

router.post('/register', (req, res, next) => {
    var { firstName, lastName, address, phone, school, idNumber, password, configpassword, birthDay, birthMonth, birthYear, education} = req.body;
    const role = 'user', card = 0;
    const ipAddress = req.connection.remoteAddress;
    let errors = [];
    /// check required
    if(!firstName || !lastName || !address || !phone || !school || !idNumber || !password || !configpassword || !birthDay || !birthMonth || !birthYear || !education){
        errors.push({msg: 'لطفا موارد خواسته شده را کامل کنید!'});
    }
    /// check password match
    if(password !== configpassword){
        errors.push({msg: 'تایید رمز عبور صحیح نمیباشد!'});
    }
    /// check password length
    if(password.length < 4){
        errors.push({msg: 'رمز عبور شما بسیار ضعیف میباشد!'});
    }
    ///////////send evreything 
    if(errors.length > 0 ){
        res.render('register', { firstName, lastName, address, phone, school, idNumber, errors});
    }
    else{
        const fullname = firstName + ' ' + lastName;
        // validation passed
        User.findOne({ idNumber: idNumber})
            .then(user =>{
            if(user){
                // user exist
                errors.push({msg: 'کد ملی قبلا ثبت شده است.'});
                res.render('register', { firstName, lastName, address, phone, school, idNumber, errors });
            }
            else {
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
                const newUser = new User({ipAddress, fullname, firstName, lastName, address, phone, school, idNumber, password, role, card, birthday: {day: birthDay, month: birthMonth, year: birthYear}, education, educationNum});
                // Hash password
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err) throw err;
                newUser.password = hash;
                newUser.save()
                    .then(user => {
                        // const username = idNumber;
                        // console.log(username, password);

                        // passport.authenticate('local', {
                        //     successRedirect: '/dashboard?login=true',
                        //     failureRedirect: '/users/login',
                        //     failureFlash: true
                        // })(req, res, next);

                        req.flash('success_msg', 'ثبت نام با موفقیت انجام شد. اکنون میتوانید وارد شوید.');
                        res.redirect('/users/login');

                    }).catch(err => console.log(err));
                }));
                console.log(newUser);
            }
        });
    }  
});
  
router.post('/login', function(req, res, next){
    const { username, password} = req.body;
    let errors = [];
    /// check required
    if(!username || !password){
      errors.push({msg: 'لطفا موارد خواسته شده را کامل کنید!'});
    }
    if(errors.length > 0 ){
      res.render('login', { errors, username, password});
    }
    TradeUser.findOne({username, password}, (err, user) => {
        if(user){
            req.session.tradeUserID = user._id;
            res.redirect('/trade-workshop/user');
        }else{
            passport.authenticate('local', {
              successRedirect: '/dashboard?login=true',
              failureRedirect: '/users/login',
              failureFlash: true
            })(req, res, next);
        }
    })
});
  
// Logout handle
router.get('/logout', function(req, res, next){
    req.logOut();
    req.flash('success_msg', 'شما با موفقیت خارج شدید');
    res.redirect('/users/login');
});

module.exports = router;
