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
        const ListStudent  =  await User.find({room:room_id},{full_name:1, email:1, phone:1, address:1, room :1,user_id:1})
          

        return res.status(200).json({ ListStudent });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.body;
        const checkStudentInRoom = await User.findOne({ room: id});
        if (checkStudentInRoom) {
            return res.status(400).json({ message: 'Room has student, can not delete' });
        }

        const room = await Room.DeleteRoom(id);
        return res.status(200).json(room);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}



exports.addStudentToRoom = async (req, res) => {
    try {
        const { room_id, email } = req.body;
        const check = await User.GetUserByEmail(email);
        if (!check) {
            return res.status(400).json({ message: 'User not found' });
        }
        const user = await User.AddStudentToRoom(room_id,{ user_id: check.user_id});
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}


exports.addStudentsToRoom = async (req, res) => {
    try {
        const { room_id, students } = req.body;
    
        await Promise.all(students.map(async (student) => {
            const check = await User.GetUserByEmail(student);
            if (!check) {
                return res.status(400).json({ message: 'User not found' });
            }
           await User.AddStudentToRoom(room_id, { user_id: check.user_id });
        }));
        return res.status(200).json({ message: 'Add students to room successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}


exports.deleteStudentFromRoom = async (req, res) => {
    try {
        const { user_id } = req.body;
        const user = await User.deleteRoom( user_id );
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}