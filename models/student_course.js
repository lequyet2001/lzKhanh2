const mongoose = require('mongoose');

const SC = new mongoose.Schema({
    course_id: { type: mongoose.Schema.ObjectId, required: true },
    user_id: {type: mongoose.Schema.ObjectId, required: true},   
}, { timestamps: true });

module.exports = mongoose.model('student_course', SC);
