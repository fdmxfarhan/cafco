var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Material = require('../models/workshop-trade/Material');
const Product = require('../models/workshop-trade/Product');
const TradeUser = require('../models/workshop-trade/TradeUser');
const mail = require('../config/mail');
const dot = require('../config/dot');
const {convertDate, jalali_to_gregorian} = require('../config/dateCon');
const sms = require('../config/sms');

var time = 0, timeStarted = false;
var timeInterval = null;

router.get('/admin', ensureAuthenticated, (req, res, next) => {
    if(req.user && req.user.role == 'admin'){
        Material.find({}, (err, materials) => {
            Product.find({}, (err, products) => {
                TradeUser.find({}, (err, tradeUsers) => {
                    res.render('./trade-workshop/admin', {
                        user: req.user,
                        materials,
                        products,
                        tradeUsers,
                        time,
                        clock: {
                            hours: Math.floor(time/3600),
                            minutes: Math.floor((time%3600)/60),
                            seconds: time%60,
                        },
                        timeStarted,
                    });
                });
            });
        })
    }
    else res.send('access denied!!');
});
router.post('/add-material', ensureAuthenticated, (req, res, next) => {
    var {title, extendInPeriod, period, minPrice} = req.body;
    var newMaterial = new Material({title, extendInPeriod, period, minPrice});
    newMaterial.save().then(doc => {
        res.redirect('/trade-workshop/admin');
    }).catch(err => console.log(err));
});
router.post('/add-product', ensureAuthenticated, (req, res, next) => {
    var {title, sellInPeriod, period, maxPrice} = req.body;
    var newProduct = new Product({title, sellInPeriod, period, maxPrice});
    newProduct.save().then(doc => {
        res.redirect('/trade-workshop/admin');
    }).catch(err => console.log(err));
});
router.post('/add-user', ensureAuthenticated, (req, res, next) => {
    var {name, card, username, password} = req.body;
    var newTradeUser = new TradeUser({name, card, username, password});
    newTradeUser.save().then(doc => {
        res.redirect('/trade-workshop/admin');
    }).catch(err => console.log(err));
});
router.get('/delete-material', ensureAuthenticated, (req, res, next) => {
    Material.deleteMany({_id: req.query.id}, (err) => {
        res.redirect('/trade-workshop/admin');
    })
});
router.get('/delete-product', ensureAuthenticated, (req, res, next) => {
    Product.deleteMany({_id: req.query.id}, (err) => {
        res.redirect('/trade-workshop/admin');
    })
});
router.get('/delete-user', ensureAuthenticated, (req, res, next) => {
    TradeUser.deleteMany({_id: req.query.id}, (err) => {
        res.redirect('/trade-workshop/admin');
    })
});
router.get('/time-restart', ensureAuthenticated, (req, res, next) => {
    if(timeInterval) clearInterval(timeInterval);
    time = 0;
    timeStarted = true;
    timeInterval = setInterval(() => {time++;}, 1000);
    res.redirect('/trade-workshop/admin')
});
router.get('/time-stop', ensureAuthenticated, (req, res, next) => {
    if(timeInterval) clearInterval(timeInterval);
    time = 0;
    timeStarted = false;
    res.redirect('/trade-workshop/admin')
});
router.get('/time-start', ensureAuthenticated, (req, res, next) => {
    timeStarted = true;
    timeInterval = setInterval(() => {time++;}, 1000);
    res.redirect('/trade-workshop/admin')
});
router.get('/time-pause', ensureAuthenticated, (req, res, next) => {
    timeStarted = false;
    if(timeInterval) clearInterval(timeInterval);
    res.redirect('/trade-workshop/admin')
});
router.post('/add-material-to-product', ensureAuthenticated, (req, res, next) => {
    var {materialID, number, productID} = req.body;
    Product.findById(productID, (err, product) => {
        product.materialsList.push({materialID, number});
        Product.updateMany({_id: productID}, {$set: {materialsList: product.materialsList}}, (err, doc) => {
            res.redirect('/trade-workshop/admin');
        })
    })
});
router.get('/delete-material-from-product', ensureAuthenticated, (req, res, next) => {
    var {productID, index} = req.query;
    Product.findById(productID, (err, product) => {
        product.materialsList.splice(parseInt(index), 1);
        Product.updateMany({_id: productID}, {$set: {materialsList: product.materialsList}}, (err, doc) => {
            res.redirect('/trade-workshop/admin');
        })
    });
});
router.get('/user', (req, res, next) => {
    TradeUser.findById(req.session.tradeUserID, (err, user) => {
        if(user){
            Material.find({}, (err, materials) => {
                Product.find({}, (err, products) => {
                    TradeUser.find({}, (err, tradeUsers) => {
                        res.render('./trade-workshop/user', {
                            user,
                            materials,
                            products,
                            tradeUsers,
                            time,
                            clock: {
                                hours: Math.floor(time/3600),
                                minutes: Math.floor((time%3600)/60),
                                seconds: time%60,
                            },
                            timeStarted,
                        })
                    })
                })
            })
        }else{
            res.redirect('/users/login');
        }
    })
});


module.exports = router;
