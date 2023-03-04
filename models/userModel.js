const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'You must provide your full name'],
  },
  email: {
    type: String,
    required: [true, 'You must provide your valid email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail],
  },
  photo: { type: String },
  password: {
    type: String,
    required: [true, 'You must provide password'],
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: [true, 'You must provide password confirmation'],
    // This validation will work only during creation of document
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not same',
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // remove confirmPassword after validation
  this.confirmPassword = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
