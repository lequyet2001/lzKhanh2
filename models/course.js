const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    user_id: {
        type:String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    hour: {
        type: String,
        required: false
    },
    discount:{
        type: String,
        required: false
    },
    benefits:{
        type: String,
        required: false
    },

    lecture: {
        type: Array,
        required: false
    },
    level: {
        type:Number,
        enum:[1,2,3,4],
        default:1,
        required: true
    },
    requirements: {
        type: String,
        required: false
    },
    rating: {
        type: String,
        required: false
    },
    coursePrice: {
        type: String,
        required: true
    },
    originalPrice: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: true
    },
    enroll: {
        type: Number,
        required: false,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    cert:{
        type: String,
        required: false
    }
});



module.exports = mongoose.model('Course', courseSchema);
