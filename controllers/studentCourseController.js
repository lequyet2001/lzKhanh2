const Course = require('../models/course');
const StudentCourse = require('../models/student_course');
const User = require('../models/user');
const PurchaseHistory = require('../models/purchase_history');
const { default: mongoose } = require('mongoose');
const Lesson = require('../models/lessons');
const Section = require('../models/sections');



exports.joinCourseWithCoin = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { course_id } = req.body;
        const [course, user] = await Promise.all([
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
        const enroll = Number(course.enroll) + 1;
        await Course.updateOne({ course_id: course_id }, { $set: { enroll: enroll } });
        if (!updateUserCoin) {
            return res.status(400).json({ message: 'Failed to update coin student' });
        }

        const purchase_history = new PurchaseHistory({ course_id, user_id, totalPrice: course.coursePrice, status: 'completed', type: 'course' });
        await purchase_history.save();
        const teacher = await User.findById({ user_id: course.user_id });
        const newCoinTeacher = Number(teacher.coin) + Number(course.coursePrice);
        const updateTeacherCoin = await User.updateOne({ user_id: course.user_id }, { $set: { coin: Number(newCoinTeacher) } });
        if (!updateTeacherCoin) {
            return res.status(400).json({ message: 'Failed to update coin teacher' });
        }

        const student_course = new StudentCourse({ course_id, user_id });
        await student_course.save();
      return    res.status(200).json({ message: 'Course joined successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.joinCourseWithCode = async (req, res) => {
    try {
        const user = req.user;
        const { course_id, code } = req.body;
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(400).json({ message: 'Course not found' });
        }
        if (course.code !== code) {
            return res.status(400).json({ message: 'Invalid code' });
        }
        const student_course = new StudentCourse({ course_id, user_id: user.user_id });
        await student_course.save();

        const enroll = Number(course.enroll) + 1;
        await Course.updateOne({ course_id: course_id }, { $set: { enroll: enroll } });

        const purchase_history = new PurchaseHistory({ course_id, user_id: user.user_id, totalPrice: 0, status: 'completed', type: 'course' });
        await purchase_history.save();
      return    res.status(200).json({ message: 'Course joined successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


exports.joinCourseWithTeacher = async (req, res) => {
    try {
        const { course_id, query } = req.body;
        const user = await User.findOne({
            $or: [
                { email: query },
                { code: query },
                { user_id: query }
            ]
        })
        console.log({ course_id, query })
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const course = await Course.findOne({ course_id });

        if (!course) {
            return res.status(400).json({ message: 'Course not found1   ' });
        }
        const student_course_Exits = await StudentCourse.findOne({ course_id, user_id: user.user_id });
        if (student_course_Exits) {
            return res.status(400).json({ message: 'Course already joined' });
        }


        const student_course = new StudentCourse({ course_id, user_id: user.user_id });
        await student_course.save();

        const enroll = Number(course.enroll) + 1;
        await Course.updateOne({ course_id: course_id }, { $set: { enroll: enroll } });

        const purchase_history = new PurchaseHistory({ course_id, user_id: user.user_id, totalPrice: 0, status: 'completed', type: 'course' });
        await purchase_history.save();
      return    res.status(200).json({ message: 'Course joined successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


exports.listStudentCourse = async (req, res) => {
    try {
        const course_id = req.body.course_id;
        const user_id = req.user.user_id;

        let pipeline = [];

        if (!course_id) {
            pipeline = [
                
                {
                    $lookup: {
                        from: 'users', // Tên collection User trong MongoDB
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: 'courses', // Tên collection Course trong MongoDB
                        localField: 'course_id',
                        foreignField: 'course_id',
                        as: 'course'
                    }
                },
                {
                    $unwind: '$user' // Giải nén mảng user
                },
                {
                    $project: {
                        'user.code': 1,
                        'user.user_id': 1,
                        'user.full_name': 1,
                        progress: 1, // Lấy trường progress từ bảng student_course
                        joinAt: '$createdAt' ,// Thêm thời gian gia nhập
                        'course.name':1,
                        teacher: '$course.user_id'
                        
                    }
                },
                {
                    $project: {
                        'course.name': 1,
                        'user.code': 1,
                        'user.user_id': 1,
                        'user.full_name': 1,
                        teacher: 1,
                        progress: 1,
                        joinAt: 1,
                        id: '$_id'
                    }
                }
            ];
        } else {
            pipeline = [
                {
                    $match: { course_id: new mongoose.Types.ObjectId(course_id) } // Lọc theo course_id
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'course_id',
                        foreignField: 'course_id',
                        as: 'course'
                    }
                },
                {
                    $unwind: '$user' // Giải nén mảng user
                },
                {
                    $project: {
                        'course.name': 1,
                        'user.code': 1,
                        'user.user_id': 1,
                        'user.full_name': 1,
                        progress: 1, // Lấy trường progress từ bảng student_course
                        joinAt: '$createdAt' // Thêm thời gian gia nhập
                    }
                },
                {
                    $group: {
                        _id: '$user.user_id', // Group theo user_id để tránh trùng lặp
                        user: { $first: '$user' },
                        progress: { $first: '$progress' }, // Lấy progress đầu tiên trong nhóm
                        joinAt: { $first: '$joinAt' },
                        id: { $first: '$_id'},
                        course: { $first: '$course' }
                    }
                },
                {
                    $project: {
                        'user.code': 1,
                        'user.user_id': 1,
                        'user.full_name': 1,
                        "user.code":1,
                        progress: 1,
                        joinAt: 1,
                        id: 1,
                        'course.name':1
                    }
                }
            ];
        }

        const listuser = await StudentCourse.aggregate(pipeline);

        const data = listuser.filter((item) => {
            console.log(`${item.teacher}`)
            return item.teacher == user_id ;
        });
        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteStudentCourse = async (req, res) => {
    try {
        const id = req.body.id;
        console.log({ id })
        if (!id) {
            return res.status(400).json({ message: 'id is required' });
        }
        // const ress = await StudentCourse.findOneAndDelete({ _id: id });
        const ress =await StudentCourse.findByIdAndDelete(id);

        console.log({ ress })
        if (!ress) {

            return res.status(400).json({ message: 'Student course not found' });
        }
        return res.status(200).json({ message: 'Student course deleted successfully' });



    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}

exports.updateProgress = async (req, res) => {
    try {
        const { course_id, lesson_id } = req.body;
        const user_id = req.user.user_id;

        console.log({ course_id, lesson_id, user_id });

        // Tìm StudentCourse theo course_id và user_id
        const student_course = await StudentCourse.findOne({ course_id, user_id });
        if (!student_course) {
            return res.status(400).json({ message: 'Student course not found' });
        }

        // Kiểm tra xem lesson_id đã có trong list_completed chưa
        if (student_course.list_completed.includes(lesson_id)) {
            return res.status(400).json({ message: 'Lesson already completed' });
        }

        // Lấy tất cả các Section của course_id
        const sections = await Section.find({ course_id });
        let countLesson = 0;

        // Đếm tổng số Lesson trong tất cả các Section
        await Promise.all(
            sections.map(async (section) => {
                const lessonCount = await Lesson.countDocuments({ section_id: section._id });
                console.log({ lessonCount });
                countLesson += lessonCount;
            })
        );

        console.log({ countLesson });

        // Tính toán progress
        const progress = Math.floor(((student_course.list_completed.length + 1) / countLesson) * 100);

        // Cập nhật progress và list_completed  
        student_course.progress = progress;
        student_course.list_completed.push(lesson_id);
        await student_course.save();
      return    res.status(200).json({ message: 'Progress updated successfully', progress });
    } catch (error) {
        console.error('Error updating progress:', error); // Log lỗi chi tiết
        res.status(500).json({ message: error.message });
    }
};



exports.listUser = async (req, res) => {
    try {
        const user = req.user;
        // if( user.role === 2 ){
        //     const users = await User.find({
        //         user_id: user.user_id
        //     }, {
        //         email: 1,
        //         code: 1,
        //         user_id: 1
        //     });
        //   return  res.status(200).json(users);
        // }
        const users = await User.find({ }, {
            email: 1,
            code: 1,
            user_id: 1
        });
      return    res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


exports.rechargeAccount = async (req, res) => {
    try {
        const { coin } = req.body;

        const user = req.user;

        const purchase_history = new PurchaseHistory({ user_id: user.user_id, totalPrice: coin, status: 'pending', type: 'coin' });

        await purchase_history.save();

      return    res.status(200).json({ message: 'Coin added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}

exports.updateRechargeStatus = async (req, res) => {
    try {
        const { purchase_id, status } = req.body;

        const purchase_history = await PurchaseHistory.findById(purchase_id);
        if (!purchase_history) {
            return res.status(400).json({ message: 'Purchase not found' });
        }
        if (purchase_history.status === 'completed') {
            return res.status(400).json({ message: 'Purchase already completed' });
        }
        if (purchase_history.status === 'cancelled') {
            return res.status(400).json({ message: 'Purchase already cancelled' });
        }
        purchase_history.status = status;
        await purchase_history.save();
      return    res.status(200).json({ message: 'Purchase status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


exports.listPurchaseHistory = async (req, res) => {
    try {
        const {type,status }= req.body
        const user_id = req.user.user_id;

        const purchase_history = await PurchaseHistory.find({ $or: [{user_id,status},{user_id,type}, { type }, { status }] }).sort({ createdAt: -1 }).populate({
            path: 'course_id',
            select: 'name',
            model: 'Course',
            localField: 'course_id',
            foreignField: 'course_id'
        }).populate({
            path: 'user_id',
            select: 'full_name',
            model: 'User',
            localField: 'user_id',
            foreignField: 'user_id'
        });

      return    res.status(200).json({ purchase_history });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}







exports.Invoicing = async (req, res) => {
    try {
        const { purchasehistory_id } = req.body;
        const user_id = req.user.user_id;




      return    res.status(200).json({ purchase_history });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}