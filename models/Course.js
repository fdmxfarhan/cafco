var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
    price: Number, // Rial
    discount: Number, //percent
    haveDiscount: Boolean,
    title: String,
    undertitle: {
        type: String,
        default: '',
    },
    description: String,
    teacher: String,
    startDate: Object,
    endDate: Object,
    session: Number,
    requiredCourse: [Object],
    requiredTools: [Object],
    minAge: Number,
    maxAge: Number,
    status: {
        type: String,
        default: 'شروع نشده'
    },
    capacity: Number,
    cover: String,
    students: {
        type: [Object],
        default: [],
    },
    link: {
        type: String,
        default: 'undefined',
    },
    video: {
        type: String,
        default: 'undefined',
    },
    eventHandler: String,
    answers: {
        type: [Object],
        default: [],
    }
});

var Course = mongoose.model('Course', CourseSchema);

module.exports = Course;