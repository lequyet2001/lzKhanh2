const mongoose = require('mongoose');

const category = new mongoose.Schema({
    category_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
        autu: true
    },
    name:{
        type: String,
        required: false
    },
    description:{
        type: String,
        required: false
    },
});

module.exports = mongoose.model('categories', category);
