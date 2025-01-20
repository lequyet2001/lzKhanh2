const mongoose = require('mongoose');
const { validate } = require('./user');

const roomSchema = new mongoose.Schema({
    name: { // Room name
        type: String,
        required: true,
        trim: true,
        async validate(value) {
            if (value.length > 50) {
                throw new Error({
                    message: 'Name must be less than 50 characters',
                    code : 400
                });
            }
            if (value.length < 5) {
                throw new Error({
                    message: 'Name must be more than 5 characters',
                    code : 400
                });
            }
            const existingRoom = await Room.findOne({ name: value });
            if (existingRoom) {
                throw new Error({
                    message: 'Room name already exists',
                    code : 400
                });
            }
        }

    },
    capacity: { // số lượng người tối đa trong phòng
        type: Number,
        required: true,
        validate(value) {
            if (value <= 0) {
                throw new Error({
                    message: 'Capacity must be a positive number',
                    code : 400
                });
            }
            if (!Number.isInteger(value)) {
                throw new Error({
                    message: 'Capacity must be an integer',
                    code : 400
                });
            }
            if (value > 100) {
                throw new Error({
                    message: 'Capacity must be less than 100',
                    code : 400
                });
            }
        }
    },
    course_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Move static methods to the statics object
roomSchema.statics.ListRoom = async function () {
    return await this.find({}, {
        _id: 1,
        name: 1,
        capacity: 1,
    });
}

roomSchema.statics.GetRoomById = async function (id) {
    return await this.findById(id);
}
roomSchema.statics.CreateRoom = async function (room) {
    return await this.create(room);
}
roomSchema.statics.UpdateRoom = async function (id, room) {
    return await this.findByIdAndUpdate(id, room, { new: true });
}
roomSchema.statics.DeleteRoom = async function (id) {
    return await this.findByIdAndDelete(id);
}
roomSchema.statics.GetRoomByName = async function (name) {
    return await this.findOne({ name });
}
roomSchema.statics.SearchRoom = async function (name) {
    return await this.find({ name: { $regex: name, $options: 'i' } });
}

roomSchema.statics.AddStudentToRoom = async function (room_id, student_id) {
    return await this.findByIdAndUpdate(room_id, { $push: { students: student_id } });
}

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;