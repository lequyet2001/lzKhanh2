const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GroupChatSchema = new Schema({
    course_id: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    owner_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    manager_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    list_message:{
        type: [
            {
                id_message: {
                    type: Schema.Types.ObjectId,
                    ref: 'Message',
                    required: true
                },
            }
        ],
        required: true,
        default: []
    },
});


const GroupChat = mongoose.model('GroupChat', GroupChatSchema);

module.exports = GroupChat;