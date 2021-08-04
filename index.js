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


// routs requirement
var homeRoute = require('./routes/home');
var usersRoute = require('./routes/users');
var dashboardRoute = require('./routes/dashboard');
var uploadRoute = require('./routes/upload');
var paymentRoute = require('./routes/payment');
var apiRoute = require('./routes/api');
var classRoute = require('./routes/class');


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

    Course.find({}, (err, courses) => {
        for (let i = 0; i < courses.length; i++) {
            socket.on(`${courses[i]._id}`, msg => {
                console.log(msg);
                io2.emit(`${courses[i]._id}`, msg);
            });
        }
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
    
    Course.find({}, (err, courses) => {
        for (let i = 0; i < courses.length; i++) {
            socket.on(`${courses[i]._id}`, msg => {
                console.log(msg);
                io2.emit(`${courses[i]._id}`, msg);
            });
        }
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



