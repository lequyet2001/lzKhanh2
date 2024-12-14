const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    section_id: { type: mongoose.Schema.ObjectId, required: true },
    title: { type: String, required: false },
    video_url: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Lession', lessonSchema);
