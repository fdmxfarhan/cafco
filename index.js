var fs = require('fs');
var http = require('http');
var https = require('https');
const express = require('express')
const app = express()
var path = require('path');
const mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var createError = require('createerror');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport'); 
var Course = require('./models/Course');
var Answer = require('./models/Answer');

// routs requirement
var homeRoute = require('./routes/home');
var usersRoute = require('./routes/users');
var dashboardRoute = require('./routes/dashboard');
var uploadRoute = require('./routes/upload');
var paymentRoute = require('./routes/payment');
var apiRoute = require('./routes/api');
var classRoute = require('./routes/class');
const User = require('./models/User');

// Mongo DB connect
mongoose.connect('mongodb://localhost/register', {useNewUrlParser: true, useUnifiedTopology: true}, (err) =>{
    if(err) throw err;
    else console.log('Database connected :)');
});

// express session middleware
const{
    SESS_NAME = 'sid',
    SESS_TIME = 10000 * 60 * 60 * 2 
} = process.env

app.use(session({
    name: SESS_NAME,
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: SESS_TIME ,
        sameSite: true,
        secure: false
    }
}));

// passport config
require('./config/passports')(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

//Global vars
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// HTTPS key and ssl
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
var certificate = fs.readFileSync('ssl/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// port setup
const port = 3000

// Upload
app.use('/upload', uploadRoute);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// public path setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// Routes Handlers
app.use('/', homeRoute);
app.use('/users', usersRoute);
app.use('/dashboard', dashboardRoute);
app.use('/payment', paymentRoute);
app.use('/api', apiRoute);
app.use('/class', classRoute);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    console.log(err);
    if(!req.user) res.render('error',{
        uname: false,
        user: false,
        err
    });
    else res.render('error', {
        uname: req.user.uname,
        user: req.user,
        err
    });
});

var isToday = (date) => {
    var now = new Date();
    if(now.getDate() == date.getDate() && now.getMonth() == date.getMonth() && now.getYear() == date.getYear()) return true;
    return false;
};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

