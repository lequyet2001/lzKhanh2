const Room = require("../models/room");
const StudentCourse = require("../models/student_course");
const User = require("../models/user");
const Result = require("../models/Quizzs/result");



exports.getListRoom = async (req, res) => {
    try {
        const rooms = await Room.ListRoom();
        return res.status(200).json(rooms);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}
exports.createRoom = async (req, res) => {
    try {
        const { name, capacity } = req.body;
        const newRoom = await Room.CreateRoom({ name, capacity });
        return res.status(200).json(newRoom);
    } catch (error) {

        return res.status(error.code || 500).json({ message: 'Server error', error: error.message });
    }
}

exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.body;
        const { name, capacity } = req.body;
        const room = await Room.UpdateRoom(id, { name, capacity });
        return res.status(200).json(room);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.RoomManager = async (req, res) => {
    try {
        const { room_id } = req.body;
        const ListStudent  =  await User.find({room:room_id},{full_name:1, email:1, phone:1, address:1, room :1,_id:1})
          

        return res.status(200).json({ ListStudent });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.body;

        const room = await Room.DeleteRoom(id);
        return res.status(200).json(room);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}