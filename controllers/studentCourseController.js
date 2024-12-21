const Course = require('../models/course');
const StudentCourse = require('../models/student_course');
const User = require('../models/user');
const PurchaseHistory = require('../models/purchase_history');



exports.joinCourseWithCoin = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { course_id } = req.body;
        const [course,user] = await Promise.all([
            Course.findById(course_id),
            User.findById(user_id)
        ]);
        if (!course) {
            return res.status(400).json({ message: 'Course not found' });
        }

        if (user.coin < course.coursePrice) {
            return res.status(400).json({ message: 'Not enough coin' });
        }
        
        const newCoinStudent = Number(user.coin) - Number(course.coursePrice);
        const updateUserCoin = await User.updateOne({ user_id: user_id }, { $set: { coin: Number(newCoinStudent) } });
        const enroll = Number(course.enroll)+ 1;
         await Course.updateOne({ course_id: course_id }, { $set: { enroll: enroll } });
        if (!updateUserCoin) {
            return res.status(400).json({ message: 'Failed to update coin student' });
        }
        
        const purchase_history = new PurchaseHistory({ course_id, user_id, totalPrice: course.coursePrice, status: 'completed', type: 'course' });
        await purchase_history.save();
        const teacher = await User.findById({user_id: course.user_id});
        const newCoinTeacher = Number(teacher.coin) + Number(course.coursePrice);
        const updateTeacherCoin = await User.updateOne({ user_id: course.user_id }, { $set: { coin: Number(newCoinTeacher) } });
        if (!updateTeacherCoin) {
            return res.status(400).json({ message: 'Failed to update coin teacher' });
        }

        const student_course = new StudentCourse({ course_id, user_id });
        await student_course.save();
        res.status(200).json({ message: 'Course joined successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.joinCourseWithCode = async (req, res) => {
    try{
        const user = req.user;
        const { course_id,code } = req.body;
        const course = await Course.findById(course_id);
        if(!course){
            return res.status(400).json({ message: 'Course not found' });
        }
        if(course.code !== code){
            return res.status(400).json({ message: 'Invalid code' });
        }
        const student_course = new StudentCourse({ course_id, user_id: user.user_id });
        await student_course.save();
        
        const enroll = Number(course.enroll)+ 1;
         await Course.updateOne({ course_id: course_id }, { $set: { enroll: enroll } });
        
        const purchase_history = new PurchaseHistory({ course_id, user_id: user.user_id, totalPrice: 0, status: 'completed', type: 'course' });
        await purchase_history.save();
        res.status(200).json({ message: 'Course joined successfully' });
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}


exports.rechargeAccount = async (req, res) => {
    try {
        const { coin } = req.body;

        const user = req.user;

        const purchase_history = new PurchaseHistory({ user_id: user.user_id, totalPrice: coin, status: 'pending', type: 'coin' });

        await purchase_history.save();

        res.status(200).json({ message: 'Coin added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

exports.updateRechargeStatus = async (req, res) => {
    try {
        const { purchase_id, status } = req.body;

        const purchase_history = await PurchaseHistory.findById(purchase_id);
        if(!purchase_history){
            return res.status(400).json({ message: 'Purchase not found' });
        }
        if (purchase_history.status === 'completed') {
            return res.status(400).json({ message: 'Purchase already completed' });
        }
    
        pushase_history.status = status;
        await purchase_history.save();
        res.status(200).json({ message: 'Purchase status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}






exports.Invoicing = async (req, res) => {
    try {
        const { purchasehistory_id } = req.body;
        const user_id = req.user.user_id;




        res.status(200).json({ purchase_history });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}