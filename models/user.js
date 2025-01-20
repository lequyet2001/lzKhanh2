const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    auto: true
  },
  email_contact: {
    type: String,
    default: null,
    required: false
  },
  gender: {
    type: Number,
    required: false,
    default: 0,
    enum: [0, 1, 2, 3] // 0: chưa cập nhật, 1: nam, 2: nu, 3: khac
  },
  phone_contact: {
    type: String,
    default: null,
    required: false
  },
  full_name: {
    type: String,
    required: false,
    default: null
  },
  coin: {
    type: Number,
    required: false,
    default: 100
  },
  dob: {
    type: Date,
    required: false,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  avatar_url: {
    type: String,
    required: false,
    default: null,

  },
  status: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
    default: 1
  },
  role: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
    default: 3
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpires: {
    type: Date,
    required: false,
  },
  code: {
    type: String,
    required: false,
  },
  room: {
    type: String,
    required: false,
  }

});

userSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

userSchema.statics.GetUserByEmail = async function (email) {
  return await this.findOne({ email });
}
userSchema.statics.AddStudentToRoom = async function (room_id, user_id) {
  const a = user_id.user_id;
  return await this.findOneAndUpdate(
    { user_id:a },
    { room: room_id },
    { new: true }
  );
}

userSchema.statics.deleteRoom = async function (user_id) {
  const check = await this.findOne({ user_id: user_id });
  const a = await this.findOneAndUpdate({
    user_id: user_id
  },{
    room: null
  },{
    new: true
  });
  console.log(check);
  return a
}

const User = mongoose.model('User', userSchema);

module.exports = User;