const io = require('socket.io')(httpsServer);
io.on("connection", socket => {
    console.log("a user connected :D");
    socket.on("log", msg => {
        console.log(msg);
        io.emit("log", msg);
    });
    
    socket.on("lock", msg => {
        console.log(msg);
        io.emit("lock", msg);
    });
    socket.on("popup", msg => {
        console.log(msg);
        io.emit("popup", msg);
    });
    socket.on("leave", msg => {
        console.log(msg);
        io.emit("leave", msg);
    });
    socket.on("avg", msg => {
        console.log(msg);
        Course.findById(msg.courseID, (err, course) => {
            User.find({}, (err, allUsers) => {
                var users = [];
                allUsers.forEach(usr => {
                    if(usr.course.map(e => e.courseID.toString()).indexOf(msg.courseID.toString()) != -1)
                        users.push(usr);
                });
                var sum = 0, cnt = 0, totalSum = 0, totalCnt = 0;
                for (let i = 0; i < users.length; i++) {
                    const usr = users[i];
                    var courseIndex = usr.course.map(e => e.courseID.toString()).indexOf(msg.courseID.toString());
                    if(courseIndex != -1){
                        var answers = usr.course[courseIndex].answer;
                        if(answers){
                            for(var j=0; j<answers.length; j++){
                                var now = (new Date()).getTime();
                                if((now - answers[j].date.getTime()) < 1000*60*60*24){
                                    sum+= answers[j].score;
                                    cnt++;
                                }
                                totalSum+= answers[j].score;
                                totalCnt++;
                            }
                        }
                    }
                }
                var dayAvg = 0;
                if(cnt != 0) dayAvg = sum/cnt;
                var totalAvg = 0;
                if(totalCnt != 0) totalAvg = totalSum/totalCnt;
                console.log({dayAvg, totalSum});
                io.emit("newAvg", {dayAvg, totalSum});
            });
        });
        
    });
    Course.find({}, (err, courses) => {
        courses.forEach(course => {
            socket.on(`${course._id}`, msg => {
                console.log(course.title, msg);
                io.emit(`${course._id}`, msg);
                if(msg.state == 'save')
                {
                    for(var i=0; i<msg.studentAnswers.length; i++)
                    {
                        var score = 0;
                        var time = msg.studentAnswers[i].time;
                        if(msg.rightAnswer == msg.studentAnswers[i].answer) score = Math.abs(msg.scoreRight);
                        else score = -Math.abs(msg.scoreWrong);
                        User.findById(msg.studentAnswers[i].userID, (err, user) => {
                            var courseIndex = -1;
                            for(var j=0; j<user.course.length; j++){
                                if(user.course[j].courseID == course._id.toString()) {
                                    courseIndex = j;
                                }
                            }
                            var date = new Date();
                            if(courseIndex == -1) console.log('course not found');
                            else if(user.course[courseIndex].answer)
                            {
                                var wasToday = false
                                for(var j=0; j<user.course[courseIndex].answer.length; j++)
                                {
                                    if(isToday(user.course[courseIndex].answer[j].date))
                                    {
                                        var newCourse = user.course;
                                        newCourse[courseIndex].answer[j].score += score;
                                        newCourse[courseIndex].answer[j].time += time;
                                        newCourse[courseIndex].answer[j].possibleMax += msg.scoreRight;
                                        User.updateMany({_id: user._id}, {$set: {course: newCourse}}, (err) => {if(err) console.log(err)});
                                        wasToday = true;
                                    }
                                }
                                if(!wasToday)
                                {
                                    var newCourse = user.course;
                                    newAnswer = newCourse[courseIndex].answer;
                                    newAnswer.push({date, score, session: course.sessionNum, time: time, possibleMax: msg.scoreRight});
                                    newCourse[courseIndex].answer = newAnswer;
                                    User.updateMany({_id: user._id}, {$set: {course: newCourse}}, (err) => {if(err) console.log(err)});
                                }
                            }
                            else
                            {
                                var newCourse = user.course;
                                newCourse[courseIndex].answer = [{date, score, session: course.sessionNum, time: time, possibleMax: msg.scoreRight}];
                                User.updateMany({_id: user._id}, {$set: {course: newCourse}}, (err) => {if(err) console.log(err)});
                            }
                        });
                    }
                }
            });
        });
    });
    
});

