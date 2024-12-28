const Course = require('../models/course');
const Category = require('../models/category');
const Section = require('../models/sections');
const Lesson = require('../models/lessons');
const { default: mongoose } = require('mongoose');
const QuestionSet = require('../models/Quizzs/qestionSet');
const Question = require('../models/Quizzs/question');
const StudentCourse = require('../models/student_course');
const Result = require('../models/Quizzs/result');

exports.getNameAndIdCourse = async (_, res) => {
    try {

        const courses = await Course.find({}, { course_id: 1, name: 1 }).lean();
        courses.forEach(course => {
            course.value = course.course_id;
            course.label = course.name;
            delete course.course_id;
            delete course.name;
            delete course._id;
        });
        courses.unshift({ value: '', label: 'Tất cả' });
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
exports.createCourse = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const quizs = req.body.quizs || [{}];
        console.log({ quizs });
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
        await Promise.all([
            ...sectionsArray.map(async (section,index) => {
                const id = new mongoose.Types.ObjectId();
                const newSection = new Section({
                    _id: id,
                    course_id: id_course,
                    title: section.title,
                    order_Number: index
                });
                await newSection.save();

                await Promise.all(section.lessions && section.lessions.map(async (e,i) => {
                    const newLesson = new Lesson({
                        section_id: id,
                        title: e.title,
                        video_url: e.video_url,
                        order_Number: i
                    });
                    await newLesson.save();
                }));
            }),
            ...quizs.map(async (e) => {
                if (e.name && e.easeQuestion && e.mediumQuestion && e.hardQuestion && e.duration) {
                    const newQuestionSet = new QuestionSet({
                        course_id: id_course,
                        name: e.name,
                        easeQuestion: e.easeQuestion,
                        mediumQuestion: e.mediumQuestion,
                        hardQuestion: e.hardQuestion,
                        duration: e.duration
                    });
                    console.log({ newQuestionSet });
                    await newQuestionSet.save();
                }
            })
        ]);

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
                $lookup: {
                    from: 'questionsets', // Tham chiếu collection "questionsets"
                    localField: 'course_id', // Trường tham chiếu từ "courses"
                    foreignField: 'course_id', // Trường tham chiếu từ "QuestionSet"
                    as: 'questionsets' // Kết quả ánh xạ vào 'QuestionSet'
                }
            },
            {
                $unwind: {
                    path: '$questionsets', // Giải nén mảng 'questionSet'
                    preserveNullAndEmptyArrays: true // Giữ giá trị null nếu không có questionSet
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
                    sections: { $push: '$sections' }, // Gộp lại các sections, bao gồm lessons
                    questionsets: { $push: '$questionsets' }
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
                    sections: 1, // Trả về đầy đủ sections và lessons
                    questionsets: 1
                }
            }
        ]);

        res.status(200).json(courses); // Trả về danh sách courses
    } catch (error) {
        console.error('Error fetching courses:', error); // Log lỗi chi tiết
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAllCourses2 = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        console.log({ user_id });

        const StudentCourses = await StudentCourse.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_id) } // Nếu user_id là ObjectId, giữ nguyên, nếu không cần sửa trong DB
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
                $unwind: '$course' // Giải nén mảng course
            },
            {
                $project: {
                    progress: 1,
                    course_id: '$course.course_id',
                    name: '$course.name',
                    title: '$course.title',
                    image: '$course.image',
                    author: '$course.author'
                }
            },
            {
                $group: {
                    _id: '$course_id', // Nhóm theo course_id
                    name: { $first: '$name' },
                    title: { $first: '$title' },
                    image: { $first: '$image' },
                    author: { $first: '$author' },
                    progress: { $first: '$progress' }
                }
            },
            {
                $project: {
                    course_id: '$_id', // Đổi _id thành course_id trong kết quả cuối
                    _id: 0,
                    name: 1,
                    title: 1,
                    image: 1,
                    author: 1,
                    progress: 1
                }
            }
        ]);

        res.status(200).json(StudentCourses); // Trả về danh sách courses
    } catch (error) {
        console.error('Error fetching courses:', error); // Log lỗi chi tiết
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getCourseById = async (req, res) => {
    try { 
        const user_id = req.user.user_id;
        const { course_id } = req.body; // Use req.params to get course_id from URL parameters
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }
        const course = await Course.aggregate([
            {
                $match: { course_id: new mongoose.Types.ObjectId(course_id) } // Convert course_id to ObjectId
            },
            { $limit: 1 },
            {
                $sort: { 
                    'sections.order_Number': -1,
                    'sections.lessions.order_Number': -1
                  }
            },
            {
                $addFields: {
                    user_id: { $toObjectId: "$user_id" }
                }
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
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'sections',
                    localField: 'course_id',
                    foreignField: 'course_id',
                    as: 'sections'
                }
            },
            {
                $unwind: {
                    path: '$sections',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'lessions',
                    localField: 'sections._id',
                    foreignField: 'section_id',
                    as: 'sections.lessions'
                }
            },
            {
                $lookup: {
                    from: 'questionsets',
                    localField: 'course_id',
                    foreignField: 'course_id',
                    as: 'questionsets'
                }
            },
            
            {
                $unwind: {
                    path: '$questionsets',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
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
                    sections: { $push: '$sections' },
                    questionsets: { $push: '$questionsets' }
                }
            },
            {
                $project: {
                    _id: 0,
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
                    sections: 1,
                    questionsets: 1
                }
            }
        ]);
        const studentCourse = await StudentCourse.findOne({ course_id, user_id });
        if (studentCourse) {
            course[0].progress = studentCourse.progress;
            course[0].sections.forEach(section => {
                section.lessions.forEach(lesson => {
                    lesson.isCompleted = studentCourse.list_completed.includes(lesson._id.toString());
                });
            });
        }

        course[0].progress = studentCourse ? studentCourse.progress : 0;
        if (!course || course.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course[0]);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getCourse = async (req, res) => {
    try {
        const course_id = req.body.course_id;
        if (!course_id) {

            const courses = await Course.find({});
            if (!courses) {
                return res.status(404).json({ message: 'Bạn chưa có khóa học nào' });
            }
            res.status(200).json(courses);
        }

        const course = await Course.findOne({ course_id });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }

}
exports.getCourseByIdAtHomePage = async (req, res) => {
    try {
        const { course_id } = req.body; // Use req.params to get course_id from URL parameters
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }

    const course = await Course.aggregate([
        {
            $match: { course_id: new mongoose.Types.ObjectId(course_id) } // Convert course_id to ObjectId
        },
        { $limit: 1 },
        {
            $addFields: {
                user_id: { $toObjectId: "$user_id" }
            }
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
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'sections',
                localField: 'course_id',
                foreignField: 'course_id',
                as: 'sections'
            }
        },
        {
            $unwind: {
                path: '$sections',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'lessions',
                localField: 'sections._id',
                foreignField: 'section_id',
                as: 'sections.lessions'
            }
        },
        {
            $group: {
                _id: '$_id',
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
                sections: { $push: '$sections' }
            }
        },
        {
            $project: {
                _id: 0,
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
                sections: 1
            }
        }
    ]);
    if (!course || course.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course[0]);

}
exports.updateCourse = async (req, res) => {
    try {
        const { course_id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        const {
            name, title, author, image, hour, discount, benefits, lecture, level, requirements, rating, coursePrice, originalPrice, description, category, enroll, cert, sections, quizs
        } = req.body;

        const sectionsArray = Array.isArray(sections) ? sections : [];
        const quizsArray = Array.isArray(quizs) ? quizs : [];

        const course = await Course.findOneAndUpdate(
            { course_id: course_id },
            { $set: { name, title, author, image, hour, discount, benefits, lecture, level, requirements, rating, coursePrice, originalPrice, description, category, enroll, cert } },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Delete old sections, lessons, and quizzes
        await Promise.all([
            Section.deleteMany({ course_id: course_id }),
            Lesson.deleteMany({ section_id: { $in: sectionsArray.map(section => section._id) } }),
            QuestionSet.deleteMany({ course_id: course_id })
        ]);

        await Promise.all([
            ...sectionsArray.map(async (section,index) => {
                const id = new mongoose.Types.ObjectId();
                const newSection = new Section({
                    _id: id,
                    course_id: course_id,
                    title: section.title || 'Untitled',
                    order_Number: index
                });
                await newSection.save();

                section.lessions && await Promise.all(section.lessions.map(async (e,i) => {
                    const newLesson = new Lesson({
                        section_id: id,
                        title: e.title,
                        video_url: e.video_url,
                        order_Number: i
                    });
                    await newLesson.save();
                }));
            }),
            ...quizsArray.map(async (e) => {
                const newQuestionSet = new QuestionSet({
                    course_id: course_id,
                    name: e.name,
                    easeQuestion: e.easeQuestion,
                    mediumQuestion: e.mediumQuestion,
                    hardQuestion: e.hardQuestion,
                    duration: e.duration
                });
                await newQuestionSet.save();
            })
        ]);

        res.status(200).json({ message: 'Course updated successfully', course });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteCourse = async (req, res) => {
    try {
        // Tìm và xóa course
        const user_id = req.body.user_id
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
            Lesson.deleteMany({ section_id: { $in: sections.map(section => section._id) } }),
            Section.deleteMany({ course_id: req.body.course_id }),
            QuestionSet.deleteMany({ course_id: req.body.course_id }),
            Question.deleteMany({ course_id: req.body.course_id }),
            StudentCourse.deleteMany({ course_id: req.body.course_id, user_id:user_id || req.user.user_id })
        ]);




        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createQuestion = async (req, res) => {
    try {
        const { course_id, question, options, difficulty } = req.body;
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }
        if (!question || !options || !difficulty) {
            return res.status(400).json({ message: 'question, options, difficulty are required' });
        }
        const course = await Course.findOne({ course_id });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const questionExists = await Question.findOne({ question });
        if (questionExists) {
            return res.status(400).json({ message: 'Question already exists' });
        }
        const newQuestion = new Question({ course_id, question, options, difficulty });
        await newQuestion.save();
        res.status(200).json({ message: 'Question created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
exports.updateQuestion = async (req, res) => {
    try {
        const { question_id, question, options, difficulty } = req.body;
        console.log({ question_id, question, options, difficulty });
        if (!mongoose.Types.ObjectId.isValid(question_id)) {
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        if (!question || !options || !difficulty) {
            return res.status(400).json({ message: 'question, options, difficulty are required' });
        }
        const updatedQuestion = await Question.findOneAndUpdate(
            { _id: question_id },
            { $set: { question, options, difficulty } },
            { new: true }
        );
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ message: 'Question updated successfully', updatedQuestion });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
exports.deleteQuestion = async (req, res) => {
    try {
        const { question_id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(question_id)) {
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        const question = await Question.findOne({ _id: question_id });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        await Question.deleteOne({ _id: question_id });
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
exports.createQuestions = async (req, res) => {
    try {
        const { course_id, list_question } = req.body;
        console.log({list_question});
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }
        if (!list_question) {
            return res.status(400).json({ message: 'list_question is required' });
        }
        const course = await Course.findOne({ course_id });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await Promise.all(list_question.map(async (e) => {
            const questionExists = await Question.findOne({ question: e.question, course_id });
            console.log({ questionExists });
            if (!questionExists) {
                const newQuestion = new Question({ course_id, question: e.question, options: e.options, difficulty: e.difficulty });
                await newQuestion.save();
            }
        }))

        res.status(200).json({ message: 'Question created successfully' });


    } catch (error) {

        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
exports.getQuestions = async (req, res) => {
    try {
        const { course_id } = req.body;
        if (!course_id) {
            const questions = await Question.find({});
            return res.status(200).json(questions);
        }
        const course = await Course({ course_id });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const questions = await Question.find({ course_id });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}



exports.createTest = async (req, res) => {
    try {
        const { course_id, name, easeQuestion, mediumQuestion, hardQuestion, duration } = req.body;
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }
        if (!name || !easeQuestion || !mediumQuestion || !hardQuestion || !duration) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const course = await Course.findOne({ course_id });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const questionTestExists = await QuestionSet.findOne({ name, course_id });
        if (questionTestExists) {
            return res.status(400).json({ message: 'Test already exists' });
        }
        console.log({ course_id });
        const questions = await Question.find({ course_id });
        const easyQuestions = questions.filter(q => q.difficulty === 'easy').length;
        const mediumQuestions = questions.filter(q => q.difficulty === 'medium').length;
        const hardQuestions = questions.filter(q => q.difficulty === 'hard').length;
       
        if (questions.length < Number(easeQuestion||0) + Number(mediumQuestion || 0) + Number(hardQuestion || 0)) {
            return res.status(400).json({ message: 'Not enough questions for the test' });
        }
        if (easeQuestion > easyQuestions || mediumQuestion > mediumQuestions || hardQuestion > hardQuestions) {
            return res.status(400).json({ message: 'Not enough questions of specified difficulty' });
        }

        const newTest = new QuestionSet({ course_id, name, easeQuestion, mediumQuestion, hardQuestion, duration });
        await newTest.save();
        res.status(200).json({ message: 'Test created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
exports.updateTest = async (req, res) => {
    try {
        const { test_id, name, easeQuestion, mediumQuestion, hardQuestion, duration } = req.body;
        if (!mongoose.Types.ObjectId.isValid(test_id)) {
            return res.status(400).json({ message: 'Invalid test ID' });
        }
        if (!name || !easeQuestion || !mediumQuestion || !hardQuestion || !duration) {
            return res.status(400).json({ message: 'name, easeQuestion, mediumQuestion, hardQuestion, duration are required' });
        }
        const updatedTest = await QuestionSet.findOneAndUpdate(
            { _id: test_id },
            { $set: { name, easeQuestion, mediumQuestion, hardQuestion, duration } },
            { new: true }
        );
        if (!updatedTest) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json({ message: 'Test updated successfully', updatedTest });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
exports.deleteTest = async (req, res) => {
    try {

        const { test_id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(test_id)) {
            return res.status(400).json({ message: 'Invalid test ID' });
        }
        const test = await QuestionSet.findOne({ _id: test_id });
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        await QuestionSet.deleteOne({ _id: test_id });
        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });

    }
}
exports.getTestById = async (req, res) => {
    try {
        const { course_id } = req.body;
        if (!course_id) {
            const test = await QuestionSet.find({});
            return res.status(200).json(test);
        }

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return res.status(400).json({ message: 'Invalid course_id' });
        }
        const test = await QuestionSet.find({ course_id: course_id });
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}




exports.generateQuestionsSet = async (req, res) => {
    try {
        const { questionSet_id, course_id } = req.body;
        // console.log({ questionSet_id, course_id });
        const questionSet = await QuestionSet.findOne({ _id: questionSet_id, course_id });
        if (!questionSet) {
            return res.status(404).json({ message: 'Question set not found' });
        }
        const { name, easeQuestion, mediumQuestion, hardQuestion, duration } = questionSet;

        const [easeQuestions, mediumQuestions, hardQuestions] = await Promise.all([
            Question.aggregate([{ $match: { course_id:new mongoose.Types.ObjectId(course_id), difficulty: 'easy' } }, { $sample: { size: easeQuestion } }]),
            Question.aggregate([{ $match: { course_id:new mongoose.Types.ObjectId(course_id), difficulty: 'medium' } }, { $sample: { size: mediumQuestion } }]),
            Question.aggregate([{ $match: { course_id:new mongoose.Types.ObjectId(course_id), difficulty: 'hard' } }, { $sample: { size: hardQuestion } }])
        ]);

        if (easeQuestions.length < easeQuestion || mediumQuestions.length < mediumQuestion || hardQuestions.length < hardQuestion) {
            return res.status(404).json({ message: 'Not enough questions for the question set' });
        }

        const questions = [...easeQuestions, ...mediumQuestions, ...hardQuestions];

        res.status(200).json({ questions, duration,name:questionSet.name ,questionSet_id});
    } catch (error) {
        console.error('Error creating question set:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
// exports

exports.result = async (req, res) => {
    try {
        const { questionSetId, course_id, questions, result } = req.body;
        const user_id = req.user.user_id;
        if (!mongoose.Types.ObjectId.isValid(questionSetId)) {
            return res.status(400).json({ message: 'Invalid question set ID' });
        }
        if (!course_id) {
            return res.status(400).json({ message: 'course_id is required' });
        }
        // if (!questions || !result) {
        //     return res.status(400).json({ message: 'questions, result are required' });
        // }

        // const questionSet = await QuestionSet.findOne({ _id: questionSetId, course_id });
        // if (!questionSet) {
        //     return res.status(404).json({ message: 'Question set not found' });
        // }
       
        const newResult = new Result({ user_id, questionSet_id:questionSetId, course_id:new mongoose.Types.ObjectId(course_id) , answers:questions, result });
        await newResult.save();
        



        res.status(200).json({ message: 'Result saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.getResults = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const course_id = req.body.course_id;
        // const results = await Result.find({course_id, user_id, questionSet_id: { $exists: false } });
        const results = await Result.aggregate([
            { $match: { course_id, user_id } }, // Lọc theo course_id và user_id
            { 
                $group: { 
                    _id: "$questionSet_id", // Gom nhóm theo questionSet_id
                    data: { $first: "$$ROOT" } // Lấy tài liệu đầu tiên của nhóm
                }
            },
            { $replaceRoot: { newRoot: "$data" } } // Thay thế gốc bằng tài liệu đã gom nhóm
        ]);  
        console.log({results});
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


exports.getResultByIdQuestionSet = async (req, res) => {

    try {
            const { 
                course_id,
                questionSet_id
            } = req.body;
            const user_id = req.user.user_id;
            if (!mongoose.Types.ObjectId.isValid(course_id)) {
                return res.status(400).json({ message: 'Invalid course ID' });
            }
            if (!mongoose.Types.ObjectId.isValid(questionSet_id)) {
                return res.status(400).json({ message: 'Invalid questionSet ID' });
            }
            // const course = await Course.findOne({ course_id });
            // if (!course) {
            //     return res.status(404).json({ message: 'Course not found' });
            // }
            const questionSet = await QuestionSet.findOne({ _id: questionSet_id, course_id });
            if (!questionSet) {
                return res.status(404).json({ message: 'Question set not found' });
            }
            const results = await Result.aggregate([
                {
                    $match: { user_id: new mongoose.Types.ObjectId(user_id), questionSet_id: new mongoose.Types.ObjectId(questionSet_id) }
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'course_id',
                        foreignField: 'course_id',
                        as: 'course'
                    },
                    $lookup: {
                        from: 'questionsets',
                        localField: 'questionSet_id',
                        foreignField: 'questionSet_id',
                        as: 'questionSet'
                    },
                    $lookup: {
                        from: 'questions',
                        localField: 'answers.questionId',
                        foreignField: '_id',
                        as: 'questions'
                    }
                }

            ])
            if (!results) {
                return res.status(404).json({ message: 'Result not found' });
            }
            res.status(200).json(results);


    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}