const Course = require('../models/course');
const Category = require('../models/category');
const Section = require('../models/sections');
const Lession = require('../models/lessons');
const { default: mongoose } = require('mongoose');

exports.createCourse = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const {
            name, title, author, image, hour, discount, benefits, lecture, level, requirements, rating, coursePrice, originalPrice, description, category, enroll, cert
        } = req.body;
        const { sections } = req.body;
        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }
        const course = new Course({
            user_id, name, title, author, image, hour, discount, benefits, lecture, level, requirements, rating, coursePrice, originalPrice, description, category, enroll, cert
        });
        await course.save();

        await Promise.all(sections.map(async (section) => {
            const id = mongoose.Types.ObjectId();
            const newSection = new Section({
                _id: id,
                course_id: course._id,
                title: section.title,
            });
            await newSection.save();

            await Promise.all(section.lessons.map(async (e) => {
                const newLesson = new Lession({
                    section_id: id,
                    title: e.title,
                    video_url: e.video_url
                });
                await newLesson.save();
            }));
        }));

        res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
        if (error.name === 'MongoError') {
            console.log('MongoDB Error:', error);
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};




exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
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
        const course = await Course.findOneAndDelete({ course_id: req.body.course_id });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};




