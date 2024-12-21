const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PurchaseHistorySchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course_id: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: false
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status:{
        type:String,
        required:true,
        enum:['pending','completed'],
    },
    type:{
        type:String,
        required:true,
        enum:['coin','course']
    },
});

const PurchaseHistory = mongoose.model('PurchaseHistory', PurchaseHistorySchema);

module.exports =   PurchaseHistory;