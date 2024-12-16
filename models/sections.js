const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    course_id: { type: mongoose.Schema.ObjectId,ref:"Course", required: true },
    title: { type: String, required: true },
    lession: [{ type: mongoose.Schema.ObjectId, ref:'Lession' }]
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);
