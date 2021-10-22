var mongoose = require('mongoose');

var NotificationSchema = new mongoose.Schema({
    text: String,
    date: String,
    seen: {
        type: Boolean,
        default: false,
    }
});

var Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;