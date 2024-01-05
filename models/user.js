const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    maxlength: 64,
    required: true,
    default: null,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    maxlength: 128,
  },
  password: {
    type: String,
    required: true,
    maxlength: 64,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
