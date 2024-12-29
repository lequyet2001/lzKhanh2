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

exports.studentSendMessage = async (req, res) => {
    try{
        const {
            course_id,
            message,
        } = req. body
        const sender = req.user.user_id;
        const course = await Course.findOne({course_id});
        if(!course){
            return res.status(404).json({message: "Course not found"});
        }
        const receiver = course.user_id;
        const newMessage = new Message({
            sender,
            course_id,
            receiver,
            message,
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    }catch(err){
        res.status(500).json({message: err.message});
    }
}

exports.replyMessage = async (req, res) => {
    try{
        const {
            id_message,
        } = req.body;
        const sender = req.user.user_id;
        const message = await Message.findOne({_id: id_message});
        if(!message){
            return res.status(404).json({message: "Message not found"});
        }
        const receiver = message.sender;
        const newMessage = new Message({
            sender,
            course_id: message.course_id,
            receiver,
            message: req.body.message,
            replyTo: id_message,
            isQuestion: false,
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    }catch(err){
        res.status(500).json({message: err.message});
    }
}


exports.getMessages = async (req, res) => {
    try {
        const { id_message } = req.body;
        const user_id = req.user.user_id;

        // Lấy tin nhắn gốc
        const messages = await Message.findOne({
            _id: id_message,
            sender: user_id,
        })
            .populate({
                path: 'sender',
                select: {
                    _id: 0,
                    full_name: 1,
                    email: 1,
                },
                model: 'User',
                localField: 'sender',
                foreignField: 'user_id',
            })
            .populate({
                path: 'receiver',
                select: {
                    _id: 0,
                    full_name: 1,
                    email: 1,
                },
                model: 'User',
                localField: 'receiver',
                foreignField: 'user_id',
            })
            .populate('replyTo', 'message');

        if (!messages) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Lấy tất cả tin nhắn trả lời theo chuỗi
        let allReplies = [];
        let queue = [id_message]; // Hàng đợi chứa ID tin nhắn để kiểm tra trả lời

        while (queue.length > 0) {
            const currentMessageId = queue.shift();

            const replies = await Message.find({
                replyTo: currentMessageId,
            })
                .populate({
                    path: 'sender',
                    select: {
                        _id: 0,
                        full_name: 1,
                        email: 1,
                    },
                    model: 'User',
                    localField: 'sender',
                    foreignField: 'user_id',
                })
                .populate('replyTo', 'message')
                .populate({
                    path: 'receiver',
                    select: {
                        _id: 0,
                        full_name: 1,
                        email: 1,
                    },
                    model: 'User',
                    localField: 'receiver',
                    foreignField: 'user_id',
                });

            // Thêm các trả lời vào danh sách tổng
            allReplies = [...allReplies, ...replies];

            // Thêm các ID tin nhắn trả lời vào hàng đợi để kiểm tra tiếp
            const replyIds = replies.map((reply) => reply._id);
            queue = [...queue, ...replyIds];
        }

        res.status(200).json({ messages, replies: allReplies });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
