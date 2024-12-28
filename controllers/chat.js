const Course = require('../models/course');
const Category = require('../models/category');
const Section = require('../models/sections');
const Lesson = require('../models/lessons');
const { default: mongoose } = require('mongoose');
const QuestionSet = require('../models/Quizzs/qestionSet');
const Question = require('../models/Quizzs/question');
const StudentCourse = require('../models/student_course');
const Result = require('../models/Quizzs/result');
const Message = require('../models/Chat/message');

exports.sendMessageFromStudent = async (req, res) => {
    try {
        const { course_id, message } = req.body;
        const student_id = req.user.user_id;
        const course = await Course.findOne({ course_id: course_id });
        const teacher_id = course.user_id;
        console.log({ student_id, teacher_id, course_id, message });
        const newMessage = new Message({
            sender: student_id,
            receiver: teacher_id,
            course_id,
            message
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

exports.sendMessageFromTeacher = async (req, res) => {
    try {
        const { course_id, message, student_id } = req.body;
        const teacher_id = req.user.user_id;
        const newMessage = new Message({
            sender: teacher_id,
            receiver: student_id,
            course_id,
            message
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.getMessageToTeacher = async (req, res) => {
    try {
        const { course_id } = req.body;
        const teacher_id = req.user.user_id;
        if(!course_id) {
        const messages = await Message.find({  receiver: teacher_id });
            return res.status(200).json(messages);
        }
        const messages = await Message.find({ course_id, receiver: teacher_id });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
}


exports.getMessageToStudent = async (req, res) => {
    try {
        const { course_id } = req.body;
        const student_id = req.user.user_id;
        if(!course_id) {
         return res.status(400).json({ message: 'course_id is required' });
        }
        
        const messages = await Message.find({ course_id, receiver: student_id },{ message: 1, timestamp: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
}
