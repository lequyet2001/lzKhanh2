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
const GroupChat = require("../models/Chat/group_chat");


exports.studentSendMessage = async (req, res) => {
    try {
        const {
            course_id,
            message,
        } = req.body
        const sender = req.user.user_id;
        const course = await Course.findOne({ course_id });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        const receiver = course.user_id;
        const newMessage = new Message({
            sender,
            course_id,
            receiver,
            message,
        });
        await newMessage.save();
        const groupChat =  groupChat.findOne({course_id});
        if(groupChat){
            groupChat.list_message.push(newMessage._id);
            await groupChat.save();
        }
        else{
            const newGroupChat = new GroupChat({
                course_id,
                manager_id: course.user_id,
                owner_id: course.user_id,
                list_message: [newMessage._id]
            });
            await newGroupChat.save();
        }
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.replyMessage = async (req, res) => {
    try {
        const {
            id_message,
        } = req.body;
        const sender = req.user.user_id;
        const message = await Message.findOne({ _id: id_message });
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.chatInGroup = async (req, res) => {
    try {
        const {
            course_id,
            message,
        } = req.body
        const sender = req.user.user_id;
        const course = await Course.findOne({ course_id });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        const receiver = course.user_id;
        const newMessage = new Message({
            sender,
            course_id,
            receiver,
            message,
        });
        await newMessage.save();
        const groupChat =  groupChat.findOne({course_id});
        if(groupChat){
            groupChat.list_message.push(newMessage._id);
            await groupChat.save();
        }
        else{
            const newGroupChat = new GroupChat({
                course_id,
                manager_id: course.user_id,
                owner_id: course.user_id,
                list_message: [newMessage._id]
            });
            await newGroupChat.save();
        }
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.studentGetMessageInGroupChat = async (req, res) => {
    try {
        const { course_id,limit } = req.body;
        const user_id = req.user.user_id;

        if (!course_id) {
            return res.status(400).json('course_id is required');
        }

        const course = await Course.findOne({ course_id });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const studentCourse = await StudentCourse.findOne({ course_id, user_id });
        if (!studentCourse) {
            return res.status(404).json({ message: `You are not currently in the classroom  ${course.name}` });
        }
        const groupChat = await GroupChat.findOne({ course_id });
        if (!groupChat) {
            return res.status(404).json({ message: 'Group chat not found' });
        }
        const messages = await Message.find({
            _id: { $in: groupChat.list_message },
        },{
            sender: 1,
            message: 1,
            createdAt: 1,
        }).sort({ createdAt: -1 }).limit(limit || 10);
        
        return res.status(200).json(messages);


    } catch (error) {
        res.status(500).json({ message: error.message });
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


exports.teacherGetQuesstionFromStudent = async (req, res) => {
    try {
        const {
            course_id,
        } = req.body;
        const user_id = req.user.user_id;
        console.log({ course_id });
        if (!course_id) {
            const messages = await Message.find({
                receiver: user_id,
                isQuestion: true,
                sender: { $ne: user_id }
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
                .populate('replyTo', 'message')

            const id_messages = messages.map((message) => message._id);
            for (const id of id_messages) {
                const checkIsAnswered = await Message.find({
                    replyTo: id,
                    isQuestion: false,
                    sender: user_id,
                });
                console.log({ checkIsAnswered: checkIsAnswered.length });
                messages.forEach((message) => {
                    if (message._id.equals(id)) {
                        message._doc.isAnswered = checkIsAnswered.length > 0;
                    }
                });
            }
            console.log('!course_id');
            console.log({ messages });
            return res.status(200).json(messages);
        }
        const messages = await Message.find({
            course_id,
            receiver: user_id,
            isQuestion: true,
            sender: { $ne: user_id }
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
        const id_messages = messages.map((message) => message._id);
        for (const id of id_messages) {
            const checkIsAnswered = await Message.find({
                replyTo: id,
                isQuestion: false,
                sender: user_id,
                course_id,
            });
            console.log({ checkIsAnswered: checkIsAnswered.length });
            messages.forEach((message) => {
                if (message._id.equals(id)) {
                    message._doc.isAnswered = checkIsAnswered.length > 0;
                }
            });
        }

        console.log('course_id');
        console.log({ messages });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.studentGetQuestionFromMe = async (req, res) => {
    try {
        const {
            course_id,
        } = req.body;
        const user_id = req.user.user_id;
        if (!course_id) {
            return res.status(400).json('course_id is required');
        }
        const messages = await Message.find({
            course_id,
            sender: user_id,
            isQuestion: true,
            receiver: { $ne: user_id }
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

        const id_messages = messages.map((message) => message._id);

        const replies = await Message.find({
            replyTo: { $in: id_messages },
            isQuestion: false,
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


        console.log('course_id');
        console.log({ messages });
        res.status(200).json({ messages, replies: replies });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


