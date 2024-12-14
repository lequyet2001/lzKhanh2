const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    auto: true
  },
  full_name: {
    type: String,
    required: false,
    default: null
  },
  coin:{
    type: String,
    required: false,
    default:'100'
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
  }
});

userSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
