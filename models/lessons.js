const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    section_id: { type: mongoose.Schema.ObjectId, required: true },
    title: { type: String, required: true },
    video_url: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Lession', lessonSchema);
