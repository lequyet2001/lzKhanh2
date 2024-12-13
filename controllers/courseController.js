const Course = require('../models/course');
const Category = require('../models/category');
const Section = require('../models/sections');

exports.createCourse = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { title, author, image, hour, lecture, level,name, rating, coursePrice, originalPrice, description, category,  } = req.body;
        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }
        const course = new Course({ title, author, image, hour, level, rating,name, coursePrice, originalPrice, description, category, user_id });
        await course.save();
        res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
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
        const course = await Course.findOne({course_id:req.body.course_id});
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
        const course = await Course.findOneAndUpdate({course_id:req.body.course_id},{ $set: req.body }, { new: true });
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
        const course = await Course.findOneAndDelete({course_id:req.body.course_id});
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};




