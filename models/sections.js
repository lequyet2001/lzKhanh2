const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    course_id: { type: mongoose.Schema.ObjectId, required: true },
    title: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);