const io2 = require('socket.io')(httpServer);
io2.on("connection", socket => {
    console.log("a user connected :D");
    socket.on("log", msg => {
        console.log(msg);
        io2.emit("log", msg);
    });
    socket.on("lock", msg => {
        console.log(msg);
        io2.emit("lock", msg);
    });
    socket.on("popup", msg => {
        console.log(msg);
        io2.emit("popup", msg);
    });
    socket.on("leave", msg => {
        console.log(msg);
        io2.emit("leave", msg);
    });
    socket.on("avg", msg => {
        console.log(msg);
        Course.findById(msg.courseID, (err, course) => {
            User.find({}, (err, allUsers) => {
                var users = [];
                allUsers.forEach(usr => {
                    if(usr.course.map(e => e.courseID.toString()).indexOf(msg.courseID.toString()) != -1)
                        users.push(usr);
                });
                var sum = 0, cnt = 0, totalSum = 0, totalCnt = 0;
                for (let i = 0; i < users.length; i++) {
                    const usr = users[i];
                    var courseIndex = usr.course.map(e => e.courseID.toString()).indexOf(msg.courseID.toString());
                    if(courseIndex != -1){
                        var answers = usr.course[courseIndex].answer;
                        if(answers){
                            for(var j=0; j<answers.length; j++){
                                var now = (new Date()).getTime();
                                if((now - answers[j].date.getTime()) < 1000*60*60*24){
                                    sum+= answers[j].score;
                                    cnt++;
                                }
                                totalSum+= answers[j].score;
                                totalCnt++;
                            }
                        }
                    }
                }
                var dayAvg = 0;
                if(cnt != 0) dayAvg = sum/cnt;
                var totalAvg = 0;
                if(totalCnt != 0) totalAvg = totalSum/totalCnt;
                console.log({dayAvg, totalAvg});
                io2.emit("newAvg", {dayAvg, totalAvg});
            });
        });
        
    });
    Course.find({}, (err, courses) => {
        courses.forEach(course => {
            socket.on(`${course._id}`, msg => {
                console.log(course.title, msg);
                io2.emit(`${course._id}`, msg);
                if(msg.state == 'save')
                {
                    for(var i=0; i<msg.studentAnswers.length; i++)
                    {
                        var score = 0;
                        var time = msg.studentAnswers[i].time;
                        if(msg.rightAnswer == msg.studentAnswers[i].answer) score = Math.abs(msg.scoreRight);
                        else score = -Math.abs(msg.scoreWrong);
                        User.findById(msg.studentAnswers[i].userID, (err, user) => {
                            var courseIndex = -1;
                            for(var j=0; j<user.course.length; j++){
                                if(user.course[j].courseID == course._id.toString()) {
                                    courseIndex = j;
                                }
                            }
                            var date = new Date();
                            if(courseIndex == -1) console.log('course not found');
                            else if(user.course[courseIndex].answer)
                            {
                                var wasToday = false
                                for(var j=0; j<user.course[courseIndex].answer.length; j++)
                                {
                                    if(isToday(user.course[courseIndex].answer[j].date))
                                    {
                                        var newCourse = user.course;
                                        newCourse[courseIndex].answer[j].score += score;
                                        newCourse[courseIndex].answer[j].time += time;
                                        newCourse[courseIndex].answer[j].possibleMax += msg.scoreRight;
                                        User.updateMany({_id: user._id}, {$set: {course: newCourse}}, (err) => {if(err) console.log(err)});
                                        wasToday = true;
                                    }
                                }
                                if(!wasToday)
                                {
                                    var newCourse = user.course;
                                    newAnswer = newCourse[courseIndex].answer;
                                    newAnswer.push({date, score, session: course.sessionNum, time: time, possibleMax: msg.scoreRight});
                                    newCourse[courseIndex].answer = newAnswer;
                                    User.updateMany({_id: user._id}, {$set: {course: newCourse}}, (err) => {if(err) console.log(err)});
                                }
                            }
                            else
                            {
                                var newCourse = user.course;
                                newCourse[courseIndex].answer = [{date, score, session: course.sessionNum, time: time, possibleMax: msg.scoreRight}];
                                User.updateMany({_id: user._id}, {$set: {course: newCourse}}, (err) => {if(err) console.log(err)});
                            }
                        });
                    }
                }
            });
        });
    });
});



httpsServer.listen(443);
httpServer.listen(3000);
console.log('server is started :)')

// app.listen(port, () => {
//   console.log(`Juniorcup is started at port ${port}`);
// });


var seo = require('express-seo')(app);
 
// For internatanalization, set the supported languages
seo.setConfig({
    langs: ["en", "fa"]
});
 
// Set the default tags
seo.setDefaults({
    // html: "<a href='https://www.instagram.com/junior_cup/'>Follow me on instagram</a>" // Special property to insert html in the body (interesting to insert links)
    title: "کلبه آفرینش فکر", // Page title
    // All the other properties will be inserted as a meta property
    description: {
        en: "cafco",
        fa: "کلبه آفرینش فکر"
    },
    image: "https://juniorcup.ir/images/landing/Juniorcup2021b-min.jpg"
});
 
// Create an seo route
seo.add("/contact", function(req, opts, next) {
    /*س
    req: Express request
    opts: Object {
        service: String ("facebook" || "twitter" || "search-engine")
        lang: String (Detected language)
    }
    */
    next({
        description: "برگزاری سیزدهمین دوره برگزاری مسابقات رباتیک جوینورکاپ"
    });
});



