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

var checkMaterials = (materials, users) => {
    for(var i=0; i<materials.length; i++) {
        if(time%materials[i].period == 0){
            var tradeRequests = [];
            for(var j=0; j<users.length; j++){
                for(var k=0; k<users[j].materials.length; k++){
                    if(!users[j].materials[k].confirmed && users[j].materials[k].materialID.toString() == materials[i]._id.toString()){
                        tradeRequests.push({user: users[j], material: users[j].materials[k], userIndex: j, materialIndex: k});
                    }
                }
            }
            tradeRequests.sort((a, b) => b.material.price - a.material.price);
            // console.log(tradeRequests);
            var leftMaterials = materials[i].extendInPeriod;
            for(var j=0; j < tradeRequests.length; j++){
                if(leftMaterials <= 0) break;
                if(tradeRequests[j].material.price >= materials[i].minPrice && tradeRequests[j].user.card >= tradeRequests[j].material.price * tradeRequests[j].material.number){
                    users[tradeRequests[j].userIndex].materials[tradeRequests[j].materialIndex].confirmed = true;
                    users[tradeRequests[j].userIndex].card -= tradeRequests[j].material.price * tradeRequests[j].material.number;
                    if(tradeRequests[j].material.number > leftMaterials)
                        users[tradeRequests[j].userIndex].materials[tradeRequests[j].materialIndex].number = leftMaterials;
                    TradeUser.updateMany({_id: tradeRequests[j].user._id}, {$set: {card: users[tradeRequests[j].userIndex].card, materials: users[tradeRequests[j].userIndex].materials}}, (err, doc) => {});
                    leftMaterials -= users[tradeRequests[j].userIndex].materials[tradeRequests[j].materialIndex].number;
                }
            }
            for(var j=0; j<users.length; j++){
                for(var k=0; k<users[j].materials.length; k++){
                    if(!users[j].materials[k].confirmed && users[j].materials[k].materialID.toString() == materials[i]._id.toString()){
                        users[j].materials.splice(k, 1);
                        k--;
                        TradeUser.updateMany({_id: users[j]._id}, {$set: {materials: users[j].materials}}, (err, doc) => {
                            if(err) console.log(err);
                        });
                    }
                }
            }
        }
    }
}
var loopFunction = () => {
    time++;
    Material.find({}, (err, materials) => {
        Product.find({}, (err, products) => {
            TradeUser.find({}, (err, users) => {
                checkMaterials(materials, users);
                for (let i = 0; i < products.length; i++) {
                    if(time%products[i].period == 0){
                        var tradeRequests = [];
                        for(var j=0; j<users.length; j++){
                            for(var k=0; k<users[j].soldProducts.length; k++){
                                if(!users[j].soldProducts[k].confirmed && users[j].soldProducts[k].productID.toString() == products[i]._id.toString()){
                                    tradeRequests.push({user: users[j], product: users[j].soldProducts[k], userIndex: j, productIndex: k});
                                }
                            }
                        }
                        tradeRequests.sort((a, b) => a.product.price - b.product.price);
                        // console.log(tradeRequests);
                        var leftProducts = products[i].sellInPeriod;
                        for(var j=0; j < tradeRequests.length; j++){
                            if(leftProducts <= 0) break;
                            if(tradeRequests[j].product.price <= products[i].maxPrice){
                                users[tradeRequests[j].userIndex].soldProducts[tradeRequests[j].productIndex].confirmed = true;
                                if(tradeRequests[j].product.number > leftProducts)
                                    users[tradeRequests[j].userIndex].soldProducts[tradeRequests[j].productIndex].number = leftProducts;
                                users[tradeRequests[j].userIndex].card += tradeRequests[j].product.price * users[tradeRequests[j].userIndex].soldProducts[tradeRequests[j].productIndex].number;
                                TradeUser.updateMany({_id: tradeRequests[j].user._id}, {$set: {card: users[tradeRequests[j].userIndex].card, soldProducts: users[tradeRequests[j].userIndex].soldProducts}}, (err, doc) => {});
                                leftProducts -= users[tradeRequests[j].userIndex].soldProducts[tradeRequests[j].productIndex].number;
                            }
                        }
                        for(var j=0; j<users.length; j++){
                            for(var k=0; k<users[j].soldProducts.length; k++){
                                if(!users[j].soldProducts[k].confirmed && users[j].soldProducts[k].productID.toString() == products[i]._id.toString()){
                                    user.products.push({productID: users[j].soldProducts[k].productID, number: users[j].soldProducts[k].number});
                                    users[j].soldProducts.splice(k, 1);
                                    k--;
                                    TradeUser.updateMany({_id: users[j]._id}, {$set: {soldProducts: users[j].soldProducts, products: users[j].products}}, (err, doc) => {
                                        if(err) console.log(err);
                                    });
                                }
                            }
                        }
                    }
                }
            });
        });
    });
}
var correctMultiMaterial = (user) => {
    var newBoughtMaterials = [];
    var newBoughtMaterialsID = [];
    var noneConfirmed = user.materials.filter(e => e.confirmed == false)
    for(var i=0; i<user.materials.length; i++){
        var j = newBoughtMaterialsID.indexOf(user.materials[i].materialID);
        // console.log(j, user.materials[i].materialID)
        if(j != -1){
            if(user.materials[i].confirmed)
                newBoughtMaterials[j].number = parseInt(newBoughtMaterials[j].number) + parseInt(user.materials[i].number);
        }else{
            if(user.materials[i].confirmed){
                newBoughtMaterials.push(user.materials[i]);
                newBoughtMaterialsID.push(user.materials[i].materialID);
            }
        }
    }
    return newBoughtMaterials.concat(noneConfirmed);
}
var getMakableProducts = (products, user) => {
    var makableProducts = [];
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        var makable = true;
        for(let j = 0; j < product.materialsList.length; j++) {
            var requiredMaterial = product.materialsList[j];
            var found = false;
            for(let k = 0; k < user.materials.length; k++) {
                var material = user.materials[k];
                if(requiredMaterial.materialID == material.materialID){
                    found = true;
                    if(requiredMaterial.number > material.number) 
                        makable = false;
                }
            }
            if(!found) makable = false;
        }
        if(makable) makableProducts.push(products[i]);
    }
    return makableProducts;
}
var getProductsRequiredMaterials = (product, materials) => {
    var requiredMaterials = [];
    for (let i = 0; i < product.materialsList.length; i++) {
        const requiredMaterial = product.materialsList[i];
        for (let j = 0; j < materials.length; j++) {
            const material = materials[j];
            if(requiredMaterial.materialID == material._id.toString()){
                requiredMaterials.push({material, number: requiredMaterial.number});
            }
        }
    }
    return requiredMaterials;
}
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
    timeInterval = setInterval(() => loopFunction(), 1000);
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
    timeInterval = setInterval(() => loopFunction(), 1000);
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
                        user.materials = correctMultiMaterial(user);
                        makableProducts = getMakableProducts(products, user);
                        console.log(user.soldProducts);
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
                            makableProducts,
                            getProductsRequiredMaterials,
                        })
                    })
                })
            })
        }else{
            res.redirect('/users/login');
        }
    })
});
router.post('/buy-material', (req, res, next) => {
    var {number, price, materialID} = req.body;
    TradeUser.findById(req.session.tradeUserID, (err, user) => {
        if(user){
            user.materials.push({materialID, confirmed: false, price, number});
            TradeUser.updateMany({_id: user._id}, {$set: {materials: user.materials}}, (err, doc) => {
                res.redirect('/trade-workshop/user');
            })
        }else console.log('User Not Found');
    })
});
router.get('/make-product', (req, res, next) => {
    var {productID} = req.query;
    TradeUser.findById(req.session.tradeUserID, (err, user) => {
        Product.findById(productID, (err, product) => {
            user.materials = correctMultiMaterial(user);
            for (let i = 0; i < product.materialsList.length; i++) {
                const reqmat = product.materialsList[i];
                for (let j = 0; j < user.materials.length; j++) {
                    const material = user.materials[j];
                    if(reqmat.materialID == material.materialID){
                        user.materials[j].number -= reqmat.number;
                        if(user.materials[j].number <= 0){
                            user.materials.splice(j, 1);
                            j--;
                        }
                    }
                }
            }
            if(typeof(user.products.find(e => e.productID == productID)) == 'undefined'){
                user.products.push({productID, number: 1});
            }
            else{
                for (let i = 0; i < user.products.length; i++) {
                    if(user.products[i].productID == productID){
                        user.products.number += 1;
                    }
                }
            }
            TradeUser.updateMany({_id: req.session.tradeUserID}, {$set: {materials: user.materials, products: user.products}}, (err, doc) => {
                res.redirect('/trade-workshop/user');
            })
        });
    });
});
router.post('/sell-product', (req, res, next) => {
    var {productID, number, price} = req.body;
    TradeUser.findById(req.session.tradeUserID, (err, user) => {
        Product.findById(productID, (err, product) => {
            for (let i = 0; i < user.products.length; i++) {
                if(user.products[i].productID == productID){
                    if(number > user.products[i].number) number = user.products[i].number;
                    user.products[i].number -= number;
                    if(user.products[i].number <= 0){
                        user.products.splice(i, 1);
                        i--;
                    }
                    break;
                }
            }
            user.soldProducts.push({productID, number, price, confirmed: false});
            TradeUser.updateMany({_id: req.session.tradeUserID}, {$set: user}, (err, doc) => {
                res.redirect('/trade-workshop/user');
            })
        });
    });
});
module.exports = router;