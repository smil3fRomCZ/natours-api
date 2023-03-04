// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/asyncHandler');

exports.signUp = catchAsync(async (req, res, next) => {
  const registrationData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };
  const newUser = await User.create(registrationData);
  const secretKey = process.env.JWT_SECRET;
  const expiration = process.env.JWT_EXPIRES_IN;
  const token = jwt.sign({ id: newUser._id }, secretKey, {
    expiresIn: expiration,
  });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
