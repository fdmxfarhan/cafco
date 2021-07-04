var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
const bcrypt = require('bcryptjs');
const mail = require('../config/mail');
const passport = require('passport');

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
  
router.post('/register', (req, res, next) => {
    var { firstName, lastName, address, phone, school, idNumber, password, configpassword, birthDay, birthMonth, birthYear, education} = req.body;
    const role = 'admin', card = 0;
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
    passport.authenticate('local', {
      successRedirect: '/dashboard?login=true',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
});
  
// Logout handle
router.get('/logout', function(req, res, next){
    req.logOut();
    req.flash('success_msg', 'شما با موفقیت خارج شدید');
    res.redirect('/users/login');
});

module.exports = router;
