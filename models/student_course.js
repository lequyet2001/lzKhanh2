const mongoose = require('mongoose');

const student_course = new mongoose.Schema({
    course_id: { type: mongoose.Schema.ObjectId, required: true },
    user_id: {type: mongoose.Schema.ObjectId, required: true}, 
    progress: {type: Number, required: false,default:0},
    list_completed: {type: Array, required: false,default:[]},  
    isAdd:{
        type: Number,
        require: true,
        enum:[1,2], //1 dc add , 2 mua
        default:2
    }
}, { timestamps: true });

const StudentCourse= mongoose.model('student_course', student_course);
module.exports = StudentCourse;



