const Course = require('../models/course');
const Category = require('../models/category');
const Section = require('../models/sections');
const Lession = require('../models/lessons');
const { default: mongoose } = require('mongoose');
const { on } = require('form-data');

exports.createCourse = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const {
            name, title, author, image, hour, discount, benefits, lecture, level, requirements, rating, coursePrice, originalPrice, description, category, enroll, cert
        } = req.body;
        const { sections } = req.body || {};
        const sectionsArray = Array.isArray(sections) ? sections : [];
        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }
        // console.log('req.body:', req.body);
        // console.log(req)
        if (!title || !author || !coursePrice || !originalPrice || !category) {
            return res.status(400).json({ message: 'title, author, image, coursePrice, originalPrice, category are required' });
        }
        const id_course = new mongoose.Types.ObjectId();
        const course = new Course({
            course_id: id_course, user_id, name, title, author, image, hour, discount, benefits, lecture, level, requirements, rating, coursePrice, originalPrice, description, category, enroll, cert
        });
        await course.save();

        await Promise.all(sectionsArray.map(async (section) => {
            const id = new mongoose.Types.ObjectId();
            const newSection = new Section({
                _id: id,
                course_id: id_course,
                title: section.title,
            });
            await newSection.save();

            await Promise.all(section.lessons && section.lessons.map(async (e) => {
                const newLesson = new Lession({
                    section_id: id,
                    title: e.title,
                    video_url: e.video_url
                });
                await newLesson.save();
            }));
        }));

        res.status(200).json({ message: 'Course created successfully', course });
    } catch (error) {
        if (error.name === 'MongoError') {
            console.log('MongoDB Error:', error);
        }
        console.log('Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAllCourses = async (_, res) => {
    try {
        const courses = await Course.aggregate([
            {
                $addFields: {
                    user_id: { $toObjectId: "$user_id" } // Chuyển đổi user_id sang ObjectId
                }
            },
            {
                $lookup: {
                    from: 'users', // Tham chiếu collection "users"
                    localField: 'user_id', // Trường tham chiếu từ "courses"
                    foreignField: 'user_id', // Trường tham chiếu từ "users"
                    as: 'user' // Kết quả ánh xạ vào 'user'
                }
            },
            {
                $unwind: {
                    path: '$user', // Giải nén mảng 'user'
                    preserveNullAndEmptyArrays: true // Giữ giá trị null nếu không có user
                }
            },
            {
                $lookup: {
                    from: 'sections', // Tham chiếu collection "sections"
                    localField: 'course_id', // Trường "_id" trong courses
                    foreignField: 'course_id', // Trường "course_id" trong sections
                    as: 'sections' // Kết quả ánh xạ vào 'sections'
                }
            },
            {
                $unwind: {
                    path: '$sections', // Giải nén từng section
                    preserveNullAndEmptyArrays: true // Giữ giá trị null nếu không có sections
                }
            },
            {
                $lookup: {
                    from: 'lessions', // Tham chiếu collection "lessons"
                    localField: 'sections._id', // Trường "_id" trong sections
                    foreignField: 'section_id', // Trường "section_id" trong lessons
                    as: 'sections.lessions' // Kết quả ánh xạ vào 'sections.lessons'
                }
            },

            {
                $group: {
                    _id: '$_id', // Gom nhóm lại theo từng course
                    course_id: { $first: '$course_id' },
                    name: { $first: '$name' },
                    title: { $first: '$title' },
                    image: { $first: '$image' },
                    hour: { $first: '$hour' },
                    author: { $first: '$author' },  
                    discount: { $first: '$discount' },
                    benefits: { $first: '$benefits' },
                    lecture: { $first: '$lecture' },
                    level: { $first: '$level' },
                    requirements: { $first: '$requirements' },
                    rating: { $first: '$rating' },
                    coursePrice: { $first: '$coursePrice' },
                    originalPrice: { $first: '$originalPrice' },
                    description: { $first: '$description' },
                    category: { $first: '$category' },
                    enroll: { $first: '$enroll' },
                    cert: { $first: '$cert' },
                    user_name: { $first: '$user_name' },
                    sections: { $push: '$sections' } // Gộp lại các sections, bao gồm lessons
                }
            },
            {
                $project: {
                    _id: 0, // Ẩn _id
                    course_id: 1,
                    name: 1,
                    title: 1,
                    image: 1,
                    hour: 1,
                    author: 1,
                    discount: 1,
                    benefits: 1,
                    lecture: 1,
                    level: 1,
                    requirements: 1,
                    rating: 1,
                    coursePrice: 1,
                    originalPrice: 1,
                    description: 1,
                    category: 1,
                    enroll: 1,
                    cert: 1,
                    user_name: 1,
                    sections: 1 // Trả về đầy đủ sections và lessons
                }
            }
        ]);
        const courses2 = await Course.find().populate('sections');
        
        res.status(200).json(courses); // Trả về danh sách courses
    } catch (error) {
        console.error('Error fetching courses:', error); // Log lỗi chi tiết
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};





exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findOne({ course_id: req.body.course_id });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const sections = await Section.find({ course_id: course.course_id }).lean();
        sections.forEach((section) => {
            section.lessons = section.lessons.length;
        });
        res.status(200).json({ course, sections });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findOneAndUpdate({ course_id: req.body.course_id }, { $set: req.body }, { new: true });
        console.log('req.body:', req.body);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course updated successfully', course });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        // Tìm và xóa course
        const course = await Course.findOne({ course_id: req.body.course_id });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Lấy tất cả các sections liên quan đến course
        const sections = await Section.find({ course_id: (req.body.course_id) });
        if (!sections) {
            return res.status(404).json({ message: 'Sections not found' });
        }

        await Promise.all([
            Course.deleteOne({ course_id: req.body.course_id }),
            Lession.deleteMany({ section_id: { $in: sections.map(section => section._id) } }),
            Section.deleteMany({ course_id: req.body.course_id })
        ]);




        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};





